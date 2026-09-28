import type { Question } from "./questions";

type Pattern = "trace" | "compilation" | "api" | "scenario" | "select";
type ExpandedQuestion = Question & { pattern: Pattern };
type OptionPair = readonly [text: string, explanation: string];
type FourOptions = readonly [OptionPair, OptionPair, OptionPair, OptionPair];

function choices(entries: FourOptions): Question["options"] {
  return entries.map(([text, explanation], index) => ({
    id: "ABCD"[index],
    text,
    explanation,
  }));
}

const expansionBItems: ExpandedQuestion[] = [
  {
    id: "BEXC-01",
    domain: "exceptions",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt:
      "What is printed when an existing effectively final resource is used?",
    code: [
      "class R implements AutoCloseable {",
      '    public void close() { System.out.print("C"); }',
      "}",
      "R resource = new R();",
      "try (resource) {",
      '    System.out.print("B");',
      "}",
      'System.out.print("A");',
    ].join("\n"),
    options: choices([
      [
        "ABC",
        "Closing happens after the try body, and A is printed only after the close completes.",
      ],
      [
        "BAC",
        "The statement after the try cannot run before the resource closes.",
      ],
      [
        "The code does not compile",
        "An existing resource variable may appear in the resource specification when it is final or effectively final.",
      ],
      [
        "BCA",
        "Correct. The body prints B, automatic close prints C, and execution then continues with A.",
      ],
    ]),
    answer: ["D"],
    explanation:
      "A final or effectively final variable can name a resource directly. Its close method runs after the try block and before the following statement, giving BCA.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20.3",
    tags: ["try-with-resources", "effectively final", "close order"],
  },
  {
    id: "BEXC-02",
    domain: "exceptions",
    difficulty: "Applied",
    type: "single",
    pattern: "compilation",
    prompt: "Does this catch sequence compile?",
    code: [
      "try {",
      "    throw new java.io.IOException();",
      "} catch (Exception e) {",
      '    System.out.print("general");',
      "} catch (java.io.IOException e) {",
      '    System.out.print("specific");',
      "}",
    ].join("\n"),
    options: choices([
      [
        "Yes; it prints general",
        "The first catch could handle the exception, but the later subtype catch is unreachable and is rejected at compile time.",
      ],
      [
        "Yes; it prints specific",
        "Catch clauses are checked from left to right; the broad Exception handler comes first.",
      ],
      [
        "No; the IOException catch is already covered",
        "Correct. Exception catches IOException, so the later IOException catch cannot be reached.",
      ],
      [
        "No; IOException cannot be thrown explicitly",
        "IOException can be constructed and thrown; the problem is the order of the catch clauses.",
      ],
    ]),
    answer: ["C"],
    explanation:
      "An earlier catch for a superclass makes a later catch for its subclass unreachable. Put the IOException handler first if both handlers are needed.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html#jls-11.2.3",
    tags: ["catch order", "reachability", "exception hierarchy"],
  },
  {
    id: "BEXC-03",
    domain: "exceptions",
    difficulty: "Applied",
    type: "single",
    pattern: "compilation",
    prompt: "What is the result of assigning to this multi-catch parameter?",
    code: [
      "try {",
      "    if (System.nanoTime() > 0) throw new java.io.IOException();",
      "    throw new java.sql.SQLException();",
      "} catch (java.io.IOException | java.sql.SQLException e) {",
      "    e = new java.io.IOException();",
      "}",
    ].join("\n"),
    options: choices([
      [
        "It compiles because IOException is one of the alternatives",
        "The assigned value's type does not remove the implicit finality of a multi-catch parameter.",
      ],
      [
        "It does not compile because e is implicitly final",
        "Correct. A parameter declared in a multi-catch clause cannot be assigned a new value.",
      ],
      [
        "It compiles but rethrows IOException",
        "The catch body contains an assignment, not a throw, and the assignment itself is illegal.",
      ],
      [
        "It does not compile because SQLException is unrelated to IOException",
        "Unrelated exception classes are valid multi-catch alternatives; related alternatives would be a problem.",
      ],
    ]),
    answer: ["B"],
    explanation:
      "A multi-catch parameter is implicitly final. Reading e is allowed, but assigning a replacement exception to e is a compile-time error.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20",
    tags: ["multi-catch", "final parameter", "compilation"],
  },
  {
    id: "BEXC-04",
    domain: "exceptions",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "Which message does the outer catch print?",
    code: [
      "try {",
      "    try {",
      '        throw new IllegalArgumentException("body");',
      "    } finally {",
      '        throw new IllegalStateException("finally");',
      "    }",
      "} catch (RuntimeException e) {",
      "    System.out.print(e.getMessage());",
      "}",
    ].join("\n"),
    options: choices([
      [
        "finally",
        "Correct. The abrupt completion of finally replaces the exception pending from the try body.",
      ],
      [
        "body",
        "The body exception would propagate only if finally completed normally.",
      ],
      [
        "body:finally",
        "Unlike try-with-resources close failures, this ordinary finally throw is not automatically attached as a suppressed exception.",
      ],
      [
        "Nothing; the code does not compile",
        "Throwing from both try and finally is legal, although it obscures the original failure.",
      ],
    ]),
    answer: ["A"],
    explanation:
      "When finally throws, its new abrupt completion replaces the pending IllegalArgumentException. The outer catch therefore receives the IllegalStateException with message finally.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20.2",
    tags: ["finally", "exception replacement", "control flow"],
  },
  {
    id: "BEXC-05",
    domain: "exceptions",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "A later resource initializer fails. What is printed?",
    code: [
      "class R implements AutoCloseable {",
      '    public void close() { System.out.print("C"); }',
      "}",
      "try (R first = new R();",
      '     R second = java.util.Objects.<R>requireNonNull(null, "init")) {',
      '    System.out.print("B");',
      "} catch (NullPointerException e) {",
      "    System.out.print(e.getMessage());",
      "}",
    ].join("\n"),
    options: choices([
      [
        "Binit",
        "The try body never starts because the second resource fails during initialization.",
      ],
      [
        "initC",
        "An already initialized resource closes before the catch clause handles the initializer's exception.",
      ],
      [
        "C",
        "The catch also prints the initializer exception's message after first is closed.",
      ],
      [
        "Cinit",
        "Correct. first closes when second fails to initialize, then the catch prints init.",
      ],
    ]),
    answer: ["D"],
    explanation:
      "Resources initialize left to right. If a later initializer throws, all resources initialized so far are closed before the exception reaches the catch clause; the body is skipped.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20.3",
    tags: ["resource initialization", "automatic close", "catch order"],
  },
  {
    id: "BEXC-06",
    domain: "exceptions",
    difficulty: "Foundation",
    type: "multiple",
    pattern: "select",
    prompt:
      "Which types can a method throw without declaring or catching them? Select all that apply.",
    options: choices([
      [
        "java.io.IOException",
        "IOException is checked, so a possible throw must be caught or declared.",
      ],
      [
        "java.lang.AssertionError",
        "Correct. Error and its subclasses are unchecked.",
      ],
      [
        "java.lang.Exception",
        "Exception itself is checked; only its RuntimeException branch is unchecked.",
      ],
      [
        "java.lang.NullPointerException",
        "Correct. NullPointerException extends RuntimeException and is unchecked.",
      ],
    ]),
    answer: ["B", "D"],
    explanation:
      "Unchecked exceptions are RuntimeException and Error subclasses. IOException and Exception are checked types and normally need a catch or throws clause.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html#jls-11.1.1",
    tags: ["checked exceptions", "unchecked exceptions", "throws"],
  },
  {
    id: "BEXC-07",
    domain: "exceptions",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt:
      "For the shown try block, which independent catch arrangements compile? Select all that apply.",
    code: [
      "try {",
      "    throw new java.io.IOException();",
      "} /* add one catch arrangement here */",
    ].join("\n"),
    options: choices([
      [
        "catch (java.io.IOException e) {}",
        "Correct. It handles the checked IOException thrown by the try block.",
      ],
      [
        "catch (Exception e) {}",
        "Correct. The superclass Exception also handles the thrown IOException.",
      ],
      [
        "catch (java.io.FileNotFoundException e) {}",
        "FileNotFoundException is narrower than the exact IOException constructed here and cannot handle that throw.",
      ],
      [
        "catch (java.io.IOException e) {} catch (Exception e) {}",
        "Correct. The specific handler precedes the general handler; Exception can still handle other possible unchecked exceptions.",
      ],
    ]),
    answer: ["A", "B", "D"],
    explanation:
      "A catch must be reachable and the checked IOException must be handled. An exact or broader handler works; a FileNotFoundException handler cannot catch a plain IOException object.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html#jls-11.2.3",
    tags: ["catch reachability", "checked exceptions", "subtyping"],
  },
  {
    id: "BEXC-08",
    domain: "exceptions",
    difficulty: "Expert",
    type: "single",
    pattern: "compilation",
    prompt:
      "Does this method compile with its two declared checked exceptions?",
    code: [
      "static void work(boolean flag)",
      "        throws java.io.IOException, java.sql.SQLException {",
      "    try {",
      "        if (flag) throw new java.io.IOException();",
      "        throw new java.sql.SQLException();",
      "    } catch (Exception e) {",
      "        throw e;",
      "    }",
      "}",
    ].join("\n"),
    options: choices([
      [
        "No; catch (Exception e) always requires throws Exception",
        "Precise rethrow can infer the checked types thrown by the try block when e is effectively final.",
      ],
      [
        "No; multi-catch is mandatory for precise rethrow",
        "A single catch parameter can receive precise rethrow analysis; multi-catch is not required.",
      ],
      [
        "Yes; e is effectively final and only those two checked types can leave the try",
        "Correct. Precise rethrow permits IOException and SQLException in the method's throws clause.",
      ],
      [
        "Yes; all Exception subclasses are unchecked inside catch",
        "IOException and SQLException remain checked exceptions; compilation succeeds because they are declared precisely.",
      ],
    ]),
    answer: ["C"],
    explanation:
      "Because e is not reassigned, Java's precise rethrow analysis treats throw e as capable of throwing the checked exceptions from this try block. The method declares both types.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-11.html#jls-11.2.2",
    tags: ["precise rethrow", "effectively final", "throws analysis"],
  },
  {
    id: "BEXC-09",
    domain: "exceptions",
    difficulty: "Applied",
    type: "single",
    pattern: "scenario",
    prompt:
      "What happens when an Error is thrown with an Exception catch and a finally block?",
    code: [
      "try {",
      '    throw new AssertionError("boom");',
      "} catch (Exception e) {",
      '    System.out.print("caught");',
      "} finally {",
      '    System.out.print("F");',
      "}",
    ].join("\n"),
    options: choices([
      [
        "It prints caughtF and completes normally",
        "AssertionError extends Error, not Exception, so this catch does not handle it.",
      ],
      [
        "It prints F, then AssertionError escapes",
        "Correct. The catch does not match, but finally runs during propagation.",
      ],
      [
        "It prints nothing because Error bypasses finally",
        "finally executes during abrupt completion even when no catch handles the thrown value.",
      ],
      [
        "The code does not compile because Error is unchecked",
        "Unchecked errors may be thrown without a declaration, and this try/catch/finally syntax is valid.",
      ],
    ]),
    answer: ["B"],
    explanation:
      "AssertionError is an Error, so catch (Exception) does not catch it. The finally block still prints F before the error continues outward.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20.2",
    tags: ["Error hierarchy", "finally", "propagation"],
  },
  {
    id: "BEXC-10",
    domain: "exceptions",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt:
      "Given Quiet below, which independent method bodies compile without catch or throws? Select all that apply.",
    code: [
      "class Quiet implements AutoCloseable {",
      "    public void close() {}",
      "}",
    ].join("\n"),
    options: choices([
      [
        "try (AutoCloseable r = new Quiet()) {}",
        "The variable's declared type is AutoCloseable, whose close() declares Exception, so handling is required.",
      ],
      [
        "try (java.io.Closeable r = () -> {}) {}",
        "Closeable.close() declares IOException, so this declared type still requires catch or throws.",
      ],
      [
        "try (Quiet r = new Quiet()) {}",
        "Correct. Quiet.close() declares no checked exception, and the resource's static type is Quiet.",
      ],
      [
        "try (var r = new Quiet()) {}",
        "Correct. var infers Quiet, whose close() declaration does not throw a checked exception.",
      ],
    ]),
    answer: ["C", "D"],
    explanation:
      "Checked-exception analysis uses the resource variable's static type. AutoCloseable and Closeable declare checked close exceptions, while Quiet's overriding close method declares none.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20.3",
    tags: ["AutoCloseable", "static type", "checked close exception"],
  },
  {
    id: "BCOL-01",
    domain: "collections",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: [
      'String[] array = {"a", "b"};',
      "var list = java.util.Arrays.asList(array);",
      'list.set(0, "x");',
      "System.out.print(array[0]);",
    ].join("\n"),
    options: choices([
      [
        "a",
        "Arrays.asList returns a view backed by the given array, so set changes array[0].",
      ],
      ["x", "Correct. The fixed-size list and array share their elements."],
      [
        "null",
        "No element is removed or cleared; set replaces the first value with x.",
      ],
      [
        "It throws UnsupportedOperationException",
        "The list does not support structural changes such as add, but it supports set.",
      ],
    ]),
    answer: ["B"],
    explanation:
      "Arrays.asList creates a fixed-size list backed by the specified array. Replacing an element through set also replaces the array element.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Arrays.html#asList(T...)",
    tags: ["Arrays.asList", "backed view", "fixed size"],
  },
  {
    id: "BCOL-02",
    domain: "collections",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt:
      "For a mutable source list containing non-null strings, which statements about List.copyOf(source) are guaranteed? Select all that apply.",
    options: choices([
      [
        "The returned list cannot be modified through add or set",
        "Correct. List.copyOf returns an unmodifiable list.",
      ],
      [
        "The returned list has the source's iteration order at the time of the call",
        "Correct. It contains the elements in their source iteration order.",
      ],
      [
        "Later replacements in the source list appear in the returned list",
        "List.copyOf is not a live view of the mutable source list.",
      ],
      [
        "Passing a source list containing null throws NullPointerException",
        "Correct. List.copyOf disallows null elements.",
      ],
    ]),
    answer: ["A", "B", "D"],
    explanation:
      "List.copyOf makes an unmodifiable list from the source's elements in iteration order and rejects nulls. Subsequent source list mutations are not reflected in this copy.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#copyOf(java.util.Collection)",
    tags: ["List.copyOf", "unmodifiable", "null", "snapshot"],
  },
  {
    id: "BCOL-03",
    domain: "collections",
    difficulty: "Foundation",
    type: "single",
    pattern: "trace",
    prompt: "What happens when this expression runs?",
    code: 'var map = java.util.Map.of("k", 1, "k", 2);',
    options: choices([
      [
        "A map containing k=2 is created",
        "Map.of rejects duplicate keys rather than keeping the later value.",
      ],
      [
        "A map containing k=1 is created",
        "Map.of rejects duplicate keys rather than keeping the earlier value.",
      ],
      [
        "It fails compilation because the key literals match",
        "Duplicate keys are detected when the factory method executes; the expression is syntactically valid.",
      ],
      [
        "It throws IllegalArgumentException",
        "Correct. A Map.of factory call rejects duplicate keys at runtime.",
      ],
    ]),
    answer: ["D"],
    explanation:
      "Map.of does not choose between duplicate key/value pairs. A duplicate key causes IllegalArgumentException when the factory is invoked.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html#of(K,V,K,V)",
    tags: ["Map.of", "duplicate keys", "factory methods"],
  },
  {
    id: "BCOL-04",
    domain: "collections",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt: "What does this TreeSet example print?",
    code: [
      "var words = new java.util.TreeSet<String>(",
      "    java.util.Comparator.comparingInt(String::length));",
      'words.add("a");',
      'words.add("b");',
      'words.add("cc");',
      'System.out.print(words.size() + ":" + words.contains("b"));',
    ].join("\n"),
    options: choices([
      [
        "3:true",
        "The comparator regards a and b as equal because both have length one, so one insertion is rejected.",
      ],
      [
        "2:false",
        "contains uses the set's comparator; b compares as equal to the stored a.",
      ],
      [
        "2:true",
        "Correct. Only one one-character string is stored, yet contains(b) is true under this comparator.",
      ],
      [
        "1:false",
        "cc has a different length and is stored as a second element.",
      ],
    ]),
    answer: ["C"],
    explanation:
      "TreeSet determines element uniqueness and lookup using its ordering. The length comparator equates a and b, while cc has a different key under that ordering.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/TreeSet.html",
    tags: ["TreeSet", "comparator consistency", "set membership"],
  },
  {
    id: "BCOL-05",
    domain: "collections",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "Which list is printed after the sort?",
    code: [
      "var words = new java.util.ArrayList<>(",
      '    java.util.List.of("bb", "b", "aa", "a"));',
      "words.sort(java.util.Comparator.comparingInt(String::length)",
      "    .thenComparing(java.util.Comparator.naturalOrder()));",
      "System.out.print(words);",
    ].join("\n"),
    options: choices([
      [
        "[a, b, aa, bb]",
        "Correct. Length sorts first; natural order breaks each length tie.",
      ],
      [
        "[aa, bb, a, b]",
        "That puts longer strings first, opposite the ascending length comparison.",
      ],
      [
        "[a, aa, b, bb]",
        "That is global lexicographic order, whereas length is the primary comparison.",
      ],
      [
        "[b, a, bb, aa]",
        "The tie-break comparator places a before b and aa before bb.",
      ],
    ]),
    answer: ["A"],
    explanation:
      "comparingInt(String::length) orders by ascending length. thenComparing applies natural String order when lengths are equal.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Comparator.html#thenComparing(java.util.Comparator)",
    tags: ["Comparator", "thenComparing", "sort"],
  },
  {
    id: "BCOL-06",
    domain: "collections",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What happens at the assignment to values[0]?",
    code: ["Number[] values = new Integer[1];", "values[0] = 3.5;"].join("\n"),
    options: choices([
      [
        "The assignment stores the Double value",
        "The actual array component type is Integer, even though its reference type is Number[].",
      ],
      [
        "It throws ArrayStoreException",
        "Correct. A Double cannot be stored in an Integer array.",
      ],
      [
        "It fails compilation because arrays are invariant",
        "Java arrays are covariant; this assignment compiles and the store is checked at runtime.",
      ],
      [
        "It throws ClassCastException",
        "An incompatible array component store is reported as ArrayStoreException.",
      ],
    ]),
    answer: ["B"],
    explanation:
      "An Integer[] can be assigned to Number[], but every element store is checked against the runtime component type, Integer in this case.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-10.html#jls-10.5",
    tags: ["array covariance", "ArrayStoreException", "runtime type"],
  },
  {
    id: "BCOL-07",
    domain: "collections",
    difficulty: "Expert",
    type: "multiple",
    pattern: "compilation",
    prompt:
      "Given nums below, which independent statements compile? Select all that apply.",
    code: "java.util.List<? extends Number> nums = new java.util.ArrayList<Integer>();",
    options: choices([
      [
        "Number n = nums.get(0);",
        "Correct. A captured subtype of Number can be read as Number.",
      ],
      [
        "nums.add(1);",
        "The captured element type might be a different subtype of Number; adding Integer is unsafe.",
      ],
      [
        "nums.add(null);",
        "Correct. null can be added to a reference-typed list regardless of this upper bound.",
      ],
      [
        "Object n = nums.get(0);",
        "Correct. Every Number read from the list is also an Object.",
      ],
    ]),
    answer: ["A", "C", "D"],
    explanation:
      "An extends wildcard supports reading values as its upper bound or supertypes. It prevents insertion of a concrete Number subtype because the captured element type is unknown; null is allowed.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.5.1",
    tags: ["generics", "extends wildcard", "capture"],
  },
  {
    id: "BCOL-08",
    domain: "collections",
    difficulty: "Expert",
    type: "multiple",
    pattern: "compilation",
    prompt:
      "Given sink below, which independent statements compile? Select all that apply.",
    code: "java.util.List<? super Integer> sink = new java.util.ArrayList<Number>();",
    options: choices([
      [
        "sink.add(3);",
        "Correct. Integer is compatible with any possible lower-bounded element type.",
      ],
      [
        "sink.add(3.14);",
        "A Double is not necessarily compatible with a list whose element type might be Integer.",
      ],
      [
        "Integer x = sink.get(0);",
        "A value read from a super wildcard might be a Number or Object, so it cannot be assigned to Integer.",
      ],
      [
        "Object x = sink.get(0);",
        "Correct. Any reference read from the list can be assigned to Object.",
      ],
    ]),
    answer: ["A", "D"],
    explanation:
      "A super wildcard permits writing Integer values, but reading yields only Object without a cast. It does not permit adding arbitrary Number subtypes.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-4.html#jls-4.5.1",
    tags: ["generics", "super wildcard", "capture"],
  },
  {
    id: "BCOL-09",
    domain: "collections",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed after the source list changes?",
    code: [
      'var source = new java.util.ArrayList<>(java.util.List.of("old"));',
      "var view = java.util.Collections.unmodifiableList(source);",
      "var copy = java.util.List.copyOf(source);",
      'source.set(0, "new");',
      'System.out.print(view.get(0) + ":" + copy.get(0));',
    ].join("\n"),
    options: choices([
      [
        "old:old",
        "The unmodifiable view reads from the backing source, which has changed.",
      ],
      [
        "new:new",
        "List.copyOf creates an unmodifiable copy of these elements, not a live view.",
      ],
      [
        "new:old",
        "Correct. The view sees the source replacement; the copy retains its original element.",
      ],
      [
        "It throws UnsupportedOperationException",
        "The code mutates source directly, not either unmodifiable list.",
      ],
    ]),
    answer: ["C"],
    explanation:
      "Collections.unmodifiableList returns an unmodifiable view of its backing list. List.copyOf captures this source's elements at call time.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Collections.html#unmodifiableList(java.util.List)",
    tags: ["unmodifiable view", "List.copyOf", "backing collection"],
  },
  {
    id: "BCOL-10",
    domain: "collections",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does this map print?",
    code: [
      "var counts = new java.util.HashMap<String, Integer>();",
      'counts.put("a", 2);',
      'counts.merge("a", 3, Integer::sum);',
      'counts.merge("b", 4, Integer::sum);',
      'System.out.print(counts.get("a") + ":" + counts.get("b"));',
    ].join("\n"),
    options: choices([
      [
        "2:4",
        "For existing a, merge applies the remapping function and updates 2 to 5.",
      ],
      [
        "3:4",
        "For existing a, the supplied 3 is combined with 2 rather than replacing it.",
      ],
      [
        "5:4",
        "Correct. Existing a combines 2 and 3; absent b receives 4 directly.",
      ],
      [
        "5:null",
        "An absent key is associated with the supplied non-null value 4.",
      ],
    ]),
    answer: ["C"],
    explanation:
      "Map.merge inserts the supplied value for an absent key and applies the remapping function to an existing non-null value. Here a becomes 5 and b becomes 4.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Map.html#merge(K,V,java.util.function.BiFunction)",
    tags: ["Map.merge", "remapping", "missing key"],
  },
  {
    id: "BSTR-01",
    domain: "streams",
    difficulty: "Foundation",
    type: "single",
    pattern: "trace",
    prompt: "What does this code print?",
    code: [
      "java.util.stream.Stream.of(1, 2, 3)",
      "    .map(n -> { System.out.print(n); return n * 2; });",
      'System.out.print("ready");',
    ].join("\n"),
    options: choices([
      [
        "123ready",
        "map is intermediate and its mapper need not run without a terminal operation.",
      ],
      [
        "ready123",
        "No terminal operation consumes the mapped stream after ready prints.",
      ],
      [
        "ready",
        "Correct. Building this lazy pipeline invokes none of its map callbacks.",
      ],
      [
        "It fails compilation because the stream is unused",
        "Java permits an ignored expression statement when it is a method invocation.",
      ],
    ]),
    answer: ["C"],
    explanation:
      "Intermediate stream operations such as map are lazy. With no terminal operation, this pipeline does no element processing and only the separate print executes.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/package-summary.html",
    tags: ["laziness", "intermediate operation", "map"],
  },
  {
    id: "BSTR-02",
    domain: "streams",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt:
      "Which stream-use rule is correct after a terminal operation has consumed a stream?",
    options: choices([
      [
        "The same stream can be restarted by invoking parallel()",
        "parallel changes a pipeline's execution mode; it does not reset a consumed stream.",
      ],
      [
        "The same stream can be consumed again if its source is a List",
        "A reusable List source can create a new stream, but the old stream itself cannot be reused.",
      ],
      [
        "The same stream must be closed before another terminal operation",
        "Closing a consumed stream does not make that stream reusable.",
      ],
      [
        "Create a new stream from the source for another traversal",
        "Correct. Streams are consumable; a new stream is needed for another traversal.",
      ],
    ]),
    answer: ["D"],
    explanation:
      "A stream should be operated on only once. To run a second pipeline over a reusable source, request a fresh stream from that source.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html",
    tags: ["stream reuse", "terminal operation", "source"],
  },
  {
    id: "BSTR-03",
    domain: "streams",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What value is printed?",
    code: [
      "double result = java.util.stream.IntStream.rangeClosed(1, 3)",
      "    .average().orElse(-1);",
      "System.out.print(result);",
    ].join("\n"),
    options: choices([
      [
        "2.0",
        "Correct. rangeClosed includes 1, 2, and 3; their average is 2.0.",
      ],
      [
        "1.5",
        "That would be the average of 1 and 2; rangeClosed includes the upper endpoint 3.",
      ],
      [
        "-1.0",
        "orElse is used only for an empty OptionalDouble; this stream has three values.",
      ],
      [
        "2",
        "The result is a double, so println-style conversion displays 2.0.",
      ],
    ]),
    answer: ["A"],
    explanation:
      "IntStream.rangeClosed includes both endpoints. average returns an OptionalDouble containing 2.0, so the fallback is unused.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/IntStream.html#rangeClosed(int,int)",
    tags: ["IntStream", "rangeClosed", "OptionalDouble"],
  },
  {
    id: "BSTR-04",
    domain: "streams",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt:
      "After collecting an empty stream with partitioningBy below, which statements are true? Select all that apply.",
    code: [
      "var groups = java.util.stream.Stream.<Integer>empty()",
      "    .collect(java.util.stream.Collectors.partitioningBy(n -> n > 0));",
    ].join("\n"),
    options: choices([
      [
        "groups.containsKey(true) is true",
        "Correct. partitioningBy always creates a true partition, even when no elements match.",
      ],
      [
        "groups.containsKey(false) is true",
        "Correct. The false partition is also present for an empty input.",
      ],
      [
        "groups.get(true).isEmpty() is true",
        "Correct. No source elements exist to populate either partition.",
      ],
      [
        "groups.size() is 0",
        "The result always has both Boolean keys, so its size is 2.",
      ],
    ]),
    answer: ["A", "B", "C"],
    explanation:
      "Collectors.partitioningBy returns a map with both Boolean keys. For an empty stream, both corresponding lists are empty.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Collectors.html#partitioningBy(java.util.function.Predicate)",
    tags: ["partitioningBy", "empty stream", "collector"],
  },
  {
    id: "BSTR-05",
    domain: "streams",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What happens when this pipeline collects?",
    code: [
      'var result = java.util.stream.Stream.of("ant", "ape")',
      "    .collect(java.util.stream.Collectors.toMap(",
      "        String::length, s -> s));",
    ].join("\n"),
    options: choices([
      [
        "The second word replaces the first",
        "The two-argument toMap collector has no replacement merge policy.",
      ],
      [
        "The first word remains",
        "The two-argument toMap collector does not silently keep the first duplicate key.",
      ],
      [
        "It throws IllegalStateException",
        "Correct. Both strings map to key 3 and there is no merge function.",
      ],
      [
        "It fails compilation because String::length is not a key mapper",
        "String::length is a valid function from String to Integer.",
      ],
    ]),
    answer: ["C"],
    explanation:
      "Both elements produce map key 3. The toMap overload without a merge function throws IllegalStateException for a duplicate key.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Collectors.html#toMap(java.util.function.Function,java.util.function.Function)",
    tags: ["toMap", "duplicate key", "collector failure"],
  },
  {
    id: "BSTR-06",
    domain: "streams",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does result.get(3) contain?",
    code: [
      'var result = java.util.stream.Stream.of("ant", "ape")',
      "    .collect(java.util.stream.Collectors.toMap(",
      '        String::length, s -> s, (left, right) -> left + "+" + right));',
    ].join("\n"),
    options: choices([
      [
        "ant+ape",
        "Correct. The merge function combines values for the common key 3 in encounter order here.",
      ],
      [
        "ape+ant",
        "For this sequential ordered stream, ant is accumulated before ape.",
      ],
      [
        "ape",
        "The supplied merge function concatenates rather than replacing the existing value.",
      ],
      [
        "An IllegalStateException is thrown",
        "This toMap overload has a merge function to resolve duplicate keys.",
      ],
    ]),
    answer: ["A"],
    explanation:
      "Both words have length 3. The three-argument toMap collector resolves that collision with its merge function, yielding ant+ape for this ordered sequential input.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Collectors.html#toMap(java.util.function.Function,java.util.function.Function,java.util.function.BinaryOperator)",
    tags: ["toMap", "merge function", "encounter order"],
  },
  {
    id: "BSTR-07",
    domain: "streams",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt:
      "Given groups below, which independent statements are true? Select all that apply.",
    code: [
      "var groups = java.util.List.of(",
      '    java.util.List.of("a", "b"), java.util.List.of("c"));',
    ].join("\n"),
    options: choices([
      [
        "groups.stream().flatMap(java.util.List::stream).count() is 3",
        "Correct. flatMap concatenates the inner element streams into one stream of three strings.",
      ],
      [
        "groups.stream().map(java.util.List::stream).count() is 2",
        "Correct. map preserves the two outer elements. count may derive the known size without invoking the mapper.",
      ],
      [
        'groups.stream().flatMap(java.util.List::stream).toList().equals(java.util.List.of("a", "b", "c")) is true',
        "Correct. flatMap preserves the ordered outer and inner encounter orders here.",
      ],
      [
        "groups.stream().map(java.util.List::stream).toList() has type List<String>",
        "map creates a Stream<Stream<String>>, whose toList result is List<Stream<String>>.",
      ],
    ]),
    answer: ["A", "B", "C"],
    explanation:
      "map preserves the outer element count and conceptually changes each element into a stream; count can skip that mapping when the size is known. flatMap yields a flat ordered stream of three strings.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html#flatMap(java.util.function.Function)",
    tags: ["map", "flatMap", "count", "pipeline optimization"],
  },
  {
    id: "BSTR-08",
    domain: "streams",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt:
      "Which statements about an ordered stream changed to parallel with parallel() are guaranteed? Select all that apply.",
    options: choices([
      [
        "forEachOrdered performs its action in encounter order",
        "Correct. forEachOrdered respects encounter order when one exists, including in parallel pipelines.",
      ],
      [
        "forEach does not guarantee encounter-order action execution",
        "Correct. forEach is explicitly nondeterministic for parallel pipelines.",
      ],
      [
        "forEachOrdered guarantees all actions run on the calling thread",
        "The API promises action ordering, not execution on a particular thread.",
      ],
      [
        "isParallel() reports true on the resulting stream",
        "Correct. parallel() returns a parallel stream.",
      ],
    ]),
    answer: ["A", "B", "D"],
    explanation:
      "parallel() sets the stream's execution mode. forEachOrdered preserves action order on ordered streams; forEach offers no such ordering guarantee, and neither operation promises a particular worker thread.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html#forEachOrdered(java.util.function.Consumer)",
    tags: ["parallel stream", "forEachOrdered", "encounter order"],
    objectives: ["stream-parallel"],
  },
  {
    id: "BSTR-09",
    domain: "streams",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is the resulting list?",
    code: [
      "var result = java.util.stream.Stream.of(1, 2, 3, 1)",
      "    .dropWhile(n -> n < 3).toList();",
    ].join("\n"),
    options: choices([
      [
        "[3, 1]",
        "Correct. dropWhile removes only the longest matching prefix, then retains the remainder.",
      ],
      [
        "[3]",
        "The final 1 remains because dropping stops at the first element that fails the predicate.",
      ],
      [
        "[1, 2, 1]",
        "That filters out 3; dropWhile removes the initial 1 and 2 instead.",
      ],
      [
        "[1]",
        "The predicate is applied to the initial prefix, not as a global filter retaining only small values.",
      ],
    ]),
    answer: ["A"],
    explanation:
      "For an ordered stream, dropWhile discards the longest prefix that matches its predicate. After 3 breaks the prefix, the later 1 remains.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Stream.html#dropWhile(java.util.function.Predicate)",
    tags: ["dropWhile", "ordered stream", "prefix"],
  },
  {
    id: "BSTR-10",
    domain: "streams",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt:
      "For this Java 25 gatherer pipeline, which statements are true? Select all that apply.",
    code: [
      "var windows = java.util.stream.Stream.of(1, 2)",
      "    .gather(java.util.stream.Gatherers.windowSliding(3)).toList();",
    ].join("\n"),
    options: choices([
      [
        "windows.size() is 1",
        "Correct. When the input is shorter than the window size, windowSliding emits exactly one window.",
      ],
      [
        "windows.get(0).equals(java.util.List.of(1, 2)) is true",
        "Correct. The lone partial window contains both input elements in encounter order.",
      ],
      [
        "windows contains two singleton windows",
        "A short input produces one partial window containing all elements, not a window per element.",
      ],
      [
        "windows.get(0).add(3) throws UnsupportedOperationException",
        "Correct. The produced window is an unmodifiable List.",
      ],
    ]),
    answer: ["A", "B", "D"],
    explanation:
      "Gatherers.windowSliding emits exactly one partial window when a nonempty input has fewer elements than the requested window size. Its emitted windows are unmodifiable.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Gatherers.html#windowSliding(int)",
    tags: ["gatherer", "windowSliding", "partial window", "unmodifiable"],
  },
];

export const expansionBQuestions: Question[] = expansionBItems;
