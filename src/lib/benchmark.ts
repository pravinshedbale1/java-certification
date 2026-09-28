import type { Question } from "../data/questions";
import { latestAttempt, type Progress } from "./progress";
import { questionPattern } from "./questionPatterns";

export const BENCHMARK_MS_PER_ITEM = 144_000;

export function benchmarkDeadline(startedAt: number, itemCount: number) {
  return startedAt + itemCount * BENCHMARK_MS_PER_ITEM;
}

/** Ignore background-tab overrun while retaining the full allotted exam time. */
export function clampBenchmarkTime(
  startedAt: number,
  itemCount: number,
  now: number,
) {
  return Math.max(
    startedAt,
    Math.min(now, benchmarkDeadline(startedAt, itemCount)),
  );
}

function hashSeed(seed: number | string) {
  let value = 2166136261;
  for (const char of String(seed)) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

/** Stable Fisher-Yates shuffle so a saved session never changes order. */
export function shuffleQuestions(
  questions: Question[],
  seed: number | string,
): Question[] {
  const shuffled = [...questions];
  let state = hashSeed(seed) || 1;
  const random = () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  for (let index = shuffled.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }
  return shuffled;
}

/** Prefer fresh items, then the least recently answered, within every domain. */
export function benchmarkQuestions(
  progress: Progress,
  questions: Question[],
  itemsPerDomain: number,
  seed: number | string = Date.now(),
): Question[] {
  const domains = [...new Set(questions.map((question) => question.domain))];
  const balanced = domains.flatMap((domain) => {
    const pool = questions.filter((question) => question.domain === domain);
    const fresh = pool.filter(
      (question) => !latestAttempt(progress, question.id),
    );
    const repeated = pool
      .filter((question) => latestAttempt(progress, question.id))
      .sort(
        (a, b) =>
          (latestAttempt(progress, a.id)?.at ?? 0) -
          (latestAttempt(progress, b.id)?.at ?? 0),
      );
    const chosen: Question[] = [];
    const patternCounts = new Map<string, number>();
    for (const tier of [fresh, repeated]) {
      while (chosen.length < itemsPerDomain && tier.length) {
        const patternKey = (question: Question) =>
          question.type === "multiple" ? "select" : questionPattern(question);
        tier.sort(
          (a, b) =>
            (patternCounts.get(patternKey(a)) ?? 0) -
            (patternCounts.get(patternKey(b)) ?? 0),
        );
        const next = tier.shift()!;
        chosen.push(next);
        const key = patternKey(next);
        patternCounts.set(key, (patternCounts.get(key) ?? 0) + 1);
      }
    }
    return chosen;
  });
  return shuffleQuestions(balanced, seed);
}
