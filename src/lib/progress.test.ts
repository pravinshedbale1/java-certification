import { describe, expect, it } from "vitest";
import { questions } from "../data/questions";
import {
  benchmarkAttempts,
  dueAt,
  dueQuestions,
  domainMetrics,
  isCorrect,
  normalizeBenchmarkResults,
  objectiveMetrics,
  recommendedQuestions,
  type Attempt,
  type Progress,
} from "./progress";

const q = questions[0];
const base: Progress = {
  attempts: [],
  bookmarks: [],
  notes: {},
  examDate: "",
  dailyMinutes: 25,
  benchmarks: [],
};
const DAY = 86400000;
const at = 1_700_000_000_000;
const attempt = (patch: Partial<Attempt> = {}): Attempt => ({
  questionId: q.id,
  selected: q.answer,
  correct: true,
  confidence: "sure",
  at,
  elapsedMs: 1000,
  mode: "practice",
  ...patch,
});

describe("answer and review logic", () => {
  it("requires an exact answer set for single and multiple response items", () => {
    const multi = questions.find((item) => item.type === "multiple")!;
    expect(isCorrect(q, q.answer)).toBe(true);
    expect(isCorrect(multi, [...multi.answer].reverse())).toBe(true);
    expect(isCorrect(multi, multi.answer.slice(0, 1))).toBe(false);
    expect(isCorrect(multi, [...multi.answer, "not-an-option"])).toBe(false);
  });

  it("returns a missed item immediately and schedules confident recall later", () => {
    const missed = { ...base, attempts: [attempt({ correct: false })] };
    expect(dueAt(missed, q.id)).toBe(at);
    expect(dueQuestions(missed, [q], at)).toEqual([q]);
    const secure = { ...base, attempts: [attempt()] };
    expect(dueAt(secure, q.id)).toBe(at + 4 * DAY);
    expect(dueQuestions(secure, [q], at + 2 * DAY)).toEqual([]);
    expect(dueQuestions(secure, [q], at + 4 * DAY)).toEqual([q]);
  });

  it("uses confidence and consecutive correct answers to widen the interval", () => {
    const uncertain = { ...base, attempts: [attempt({ confidence: "guess" })] };
    expect(dueAt(uncertain, q.id)).toBe(at + DAY);
    const twice = { ...base, attempts: [attempt(), attempt({ at: at + DAY })] };
    expect(dueAt(twice, q.id)).toBe(at + DAY + 8 * DAY);
  });

  it("measures domain accuracy from each latest answer and prioritizes due work", () => {
    const another = questions.find(
      (item) => item.domain === q.domain && item.id !== q.id,
    )!;
    const progress = {
      ...base,
      attempts: [attempt(), attempt({ correct: false, at: at + DAY })],
    };
    expect(domainMetrics(progress, [q, another], q.domain)).toMatchObject({
      seen: 1,
      correct: 0,
      accuracy: 0,
    });
    expect(recommendedQuestions(progress, [another, q], 2)[0].id).toBe(q.id);
  });

  it("spreads a new circuit across domains and reasoning patterns", () => {
    const domains = ["values", "flow", "oop", "exceptions"] as const;
    const pool = domains.flatMap((domain, index) => [
      { ...q, id: `trace-${index}`, domain, pattern: "trace" as const },
      { ...q, id: `api-${index}`, domain, pattern: "api" as const },
    ]);
    const circuit = recommendedQuestions(base, pool, 4);
    expect(new Set(circuit.map((item) => item.domain)).size).toBe(4);
    expect(new Set(circuit.map((item) => item.pattern)).size).toBeGreaterThan(
      1,
    );
  });

  it("records a timed blank as an immediate review item", () => {
    const second = questions.find((item) => item.id !== q.id)!;
    const saved = benchmarkAttempts(
      [q.id, second.id],
      {
        [q.id]: {
          selected: q.answer,
          confidence: "sure",
          elapsedMs: 4000,
        },
      },
      [q, second],
      at,
    );
    expect(saved).toHaveLength(2);
    expect(saved[0].correct).toBe(true);
    expect(saved[1]).toMatchObject({
      questionId: second.id,
      selected: [],
      correct: false,
      mode: "benchmark",
    });
    expect(dueQuestions({ ...base, attempts: saved }, [q, second], at)).toEqual(
      [second],
    );
  });

  it("reports atomic-objective coverage independently of broad domains", () => {
    const metric = objectiveMetrics(
      { ...base, attempts: [attempt()] },
      [q],
      "val-primitives",
    );
    expect(metric).toMatchObject({
      total: 1,
      seen: 1,
      correct: 1,
      accuracy: 100,
    });
    expect(objectiveMetrics(base, [q], "oop-enums")).toMatchObject({
      total: 0,
      seen: 0,
      accuracy: null,
    });
  });

  it("migrates legacy mock history to exactly one chronological first attempt", () => {
    const normalized = normalizeBenchmarkResults([
      { at: 300, total: 50, correct: 40, durationMs: 1, formId: "A" },
      {
        at: 100,
        total: 50,
        correct: 35,
        durationMs: 1,
        formId: "A",
        firstAttempt: false,
      },
      { at: 200, total: 50, correct: 38, durationMs: 1, formId: "B" },
      { at: 50, total: 20, correct: 15, durationMs: 1 },
    ]);
    expect(normalized.map((result) => result.firstAttempt)).toEqual([
      false,
      true,
      true,
      undefined,
    ]);
  });
});
