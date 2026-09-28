# Java SE 25 Developer Professional (1Z0-831): source notes

Research dates: **25–26 September 2026**. This file records the decisions used to design Forge. Recheck Oracle's live exam page before scheduling or relying on logistics.

## Identity and reported format

| Item           | Finding                                         | Source boundary                                                                                                                                                                                                         |
| -------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Credential     | Java SE 25 Developer Professional, exam 1Z0-831 | [Oracle certification catalog](https://www.oracle.com/education/certification/) links to the [MyLearn exam listing](https://mylearn.oracle.com/ou/exam/java-se-25-developer-professional-1z0-831/105037/161532/270890). |
| Question count | 50                                              | [OCP study-guide authors](https://www.selikoff.net/ocp25/); we could not independently extract the current MyLearn metadata.                                                                                            |
| Time limit     | 120 minutes                                     | Same author source. Implied pace: 2 minutes 24 seconds per question.                                                                                                                                                    |
| Passing score  | 68%                                             | Same author source. A raw number of correct answers that guarantees a pass was **not** established.                                                                                                                     |
| Domain weights | No verified weights available from sources used | Forge never invents percentages.                                                                                                                                                                                        |
| Item format    | Exact single/multiple response mix not verified | Forge uses both as training formats and does not claim the live mix.                                                                                                                                                    |

## Objective map

The ten headings below are reproduced from the 1Z0-831 outline by [Enthuware](https://enthuware.com/oca-ocp-java-certification-resources/297-ocp-java-25-exam-syllabus). Forge's short labels are study navigation labels, not official wording.

|   # | Published objective area                                                | Forge study area       |
| --: | ----------------------------------------------------------------------- | ---------------------- |
|   1 | Handling Date, Time, Text, Numeric and Boolean Values                   | Values & expressions   |
|   2 | Implementing Program Flow Control Using Decision and Looping Constructs | Flow & patterns        |
|   3 | Applying Object-Oriented Principles in Java Programs                    | Classes & construction |
|   4 | Implementing Exception Handling in Java Applications                    | Exceptions & resources |
|   5 | Using Arrays and Collections to Store and Retrieve Data                 | Collections & generics |
|   6 | Processing Data Using Streams and Lambda Expressions                    | Streams & pipelines    |
|   7 | Packaging and Deploying Java Code                                       | Modules & launch       |
|   8 | Implementing Multithreading for Concurrent Code Execution               | Concurrency & context  |
|   9 | Performing Input and Output Operations Using the Java I/O API           | Files, paths & I/O     |
|  10 | Developing Applications with Localization Support                       | Locales & formatting   |

The app deliberately does not assign weights to these areas. Its question count by domain describes **library coverage**, not exam weighting.

## Java 25 feature status

Oracle's [Java language changes summary](https://docs.oracle.com/en/java/javase/25/language/java-language-changes-summary.html), especially table 1-2, classifies **module import declarations**, **compact source files and instance main methods**, and **flexible constructor bodies** as permanent in Java 25. It classifies **primitive types in patterns, `instanceof`, and `switch`** as preview. [Oracle's significant changes guide](https://docs.oracle.com/en/java/javase/25/migrate/significant-changes-jdk-25.html) has conflicting/stale prose that still calls module imports a preview; the version-specific language summary and successful no-preview compilation with JDK 25 support the permanent classification. [Scoped values](https://openjdk.org/jeps/506) and [stream gatherers](https://openjdk.org/jeps/485) are permanent library features. Structured Concurrency remains a preview API in Java 25. Preview explorations in Forge are labeled supplemental when not explicitly named in the reproduced 1Z0-831 objectives.

## Training design decisions

- **Retrieval before feedback:** practice asks the learner to commit to an answer and confidence level before revealing the explanation. This is consistent with research on retrieval practice ([Karpicke & Roediger, 2008](https://doi.org/10.1126/science.1152408)).
- **Return on schedule:** wrong items become due immediately; correct answers return after an interval that grows with confident repeated recall. Distributed practice is supported by a broad learning-techniques review ([Dunlosky et al., 2013](https://doi.org/10.1177/1529100612453266)). Forge's exact intervals are product heuristics, not a clinically validated memory model.
- **Counterfactual comparison:** the Mutation Lab isolates one code change at a time and asks for a fresh prediction. Each before/after pair was checked with JDK 25.0.1. This is a training method designed by this app, not a claim about Oracle's item style.
- **Honest score scope:** the short timed drill uses the teaching bank, while three full forms use 150 questions isolated from normal practice. First attempts are separated from retakes because familiarity can improve repeated scores independent of transfer. No result predicts a pass.
- **Answer-position control:** option order varies between sessions and is reconstructed from the saved session start time, so resume does not change the visible choices. This limits simple answer-letter memorization.
- **Pattern practice:** output tracing, compilation checks, API contracts, applied scenarios, and multiple-response evaluation are separate drills. This is Forge's reasoning taxonomy; the exact live exam item mix has not been verified.
- **Balanced sets:** daily practice prioritizes due reviews, then unseen items, while spreading selections across objectives and reasoning patterns. Timed sets contain equal numbers from each broad area and are shuffled across the complete run rather than presented in domain blocks. Equal representation is a study design choice, not a claim about exam weights.
- **Comparable mock forms:** each locked form contains 38 single-response and 12 multiple-response training items. Holding that mix constant reduces avoidable difficulty drift between forms; it is not a claim about the live exam's item mix.

## Expanded practice bank

Forge has **200 adaptive-practice questions**, 20 in each of the ten objective areas, plus **three independent 50-question mock forms** for 350 original items overall. The adaptive bank contains explicit coverage for every one of the app's 31 atomic objective checks. Every item has a rule explanation, an explanation for each option, tags, and a direct Java 25 JLS or API source link. No question count establishes complete exam coverage, and these are educational approximations rather than Oracle exam items.

## Content verification

The primary Java references are the [Java SE 25 JLS](https://docs.oracle.com/javase/specs/jls/se25/html/), [Java SE 25 API](https://docs.oracle.com/en/java/javase/25/docs/api/), and [Oracle Java 25 documentation](https://docs.oracle.com/en/java/javase/25/). Each practice question and Mutation Lab experiment links to the relevant rule or API. Thirteen high-risk topic witnesses are compiled or source-launched and, where applicable, executed by the test suite on JDK 25 or later. Oracle's Java Stream specification allows stage elision in some pipelines, so the bank avoids treating side effects inside stream lambdas as guaranteed output.
