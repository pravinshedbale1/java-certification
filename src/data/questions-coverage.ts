import type { ExamObjectiveId } from "./objectives";
import type { Question, QuestionOption } from "./questions";

type Choice = [id: string, text: string, explanation: string];

const choices = (...items: Choice[]): QuestionOption[] =>
  items.map(([id, text, explanation]) => ({ id, text, explanation }));

const objectives = (...ids: ExamObjectiveId[]): ExamObjectiveId[] => ids;

const JLS = "https://docs.oracle.com/javase/specs/jls/se25/html/";
const API = "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/";

/** Objective-annotated adaptive-practice items for closing syllabus gaps. */
export const coverageQuestions: Question[] = [
  {
    id: "CV-VALUES-01",
    domain: "values",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `Integer a = 127;
Integer b = 127;
Integer c = 128;
Integer d = 128;

int score = (a == b ? 1 : 0) + (c.equals(d) ? 10 : 0);
double quotient = (double) (5 / 2);
System.out.println(score + ":" + quotient);`,
    options: choices(
      [
        "A",
        "11:2.0",
        "Correct. Required Integer caching makes a and b identical, equals compares c and d by value, and integer division occurs before the cast.",
      ],
      [
        "B",
        "1:2.5",
        "Integer.equals reports equal numeric values for c and d, and casting after 5 / 2 cannot restore the discarded fraction.",
      ],
      [
        "C",
        "11:2.5",
        "The cast applies to the already evaluated integer quotient 2, not to either division operand.",
      ],
      [
        "D",
        "1:2.0",
        "Although identity for separately boxed 128 values is not tested here, Integer.equals is guaranteed to compare their values as equal.",
      ],
    ),
    answer: ["A"],
    explanation:
      "Boxing constant int values from -128 through 127 must reuse identical wrapper instances, so a == b is true. Integer.equals compares both 128 values numerically, and 5 / 2 yields int 2 before conversion to double.",
    sourceUrl: `${JLS}jls-5.html#jls-5.1.7`,
    tags: ["Integer cache", "boxing", "identity", "integer division", "cast"],
    objectives: objectives("val-primitives"),
  },
  {
    id: "CV-VALUES-02",
    domain: "values",
    difficulty: "Foundation",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `StringBuilder builder = new StringBuilder("ace");
builder.insert(1, 'b');
builder.replace(2, 3, "C");

String snapshot = builder.toString();
builder.append('d');

System.out.println(snapshot + "|" + builder);`,
    options: choices(
      [
        "A",
        "abCe|abCed",
        "Correct. The builder is abCe when the immutable String snapshot is created, then only the builder receives d.",
      ],
      [
        "B",
        "abCed|abCed",
        "A String returned by toString does not remain a live view of later StringBuilder mutations.",
      ],
      [
        "C",
        "abc|abcd",
        "replace uses the half-open range [2,3) and inserts uppercase C; it does not remove the final e.",
      ],
      [
        "D",
        "The code throws IndexOutOfBoundsException",
        "After insertion the builder has four characters, so the replace range from 2 through 3 is valid.",
      ],
    ),
    answer: ["A"],
    explanation:
      "Insertion produces abce and replacement of index 2 alone produces abCe. toString creates an independent immutable String, while append mutates only the builder to abCed.",
    sourceUrl: `${API}java/lang/StringBuilder.html#replace(int,int,java.lang.String)`,
    tags: ["StringBuilder", "String", "mutation", "half-open range"],
    objectives: objectives("val-text"),
  },
  {
    id: "CV-VALUES-03",
    domain: "values",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What is printed for the America/New_York zone?",
    code: `import java.time.Duration;
import java.time.Period;
import java.time.ZoneId;
import java.time.ZonedDateTime;

var start = ZonedDateTime.of(
    2025, 3, 8, 12, 0, 0, 0,
    ZoneId.of("America/New_York"));
var byPeriod = start.plus(Period.ofDays(1));
var byDuration = start.plus(Duration.ofDays(1));
long hours = Duration.between(start, byPeriod).toHours();

System.out.println(byPeriod.toLocalTime() + ":" +
    byDuration.toLocalTime() + ":" + hours);`,
    options: choices(
      [
        "A",
        "12:00:12:00:24",
        "A Period preserves the local time across the spring transition, but only 23 elapsed hours separate these two zoned values.",
      ],
      [
        "B",
        "12:00:13:00:23",
        "Correct. The calendar day lands at noon, while an exact 24-hour duration lands at 13:00 after the lost DST hour.",
      ],
      [
        "C",
        "13:00:12:00:24",
        "This reverses the calendar-based and time-based effects of Period and Duration.",
      ],
      [
        "D",
        "An exception is thrown at the daylight-saving transition",
        "Noon exists on both dates; the zone rules adjust the offset without making either result invalid.",
      ],
    ),
    answer: ["B"],
    explanation:
      "Period.ofDays(1) advances the local date and retains noon, which spans only 23 timeline hours when clocks spring forward. Duration.ofDays(1) adds exactly 24 hours and reaches 13:00.",
    sourceUrl: `${API}java/time/ZonedDateTime.html#plus(java.time.temporal.TemporalAmount)`,
    tags: ["Period", "Duration", "ZonedDateTime", "DST"],
    objectives: objectives("val-time"),
  },
  {
    id: "CV-VALUES-04",
    domain: "values",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt: "What is printed?",
    code: `import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

Instant original = Instant.parse("2025-06-01T01:02:03.900Z");
Instant result = original
    .truncatedTo(ChronoUnit.SECONDS)
    .plusMillis(1_500);
long difference = Duration.between(original, result).toMillis();

System.out.println(result + "|" + difference);`,
    options: choices(
      [
        "A",
        "2025-06-01T01:02:04.500Z|600",
        "Correct. Truncation first drops 900 ms, then 1,500 ms is added, leaving the result 600 ms after the original.",
      ],
      [
        "B",
        "2025-06-01T01:02:05.400Z|1500",
        "That would add 1,500 ms without applying the preceding truncation.",
      ],
      [
        "C",
        "2025-06-01T01:02:04Z|100",
        "plusMillis retains fractional milliseconds; it does not truncate a second time.",
      ],
      [
        "D",
        "The code fails because Instant cannot be truncated to seconds",
        "Seconds divide evenly into a standard day and are a supported truncation unit for Instant.",
      ],
    ),
    answer: ["A"],
    explanation:
      "The truncated instant is 01:02:03Z. Adding 1.5 seconds produces 01:02:04.500Z, which is 600 milliseconds later than the original 01:02:03.900Z.",
    sourceUrl: `${API}java/time/Instant.html#truncatedTo(java.time.temporal.TemporalUnit)`,
    tags: ["Instant", "Duration", "truncation", "milliseconds"],
    objectives: objectives("val-time", "val-primitives"),
  },
  {
    id: "CV-VALUES-05",
    domain: "values",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `int first = 1;
int second = 2;

String left = first + second + "3";
String right = "3" + first + second;
String repeated = "ab".repeat(first + second);

System.out.println(left + ":" + right + ":" + repeated.length());`,
    options: choices(
      [
        "A",
        "33:312:6",
        "Correct. Numeric addition happens before left meets a String, while right concatenates from its first operation; ab repeated three times has length six.",
      ],
      [
        "B",
        "123:312:6",
        "The first two int operands of left are added numerically before concatenation begins.",
      ],
      [
        "C",
        "33:33:6",
        "Once right begins with a String, its later additions concatenate left to right instead of summing the ints.",
      ],
      [
        "D",
        "33:312:3",
        "repeat uses three copies of a two-character string, giving six characters.",
      ],
    ),
    answer: ["A"],
    explanation:
      "The + operator is left associative. left starts with integer addition 1 + 2, while right starts in string-concatenation mode. repeat(3) produces ababab of length 6.",
    sourceUrl: `${JLS}jls-15.html#jls-15.18.1`,
    tags: ["String concatenation", "evaluation order", "repeat", "arithmetic"],
    objectives: objectives("val-text", "val-primitives"),
  },

  {
    id: "CV-FLOW-01",
    domain: "flow",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `int visited = 0;
outer:
for (int row = 1; row <= 3; row++) {
    for (int column = 1; column <= 3; column++) {
        if (row + column == 5) {
            break outer;
        }
        visited++;
    }
}
System.out.println(visited);`,
    options: choices(
      [
        "A",
        "3",
        "The first row contributes three visits, and two more occur in the second row before the labeled break.",
      ],
      [
        "B",
        "5",
        "Correct. The break occurs at row 2, column 3 after five earlier pairs have incremented visited.",
      ],
      [
        "C",
        "6",
        "The pair whose sum is 5 breaks before visited is incremented.",
      ],
      [
        "D",
        "8",
        "A labeled break exits both loops, so the third row is never entered.",
      ],
    ),
    answer: ["B"],
    explanation:
      "All three column values for row 1 increment the count. Row 2 increments for columns 1 and 2, then row 2 plus column 3 equals 5 and exits both loops.",
    sourceUrl: `${JLS}jls-14.html#jls-14.15`,
    tags: ["labeled break", "nested loop", "control flow"],
    objectives: objectives("flow-control"),
  },
  {
    id: "CV-FLOW-02",
    domain: "flow",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `int value = 3;
int result = switch (value) {
    case 1, 2 -> value;
    case 3 -> {
        value++;
        yield value * 2;
    }
    default -> 0;
};

System.out.println(value + ":" + result);`,
    options: choices(
      [
        "A",
        "3:6",
        "The selected block increments value before calculating the yielded expression.",
      ],
      [
        "B",
        "4:8",
        "Correct. value becomes 4 in the case block, and yield supplies 8 as the switch expression result.",
      ],
      ["C", "4:4", "yield returns value * 2, not the incremented value alone."],
      [
        "D",
        "The code does not compile because a switch arm cannot modify its selector variable",
        "The selector expression is already evaluated; modifying the local afterward is permitted.",
      ],
    ),
    answer: ["B"],
    explanation:
      "The selector value 3 chooses the block arm. That block increments the local to 4 and yields 8, so the later print observes both the mutation and the yielded result.",
    sourceUrl: `${JLS}jls-15.html#jls-15.28`,
    tags: ["switch expression", "yield", "side effect"],
    objectives: objectives("flow-control"),
  },
  {
    id: "CV-FLOW-03",
    domain: "flow",
    difficulty: "Expert",
    type: "single",
    pattern: "compilation",
    prompt: "What is the compilation result?",
    code: `static boolean useful(Object value) {
    return value instanceof String text
        && text.length() > 2
        || text.isEmpty();
}

System.out.println(useful("Java"));`,
    options: choices(
      [
        "A",
        "It compiles and prints true",
        "Although the left side can be true, text must also be valid on paths where the instanceof test failed.",
      ],
      [
        "B",
        "It compiles and prints false",
        "The issue is compile-time pattern-variable scope, not the eventual Boolean value for this particular call.",
      ],
      [
        "C",
        "It fails because text is not in scope for text.isEmpty()",
        "Correct. The right operand of || may run after a failed pattern match, so text is not definitely matched there.",
      ],
      [
        "D",
        "It fails because instanceof patterns cannot appear in return expressions",
        "Pattern matching is allowed in Boolean return expressions when flow scoping is respected.",
      ],
    ),
    answer: ["C"],
    explanation:
      "Because && binds more tightly, the expression is (pattern && length-test) || text.isEmpty(). The final operand can be reached when the pattern did not match, so text is out of scope.",
    sourceUrl: `${JLS}jls-6.html#jls-6.3.1`,
    tags: ["pattern variable", "flow scope", "operator precedence"],
    objectives: objectives("flow-control"),
  },
  {
    id: "CV-FLOW-04",
    domain: "flow",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt: "Which two invocations return the indicated value?",
    code: `static String classify(Object value) {
    return switch (value) {
        case null -> "N";
        case String text when text.isBlank() -> "B";
        case String text -> "S" + text.length();
        case Number number -> "#" + number.intValue();
        default -> "O";
    };
}`,
    options: choices(
      [
        "A",
        "classify(null) returns N",
        "Correct. An explicit case null handles the null selector before any type pattern is considered.",
      ],
      [
        "B",
        'classify("  " ) returns S2',
        "The guarded String label matches a blank string first, so the result is B.",
      ],
      [
        "C",
        "classify(3.9) returns #3",
        "Correct. Double matches Number, and intValue truncates the fractional part toward zero.",
      ],
      [
        "D",
        'classify("x") returns B',
        "The guard is false for a nonblank string, so the unguarded String arm returns S1.",
      ],
    ),
    answer: ["A", "C"],
    explanation:
      "case null directly handles null. A Double is a Number and intValue yields 3. Blank strings choose the guarded arm, while other strings choose the following unguarded arm.",
    sourceUrl: `${JLS}jls-14.html#jls-14.11.1`,
    tags: ["pattern switch", "guard", "case null", "type pattern"],
    objectives: objectives("flow-control"),
  },
  {
    id: "CV-FLOW-05",
    domain: "flow",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt: "Which two statements about this Java 25 code are correct?",
    code: `int count = 0;
for (var _ : java.util.List.of("a", "b", "c")) {
    count++;
}

try {
    throw new IllegalStateException();
} catch (IllegalStateException _) {
    count += 2;
}

System.out.println(count);`,
    options: choices(
      [
        "A",
        "The code prints 5",
        "Correct. The loop increments three times and the catch block adds two.",
      ],
      [
        "B",
        "Each underscore declares an unnamed variable that cannot be read by name",
        "Correct. The declarations accept values but deliberately provide no usable variable name.",
      ],
      [
        "C",
        "The two underscores conflict because local variable names must be unique",
        "Unnamed variables do not introduce named entities, so separate declarations do not conflict.",
      ],
      [
        "D",
        "The catch block cannot use an unnamed variable",
        "An exception parameter is one of the declaration contexts in which an unnamed variable is permitted.",
      ],
    ),
    answer: ["A", "B"],
    explanation:
      "Unnamed variables allow required-but-unused values to be discarded in supported contexts, including enhanced-for variables and catch parameters. They cannot be referenced, and the code prints 5.",
    sourceUrl: `${JLS}jls-14.html#jls-14.4.2`,
    tags: ["unnamed variable", "enhanced for", "catch", "underscore"],
    objectives: objectives("flow-control", "oop-scope"),
  },

  {
    id: "CV-OOP-01",
    domain: "oop",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt: "Which two statements are correct at the print statement?",
    code: `class Outer {
    private static int next;
    private final int id = ++next;

    class Inner {
        int outerId() { return Outer.this.id; }
    }
}

Outer first = new Outer();
Outer.Inner link = first.new Inner();
Outer second = new Outer();
first = null;

System.out.println(link.outerId() + ":" + second.new Inner().outerId());`,
    options: choices(
      [
        "A",
        "The code prints 1:2",
        "Correct. Instance field initialization assigns consecutive ids to the two Outer objects.",
      ],
      [
        "B",
        "The code prints 2:2 because link follows the first variable reassignment",
        "An inner object retains its original enclosing instance; assigning null to the local does not retarget it.",
      ],
      [
        "C",
        "The first Outer object is not eligible for garbage collection while link is reachable",
        "Correct. A non-static inner instance holds an enclosing-instance reference to the first Outer.",
      ],
      [
        "D",
        "Outer.Inner can be constructed as new Outer.Inner() without an Outer object",
        "A non-static inner class requires a lexically enclosing Outer instance for construction.",
      ],
    ),
    answer: ["A", "C"],
    explanation:
      "The two Outer initializations assign ids 1 and 2. link carries a reference to its enclosing first object, so that object remains reachable even after the first local is cleared.",
    sourceUrl: `${JLS}jls-8.html#jls-8.1.3`,
    tags: [
      "inner class",
      "enclosing instance",
      "initialization",
      "garbage collection",
      "reachability",
    ],
    objectives: objectives("oop-lifecycle", "oop-classes"),
  },
  {
    id: "CV-OOP-02",
    domain: "oop",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What does the program print?",
    code: `class Demo {
    static String pick(Object value) {
        return "O";
    }
    static String pick(String... values) {
        return "V" + values.length;
    }

    public static void main(String[] args) {
        String first = pick("x");
        String second = pick(new String[] {"x"});
        System.out.println(first + ":" + second);
    }
}`,
    options: choices(
      [
        "A",
        "O:V1",
        "Correct. The String argument selects the fixed-arity Object overload before varargs, while String[] selects the more-specific array overload.",
      ],
      [
        "B",
        "V1:V1",
        "Variable-arity methods are considered only after applicable fixed-arity methods, so the first call selects Object.",
      ],
      [
        "C",
        "O:O",
        "For the array call both methods are fixed-arity applicable, and String[] is more specific than Object.",
      ],
      [
        "D",
        "The calls are ambiguous",
        "The invocation phases and most-specific rule select one overload for each call.",
      ],
    ),
    answer: ["A"],
    explanation:
      'pick("x") finds pick(Object) during fixed-arity strict invocation and never reaches the varargs phase. Passing String[] makes both fixed-arity applicable, with String[] the more-specific parameter.',
    sourceUrl: `${JLS}jls-15.html#jls-15.12.2`,
    tags: ["overloading", "varargs", "invocation phases", "specificity"],
    objectives: objectives("oop-overloads", "oop-classes"),
  },
  {
    id: "CV-OOP-03",
    domain: "oop",
    difficulty: "Applied",
    type: "single",
    pattern: "scenario",
    prompt: "What is printed?",
    code: `import java.util.ArrayList;
import java.util.List;

record Plan(List<String> steps) {
    Plan {
        steps = List.copyOf(steps);
    }
}

var source = new ArrayList<>(List.of("design"));
var plan = new Plan(source);
source.add("build");

try {
    plan.steps().add("test");
} catch (UnsupportedOperationException ex) {
    System.out.println(plan.steps() + ":" + (plan.steps() == source));
}`,
    options: choices(
      [
        "A",
        "[design]:false",
        "Correct. The compact constructor replaces the parameter with an unmodifiable copy before implicit field assignment.",
      ],
      [
        "B",
        "[design, build]:true",
        "The record stores List.copyOf(steps), not the caller's mutable ArrayList reference.",
      ],
      [
        "C",
        "[design, build, test]:false",
        "The accessor exposes an unmodifiable list, so adding test throws before mutation.",
      ],
      [
        "D",
        "The compact constructor cannot assign to a component parameter",
        "A compact constructor may validate or reassign its parameter before the compiler assigns the final component field.",
      ],
    ),
    answer: ["A"],
    explanation:
      "Reassigning the compact-constructor parameter makes the implicit component assignment store the unmodifiable copy. Source mutations do not leak in, and accessor mutation is rejected.",
    sourceUrl: `${JLS}jls-8.html#jls-8.10.4`,
    tags: [
      "record",
      "compact constructor",
      "immutability",
      "defensive copy",
      "scope",
    ],
    objectives: objectives("oop-classes", "oop-scope", "oop-lifecycle"),
  },
  {
    id: "CV-OOP-04",
    domain: "oop",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt: "Which two statements about this program are correct?",
    code: `interface Named {
    private static String prefix() { return "N:"; }
    default String label() { return prefix(); }
}

@FunctionalInterface
interface Transform extends Named {
    String apply(String input);
}

Transform transform = text -> text.toUpperCase();
System.out.println(transform.label() + transform.apply("java"));`,
    options: choices(
      [
        "A",
        "The program prints N:JAVA",
        "Correct. The lambda supplies apply, and the inherited default label invokes the private interface helper.",
      ],
      [
        "B",
        "Transform is not functional because it inherits label",
        "A default method is not an abstract method and therefore does not add to the functional-interface descriptor.",
      ],
      [
        "C",
        "prefix is not inherited as a member of Transform",
        "Correct. Private interface methods are accessible only within the top-level interface that declares them.",
      ],
      [
        "D",
        "A lambda cannot implement an interface that has default methods",
        "A functional interface may contain default, static, and private methods while retaining one abstract function method.",
      ],
    ),
    answer: ["A", "C"],
    explanation:
      "Transform has one abstract method, apply, so the lambda is valid. Named.label remains available as a default, while the private static prefix helper stays confined to Named.",
    sourceUrl: `${JLS}jls-9.html#jls-9.8`,
    tags: [
      "functional interface",
      "lambda",
      "default method",
      "private interface method",
    ],
    objectives: objectives("oop-interfaces", "oop-inheritance", "oop-scope"),
  },
  {
    id: "CV-OOP-05",
    domain: "oop",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What does the program print?",
    code: `sealed interface Signal permits Status {
    int code();
}

enum Status implements Signal {
    READY(1),
    FAILED(2) {
        @Override public int code() { return super.code() + 10; }
    };

    private final int code;
    Status(int code) { this.code = code; }
    public int code() { return code; }
}

Signal signal = Status.FAILED;
System.out.println(signal.code() + ":" + ((Status) signal).name());`,
    options: choices(
      [
        "A",
        "2:FAILED",
        "FAILED has a constant-specific class body whose overriding method adds ten.",
      ],
      [
        "B",
        "12:FAILED",
        "Correct. Dynamic dispatch selects FAILED's override, and the enum constant name remains FAILED.",
      ],
      [
        "C",
        "12:Status",
        "Enum.name returns the declared constant identifier, not the enum or interface type name.",
      ],
      [
        "D",
        "The code fails because an enum cannot implement a sealed interface",
        "An enum can be an explicitly permitted direct implementation of a sealed interface.",
      ],
    ),
    answer: ["B"],
    explanation:
      "Status is the permitted implementation of Signal. The runtime enum constant has its own overriding class body, so code returns 2 + 10; the cast permits calling Enum.name.",
    sourceUrl: `${JLS}jls-8.html#jls-8.9.1`,
    tags: [
      "enum",
      "sealed interface",
      "constant-specific body",
      "polymorphism",
      "constructor",
    ],
    objectives: objectives(
      "oop-enums",
      "oop-interfaces",
      "oop-inheritance",
      "oop-classes",
    ),
  },

  {
    id: "CV-EXCEPTIONS-01",
    domain: "exceptions",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `class ConfigException extends Exception {
    ConfigException(String message) { super(message); }
}
class MissingConfigException extends ConfigException {
    MissingConfigException(String message) { super(message); }
}

static void load(boolean present) throws ConfigException {
    if (!present) throw new MissingConfigException("missing");
}

try {
    load(false);
} catch (MissingConfigException ex) {
    System.out.println("specific:" + ex.getMessage());
} catch (ConfigException ex) {
    System.out.println("general");
}`,
    options: choices(
      [
        "A",
        "specific:missing",
        "Correct. The thrown subtype is caught by the earlier specific catch clause.",
      ],
      [
        "B",
        "general",
        "Catch clauses are tested in order, and the MissingConfigException clause matches first.",
      ],
      [
        "C",
        "Both lines",
        "Only one catch clause handles a particular exception from a try statement.",
      ],
      [
        "D",
        "The catches are unreachable because load declares ConfigException",
        "A throws declaration names possible types; it does not prevent catching a declared subtype first.",
      ],
    ),
    answer: ["A"],
    explanation:
      "MissingConfigException is a checked ConfigException subtype. The specific catch is legally ordered before its superclass catch and handles the thrown instance, printing its message.",
    sourceUrl: `${JLS}jls-11.html#jls-11.2.3`,
    tags: [
      "custom exception",
      "checked exception",
      "catch ordering",
      "inheritance",
    ],
    objectives: objectives("exceptions"),
  },
  {
    id: "CV-EXCEPTIONS-02",
    domain: "exceptions",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt: "Which two statements are correct?",
    code: `class ValidationException extends RuntimeException {
    ValidationException(String message) { super(message); }
}

static int positive(int value) {
    if (value <= 0) {
        throw new ValidationException("positive required");
    }
    return value;
}

int result = positive(-1);`,
    options: choices(
      [
        "A",
        "positive is not required to declare throws ValidationException",
        "Correct. ValidationException is unchecked because it extends RuntimeException.",
      ],
      [
        "B",
        "The code does not compile unless the call is surrounded by try-catch",
        "Unchecked exceptions do not create a compile-time catch-or-declare requirement.",
      ],
      [
        "C",
        "The call compiles and throws ValidationException at runtime",
        "Correct. The condition is true for -1, so the custom unchecked exception escapes.",
      ],
      [
        "D",
        "RuntimeException subclasses cannot define constructors",
        "They are ordinary classes and may declare constructors that delegate to superclass constructors.",
      ],
    ),
    answer: ["A", "C"],
    explanation:
      "A RuntimeException subtype is unchecked, so callers need not catch or declare it. The negative argument enters the branch and a ValidationException is thrown at runtime.",
    sourceUrl: `${JLS}jls-11.html#jls-11.1.1`,
    tags: [
      "custom exception",
      "unchecked exception",
      "RuntimeException",
      "catch-or-declare",
    ],
    objectives: objectives("exceptions"),
  },
  {
    id: "CV-EXCEPTIONS-03",
    domain: "exceptions",
    difficulty: "Expert",
    type: "single",
    pattern: "compilation",
    prompt: "What is the compilation result?",
    code: `class Resource implements AutoCloseable {
    public void close() {}
}

Resource resource = new Resource();
try (resource) {
    System.out.println("using");
}
resource = new Resource();`,
    options: choices(
      [
        "A",
        "It compiles and prints using",
        "The later assignment means resource is not effectively final at its use in the resource specification.",
      ],
      [
        "B",
        "It fails because resource is not final or effectively final",
        "Correct. An existing local used as a resource must be final or effectively final throughout its scope.",
      ],
      [
        "C",
        "It fails because only declarations are allowed inside try parentheses",
        "Since Java 9, a final or effectively final existing variable may be used directly as a resource.",
      ],
      [
        "D",
        "It compiles but the second assignment throws at runtime",
        "The restriction is checked by the compiler before execution.",
      ],
    ),
    answer: ["B"],
    explanation:
      "Try-with-resources may reference an existing variable only when it is final or effectively final. Reassigning resource later prevents that property, so the resource specification is illegal.",
    sourceUrl: `${JLS}jls-14.html#jls-14.20.3`,
    tags: [
      "try-with-resources",
      "effectively final",
      "AutoCloseable",
      "compilation",
    ],
    objectives: objectives("exceptions"),
  },
  {
    id: "CV-EXCEPTIONS-04",
    domain: "exceptions",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `class Resource implements AutoCloseable {
    private final String name;
    Resource(String name, boolean fail) {
        this.name = name;
        if (fail) throw new IllegalStateException("new-" + name);
    }
    public void close() {
        throw new IllegalStateException("close-" + name);
    }
}

try (var first = new Resource("A", false);
     var second = new Resource("B", true)) {
    System.out.println("body");
} catch (Exception ex) {
    System.out.println(ex.getMessage() + ":" +
        ex.getSuppressed()[0].getMessage());
}`,
    options: choices(
      [
        "A",
        "new-B:close-A",
        "Correct. The second initialization fails, then the already-created first resource closes and its failure is suppressed.",
      ],
      [
        "B",
        "close-A:new-B",
        "The initialization failure is primary; the subsequent close failure is suppressed on it.",
      ],
      [
        "C",
        "body:close-B",
        "The body is never entered and second never completes construction, so second is not closed.",
      ],
      [
        "D",
        "Only new-B, because initialized resources are not closed after a later initializer fails",
        "Try-with-resources closes resources that were successfully initialized before the failure.",
      ],
    ),
    answer: ["A"],
    explanation:
      "first is initialized successfully, but second's constructor throws new-B. The generated cleanup closes first; close-A is attached as a suppressed exception to the primary initialization failure.",
    sourceUrl: `${JLS}jls-14.html#jls-14.20.3.1`,
    tags: [
      "try-with-resources",
      "initialization failure",
      "suppressed exception",
      "close",
    ],
    objectives: objectives("exceptions"),
  },
  {
    id: "CV-EXCEPTIONS-05",
    domain: "exceptions",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the program print?",
    code: `import java.io.IOException;

class ServiceException extends Exception {
    ServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}

static void service() throws ServiceException {
    try {
        throw new IOException("disk");
    } catch (IOException ex) {
        throw new ServiceException("service", ex);
    }
}

try {
    service();
} catch (ServiceException ex) {
    System.out.println(ex.getMessage() + ":" + ex.getCause().getMessage());
}`,
    options: choices(
      [
        "A",
        "service:disk",
        "Correct. The custom exception has its own message and retains the IOException as its cause.",
      ],
      [
        "B",
        "disk:service",
        "getMessage reads the outer exception first; getCause then exposes the wrapped IOException.",
      ],
      [
        "C",
        "service:null",
        "The two-argument superclass constructor records the supplied cause.",
      ],
      [
        "D",
        "The IOException escapes instead of ServiceException",
        "The catch translates it by throwing the newly created ServiceException.",
      ],
    ),
    answer: ["A"],
    explanation:
      "The IOException is caught and used as the cause of a new checked ServiceException. The outer message is service and the preserved cause message is disk.",
    sourceUrl: `${API}java/lang/Throwable.html#%3Cinit%3E(java.lang.String,java.lang.Throwable)`,
    tags: ["custom exception", "exception chaining", "cause", "translation"],
    objectives: objectives("exceptions"),
  },
  {
    id: "CV-COLLECTIONS-01",
    domain: "collections",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `import java.util.Arrays;

int[][] original = {{1, 2}, {3, 4}};
int[][] copy = original.clone();

copy[0][1] = 9;
copy[1] = new int[] {7, 8};

System.out.println(Arrays.deepToString(original));
System.out.println(Arrays.deepToString(copy));`,
    options: choices(
      [
        "A",
        "[[1, 9], [3, 4]] followed by [[1, 9], [7, 8]]",
        "Correct. Cloning copies outer references, so row 0 is shared; replacing copy's row 1 does not replace original's row 1.",
      ],
      [
        "B",
        "[[1, 2], [3, 4]] followed by [[1, 9], [7, 8]]",
        "A multidimensional array clone is shallow, so the existing row 0 array remains shared.",
      ],
      [
        "C",
        "[[1, 9], [7, 8]] followed by [[1, 9], [7, 8]]",
        "Assigning a new row to copy[1] changes only the cloned outer array's reference.",
      ],
      [
        "D",
        "The clone call does not compile for a two-dimensional array",
        "Every array type supports clone; its result here has compile-time type int[][].",
      ],
    ),
    answer: ["A"],
    explanation:
      "Cloning the outer array copies its two int[] references. Mutating the shared first row affects both structures, while replacing a reference in the cloned outer array affects only copy.",
    sourceUrl: `${JLS}jls-10.html#jls-10.7`,
    tags: [
      "multidimensional array",
      "shallow clone",
      "Arrays.deepToString",
      "reference",
    ],
    objectives: objectives("coll-arrays"),
  },
  {
    id: "CV-COLLECTIONS-02",
    domain: "collections",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `import java.util.ArrayDeque;
import java.util.Deque;

Deque<Integer> values = new ArrayDeque<>();
values.offerLast(1);
values.addFirst(2);
values.push(3);

int tail = values.removeLast();
int head = values.pollFirst();
System.out.println(tail + ":" + head + ":" + values.getFirst());`,
    options: choices(
      [
        "A",
        "1:3:2",
        "Correct. The deque becomes [3,2,1]; removing the tail yields 1, polling the head yields 3, and 2 remains.",
      ],
      [
        "B",
        "3:1:2",
        "push adds at the head, while removeLast removes the opposite end where 1 resides.",
      ],
      [
        "C",
        "1:2:3",
        "pollFirst removes 3, which push most recently placed at the front.",
      ],
      [
        "D",
        "The code fails because stack and queue methods cannot be mixed",
        "Deque deliberately exposes both stack-style and queue-style operations on the same two-ended structure.",
      ],
    ),
    answer: ["A"],
    explanation:
      "offerLast creates [1], addFirst creates [2,1], and push is equivalent to addFirst, creating [3,2,1]. The subsequent removals leave 2 at the head.",
    sourceUrl: `${API}java/util/Deque.html`,
    tags: ["Deque", "ArrayDeque", "push", "pollFirst", "removeLast"],
    objectives: objectives("coll-deque"),
  },
  {
    id: "CV-COLLECTIONS-03",
    domain: "collections",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `import java.util.ArrayList;
import java.util.List;

List<String> forward = new ArrayList<>(List.of("A", "B", "C"));
List<String> reverse = forward.reversed();

reverse.set(0, "Z");
forward.addFirst("X");

System.out.println(forward + "|" + reverse);`,
    options: choices(
      [
        "A",
        "[X, A, B, Z]|[Z, B, A, X]",
        "Correct. reversed returns a live reverse-ordered view, so mutations through either reference are reflected in the other.",
      ],
      [
        "B",
        "[X, A, B, C]|[Z, B, A]",
        "reverse is not a detached copy; setting its first element changes forward's last element.",
      ],
      [
        "C",
        "[X, A, B, Z]|[Z, B, A]",
        "The view remains live after addFirst, so it also displays the new X at its opposite end.",
      ],
      [
        "D",
        "addFirst is unsupported by ArrayList",
        "Java's sequenced List operations include addFirst, and mutable ArrayList supports the insertion.",
      ],
    ),
    answer: ["A"],
    explanation:
      "The reversed list is a view, not a snapshot. Its index 0 maps to forward's last element, and inserting X at forward's first position makes X the view's last element.",
    sourceUrl: `${API}java/util/List.html#reversed()`,
    tags: ["sequenced collection", "reversed view", "List", "addFirst"],
    objectives: objectives("coll-deque", "coll-core"),
  },
  {
    id: "CV-COLLECTIONS-04",
    domain: "collections",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt: "Which two statements about the final map are correct?",
    code: `import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

Map<String, List<Integer>> groups = new HashMap<>();
groups.computeIfAbsent("odd", key -> new ArrayList<>()).add(1);
groups.computeIfAbsent("odd", key -> new ArrayList<>()).add(3);
groups.computeIfAbsent("even", key -> new ArrayList<>()).add(2);

var removed = groups.computeIfPresent("even", (key, list) -> null);`,
    options: choices(
      [
        "A",
        'groups.get("odd") equals [1, 3]',
        "Correct. The existing odd list is reused by the second computeIfAbsent call and receives both values.",
      ],
      [
        "B",
        "groups contains the key even mapped to null",
        "A null result from computeIfPresent removes the existing mapping rather than retaining a null value.",
      ],
      [
        "C",
        "removed is null",
        "Correct. computeIfPresent returns the remapping result, which is null after removing even.",
      ],
      [
        "D",
        "The odd mapping is replaced before 3 is added",
        "computeIfAbsent does not invoke or install a new value when a non-null mapping already exists.",
      ],
    ),
    answer: ["A", "C"],
    explanation:
      "computeIfAbsent constructs each list only on the first absent lookup. The odd list accumulates 1 and 3. Returning null from computeIfPresent removes even and returns null.",
    sourceUrl: `${API}java/util/Map.html#computeIfAbsent(K,java.util.function.Function)`,
    tags: ["Map", "computeIfAbsent", "computeIfPresent", "generics"],
    objectives: objectives("coll-core"),
  },
  {
    id: "CV-COLLECTIONS-05",
    domain: "collections",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `Number[] numbers = new Integer[2];
numbers[0] = 1;

try {
    numbers[1] = 2.5;
} catch (ArrayStoreException ex) {
    System.out.println(
        numbers.getClass().getComponentType().getSimpleName() +
        ":" + numbers[0] + ":" + numbers[1]);
}`,
    options: choices(
      [
        "A",
        "Number:1:2.5",
        "The runtime array object is Integer[], even though the reference type is Number[].",
      ],
      [
        "B",
        "Integer:1:null",
        "Correct. Runtime array-store checking rejects the Double before assignment, leaving the second element null.",
      ],
      [
        "C",
        "Integer:1:2",
        "The Double is not converted to Integer for an assignment through a covariant array reference.",
      ],
      [
        "D",
        "The declaration Number[] numbers = new Integer[2] does not compile",
        "Reference arrays are covariant, so the declaration compiles but may fail on an incompatible store.",
      ],
    ),
    answer: ["B"],
    explanation:
      "Array covariance permits an Integer[] to be referenced as Number[]. The JVM still knows the component type is Integer and throws ArrayStoreException before storing the Double.",
    sourceUrl: `${JLS}jls-10.html#jls-10.5`,
    tags: [
      "array covariance",
      "ArrayStoreException",
      "runtime type",
      "component type",
    ],
    objectives: objectives("coll-arrays"),
  },

  {
    id: "CV-STREAMS-01",
    domain: "streams",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `import java.util.List;
import java.util.function.Function;
import java.util.function.Predicate;

int limit = 3;
Predicate<String> longer = text -> text.length() > limit;
Function<String, Boolean> boxed = text -> text.length() > limit;
var words = List.of("a", "java", "stream");

long filtered = words.stream().filter(longer).count();
long mapped = words.stream().map(boxed).filter(Boolean::booleanValue).count();
System.out.println(filtered + ":" + mapped);`,
    options: choices(
      [
        "A",
        "1:1",
        "There are two words longer than three characters: java and stream.",
      ],
      [
        "B",
        "2:2",
        "Correct. Target typing gives both lambdas a String input, and both pipelines identify java and stream.",
      ],
      [
        "C",
        "2:0",
        "The Function boxes each Boolean result, and Boolean::booleanValue retains the true values.",
      ],
      [
        "D",
        "The lambdas fail because limit is not final",
        "limit is never reassigned, so it is effectively final and may be captured.",
      ],
    ),
    answer: ["B"],
    explanation:
      "The assignment contexts target-type one lambda as Predicate<String> and the other as Function<String,Boolean>. The captured limit is effectively final, and both pipelines count two matches.",
    sourceUrl: `${JLS}jls-15.html#jls-15.27.3`,
    tags: [
      "lambda",
      "target typing",
      "effectively final",
      "Predicate",
      "Function",
    ],
    objectives: objectives(
      "stream-lambdas",
      "stream-shapes",
      "stream-transform",
    ),
  },
  {
    id: "CV-STREAMS-02",
    domain: "streams",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `import java.util.stream.IntStream;

int sum = IntStream.rangeClosed(1, 4)
    .map(value -> value * value)
    .filter(value -> value % 2 == 0)
    .sum();

double average = IntStream.of(2, 4, 6)
    .average()
    .orElseThrow();

System.out.println(sum + ":" + average);`,
    options: choices(
      [
        "A",
        "20:4.0",
        "Correct. The even squares are 4 and 16, and the primitive stream average of 2,4,6 is 4.0.",
      ],
      [
        "B",
        "30:4.0",
        "The filter removes the odd squares 1 and 9 before summation.",
      ],
      [
        "C",
        "20:4",
        "IntStream.average returns an OptionalDouble, so its extracted value is a double displayed as 4.0.",
      ],
      [
        "D",
        "The code does not compile because primitive streams cannot be filtered",
        "IntStream directly supports map, filter, sum, and average operations.",
      ],
    ),
    answer: ["A"],
    explanation:
      "rangeClosed supplies 1 through 4. Squaring and retaining even results gives 4 + 16 = 20. The second IntStream has a double average of 4.0.",
    sourceUrl: `${API}java/util/stream/IntStream.html`,
    tags: ["IntStream", "rangeClosed", "map", "filter", "average"],
    objectives: objectives(
      "stream-shapes",
      "stream-transform",
      "stream-reduce",
    ),
  },
  {
    id: "CV-STREAMS-03",
    domain: "streams",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the pipeline produce?",
    code: `import java.util.Comparator;
import java.util.stream.Stream;

var order = Comparator.comparingInt(String::length)
    .thenComparing(Comparator.naturalOrder());

String result = Stream.concat(
        Stream.of("bbb", "a"),
        Stream.of("cc", "a"))
    .distinct()
    .sorted(order)
    .reduce((left, right) -> left + "|" + right)
    .orElse("empty");

System.out.println(result);`,
    options: choices(
      [
        "A",
        "a|cc|bbb",
        "Correct. concat preserves source order, distinct removes the second a, sorting uses length, and reduce joins the ordered values.",
      ],
      [
        "B",
        "a|a|cc|bbb",
        "distinct removes the duplicate a before sorting and reduction.",
      ],
      [
        "C",
        "bbb|cc|a",
        "The comparator orders by increasing length, not decreasing length.",
      ],
      [
        "D",
        "The method reference is ambiguous",
        "The comparingInt context fixes String as the input type for String::length.",
      ],
    ),
    answer: ["A"],
    explanation:
      "The concatenated elements are bbb,a,cc,a. Stable distinct leaves bbb,a,cc; sorting by length yields a,cc,bbb; the optional reduction joins them with vertical bars.",
    sourceUrl: `${API}java/util/stream/Stream.html#concat(java.util.stream.Stream,java.util.stream.Stream)`,
    tags: ["Stream.concat", "distinct", "sorted", "reduce", "method reference"],
    objectives: objectives(
      "stream-lambdas",
      "stream-transform",
      "stream-reduce",
    ),
  },
  {
    id: "CV-STREAMS-04",
    domain: "streams",
    difficulty: "Expert",
    type: "single",
    pattern: "api",
    prompt: "What is printed?",
    code: `import java.util.List;
import static java.util.stream.Collectors.*;

var words = List.of("a", "to", "tea", "code");
var byLength = words.stream().collect(
    groupingBy(String::length, counting()));
var longWords = words.stream().collect(
    partitioningBy(word -> word.length() >= 3, counting()));

System.out.println(byLength.get(2) + ":" +
    longWords.get(false) + ":" + longWords.get(true));`,
    options: choices(
      [
        "A",
        "1:2:2",
        "Correct. One word has length two; two words are shorter than three and two are at least three characters.",
      ],
      [
        "B",
        "2:1:3",
        "Only to has length two, and both a and to belong to the false partition.",
      ],
      [
        "C",
        "1:null:2",
        "partitioningBy always supplies both Boolean keys, even when a partition would be empty.",
      ],
      [
        "D",
        "The code fails because counting cannot be downstream of partitioningBy",
        "counting is a valid downstream collector for both groupingBy and partitioningBy.",
      ],
    ),
    answer: ["A"],
    explanation:
      "groupingBy counts one length-two value. The predicate partitions a and to as false and tea and code as true, with counting yielding 2 for each Boolean key.",
    sourceUrl: `${API}java/util/stream/Collectors.html#partitioningBy(java.util.function.Predicate,java.util.stream.Collector)`,
    tags: ["groupingBy", "partitioningBy", "counting", "collector", "lambda"],
    objectives: objectives("stream-lambdas", "stream-reduce"),
  },
  {
    id: "CV-STREAMS-05",
    domain: "streams",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt: "Which two statements are guaranteed by this code?",
    code: `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.IntStream;

List<Integer> seen = Collections.synchronizedList(new ArrayList<>());
IntStream.range(0, 5)
    .parallel()
    .map(value -> value * 2)
    .forEachOrdered(seen::add);

int total = IntStream.range(0, 5)
    .parallel()
    .reduce(0, Integer::sum);`,
    options: choices(
      [
        "A",
        "seen equals [0, 2, 4, 6, 8]",
        "Correct. forEachOrdered preserves the encounter order of this ordered parallel stream.",
      ],
      [
        "B",
        "Every map invocation must run on a different worker thread",
        "Parallel execution does not guarantee a worker count or a particular assignment of elements to threads.",
      ],
      [
        "C",
        "total equals 10",
        "Correct. Integer addition is associative with identity zero for these values, so the parallel reduction yields 10.",
      ],
      [
        "D",
        "total is guaranteed only when the second stream runs sequentially",
        "A valid associative reduction with identity zero produces the same sum for this parallel stream.",
      ],
    ),
    answer: ["A", "C"],
    explanation:
      "forEachOrdered respects source encounter order even in a parallel pipeline. The separate parallel reduction combines 0 through 4 with a valid associative sum and produces 10.",
    sourceUrl: `${API}java/util/stream/Stream.html#forEachOrdered(java.util.function.Consumer)`,
    tags: ["parallel stream", "encounter order", "forEachOrdered", "reduce"],
    objectives: objectives(
      "stream-parallel",
      "stream-transform",
      "stream-reduce",
    ),
  },
  {
    id: "CV-PACKAGING-01",
    domain: "packaging",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt:
      "Which two module descriptors correctly complete the service relationship?",
    code: `// API type:
// package codec.api;
// public interface Codec { String encode(String value); }

// consumer module loads providers with:
ServiceLoader<codec.api.Codec> codecs =
    ServiceLoader.load(codec.api.Codec.class);

// provider implementation:
// package codec.impl;
// public final class HexCodec implements codec.api.Codec { ... }`,
    options: choices(
      [
        "A",
        "The consumer descriptor declares uses codec.api.Codec;",
        "Correct. A module that discovers implementations through ServiceLoader declares its use of the service type.",
      ],
      [
        "B",
        "The consumer descriptor declares provides codec.api.Codec with codec.impl.HexCodec;",
        "The consumer does not provide the implementation shown; that directive belongs to the provider module.",
      ],
      [
        "C",
        "The provider descriptor declares provides codec.api.Codec with codec.impl.HexCodec;",
        "Correct. This registers HexCodec as a provider of the Codec service.",
      ],
      [
        "D",
        "The provider descriptor declares opens codec.impl to java.base instead of provides",
        "Opening a package for reflection does not register a ServiceLoader provider.",
      ],
    ),
    answer: ["A", "C"],
    explanation:
      "JPMS service consumption is declared with uses in the consumer, while service implementation is registered with provides ... with in the provider. exports and opens serve different access purposes.",
    sourceUrl: `${JLS}jls-7.html#jls-7.7.3`,
    tags: ["modules", "ServiceLoader", "uses", "provides"],
    objectives: objectives("pkg-modules"),
  },
  {
    id: "CV-PACKAGING-02",
    domain: "packaging",
    difficulty: "Applied",
    type: "single",
    pattern: "scenario",
    prompt:
      "Code in client imports api.model.Order. What is the smallest descriptor change that makes the import accessible through the dependency chain?",
    code: `// api/module-info.java
module api {
    exports api.model;
}

// facade/module-info.java
module facade {
    requires api;
    exports facade.entry;
}

// client/module-info.java
module client {
    requires facade;
}`,
    options: choices(
      [
        "A",
        "Change facade's directive to requires transitive api;",
        "Correct. Modules requiring facade will then also read api, whose api.model package is exported.",
      ],
      [
        "B",
        "Change api's exports to opens api.model;",
        "opens grants reflective access but does not create ordinary readability or exported compile-time access.",
      ],
      [
        "C",
        "Add exports api.model; to client",
        "A module can export only its own packages, not a package owned by api.",
      ],
      [
        "D",
        "Change client to opens client;",
        "Opening the client module does not make another module readable.",
      ],
    ),
    answer: ["A"],
    explanation:
      "client reads facade but not api under the original descriptors. A transitive requirement in facade propagates api readability to client; api already exports the needed package.",
    sourceUrl: `${JLS}jls-7.html#jls-7.7.1`,
    tags: ["requires transitive", "readability", "exports", "modules"],
    objectives: objectives("pkg-modules"),
  },
  {
    id: "CV-PACKAGING-03",
    domain: "packaging",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt:
      "Stats.java is run with java Stats.java and there is no module-info.java. Which two statements are correct?",
    code: `import module java.base;

void main() {
    var values = List.of(2, 4, 6);
    double average = values.stream()
        .mapToInt(Integer::intValue)
        .average()
        .orElseThrow();
    IO.println(average);
}`,
    options: choices(
      [
        "A",
        "The program prints 4.0",
        "Correct. The module import supplies List by simple name and the average of 2,4,6 is 4.0.",
      ],
      [
        "B",
        "The source is compiled and executed in the unnamed module",
        "Correct. Without module-info.java, source-file mode uses the unnamed-module context.",
      ],
      [
        "C",
        "import module java.base declares Stats to be a named module",
        "A module import is an import declaration; it does not declare a module.",
      ],
      [
        "D",
        "The instance main method requires an explicit surrounding class",
        "A Java 25 compact source file supplies an implicitly declared class for an eligible main method.",
      ],
    ),
    answer: ["A", "B"],
    explanation:
      "Java 25 compact source files can declare an instance main directly. The module import makes exported java.base types conveniently accessible, while the launcher uses the unnamed module without a descriptor.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/language/module-import-declarations.html",
    tags: [
      "compact source",
      "unnamed module",
      "module import",
      "source launcher",
      "instance main",
    ],
    objectives: objectives("pkg-modules", "pkg-deploy"),
  },
  {
    id: "CV-PACKAGING-04",
    domain: "packaging",
    difficulty: "Applied",
    type: "single",
    pattern: "scenario",
    prompt:
      "The command is run from the source root. What happens when java app/Main.java is executed?",
    code: `// app/Main.java
package app;
import util.Helper;

public class Main {
    public static void main(String[] args) {
        System.out.println(Helper.twice(4));
    }
}

// util/Helper.java
package util;
public class Helper {
    public static int twice(int value) { return value * 2; }
}`,
    options: choices(
      [
        "A",
        "It prints 8",
        "Correct. Source-file mode computes the source root and compiles the referenced Helper source as part of the multi-file program.",
      ],
      [
        "B",
        "It fails because java source-file mode compiles only Main.java",
        "Additional source files found under the computed source root can be compiled when required.",
      ],
      [
        "C",
        "It prints 4 because only Helper's signature is read",
        "Helper's method body is compiled and executed normally, producing 8.",
      ],
      [
        "D",
        "It requires javac app/Main.java util/Helper.java first",
        "Explicit ahead-of-time compilation is optional for this source-file launch mode.",
      ],
    ),
    answer: ["A"],
    explanation:
      "The launcher uses the package and file location to compute the source root. The compiler then finds util/Helper.java on that source path and compiles the referenced class in memory.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/specs/man/java.html#using-source-file-mode-to-launch-source-code-programs",
    tags: [
      "multi-file source program",
      "source-file mode",
      "launcher",
      "package",
    ],
    objectives: objectives("pkg-deploy"),
  },
  {
    id: "CV-PACKAGING-05",
    domain: "packaging",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt:
      "legacy.jar has no module descriptor but declares Automatic-Module-Name: com.example.legacy. Which two statements are correct?",
    code: `// Modular launch attempt:
java --module-path mods -m com.example.app/com.example.app.Main

// Runtime-image attempt:
jlink --module-path "$JAVA_HOME/jmods:mods" --add-modules com.example.app --output image

// com.example.app requires com.example.legacy.`,
    options: choices(
      [
        "A",
        "On the module path, legacy.jar is an automatic module named com.example.legacy",
        "Correct. The manifest entry supplies the automatic module name.",
      ],
      [
        "B",
        "The automatic module conceals every package until exports directives are added",
        "An automatic module has no descriptor and is treated as exporting all of its packages.",
      ],
      [
        "C",
        "The automatic module must be converted to an explicit module before it can be included by jlink",
        "Correct. jlink does not support linking automatic modules into a runtime image.",
      ],
      [
        "D",
        "Putting legacy.jar on the class path satisfies a requires com.example.legacy directive",
        "A class-path JAR belongs to the unnamed module and cannot satisfy that named-module requirement.",
      ],
    ),
    answer: ["A", "C"],
    explanation:
      "The module path turns the legacy JAR into the named automatic module from its manifest, easing migration. Runtime images require explicit modules, so the dependency must be modularized for jlink.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/migrate/migrating-to-modules.html",
    tags: [
      "automatic module",
      "migration",
      "jlink",
      "runtime image",
      "module path",
    ],
    objectives: objectives("pkg-modules", "pkg-deploy"),
  },

  {
    id: "CV-CONCURRENCY-01",
    domain: "concurrency",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed when the submitted task completes normally?",
    code: `import java.util.concurrent.Callable;
import java.util.concurrent.Executors;

Thread platform = Thread.ofPlatform().unstarted(() -> {});

try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    Callable<Integer> calculation = () -> 6 * 7;
    var virtual = executor.submit(() ->
        Thread.currentThread().isVirtual());
    var answer = executor.submit(calculation);

    System.out.println(platform.isVirtual() + ":" +
        virtual.get() + ":" + answer.get());
}`,
    options: choices(
      [
        "A",
        "false:true:42",
        "Correct. The builder creates a platform thread, the executor starts each task on a virtual thread, and Callable returns 42.",
      ],
      [
        "B",
        "true:true:42",
        "A thread created with Thread.ofPlatform is not virtual.",
      ],
      [
        "C",
        "false:false:42",
        "newVirtualThreadPerTaskExecutor uses a new virtual thread for each submitted task.",
      ],
      [
        "D",
        "The Callable result cannot be obtained from submit",
        "submit(Callable) returns a Future whose get method produces the Callable value.",
      ],
    ),
    answer: ["A"],
    explanation:
      "The unstarted platform thread reports false. Each executor task runs in a virtual Thread, and the value-returning Callable completes its Future with 42.",
    sourceUrl: `${API}java/util/concurrent/Executors.html#newVirtualThreadPerTaskExecutor()`,
    tags: [
      "platform thread",
      "virtual thread",
      "Callable",
      "Future",
      "executor",
    ],
    objectives: objectives("conc-tasks"),
  },
  {
    id: "CV-CONCURRENCY-02",
    domain: "concurrency",
    difficulty: "Expert",
    type: "single",
    pattern: "api",
    prompt: "What is printed by the current thread?",
    code: `import java.util.concurrent.locks.ReentrantReadWriteLock;

var lock = new ReentrantReadWriteLock();
lock.readLock().lock();
boolean upgraded;
try {
    upgraded = lock.writeLock().tryLock();
} finally {
    lock.readLock().unlock();
}

lock.writeLock().lock();
boolean downgraded;
try {
    downgraded = lock.readLock().tryLock();
    if (downgraded) lock.readLock().unlock();
} finally {
    lock.writeLock().unlock();
}
System.out.println(upgraded + ":" + downgraded);`,
    options: choices(
      [
        "A",
        "true:true",
        "A read-lock holder cannot upgrade to the write lock merely because it is the only reader.",
      ],
      [
        "B",
        "false:true",
        "Correct. Upgrading is not supported, while the write-lock owner may acquire the read lock for lock downgrading.",
      ],
      [
        "C",
        "false:false",
        "The implementation supports acquiring a read lock while the current thread owns the write lock.",
      ],
      [
        "D",
        "The first tryLock call blocks forever",
        "tryLock is nonblocking and returns false when the write lock cannot be acquired.",
      ],
    ),
    answer: ["B"],
    explanation:
      "ReentrantReadWriteLock supports downgrading from write to read but not upgrading from read to write. Nonblocking tryLock therefore returns false first and true second.",
    sourceUrl: `${API}java/util/concurrent/locks/ReentrantReadWriteLock.html`,
    tags: ["ReentrantReadWriteLock", "tryLock", "upgrade", "downgrade"],
    objectives: objectives("conc-safety"),
  },
  {
    id: "CV-CONCURRENCY-03",
    domain: "concurrency",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt: "Which two statements describe these Java 25 APIs correctly?",
    code: `import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.TimeUnit;

var pool = new ForkJoinPool();
var blocker = new CountDownLatch(1);
var delayed = pool.schedule(() -> 7, 1, TimeUnit.SECONDS);
var timed = pool.submitWithTimeout(
    () -> { blocker.await(); return 9; },
    100, TimeUnit.MILLISECONDS,
    task -> task.complete(-1));`,
    options: choices(
      [
        "A",
        "delayed is a ScheduledFuture whose get() returns 7 after normal execution",
        "Correct. The Callable scheduling overload returns a value-bearing ScheduledFuture.",
      ],
      [
        "B",
        "The timeout action may complete timed with the fallback value -1",
        "Correct. A supplied action can attempt to complete the ForkJoinTask when the timeout expires.",
      ],
      [
        "C",
        "ForkJoinPool cannot schedule tasks because it does not implement ScheduledExecutorService",
        "In Java 25 ForkJoinPool implements ScheduledExecutorService and supplies the scheduling methods.",
      ],
      [
        "D",
        "submitWithTimeout always cancels timed before invoking a non-null timeout action",
        "Automatic cancellation is the null-action behavior; a supplied action is applied and may complete the task itself.",
      ],
    ),
    answer: ["A", "B"],
    explanation:
      "Java 25 ForkJoinPool supports delayed scheduling and timed submissions. A scheduled Callable yields its value normally, while a non-null timeout action can provide a fallback completion.",
    sourceUrl: `${API}java/util/concurrent/ForkJoinPool.html#submitWithTimeout(java.util.concurrent.Callable,long,java.util.concurrent.TimeUnit,java.util.function.Consumer)`,
    tags: [
      "ForkJoinPool",
      "schedule",
      "ScheduledExecutorService",
      "submitWithTimeout",
      "Java 25",
    ],
    objectives: objectives("conc-tasks", "conc-parallel"),
  },
  {
    id: "CV-CONCURRENCY-04",
    domain: "concurrency",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt: "Which two statements about the stages are correct on Java 25?",
    code: `import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

var base = CompletableFuture.completedFuture(2);
var async = base.thenApplyAsync(value -> value * 3);
var timed = async.completeOnTimeout(0, 1, TimeUnit.SECONDS);`,
    options: choices(
      [
        "A",
        "thenApplyAsync returns a new CompletableFuture dependent on base",
        "Correct. The dependent stage receives base's normal result and computes its own result asynchronously.",
      ],
      [
        "B",
        "Without an explicit Executor, thenApplyAsync uses the future's default async executor",
        "Correct. For a standard CompletableFuture this is the common pool when it supports more than one parallel thread, otherwise a thread-per-task executor; a subclass may override defaultExecutor().",
      ],
      [
        "C",
        "completeOnTimeout always creates a distinct CompletableFuture object",
        "completeOnTimeout returns this CompletableFuture, arranging fallback completion on the same future if needed.",
      ],
      [
        "D",
        "Because base is already complete, async must be complete before thenApplyAsync returns",
        "Async scheduling does not guarantee that the dependent computation has finished by the return of the method call.",
      ],
    ),
    answer: ["A", "B"],
    explanation:
      "The async transformation creates a dependent future and uses its default async executor. For a standard CompletableFuture that is the common pool when it supports parallelism greater than one, with a thread-per-task fallback; completeOnTimeout attaches to async itself.",
    sourceUrl: `${API}java/util/concurrent/CompletableFuture.html`,
    tags: [
      "CompletableFuture",
      "thenApplyAsync",
      "common pool",
      "completeOnTimeout",
      "Java 25",
    ],
    objectives: objectives("conc-tasks"),
  },
  {
    id: "CV-CONCURRENCY-05",
    domain: "concurrency",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed after the parallel operation completes?",
    code: `import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.IntStream;

var counts = new ConcurrentHashMap<Integer, Integer>();
IntStream.range(0, 1_000)
    .parallel()
    .forEach(value -> counts.merge(
        value % 2, 1, Integer::sum));

System.out.println(counts.get(0) + ":" + counts.get(1));`,
    options: choices(
      [
        "A",
        "500:500",
        "Correct. merge atomically updates each key, and the range contains 500 even and 500 odd values.",
      ],
      [
        "B",
        "Values smaller than 500 are guaranteed because merge is not atomic",
        "ConcurrentHashMap.merge performs the remapping atomically for each key.",
      ],
      [
        "C",
        "1000:1000",
        "Each range element contributes to exactly one of the two remainder keys.",
      ],
      [
        "D",
        "The code throws ConcurrentModificationException",
        "ConcurrentHashMap is designed for concurrent updates and this operation does not iterate it with a fail-fast iterator.",
      ],
    ),
    answer: ["A"],
    explanation:
      "The parallel stream distributes 1,000 values, but ConcurrentHashMap.merge safely combines updates per key. Exactly half the range is even and half is odd.",
    sourceUrl: `${API}java/util/concurrent/ConcurrentHashMap.html#merge(K,V,java.util.function.BiFunction)`,
    tags: ["ConcurrentHashMap", "merge", "parallel stream", "atomic update"],
    objectives: objectives("conc-parallel", "conc-safety", "stream-parallel"),
  },
  {
    id: "CV-IO-01",
    domain: "io",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt: "What is printed using the Java 24/25 Reader convenience APIs?",
    code: `import java.io.Reader;

try (Reader reader = Reader.of("red\\nblue")) {
    reader.mark(20);
    var lines = reader.readAllLines();
    reader.reset();
    String text = reader.readAllAsString();

    System.out.println(lines + ":" + text.length());
}`,
    options: choices(
      [
        "A",
        "[red, blue]:8",
        "Correct. Reader.of supports mark/reset; the two lines are read first, reset returns to the start, and the full sequence has eight characters.",
      ],
      [
        "B",
        "[red, blue]:0",
        "reset restores the marked start position, so readAllAsString reads the content again.",
      ],
      [
        "C",
        "[redblue]:7",
        "readAllLines separates at the newline, and the full character count includes that newline.",
      ],
      [
        "D",
        "reset throws because the Reader returned by Reader.of does not support marks",
        "The Reader.of contract explicitly states that its returned reader supports mark and reset.",
      ],
    ),
    answer: ["A"],
    explanation:
      "Reader.of adapts the CharSequence and supports marking. readAllLines consumes two lines, reset returns to the marked beginning, and readAllAsString then returns the original eight-character sequence.",
    sourceUrl: `${API}java/io/Reader.html#of(java.lang.CharSequence)`,
    tags: [
      "Reader.of",
      "readAllLines",
      "readAllAsString",
      "mark",
      "reset",
      "Java 24",
    ],
    objectives: objectives("io-streams"),
  },
  {
    id: "CV-IO-02",
    domain: "io",
    difficulty: "Foundation",
    type: "single",
    pattern: "trace",
    prompt: "What does this Java 25 code print?",
    code: `CharSequence source = new StringBuilder("oracle");
char[] destination = {'-', '-', '-', '-', '-'};

source.getChars(1, 4, destination, 1);

try (var reader = java.io.Reader.of(new String(destination))) {
    System.out.println(reader.readAllAsString());
}`,
    options: choices(
      [
        "A",
        "-ora-",
        "The copied half-open source range starts at index 1, so it contains r, a, and c rather than o, r, and a.",
      ],
      [
        "B",
        "-rac-",
        "Correct. CharSequence.getChars copies indexes 1,2,3 into destination indexes 1,2,3.",
      ],
      [
        "C",
        "-racl",
        "The source end index is exclusive, and only three destination positions are replaced.",
      ],
      [
        "D",
        "The call is unavailable because source is declared CharSequence",
        "Java 25 adds getChars as a default method directly on CharSequence.",
      ],
    ),
    answer: ["B"],
    explanation:
      "CharSequence.getChars copies srcBegin inclusive through srcEnd exclusive, producing -rac-. Reader.of then adapts that text, and readAllAsString returns it unchanged.",
    sourceUrl: `${API}java/lang/CharSequence.html#getChars(int,int,char%5B%5D,int)`,
    tags: [
      "CharSequence.getChars",
      "Reader.of",
      "readAllAsString",
      "character array",
      "half-open range",
      "Java 25",
    ],
    objectives: objectives("io-streams", "val-text", "coll-arrays"),
  },
  {
    id: "CV-IO-03",
    domain: "io",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt: "Assuming a console is attached, which two statements are correct?",
    code: `import java.io.Console;
import java.util.Locale;

Console console = System.console();
if (console != null) {
    console.printf(Locale.GERMANY, "%,.2f%n", 1234.5);
    String answer = console.readLine(
        Locale.US, "Amount: $%,.2f > ", 12.5);
    System.out.println(answer);
}`,
    options: choices(
      [
        "A",
        "The first formatted number uses German grouping and decimal conventions",
        "Correct. The explicit Locale.GERMANY controls that printf call rather than the default format locale.",
      ],
      [
        "B",
        "The prompt passed to readLine is formatted using Locale.US",
        "Correct. The Java 23 locale overload applies the supplied locale to its prompt formatting.",
      ],
      [
        "C",
        "readLine includes the user's line-termination characters in answer",
        "Console.readLine returns the line without its terminating characters.",
      ],
      [
        "D",
        "System.console() is guaranteed non-null for every Java process",
        "It may return null when no interactive console device is attached, which is why the guard is necessary.",
      ],
    ),
    answer: ["A", "B"],
    explanation:
      "Console formatting overloads can use an explicit locale, independently for output and prompts. Console availability is environment-dependent, and successful readLine results exclude line terminators.",
    sourceUrl: `${API}java/io/Console.html#readLine(java.util.Locale,java.lang.String,java.lang.Object...)`,
    tags: ["Console", "Locale", "printf", "readLine", "Java 23"],
    objectives: objectives("io-streams", "loc-numbers"),
  },
  {
    id: "CV-IO-04",
    domain: "io",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt:
      "After the object graph is serialized and read back, what is printed?",
    code: `import java.io.*;
import java.util.ArrayList;
import java.util.List;

class Holder implements Serializable {
    Object left;
    Object right;
    transient String note = "new";
    Holder(Object shared) { left = right = shared; }
}

var shared = new ArrayList<>(List.of("x"));
var original = new Holder(shared);
var bytes = new ByteArrayOutputStream();
try (var out = new ObjectOutputStream(bytes)) {
    out.writeObject(original);
}
Holder restored;
try (var in = new ObjectInputStream(
        new ByteArrayInputStream(bytes.toByteArray()))) {
    restored = (Holder) in.readObject();
}

System.out.println((restored.left == restored.right) + ":" +
    (restored.left == shared) + ":" + restored.note);`,
    options: choices(
      [
        "A",
        "true:false:null",
        "Correct. Serialization preserves sharing within the restored graph, creates new graph objects, and does not restore the transient field.",
      ],
      [
        "B",
        "false:false:null",
        "Both serialized fields referred to the same object handle, so deserialization preserves that internal identity.",
      ],
      [
        "C",
        "true:true:new",
        "Deserialization creates a distinct graph, and transient note is initialized to its default null rather than by the field initializer.",
      ],
      [
        "D",
        "Serialization fails because ArrayList is not Serializable",
        "ArrayList implements Serializable, and the contained String is serializable as well.",
      ],
    ),
    answer: ["A"],
    explanation:
      "Object serialization records handles so repeated references in one graph remain shared after restoration. The restored list is distinct from the original list, and transient note is not serialized.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/specs/serialization/serial-arch.html",
    tags: [
      "serialization",
      "object graph",
      "identity",
      "transient",
      "ObjectInputStream",
    ],
    objectives: objectives("io-serialization"),
  },
  {
    id: "CV-IO-05",
    domain: "io",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt: "Assuming the temporary file operations succeed, what is printed?",
    code: `import java.nio.file.Files;

var file = Files.createTempFile("attributes", ".txt");
try {
    Files.writeString(file, "abc");
    var attributes = Files.readAttributes(
        file, "basic:size,isRegularFile");

    System.out.println(attributes.get("size") + ":" +
        attributes.get("isRegularFile"));
} finally {
    Files.deleteIfExists(file);
}`,
    options: choices(
      [
        "A",
        "3:true",
        "Correct. UTF-8 stores these three ASCII characters as three bytes, and createTempFile created a regular file.",
      ],
      [
        "B",
        "6:true",
        "The basic size attribute counts encoded bytes, and each of these ASCII characters occupies one UTF-8 byte.",
      ],
      [
        "C",
        "3:false",
        "The path denotes a regular temporary file rather than a directory or symbolic link.",
      ],
      [
        "D",
        "The comma-separated attribute query is invalid",
        "The string form supports a view name followed by a comma-separated list of requested attributes.",
      ],
    ),
    answer: ["A"],
    explanation:
      "The basic attribute view reports file size in bytes and the regular-file flag. Files.writeString defaults to UTF-8, making abc three bytes, and the temporary path is a regular file.",
    sourceUrl: `${API}java/nio/file/Files.html#readAttributes(java.nio.file.Path,java.lang.String,java.nio.file.LinkOption...)`,
    tags: ["NIO", "file attributes", "basic view", "size", "isRegularFile"],
    objectives: objectives("io-nio"),
  },

  {
    id: "CV-LOCALIZATION-01",
    domain: "localization",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt:
      "The default locale is en_US. Which two lookups produce the indicated values?",
    code: `// Labels.properties
color=base-color
size=base-size

// Labels_en.properties
color=english-color

var bundle = java.util.ResourceBundle.getBundle(
    "Labels", java.util.Locale.UK);`,
    options: choices(
      [
        "A",
        'bundle.getString("color") returns english-color',
        "Correct. en_GB falls back to the en bundle, which supplies color.",
      ],
      [
        "B",
        'bundle.getString("size") returns base-size',
        "Correct. The selected en bundle delegates its missing size key to the base bundle.",
      ],
      [
        "C",
        "color returns base-color because Labels_en_GB is absent",
        "Candidate search continues to Labels_en before reaching the base bundle.",
      ],
      [
        "D",
        "size throws MissingResourceException because Labels_en has no size",
        "Key lookup follows the parent chain, where the base bundle contains size.",
      ],
    ),
    answer: ["A", "B"],
    explanation:
      "For Locale.UK, the candidate chain includes en_GB, then en, then the base. The en bundle supplies color and inherits the missing size key from the base resource.",
    sourceUrl: `${API}java/util/ResourceBundle.html#getBundle(java.lang.String,java.util.Locale)`,
    tags: ["ResourceBundle", "candidate locale", "fallback", "parent"],
    objectives: objectives("loc-bundles"),
  },
  {
    id: "CV-LOCALIZATION-02",
    domain: "localization",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt: "What is printed?",
    code: `import java.text.MessageFormat;
import java.util.Locale;

var format = new MessageFormat(
    "{0}={1,number,integer}", Locale.US);
Object[] parsed = format.parse("items=1,234");

String label = (String) parsed[0];
long amount = ((Number) parsed[1]).longValue();
System.out.println(label + ":" + amount);`,
    options: choices(
      [
        "A",
        "items:1234",
        "Correct. The text argument is items and the US integer subformat parses the grouping separator into numeric value 1234.",
      ],
      [
        "B",
        "items:1",
        "The comma is a US grouping separator, not a point at which parsing stops.",
      ],
      [
        "C",
        "0:1",
        "The braces contain argument indexes in the pattern; those indexes are not returned as parsed values.",
      ],
      [
        "D",
        "Parsing fails because MessageFormat cannot parse number subformats",
        "MessageFormat delegates the number argument to its configured NumberFormat during parsing.",
      ],
    ),
    answer: ["A"],
    explanation:
      "MessageFormat parses each argument according to its subformat and locale. Argument 0 is the String items, while argument 1 becomes a Number representing 1234.",
    sourceUrl: `${API}java/text/MessageFormat.html#parse(java.lang.String)`,
    tags: ["MessageFormat", "parse", "number subformat", "Locale.US"],
    objectives: objectives("loc-messages", "loc-numbers"),
  },
  {
    id: "CV-LOCALIZATION-03",
    domain: "localization",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.ResolverStyle;
import java.util.Locale;

var formatter = DateTimeFormatter
    .ofPattern("dd/MM/uuuu", Locale.UK)
    .withResolverStyle(ResolverStyle.STRICT);

LocalDate leapDay = LocalDate.parse("29/02/2024", formatter);
System.out.println(leapDay.plusYears(1));`,
    options: choices(
      [
        "A",
        "2025-02-28",
        "Correct. The strict parse accepts the valid 2024 leap day, and plusYears resolves the invalid target day to February 28.",
      ],
      [
        "B",
        "2025-03-01",
        "LocalDate.plusYears adjusts to the previous valid day in the target month rather than rolling into March.",
      ],
      [
        "C",
        "A DateTimeParseException is thrown",
        "February 29 is valid in leap year 2024, even under strict resolution.",
      ],
      [
        "D",
        "The code fails because uuuu is incompatible with strict parsing",
        "uuuu supplies the proleptic year and is appropriate for strict LocalDate parsing.",
      ],
    ),
    answer: ["A"],
    explanation:
      "The explicit pattern and locale parse a valid leap day under STRICT resolution. Adding one year targets a non-leap year, so LocalDate adjusts the day to 2025-02-28.",
    sourceUrl: `${API}java/time/format/DateTimeFormatter.html#withResolverStyle(java.time.format.ResolverStyle)`,
    tags: ["DateTimeFormatter", "strict parsing", "LocalDate", "leap year"],
    objectives: objectives("loc-messages"),
  },
  {
    id: "CV-LOCALIZATION-04",
    domain: "localization",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt: "What is printed?",
    code: `import java.text.NumberFormat;
import java.util.Currency;
import java.util.Locale;

var percent = NumberFormat.getPercentInstance(Locale.US);
double ratio = percent.parse("12.5%").doubleValue();

var money = NumberFormat.getCurrencyInstance(Locale.US);
money.setCurrency(Currency.getInstance("EUR"));
double amount = money.parse("€10.00").doubleValue();

System.out.println(ratio + ":" +
    money.getCurrency().getCurrencyCode() + ":" + amount);`,
    options: choices(
      [
        "A",
        "0.125:EUR:10.0",
        "Correct. Percent parsing divides by 100, and the currency formatter is configured to parse the euro amount.",
      ],
      [
        "B",
        "12.5:EUR:10.0",
        "A percent NumberFormat parses 12.5% as the ratio 0.125.",
      ],
      [
        "C",
        "0.125:USD:10.0",
        "setCurrency changes the formatter's Currency object to EUR even though its locale remains US.",
      ],
      [
        "D",
        "Parsing € fails whenever the formatter locale is US",
        "The formatter's explicitly assigned EUR currency supplies the expected symbol for currency parsing.",
      ],
    ),
    answer: ["A"],
    explanation:
      "The US percent parser converts the displayed percentage to its fractional numeric value. The currency formatter keeps US formatting conventions but uses the explicitly selected EUR currency.",
    sourceUrl: `${API}java/text/NumberFormat.html#getPercentInstance(java.util.Locale)`,
    tags: ["NumberFormat", "percent", "currency", "parse", "Currency"],
    objectives: objectives("loc-numbers"),
  },
  {
    id: "CV-LOCALIZATION-05",
    domain: "localization",
    difficulty: "Foundation",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `import java.util.Locale;

Locale locale = new Locale.Builder()
    .setLanguage("fr")
    .setRegion("CA")
    .build();

System.out.println(locale.toLanguageTag() + ":" +
    locale.getDisplayLanguage(Locale.ENGLISH) + ":" +
    locale.getCountry());`,
    options: choices(
      [
        "A",
        "fr-CA:French:CA",
        "Correct. The builder forms Canadian French, English display naming yields French, and the region code is CA.",
      ],
      [
        "B",
        "fr_CA:French:Canada",
        "toLanguageTag uses a hyphenated BCP 47 tag, and getCountry returns the region code rather than its display name.",
      ],
      [
        "C",
        "fr-CA:fr:CA",
        "getDisplayLanguage(Locale.ENGLISH) returns an English display name, not the raw language code.",
      ],
      [
        "D",
        "The builder rejects uppercase region codes",
        "A two-letter uppercase region such as CA is valid input to Locale.Builder.",
      ],
    ),
    answer: ["A"],
    explanation:
      "Locale.Builder creates a normalized language-and-region locale. Its language tag is fr-CA, the English display name of fr is French, and getCountry returns CA.",
    sourceUrl: `${API}java/util/Locale.Builder.html`,
    tags: ["Locale.Builder", "language tag", "display language", "region"],
    objectives: objectives("loc-bundles"),
  },
];
