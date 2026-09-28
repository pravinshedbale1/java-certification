import { describe, expect, it } from "vitest";
import { questions } from "../data/questions";
import { DOMAIN_ORDER } from "../data/curriculum";
import {
  BENCHMARK_MS_PER_ITEM,
  benchmarkDeadline,
  benchmarkQuestions,
  clampBenchmarkTime,
  shuffleQuestions,
} from "./benchmark";
import { EMPTY_PROGRESS, type Attempt } from "./progress";

describe("timed benchmark selection", () => {
  it("uses fresh questions before repeating older responses", () => {
    const template = questions[0];
    const pool = DOMAIN_ORDER.slice(0, 2).flatMap((domain) =>
      Array.from({ length: 6 }, (_, index) => ({
        ...template,
        id: `${domain}-${index}`,
        domain,
        pattern: (index % 2 ? "api" : "trace") as "api" | "trace",
      })),
    );
    const first = benchmarkQuestions(EMPTY_PROGRESS, pool, 2, "first");
    const progress = {
      ...EMPTY_PROGRESS,
      attempts: first.map((question): Attempt => ({
        questionId: question.id,
        selected: question.answer,
        correct: true,
        confidence: "sure",
        at: Date.now(),
        elapsedMs: 1000,
        mode: "benchmark",
      })),
    };
    const second = benchmarkQuestions(progress, pool, 2, "second");
    expect(first).toHaveLength(4);
    expect(second).toHaveLength(4);
    expect(
      second.every((item) => !first.some((old) => old.id === item.id)),
    ).toBe(true);
    expect(new Set(first.map((item) => item.pattern)).size).toBe(2);
  });

  it("uses a stable whole-exam shuffle instead of domain blocks", () => {
    const template = questions[0];
    const pool = DOMAIN_ORDER.flatMap((domain) =>
      Array.from({ length: 5 }, (_, index) => ({
        ...template,
        id: `${domain}-${index}`,
        domain,
        pattern: (index % 2 ? "api" : "trace") as "api" | "trace",
      })),
    );
    const first = benchmarkQuestions(EMPTY_PROGRESS, pool, 5, "stable-form");
    const resumed = benchmarkQuestions(EMPTY_PROGRESS, pool, 5, "stable-form");
    expect(first.map((item) => item.id)).toEqual(
      resumed.map((item) => item.id),
    );
    expect(first.map((item) => item.domain)).not.toEqual(
      DOMAIN_ORDER.flatMap((domain) => Array(5).fill(domain)),
    );
    const transitions = first
      .slice(1)
      .filter((item, index) => item.domain !== first[index].domain).length;
    expect(transitions).toBeGreaterThan(25);
  });

  it("can shuffle a fixed mock form without changing its membership", () => {
    const source = questions.slice(0, 12);
    const shuffled = shuffleQuestions(source, "form-a");
    expect(shuffled.map((item) => item.id)).not.toEqual(
      source.map((item) => item.id),
    );
    expect(new Set(shuffled.map((item) => item.id))).toEqual(
      new Set(source.map((item) => item.id)),
    );
  });

  it("clamps a suspended benchmark to its deadline", () => {
    const startedAt = 1_000;
    const deadline = startedAt + 50 * BENCHMARK_MS_PER_ITEM;
    expect(benchmarkDeadline(startedAt, 50)).toBe(deadline);
    expect(clampBenchmarkTime(startedAt, 50, startedAt - 1)).toBe(startedAt);
    expect(clampBenchmarkTime(startedAt, 50, startedAt + 5_000)).toBe(
      startedAt + 5_000,
    );
    expect(clampBenchmarkTime(startedAt, 50, deadline + 86_400_000)).toBe(
      deadline,
    );
  });
});
