export type JavaGoldenFixture = {
  id: string;
  files: Record<string, string>;
  mainClass?: string;
  launcherArgs?: string[];
  expectedOutput?: string;
  compiles?: boolean;
  diagnostic?: RegExp;
};

/**
 * Executable Java 25 witnesses for rules that are easy to state incorrectly.
 * Practice questions may be worded differently, but their keys must agree with
 * these compiler/runtime results.
 */
export const javaGoldenFixtures: JavaGoldenFixture[] = [
  {
    id: "duration-instant",
    files: {
      "Main.java": `import java.time.*;
class Main {
  public static void main(String[] args) {
    var a = Instant.parse("2025-01-01T00:00:00Z");
    var b = a.plusSeconds(90);
    System.out.print(a.until(b) + "|" + Duration.between(LocalTime.of(23, 30), LocalTime.of(0, 30)));
  }
}`,
    },
    mainClass: "Main",
    expectedOutput: "PT1M30S|PT-23H",
  },
  {
    id: "nested-capture-varargs-enum",
    files: {
      "Main.java": `class Main {
  enum Level { LOW(1), HIGH(2); final int n; Level(int n) { this.n = n; } }
  class Inner { int read() { return Level.HIGH.n; } }
  static int sum(int base, int... rest) { for (int n : rest) base += n; return base; }
  public static void main(String[] args) {
    int captured = 3;
    class Local { int read() { return captured; } }
    System.out.print(new Main().new Inner().read() + new Local().read() + sum(1, 2, 3));
  }
}`,
    },
    mainClass: "Main",
    expectedOutput: "11",
  },
  {
    id: "functional-private-interface",
    files: {
      "Main.java": `interface Scale {
  int apply(int value);
  private static int twice(int value) { return value * 2; }
  static Scale doubled() { return value -> twice(value); }
}
class Main { public static void main(String[] args) { System.out.print(Scale.doubled().apply(4)); } }`,
    },
    mainClass: "Main",
    expectedOutput: "8",
  },
  {
    id: "deque-contract",
    files: {
      "Main.java": `import java.util.*;
class Main {
  public static void main(String[] args) {
    Deque<Integer> values = new ArrayDeque<>();
    values.addFirst(2); values.offerLast(3); values.push(1);
    System.out.print(values.removeFirst() + "|" + values.peekLast() + "|" + values.size());
  }
}`,
    },
    mainClass: "Main",
    expectedOutput: "1|3|2",
  },
  {
    id: "custom-checked-exception",
    files: {
      "Main.java": `class Problem extends Exception {}
class Main {
  static void fail() throws Problem { throw new Problem(); }
  public static void main(String[] args) { try { fail(); } catch (Problem ex) { System.out.print("caught"); } }
}`,
    },
    mainClass: "Main",
    expectedOutput: "caught",
  },
  {
    id: "stream-core-operations",
    files: {
      "Main.java": `import java.util.*;
import java.util.stream.*;
class Main {
  public static void main(String[] args) {
    var joined = Stream.concat(Stream.of("bb", "a"), Stream.of("ccc"))
        .sorted().collect(Collectors.joining("-"));
    var grouped = Stream.of("a", "bb", "c").collect(Collectors.groupingBy(String::length, Collectors.counting()));
    int sum = IntStream.rangeClosed(1, 3).reduce(0, Integer::sum);
    System.out.print(joined + "|" + grouped.get(1) + "|" + sum);
  }
}`,
    },
    mainClass: "Main",
    expectedOutput: "a-bb-ccc|2|6",
  },
  {
    id: "callable-and-lock",
    files: {
      "Main.java": `import java.util.concurrent.*;
import java.util.concurrent.locks.*;
class Main {
  public static void main(String[] args) throws Exception {
    var lock = new ReentrantLock();
    try (var service = Executors.newSingleThreadExecutor()) {
      Future<Integer> result = service.submit((Callable<Integer>) () -> { lock.lock(); try { return 25; } finally { lock.unlock(); } });
      System.out.print(result.get());
    }
  }
}`,
    },
    mainClass: "Main",
    expectedOutput: "25",
  },
  {
    id: "reader-charsequence",
    files: {
      "Main.java": `import java.io.*;
class Main {
  public static void main(String[] args) throws Exception {
    char[] target = {'-', '-', '-', '-', '-'};
    ((CharSequence) new StringBuilder("oracle")).getChars(1, 4, target, 1);
    try (Reader reader = Reader.of("red\\nblue")) {
      reader.mark(20);
      var lines = reader.readAllLines();
      reader.reset();
      System.out.print(new String(target) + "|" + lines + ":" + reader.readAllAsString().length());
    }
  }
}`,
    },
    mainClass: "Main",
    expectedOutput: "-rac-|[red, blue]:8",
  },
  {
    id: "nio-attributes",
    files: {
      "Main.java": `import java.nio.file.*;
import java.nio.file.attribute.*;
class Main {
  public static void main(String[] args) throws Exception {
    Path path = Files.createTempFile("forge", ".txt");
    try { Files.writeString(path, "java"); var a = Files.readAttributes(path, BasicFileAttributes.class); System.out.print(a.isRegularFile() + "|" + a.size()); }
    finally { Files.deleteIfExists(path); }
  }
}`,
    },
    mainClass: "Main",
    expectedOutput: "true|4",
  },
  {
    id: "localization-parse-currency",
    files: {
      "Main.java": `import java.text.*;
import java.time.*;
import java.time.format.*;
import java.util.*;
class Main {
  public static void main(String[] args) throws Exception {
    var currency = NumberFormat.getCurrencyInstance(Locale.US);
    var date = DateTimeFormatter.ofPattern("dd MMM uuuu", Locale.US).parse("02 Jan 2025", LocalDate::from);
    var message = new MessageFormat("{0,number,integer}", Locale.US).parse("1,200");
    System.out.print(currency.getCurrency().getCurrencyCode() + "|" + date + "|" + message[0]);
  }
}`,
    },
    mainClass: "Main",
    expectedOutput: "USD|2025-01-02|1200",
  },
  {
    id: "captured-variable-does-not-compile",
    files: {
      "Main.java": `class Main {
  public static void main(String[] args) {
    int value = 1;
    Runnable task = () -> System.out.print(value);
    value++;
  }
}`,
    },
    compiles: false,
    diagnostic: /effectively final/i,
  },
  {
    id: "compact-source-unnamed-module-launch",
    files: {
      "Stats.java": `import module java.base;
void main() {
  var values = List.of(2, 4, 6);
  IO.println(values.stream().mapToInt(Integer::intValue).average().orElseThrow());
  IO.println(getClass().getModule().isNamed());
}`,
    },
    launcherArgs: ["Stats.java"],
    expectedOutput: "4.0\nfalse\n",
  },
  {
    id: "multi-file-source-launch",
    files: {
      "app/Main.java": `package app;
import util.Helper;
public class Main { public static void main(String[] args) { System.out.println(Helper.twice(4)); } }`,
      "util/Helper.java": `package util;
public class Helper { public static int twice(int value) { return value * 2; } }`,
    },
    launcherArgs: ["app/Main.java"],
    expectedOutput: "8\n",
  },
];
