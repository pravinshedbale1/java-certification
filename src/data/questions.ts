/** Original practice items aligned to the published Java SE 25 Developer domains.
 * They are study questions, not Oracle exam questions.
 */

import type { ExamObjectiveId } from "./objectives";

export type DomainId =
  | "values"
  | "flow"
  | "oop"
  | "exceptions"
  | "collections"
  | "streams"
  | "packaging"
  | "concurrency"
  | "io"
  | "localization";

export type Difficulty = "Foundation" | "Applied" | "Expert";
export type QuestionType = "single" | "multiple";
export type QuestionPattern =
  "trace" | "compilation" | "api" | "scenario" | "select";

export interface QuestionOption {
  id: string;
  text: string;
  explanation: string;
}

export interface Question {
  id: string;
  domain: DomainId;
  difficulty: Difficulty;
  type: QuestionType;
  pattern?: QuestionPattern;
  prompt: string;
  code?: string;
  options: QuestionOption[];
  answer: string[];
  explanation: string;
  sourceUrl: string;
  tags: string[];
  /** Atomic syllabus objectives exercised by this item. Legacy items are
   * classified by objectiveIdsForQuestion until authored metadata is added. */
  objectives?: ExamObjectiveId[];
}

export const questions: Question[] = [
  {
    id: "VAL-01",
    domain: "values",
    difficulty: "Applied",
    type: "single",
    prompt: "What does this code print?",
    code: `short points = 7;
points += 4.9;
System.out.println(points);`,
    options: [
      {
        id: "A",
        text: "11",
        explanation:
          "Correct. Compound assignment adds as a promoted numeric expression, then implicitly narrows the result to short; 11.9 becomes 11.",
      },
      {
        id: "B",
        text: "11.9",
        explanation:
          "A short stores an integer value, not the fractional result.",
      },
      {
        id: "C",
        text: "12",
        explanation:
          "Narrowing a positive floating-point value truncates toward zero; it does not round to the nearest integer.",
      },
      {
        id: "D",
        text: "The code does not compile",
        explanation:
          "The implicit cast is part of the compound-assignment rule. The equivalent simple assignment would need an explicit cast.",
      },
    ],
    answer: ["A"],
    explanation:
      "For E1 op= E2, Java evaluates an expression equivalent to (T) (E1 op E2), where T is the type of E1. The double result 11.9 is narrowed to short 11.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.26.2",
    tags: ["compound assignment", "numeric promotion", "narrowing"],
  },
  {
    id: "VAL-02",
    domain: "values",
    difficulty: "Foundation",
    type: "single",
    prompt: "What does this code print?",
    code: `String word = "ab";
word.concat("c");
StringBuilder builder = new StringBuilder(word);
builder.append('d');
System.out.println(word + "|" + builder);`,
    options: [
      {
        id: "A",
        text: "ab|abd",
        explanation:
          "Correct. concat returns a new String that is discarded; append mutates the StringBuilder.",
      },
      {
        id: "B",
        text: "abc|abcd",
        explanation:
          "concat does not change the original String referenced by word.",
      },
      {
        id: "C",
        text: "ab|ab",
        explanation: "append changes builder, so its final value includes d.",
      },
      {
        id: "D",
        text: "The code does not compile",
        explanation:
          "Both String.concat and StringBuilder.append are legal calls.",
      },
    ],
    answer: ["A"],
    explanation:
      'String values are immutable. Since the result of concat is ignored, word stays "ab". StringBuilder is mutable, so builder becomes "abd".',
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html#concat(java.lang.String)",
    tags: ["String", "StringBuilder", "mutability"],
  },
  {
    id: "VAL-03",
    domain: "values",
    difficulty: "Applied",
    type: "single",
    prompt: "What is printed?",
    code: `var day = java.time.LocalDate.of(2024, 2, 29);
System.out.println(day.plusYears(1));`,
    options: [
      {
        id: "A",
        text: "2025-02-28",
        explanation:
          "Correct. The invalid leap-day result is adjusted to the last valid day of February.",
      },
      {
        id: "B",
        text: "2025-03-01",
        explanation:
          "plusYears adjusts an invalid day of month backward, not forward into March.",
      },
      {
        id: "C",
        text: "2025-02-29",
        explanation: "2025 is not a leap year, so that date does not exist.",
      },
      {
        id: "D",
        text: "A DateTimeException is thrown",
        explanation:
          "The plusYears contract resolves this leap-day case to February 28.",
      },
    ],
    answer: ["A"],
    explanation:
      "LocalDate.plusYears first adds to the year and then adjusts an invalid day of month to the last valid day. February 29, 2024 becomes February 28, 2025.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/LocalDate.html#plusYears(long)",
    tags: ["date-time", "LocalDate", "leap year"],
  },
  {
    id: "FLOW-01",
    domain: "flow",
    difficulty: "Applied",
    type: "single",
    prompt: "What does this nested loop print?",
    code: `int visits = 0;
outer: for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        if (j == 1) continue outer;
        visits++;
    }
}
System.out.println(visits);`,
    options: [
      {
        id: "A",
        text: "3",
        explanation:
          "Correct. Each outer iteration increments once at j = 0, then jumps to the next outer iteration.",
      },
      {
        id: "B",
        text: "6",
        explanation:
          "The labeled continue skips j = 2 as well as the increment at j = 1.",
      },
      {
        id: "C",
        text: "9",
        explanation:
          "The inner loop does not complete all three iterations for each i.",
      },
      {
        id: "D",
        text: "The code does not compile",
        explanation:
          "A labeled continue may target the enclosing for statement.",
      },
    ],
    answer: ["A"],
    explanation:
      "continue outer transfers control to the update step of the labeled outer loop. Only j = 0 increments visits for each of the three outer iterations.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.16",
    tags: ["loops", "labeled continue"],
  },
  {
    id: "FLOW-02",
    domain: "flow",
    difficulty: "Expert",
    type: "single",
    prompt: "What does this Java 25 switch expression produce?",
    code: `Object value = "Java";
String result = switch (value) {
    case String s when s.length() == 4 -> "four";
    case String s -> "other string";
    default -> "other";
};
System.out.println(result);`,
    options: [
      {
        id: "A",
        text: "four",
        explanation:
          "Correct. The first String pattern matches, and its guard is true.",
      },
      {
        id: "B",
        text: "other string",
        explanation:
          "The second String case is reached only if the guarded first case does not apply.",
      },
      {
        id: "C",
        text: "other",
        explanation: "The String patterns apply before default.",
      },
      {
        id: "D",
        text: "The code does not compile because the second String case is dominated",
        explanation:
          "A guarded pattern is not unconditional. The second case still handles strings for which the guard is false.",
      },
    ],
    answer: ["A"],
    explanation:
      'A when clause guards a pattern case. "Java" matches String and has length four, so the guarded first case yields "four".',
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.11",
    tags: ["switch expression", "pattern matching", "guards"],
  },
  {
    id: "FLOW-03",
    domain: "flow",
    difficulty: "Applied",
    type: "single",
    prompt: "What does this switch expression print?",
    code: `Object value = null;
String result = switch (value) {
    case null -> "missing";
    case String s -> s;
    default -> "other";
};
System.out.println(result);`,
    options: [
      {
        id: "A",
        text: "missing",
        explanation: "Correct. An explicit case null handles a null selector.",
      },
      {
        id: "B",
        text: "other",
        explanation: "default does not supersede an explicit case null.",
      },
      {
        id: "C",
        text: "null",
        explanation: "The String pattern does not bind a null value.",
      },
      {
        id: "D",
        text: "A NullPointerException is thrown",
        explanation:
          "That would be the normal result without a matching null case; this switch has one.",
      },
    ],
    answer: ["A"],
    explanation:
      "Pattern switches can state case null explicitly. This label is selected before any pattern or default label.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.11.3",
    tags: ["switch expression", "null", "pattern matching"],
  },
  {
    id: "OOP-01",
    domain: "oop",
    difficulty: "Applied",
    type: "single",
    prompt: "What does the record construction print?",
    code: `record User(String name) {
    User { name = name.strip(); }
}
System.out.println(new User("  Ada  ").name());`,
    options: [
      {
        id: "A",
        text: "Ada",
        explanation:
          "Correct. The compact constructor changes its parameter before the implicit field assignment.",
      },
      {
        id: "B",
        text: "  Ada  ",
        explanation:
          "The compact constructor strips the parameter that is assigned to the component field.",
      },
      {
        id: "C",
        text: "null",
        explanation:
          "The component receives the normalized constructor parameter.",
      },
      {
        id: "D",
        text: "The code does not compile because record components are final",
        explanation:
          "Assigning the constructor parameter is legal; directly assigning the component field in a compact constructor would be the problem.",
      },
    ],
    answer: ["A"],
    explanation:
      "At the end of a compact canonical constructor, record component fields are implicitly initialized from the corresponding parameters. Reassigning name changes the value used for that initialization.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.10.4",
    tags: ["records", "compact constructor", "normalization"],
  },
  {
    id: "OOP-02",
    domain: "oop",
    difficulty: "Foundation",
    type: "multiple",
    prompt:
      "A class directly extends a sealed class. Which modifiers can legally complete that direct subclass declaration? Select all that apply.",
    options: [
      {
        id: "A",
        text: "final",
        explanation:
          "Correct. A final direct subclass closes its branch of the hierarchy.",
      },
      {
        id: "B",
        text: "sealed",
        explanation:
          "Correct. A sealed direct subclass continues the controlled hierarchy and declares its permitted subclasses.",
      },
      {
        id: "C",
        text: "non-sealed",
        explanation:
          "Correct. A non-sealed direct subclass reopens its branch to unrestricted extension.",
      },
      {
        id: "D",
        text: "abstract, with no other modifier",
        explanation:
          "Abstract alone is insufficient. A direct subclass must also be sealed or non-sealed, unless it is final (which cannot also be abstract).",
      },
    ],
    answer: ["A", "B", "C"],
    explanation:
      "Every direct subclass of a sealed class must explicitly decide the inheritance policy for its branch: final, sealed, or non-sealed.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.1.1.2",
    tags: ["sealed classes", "inheritance", "modifiers"],
  },
  {
    id: "OOP-03",
    domain: "oop",
    difficulty: "Expert",
    type: "single",
    prompt:
      "Assume the following code is compiled with Java 25. What is printed?",
    code: `class Parent {
    final int size;
    Parent(int size) { this.size = size; }
}
class Child extends Parent {
    Child(int requested) {
        int safe = Math.max(0, requested);
        super(safe);
    }
}
System.out.println(new Child(-5).size);`,
    options: [
      {
        id: "A",
        text: "0",
        explanation:
          "Correct. Java 25 allows this local calculation before super(safe), and Math.max returns zero.",
      },
      {
        id: "B",
        text: "-5",
        explanation: "The superclass receives safe, not requested.",
      },
      {
        id: "C",
        text: "The code does not compile because super(...) must be the first statement",
        explanation:
          "Java 25 permits this constructor prologue: it calculates a local value from the parameter before invoking super.",
      },
      {
        id: "D",
        text: "The code throws an IllegalArgumentException",
        explanation:
          "Neither constructor validates or throws for negative input; it is normalized to zero.",
      },
    ],
    answer: ["A"],
    explanation:
      "Flexible constructor bodies became permanent in Java 25. This prologue computes a local value from requested before super(safe). Early construction code may also assign the class's own fields, but it cannot read the instance under construction.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/language/flexible-constructor-bodies.html",
    tags: ["Java 25", "constructors", "super"],
  },
  {
    id: "EXC-01",
    domain: "exceptions",
    difficulty: "Expert",
    type: "single",
    prompt:
      "What is printed when both the try body and the resource close method throw?",
    code: `class R implements AutoCloseable {
    public void close() { throw new IllegalStateException("close"); }
}
try (R r = new R()) {
    throw new IllegalArgumentException("body");
} catch (Exception e) {
    System.out.println(e.getMessage() + ":" +
                       e.getSuppressed()[0].getMessage());
}`,
    options: [
      {
        id: "A",
        text: "body:close",
        explanation:
          "Correct. The body exception is primary; the close exception is suppressed on it.",
      },
      {
        id: "B",
        text: "close:body",
        explanation:
          "Closing does not replace the primary exception from the try body.",
      },
      {
        id: "C",
        text: "body, followed by an uncaught close exception",
        explanation:
          "The close exception is attached as a suppressed exception rather than thrown separately.",
      },
      {
        id: "D",
        text: "The code does not compile",
        explanation:
          "The AutoCloseable implementation and catch block are valid.",
      },
    ],
    answer: ["A"],
    explanation:
      "try-with-resources preserves the exception from the body as primary. The exception thrown by close() appears in getSuppressed().",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20.3",
    tags: ["try-with-resources", "suppressed exceptions"],
  },
  {
    id: "EXC-02",
    domain: "exceptions",
    difficulty: "Applied",
    type: "single",
    prompt: "What happens when this catch clause is compiled?",
    code: `try {
    throw new java.io.FileNotFoundException();
} catch (java.io.FileNotFoundException |
         java.io.IOException e) {
    System.out.println("handled");
}`,
    options: [
      {
        id: "A",
        text: "It prints handled",
        explanation:
          "The alternatives are related by subclassing, which makes the multi-catch illegal.",
      },
      {
        id: "B",
        text: "It does not compile",
        explanation:
          "Correct. FileNotFoundException is a subclass of IOException; multi-catch alternatives may not be related by subclassing.",
      },
      {
        id: "C",
        text: "It throws FileNotFoundException",
        explanation:
          "The source does not reach execution because the catch declaration is invalid.",
      },
      {
        id: "D",
        text: "It throws IOException",
        explanation:
          "The code fails compilation before any exception is thrown.",
      },
    ],
    answer: ["B"],
    explanation:
      "In a multi-catch clause, no alternative type may be a subtype of another alternative. Catching IOException alone would also catch FileNotFoundException.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20",
    tags: ["multi-catch", "exception hierarchy", "compilation"],
  },
  {
    id: "EXC-03",
    domain: "exceptions",
    difficulty: "Applied",
    type: "single",
    prompt: "What value does f() return?",
    code: `static int f() {
    try { return 1; }
    finally { return 2; }
}`,
    options: [
      {
        id: "A",
        text: "1",
        explanation:
          "The pending return from try is replaced by the abrupt completion of finally.",
      },
      {
        id: "B",
        text: "2",
        explanation:
          "Correct. The return in finally supersedes the earlier return.",
      },
      {
        id: "C",
        text: "No value; a compiler error occurs",
        explanation:
          "Returning from finally is legal, although it is usually a poor practice.",
      },
      {
        id: "D",
        text: "No value; an exception is thrown",
        explanation: "No expression here throws an exception.",
      },
    ],
    answer: ["B"],
    explanation:
      "A finally block always runs before the method finishes. If finally itself completes abruptly with return 2, it replaces the return 1 from try.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20.2",
    tags: ["finally", "control flow", "return"],
  },
  {
    id: "COL-01",
    domain: "collections",
    difficulty: "Foundation",
    type: "single",
    prompt: "What is the result of this expression?",
    code: `var names = java.util.List.of("Ada", null);`,
    options: [
      {
        id: "A",
        text: "An immutable list containing Ada and null",
        explanation: "List.of does not permit null elements.",
      },
      {
        id: "B",
        text: "A mutable list containing Ada and null",
        explanation: "List.of returns an unmodifiable list and rejects null.",
      },
      {
        id: "C",
        text: "A NullPointerException at runtime",
        explanation:
          "Correct. The factory rejects null elements during list creation.",
      },
      {
        id: "D",
        text: "A compile-time error",
        explanation:
          "null is type-compatible here; the null check happens when the factory runs.",
      },
    ],
    answer: ["C"],
    explanation:
      "The List.of convenience factories produce unmodifiable lists and throw NullPointerException if any element is null.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#of(E,E)",
    tags: ["List.of", "null", "immutability"],
  },
  {
    id: "COL-02",
    domain: "collections",
    difficulty: "Applied",
    type: "single",
    prompt: "What does this code print?",
    code: `var values = new java.util.ArrayList<>(java.util.List.of(1, 2, 3));
var backwards = values.reversed();
backwards.set(0, 9);
System.out.println(values);`,
    options: [
      {
        id: "A",
        text: "[1, 2, 9]",
        explanation:
          "Correct. The reversed list is a write-through view; its first element is the original list's last.",
      },
      {
        id: "B",
        text: "[9, 2, 3]",
        explanation:
          "Index 0 in the reversed view refers to the original last element, not the original first.",
      },
      {
        id: "C",
        text: "[1, 2, 3]",
        explanation:
          "The view is backed by the original mutable ArrayList, so set writes through.",
      },
      {
        id: "D",
        text: "An UnsupportedOperationException is thrown",
        explanation:
          "An ArrayList reversed view supports set, matching the mutable backing list.",
      },
    ],
    answer: ["A"],
    explanation:
      "reversed() returns a reverse-ordered view. For ArrayList, changing element zero of that view changes the final element of the backing list.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#reversed()",
    tags: ["sequenced collections", "reversed view", "ArrayList"],
  },
  {
    id: "COL-03",
    domain: "collections",
    difficulty: "Applied",
    type: "multiple",
    prompt:
      "Given `List<Integer> ints = new ArrayList<>();`, which independent assignments compile? Select all that apply.",
    code: `java.util.List<Integer> ints = new java.util.ArrayList<>();`,
    options: [
      {
        id: "A",
        text: "List<? extends Number> a = ints;",
        explanation:
          "Correct. Integer is a subtype of Number, so the producer wildcard accepts List<Integer>.",
      },
      {
        id: "B",
        text: "List<Number> b = ints;",
        explanation:
          "Generic List is invariant: List<Integer> is not a subtype of List<Number>.",
      },
      {
        id: "C",
        text: "List<? super Integer> c = ints;",
        explanation:
          "Correct. List<Integer> is itself a valid consumer of Integer values.",
      },
      {
        id: "D",
        text: "List<Object> d = ints;",
        explanation:
          "Generic invariance also prevents assignment to List<Object>.",
      },
    ],
    answer: ["A", "C"],
    explanation:
      "Wildcard bounds can accept the actual type argument Integer on either side here. Plain List<Number> and List<Object> cannot receive a List<Integer> reference.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.5.1",
    tags: ["generics", "wildcards", "invariance"],
  },
  {
    id: "STR-01",
    domain: "streams",
    difficulty: "Applied",
    type: "single",
    prompt: "What does this ordered stream pipeline print?",
    code: `var result = java.util.stream.Stream.of(1, 2, 3, 1)
    .takeWhile(n -> n < 3)
    .toList();
System.out.println(result);`,
    options: [
      {
        id: "A",
        text: "[1, 2]",
        explanation:
          "Correct. takeWhile takes the longest matching prefix and stops at 3.",
      },
      {
        id: "B",
        text: "[1, 2, 1]",
        explanation:
          "That would resemble filtering every element. takeWhile does not resume after the first nonmatching element.",
      },
      {
        id: "C",
        text: "[1, 2, 3, 1]",
        explanation: "The predicate rejects 3, ending the prefix.",
      },
      {
        id: "D",
        text: "[1]",
        explanation: "Both initial elements, 1 and 2, satisfy n < 3.",
      },
    ],
    answer: ["A"],
    explanation:
      "For an ordered stream, takeWhile returns the longest contiguous prefix matching its predicate. The later 1 is excluded because it comes after the first nonmatching element, 3.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html#takeWhile(java.util.function.Predicate)",
    tags: ["takeWhile", "encounter order", "short circuit"],
    objectives: ["stream-transform", "stream-parallel"],
  },
  {
    id: "STR-02",
    domain: "streams",
    difficulty: "Foundation",
    type: "single",
    prompt: "What happens when the final line executes?",
    code: `var result = java.util.stream.Stream.of(1, 2).toList();
result.add(3);`,
    options: [
      {
        id: "A",
        text: "result becomes [1, 2, 3]",
        explanation: "Stream.toList returns an unmodifiable List.",
      },
      {
        id: "B",
        text: "The code does not compile",
        explanation:
          "List.add is available at compile time, even if a particular list rejects it at runtime.",
      },
      {
        id: "C",
        text: "An UnsupportedOperationException is thrown",
        explanation:
          "Correct. The list returned by Stream.toList is unmodifiable.",
      },
      {
        id: "D",
        text: "An IllegalStateException is thrown",
        explanation:
          "There is no attempted stream reuse. The failing operation is a list mutation.",
      },
    ],
    answer: ["C"],
    explanation:
      "Stream.toList returns an unmodifiable list. Calling a mutator such as add on that result throws UnsupportedOperationException.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html#toList()",
    tags: ["Stream.toList", "unmodifiable list", "terminal operations"],
  },
  {
    id: "STR-03",
    domain: "streams",
    difficulty: "Expert",
    type: "single",
    prompt: "What is printed by this Java 25 gatherer pipeline?",
    code: `var windows = java.util.stream.Stream.of(1, 2, 3, 4, 5)
    .gather(java.util.stream.Gatherers.windowFixed(2))
    .toList();
System.out.println(windows);`,
    options: [
      {
        id: "A",
        text: "[[1, 2], [3, 4], [5]]",
        explanation:
          "Correct. Fixed windows are nonoverlapping, and the last partial window is emitted.",
      },
      {
        id: "B",
        text: "[[1, 2], [2, 3], [3, 4], [4, 5]]",
        explanation:
          "That is sliding-window behavior, not windowFixed behavior.",
      },
      {
        id: "C",
        text: "[[1, 2], [3, 4]]",
        explanation:
          "windowFixed emits a final partial window when elements remain.",
      },
      {
        id: "D",
        text: "The code requires --enable-preview",
        explanation: "Stream Gatherers are a permanent API in Java 25.",
      },
    ],
    answer: ["A"],
    explanation:
      "Gatherers.windowFixed(2) groups encountered elements into consecutive batches of two. Its final batch may contain fewer than two elements.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Gatherers.html#windowFixed(int)",
    tags: ["Java 25", "stream gatherers", "windowFixed"],
  },
  {
    id: "PKG-01",
    domain: "packaging",
    difficulty: "Applied",
    type: "single",
    prompt:
      "Beyond com.api and java.base, which module can com.app read without its own requires clause? Assume the relevant packages are exported.",
    code: `// com.api/module-info.java
module com.api {
    requires transitive com.model;
    exports com.api;
}

// com.app/module-info.java
module com.app {
    requires com.api;
}`,
    options: [
      {
        id: "A",
        text: "com.model",
        explanation:
          "Correct. requires transitive makes the dependency readable to modules that read com.api.",
      },
      {
        id: "B",
        text: "Only java.base",
        explanation:
          "java.base is implicit, but com.model is also readable through the transitive dependency.",
      },
      {
        id: "C",
        text: "Every module on the module path",
        explanation:
          "Readability is constrained by module dependencies; the module path alone grants no such blanket access.",
      },
      {
        id: "D",
        text: "No other module",
        explanation:
          "The requires transitive clause specifically propagates readability of com.model.",
      },
    ],
    answer: ["A"],
    explanation:
      "A requires transitive directive makes com.model readable to any module that reads com.api, including com.app. Package exports still govern which public types are accessible.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html#jls-7.7.1",
    tags: ["JPMS", "requires transitive", "readability"],
  },
  {
    id: "PKG-02",
    domain: "packaging",
    difficulty: "Applied",
    type: "multiple",
    prompt:
      "For a normal named module, which statements about `exports p;` and `opens p;` are correct? Select all that apply.",
    options: [
      {
        id: "A",
        text: "exports p permits ordinary access to public types in p from modules that read this module.",
        explanation:
          "Correct. That is the compile-time and runtime accessibility purpose of exports.",
      },
      {
        id: "B",
        text: "opens p permits deep reflective access to p at runtime.",
        explanation:
          "Correct. opens exposes the package to runtime reflection.",
      },
      {
        id: "C",
        text: "exports p automatically permits deep reflection into private members of p.",
        explanation:
          "Exports alone does not grant deep reflective access to nonpublic members.",
      },
      {
        id: "D",
        text: "opens p automatically permits ordinary compile-time imports of public types in p.",
        explanation:
          "An opened package is not exported merely because it is opened.",
      },
    ],
    answer: ["A", "B"],
    explanation:
      "exports controls ordinary access to public types for readable modules. opens controls runtime deep reflection; it does not also export the package.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html#jls-7.7.2",
    tags: ["JPMS", "exports", "opens", "reflection"],
  },
  {
    id: "PKG-03",
    domain: "packaging",
    difficulty: "Applied",
    type: "single",
    prompt:
      "A file named Hello.java contains only this source. What happens when `java Hello.java` runs under Java 25 without preview flags?",
    code: `void main() {
    System.out.println("ready");
}`,
    options: [
      {
        id: "A",
        text: "It prints ready",
        explanation:
          "Correct. Java 25 permanently supports compact source files with an instance main method.",
      },
      {
        id: "B",
        text: "It fails because main must be static",
        explanation:
          "A launchable instance main method is allowed for compact source files in Java 25.",
      },
      {
        id: "C",
        text: "It fails because an explicit class declaration is required",
        explanation:
          "The compact source file implicitly declares its top-level class.",
      },
      {
        id: "D",
        text: "It runs only with --enable-preview",
        explanation: "This language feature is permanent in Java 25.",
      },
    ],
    answer: ["A"],
    explanation:
      "Java 25 compact source files can contain an instance void main() without an explicit class declaration. The java launcher runs that method in source-file mode.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/language/compact-source-files-instance-main-methods.html",
    tags: ["Java 25", "compact source files", "instance main"],
  },
  {
    id: "CON-01",
    domain: "concurrency",
    difficulty: "Foundation",
    type: "single",
    prompt:
      "What does the worker print? Assume the enclosing method handles InterruptedException.",
    code: `Thread worker = Thread.startVirtualThread(
    () -> System.out.print(Thread.currentThread().isVirtual()));
worker.join();`,
    options: [
      {
        id: "A",
        text: "true",
        explanation:
          "Correct. startVirtualThread runs the task in a virtual thread.",
      },
      {
        id: "B",
        text: "false",
        explanation: "The code starts a virtual thread, not a platform thread.",
      },
      {
        id: "C",
        text: "Nothing, because virtual threads do not start automatically",
        explanation: "startVirtualThread both creates and starts the thread.",
      },
      {
        id: "D",
        text: "The code does not compile",
        explanation:
          "Both methods have been available since Java 21 and are present in Java 25.",
      },
    ],
    answer: ["A"],
    explanation:
      "Thread.startVirtualThread starts a virtual thread to execute the Runnable. isVirtual is therefore true inside that worker.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Thread.html#startVirtualThread(java.lang.Runnable)",
    tags: ["virtual threads", "Thread"],
  },
  {
    id: "CON-02",
    domain: "concurrency",
    difficulty: "Expert",
    type: "single",
    prompt:
      "What is the complete output of demo()? There are no spaces or newlines.",
    code: `static final ScopedValue<String> KEY = ScopedValue.newInstance();

static void demo() {
    ScopedValue.where(KEY, "outer").run(() -> {
        System.out.print(KEY.get());
        ScopedValue.where(KEY, "inner")
            .run(() -> System.out.print(KEY.get()));
        System.out.print(KEY.get());
    });
}`,
    options: [
      {
        id: "A",
        text: "outerinnerouter",
        explanation:
          "Correct. The nested binding applies only within the inner run call.",
      },
      {
        id: "B",
        text: "outerinnerinner",
        explanation:
          "The outer binding is restored after the inner run returns.",
      },
      {
        id: "C",
        text: "outerouterouter",
        explanation: "The nested binding temporarily shadows the outer value.",
      },
      {
        id: "D",
        text: "A NoSuchElementException is thrown",
        explanation: "KEY is bound during each get call.",
      },
    ],
    answer: ["A"],
    explanation:
      "ScopedValue bindings have a bounded dynamic scope. A nested where(...).run(...) can temporarily rebind the key; returning from it restores the enclosing binding.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ScopedValue.html",
    tags: ["Java 25", "scoped values", "nested binding"],
  },
  {
    id: "CON-03",
    domain: "concurrency",
    difficulty: "Applied",
    type: "multiple",
    prompt:
      "Which statements about `volatile int count` are true? Select all that apply.",
    options: [
      {
        id: "A",
        text: "A volatile write to count synchronizes-with every subsequent volatile read of count in synchronization order.",
        explanation:
          "Correct. This is the Java Memory Model rule for a write and later reads of the same volatile field.",
      },
      {
        id: "B",
        text: "count++ is one indivisible operation.",
        explanation:
          "The increment still performs a read, addition, and write; volatile does not make the whole compound action atomic.",
      },
      {
        id: "C",
        text: "Volatile reads and writes have synchronization semantics.",
        explanation:
          "Correct. They are synchronization actions under the Java Memory Model.",
      },
      {
        id: "D",
        text: "Declaring count volatile prevents every data race on unrelated fields.",
        explanation:
          "Volatile semantics apply to ordering around volatile accesses; they do not automatically protect arbitrary unrelated shared state.",
      },
    ],
    answer: ["A", "C"],
    explanation:
      "A volatile write synchronizes-with subsequent volatile reads of the same field, creating a happens-before edge. That does not make count++ atomic: concurrent increments can still read the same old value and lose an update.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html#jls-17.4.5",
    tags: ["volatile", "happens-before", "atomicity"],
  },
  {
    id: "IO-01",
    domain: "io",
    difficulty: "Applied",
    type: "single",
    prompt: "What is printed? Assume the file operations complete normally.",
    code: `var p = java.nio.file.Files.createTempFile("ocp-", ".txt");
try {
    java.nio.file.Files.writeString(p, "A");
    java.nio.file.Files.writeString(p, "B",
        java.nio.file.StandardOpenOption.APPEND);
    System.out.println(java.nio.file.Files.readString(p));
} finally {
    java.nio.file.Files.deleteIfExists(p);
}`,
    options: [
      {
        id: "A",
        text: "AB",
        explanation:
          "Correct. The first write stores A; the second opens the existing file for append and adds B.",
      },
      {
        id: "B",
        text: "B",
        explanation:
          "The APPEND option prevents the second write from replacing A.",
      },
      {
        id: "C",
        text: "A",
        explanation: "The second write adds B before the file is read.",
      },
      {
        id: "D",
        text: "An exception because APPEND cannot be used with writeString",
        explanation:
          "APPEND is a supported open option when writing to an existing file.",
      },
    ],
    answer: ["A"],
    explanation:
      "Files.writeString without explicit options creates or truncates a file. On the second call, APPEND writes B at the end of the existing file. readString returns AB.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Files.html#writeString(java.nio.file.Path,java.lang.CharSequence,java.nio.file.OpenOption...)",
    tags: ["Files", "writeString", "APPEND"],
  },
  {
    id: "IO-02",
    domain: "io",
    difficulty: "Foundation",
    type: "single",
    prompt: "What does this code print on any platform?",
    code: `var p = java.nio.file.Path.of("alpha", "..", "beta").normalize();
System.out.println(p.getFileName());`,
    options: [
      {
        id: "A",
        text: "beta",
        explanation:
          "Correct. normalize removes alpha/.. lexically, leaving beta as the final name.",
      },
      {
        id: "B",
        text: "..",
        explanation: "The parent-name pair is removed by normalization.",
      },
      {
        id: "C",
        text: "alpha",
        explanation: "alpha is removed together with the following .. element.",
      },
      {
        id: "D",
        text: "An exception because alpha need not exist",
        explanation:
          "normalize is lexical and does not check file-system existence.",
      },
    ],
    answer: ["A"],
    explanation:
      "Path.normalize removes redundant name elements such as a non-.. name followed by ... It performs no file-system lookup, and getFileName is beta.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Path.html#normalize()",
    tags: ["Path", "normalize", "lexical paths"],
  },
  {
    id: "IO-03",
    domain: "io",
    difficulty: "Applied",
    type: "multiple",
    prompt:
      "Which statements about `Files.lines(path)` are true? Select all that apply.",
    options: [
      {
        id: "A",
        text: "It returns a Stream<String> of lines.",
        explanation: "Correct. The API exposes file lines as a stream.",
      },
      {
        id: "B",
        text: "The returned stream should be closed, for example with try-with-resources.",
        explanation:
          "Correct. It has an open file as its source, and closing releases that resource.",
      },
      {
        id: "C",
        text: "Calling lines automatically reads every line before the stream is returned.",
        explanation: "The lines are read lazily as the stream is consumed.",
      },
      {
        id: "D",
        text: "Closing the stream deletes the file.",
        explanation:
          "Closing releases the open file resource; it does not delete the path.",
      },
    ],
    answer: ["A", "B"],
    explanation:
      "Files.lines opens a file-backed Stream<String>. It is lazily consumed and must be closed to release its file handle; try-with-resources is the intended usage pattern.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Files.html#lines(java.nio.file.Path)",
    tags: ["Files.lines", "streams", "resource management"],
  },
  {
    id: "LOC-01",
    domain: "localization",
    difficulty: "Foundation",
    type: "single",
    prompt: "What does the formatter produce?",
    code: `var day = java.time.LocalDate.of(2025, 1, 2);
var fmt = java.time.format.DateTimeFormatter.ofPattern("uuuu-MM-dd");
System.out.println(fmt.format(day));`,
    options: [
      {
        id: "A",
        text: "2025-01-02",
        explanation:
          "Correct. MM and dd each require two digits, so month and day are zero-padded.",
      },
      {
        id: "B",
        text: "2025-1-2",
        explanation:
          "Two pattern letters for month and day request two-digit output.",
      },
      {
        id: "C",
        text: "2025-02-01",
        explanation:
          "The pattern prints year, month, then day; it does not swap month and day.",
      },
      {
        id: "D",
        text: "The formatter rejects uuuu",
        explanation:
          "u is a supported year pattern letter in DateTimeFormatter.",
      },
    ],
    answer: ["A"],
    explanation:
      "The pattern uses proleptic year (uuuu), two-digit month (MM), and two-digit day (dd), separated by literal hyphens.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/format/DateTimeFormatter.html#patterns",
    tags: ["DateTimeFormatter", "pattern letters", "dates"],
  },
  {
    id: "LOC-02",
    domain: "localization",
    difficulty: "Applied",
    type: "single",
    prompt: "What does this locale code print?",
    code: `var locale = java.util.Locale.forLanguageTag("pt-BR");
System.out.println(locale.getLanguage() + "/" + locale.getCountry());`,
    options: [
      {
        id: "A",
        text: "pt/BR",
        explanation:
          "Correct. The language is lowercase pt and the country is uppercase BR.",
      },
      {
        id: "B",
        text: "PT/br",
        explanation:
          "Locale normalizes the language and country casing in the opposite way.",
      },
      {
        id: "C",
        text: "pt-BR/",
        explanation:
          "The BCP 47 tag is parsed into distinct language and country components.",
      },
      {
        id: "D",
        text: "A LocaleSyntaxException is thrown",
        explanation: "pt-BR is a well-formed language tag.",
      },
    ],
    answer: ["A"],
    explanation:
      "Locale.forLanguageTag parses the BCP 47 tag into the language pt and the region BR. getCountry returns the region code.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Locale.html#forLanguageTag(java.lang.String)",
    tags: ["Locale", "BCP 47", "language tag"],
  },
  {
    id: "LOC-03",
    domain: "localization",
    difficulty: "Expert",
    type: "single",
    prompt: "What does MessageFormat print?",
    code: `System.out.println(
    java.text.MessageFormat.format("'{0}' {0}", "Java"));`,
    options: [
      {
        id: "A",
        text: "{0} Java",
        explanation:
          "Correct. The quoted first token is literal text; the unquoted second token is substituted.",
      },
      {
        id: "B",
        text: "Java Java",
        explanation:
          "The apostrophes quote the first placeholder rather than allowing substitution.",
      },
      {
        id: "C",
        text: "'Java' Java",
        explanation:
          "The apostrophes are pattern quoting syntax and are not printed.",
      },
      {
        id: "D",
        text: "The code throws IllegalArgumentException",
        explanation: "The pattern is valid MessageFormat syntax.",
      },
    ],
    answer: ["A"],
    explanation:
      "MessageFormat uses single quotes to quote literal pattern text. Thus '{0}' prints the characters {0}, while the second {0} inserts Java.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/text/MessageFormat.html",
    tags: ["MessageFormat", "escaping", "resource messages"],
  },
];
