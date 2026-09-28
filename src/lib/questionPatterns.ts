import type { Question, QuestionPattern } from "../data/questions";

export const QUESTION_PATTERNS: {
  id: QuestionPattern;
  label: string;
  description: string;
}[] = [
  {
    id: "trace",
    label: "Trace the result",
    description: "Follow evaluation, state, and control flow to a result.",
  },
  {
    id: "compilation",
    label: "Will it compile?",
    description: "Spot type, scope, and language-rule failures before runtime.",
  },
  {
    id: "api",
    label: "API contracts",
    description: "Distinguish similar Java library methods and guarantees.",
  },
  {
    id: "scenario",
    label: "Apply the rule",
    description:
      "Choose the behavior or design that fits a concrete situation.",
  },
  {
    id: "select",
    label: "Select all that apply",
    description:
      "Evaluate each statement independently; more than one is right.",
  },
];

/** Older bank entries predate pattern metadata. Keep them usable in pattern drills. */
export function questionPattern(question: Question): QuestionPattern {
  if (question.pattern) return question.pattern;
  if (question.type === "multiple") return "select";
  if (/compil|legal|valid|error/i.test(question.prompt)) return "compilation";
  if (/print|output|return|result|produce/i.test(question.prompt))
    return "trace";
  return question.code ? "scenario" : "api";
}

export function matchesQuestionPattern(
  question: Question,
  pattern: QuestionPattern,
) {
  if (pattern === "select") return question.type === "multiple";
  if (pattern === "compilation") {
    return (
      questionPattern(question) === "compilation" ||
      /compil|legal|valid declaration/i.test(question.prompt)
    );
  }
  return questionPattern(question) === pattern;
}

export function questionPatternLabel(question: Question) {
  return (
    QUESTION_PATTERNS.find((item) => item.id === questionPattern(question))
      ?.label ?? "Apply the rule"
  );
}
