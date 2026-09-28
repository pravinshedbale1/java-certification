import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bookmark,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Code2,
  Command,
  Copy,
  Download,
  ExternalLink,
  Flag,
  FlaskConical,
  GitCompareArrows,
  Layers3,
  LayoutDashboard,
  Menu,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Target,
  Timer,
  X,
} from "lucide-react";
import { CURRICULUM_DOMAINS, JAVA_25_FEATURES } from "./data/curriculum";
import MutationLab from "./MutationLab";
import ThemeToggle from "./ThemeToggle";
import { highlightJavaLines } from "./JavaSyntax";
import {
  questions as coreQuestions,
  type Question,
  type QuestionPattern,
} from "./data/questions";
import { extraQuestions } from "./data/questions-extra";
import { expansionAQuestions } from "./data/questions-expansion-a";
import { expansionBQuestions } from "./data/questions-expansion-b";
import { expansionCQuestions } from "./data/questions-expansion-c";
import { coverageQuestions } from "./data/questions-coverage";
import { depthQuestions } from "./data/questions-depth";
import { MOCK_FORMS, MOCK_QUESTIONS } from "./data/mock-forms";
import { EXAM_OBJECTIVES, objectivesForDomain } from "./data/objectives";
import {
  benchmarkAttempts,
  dueAt,
  dueQuestions,
  domainMetrics,
  EMPTY_PROGRESS,
  isCorrect,
  latestAttempt,
  loadProgress,
  objectiveMetrics,
  recommendedQuestions,
  saveProgress,
  studyStreak,
  type Confidence,
  type Progress,
} from "./lib/progress";
import { orderedOptions } from "./lib/questionOrder";
import {
  benchmarkDeadline,
  benchmarkQuestions,
  clampBenchmarkTime,
  shuffleQuestions,
} from "./lib/benchmark";
import {
  matchesQuestionPattern,
  QUESTION_PATTERNS,
  questionPatternLabel,
} from "./lib/questionPatterns";

type View =
  | "overview"
  | "atlas"
  | "practice"
  | "mutation"
  | "benchmark"
  | "review"
  | "insights"
  | "sources";
type SessionAnswer = {
  selected: string[];
  confidence: Confidence;
  elapsedMs: number;
};
type Session = {
  kind: "practice" | "benchmark";
  ids: string[];
  index: number;
  startedAt: number;
  questionStartedAt: number;
  answers: Record<string, SessionAnswer>;
  flags: string[];
  /** Present only for one of the three mock-only full exam forms. */
  formId?: string;
  reviewing?: boolean;
  status: "active" | "finished";
  score?: number;
  endedAt?: number;
};
type PendingSession = {
  kind: Session["kind"];
  items: Question[];
  formId?: string;
};

const NAV: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Command center", icon: LayoutDashboard },
  { id: "atlas", label: "Objective atlas", icon: Layers3 },
  { id: "practice", label: "Practice lab", icon: FlaskConical },
  { id: "mutation", label: "Mutation lab", icon: GitCompareArrows },
  { id: "benchmark", label: "Timed benchmark", icon: Timer },
  { id: "review", label: "Review queue", icon: RotateCcw },
  { id: "insights", label: "Study evidence", icon: BarChart3 },
  { id: "sources", label: "Exam & sources", icon: BookOpen },
];
const VALID_VIEWS = new Set<View>(NAV.map((item) => item.id));
const EXAM_URL =
  "https://mylearn.oracle.com/ou/exam/java-se-25-developer-professional-1z0-831/105037/161532/270890";
const OBJECTIVES_URL =
  "https://enthuware.com/oca-ocp-java-certification-resources/297-ocp-java-25-exam-syllabus";
const FORMAT_URL = "https://www.selikoff.net/ocp25/";
const JAVA_URL =
  "https://docs.oracle.com/en/java/javase/25/language/java-language-changes-summary.html";
const questions: Question[] = [
  ...coreQuestions,
  ...extraQuestions,
  ...expansionAQuestions,
  ...expansionBQuestions,
  ...expansionCQuestions,
  ...coverageQuestions,
  ...depthQuestions,
];
// Mock-only forms are appended to this lookup without entering adaptive practice.
const mockForms = MOCK_FORMS;
const mockQuestions = MOCK_QUESTIONS;
const allQuestions = [...questions, ...mockQuestions];

