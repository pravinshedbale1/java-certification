import type { ExamObjectiveId } from "./objectives";
import type { Question, QuestionOption } from "./questions";

type Choice = [id: string, text: string, explanation: string];

const choices = (...items: Choice[]): QuestionOption[] =>
  items.map(([id, text, explanation]) => ({ id, text, explanation }));

const objectives = (...ids: ExamObjectiveId[]): ExamObjectiveId[] => ids;

const JLS = "https://docs.oracle.com/javase/specs/jls/se25/html/";
const API = "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/";
const MAN = "https://docs.oracle.com/en/java/javase/25/docs/specs/man/";

/** Depth items for rules the earlier banks did not exercise. Every answer key
 * was confirmed by compiling and running the code on JDK 25.0.1. */
export const depthQuestions: Question[] = [
  {
    id: "DP-VALUES-01",
    domain: "values",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `System.out.println(
    Math.round(-2.5) + " " +
    Math.round(2.5) + " " +
    Math.floorMod(-7, 3) + " " +
    (-7 % 3));`,
    options: choices(
      [
        "A",
        "-2 3 2 -1",
        "Correct. Math.round rounds half up toward positive infinity, floorMod takes the divisor's sign, and % takes the dividend's sign.",
      ],
      [
        "B",
        "-3 3 -1 -1",
        "Math.round does not round half away from zero, and floorMod differs from % when the signs differ.",
      ],
      [
        "C",
        "-3 3 2 -1",
        "Math.round(-2.5) is floor(-2.5 + 0.5), which is -2, not -3.",
      ],
      [
        "D",
        "-2 2 2 -1",
        "Math.round does not use banker's rounding; 2.5 rounds up to 3.",
      ],
    ),
    answer: ["A"],
    explanation:
      "Math.round(x) behaves like floor(x + 0.5), so -2.5 becomes -2 and 2.5 becomes 3. Math.floorMod(-7, 3) returns a result with the divisor's sign (2), while the remainder operator returns a result with the dividend's sign (-1).",
    sourceUrl: `${API}java/lang/Math.html#floorMod(int,int)`,
    tags: ["Math.round", "Math.floorMod", "remainder", "rounding"],
    objectives: objectives("val-primitives"),
  },
  {
    id: "DP-VALUES-02",
    domain: "values",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `import java.time.*;

Period p = Period.ofYears(1).ofMonths(2);
LocalDate due = LocalDate.of(2025, 1, 31).plus(p);
System.out.println(p + " " + due);`,
    options: choices(
      [
        "A",
        "P2M 2025-03-31",
        "Correct. ofMonths is static, so calling it on the Period from ofYears(1) discards that Period.",
      ],
      [
        "B",
        "P1Y2M 2026-03-31",
        "Period factory methods do not chain. ofMonths(2) creates a new Period and ignores the receiver.",
      ],
      [
        "C",
        "P2M 2025-03-28",
        "Adding two months to 31 January gives 31 March, which is a valid date, so no end-of-month adjustment happens.",
      ],
      [
        "D",
        "The code does not compile because a static method is called on an instance",
        "Java allows a static method to be called through an expression. It is legal but misleading.",
      ],
    ),
    answer: ["A"],
    explanation:
      "Period.ofYears and Period.ofMonths are static factories. Period.ofYears(1).ofMonths(2) evaluates the first call, then calls the static ofMonths, which returns P2M. To combine them, use Period.of(1, 2, 0) or ofYears(1).plusMonths(2).",
    sourceUrl: `${API}java/time/Period.html#ofMonths(int)`,
    tags: ["Period", "static method", "date arithmetic"],
    objectives: objectives("val-time"),
  },
  {
    id: "DP-VALUES-03",
    domain: "values",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt:
      "\\u2003 is EM SPACE, a Unicode whitespace character above U+0020. What is printed?",
    code: `String s = "\\u2003 hi \\u2003";
System.out.println(s.trim().length() + ":" + s.strip().length());`,
    options: choices(
      [
        "A",
        "6:2",
        "Correct. trim removes only characters up to U+0020, so it stops at the em spaces. strip removes all Unicode whitespace.",
      ],
      [
        "B",
        "2:2",
        "trim is not Unicode-aware. The first and last characters are above U+0020, so trim removes nothing.",
      ],
      [
        "C",
        "4:2",
        "trim works only from the ends inward and stops at the first character above U+0020. It never removes the inner ASCII spaces here.",
      ],
      [
        "D",
        "6:6",
        "strip uses Character.isWhitespace, which is true for EM SPACE, so it removes the em spaces and the ASCII spaces.",
      ],
    ),
    answer: ["A"],
    explanation:
      'String.trim removes leading and trailing characters whose code point is at most U+0020. String.strip, stripLeading and stripTrailing use Character.isWhitespace, which also recognizes Unicode spaces such as U+2003. The string has 6 characters and strip leaves only "hi".',
    sourceUrl: `${API}java/lang/String.html#strip()`,
    tags: ["String", "strip", "trim", "whitespace", "Unicode"],
    objectives: objectives("val-text"),
  },
  {
    id: "DP-VALUES-04",
    domain: "values",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt:
      "Which statements throw an exception at run time? Assume java.time.* is imported. Select all that apply.",
    options: choices(
      [
        "A",
        "LocalDate.of(2024, 2, 29);",
        "2024 is a leap year, so 29 February 2024 is a valid date.",
      ],
      [
        "B",
        "LocalDate.of(2025, 2, 29);",
        "Correct. 2025 is not a leap year, so the factory throws DateTimeException.",
      ],
      [
        "C",
        "LocalDate.of(2025, 1, 1).plus(Duration.ofDays(1));",
        "Correct. A Duration adds seconds and nanoseconds, and LocalDate has no time units, so this throws UnsupportedTemporalTypeException.",
      ],
      [
        "D",
        "LocalDateTime.of(2025, 1, 1, 0, 0).plus(Duration.ofDays(1));",
        "LocalDateTime supports time-based units, so adding a 24-hour Duration returns 2025-01-02T00:00.",
      ],
    ),
    answer: ["B", "C"],
    explanation:
      "Date factories check the calendar, so an invalid day-of-month fails immediately. Duration is time-based: adding one to a date-only type fails because LocalDate does not support seconds. Use Period.ofDays(1) or plusDays(1) for LocalDate.",
    sourceUrl: `${API}java/time/Duration.html#addTo(java.time.temporal.Temporal)`,
    tags: ["LocalDate", "Duration", "DateTimeException", "leap year"],
    objectives: objectives("val-time"),
  },
  {
    id: "DP-VALUES-05",
    domain: "values",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What happens when this code runs?",
    code: `boolean useCached = true;
Integer cached = null;
Integer chosen = useCached ? cached : 0;
System.out.println(chosen);`,
    options: choices(
      [
        "A",
        "It prints null",
        "The conditional is numeric, not a reference conditional, so the chosen operand is unboxed before assignment.",
      ],
      [
        "B",
        "It prints 0",
        "useCached is true, so the second operand is chosen, not 0.",
      ],
      [
        "C",
        "It throws NullPointerException",
        "Correct. With Integer and int operands, the conditional expression has type int, so unboxing null throws.",
      ],
      [
        "D",
        "It does not compile",
        "Mixing Integer and int in a conditional expression is legal; the problem appears only at run time.",
      ],
    ),
    answer: ["C"],
    explanation:
      "When one operand is Integer and the other is int, the conditional expression is numeric and has type int. The chosen Integer is unboxed, and cached.intValue() on null throws NullPointerException before the result would be re-boxed. Writing Integer.valueOf(0) as the third operand makes it a reference conditional.",
    sourceUrl: `${JLS}jls-15.html#jls-15.25`,
    tags: [
      "conditional operator",
      "unboxing",
      "NullPointerException",
      "numeric promotion",
    ],
    objectives: objectives("val-primitives"),
  },
  {
    id: "DP-FLOW-01",
    domain: "flow",
    difficulty: "Applied",
    type: "single",
    pattern: "compilation",
    prompt: "What is the result of compiling this method?",
    code: `static String route(String key) {
    final String a = "x";
    String b = "y";
    return switch (key) {
        case a -> "first";
        case b -> "second";
        default -> "other";
    };
}`,
    options: choices(
      [
        "A",
        'It compiles, and route("y") returns second',
        "A constant case label must be a constant expression. Being effectively final is not enough.",
      ],
      [
        "B",
        "It fails only because case a uses a local variable",
        "A final local initialized with a constant is a constant variable, so case a is legal.",
      ],
      [
        "C",
        "It fails because case b is not a constant expression",
        "Correct. b is not declared final, so it is not a constant variable, even though it is effectively final.",
      ],
      [
        "D",
        "It fails because switch expressions cannot switch on String",
        "String selectors have been allowed since Java 7 and work in switch expressions.",
      ],
    ),
    answer: ["C"],
    explanation:
      "A case constant must be a constant expression. A final variable of primitive or String type initialized with a constant expression is a constant variable, so a qualifies. b is only effectively final, and javac reports that a constant string expression is required.",
    sourceUrl: `${JLS}jls-4.html#jls-4.12.4`,
    tags: ["switch expression", "constant expression", "case label", "final"],
    objectives: objectives("flow-control"),
  },
  {
    id: "DP-FLOW-02",
    domain: "flow",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `enum Size { S, M, L }

static String label(Size size) {
    return switch (size) {
        case Size.S -> "small";
        case M -> "medium";
        case null, default -> "other";
    };
}

System.out.println(label(null) + "|" + label(Size.S) + "|" + label(Size.L));`,
    options: choices(
      [
        "A",
        "other|small|other",
        "Correct. case null, default handles both null and L; qualified and simple enum labels can be mixed.",
      ],
      [
        "B",
        "A NullPointerException is thrown by label(null)",
        "A switch throws for null only when there is no case null label. Here case null, default handles it.",
      ],
      [
        "C",
        "It does not compile because Size.S and M use different label forms",
        "Since Java 21, a case label may use a qualified enum constant name, and it can sit alongside simple names.",
      ],
      [
        "D",
        "It does not compile because case null cannot be combined with default",
        "case null, default is the form the language defines for handling null together with every other value.",
      ],
    ),
    answer: ["A"],
    explanation:
      "Java 21 allows qualified enum constants such as Size.S as case labels. The case null, default label matches null and any value not matched earlier. Without a case null label, switching on null would throw NullPointerException.",
    sourceUrl: `${JLS}jls-14.html#jls-14.11.1`,
    tags: ["switch expression", "enum", "case null", "qualified enum constant"],
    objectives: objectives("flow-control", "oop-enums"),
  },
  {
    id: "DP-FLOW-03",
    domain: "flow",
    difficulty: "Foundation",
    type: "single",
    pattern: "trace",
    prompt: "What happens when this code runs?",
    code: `int[] data = {1, 2, 3};
for (int v : data) v *= 10;
System.out.print(java.util.Arrays.toString(data));

int[] missing = null;
for (int v : missing) System.out.print(v);`,
    options: choices(
      [
        "A",
        "It prints [10, 20, 30], then throws NullPointerException",
        "v is a copy of each element, so assigning to it does not change the array.",
      ],
      [
        "B",
        "It prints [1, 2, 3], then throws NullPointerException",
        "Correct. The loop variable is a local copy, and an enhanced for over a null array throws.",
      ],
      [
        "C",
        "It prints [1, 2, 3] and completes normally because a null array has no elements",
        "An enhanced for reads the array's length, so a null array throws instead of running zero times.",
      ],
      [
        "D",
        "It does not compile because v is assigned inside an enhanced for",
        "The loop variable is not implicitly final. Assigning to it compiles but only changes the local copy.",
      ],
    ),
    answer: ["B"],
    explanation:
      "For arrays, the enhanced for copies each element into the loop variable, so v *= 10 changes only that copy. The loop evaluates the array expression and reads its length, so a null array reference throws NullPointerException.",
    sourceUrl: `${JLS}jls-14.html#jls-14.14.2`,
    tags: ["enhanced for", "loop variable", "arrays", "NullPointerException"],
    objectives: objectives("flow-control"),
  },
  {
    id: "DP-FLOW-04",
    domain: "flow",
    difficulty: "Expert",
    type: "multiple",
    pattern: "compilation",
    prompt: "Which methods compile? Select all that apply.",
    options: choices(
      [
        "A",
        "static int a() { while (true) { } }",
        "Correct. The loop can never complete normally, so the method needs no return statement.",
      ],
      [
        "B",
        "static int b() { while (true) { break; } }",
        "The break lets the loop complete normally, so the method can reach its end without returning an int.",
      ],
      [
        "C",
        'static void c() { for (;;); System.out.println("done"); }',
        "A for loop with no condition and no break cannot complete normally, so the print statement is unreachable.",
      ],
      [
        "D",
        'static void d() { if (false) { System.out.println("never"); } }',
        "Correct. if is deliberately exempt from the constant-condition reachability rule, which allows conditional-compilation idioms.",
      ],
    ),
    answer: ["A", "D"],
    explanation:
      "Reachability analysis treats while (true) and for (;;) without a reachable break as never completing normally. Code after them is unreachable, and a method ending in one needs no return. if (false) is an intentional exception: its body is considered reachable.",
    sourceUrl: `${JLS}jls-14.html#jls-14.22`,
    tags: ["reachability", "unreachable statement", "missing return", "while"],
    objectives: objectives("flow-control"),
  },
  {
    id: "DP-FLOW-05",
    domain: "flow",
    difficulty: "Applied",
    type: "single",
    pattern: "compilation",
    prompt: "What is the result of compiling this method?",
    code: `static void show(Object value) {
    switch (value) {
        case String s -> System.out.println(s);
        case Integer i -> System.out.println(i);
    }
}`,
    options: choices(
      [
        "A",
        "It compiles; other values are ignored, as in a traditional switch statement",
        "The exemption from exhaustiveness applies only to old-style switch statements with constant labels on legacy selector types.",
      ],
      [
        "B",
        "It fails because a switch statement that uses patterns must be exhaustive",
        "Correct. Once a switch statement uses pattern labels, it must cover every possible value of Object.",
      ],
      [
        "C",
        "It compiles but throws MatchException for a Double",
        "The exhaustiveness check happens at compile time, so this code never runs.",
      ],
      [
        "D",
        "It fails because arrow labels require a switch expression",
        "Switch statements can use arrow labels too.",
      ],
    ),
    answer: ["B"],
    explanation:
      "An enhanced switch statement, one that uses patterns, null labels, or a selector type other than the legacy types, must be exhaustive. Add case Object o or default. javac reports that the switch statement does not cover all possible input values.",
    sourceUrl: `${JLS}jls-14.html#jls-14.11.2`,
    tags: ["pattern switch", "switch statement", "exhaustiveness"],
    objectives: objectives("flow-control"),
  },
  {
    id: "DP-OOP-01",
    domain: "oop",
    difficulty: "Foundation",
    type: "multiple",
    pattern: "compilation",
    prompt: "Which declarations compile? Select all that apply.",
    options: choices(
      [
        "A",
        "abstract class A { abstract void run() { } }",
        "An abstract method must end with a semicolon; it cannot have a body.",
      ],
      [
        "B",
        "abstract class B { B() { } }",
        "Correct. Abstract classes can have constructors; subclasses call them through super().",
      ],
      [
        "C",
        "abstract class C { private abstract void run(); }",
        "A private method cannot be overridden, so it can never be implemented. abstract and private are an illegal combination.",
      ],
      [
        "D",
        "abstract class D implements Runnable { }",
        "Correct. An abstract class can leave interface methods unimplemented for its concrete subclasses.",
      ],
    ),
    answer: ["B", "D"],
    explanation:
      "Abstract classes may have constructors, fields and concrete methods, and may leave inherited abstract methods unimplemented. An abstract method has no body and cannot be private, static or final, because each of those would stop a subclass from implementing it.",
    sourceUrl: `${JLS}jls-8.html#jls-8.4.3.1`,
    tags: ["abstract class", "abstract method", "modifiers", "constructor"],
    objectives: objectives("oop-inheritance"),
  },
  {
    id: "DP-OOP-02",
    domain: "oop",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt: "Which statements are true? Select all that apply.",
    code: `// File a/Base.java
package a;
public class Base {
    protected int value = 1;
}

// File b/Child.java
package b;
import a.Base;
public class Child extends Base {
    void test(Base other, Child peer) {
        int x = value;        // line 1
        int y = peer.value;   // line 2
        int z = other.value;  // line 3
    }
}`,
    options: choices(
      [
        "A",
        "Line 1 compiles",
        "Correct. A subclass can access an inherited protected member through this.",
      ],
      [
        "B",
        "Line 2 compiles",
        "Correct. From another package, protected access is allowed through a reference of type Child or a subclass of Child.",
      ],
      [
        "C",
        "Line 3 compiles",
        "other has type Base, not Child. Code outside package a cannot access protected members through a plain Base reference.",
      ],
      [
        "D",
        "Line 3 would compile if Child were declared in package a",
        "Correct. protected includes package access, so code in package a can use other.value.",
      ],
    ),
    answer: ["A", "B", "D"],
    explanation:
      'Outside its package, a protected member is available only to subclass code, and only through references whose type is that subclass or one of its subclasses. javac rejects line 3 with "value has protected access in Base". Inside the declaring package, protected also allows package access.',
    sourceUrl: `${JLS}jls-6.html#jls-6.6.2.1`,
    tags: ["protected", "access", "packages", "inheritance"],
    objectives: objectives("oop-inheritance", "oop-scope"),
  },
  {
    id: "DP-OOP-03",
    domain: "oop",
    difficulty: "Applied",
    type: "multiple",
    pattern: "compilation",
    prompt: "Which record declarations compile? Select all that apply.",
    options: choices(
      [
        "A",
        "record P(int x) { int y; }",
        "Records cannot declare instance fields beyond their components.",
      ],
      [
        "B",
        "record P(int x) { static int count; }",
        "Correct. Records can declare static fields, static methods and static initializers.",
      ],
      [
        "C",
        "record P(int x) { int x() { return x; } }",
        "An explicit accessor must be public, so package access makes this an invalid accessor.",
      ],
      [
        "D",
        "record P(int x) implements Comparable<P> { public int compareTo(P o) { return Integer.compare(x, o.x); } }",
        "Correct. Records can implement interfaces; only extending another class is forbidden.",
      ],
    ),
    answer: ["B", "D"],
    explanation:
      "A record's state is exactly its components, so extra instance fields are illegal. Static members are allowed. An explicitly declared accessor must be public, return the component type, take no parameters and have no throws clause. Records are implicitly final and extend Record, but they may implement interfaces.",
    sourceUrl: `${JLS}jls-8.html#jls-8.10.3`,
    tags: ["records", "accessor", "record fields", "interfaces"],
    objectives: objectives("oop-classes"),
  },
  {
    id: "DP-OOP-04",
    domain: "oop",
    difficulty: "Foundation",
    type: "single",
    pattern: "api",
    prompt: "What happens when this code runs?",
    code: `enum Level { LOW, HIGH }

System.out.print(Level.valueOf("HIGH").ordinal() + " ");
System.out.print(Level.valueOf("high"));`,
    options: choices(
      [
        "A",
        "It prints 1 HIGH",
        'valueOf matches the constant name exactly, including case, so "high" does not match.',
      ],
      [
        "B",
        "It prints 1 and then throws IllegalArgumentException",
        "Correct. Ordinals start at 0, and valueOf throws when no constant has exactly that name.",
      ],
      [
        "C",
        "It prints 2 and then throws IllegalArgumentException",
        "Ordinals are zero-based. HIGH is the second constant, so its ordinal is 1.",
      ],
      [
        "D",
        "It prints 1 null",
        "valueOf never returns null. An unknown name throws IllegalArgumentException, and a null name throws NullPointerException.",
      ],
    ),
    answer: ["B"],
    explanation:
      "The compiler-generated valueOf(String) returns the constant whose name matches exactly and is case-sensitive. An unknown name throws IllegalArgumentException. ordinal() is zero-based and follows declaration order.",
    sourceUrl: `${JLS}jls-8.html#jls-8.9.3`,
    tags: ["enum", "valueOf", "ordinal", "IllegalArgumentException"],
    objectives: objectives("oop-enums"),
  },
  {
    id: "DP-OOP-05",
    domain: "oop",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt: "Which two statements are correct?",
    code: `class Point {
    final int x;
    Point(int x) { this.x = x; }

    @Override
    public boolean equals(Object o) {
        return o instanceof Point p && p.x == x;
    }
}

var set = new java.util.HashSet<Point>();
set.add(new Point(1));
set.add(new Point(1));
System.out.println(set.size());`,
    options: choices(
      [
        "A",
        "Point breaks the Object contract because equal objects must have equal hash codes",
        "Correct. equals was overridden without hashCode, so two equal Points almost certainly have different identity hash codes.",
      ],
      [
        "B",
        "HashSet is guaranteed to detect the duplicate because equals is overridden",
        "HashSet uses hashCode to choose a bucket before calling equals, so it usually never compares the two Points.",
      ],
      [
        "C",
        "The code can print 2, and it does on a typical JVM",
        "Correct. With inherited identity hash codes, the equal Points usually land in different buckets.",
      ],
      [
        "D",
        "The code does not compile because overriding equals requires overriding hashCode",
        "The compiler does not enforce the contract. It is a run-time correctness rule.",
      ],
    ),
    answer: ["A", "C"],
    explanation:
      "The general contract requires equal objects to return equal hashCode values. Hash-based collections find a bucket by hashCode before checking equals, so overriding only equals makes HashSet and HashMap unreliable. On JDK 25 this code prints 2. Records generate consistent equals and hashCode automatically.",
    sourceUrl: `${API}java/lang/Object.html#hashCode()`,
    tags: ["equals", "hashCode", "HashSet", "Object contract"],
    objectives: objectives("oop-classes"),
  },
  {
    id: "DP-EXCEPTIONS-01",
    domain: "exceptions",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `class Res implements AutoCloseable {
    public void close() { System.out.print("close "); }
}

try (Res r = null) {
    System.out.print("body ");
}
System.out.print("after");`,
    options: choices(
      [
        "A",
        "body close after",
        "close() is called only for resources that are not null.",
      ],
      [
        "B",
        "body after",
        "Correct. A null resource is allowed; try-with-resources skips closing it.",
      ],
      [
        "C",
        "body, then NullPointerException when the resource is closed",
        "The generated code checks for null before calling close(), so nothing throws.",
      ],
      [
        "D",
        "It does not compile because a resource cannot be initialized to null",
        "The resource only has to be AutoCloseable; null is a legal initializer.",
      ],
    ),
    answer: ["B"],
    explanation:
      "The translation of try-with-resources closes a resource only if it is not null. A resource initialized to null is allowed and never closed, so the body runs and execution continues normally.",
    sourceUrl: `${JLS}jls-14.html#jls-14.20.3.1`,
    tags: ["try-with-resources", "null resource", "AutoCloseable"],
    objectives: objectives("exceptions"),
  },
  {
    id: "DP-EXCEPTIONS-02",
    domain: "exceptions",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `class Config {
    static int value = Integer.parseInt("x");
}

try {
    System.out.println(Config.value);
} catch (NumberFormatException e) {
    System.out.println("NFE");
} catch (ExceptionInInitializerError e) {
    System.out.println("EIIE:" + e.getCause().getClass().getSimpleName());
}`,
    options: choices(
      [
        "A",
        "NFE",
        "An exception thrown during static initialization is wrapped before it reaches the code that triggered initialization.",
      ],
      [
        "B",
        "EIIE:NumberFormatException",
        "Correct. The JVM wraps the NumberFormatException in ExceptionInInitializerError and keeps it as the cause.",
      ],
      [
        "C",
        "0",
        "Class initialization does not finish, so the default value is never exposed.",
      ],
      [
        "D",
        "It does not compile because a static initializer cannot throw",
        "Static initializers may throw unchecked exceptions; only checked exceptions are forbidden there.",
      ],
    ),
    answer: ["B"],
    explanation:
      "If a class initializer ends abruptly with an exception that is not an Error, the JVM throws ExceptionInInitializerError with the original exception as its cause. The class is marked erroneous, and later attempts to use it throw NoClassDefFoundError.",
    sourceUrl: `${JLS}jls-12.html#jls-12.4.2`,
    tags: [
      "ExceptionInInitializerError",
      "static initializer",
      "class initialization",
      "cause",
    ],
    objectives: objectives("exceptions"),
  },
  {
    id: "DP-EXCEPTIONS-03",
    domain: "exceptions",
    difficulty: "Expert",
    type: "single",
    pattern: "compilation",
    prompt: "What is the result of compiling this method?",
    code: `static void run() {
    try (AutoCloseable r = () -> System.out.print("closed")) {
        System.out.print("body ");
    }
}`,
    options: choices(
      [
        "A",
        "It compiles, and run() prints body closed",
        "The compiler checks the resource's declared type, AutoCloseable, not what the lambda actually does.",
      ],
      [
        "B",
        "It fails because AutoCloseable.close() declares throws Exception, which run() neither catches nor declares",
        "Correct. The implicit close() call can throw Exception according to the declared resource type.",
      ],
      [
        "C",
        "It fails because a lambda cannot initialize a resource",
        "AutoCloseable has one abstract method, so a lambda is a valid resource initializer.",
      ],
      [
        "D",
        "It compiles because the lambda body throws no checked exception",
        "Exception checking uses the static type AutoCloseable, whose close() declares Exception.",
      ],
    ),
    answer: ["B"],
    explanation:
      "try-with-resources calls close() through the resource's declared type. AutoCloseable.close() is declared throws Exception, so the method must catch or declare Exception. Declaring a narrower type, such as an interface whose close() throws nothing, removes that requirement.",
    sourceUrl: `${JLS}jls-14.html#jls-14.20.3`,
    tags: [
      "try-with-resources",
      "AutoCloseable",
      "checked exception",
      "lambda",
    ],
    objectives: objectives("exceptions"),
  },
  {
    id: "DP-EXCEPTIONS-04",
    domain: "exceptions",
    difficulty: "Applied",
    type: "single",
    pattern: "compilation",
    prompt: "What is the result of compiling this method?",
    code: `static void save(java.util.List<String> lines) throws java.io.IOException {
    lines.forEach(line -> {
        if (line.isBlank()) throw new java.io.IOException("blank");
    });
}`,
    options: choices(
      [
        "A",
        "It compiles because save declares throws IOException",
        "The throw is inside the lambda, which implements Consumer.accept, not inside save itself.",
      ],
      [
        "B",
        "It fails because Consumer.accept cannot throw the checked IOException",
        "Correct. A lambda body may throw only the checked exceptions its functional interface method declares.",
      ],
      [
        "C",
        "It compiles, and the IOException is wrapped in UncheckedIOException automatically",
        "Java never wraps checked exceptions automatically. You must wrap them yourself.",
      ],
      [
        "D",
        "It fails because a lambda body cannot contain a throw statement",
        "Lambdas may throw unchecked exceptions, and checked ones the functional interface allows.",
      ],
    ),
    answer: ["B"],
    explanation:
      "A lambda's body is checked against its functional interface's method. Consumer.accept declares no checked exceptions, so throwing IOException is an unreported exception, regardless of the enclosing method's throws clause. Use a loop, catch inside the lambda, or wrap it in UncheckedIOException.",
    sourceUrl: `${JLS}jls-11.html#jls-11.2.3`,
    tags: ["lambda", "checked exception", "Consumer", "throws"],
    objectives: objectives("exceptions", "stream-lambdas"),
  },
  {
    id: "DP-EXCEPTIONS-05",
    domain: "exceptions",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `static int value() {
    int x = 1;
    try {
        return x;
    } finally {
        x = 5;
        System.out.print("finally:" + x + " ");
    }
}

System.out.println(value());`,
    options: choices(
      [
        "A",
        "finally:5 5",
        "The return value is evaluated and saved before finally runs, so later changes to x do not affect it.",
      ],
      [
        "B",
        "finally:5 1",
        "Correct. return x saves 1, finally runs and changes only the local variable, then 1 is returned.",
      ],
      ["C", "1", "A finally block runs even when the try block returns."],
      [
        "D",
        "finally:1 1",
        "The finally block assigns x = 5 before printing, so it prints 5.",
      ],
    ),
    answer: ["B"],
    explanation:
      "A return statement evaluates its expression before control passes to finally. Reassigning a primitive local in finally cannot change the saved value. Only a return statement in finally would replace it, which is legal but discouraged. For a mutable object, finally could still change its state.",
    sourceUrl: `${JLS}jls-14.html#jls-14.20.2`,
    tags: ["finally", "return", "evaluation order"],
    objectives: objectives("exceptions"),
  },
  {
    id: "DP-COLLECTIONS-01",
    domain: "collections",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What happens when this code runs?",
    code: `List<String> names = new ArrayList<>(List.of("a", "b", "c"));
for (String n : names) {
    if (n.equals("b")) names.remove(n);
}
System.out.println(names);`,
    options: choices(
      [
        "A",
        "It throws ConcurrentModificationException",
        "Removing the second-to-last element makes hasNext() return false, so next() never runs its modification check.",
      ],
      [
        "B",
        "It prints [a, c]",
        "Correct. After the removal, the size (2) equals the cursor (2), so the loop stops before any fail-fast check.",
      ],
      ["C", "It prints [a, b, c]", 'names.remove(n) runs and removes "b".'],
      [
        "D",
        "It does not compile because the list is modified inside an enhanced for",
        "The compiler does not track this; modifying the list is a run-time problem.",
      ],
    ),
    answer: ["B"],
    explanation:
      'ArrayList\'s iterator checks for modification in next(), not in hasNext(). Removing "b" leaves two elements with the cursor at 2, so the loop ends quietly and "c" is never visited. Removing "a" instead throws ConcurrentModificationException. Fail-fast behavior is best-effort, so use Iterator.remove or removeIf.',
    sourceUrl: `${API}java/util/ArrayList.html`,
    tags: [
      "ConcurrentModificationException",
      "fail-fast iterator",
      "ArrayList",
      "enhanced for",
    ],
    objectives: objectives("coll-core"),
  },
  {
    id: "DP-COLLECTIONS-02",
    domain: "collections",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt: "What is printed?",
    code: `var map = new TreeMap<Integer, String>(Map.of(10, "a", 20, "b", 30, "c"));
System.out.println(map.floorKey(25) + " " + map.ceilingKey(30) + " " +
    map.higherKey(30) + " " + map.headMap(20) + " " + map.tailMap(20));`,
    options: choices(
      [
        "A",
        "20 30 null {10=a} {20=b, 30=c}",
        "Correct. ceiling includes an equal key, higher is strict, headMap excludes its bound, and tailMap includes it.",
      ],
      [
        "B",
        "20 30 30 {10=a, 20=b} {20=b, 30=c}",
        "higherKey is strictly greater, so it returns null here, and headMap(to) excludes to.",
      ],
      [
        "C",
        "30 30 null {10=a} {30=c}",
        "floorKey returns the greatest key at most 25, which is 20, and tailMap(from) includes from.",
      ],
      [
        "D",
        "20 null null {10=a} {20=b, 30=c}",
        "ceilingKey includes an equal key, so ceilingKey(30) is 30.",
      ],
    ),
    answer: ["A"],
    explanation:
      "floor and ceiling include an equal key, while lower and higher are strict. The one-argument headMap(to) excludes to, and tailMap(from) includes from. These navigation methods return null when no key qualifies.",
    sourceUrl: `${API}java/util/NavigableMap.html`,
    tags: ["TreeMap", "NavigableMap", "floorKey", "headMap", "tailMap"],
    objectives: objectives("coll-core"),
  },
  {
    id: "DP-COLLECTIONS-03",
    domain: "collections",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `var words = new ArrayList<>(List.of("bb", "a", "ccc", "aa"));
words.sort(Comparator.comparing(String::length)
    .thenComparing(Comparator.naturalOrder())
    .reversed());
System.out.println(words);`,
    options: choices(
      [
        "A",
        "[ccc, bb, aa, a]",
        "Correct. reversed() reverses the whole composed comparator, so both length and alphabetical order are descending.",
      ],
      [
        "B",
        "[ccc, aa, bb, a]",
        "reversed() applies to the complete chain, not only to the length comparison.",
      ],
      [
        "C",
        "[a, aa, bb, ccc]",
        "This is the order before reversed() is applied.",
      ],
      [
        "D",
        "[a, bb, aa, ccc]",
        "Length becomes descending, so ccc comes first.",
      ],
    ),
    answer: ["A"],
    explanation:
      "Comparator methods build a new comparator at each step. reversed() at the end reverses everything built so far: length and the tie-breaker. To reverse only the tie-breaker, pass Comparator.reverseOrder() to thenComparing.",
    sourceUrl: `${API}java/util/Comparator.html#reversed()`,
    tags: ["Comparator", "thenComparing", "reversed", "sort"],
    objectives: objectives("coll-core"),
  },
  {
    id: "DP-COLLECTIONS-04",
    domain: "collections",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt:
      "Which statements throw NullPointerException? Assume java.util.* is imported. Select all that apply.",
    options: choices(
      [
        "A",
        "new HashMap<String, Integer>().put(null, 1);",
        "HashMap allows one null key and null values.",
      ],
      [
        "B",
        "new TreeMap<String, Integer>().put(null, 1);",
        "Correct. A TreeMap using natural ordering must compare keys, so a null key throws.",
      ],
      [
        "C",
        'Map<String, Integer> m = Map.of("k", null);',
        "Correct. Unmodifiable collections from factory methods reject null keys and values.",
      ],
      [
        "D",
        "new ArrayDeque<String>().offer(null);",
        'Correct. ArrayDeque rejects null elements because null means "empty" to poll and peek.',
      ],
    ),
    answer: ["B", "C", "D"],
    explanation:
      "Null support differs by implementation. HashMap and ArrayList accept null. TreeMap with natural ordering, the List/Set/Map.of factories, ArrayDeque and ConcurrentHashMap reject it. ArrayDeque needs null to signal an empty deque from poll and peek.",
    sourceUrl: `${API}java/util/Map.html#unmodifiable`,
    tags: ["null", "HashMap", "TreeMap", "Map.of", "ArrayDeque"],
    objectives: objectives("coll-core", "coll-deque"),
  },
  {
    id: "DP-COLLECTIONS-05",
    domain: "collections",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt: "What is printed?",
    code: `int[] a = {1, 2, 3};
int[] b = {1, 2, 4};
System.out.println(
    a.equals(new int[] {1, 2, 3}) + " " +
    Arrays.equals(a, new int[] {1, 2, 3}) + " " +
    Arrays.compare(a, b) + " " +
    Arrays.mismatch(a, b));`,
    options: choices(
      [
        "A",
        "false true -1 2",
        "Correct. Array equals compares identity, Arrays.equals compares contents, compare works element by element, and mismatch returns the first differing index.",
      ],
      [
        "B",
        "true true -1 2",
        "Arrays do not override equals, so a.equals(...) compares references.",
      ],
      [
        "C",
        "false true -1 3",
        "mismatch returns the zero-based index of the first difference, which is 2.",
      ],
      [
        "D",
        "false false 1 2",
        "Arrays.equals compares contents, and 3 is less than 4, so compare is negative.",
      ],
    ),
    answer: ["A"],
    explanation:
      "Arrays inherit Object.equals, so separate arrays are never equal. Arrays.equals compares elements. Arrays.compare returns the comparison at the first difference, here -1 because 3 < 4. Arrays.mismatch returns that difference's index, or -1 if the arrays are equal.",
    sourceUrl: `${API}java/util/Arrays.html#mismatch(int%5B%5D,int%5B%5D)`,
    tags: ["arrays", "Arrays.equals", "Arrays.compare", "Arrays.mismatch"],
    objectives: objectives("coll-arrays"),
  },
  {
    id: "DP-STREAMS-01",
    domain: "streams",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `static String fallback() {
    System.out.print("[fallback]");
    return "x";
}

var found = Optional.of("java");
System.out.print(found.orElse(fallback()) + " ");
System.out.println(found.orElseGet(() -> fallback()));`,
    options: choices(
      [
        "A",
        "java java",
        "orElse's argument is an ordinary expression, evaluated before the call even when the Optional has a value.",
      ],
      [
        "B",
        "[fallback]java java",
        "Correct. orElse always evaluates fallback(); orElseGet calls its supplier only when the Optional is empty.",
      ],
      [
        "C",
        "[fallback]java [fallback]java",
        "orElseGet delays the call and skips it because a value is present.",
      ],
      [
        "D",
        "java [fallback]java",
        "It is the other way round: orElse evaluates its argument eagerly, and orElseGet is lazy.",
      ],
    ),
    answer: ["B"],
    explanation:
      "Method arguments are evaluated before the method runs, so orElse(fallback()) always calls fallback(). orElseGet takes a Supplier and calls it only for an empty Optional. Prefer orElseGet when the fallback is expensive or has side effects.",
    sourceUrl: `${API}java/util/Optional.html#orElseGet(java.util.function.Supplier)`,
    tags: ["Optional", "orElse", "orElseGet", "Supplier", "evaluation order"],
    objectives: objectives("stream-lambdas", "stream-reduce"),
  },
  {
    id: "DP-STREAMS-02",
    domain: "streams",
    difficulty: "Foundation",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `Function<Integer, Integer> twice = x -> x * 2;
Function<Integer, Integer> plus3 = x -> x + 3;
System.out.println(
    twice.compose(plus3).apply(1) + " " +
    twice.andThen(plus3).apply(1));`,
    options: choices(
      [
        "A",
        "8 5",
        "Correct. compose runs its argument first, (1 + 3) * 2; andThen runs it afterwards, 1 * 2 + 3.",
      ],
      [
        "B",
        "5 8",
        "compose applies plus3 before twice, giving 8; andThen applies plus3 after twice, giving 5.",
      ],
      [
        "C",
        "8 8",
        "compose and andThen apply the two functions in opposite orders.",
      ],
      ["D", "5 5", "compose applies its argument function first."],
    ),
    answer: ["A"],
    explanation:
      "f.compose(g) is x -> f(g(x)): the argument runs first. f.andThen(g) is x -> g(f(x)): the argument runs last. So twice.compose(plus3) gives (1 + 3) * 2 = 8 and twice.andThen(plus3) gives 1 * 2 + 3 = 5.",
    sourceUrl: `${API}java/util/function/Function.html#compose(java.util.function.Function)`,
    tags: ["Function", "compose", "andThen", "functional interface"],
    objectives: objectives("stream-lambdas"),
  },
  {
    id: "DP-STREAMS-03",
    domain: "streams",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt: "Which two statements are correct?",
    code: `long n = java.util.List.of(1, 2, 3).stream()
    .peek(x -> System.out.print(x))
    .count();
System.out.println(":" + n);`,
    options: choices(
      [
        "A",
        "The peek action is guaranteed to run for every element",
        "count() may skip running the pipeline when it can get the count directly from the source.",
      ],
      [
        "B",
        "The implementation may skip peek because the source's size is known",
        "Correct. On JDK 25 this prints only :3, because no element passes through peek.",
      ],
      [
        "C",
        "n is 3 whether or not the peek action runs",
        "Correct. Skipping the pipeline is allowed only when it cannot change the count.",
      ],
      [
        "D",
        "Adding .filter(x -> x > 0) before peek still lets count() skip peek",
        "A filter makes the count unknown in advance, so the elements must pass through the pipeline. With the filter, 123 is printed.",
      ],
    ),
    answer: ["B", "C"],
    explanation:
      "Stream.count() documents that it may not run the pipeline if it can compute the count directly from the source. Operations such as peek or map may then never run. Do not rely on side effects in intermediate operations; use forEach for actions that must happen.",
    sourceUrl: `${API}java/util/stream/Stream.html#count()`,
    tags: ["peek", "count", "laziness", "side effects"],
    objectives: objectives("stream-transform", "stream-reduce"),
  },
  {
    id: "DP-STREAMS-04",
    domain: "streams",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt: "What is printed?",
    code: `var summary = Stream.of(4, 1, 7).collect(Collectors.teeing(
    Collectors.counting(),
    Collectors.summingInt(x -> x),
    (count, sum) -> sum + "/" + count));
var joined = Stream.of("a", "b").collect(Collectors.joining(",", "[", "]"));
System.out.println(summary + " " + joined);`,
    options: choices(
      [
        "A",
        "12/3 [a,b]",
        "Correct. teeing sends each element to both collectors and merges the results; joining adds the delimiter, prefix and suffix.",
      ],
      [
        "B",
        "3/12 [a,b]",
        'The merger receives the results in collector order (count, sum) but builds sum + "/" + count.',
      ],
      [
        "C",
        "12/3 [a, b]",
        'joining inserts exactly the delimiter given, ",", with no extra space.',
      ],
      [
        "D",
        "12/3 a,b",
        "The three-argument joining adds the prefix and suffix.",
      ],
    ),
    answer: ["A"],
    explanation:
      "Collectors.teeing passes every element to two downstream collectors and combines their results with a BiFunction, all in one pass. Collectors.joining(delimiter, prefix, suffix) puts the delimiter between elements and wraps the whole result.",
    sourceUrl: `${API}java/util/stream/Collectors.html#teeing(java.util.stream.Collector,java.util.stream.Collector,java.util.function.BiFunction)`,
    tags: ["Collectors.teeing", "Collectors.joining", "collector"],
    objectives: objectives("stream-reduce"),
  },
  {
    id: "DP-STREAMS-05",
    domain: "streams",
    difficulty: "Applied",
    type: "multiple",
    pattern: "compilation",
    prompt:
      "Which declarations compile? Assume java.util.* and java.util.function.* are imported. Select all that apply.",
    options: choices(
      [
        "A",
        "BiFunction<String, String, Boolean> same = String::equalsIgnoreCase;",
        "Correct. For an unbound instance method reference, the first parameter is the receiver and the second is the argument.",
      ],
      [
        "B",
        "Supplier<List<String>> make = ArrayList::new;",
        "Correct. A constructor reference matches Supplier's no-argument get(), and ArrayList<String> is a List<String>.",
      ],
      [
        "C",
        "ToIntFunction<String> size = String::length;",
        "Correct. ToIntFunction<String>.applyAsInt(String) returns int, matching the receiver.length() form.",
      ],
      [
        "D",
        "UnaryOperator<String> size = String::length;",
        "UnaryOperator<String> must return a String, but length() returns int, so the method reference has a bad return type.",
      ],
    ),
    answer: ["A", "B", "C"],
    explanation:
      "A method reference compiles when its parameters and return type fit the functional interface method. Unbound instance references such as String::length use the first parameter as the receiver. UnaryOperator<T> needs T -> T, so a String -> int reference is rejected.",
    sourceUrl: `${JLS}jls-15.html#jls-15.13.1`,
    tags: [
      "method reference",
      "functional interface",
      "ToIntFunction",
      "UnaryOperator",
    ],
    objectives: objectives("stream-lambdas"),
  },
  {
    id: "DP-PACKAGING-01",
    domain: "packaging",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt: "Which two statements are correct?",
    code: `// com.example.impl/module-info.java
module com.example.impl {
    requires com.example.api;
    provides com.example.api.Greeter
        with com.example.impl.FriendlyGreeter;
}

// FriendlyGreeter has only a private constructor and this method:
public static FriendlyGreeter provider() {
    return new FriendlyGreeter("provider");
}`,
    options: choices(
      [
        "A",
        "ServiceLoader gets the provider by calling the public static provider() method",
        "Correct. A module's provider class may supply a public static no-argument provider() method instead of a public constructor.",
      ],
      [
        "B",
        "com.example.impl must also export com.example.impl for ServiceLoader to create FriendlyGreeter",
        "provides ... with gives ServiceLoader access. The provider's package can and usually should stay unexported.",
      ],
      [
        "C",
        "The module that looks up Greeter must declare uses com.example.api.Greeter",
        "Correct. Without a uses directive, a named module's ServiceLoader.load call throws ServiceConfigurationError.",
      ],
      [
        "D",
        "Deployment fails because a provider class must have a public no-argument constructor",
        "That requirement applies only when there is no public static provider() method.",
      ],
    ),
    answer: ["A", "C"],
    explanation:
      "For providers deployed as modules, ServiceLoader calls a public static provider() method when one exists; otherwise it uses a public no-argument constructor. The provider's package does not need to be exported. Consumers declare uses, and the provider module declares provides ... with.",
    sourceUrl: `${API}java/util/ServiceLoader.html`,
    tags: ["ServiceLoader", "provides", "uses", "provider method"],
    objectives: objectives("pkg-modules"),
  },
  {
    id: "DP-PACKAGING-02",
    domain: "packaging",
    difficulty: "Applied",
    type: "single",
    pattern: "compilation",
    prompt: "What is the result of compiling these two modules together?",
    code: `// a/module-info.java
module a { requires b; }

// b/module-info.java
module b { requires a; }`,
    options: choices(
      [
        "A",
        "Both modules compile; each can read the other",
        "Module dependencies must form an acyclic graph.",
      ],
      [
        "B",
        "Compilation fails with a cyclic dependence error",
        'Correct. javac reports "cyclic dependence involving b".',
      ],
      [
        "C",
        "Compilation succeeds, but module resolution fails when the program starts",
        "The cycle is detected at compile time, before any launch.",
      ],
      [
        "D",
        "Compilation succeeds if one directive is changed to requires transitive",
        "requires transitive changes readability for downstream modules; it does not allow a cycle.",
      ],
    ),
    answer: ["B"],
    explanation:
      "A module declaration must not depend on itself, directly or indirectly. javac rejects a cycle of requires directives. The usual fix is to move the shared types into a third module that both require.",
    sourceUrl: `${JLS}jls-7.html#jls-7.7.1`,
    tags: ["JPMS", "requires", "cyclic dependence", "module graph"],
    objectives: objectives("pkg-modules"),
  },
  {
    id: "DP-PACKAGING-03",
    domain: "packaging",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt:
      "com.example.app is packaged as mods/com.example.app.jar. Which commands print its module descriptor? Select all that apply.",
    options: choices(
      [
        "A",
        "jar --file mods/com.example.app.jar --describe-module",
        "Correct. jar reads module-info.class from the JAR and prints requires, uses, contains and main-class.",
      ],
      [
        "B",
        "java -p mods --describe-module com.example.app",
        "Correct. The launcher finds the module on the module path, prints its descriptor and exits (short form: -d).",
      ],
      [
        "C",
        "javac --describe-module com.example.app",
        "javac has no --describe-module option; it reports an invalid flag.",
      ],
      [
        "D",
        "jdeps --list-modules mods",
        "--list-modules belongs to java. jdeps rejects it as unknown; its related options are --list-deps and --list-reduced-deps.",
      ],
    ),
    answer: ["A", "B"],
    explanation:
      "Both jar --describe-module (-d) and java --describe-module (-d) print a module's descriptor. java --list-modules lists observable modules, and jdeps analyzes dependencies. javac compiles and does not describe modules.",
    sourceUrl: `${MAN}jar.html`,
    tags: ["jar", "java launcher", "describe-module", "module descriptor"],
    objectives: objectives("pkg-deploy", "pkg-modules"),
  },
  {
    id: "DP-PACKAGING-04",
    domain: "packaging",
    difficulty: "Expert",
    type: "multiple",
    pattern: "scenario",
    prompt:
      "The modular JAR was created with the command shown, and all required modules are in mods. Which commands run com.example.app.Main? Select all that apply.",
    code: `jar --create --file mods/com.example.app.jar \\
    --main-class com.example.app.Main \\
    -C out/com.example.app .`,
    options: choices(
      [
        "A",
        "java -p mods -m com.example.app",
        "Correct. --main-class recorded the main class in the module descriptor, so the module name alone is enough.",
      ],
      [
        "B",
        "java -p mods -m com.example.app/com.example.app.Main",
        "Correct. Naming the main class explicitly also works and overrides any recorded main class.",
      ],
      [
        "C",
        "java -p mods com.example.app.Main",
        "Without -m, the launcher looks for the class on the class path, which is empty, so it cannot find Main.",
      ],
      [
        "D",
        "java -cp mods/com.example.app.jar -m com.example.app",
        "-m looks up modules on the module path, not the class path, so the boot layer cannot find com.example.app.",
      ],
    ),
    answer: ["A", "B"],
    explanation:
      "jar --main-class stores the main class in module-info.class (and in the manifest). java -m module uses that recorded class, and java -m module/class names it explicitly. Modules must come from the module path, not the class path.",
    sourceUrl: `${MAN}java.html`,
    tags: ["java launcher", "-m", "main class", "module path"],
    objectives: objectives("pkg-deploy"),
  },
  {
    id: "DP-PACKAGING-05",
    domain: "packaging",
    difficulty: "Expert",
    type: "single",
    pattern: "scenario",
    prompt:
      "com.example.model exports package com.example.model but does not open it. A class-path library calls setAccessible(true) on the private field Account.balance and fails with InaccessibleObjectException. Which option added to the command lets the reflection succeed without editing module-info.java?",
    code: `java -p mods --add-modules com.example.model -cp lib/inspect.jar Inspect`,
    options: choices(
      [
        "A",
        "--add-exports com.example.model/com.example.model=ALL-UNNAMED",
        "The package is already exported. Exporting grants compile-time and public access, not deep reflection on private members.",
      ],
      [
        "B",
        "--add-opens com.example.model/com.example.model=ALL-UNNAMED",
        "Correct. Opening the package to class-path code allows deep reflection, including setAccessible on private fields.",
      ],
      [
        "C",
        "--add-reads com.example.model=ALL-UNNAMED",
        "Readability controls which modules a module can depend on. It does not grant reflective access to private members.",
      ],
      [
        "D",
        "No option is needed because the unnamed module reads every module",
        "Reading a module is not enough for deep reflection. The target package must also be open.",
      ],
    ),
    answer: ["B"],
    explanation:
      "exports gives access to public types at compile time and run time. Only opens, or --add-opens on the command line, allows private members to be reflected on. ALL-UNNAMED is the target for class-path code. With --add-exports alone the same InaccessibleObjectException is thrown.",
    sourceUrl: `${MAN}java.html`,
    tags: ["--add-opens", "reflection", "opens", "exports", "unnamed module"],
    objectives: objectives("pkg-modules"),
  },
  {
    id: "DP-CONCURRENCY-01",
    domain: "concurrency",
    difficulty: "Foundation",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `Thread t = new Thread(() ->
    System.out.print(Thread.currentThread().getName()));
t.setName("worker");
t.run();
System.out.println(":" + t.getState());`,
    options: choices(
      [
        "A",
        "worker:TERMINATED",
        "run() is an ordinary method call. It does not start a new thread.",
      ],
      [
        "B",
        "main:NEW",
        "Correct. The Runnable runs on the calling thread, and t was never started.",
      ],
      [
        "C",
        "worker:NEW",
        "Thread.currentThread() is the thread calling run(), here main, not the Thread object t.",
      ],
      [
        "D",
        "main:TERMINATED",
        "A thread that was never started stays NEW. Calling run() does not change its state.",
      ],
    ),
    answer: ["B"],
    explanation:
      "Only start() creates a new thread of execution, which then calls run(). Calling run() directly runs the task on the current thread, so currentThread().getName() is main and t stays NEW.",
    sourceUrl: `${API}java/lang/Thread.html#run()`,
    tags: ["Thread", "run", "start", "thread state"],
    objectives: objectives("conc-tasks"),
  },
  {
    id: "DP-CONCURRENCY-02",
    domain: "concurrency",
    difficulty: "Foundation",
    type: "single",
    pattern: "trace",
    prompt:
      "What happens when this code runs? Assume the enclosing method declares throws Exception.",
    code: `Thread t = new Thread(() -> System.out.print("run "));
t.start();
t.join();
t.start();`,
    options: choices(
      [
        "A",
        "It prints run run",
        "A Thread object can be started only once, even after it finishes.",
      ],
      [
        "B",
        "It prints run and then throws IllegalThreadStateException",
        "Correct. The second start() is on a terminated thread and throws.",
      ],
      [
        "C",
        "It throws IllegalThreadStateException before printing anything",
        "The first start() is legal and join() waits for the output.",
      ],
      [
        "D",
        "It prints run; the second start() is silently ignored",
        "Thread.start() throws instead of ignoring a repeated start.",
      ],
    ),
    answer: ["B"],
    explanation:
      "Thread.start() throws IllegalThreadStateException if the thread was already started, whether it is still running or has terminated. To run the work again, create a new Thread or submit the Runnable to an executor.",
    sourceUrl: `${API}java/lang/Thread.html#start()`,
    tags: ["Thread", "start", "IllegalThreadStateException", "lifecycle"],
    objectives: objectives("conc-tasks"),
  },
  {
    id: "DP-CONCURRENCY-03",
    domain: "concurrency",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt: "What happens when this code runs?",
    code: `Thread v = Thread.ofVirtual().unstarted(() -> { });
System.out.print(v.isDaemon() + " ");
v.setDaemon(false);`,
    options: choices(
      [
        "A",
        "It prints false and completes",
        "Virtual threads are always daemon threads.",
      ],
      [
        "B",
        "It prints true and then throws IllegalArgumentException",
        "Correct. setDaemon(false) is rejected because a virtual thread cannot be a non-daemon thread.",
      ],
      [
        "C",
        "It prints true and completes; the thread becomes non-daemon",
        "Virtual threads keep daemon status; setDaemon(false) throws.",
      ],
      [
        "D",
        "It prints false and then throws IllegalThreadStateException",
        "The thread is daemon, and the failure is an IllegalArgumentException, not a state problem.",
      ],
    ),
    answer: ["B"],
    explanation:
      "Virtual threads are daemon threads, so they do not keep the JVM alive. Thread.setDaemon(false) on a virtual thread throws IllegalArgumentException. Wait for virtual threads with join() or a closing executor instead of relying on daemon status.",
    sourceUrl: `${API}java/lang/Thread.html#setDaemon(boolean)`,
    tags: [
      "virtual threads",
      "daemon",
      "Thread.Builder",
      "IllegalArgumentException",
    ],
    objectives: objectives("conc-tasks"),
  },
  {
    id: "DP-CONCURRENCY-04",
    domain: "concurrency",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt: "What is printed?",
    code: `var permits = new java.util.concurrent.Semaphore(2);
System.out.print(permits.tryAcquire() + " " +
    permits.tryAcquire() + " " + permits.tryAcquire() + " ");
permits.release(3);
System.out.println(permits.availablePermits());`,
    options: choices(
      [
        "A",
        "true true false 3",
        "Correct. Two permits are taken, the third tryAcquire fails, and releasing 3 brings the count from 0 to 3.",
      ],
      [
        "B",
        "true true false 2",
        "A Semaphore does not cap permits at the initial count; release can increase it.",
      ],
      [
        "C",
        "true true true 3",
        "With no permits left, tryAcquire() returns false immediately instead of waiting.",
      ],
      [
        "D",
        "true true false, then IllegalStateException from release(3)",
        "Releasing more permits than were acquired is allowed; Semaphore does not track owners.",
      ],
    ),
    answer: ["A"],
    explanation:
      "A Semaphore is a counter of permits. tryAcquire() takes one if available and otherwise returns false without blocking. Any thread may release any number of permits, even beyond the initial count, so availablePermits() is 3.",
    sourceUrl: `${API}java/util/concurrent/Semaphore.html#release(int)`,
    tags: ["Semaphore", "tryAcquire", "release", "permits"],
    objectives: objectives("conc-safety"),
  },
  {
    id: "DP-CONCURRENCY-05",
    domain: "concurrency",
    difficulty: "Expert",
    type: "multiple",
    pattern: "scenario",
    prompt:
      "This code has a data race. Which replacements always produce a list with all 1,000 values? Assume java.util.* and java.util.stream.* are imported. Select all that apply.",
    code: `var result = new ArrayList<Integer>();
IntStream.range(0, 1000).parallel().forEach(result::add);`,
    options: choices(
      [
        "A",
        "List<Integer> result = IntStream.range(0, 1000).parallel().boxed().toList();",
        "Correct. A reduction lets the stream combine per-thread results safely, with no shared mutable state.",
      ],
      [
        "B",
        "var result = Collections.synchronizedList(new ArrayList<Integer>()); then forEach(result::add)",
        "Correct. Each add is synchronized, so no value is lost, although the order is unpredictable.",
      ],
      [
        "C",
        "var result = new ArrayList<Integer>(); then forEachOrdered(result::add)",
        "Correct. forEachOrdered runs the actions one at a time in encounter order, with happens-before between them.",
      ],
      [
        "D",
        "Keep forEach(result::add) but store result in a volatile field",
        "volatile makes the reference visible but does not make ArrayList.add thread-safe.",
      ],
    ),
    answer: ["A", "B", "C"],
    explanation:
      "ArrayList.add from several threads can lose elements or corrupt the list. Collecting with toList() or a collector is the best fix. A synchronized list makes each add atomic, and forEachOrdered processes the actions one at a time in order. A volatile reference does not protect the list's internal state.",
    sourceUrl: `${API}java/util/stream/package-summary.html#SideEffects`,
    tags: [
      "parallel stream",
      "thread safety",
      "forEachOrdered",
      "synchronizedList",
    ],
    objectives: objectives("conc-parallel", "conc-safety"),
  },
  {
    id: "DP-IO-01",
    domain: "io",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt: "On a Unix-like default file system, what is printed?",
    code: `Path base = Path.of("/data/app");
System.out.println(
    base.resolve("/tmp/x") + " " +
    base.resolveSibling("logs") + " " +
    Path.of("/a/b/c/d").subpath(1, 3) + " " +
    Path.of("/a/b/c").getNameCount());`,
    options: choices(
      [
        "A",
        "/tmp/x /data/logs b/c 3",
        "Correct. Resolving an absolute path returns it unchanged, subpath indexes names from 0 and excludes the end, and the root is not counted.",
      ],
      [
        "B",
        "/data/app/tmp/x /data/app/logs b/c 3",
        "resolve returns an absolute argument unchanged, and resolveSibling resolves against the parent, /data.",
      ],
      [
        "C",
        "/tmp/x /data/logs a/b 3",
        "Name index 0 is a, so subpath(1, 3) returns names 1 and 2: b/c.",
      ],
      [
        "D",
        "/tmp/x /data/logs b/c 4",
        "The root / is not a name element. /a/b/c has three names.",
      ],
    ),
    answer: ["A"],
    explanation:
      "Path.resolve returns its argument when that argument is absolute. resolveSibling resolves against the parent directory. Name elements exclude the root: /a/b/c/d has names a, b, c, d at indexes 0 to 3, and subpath(begin, end) excludes end and returns a relative path.",
    sourceUrl: `${API}java/nio/file/Path.html#resolve(java.nio.file.Path)`,
    tags: ["Path", "resolve", "resolveSibling", "subpath", "getNameCount"],
    objectives: objectives("io-nio"),
  },
  {
    id: "DP-IO-02",
    domain: "io",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt:
      "Child is serialized after its fields are set to base = 7 and own = 8, then deserialized. What is printed?",
    code: `class Base {
    int base = 1;
    Base() { System.out.print("Base "); base = 5; }
}
class Child extends Base implements Serializable {
    int own = 2;
    Child() { System.out.print("Child "); own = 9; }
}

// new Child() is created (printing "Base Child "), base set to 7, own set to 8,
// written with ObjectOutputStream, then "| " is printed and it is read back:
Child restored = (Child) in.readObject();
System.out.println(restored.base + ":" + restored.own);`,
    options: choices(
      [
        "A",
        "Base Child | 7:8",
        "Fields declared in a non-serializable superclass are not written to the stream.",
      ],
      [
        "B",
        "Base Child | Base 5:8",
        "Correct. Deserialization runs the no-argument constructor of the first non-serializable superclass (Base), then restores Child's fields from the stream.",
      ],
      [
        "C",
        "Base Child | Base Child 5:9",
        "Constructors of Serializable classes do not run during deserialization, and own comes from the stream.",
      ],
      [
        "D",
        "Base Child | 1:8",
        "The Base constructor runs during deserialization, so its body sets base to 5.",
      ],
    ),
    answer: ["B"],
    explanation:
      "Deserialization calls the no-argument constructor of the closest non-serializable superclass, running its field initializers and constructor body. Serializable subclasses' constructors and initializers are skipped, and their fields are read from the stream. The non-serializable superclass must have an accessible no-argument constructor.",
    sourceUrl: `${API}java/io/Serializable.html`,
    tags: ["serialization", "deserialization", "constructor", "superclass"],
    objectives: objectives("io-serialization"),
  },
  {
    id: "DP-IO-03",
    domain: "io",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt:
      "The working directory is empty. The statements run in order A, B, C, D, and each continues after any exception. Which statements throw? Select all that apply.",
    options: choices(
      [
        "A",
        'Files.createDirectory(Path.of("demo/a/b"));',
        "Correct. createDirectory does not create missing parents, so it throws NoSuchFileException.",
      ],
      [
        "B",
        'Files.createDirectories(Path.of("demo/a/b"));',
        "createDirectories creates every missing directory in the path.",
      ],
      [
        "C",
        'Files.createDirectories(Path.of("demo/a/b"));  // again',
        "createDirectories does not fail when the directory already exists.",
      ],
      [
        "D",
        'Files.delete(Path.of("demo"));',
        "Correct. demo contains a, so delete throws DirectoryNotEmptyException.",
      ],
    ),
    answer: ["A", "D"],
    explanation:
      "createDirectory creates one directory: it throws NoSuchFileException if the parent is missing and FileAlreadyExistsException if the target exists. createDirectories creates parents and accepts an existing directory. delete removes only empty directories, and deleteIfExists has the same rule.",
    sourceUrl: `${API}java/nio/file/Files.html#createDirectories(java.nio.file.Path,java.nio.file.attribute.FileAttribute...)`,
    tags: [
      "Files.createDirectory",
      "Files.createDirectories",
      "Files.delete",
      "NIO.2",
    ],
    objectives: objectives("io-nio"),
  },
  {
    id: "DP-IO-04",
    domain: "io",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt:
      "Directory tree contains a.txt, b.txt and a subdirectory sub that contains c.txt. What is printed? Assume the enclosing method declares throws IOException.",
    code: `var dir = Path.of("tree");
try (var shallow = Files.walk(dir, 1);
     var listed = Files.list(dir);
     var deep = Files.walk(dir);
     var self = Files.walk(dir, 0)) {
    System.out.println(shallow.count() + " " + listed.count() + " " +
        deep.count() + " " + self.count());
}`,
    options: choices(
      [
        "A",
        "3 3 5 0",
        "Files.walk always includes the starting directory, even with maxDepth 0.",
      ],
      [
        "B",
        "4 3 5 1",
        "Correct. walk includes the start directory, list returns only its entries, and walk with depth 0 returns only the start.",
      ],
      [
        "C",
        "4 4 5 1",
        "Files.list does not include the directory itself: a.txt, b.txt and sub make 3.",
      ],
      [
        "D",
        "4 3 4 1",
        "An unlimited walk visits tree, a.txt, b.txt, sub and sub/c.txt: 5 paths.",
      ],
    ),
    answer: ["B"],
    explanation:
      "Files.walk(start, maxDepth) includes start at depth 0 and goes at most maxDepth levels below it. Files.list returns only the directory's direct entries, not recursively. All of these streams hold open directory handles, so close them with try-with-resources.",
    sourceUrl: `${API}java/nio/file/Files.html#walk(java.nio.file.Path,int,java.nio.file.FileVisitOption...)`,
    tags: ["Files.walk", "Files.list", "maxDepth", "file tree"],
    objectives: objectives("io-nio"),
  },
  {
    id: "DP-IO-05",
    domain: "io",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `var in = new java.io.ByteArrayInputStream(new byte[] {(byte) 0xFF, 65});
int first = in.read();
int second = in.read();
int third = in.read();
System.out.println(first + " " + second + " " + third);`,
    options: choices(
      [
        "A",
        "-1 65 -1",
        "read() returns each byte as an unsigned value from 0 to 255, so 0xFF is 255, not -1.",
      ],
      [
        "B",
        "255 65 -1",
        "Correct. Bytes are returned as unsigned 0 to 255, and -1 is kept for end of stream.",
      ],
      [
        "C",
        "255 65 0",
        "End of stream is -1, which is why read() returns int instead of byte.",
      ],
      [
        "D",
        "-1 65, then EOFException",
        "InputStream.read() returns -1 at end of stream. EOFException is for DataInput methods such as readInt.",
      ],
    ),
    answer: ["B"],
    explanation:
      "InputStream.read() returns an int from 0 to 255 for data and -1 at end of stream, so byte 0xFF can be told apart from EOF. Casting the result to byte too early turns 255 into -1 and breaks that check.",
    sourceUrl: `${API}java/io/InputStream.html#read()`,
    tags: ["InputStream", "read", "end of stream", "unsigned byte"],
    objectives: objectives("io-streams"),
  },
  {
    id: "DP-LOCALIZATION-01",
    domain: "localization",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt: "What is printed?",
    code: `var shortForm = NumberFormat.getCompactNumberInstance(
    Locale.US, NumberFormat.Style.SHORT);
var longForm = NumberFormat.getCompactNumberInstance(
    Locale.US, NumberFormat.Style.LONG);
System.out.println(shortForm.format(1_250_000) + "|" +
    longForm.format(1_250_000) + "|" +
    shortForm.format(1_500) + "|" + shortForm.format(999));`,
    options: choices(
      [
        "A",
        "1.25M|1.25 million|1.5K|999",
        "The default compact format shows no fraction digits unless setMaximumFractionDigits is called.",
      ],
      [
        "B",
        "1M|1 million|2K|999",
        "Correct. Values round to whole units with HALF_EVEN, so 1.25M becomes 1M and 1.5K becomes 2K. 999 is below the first threshold.",
      ],
      [
        "C",
        "1M|1 million|1K|999",
        "HALF_EVEN rounds 1.5 to the even neighbour 2, not down to 1.",
      ],
      [
        "D",
        "1M|1M|2K|999",
        'The LONG style uses the full word, so it prints "1 million".',
      ],
    ),
    answer: ["B"],
    explanation:
      "CompactNumberFormat abbreviates by locale: SHORT gives 1M or 2K and LONG gives 1 million. By default it formats zero fraction digits and rounds with RoundingMode.HALF_EVEN. Values below the smallest compact pattern, such as 999, are printed in full.",
    sourceUrl: `${API}java/text/CompactNumberFormat.html`,
    tags: [
      "CompactNumberFormat",
      "NumberFormat.Style",
      "rounding",
      "HALF_EVEN",
    ],
    objectives: objectives("loc-numbers"),
  },
  {
    id: "DP-LOCALIZATION-02",
    domain: "localization",
    difficulty: "Foundation",
    type: "single",
    pattern: "api",
    prompt: "What happens when this code runs?",
    code: `var f = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
System.out.println(LocalDate.of(2025, 1, 2).format(f));`,
    options: choices(
      [
        "A",
        "It prints 2025-01-02 00:00",
        "A LocalDate has no time-of-day, and formatting does not invent midnight.",
      ],
      [
        "B",
        "It throws UnsupportedTemporalTypeException",
        "Correct. HH asks for HourOfDay, which LocalDate does not support.",
      ],
      [
        "C",
        "It prints 2025-01-02 because missing time fields are skipped",
        "The formatter prints every field in the pattern and throws when one is unavailable.",
      ],
      [
        "D",
        "It throws DateTimeParseException",
        "Nothing is being parsed. The failure happens while formatting.",
      ],
    ),
    answer: ["B"],
    explanation:
      "Each pattern letter reads a field from the temporal object. LocalDate supports date fields only, so HH (HourOfDay) causes UnsupportedTemporalTypeException: Unsupported field: HourOfDay. Format a LocalDateTime, or use a date-only pattern.",
    sourceUrl: `${API}java/time/format/DateTimeFormatter.html#patterns`,
    tags: [
      "DateTimeFormatter",
      "LocalDate",
      "pattern letters",
      "UnsupportedTemporalTypeException",
    ],
    objectives: objectives("loc-messages"),
  },
  {
    id: "DP-LOCALIZATION-03",
    domain: "localization",
    difficulty: "Expert",
    type: "single",
    pattern: "api",
    prompt: "What is printed?",
    code: `Locale.setDefault(Locale.US);
Locale.setDefault(Locale.Category.FORMAT, Locale.GERMANY);
System.out.println(NumberFormat.getInstance().format(1234.5) + " " +
    Locale.GERMANY.getDisplayCountry() + " " + Locale.getDefault());`,
    options: choices(
      [
        "A",
        "1,234.5 Germany en_US",
        "NumberFormat.getInstance() uses the FORMAT default, which is now de_DE.",
      ],
      [
        "B",
        "1.234,5 Deutschland de_DE",
        "getDisplayCountry() uses the DISPLAY default, which is still en_US, and Locale.getDefault() did not change.",
      ],
      [
        "C",
        "1.234,5 Germany en_US",
        "Correct. Formatting uses the FORMAT category, display names use DISPLAY, and getDefault() returns the general default.",
      ],
      [
        "D",
        "1.234,5 Germany de_DE",
        "Setting a category default does not change the value returned by Locale.getDefault().",
      ],
    ),
    answer: ["C"],
    explanation:
      "Locale.setDefault(Locale) sets the general default and both categories. setDefault(Locale.Category, Locale) sets only that category: FORMAT is used by formatters, and DISPLAY is used for display names. Locale.getDefault() without a category is unchanged.",
    sourceUrl: `${API}java/util/Locale.html#setDefault(java.util.Locale.Category,java.util.Locale)`,
    tags: ["Locale.Category", "default locale", "NumberFormat", "display name"],
    objectives: objectives("loc-bundles", "loc-numbers"),
  },
  {
    id: "DP-LOCALIZATION-04",
    domain: "localization",
    difficulty: "Expert",
    type: "single",
    pattern: "scenario",
    prompt:
      "The class path contains the bundles described and no others. What does the lookup print?",
    code: `// Messages.properties:    greeting=root
// Messages_fr.properties: greeting=from properties
// Messages_fr.class:      a ListResourceBundle mapping greeting to "from class"

var bundle = ResourceBundle.getBundle("Messages", Locale.FRANCE);
System.out.println(bundle.getString("greeting"));`,
    options: choices(
      [
        "A",
        "from class",
        "Correct. For each candidate name, a class-based bundle is tried before a properties file of the same name.",
      ],
      [
        "B",
        "from properties",
        "The properties file is used only if no class named Messages_fr is found.",
      ],
      [
        "C",
        "root",
        "Messages_fr exists, so the fr candidate is found before the root bundle.",
      ],
      [
        "D",
        "MissingResourceException because Messages_fr_FR does not exist",
        "A missing fr_FR bundle is not an error. The lookup falls back to fr.",
      ],
    ),
    answer: ["A"],
    explanation:
      "For fr_FR, getBundle tries Messages_fr_FR, then Messages_fr, then the root. For each name, the default control loads a ResourceBundle class first and falls back to a .properties file. So the ListResourceBundle Messages_fr wins over Messages_fr.properties.",
    sourceUrl: `${API}java/util/ResourceBundle.html#getBundle(java.lang.String,java.util.Locale,java.lang.ClassLoader)`,
    tags: [
      "ResourceBundle",
      "ListResourceBundle",
      "properties",
      "candidate locales",
    ],
    objectives: objectives("loc-bundles"),
  },
  {
    id: "DP-LOCALIZATION-05",
    domain: "localization",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt: "Which two statements are correct?",
    code: `var date = LocalDate.of(2025, 3, 7);
var shortStyle = DateTimeFormatter.ofLocalizedDate(FormatStyle.SHORT);
String us = date.format(shortStyle.withLocale(Locale.US));
String uk = date.format(shortStyle.withLocale(Locale.UK));

var full = DateTimeFormatter.ofLocalizedDateTime(FormatStyle.FULL)
    .withLocale(Locale.US);
String text = LocalDateTime.of(2025, 3, 7, 9, 30).format(full);`,
    options: choices(
      [
        "A",
        "us is 3/7/25 and uk is 07/03/2025",
        "Correct. Localized styles use each locale's order and width conventions for day, month and year.",
      ],
      [
        "B",
        "us and uk are identical because FormatStyle.SHORT fixes the pattern",
        "FormatStyle picks a length; the actual pattern comes from the locale.",
      ],
      [
        "C",
        "Formatting the LocalDateTime with FULL throws DateTimeException because the full time style needs a time zone",
        "Correct. FULL and LONG time styles include a zone name, and a LocalDateTime has no ZoneId.",
      ],
      [
        "D",
        "text contains the system default time zone name",
        "Formatting never falls back to the system zone. Without a ZoneId it throws.",
      ],
    ),
    answer: ["A", "C"],
    explanation:
      "ofLocalizedDate and ofLocalizedDateTime produce locale-specific patterns, such as month/day/year in the US and day/month/year in the UK. The FULL and LONG time styles print a zone, so formatting a LocalDateTime throws DateTimeException: Unable to extract ZoneId. Use a ZonedDateTime or a MEDIUM/SHORT style.",
    sourceUrl: `${API}java/time/format/DateTimeFormatter.html#ofLocalizedDateTime(java.time.format.FormatStyle)`,
    tags: ["FormatStyle", "DateTimeFormatter", "localized format", "ZoneId"],
    objectives: objectives("loc-messages"),
  },
];
