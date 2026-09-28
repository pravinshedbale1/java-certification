import type { DomainId } from "./questions";

/** Original counterfactual exercises. Each pair changes one expression or clause. */
export type MutationChallenge = {
  id: string;
  domain: DomainId;
  title: string;
  beforeCode: string;
  change: string;
  afterCode: string;
  prompt: string;
  options: { id: string; text: string }[];
  answer: string;
  explanation: string;
  sourceUrl: string;
};

export const mutations: MutationChallenge[] = [
  {
    id: "MUT-VAL-01",
    domain: "values",
    title: "The cast hidden in +=",
    beforeCode: `class Demo {
  public static void main(String[] args) {
    short points = 7;
    points += 4.9;
    System.out.print(points);
  }
}`,
    change:
      "Replace compound assignment with the corresponding simple assignment.",
    afterCode: `class Demo {
  public static void main(String[] args) {
    short points = 7;
    points = points + 4.9;
    System.out.print(points);
  }
}`,
    prompt: "The original prints 11. What happens after this one change?",
    options: [
      { id: "A", text: "It still prints 11." },
      { id: "B", text: "It prints 11.9." },
      { id: "C", text: "It does not compile." },
      { id: "D", text: "It throws ClassCastException." },
    ],
    answer: "C",
    explanation:
      "Compound assignment includes an implicit cast to the left operand’s type. In the simple assignment, points + 4.9 has type double, which cannot be assigned to short without an explicit cast.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-15.html#jls-15.26.2",
  },
  {
    id: "MUT-FLOW-01",
    domain: "flow",
    title: "A guard keeps a later case alive",
    beforeCode: `class Demo {
  public static void main(String[] args) {
    Object value = "Java";
    String result = switch (value) {
      case String s when s.length() == 4 -> "four";
      case String s -> "other string";
      default -> "other type";
    };
    System.out.print(result);
  }
}`,
    change: "Remove the when guard from the first String case.",
    afterCode: `class Demo {
  public static void main(String[] args) {
    Object value = "Java";
    String result = switch (value) {
      case String s -> "four";
      case String s -> "other string";
      default -> "other type";
    };
    System.out.print(result);
  }
}`,
    prompt:
      "The original prints four. What happens after the guard is removed?",
    options: [
      { id: "A", text: "It still prints four." },
      { id: "B", text: "It prints other string." },
      {
        id: "C",
        text: "It does not compile because the second String case is dominated.",
      },
      { id: "D", text: "It throws MatchException." },
    ],
    answer: "C",
    explanation:
      "A guarded pattern can fail its guard, leaving values for the later String case. Without the guard, the first String pattern covers every String, so the later identical pattern is dominated at compile time.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.11.1",
  },
  {
    id: "MUT-OOP-01",
    domain: "oop",
    title: "Early write, forbidden early read",
    beforeCode: `class Base {
  Base() { show(); }
  void show() {}
}
class Demo extends Base {
  int value;
  Demo(int value) {
    this.value = value;
    super();
  }
  @Override void show() { System.out.print(value); }
  public static void main(String[] args) { new Demo(42); }
}`,
    change: "Change the early simple assignment to compound assignment.",
    afterCode: `class Base {
  Base() { show(); }
  void show() {}
}
class Demo extends Base {
  int value;
  Demo(int value) {
    this.value += value;
    super();
  }
  @Override void show() { System.out.print(value); }
  public static void main(String[] args) { new Demo(42); }
}`,
    prompt: "The original prints 42. What happens after = becomes +=?",
    options: [
      { id: "A", text: "It still prints 42." },
      { id: "B", text: "It prints 0." },
      {
        id: "C",
        text: "It does not compile because += reads the field before super().",
      },
      { id: "D", text: "It throws IllegalStateException." },
    ],
    answer: "C",
    explanation:
      "Java 25 permits a simple assignment to this class’s field before super(). Compound assignment must first read the old field value, and reading the under-construction instance in this early context is prohibited.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/language/flexible-constructor-bodies.html",
  },
  {
    id: "MUT-EXC-01",
    domain: "exceptions",
    title: "Which failure is primary?",
    beforeCode: `class Demo {
  static class R implements AutoCloseable {
    public void close() { throw new IllegalStateException("close"); }
  }
  public static void main(String[] args) {
    boolean fail = true;
    try (R r = new R()) {
      if (fail) throw new IllegalArgumentException("body");
    } catch (Exception e) {
      System.out.print(e.getMessage() + ":" + e.getSuppressed().length);
    }
  }
}`,
    change: "Set fail to false instead of true.",
    afterCode: `class Demo {
  static class R implements AutoCloseable {
    public void close() { throw new IllegalStateException("close"); }
  }
  public static void main(String[] args) {
    boolean fail = false;
    try (R r = new R()) {
      if (fail) throw new IllegalArgumentException("body");
    } catch (Exception e) {
      System.out.print(e.getMessage() + ":" + e.getSuppressed().length);
    }
  }
}`,
    prompt: "The original prints body:1. What does the changed program print?",
    options: [
      { id: "A", text: "body:0" },
      { id: "B", text: "close:0" },
      { id: "C", text: "close:1" },
      { id: "D", text: "Nothing; the close exception is uncaught." },
    ],
    answer: "B",
    explanation:
      "With no body exception, close() supplies the primary exception and there is no suppressed exception. In the original, the body exception was primary and the close failure was suppressed.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.20.3",
  },
  {
    id: "MUT-COL-01",
    domain: "collections",
    title: "What backs the reversed view?",
    beforeCode: `import java.util.*;
class Demo {
  public static void main(String[] args) {
    var values = List.of(1, 2, 3);
    var backwards = values.reversed();
    backwards.set(0, 9);
    System.out.print(values);
  }
}`,
    change: "Wrap the factory list in a new ArrayList.",
    afterCode: `import java.util.*;
class Demo {
  public static void main(String[] args) {
    var values = new ArrayList<>(List.of(1, 2, 3));
    var backwards = values.reversed();
    backwards.set(0, 9);
    System.out.print(values);
  }
}`,
    prompt:
      "The original throws UnsupportedOperationException. What happens after the change?",
    options: [
      { id: "A", text: "It prints [1, 2, 9]." },
      { id: "B", text: "It prints [9, 2, 3]." },
      { id: "C", text: "It prints [1, 2, 3]." },
      { id: "D", text: "It still throws UnsupportedOperationException." },
    ],
    answer: "A",
    explanation:
      "List.of is unmodifiable, and so is its reversed view. Wrapping it creates a mutable ArrayList; reversed() is then a write-through reverse-ordered view. Its index 0 is the backing list’s last element.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html#reversed()",
  },
  {
    id: "MUT-STR-01",
    domain: "streams",
    title: "Fixed windows become sliding windows",
    beforeCode: `import java.util.stream.*;
class Demo {
  public static void main(String[] args) {
    var windows = Stream.of(1, 2, 3, 4)
        .gather(Gatherers.windowFixed(2)).toList();
    System.out.print(windows);
  }
}`,
    change: "Replace windowFixed(2) with windowSliding(2).",
    afterCode: `import java.util.stream.*;
class Demo {
  public static void main(String[] args) {
    var windows = Stream.of(1, 2, 3, 4)
        .gather(Gatherers.windowSliding(2)).toList();
    System.out.print(windows);
  }
}`,
    prompt:
      "The original prints [[1, 2], [3, 4]]. What does the changed pipeline print?",
    options: [
      { id: "A", text: "[[1, 2], [3, 4]]" },
      { id: "B", text: "[[1, 2], [2, 3], [3, 4]]" },
      { id: "C", text: "[[1, 2], [2, 3], [3, 4], [4]]" },
      { id: "D", text: "It needs --enable-preview." },
    ],
    answer: "B",
    explanation:
      "Fixed windows do not overlap. A sliding window drops the oldest element and adds the next, producing three overlapping windows of size two. Gatherers are a permanent API in Java 25.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/stream/Gatherers.html#windowSliding(int)",
  },
  {
    id: "MUT-PKG-01",
    domain: "packaging",
    title: "A module import reaches farther",
    beforeCode: `import module java.base;
class Demo {
  public static void main(String[] args) {
    List<Integer> values = Stream.of(1, 2).toList();
    System.out.print(values.size());
  }
}`,
    change: "Replace the module import with import java.util.*.",
    afterCode: `import java.util.*;
class Demo {
  public static void main(String[] args) {
    List<Integer> values = Stream.of(1, 2).toList();
    System.out.print(values.size());
  }
}`,
    prompt:
      "The original prints 2 without preview flags. What happens after the import change?",
    options: [
      { id: "A", text: "It still prints 2." },
      {
        id: "B",
        text: "It does not compile because Stream is no longer imported.",
      },
      {
        id: "C",
        text: "It does not compile because module imports are required for List.",
      },
      { id: "D", text: "It compiles only with --enable-preview." },
    ],
    answer: "B",
    explanation:
      "The java.base module exports both java.util and java.util.stream, so a module import exposes both packages’ public top-level types. A package wildcard import of java.util does not also import java.util.stream.Stream. Module imports are permanent in Java 25.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/language/module-import-declarations.html",
  },
  {
    id: "MUT-CON-01",
    domain: "concurrency",
    title: "A binding belongs to a key",
    beforeCode: `class Demo {
  static final ScopedValue<String> KEY = ScopedValue.newInstance();
  static final ScopedValue<String> OTHER = ScopedValue.newInstance();
  public static void main(String[] args) {
    ScopedValue.where(KEY, "outer").run(() ->
        ScopedValue.where(KEY, "inner").run(() ->
            System.out.print(KEY.get())));
  }
}`,
    change: "Bind OTHER instead of KEY in the inner scope.",
    afterCode: `class Demo {
  static final ScopedValue<String> KEY = ScopedValue.newInstance();
  static final ScopedValue<String> OTHER = ScopedValue.newInstance();
  public static void main(String[] args) {
    ScopedValue.where(KEY, "outer").run(() ->
        ScopedValue.where(OTHER, "inner").run(() ->
            System.out.print(KEY.get())));
  }
}`,
    prompt: "The original prints inner. What does the changed program print?",
    options: [
      { id: "A", text: "outer" },
      { id: "B", text: "inner" },
      { id: "C", text: "null" },
      { id: "D", text: "It throws NoSuchElementException." },
    ],
    answer: "A",
    explanation:
      "Nested binding shadows an outer value only when it uses the same ScopedValue key. The changed inner scope binds OTHER, so KEY.get() still reads KEY’s outer binding.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/ScopedValue.html",
  },
  {
    id: "MUT-IO-01",
    domain: "io",
    title: "Write or append?",
    beforeCode: `import java.nio.file.*;
class Demo {
  public static void main(String[] args) throws Exception {
    Path p = Files.createTempFile("mutation-", ".txt");
    try {
      Files.writeString(p, "A");
      Files.writeString(p, "B");
      System.out.print(Files.readString(p));
    } finally {
      Files.deleteIfExists(p);
    }
  }
}`,
    change: "Add StandardOpenOption.APPEND to the second writeString call.",
    afterCode: `import java.nio.file.*;
class Demo {
  public static void main(String[] args) throws Exception {
    Path p = Files.createTempFile("mutation-", ".txt");
    try {
      Files.writeString(p, "A");
      Files.writeString(p, "B", StandardOpenOption.APPEND);
      System.out.print(Files.readString(p));
    } finally {
      Files.deleteIfExists(p);
    }
  }
}`,
    prompt:
      "Assume file operations succeed. The original prints B. What does the changed program print?",
    options: [
      { id: "A", text: "A" },
      { id: "B", text: "B" },
      { id: "C", text: "AB" },
      { id: "D", text: "It throws UnsupportedOperationException." },
    ],
    answer: "C",
    explanation:
      "Without options, writeString truncates the existing file. APPEND instead writes B at the end of the existing A, so readString returns AB.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Files.html#writeString(java.nio.file.Path,java.lang.CharSequence,java.nio.file.OpenOption...)",
  },
  {
    id: "MUT-LOC-01",
    domain: "localization",
    title: "Apostrophes change a message pattern",
    beforeCode: `import java.text.MessageFormat;
class Demo {
  public static void main(String[] args) {
    System.out.print(MessageFormat.format("'{0}' {0}", "Java"));
  }
}`,
    change: "Remove the apostrophes around the first {0}.",
    afterCode: `import java.text.MessageFormat;
class Demo {
  public static void main(String[] args) {
    System.out.print(MessageFormat.format("{0} {0}", "Java"));
  }
}`,
    prompt:
      "The original prints {0} Java. What does the changed program print?",
    options: [
      { id: "A", text: "{0} Java" },
      { id: "B", text: "'Java' Java" },
      { id: "C", text: "Java Java" },
      { id: "D", text: "It throws IllegalArgumentException." },
    ],
    answer: "C",
    explanation:
      "In MessageFormat, apostrophes quote literal pattern text. Without those apostrophes, both {0} occurrences are argument placeholders and both insert Java.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/text/MessageFormat.html",
  },
];
