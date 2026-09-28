import type { Question } from "../data/questions";
import {
  objectiveIdsForQuestion,
  type ExamObjectiveId,
} from "../data/objectives";
import { questionPattern } from "./questionPatterns";

export type Confidence = "guess" | "unsure" | "sure";
export type Attempt = {
  questionId: string;
  selected: string[];
  correct: boolean;
  confidence: Confidence;
  skipped?: boolean;
  at: number;
  elapsedMs: number;
  mode: "practice" | "benchmark";
};

export type BenchmarkResult = {
  id?: string;
  at: number;
  total: number;
  correct: number;
  durationMs: number;
  formId?: string;
  firstAttempt?: boolean;
  unanswered?: number;
  flagged?: number;
  questionIds?: string[];
  domains?: Array<{
    domain: string;
    total: number;
    correct: number;
    elapsedMs: number;
  }>;
};

export type Progress = {
  attempts: Attempt[];
  bookmarks: string[];
  notes: Record<string, string>;
  examDate: string;
  dailyMinutes: number;
  benchmarks: BenchmarkResult[];
};

export const EMPTY_PROGRESS: Progress = {
  attempts: [],
  bookmarks: [],
  notes: {},
  examDate: "",
  dailyMinutes: 25,
  benchmarks: [],
};

const STORAGE_KEY = "forge-java25-progress-v1";

/** Enforce one first attempt per form, including progress saved by older builds. */
export function normalizeBenchmarkResults(
  results: BenchmarkResult[],
): BenchmarkResult[] {
  const firstIndex = new Map<string, number>();
  results.forEach((result, index) => {
    if (!result.formId) return;
    const current = firstIndex.get(result.formId);
    if (current === undefined || result.at < results[current].at)
      firstIndex.set(result.formId, index);
  });
  return results.map((result, index) =>
    result.formId
      ? { ...result, firstAttempt: firstIndex.get(result.formId) === index }
      : result,
  );
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_PROGRESS;
    const saved = JSON.parse(raw) as Partial<Progress>;
    return {
      attempts: Array.isArray(saved.attempts) ? saved.attempts : [],
      bookmarks: Array.isArray(saved.bookmarks) ? saved.bookmarks : [],
      notes: saved.notes && typeof saved.notes === "object" ? saved.notes : {},
      examDate: typeof saved.examDate === "string" ? saved.examDate : "",
      dailyMinutes:
        typeof saved.dailyMinutes === "number" ? saved.dailyMinutes : 25,
      benchmarks: Array.isArray(saved.benchmarks)
        ? normalizeBenchmarkResults(saved.benchmarks)
        : [],
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}

export function saveProgress(progress: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    /* private browsing */
  }
}

export function isCorrect(question: Question, selected: string[]) {
  return (
    selected.length === question.answer.length &&
    selected.every((id) => question.answer.includes(id))
  );
}

/** Every timed item counts, including an item left blank when the clock expires. */
export function benchmarkAttempts(
  ids: string[],
  answers: Record<
    string,
    Pick<Attempt, "selected" | "confidence" | "elapsedMs">
  >,
  questions: Question[],
  at: number,
): Attempt[] {
  return ids.flatMap((id) => {
    const question = questions.find((item) => item.id === id);
    if (!question) return [];
    const answer = answers[id];
    return [
      {
        questionId: id,
        selected: answer?.selected ?? [],
        correct: answer ? isCorrect(question, answer.selected) : false,
        confidence: answer?.confidence ?? "guess",
        at,
        elapsedMs: answer?.elapsedMs ?? 0,
        mode: "benchmark" as const,
      },
    ];
  });
}

export function latestAttempt(progress: Progress, questionId: string) {
  return [...progress.attempts]
    .reverse()
    .find((a) => a.questionId === questionId);
}

export function dueAt(progress: Progress, questionId: string): number | null {
  const attempts = progress.attempts.filter((a) => a.questionId === questionId);
  if (!attempts.length) return null;
  const last = attempts[attempts.length - 1];
  if (!last.correct) return last.at;
  const streak = [...attempts].reverse().findIndex((a) => !a.correct);
  const consecutive = streak === -1 ? attempts.length : streak;
  const base =
    last.confidence === "sure" ? 4 : last.confidence === "unsure" ? 2 : 1;
  const days = Math.min(30, base * Math.pow(2, Math.max(0, consecutive - 1)));
  return last.at + days * 86400000;
}

