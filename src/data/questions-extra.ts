import type { Question } from "./questions";

/** Additional original Java SE 25 practice items. All examples use permanent language/API features. */
export const extraQuestions: Question[] = [
  {
    id: "XVAL-01",
    domain: "values",
    difficulty: "Applied",
    type: "single",
    prompt: "What does this wrapper and Math expression print?",
    code: `Integer minimum = Integer.MIN_VALUE;
System.out.println(Math.abs(minimum));`,
    options: [
      {
        id: "A",
        text: "-2147483648",
        explanation:
          "Correct. The Integer is unboxed, and the positive magnitude is outside the int range, so Math.abs(int) returns the same negative value.",
      },
      {
        id: "B",
        text: "2147483648",
        explanation:
          "That positive number is one greater than Integer.MAX_VALUE and cannot be an int result.",
      },
      {
        id: "C",
        text: "2147483647",
        explanation: "Math.abs does not clamp the result to Integer.MAX_VALUE.",
      },
      {
        id: "D",
        text: "An ArithmeticException is thrown",
        explanation:
          "Math.absExact would throw on this argument; Math.abs does not.",
      },
    ],
    answer: ["A"],
    explanation:
      "The Integer argument is unboxed to int. The mathematical absolute value of Integer.MIN_VALUE is 2^31, which is not representable as int, so Math.abs(int) returns Integer.MIN_VALUE.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Math.html#abs(int)",
    tags: ["wrappers", "unboxing", "Math.abs", "overflow"],
  },
  {
    id: "XVAL-02",
    domain: "values",
    difficulty: "Applied",
    type: "single",
    prompt: "What length is printed by this text block?",
    code: `String text = """
    red
    blue
    """;
System.out.println(text.length());`,
    options: [
      { id: "A", text: "7", explanation: "This omits both line terminators." },
      {
        id: "B",
        text: "8",
        explanation:
          "A text block with the closing delimiter on its own line includes the final newline too.",
      },
      {
        id: "C",
        text: "9",
        explanation:
          "Correct. The value is red, newline, blue, newline: 3 + 1 + 4 + 1 characters.",
      },
      {
        id: "D",
        text: "The code does not compile",
        explanation:
          "The opening delimiter is followed by a line terminator, so this is valid text-block syntax.",
      },
    ],
    answer: ["C"],
    explanation:
      'The common incidental indentation is removed. Because the closing delimiter is on its own line, the text block is equivalent to "red\\nblue\\n", whose length is 9.',
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/language/text-blocks.html",
    tags: ["text blocks", "incidental indentation", "trailing newline"],
  },
  {
    id: "XFLOW-01",
    domain: "flow",
    difficulty: "Foundation",
    type: "single",
    prompt: "What does this traditional switch statement print?",
    code: `int level = 1;
switch (level) {
    case 1: System.out.print("A");
    case 2: System.out.print("B"); break;
    default: System.out.print("C");
}`,
    options: [
      {
        id: "A",
        text: "A",
        explanation:
          "There is no break after case 1, so execution continues into case 2.",
      },
      {
        id: "B",
        text: "AB",
        explanation:
          "Correct. After matching case 1, execution falls through to case 2 and then breaks.",
      },
      {
        id: "C",
        text: "ABC",
        explanation: "The break in case 2 prevents execution of default.",
      },
      {
        id: "D",
        text: "The code does not compile",
        explanation: "Colon-style switch statement labels permit fall-through.",
      },
    ],
    answer: ["B"],
    explanation:
      "A switch statement using colon labels continues through later statement groups until a break or the end of the switch. Case 1 prints A, then case 2 prints B and breaks.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.11.3",
    tags: ["switch statement", "fall-through", "break"],
  },
  {
    id: "XFLOW-02",
    domain: "flow",
    difficulty: "Applied",
    type: "single",
    prompt:
      "What happens in Java 25? The loop variable is intentionally unused.",
    code: `int count = 0;
for (var _ : java.util.List.of("a", "b", "c")) {
    count++;
}
System.out.println(count);`,
    options: [
      {
        id: "A",
        text: "It prints 3",
        explanation:
          "Correct. An underscore can declare an unnamed enhanced-for variable, and the body runs once per element.",
      },
      {
        id: "B",
        text: "It prints 0",
        explanation: "The unnamed variable does not suppress loop iterations.",
      },
      {
        id: "C",
        text: "It does not compile because _ is a keyword",
        explanation:
          "An underscore is permitted as an unnamed variable declaration in this context, though it cannot be referenced by name.",
      },
      {
        id: "D",
        text: "It needs --enable-preview",
        explanation:
          "Unnamed variables and patterns became permanent in Java 22, before Java 25.",
      },
    ],
    answer: ["A"],
    explanation:
      "The enhanced-for statement accepts an unnamed local variable in its header. The three list elements still cause three iterations; the variable simply has no usable name.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.14.2",
    tags: ["enhanced for", "unnamed variables", "Java 22"],
    objectives: ["flow-control", "oop-scope"],
  },
  {
    id: "XOOP-01",
    domain: "oop",
    difficulty: "Expert",
    type: "single",
    prompt: "What does the generated record equals method return?",
    code: `record Packet(int[] bytes) {}
var left = new Packet(new int[] {1, 2});
var right = new Packet(new int[] {1, 2});
System.out.println(left.equals(right));`,
    options: [
      {
        id: "A",
        text: "true",
        explanation:
          "The array contents match, but the generated record equals method does not perform deep array comparison.",
      },
      {
        id: "B",
        text: "false",
        explanation:
          "Correct. Each record holds a distinct array, and array equals compares object identity.",
      },
      {
        id: "C",
        text: "The code does not compile",
        explanation: "An array is a legal record component type.",
      },
      {
        id: "D",
        text: "An ArrayStoreException is thrown",
        explanation: "No array store operation occurs.",
      },
    ],
    answer: ["B"],
    explanation:
      "Generated record equality compares reference components using their equals methods. Arrays inherit Object.equals, so separate arrays are unequal even when their elements match.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.10.3",
    tags: ["records", "equals", "arrays", "shallow equality"],
  },
  {
    id: "XOOP-02",
    domain: "oop",
    difficulty: "Expert",
    type: "single",
    prompt: "What is printed when this permitted subclass is constructed?",
    code: `sealed abstract class Base permits Child {
    Base() { System.out.print(label()); }
    abstract String label();
}
final class Child extends Base {
    String text = "ready";
    String label() { return text; }
}
new Child();`,
    options: [
      {
        id: "A",
        text: "ready",
        explanation:
          "The Child field initializer has not run while the Base constructor executes.",
      },
      {
        id: "B",
        text: "null",
        explanation:
          "Correct. Dynamic dispatch calls Child.label, but Child.text still has its default null value.",
      },
      {
        id: "C",
        text: "The code does not compile because sealed classes cannot call overridden methods",
        explanation:
          "Sealed restricts permitted subtypes; it does not prohibit ordinary virtual method calls.",
      },
      {
        id: "D",
        text: "An AbstractMethodError is thrown",
        explanation:
          "Child provides a concrete label implementation, and dynamic dispatch reaches it.",
      },
    ],
    answer: ["B"],
    explanation:
      'The superclass constructor runs before Child field initializers. Its virtual call dispatches to Child.label, which reads Child.text before it is assigned "ready"; the field still contains null.',
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-12.html#jls-12.5",
    tags: [
      "sealed classes",
      "constructors",
      "initialization order",
      "dynamic dispatch",
    ],
  },
  {
    id: "XEXC-01",
    domain: "exceptions",
    difficulty: "Expert",
    type: "single",
    prompt: "Both resources fail while closing. What is printed?",
    code: `class R implements AutoCloseable {
    final String id;
    R(String id) { this.id = id; }
    public void close() { throw new IllegalStateException(id); }
}
try (R a = new R("A"); R b = new R("B")) {
    // No body exception
} catch (Exception e) {
    System.out.println(e.getMessage() + ":" +
                       e.getSuppressed()[0].getMessage());
}`,
    options: [
      {
        id: "A",
        text: "A:B",
        explanation:
          "Resources close in reverse declaration order, so B fails first and is primary.",
      },
      {
        id: "B",
        text: "B:A",
        explanation:
          "Correct. B closes first and throws the primary exception; the later A failure is suppressed.",
      },
      {
        id: "C",
        text: "B with no suppressed exception",
        explanation:
          "The A close method also throws and is attached to the primary B exception.",
      },
      {
        id: "D",
        text: "The code does not compile",
        explanation:
          "Both resource declarations and the catch clause are valid.",
      },
    ],
    answer: ["B"],
    explanation:
      "try-with-resources closes resources in reverse order. Since the body succeeds, B's close exception is primary. A's close exception is suppressed on it.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20.3",
    tags: ["try-with-resources", "close order", "suppressed exceptions"],
  },
  {
    id: "XEXC-02",
    domain: "exceptions",
    difficulty: "Applied",
    type: "single",
    prompt: "Does this override compile?",
    code: `class Parent {
    void load() throws java.io.IOException {}
}
class Child extends Parent {
    @Override void load() throws Exception {}
}`,
    options: [
      {
        id: "A",
        text: "Yes, because Exception is a superclass of IOException",
        explanation:
          "That broader checked exception would break callers relying on the parent method contract.",
      },
      {
        id: "B",
        text: "Yes, because the method body throws nothing",
        explanation:
          "The declared checked throws clause is checked regardless of the method body.",
      },
      {
        id: "C",
        text: "No, because the override declares a broader checked exception",
        explanation:
          "Correct. Exception is not allowed where the overridden declaration only permits IOException.",
      },
      {
        id: "D",
        text: "No, because an override must repeat the exact throws clause",
        explanation:
          "An override may narrow or omit checked exceptions; exact repetition is not required.",
      },
    ],
    answer: ["C"],
    explanation:
      "An overriding method cannot add a new or broader checked exception to the overridden method's throws contract. It could instead declare IOException, a checked subtype, or no checked exception.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-8.html#jls-8.4.8.3",
    tags: ["overriding", "checked exceptions", "throws"],
  },
  {
    id: "XCOL-01",
    domain: "collections",
    difficulty: "Applied",
    type: "single",
    prompt: "What does this sequenced set print?",
    code: `var values = new java.util.LinkedHashSet<>(java.util.List.of(1, 2, 3));
values.addFirst(3);
System.out.println(values);`,
    options: [
      {
        id: "A",
        text: "[1, 2, 3]",
        explanation:
          "addFirst relocates an existing element to the first encounter position.",
      },
      {
        id: "B",
        text: "[3, 1, 2]",
        explanation:
          "Correct. The existing 3 moves to the front without being duplicated.",
      },
      {
        id: "C",
        text: "[3, 1, 2, 3]",
        explanation:
          "A Set never holds the same element twice; addFirst repositions the existing element.",
      },
      {
        id: "D",
        text: "An UnsupportedOperationException is thrown",
        explanation: "LinkedHashSet supports addFirst.",
      },
    ],
    answer: ["B"],
    explanation:
      "LinkedHashSet preserves encounter order and implements addFirst. If the element is already present, it moves to the first position instead of creating a duplicate.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/LinkedHashSet.html#addFirst(E)",
    tags: ["sequenced collections", "LinkedHashSet", "encounter order"],
  },
  {
    id: "XCOL-02",
    domain: "collections",
    difficulty: "Expert",
    type: "single",
    prompt: "What is the final encounter order and value after putFirst?",
    code: `var map = new java.util.LinkedHashMap<String, Integer>();
map.put("a", 1);
map.put("b", 2);
map.put("c", 3);
map.putFirst("c", 30);
System.out.println(map);`,
    options: [
      {
        id: "A",
        text: "{a=1, b=2, c=30}",
        explanation:
          "putFirst relocates the existing c mapping to the first position.",
      },
      {
        id: "B",
        text: "{c=30, a=1, b=2}",
        explanation:
          "Correct. The value is replaced and the c mapping is moved to the front.",
      },
      {
        id: "C",
        text: "{c=3, a=1, b=2}",
        explanation: "putFirst also replaces the existing value with 30.",
      },
      {
        id: "D",
        text: "{a=1, b=2, c=3, c=30}",
        explanation: "A map cannot contain duplicate equal keys.",
      },
    ],
    answer: ["B"],
    explanation:
      "LinkedHashMap.putFirst both replaces the value for an existing key and relocates that mapping to the first encounter position.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/LinkedHashMap.html#putFirst(K,V)",
    tags: ["sequenced maps", "LinkedHashMap", "putFirst"],
  },
  {
    id: "XSTR-01",
    domain: "streams",
    difficulty: "Applied",
    type: "single",
    prompt: "What does this gatherer print?",
    code: `var result = java.util.stream.Stream.of(1, 2, 3)
    .gather(java.util.stream.Gatherers.scan(
        () -> 0, Integer::sum))
    .toList();
System.out.println(result);`,
    options: [
      {
        id: "A",
        text: "[1, 3, 6]",
        explanation:
          "Correct. scan emits each running total after incorporating the next input.",
      },
      {
        id: "B",
        text: "[0, 1, 3, 6]",
        explanation:
          "The initial value seeds the scan; it is not emitted before any input.",
      },
      {
        id: "C",
        text: "[6]",
        explanation:
          "A fold emits only one final result; scan emits every prefix result.",
      },
      {
        id: "D",
        text: "[1, 2, 3]",
        explanation:
          "The scanner accumulates with Integer::sum rather than passing inputs through unchanged.",
      },
    ],
    answer: ["A"],
    explanation:
      "Gatherers.scan starts from zero and produces a result for each input: 0 + 1 = 1, then 1 + 2 = 3, then 3 + 3 = 6.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Gatherers.html#scan(java.util.function.Supplier,java.util.function.BiFunction)",
    tags: ["stream gatherers", "scan", "prefix sum"],
  },
  {
    id: "XSTR-02",
    domain: "streams",
    difficulty: "Expert",
    type: "single",
    prompt: "What does the corresponding fold gatherer print?",
    code: `var result = java.util.stream.Stream.of(1, 2, 3)
    .gather(java.util.stream.Gatherers.fold(
        () -> 0, Integer::sum))
    .toList();
System.out.println(result);`,
    options: [
      {
        id: "A",
        text: "[1, 3, 6]",
        explanation:
          "That is the output shape of scan, which emits every prefix.",
      },
      {
        id: "B",
        text: "[0, 1, 3, 6]",
        explanation: "fold does not emit the initial value or every prefix.",
      },
      {
        id: "C",
        text: "[6]",
        explanation: "Correct. fold accumulates and emits one final result.",
      },
      {
        id: "D",
        text: "[]",
        explanation: "The nonempty input produces one folded result.",
      },
    ],
    answer: ["C"],
    explanation:
      "Gatherers.fold performs an ordered accumulation and emits one result when upstream ends. The three inputs sum to 6, so the resulting stream contains one element.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Gatherers.html#fold(java.util.function.Supplier,java.util.function.BiFunction)",
    tags: ["stream gatherers", "fold", "reduction"],
  },
  {
    id: "XPKG-01",
    domain: "packaging",
    difficulty: "Applied",
    type: "single",
    prompt:
      "Which JDK command creates a custom runtime image for modular com.app and its transitive module dependencies?",
    options: [
      {
        id: "A",
        text: "jlink --module-path mlib --add-modules com.app --output app-image",
        explanation:
          "Correct. jlink links the root module and its dependencies into an image at app-image.",
      },
      {
        id: "B",
        text: "jar --create --file app-image -C mlib .",
        explanation:
          "jar creates a JAR archive, not a custom Java runtime image.",
      },
      {
        id: "C",
        text: "javac --module-path mlib --output app-image com.app",
        explanation:
          "javac compiles source; it does not assemble runtime images, and this command is not its syntax.",
      },
      {
        id: "D",
        text: "jdeps --module-path mlib --add-modules com.app --output app-image",
        explanation:
          "jdeps analyzes dependencies; jlink is the runtime-image tool.",
      },
    ],
    answer: ["A"],
    explanation:
      "jlink takes root modules from a module path and includes their transitive dependencies in a custom runtime image. jar instead creates an archive of classes and resources.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/specs/man/jlink.html",
    tags: ["jlink", "runtime image", "JAR", "modules"],
  },
  {
    id: "XPKG-02",
    domain: "packaging",
    difficulty: "Expert",
    type: "multiple",
    prompt:
      "For named modules using ServiceLoader, which declarations support discovery of a Codec provider? Assume com.api exports the service interface and the provider class is valid. Select all that apply.",
    options: [
      {
        id: "A",
        text: "The consumer module declares uses com.api.Codec;",
        explanation:
          "Correct. uses declares the service type for which the module can discover providers.",
      },
      {
        id: "B",
        text: "The provider module declares provides com.api.Codec with com.impl.JsonCodec;",
        explanation:
          "Correct. provides ... with registers the implementation as a service provider.",
      },
      {
        id: "C",
        text: "The consumer must declare requires com.provider;",
        explanation:
          "Service discovery does not require the consumer to name the provider module as an ordinary dependency.",
      },
      {
        id: "D",
        text: "The provider must export com.impl to every consumer;",
        explanation:
          "The implementation package need not be exported for service loading.",
      },
    ],
    answer: ["A", "B"],
    explanation:
      "A consumer declares uses for the service. A provider declares provides ... with for an implementation. ServiceLoader can discover that provider without an ordinary requires edge to its module or an export of its implementation package.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html#jls-7.7",
    tags: ["JPMS", "ServiceLoader", "uses", "provides"],
  },
  {
    id: "XCON-01",
    domain: "concurrency",
    difficulty: "Applied",
    type: "single",
    prompt: "What is printed after the scoped operation throws and is caught?",
    code: `static final ScopedValue<String> KEY = ScopedValue.newInstance();

try {
    ScopedValue.where(KEY, "active").run(() -> {
        throw new IllegalStateException("stop");
    });
} catch (IllegalStateException ignored) { }
System.out.println(KEY.isBound());`,
    options: [
      {
        id: "A",
        text: "true",
        explanation:
          "The binding is limited to the run operation and is removed even when it exits by throwing.",
      },
      {
        id: "B",
        text: "false",
        explanation:
          "Correct. The scoped binding is unwound when run completes abruptly.",
      },
      {
        id: "C",
        text: "null",
        explanation: "isBound returns a boolean, not the bound value.",
      },
      {
        id: "D",
        text: "The IllegalStateException remains uncaught",
        explanation:
          "The catch clause handles the exception thrown from the run body.",
      },
    ],
    answer: ["B"],
    explanation:
      "A ScopedValue binding exists only for the bounded dynamic execution of run. The runtime removes the binding when control leaves that call, including exceptional exit.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ScopedValue.html",
    tags: ["scoped values", "exceptional exit", "binding lifetime"],
  },
  {
    id: "XCON-02",
    domain: "concurrency",
    difficulty: "Applied",
    type: "single",
    prompt: "What does this atomic compare-and-set operation print?",
    code: `var count = new java.util.concurrent.atomic.AtomicInteger(2);
boolean changed = count.compareAndSet(1, 9);
System.out.println(changed + ":" + count.get());`,
    options: [
      {
        id: "A",
        text: "true:9",
        explanation:
          "The current value 2 does not match the expected value 1, so no update occurs.",
      },
      {
        id: "B",
        text: "false:2",
        explanation:
          "Correct. compareAndSet fails because the expected value differs from the current value.",
      },
      {
        id: "C",
        text: "false:9",
        explanation:
          "A failed compare-and-set does not write the update value.",
      },
      {
        id: "D",
        text: "true:2",
        explanation:
          "A successful compare-and-set would update the value to 9.",
      },
    ],
    answer: ["B"],
    explanation:
      "AtomicInteger.compareAndSet(expected, update) changes the value atomically only if it currently equals expected. Here 2 differs from 1, so it returns false and leaves 2 in place.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/atomic/AtomicInteger.html#compareAndSet(int,int)",
    tags: ["AtomicInteger", "compare-and-set", "thread safety"],
  },
  {
    id: "XIO-01",
    domain: "io",
    difficulty: "Applied",
    type: "single",
    prompt:
      "A State instance is serialized and then deserialized using ordinary Java object serialization, with no custom serialization methods. What are its field values after deserialization?",
    code: `class State implements java.io.Serializable {
    String name = "Ada";
    transient int attempts = 7;
}`,
    options: [
      {
        id: "A",
        text: "name is Ada; attempts is 7",
        explanation:
          "The transient field is omitted from the serialized state and does not retain 7.",
      },
      {
        id: "B",
        text: "name is Ada; attempts is 0",
        explanation:
          "Correct. name is restored from the stream; the omitted transient int has its default value zero.",
      },
      {
        id: "C",
        text: "name is null; attempts is 7",
        explanation:
          "name is a non-transient instance field and is serialized by default.",
      },
      {
        id: "D",
        text: "name is null; attempts is 0",
        explanation: "Only the transient field is omitted; name is restored.",
      },
    ],
    answer: ["B"],
    explanation:
      "Default serialization includes nonstatic, nontransient fields. The transient attempts field is not saved; during deserialization it has the default int value 0. The serializable class field initializer does not rerun.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/specs/serialization/serial-arch.html",
    tags: ["serialization", "transient", "default values"],
  },
  {
    id: "XIO-02",
    domain: "io",
    difficulty: "Foundation",
    type: "multiple",
    prompt:
      "Which statements about java.io.Console are correct? Select all that apply.",
    options: [
      {
        id: "A",
        text: "System.console() may return null when no console device is available.",
        explanation:
          "Correct. Background and redirected launches may have no associated console.",
      },
      {
        id: "B",
        text: "Console.readPassword() returns a char[] rather than a String.",
        explanation:
          "Correct. The caller receives a character array and can clear it after use.",
      },
      {
        id: "C",
        text: "Console.readLine() returns a char[].",
        explanation:
          "readLine returns a String; readPassword is the char[] method.",
      },
      {
        id: "D",
        text: "Every JVM with System.out also has a non-null Console.",
        explanation:
          "System.out may exist even when the JVM has no interactive console.",
      },
    ],
    answer: ["A", "B"],
    explanation:
      "A console depends on how the JVM is launched, so System.console() can be null. Console.readLine returns String, while readPassword returns char[] to allow controlled handling of sensitive input.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/Console.html",
    tags: ["Console", "readPassword", "interactive I/O"],
  },
  {
    id: "XLOC-01",
    domain: "localization",
    difficulty: "Expert",
    type: "single",
    prompt:
      "Assume these three property bundles are on the class path. What does the lookup print?",
    code: `// Messages.properties:       title=Root
// Messages_fr.properties:    title=Français
// Messages_fr_CA.properties: region=CA
var bundle = java.util.ResourceBundle.getBundle(
    "Messages", java.util.Locale.CANADA_FRENCH);
System.out.println(bundle.getString("title"));`,
    options: [
      {
        id: "A",
        text: "Root",
        explanation:
          "The more specific French parent bundle defines title, so lookup stops before the root bundle.",
      },
      {
        id: "B",
        text: "Français",
        explanation:
          "Correct. The fr_CA bundle lacks title, so the key is inherited from its fr parent.",
      },
      {
        id: "C",
        text: "CA",
        explanation: "CA is the value of a different key, region.",
      },
      {
        id: "D",
        text: "A MissingResourceException is thrown",
        explanation:
          "The requested bundle exists and its parent supplies title.",
      },
    ],
    answer: ["B"],
    explanation:
      "ResourceBundle lookup builds a parent chain for the requested locale. getString searches the fr_CA bundle and then its fr parent, where title is defined.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ResourceBundle.html",
    tags: ["ResourceBundle", "locale fallback", "properties"],
  },
  {
    id: "XLOC-02",
    domain: "localization",
    difficulty: "Applied",
    type: "single",
    prompt: "What does this locale-specific number formatter print?",
    code: `var format = java.text.NumberFormat.getPercentInstance(
    java.util.Locale.US);
System.out.println(format.format(0.25));`,
    options: [
      {
        id: "A",
        text: "0.25%",
        explanation:
          "A percent formatter scales the numeric value by 100 for display.",
      },
      {
        id: "B",
        text: "25%",
        explanation:
          "Correct. One quarter is displayed as twenty-five percent in the US locale.",
      },
      {
        id: "C",
        text: "25.00%",
        explanation:
          "The default US percent format does not force two fractional digits for this exact value.",
      },
      {
        id: "D",
        text: "The result depends on the JVM default locale",
        explanation:
          "Locale.US is passed explicitly, so the default locale does not select the percent style.",
      },
    ],
    answer: ["B"],
    explanation:
      "NumberFormat.getPercentInstance(Locale.US) formats a fraction as a percentage using US locale conventions. 0.25 is displayed as 25%.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/text/NumberFormat.html#getPercentInstance(java.util.Locale)",
    tags: ["NumberFormat", "percent", "Locale.US"],
  },
];
