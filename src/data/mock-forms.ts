import { mockQuestionsA } from "./mock-questions-a";
import { mockQuestionsB } from "./mock-questions-b";
import { mockQuestionsC } from "./mock-questions-c";
import type { Question } from "./questions";

export type MockForm = {
  id: "A" | "B" | "C";
  title: string;
  questions: Question[];
};

/** Full forms stay outside the adaptive bank until the learner attempts one. */
export const MOCK_FORMS: MockForm[] = [
  { id: "A", title: "Form A", questions: mockQuestionsA },
  { id: "B", title: "Form B", questions: mockQuestionsB },
  { id: "C", title: "Form C", questions: mockQuestionsC },
];

export const MOCK_QUESTIONS = MOCK_FORMS.flatMap((form) => form.questions);
