import type { Question, QuestionOption } from "./questions";

type Choice = [id: string, text: string, explanation: string];

const choices = (...items: Choice[]): QuestionOption[] =>
  items.map(([id, text, explanation]) => ({ id, text, explanation }));

const JLS = "https://docs.oracle.com/javase/specs/jls/se25/html/";
const API = "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/";

/**
 * A mock-only bank for the second locked exam form. These questions are kept
 * separate from ordinary practice so a benchmark can remain unseen.
 */
export const mockQuestionsB: Question[] = [
  {
    id: "MB-VALUES-01",
    domain: "values",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `import java.util.Arrays;

int[] base = {2, 4, 6};
int[] alias = base;
int[] copy = base.clone();
alias[1] = 9;
copy[2]++;
System.out.println(Arrays.toString(base) + "|" + Arrays.toString(copy));`,
    options: choices(
      [
        "A",
        "[2, 9, 6]|[2, 4, 7]",
        "Correct. alias refers to base, whereas clone creates a distinct array whose third element is incremented.",
      ],
      [
        "B",
        "[2, 9, 7]|[2, 9, 7]",
        "clone does not create another reference to the same array; it creates a new array with copied primitive elements.",
      ],
      [
        "C",
        "[2, 4, 6]|[2, 4, 7]",
        "The assignment through alias changes base because both variables refer to the same array object.",
      ],
      [
        "D",
        "The code does not compile",
        "Arrays.toString accepts int arrays, and clone returns an int[] for an expression whose type is int[].",
      ],
    ),
    answer: ["A"],
    explanation:
      "Array assignment copies a reference, so alias and base share mutations. Cloning a one-dimensional primitive array creates a separate array and copies its int values.",
    sourceUrl: `${JLS}jls-10.html#jls-10.7`,
    tags: ["arrays", "references", "clone"],
  },
  {
    id: "MB-VALUES-02",
    domain: "values",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `Integer left = 7;
Long right = 7L;

System.out.println((left == 7) + ":" +
    left.equals(right) + ":" +
    (left.longValue() == right));`,
    options: choices(
      [
        "A",
        "true:true:true",
        "Wrapper equals requires the other object to be an Integer; a Long with the same numeric value is not equal.",
      ],
      [
        "B",
        "true:false:true",
        "Correct. The primitive comparisons unbox or explicitly extract numeric values, while Integer.equals rejects the Long.",
      ],
      [
        "C",
        "false:false:true",
        "Comparing left with the int literal unboxes left, so their numeric values compare equal.",
      ],
      [
        "D",
        "The code does not compile because Integer and Long cannot be compared",
        "equals accepts Object, and the final comparison is between primitive long values after right is unboxed.",
      ],
    ),
    answer: ["B"],
    explanation:
      "left == 7 unboxes the Integer. Integer.equals compares both value and wrapper type, so it returns false for a Long. The final expression compares two primitive long values and returns true.",
    sourceUrl: `${API}java/lang/Integer.html#equals(java.lang.Object)`,
    tags: ["boxing", "unboxing", "wrapper equals", "numeric comparison"],
  },
  {
    id: "MB-VALUES-03",
    domain: "values",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What does the program print?",
    code: `class Demo {
    static String pick(int value)  { return "I" + value; }
    static String pick(long value) { return "L" + value; }

    public static void main(String[] args) {
        var number = true ? 1 : 2L;
        number += 1.8;
        System.out.println(pick(number));
    }
}`,
    options: choices(
      [
        "A",
        "I2",
        "The conditional expression has type long, so var does not infer int.",
      ],
      [
        "B",
        "L2",
        "Correct. number is long, and compound assignment narrows the double result 2.8 back to long 2.",
      ],
      [
        "C",
        "L2.8",
        "A long cannot retain a fractional value; the implicit compound-assignment conversion truncates it.",
      ],
      [
        "D",
        "The code does not compile",
        "The numeric conditional and compound assignment are both legal; += includes an implicit cast to the left operand type.",
      ],
    ),
    answer: ["B"],
    explanation:
      "Numeric conditional typing promotes 1 and 2L to long, which is the type inferred for number. The += operation evaluates 2L + 1.8 and narrows 2.8 to long 2 before overload selection.",
    sourceUrl: `${JLS}jls-15.html#jls-15.25`,
    tags: [
      "var",
      "conditional expression",
      "compound assignment",
      "overloading",
    ],
  },
  {
    id: "MB-VALUES-04",
    domain: "values",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt: "What is printed?",
    code: `import java.time.LocalDate;

var start = LocalDate.of(2024, 1, 31);
var stepwise = start.plusMonths(1).plusMonths(1);
var direct = start.plusMonths(2);

System.out.println(stepwise + "|" + direct);`,
    options: choices(
      [
        "A",
        "2024-03-29|2024-03-31",
        "Correct. The first step adjusts January 31 to February 29, so another month preserves day 29; adding two months directly can retain day 31 in March.",
      ],
      [
        "B",
        "2024-03-31|2024-03-31",
        "Month arithmetic is applied one call at a time; the first call changes the day of month before the second call begins.",
      ],
      [
        "C",
        "2024-03-29|2024-03-29",
        "The direct two-month addition resolves against March, where January's day 31 is valid.",
      ],
      [
        "D",
        "A DateTimeException is thrown by the first addition",
        "plusMonths adjusts an invalid target day to the last valid day of the target month rather than throwing here.",
      ],
    ),
    answer: ["A"],
    explanation:
      "LocalDate.plusMonths resolves an invalid day to the target month's last valid day. Stepwise addition becomes February 29 then March 29, while the direct addition resolves January 31 straight to valid March 31.",
    sourceUrl: `${API}java/time/LocalDate.html#plusMonths(long)`,
    tags: ["LocalDate", "plusMonths", "end of month", "date arithmetic"],
  },
  {
    id: "MB-VALUES-05",
    domain: "values",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `int x = 2;
int total = x++ + ++x;
boolean result = x > 3 || 10 / x++ > 0;

String text = "" + x + ':' + total;
System.out.println(text + ':' + result);`,
    options: choices(
      [
        "A",
        "4:6:true",
        "Correct. The increments make total 6 and x 4; short-circuit OR skips the division and its increment.",
      ],
      [
        "B",
        "5:6:true",
        "The right operand of || is not evaluated after x > 3 evaluates true, so x is not incremented there.",
      ],
      [
        "C",
        "4:5:true",
        "x++ contributes 2, then ++x increments the now-3 value to 4 and contributes 4, totaling 6.",
      ],
      [
        "D",
        "The code throws ArithmeticException",
        "The division is skipped by short-circuit evaluation, and x would not be zero in any case.",
      ],
    ),
    answer: ["A"],
    explanation:
      "Operands evaluate left to right: x++ contributes 2, ++x contributes 4, and x becomes 4. The true left operand of || prevents evaluation of 10 / x++, leaving x unchanged.",
    sourceUrl: `${JLS}jls-15.html#jls-15.24`,
    tags: [
      "evaluation order",
      "increment",
      "short circuit",
      "String concatenation",
    ],
  },

  {
    id: "MB-FLOW-01",
    domain: "flow",
    difficulty: "Expert",
    type: "single",
    pattern: "compilation",
    prompt: "What is the result of compiling this code?",
    code: `if (false) {
    System.out.println("if");
}

while (false) {
    System.out.println("while");
}`,
    options: choices(
      [
        "A",
        "It compiles and prints nothing",
        "Java gives an if statement special reachability treatment, but the same exception does not make the body of while (false) reachable.",
      ],
      [
        "B",
        "It compiles and prints if",
        "The condition of the if statement is false, so its body would not execute even if the entire snippet compiled.",
      ],
      [
        "C",
        "Compilation fails because the body of while (false) is unreachable",
        "Correct. A while body is reachable only when its condition is not the constant expression false.",
      ],
      [
        "D",
        "Compilation fails because both print statements are unreachable",
        "The reachability rules deliberately allow the then-statement of an if even when its condition is the constant expression false.",
      ],
    ),
    answer: ["C"],
    explanation:
      "The then-statement of an if is treated as reachable whenever the if itself is reachable, supporting conditional compilation. A while body is reachable only if its condition is not the constant expression false, so this snippet is rejected for an unreachable statement.",
    sourceUrl: `${JLS}jls-14.html#jls-14.22`,
    tags: ["reachability", "unreachable statement", "if", "while"],
  },
  {
    id: "MB-FLOW-02",
    domain: "flow",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `int total = 0;

for (int i = 0, j = 4; i < j; i++, j--) {
    if (i == 1) continue;
    total += i + j;
}

System.out.println(total);`,
    options: choices(
      [
        "A",
        "4",
        "Correct. The first iteration adds 4; continue skips the second body addition but still proceeds to the for-loop updates, after which the condition is false.",
      ],
      [
        "B",
        "8",
        "The second iteration reaches continue before adding i+j, so it does not add another 4.",
      ],
      [
        "C",
        "The loop never terminates",
        "In a basic for statement, continue transfers control to the update expressions, so i and j continue changing.",
      ],
      [
        "D",
        "The code does not compile because a for loop can declare only one variable",
        "A for initializer may declare multiple variables of the same type, separated by commas.",
      ],
    ),
    answer: ["A"],
    explanation:
      "At i=0 and j=4, the body adds 4. The update produces i=1 and j=3. That iteration continues, but the update still runs, producing i=2 and j=2; the condition then fails with total 4.",
    sourceUrl: `${JLS}jls-14.html#jls-14.14.1.3`,
    tags: ["basic for", "continue", "update expression", "loop tracing"],
  },
  {
    id: "MB-FLOW-03",
    domain: "flow",
    difficulty: "Expert",
    type: "single",
    pattern: "compilation",
    prompt: "What is the result of compiling this method?",
    code: `static int score(int level) {
    switch (level) {
        case 1:
            int value = 10;
            return value;
        case 2:
            int value = 20;
            return value;
        default:
            return 0;
    }
}`,
    options: choices(
      [
        "A",
        "It compiles and returns 10 for level 1",
        "The case labels do not create separate local-variable scopes, so compilation fails before the method can run.",
      ],
      [
        "B",
        "It compiles because each return ends its case group",
        "Abrupt completion does not end the lexical scope of the first value declaration.",
      ],
      [
        "C",
        "Compilation fails because value is declared twice in the same switch block",
        "Correct. Traditional switch statement groups share the enclosing switch block's scope; braces around separate case bodies could create distinct scopes.",
      ],
      [
        "D",
        "Compilation fails because every case must end with break",
        "A return may complete a case group abruptly; an explicit break is not required after it.",
      ],
    ),
    answer: ["C"],
    explanation:
      "case labels partition control flow but do not introduce nested blocks. The first local variable's scope extends through the rest of the switch block, so the second declaration of value is illegal.",
    sourceUrl: `${JLS}jls-6.html#jls-6.3`,
    tags: [
      "switch statement",
      "case group",
      "local variable scope",
      "compilation",
    ],
  },
  {
    id: "MB-FLOW-04",
    domain: "flow",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `record Box(int size) {}

Object item = new Box(4);
String result = switch (item) {
    case Box(int size) when size > 5 -> "large";
    case Box(int size) -> "box-" + size;
    case null -> "null";
    default -> "other";
};
System.out.println(result);`,
    options: choices(
      [
        "A",
        "large",
        "The first record pattern matches structurally, but its guard is false for size 4.",
      ],
      [
        "B",
        "box-4",
        "Correct. The guarded label is skipped and the unguarded Box record pattern deconstructs the value.",
      ],
      [
        "C",
        "other",
        "The second Box pattern matches before default is considered.",
      ],
      [
        "D",
        "The code does not compile because the Box labels are duplicates",
        "A guarded specific case may precede its unguarded counterpart; the first does not dominate the second.",
      ],
    ),
    answer: ["B"],
    explanation:
      "Both record patterns can deconstruct the Box, but the first label also requires its guard to be true. Since 4 is not greater than 5, evaluation continues to the unguarded Box label.",
    sourceUrl: `${JLS}jls-14.html#jls-14.11.1`,
    tags: ["record pattern", "switch", "guard", "deconstruction"],
  },
  {
    id: "MB-FLOW-05",
    domain: "flow",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt:
      "The method does not compile because one label is dominated. Which two changes, made separately, make it compile?",
    code: `static String kind(Object value) {
    return switch (value) {
        case CharSequence chars -> "chars";
        case String text -> "string";
        case null -> "null";
        default -> "other";
    };
}`,
    options: choices(
      [
        "A",
        "Move case String before case CharSequence",
        "Correct. The narrower String label may precede the broader CharSequence label without being dominated.",
      ],
      [
        "B",
        "Remove the case String label",
        "Correct. The remaining CharSequence label handles strings and no dominated label remains.",
      ],
      [
        "C",
        "Move case null to the first position",
        "null placement does not change the domination relationship between CharSequence and String.",
      ],
      [
        "D",
        "Add when !text.isEmpty() to the String label in its current position",
        "The earlier unconditional CharSequence pattern already matches every non-null String, so the guarded String label is still unreachable.",
      ],
    ),
    answer: ["A", "B"],
    explanation:
      "An unconditional CharSequence type pattern dominates a later String pattern because every String is a CharSequence. Reordering from specific to general or removing the redundant String label fixes the error.",
    sourceUrl: `${JLS}jls-14.html#jls-14.11.1`,
    tags: ["pattern switch", "dominance", "type hierarchy"],
  },

  {
    id: "MB-OOP-01",
    domain: "oop",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the program print?",
    code: `enum Rate {
    STANDARD(2),
    EXPRESS(3) {
        @Override int fee(int weight) { return super.fee(weight) + 1; }
    };

    private final int factor;
    Rate(int factor) { this.factor = factor; }
    int fee(int weight) { return factor * weight; }
}

class Demo {
    public static void main(String[] args) {
        Rate rate = Rate.EXPRESS;
        System.out.println(rate.fee(4) + ":" + rate.name());
    }
}`,
    options: choices(
      [
        "A",
        "12:EXPRESS",
        "The EXPRESS constant has a constant-specific class body whose override adds one to the inherited calculation.",
      ],
      [
        "B",
        "13:EXPRESS",
        "Correct. EXPRESS uses factor 3, then its override adds one; name returns the declared enum constant name.",
      ],
      [
        "C",
        "13:Rate",
        "Enum.name returns the exact identifier of the constant, not the enum type name.",
      ],
      [
        "D",
        "The code does not compile because enum constants cannot override methods",
        "An enum constant may have a class body and override an instance method that is not final.",
      ],
    ),
    answer: ["B"],
    explanation:
      "EXPRESS invokes its constant-specific fee implementation. super.fee(4) uses the enum constructor's factor 3 to produce 12, then the override adds 1; name() returns EXPRESS.",
    sourceUrl: `${JLS}jls-8.html#jls-8.9.1`,
    tags: ["enum", "constant-specific class body", "overriding"],
  },
  {
    id: "MB-OOP-02",
    domain: "oop",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `class Outer {
    private final int value;
    private static int bonus = 2;

    Outer(int value) { this.value = value; }
    class Inner { int total() { return value + bonus; } }
    static class Nested { int bonus() { return bonus; } }
}

class Demo {
    public static void main(String[] args) {
        Outer outer = new Outer(5);
        Outer.Inner inner = outer.new Inner();
        Outer.Nested nested = new Outer.Nested();
        System.out.println(inner.total() + ":" + nested.bonus());
    }
}`,
    options: choices(
      [
        "A",
        "5:2",
        "The inner class can read both the enclosing instance value and the static bonus, so its total is 7.",
      ],
      [
        "B",
        "7:2",
        "Correct. Inner is tied to outer and reads value 5; the static nested class can read the static bonus 2.",
      ],
      [
        "C",
        "7:7",
        "Nested.bonus returns only the static field; a static nested instance has no implicit Outer instance.",
      ],
      [
        "D",
        "The code does not compile because value is private",
        "Nested classes and their enclosing class may access one another's private members under Java access rules.",
      ],
    ),
    answer: ["B"],
    explanation:
      "Creating a non-static inner object requires an enclosing Outer instance, which supplies value 5. A static nested class needs no Outer instance and can directly use Outer's static bonus.",
    sourceUrl: `${JLS}jls-8.html#jls-8.1.3`,
    tags: ["inner class", "static nested class", "enclosing instance"],
  },
  {
    id: "MB-OOP-03",
    domain: "oop",
    difficulty: "Expert",
    type: "single",
    pattern: "compilation",
    prompt: "What does the program print?",
    code: `class Demo {
    static String choose(int... values) {
        return "V" + values.length;
    }
    static String choose(Integer first, Integer second) {
        return "B" + (first + second);
    }

    public static void main(String[] args) {
        String a = choose(1, 2);
        String b = choose(new int[] {1, 2});
        System.out.println(a + ":" + b);
    }
}`,
    options: choices(
      [
        "A",
        "V2:V2",
        "For choose(1, 2), fixed-arity applicability with boxing is considered before variable-arity invocation.",
      ],
      [
        "B",
        "B3:V2",
        "Correct. The two-Integer overload wins the first call; the int[] argument selects the varargs method in fixed-arity form.",
      ],
      [
        "C",
        "B3:B3",
        "An int[] cannot be converted to either individual Integer parameter of the two-argument overload.",
      ],
      [
        "D",
        "The first call is ambiguous",
        "Java reaches the boxing fixed-arity overload before considering the variable-arity phase, so there is no ambiguity.",
      ],
    ),
    answer: ["B"],
    explanation:
      "Overload resolution first seeks fixed-arity methods, allowing boxing in its second phase, so choose(1, 2) picks the Integer overload. An int[] directly matches the int... parameter as int[].",
    sourceUrl: `${JLS}jls-15.html#jls-15.12.2`,
    tags: ["varargs", "overloading", "boxing", "method invocation"],
  },
  {
    id: "MB-OOP-04",
    domain: "oop",
    difficulty: "Applied",
    type: "single",
    pattern: "scenario",
    prompt: "What is printed?",
    code: `import java.util.ArrayList;
import java.util.List;

final class Names {
    private final List<String> values;
    Names(List<String> values) { this.values = List.copyOf(values); }
    List<String> values() { return values; }
}

var input = new ArrayList<>(List.of("A"));
var names = new Names(input);
input.add("B");
try {
    names.values().add("C");
} catch (UnsupportedOperationException ex) {
    System.out.println(names.values() + ":locked");
}`,
    options: choices(
      [
        "A",
        "[A]:locked",
        "Correct. List.copyOf takes an unmodifiable snapshot, so source mutation is not visible and accessor mutation fails.",
      ],
      [
        "B",
        "[A, B]:locked",
        "That would imply an unmodifiable view of input; List.copyOf instead creates an unmodifiable list containing the current elements.",
      ],
      [
        "C",
        "[A, B, C]:locked",
        "The add through values throws before C can be inserted, and B is not in the copied list.",
      ],
      [
        "D",
        "Nothing, because input.add throws",
        "input is a mutable ArrayList; only the list stored inside Names is unmodifiable.",
      ],
    ),
    answer: ["A"],
    explanation:
      "The class makes a defensive copy with List.copyOf and exposes only that unmodifiable list. Later mutation of the caller's ArrayList cannot change the stored state, and direct mutation is rejected.",
    sourceUrl: `${API}java/util/List.html#copyOf(java.util.Collection)`,
    tags: ["immutability", "defensive copy", "List.copyOf", "encapsulation"],
  },
  {
    id: "MB-OOP-05",
    domain: "oop",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt: "Which two statements about this program are correct?",
    code: `interface Left {
    private String mark() { return "L"; }
    default String label() { return mark(); }
}

interface Right {
    default String label() { return "R"; }
}

class Both implements Left, Right {
    public String label() {
        return Left.super.label() + Right.super.label();
    }
}

System.out.println(new Both().label());`,
    options: choices(
      [
        "A",
        "The program prints LR",
        "Correct. The override explicitly invokes each direct superinterface's default implementation.",
      ],
      [
        "B",
        "Both may omit label() and automatically inherit Left.label()",
        "Unrelated inherited defaults with the same signature conflict; the implementing class must resolve that conflict.",
      ],
      [
        "C",
        "mark() cannot be invoked as a member of a Both object",
        "Correct. A private interface method is accessible only within the body of its declaring interface and is not inherited.",
      ],
      [
        "D",
        "Both can replace its return statement with return super.label()",
        "A class cannot use super to select an interface default; it must use a qualified direct-superinterface form such as Left.super.label().",
      ],
    ),
    answer: ["A", "C"],
    explanation:
      "Both must override the conflicting defaults and may delegate with qualified superinterface calls, producing LR. Left.mark is a private helper for Left itself and is neither inherited nor callable on Both.",
    sourceUrl: `${JLS}jls-9.html#jls-9.4.1.3`,
    tags: [
      "interfaces",
      "default methods",
      "private interface method",
      "conflict resolution",
    ],
  },

  {
    id: "MB-EXCEPTIONS-01",
    domain: "exceptions",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt:
      "The code does not compile. Which two changes, made separately, make it compile?",
    code: `class ReportException extends Exception {}

interface Task {
    void run() throws ReportException;
}

class Job implements Task {
    @Override
    public void run() throws Exception {
        System.out.println("done");
    }
}`,
    options: choices(
      [
        "A",
        "Change Job.run() to declare throws ReportException",
        "Correct. The overriding declaration then throws exactly the checked type permitted by Task.run.",
      ],
      [
        "B",
        "Remove the throws clause from Job.run()",
        "Correct. An overriding method may throw fewer checked exceptions, including none.",
      ],
      [
        "C",
        "Change Job.run() to declare throws java.io.IOException",
        "IOException is not a subtype of ReportException, so it is not permitted by the overridden method's contract.",
      ],
      [
        "D",
        "Make ReportException extend RuntimeException and leave Job unchanged",
        "Making the interface exception unchecked does not authorize Job.run to add the unrelated checked Exception type.",
      ],
    ),
    answer: ["A", "B"],
    explanation:
      "An overriding method may not broaden checked exceptions beyond those declared by the overridden method. It may declare ReportException itself, a subtype, or no checked exception.",
    sourceUrl: `${JLS}jls-8.html#jls-8.4.8.3`,
    tags: ["custom exception", "checked exception", "overriding", "throws"],
  },
  {
    id: "MB-EXCEPTIONS-02",
    domain: "exceptions",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `class CloseException extends Exception {
    CloseException(String message) { super(message); }
}

class Resource implements AutoCloseable {
    public void close() throws CloseException {
        throw new CloseException("closed");
    }
}

try (var resource = new Resource()) {
    System.out.print("body:");
} catch (CloseException ex) {
    System.out.println(ex.getMessage() + ":" +
        ex.getSuppressed().length);
}`,
    options: choices(
      [
        "A",
        "body:closed:0",
        "Correct. The body completes normally, so the close failure becomes primary and has no suppressed exceptions.",
      ],
      [
        "B",
        "body:closed:1",
        "There is no earlier failure for the close exception to suppress or to be suppressed by.",
      ],
      [
        "C",
        "closed:body:0",
        "The body prints its prefix before automatic resource closing begins.",
      ],
      [
        "D",
        "The code does not compile because close throws a checked exception",
        "The surrounding catch handles the checked CloseException that can escape automatic closing.",
      ],
    ),
    answer: ["A"],
    explanation:
      "When the try body completes normally and the sole close call throws, that close exception is the primary exception. Nothing is suppressed, so the output is body:closed:0.",
    sourceUrl: `${JLS}jls-14.html#jls-14.20.3.1`,
    tags: ["custom exception", "try-with-resources", "close exception"],
  },
  {
    id: "MB-EXCEPTIONS-03",
    domain: "exceptions",
    difficulty: "Applied",
    type: "single",
    pattern: "compilation",
    prompt: "Why does this method fail to compile?",
    code: `import java.io.IOException;
import java.sql.SQLException;

static void handle() {
    try {
        throw new IOException("disk");
    } catch (IOException | SQLException problem) {
        problem = new IOException("replacement");
        System.out.println(problem.getMessage());
    }
}`,
    options: choices(
      [
        "A",
        "SQLException is never thrown from the try block",
        "This is also a compile-time issue here, but it is not the only one demonstrated by the code.",
      ],
      [
        "B",
        "A multi-catch parameter is implicitly final and cannot be assigned",
        "This assignment is illegal; additionally, this exact try body makes the SQLException alternative unreachable.",
      ],
      [
        "C",
        "IOException and SQLException have a subclass relationship",
        "They are sibling checked exceptions, so their relationship does not itself invalidate a multi-catch.",
      ],
      [
        "D",
        "Both A and B describe independent compile-time errors",
        "Correct. SQLException cannot be thrown by this try body, and a multi-catch parameter cannot be reassigned.",
      ],
    ),
    answer: ["D"],
    explanation:
      "A checked catch alternative must be reachable from the try body, and SQLException is not. Separately, a parameter declared by a multi-catch is implicitly final, so assigning problem is forbidden.",
    sourceUrl: `${JLS}jls-14.html#jls-14.20`,
    tags: [
      "multi-catch",
      "reachability",
      "implicitly final",
      "checked exception",
    ],
  },
  {
    id: "MB-EXCEPTIONS-04",
    domain: "exceptions",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `class Demo {
    static void fail() {
        try {
            throw new IllegalArgumentException("try");
        } finally {
            throw new IllegalStateException("finally");
        }
    }

    public static void main(String[] args) {
        try {
            fail();
        } catch (Exception ex) {
            System.out.println(ex.getMessage() + ":" +
                ex.getSuppressed().length);
        }
    }
}`,
    options: choices(
      [
        "A",
        "try:0",
        "The exception from try is replaced when the finally block itself throws.",
      ],
      [
        "B",
        "finally:0",
        "Correct. Abrupt completion of finally replaces the pending try exception without automatic suppression.",
      ],
      [
        "C",
        "finally:1",
        "Ordinary try-finally replacement does not attach the displaced exception as suppressed; that behavior belongs to generated resource cleanup rules.",
      ],
      [
        "D",
        "try:1",
        "The try exception neither remains primary nor becomes a suppressed exception on the finally failure.",
      ],
    ),
    answer: ["B"],
    explanation:
      "The IllegalArgumentException is pending when finally begins. finally then throws IllegalStateException, replacing the earlier reason for abrupt completion; the displaced exception is not automatically suppressed.",
    sourceUrl: `${JLS}jls-14.html#jls-14.20.2`,
    tags: [
      "finally",
      "abrupt completion",
      "exception replacement",
      "suppression",
    ],
  },
  {
    id: "MB-EXCEPTIONS-05",
    domain: "exceptions",
    difficulty: "Expert",
    type: "single",
    pattern: "compilation",
    prompt: "What is the result of compiling this class?",
    code: `import java.io.IOException;
import java.sql.SQLException;

class Demo {
    static void risky() throws IOException, SQLException {}

    static void call() throws IOException, SQLException {
        try {
            risky();
        } catch (Exception problem) {
            throw problem;
        }
    }
}`,
    options: choices(
      [
        "A",
        "It compiles because precise rethrow narrows problem to the exceptions risky() can throw",
        "Correct. The catch parameter is effectively final, and analysis knows the reachable checked alternatives are IOException and SQLException.",
      ],
      [
        "B",
        "It fails because call() must declare throws Exception",
        "Precise rethrow analysis can infer narrower thrown types for an effectively final catch parameter.",
      ],
      [
        "C",
        "It fails because sibling checked exceptions cannot share a catch block",
        "A catch of their common superclass is legal; the issue is which types can escape after rethrow.",
      ],
      [
        "D",
        "It compiles only if problem is cast before throw",
        "No cast is required because the compiler performs precise rethrow analysis.",
      ],
    ),
    answer: ["A"],
    explanation:
      "Although problem is declared Exception, it is effectively final and can only hold exceptions thrown from risky in this try. Precise rethrow therefore permits call to declare IOException and SQLException.",
    sourceUrl: `${JLS}jls-11.html#jls-11.2.2`,
    tags: [
      "precise rethrow",
      "checked exceptions",
      "catch parameter",
      "throws analysis",
    ],
  },

  {
    id: "MB-COLLECTIONS-01",
    domain: "collections",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `import java.util.ArrayList;
import java.util.List;

var values = new ArrayList<>(List.of(10, 20, 30, 20));
values.remove(1);
values.remove(Integer.valueOf(20));

System.out.println(values);`,
    options: choices(
      [
        "A",
        "[10, 30]",
        "Correct. remove(1) selects the index overload and removes the first 20; remove(Integer.valueOf(20)) then removes the remaining matching value.",
      ],
      [
        "B",
        "[10, 20]",
        "The index removal deletes 20 at position 1, not the element whose value is 1.",
      ],
      [
        "C",
        "[10, 30, 20]",
        "This is the state after only the index removal; the Object overload then removes the remaining 20.",
      ],
      [
        "D",
        "The second remove call is ambiguous",
        "Integer.valueOf(20) has reference type Integer, so overload resolution selects remove(Object), not remove(int).",
      ],
    ),
    answer: ["A"],
    explanation:
      "List overloads remove for an int index and an Object value. The literal 1 invokes remove(int), while the boxed Integer argument invokes remove(Object), leaving 10 and 30.",
    sourceUrl: `${API}java/util/List.html#remove(int)`,
    tags: ["List", "remove overload", "boxing", "ArrayList"],
  },
  {
    id: "MB-COLLECTIONS-02",
    domain: "collections",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt: "What is printed?",
    code: `import java.util.Arrays;

int[] values = {4, 3, 2, 1};
Arrays.sort(values, 1, 4);
int index = Arrays.binarySearch(values, 1, 4, 2);

System.out.println(Arrays.toString(values));
System.out.println(index);`,
    options: choices(
      [
        "A",
        "[1, 2, 3, 4] followed by 1",
        "The sort range starts at index 1, so the value at index 0 is not moved.",
      ],
      [
        "B",
        "[4, 1, 2, 3] followed by 2",
        "Correct. The half-open range [1,4) is sorted, and 2 is found at absolute array index 2.",
      ],
      [
        "C",
        "[4, 1, 2, 3] followed by 1",
        "binarySearch returns the actual array index, not an index relative to the requested range.",
      ],
      [
        "D",
        "An exception is thrown because toIndex 4 is outside the array",
        "The upper bound is exclusive and may equal the array length.",
      ],
    ),
    answer: ["B"],
    explanation:
      "Both array APIs use a from-inclusive, to-exclusive range. Sorting indexes 1 through 3 produces [4,1,2,3], and searching that range returns the absolute index 2.",
    sourceUrl: `${API}java/util/Arrays.html#sort(int%5B%5D,int,int)`,
    tags: ["arrays", "range", "sort", "binarySearch"],
  },
  {
    id: "MB-COLLECTIONS-03",
    domain: "collections",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt: "Which two statements are correct?",
    code: `import java.util.Map;

var scores = Map.of("Ada", 10, "Ben", 20);`,
    options: choices(
      [
        "A",
        'scores.getOrDefault("Cal", 0) returns 0',
        "Correct. There is no Cal mapping, so getOrDefault returns the supplied default value.",
      ],
      [
        "B",
        'scores.put("Cal", 30) adds a third mapping',
        "Maps created by Map.of are unmodifiable; put throws UnsupportedOperationException.",
      ],
      [
        "C",
        'Map.of("Ada", 10, "Ada", 20) throws IllegalArgumentException',
        "Correct. The Map.of factories reject duplicate keys when constructing the map.",
      ],
      [
        "D",
        'Map.of("Ada", null) creates a mapping to null',
        "Map.of rejects null keys and null values with NullPointerException.",
      ],
    ),
    answer: ["A", "C"],
    explanation:
      "Map.of returns an unmodifiable map that rejects nulls and duplicate keys. Ordinary read operations such as getOrDefault remain available, so the absent Cal key produces 0.",
    sourceUrl: `${API}java/util/Map.html#of(K,V)`,
    tags: ["Map.of", "unmodifiable map", "duplicate key", "null"],
  },
  {
    id: "MB-COLLECTIONS-04",
    domain: "collections",
    difficulty: "Expert",
    type: "single",
    pattern: "scenario",
    prompt: "What happens when this code is compiled and run?",
    code: `import java.util.List;

@SuppressWarnings("unchecked")
List<String>[] groups =
    (List<String>[]) new List<?>[1];

Object[] objects = groups;
objects[0] = List.of(42);

String value = groups[0].get(0);
System.out.println(value);`,
    options: choices(
      [
        "A",
        "It prints 42",
        "The retrieval is compiled as String and includes a runtime cast; the Integer cannot be returned as String.",
      ],
      [
        "B",
        "ArrayStoreException is thrown by objects[0] = List.of(42)",
        "The runtime component type is erased List, so a List<Integer> passes the array store check.",
      ],
      [
        "C",
        "ClassCastException is thrown when the element is assigned to value",
        "Correct. Heap pollution places an Integer where generic code expects a String, and the compiler-inserted cast fails.",
      ],
      [
        "D",
        "The cast to List<String>[] fails immediately",
        "At runtime both the created array and target array type have erased component type List, so that array cast succeeds.",
      ],
    ),
    answer: ["C"],
    explanation:
      "Generic array element types are erased. The List<Integer> store satisfies the runtime List[] component check, but it pollutes a structure viewed as List<String>[]; retrieving 42 then fails the inserted String cast.",
    sourceUrl: `${JLS}jls-4.html#jls-4.12.2.1`,
    tags: ["generic array", "heap pollution", "erasure", "ClassCastException"],
  },
  {
    id: "MB-COLLECTIONS-05",
    domain: "collections",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `import java.util.ArrayList;
import java.util.List;

var values = new ArrayList<>(List.of(1, 2, 3, 4, 5));
boolean changed = values.removeIf(value -> value % 2 == 0);
values.replaceAll(value -> value * 10);

System.out.println(changed + ":" + values);`,
    options: choices(
      [
        "A",
        "true:[10, 30, 50]",
        "Correct. removeIf deletes 2 and 4 and reports a change; replaceAll then multiplies each remaining element by 10.",
      ],
      [
        "B",
        "false:[10, 30, 50]",
        "Because matching elements are removed, removeIf returns true rather than false.",
      ],
      [
        "C",
        "true:[10, 20, 30, 40, 50]",
        "replaceAll operates after removeIf, so the removed even elements are no longer present to transform.",
      ],
      [
        "D",
        "The code throws ConcurrentModificationException",
        "ArrayList implements these bulk operations directly; removeIf is a supported structural operation, not an external modification during iteration.",
      ],
    ),
    answer: ["A"],
    explanation:
      "removeIf removes every even value and returns true because the list changed. replaceAll applies to the surviving 1, 3, and 5, producing 10, 30, and 50.",
    sourceUrl: `${API}java/util/Collection.html#removeIf(java.util.function.Predicate)`,
    tags: ["removeIf", "replaceAll", "bulk operation", "ArrayList"],
  },

  {
    id: "MB-STREAMS-01",
    domain: "streams",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `import java.util.stream.Stream;

boolean all = Stream.<Integer>empty()
    .allMatch(value -> value > 0);
boolean any = Stream.<Integer>empty()
    .anyMatch(value -> value > 0);
boolean none = Stream.<Integer>empty()
    .noneMatch(value -> value > 0);

System.out.println(all + ":" + any + ":" + none);`,
    options: choices(
      [
        "A",
        "true:false:true",
        "Correct. With no counterexample allMatch and noneMatch are true, while anyMatch has no matching element and is false.",
      ],
      [
        "B",
        "false:false:true",
        "allMatch is vacuously true for an empty stream; it does not require at least one element.",
      ],
      [
        "C",
        "true:true:false",
        "anyMatch cannot find a match in an empty stream, and noneMatch cannot find a counterexample to its result.",
      ],
      [
        "D",
        "Each terminal operation throws NoSuchElementException",
        "The match operations return boolean identity results for empty streams; they do not extract an element.",
      ],
    ),
    answer: ["A"],
    explanation:
      "allMatch and noneMatch use vacuous truth for an empty stream and return true. anyMatch needs at least one matching element, so it returns false.",
    sourceUrl: `${API}java/util/stream/Stream.html#allMatch(java.util.function.Predicate)`,
    tags: ["allMatch", "anyMatch", "noneMatch", "empty stream"],
  },
  {
    id: "MB-STREAMS-02",
    domain: "streams",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt: "What is printed?",
    code: `import java.util.stream.Stream;
import static java.util.stream.Collectors.*;

var lengths = Stream.of("ant", "ape", "bat")
    .collect(toMap(
        word -> word.charAt(0),
        String::length,
        Integer::sum));

System.out.println(lengths.get('a') + ":" + lengths.get('b'));`,
    options: choices(
      [
        "A",
        "3:3",
        "Both a words contribute values for the same key, so the merge function combines them rather than keeping only one length.",
      ],
      [
        "B",
        "6:3",
        "Correct. The duplicate a key merges lengths 3 and 3 to 6; the sole b value remains 3.",
      ],
      [
        "C",
        "6:6",
        "Only the two strings beginning with a collide; bat is the sole value mapped to b.",
      ],
      [
        "D",
        "The stream throws IllegalStateException because a is a duplicate key",
        "The three-argument toMap overload uses the supplied Integer::sum merge function to resolve duplicate keys.",
      ],
    ),
    answer: ["B"],
    explanation:
      "toMap derives a character key and a length value for each word. When ant and ape both map to a, Integer::sum merges 3 and 3; bat creates the separate b=3 entry.",
    sourceUrl: `${API}java/util/stream/Collectors.html#toMap(java.util.function.Function,java.util.function.Function,java.util.function.BinaryOperator)`,
    tags: ["toMap", "merge function", "duplicate key", "collector"],
  },
  {
    id: "MB-STREAMS-03",
    domain: "streams",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt: "What is printed?",
    code: `import java.util.stream.Stream;
import static java.util.stream.Collectors.*;

var totals = Stream.of(1, 2, 3, 4)
    .collect(partitioningBy(
        value -> value % 2 == 0,
        summingInt(Integer::intValue)));

System.out.println(totals.get(false) + ":" + totals.get(true));`,
    options: choices(
      [
        "A",
        "4:6",
        "Correct. Odd values sum to 1+3=4 under false, while even values sum to 2+4=6 under true.",
      ],
      [
        "B",
        "6:4",
        "partitioningBy uses the predicate result as the key, so the even sum belongs to true, not false.",
      ],
      [
        "C",
        "2:2",
        "The downstream collector sums the values in each partition; it does not count them.",
      ],
      [
        "D",
        "null:6",
        "A partitioning collector supplies mappings for both boolean keys, including an identity result if one partition is empty.",
      ],
    ),
    answer: ["A"],
    explanation:
      "partitioningBy creates false and true groups. The downstream summingInt collector totals the odd partition as 4 and the even partition as 6.",
    sourceUrl: `${API}java/util/stream/Collectors.html#partitioningBy(java.util.function.Predicate,java.util.stream.Collector)`,
    tags: ["partitioningBy", "downstream collector", "summingInt", "collector"],
  },
  {
    id: "MB-STREAMS-04",
    domain: "streams",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `int result = java.util.stream.Stream.of(5, 2, 4, 1)
    .parallel()
    .filter(n -> n % 2 == 0)
    .findFirst()
    .orElse(-1);

System.out.println(result);`,
    options: choices(
      [
        "A",
        "2",
        "Correct. findFirst respects the stream's encounter order even when the pipeline is parallel.",
      ],
      [
        "B",
        "-1",
        "The stream contains matching even elements, so orElse is not used.",
      ],
      ["C", "4", "Although 4 also matches, 2 occurs first in encounter order."],
      [
        "D",
        "The result is nondeterministically either 2 or 4",
        "That would resemble findAny. findFirst preserves the first matching element of an ordered stream.",
      ],
    ),
    answer: ["A"],
    explanation:
      "Stream.of has encounter order. Switching to parallel execution does not change findFirst's contract, so the first even value in that order is 2; findAny would permit a different matching element.",
    sourceUrl: `${API}java/util/stream/Stream.html#findFirst()`,
    tags: ["parallel stream", "filter", "findFirst", "encounter order"],
  },
  {
    id: "MB-STREAMS-05",
    domain: "streams",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt: "Which two statements about this program are correct?",
    code: `import java.util.List;

class Demo {
    static int measure(String text) { return text.length(); }
    static int measure(List<?> items) { return items.size(); }

    public static void main(String[] args) {
        int total = List.of("a", "java")
            .stream()
            .map(Demo::measure)
            .reduce(0, Integer::sum);
        System.out.println(total);
    }
}`,
    options: choices(
      [
        "A",
        "The program prints 5",
        "Correct. The selected method returns lengths 1 and 4, and reduce sums them.",
      ],
      [
        "B",
        "The method reference is ambiguous because measure is overloaded",
        "The Stream<String> mapping context supplies String as the method-reference input type, excluding the List overload.",
      ],
      [
        "C",
        "The target type of Demo::measure is inferred from Stream.map",
        "Correct. map's Function<? super String, ? extends R> context drives overload selection and result inference.",
      ],
      [
        "D",
        "Replacing map with mapToInt makes Integer::sum invalid in every possible reduction",
        "An IntStream can reduce with an int identity and an IntBinaryOperator; Integer::sum is compatible with that shape.",
      ],
    ),
    answer: ["A", "C"],
    explanation:
      "The receiver stream fixes the function input as String, so target typing selects measure(String). Its Integer results are 1 and 4, which reduce to 5.",
    sourceUrl: `${JLS}jls-15.html#jls-15.13`,
    tags: ["method reference", "target typing", "overloading", "map", "reduce"],
  },

  {
    id: "MB-PACKAGING-01",
    domain: "packaging",
    difficulty: "Expert",
    type: "single",
    pattern: "scenario",
    prompt:
      "The alpha and beta modules each contain classes in package shared. What happens when app is compiled in this modular project?",
    code: `// alpha/module-info.java
module alpha {
    exports shared;
}

// beta/module-info.java
module beta {
    exports shared;
}

// app/module-info.java
module app {
    requires alpha;
    requires beta;
}`,
    options: choices(
      [
        "A",
        "app fails because it reads package shared from both alpha and beta",
        "Correct. A named module cannot read the same package from two different modules.",
      ],
      [
        "B",
        "app compiles as long as its own source never imports shared",
        "The module graph itself gives app two readable exports of the same package; an import is not required to create the conflict.",
      ],
      [
        "C",
        "app compiles unless alpha and beta declare classes with the same simple name",
        "The conflict is at package visibility level; duplicate simple class names are not required.",
      ],
      [
        "D",
        "app compiles and the module system chooses alpha's shared package first",
        "JPMS does not use module-path order to choose between two readable packages with the same name.",
      ],
    ),
    answer: ["A"],
    explanation:
      "Because app requires both modules, it reads both exports named shared. JPMS rejects this split-package visibility conflict instead of selecting one module by order.",
    sourceUrl: `${JLS}jls-7.html#jls-7.7.1`,
    tags: ["modules", "split package", "readability", "module graph"],
  },
  {
    id: "MB-PACKAGING-02",
    domain: "packaging",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt: "Which two statements follow from this module declaration?",
    code: `module library {
    exports library.api to client;
    opens library.model to framework;
}

// library.api contains public class Service.
// library.model contains class Entity with private fields.`,
    options: choices(
      [
        "A",
        "Module client can compile code that uses the public Service type",
        "Correct. The qualified export grants ordinary public-type access specifically to client.",
      ],
      [
        "B",
        "Module framework can perform deep reflection on library.model",
        "Correct. The qualified opens directive grants framework reflective access to that package.",
      ],
      [
        "C",
        "Every module can compile code that imports library.api.Service",
        "The export is qualified to client, so it is not an export to every module.",
      ],
      [
        "D",
        "Module framework can import any public type in library.model solely because the package is open",
        "opens enables reflective access; it does not provide ordinary compile-time exported access.",
      ],
    ),
    answer: ["A", "B"],
    explanation:
      "A qualified exports directive controls ordinary access to public types, while a qualified opens directive controls deep reflection. Each grant is limited to the named target module.",
    sourceUrl: `${JLS}jls-7.html#jls-7.7.2`,
    tags: ["modules", "qualified exports", "opens", "reflection"],
  },
  {
    id: "MB-PACKAGING-03",
    domain: "packaging",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt:
      "Hello.java is launched with java Hello.java on Java 25. Which two statements are correct?",
    code: `import module java.base;

void main() {
    var words = List.of("a", "bb", "ccc");
    long count = words.stream()
        .filter(word -> word.length() > 1)
        .count();
    IO.println(count);
}`,
    options: choices(
      [
        "A",
        "It prints 2",
        "Correct. The module import makes List accessible by simple name, and two strings have length greater than one.",
      ],
      [
        "B",
        "A surrounding explicit class declaration is required",
        "A Java 25 compact source file may omit an explicit class declaration and declare an eligible instance main method.",
      ],
      [
        "C",
        "The implicitly declared class runs as part of the unnamed module",
        "Correct. A compact source file does not declare a named module merely by importing java.base.",
      ],
      [
        "D",
        "IO.println is invalid because only an unqualified println call is supported",
        "java.lang.IO is available by simple name, and its static method is invoked with the IO qualifier.",
      ],
    ),
    answer: ["A", "C"],
    explanation:
      "Java 25 supports compact source files with an instance main method. import module java.base supplies accessible exported types such as List; importing a module does not place the source in a named module.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/language/module-import-declarations.html",
    tags: [
      "compact source file",
      "instance main",
      "module import",
      "unnamed module",
    ],
  },
  {
    id: "MB-PACKAGING-04",
    domain: "packaging",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt:
      "From the project root, which command pair compiles this modular source tree into mods and then launches Main?",
    code: `src/
  com.acme.app/
    module-info.java
    com/acme/app/Main.java

// module-info.java
module com.acme.app { }

// Main.java declares package com.acme.app
// and public class Main with a main method.`,
    options: choices(
      [
        "A",
        "javac --module-source-path src -d mods -m com.acme.app; java --module-path mods -m com.acme.app/com.acme.app.Main",
        "Correct. The compiler locates the named module under the module source path, and the launcher names both the module and its main class.",
      ],
      [
        "B",
        "javac --module-source-path src -d mods -m com.acme.app; java --class-path mods com.acme.app.Main",
        "The modular output is rooted under its module name and should be resolved on the module path for this launch.",
      ],
      [
        "C",
        "javac --module-path src -d mods -m com.acme.app; java --module-path mods -m com.acme.app/com.acme.app.Main",
        "--module-path locates compiled modules and modular JARs; --module-source-path locates this module-organized source tree.",
      ],
      [
        "D",
        "javac --module-source-path src -d mods -m com.acme.app; java --module-path mods -m com.acme.app.Main",
        "The operand of -m begins with the module name; a main class, when supplied, follows a slash.",
      ],
    ),
    answer: ["A"],
    explanation:
      "--module-source-path src tells javac that each immediate child directory is a module source root, -m selects com.acme.app, and -d writes modular output. The java launcher then resolves mods and launches module/class with the module/main-class form.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/specs/man/javac.html",
    tags: ["javac", "java launcher", "module source path", "module path"],
  },
  {
    id: "MB-PACKAGING-05",
    domain: "packaging",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt:
      "A legacy JAR has no module-info.class and its manifest contains Automatic-Module-Name: com.acme.util. Which two statements are correct?",
    code: `// Deployment 1
java --module-path libs -m app/com.acme.app.Main

// Deployment 2
java --class-path libs/acme-util.jar:app.jar com.acme.app.Main

// acme-util.jar contains packages com.acme.util.api
// and com.acme.util.internal.`,
    options: choices(
      [
        "A",
        "On the module path, the JAR is an automatic module named com.acme.util",
        "Correct. Automatic-Module-Name supplies its stable automatic module name.",
      ],
      [
        "B",
        "On the module path, none of its packages are exported until a descriptor is added",
        "An automatic module is treated as exporting all of its packages.",
      ],
      [
        "C",
        "On the class path, the JAR's classes are members of the unnamed module",
        "Correct. A non-modular JAR on the class path participates in the unnamed module rather than becoming an automatic module.",
      ],
      [
        "D",
        "A named app module can require com.acme.util while that JAR remains only on the class path",
        "Named modules cannot satisfy a requires directive from a class-path JAR in the unnamed module.",
      ],
    ),
    answer: ["A", "C"],
    explanation:
      "Placement determines treatment: the JAR becomes the named automatic module com.acme.util on the module path and exports its packages; on the class path its classes belong to the unnamed module.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/migrate/migrating-to-modules.html",
    tags: ["automatic module", "module path", "class path", "migration"],
  },

  {
    id: "MB-CONCURRENCY-01",
    domain: "concurrency",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `import java.util.concurrent.CompletableFuture;

var result = CompletableFuture.completedFuture("java")
    .thenApply(String::length)
    .thenCombine(
        CompletableFuture.completedFuture(2),
        (length, factor) -> length * factor);

System.out.println(result.join());`,
    options: choices(
      [
        "A",
        "4",
        "thenApply produces 4, but thenCombine multiplies that length by the second completed future's value 2.",
      ],
      [
        "B",
        "6",
        "The combiner multiplies 4 by 2; it does not add the two values.",
      ],
      [
        "C",
        "8",
        "Correct. thenApply maps java to length 4, then thenCombine multiplies 4 and 2; join returns the completed result.",
      ],
      [
        "D",
        "The program can print before either stage completes",
        "join waits for the composed future if needed; in this case both source futures are already completed.",
      ],
    ),
    answer: ["C"],
    explanation:
      "completedFuture supplies java, thenApply converts it to 4, and thenCombine combines that value with 2 to produce 8. join obtains the composed result.",
    sourceUrl: `${API}java/util/concurrent/CompletableFuture.html#thenCombine(java.util.concurrent.CompletionStage,java.util.function.BiFunction)`,
    tags: ["CompletableFuture", "thenApply", "thenCombine", "join"],
  },
  {
    id: "MB-CONCURRENCY-02",
    domain: "concurrency",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt: "What is printed?",
    code: `import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

var gate = new CountDownLatch(2);
gate.countDown();
boolean opened = gate.await(0, TimeUnit.MILLISECONDS);
gate.countDown();
System.out.println(opened + ":" + gate.getCount());`,
    options: choices(
      [
        "A",
        "true:0",
        "The timed await occurs while the count is still 1, so it cannot report that the gate was open.",
      ],
      [
        "B",
        "false:0",
        "Correct. await returns false before the second countdown; the later countdown reduces the count to zero before printing.",
      ],
      [
        "C",
        "false:1",
        "The second countDown occurs after await and before println, so getCount returns zero.",
      ],
      [
        "D",
        "The call to await blocks indefinitely",
        "This is the timed overload with a zero timeout, so it returns immediately when the count is nonzero.",
      ],
    ),
    answer: ["B"],
    explanation:
      "The first countdown leaves the count at 1, so zero-timeout await returns false. The second countdown then opens the latch and getCount reports 0; a latch does not reset itself.",
    sourceUrl: `${API}java/util/concurrent/CountDownLatch.html`,
    tags: ["CountDownLatch", "countDown", "timed await", "coordination"],
  },
  {
    id: "MB-CONCURRENCY-03",
    domain: "concurrency",
    difficulty: "Applied",
    type: "single",
    pattern: "scenario",
    prompt: "What is printed after the marker future completes?",
    code: `import java.util.concurrent.Executors;

var output = new StringBuilder();
var executor = Executors.newSingleThreadExecutor();
try {
    executor.execute(() -> output.append('A'));
    var marker = executor.submit(() -> output.append('B'));
    marker.get();
    System.out.println(output);
} finally {
    executor.shutdown();
}`,
    options: choices(
      [
        "A",
        "AB",
        "Correct. A single-worker executor runs queued tasks sequentially in order, and marker.get waits through the second task.",
      ],
      [
        "B",
        "BA",
        "The tasks are submitted A first and B second to an executor with only one worker.",
      ],
      [
        "C",
        "A",
        "marker.get does not return until the B-appending task completes.",
      ],
      [
        "D",
        "The result is unpredictable because StringBuilder is not thread-safe",
        "Both mutations are performed sequentially by the same executor worker, and the get establishes visibility before printing.",
      ],
    ),
    answer: ["A"],
    explanation:
      "A single-thread executor queues tasks and executes them sequentially. Waiting for the second submitted task also means the earlier A task has completed, so the visible result is AB.",
    sourceUrl: `${API}java/util/concurrent/Executors.html#newSingleThreadExecutor()`,
    tags: [
      "single-thread executor",
      "task ordering",
      "Future.get",
      "visibility",
    ],
  },
  {
    id: "MB-CONCURRENCY-04",
    domain: "concurrency",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt: "Which two statements about these unstarted threads are correct?",
    code: `Runnable work = () -> System.out.println(
    Thread.currentThread().isVirtual());

Thread platform = Thread.ofPlatform()
    .name("platform-worker")
    .unstarted(work);
Thread virtual = Thread.ofVirtual()
    .name("virtual-worker")
    .unstarted(work);`,
    options: choices(
      [
        "A",
        "platform.isVirtual() is false and virtual.isVirtual() is true",
        "Correct. The builders create the two different kinds of Thread represented by the API.",
      ],
      [
        "B",
        "Starting virtual guarantees that its output appears before platform's output",
        "Thread scheduling order is not guaranteed merely by calling one start before another.",
      ],
      [
        "C",
        "Both objects are Thread instances and may be started and joined with the Thread API",
        "Correct. Virtual threads are still instances of Thread and support its lifecycle operations.",
      ],
      [
        "D",
        "The virtual thread is guaranteed to finish CPU-bound work faster",
        "Virtual threads improve scale for many blocking tasks; they do not promise faster CPU computation.",
      ],
    ),
    answer: ["A", "C"],
    explanation:
      "Platform and virtual builders both create Thread objects, distinguishable with isVirtual. Their scheduling order and CPU speed are not guaranteed; virtual threads target scalable blocking concurrency.",
    sourceUrl: `${API}java/lang/Thread.html#isVirtual()`,
    tags: ["virtual thread", "platform thread", "Thread.Builder", "lifecycle"],
  },
  {
    id: "MB-CONCURRENCY-05",
    domain: "concurrency",
    difficulty: "Expert",
    type: "multiple",
    pattern: "scenario",
    prompt:
      "Two threads call increment 1,000 times each, one through a and one through b. Which two changes, made separately, make the increments mutually exclusive on the shared count?",
    code: `class Counter {
    static int count;

    synchronized void increment() {
        count++;
    }
}

Counter a = new Counter();
Counter b = new Counter();
// Each thread currently uses a different Counter instance.`,
    options: choices(
      [
        "A",
        "Make increment() static synchronized",
        "Correct. A static synchronized method locks Counter.class, one monitor shared by all instances.",
      ],
      [
        "B",
        "Have both threads invoke increment() on the same Counter instance",
        "Correct. Both calls then acquire the same instance monitor.",
      ],
      [
        "C",
        "Declare count volatile but keep the two Counter instances",
        "volatile provides visibility but count++ remains a non-atomic read-modify-write operation.",
      ],
      [
        "D",
        "Remove synchronized and make count final",
        "A final field cannot be incremented, so this does not provide a working shared counter.",
      ],
    ),
    answer: ["A", "B"],
    explanation:
      "An instance synchronized method locks its receiver, so a and b currently use different monitors while updating one static field. A class monitor or one shared receiver provides common mutual exclusion.",
    sourceUrl: `${JLS}jls-8.html#jls-8.4.3.6`,
    tags: ["synchronized", "instance monitor", "class monitor", "atomicity"],
  },

  {
    id: "MB-IO-01",
    domain: "io",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt: "Assuming the temporary file is created normally, what is printed?",
    code: `import java.nio.file.Files;
import java.nio.file.attribute.BasicFileAttributes;

var file = Files.createTempFile("exam", ".txt");
try {
    Files.writeString(file, "Java");
    var attributes = Files.readAttributes(
        file, BasicFileAttributes.class);
    System.out.println(attributes.isRegularFile() + ":" +
        attributes.size());
} finally {
    Files.deleteIfExists(file);
}`,
    options: choices(
      [
        "A",
        "true:4",
        "Correct. The path is a regular file and the four ASCII characters occupy four bytes in the default UTF-8 encoding.",
      ],
      [
        "B",
        "true:8",
        "UTF-8 encodes each of these ASCII characters in one byte, not two bytes per Java char.",
      ],
      [
        "C",
        "false:4",
        "createTempFile creates a regular file, not a directory or symbolic link.",
      ],
      [
        "D",
        "The code fails because size() is unavailable on BasicFileAttributes",
        "BasicFileAttributes defines size as the file size in bytes.",
      ],
    ),
    answer: ["A"],
    explanation:
      "Files.writeString uses UTF-8 when no charset is supplied, so Java occupies four bytes. BasicFileAttributes reports the created path as a regular file with size 4.",
    sourceUrl: `${API}java/nio/file/attribute/BasicFileAttributes.html`,
    tags: ["NIO", "file attributes", "BasicFileAttributes", "UTF-8"],
  },
  {
    id: "MB-IO-02",
    domain: "io",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `import java.io.RandomAccessFile;
import java.nio.file.Files;

var file = Files.createTempFile("data", ".bin");
try (var data = new RandomAccessFile(file.toFile(), "rw")) {
    data.writeInt(10);
    data.writeInt(20);
    data.seek(Integer.BYTES);
    data.writeInt(30);
    data.seek(0);
    System.out.println(data.readInt() + ":" +
        data.readInt() + ":" + data.length());
} finally {
    Files.deleteIfExists(file);
}`,
    options: choices(
      [
        "A",
        "10:30:8",
        "Correct. seek(4) positions the file pointer at the second int, which is overwritten with 30; the file remains eight bytes long.",
      ],
      [
        "B",
        "10:20:12",
        "seek moves to an existing offset and the next write overwrites bytes there; it does not insert four new bytes.",
      ],
      [
        "C",
        "30:20:8",
        "Offset Integer.BYTES is four bytes from the start, which is the position of the second int, not the first.",
      ],
      [
        "D",
        "An EOFException is thrown after the overwrite",
        "The file still contains two complete four-byte ints, and seek(0) returns the pointer to their beginning before the reads.",
      ],
    ),
    answer: ["A"],
    explanation:
      "Each writeInt occupies four bytes. Seeking to offset 4 and writing replaces the second int without extending the file. After seeking to zero, the values are 10 and 30 and length remains 8.",
    sourceUrl: `${API}java/io/RandomAccessFile.html#seek(long)`,
    tags: ["RandomAccessFile", "seek", "file pointer", "overwrite"],
  },
  {
    id: "MB-IO-03",
    domain: "io",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `import java.io.*;

var bytes = new ByteArrayOutputStream();
try (var out = new DataOutputStream(bytes)) {
    out.writeInt(258);
    out.writeBoolean(true);
}
try (var in = new DataInputStream(
        new ByteArrayInputStream(bytes.toByteArray()))) {
    System.out.println(bytes.size() + ":" +
        in.readUnsignedShort() + ":" +
        in.readUnsignedShort() + ":" +
        in.readBoolean());
}`,
    options: choices(
      [
        "A",
        "5:0:258:true",
        "Correct. writeInt emits 00 00 01 02 and writeBoolean emits 01; the two unsigned-short reads therefore produce 0 and 258.",
      ],
      [
        "B",
        "5:258:1:true",
        "readUnsignedShort consumes two bytes at a time; the first two bytes of the int are both zero.",
      ],
      [
        "C",
        "2:258:1:true",
        "An int occupies four bytes and the boolean occupies one, so the buffer size is 5.",
      ],
      [
        "D",
        "An EOFException is thrown by the second readUnsignedShort",
        "Five bytes are available: four for the int and one for the boolean, so both unsigned-short reads and the boolean read can complete.",
      ],
    ),
    answer: ["A"],
    explanation:
      "DataOutputStream writes the int as four big-endian bytes 00 00 01 02, followed by 01 for true. Reading two unsigned shorts consumes 00 00 as 0 and 01 02 as 258, leaving the boolean byte.",
    sourceUrl: `${API}java/io/DataOutputStream.html#writeInt(int)`,
    tags: ["DataOutputStream", "DataInputStream", "binary data", "big endian"],
  },
  {
    id: "MB-IO-04",
    domain: "io",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt: "Which two statements about this code are correct?",
    code: `import java.nio.file.Files;
import java.util.List;

var file = Files.createTempFile("words", ".txt");
try {
    Files.write(file, List.of("ant", "bee", "cat"));
    try (var lines = Files.lines(file)) {
        long count = lines
            .filter(line -> line.contains("a"))
            .count();
        System.out.println(count);
    }
} finally {
    Files.deleteIfExists(file);
}`,
    options: choices(
      [
        "A",
        "The code prints 2",
        "Correct. ant and cat contain a, while bee does not.",
      ],
      [
        "B",
        "Files.lines eagerly reads and closes the file before returning",
        "Files.lines returns a lazy stream associated with an open file resource.",
      ],
      [
        "C",
        "The nested try-with-resources closes the stream and its underlying file resource",
        "Correct. Closing the returned stream is required to release the open file promptly.",
      ],
      [
        "D",
        "The stream can be counted a second time after count()",
        "count is a terminal operation; a consumed stream cannot be reused for another pipeline traversal.",
      ],
    ),
    answer: ["A", "C"],
    explanation:
      "The lazy line stream processes three lines when count executes and finds two matches. The stream owns an open file resource, so the nested try-with-resources closes it before deletion.",
    sourceUrl: `${API}java/nio/file/Files.html#lines(java.nio.file.Path)`,
    tags: [
      "Files.lines",
      "lazy stream",
      "resource management",
      "try-with-resources",
    ],
  },
  {
    id: "MB-IO-05",
    domain: "io",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed?",
    code: `import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

var input = new ByteArrayInputStream(
    "ABC".getBytes(StandardCharsets.UTF_8));
int first = input.read();
input.mark(10);
int second = input.read();
input.reset();
int again = input.read();

System.out.println((char) first + ":" +
    (char) second + ":" + (char) again);`,
    options: choices(
      [
        "A",
        "A:B:B",
        "Correct. mark records the position before B, and reset returns to that position so B is read again.",
      ],
      [
        "B",
        "A:B:C",
        "Without reset the third read would produce C; reset moves the position back to B.",
      ],
      [
        "C",
        "A:A:B",
        "The mark is set after A has already been consumed, so reset cannot reread A.",
      ],
      [
        "D",
        "reset throws IOException because mark is unsupported",
        "ByteArrayInputStream supports mark and reset; the marked position is valid.",
      ],
    ),
    answer: ["A"],
    explanation:
      "The first read consumes A, then mark saves the position at B. After reading B once, reset restores that saved position and the next read returns B again.",
    sourceUrl: `${API}java/io/ByteArrayInputStream.html#reset()`,
    tags: ["InputStream", "mark", "reset", "byte stream"],
  },

  {
    id: "MB-LOCALIZATION-01",
    domain: "localization",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt: "What is printed?",
    code: `import java.text.NumberFormat;
import java.util.Locale;

NumberFormat money = NumberFormat.getCurrencyInstance(Locale.US);
Number parsed = money.parse("$1,234.50");
String formatted = money.format(12);

System.out.println(parsed.doubleValue() + "|" + formatted);`,
    options: choices(
      [
        "A",
        "1234.5|$12.00",
        "Correct. The US currency parser removes currency syntax, and the formatter emits two fractional currency digits.",
      ],
      [
        "B",
        "1234.50|$12",
        "doubleValue prints 1234.5, while the currency formatter supplies the standard two decimal places.",
      ],
      [
        "C",
        "1.2345|12,00 $",
        "Those separators and placement do not describe the explicitly selected US locale.",
      ],
      [
        "D",
        "ParseException is thrown because currency symbols cannot be parsed",
        "A currency NumberFormat for Locale.US accepts its locale's currency representation.",
      ],
    ),
    answer: ["A"],
    explanation:
      "The formatter is explicitly US-localized. Parsing returns the numeric value 1234.5, and formatting 12 as US currency yields a dollar sign and two fraction digits.",
    sourceUrl: `${API}java/text/NumberFormat.html#getCurrencyInstance(java.util.Locale)`,
    tags: ["NumberFormat", "currency", "parse", "Locale.US"],
  },
  {
    id: "MB-LOCALIZATION-02",
    domain: "localization",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the code print?",
    code: `import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

var formatter = DateTimeFormatter.ofPattern(
    "dd MMM uuuu", Locale.US);
LocalDate date = LocalDate.parse("05 Mar 2025", formatter);

System.out.println(date.plusDays(1).format(
    DateTimeFormatter.ISO_LOCAL_DATE));`,
    options: choices(
      [
        "A",
        "2025-03-06",
        "Correct. The US formatter parses March 5, then one day is added and ISO formatting is applied.",
      ],
      [
        "B",
        "2025-05-04",
        "MMM is a textual month and Mar is March; it is not interpreted as a numeric day/month swap.",
      ],
      [
        "C",
        "06 Mar 2025",
        "The final call uses ISO_LOCAL_DATE, not the formatter used for parsing.",
      ],
      [
        "D",
        "The parse fails because uuuu cannot parse a four-digit year",
        "uuuu is the proleptic-year pattern and parses 2025 normally.",
      ],
    ),
    answer: ["A"],
    explanation:
      "Locale.US supplies the English month text needed to parse Mar. The resulting date is 2025-03-05, plusDays produces March 6, and ISO output is 2025-03-06.",
    sourceUrl: `${API}java/time/format/DateTimeFormatter.html#ofPattern(java.lang.String,java.util.Locale)`,
    tags: ["DateTimeFormatter", "parsing", "Locale", "LocalDate"],
  },
  {
    id: "MB-LOCALIZATION-03",
    domain: "localization",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt: "What is printed?",
    code: `import java.text.MessageFormat;
import java.util.Locale;

var format = new MessageFormat(
    "{0} owes {1,number,currency}", Locale.US);
Object[] values = format.parse("Lee owes $12.50");

System.out.println(values[0] + ":" +
    ((Number) values[1]).doubleValue());`,
    options: choices(
      [
        "A",
        "Lee:12.5",
        "Correct. The first argument parses as text and the currency subformat parses the second as a Number.",
      ],
      [
        "B",
        "Lee:$12.50",
        "MessageFormat.parse returns the currency argument as a numeric object rather than retaining the formatted text.",
      ],
      [
        "C",
        "0:1",
        "The indexes in the pattern identify array positions; they are not the parsed values themselves.",
      ],
      [
        "D",
        "Parsing fails because MessageFormat only formats and cannot parse",
        "MessageFormat supports parsing text back into an Object array according to its subformats.",
      ],
    ),
    answer: ["A"],
    explanation:
      "MessageFormat uses the US currency NumberFormat for argument 1. Parsing produces Lee at index 0 and a Number representing 12.5 at index 1.",
    sourceUrl: `${API}java/text/MessageFormat.html#parse(java.lang.String)`,
    tags: ["MessageFormat", "parse", "currency subformat", "argument index"],
  },
  {
    id: "MB-LOCALIZATION-04",
    domain: "localization",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt: "Which two statements about locale are correct?",
    code: `import java.util.Locale;

var locale = Locale.forLanguageTag(
    "zh-Hant-TW-u-nu-hanidec");`,
    options: choices(
      [
        "A",
        'locale.toLanguageTag() returns "zh-Hant-TW-u-nu-hanidec"',
        "Correct. The language, script, region, and Unicode numbering-system extension are all retained in canonical language-tag form.",
      ],
      [
        "B",
        'locale.getUnicodeLocaleType("nu") returns "hanidec"',
        "Correct. nu is the Unicode locale extension key for the requested numbering system.",
      ],
      [
        "C",
        'locale.getVariant() returns "Hant"',
        "Hant is the script subtag returned by getScript; this language tag has no variant.",
      ],
      [
        "D",
        "locale.stripExtensions().toLanguageTag() still contains u-nu-hanidec",
        "stripExtensions removes the Unicode extension, leaving zh-Hant-TW.",
      ],
    ),
    answer: ["A", "B"],
    explanation:
      "The tag encodes language zh, script Hant, region TW, and the Unicode nu type hanidec. Hant is not a variant, and stripExtensions removes the entire u-nu-hanidec suffix.",
    sourceUrl: `${API}java/util/Locale.html#forLanguageTag(java.lang.String)`,
    tags: ["Locale", "language tag", "Unicode locale extension", "script"],
  },
  {
    id: "MB-LOCALIZATION-05",
    domain: "localization",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt:
      "What is printed when the America/New_York time-zone rules are used?",
    code: `import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;

var zone = ZoneId.of("America/New_York");
var before = LocalDateTime.of(2025, 3, 9, 1, 30)
    .atZone(zone);
var after = before.plusHours(1);
long elapsed = Duration.between(before, after).toMinutes();

System.out.println(after.toLocalTime() + ":" + elapsed);`,
    options: choices(
      [
        "A",
        "02:30:60",
        "02:30 is in the spring daylight-saving gap for New York on that date and is skipped.",
      ],
      [
        "B",
        "03:30:60",
        "Correct. Timeline addition advances one real hour across the gap, so local time jumps from 01:30 to 03:30.",
      ],
      [
        "C",
        "03:30:120",
        "Although the displayed clock jumps two hours, only 60 minutes elapse on the instant timeline.",
      ],
      [
        "D",
        "An exception is thrown because 02:30 does not exist",
        "The operation resolves through the zone transition and produces the valid post-gap time 03:30.",
      ],
    ),
    answer: ["B"],
    explanation:
      "New York advances from 02:00 to 03:00 on March 9, 2025. Adding one hour to the zoned value is instant-based here, producing 03:30 with exactly 60 elapsed minutes.",
    sourceUrl: `${API}java/time/ZonedDateTime.html#plusHours(long)`,
    tags: ["ZonedDateTime", "daylight saving", "Duration", "ZoneId"],
  },
];
