import { describe, expect, it } from "vitest";
import { questions } from "../data/questions";
import { extraQuestions } from "../data/questions-extra";
import { orderedOptions } from "./questionOrder";

describe("session answer order", () => {
  it("keeps every option exactly once, is stable across reloads, and varies between sessions", () => {
    const question = questions[0];
    const initialIds = question.options.map((option) => option.id);
    const originalIds = [...initialIds].sort();
    const orders = new Set<string>();
    for (let seed = 0; seed < 16; seed++) {
      const ids = orderedOptions(question, seed).map((option) => option.id);
      expect([...ids].sort()).toEqual(originalIds);
      expect(orderedOptions(question, seed).map((option) => option.id)).toEqual(
        ids,
      );
      orders.add(ids.join(""));
    }
    expect(orders.size).toBeGreaterThan(1);
    expect(question.options.map((option) => option.id)).toEqual(initialIds);
  });

  it("moves the correct choice between letter positions across sessions", () => {
    for (const question of [...questions, ...extraQuestions]) {
      const positions = new Set(
        Array.from({ length: 16 }, (_, seed) =>
          orderedOptions(question, seed)
            .map((option, index) =>
              question.answer.includes(option.id) ? index : -1,
            )
            .filter((index) => index >= 0)
            .join(","),
        ),
      );
      expect(positions.size).toBeGreaterThan(1);
    }
  });
});
