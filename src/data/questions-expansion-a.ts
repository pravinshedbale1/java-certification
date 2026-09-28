import type { Question } from "./questions";

/** Original, source-linked practice. Code fragments are intended to appear inside a suitable class or method. */
export const expansionAQuestions: Question[] = [
  {
    id: "AVAL-01",
    domain: "values",
    difficulty: "Foundation",
    type: "single",
    pattern: "compilation",
    prompt: "Does the final declaration compile?",
    code: `byte left = 5;
byte right = 6;
byte total = left + right;`,
    options: [
      {
        id: "A",
        text: "Yes; total is 11.",
        explanation:
          "The arithmetic value is 11, but the expression has type int and cannot be assigned to byte without a cast.",
      },
      {
        id: "B",
        text: "Yes; addition of two byte values has type byte.",
        explanation:
          "Binary numeric promotion converts both byte operands to int before addition.",
      },
      {
        id: "C",
        text: "No; left + right has type int.",
        explanation:
          "Correct. A nonconstant int expression is not implicitly narrowed to byte, even if its runtime value fits.",
      },
      {
        id: "D",
        text: "No; a byte cannot store 11.",
        explanation:
          "Eleven fits in byte. The obstacle is the expression type, not the value range.",
      },
    ],
    answer: ["C"],
    explanation:
      "Arithmetic promotion makes left + right an int expression. The variables prevent a compile-time constant narrowing conversion.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.6",
    tags: ["byte", "numeric promotion", "assignment conversion"],
  },
  {
    id: "AVAL-02",
    domain: "values",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt: "What does normalizing this Period print?",
    code: `var span = java.time.Period.of(1, 14, 3);
var normalized = span.normalized();
System.out.println(span + "|" + normalized);`,
    options: [
      {
        id: "A",
        text: "P1Y14M3D|P2Y2M3D",
        explanation:
          "Correct. Fourteen months becomes one year and two months in a new Period; the three days stay unchanged.",
      },
      {
        id: "B",
        text: "P2Y2M3D|P2Y2M3D",
        explanation:
          "normalized returns a new Period; it does not mutate span.",
      },
      {
        id: "C",
        text: "P1Y14M3D|P2Y2M",
        explanation:
          "Normalization changes years and months but preserves the day component.",
      },
      {
        id: "D",
        text: "P1Y14M3D|P1Y14M3D",
        explanation:
          "normalized folds each complete set of twelve months into a year.",
      },
    ],
    answer: ["A"],
    explanation:
      "Period.normalized combines excess months with years but leaves days untouched. Period is immutable, so span retains its original components.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/Period.html#normalized()",
    tags: ["Period", "normalization", "immutability", "date-time"],
  },
  {
    id: "AVAL-03",
    domain: "values",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt:
      "Which independent local declarations compile? Select all that apply.",
    options: [
      {
        id: "A",
        text: "var count = 1L;",
        explanation:
          "Correct. The long literal supplies a concrete initializer type, so count is inferred as long.",
      },
      {
        id: "B",
        text: "var missing = null;",
        explanation:
          "A bare null initializer supplies no denotable type for local variable inference.",
      },
      {
        id: "C",
        text: "var later;",
        explanation:
          "A var declaration requires an initializer at the declaration site.",
      },
      {
        id: "D",
        text: "var scores = new int[] {1, 2};",
        explanation:
          "Correct. The array creation expression lets var infer int[].",
      },
    ],
    answer: ["A", "D"],
    explanation:
      "Local var infers a static type from an initializer. A standalone null cannot provide that type, and omitting the initializer is illegal.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.4.1",
    tags: ["var", "type inference", "local variables"],
    objectives: ["oop-scope"],
  },
  {
    id: "AVAL-04",
    domain: "values",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed by integer division and remainder?",
    code: `System.out.println((-7 / 3) + ":" + (-7 % 3));`,
    options: [
      {
        id: "A",
        text: "-3:2",
        explanation:
          "Java integer division truncates toward zero, not toward negative infinity.",
      },
      {
        id: "B",
        text: "-2:2",
        explanation:
          "For a negative dividend, Java's remainder has the dividend's sign.",
      },
      {
        id: "C",
        text: "-3:-1",
        explanation:
          "A quotient of -3 would not satisfy the Java division identity with this remainder.",
      },
      {
        id: "D",
        text: "-2:-1",
        explanation:
          "Correct. The quotient truncates toward zero and -7 = (-2 × 3) + (-1).",
      },
    ],
    answer: ["D"],
    explanation:
      "Integer / truncates toward zero. The remainder preserves the identity dividend = quotient × divisor + remainder, so -7 % 3 is -1.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.17",
    tags: ["integer division", "remainder", "negative numbers"],
  },
  {
    id: "AVAL-05",
    domain: "values",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt:
      "Given byte b = -1, which independent expressions evaluate to true? Select all that apply.",
    options: [
      {
        id: "A",
        text: "(b >>> 1) == 2147483647",
        explanation:
          "Correct. b is promoted to the 32-bit int -1; unsigned right shift inserts a zero at the left.",
      },
      {
        id: "B",
        text: "(b >> 1) == -1",
        explanation:
          "Correct. Signed right shift propagates the sign bit of the promoted int value.",
      },
      {
        id: "C",
        text: "(b << 1) == -2",
        explanation:
          "Correct. Left shift works on the promoted int and produces -2.",
      },
      {
        id: "D",
        text: "(b >>> 1) == 127",
        explanation:
          "The operation shifts a 32-bit promoted int, not an 8-bit byte.",
      },
    ],
    answer: ["A", "B", "C"],
    explanation:
      "Each shift first promotes byte to int. Signed and unsigned right shifts differ in which bit they insert; the result type remains int.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.19",
    tags: ["shift operators", "numeric promotion", "sign extension"],
  },
  {
    id: "AVAL-06",
    domain: "values",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What happens when the comparison runs?",
    code: `Integer number = null;
System.out.println(number == 0);`,
    options: [
      {
        id: "A",
        text: "It prints false.",
        explanation:
          "This compares a boxed Integer with primitive int, so Java unboxes number before comparing.",
      },
      {
        id: "B",
        text: "It prints true.",
        explanation:
          "A null reference is not converted to the primitive value zero.",
      },
      {
        id: "C",
        text: "It throws NullPointerException.",
        explanation:
          "Correct. Unboxing the null Integer for numeric equality fails at runtime.",
      },
      {
        id: "D",
        text: "It does not compile.",
        explanation:
          "Integer and int are comparable through unboxing; the failure occurs when the null is unboxed.",
      },
    ],
    answer: ["C"],
    explanation:
      "Numeric equality unboxes the Integer operand. Unboxing a null reference throws NullPointerException before println receives a boolean.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.1.8",
    tags: ["Integer", "unboxing", "NullPointerException"],
  },
  {
    id: "AVAL-07",
    domain: "values",
    difficulty: "Foundation",
    type: "multiple",
    pattern: "api",
    prompt: "Which String expressions evaluate to true? Select all that apply.",
    options: [
      {
        id: "A",
        text: '" \\t".isBlank()',
        explanation: "Correct. A space and tab are whitespace characters.",
      },
      {
        id: "B",
        text: '" \\t".isEmpty()',
        explanation:
          "isEmpty checks length, and this String contains two characters.",
      },
      {
        id: "C",
        text: '"".isBlank()',
        explanation:
          "Correct. An empty String has no non-whitespace code points.",
      },
      {
        id: "D",
        text: '"".isEmpty()',
        explanation:
          "Correct. The empty String has length zero, which is exactly the condition checked by isEmpty.",
      },
    ],
    answer: ["A", "C", "D"],
    explanation:
      "isEmpty tests length == 0. isBlank succeeds when the String is empty or contains only whitespace.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html#isBlank()",
    tags: ["String", "isBlank", "isEmpty", "whitespace"],
  },
  {
    id: "AVAL-08",
    domain: "values",
    difficulty: "Applied",
    type: "single",
    pattern: "compilation",
    prompt: "Does the second line compile?",
    code: `int[] numbers = {1, 2};
Object[] objects = numbers;`,
    options: [
      {
        id: "A",
        text: "Yes, because every array is an Object.",
        explanation:
          "Every array is an Object, but int[] is not an Object[]; its elements are primitive ints.",
      },
      {
        id: "B",
        text: "No, because int[] is not an Object[] subtype.",
        explanation:
          "Correct. An int[] can be held in Object, but not in an array of Object references.",
      },
      {
        id: "C",
        text: "Yes, and each int element is boxed to Integer.",
        explanation:
          "Array assignment does not box individual elements or allocate a new reference array.",
      },
      {
        id: "D",
        text: "It compiles but throws ArrayStoreException.",
        explanation:
          "ArrayStoreException can arise on storing into a covariant reference array; this assignment fails at compile time.",
      },
    ],
    answer: ["B"],
    explanation:
      "Primitive arrays are reference values, but array covariance applies to reference component types. int[] is not assignment compatible with Object[].",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.10.3",
    tags: ["arrays", "primitive arrays", "subtyping"],
    objectives: ["coll-arrays"],
  },
  {
    id: "AVAL-09",
    domain: "values",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt:
      "What is printed? The conditional expression has no target type other than var inference.",
    code: `byte small = 1;
var selected = true ? small : 2;
System.out.println(((Object) selected).getClass().getSimpleName());`,
    options: [
      {
        id: "A",
        text: "Integer",
        explanation:
          "The int literal 2 is representable as byte, so this particular numeric conditional has type byte.",
      },
      {
        id: "B",
        text: "Byte",
        explanation:
          "Correct. selected is byte, and the cast to Object boxes it as Byte.",
      },
      {
        id: "C",
        text: "Object",
        explanation:
          "Casting the primitive to Object boxes it; the runtime class is the wrapper, not Object.",
      },
      {
        id: "D",
        text: "The code does not compile.",
        explanation:
          "A byte operand paired with a representable int constant is a valid numeric conditional expression.",
      },
    ],
    answer: ["B"],
    explanation:
      "For a numeric conditional with byte and a representable int constant, the conditional expression type is byte. var infers byte; the Object cast causes boxing to Byte.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.25.2",
    tags: ["conditional operator", "byte", "var", "boxing"],
  },
  {
    id: "AVAL-10",
    domain: "values",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt: "What does this time calculation print?",
    code: `var time = java.time.LocalTime.of(23, 50);
System.out.println(time.plusMinutes(20));`,
    options: [
      {
        id: "A",
        text: "00:10",
        explanation:
          "Correct. LocalTime wraps around midnight; the date is not part of this type.",
      },
      {
        id: "B",
        text: "24:10",
        explanation: "A LocalTime hour is normalized to the 0–23 clock range.",
      },
      {
        id: "C",
        text: "23:70",
        explanation: "Minute addition normalizes the hour and minute fields.",
      },
      {
        id: "D",
        text: "A DateTimeException is thrown.",
        explanation:
          "plusMinutes wraps the result within the day rather than rejecting this addition.",
      },
    ],
    answer: ["A"],
    explanation:
      "LocalTime.plusMinutes adds the amount modulo a 24-hour day. Twenty minutes after 23:50 is 00:10.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/LocalTime.html#plusMinutes(long)",
    tags: ["LocalTime", "date-time", "midnight"],
  },
  {
    id: "AFLOW-01",
    domain: "flow",
    difficulty: "Applied",
    type: "single",
    pattern: "compilation",
    prompt: "Does this switch expression compile?",
    code: `int n = 2;
int result = switch (n) {
    case 1 -> 10;
};`,
    options: [
      {
        id: "A",
        text: "Yes; result is 10.",
        explanation:
          "The selector is 2, so the sole case does not match; a switch expression still requires complete coverage.",
      },
      {
        id: "B",
        text: "Yes; result is 0.",
        explanation:
          "Switch expressions have no implicit numeric default value.",
      },
      {
        id: "C",
        text: "It compiles but throws MatchException.",
        explanation:
          "An int switch expression with only case 1 is rejected as non-exhaustive at compile time.",
      },
      {
        id: "D",
        text: "No; the switch expression is not exhaustive.",
        explanation:
          "Correct. For this int selector, another case or default is required to cover other values.",
      },
    ],
    answer: ["D"],
    explanation:
      "Every switch expression must be exhaustive. A single int case cannot cover the remaining possible values of n.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.28",
    tags: ["switch expression", "exhaustiveness", "compilation"],
  },
  {
    id: "AFLOW-02",
    domain: "flow",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed after the block switch arm executes?",
    code: `int marker = 0;
int result = switch (2) {
    case 1 -> 5;
    default -> {
        marker = 7;
        yield marker * 2;
    }
};
System.out.println(marker + ":" + result);`,
    options: [
      {
        id: "A",
        text: "7:14",
        explanation:
          "Correct. The default block changes marker and yields 14 as the expression value.",
      },
      {
        id: "B",
        text: "0:14",
        explanation:
          "The assignment to marker runs before the yield; it is not scoped to a copied variable.",
      },
      {
        id: "C",
        text: "7:7",
        explanation:
          "The block yields marker * 2 after marker becomes 7, so result is 14 rather than 7.",
      },
      {
        id: "D",
        text: "The code does not compile because a switch arm cannot be a block.",
        explanation:
          "A block arm is valid and uses yield to provide the switch expression result.",
      },
    ],
    answer: ["A"],
    explanation:
      "The default arm runs for selector 2. Its statements execute in order, and yield makes 14 the value assigned to result.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.21",
    tags: ["switch expression", "yield", "block arm"],
  },
  {
    id: "AFLOW-03",
    domain: "flow",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt:
      'Assume Object value = "go";. Which independent snippets compile? Select all that apply.',
    options: [
      {
        id: "A",
        text: "if (value instanceof String s && s.length() == 2) {}",
        explanation:
          "Correct. On the right of &&, the left pattern must have matched, so s is in scope.",
      },
      {
        id: "B",
        text: "if (value instanceof String s || s.length() == 2) {}",
        explanation:
          "On the right of ||, the pattern may have failed, so s is not definitely matched.",
      },
      {
        id: "C",
        text: "if (value instanceof String s) { System.out.print(s); }",
        explanation:
          "Correct. The true branch runs only after the String pattern matches.",
      },
      {
        id: "D",
        text: "if (value instanceof String s) {} System.out.print(s);",
        explanation:
          "After the if, control can have arrived via a failed match; s is out of scope.",
      },
    ],
    answer: ["A", "C"],
    explanation:
      "Pattern-variable scope follows control flow. s is available only where matching the instanceof pattern is guaranteed.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.3.1",
    tags: ["instanceof", "pattern variable", "flow scope", "short circuit"],
  },
  {
    id: "AFLOW-04",
    domain: "flow",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What does the nested record pattern print?",
    code: `record Point(int x, int y) {}
record Labelled(Point point) {}
Object value = new Labelled(new Point(2, 4));
if (value instanceof Labelled(Point(int x, int y))) {
    System.out.println(x + y);
}`,
    options: [
      {
        id: "A",
        text: "2",
        explanation:
          "The x component is 2, but the expression adds the second component too.",
      },
      {
        id: "B",
        text: "4",
        explanation:
          "The y component is 4, but both bound component values are added.",
      },
      {
        id: "C",
        text: "6",
        explanation:
          "Correct. Both record patterns match, binding x to 2 and y to 4.",
      },
      {
        id: "D",
        text: "The code does not compile because record patterns cannot be nested.",
        explanation:
          "Java 25 supports nested record patterns as a permanent language feature.",
      },
    ],
    answer: ["C"],
    explanation:
      "The outer pattern deconstructs Labelled, and the nested Point pattern binds the two primitive components. Their sum is 6.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.30.1",
    tags: ["record patterns", "nested patterns", "instanceof"],
  },
  {
    id: "AFLOW-05",
    domain: "flow",
    difficulty: "Foundation",
    type: "single",
    pattern: "trace",
    prompt: "What is printed after both short-circuit expressions run?",
    code: `int x = 0;
boolean first = false && ++x > 0;
boolean second = true || ++x > 0;
System.out.println(x + ":" + first + ":" + second);`,
    options: [
      {
        id: "A",
        text: "2:false:true",
        explanation:
          "Neither right operand executes: false determines && and true determines ||.",
      },
      {
        id: "B",
        text: "0:false:true",
        explanation:
          "Correct. Both operators short-circuit before either increment.",
      },
      {
        id: "C",
        text: "1:false:true",
        explanation:
          "There is no increment in either expression because both left operands determine the result.",
      },
      {
        id: "D",
        text: "0:true:false",
        explanation:
          "The left operands alone give false for && and true for ||.",
      },
    ],
    answer: ["B"],
    explanation:
      "Conditional && skips its right operand after false; conditional || skips its right operand after true. x remains zero.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.23",
    tags: ["short circuit", "logical operators", "side effects"],
  },
  {
    id: "AFLOW-06",
    domain: "flow",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt:
      "Which statements about a switch expression are true? Select all that apply.",
    options: [
      {
        id: "A",
        text: "Its cases must cover all possible selector values.",
        explanation:
          "Correct. A switch expression must be exhaustive so it can produce a result.",
      },
      {
        id: "B",
        text: "A block arm can use yield to supply its value.",
        explanation:
          "Correct. yield is the value-producing statement inside a block switch arm.",
      },
      {
        id: "C",
        text: "An arrow arm falls through into the next arm.",
        explanation:
          "Arrow switch arms do not fall through; that behavior belongs to colon-form switch statement groups.",
      },
      {
        id: "D",
        text: "A block arm uses break 7; to return integer 7.",
        explanation:
          "break with a value is not Java syntax; yield 7; supplies a switch-expression value.",
      },
    ],
    answer: ["A", "B"],
    explanation:
      "Switch expressions have complete case coverage and produce a value. Block arms use yield, and arrow arms do not fall through.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.28",
    tags: ["switch expression", "yield", "exhaustiveness"],
  },
  {
    id: "AFLOW-07",
    domain: "flow",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does this do-while loop print?",
    code: `int n = 0;
int hits = 0;
do {
    n++;
    if (n < 3) continue;
    hits++;
} while (n < 4);
System.out.println(n + ":" + hits);`,
    options: [
      {
        id: "A",
        text: "2:0",
        explanation:
          "continue still evaluates the do-while condition, so the loop continues past n = 2.",
      },
      {
        id: "B",
        text: "3:1",
        explanation:
          "The condition remains true at n = 3, so a fourth iteration occurs.",
      },
      {
        id: "C",
        text: "4:4",
        explanation:
          "hits is skipped during the first two iterations by continue.",
      },
      {
        id: "D",
        text: "4:2",
        explanation:
          "Correct. continue skips hits at n = 1 and n = 2; the final two iterations increment it.",
      },
    ],
    answer: ["D"],
    explanation:
      "A continue in do-while transfers to its condition test. The first two bodies skip hits; the last two increment it.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.13",
    tags: ["do-while", "continue", "loop tracing"],
  },
  {
    id: "AFLOW-08",
    domain: "flow",
    difficulty: "Expert",
    type: "single",
    pattern: "compilation",
    prompt: "Does this pattern switch compile?",
    code: `Object value = "x";
int result = switch (value) {
    case CharSequence text -> 1;
    case String text -> 2;
    default -> 3;
};`,
    options: [
      {
        id: "A",
        text: "Yes, and result is 1.",
        explanation:
          "That would be the first runtime match, but the later String case is already dominated and makes the switch illegal.",
      },
      {
        id: "B",
        text: "Yes, and result is 2.",
        explanation:
          "The broader CharSequence pattern appears first and would capture every String.",
      },
      {
        id: "C",
        text: "No; the String case is dominated by CharSequence.",
        explanation:
          "Correct. Every String is a CharSequence, so the second case is unreachable by pattern matching.",
      },
      {
        id: "D",
        text: "No; Object cannot be a switch selector.",
        explanation:
          "A reference-typed Object selector is permitted for a pattern switch.",
      },
    ],
    answer: ["C"],
    explanation:
      "Case dominance is a compile-time rule. A prior unconditional CharSequence pattern dominates the later, narrower String pattern.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.11.1",
    tags: ["pattern switch", "case dominance", "compilation"],
  },
  {
    id: "AFLOW-09",
    domain: "flow",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt:
      "Which statements about unnamed variables in Java 25 are true? Select all that apply.",
    options: [
      {
        id: "A",
        text: "An enhanced-for loop variable may be written as _.",
        explanation:
          "Correct. The element can be received without giving it a readable name.",
      },
      {
        id: "B",
        text: "Writing _ in an expression reads the most recently declared unnamed variable.",
        explanation:
          "An unnamed variable cannot be referred to by name in an expression.",
      },
      {
        id: "C",
        text: "A catch parameter may be written as _.",
        explanation:
          "Correct. The caught exception can be intentionally unnamed when its value is unused.",
      },
      {
        id: "D",
        text: "An unnamed variable can be reassigned later using _ = value.",
        explanation:
          "The underscore token does not denote a readable or assignable variable name.",
      },
    ],
    answer: ["A", "C"],
    explanation:
      "Underscore can declare an intentionally unused variable in supported declaration contexts such as enhanced-for and catch. It cannot be used later to read or assign that value.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.1",
    tags: ["unnamed variables", "enhanced for", "catch"],
    objectives: ["oop-scope"],
  },
  {
    id: "AFLOW-10",
    domain: "flow",
    difficulty: "Foundation",
    type: "single",
    pattern: "trace",
    prompt: "What is printed? Read the if/else structure exactly as written.",
    code: `int score = 0;
if (true)
    if (false) score = 1;
    else score = 2;
System.out.println(score);`,
    options: [
      {
        id: "A",
        text: "0",
        explanation:
          "The outer condition is true, so its nested if/else statement executes.",
      },
      {
        id: "B",
        text: "1",
        explanation:
          "The inner condition is false, so its then statement does not execute.",
      },
      {
        id: "C",
        text: "2",
        explanation:
          "Correct. The else belongs to the nearest unmatched if, the inner one.",
      },
      {
        id: "D",
        text: "The code does not compile because braces are required.",
        explanation:
          "Java permits an if statement as the body of another if without braces.",
      },
    ],
    answer: ["C"],
    explanation:
      "The dangling else rule associates an else with the nearest preceding if that can accept it. The inner false condition takes the else branch.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.9.2",
    tags: ["if else", "dangling else", "branch tracing"],
  },
  {
    id: "AOOP-01",
    domain: "oop",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does the field access and method call print?",
    code: `class Base {
    int value = 1;
    int read() { return 1; }
}
class Derived extends Base {
    int value = 2;
    @Override int read() { return 2; }
}
Base ref = new Derived();
System.out.println(ref.value + ":" + ref.read());`,
    options: [
      {
        id: "A",
        text: "1:2",
        explanation:
          "Correct. The field uses the reference type Base; the overridden method uses the runtime type Derived.",
      },
      {
        id: "B",
        text: "2:2",
        explanation:
          "Fields are hidden, not dynamically dispatched; ref.value denotes Base.value.",
      },
      {
        id: "C",
        text: "1:1",
        explanation:
          "An instance method call dispatches to the Derived override at runtime.",
      },
      {
        id: "D",
        text: "2:1",
        explanation:
          "This reverses both rules: the field is selected statically, the method dynamically.",
      },
    ],
    answer: ["A"],
    explanation:
      "Field access is resolved using the compile-time reference type, while an overridden instance method is selected using the runtime class.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.11.1",
    tags: ["field hiding", "method overriding", "dynamic dispatch"],
  },
  {
    id: "AOOP-02",
    domain: "oop",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt:
      "Which two statements about this enum are correct? Select all that apply.",
    code: `enum Level {
    LOW(1), HIGH(2);

    private final int code;
    Level(int code) { this.code = code; }
    int code() { return code; }
}`,
    options: [
      {
        id: "A",
        text: "Level.values()[1].code() returns 2.",
        explanation:
          "Correct. values returns constants in declaration order, and HIGH was constructed with code 2.",
      },
      {
        id: "B",
        text: "Client code can create another constant with new Level(3).",
        explanation:
          "Enum instances are exactly the declared constants; an enum constructor cannot be invoked directly.",
      },
      {
        id: "C",
        text: "The constructor cannot be declared public or protected.",
        explanation:
          "Correct. An enum constructor is private when no modifier appears, and public or protected enum constructors are illegal.",
      },
      {
        id: "D",
        text: "Level may explicitly extend Number while keeping these constants.",
        explanation:
          "Every enum class has java.lang.Enum as its direct superclass and cannot explicitly extend another class.",
      },
    ],
    answer: ["A", "C"],
    explanation:
      "Enum constants are constructed in declaration order through an enum-only constructor, and values preserves that order. The constructor cannot be called directly or exposed as public/protected, and the enum already extends java.lang.Enum.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.9.2",
    tags: ["enum", "constructor", "values", "inheritance"],
    objectives: ["oop-enums"],
  },
  {
    id: "AOOP-03",
    domain: "oop",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "With Java 25, what does constructing Child print?",
    code: `class Base {
    Base() { System.out.print("B"); }
}
class Child extends Base {
    int value;
    Child() {
        value = 4;
        super();
        System.out.print(value);
    }
}
new Child();`,
    options: [
      {
        id: "A",
        text: "4B",
        explanation:
          "The early field assignment prints nothing; Base constructor executes before the Child print statement.",
      },
      {
        id: "B",
        text: "B0",
        explanation:
          "The direct assignment initializes Child.value to 4 before super(), and no later initializer changes it.",
      },
      {
        id: "C",
        text: "B4",
        explanation:
          "Correct. Java 25 allows this simple own-field assignment before super(); Base prints B, then Child prints 4.",
      },
      {
        id: "D",
        text: "The code does not compile because super() is not first.",
        explanation:
          "Java 25 flexible constructor bodies permit a legal prologue before an explicit constructor invocation.",
      },
    ],
    answer: ["C"],
    explanation:
      "Java 25 permits a direct assignment to an instance field declared in the current class before super(). The superclass constructor then runs, followed by the child epilogue.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/language/flexible-constructor-bodies.html",
    tags: ["Java 25", "flexible constructors", "field initialization"],
  },
  {
    id: "AOOP-04",
    domain: "oop",
    difficulty: "Expert",
    type: "single",
    pattern: "compilation",
    prompt: "Does Child compile under Java 25?",
    code: `class Base {
    Base(int n) {}
}
class Child extends Base {
    int value;
    Child() {
        value = 4;
        super(value);
    }
}`,
    options: [
      {
        id: "A",
        text: "Yes; Base receives 4.",
        explanation:
          "A simple early assignment is allowed, but reading Child.value in the super argument is still prohibited.",
      },
      {
        id: "B",
        text: "Yes; Base receives 0.",
        explanation:
          "There is no legal early read of this instance field; compilation fails before any value is passed.",
      },
      {
        id: "C",
        text: "No; no statement may precede super().",
        explanation:
          "Java 25 allows some prologue statements, including a simple assignment to an own field.",
      },
      {
        id: "D",
        text: "No; super(value) reads the instance under construction.",
        explanation:
          "Correct. The early construction context may assign the own field but cannot read it as an argument.",
      },
    ],
    answer: ["D"],
    explanation:
      "The field write in the prologue is legal, but the value expression in super(value) reads the not-yet-constructed Child instance and is rejected.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/language/flexible-constructor-bodies.html",
    tags: ["Java 25", "flexible constructors", "early construction"],
  },
  {
    id: "AOOP-05",
    domain: "oop",
    difficulty: "Applied",
    type: "single",
    pattern: "compilation",
    prompt: "What is the result of compiling Both?",
    code: `interface Left {
    default int code() { return 1; }
}
interface Right {
    default int code() { return 2; }
}
class Both implements Left, Right {}`,
    options: [
      {
        id: "A",
        text: "It compiles; Left.code() wins.",
        explanation:
          "Neither unrelated interface has precedence over the other.",
      },
      {
        id: "B",
        text: "It compiles; Right.code() wins.",
        explanation:
          "Declaration order does not choose among conflicting default methods.",
      },
      {
        id: "C",
        text: "It fails because Both must resolve the default-method conflict.",
        explanation:
          "Correct. Both inherits two unrelated default implementations of the same method.",
      },
      {
        id: "D",
        text: "It fails because an interface cannot declare a default method.",
        explanation:
          "Interfaces can provide default instance methods; the problem is the conflict.",
      },
    ],
    answer: ["C"],
    explanation:
      "A concrete class cannot inherit two unrelated default implementations with the same signature without declaring its own resolving override.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.8.4",
    tags: ["interfaces", "default methods", "conflicts"],
  },
  {
    id: "AOOP-06",
    domain: "oop",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "Which overload is selected for null?",
    code: `static String choose(Object x) { return "Object"; }
static String choose(String x) { return "String"; }
System.out.println(choose(null));`,
    options: [
      {
        id: "A",
        text: "Object",
        explanation:
          "Both overloads accept null, but String is more specific than Object.",
      },
      {
        id: "B",
        text: "String",
        explanation:
          "Correct. The String overload is the most specific applicable method.",
      },
      {
        id: "C",
        text: "null",
        explanation:
          "The selected method returns a literal; it does not return its argument.",
      },
      {
        id: "D",
        text: "The call is ambiguous.",
        explanation:
          "String is a subtype of Object, so the two overloads have a clear most-specific choice.",
      },
    ],
    answer: ["B"],
    explanation:
      "The null literal is compatible with both reference parameter types. Overload resolution chooses choose(String) because String is more specific.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12.2.5",
    tags: ["overloading", "null", "most specific method"],
  },
  {
    id: "AOOP-07",
    domain: "oop",
    difficulty: "Expert",
    type: "multiple",
    pattern: "scenario",
    prompt:
      "A subclass overrides a public method that returns Number and declares throws IOException. Which changes are permitted in the override? Select all that apply.",
    options: [
      {
        id: "A",
        text: "Return Integer instead of Number.",
        explanation: "Correct. A covariant reference return type is permitted.",
      },
      {
        id: "B",
        text: "Change the method access from public to protected.",
        explanation:
          "An override cannot reduce access from public to protected.",
      },
      {
        id: "C",
        text: "Declare throws Exception instead of throws IOException.",
        explanation:
          "Exception is a broader checked exception and is not permitted by this override.",
      },
      {
        id: "D",
        text: "Declare no checked exceptions.",
        explanation:
          "Correct. An override may narrow or omit checked exceptions.",
      },
    ],
    answer: ["A", "D"],
    explanation:
      "Overriding allows covariant reference returns and fewer checked exceptions. It cannot weaken public access or add a broader checked exception.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.8.3",
    tags: ["overriding", "covariant return", "checked exceptions", "access"],
  },
  {
    id: "AOOP-08",
    domain: "oop",
    difficulty: "Foundation",
    type: "multiple",
    pattern: "select",
    prompt:
      "Which statements about record classes are true? Select all that apply.",
    options: [
      {
        id: "A",
        text: "A record class is implicitly final.",
        explanation: "Correct. A record cannot be extended by another class.",
      },
      {
        id: "B",
        text: "Each record component has a corresponding private final field.",
        explanation:
          "Correct. The generated state field stores the component value.",
      },
      {
        id: "C",
        text: "A record may explicitly extend an arbitrary user class.",
        explanation:
          "A record already extends java.lang.Record and cannot choose another superclass.",
      },
      {
        id: "D",
        text: "The generated accessor for a component returns void.",
        explanation:
          "An accessor returns the component value with its declared type.",
      },
    ],
    answer: ["A", "B"],
    explanation:
      "Record classes are final and define component-backed private final fields with value-returning accessors. Their superclass is java.lang.Record.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.10",
    tags: ["records", "components", "final classes"],
  },
  {
    id: "AOOP-09",
    domain: "oop",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What is printed when the first B instance is created?",
    code: `class A {
    static { System.out.print("S"); }
    { System.out.print("A"); }
    A() { System.out.print("a"); }
}
class B extends A {
    static { System.out.print("T"); }
    { System.out.print("B"); }
    B() { System.out.print("b"); }
}
new B();`,
    options: [
      {
        id: "A",
        text: "STABab",
        explanation:
          "Each class runs its own instance initializer before its own constructor body, not both initializers before both bodies.",
      },
      {
        id: "B",
        text: "AaBbST",
        explanation:
          "Superclass and subclass static initialization happens before the first instance is constructed.",
      },
      {
        id: "C",
        text: "TSBAab",
        explanation:
          "Subclass static and instance initialization do not run before their superclass counterparts.",
      },
      {
        id: "D",
        text: "STAaBb",
        explanation:
          "Correct. A and B initialize statically, then A instance initializer/constructor, then B initializer/constructor.",
      },
    ],
    answer: ["D"],
    explanation:
      "Initializing B first initializes A, producing ST. Construction then runs A's instance initializer and constructor, followed by B's initializer and constructor.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html#jls-12.5",
    tags: [
      "class initialization",
      "instance initializers",
      "constructor order",
    ],
  },
  {
    id: "AOOP-10",
    domain: "oop",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "Which overload handles the primitive int argument?",
    code: `static String pick(long n) { return "long"; }
static String pick(Integer n) { return "Integer"; }
System.out.println(pick(5));`,
    options: [
      {
        id: "A",
        text: "long",
        explanation:
          "Correct. Primitive widening is considered in the strict invocation phase before boxing is considered.",
      },
      {
        id: "B",
        text: "Integer",
        explanation:
          "The boxing overload is applicable later, after a widening primitive overload has already been found.",
      },
      {
        id: "C",
        text: "The call is ambiguous.",
        explanation:
          "Overload resolution phases select pick(long) before considering boxing.",
      },
      {
        id: "D",
        text: "The code does not compile because int cannot widen to long.",
        explanation: "int to long is a standard widening primitive conversion.",
      },
    ],
    answer: ["A"],
    explanation:
      "Java overload resolution first searches methods applicable without boxing. pick(long) accepts int by widening, so pick(Integer) is not selected.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.12.2.2",
    tags: ["overloading", "widening", "boxing", "invocation phases"],
  },
];
