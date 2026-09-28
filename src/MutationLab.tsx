import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  FlaskConical,
  RotateCcw,
  X,
} from "lucide-react";
import { mutations, type MutationChallenge } from "./data/mutations";
import { CURRICULUM_DOMAINS } from "./data/curriculum";
import { highlightJavaLines } from "./JavaSyntax";
import "./mutation.css";

type LabState = {
  index: number;
  answers: Record<string, string>;
  selected: string | null;
  report: boolean;
};

const STORAGE_KEY = "forge-java25-mutation-lab-v1";
const DOMAIN_NAMES = Object.fromEntries(
  CURRICULUM_DOMAINS.map((domain) => [domain.id, domain.title]),
) as Record<MutationChallenge["domain"], string>;

function initialState(): LabState {
  const fresh: LabState = {
    index: 0,
    answers: {},
    selected: null,
    report: false,
  };
  if (typeof window === "undefined") return fresh;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh;
    const saved = JSON.parse(raw) as Partial<LabState>;
    const answers: Record<string, string> = {};
    if (saved.answers && typeof saved.answers === "object") {
      for (const challenge of mutations) {
        const value = saved.answers[challenge.id];
        if (challenge.options.some((option) => option.id === value))
          answers[challenge.id] = value;
      }
    }
    const index =
      typeof saved.index === "number" && Number.isInteger(saved.index)
        ? Math.max(0, Math.min(mutations.length - 1, saved.index))
        : 0;
    return {
      index,
      answers,
      selected: answers[mutations[index].id] ?? null,
      report: saved.report === true,
    };
  } catch {
    return fresh;
  }
}

function CodePane({
  label,
  code,
  changedLines,
  variant,
}: {
  label: string;
  code: string;
  changedLines: Set<number>;
  variant: "before" | "after";
}) {
  const highlightedCode = useMemo(() => highlightJavaLines(code), [code]);
  return (
    <div className={`mut-code-pane mut-code-${variant}`}>
      <div className="mut-code-header">
        <span className="mut-code-window-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>{label}</span>
        <span className="mut-code-file">Demo.java</span>
      </div>
      <pre tabIndex={0} aria-label={`${label} Java code`}>
        {highlightedCode.map((line, index) => (
          <span
            className={`mut-code-row${changedLines.has(index) ? " mut-code-changed" : ""}`}
            key={index}
          >
            <span className="mut-line-number" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="mut-line-marker" aria-hidden="true">
              {changedLines.has(index)
                ? variant === "before"
                  ? "−"
                  : "+"
                : " "}
            </span>
            <code>{line.length ? line : " "}</code>
          </span>
        ))}
      </pre>
    </div>
  );
}

