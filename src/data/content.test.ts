import { describe, expect, it } from "vitest";
import {
  CURRICULUM_DOMAINS,
  DOMAIN_ORDER,
  JAVA_25_FEATURES,
} from "./curriculum";
import { mutations } from "./mutations";
import { questions } from "./questions";
import { extraQuestions } from "./questions-extra";
import { expansionAQuestions } from "./questions-expansion-a";
import { expansionBQuestions } from "./questions-expansion-b";
import { expansionCQuestions } from "./questions-expansion-c";
import { coverageQuestions } from "./questions-coverage";
import { depthQuestions } from "./questions-depth";
import { EXAM_OBJECTIVES, objectiveIdsForQuestion } from "./objectives";
import { MOCK_FORMS, MOCK_QUESTIONS } from "./mock-forms";
import { benchmarkQuestions } from "../lib/benchmark";
import { EMPTY_PROGRESS } from "../lib/progress";

function expectJava25Source(source: string) {
  const url = new URL(source);
  expect(url.protocol).toBe("https:");
  expect(url.hostname).toBe("docs.oracle.com");
  expect(url.pathname.includes("/25/") || url.pathname.includes("/se25/")).toBe(
    true,
  );
}

describe("Java 25 learning content", () => {
  it("keeps coverage, answer keys, one-change exercises, and sources coherent", () => {
    const expansions = [
      ...expansionAQuestions,
      ...expansionBQuestions,
      ...expansionCQuestions,
    ];
    const practiceQuestions = [
      ...questions,
      ...extraQuestions,
      ...expansions,
      ...coverageQuestions,
      ...depthQuestions,
    ];
    const allQuestions = [...practiceQuestions, ...MOCK_QUESTIONS];
    const domainIds = [...DOMAIN_ORDER];
    const allIds = [
      ...allQuestions.map((item) => item.id),
      ...mutations.map((item) => item.id),
    ];

    expect(CURRICULUM_DOMAINS.map((domain) => domain.id)).toEqual(domainIds);
    expect(new Set(allIds).size).toBe(allIds.length);
    expect(practiceQuestions).toHaveLength(domainIds.length * 25);
    expect(coverageQuestions).toHaveLength(domainIds.length * 5);
    expect(depthQuestions).toHaveLength(domainIds.length * 5);
    expect(MOCK_FORMS).toHaveLength(3);
    expect(MOCK_QUESTIONS).toHaveLength(150);
    expect(allQuestions).toHaveLength(400);
    expect(EXAM_OBJECTIVES).toHaveLength(31);
    expect(expansions).toHaveLength(100);
    expect(mutations).toHaveLength(domainIds.length);

    for (const domainId of domainIds) {
      expect(
        practiceQuestions.filter((item) => item.domain === domainId),
      ).toHaveLength(25);
      expect(
        coverageQuestions.filter((item) => item.domain === domainId),
      ).toHaveLength(5);
      expect(
        depthQuestions.filter((item) => item.domain === domainId),
      ).toHaveLength(5);
      expect(
        expansions.filter(
          (item) => item.domain === domainId && item.type === "multiple",
        ).length,
      ).toBeGreaterThanOrEqual(3);
      expect(mutations.filter((item) => item.domain === domainId)).toHaveLength(
        1,
      );
    }

    for (const form of MOCK_FORMS) {
      expect(form.questions).toHaveLength(50);
      expect(new Set(form.questions.map((item) => item.id)).size).toBe(50);
      expect(
        form.questions.filter((item) => item.type === "multiple").length,
      ).toBe(12);
      for (const domainId of domainIds) {
        expect(
          form.questions.filter((item) => item.domain === domainId),
        ).toHaveLength(5);
      }
      expect(
        form.questions.filter((item) => item.code?.trim()).length,
      ).toBeGreaterThanOrEqual(35);
      for (const question of form.questions) {
        expect(question.pattern).toBeDefined();
        expect(question.explanation.trim().length).toBeGreaterThan(35);
        expect(
          question.options.every(
            (option) => option.explanation.trim().length > 15,
          ),
        ).toBe(true);
      }
    }

    expect(
      new Set(allQuestions.map((item) => `${item.prompt}\n${item.code ?? ""}`))
        .size,
    ).toBe(allQuestions.length);
    const mockCode = MOCK_QUESTIONS.filter((item) => item.code).map((item) =>
      item.code!.replace(/\s+/g, " ").trim(),
    );
    expect(new Set(mockCode).size).toBe(mockCode.length);
    expect(new Set(expansions.map((item) => item.pattern))).toEqual(
      new Set(["trace", "compilation", "api", "scenario", "select"]),
    );
    for (const question of [...expansions, ...depthQuestions]) {
      expect(question.pattern).toBeDefined();
      expect(question.options).toHaveLength(4);
      expect(question.explanation.trim().length).toBeGreaterThan(35);
      expect(
        question.options.every(
          (option) => option.explanation.trim().length > 15,
        ),
      ).toBe(true);
    }
    const objectiveIds = new Set(EXAM_OBJECTIVES.map((item) => item.id));
    for (const question of [...coverageQuestions, ...depthQuestions]) {
      expect(question.objectives?.length).toBeGreaterThan(0);
      expect(question.objectives?.every((id) => objectiveIds.has(id))).toBe(
        true,
      );
    }
    for (const objective of EXAM_OBJECTIVES) {
      expect(
        coverageQuestions.some((question) =>
          question.objectives?.includes(objective.id),
        ),
      ).toBe(true);
      expect(
        practiceQuestions.filter((question) =>
          objectiveIdsForQuestion(question).includes(objective.id),
        ).length,
      ).toBeGreaterThanOrEqual(2);
    }
    for (const question of practiceQuestions) {
      expect(objectiveIdsForQuestion(question).length).toBeGreaterThan(0);
      expect(
        objectiveIdsForQuestion(question).every((id) => objectiveIds.has(id)),
      ).toBe(true);
    }

    const fullBenchmark = benchmarkQuestions(
      EMPTY_PROGRESS,
      practiceQuestions,
      5,
      "content-test",
    );
    expect(fullBenchmark).toHaveLength(50);
    for (const domainId of domainIds) {
      expect(
        fullBenchmark.filter((item) => item.domain === domainId),
      ).toHaveLength(5);
    }

    for (const question of allQuestions) {
      const optionIds = question.options.map((option) => option.id);
      expect(question.prompt.trim().length).toBeGreaterThan(0);
      expect(question.explanation.trim().length).toBeGreaterThan(0);
      expect(question.tags.length).toBeGreaterThan(0);
      expect(optionIds.length).toBeGreaterThanOrEqual(3);
      expect(new Set(optionIds).size).toBe(optionIds.length);
      expect(
        question.options.every(
          (option) => option.text.trim() && option.explanation.trim(),
        ),
      ).toBe(true);
      for (const option of question.options) {
        if (!question.answer.includes(option.id)) {
          expect(option.explanation.trim()).not.toMatch(
            /^correct(?:[.!:]|\s)/i,
          );
        }
      }
      expect(new Set(question.answer).size).toBe(question.answer.length);
      expect(question.answer.every((id) => optionIds.includes(id))).toBe(true);
      if (question.type === "single") expect(question.answer).toHaveLength(1);
      else expect(question.answer.length).toBeGreaterThan(1);
      expectJava25Source(question.sourceUrl);
    }

    for (const mutation of mutations) {
      const optionIds = mutation.options.map((option) => option.id);
      const before = mutation.beforeCode.split("\n");
      const after = mutation.afterCode.split("\n");
      expect(mutation.change.trim().length).toBeGreaterThan(0);
      expect(mutation.explanation.trim().length).toBeGreaterThan(0);
      expect(new Set(optionIds).size).toBe(optionIds.length);
      expect(optionIds).toContain(mutation.answer);
      expect(after).toHaveLength(before.length);
      expect(
        before.filter((line, index) => line !== after[index]),
      ).toHaveLength(1);
      expectJava25Source(mutation.sourceUrl);
    }

    for (const domain of CURRICULUM_DOMAINS) {
      expect(domain.title.trim().length).toBeGreaterThan(0);
      expect(domain.rules.length).toBeGreaterThan(0);
      for (const rule of domain.rules) expectJava25Source(rule.source);
    }
    expect(new Set(JAVA_25_FEATURES.map((feature) => feature.id)).size).toBe(
      JAVA_25_FEATURES.length,
    );
    for (const feature of JAVA_25_FEATURES) expectJava25Source(feature.source);
  });
});