function initialView(): View {
  const hash = window.location.hash.replace("#/", "") as View;
  return VALID_VIEWS.has(hash) ? hash : "overview";
}
function loadSession(): Session | null {
  try {
    const raw = sessionStorage.getItem("forge-java25-session-v1");
    if (!raw) return null;
    const value = JSON.parse(raw) as Session;
    return value &&
      (value.kind === "practice" || value.kind === "benchmark") &&
      (value.status === "active" || value.status === "finished") &&
      Array.isArray(value.ids) &&
      value.ids.length > 0 &&
      value.ids.every((id) =>
        allQuestions.some((question) => question.id === id),
      ) &&
      Number.isInteger(value.index) &&
      value.index >= 0 &&
      value.index < value.ids.length &&
      typeof value.startedAt === "number" &&
      typeof value.questionStartedAt === "number" &&
      value.answers &&
      typeof value.answers === "object"
      ? { ...value, flags: Array.isArray(value.flags) ? value.flags : [] }
      : null;
  } catch {
    return null;
  }
}
function formatDuration(ms: number) {
  const minutes = Math.floor(Math.max(0, ms) / 60000);
  const seconds = Math.floor((Math.max(0, ms) % 60000) / 1000);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
function daysUntil(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const today = new Date();
  return Math.round(
    (Date.UTC(year, month - 1, day) -
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) /
      86400000,
  );
}
function domainById(id: string) {
  return CURRICULUM_DOMAINS.find((d) => d.id === id)!;
}
function shortDomain(id: string) {
  return domainById(id)?.title.split(" ").slice(0, 3).join(" ") ?? id;
}
function objectiveMatches(
  domain: (typeof CURRICULUM_DOMAINS)[number],
  query: string,
) {
  const text = [
    domain.title,
    domain.description,
    ...domain.concepts,
    ...objectivesForDomain(domain.id).map((objective) => objective.title),
    ...domain.rules.map((rule) => rule.text),
    domain.pitfall.assumption,
    domain.pitfall.reality,
  ].join(" ");
  return text.toLowerCase().includes(query.trim().toLowerCase());
}
export default function App() {
  const [view, setView] = useState<View>(initialView);
  const [progress, setProgress] = useState<Progress>(() =>
    typeof window !== "undefined" ? loadProgress() : EMPTY_PROGRESS,
  );
  const [domainFocus, setDomainFocus] = useState<string | null>(null);
  const [patternFocus, setPatternFocus] = useState<QuestionPattern | null>(
    null,
  );
  const [session, setSession] = useState<Session | null>(() =>
    typeof window !== "undefined" ? loadSession() : null,
  );
  const [pendingSession, setPendingSession] = useState<PendingSession | null>(
    null,
  );
  const benchmarkSubmissionRef = useRef<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const pendingTriggerRef = useRef<HTMLElement | null>(null);
  const initialSavedAnswer = session?.answers[session.ids[session.index]];
  const [selected, setSelected] = useState<string[]>(
    () => initialSavedAnswer?.selected ?? [],
  );
  const draftQuestionIdRef = useRef<string | undefined>(
    session?.ids[session.index],
  );
  const [confidence, setConfidence] = useState<Confidence | null>(
    () => initialSavedAnswer?.confidence ?? null,
  );
  const [revealed, setRevealed] = useState(
    () => session?.kind === "practice" && Boolean(initialSavedAnswer),
  );
  const [now, setNow] = useState(Date.now());
  const [mobileNav, setMobileNav] = useState(false);
  const [isNarrow, setIsNarrow] = useState(
    () => window.matchMedia("(max-width: 760px)").matches,
  );
  const [toast, setToast] = useState("");
  const [atlasTab, setAtlasTab] = useState<"objectives" | "release">(
    "objectives",
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);
  useEffect(() => {
    if (session)
      sessionStorage.setItem(
        "forge-java25-session-v1",
        JSON.stringify(session),
      );
    else sessionStorage.removeItem("forge-java25-session-v1");
  }, [session]);
  useEffect(() => {
    const handler = () => setView(initialView());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 760px)");
    const update = () => setIsNarrow(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!mobileNav) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMobileNav(false);
      document.querySelector<HTMLElement>(".mobile-menu")?.focus();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileNav]);
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    if (!pendingSession) return;
    dialogRef.current
      ?.querySelector<HTMLElement>("[data-dialog-initial-focus]")
      ?.focus();
    function onDialogKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        dismissPendingSession();
      }
      if (event.key !== "Tab") return;
      const buttons = dialogRef.current?.querySelectorAll<HTMLButtonElement>(
        "button:not([disabled])",
      );
      if (!buttons?.length) return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onDialogKey);
    return () => window.removeEventListener("keydown", onDialogKey);
    // Dismissal only mutates the pending state and restores the invoking control.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSession]);

  const reviewPool = useMemo(
    () => [
      ...questions,
      ...mockQuestions.filter((question) =>
        progress.attempts.some((attempt) => attempt.questionId === question.id),
      ),
    ],
    [progress],
  );
  const due = useMemo(
    () => dueQuestions(progress, reviewPool, now),
    [progress, reviewPool, now],
  );
  const seen = questions.filter((q) => latestAttempt(progress, q.id)).length;
  const latestCorrect = questions.filter(
    (q) => latestAttempt(progress, q.id)?.correct,
  ).length;
  const streak = studyStreak(progress, new Date(now));
  const currentQuestion =
    session && session.status === "active"
      ? allQuestions.find((q) => q.id === session.ids[session.index])
      : undefined;
  const answeredCurrent = currentQuestion
    ? session?.answers[currentQuestion.id]
    : undefined;
  const remaining =
    session?.kind === "benchmark"
      ? Math.max(
          0,
          benchmarkDeadline(session.startedAt, session.ids.length) - now,
        )
      : 0;
  const activeSession = session?.status === "active" ? session : null;
  const dailyActionLabel = activeSession
    ? activeSession.kind === "benchmark"
      ? "Resume timed benchmark"
      : "Resume practice"
    : "Start daily practice";

  useEffect(() => {
    document.getElementById("main-content")?.focus({ preventScroll: true });
  }, [view, currentQuestion?.id]);

  useEffect(() => {
    if (!session || session.status !== "active") return;
    const questionId = session.ids[session.index];
    const saved = session.answers[questionId];
    draftQuestionIdRef.current = questionId;
    setSelected(saved?.selected ?? []);
    setConfidence(saved?.confidence ?? null);
    setRevealed(session.kind === "practice" && Boolean(saved));
    // Load only when navigation changes. Draft updates on the same item should
    // not overwrite the learner's current local selection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.kind, session?.status, session?.index, session?.startedAt]);

  function navigate(next: View) {
    setView(next);
    window.location.hash = `/${next}`;
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function openObjective(id: string) {
    setDomainFocus(id);
    setSearch("");
    setAtlasTab("objectives");
    navigate("atlas");
    window.setTimeout(() => {
      const stacked = window.matchMedia("(max-width: 1000px)").matches;
      const target = document.getElementById(
        stacked ? "objective-detail-heading" : `domain-${id}`,
      );
      if (stacked) target?.focus({ preventScroll: true });
      target?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 80);
  }
  function dismissPendingSession() {
    setPendingSession(null);
    window.requestAnimationFrame(() => pendingTriggerRef.current?.focus());
  }
  function commitSession(
    kind: Session["kind"],
    items: Question[],
    formId?: string,
  ) {
    const time = Date.now();
    setSession({
      kind,
      ids: items.map((q) => q.id),
      index: 0,
      startedAt: time,
      questionStartedAt: time,
      answers: {},
      flags: [],
      formId,
      status: "active",
    });
    draftQuestionIdRef.current = items[0]?.id;
    setSelected([]);
    setConfidence(null);
    setRevealed(false);
    navigate(kind === "benchmark" ? "benchmark" : "practice");
  }
  function startSession(
    kind: Session["kind"],
    items: Question[],
    formId?: string,
  ) {
    if (!items.length) {
      setToast("No questions in this set yet.");
      return;
    }
    if (session?.status === "active") {
      pendingTriggerRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setPendingSession({ kind, items, formId });
      return;
    }
    commitSession(kind, items, formId);
  }
  function startDaily() {
    if (session?.status === "active") {
      navigate(session.kind === "benchmark" ? "benchmark" : "practice");
      return;
    }
    startSession("practice", recommendedQuestions(progress, questions, 8));
  }
  function startDomain(id: string) {
    setDomainFocus(id);
    startSession(
      "practice",
      recommendedQuestions(
        progress,
        questions,
        Math.min(8, questions.filter((q) => q.domain === id).length),
        id,
      ),
    );
  }
  function startTargeted() {
    const pool = questions.filter(
      (question) =>
        (!domainFocus || question.domain === domainFocus) &&
        (!patternFocus || matchesQuestionPattern(question, patternFocus)),
    );
    startSession("practice", recommendedQuestions(progress, pool, 8));
  }
  function startReview() {
    startSession(
      "practice",
      due.length
        ? due
        : questions
            .filter((q) => progress.bookmarks.includes(q.id))
            .slice(0, 8),
    );
  }
  function startBenchmark(target: 20 | string) {
    const seed = Date.now();
    if (target === 20) {
      startSession(
        "benchmark",
        benchmarkQuestions(progress, questions, 2, seed),
      );
      return;
    }
    const form = mockForms.find((candidate) => candidate.id === target);
    if (!form) {
      setToast("That mock form is unavailable.");
      return;
    }
    startSession(
      "benchmark",
      shuffleQuestions(form.questions, `${form.id}-${seed}`),
      form.id,
    );
  }
  function finishBenchmark(
    answers: Record<string, SessionAnswer>,
    target: Session,
  ) {
    if (target.status !== "active") return;
    const submissionKey = `${target.startedAt}:${target.formId ?? "short"}`;
    if (benchmarkSubmissionRef.current === submissionKey) return;
    benchmarkSubmissionRef.current = submissionKey;
    const score = target.ids.filter((id) => {
      const q = allQuestions.find((item) => item.id === id);
      return q && answers[id] && isCorrect(q, answers[id].selected);
    }).length;
    const endedAt = clampBenchmarkTime(
      target.startedAt,
      target.ids.length,
      Date.now(),
    );
    const attempts = benchmarkAttempts(
      target.ids,
      answers,
      allQuestions,
      endedAt,
    );
    const domains = CURRICULUM_DOMAINS.map((domain) => {
      const ids = target.ids.filter(
        (id) =>
          allQuestions.find((question) => question.id === id)?.domain ===
          domain.id,
      );
      return {
        domain: domain.id,
        total: ids.length,
        correct: ids.filter((id) => {
          const question = allQuestions.find((item) => item.id === id);
          return Boolean(
            question &&
            answers[id] &&
            isCorrect(question, answers[id].selected),
          );
        }).length,
        elapsedMs: ids.reduce(
          (total, id) => total + (answers[id]?.elapsedMs ?? 0),
          0,
        ),
      };
    }).filter((domain) => domain.total > 0);
    setProgress((current) => ({
      ...current,
      attempts: [...current.attempts, ...attempts],
      benchmarks: [
        ...current.benchmarks,
        {
          id: `${target.formId ?? "short"}-${endedAt}`,
          at: endedAt,
          total: target.ids.length,
          correct: score,
          durationMs: endedAt - target.startedAt,
          formId: target.formId,
          firstAttempt: target.formId
            ? !current.benchmarks.some(
                (result) => result.formId === target.formId,
              )
            : undefined,
          unanswered: target.ids.filter((id) => !answers[id]?.selected.length)
            .length,
          flagged: target.flags.length,
          questionIds: [...target.ids],
          domains,
        },
      ],
    }));
    setSession({
      ...target,
      answers,
      reviewing: false,
      status: "finished",
      score,
      endedAt,
    });
  }

  function captureBenchmarkDraft(target: Session) {
    if (target.kind !== "benchmark" || target.status !== "active")
      return target;
    const id = target.ids[target.index];
    const previous = target.answers[id];
    const draftIsCurrent = draftQuestionIdRef.current === id;
    const capturedAt = clampBenchmarkTime(
      target.startedAt,
      target.ids.length,
      Date.now(),
    );
    return {
      ...target,
      questionStartedAt: capturedAt,
      answers: {
        ...target.answers,
        [id]: {
          selected: draftIsCurrent
            ? [...selected]
            : [...(previous?.selected ?? [])],
          confidence: draftIsCurrent
            ? (confidence ?? previous?.confidence ?? "unsure")
            : (previous?.confidence ?? "unsure"),
          elapsedMs:
            (previous?.elapsedMs ?? 0) +
            Math.max(0, capturedAt - target.questionStartedAt),
        },
      },
    };
  }

  function navigateBenchmark(index: number) {
    if (!session || session.kind !== "benchmark") return;
    // Opening an item from final review must not charge review-screen time to
    // the last question; that answer was captured when review opened.
    const captured = session.reviewing
      ? session
      : captureBenchmarkDraft(session);
    const nextIndex = Math.max(0, Math.min(index, captured.ids.length - 1));
    setSession({
      ...captured,
      index: nextIndex,
      reviewing: false,
      questionStartedAt: clampBenchmarkTime(
        captured.startedAt,
        captured.ids.length,
        Date.now(),
      ),
    });
  }

  function openBenchmarkReview() {
    if (!session || session.kind !== "benchmark") return;
    setSession({ ...captureBenchmarkDraft(session), reviewing: true });
  }

  function toggleBenchmarkFlag() {
    if (!session || session.kind !== "benchmark" || !currentQuestion) return;
    const flags = session.flags.includes(currentQuestion.id)
      ? session.flags.filter((id) => id !== currentQuestion.id)
      : [...session.flags, currentQuestion.id];
    setSession({ ...session, flags });
  }

  function submitReviewedBenchmark() {
    if (!session || session.kind !== "benchmark") return;
    finishBenchmark(session.answers, session);
  }
  useEffect(() => {
    if (
      session?.kind === "benchmark" &&
      session.status === "active" &&
      remaining <= 0
    ) {
      const captured = session.reviewing
        ? session
        : captureBenchmarkDraft(session);
      finishBenchmark(captured.answers, captured);
    }
    // Timer state alone should trigger expiry; the session is replaced once finished.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, session?.status]);
  function toggleOption(id: string) {
    if (
      revealed ||
      !currentQuestion ||
      (session?.kind === "practice" && answeredCurrent)
    )
      return;
    draftQuestionIdRef.current = currentQuestion.id;
    const nextSelected =
      currentQuestion.type === "single"
        ? session?.kind === "benchmark" && selected.includes(id)
          ? []
          : [id]
        : selected.includes(id)
          ? selected.filter((item) => item !== id)
          : [...selected, id];
    setSelected(nextSelected);
    if (session?.kind === "benchmark") {
      const previous = session.answers[currentQuestion.id];
      setSession({
        ...session,
        answers: {
          ...session.answers,
          [currentQuestion.id]: {
            selected: nextSelected,
            confidence: previous?.confidence ?? "unsure",
            elapsedMs: previous?.elapsedMs ?? 0,
          },
        },
      });
    }
  }
  function submitAnswer() {
    if (session?.kind === "benchmark") {
      if (session.index === session.ids.length - 1) openBenchmarkReview();
      else navigateBenchmark(session.index + 1);
      return;
    }
    if (
      !session ||
      !currentQuestion ||
      !selected.length ||
      (currentQuestion.type === "multiple" &&
        selected.length !== currentQuestion.answer.length) ||
      !confidence ||
      revealed
    )
      return;
    const answer: SessionAnswer = {
      selected,
      confidence,
      elapsedMs: Date.now() - session.questionStartedAt,
    };
    const answers = { ...session.answers, [currentQuestion.id]: answer };
    if (session.kind === "practice") {
      setProgress((p) => ({
        ...p,
        attempts: [
          ...p.attempts,
          {
            questionId: currentQuestion.id,
            selected,
            correct: isCorrect(currentQuestion, selected),
            confidence,
            at: Date.now(),
            elapsedMs: answer.elapsedMs,
            mode: "practice",
          },
        ],
      }));
      setSession({ ...session, answers });
      setRevealed(true);
    }
  }
  function nextQuestion() {
    if (!session) return;
    if (session.index === session.ids.length - 1)
      setSession({
        ...session,
        status: "finished",
        endedAt: Date.now(),
        score: session.ids.filter((id) => {
          const q = allQuestions.find((item) => item.id === id);
          return (
            q &&
            session.answers[id] &&
            isCorrect(q, session.answers[id].selected)
          );
        }).length,
      });
    else
      setSession({
        ...session,
        index: session.index + 1,
        questionStartedAt: Date.now(),
      });
    setSelected([]);
    setConfidence(null);
    setRevealed(false);
  }
  function skipQuestion() {
    if (!session || !currentQuestion || session.kind === "benchmark") return;
    const at = Date.now();
    setProgress((p) => ({
      ...p,
      attempts: [
        ...p.attempts,
        {
          questionId: currentQuestion.id,
          selected: [],
          correct: false,
          confidence: "guess",
          skipped: true,
          at,
          elapsedMs: at - session.questionStartedAt,
          mode: "practice",
        },
      ],
    }));
    if (session.index === session.ids.length - 1)
      setSession({
        ...session,
        status: "finished",
        endedAt: Date.now(),
        score: session.ids.filter((id) => {
          const q = allQuestions.find((item) => item.id === id);
          return (
            q &&
            session.answers[id] &&
            isCorrect(q, session.answers[id].selected)
          );
        }).length,
      });
    else
      setSession({
        ...session,
        index: session.index + 1,
        questionStartedAt: Date.now(),
      });
    setSelected([]);
    setConfidence(null);
    setRevealed(false);
  }
  function toggleBookmark(id: string) {
    setProgress((p) => ({
      ...p,
      bookmarks: p.bookmarks.includes(id)
        ? p.bookmarks.filter((item) => item !== id)
        : [...p.bookmarks, id],
    }));
  }
  function saveNote(id: string, value: string) {
    setProgress((p) => ({ ...p, notes: { ...p.notes, [id]: value } }));
  }
  function exitSession() {
    setSession(null);
  }
  function practiceOne(q: Question) {
    startSession("practice", [q]);
  }

  useEffect(() => {
    if (
      pendingSession ||
      !currentQuestion ||
      session?.status !== "active" ||
      session.reviewing ||
      view !== (session.kind === "benchmark" ? "benchmark" : "practice")
    )
      return;
    function onKey(e: KeyboardEvent) {
      if (e.altKey || e.ctrlKey || e.metaKey || e.isComposing) return;
      if (
        e.target instanceof HTMLElement &&
        e.target.closest(
          'button, a, input, textarea, select, summary, [role="button"], [contenteditable="true"]',
        )
      )
        return;
      const digit = Number(e.key);
      if (digit >= 1 && digit <= (currentQuestion?.options.length ?? 0))
        toggleOption(
          orderedOptions(currentQuestion!, session!.startedAt)[digit - 1].id,
        );
      if (e.key === "Enter") {
        e.preventDefault();
        if (revealed) nextQuestion();
        else submitAnswer();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // The handler must see the current selection and reveal state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentQuestion?.id,
    selected,
    revealed,
    confidence,
    session,
    view,
    pendingSession,
    session?.reviewing,
  ]);

  return (
    <div className="app-shell">
      <aside
        id="primary-navigation"
        className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}
        inert={(isNarrow && !mobileNav) || Boolean(pendingSession)}
        aria-hidden={(isNarrow && !mobileNav) || Boolean(pendingSession)}
      >
        <button
          className="brand"
          type="button"
          onClick={() => navigate("overview")}
        >
          <div className="brand-mark">
            <span>F</span>
            <i />
          </div>
          <div>
            <strong>
              FORGE<span className="brand-period">.</span>
            </strong>
            <small>JAVA 25 / STUDY STUDIO</small>
          </div>
        </button>
        <div className="sidebar-caption">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {NAV.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${view === item.id ? "active" : ""}`}
              onClick={() => navigate(item.id)}
              aria-current={view === item.id ? "page" : undefined}
            >
              <item.icon size={17} strokeWidth={1.8} />
              <span>{item.label}</span>
              {item.id === "review" && due.length > 0 && <em>{due.length}</em>}
            </button>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-note">
          <span className="micro eyebrow">THE TARGET</span>
          <div className="sidebar-exam">
            1Z0–831 <ArrowUpRight size={16} />
          </div>
          <p>Java SE 25 Developer Professional</p>
          <div className="sidebar-note-rule" />
          <div className="sidebar-note-bottom">
            <span>Exam blueprint</span>
            <button
              aria-label="Open exam sources"
              onClick={() => navigate("sources")}
            >
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
        <div className="sidebar-footer">
          Independent preparation studio
          <br />
          Not affiliated with Oracle.
        </div>
      </aside>
      {mobileNav && (
        <button
          className="mobile-scrim"
          aria-label="Close menu"
          onClick={() => setMobileNav(false)}
        />
      )}
      <div className="workspace" inert={Boolean(pendingSession)}>
        <header className="topbar">
          <button
            className="mobile-menu"
            aria-label="Open navigation"
            aria-expanded={mobileNav}
            aria-controls="primary-navigation"
            onClick={() => {
              setMobileNav(true);
              window.requestAnimationFrame(() =>
                document
                  .querySelector<HTMLElement>("#primary-navigation .brand")
                  ?.focus(),
              );
            }}
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumb">
            <span>FORGE / JAVA 25</span>
            <ChevronRight size={13} />
            <strong>{NAV.find((item) => item.id === view)?.label}</strong>
          </div>
          <div className="topbar-right">
            <ThemeToggle />
            <span className="topbar-edition">
              <span className="live-dot" />
              SE 25 EDITION
            </span>
            <button className="topbar-action" onClick={startDaily}>
              <Play size={14} fill="currentColor" />{" "}
              {isNarrow && activeSession ? "Resume" : dailyActionLabel}
            </button>
          </div>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          aria-label={NAV.find((item) => item.id === view)?.label}
        >
          {view === "overview" && (
            <Overview
              progress={progress}
              due={due}
              seen={seen}
              latestCorrect={latestCorrect}
              streak={streak}
              startDaily={startDaily}
              navigate={navigate}
              startDomain={startDomain}
              openObjective={openObjective}
              dailyActionLabel={dailyActionLabel}
              activeSession={activeSession}
            />
          )}
          {view === "atlas" && (
            <Atlas
              progress={progress}
              domainFocus={domainFocus}
              setDomainFocus={setDomainFocus}
              atlasTab={atlasTab}
              setAtlasTab={setAtlasTab}
              startDomain={startDomain}
              search={search}
              setSearch={setSearch}
            />
          )}
          {view === "mutation" && (
            <MutationLab onBack={() => navigate("overview")} />
          )}
          {view === "benchmark" &&
          session?.kind === "benchmark" &&
          session.status === "active" &&
          session.reviewing ? (
            <BenchmarkReview
              session={session}
              remaining={remaining}
              onOpen={navigateBenchmark}
              onSubmit={submitReviewedBenchmark}
              onExit={() => navigate("overview")}
            />
          ) : null}
          {(view === "practice" || view === "benchmark") &&
          session &&
          session.kind === (view === "practice" ? "practice" : "benchmark") &&
          session.status === "active" &&
          !session.reviewing &&
          currentQuestion ? (
            <QuestionView
              question={currentQuestion}
              session={session}
              selected={selected}
              confidence={confidence}
              setConfidence={setConfidence}
              toggleOption={toggleOption}
              revealed={revealed}
              onSubmit={submitAnswer}
              onNext={nextQuestion}
              onSkip={skipQuestion}
              onExit={() => {
                if (session.kind === "benchmark")
                  setSession(captureBenchmarkDraft(session));
                navigate("overview");
              }}
              bookmarked={progress.bookmarks.includes(currentQuestion.id)}
              toggleBookmark={() => toggleBookmark(currentQuestion.id)}
              note={progress.notes[currentQuestion.id] ?? ""}
              saveNote={(value) => saveNote(currentQuestion.id, value)}
              remaining={remaining}
              flagged={session.flags.includes(currentQuestion.id)}
              onToggleFlag={toggleBenchmarkFlag}
              onNavigate={navigateBenchmark}
              onReview={openBenchmarkReview}
            />
          ) : null}
          {(view === "practice" || view === "benchmark") &&
            session &&
            session.kind === (view === "practice" ? "practice" : "benchmark") &&
            session.status === "finished" && (
              <SessionReport
                session={session}
                progress={progress}
                onDone={() => {
                  exitSession();
                  navigate("overview");
                }}
                onReview={() => {
                  exitSession();
                  navigate("review");
                }}
                practiceOne={practiceOne}
              />
            )}
          {view === "practice" && (!session || session.kind !== "practice") && (
            <PracticeLaunch
              progress={progress}
              due={due}
              domainFocus={domainFocus}
              setDomainFocus={setDomainFocus}
              patternFocus={patternFocus}
              setPatternFocus={setPatternFocus}
              startDaily={startDaily}
              startTargeted={startTargeted}
              startReview={startReview}
              dailyActionLabel={dailyActionLabel}
              activeSession={activeSession}
            />
          )}
          {view === "benchmark" &&
            (!session || session.kind !== "benchmark") && (
              <BenchmarkLaunch
                progress={progress}
                startBenchmark={startBenchmark}
              />
            )}
          {view === "review" && (
            <Review
              progress={progress}
              due={due}
              questionPool={reviewPool}
              now={now}
              startReview={startReview}
              practiceOne={practiceOne}
              toggleBookmark={toggleBookmark}
              startDaily={startDaily}
              dailyActionLabel={dailyActionLabel}
              activeSession={activeSession}
            />
          )}
          {view === "insights" && (
            <Insights
              progress={progress}
              seen={seen}
              latestCorrect={latestCorrect}
              due={due}
              startDaily={startDaily}
              navigate={navigate}
              dailyActionLabel={dailyActionLabel}
            />
          )}
          {view === "sources" && (
            <Sources
              progress={progress}
              setProgress={setProgress}
              onReset={() => {
                setProgress({ ...EMPTY_PROGRESS });
                setSession(null);
                setDomainFocus(null);
                try {
                  window.localStorage.removeItem(
                    "forge-java25-mutation-lab-v1",
                  );
                } catch {
                  // Reset still clears in-memory progress when storage is unavailable.
                }
                setToast("Local study data erased.");
              }}
            />
          )}
        </main>
      </div>
      {toast && (
        <div className="toast">
          <CircleHelp size={16} />
          {toast}
        </div>
      )}
      {pendingSession && (
        <div className="session-dialog-backdrop">
          <div
            className="session-dialog"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="session-dialog-title"
            aria-describedby="session-dialog-description"
          >
            <Eyebrow>SESSION IN PROGRESS</Eyebrow>
            <h2 id="session-dialog-title">Start a new session?</h2>
            <p id="session-dialog-description">
              {session?.kind === "benchmark"
                ? "Your timed benchmark is unfinished. Starting a new session will discard its responses and result. Earlier practice answers remain saved."
                : "Your practice session is unfinished. Answers you already checked are saved, but starting a new session will replace your current place and any unsubmitted answer."}
            </p>
            <div className="session-dialog-actions">
              <button
                className="button button-ghost"
                data-dialog-initial-focus
                onClick={() => {
                  setPendingSession(null);
                  if (session)
                    navigate(
                      session.kind === "benchmark" ? "benchmark" : "practice",
                    );
                  window.requestAnimationFrame(() =>
                    document.getElementById("main-content")?.focus(),
                  );
                }}
              >
                Continue current session
              </button>
              <button
                className="button button-coral"
                onClick={() => {
                  commitSession(
                    pendingSession.kind,
                    pendingSession.items,
                    pendingSession.formId,
                  );
                  setPendingSession(null);
                  window.requestAnimationFrame(() =>
                    document.getElementById("main-content")?.focus(),
                  );
                }}
              >
                Start new session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Eyebrow({
  children,
  line = false,
}: {
  children: React.ReactNode;
  line?: boolean;
}) {
  return (
    <div className={`eyebrow ${line ? "eyebrow-line" : ""}`}>{children}</div>
  );
}
function PageHeading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
function Stat({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: typeof Target;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <Icon size={18} strokeWidth={1.7} />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}
function Overview({
  progress,
  due,
  seen,
  latestCorrect,
  streak,
  startDaily,
  navigate,
  startDomain,
  openObjective,
  dailyActionLabel,
  activeSession,
}: {
  progress: Progress;
  due: Question[];
  seen: number;
  latestCorrect: number;
  streak: number;
  startDaily: () => void;
  navigate: (view: View) => void;
  startDomain: (id: string) => void;
  openObjective: (id: string) => void;
  dailyActionLabel: string;
  activeSession: Session | null;
}) {
  const coveredDomains = CURRICULUM_DOMAINS.filter(
    (d) => domainMetrics(progress, questions, d.id).seen > 0,
  ).length;
  const weak = CURRICULUM_DOMAINS.map((d) => ({
    d,
    m: domainMetrics(progress, questions, d.id),
  }))
    .filter((x) => x.m.seen > 0)
    .sort((a, b) => (a.m.accuracy ?? 100) - (b.m.accuracy ?? 100))[0];
  const examDays = progress.examDate ? daysUntil(progress.examDate) : null;
  return (
    <div className="page page-overview">
      <div className="welcome-row">
        <Eyebrow>
          YOUR PREPARATION WORKSPACE <span className="eyebrow-pipe">/</span>{" "}
          1Z0–831
        </Eyebrow>
        <span className="date-stamp">
          {examDays !== null && examDays >= 0 && (
            <b>
              {examDays === 0 ? "EXAM TODAY" : `${examDays} DAYS TO EXAM`}{" "}
              <span>·</span>{" "}
            </b>
          )}
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>
      <section className="hero">
        <div className="hero-content">
          <span className="hero-kicker">
            <span className="hero-kicker-square" /> JAVA SE 25 DEVELOPER
            PROFESSIONAL
          </span>
          <h1>
            Don’t just know it.
            <br />
            <em>Prove the rule.</em>
          </h1>
          <p>
            {activeSession
              ? `Your ${activeSession.kind === "benchmark" ? "timed benchmark" : "practice session"} is in progress at question ${activeSession.index + 1} of ${activeSession.ids.length}. Pick up where you left off.`
              : "Read the code. Commit to an answer. Explain the trap. Forge turns every attempt into a sharper mental model."}
          </p>
          <div className="hero-actions">
            <button className="button button-coral" onClick={startDaily}>
              {dailyActionLabel} <ArrowUpRight size={18} />
            </button>
          </div>
        </div>
        <div className="hero-summary">
          <Eyebrow>OBJECTIVE COVERAGE</Eyebrow>
          <div className="hero-coverage-count">
            {coveredDomains}
            <span>/10</span>
          </div>
          <p>objective areas explored</p>
          <div className="hero-coverage-segments" aria-hidden="true">
            {CURRICULUM_DOMAINS.map((domain) => (
              <span
                key={domain.id}
                data-covered={
                  domainMetrics(progress, questions, domain.id).seen > 0
                }
                title={domain.title}
              />
            ))}
          </div>
          <button
            className="hero-summary-link"
            onClick={() => navigate("atlas")}
          >
            Open objective atlas <ArrowRight size={17} />
          </button>
        </div>
      </section>
      <section className="stats-row" aria-label="Your progress">
        <Stat
          label="QUESTIONS EXPLORED"
          value={`${seen}/${questions.length}`}
          sub="Original, source-linked items"
          icon={Code2}
        />
        <Stat
          label="CURRENTLY CORRECT"
          value={seen ? `${Math.round((latestCorrect / seen) * 100)}%` : "—"}
          sub={
            seen
              ? "Latest answer or skip on each question"
              : "Your baseline starts with one answer"
          }
          icon={Target}
        />
        <Stat
          label="REVIEW DUE"
          value={due.length}
          sub={
            due.length ? "Ready for a second pass" : "No rules due right now"
          }
          icon={RotateCcw}
        />
        <Stat
          label="STUDY STREAK"
          value={streak ? `${streak}d` : "—"}
          sub="Days with at least one attempt"
          icon={CalendarDays}
        />
      </section>
      <div className="overview-grid">
        <section className="panel circuit-panel">
          <div className="panel-topline">
            <Eyebrow>01 / THE METHOD</Eyebrow>
            <span className="tiny-symbol">↗</span>
          </div>
          <div className="circuit-grid">
            <div>
              <h2>
                How daily practice works<span className="accent-period">.</span>
              </h2>
              <p>
                A short, adaptive set that puts due reviews first, then uncovers
                new terrain.
              </p>
              <div className="circuit-meta">
                <span>
                  <Clock3 size={15} /> About 18 min
                </span>
                <span>
                  <Layers3 size={15} /> Up to 8 questions
                </span>
              </div>
            </div>
            <div className="circuit-visual">
              <div className="circuit-step">
                <span>01</span>
                <div>
                  Retrieve <small>Commit before feedback</small>
                </div>
                <ChevronRight size={16} />
              </div>
              <div className="circuit-step">
                <span>02</span>
                <div>
                  Diagnose <small>Find the exact rule</small>
                </div>
                <ChevronRight size={16} />
              </div>
              <div className="circuit-step">
                <span>03</span>
                <div>
                  Return <small>Review on schedule</small>
                </div>
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
        </section>
        <section className="panel focus-panel">
          <div className="panel-topline">
            <Eyebrow>02 / SIGNAL</Eyebrow>
            <span className="tiny-symbol">◎</span>
          </div>
          {weak ? (
            <>
              <div className="signal-label">ATTENTION AREA</div>
              <h3>{weak.d.title}</h3>
              <p>
                {weak.m.correct} of {weak.m.seen} latest answers correct. Work
                the rule before the next benchmark.
              </p>
              <div className="signal-meter">
                <span style={{ width: `${weak.m.accuracy}%` }} />
              </div>
              <button
                className="text-action"
                onClick={() => startDomain(weak.d.id)}
              >
                Train this objective <ArrowUpRight size={16} />
              </button>
            </>
          ) : (
            <>
              <div className="signal-label">NO DATA YET</div>
              <h3>Find your first signal.</h3>
              <p>
                A few honest attempts will reveal where practice has the highest
                return.
              </p>
              <button className="text-action" onClick={() => navigate("atlas")}>
                Explore objectives <ArrowUpRight size={16} />
              </button>
            </>
          )}
        </section>
      </div>
      <section className="blueprint-section">
        <div className="section-header">
          <div>
            <Eyebrow>THE STUDY MAP</Eyebrow>
            <h2>Ten objective areas.</h2>
            <p>{coveredDomains} of 10 areas explored</p>
          </div>
          <button className="link-button" onClick={() => navigate("atlas")}>
            Open objective atlas <ArrowUpRight size={17} />
          </button>
        </div>
        <div className="domain-grid">
          {CURRICULUM_DOMAINS.map((d, i) => {
            const m = domainMetrics(progress, questions, d.id);
            return (
              <button
                className="domain-tile"
                key={d.id}
                onClick={() => openObjective(d.id)}
              >
                <span className="domain-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <strong>{d.title}</strong>
                <div className="domain-tile-bottom">
                  <span>
                    {m.seen ? `${m.seen}/${m.total} explored` : "Not explored"}
                  </span>
                  <ArrowUpRight size={15} />
                </div>
                <div className="domain-tile-track">
                  <span
                    style={{
                      width: `${m.total ? (m.seen / m.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>
      <div className="discovery-grid">
        <div className="bottom-banner">
          <div>
            <Eyebrow>PACE CHECK</Eyebrow>
            <strong>Ready for pressure?</strong>
            <span>Short and full-length drills at the reported exam pace.</span>
          </div>
          <button onClick={() => navigate("benchmark")}>
            Open benchmark <ArrowUpRight size={18} />
          </button>
        </div>
        <div className="bottom-banner mutation-banner">
          <div>
            <Eyebrow>COUNTERFACTUALS</Eyebrow>
            <strong>One edit. New outcome.</strong>
            <span>Ten compiler-checked Java 25 experiments.</span>
          </div>
          <button onClick={() => navigate("mutation")}>
            Enter Mutation Lab <ArrowUpRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Atlas({
  progress,
  domainFocus,
  setDomainFocus,
  atlasTab,
  setAtlasTab,
  startDomain,
  search,
  setSearch,
}: {
  progress: Progress;
  domainFocus: string | null;
  setDomainFocus: (id: string | null) => void;
  atlasTab: "objectives" | "release";
  setAtlasTab: (tab: "objectives" | "release") => void;
  startDomain: (id: string) => void;
  search: string;
  setSearch: (value: string) => void;
}) {
  const [focusDetailId, setFocusDetailId] = useState<string | null>(null);
  const detailHeadingRef = useRef<HTMLHeadingElement>(null);
  const selectedTriggerRef = useRef<HTMLButtonElement | null>(null);
  const filtered = CURRICULUM_DOMAINS.filter((d) =>
    objectiveMatches(d, search),
  );
  const focus = domainFocus
    ? (filtered.find((d) => d.id === domainFocus) ?? null)
    : null;
  useEffect(() => {
    if (
      domainFocus &&
      !CURRICULUM_DOMAINS.some(
        (d) => d.id === domainFocus && objectiveMatches(d, search),
      )
    ) {
      setDomainFocus(null);
    }
  }, [domainFocus, search, setDomainFocus]);
  useEffect(() => {
    if (
      !window.matchMedia("(max-width: 1000px)").matches ||
      !focusDetailId ||
      focusDetailId !== domainFocus
    )
      return;
    detailHeadingRef.current?.focus({ preventScroll: true });
    detailHeadingRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setFocusDetailId(null);
  }, [domainFocus, focusDetailId]);
  function closeObjective() {
    const trigger =
      selectedTriggerRef.current ??
      document.getElementById(`domain-${domainFocus}`);
    setDomainFocus(null);
    window.requestAnimationFrame(() => trigger?.focus());
  }
  return (
    <div className="page">
      <PageHeading
        eyebrow="THE KNOWLEDGE MAP / 10 OBJECTIVES"
        title="Objective atlas."
        subtitle="A rule-first study map aligned to ten published objective areas, with sources close to every claim."
        action={
          <div className="atlas-count">
            <span>10</span>
            <small>
              OBJECTIVE
              <br />
              AREAS
            </small>
          </div>
        }
      />
      <div className="tab-bar">
        <button
          className={atlasTab === "objectives" ? "selected" : ""}
          aria-pressed={atlasTab === "objectives"}
          onClick={() => setAtlasTab("objectives")}
        >
          Objective study map
        </button>
        <button
          className={atlasTab === "release" ? "selected" : ""}
          aria-pressed={atlasTab === "release"}
          onClick={() => setAtlasTab("release")}
        >
          The Java 25 lens <span>{JAVA_25_FEATURES.length}</span>
        </button>
      </div>
      {atlasTab === "objectives" ? (
        <>
          <div className="atlas-intro">
            <div>
              <Eyebrow>BLUEPRINT NOTE</Eyebrow>
              <p>
                These are abbreviated study labels mapped to the published
                1Z0–831 objective areas. The {questions.length}-question bank
                includes explicit practice for all 31 atomic checks. It does not
                claim to reproduce live items or unpublished weights.
              </p>
            </div>
            <a href={EXAM_URL} target="_blank" rel="noreferrer">
              Official exam page <ExternalLink size={14} />
            </a>
          </div>
          <div className="atlas-toolbar">
            <div className="searchbox">
              <Search size={17} />
              <input
                aria-label="Search objectives"
                placeholder="Search objectives, concepts or rules"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button aria-label="Clear search" onClick={() => setSearch("")}>
                  <X size={14} />
                </button>
              )}
            </div>
            <span>{filtered.length} OF 10 DOMAINS</span>
          </div>
          <div className="atlas-layout">
            <div className="atlas-list">
              {filtered.map((d) => {
                const m = domainMetrics(progress, questions, d.id);
                return (
                  <button
                    id={`domain-${d.id}`}
                    key={d.id}
                    className={`atlas-item ${focus?.id === d.id ? "selected" : ""}`}
                    aria-expanded={focus?.id === d.id}
                    aria-controls="objective-detail"
                    onClick={(event) => {
                      selectedTriggerRef.current = event.currentTarget;
                      setDomainFocus(d.id);
                      if (window.matchMedia("(max-width: 1000px)").matches)
                        setFocusDetailId(d.id);
                    }}
                  >
                    <span className="atlas-index">
                      {String(CURRICULUM_DOMAINS.indexOf(d) + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>
                    <div>
                      <strong>{d.title}</strong>
                      <small>{d.description}</small>
                      <div className="atlas-item-footer">
                        <span>{d.concepts.slice(0, 3).join(" · ")}</span>
                        <span>
                          {m.seen}/{m.total} seen
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight size={18} />
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <div className="empty-state">
                  No matching objective. Try a concept like “streams” or
                  “modules”.
                </div>
              )}
            </div>
            <aside className="atlas-detail" id="objective-detail">
              {focus ? (
                <>
                  <div className="detail-header">
                    <Eyebrow>
                      OBJECTIVE{" "}
                      {String(CURRICULUM_DOMAINS.indexOf(focus) + 1).padStart(
                        2,
                        "0",
                      )}
                    </Eyebrow>
                    <button
                      aria-label="Close objective detail"
                      onClick={closeObjective}
                    >
                      <X size={17} />
                    </button>
                  </div>
                  <h2
                    id="objective-detail-heading"
                    ref={detailHeadingRef}
                    tabIndex={-1}
                  >
                    {focus.title}
                  </h2>
                  <p>{focus.description}</p>
                  <div className="detail-divider" />
                  <Eyebrow>ATOMIC EXAM OBJECTIVES</Eyebrow>
                  <div className="objective-checklist">
                    {objectivesForDomain(focus.id).map((objective) => {
                      const metric = objectiveMetrics(
                        progress,
                        questions,
                        objective.id,
                      );
                      return (
                        <div key={objective.id}>
                          <span>
                            {metric.seen}/{metric.total}
                          </span>
                          <strong>{objective.title}</strong>
                          <small>
                            {metric.accuracy === null
                              ? "Not attempted"
                              : `${metric.accuracy}% latest accuracy`}
                          </small>
                        </div>
                      );
                    })}
                  </div>
                  <div className="detail-divider" />
                  <Eyebrow>RULES TO OWN</Eyebrow>
                  <div className="rule-list">
                    {focus.rules.map((rule, index) => (
                      <div className="rule" key={index}>
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        <div>
                          {rule.text}
                          <a
                            href={rule.source}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Read source"
                          >
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pitfall">
                    <span>THE COMMON MISREAD</span>
                    <p>
                      <s>{focus.pitfall.assumption}</s>
                    </p>
                    <strong>{focus.pitfall.reality}</strong>
                  </div>
                  <div className="detail-concepts">
                    {focus.concepts.map((c) => (
                      <span key={c}>{c}</span>
                    ))}
                  </div>
                  <button
                    className="button button-coral full"
                    onClick={() => startDomain(focus.id)}
                  >
                    Practice this objective <ArrowRight size={17} />
                  </button>
                </>
              ) : (
                <>
                  <div className="detail-placeholder-art">{"{ 25 }"}</div>
                  <Eyebrow>SELECT AN OBJECTIVE</Eyebrow>
                  <h2>Know the boundary of each rule.</h2>
                  <p>
                    Choose an objective to inspect its governing ideas, common
                    misreads and source links.
                  </p>
                </>
              )}
            </aside>
          </div>
        </>
      ) : (
        <div className="release-layout">
          <div className="release-lead">
            <Eyebrow>RELEASE 25 / WHAT CHANGED</Eyebrow>
            <h2>Know what is language, library, and preview.</h2>
            <p>
              The objectives cover broad core language and API skills. These
              feature briefs focus on changes worth distinguishing from earlier
              editions.
            </p>
            <a href={JAVA_URL} target="_blank" rel="noreferrer">
              Oracle language changes summary <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="feature-list">
            {JAVA_25_FEATURES.map((feature, i) => (
              <article className="feature-card" key={feature.id}>
                <div className="feature-number">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div className="feature-title">
                    <h3>{feature.title}</h3>
                    <span className={`status-pill ${feature.status}`}>
                      {feature.status}
                    </span>
                  </div>
                  <p>{feature.summary}</p>
                  <div className="feature-lens">
                    <strong>
                      {feature.scope === "supplemental"
                        ? "SUPPLEMENTAL"
                        : "EXAM LENS"}
                    </strong>{" "}
                    {feature.examLens}
                  </div>
                  <a href={feature.source} target="_blank" rel="noreferrer">
                    Read the source <ExternalLink size={13} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PracticeLaunch({
  progress,
  due,
  domainFocus,
  setDomainFocus,
  patternFocus,
  setPatternFocus,
  startDaily,
  startTargeted,
  startReview,
  dailyActionLabel,
  activeSession,
}: {
  progress: Progress;
  due: Question[];
  domainFocus: string | null;
  setDomainFocus: (id: string | null) => void;
  patternFocus: QuestionPattern | null;
  setPatternFocus: (pattern: QuestionPattern | null) => void;
  startDaily: () => void;
  startTargeted: () => void;
  startReview: () => void;
  dailyActionLabel: string;
  activeSession: Session | null;
}) {
  const targetedCount = questions.filter(
    (question) =>
      (!domainFocus || question.domain === domainFocus) &&
      (!patternFocus || matchesQuestionPattern(question, patternFocus)),
  ).length;
  return (
    <div className="page">
      <PageHeading
        eyebrow="PRACTICE / RULE RETRIEVAL"
        title="Practice lab."
        subtitle="Every answer is a decision. Every explanation is a rule you can reuse."
      />
      <section className="target-section">
        <div className="section-header">
          <div>
            <Eyebrow>TARGETED PRACTICE</Eyebrow>
            <h2>Choose what to sharpen.</h2>
            <p>Pick an objective, a reasoning pattern, or both.</p>
          </div>
        </div>
        <div className="target-picker">
          <div className="select-wrap">
            <select
              aria-label="Choose objective"
              value={domainFocus ?? ""}
              onChange={(e) => setDomainFocus(e.target.value || null)}
            >
              <option value="">All objective areas</option>
              {CURRICULUM_DOMAINS.map((d, i) => (
                <option key={d.id} value={d.id}>
                  {String(i + 1).padStart(2, "0")} — {d.title}
                </option>
              ))}
            </select>
            <ChevronDown size={18} />
          </div>
          <div className="target-action">
            <span>{targetedCount} questions in this pool</span>
            <button
              className="button button-dark"
              disabled={(!domainFocus && !patternFocus) || !targetedCount}
              onClick={startTargeted}
            >
              Start {Math.min(8, targetedCount)}-question set{" "}
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
        <div
          className="pattern-grid"
          role="group"
          aria-label="Question patterns"
        >
          {QUESTION_PATTERNS.map((pattern, index) => {
            const poolCount = questions.filter(
              (question) =>
                (!domainFocus || question.domain === domainFocus) &&
                matchesQuestionPattern(question, pattern.id),
            ).length;
            return (
              <button
                className={`pattern-card ${patternFocus === pattern.id ? "active" : ""}`}
                key={pattern.id}
                type="button"
                aria-pressed={patternFocus === pattern.id}
                disabled={!poolCount && patternFocus !== pattern.id}
                onClick={() =>
                  setPatternFocus(
                    patternFocus === pattern.id ? null : pattern.id,
                  )
                }
              >
                <span className="pattern-index">
                  {String(index + 1).padStart(2, "0")} / {poolCount} ITEMS
                </span>
                <strong>{pattern.label}</strong>
                <small>{pattern.description}</small>
              </button>
            );
          })}
        </div>
      </section>
      <div className="launch-grid launch-grid-after-target">
        <button className="launch-card launch-feature" onClick={startDaily}>
          <span className="launch-icon">
            <Command size={23} />
          </span>
          <span className="launch-type">
            {activeSession ? "SESSION IN PROGRESS" : "RECOMMENDED SESSION"}
          </span>
          <h2>{activeSession ? dailyActionLabel : "Daily practice"}</h2>
          <p>
            {activeSession
              ? `Question ${activeSession.index + 1} of ${activeSession.ids.length} is ready. Continue where you left off.`
              : "Due reviews first. New questions next. Up to eight focused decisions, with immediate explanation and a confidence check."}
          </p>
          <span className="launch-footer">
            {activeSession ? "CONTINUE SESSION" : "UP TO 8 QUESTIONS"}{" "}
            <ArrowUpRight size={18} />
          </span>
        </button>
        <button
          className="launch-card"
          onClick={startReview}
          disabled={!due.length && !progress.bookmarks.length}
        >
          <span className="launch-icon">
            <RotateCcw size={23} />
          </span>
          <span className="launch-type">SPACED RETRIEVAL</span>
          <h2>Review what slipped</h2>
          <p>
            {due.length
              ? `${due.length} question${due.length === 1 ? "" : "s"} due now. Revisit them before the rule fades.`
              : progress.bookmarks.length
                ? "No due items. Revisit your saved questions."
                : "Your review queue will grow as you practice."}
          </p>
          <span className="launch-footer">
            {due.length} DUE NOW <ArrowUpRight size={18} />
          </span>
        </button>
      </div>
      <div className="method-strip">
        <span>THE FORGE METHOD</span>
        <div>
          <strong>01</strong> Commit
        </div>
        <ArrowRight size={15} />
        <div>
          <strong>02</strong> Calibrate confidence
        </div>
        <ArrowRight size={15} />
        <div>
          <strong>03</strong> Inspect every option
        </div>
        <ArrowRight size={15} />
        <div>
          <strong>04</strong> Return on schedule
        </div>
      </div>
    </div>
  );
}

function BenchmarkLaunch({
  progress,
  startBenchmark,
}: {
  progress: Progress;
  startBenchmark: (target: 20 | string) => void;
}) {
  const last = progress.benchmarks.at(-1);
  const firstAttempts = progress.benchmarks.filter(
    (result) => result.formId && result.firstAttempt,
  );
  const nextForm = mockForms.find(
    (form) => !progress.benchmarks.some((result) => result.formId === form.id),
  );
  const firstAttemptAverage = firstAttempts.length
    ? Math.round(
        firstAttempts.reduce(
          (sum, result) => sum + (result.correct / result.total) * 100,
          0,
        ) / firstAttempts.length,
      )
    : null;
  return (
    <div className="page">
      <PageHeading
        eyebrow="EXAM PACE / CONTROLLED PRESSURE"
        title="Timed benchmark."
        subtitle="Choose a short drill or a full-length practice run across all ten objective areas."
      />
      <div className="benchmark-hero">
        <div>
          <span className="hero-kicker">BENCHMARK / NOT THE LIVE EXAM</span>
          <h2>
            Think clearly
            <br />
            <em>under the clock.</em>
          </h2>
          <p>
            Three mock-only forms keep 150 questions outside normal practice.
            Each full run has 50 mixed-domain items in 120 minutes, with answers
            hidden until final submission.
          </p>
          <div className="benchmark-actions">
            <button
              className="button button-coral"
              disabled={!nextForm && !mockForms.length}
              onClick={() => startBenchmark((nextForm ?? mockForms[0]).id)}
            >
              {nextForm ? `Start unseen Form ${nextForm.id}` : "Retake Form A"}
              <ArrowUpRight size={18} />
            </button>
            <button
              className="button button-dark"
              onClick={() => startBenchmark(20)}
            >
              Short drill · 20 questions <ArrowRight size={18} />
            </button>
          </div>
        </div>
        <div className="benchmark-dial">
          <span>50</span>
          <small>QUESTIONS</small>
          <i>120 MIN</i>
        </div>
      </div>
      <section className="mock-form-section">
        <div className="section-header">
          <div>
            <Eyebrow>LOCKED MOCK BANK</Eyebrow>
            <h2>Three independent exam forms.</h2>
            <p>
              Mock questions never enter daily practice before you attempt their
              form.
            </p>
          </div>
          <span>{firstAttempts.length}/3 FIRST ATTEMPTS COMPLETE</span>
        </div>
        <div className="mock-form-grid">
          {mockForms.map((form) => {
            const attempts = progress.benchmarks.filter(
              (result) => result.formId === form.id,
            );
            const first = attempts.find((result) => result.firstAttempt);
            const latest = attempts.at(-1);
            return (
              <article className="mock-form-card" key={form.id}>
                <div className="mock-form-topline">
                  <span>FORM {form.id}</span>
                  <em>{first ? "ATTEMPTED" : "UNSEEN"}</em>
                </div>
                <strong>50 questions · 120 minutes</strong>
                <p>
                  {first
                    ? `First attempt: ${first.correct}/${first.total}. ${attempts.length > 1 ? `${attempts.length} total runs.` : "Review is now available."}`
                    : "Reserved from practice. Opening the form starts the timer and reveals its first item."}
                </p>
                <button
                  className={
                    first ? "button button-dark" : "button button-coral"
                  }
                  onClick={() => startBenchmark(form.id)}
                >
                  {first
                    ? `Retake${latest ? ` · latest ${latest.correct}/${latest.total}` : ""}`
                    : "Start first attempt"}
                  <ArrowRight size={16} />
                </button>
              </article>
            );
          })}
        </div>
      </section>
      <div className="benchmark-details">
        <div>
          <span>01</span>
          <strong>Reported exam cadence</strong>
          <p>
            Both modes allow 2 minutes 24 seconds per item, based on the
            50-question, 120-minute format reported by OCP authors.
          </p>
        </div>
        <div>
          <span>02</span>
          <strong>No instant feedback</strong>
          <p>
            Navigate freely, flag items, revise answers, then confirm from the
            final review screen.
          </p>
        </div>
        <div>
          <span>03</span>
          <strong>Practice score</strong>
          <p>
            First-attempt mock scores are kept separate from retakes and daily
            practice, without claiming a guaranteed live result.
          </p>
        </div>
      </div>
      {last && (
        <div className="last-benchmark">
          <span>
            LAST BENCHMARK <strong>{formatDate(last.at)}</strong>
          </span>
          <span>
            <strong>
              {last.correct}/{last.total}
            </strong>{" "}
            correct
          </span>
          <span>{formatDuration(last.durationMs)} elapsed</span>
        </div>
      )}
      {progress.benchmarks.length > 0 && (
        <section className="benchmark-history panel">
          <div className="section-header">
            <div>
              <Eyebrow>READINESS EVIDENCE</Eyebrow>
              <h2>Timed-run history.</h2>
            </div>
            <span>
              {firstAttemptAverage === null
                ? "NO UNSEEN FULL FORM YET"
                : `${firstAttemptAverage}% FIRST-ATTEMPT AVERAGE`}
            </span>
          </div>
          <div className="benchmark-history-table">
            {[...progress.benchmarks]
              .reverse()
              .slice(0, 8)
              .map((result, index) => (
                <details key={result.id ?? `${result.at}-${index}`}>
                  <summary>
                    <span>{formatDate(result.at)}</span>
                    <strong>
                      {result.formId
                        ? `Form ${result.formId}${result.firstAttempt ? " · first" : " · retake"}`
                        : "Short drill"}
                    </strong>
                    <em>
                      {result.correct}/{result.total}
                    </em>
                    <small>
                      {result.unanswered === undefined
                        ? "unanswered not recorded"
                        : `${result.unanswered} unanswered`}
                    </small>
                    <small>{formatDuration(result.durationMs)}</small>
                  </summary>
                  {result.domains?.length ? (
                    <div className="benchmark-history-domains">
                      {result.domains.map((domain) => (
                        <span key={domain.domain}>
                          {shortDomain(domain.domain)}{" "}
                          <strong>
                            {domain.correct}/{domain.total}
                          </strong>{" "}
                          · {formatDuration(domain.elapsedMs)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p>
                      Detailed domain evidence was not stored for this older
                      run.
                    </p>
                  )}
                </details>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}

function QuestionView({
  question,
  session,
  selected,
  confidence,
  setConfidence,
  toggleOption,
  revealed,
  onSubmit,
  onNext,
  onSkip,
  onExit,
  bookmarked,
  toggleBookmark,
  note,
  saveNote,
  remaining,
  flagged,
  onToggleFlag,
  onNavigate,
  onReview,
}: {
  question: Question;
  session: Session;
  selected: string[];
  confidence: Confidence | null;
  setConfidence: (value: Confidence) => void;
  toggleOption: (id: string) => void;
  revealed: boolean;
  onSubmit: () => void;
  onNext: () => void;
  onSkip: () => void;
  onExit: () => void;
  bookmarked: boolean;
  toggleBookmark: () => void;
  note: string;
  saveNote: (value: string) => void;
  remaining: number;
  flagged: boolean;
  onToggleFlag: () => void;
  onNavigate: (index: number) => void;
  onReview: () => void;
}) {
  const answer = session.answers[question.id];
  const options = orderedOptions(question, session.startedAt);
  const correct = answer ? isCorrect(question, answer.selected) : false;
  const domain = domainById(question.domain);
  const [copied, setCopied] = useState(false);
  const highlightedCode = useMemo(
    () => highlightJavaLines(question.code?.trim() ?? ""),
    [question.code],
  );
  useEffect(() => setCopied(false), [question.id]);
  const count = session.ids.length;
  const completed =
    session.kind === "benchmark"
      ? session.ids.filter((id) => {
          if (id === question.id) return selected.length > 0;
          return Boolean(session.answers[id]?.selected.length);
        }).length
      : Math.min(count, session.index + (answer ? 1 : 0));
  return (
    <div className="page question-page">
      <div className="question-top">
        <button className="back-link" onClick={onExit}>
          <ChevronLeft size={17} />{" "}
          {session.kind === "benchmark"
            ? "Leave (timer continues)"
            : "Leave & resume later"}
        </button>
        <div className="question-session-label">
          <span className="live-dot" />{" "}
          {session.kind === "benchmark"
            ? "TIMED BENCHMARK"
            : "PRACTICE CIRCUIT"}
        </div>
        <div className="question-time">
          <Clock3 size={16} />{" "}
          {session.kind === "benchmark" ? formatDuration(remaining) : "Untimed"}
        </div>
      </div>
      <div className="session-progress">
        <div>
          <strong>
            Question {session.index + 1} <span>/ {count}</span>
          </strong>
          <span>{Math.round((completed / count) * 100)}% complete</span>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-label="Session progress"
          aria-valuemin={0}
          aria-valuemax={count}
          aria-valuenow={completed}
        >
          <span style={{ width: `${(completed / count) * 100}%` }} />
        </div>
      </div>
      <div
        className={`question-layout ${session.kind === "benchmark" ? "benchmark-question" : ""}`}
      >
        <section className="question-main">
          <div className="question-card">
            <div className="question-meta">
              <span className="question-domain">
                {session.kind === "benchmark"
                  ? `TIMED ITEM ${String(session.index + 1).padStart(2, "0")}`
                  : `${String(CURRICULUM_DOMAINS.indexOf(domain) + 1).padStart(2, "0")} / ${domain.title}`}
              </span>
              {session.kind === "practice" ? (
                <div>
                  <span className="question-pattern">
                    {questionPatternLabel(question)}
                  </span>
                  <span className="difficulty">{question.difficulty}</span>
                  <button
                    className={`icon-button ${bookmarked ? "bookmarked" : ""}`}
                    onClick={toggleBookmark}
                    aria-label={
                      bookmarked ? "Remove bookmark" : "Bookmark question"
                    }
                  >
                    <Bookmark
                      size={18}
                      fill={bookmarked ? "currentColor" : "none"}
                    />
                  </button>
                </div>
              ) : (
                <button
                  className={`flag-button ${flagged ? "flagged" : ""}`}
                  onClick={onToggleFlag}
                  aria-pressed={flagged}
                >
                  <Flag size={16} fill={flagged ? "currentColor" : "none"} />
                  {flagged ? "Flagged" : "Flag for review"}
                </button>
              )}
            </div>
            <h1>{question.prompt}</h1>
            {question.code && (
              <div className="code-window">
                <div className="code-title">
                  <span>
                    <i />
                    <i />
                    <i />
                  </span>
                  <strong>JAVA SNIPPET</strong>
                  {session.kind === "practice" && (
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(
                          question.code ?? "",
                        );
                        setCopied(true);
                      }}
                      aria-label="Copy code"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  )}
                </div>
                <pre
                  aria-label="Java code; scroll horizontally to read long lines"
                  tabIndex={0}
                >
                  {highlightedCode.map((line, i) => (
                    <div key={i}>
                      <span className="line-number" aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <code>{line.length ? line : " "}</code>
                    </div>
                  ))}
                </pre>
              </div>
            )}
            {question.code && (
              <div className="snippet-context">
                Code fragments are assumed to sit in a suitable enclosing
                context unless the question says otherwise.
              </div>
            )}
            <div className="answer-instruction">
              <span>
                {question.type === "multiple"
                  ? `SELECT ${question.answer.length} ANSWERS`
                  : "SELECT ONE ANSWER"}
              </span>
              <span>
                {session.kind === "practice"
                  ? "Choose, then inspect the rule"
                  : "Feedback after the benchmark"}
              </span>
            </div>
            <div className="options">
              {options.map((option, i) => {
                const isSelected = selected.includes(option.id);
                const isRight = question.answer.includes(option.id);
                return (
                  <button
                    className={`option ${isSelected ? "selected" : ""} ${revealed && isRight ? "correct" : ""} ${revealed && isSelected && !isRight ? "incorrect" : ""}`}
                    key={option.id}
                    onClick={() => toggleOption(option.id)}
                    disabled={revealed}
                    aria-pressed={isSelected}
                    aria-label={`${String.fromCharCode(65 + i)}. ${option.text}${revealed && isRight ? " Correct answer." : ""}`}
                  >
                    <span className="option-key">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="option-text">{option.text}</span>
                    {revealed && isRight ? (
                      <Check size={18} />
                    ) : revealed && isSelected ? (
                      <X size={18} />
                    ) : (
                      <span className="option-select">
                        {question.type === "multiple" ? "□" : "○"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          {revealed && (
            <div
              className={`feedback ${correct ? "feedback-correct" : "feedback-wrong"}`}
            >
              <span className="sr-only" role="status">
                {correct ? "Correct answer." : "Incorrect answer."} Explanation
                follows.
              </span>
              <div className="feedback-heading">
                <span className="feedback-icon">
                  {correct ? <Check size={19} /> : <X size={19} />}
                </span>
                <div>
                  <Eyebrow>
                    {correct ? "RULE CONFIRMED" : "RECALIBRATE THE RULE"}
                  </Eyebrow>
                  <h2>
                    {correct
                      ? "Correct reasoning."
                      : "This one is worth revisiting."}
                  </h2>
                </div>
              </div>
              <p>{question.explanation}</p>
              <div className="option-explanations">
                <Eyebrow>WHY EACH OPTION HOLDS OR FAILS</Eyebrow>
                {options.map((o, i) => (
                  <div key={o.id}>
                    <span
                      className={
                        question.answer.includes(o.id) ? "key-right" : ""
                      }
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <p>{o.explanation}</p>
                  </div>
                ))}
              </div>
              <a href={question.sourceUrl} target="_blank" rel="noreferrer">
                Verify in the Java 25 documentation <ExternalLink size={15} />
              </a>
            </div>
          )}
          <div className="question-actions">
            {!revealed && (
              <>
                {session.kind === "practice" && (
                  <div className="confidence">
                    <span>BEFORE YOU CHECK, HOW SURE?</span>
                    <div>
                      {(["guess", "unsure", "sure"] as Confidence[]).map(
                        (c) => (
                          <button
                            key={c}
                            className={confidence === c ? "active" : ""}
                            onClick={() => setConfidence(c)}
                            aria-pressed={confidence === c}
                          >
                            {c === "guess"
                              ? "Guess"
                              : c === "unsure"
                                ? "Unsure"
                                : "Sure"}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )}
                <div className="question-action-row">
                  <span className="keyboard-tip">
                    KEYS: 1–{question.options.length} SELECT · ENTER{" "}
                    {session.kind === "benchmark" ? "NEXT" : "SUBMIT"}
                  </span>
                  {session.kind === "practice" ? (
                    <button className="plain-button" onClick={onSkip}>
                      Skip for now
                    </button>
                  ) : (
                    <button
                      className="button button-ghost"
                      disabled={session.index === 0}
                      onClick={() => onNavigate(session.index - 1)}
                    >
                      <ChevronLeft size={17} /> Previous
                    </button>
                  )}
                  <button
                    className="button button-dark"
                    disabled={
                      session.kind === "practice" &&
                      (!selected.length ||
                        !confidence ||
                        (question.type === "multiple" &&
                          selected.length !== question.answer.length))
                    }
                    onClick={onSubmit}
                  >
                    {session.kind === "benchmark"
                      ? session.index === count - 1
                        ? "Review answers"
                        : selected.length
                          ? "Save & next"
                          : "Leave unanswered & next"
                      : "Check answer"}{" "}
                    <ArrowRight size={17} />
                  </button>
                  {session.kind === "benchmark" &&
                    session.index < count - 1 && (
                      <button className="plain-button" onClick={onReview}>
                        Review all
                      </button>
                    )}
                </div>
              </>
            )}
            {revealed && (
              <div className="question-action-row">
                <span className="keyboard-tip">
                  Your next review is scheduled from this result.
                </span>
                <button className="button button-dark" onClick={onNext}>
                  {session.index === count - 1
                    ? "See session result"
                    : "Next question"}{" "}
                  <ArrowRight size={17} />
                </button>
              </div>
            )}
          </div>
        </section>
        {session.kind === "practice" && (
          <aside className="question-aside">
            <div className="aside-card">
              <Eyebrow>THE OBJECTIVE</Eyebrow>
              <strong>{domain.title}</strong>
              <p>{domain.description}</p>
              <div className="aside-divider" />
              <Eyebrow>CONCEPTS IN PLAY</Eyebrow>
              <div className="concept-stack">
                {question.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
            <div className="aside-card aside-note">
              <div className="aside-note-heading">
                <Flag size={18} />
                <Eyebrow>RULE NOTEBOOK</Eyebrow>
              </div>
              <p>
                Capture the rule in your own words. Your note stays with this
                question.
              </p>
              <textarea
                aria-label="Your rule note"
                value={note}
                onChange={(e) => saveNote(e.target.value)}
                placeholder="The exact rule I need to remember is…"
                rows={5}
              />
              <small>Saved automatically on this device</small>
            </div>
            <a
              className="aside-source"
              href={question.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              <ShieldCheck size={17} /> Primary source{" "}
              <ArrowUpRight size={16} />
            </a>
          </aside>
        )}
        {session.kind === "benchmark" && (
          <aside className="exam-navigator" aria-label="Question navigator">
            <div className="exam-navigator-heading">
              <div>
                <Eyebrow>EXAM NAVIGATOR</Eyebrow>
                <strong>
                  {completed}/{count} answered
                </strong>
              </div>
              <button onClick={onReview}>Review all</button>
            </div>
            <div className="exam-palette">
              {session.ids.map((id, index) => {
                const isCurrent = index === session.index;
                const isAnswered = isCurrent
                  ? selected.length > 0
                  : Boolean(session.answers[id]?.selected.length);
                const isFlagged = session.flags.includes(id);
                return (
                  <button
                    key={id}
                    className={`${isCurrent ? "current" : ""} ${isAnswered ? "answered" : ""} ${isFlagged ? "flagged" : ""}`}
                    onClick={() => onNavigate(index)}
                    aria-current={isCurrent ? "step" : undefined}
                    aria-label={`Question ${index + 1}${isAnswered ? ", answered" : ", unanswered"}${isFlagged ? ", flagged" : ""}`}
                  >
                    {index + 1}
                    {isFlagged && <Flag size={9} fill="currentColor" />}
                  </button>
                );
              })}
            </div>
            <div className="exam-legend">
              <span>
                <i className="answered" /> Answered
              </span>
              <span>
                <i className="flagged" /> Flagged
              </span>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function BenchmarkReview({
  session,
  remaining,
  onOpen,
  onSubmit,
  onExit,
}: {
  session: Session;
  remaining: number;
  onOpen: (index: number) => void;
  onSubmit: () => void;
  onExit: () => void;
}) {
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const answered = session.ids.filter(
    (id) => session.answers[id]?.selected.length,
  ).length;
  const unanswered = session.ids.length - answered;
  return (
    <div className="page benchmark-review-page">
      <div className="question-top">
        <button className="back-link" onClick={onExit}>
          <ChevronLeft size={17} /> Leave (timer continues)
        </button>
        <div className="question-session-label">
          <span className="live-dot" /> FINAL REVIEW
        </div>
        <div className="question-time">
          <Clock3 size={16} /> {formatDuration(remaining)}
        </div>
      </div>
      <PageHeading
        eyebrow="BEFORE YOU SUBMIT"
        title="Review every decision."
        subtitle="Open any item to answer it, revise it, or clear a flag. Unanswered items count as incorrect when time expires."
      />
      <div className="review-summary-grid">
        <div>
          <strong>{answered}</strong>
          <span>Answered</span>
        </div>
        <div className={unanswered ? "warning" : ""}>
          <strong>{unanswered}</strong>
          <span>Unanswered</span>
        </div>
        <div>
          <strong>{session.flags.length}</strong>
          <span>Flagged</span>
        </div>
        <div>
          <strong>{session.ids.length}</strong>
          <span>Total</span>
        </div>
      </div>
      <section className="panel exam-review-panel">
        <div className="section-header">
          <div>
            <Eyebrow>QUESTION PALETTE</Eyebrow>
            <h2>Jump back before submitting.</h2>
          </div>
          <span>ANSWERED · UNANSWERED · FLAGGED</span>
        </div>
        <div className="review-palette">
          {session.ids.map((id, index) => {
            const question = allQuestions.find((item) => item.id === id);
            const isAnswered = Boolean(session.answers[id]?.selected.length);
            const isFlagged = session.flags.includes(id);
            return (
              <button
                key={id}
                className={`${isAnswered ? "answered" : "unanswered"} ${isFlagged ? "flagged" : ""}`}
                onClick={() => onOpen(index)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{question?.prompt ?? `Question ${index + 1}`}</strong>
                  <small>
                    {isAnswered ? "Answered" : "Unanswered"}
                    {isFlagged ? " · Flagged" : ""}
                  </small>
                </div>
                {isFlagged ? (
                  <Flag size={16} fill="currentColor" />
                ) : (
                  <ArrowRight size={16} />
                )}
              </button>
            );
          })}
        </div>
      </section>
      <div className="benchmark-submit-bar">
        {confirmSubmit ? (
          <div className="submit-confirm" role="alert">
            <div>
              <strong>Submit this benchmark now?</strong>
              <span>
                {unanswered
                  ? `${unanswered} unanswered item${unanswered === 1 ? "" : "s"} will be scored incorrect.`
                  : "All questions have an answer."}
              </span>
            </div>
            <button
              className="button button-ghost"
              onClick={() => setConfirmSubmit(false)}
            >
              Keep reviewing
            </button>
            <button className="button button-coral" onClick={onSubmit}>
              Submit benchmark
            </button>
          </div>
        ) : (
          <>
            <span>
              {unanswered ? `${unanswered} unanswered · ` : ""}
              {session.flags.length} flagged
            </span>
            <button
              className="button button-coral"
              onClick={() => setConfirmSubmit(true)}
            >
              Review submission <ArrowRight size={17} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function SessionReport({
  session,
  progress,
  onDone,
  onReview,
  practiceOne,
}: {
  session: Session;
  progress: Progress;
  onDone: () => void;
  onReview: () => void;
  practiceOne: (q: Question) => void;
}) {
  const total = session.ids.length;
  const score = session.score ?? 0;
  const misses = session.ids
    .map((id) => allQuestions.find((q) => q.id === id))
    .filter((q): q is Question => Boolean(q))
    .filter(
      (q) =>
        !session.answers[q.id] || !isCorrect(q, session.answers[q.id].selected),
    );
  const guessed = session.ids.filter(
    (id) => session.answers[id]?.confidence === "guess",
  ).length;
  const unanswered = session.ids.filter(
    (id) => !session.answers[id]?.selected.length,
  ).length;
  const domainResults = CURRICULUM_DOMAINS.map((domain) => {
    const domainQuestions = session.ids
      .map((id) => allQuestions.find((question) => question.id === id))
      .filter(
        (question): question is Question => question?.domain === domain.id,
      );
    return {
      domain,
      total: domainQuestions.length,
      correct: domainQuestions.filter((question) =>
        isCorrect(question, session.answers[question.id]?.selected ?? []),
      ).length,
      elapsedMs: domainQuestions.reduce(
        (sum, question) => sum + (session.answers[question.id]?.elapsedMs ?? 0),
        0,
      ),
    };
  }).filter((result) => result.total > 0);
  return (
    <div className="page report-page">
      <Eyebrow>SESSION COMPLETE / THE EVIDENCE</Eyebrow>
      <div className="report-hero">
        <div>
          <span>
            {session.kind === "benchmark"
              ? "BENCHMARK RESULT"
              : "PRACTICE RESULT"}
          </span>
          <h1>
            {score}
            <em>/{total}</em>
          </h1>
          <p>
            {session.kind === "benchmark"
              ? "Correct under timed conditions"
              : "Rules confirmed in this circuit"}
          </p>
        </div>
        <div className="report-message">
          <h2>
            {score === total ? "A clean run." : "You have a clear next move."}
          </h2>
          <p>
            {misses.length
              ? `${misses.length} item${misses.length === 1 ? "" : "s"} need another pass. Review the actual rule and return to them on schedule.`
              : "Keep your reasoning sharp with a new domain or a timed benchmark."}
          </p>
          <div>
            <span>
              {session.kind === "benchmark"
                ? `${unanswered} unanswered`
                : `${guessed} guessed`}
            </span>
            <span>{misses.length} to revisit</span>
            <span>
              {formatDuration(
                (session.endedAt ?? Date.now()) - session.startedAt,
              )}{" "}
              elapsed
            </span>
          </div>
        </div>
      </div>
      {session.kind === "benchmark" && (
        <div className="report-caveat">
          {session.formId
            ? `Form ${session.formId} uses a mock-only bank. Its first attempt is preserved separately from retakes; no practice score guarantees a live result.`
            : "This short drill uses the teaching bank. Use a first attempt on a full mock form for stronger readiness evidence."}
        </div>
      )}
      {session.kind === "benchmark" && (
        <section className="report-domain-breakdown panel">
          <div className="section-header">
            <div>
              <Eyebrow>DOMAIN + PACE BREAKDOWN</Eyebrow>
              <h2>Where time and points went.</h2>
            </div>
            <span>{session.flags.length} FLAGGED AT SUBMISSION</span>
          </div>
          <div className="report-domain-grid">
            {domainResults.map((result) => (
              <div key={result.domain.id}>
                <span>{result.domain.title}</span>
                <strong>
                  {result.correct}/{result.total}
                </strong>
                <small>
                  {formatDuration(result.elapsedMs)} ·{" "}
                  {result.total
                    ? formatDuration(result.elapsedMs / result.total)
                    : "00:00"}{" "}
                  avg
                </small>
              </div>
            ))}
          </div>
        </section>
      )}
      <div className="section-header">
        <div>
          <Eyebrow>WHAT TO REVIEW</Eyebrow>
          <h2>
            {misses.length ? "The missed decisions." : "No misses this round."}
          </h2>
        </div>
      </div>
      <div className="report-list">
        {misses.map((q) => (
          <details key={q.id} className="report-review">
            <summary>
              <span>{shortDomain(q.domain)}</span>
              <strong>{q.prompt}</strong>
              <ChevronDown size={18} />
            </summary>
            <div className="report-review-body">
              <div>
                <b>Your answer</b>
                <p>
                  {session.answers[q.id]?.selected.length
                    ? q.options
                        .filter((o) =>
                          session.answers[q.id].selected.includes(o.id),
                        )
                        .map((o) => o.text)
                        .join(" · ")
                    : "Unanswered"}
                </p>
              </div>
              <div>
                <b>Correct answer</b>
                <p>
                  {q.options
                    .filter((o) => q.answer.includes(o.id))
                    .map((o) => o.text)
                    .join(" · ")}
                </p>
              </div>
              <p>{q.explanation}</p>
              <div className="report-review-actions">
                <a href={q.sourceUrl} target="_blank" rel="noreferrer">
                  Verify the rule <ExternalLink size={14} />
                </a>
                <button onClick={() => practiceOne(q)}>
                  Practice this again <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </details>
        ))}
        {!misses.length && (
          <div className="empty-state">
            The next circuit will bring new items or scheduled reviews.
          </div>
        )}
      </div>
      <div className="report-actions">
        <button className="button button-dark" onClick={onReview}>
          Open review queue <ArrowRight size={17} />
        </button>
        <button className="plain-button" onClick={onDone}>
          Back to command center
        </button>
      </div>
      <p className="report-saved">
        {progress.attempts.length} lifetime responses saved locally
      </p>
    </div>
  );
}

function Review({
  progress,
  due,
  questionPool,
  now,
  startReview,
  practiceOne,
  toggleBookmark,
  startDaily,
  dailyActionLabel,
  activeSession,
}: {
  progress: Progress;
  due: Question[];
  questionPool: Question[];
  now: number;
  startReview: () => void;
  practiceOne: (q: Question) => void;
  toggleBookmark: (id: string) => void;
  startDaily: () => void;
  dailyActionLabel: string;
  activeSession: Session | null;
}) {
  const [tab, setTab] = useState<"due" | "saved" | "all">("due");
  const items =
    tab === "due"
      ? due
      : tab === "saved"
        ? questionPool.filter((q) => progress.bookmarks.includes(q.id))
        : questionPool.filter((q) => latestAttempt(progress, q.id));
  const nextDue = questionPool
    .map((q) => dueAt(progress, q.id))
    .filter((time): time is number => time !== null && time > now)
    .sort((a, b) => a - b)[0];
  return (
    <div className="page">
      <PageHeading
        eyebrow="MEMORY / RETURN AT THE RIGHT TIME"
        title="Review queue."
        subtitle="Missed or skipped questions return immediately. Confident answers wait longer."
        action={
          <button
            className="button button-dark"
            onClick={startReview}
            disabled={!due.length && !progress.bookmarks.length}
          >
            {due.length ? "Run review set" : "Review bookmarks"}{" "}
            <ArrowRight size={17} />
          </button>
        }
      />
      <div className="review-rule">
        <div>
          <RotateCcw size={24} />
          <h2>Recall is a practice, not a feeling.</h2>
        </div>
        <p>
          Review timing adapts to correctness and your confidence. A wrong
          answer or skip is due now; confident answers return after a longer
          interval.
        </p>
      </div>
      <div className="tab-bar">
        <button
          className={tab === "due" ? "selected" : ""}
          aria-pressed={tab === "due"}
          onClick={() => setTab("due")}
        >
          Due now <span>{due.length}</span>
        </button>
        <button
          className={tab === "saved" ? "selected" : ""}
          aria-pressed={tab === "saved"}
          onClick={() => setTab("saved")}
        >
          Bookmarked <span>{progress.bookmarks.length}</span>
        </button>
        <button
          className={tab === "all" ? "selected" : ""}
          aria-pressed={tab === "all"}
          onClick={() => setTab("all")}
        >
          Seen{" "}
          <span>
            {questionPool.filter((q) => latestAttempt(progress, q.id)).length}
          </span>
        </button>
      </div>
      <div className="review-list">
        {items.map((q) => {
          const last = latestAttempt(progress, q.id);
          const deadline = dueAt(progress, q.id);
          return (
            <div className="review-item" key={q.id}>
              <div className="review-mark">
                {last?.correct ? <Check size={18} /> : <RotateCcw size={18} />}
              </div>
              <div>
                <span className="review-domain">
                  {domainById(q.domain).title} · {q.difficulty}
                </span>
                <strong>{q.prompt}</strong>
                <div className="review-item-meta">
                  <span>
                    {last
                      ? last.correct
                        ? "Last answer correct"
                        : last.skipped
                          ? "Skipped for now"
                          : "Last answer missed"
                      : "Saved for later"}
                  </span>
                  {deadline !== null && (
                    <span>
                      {deadline <= now
                        ? "Due now"
                        : `Next ${formatDate(deadline)}`}
                    </span>
                  )}
                  {progress.notes[q.id] && <span>Has rule note</span>}
                </div>
              </div>
              <button
                className="review-bookmark"
                aria-label={
                  progress.bookmarks.includes(q.id)
                    ? `Remove bookmark from ${q.prompt}`
                    : `Bookmark ${q.prompt}`
                }
                onClick={() => toggleBookmark(q.id)}
              >
                <Bookmark
                  size={17}
                  fill={
                    progress.bookmarks.includes(q.id) ? "currentColor" : "none"
                  }
                />
              </button>
              <button
                className="review-open"
                onClick={() => practiceOne(q)}
                aria-label={`Practice ${q.prompt}`}
              >
                <ArrowUpRight size={19} />
              </button>
            </div>
          );
        })}
        {!items.length && (
          <div className="review-empty">
            <div className="review-empty-icon">
              <CheckCircle2 size={29} />
            </div>
            <h2>
              {tab === "due"
                ? "All clear for now."
                : tab === "saved"
                  ? "No bookmarks yet."
                  : "No saved responses yet."}
            </h2>
            <p>
              {tab === "due"
                ? nextDue
                  ? `Nothing is due now. Your next scheduled review is ${formatDate(nextDue)}.`
                  : "No reviews yet. Practice a question to create your first review."
                : tab === "saved"
                  ? "Save a question in practice to build a focused list."
                  : "Answer or skip a question to start your history."}
            </p>
            <button className="button button-dark" onClick={startDaily}>
              {activeSession ? dailyActionLabel : "Start daily practice"}{" "}
              <ArrowRight size={17} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Insights({
  progress,
  seen,
  latestCorrect,
  due,
  startDaily,
  navigate,
  dailyActionLabel,
}: {
  progress: Progress;
  seen: number;
  latestCorrect: number;
  due: Question[];
  startDaily: () => void;
  navigate: (v: View) => void;
  dailyActionLabel: string;
}) {
  const sure = questions.filter((q) => {
    const a = latestAttempt(progress, q.id);
    return a?.correct && a.confidence === "sure";
  }).length;
  const wrongSure = progress.attempts.filter(
    (a) => !a.correct && a.confidence === "sure",
  ).length;
  const guessedRight = progress.attempts.filter(
    (a) => a.correct && a.confidence === "guess",
  ).length;
  const frictionCounts = new Map<string, number>();
  for (const q of questions) {
    if (latestAttempt(progress, q.id)?.correct === false) {
      for (const tag of q.tags)
        frictionCounts.set(tag, (frictionCounts.get(tag) ?? 0) + 1);
    }
  }
  const topFriction = [...frictionCounts].sort((a, b) => b[1] - a[1])[0];
  return (
    <div className="page">
      <PageHeading
        eyebrow="PROGRESS / WHAT YOU HAVE DEMONSTRATED"
        title="Study evidence."
        subtitle="Readiness grows from demonstrated coverage, accuracy, and calibration—not an invented prediction."
      />
      <div className="insight-summary">
        <div>
          <Eyebrow>OBJECTIVE COVERAGE</Eyebrow>
          <strong>
            {
              CURRICULUM_DOMAINS.filter(
                (d) => domainMetrics(progress, questions, d.id).seen > 0,
              ).length
            }
            <span>/10</span>
          </strong>
          <p>Domains with at least one attempt</p>
        </div>
        <div>
          <Eyebrow>QUESTION COVERAGE</Eyebrow>
          <strong>
            {seen}
            <span>/{questions.length}</span>
          </strong>
          <p>Unique questions explored</p>
        </div>
        <div>
          <Eyebrow>LATEST ACCURACY</Eyebrow>
          <strong>
            {seen ? `${Math.round((latestCorrect / seen) * 100)}%` : "—"}
          </strong>
          <p>Latest result per explored item</p>
        </div>
        <div>
          <Eyebrow>SECURE ANSWERS</Eyebrow>
          <strong>{sure}</strong>
          <p>Correct and answered with confidence</p>
        </div>
      </div>
      <div className="insights-grid">
        <section className="panel domain-evidence">
          <div className="section-header">
            <div>
              <Eyebrow>BY OBJECTIVE</Eyebrow>
              <h2>Where the evidence is.</h2>
            </div>
            <span>COVERAGE (BAR + COUNT) · ACCURACY (%)</span>
          </div>
          <div className="domain-bars">
            {CURRICULUM_DOMAINS.map((d, i) => {
              const m = domainMetrics(progress, questions, d.id);
              return (
                <div className="domain-bar-row" key={d.id}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <strong>{d.title}</strong>
                  <div
                    className="domain-bar"
                    role="progressbar"
                    aria-label={`${d.title} question coverage`}
                    aria-valuemin={0}
                    aria-valuemax={m.total}
                    aria-valuenow={m.seen}
                    aria-valuetext={`${m.seen} of ${m.total} questions explored`}
                  >
                    <span
                      style={{
                        width: `${m.total ? (m.seen / m.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <em>
                    {m.seen}/{m.total}
                  </em>
                  <small>{m.accuracy === null ? "—" : `${m.accuracy}%`}</small>
                </div>
              );
            })}
          </div>
        </section>
        <aside className="insight-side">
          <div className="panel friction-panel">
            <Eyebrow>RECURRING FRICTION</Eyebrow>
            <h3>{topFriction ? topFriction[0] : "No current miss pattern."}</h3>
            <p>
              {topFriction
                ? `${topFriction[1]} currently missed item${topFriction[1] === 1 ? "" : "s"} touch this concept. Revisit the underlying rule, then try a fresh variant.`
                : "Mistakes you have not yet corrected will surface here by concept."}
            </p>
          </div>
          <div className="panel calibration-panel">
            <Eyebrow>CONFIDENCE CALIBRATION</Eyebrow>
            <h3>Was your certainty earned?</h3>
            <div>
              <span>
                <strong>{wrongSure}</strong> confident misses
              </span>
              <span>
                <strong>{guessedRight}</strong> lucky guesses
              </span>
            </div>
            <p>Both deserve review. A correct guess is still a fragile rule.</p>
          </div>
          <div className="panel next-panel">
            <Eyebrow>NEXT BEST ACTION</Eyebrow>
            <h3>
              {due.length
                ? `${due.length} review${due.length === 1 ? "" : "s"} are due.`
                : seen
                  ? "Expand your coverage."
                  : "Get a baseline."}
            </h3>
            <p>
              {due.length
                ? "Resolve what slipped before adding more new items."
                : "A short circuit supplies evidence for your next move."}
            </p>
            <button
              className="text-action"
              onClick={due.length ? () => navigate("review") : startDaily}
            >
              {due.length ? "Open review queue" : dailyActionLabel}{" "}
              <ArrowUpRight size={16} />
            </button>
          </div>
        </aside>
      </div>
      <section className="panel subobjective-evidence">
        <div className="section-header">
          <div>
            <Eyebrow>31 ATOMIC OBJECTIVES</Eyebrow>
            <h2>Broad domains cannot hide a gap.</h2>
          </div>
          <span>UNATTEMPTED ITEMS STAY VISIBLE</span>
        </div>
        <div className="subobjective-grid">
          {EXAM_OBJECTIVES.map((objective) => {
            const metric = objectiveMetrics(progress, questions, objective.id);
            return (
              <div key={objective.id}>
                <span>{shortDomain(objective.domain)}</span>
                <strong>{objective.title}</strong>
                <small>
                  {metric.seen}/{metric.total} explored ·{" "}
                  {metric.accuracy === null ? "—" : `${metric.accuracy}%`}
                </small>
              </div>
            );
          })}
        </div>
      </section>
      <div className="insight-method">
        <ShieldCheck size={18} />
        <p>
          Intervals and charts reflect practice in this browser only. No
          account, app usage analytics, score prediction, or cloud sync.
        </p>
      </div>
    </div>
  );
}

function Sources({
  progress,
  setProgress,
  onReset,
}: {
  progress: Progress;
  setProgress: React.Dispatch<React.SetStateAction<Progress>>;
  onReset: () => void;
}) {
  const [confirmErase, setConfirmErase] = useState(false);
  function exportProgress() {
    let mutationLab: unknown = null;
    try {
      const saved = window.localStorage.getItem("forge-java25-mutation-lab-v1");
      if (saved) mutationLab = JSON.parse(saved);
    } catch {
      // The progress archive remains usable if the lab storage is unavailable.
    }
    const payload = JSON.stringify(
      {
        format: "forge-java25-progress",
        version: 3,
        exportedAt: new Date().toISOString(),
        progress,
        mutationLab,
      },
      null,
      2,
    );
    const url = URL.createObjectURL(
      new Blob([payload], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `forge-java25-progress-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="page">
      <PageHeading
        eyebrow="PROVENANCE / KEEP THE TARGET HONEST"
        title="Exam & sources."
        subtitle="The boundary between published exam facts, author-reported format, and this studio’s own training choices."
      />
      <div className="source-layout">
        <div>
          <section className="source-card source-feature">
            <Eyebrow>THE CERTIFICATION</Eyebrow>
            <h2>Java SE 25 Developer Professional</h2>
            <div className="source-exam-code">1Z0–831</div>
            <p>
              Oracle lists the certification and links to the current exam page.
              Always check the live listing before booking; exam details can
              change.
            </p>
            <a href={EXAM_URL} target="_blank" rel="noreferrer">
              Open Oracle exam page <ArrowUpRight size={17} />
            </a>
          </section>
          <section className="source-card">
            <Eyebrow>THE REPORTED FORMAT</Eyebrow>
            <div className="source-facts">
              <div>
                <strong>50</strong>
                <span>questions</span>
              </div>
              <div>
                <strong>120</strong>
                <span>minutes</span>
              </div>
              <div>
                <strong>68%</strong>
                <span>passing score</span>
              </div>
            </div>
            <p>
              These figures are reported by OCP study-guide authors Scott
              Selikoff and Jeanne Boyarsky. We could not independently extract
              the current Oracle MyLearn metadata. The app does not assume an
              unpublished objective weighting or guarantee a raw-score
              conversion.
            </p>
            <a href={FORMAT_URL} target="_blank" rel="noreferrer">
              Author-reported exam details <ArrowUpRight size={16} />
            </a>
          </section>
          <section className="source-card">
            <Eyebrow>THIS STUDIO’S DESIGN</Eyebrow>
            <ul className="source-design-list">
              <li>
                <Check size={17} /> {questions.length} adaptive-practice items
                plus {mockQuestions.length} mock-only items, each source-linked.
              </li>
              <li>
                <Check size={17} /> 20- and 50-item timed benchmarks at the
                reported 2:24 pace per question.
              </li>
              <li>
                <Check size={17} /> Free navigation, unanswered items, flags,
                answer editing, and a final submission review.
              </li>
              <li>
                <Check size={17} /> Immediate feedback in practice; delayed
                feedback in the benchmark.
              </li>
              <li>
                <Check size={17} /> Local review scheduling based on correctness
                and confidence.
              </li>
              <li>
                <Check size={17} /> Ten one-change counterfactuals verified with
                a Java 25 compiler.
              </li>
              <li>
                <Check size={17} /> Thirteen high-risk language and API
                witnesses compiled and executed by the test suite on JDK 25 or
                later.
              </li>
            </ul>
            <p>
              Practice questions are educational approximations, not official
              Oracle items. Three full forms are isolated from daily practice;
              retakes are labeled separately from first-attempt evidence. The
              short drill still uses the teaching bank. The exact live single/
              multiple-response mix has not been confirmed here.
            </p>
          </section>
        </div>
        <div>
          <section className="source-card">
            <Eyebrow>THE OBJECTIVES</Eyebrow>
            <h3>Ten areas, 31 atomic checks, no invented weights.</h3>
            <p>
              The abbreviated study labels in the atlas map to the published
              1Z0–831 outline as reproduced by Enthuware. Thirty-one atomic
              objectives prevent a broad domain count from hiding an uncovered
              API or language rule. Individual rules use Oracle’s Java 25
              documentation.
            </p>
            <a href={OBJECTIVES_URL} target="_blank" rel="noreferrer">
              Read reproduced objectives <ArrowUpRight size={16} />
            </a>
            <div className="source-domain-list">
              {CURRICULUM_DOMAINS.map((d, i) => (
                <div key={d.id}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {d.title}
                </div>
              ))}
            </div>
          </section>
          <section className="source-card">
            <Eyebrow>THE LANGUAGE BOUNDARY</Eyebrow>
            <h3>Java 25 feature status matters.</h3>
            <p>
              Oracle’s language changes table marks module import declarations,
              compact source files with instance main methods, and flexible
              constructor bodies permanent in Java 25. Primitive types in
              patterns remain preview.
            </p>
            <a href={JAVA_URL} target="_blank" rel="noreferrer">
              Oracle Java 25 language summary <ArrowUpRight size={16} />
            </a>
          </section>
          <section className="source-card settings-card">
            <Eyebrow>YOUR STUDY SETTINGS</Eyebrow>
            <label htmlFor="exam-date">Exam date, if scheduled</label>
            <input
              id="exam-date"
              type="date"
              value={progress.examDate}
              onChange={(e) =>
                setProgress((p) => ({ ...p, examDate: e.target.value }))
              }
            />
            <small>Stored only in this browser.</small>
            <button className="settings-export" onClick={exportProgress}>
              <Download size={15} /> Download study data
            </button>
            {confirmErase ? (
              <div
                className="settings-confirm"
                role="group"
                aria-label="Confirm data erase"
              >
                <p>
                  Erase attempts, notes, bookmarks, settings, and Mutation Lab
                  answers from this browser?
                </p>
                <div>
                  <button
                    onClick={() => {
                      onReset();
                      setConfirmErase(false);
                    }}
                  >
                    Erase data
                  </button>
                  <button onClick={() => setConfirmErase(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <button
                className="settings-reset"
                onClick={() => setConfirmErase(true)}
              >
                Erase local study data
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
