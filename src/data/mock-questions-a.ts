import type { Question } from "./questions";

type Choice = readonly [text: string, explanation: string];
type MockDraft = Omit<Question, "options"> & {
  choices: readonly [Choice, Choice, Choice, Choice];
};

function mockItem({ choices, ...question }: MockDraft): Question {
  return {
    ...question,
    options: choices.map(([text, explanation], index) => ({
      id: "ABCD"[index],
      text,
      explanation,
    })),
  };
}

/**
 * Original, mock-only study questions aligned to the Java SE 25 Developer
 * objectives. These are not reproduced certification items.
 */
export const mockQuestionsA: Question[] = [
  mockItem({
    id: "MA-VALUES-01",
    domain: "values",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `import java.time.*;

var start = Instant.parse("2025-01-01T00:00:00Z");
var end = start.plusSeconds(5_430);
var elapsed = Duration.between(start, end);
System.out.println(elapsed.toMinutes() + ":"
        + elapsed.toMinutesPart() + ":"
        + elapsed.toSecondsPart());`,
    choices: [
      [
        "90:30:30",
        "Correct. The duration is 90 total minutes and 30 seconds; its minute part within the hour is 30.",
      ],
      [
        "1:30:30",
        "toMinutes() returns the total number of complete minutes, not the hour component.",
      ],
      [
        "90:90:30",
        "toMinutesPart() is the component within the current hour and is therefore 30, not 90.",
      ],
      [
        "The code does not compile",
        "Instant.plusSeconds, Duration.between, toMinutesPart, and toSecondsPart are all valid APIs.",
      ],
    ],
    answer: ["A"],
    explanation:
      "5,430 seconds is 1 hour, 30 minutes, and 30 seconds. Duration.toMinutes() reports 90 total minutes, while toMinutesPart() and toSecondsPart() report 30 and 30.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/Duration.html",
    tags: ["Duration", "Instant", "date-time components"],
  }),
  mockItem({
    id: "MA-VALUES-02",
    domain: "values",
    difficulty: "Expert",
    type: "single",
    pattern: "compilation",
    prompt: "What is the result of compiling and running this program?",
    code: `class Route {
    static String join(int first, int... rest) {
        return first + ":" + rest.length;
    }
    static String join(Integer... all) {
        return "boxed:" + all.length;
    }
    public static void main(String[] args) {
        System.out.println(join(7));
    }
}`,
    choices: [
      [
        "7:0",
        "The fixed int parameter does not make the first overload more specific during the variable-arity phase.",
      ],
      [
        "boxed:1",
        "The all-Integer overload is applicable by boxing plus variable arity, but it is not uniquely more specific.",
      ],
      [
        "The invocation is ambiguous",
        "Correct. Neither variable-arity overload is more specific for the single int argument.",
      ],
      [
        "A runtime ClassCastException is thrown",
        "Overload selection is a compile-time issue; execution never reaches a cast.",
      ],
    ],
    answer: ["C"],
    explanation:
      "Both methods require variable-arity invocation for join(7). One accepts int as its fixed parameter; the other boxes it to Integer as its sole vararg element. Neither signature is more specific than the other for overload resolution, so the call is ambiguous.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12.2.4",
    tags: ["varargs", "overloading", "boxing", "ambiguity"],
  }),
  mockItem({
    id: "MA-VALUES-03",
    domain: "values",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `int x = 3;
long y = 2;
var a = x++ * y + 4 / 3;
var b = (double) (x / y);
var c = "" + x + y + a;
System.out.println(a + "|" + b + "|" + c);`,
    choices: [
      [
        "7|2.0|427",
        "Correct. Post-increment uses 3, integer division makes 4/3 equal 1 and x/y equal 2, and String concatenation proceeds left to right.",
      ],
      [
        "7|2.0|13",
        "Once the empty String is the left operand, the later values concatenate rather than add numerically.",
      ],
      [
        "7|2.5|427",
        "The cast occurs after integer division x/y, so 4/2 becomes integer 2 before conversion to double.",
      ],
      [
        "9|2.0|429",
        "x++ contributes the old value 3, and 4/3 is integer division yielding 1.",
      ],
    ],
    answer: ["A"],
    explanation:
      "a is 3*2+1, or 7, and x becomes 4. Parentheses force x/y to be evaluated as integer division before the cast, producing 2.0. The final expression concatenates 4, 2, and 7 into 427.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.18.1",
    tags: ["evaluation order", "integer division", "casts", "concatenation"],
  }),
  mockItem({
    id: "MA-VALUES-04",
    domain: "values",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt:
      "Which declarations compile? Select all that apply. Each line is considered independently inside a method.",
    code: `// Line 1
var a = new int[] { 1, 2 };
// Line 2
var b = { 1, 2 };
// Line 3
var c = (String) null;
// Line 4
var d = null;`,
    choices: [
      [
        "Line 1",
        "Correct. An explicitly created array has type int[], which can be inferred for a local variable.",
      ],
      [
        "Line 2",
        "An array initializer without new and an explicit array type is not a standalone expression usable with var.",
      ],
      [
        "Line 3",
        "Correct. The cast gives the null expression the inferable type String.",
      ],
      [
        "Line 4",
        "The null type alone does not provide a denotable local variable type for var to infer.",
      ],
    ],
    answer: ["A", "C"],
    explanation:
      "Local variable type inference needs an initializer expression with an inferable type. new int[]{...} and (String)null meet that requirement; a bare array initializer and an untyped null initializer do not.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.4",
    tags: ["var", "arrays", "null type", "type inference"],
  }),
  mockItem({
    id: "MA-VALUES-05",
    domain: "values",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `StringBuilder a = new StringBuilder("java");
StringBuilder b = a;
String s = a.substring(1, 3);
a.delete(0, 2).append(s);
b.insert(1, a.charAt(0));
System.out.println(a + "|" + b + "|" + s);`,
    choices: [
      [
        "vava|vava|av",
        "a and b do alias the same builder, but the insert produces vvaav, not vava.",
      ],
      [
        "vvaav|vvaav|av",
        "Correct. Both variables reference one mutable builder, while substring created the independent String av.",
      ],
      [
        "vvaav|java|av",
        "b aliases a; it does not retain a separate copy of the original builder.",
      ],
      [
        "The code throws StringIndexOutOfBoundsException",
        "All indices are valid: substring uses positions 1 through 2, and insert position 1 exists.",
      ],
    ],
    answer: ["B"],
    explanation:
      "substring(1,3) returns av. Deleting ja leaves va, then appending av gives vaav. Since a and b are aliases, inserting a.charAt(0), v, at index 1 changes the shared builder to vvaav.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/StringBuilder.html",
    tags: ["StringBuilder", "aliasing", "substring", "mutation"],
  }),

  mockItem({
    id: "MA-FLOW-01",
    domain: "flow",
    difficulty: "Expert",
    type: "single",
    pattern: "compilation",
    prompt: "What is the result of compiling this code?",
    code: `sealed interface Token permits Word, End {}
record Word(String text) implements Token {}
final class End implements Token {}

static int size(Token token) {
    return switch (token) {
        case Word(String s) when s.isEmpty() -> 0;
        case Word(String s) -> s.length();
        case End e -> -1;
    };
}`,
    choices: [
      [
        "It compiles; size(null) returns -1",
        "The switch is exhaustive for non-null Token values, but null does not match End.",
      ],
      [
        "It compiles; size(null) throws NullPointerException",
        "Correct. The permitted non-null subtypes are covered, so no default is needed; an unhandled null selector throws NullPointerException.",
      ],
      [
        "It fails because the guarded Word case dominates the unguarded Word case",
        "A guarded case does not dominate the following unguarded case; the unguarded case supplies the fallback for other Word values.",
      ],
      [
        "It fails because every switch expression requires default",
        "An exhaustive enum or sealed-type switch expression need not declare an explicit default.",
      ],
    ],
    answer: ["B"],
    explanation:
      "The sealed hierarchy lets the compiler prove exhaustiveness across Word and End. The guarded Word arm handles empty text and the later unguarded Word arm handles the rest. Because there is no case null, passing null throws NullPointerException.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.11",
    tags: [
      "pattern switch",
      "record pattern",
      "guards",
      "sealed exhaustiveness",
      "null",
    ],
  }),
  mockItem({
    id: "MA-FLOW-02",
    domain: "flow",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `int total = 0;
outer:
for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= 3; j++) {
        if (i == j) continue;
        if (i + j == 5) break outer;
        total += i * 10 + j;
    }
}
System.out.println(total);`,
    choices: [
      [
        "46",
        "Correct. The additions are 12, 13, and 21; the labeled break occurs at i=2, j=3 before another addition.",
      ],
      [
        "69",
        "This includes 23, but the break occurs before total += executes for i=2, j=3.",
      ],
      [
        "123",
        "The labeled break exits both loops, so later outer-loop iterations are not processed.",
      ],
      [
        "The code does not compile",
        "Both an unlabeled continue for the inner loop and a labeled break to the outer statement are legal.",
      ],
    ],
    answer: ["A"],
    explanation:
      "At (1,1) execution continues. The program adds 12 and 13. It adds 21 at (2,1), continues at (2,2), then break outer terminates both loops at (2,3), leaving 46.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.15",
    tags: ["labeled break", "continue", "nested loops", "control flow"],
  }),
  mockItem({
    id: "MA-FLOW-03",
    domain: "flow",
    difficulty: "Expert",
    type: "single",
    pattern: "compilation",
    prompt: "What happens when this method is compiled?",
    code: `static int length(Object value) {
    if (!(value instanceof String text)) {
        return -1;
    }
    if (text.isBlank()) {
        return 0;
    }
    return text.length();
}`,
    choices: [
      [
        "It compiles; text is in scope after the first if statement",
        "Correct. Reaching the following statements means the negated pattern test did not take its returning branch, so the match is established.",
      ],
      [
        "It fails because text is scoped only inside the first if body",
        "Flow scoping can extend a pattern variable beyond an if when the nonmatching path cannot complete normally.",
      ],
      [
        "It fails because instanceof patterns cannot be negated",
        "A pattern test may be negated; definite matching controls where its variable is available.",
      ],
      [
        "It compiles but throws ClassCastException for non-String values",
        "No cast is attempted on a nonmatch; that path returns -1.",
      ],
    ],
    answer: ["A"],
    explanation:
      "The only path past the first if is one on which value matched String text. The nonmatching path returns, so text is definitely matched and in scope for the remaining statements.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.3.2",
    tags: ["pattern variable", "flow scoping", "instanceof", "definite match"],
  }),
  mockItem({
    id: "MA-FLOW-04",
    domain: "flow",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `int day = 2;
String label = switch (day) {
    case 1, 2 -> {
        int n = day * 3;
        yield n > 5 ? "work-" + n : "rest";
    }
    case 3 -> throw new IllegalStateException();
    default -> "other";
};
System.out.println(label);`,
    choices: [
      [
        "work-6",
        "Correct. Case 1,2 matches, n is 6, and yield supplies work-6 as the switch expression's value.",
      ],
      [
        "rest",
        "For day 2, n > 5 is true, so the first conditional operand is selected.",
      ],
      [
        "other",
        "The case label containing 2 matches before default is relevant.",
      ],
      [
        "The code does not compile because yield cannot appear in a block arm",
        "A block arm of a switch expression uses yield to produce its value.",
      ],
    ],
    answer: ["A"],
    explanation:
      "The selector 2 enters the grouped arrow label. The block computes n=6 and yields the result of the conditional expression, work-6.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.28",
    tags: [
      "switch expression",
      "yield",
      "arrow labels",
      "conditional expression",
    ],
  }),
  mockItem({
    id: "MA-FLOW-05",
    domain: "flow",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `int n = 0;
do {
    n++;
    if (n == 2) continue;
    System.out.print(n);
} while (n++ < 3);
System.out.println(":" + n);`,
    choices: [
      [
        "134:5",
        "This assumes the body observes n as 2, but the first condition increments n from 1 to 2 before the next body increment changes it to 3.",
      ],
      [
        "13:4",
        "Correct. The condition's post-increment causes the next body to increment n from 2 to 3, so the continue branch is never reached.",
      ],
      [
        "1234:5",
        "The condition advances n from 1 to 2, and the next body increment immediately advances it to 3; the body never prints 2 or reaches 4.",
      ],
      [
        "The loop never terminates",
        "The post-incremented condition eventually tests 4 < 3, which is false.",
      ],
    ],
    answer: ["B"],
    explanation:
      "The first body changes n to 1 and prints it; the condition tests 1 and leaves n as 2. The next body immediately changes n to 3, so it prints 3 rather than taking continue. The final condition tests 3, increments n to 4, and terminates.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.13",
    tags: ["do-while", "continue", "post-increment", "loop tracing"],
  }),

  mockItem({
    id: "MA-OOP-01",
    domain: "oop",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `class Box {
    private int value = 4;
    class Label {
        private int value = 7;
        int total(int value) {
            return value + this.value + Box.this.value;
        }
    }
    public static void main(String[] args) {
        System.out.println(new Box().new Label().total(3));
    }
}`,
    choices: [
      [
        "10",
        "This omits the enclosing Box instance's field, which is selected by Box.this.value.",
      ],
      [
        "14",
        "Correct. The parameter is 3, the Label field is 7, and the enclosing Box field is 4.",
      ],
      [
        "7",
        "This includes only the Label field and omits both the parameter and the enclosing Box field.",
      ],
      [
        "The code does not compile because Label is non-static",
        "A member inner class can be instantiated using an enclosing instance expression as shown.",
      ],
    ],
    answer: ["B"],
    explanation:
      "The parameter value is 3, this.value refers to Label.value (7), and Box.this.value refers to the enclosing Box.value (4), totaling 14.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.1.3",
    tags: [
      "member inner class",
      "qualified this",
      "shadowing",
      "enclosing instance",
    ],
  }),
  mockItem({
    id: "MA-OOP-02",
    domain: "oop",
    difficulty: "Applied",
    type: "single",
    pattern: "compilation",
    prompt: "What is the result of compiling this method?",
    code: `static void demo() {
    int base = 10;
    class LocalAdder {
        int add(int n) { return n + base; }
    }
    Runnable task = new Runnable() {
        public void run() { System.out.print(base); }
    };
    base++;
    System.out.println(new LocalAdder().add(2));
    task.run();
}`,
    choices: [
      [
        "It prints 13 followed by 11",
        "Execution never begins because base is captured and later modified.",
      ],
      [
        "It prints 12 followed by 10",
        "That would require the captured value to remain 10, but the later increment makes the declaration illegal rather than snapshotting the value.",
      ],
      [
        "It fails because base is not final or effectively final",
        "Correct. Both the local class and anonymous class capture base, and base++ means it is not effectively final.",
      ],
      [
        "It fails because an anonymous class cannot implement Runnable inside a method",
        "Anonymous classes may be declared in method bodies and can implement interfaces.",
      ],
    ],
    answer: ["C"],
    explanation:
      "A local or anonymous class may capture a local variable only if that variable is final or effectively final. The later base++ assignment removes effective-final status for the entire method.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.1.3",
    tags: ["local class", "anonymous class", "capture", "effectively final"],
  }),
  mockItem({
    id: "MA-OOP-03",
    domain: "oop",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt: "Which statements are true? Select all that apply.",
    code: `sealed interface Event permits Login, Logout {}

record Login(String user) implements Event {}

final class Logout implements Event {}

static int size(Event event) {
    return switch (event) {
        case Login(var user) -> user.length();
        case Logout ignored -> 0;
    };
}`,
    choices: [
      [
        "Login is a valid permitted subtype without an explicit final modifier",
        "Correct. Every record class is implicitly final, satisfying the restriction on a direct subtype of a sealed interface.",
      ],
      [
        "The switch expression is exhaustive without a default label",
        "Correct. The two case labels cover every permitted direct subtype of the sealed Event interface.",
      ],
      [
        "Login directly extends Event and therefore does not extend java.lang.Record",
        "A record implements an interface; its direct superclass remains java.lang.Record.",
      ],
      [
        "A record Audit(String action) may implement Event without changing the permits clause",
        "An explicitly permitted sealed hierarchy rejects an additional direct subtype until that subtype is named in the permits clause.",
      ],
    ],
    answer: ["A", "B"],
    explanation:
      "A record is implicitly final, so Login may be a permitted direct implementation of Event. Because Login and Logout exhaust Event's permitted hierarchy, the pattern switch needs no default. Login still extends java.lang.Record, and no unlisted direct implementation is allowed.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.1.6",
    tags: ["sealed interface", "record", "permits", "exhaustive switch"],
  }),
  mockItem({
    id: "MA-OOP-04",
    domain: "oop",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt:
      "Which statements are true? Select all that apply. Assume execution reaches each numbered comment in order.",
    code: `final class Snapshot {
    private final int[] values;
    Snapshot(int... values) { this.values = values.clone(); }
    int[] values() { return values.clone(); }
}

int[] source = { 1, 2 };
Snapshot first = new Snapshot(source);
Snapshot second = first;
source[0] = 9;
System.out.println(second.values()[0]); // 1
first = null;                         // 2
second = null;                        // 3`,
    choices: [
      [
        "The print statement outputs 1",
        "Correct. The constructor cloned source, so changing the caller's array does not change the stored array.",
      ],
      [
        "Callers can mutate a Snapshot's stored array through values()",
        "values() returns a fresh clone, so mutating that returned array does not reach the stored representation.",
      ],
      [
        "The Snapshot object is eligible for garbage collection immediately after comment 2",
        "second still references the same Snapshot after first is assigned null.",
      ],
      [
        "The Snapshot object is eligible for garbage collection after comment 3",
        "Correct. Once both first and second are null, no shown live reference reaches that object.",
      ],
    ],
    answer: ["A", "D"],
    explanation:
      "Defensive copies on input and output prevent the mutable array from exposing Snapshot's state, and the final class prevents a subclass from weakening that design. Reassigning first does not affect second; only after second is also cleared does the shown Snapshot become unreachable.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html#jls-12.6.1",
    tags: [
      "immutability",
      "defensive copy",
      "varargs",
      "reachability",
      "garbage collection",
    ],
  }),
  mockItem({
    id: "MA-OOP-05",
    domain: "oop",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `@FunctionalInterface
interface Operation {
    int apply(int value);
    private int twice(int value) { return value * 2; }
    default int evaluate(int value) { return twice(apply(value)); }
    static Operation plus(int amount) {
        return value -> value + amount;
    }
}

Operation op = Operation.plus(3);
System.out.println(op.evaluate(4));`,
    choices: [
      [
        "7",
        "evaluate passes the result of apply to twice, so one more operation remains after addition.",
      ],
      [
        "14",
        "Correct. The lambda adds 3 to 4, and the private interface helper doubles 7.",
      ],
      [
        "The annotation is rejected because the interface declares four methods",
        "Only apply is abstract; private, default, and static methods do not add abstract function descriptors.",
      ],
      [
        "The code fails because a private interface method cannot be called by a default method",
        "Private interface methods exist specifically as implementation helpers for methods in that interface.",
      ],
    ],
    answer: ["B"],
    explanation:
      "Operation remains functional because it has exactly one abstract method, apply. plus returns a compatible lambda; evaluate invokes it and then invokes the private helper, producing (4+3)*2 = 14.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-9.html#jls-9.8",
    tags: [
      "functional interface",
      "lambda",
      "private interface method",
      "static interface method",
      "default method",
    ],
  }),

  mockItem({
    id: "MA-EXCEPTIONS-01",
    domain: "exceptions",
    difficulty: "Applied",
    type: "single",
    pattern: "compilation",
    prompt: "What is the result of compiling and running this program?",
    code: `class DataException extends Exception {}
class MissingDataException extends DataException {}

class Parent {
    void load() throws DataException {}
}
class Child extends Parent {
    @Override void load() throws MissingDataException {
        throw new MissingDataException();
    }
    public static void main(String[] args) {
        try { new Child().load(); }
        catch (DataException e) { System.out.println(e.getClass().getSimpleName()); }
    }
}`,
    choices: [
      [
        "It prints MissingDataException",
        "Correct. An override may narrow a declared checked exception to a subtype, and the superclass catch handles it.",
      ],
      [
        "It prints DataException",
        "The object thrown is a MissingDataException; catching it through a superclass type does not change its runtime class.",
      ],
      [
        "It fails because an overriding method cannot declare a checked exception",
        "It may declare the same checked exception or a subtype of one declared by the overridden method.",
      ],
      [
        "It fails because the catch type must exactly match the thrown type",
        "A catch parameter catches instances of its declared type and its subtypes.",
      ],
    ],
    answer: ["A"],
    explanation:
      "MissingDataException is a checked subtype of DataException, so Child.load legally narrows the throws clause. The thrown object's runtime class remains MissingDataException when caught as DataException.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.8.3",
    tags: [
      "custom exception",
      "checked exception",
      "overriding",
      "throws narrowing",
    ],
  }),
  mockItem({
    id: "MA-EXCEPTIONS-02",
    domain: "exceptions",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `class Door implements AutoCloseable {
    private final String name;
    Door(String name) { this.name = name; }
    public void close() { throw new IllegalStateException(name); }
}

try (var a = new Door("A"); var b = new Door("B")) {
    throw new IllegalArgumentException("BODY");
} catch (Exception e) {
    System.out.print(e.getMessage());
    for (Throwable s : e.getSuppressed())
        System.out.print(":" + s.getMessage());
}`,
    choices: [
      [
        "BODY:A:B",
        "Resources close in reverse declaration order, so B's failure is suppressed before A's.",
      ],
      [
        "B:A:BODY",
        "The body exception remains primary; close failures do not replace it in try-with-resources.",
      ],
      [
        "BODY:B:A",
        "Correct. BODY is primary, then close failures from B and A are attached in reverse close order.",
      ],
      [
        "Only BODY",
        "Both close failures are retained in the primary exception's suppressed-exception array.",
      ],
    ],
    answer: ["C"],
    explanation:
      "The body throws first. b then a are closed, and each close failure is suppressed onto the IllegalArgumentException in occurrence order, producing BODY:B:A.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20.3",
    tags: [
      "try-with-resources",
      "suppressed exceptions",
      "close order",
      "primary exception",
    ],
  }),
  mockItem({
    id: "MA-EXCEPTIONS-03",
    domain: "exceptions",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt:
      "Which statements about Hybrid.read() are true? Select all that apply.",
    code: `import java.io.FileNotFoundException;
import java.io.IOException;

interface Disk {
    Number read() throws IOException;
}
interface Cache {
    Integer read() throws FileNotFoundException;
}
class Hybrid implements Disk, Cache {
    public Integer read() throws FileNotFoundException {
        return 7;
    }
}`,
    choices: [
      [
        "The shown Hybrid class compiles",
        "Correct. Integer is compatible with both inherited return types, and FileNotFoundException is permitted by both inherited throws clauses.",
      ],
      [
        "Hybrid.read() may replace FileNotFoundException with IOException",
        "IOException would be broader than the FileNotFoundException allowed by Cache.read(), so that replacement would not implement both methods.",
      ],
      [
        "Hybrid.read() may remove its throws clause",
        "Correct. An overriding method may declare fewer checked exceptions, including none.",
      ],
      [
        "Hybrid.read() may change its return type from Integer to Number",
        "Number would not be return-type-substitutable for Cache.read(), whose contract returns the narrower Integer type.",
      ],
    ],
    answer: ["A", "C"],
    explanation:
      "One implementation can satisfy both inherited methods only when its return type is substitutable for both and every declared checked exception is allowed by both. Integer and FileNotFoundException meet those constraints, and omitting checked exceptions is also legal.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.8.3",
    tags: [
      "overriding",
      "covariant return",
      "throws compatibility",
      "checked exceptions",
      "multiple inheritance",
    ],
  }),
  mockItem({
    id: "MA-EXCEPTIONS-04",
    domain: "exceptions",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt: "Which statements are true? Select all that apply.",
    code: `class Recoverable extends Exception {}
class Specific extends Recoverable {}
class Fatal extends RuntimeException {}

static void inspect(boolean fatal) throws Recoverable {
    if (fatal) {
        throw new Fatal();
    }
    throw new Specific();
}`,
    choices: [
      [
        "A caller of inspect must catch or declare Recoverable",
        "Correct. Recoverable is checked, and inspect declares that it may escape.",
      ],
      [
        "inspect must add Fatal to its throws clause",
        "Fatal extends RuntimeException, so it is unchecked and need not appear in a throws clause.",
      ],
      [
        "A catch (Recoverable e) block may be followed by catch (Specific e)",
        "The later Specific handler would be unreachable because the earlier Recoverable handler already catches it.",
      ],
      [
        "A catch (Specific e) block may be followed by catch (Recoverable e)",
        "Correct. Catching the subtype first leaves other Recoverable exceptions for the following handler.",
      ],
    ],
    answer: ["A", "D"],
    explanation:
      "Recoverable and Specific are checked exceptions, while Fatal is unchecked. A caller must handle the declared Recoverable outcome, and exception handlers must be ordered from a more specific subtype to a broader supertype.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html#jls-11.2",
    tags: [
      "custom exception",
      "checked exception",
      "unchecked exception",
      "catch ordering",
    ],
  }),
  mockItem({
    id: "MA-EXCEPTIONS-05",
    domain: "exceptions",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `class Resource implements AutoCloseable {
    Resource(String name, boolean fail) {
        System.out.print(name);
        if (fail) throw new IllegalStateException(name);
    }
    public void close() { System.out.print("C"); }
}

try (var first = new Resource("A", false);
     var second = new Resource("B", true)) {
    System.out.print("X");
} catch (Exception e) {
    System.out.print(":" + e.getMessage());
}`,
    choices: [
      [
        "AB:X",
        "The successfully initialized first resource must be closed after second's initialization fails.",
      ],
      [
        "ABC:B",
        "Correct. A initializes, B prints then throws, first closes and prints C, and the catch prints :B.",
      ],
      [
        "ABCC:B",
        "second never finishes initialization, so it is not a resource that can be closed.",
      ],
      [
        "ABXC:B",
        "The try body is never entered because resource initialization failed first.",
      ],
    ],
    answer: ["B"],
    explanation:
      "Resource initializers run left to right. When second's constructor throws, only first was initialized, so first is closed. The body is skipped and the initialization exception reaches catch.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20.3",
    tags: [
      "try-with-resources",
      "resource initialization",
      "close",
      "constructor exception",
    ],
  }),

  mockItem({
    id: "MA-COLLECTIONS-01",
    domain: "collections",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `import java.util.*;

Deque<Integer> deque = new ArrayDeque<>();
deque.addFirst(1);
deque.addLast(2);
deque.push(3);
int a = deque.pollLast();
int b = deque.pop();
int c = deque.peek();
System.out.println(a + ":" + b + ":" + c);`,
    choices: [
      [
        "2:3:1",
        "Correct. The deque becomes [3,1,2]; pollLast removes 2, pop removes first element 3, and peek sees 1.",
      ],
      [
        "3:1:2",
        "push operates at the front, while pollLast operates at the opposite end.",
      ],
      [
        "2:1:3",
        "After removing the tail 2, pop removes the head 3 rather than the middle 1.",
      ],
      [
        "The code throws NoSuchElementException",
        "The deque is nonempty for pop, and peek would return null rather than throw if it were empty.",
      ],
    ],
    answer: ["A"],
    explanation:
      "ArrayDeque implements both queue and stack conventions. push and pop use the first end; addLast and pollLast use the last end. The resulting removals are 2 then 3, leaving 1.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Deque.html",
    tags: ["Deque", "ArrayDeque", "stack", "queue"],
  }),
  mockItem({
    id: "MA-COLLECTIONS-02",
    domain: "collections",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt:
      "Which statements compile? Select all that apply. Assume the declarations shown are in scope and each option's statement is considered independently.",
    code: `import java.util.*;

List<Integer> ints = new ArrayList<>(List.of(1, 2));
List<Number> nums = new ArrayList<>();
List<? extends Number> source = ints;
List<? super Integer> target = nums;`,
    choices: [
      [
        "Number n = source.get(0);",
        "Correct. Reading from ? extends Number safely produces a value assignable to Number.",
      ],
      [
        "source.add(3);",
        "The captured subtype might be something other than Integer, so no non-null Integer can safely be added.",
      ],
      [
        "target.add(3);",
        "Correct. A ? super Integer consumer can safely receive an Integer.",
      ],
      [
        "Integer i = target.get(0);",
        "Reading from ? super Integer yields only Object statically because the actual list might be List<Object> or List<Number>.",
      ],
    ],
    answer: ["A", "C"],
    explanation:
      "An extends wildcard is a producer: values can be read as Number but Integer values cannot be added. A super wildcard is a consumer: Integer can be added, while reads have only type Object.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.5.1",
    tags: ["generics", "wildcards", "PECS", "capture"],
  }),
  mockItem({
    id: "MA-COLLECTIONS-03",
    domain: "collections",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `import java.util.*;

Map<String, Integer> counts = new HashMap<>();
counts.put("a", 2);
counts.merge("a", 3, Integer::sum);
counts.merge("b", 4, Integer::sum);
counts.computeIfPresent("b", (k, v) -> v - 4);
counts.computeIfAbsent("c", k -> k.length());
System.out.println(counts.get("a") + ":"
        + counts.get("b") + ":" + counts.get("c"));`,
    choices: [
      [
        "5:null:1",
        "computeIfPresent stores zero because a non-null zero result does not remove the mapping.",
      ],
      [
        "5:0:1",
        "Correct. merge sums a, inserts b, computeIfPresent replaces b with 0, and c's key length is 1.",
      ],
      [
        "3:0:1",
        "merge combines the existing a value 2 with 3, so a becomes 5.",
      ],
      [
        "5:4:1",
        "computeIfPresent runs because b is present with a non-null value and replaces it with 0.",
      ],
    ],
    answer: ["B"],
    explanation:
      "merge invokes the remapping function only for the existing a entry and directly inserts b. computeIfPresent maps b from 4 to 0; only a null result would remove it. computeIfAbsent creates c=1.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html",
    tags: ["Map", "merge", "computeIfPresent", "computeIfAbsent"],
  }),
  mockItem({
    id: "MA-COLLECTIONS-04",
    domain: "collections",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `import java.util.*;

List<String> base = new ArrayList<>(List.of("a", "b", "c"));
List<String> view = base.reversed();
view.set(0, "x");
base.add("d");
System.out.println(base + "|" + view);
view.remove(1);
System.out.println(base);`,
    choices: [
      [
        "[a, b, x, d]|[d, x, b, a] then [a, b, d]",
        "Correct. reversed() is a live reverse-ordered view; set and remove write through to base.",
      ],
      [
        "[a, b, c, d]|[x, b, a] then [a, b, c, d]",
        "This treats the reversed result as a detached copy, but it is a view.",
      ],
      [
        "[a, b, x, d]|[x, b, a] then [a, b, d]",
        "After base.add(d), the live reversed view begins with d.",
      ],
      [
        "An UnsupportedOperationException is thrown by view.set",
        "The mutable ArrayList backing supports replacement through its reversed view.",
      ],
    ],
    answer: ["A"],
    explanation:
      "view.set(0,x) replaces base's last element c. Adding d to base makes the reversed order [d,x,b,a]. Removing view index 1 removes x, base index 2, leaving [a,b,d].",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#reversed()",
    tags: ["sequenced collection", "reversed view", "List", "write-through"],
  }),
  mockItem({
    id: "MA-COLLECTIONS-05",
    domain: "collections",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `Object[][] matrix = new String[][] {
    { "A", "B" }
};
Object[] row = matrix[0];

try {
    row[1] = new StringBuilder("C");
    System.out.println("stored");
} catch (ArrayStoreException problem) {
    System.out.println(matrix[0][1] + ":" +
            row.getClass().getComponentType().getSimpleName());
}`,
    choices: [
      [
        "stored",
        "The runtime row is a String array, so it cannot store a StringBuilder even through an Object[] reference.",
      ],
      [
        "C:Object",
        "The store is rejected before the element changes, and the runtime component type is String rather than Object.",
      ],
      [
        "B:String",
        "Correct. The failed store leaves B in place, and reflection reports String as the runtime row component type.",
      ],
      [
        "The declaration of matrix does not compile",
        "Reference arrays are covariant, so a String[][] may be referenced as Object[][]; incompatible stores are checked at runtime.",
      ],
    ],
    answer: ["C"],
    explanation:
      "Array covariance permits the Object[][] and Object[] references, but the runtime row object is still String[]. Storing a StringBuilder therefore throws ArrayStoreException before replacing B, and its component type is String.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-10.html#jls-10.5",
    tags: [
      "array covariance",
      "ArrayStoreException",
      "multidimensional array",
      "runtime component type",
    ],
  }),

  mockItem({
    id: "MA-STREAMS-01",
    domain: "streams",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `import java.util.stream.*;

int result = Stream.of("ant", "bear", "cat")
        .map(String::length)
        .filter(length -> length >= 3)
        .reduce(1, Integer::sum);
System.out.println(result);`,
    choices: [
      [
        "10",
        "This sums the element lengths but omits the reduce identity value 1.",
      ],
      [
        "11",
        "Correct. The three lengths total 10, and the identity 1 is included once in this sequential reduction.",
      ],
      [
        "4",
        "reduce combines all surviving elements rather than selecting only the maximum length.",
      ],
      [
        "The code does not compile because reduce cannot use a method reference",
        "Integer::sum matches the required BinaryOperator<Integer> accumulator.",
      ],
    ],
    answer: ["B"],
    explanation:
      "map produces 3, 4, and 3; all pass the filter. reduce begins with identity 1 and adds each value, yielding 11.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html#reduce(T,java.util.function.BinaryOperator)",
    tags: ["streams", "reduce", "identity", "method reference"],
  }),
  mockItem({
    id: "MA-STREAMS-02",
    domain: "streams",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `import java.util.*;
import java.util.stream.*;

var grouped = Stream.of("ape", "bat", "ant", "bee")
        .collect(Collectors.groupingBy(
                word -> word.charAt(0),
                TreeMap::new,
                Collectors.mapping(String::length, Collectors.toList())));
System.out.println(grouped);`,
    choices: [
      [
        "{a=[3, 3], b=[3, 3]}",
        "Correct. TreeMap orders the keys a then b, and the downstream mapping collector retains encounter order within each list.",
      ],
      [
        "{a=6, b=6}",
        "The downstream collector is mapping(..., toList()), not summingInt.",
      ],
      [
        "{a=[ape, ant], b=[bat, bee]}",
        "The mapping collector transforms each word to its length before accumulating it.",
      ],
      [
        "The key order is necessarily unspecified",
        "The supplied TreeMap factory provides sorted key order.",
      ],
    ],
    answer: ["A"],
    explanation:
      "The classifier groups by initial character, TreeMap orders those keys, and the downstream mapping collector records each word's length in encounter order, producing two lists of [3,3].",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Collectors.html#groupingBy(java.util.function.Function,java.util.function.Supplier,java.util.stream.Collector)",
    tags: ["groupingBy", "downstream collector", "mapping", "TreeMap"],
  }),
  mockItem({
    id: "MA-STREAMS-03",
    domain: "streams",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `import java.util.*;

record Job(String id, int priority) {}
List<Job> jobs = List.of(
        new Job("A", 2),
        new Job("B", 1),
        new Job("C", 2));
jobs.stream()
        .sorted(Comparator.comparingInt(Job::priority))
        .map(Job::id)
        .forEachOrdered(System.out::print);`,
    choices: [
      [
        "BAC",
        "Correct. B sorts first, and the stable sort preserves A before C among equal-priority jobs.",
      ],
      [
        "BCA",
        "For an ordered stream, sorted is stable, so equal keys retain their encounter order A then C.",
      ],
      [
        "ABC",
        "The priority comparator moves B, whose priority is 1, ahead of the priority-2 jobs.",
      ],
      [
        "The code fails because Job does not implement Comparable",
        "The explicit Comparator supplies the ordering; natural ordering is unnecessary.",
      ],
    ],
    answer: ["A"],
    explanation:
      "sorted uses the supplied priority comparator. Streams with an encounter order receive a stable sort, so A remains before C when both compare with priority 2.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html#sorted(java.util.Comparator)",
    tags: ["sorted", "stable sort", "Comparator", "encounter order"],
  }),
  mockItem({
    id: "MA-STREAMS-04",
    domain: "streams",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `import java.util.stream.*;

var first = Stream.of("d", "a");
var second = Stream.of("c", "b");
Stream.concat(first, second)
        .sorted()
        .skip(1)
        .limit(2)
        .forEachOrdered(System.out::print);`,
    choices: [
      [
        "ac",
        "That would reflect portions of the original concatenation order, but sorted runs before skip and limit.",
      ],
      [
        "bc",
        "Correct. Concatenation yields d,a,c,b; sorting gives a,b,c,d; skipping one and taking two selects b,c.",
      ],
      [
        "cd",
        "limit takes the first two elements after the skip, not the last two sorted elements.",
      ],
      [
        "The code does not compile because concat requires parallel streams",
        "Stream.concat accepts sequential or parallel streams and creates a stream from both.",
      ],
    ],
    answer: ["B"],
    explanation:
      "Stream.concat preserves first-then-second encounter order, after which sorted establishes a,b,c,d. skip(1) removes a and limit(2) passes b and c.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html#concat(java.util.stream.Stream,java.util.stream.Stream)",
    tags: ["Stream.concat", "sorted", "skip", "limit"],
  }),
  mockItem({
    id: "MA-STREAMS-05",
    domain: "streams",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt:
      "Which declarations compile? Select all that apply. Each line is considered independently inside a method.",
    code: `// Line 1
java.util.function.IntUnaryOperator a = x -> x + 1;
// Line 2
var b = x -> x + 1;
// Line 3
java.util.function.Function<Integer, Integer> c = x -> x + 1;
// Line 4
Object d = x -> x + 1;`,
    choices: [
      [
        "Line 1",
        "Correct. IntUnaryOperator supplies the lambda's int parameter and int result target types.",
      ],
      [
        "Line 2",
        "A lambda expression has no standalone type, so var has no target functional-interface type to infer.",
      ],
      [
        "Line 3",
        "Correct. Function<Integer,Integer> supplies a valid target; unboxing and boxing support x + 1 and the result.",
      ],
      [
        "Line 4",
        "Object is not a functional interface and therefore cannot be the direct target type of a lambda.",
      ],
    ],
    answer: ["A", "C"],
    explanation:
      "Lambda expressions are poly expressions and require a target functional-interface type. IntUnaryOperator and Function provide one; var and Object do not.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.27",
    tags: ["lambda", "target typing", "functional interface", "var"],
  }),

  mockItem({
    id: "MA-PACKAGING-01",
    domain: "packaging",
    difficulty: "Applied",
    type: "single",
    pattern: "scenario",
    prompt:
      "Main.java and Helper.java are in the current directory with the shown contents. No class files exist. What happens when `java Main.java` is run with JDK 25?",
    code: `// Main.java
class Main {
    public static void main(String[] args) {
        System.out.println(Helper.message());
    }
}

// Helper.java
class Helper {
    static String message() { return "ready"; }
}`,
    choices: [
      [
        "It prints ready; source-file mode can compile source dependencies found for the program",
        "Correct. Multi-file source-code launch discovers and compiles the referenced Helper source as needed.",
      ],
      [
        "It fails because source-file mode permits exactly one source file in the program",
        "Modern source-file mode supports multi-file source-code programs and can discover referenced source files.",
      ],
      [
        "It fails unless Helper.java is named on the java command line",
        "The launched source file is named on the command line; dependent source can be discovered from the source path/current directory.",
      ],
      [
        "It creates Main.class and Helper.class in the current directory, then prints ready",
        "It prints ready, but source-file mode compiles in memory and does not normally leave those class files in the source directory.",
      ],
    ],
    answer: ["A"],
    explanation:
      "Java 25 source-file mode supports multi-file programs: the launcher compiles Main.java and source dependencies such as Helper.java that it finds. The generated classes are used for the run rather than emitted as ordinary javac output in the directory.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/specs/man/java.html#using-source-file-mode-to-launch-source-code-programs",
    tags: [
      "source-file mode",
      "multi-file program",
      "java launcher",
      "implicit compilation",
    ],
  }),
  mockItem({
    id: "MA-PACKAGING-02",
    domain: "packaging",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt:
      "Which statements about the unnamed module are true? Select all that apply.",
    choices: [
      [
        "Ordinary classes loaded from the class path belong to an unnamed module",
        "Correct. Each class loader has an unnamed module that contains its non-named-module classes.",
      ],
      [
        "An unnamed module reads every observable named module",
        "Correct. This broad readability preserves class-path compatibility with platform and resolved named modules.",
      ],
      [
        "A named module can declare requires unnamed; in module-info.java",
        "There is no module name denoting an unnamed module, so it cannot be the target of requires.",
      ],
      [
        "Packages in an unnamed module must be listed in exports directives",
        "An unnamed module has no module descriptor and is treated as exporting its packages.",
      ],
    ],
    answer: ["A", "B"],
    explanation:
      "Class-path classes are members of an unnamed module. It reads every observable module and exports its packages, but named modules cannot require it because it has no name usable in a requires directive.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html#jls-7.7.5",
    tags: ["unnamed module", "class path", "readability", "JPMS"],
  }),
  mockItem({
    id: "MA-PACKAGING-03",
    domain: "packaging",
    difficulty: "Applied",
    type: "single",
    pattern: "scenario",
    prompt:
      "Given these descriptors, which module is guaranteed to read m.logging solely because of the shown directives?",
    code: `// m.logging/module-info.java
module m.logging { exports log.api; }

// m.service/module-info.java
module m.service {
    requires transitive m.logging;
    exports service.api;
}

// m.app/module-info.java
module m.app { requires m.service; }`,
    choices: [
      [
        "Only m.service",
        "requires transitive propagates readability through m.service to modules that require it.",
      ],
      [
        "m.service and m.app",
        "Correct. m.service directly reads m.logging, and m.app reads it through the transitive dependence.",
      ],
      [
        "Only m.app",
        "m.service necessarily reads the module named in its own requires transitive directive.",
      ],
      [
        "No module, because exports is not transitive",
        "Readability propagation comes from requires transitive; exports separately controls accessible packages.",
      ],
    ],
    answer: ["B"],
    explanation:
      "m.service directly requires m.logging. Because that requirement is transitive, m.app—by requiring m.service—also reads m.logging. Access remains limited to packages m.logging exports, such as log.api.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html#jls-7.7.1",
    tags: ["JPMS", "requires transitive", "readability", "exports"],
  }),
  mockItem({
    id: "MA-PACKAGING-04",
    domain: "packaging",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt:
      "A modular service application uses the shown declarations. Which statements are true? Select all that apply.",
    code: `// API in module m.spi
package spi;
public interface Codec { String name(); }

// consumer descriptor
module m.consumer {
    requires m.spi;
    uses spi.Codec;
}

// provider descriptor
module m.provider {
    requires m.spi;
    provides spi.Codec with impl.JsonCodec;
}`,
    choices: [
      [
        "m.consumer can locate configured providers with ServiceLoader.load(Codec.class)",
        "Correct. uses declares the consumer's service dependency, and ServiceLoader can discover providers in the module configuration.",
      ],
      [
        "impl.JsonCodec must be public",
        "Correct. A provider named in a provides directive must be a public top-level or static class or interface.",
      ],
      [
        "m.provider must export package impl to m.consumer",
        "Service binding does not require the provider implementation package to be exported to consumers.",
      ],
      [
        "m.provider declares the implementation with a provides ... with directive",
        "Correct. That directive associates the service interface with its provider implementation.",
      ],
    ],
    answer: ["A", "B", "D"],
    explanation:
      "The consumer declares uses and loads the service via ServiceLoader; the provider declares provides ... with and its named provider must be public. Consumers need not receive ordinary exported access to the implementation package.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html#jls-7.7.4",
    tags: ["ServiceLoader", "uses", "provides", "module services"],
  }),
  mockItem({
    id: "MA-PACKAGING-05",
    domain: "packaging",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt:
      "Classes are under out, including app/Main.class. What does this command do?",
    code: `jar --create --file runner.jar --main-class app.Main -C out .`,
    choices: [
      [
        "Compiles sources under out and runs app.Main",
        "jar packages existing files; javac compiles and java launches them.",
      ],
      [
        "Creates runner.jar from out and records app.Main as the launch entry point",
        "Correct. -C changes the input directory and --main-class writes the Main-Class manifest attribute.",
      ],
      [
        "Creates a modular JAR whose module name is app.Main",
        "--main-class sets an entry point, not a module name or module descriptor.",
      ],
      [
        "Updates an existing runner.jar but cannot create a new one",
        "--create explicitly requests creation of the archive.",
      ],
    ],
    answer: ["B"],
    explanation:
      "The command creates runner.jar containing the files rooted at out and records app.Main as its main class, allowing a later java -jar runner.jar launch when the archive is otherwise valid.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/specs/man/jar.html",
    tags: ["jar", "main class", "manifest", "packaging"],
  }),

  mockItem({
    id: "MA-CONCURRENCY-01",
    domain: "concurrency",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `import java.util.concurrent.locks.*;

ReentrantLock lock = new ReentrantLock();
lock.lock();
try {
    boolean acquired = lock.tryLock();
    try {
        System.out.println(acquired + ":" + lock.getHoldCount());
    } finally {
        if (acquired) lock.unlock();
    }
} finally {
    lock.unlock();
}`,
    choices: [
      [
        "false:1",
        "A ReentrantLock permits its owning thread to acquire it again, including through tryLock().",
      ],
      [
        "true:1",
        "The successful second acquisition increments the current thread's hold count to 2.",
      ],
      [
        "true:2",
        "Correct. The same thread acquires the reentrant lock twice and then releases it once in each finally block.",
      ],
      [
        "The code deadlocks at tryLock()",
        "tryLock does not block, and reentrancy lets the owner reacquire this lock anyway.",
      ],
    ],
    answer: ["C"],
    explanation:
      "The initial lock() establishes hold count 1. Because the caller is the owner, tryLock() succeeds and raises it to 2. Balanced unlock calls in the nested finally blocks return the count to zero.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/locks/ReentrantLock.html",
    tags: ["Lock", "ReentrantLock", "tryLock", "hold count"],
  }),
  mockItem({
    id: "MA-CONCURRENCY-02",
    domain: "concurrency",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt:
      "Assume this code is in a method declared `throws Exception`. What does it print?",
    code: `import java.util.concurrent.*;

ExecutorService service = Executors.newSingleThreadExecutor();
try {
    Future<Integer> answer = service.submit(() -> {
        int value = 6;
        return value * 7;
    });
    System.out.println(answer.get());
} finally {
    service.shutdown();
}`,
    choices: [
      [
        "42",
        "Correct. The value-returning lambda is a Callable<Integer>, and Future.get obtains its result.",
      ],
      [
        "null",
        "submit(Runnable) can yield a null result, but this lambda returns a value and selects a Callable overload.",
      ],
      [
        "The code fails because submit accepts only Runnable",
        "ExecutorService has submit overloads for both Runnable and Callable tasks.",
      ],
      [
        "The code always throws CancellationException after shutdown",
        "shutdown occurs only after get completes and does not cancel already submitted tasks.",
      ],
    ],
    answer: ["A"],
    explanation:
      "A block lambda with a returned value is compatible with Callable<Integer>. The single worker computes 42, get waits for and returns it, and shutdown then prevents new submissions without cancelling completed work.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ExecutorService.html#submit(java.util.concurrent.Callable)",
    tags: ["Callable", "Future", "ExecutorService", "submit", "shutdown"],
  }),
  mockItem({
    id: "MA-CONCURRENCY-03",
    domain: "concurrency",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt:
      "Assume this code is in a method declared `throws Exception`. What is guaranteed to be printed?",
    code: `import java.util.*;
import java.util.concurrent.*;

try (ExecutorService pool = Executors.newFixedThreadPool(3)) {
    List<Callable<String>> tasks = List.of(
            () -> "A",
            () -> "B",
            () -> "C");
    List<Future<String>> results = pool.invokeAll(tasks);
    for (Future<String> result : results)
        System.out.print(result.get());
}`,
    choices: [
      [
        "ABC",
        "Correct. invokeAll returns futures in the same sequential order as the supplied task list, independent of completion order.",
      ],
      [
        "Any permutation of ABC",
        "Tasks may complete in any order, but the returned Future list preserves input order and the loop follows that list.",
      ],
      [
        "Nothing, because close cancels the tasks before get",
        "The try resource closes only after the body, and invokeAll already waits for task completion.",
      ],
      [
        "The code does not compile because ExecutorService is not AutoCloseable",
        "In current Java, ExecutorService extends AutoCloseable and can be used in try-with-resources.",
      ],
    ],
    answer: ["A"],
    explanation:
      "invokeAll blocks until all tasks complete and returns one Future per task in the iterator order of the input collection. Thus the retrieval loop prints A, then B, then C.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ExecutorService.html#invokeAll(java.util.Collection)",
    tags: ["invokeAll", "Callable", "Future ordering", "fixed thread pool"],
  }),
  mockItem({
    id: "MA-CONCURRENCY-04",
    domain: "concurrency",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt:
      "Which statements about these ExecutorService factories are true? Select all that apply.",
    choices: [
      [
        "newSingleThreadExecutor() executes submitted tasks sequentially on at most one active worker",
        "Correct. It provides a single-worker execution policy and queues additional tasks.",
      ],
      [
        "newFixedThreadPool(4) creates a new platform thread for every submitted task",
        "A fixed pool reuses up to the configured number of worker threads rather than creating one per task.",
      ],
      [
        "newVirtualThreadPerTaskExecutor() starts a new virtual thread for each task rather than maintaining a worker pool",
        "Correct. It is a thread-per-task executor using virtual threads, with an unbounded thread count.",
      ],
      [
        "newCachedThreadPool() guarantees tasks execute in submission order",
        "A cached pool may execute tasks concurrently on multiple reused or newly created threads, so completion or execution order is not guaranteed.",
      ],
    ],
    answer: ["A", "C"],
    explanation:
      "The single-thread executor serializes tasks. A fixed pool reuses a bounded set of workers, a cached pool can expand and does not guarantee ordering, and the virtual-thread-per-task executor creates a fresh virtual thread for every task.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/Executors.html",
    tags: [
      "Executors",
      "single-thread executor",
      "fixed pool",
      "virtual threads",
      "cached pool",
    ],
  }),
  mockItem({
    id: "MA-CONCURRENCY-05",
    domain: "concurrency",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What value is guaranteed to be printed?",
    code: `import java.util.concurrent.atomic.*;
import java.util.stream.*;

AtomicInteger total = new AtomicInteger();
IntStream.rangeClosed(1, 4)
        .parallel()
        .forEach(total::addAndGet);
System.out.println(total.get());`,
    choices: [
      [
        "10",
        "Correct. Atomic add-and-get operations do not lose updates, and 1+2+3+4 is 10 regardless of encounter order.",
      ],
      [
        "A value from 4 through 10",
        "That range could arise from unsafely racing plain read-modify-write updates, but AtomicInteger updates are atomic.",
      ],
      [
        "4",
        "forEach processes every stream element; it does not retain only the last update's argument.",
      ],
      [
        "The code does not compile because addAndGet returns a value",
        "A method invocation expression returning int may be used in the void-compatible statement-expression position of an IntConsumer.",
      ],
    ],
    answer: ["A"],
    explanation:
      "Parallel execution can reorder the additions, but each AtomicInteger.addAndGet operation updates the shared integer atomically. Integer addition here is associative and totals 10.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/atomic/AtomicInteger.html#addAndGet(int)",
    tags: [
      "AtomicInteger",
      "parallel stream",
      "atomic update",
      "thread safety",
    ],
  }),

  mockItem({
    id: "MA-IO-01",
    domain: "io",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt: "Which statements about this call are true? Select all that apply.",
    code: `import java.nio.file.*;
import java.nio.file.attribute.*;

BasicFileAttributes attrs = Files.readAttributes(
        path,
        BasicFileAttributes.class,
        LinkOption.NOFOLLOW_LINKS);`,
    choices: [
      [
        "attrs.size() reports the file size in bytes for an ordinary file",
        "Correct. size is one of the basic attributes returned by BasicFileAttributes.",
      ],
      [
        "NOFOLLOW_LINKS requests attributes of a symbolic link itself rather than its target",
        "Correct. Without following the link, the returned attributes describe the link when path names one.",
      ],
      [
        "The call can never throw IOException once path has been constructed",
        "Reading metadata accesses the file system and can fail for missing files, permissions, or other I/O reasons.",
      ],
      [
        "BasicFileAttributes allows attrs.lastModifiedTime(newTime) to update the timestamp",
        "The attributes object exposes accessor methods; updates use Files.setLastModifiedTime or a writable attribute view.",
      ],
    ],
    answer: ["A", "B"],
    explanation:
      "BasicFileAttributes supplies read-only basic metadata such as size and times. NOFOLLOW_LINKS changes which object is inspected for a symbolic link. The operation can throw IOException, and mutation uses Files or an attribute view.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Files.html#readAttributes(java.nio.file.Path,java.lang.Class,java.nio.file.LinkOption...)",
    tags: ["NIO.2", "BasicFileAttributes", "symbolic links", "metadata"],
  }),
  mockItem({
    id: "MA-IO-02",
    domain: "io",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `import java.nio.file.attribute.*;
import java.util.*;

Set<PosixFilePermission> permissions =
        PosixFilePermissions.fromString("rw-r-----");
String text = PosixFilePermissions.toString(permissions);
boolean executable = permissions.contains(
        PosixFilePermission.OWNER_EXECUTE);
System.out.println(text + ":" + executable);`,
    choices: [
      [
        "rw-r-----:false",
        "Correct. The owner has read/write but no execute permission, and the group has read only.",
      ],
      [
        "rw-r-----:true",
        "The third owner character is -, so OWNER_EXECUTE is absent.",
      ],
      [
        "rw-r--r--:false",
        "The final three characters are ---, so others receive no permissions.",
      ],
      [
        "The code throws UnsupportedOperationException on non-POSIX systems",
        "These conversion helpers operate on an in-memory Set and String without requesting a file-system attribute view.",
      ],
    ],
    answer: ["A"],
    explanation:
      "fromString parses the nine permission characters into a set, and toString recreates that representation. There is no x in the owner's three positions, so OWNER_EXECUTE is false.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/attribute/PosixFilePermissions.html",
    tags: [
      "POSIX attributes",
      "file permissions",
      "NIO.2",
      "attribute conversion",
    ],
  }),
  mockItem({
    id: "MA-IO-03",
    domain: "io",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt:
      "Assume `Path path` names an existing writable regular file. Which statements compile and are valid operations for the basic attribute view? Select all that apply.",
    code: `import java.nio.file.*;
import java.nio.file.attribute.*;

Path path = Path.of("report.txt");`,
    choices: [
      [
        'long size = (long) Files.getAttribute(path, "basic:size");',
        "Correct. getAttribute returns Object; the basic:size value is a Long that can be cast/unboxed to long.",
      ],
      [
        'Files.setAttribute(path, "basic:lastModifiedTime", FileTime.fromMillis(1_000));',
        "Correct. The basic lastModifiedTime attribute expects a FileTime value.",
      ],
      [
        'Files.setAttribute(path, "basic:size", 0L);',
        "The basic size attribute is read-only through this API; changing file length is not performed by setting basic:size.",
      ],
      [
        'FileTime time = Files.getAttribute(path, "basic:lastModifiedTime");',
        "getAttribute has static return type Object, so an explicit cast is required for assignment to FileTime.",
      ],
    ],
    answer: ["A", "B"],
    explanation:
      "String-based attribute access returns Object and uses view:name syntax. basic:size is returned as Long but is not settable; basic:lastModifiedTime is represented by FileTime and may be updated for a writable file.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Files.html#getAttribute(java.nio.file.Path,java.lang.String,java.nio.file.LinkOption...)",
    tags: ["NIO attributes", "getAttribute", "setAttribute", "FileTime"],
  }),
  mockItem({
    id: "MA-IO-04",
    domain: "io",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt:
      "On a Unix-like default file system, what does the code print? No file-system access is performed.",
    code: `import java.nio.file.*;

Path base = Path.of("/work/app");
Path target = Path.of("/work/docs/../data/file.txt")
        .normalize();
Path relative = base.relativize(target);
System.out.println(target + "|" + relative);`,
    choices: [
      [
        "/work/data/file.txt|../data/file.txt",
        "Correct. normalize removes docs/.. lexically, and relativize moves from app to its sibling data directory.",
      ],
      [
        "/work/docs/../data/file.txt|../data/file.txt",
        "normalize removes the redundant docs/.. name pair from the target path.",
      ],
      [
        "/work/data/file.txt|/work/data/file.txt",
        "relativize returns a relative path between compatible paths rather than returning the absolute target unchanged.",
      ],
      [
        "The code throws NoSuchFileException",
        "normalize and relativize are lexical Path operations and do not require any named file to exist.",
      ],
    ],
    answer: ["A"],
    explanation:
      "Normalization reduces /work/docs/../data/file.txt to /work/data/file.txt. From /work/app, the relative route goes up once to /work and then down through data/file.txt.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Path.html",
    tags: ["Path", "normalize", "relativize", "lexical operation"],
  }),
  mockItem({
    id: "MA-IO-05",
    domain: "io",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt:
      "Assume this code is in a method declared `throws Exception`. What does it print after deserialization?",
    code: `import java.io.*;

class Account implements Serializable {
    static int rate = 1;
    transient int cache = 2;
    int balance = 3;
}

Account original = new Account();
var bytes = new ByteArrayOutputStream();
try (var out = new ObjectOutputStream(bytes)) {
    out.writeObject(original);
}
Account.rate = 9;
original.cache = 5;
original.balance = 7;
Account copy;
try (var in = new ObjectInputStream(
        new ByteArrayInputStream(bytes.toByteArray()))) {
    copy = (Account) in.readObject();
}
System.out.println(copy.rate + ":" + copy.cache + ":" + copy.balance);`,
    choices: [
      [
        "1:2:3",
        "Static and transient fields are not restored as ordinary serialized instance state.",
      ],
      [
        "9:0:3",
        "Correct. The static field has its current class value, the transient int receives its default zero, and balance is restored from the stream.",
      ],
      [
        "9:5:7",
        "Mutations made to original after serialization do not alter the earlier byte stream.",
      ],
      [
        "The code necessarily throws NotSerializableException",
        "Account implements Serializable and its serialized instance field balance is a primitive; no shown field prevents serialization.",
      ],
    ],
    answer: ["B"],
    explanation:
      "Serialization records balance=3. It omits static rate and transient cache. On reading, cache has int's default 0, balance becomes 3, and the static access observes the current class value 9.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/specs/serialization/serial-arch.html",
    tags: ["serialization", "static field", "transient field", "object state"],
  }),

  mockItem({
    id: "MA-LOCALIZATION-01",
    domain: "localization",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `import java.util.*;

Currency yen = Currency.getInstance(Locale.JAPAN);
Currency dollars = Currency.getInstance(Locale.US);
System.out.println(yen.getCurrencyCode() + ":"
        + yen.getDefaultFractionDigits() + ":"
        + dollars.getCurrencyCode());`,
    choices: [
      [
        "JPY:0:USD",
        "Correct. Japan's currency code is JPY with zero default fraction digits, while the US code is USD.",
      ],
      [
        "YEN:2:US",
        "Currency codes are ISO 4217 codes, and JPY conventionally has zero default fraction digits.",
      ],
      [
        "JPY:2:USD",
        "JPY's default fraction digit count is zero rather than two.",
      ],
      [
        "The result depends on the JVM default locale",
        "Both currencies are obtained from explicit country locales, so the default locale is not consulted here.",
      ],
    ],
    answer: ["A"],
    explanation:
      "Currency.getInstance(Locale) uses the locale's country to select an ISO currency. JPY reports zero default fraction digits, and the US currency code is USD.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Currency.html",
    tags: ["Currency", "Locale", "ISO 4217", "fraction digits"],
  }),
  mockItem({
    id: "MA-LOCALIZATION-02",
    domain: "localization",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What is the result of running this code?",
    code: `import java.time.*;
import java.time.format.*;
import java.util.*;

DateTimeFormatter formatter = new DateTimeFormatterBuilder()
        .appendPattern("uuuu-MM-dd")
        .toFormatter(Locale.US)
        .withResolverStyle(ResolverStyle.STRICT);
try {
    System.out.println(LocalDate.parse("2025-02-29", formatter));
} catch (DateTimeParseException e) {
    System.out.println("invalid");
}`,
    choices: [
      [
        "2025-02-28",
        "Strict resolution does not adjust an invalid date to the month's final valid day.",
      ],
      [
        "2025-03-01",
        "Strict resolution rejects the invalid day instead of carrying it into March.",
      ],
      [
        "invalid",
        "Correct. 2025 is not a leap year, so strict parsing rejects February 29 and the catch runs.",
      ],
      [
        "The code does not compile because Locale cannot be used with DateTimeFormatter",
        "toFormatter(Locale) is a valid builder method that creates a locale-specific formatter.",
      ],
    ],
    answer: ["C"],
    explanation:
      "The uuuu pattern supplies a proleptic year suitable for strict LocalDate resolution. Since 2025 has no February 29, parse throws DateTimeParseException and invalid is printed.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/format/ResolverStyle.html#STRICT",
    tags: ["DateTimeFormatter", "parsing", "ResolverStyle", "LocalDate"],
  }),
  mockItem({
    id: "MA-LOCALIZATION-03",
    domain: "localization",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `import java.text.*;
import java.util.*;

MessageFormat format = new MessageFormat(
        "'{0}' {0,number,integer}",
        Locale.US);
System.out.println(format.format(new Object[] { 12.6 }));`,
    choices: [
      [
        "12.6 13",
        "The apostrophes quote the first placeholder, so it is printed literally rather than formatted as 12.6.",
      ],
      [
        "{0} 13",
        "Correct. Quoted braces are literal text, while the integer number subformat rounds 12.6 to 13.",
      ],
      [
        "{0} 12",
        "The integer NumberFormat rounds to the nearest integer; it does not simply truncate 12.6.",
      ],
      [
        "The pattern is invalid because a placeholder cannot appear twice",
        "The same argument index may be referenced multiple times with literal or formatted occurrences.",
      ],
    ],
    answer: ["B"],
    explanation:
      "Single quotes in a MessageFormat pattern quote syntax, making {0} literal in the first segment. The second occurrence applies the locale's integer number format, which renders 12.6 as 13.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/text/MessageFormat.html",
    tags: ["MessageFormat", "quoting", "number subformat", "Locale"],
  }),
  mockItem({
    id: "MA-LOCALIZATION-04",
    domain: "localization",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `import java.text.*;
import java.util.*;

NumberFormat format = NumberFormat.getIntegerInstance(Locale.US);
ParsePosition position = new ParsePosition(0);
Number value = format.parse("1,234.5x", position);
System.out.println(value.longValue() + ":"
        + position.getIndex() + ":"
        + position.getErrorIndex());`,
    choices: [
      [
        "1234:5:-1",
        "Correct. Integer parsing consumes 1,234, stops before the decimal point at index 5, and records no parse error.",
      ],
      [
        "12345:8:-1",
        "The decimal point is not ignored as grouping; integer-only parsing stops when it reaches it.",
      ],
      [
        "1234:0:5",
        "A valid prefix was parsed, so the index advances to 5 and errorIndex remains -1.",
      ],
      [
        "A ParseException is thrown at the decimal point",
        "The overload accepting ParsePosition parses a valid prefix and reports its stopping index rather than requiring the whole input or throwing ParseException.",
      ],
    ],
    answer: ["A"],
    explanation:
      "The US integer formatter recognizes the grouped prefix 1,234. It stops at the decimal separator at character index 5. Because parsing succeeded for a prefix, errorIndex retains its initial -1.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/text/NumberFormat.html#parse(java.lang.String,java.text.ParsePosition)",
    tags: ["NumberFormat", "ParsePosition", "partial parse", "Locale"],
  }),
  mockItem({
    id: "MA-LOCALIZATION-05",
    domain: "localization",
    difficulty: "Applied",
    type: "single",
    pattern: "scenario",
    prompt:
      "The class path contains the shown bundles and no others. The default locale is en_US. What does the code print?",
    code: `import java.util.*;

// Messages.properties
greeting=base

// Messages_en_US.properties
greeting=hello

// Messages_fr.properties
greeting=bonjour

Locale.setDefault(Locale.US);
ResourceBundle bundle = ResourceBundle.getBundle(
        "Messages", Locale.CANADA_FRENCH);
System.out.println(bundle.getString("greeting"));`,
    choices: [
      [
        "bonjour",
        "Correct. With no fr_CA bundle, candidate lookup finds the fr language bundle before considering default-locale fallback.",
      ],
      [
        "hello",
        "The en_US default-locale candidates are considered only if no requested-locale or root candidate produces a bundle under the lookup process.",
      ],
      [
        "base",
        "The more specific available requested-language bundle Messages_fr is selected before the root bundle.",
      ],
      [
        "A MissingResourceException is thrown",
        "Messages_fr.properties and the root bundle are both valid candidates, so a bundle can be found.",
      ],
    ],
    answer: ["A"],
    explanation:
      "For fr_CA, candidate names proceed from Messages_fr_CA to Messages_fr and then Messages. Messages_fr exists, so its greeting is used and the default en_US bundle does not win.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ResourceBundle.html#getBundle(java.lang.String,java.util.Locale)",
    tags: [
      "ResourceBundle",
      "candidate locales",
      "fallback",
      "properties bundle",
    ],
  }),
];
