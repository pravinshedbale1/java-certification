# Forge — Java 25 certification studio

A local-first React study app for **Oracle Java SE 25 Developer Professional (1Z0-831)**. It combines a source-linked atlas of 31 atomic objectives, 250 adaptive-practice questions, 150 questions reserved for three independent mock forms, a confidence-aware review queue, and compiler-backed Java 25 checks.

## Run it

Requires Node.js 20.19+ (Node 22+ recommended).

```bash
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). For a production build:

```bash
npm run build
npm run preview
```

Run the content, session-selection, and review-scheduling checks with `npm test`.

## Study workflow

1. **Objective atlas** — ten exam-aligned study areas with concise language/API rules, common misreads, and links to the Java 25 specification or API docs.
2. **Daily circuit** — up to eight questions, due reviews first, followed by unseen material. The set spreads across objective areas and reasoning patterns. Choose an answer _and_ confidence before revealing the rule. Each option has an explanation.
3. **Pattern drills** — focus on tracing output, compilation, API contracts, applied scenarios, or multiple-response decisions. Combine a pattern with an objective area for a targeted set. These are learning modes, not a claim about the live exam's item mix.
4. **Mutation Lab** — ten verified before/after Java programs. Predict what a single edit changes, then inspect the rule and primary source.
5. **Timed benchmark** — use a 20-question teaching-bank drill or one of three mock-only 50-question forms. Full forms mix all ten areas over 120 minutes and support free navigation, flags, answer editing, unanswered items, and a final submission review. First attempts are reported separately from retakes. Answers stay hidden until submission.
6. **Review & evidence** — missed questions return immediately; correct answers return later based on confidence and consecutive recall. Evidence is shown for all 31 atomic objectives as well as the ten broad areas, without calculating a modeled passing probability.

Progress, notes, bookmarks, and the active session are stored in the browser. The Exam & sources page can export progress and Mutation Lab answers as JSON or erase local study data. There is no account, server-side progress store, or app usage analytics. Fonts are hosted locally.

The header includes a light/dark mode switch. New workspaces start in dark mode, and your choice is remembered independently of study progress. Both themes use larger study text, stronger secondary text contrast, and readable code on mobile.

Java snippets use shared syntax highlighting across practice, benchmarks, and Mutation Lab. Keywords, types, methods, strings, and numbers have distinct colors on a charcoal editor surface. Mutation diffs use rose for removed lines and blue for added lines, with explicit −/+ markers; status messages retain separate amber, green, and red accents.

All screens share the light/dark design tokens in `src/tokens.css`: neutral reading surfaces, coral actions and selections, and dedicated status colors. The dashboard shows objective coverage, session controls name the actual activity they resume, and switching activities protects unfinished sessions. See [the UX review](docs/ux-review.md) for findings, changes, verification, and remaining learner validation.

## Exam source boundary

Oracle's [certification catalog](https://www.oracle.com/education/certification/) lists the credential and links to the [1Z0-831 exam page](https://mylearn.oracle.com/ou/exam/java-se-25-developer-professional-1z0-831/105037/161532/270890). The ten objective areas are mapped from the [published outline as reproduced by Enthuware](https://enthuware.com/oca-ocp-java-certification-resources/297-ocp-java-25-exam-syllabus). OCP study-guide authors [Scott Selikoff and Jeanne Boyarsky](https://www.selikoff.net/ocp25/) report **50 questions, 120 minutes, and a 68% passing score**; we could not independently extract the current MyLearn metadata. Verify the live listing before booking. No domain weights or raw-score conversion are assumed here.

Oracle's [Java 25 language summary](https://docs.oracle.com/en/java/javase/25/language/java-language-changes-summary.html) identifies module import declarations, compact source files with instance main methods, and flexible constructor bodies as permanent in Java 25; primitive types in patterns remain preview. The app marks preview material as supplemental when it is not explicitly named in the reproduced exam objectives. Question explanations link to primary Java 25 documentation. All practice items are original training material, not Oracle exam questions.

## Current content scope

The adaptive bank has 25 questions in each of the ten objective areas (250 total), including explicit coverage for every atomic objective tracked by the app. Fifty depth items target rules the earlier banks missed, such as fail-fast iterator edge cases, `orElse` versus `orElseGet`, `--add-opens`, deserialization constructors and compact number formatting. Every depth answer was confirmed by compiling and running the code on JDK 25. Three separate 50-question forms add 150 mock-only items that do not appear in daily practice before their form is attempted. A short timed drill still draws from the teaching bank. All 400 items are original educational approximations, and no practice score is presented as a guarantee of a live result.

Thirteen high-risk rules have executable compiler/runtime witnesses covering time APIs, nested types and varargs, functional interfaces, `Deque`, custom exceptions, core stream operations, `Callable` and locks, character I/O, NIO attributes, localization, lambda capture, compact source files, and multi-file source launch. The test suite runs these witnesses when JDK 25 or later is available.

## Project map

- `src/App.tsx` — navigation, practice session, timed drill, review and evidence views
- `src/MutationLab.tsx` — interactive one-line-change experiments
- `src/data/questions.ts` — original question bank
- `src/data/questions-extra.ts` — additional question bank coverage
- `src/data/questions-expansion-{a,b,c}.ts` — deeper coverage across all ten areas
- `src/data/questions-coverage.ts` — explicit gap-closing coverage for the 31 atomic objectives
- `src/data/questions-depth.ts` — JDK-verified depth items for commonly tested rules the other banks did not exercise
- `src/data/mock-questions-{a,b,c}.ts` — three isolated, balanced 50-question mock forms
- `src/data/mutations.ts` — verified mutation challenges
- `src/data/curriculum.ts` — objective rules, contrasts, and Java 25 feature briefs
- `src/data/objectives.ts` — atomic objective taxonomy and legacy-item classification
- `src/data/java-golden.ts` — compiler/runtime witnesses for high-risk Java rules
- `src/lib/progress.ts` — local persistence and review scheduling
- `src/lib/benchmark.ts`, `src/lib/questionPatterns.ts` — balanced timed sets and pattern drills
- `src/lib/questionOrder.ts` — stable answer order within a session
- `src/styles.css`, `src/mutation.css` — responsive interface
