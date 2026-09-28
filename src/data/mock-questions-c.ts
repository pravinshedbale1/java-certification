import type { Question } from "./questions";

type Choice = readonly [text: string, explanation: string];
type MockDraft = Omit<Question, "options"> & {
  choices: readonly [Choice, Choice, Choice, Choice];
};

function mock({ choices, ...question }: MockDraft): Question {
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
 * Original, mock-only questions for locked mock form C.
 * These are study items, not reproduced certification questions.
 */
export const mockQuestionsC: Question[] = [
  mock({
    id: "MC-VALUES-01",
    domain: "values",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: `byte level = 127;
level++;
var total = level + 1;
char grade = 65;
grade += 2.9;
System.out.println(level + ":" + total + ":" + grade);`,
    choices: [
      [
        "-128:-127:C",
        "Correct. Increment narrows the overflowing result back to byte, binary promotion makes total an int, and compound assignment narrows 67.9 to char value 67.",
      ],
      [
        "128:129:C",
        "A byte cannot represent 128. Increment wraps the narrowed two's-complement value to -128.",
      ],
      [
        "-128:-127:D",
        "The compound assignment truncates 67.9 to 67 rather than rounding it to 68, so the character is C.",
      ],
      [
        "The code does not compile because 2.9 cannot be assigned to char",
        "A compound assignment includes an implicit cast to the left operand's type, so the char assignment compiles.",
      ],
    ],
    answer: ["A"],
    explanation:
      "The postfix increment behaves with an implicit narrowing conversion, so 127 becomes byte -128. Addition promotes the byte to int, producing -127. For grade += 2.9, the double result 67.9 is narrowed to char 67, which prints as C.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.26.2",
    tags: ["primitive conversion", "overflow", "compound assignment"],
  }),
  mock({
    id: "MC-VALUES-02",
    domain: "values",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: `String first = "forge";
String second = "for" + "ge";
String third = "for";
third += "ge";
String fourth = third.intern();
System.out.println((first == second) + ":" +
    (first == third) + ":" + (first == fourth));`,
    choices: [
      [
        "true:false:true",
        "Correct. The constant expression is interned, += creates a run-time String, and intern returns the canonical pooled reference.",
      ],
      [
        "true:true:true",
        "The += expression is evaluated at run time because third is a variable; its new String is not automatically the pooled reference.",
      ],
      [
        "false:false:true",
        "Concatenation of string literals is a compile-time constant and refers to the same interned literal as first.",
      ],
      [
        "true:false:false",
        "Calling intern on a String returns the canonical representation, which is the existing literal referenced by first.",
      ],
    ],
    answer: ["A"],
    explanation:
      "Literal concatenation is folded at compile time, so first and second are the same pooled object. Compound assignment to third performs run-time concatenation. fourth is the result of interning that value and therefore shares first's canonical reference.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-3.html#jls-3.10.5",
    tags: ["String pool", "constant expression", "intern"],
  }),
  mock({
    id: "MC-VALUES-03",
    domain: "values",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: `int[] scores = { 4, 5, 6 };
int index = 0;
scores[index++] += index;
var result = switch (scores[0]) {
  case 5 -> 10;
  default -> 2.5;
};
System.out.println(index + ":" + scores[0] + ":" + result);`,
    choices: [
      [
        "1:5:10.0",
        "Correct. The array index is saved before index increments, the right operand sees index as 1, and numeric promotion gives the switch expression type double.",
      ],
      [
        "1:4:2.5",
        "The compound assignment writes back to the saved array component, adding the new index value 1 to 4.",
      ],
      [
        "1:5:10",
        "The int and double result expressions undergo numeric promotion, so result is a double and prints 10.0.",
      ],
      [
        "2:6:10.0",
        "index++ is evaluated once. Compound array assignment does not evaluate its index expression a second time.",
      ],
    ],
    answer: ["A"],
    explanation:
      "For an array compound assignment, the array reference and index are evaluated and saved once. index becomes 1 before the right side is evaluated, so scores[0] becomes 5. The standalone numeric switch expression combines int and double results and has type double.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.26.2",
    tags: [
      "evaluation order",
      "arrays",
      "switch expression",
      "numeric promotion",
    ],
  }),
  mock({
    id: "MC-VALUES-04",
    domain: "values",
    difficulty: "Applied",
    type: "single",
    pattern: "compilation",
    prompt: "What is the result of compiling this class?",
    code: `class Printer {
  static void show(String value) {
    System.out.print("S");
  }
  static void show(StringBuilder value) {
    System.out.print("B");
  }
  public static void main(String[] args) {
    show(null);
  }
}`,
    choices: [
      [
        "It prints S because String is immutable",
        "Mutability has no role in overload selection, and neither reference type is more specific than the other.",
      ],
      [
        "It prints B because StringBuilder is a class",
        "Both parameter types are classes and both accept null; that does not make StringBuilder more specific.",
      ],
      [
        "Compilation fails because the invocation is ambiguous",
        "Correct. String and StringBuilder are unrelated reference types, so neither applicable overload is most specific.",
      ],
      [
        "It compiles and throws NullPointerException before either method runs",
        "Passing null is legal for either parameter. The failure occurs at compile time because overload resolution has no unique winner.",
      ],
    ],
    answer: ["C"],
    explanation:
      "The null type can convert to both String and StringBuilder. Because those types are unrelated, neither method is more specific, making the invocation ambiguous at compile time.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12.2.5",
    tags: ["overloading", "null", "most specific method"],
  }),
  mock({
    id: "MC-VALUES-05",
    domain: "values",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: `int[][] grid = { { 1, 2 }, { 3 } };
int[] originalFirstRow = grid[0];
grid[0] = grid[1];
originalFirstRow[1] = 9;
System.out.println(grid[0].length + ":" +
    originalFirstRow[1] + ":" + grid[1][0]);`,
    choices: [
      [
        "1:9:3",
        "Correct. Replacing grid[0] changes that array reference but does not change the array still referenced by originalFirstRow.",
      ],
      [
        "1:2:3",
        "originalFirstRow still refers to the former first row, so assigning index 1 changes its value from 2 to 9.",
      ],
      [
        "2:9:3",
        "grid[0] is replaced with grid[1], which has length 1 rather than the old row's length 2.",
      ],
      [
        "1:9:9",
        "The two top-level slots both reference the one-element array containing 3; originalFirstRow references a different two-element array.",
      ],
    ],
    answer: ["A"],
    explanation:
      "A multidimensional Java array is an array of array references. After grid[0] is assigned grid[1], both grid slots refer to the one-element row containing 3. originalFirstRow independently retains the old two-element row, whose second element becomes 9.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-10.html#jls-10.7",
    tags: ["multidimensional array", "array reference", "aliasing"],
  }),

  mock({
    id: "MC-FLOW-01",
    domain: "flow",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: `boolean member = true;
boolean premium = false;
int points = 0;

if (member)
  if (premium)
    points = 10;
  else
    points = 5;
else
  points = -1;

System.out.println(points);`,
    choices: [
      [
        "0",
        "The inner false condition has an else clause, so execution does assign points.",
      ],
      [
        "5",
        "Correct. The first else belongs to the nearest unmatched if, so it handles premium being false while member is true.",
      ],
      [
        "-1",
        "The final else belongs to the outer if and would run only if member were false.",
      ],
      [
        "The code does not compile because braces are required for nested if statements",
        "Braces are optional for single substatements, and the grammar resolves each else to the nearest eligible if.",
      ],
    ],
    answer: ["B"],
    explanation:
      "An else is associated with the nearest preceding unmatched if. Because member is true, the inner if is tested; premium is false, so its else assigns 5. The final else belongs to the outer member test and is skipped.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.9.2",
    tags: ["if else", "dangling else", "nearest if", "control flow"],
  }),
  mock({
    id: "MC-FLOW-02",
    domain: "flow",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: `int n = 0;
int sum = 0;

while (n++ < 4) {
  if ((n & 1) == 0) continue;
  sum += n;
}

System.out.println(n + ":" + sum);`,
    choices: [
      [
        "5:4",
        "Correct. The body adds 1 and 3, and the final failed condition still increments n from 4 to 5.",
      ],
      [
        "4:4",
        "The post-increment in the final condition check occurs even though that check ends the loop.",
      ],
      [
        "5:6",
        "Even values reach continue and are not added; the odd values entering the body are 1 and 3.",
      ],
      [
        "4:10",
        "This treats the loop as though every value were added and ignores the final condition-side increment.",
      ],
    ],
    answer: ["A"],
    explanation:
      "Each condition evaluates n++ before comparison. The body sees n values 1 through 4, but continue skips 2 and 4, so sum is 4. A fifth increment occurs when 4 < 4 is false, leaving n at 5.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.12",
    tags: ["while", "continue", "post-increment", "loop condition"],
  }),
  mock({
    id: "MC-FLOW-03",
    domain: "flow",
    difficulty: "Applied",
    type: "single",
    pattern: "compilation",
    prompt: "What happens when this code is compiled and run?",
    code: `static int score(boolean accepted) {
  int result;
  if (accepted) {
    result = 7;
  } else {
    throw new IllegalArgumentException();
  }
  return result;
}

System.out.println(score(true));`,
    choices: [
      [
        "It prints 7",
        "Correct. The only path that reaches return assigns result; the other path completes abruptly by throwing.",
      ],
      [
        "It prints 0 because result has its default value",
        "Local variables do not receive default values, but result is definitely assigned on every path that reaches return.",
      ],
      [
        "Compilation fails because result is not assigned in the else branch",
        "The else branch cannot complete normally, so it creates no path to return that lacks an assignment.",
      ],
      [
        "Compilation fails because every local variable must be initialized at its declaration",
        "A local variable may be declared without an initializer when definite-assignment analysis proves it is assigned before use.",
      ],
    ],
    answer: ["A"],
    explanation:
      "Definite-assignment analysis considers only paths that can reach a use. The accepted branch assigns result, while the other branch throws and cannot reach return. The method therefore compiles and score(true) returns 7.",
    sourceUrl: "https://docs.oracle.com/javase/specs/jls/se25/html/jls-16.html",
    tags: ["definite assignment", "abrupt completion", "local variable"],
  }),
  mock({
    id: "MC-FLOW-04",
    domain: "flow",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: `int[] values = { 1, 2, 3 };
for (int value : values) {
  value *= 2;
  if (value == 4) values[0] = 9;
}
System.out.println(java.util.Arrays.toString(values));`,
    choices: [
      [
        "[2, 4, 6]",
        "Assigning to the enhanced-for variable does not write the doubled values back into the array elements.",
      ],
      [
        "[9, 2, 3]",
        "Correct. The loop variable is a copy of each int element, but the explicit assignment to values[0] changes the array.",
      ],
      [
        "[9, 4, 6]",
        "Only values[0] is assigned through an array access; changes to the local value variable do not mutate elements 1 and 2.",
      ],
      [
        "[1, 2, 3]",
        "When the second element supplies value 2, doubling it to 4 makes the explicit values[0] assignment execute.",
      ],
    ],
    answer: ["B"],
    explanation:
      "Each enhanced-for iteration copies the current primitive array element into value. Multiplying that local variable has no effect on the array. During the second iteration value becomes 4, so the direct assignment changes only values[0] to 9.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.14.2",
    tags: ["enhanced for", "array", "loop variable", "primitive copy"],
  }),
  mock({
    id: "MC-FLOW-05",
    domain: "flow",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: `int score = 0;
for (int level : new int[] { 1, 2, 3 }) {
  switch (level) {
    case 1: score += 1;
    case 2: score += 2; break;
    default: score += 4;
  }
}
System.out.println(score);`,
    choices: [
      ["7", "This omits fall-through from case 1 into case 2."],
      [
        "9",
        "Correct. Level 1 contributes 3 through fall-through, level 2 contributes 2, and level 3 contributes 4.",
      ],
      [
        "10",
        "The break in case 2 prevents control from reaching default for levels 1 and 2.",
      ],
      [
        "The code does not compile because case 1 has no break",
        "A traditional switch statement permits fall-through between statement groups.",
      ],
    ],
    answer: ["B"],
    explanation:
      "Traditional colon-style switch statements fall through. Level 1 executes cases 1 and 2 for 3 points, level 2 adds 2, and level 3 executes default for 4, producing 9.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.11.3",
    tags: ["switch statement", "fall-through", "break", "loop"],
  }),

  mock({
    id: "MC-OOP-01",
    domain: "oop",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: `class Parent {
  static String kind() { return "P"; }
  String name() { return "parent"; }
}

class Child extends Parent {
  static String kind() { return "C"; }
  @Override String name() { return "child"; }
}

Parent value = new Child();
System.out.println(value.kind() + ":" + value.name());`,
    choices: [
      [
        "P:child",
        "Correct. Static method selection uses the reference type Parent, while the overridden instance method dispatches to Child.",
      ],
      [
        "C:child",
        "kind is hidden rather than overridden, so the Child object does not cause dynamic dispatch for that static call.",
      ],
      [
        "P:parent",
        "name is an instance method and therefore dispatches according to the object's run-time class.",
      ],
      [
        "The code does not compile because Child cannot declare another static kind method",
        "A subclass may hide an accessible static method with a compatible static declaration.",
      ],
    ],
    answer: ["A"],
    explanation:
      "Static methods are hidden, so value.kind() is resolved using value's declared type Parent and returns P. Instance methods are overridden and dynamically dispatched, so value.name() invokes Child.name and returns child.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.8.2",
    tags: ["static method", "method hiding", "overriding", "polymorphism"],
  }),
  mock({
    id: "MC-OOP-02",
    domain: "oop",
    difficulty: "Expert",
    type: "single",
    pattern: "scenario",
    prompt:
      "Immediately after the marked line, how many Link objects are eligible for garbage collection? Assume no references escape the method.",
    code: `class Link { Link next; }

static void build() {
  Link first = new Link();
  Link second = new Link();
  first.next = second;
  Link keeper = second;
  first.next = null;
  first = null;
  second = null; // marked line
  System.out.println(keeper.next); // keeper is used later
}`,
    choices: [
      [
        "Zero",
        "The object formerly referenced by first has no remaining path from a live root.",
      ],
      [
        "One",
        "Correct. The first object is unreachable, while keeper still reaches the second object and is used later.",
      ],
      [
        "Two",
        "keeper still references the second object, so that object is not eligible at the marked line.",
      ],
      [
        "It cannot be determined until the garbage collector runs",
        "Eligibility is determined by reachability; whether or when the collector actually runs is a separate question.",
      ],
    ],
    answer: ["B"],
    explanation:
      "Clearing first.next disconnects the two objects. After first is cleared, its former object is unreachable. The second object remains reachable through keeper, whose later use also makes that liveness explicit. Exactly one object is eligible.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html#jls-12.6.1",
    tags: [
      "garbage collection",
      "reachability",
      "object lifecycle",
      "liveness",
    ],
  }),
  mock({
    id: "MC-OOP-03",
    domain: "oop",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: `class Parent {
  Parent() { show(); }
  void show() { System.out.print("P"); }
}

class Child extends Parent {
  int value = 2;
  Child() { value = 3; }
  @Override void show() { System.out.print("C" + value); }
}

Child child = new Child();
System.out.println(":" + child.value);`,
    choices: [
      [
        "P:3",
        "Instance method dispatch remains polymorphic inside the Parent constructor, so Child.show is invoked instead of Parent.show.",
      ],
      [
        "C0:3",
        "Correct. Child fields still have default values when Parent calls the overridden method; initialization later sets value to 2 and then 3.",
      ],
      [
        "C2:3",
        "The Child field initializer runs only after the Parent constructor returns, so value is still 0 during show().",
      ],
      [
        "C3:3",
        "The Child constructor body assigning 3 executes after the superclass constructor completes.",
      ],
    ],
    answer: ["B"],
    explanation:
      "A newly allocated Child first has default field values. Parent's constructor invokes the overridden Child.show method while value is still 0. Afterward the Child initializer assigns 2 and its constructor assigns 3, producing C0:3.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html#jls-12.5",
    tags: [
      "constructor",
      "initialization order",
      "overriding",
      "dynamic dispatch",
    ],
  }),
  mock({
    id: "MC-OOP-04",
    domain: "oop",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What happens when this program is compiled and run?",
    code: `class VarargsChoice {
  static void inspect(Object value) {
    System.out.print("object");
  }
  static void inspect(Object... values) {
    System.out.print(values.length);
  }
  public static void main(String[] args) {
    inspect(null);
  }
}`,
    choices: [
      [
        "It prints object",
        "Object[] is more specific than Object, so the varargs declaration is selected for a bare null argument.",
      ],
      [
        "It prints 0",
        "The chosen method receives a null array, not an empty array.",
      ],
      [
        "It compiles with a warning and throws NullPointerException",
        "Correct. The fixed-arity view of Object... accepts null as Object[], and values.length dereferences null.",
      ],
      [
        "Compilation fails because the overloads have the same erasure",
        "Object and Object[] are different erased parameter types, so the overload declarations are legal.",
      ],
    ],
    answer: ["C"],
    explanation:
      "The varargs method is applicable in fixed-arity form with Object[] and is more specific than inspect(Object). The compiler warns that the null argument is ambiguous in intent, then values is null and accessing length throws NullPointerException.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12.2.4",
    tags: ["varargs", "overloading", "null", "fixed arity"],
  }),
  mock({
    id: "MC-OOP-05",
    domain: "oop",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt: "Which statements are true? Select all that apply.",
    code: `record Code(String text) {
  public Code {
    text = text.strip().toUpperCase();
  }
}

var code = new Code("  java  ");`,
    choices: [
      [
        'code.text() returns "JAVA"',
        "Correct. The compact constructor reassigns its parameter before the implicit component-field assignment.",
      ],
      [
        "The record class Code is implicitly final",
        "Correct. Every record class is final and cannot be extended.",
      ],
      [
        "The text component corresponds to a private final field and a public text() accessor",
        "Correct. Those members are derived from the record component declaration.",
      ],
      [
        "Code may declare an additional non-static instance field named length",
        "A record cannot declare extra instance fields; additional fields must be static.",
      ],
    ],
    answer: ["A", "B", "C"],
    explanation:
      "A compact record constructor may normalize a parameter, after which Java assigns it to the corresponding private final component field. Code is implicitly final, exposes text(), and cannot add another instance field beyond its declared components.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.10",
    tags: ["record", "compact constructor", "component", "implicit final"],
  }),

  mock({
    id: "MC-EXCEPTIONS-01",
    domain: "exceptions",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: `class InvalidOrderException extends Exception {
  InvalidOrderException(String message) { super(message); }
}

static void place(int quantity) throws InvalidOrderException {
  if (quantity < 1) throw new InvalidOrderException("quantity");
}

try {
  place(0);
  System.out.print("placed");
} catch (InvalidOrderException ex) {
  System.out.print(ex.getMessage());
} finally {
  System.out.print(":done");
}`,
    choices: [
      ["placed:done", "place throws before the placed statement executes."],
      [
        "quantity:done",
        "Correct. The custom checked exception is caught, then the finally block always runs.",
      ],
      [
        "quantity",
        "The finally block executes after the catch and appends :done.",
      ],
      [
        "The code does not compile because custom exceptions must extend RuntimeException",
        "A checked application exception may extend Exception and be declared or caught as shown.",
      ],
    ],
    answer: ["B"],
    explanation:
      "InvalidOrderException is checked because it extends Exception but not RuntimeException. place declares it, and the caller handles it. The catch prints quantity and finally appends :done.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html#jls-11.1.1",
    tags: ["custom exception", "checked exception", "catch", "finally"],
  }),
  mock({
    id: "MC-EXCEPTIONS-02",
    domain: "exceptions",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: `class ImportProblem extends Exception {
  ImportProblem(String message) { super(message); }
}
class MissingColumn extends ImportProblem {
  MissingColumn() { super("column"); }
}
class BadNumber extends ImportProblem {
  BadNumber() { super("number"); }
}

static void load(int mode) throws MissingColumn, BadNumber {
  if (mode == 1) throw new MissingColumn();
  throw new BadNumber();
}

try {
  load(2);
} catch (MissingColumn | BadNumber problem) {
  System.out.println(problem.getClass().getSimpleName() +
      ":" + problem.getMessage());
}`,
    choices: [
      [
        "ImportProblem:number",
        "The run-time class is BadNumber rather than its ImportProblem superclass.",
      ],
      [
        "BadNumber:number",
        "Correct. mode 2 selects BadNumber, and its inherited message is number.",
      ],
      ["MissingColumn:column", "MissingColumn is thrown only when mode is 1."],
      [
        "The multi-catch does not compile because both alternatives extend ImportProblem",
        "Sibling exception types may appear together in a multi-catch; neither alternative is a subtype of the other.",
      ],
    ],
    answer: ["B"],
    explanation:
      "MissingColumn and BadNumber are sibling checked exceptions, so their multi-catch is legal. load(2) constructs BadNumber with the inherited message number, producing BadNumber:number.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20",
    tags: [
      "custom exception",
      "multi-catch",
      "exception hierarchy",
      "checked exception",
    ],
  }),
  mock({
    id: "MC-EXCEPTIONS-03",
    domain: "exceptions",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: `class ConfigProblem extends RuntimeException {
  ConfigProblem(String message, Throwable cause) {
    super(message, cause);
  }
}

static void parse() {
  try {
    Integer.parseInt("NaN");
  } catch (NumberFormatException cause) {
    throw new ConfigProblem("config", cause);
  }
}

try {
  parse();
} catch (ConfigProblem problem) {
  System.out.println(problem.getMessage() + ":" +
      problem.getCause().getClass().getSimpleName());
}`,
    choices: [
      [
        "config:ConfigProblem",
        "getCause returns the original NumberFormatException, not the wrapper itself.",
      ],
      [
        "config:NumberFormatException",
        "Correct. The wrapper retains its own message and the original parsing exception as its cause.",
      ],
      [
        "NaN:NumberFormatException",
        "The wrapper message is config; NaN is the failed input rather than the message passed to ConfigProblem.",
      ],
      [
        "The code does not compile because parse does not declare ConfigProblem",
        "ConfigProblem extends RuntimeException, so it is unchecked and need not appear in a throws clause.",
      ],
    ],
    answer: ["B"],
    explanation:
      "The failed integer conversion creates a NumberFormatException. parse wraps it in an unchecked ConfigProblem using exception chaining. The handler reads config from the wrapper and NumberFormatException from its cause.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Throwable.html#getCause()",
    tags: [
      "exception chaining",
      "cause",
      "custom exception",
      "unchecked exception",
    ],
  }),
  mock({
    id: "MC-EXCEPTIONS-04",
    domain: "exceptions",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt: "Which statements are true? Select all that apply.",
    code: `class Gate implements AutoCloseable {
  void use() { System.out.print("U"); }
  public void close() { System.out.print("C"); }
}

var gate = new Gate();
try (gate) {
  gate.use();
}
gate.use();`,
    choices: [
      [
        "The code compiles even though gate is not declared final",
        "Correct. A previously declared resource variable may be final or effectively final.",
      ],
      [
        "The code prints UCU",
        "Correct. The body uses the gate, automatic closing prints C, and the still-in-scope variable is used again.",
      ],
      [
        "gate remains in scope after the try statement",
        "Correct. The variable was declared outside the resource specification, so the try statement does not limit its scope.",
      ],
      [
        "Assigning gate = new Gate() immediately before the try would preserve compilation",
        "That additional assignment would make the local variable not effectively final, so it could not be used as this resource.",
      ],
    ],
    answer: ["A", "B", "C"],
    explanation:
      "Java permits a final or effectively final variable declared earlier to appear as a try-with-resources resource. Automatic closing occurs after the body, but the variable's original scope continues after the try, so the output is UCU.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20.3",
    tags: [
      "try with resources",
      "effectively final",
      "resource variable",
      "scope",
    ],
  }),
  mock({
    id: "MC-EXCEPTIONS-05",
    domain: "exceptions",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: `try {
  RuntimeException problem = null;
  throw problem;
} catch (NullPointerException problem) {
  System.out.println(problem.getClass().getSimpleName());
}`,
    choices: [
      [
        "NullPointerException",
        "Correct. Evaluating a throw statement with a null expression causes a NullPointerException, which the catch handles.",
      ],
      [
        "RuntimeException",
        "No RuntimeException object exists; the local reference holds null.",
      ],
      [
        "null",
        "The throw statement does not print or propagate a null reference; Java creates a NullPointerException for this case.",
      ],
      [
        "The code does not compile because a throw expression cannot be null",
        "The expression's static type is throwable, so it compiles; the null value is handled at run time.",
      ],
    ],
    answer: ["A"],
    explanation:
      "A throw expression must have a throwable reference type, which RuntimeException does. At run time the evaluated reference is null, so the throw statement causes a NullPointerException; the matching handler prints its class name.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.18",
    tags: ["throw statement", "null", "NullPointerException", "catch"],
  }),

  mock({
    id: "MC-COLLECTIONS-01",
    domain: "collections",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: `java.util.SequencedMap<String, Integer> map =
    new java.util.LinkedHashMap<>();
map.put("A", 1);
map.put("B", 2);
map.putFirst("B", 20);
map.putLast("C", 3);
var removed = map.pollFirstEntry();
System.out.println(removed + "|" + map.firstEntry() + "|" +
    map.lastEntry());`,
    choices: [
      [
        "B=20|A=1|C=3",
        "Correct. Updating B with putFirst moves it to the front, pollFirstEntry removes it, and A and C remain as the boundary entries.",
      ],
      [
        "A=1|B=20|C=3",
        "putFirst repositions the existing B mapping to the front, so B rather than A is removed.",
      ],
      [
        "B=2|A=1|C=3",
        "putFirst both replaces B's value with 20 and changes its encounter position.",
      ],
      [
        "The code fails because putFirst cannot be used for an existing key",
        "SequencedMap.putFirst may update an existing mapping and repositions that mapping first.",
      ],
    ],
    answer: ["A"],
    explanation:
      "The initial order is A, B. putFirst replaces B=2 with B=20 and moves that mapping before A; putLast then appends C. pollFirstEntry removes B=20, leaving A=1 as the first entry and C=3 as the last.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/SequencedMap.html#putFirst(K,V)",
    tags: ["SequencedMap", "LinkedHashMap", "putFirst", "boundary entry"],
  }),
  mock({
    id: "MC-COLLECTIONS-02",
    domain: "collections",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: `var base = new java.util.ArrayList<>(
    java.util.List.of("A", "B", "C", "D"));
var middle = base.subList(1, 3);
middle.set(0, "X");
middle.clear();
System.out.println(base + ":" + middle);`,
    choices: [
      [
        "[A, D]:[]",
        "Correct. The sublist is a backed view; clearing it removes the current elements at base indexes 1 and 2.",
      ],
      [
        "[A, X, C, D]:[]",
        "Clearing the backed view removes X and C from base rather than merely emptying an independent list.",
      ],
      [
        "[A, B, C, D]:[]",
        "middle.set writes through to base before the same range is removed by clear.",
      ],
      [
        "The code throws UnsupportedOperationException",
        "base is a mutable ArrayList, and its subList view supports set and clear.",
      ],
    ],
    answer: ["A"],
    explanation:
      "ArrayList.subList returns a view backed by the original list. set changes B to X in base, then clear removes the view's two elements X and C. The base list becomes [A, D], and the view is empty.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html#subList(int,int)",
    tags: ["ArrayList", "subList", "backed view", "structural change"],
  }),
  mock({
    id: "MC-COLLECTIONS-03",
    domain: "collections",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: `var byLength = java.util.Comparator.comparingInt(String::length);
var words = new java.util.TreeSet<String>(byLength);
words.add("ant");
words.add("bee");
words.add("ox");
words.add("cat");
System.out.println(words.size() + ":" + words);`,
    choices: [
      [
        "4:[ox, ant, bee, cat]",
        "TreeSet does not preserve every unequal String when its comparator considers some of them equal.",
      ],
      [
        "2:[ox, ant]",
        "Correct. Only the first word of each represented length remains; ordering is by length.",
      ],
      ["2:[ant, ox]", "The comparator orders length 2 before length 3."],
      [
        "The code throws IllegalArgumentException for an inconsistent comparator",
        "TreeSet permits such a comparator, though its set equality behavior may differ from String.equals.",
      ],
    ],
    answer: ["B"],
    explanation:
      "TreeSet determines both ordering and uniqueness with compare. ant, bee, and cat all compare as zero because their lengths match, so only ant remains for length 3. ox is added for length 2 and sorts first.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/TreeSet.html",
    tags: ["TreeSet", "Comparator", "ordering", "uniqueness"],
  }),
  mock({
    id: "MC-COLLECTIONS-04",
    domain: "collections",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt:
      "Which statements about this queue are true? Select all that apply.",
    code: `java.util.Comparator<String> order =
    java.util.Comparator.comparingInt(String::length)
        .thenComparing(java.util.Comparator.naturalOrder());

var queue = new java.util.PriorityQueue<String>(order);
queue.addAll(java.util.List.of("bbb", "a", "cc", "bb"));`,
    choices: [
      [
        "queue.peek() returns a",
        "Correct. a has the shortest length and is therefore the least element under the supplied comparator.",
      ],
      [
        "Iterating queue is guaranteed to visit a, bb, cc, bbb in that order",
        "A PriorityQueue iterator has no guarantee of traversing elements in priority order.",
      ],
      [
        "Four successive remove() calls return a, bb, cc, bbb",
        "Correct. Removal follows the comparator: length first, then natural order for the two length-two strings.",
      ],
      [
        "Adding another bb is permitted and increases the queue size to five",
        "Correct. PriorityQueue permits duplicate elements, though it does not permit null.",
      ],
    ],
    answer: ["A", "C", "D"],
    explanation:
      "The comparator defines head and removal order, with natural order breaking equal-length ties. Heap iteration order is unspecified, and a priority queue may contain duplicate non-null elements.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/PriorityQueue.html",
    tags: ["PriorityQueue", "Comparator", "iterator order", "duplicates"],
  }),
  mock({
    id: "MC-COLLECTIONS-05",
    domain: "collections",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: `enum Level { LOW, MEDIUM, HIGH, CRITICAL }

var selected = java.util.EnumSet.range(
    Level.MEDIUM, Level.CRITICAL);
selected.remove(Level.HIGH);
var remaining = java.util.EnumSet.complementOf(selected);
System.out.println(selected + ":" + remaining);`,
    choices: [
      [
        "[MEDIUM, CRITICAL]:[LOW, HIGH]",
        "Correct. range is inclusive, removal leaves two values, and complementOf uses all constants of the same enum type.",
      ],
      [
        "[MEDIUM, CRITICAL]:[HIGH]",
        "The complement also includes LOW, which was never present in selected.",
      ],
      [
        "[MEDIUM]:[LOW, HIGH, CRITICAL]",
        "EnumSet.range includes both endpoints, so CRITICAL remains selected.",
      ],
      [
        "The call to range fails because the endpoints are not adjacent",
        "EnumSet.range accepts any endpoints in declaration order and includes the constants between them.",
      ],
    ],
    answer: ["A"],
    explanation:
      "The inclusive range initially contains MEDIUM, HIGH, and CRITICAL. Removing HIGH leaves MEDIUM and CRITICAL. The complement within Level is therefore LOW and HIGH; EnumSet iteration follows enum declaration order.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/EnumSet.html#range(E,E)",
    tags: ["EnumSet", "range", "complementOf", "enum order"],
  }),

  mock({
    id: "MC-STREAMS-01",
    domain: "streams",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: `int total = java.util.stream.Stream.of("1,2", "3", "4,5")
    .flatMap(group -> java.util.Arrays.stream(group.split(",")))
    .mapToInt(Integer::parseInt)
    .filter(value -> value % 2 == 1)
    .sum();
System.out.println(total);`,
    choices: [
      [
        "6",
        "This adds the even values 2 and 4 rather than the odd values retained by the filter.",
      ],
      [
        "9",
        "Correct. flatMap produces 1 through 5, and the odd values 1, 3, and 5 sum to 9.",
      ],
      ["15", "That sums every parsed value and ignores the odd-value filter."],
      [
        "The code does not compile because flatMap cannot return an array stream",
        "Arrays.stream on a String array returns Stream<String>, which is a valid flatMap result.",
      ],
    ],
    answer: ["B"],
    explanation:
      "flatMap splits and flattens the three groups into the strings 1, 2, 3, 4, and 5. mapToInt parses them without boxing in later stages, the filter keeps 1, 3, and 5, and sum returns 9.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html#flatMap(java.util.function.Function)",
    tags: ["flatMap", "mapToInt", "primitive stream", "sum"],
  }),
  mock({
    id: "MC-STREAMS-02",
    domain: "streams",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: `var result = java.util.stream.IntStream.rangeClosed(1, 7)
    .parallel()
    .boxed()
    .gather(java.util.stream.Gatherers.windowFixed(3))
    .toList();
System.out.println(result);`,
    choices: [
      [
        "[[1, 2, 3], [4, 5, 6], [7]]",
        "Correct. windowFixed emits non-overlapping encounter-order windows and includes the final partial window.",
      ],
      [
        "[[1, 2, 3], [4, 5, 6]]",
        "windowFixed emits a final partial window rather than discarding the remaining element.",
      ],
      [
        "[[1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6], [5, 6, 7]]",
        "Those are overlapping sliding windows; windowFixed creates non-overlapping windows.",
      ],
      [
        "The window order is nondeterministic because the source is parallel",
        "The ordered range has an encounter order, and the gather operation preserves the ordered window result.",
      ],
    ],
    answer: ["A"],
    explanation:
      "Gatherers.windowFixed(3) partitions the ordered elements into fixed, non-overlapping windows. Parallel execution does not make the ordered result arbitrary. The final element is emitted as a partial window.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Gatherers.html#windowFixed(int)",
    tags: ["gatherer", "windowFixed", "parallel stream", "encounter order"],
  }),
  mock({
    id: "MC-STREAMS-03",
    domain: "streams",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt: "Which statements are true? Select all that apply.",
    code: `var left = java.util.stream.Stream.of("A", "B")
    .onClose(() -> System.out.print("L"));
var right = java.util.stream.Stream.of("C")
    .onClose(() -> System.out.print("R"));

try (var joined = java.util.stream.Stream.concat(left, right)) {
  System.out.print(joined.reduce("", String::concat));
}`,
    choices: [
      [
        "The reduction prints ABC",
        "Correct. concat presents all left elements followed by all right elements.",
      ],
      [
        "The terminal operation automatically closes joined before the try block ends",
        "Terminal operations consume streams but do not generally close them automatically.",
      ],
      [
        "Closing joined invokes both input close handlers",
        "Correct. The concatenated stream's close handlers close both input streams.",
      ],
      [
        "The API guarantees that L is printed before R",
        "The concat contract guarantees invocation of both input close handlers, but it does not specify their relative order.",
      ],
    ],
    answer: ["A", "C"],
    explanation:
      "reduce concatenates the ordered elements into ABC. A terminal operation does not itself close the stream. Leaving try closes the concatenated stream and invokes both input close handlers, but Stream.concat does not specify which input handler runs first.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html#concat(java.util.stream.Stream,java.util.stream.Stream)",
    tags: ["Stream.concat", "reduce", "close handler", "try with resources"],
  }),
  mock({
    id: "MC-STREAMS-04",
    domain: "streams",
    difficulty: "Expert",
    type: "single",
    pattern: "compilation",
    prompt: "What happens when this class is compiled?",
    code: `class Targets {
  static void use(java.util.function.Predicate<String> test) { }
  static void use(java.util.function.Function<String, Boolean> fn) { }

  public static void main(String[] args) {
    use(text -> text.isEmpty());
  }
}`,
    choices: [
      [
        "Predicate is selected because isEmpty returns primitive boolean",
        "An expression lambda can adapt its result by boxing for Function<String,Boolean>, so both overloads remain applicable.",
      ],
      [
        "Function is selected because Boolean is more specific than boolean",
        "Primitive boolean and wrapper Boolean do not establish one functional-interface parameter type as more specific here.",
      ],
      [
        "Compilation fails because the invocation is ambiguous",
        "Correct. The implicitly typed expression lambda is compatible with both unrelated target functional interfaces.",
      ],
      [
        "Compilation fails because lambda expressions cannot be overloaded",
        "Methods accepting different functional-interface types may be overloaded; this particular call simply needs a cast or explicit target.",
      ],
    ],
    answer: ["C"],
    explanation:
      "The lambda is a poly expression. Its boolean result works directly for Predicate and boxes to Boolean for Function. Neither unrelated functional-interface parameter type is the unique most-specific choice, so a target cast is needed.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.27",
    tags: ["lambda", "target typing", "overload ambiguity", "boxing"],
  }),
  mock({
    id: "MC-STREAMS-05",
    domain: "streams",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt:
      "Which properties are required for this three-argument reduction to be safe and deterministic on a parallel stream? Select all that apply.",
    code: `int total = java.util.List.of(1, 2, 3, 4)
    .parallelStream()
    .reduce(
        0,
        (partial, value) -> partial + value,
        (left, right) -> left + right);
System.out.println(total);`,
    choices: [
      [
        "The combiner must be associative",
        "Correct. Parallel grouping may vary, so regrouping combined partial results must not change the outcome.",
      ],
      [
        "The identity must be neutral for the combiner",
        "Correct. Combining identity with a partial result must return that result.",
      ],
      [
        "The accumulator and combiner must be compatible",
        "Correct. Combining accumulated partitions must agree with accumulating their elements into one result.",
      ],
      [
        "The stream must preserve which worker thread processes each element",
        "Parallel reduction must not depend on worker identity or a fixed scheduling assignment.",
      ],
    ],
    answer: ["A", "B", "C"],
    explanation:
      "Parallel reduce may partition and regroup work in different ways. Its identity, accumulator, and combiner must obey the documented identity, associativity, and compatibility constraints. The shown addition reduction satisfies them and produces 10 without relying on scheduling.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html#reduce(U,java.util.function.BiFunction,java.util.function.BinaryOperator)",
    tags: [
      "parallel stream",
      "reduce",
      "identity",
      "associativity",
      "combiner",
    ],
  }),

  mock({
    id: "MC-PACKAGING-01",
    domain: "packaging",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt:
      "Which statement correctly describes the dependencies in this module descriptor?",
    code: `module report.app {
  requires static audit.annotations;
  requires transitive report.model;
  exports report.api;
}`,
    choices: [
      [
        "audit.annotations is required at compile time but is optional during run-time module resolution",
        "Correct. static makes the dependence mandatory for compilation and optional at run time.",
      ],
      [
        "Every module that requires report.app automatically reads audit.annotations",
        "Propagation to downstream modules requires transitive; static alone does not provide it.",
      ],
      [
        "report.model is optional at run time because it is transitive",
        "transitive propagates readability; it does not make the dependency optional at run time.",
      ],
      [
        "requires static permits report.app to use non-exported packages from audit.annotations",
        "Readability never bypasses another module's package export boundaries.",
      ],
    ],
    answer: ["A"],
    explanation:
      "A static dependence must be available when report.app is compiled but may be absent when modules are resolved for execution. The separate transitive dependence on report.model is required at run time and is propagated to modules that read report.app.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html#jls-7.7.1",
    tags: [
      "JPMS",
      "requires static",
      "requires transitive",
      "module resolution",
    ],
  }),
  mock({
    id: "MC-PACKAGING-02",
    domain: "packaging",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt:
      "The command uses the shown source tree. Which statements are true? Select all that apply.",
    code: `src/
  com.acme.app/
    module-info.java       // declares: module com.acme.app { }
    Main.java              // declares no package

javac --module-source-path src -d out -m com.acme.app`,
    choices: [
      [
        "The compilation fails because a named module cannot contain a type in an unnamed package",
        "Correct. Main has no package declaration, but ordinary classes in a named module must belong to named packages.",
      ],
      [
        "Declaring package com.acme.app in Main.java and placing it under com/acme/app within the module source fixes that problem",
        "Correct. The type then belongs to a named package in the module's conventional source layout.",
      ],
      [
        "module-info.java must also begin with package com.acme.app;",
        "A modular compilation unit containing a module declaration must not contain a package declaration.",
      ],
      [
        "A class compiled on the ordinary class path may belong to an unnamed package",
        "Correct. The named-module restriction does not ban unnamed-package classes from ordinary class-path code.",
      ],
    ],
    answer: ["A", "B", "D"],
    explanation:
      "Main.java cannot remain in the unnamed package when compiled as part of com.acme.app. Giving it a named package and the matching module-source layout resolves that issue. module-info.java itself has no package declaration, while class-path code may still use an unnamed package.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html#jls-7.4.2",
    tags: ["named module", "unnamed package", "module source path"],
  }),
  mock({
    id: "MC-PACKAGING-03",
    domain: "packaging",
    difficulty: "Expert",
    type: "multiple",
    pattern: "api",
    prompt:
      "Which statements about this command are true? Select all that apply.",
    code: `jdeps --print-module-deps --ignore-missing-deps app.jar`,
    choices: [
      [
        "jdeps performs static dependency analysis of the classes in app.jar",
        "Correct. It analyzes class-file references rather than running the application.",
      ],
      [
        "--print-module-deps produces a comma-separated module list designed for use with jlink --add-modules",
        "Correct. This output mode reduces the analysis to the module dependencies needed by the examined archive.",
      ],
      [
        "The command rewrites app.jar by adding the inferred requires directives",
        "jdeps reports dependencies; it does not modify the analyzed archive or synthesize its descriptor in place.",
      ],
      [
        "Dependencies reached only through reflection may require separate review",
        "Correct. Static class-file analysis cannot in general discover class names or calls assembled dynamically at run time.",
      ],
    ],
    answer: ["A", "B", "D"],
    explanation:
      "jdeps reads bytecode dependencies without executing or rewriting app.jar. Its print-module-deps output is formatted for a later jlink command. Dynamic reflective dependencies are not guaranteed to appear in static analysis and must be accounted for separately.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/specs/man/jdeps.html",
    tags: ["jdeps", "static analysis", "module dependencies", "jlink"],
  }),
  mock({
    id: "MC-PACKAGING-04",
    domain: "packaging",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt:
      "Assume jmods contains the platform modules and mods contains a compiled app module plus its dependencies. Which statements are true? Select all that apply.",
    code: `jlink --module-path jmods:mods \\
      --add-modules app \\
      --output runtime

runtime/bin/java -m app/com.acme.Main`,
    choices: [
      [
        "The image contains app and the resolved modules required by app",
        "Correct. jlink resolves the requested root module and links its module graph into the runtime image.",
      ],
      [
        "runtime/bin/java is the Java launcher supplied by the generated image",
        "Correct. A linked image includes its own launcher and runtime files.",
      ],
      [
        "jlink compiles the app source files before linking them",
        "jlink consumes observable compiled modules; javac performs source compilation.",
      ],
      [
        "The generated image is guaranteed to run unchanged on every operating system and CPU architecture",
        "A runtime image targets the platform used to create it unless an appropriate target-platform module set is supplied.",
      ],
    ],
    answer: ["A", "B"],
    explanation:
      "jlink links already compiled modules starting from app and writes a custom runtime image with its own bin/java launcher. It is a linker rather than a compiler, and runtime images are platform-specific artifacts.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/specs/man/jlink.html",
    tags: ["jlink", "runtime image", "module graph", "deployment"],
  }),
  mock({
    id: "MC-PACKAGING-05",
    domain: "packaging",
    difficulty: "Applied",
    type: "single",
    pattern: "compilation",
    prompt: "What does this Java 25 code print?",
    code: `import module java.base;
import java.sql.Date;

class Report {
  public static void main(String[] args) {
    System.out.println(Date.class == java.sql.Date.class);
  }
}`,
    choices: [
      [
        "true",
        "Correct. The explicit single-type import of java.sql.Date shadows same-named types available through the module import.",
      ],
      [
        "false",
        "That would require Date to denote a different type, such as java.util.Date, but the single-type import takes precedence.",
      ],
      [
        "Compilation fails because java.base also supplies java.util.Date",
        "A same-named type introduced on demand does not make the reference ambiguous when a single-type import supplies Date.",
      ],
      [
        "Compilation fails because module imports cannot be combined with ordinary imports",
        "A compilation unit may contain both module-import and ordinary import declarations.",
      ],
    ],
    answer: ["A"],
    explanation:
      "import module java.base makes exported public types such as java.util.Date available on demand. The explicit single-type import of java.sql.Date shadows those on-demand declarations, so both class literals denote java.sql.Date and the comparison is true.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/language/module-import-declarations.html",
    tags: ["module import", "single-type import", "shadowing", "Java 25"],
  }),

  mock({
    id: "MC-CONCURRENCY-01",
    domain: "concurrency",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: `var state = new java.util.concurrent.atomic.AtomicInteger(10);
int before = state.getAndAccumulate(3,
    (current, supplied) -> current - supplied);
int after = state.accumulateAndGet(2,
    (current, supplied) -> current * supplied);
System.out.println(before + ":" + after + ":" + state.get());`,
    choices: [
      [
        "10:14:14",
        "Correct. getAndAccumulate returns the old 10 while storing 7; accumulateAndGet then stores and returns 14.",
      ],
      [
        "7:14:14",
        "getAndAccumulate returns the value before applying its accumulator, not the newly stored value 7.",
      ],
      [
        "10:14:7",
        "accumulateAndGet both stores and returns the multiplication result, so the final state is 14.",
      ],
      [
        "10:20:20",
        "The first accumulator changes the state from 10 to 7 before the multiplication occurs.",
      ],
    ],
    answer: ["A"],
    explanation:
      "The getAnd form atomically stores 10-3 but returns the previous value 10. The andGet form then atomically stores 7*2 and returns that new value 14. A final get also observes 14.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/atomic/AtomicInteger.html#getAndAccumulate(int,java.util.function.IntBinaryOperator)",
    tags: ["AtomicInteger", "getAndAccumulate", "accumulateAndGet"],
  }),
  mock({
    id: "MC-CONCURRENCY-02",
    domain: "concurrency",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt:
      "What does this code print? Assume the enclosing method declares throws Exception.",
    code: `var pool = java.util.concurrent.Executors.newSingleThreadExecutor();
try {
  java.util.concurrent.Callable<Integer> task = () -> {
    throw new java.io.IOException("disk");
  };
  var future = pool.submit(task);
  try {
    System.out.print(future.get());
  } catch (java.util.concurrent.ExecutionException ex) {
    System.out.print(ex.getCause().getClass().getSimpleName());
  }
} finally {
  pool.shutdown();
}`,
    choices: [
      [
        "IOException",
        "Correct. Future.get wraps the task's checked exception in ExecutionException, whose cause is the original IOException.",
      ],
      [
        "ExecutionException",
        "The catch prints the cause's class, not the wrapper's class.",
      ],
      [
        "The IOException is thrown directly from future.get()",
        "get reports exceptional task completion with ExecutionException rather than declaring every possible task exception.",
      ],
      [
        "The Callable cannot throw a checked exception",
        "Callable.call declares Exception, so its lambda body may throw IOException.",
      ],
    ],
    answer: ["A"],
    explanation:
      "Callable can fail with a checked exception. The executor records that failure in the Future, and get throws ExecutionException. Its cause remains the IOException, whose simple class name is printed.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/Future.html#get()",
    tags: ["Callable", "Future", "ExecutionException", "ExecutorService"],
  }),
  mock({
    id: "MC-CONCURRENCY-03",
    domain: "concurrency",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt:
      "Which statements are true? Select all that apply. Assume the enclosing method declares throws Exception.",
    code: `try (var scheduler = java.util.concurrent.Executors
    .newSingleThreadScheduledExecutor()) {
  var future = scheduler.schedule(
      () -> "ready", 10, java.util.concurrent.TimeUnit.MILLISECONDS);
  System.out.println(future.get());
}`,
    choices: [
      [
        "The inferred type of future is ScheduledFuture<String>",
        "Correct. The value-returning lambda selects the Callable<V> overload, whose result type is ScheduledFuture<V>.",
      ],
      [
        "The task must begin exactly 10 milliseconds after schedule is called",
        "The delay is a minimum enabling delay; scheduling and execution overhead can make the actual start later.",
      ],
      [
        "future.get() waits if necessary and returns ready after successful completion",
        "Correct. Future.get blocks until a result is available and then returns the Callable's String result.",
      ],
      [
        "The code fails to compile because schedule accepts only Runnable tasks",
        "ScheduledExecutorService has both Runnable and Callable scheduling overloads.",
      ],
    ],
    answer: ["A", "C"],
    explanation:
      "The expression lambda returns a value, so schedule uses its Callable overload and returns a ScheduledFuture<String>. Ten milliseconds is the requested delay before the task becomes enabled, not an exact start-time guarantee; get waits and returns ready.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ScheduledExecutorService.html#schedule(java.util.concurrent.Callable,long,java.util.concurrent.TimeUnit)",
    tags: ["ScheduledExecutorService", "Callable", "ScheduledFuture", "delay"],
  }),
  mock({
    id: "MC-CONCURRENCY-04",
    domain: "concurrency",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt:
      "Which statements are true? Select all that apply. Assume the enclosing method declares throws Exception.",
    code: `var tasks = java.util.List.<java.util.concurrent.Callable<String>>of(
    () -> { Thread.sleep(500); return "slow"; },
    () -> "fast");

try (var executor = java.util.concurrent.Executors
        .newFixedThreadPool(2)) {
  String result = executor.invokeAny(tasks);
  System.out.println(result);
}`,
    choices: [
      [
        "invokeAny returns the result of one task that completes successfully",
        "Correct. It selects a successful result rather than returning a collection of Future objects.",
      ],
      [
        "invokeAny waits for every task to finish before returning",
        "It may return as soon as one task completes successfully; it does not need all results.",
      ],
      [
        "Tasks that have not completed when invokeAny returns are cancelled",
        "Correct. The method cancels unfinished tasks on normal or exceptional return.",
      ],
      [
        "If every task fails, invokeAny throws ExecutionException",
        "Correct. With no successfully completed task, the aggregate call reports failure with ExecutionException.",
      ],
    ],
    answer: ["A", "C", "D"],
    explanation:
      "invokeAny blocks only until it can return one successful task result. It cancels unfinished tasks as it returns. If no task succeeds, it throws ExecutionException; unlike invokeAll, it does not return one Future per submitted task.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ExecutorService.html#invokeAny(java.util.Collection)",
    tags: [
      "ExecutorService",
      "Callable",
      "invokeAny",
      "cancellation",
      "ExecutionException",
    ],
  }),
  mock({
    id: "MC-CONCURRENCY-05",
    domain: "concurrency",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: `var letters = new java.util.concurrent.CopyOnWriteArrayList<String>();
letters.add("A");
letters.add("B");
var iterator = letters.iterator();
letters.add("C");
iterator.forEachRemaining(System.out::print);
System.out.println(":" + letters);`,
    choices: [
      [
        "ABC:[A, B, C]",
        "The iterator sees a snapshot taken before C was added.",
      ],
      [
        "AB:[A, B, C]",
        "Correct. CopyOnWriteArrayList iterators traverse an immutable snapshot while the list itself contains the later addition.",
      ],
      [
        "AB:[A, B]",
        "The add succeeds and changes the current list even though it does not change the existing iterator's snapshot.",
      ],
      [
        "It throws ConcurrentModificationException",
        "Snapshot iterators are deliberately not fail-fast when the list changes.",
      ],
    ],
    answer: ["B"],
    explanation:
      "The iterator captures the array state containing A and B. Adding C copies and replaces the list's backing array, so the old iterator prints AB while the current list prints [A, B, C].",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/CopyOnWriteArrayList.html",
    tags: [
      "CopyOnWriteArrayList",
      "snapshot iterator",
      "concurrent collection",
    ],
  }),

  mock({
    id: "MC-IO-01",
    domain: "io",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt:
      "What does this code print? Assume left.txt contains planet, right.txt contains planer, and the enclosing method declares throws IOException.",
    code: `var left = java.nio.file.Path.of("left.txt");
var right = java.nio.file.Path.of("right.txt");
long different = java.nio.file.Files.mismatch(left, right);
long same = java.nio.file.Files.mismatch(left, left);
System.out.println(different + ":" + same);`,
    choices: [
      [
        "5:-1",
        "Correct. The sixth byte differs at zero-based position 5, while identical paths have no mismatch.",
      ],
      [
        "6:-1",
        "mismatch reports a zero-based byte position, so the sixth byte has index 5.",
      ],
      [
        "5:0",
        "A comparison with no differing byte returns -1, not the first position.",
      ],
      ["-1:-1", "planet and planer differ at their final byte: t versus r."],
    ],
    answer: ["A"],
    explanation:
      "Files.mismatch compares bytes and returns the zero-based position of the first difference. The strings differ at index 5. A file compared with itself has no mismatch, represented by -1.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Files.html#mismatch(java.nio.file.Path,java.nio.file.Path)",
    tags: ["Files.mismatch", "byte comparison", "NIO.2"],
  }),
  mock({
    id: "MC-IO-02",
    domain: "io",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt:
      "Assume note.txt initially contains A and the default file-system provider is used. Which statements are true? Select all that apply.",
    code: `var path = java.nio.file.Path.of("note.txt");
java.nio.file.Files.writeString(
    path,
    "B",
    java.nio.file.StandardOpenOption.CREATE,
    java.nio.file.StandardOpenOption.APPEND);`,
    choices: [
      [
        "After the call, note.txt contains AB",
        "Correct. APPEND positions each write at the end of the existing file.",
      ],
      [
        "If note.txt were missing, CREATE would allow the call to create it",
        "Correct. CREATE creates a missing file and is ignored when the file already exists.",
      ],
      [
        "Adding TRUNCATE_EXISTING would first erase A and then append B",
        "APPEND and TRUNCATE_EXISTING are an invalid option combination rather than an erase-then-append request.",
      ],
      [
        "Replacing CREATE with CREATE_NEW would throw FileAlreadyExistsException for the stated existing file",
        "Correct. CREATE_NEW requires atomic creation of a file that does not already exist.",
      ],
    ],
    answer: ["A", "B", "D"],
    explanation:
      "CREATE plus APPEND opens the existing file for writing at its end, so B follows A; CREATE would also permit a missing file to be made. CREATE_NEW rejects an existing target, and APPEND cannot be combined with TRUNCATE_EXISTING.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/StandardOpenOption.html",
    tags: ["Files.writeString", "StandardOpenOption", "APPEND", "CREATE_NEW"],
  }),
  mock({
    id: "MC-IO-03",
    domain: "io",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt:
      "What does this code print? Assume the enclosing method declares throws IOException.",
    code: `var input = new java.io.StringReader("abc");
var output = new java.io.StringWriter();
int first = input.read();
long moved = input.transferTo(output);
System.out.println((char) first + ":" + moved + ":" + output);`,
    choices: [
      [
        "a:2:bc",
        "Correct. The first read consumes a, and transferTo copies the two remaining characters b and c.",
      ],
      [
        "a:3:abc",
        "transferTo starts at the reader's current position; it does not rewind and copy the already consumed a.",
      ],
      [
        "97:2:bc",
        "Casting first to char prints a rather than the numeric character code 97.",
      ],
      [
        "a:2:abc",
        "Only characters copied by transferTo are written to output; the earlier direct read is not copied there.",
      ],
    ],
    answer: ["A"],
    explanation:
      "read consumes the first character and returns its numeric value. Reader.transferTo then copies from the current position through end of input, returning the count 2 and leaving bc in the StringWriter.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/Reader.html#transferTo(java.io.Writer)",
    tags: ["Reader", "Writer", "transferTo", "current position"],
  }),
  mock({
    id: "MC-IO-04",
    domain: "io",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What does this Java 25 code print?",
    code: `try (var reader = java.io.Reader.of("ab\\ncd")) {
  reader.mark(20);
  var lines = reader.readAllLines();
  reader.reset();

  char[] first = new char[2];
  int count = reader.read(first);
  System.out.println(lines.size() + ":" + count + ":" + new String(first));
}`,
    choices: [
      [
        "2:2:ab",
        "Correct. The adapter exposes two lines; reset returns to the mark, and the next read fills two characters with ab.",
      ],
      [
        "2:2:cd",
        "reset returns to the mark at the beginning, not to the start of the second line.",
      ],
      [
        "1:2:ab",
        "readAllLines recognizes the line terminator and returns two strings, ab and cd.",
      ],
      [
        "An IOException is thrown by reset()",
        "The Reader returned by Reader.of supports mark and reset, and the read-ahead limit is sufficient.",
      ],
    ],
    answer: ["A"],
    explanation:
      "Reader.of creates a mark-supporting reader over the five-character sequence. readAllLines returns two lines, reset restores the initial position, and read(char[]) then reads a and b.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/Reader.html#of(java.lang.CharSequence)",
    tags: ["Reader.of", "readAllLines", "mark", "reset", "Java 25"],
  }),
  mock({
    id: "MC-IO-05",
    domain: "io",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt: "Which statements about this code are true? Select all that apply.",
    code: `var bytes = new java.io.ByteArrayOutputStream();
var original = new java.util.ArrayList<String>();
original.add("A");

try (var out = new java.io.ObjectOutputStream(bytes)) {
  out.writeObject(original);
  original.add("B");
  out.writeObject(original);
}

try (var in = new java.io.ObjectInputStream(
    new java.io.ByteArrayInputStream(bytes.toByteArray()))) {
  var first = in.readObject();
  var second = in.readObject();
  // assess first and second
}`,
    choices: [
      [
        "first == second is true",
        "Correct. The second write records a back-reference to the object already written, so both reads resolve to one object.",
      ],
      [
        "Both deserialized references denote a list containing only A",
        "Correct. The first write captures the list with A; the cached second write does not serialize the later mutation.",
      ],
      [
        "The second deserialized list contains A and B because B was added before the second writeObject call",
        "ObjectOutputStream reuses its existing handle for the same object instead of automatically writing its changed state again.",
      ],
      [
        "Calling out.reset() between the writes would make the later object be written again and deserialized as a distinct list containing A and B",
        "Correct. reset discards the stream's remembered object handles, so the later write emits current state under a new handle.",
      ],
    ],
    answer: ["A", "B", "D"],
    explanation:
      "ObjectOutputStream remembers objects already written and emits back-references for repeated identities. Both reads therefore return the same deserialized [A] list. Calling reset between writes would clear that handle state and serialize the mutated list separately.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/ObjectOutputStream.html#reset()",
    tags: ["serialization", "object handle", "back reference", "reset"],
  }),

  mock({
    id: "MC-LOCALIZATION-01",
    domain: "localization",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: `var period = java.time.Period.of(1, 15, 40);
var normalized = period.normalized();
System.out.println(normalized + ":" +
    normalized.toTotalMonths());`,
    choices: [
      [
        "P2Y3M40D:27",
        "Correct. Fifteen months becomes one year and three months; normalization leaves the 40-day unit unchanged.",
      ],
      [
        "P2Y4M10D:28",
        "Period normalization does not convert days to months because month lengths vary.",
      ],
      [
        "P1Y15M40D:27",
        "toTotalMonths is 27 even before normalization, but normalized converts 15 months into one year and three months.",
      ],
      [
        "P2Y3M40D:67",
        "toTotalMonths combines only the year and month units; it does not treat 40 days as 40 additional months.",
      ],
    ],
    answer: ["A"],
    explanation:
      "Period.normalized converts the total 27 months into 2 years and 3 months while preserving the separate 40-day amount. toTotalMonths then reports 2*12+3, which is 27.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/Period.html#normalized()",
    tags: ["Period", "normalized", "toTotalMonths", "date units"],
  }),
  mock({
    id: "MC-LOCALIZATION-02",
    domain: "localization",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: `var jpy = java.util.Currency.getInstance("JPY");
var format = java.text.NumberFormat.getCurrencyInstance(java.util.Locale.US);
format.setCurrency(jpy);
System.out.println(format.getCurrency().getCurrencyCode() + ":" +
    format.getMinimumFractionDigits() + ":" +
    format.getMaximumFractionDigits());`,
    choices: [
      [
        "JPY:0:0",
        "JPY normally uses zero fraction digits, but setCurrency does not reconfigure an existing formatter's fraction-digit settings.",
      ],
      [
        "JPY:2:2",
        "Correct. The currency changes to JPY while the US currency formatter retains its existing two fraction digits.",
      ],
      [
        "USD:2:2",
        "setCurrency changes the formatter's Currency object, so getCurrency returns JPY rather than USD.",
      ],
      [
        "JPY:0:2",
        "Neither fraction-digit limit is changed automatically by setCurrency; both retain the formatter's value of 2.",
      ],
    ],
    answer: ["B"],
    explanation:
      "The Locale.US currency formatter initially uses two minimum and maximum fraction digits. NumberFormat.setCurrency changes its currency to JPY but, by specification, does not update those digit limits, producing JPY:2:2.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/text/NumberFormat.html#setCurrency(java.util.Currency)",
    tags: ["Currency", "Locale.US", "NumberFormat", "fraction digits"],
  }),
  mock({
    id: "MC-LOCALIZATION-03",
    domain: "localization",
    difficulty: "Expert",
    type: "single",
    pattern: "scenario",
    prompt:
      "What does this code print? Assume the class path contains only the two property files shown.",
    code: `// Messages_en.properties: greeting=hello
// Messages_de.properties: greeting=hallo
// No base or Japanese bundle exists.
java.util.Locale.setDefault(java.util.Locale.GERMAN);
var bundle = java.util.ResourceBundle.getBundle(
    "Messages", java.util.Locale.JAPANESE);
System.out.println(bundle.getString("greeting"));`,
    choices: [
      [
        "hello",
        "The requested Japanese candidate chain does not select an arbitrary available English bundle.",
      ],
      [
        "hallo",
        "Correct. After the Japanese lookup fails, the default-locale fallback finds Messages_de.properties.",
      ],
      [
        "greeting",
        "getString returns the value associated with the key; it does not echo a present key.",
      ],
      [
        "A MissingResourceException is thrown",
        "The German fallback bundle supplies a valid resource before lookup can fail.",
      ],
    ],
    answer: ["B"],
    explanation:
      "ResourceBundle first searches the requested Japanese candidate chain. With no Japanese or base bundle, the standard lookup falls back to the default German locale and finds Messages_de.properties, so hallo is printed.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ResourceBundle.html#getBundle(java.lang.String,java.util.Locale)",
    tags: ["ResourceBundle", "fallback", "default locale", "properties"],
  }),
  mock({
    id: "MC-LOCALIZATION-04",
    domain: "localization",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: `var symbols = java.text.DecimalFormatSymbols
    .getInstance(java.util.Locale.US);
var format = new java.text.DecimalFormat(
    "#,##0.00;(#,##0.00)", symbols);
format.setRoundingMode(java.math.RoundingMode.HALF_UP);
System.out.println(format.format(new java.math.BigDecimal("1234.5")) +
    "|" + format.format(new java.math.BigDecimal("-12.345")));`,
    choices: [
      [
        "1,234.50|(12.35)",
        "Correct. The positive subpattern groups and pads to two decimals; HALF_UP rounds the negative magnitude and the negative subpattern adds parentheses.",
      ],
      [
        "1,234.5|-12.35",
        "The pattern requires two fractional digits and explicitly formats negatives with parentheses.",
      ],
      [
        "1234.50|(12.34)",
        "The positive subpattern includes grouping, and HALF_UP rounds 12.345 to 12.35 rather than 12.34.",
      ],
      [
        "1.234,50|(12,35)",
        "Locale.US symbols use a comma for grouping and a period for the decimal separator.",
      ],
    ],
    answer: ["A"],
    explanation:
      "The positive pattern yields 1,234.50. The semicolon introduces a negative subpattern using parentheses, and HALF_UP rounds the exact BigDecimal value -12.345 to a displayed magnitude of 12.35, yielding (12.35).",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/text/DecimalFormat.html",
    tags: ["DecimalFormat", "pattern", "RoundingMode", "Locale.US"],
  }),
  mock({
    id: "MC-LOCALIZATION-05",
    domain: "localization",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: `var first = java.time.OffsetDateTime.parse(
    "2026-06-01T10:00:00+02:00");
var second = java.time.OffsetDateTime.parse(
    "2026-06-01T08:00:00Z");
System.out.println(first.equals(second) + ":" +
    first.isEqual(second) + ":" +
    first.toInstant().equals(second.toInstant()));`,
    choices: [
      [
        "false:true:true",
        "Correct. The local date-times and offsets differ, but both values identify the same instant on the time-line.",
      ],
      [
        "true:true:true",
        "OffsetDateTime.equals compares the local date-time and offset as well as the represented instant.",
      ],
      [
        "false:false:true",
        "isEqual compares positions on the time-line, so these two values are equal by that test.",
      ],
      [
        "false:true:false",
        "Converting both values to Instant removes their differing offsets and produces equal instants.",
      ],
    ],
    answer: ["A"],
    explanation:
      "10:00 at +02:00 and 08:00 at UTC are the same instant. equals is false because it also requires equal local date-time and offset. isEqual and equality after conversion to Instant compare the time-line point and are true.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/OffsetDateTime.html#isEqual(java.time.OffsetDateTime)",
    tags: ["OffsetDateTime", "offset", "Instant", "isEqual", "equals"],
  }),
];