export default function MutationLab({ onBack }: { onBack: () => void }) {
  const [lab, setLab] = useState<LabState>(initialState);
  const challenge = mutations[lab.index];
  const locked = lab.answers[challenge.id] !== undefined;
  const correct = locked && lab.answers[challenge.id] === challenge.answer;
  const answeredCount = mutations.filter(
    (item) => lab.answers[item.id] !== undefined,
  ).length;
  const correctCount = mutations.filter(
    (item) => lab.answers[item.id] === item.answer,
  ).length;

  const changedLines = useMemo(() => {
    const before = challenge.beforeCode.split("\n");
    const after = challenge.afterCode.split("\n");
    return new Set(
      Array.from(
        { length: Math.max(before.length, after.length) },
        (_, index) => index,
      ).filter((index) => before[index] !== after[index]),
    );
  }, [challenge]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lab));
    } catch {
      // The lab remains usable when browser storage is disabled.
    }
  }, [lab]);

  function goTo(index: number) {
    setLab((current) => ({
      ...current,
      index,
      selected: current.answers[mutations[index].id] ?? null,
      report: false,
    }));
  }

  function checkAnswer() {
    if (!lab.selected || locked) return;
    setLab((current) => ({
      ...current,
      answers: { ...current.answers, [challenge.id]: current.selected! },
    }));
  }

  function advance() {
    if (lab.index === mutations.length - 1) {
      setLab((current) => ({ ...current, report: true }));
    } else {
      goTo(lab.index + 1);
    }
  }

  function restart() {
    setLab({ index: 0, answers: {}, selected: null, report: false });
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (lab.report) return;
      if (
        event.target instanceof HTMLElement &&
        event.target.closest("button, a, input, textarea, select")
      )
        return;
      const number = Number(event.key);
      if (
        !locked &&
        number >= 1 &&
        number <= challenge.options.length &&
        Number.isInteger(number)
      ) {
        setLab((current) => ({
          ...current,
          selected: challenge.options[number - 1].id,
        }));
      }
      if (event.key === "Enter") {
        event.preventDefault();
        if (locked) advance();
        else checkAnswer();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [challenge, lab.selected, lab.index, lab.report, locked]);

  return (
    <div className="mutation-lab">
      <div className="mut-topline">
        <button className="mut-back" type="button" onClick={onBack}>
          <ArrowLeft size={15} /> Command center
        </button>
        <span>
          EXPERIMENT SERIES <span className="mut-topline-slash">/</span> JAVA SE
          25
        </span>
      </div>

      <header className="mut-hero">
        <div className="mut-hero-copy">
          <div className="mut-hero-eyebrow">
            <FlaskConical size={15} /> THE MUTATION LAB <span>01—10</span>
          </div>
          <h1>
            One edit.
            <br />
            <em>Different program.</em>
          </h1>
          <p>
            Hold the original behavior in mind. Change one line. Predict what
            the Java 25 compiler or runtime does next.
          </p>
        </div>
        <div
          className="mut-hero-meter"
          aria-label={`${answeredCount} of ${mutations.length} experiments checked`}
        >
          <div className="mut-meter-crosshair" aria-hidden="true">
            +
          </div>
          <span className="mut-meter-label">EXPERIMENTS CHECKED</span>
          <strong>
            {String(answeredCount).padStart(2, "0")}
            <span>/{mutations.length}</span>
          </strong>
          <div className="mut-meter-track">
            <span
              style={{ width: `${(answeredCount / mutations.length) * 100}%` }}
            />
          </div>
          <small>
            {correctCount} precise prediction{correctCount === 1 ? "" : "s"}
          </small>
        </div>
      </header>

      <nav className="mut-index" aria-label="Mutation experiments">
        {mutations.map((item, index) => {
          const response = lab.answers[item.id];
          const status =
            response === undefined
              ? "untried"
              : response === item.answer
                ? "right"
                : "wrong";
          const statusLabel =
            status === "right"
              ? "Correct"
              : status === "wrong"
                ? "Review rule"
                : "Not attempted";
          return (
            <button
              type="button"
              key={item.id}
              className={`mut-index-item${!lab.report && lab.index === index ? " active" : ""} ${status}`}
              aria-current={
                !lab.report && lab.index === index ? "step" : undefined
              }
              onClick={() => goTo(index)}
              aria-label={`Experiment ${index + 1}: ${DOMAIN_NAMES[item.domain]}. ${statusLabel}`}
              title={`${String(index + 1).padStart(2, "0")} · ${DOMAIN_NAMES[item.domain]} · ${statusLabel}`}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <i aria-hidden="true" />
            </button>
          );
        })}
      </nav>

      {lab.report ? (
        <section className="mut-report" aria-labelledby="mut-report-title">
          <div className="mut-report-heading">
            <span className="mut-kicker">FIELD REPORT / 10 EXPERIMENTS</span>
            <h2 id="mut-report-title">The smallest edits changed the rules.</h2>
            <p>
              {answeredCount === mutations.length
                ? "Every mutation has been tested. Reopen any experiment to inspect the rule and its source."
                : `${mutations.length - answeredCount} experiment${mutations.length - answeredCount === 1 ? "" : "s"} remain open. Continue where you left off or inspect a completed prediction.`}
            </p>
          </div>
          <div className="mut-report-score">
            <span>PRECISE PREDICTIONS</span>
            <strong>
              {correctCount}
              <em>/{answeredCount || 0}</em>
            </strong>
            <small>Based on checked experiments</small>
          </div>
          <div className="mut-report-list">
            {mutations.map((item, index) => {
              const response = lab.answers[item.id];
              const status =
                response === undefined
                  ? "Untried"
                  : response === item.answer
                    ? "Correct"
                    : "Review";
              return (
                <button type="button" key={item.id} onClick={() => goTo(index)}>
                  <span className="mut-report-num">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mut-report-item-copy">
                    <small>{DOMAIN_NAMES[item.domain]}</small>
                    <strong>{item.title}</strong>
                  </span>
                  <span className={`mut-report-status ${status.toLowerCase()}`}>
                    {status}
                  </span>
                  <ChevronRight size={17} aria-hidden="true" />
                </button>
              );
            })}
          </div>
          <div className="mut-report-actions">
            <button
              className="mut-primary"
              type="button"
              onClick={() =>
                goTo(
                  mutations.findIndex(
                    (item) => lab.answers[item.id] === undefined,
                  ) < 0
                    ? 0
                    : mutations.findIndex(
                        (item) => lab.answers[item.id] === undefined,
                      ),
                )
              }
            >
              {answeredCount === mutations.length
                ? "Review first experiment"
                : "Continue experiments"}{" "}
              <ArrowRight size={16} />
            </button>
            <button className="mut-secondary" type="button" onClick={restart}>
              <RotateCcw size={15} /> Start a fresh run
            </button>
          </div>
        </section>
      ) : (
        <section className="mut-board" aria-labelledby="mut-title">
          <div className="mut-board-heading">
            <div>
              <span className="mut-kicker">
                EXPERIMENT {String(lab.index + 1).padStart(2, "0")}{" "}
                <span>/</span> {String(mutations.length).padStart(2, "0")}{" "}
                <span className="mut-kicker-divider">·</span>{" "}
                {DOMAIN_NAMES[challenge.domain].toUpperCase()}
              </span>
              <h2 id="mut-title">{challenge.title}</h2>
            </div>
            <span
              className="mut-board-state"
              data-state={
                locked ? (correct ? "correct" : "incorrect") : "pending"
              }
            >
              {locked ? (
                correct ? (
                  <Check size={13} />
                ) : (
                  <X size={13} />
                )
              ) : (
                <span className="mut-state-dot" />
              )}
              {locked
                ? correct
                  ? "PREDICTED"
                  : "REVIEW RULE"
                : "AWAITING PREDICTION"}
            </span>
          </div>

          <div className="mut-change-note">
            <span>THE SINGLE CHANGE</span>
            <strong>{challenge.change}</strong>
          </div>

          <div className="mut-code-grid">
            <CodePane
              label="01 / BEFORE"
              code={challenge.beforeCode}
              changedLines={changedLines}
              variant="before"
            />
            <CodePane
              label="02 / AFTER"
              code={challenge.afterCode}
              changedLines={changedLines}
              variant="after"
            />
          </div>

          <div className="mut-question-block">
            <div className="mut-question-heading">
              <div>
                <span className="mut-kicker">PREDICT THE DELTA</span>
                <h3>{challenge.prompt}</h3>
              </div>
              <span className="mut-shortcut">KEYS 1–4 TO SELECT</span>
            </div>
            <div
              className="mut-options"
              role="group"
              aria-label="Choose one outcome"
            >
              {challenge.options.map((option, index) => {
                const isSelected = lab.selected === option.id;
                const isCorrect = locked && option.id === challenge.answer;
                const isWrong =
                  locked && isSelected && option.id !== challenge.answer;
                return (
                  <button
                    type="button"
                    key={option.id}
                    disabled={locked}
                    aria-pressed={isSelected}
                    className={`mut-option${isSelected ? " selected" : ""}${isCorrect ? " correct" : ""}${isWrong ? " wrong" : ""}`}
                    onClick={() =>
                      setLab((current) => ({ ...current, selected: option.id }))
                    }
                  >
                    <span className="mut-option-key">{option.id}</span>
                    <span>{option.text}</span>
                    <span className="mut-option-end" aria-hidden="true">
                      {isCorrect ? (
                        <Check size={17} />
                      ) : isWrong ? (
                        <X size={17} />
                      ) : (
                        String(index + 1).padStart(2, "0")
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {locked && (
            <div
              className={`mut-feedback${correct ? " is-correct" : " is-wrong"}`}
              role="status"
              aria-live="polite"
            >
              <div className="mut-feedback-icon">
                {correct ? <CheckCircle2 size={21} /> : <X size={21} />}
              </div>
              <div>
                <span className="mut-kicker">
                  {correct
                    ? "PRECISE PREDICTION"
                    : `THE CORRECT OUTCOME IS ${challenge.answer}`}
                </span>
                <h3>
                  {correct ? "You caught the change." : "Trace the rule again."}
                </h3>
                <p>{challenge.explanation}</p>
                <a
                  href={challenge.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read the Java 25 source <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          )}

          <footer className="mut-board-footer">
            <span>
              {locked
                ? "Source linked explanation unlocked."
                : "Select an outcome, then check your prediction."}
            </span>
            <div>
              {lab.index > 0 && (
                <button
                  className="mut-secondary"
                  type="button"
                  onClick={() => goTo(lab.index - 1)}
                >
                  <ArrowLeft size={15} /> Previous
                </button>
              )}
              {locked ? (
                <button className="mut-primary" type="button" onClick={advance}>
                  {lab.index === mutations.length - 1
                    ? "View field report"
                    : "Next mutation"}{" "}
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  className="mut-primary"
                  type="button"
                  disabled={!lab.selected}
                  onClick={checkAnswer}
                >
                  Check prediction <ArrowRight size={16} />
                </button>
              )}
            </div>
          </footer>
        </section>
      )}
    </div>
  );
}