export function dueQuestions(
  progress: Progress,
  questions: Question[],
  now = Date.now(),
) {
  return questions.filter((q) => {
    const due = dueAt(progress, q.id);
    return due !== null && due <= now;
  });
}

export function domainMetrics(
  progress: Progress,
  questions: Question[],
  domainId: string,
) {
  const inDomain = questions.filter((q) => q.domain === domainId);
  const latest = inDomain
    .map((q) => latestAttempt(progress, q.id))
    .filter((a): a is Attempt => Boolean(a));
  const correct = latest.filter((a) => a.correct).length;
  const secure = latest.filter(
    (a) => a.correct && a.confidence === "sure",
  ).length;
  return {
    total: inDomain.length,
    seen: latest.length,
    correct,
    secure,
    accuracy: latest.length
      ? Math.round((correct / latest.length) * 100)
      : null,
  };
}

export function objectiveMetrics(
  progress: Progress,
  questions: Question[],
  objectiveId: ExamObjectiveId,
) {
  const inObjective = questions.filter((question) =>
    objectiveIdsForQuestion(question).includes(objectiveId),
  );
  const latest = inObjective
    .map((question) => latestAttempt(progress, question.id))
    .filter((attempt): attempt is Attempt => Boolean(attempt));
  const correct = latest.filter((attempt) => attempt.correct).length;
  return {
    total: inObjective.length,
    seen: latest.length,
    correct,
    accuracy: latest.length
      ? Math.round((correct / latest.length) * 100)
      : null,
  };
}

export function studyStreak(progress: Progress, now = new Date()) {
  const days = new Set(
    progress.attempts.map((a) => new Date(a.at).toLocaleDateString("en-CA")),
  );
  let cursor = new Date(now);
  if (!days.has(cursor.toLocaleDateString("en-CA")))
    cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (days.has(cursor.toLocaleDateString("en-CA"))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export function recommendedQuestions(
  progress: Progress,
  questions: Question[],
  count = 8,
  domain?: string,
) {
  const pool = domain
    ? questions.filter((q) => q.domain === domain)
    : questions;
  const seenIds = new Set(
    progress.attempts.map((attempt) => attempt.questionId),
  );
  const seenByDomain = new Map<string, number>();
  for (const question of pool) {
    if (seenIds.has(question.id)) {
      seenByDomain.set(
        question.domain,
        (seenByDomain.get(question.domain) ?? 0) + 1,
      );
    }
  }
  const due = dueQuestions(progress, pool).sort(
    (a, b) => (dueAt(progress, a.id) ?? 0) - (dueAt(progress, b.id) ?? 0),
  );
  const unseen = pool.filter((q) => !seenIds.has(q.id));
  const weak = pool.filter((q) => {
    const last = latestAttempt(progress, q.id);
    return (
      last && (!last.correct || last.confidence === "guess") && !due.includes(q)
    );
  });
  const selected: Question[] = [];
  const selectedIds = new Set<string>();
  const selectedByDomain = new Map<string, number>();
  const selectedByPattern = new Map<string, number>();

  // Respect the review priority while spreading each circuit across domains
  // and reasoning patterns. Ties preserve authored question order.
  for (const tier of [due, unseen, weak, pool]) {
    while (selected.length < count) {
      const candidates = tier.filter((q) => !selectedIds.has(q.id));
      if (!candidates.length) break;
      const patternKey = (q: Question) =>
        q.type === "multiple" ? "select" : questionPattern(q);
      candidates.sort((a, b) => {
        const aDomain =
          (seenByDomain.get(a.domain) ?? 0) +
          (selectedByDomain.get(a.domain) ?? 0);
        const bDomain =
          (seenByDomain.get(b.domain) ?? 0) +
          (selectedByDomain.get(b.domain) ?? 0);
        return (
          aDomain - bDomain ||
          (selectedByPattern.get(patternKey(a)) ?? 0) -
            (selectedByPattern.get(patternKey(b)) ?? 0)
        );
      });
      const next = candidates[0];
      selected.push(next);
      selectedIds.add(next.id);
      selectedByDomain.set(
        next.domain,
        (selectedByDomain.get(next.domain) ?? 0) + 1,
      );
      const pattern = patternKey(next);
      selectedByPattern.set(pattern, (selectedByPattern.get(pattern) ?? 0) + 1);
    }
    if (selected.length >= count) break;
  }
  return selected;
}
