/**
 * Source-grounded study map for Java SE 25. Rules describe Java behavior, not
 * unpublished exam weightings. Preview material must be identified as such in
 * any practice item that uses it.
 */

export const DOMAIN_ORDER = [
  "values",
  "flow",
  "oop",
  "exceptions",
  "collections",
  "streams",
  "packaging",
  "concurrency",
  "io",
  "localization",
] as const;

export type DomainSlug = (typeof DOMAIN_ORDER)[number];

export interface CurriculumRule {
  text: string;
  source: string;
}

export interface CurriculumDomain {
  id: DomainSlug;
  title: string;
  description: string;
  concepts: string[];
  rules: CurriculumRule[];
  pitfall: { assumption: string; reality: string };
}

export interface Java25FeatureBrief {
  id: string;
  title: string;
  status: "permanent" | "preview";
  scope: "objective-aligned" | "supplemental";
  summary: string;
  examLens: string;
  source: string;
}

const JLS = "https://docs.oracle.com/javase/specs/jls/se25/html/";
const API = "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/";

export const CURRICULUM_DOMAINS: CurriculumDomain[] = [
  {
    id: "values",
    title: "Values & expressions",
    description:
      "Read the types and evaluation order before predicting a result.",
    concepts: [
      "numeric promotion",
      "casts",
      "var inference",
      "String and text blocks",
      "date, time, Duration and Instant",
      "time zones and daylight saving",
    ],
    rules: [
      {
        text: "Binary numeric promotion applies to arithmetic operands; byte and short arithmetic normally produces int.",
        source: `${JLS}jls-5.html#jls-5.6`,
      },
      {
        text: "Integer division truncates toward zero; an integer zero divisor throws ArithmeticException.",
        source: `${JLS}jls-15.html#jls-15.17.2`,
      },
      {
        text: "The + operator associates left to right, so a preceding String changes later additions into concatenation.",
        source: `${JLS}jls-15.html#jls-15.18.1`,
      },
      {
        text: "Local var needs an initializer and infers a static type; it does not turn Java into dynamic typing.",
        source:
          "https://docs.oracle.com/en/java/javase/25/language/local-variable-type-inference.html",
      },
      {
        text: "LocalDate.plusYears adjusts an invalid day of month to the last valid day; adding one year to a leap day lands on February 28 in a non-leap year.",
        source: `${API}java/time/LocalDate.html#plusYears(long)`,
      },
      {
        text: "Duration models a time-based amount, while Period models a date-based amount; Instant.until(Instant) returns the timeline Duration to the second instant.",
        source: `${API}java/time/Instant.html#until(java.time.Instant)`,
      },
      {
        text: "A region ZoneId applies historical and daylight-saving rules; a ZoneOffset is only a fixed offset from UTC.",
        source: `${API}java/time/ZoneId.html`,
      },
    ],
    pitfall: {
      assumption: "byte + byte stays byte.",
      reality: "Both operands are promoted, and the result is int.",
    },
  },
  {
    id: "flow",
    title: "Flow & patterns",
    description:
      "Trace branch selection, scope, dominance, and exhaustiveness.",
    concepts: [
      "switch expressions",
      "pattern variables",
      "record patterns",
      "guards",
      "unnamed variables",
    ],
    rules: [
      {
        text: "A switch expression must be exhaustive and produce a value or throw; a block arm uses yield for its value.",
        source: `${JLS}jls-15.html#jls-15.28`,
      },
      {
        text: "Pattern switch labels are checked for dominance; a broad earlier pattern can make a later label illegal.",
        source: `${JLS}jls-14.html#jls-14.11.1`,
      },
      {
        text: "Pattern variables have flow-sensitive scope: a variable exists only where its pattern definitely matched.",
        source: `${JLS}jls-6.html#jls-6.3`,
      },
      {
        text: "An unnamed variable (_) declares a value that cannot be read by name; it is useful when only the match matters.",
        source:
          "https://docs.oracle.com/en/java/javase/25/language/java-se-language-updates.pdf",
      },
      {
        text: "Supplemental preview study: primitive type patterns and primitive selectors in switch require preview options in Java 25.",
        source:
          "https://docs.oracle.com/en/java/javase/25/language/java-language-changes-summary.html",
      },
    ],
    pitfall: {
      assumption: "A matching case null is implied by a type pattern.",
      reality:
        "null needs its own case label when it is to be handled by the switch.",
    },
  },
  {
    id: "oop",
    title: "Classes & construction",
    description:
      "Prove what compiles, what initializes first, and which method runs.",
    concepts: [
      "object lifecycle and nested classes",
      "constructors",
      "varargs and overloading",
      "encapsulation and immutability",
      "overriding",
      "functional and private interface methods",
      "records",
      "sealed types",
      "enums",
    ],
    rules: [
      {
        text: "Before this(...) or super(...), Java 25 permits validation and simple assignment to an as-yet-uninitialized field declared in the current class; reading that field, compound updates, and instance method calls remain illegal.",
        source:
          "https://docs.oracle.com/javase/specs/jls/se25/html/jls-6.html#jls-6.5.6.1",
      },
      {
        text: "An instance method call dispatches according to the runtime class, even when the reference has a superclass type.",
        source: `${JLS}jls-15.html#jls-15.12.4.4`,
      },
      {
        text: "A record is implicitly final; its components determine private final fields and public accessor methods.",
        source: `${JLS}jls-8.html#jls-8.10`,
      },
      {
        text: "A direct subtype of a sealed class or interface must declare itself final, sealed, or non-sealed, subject to record and enum rules.",
        source: `${JLS}jls-8.html#jls-8.1.1.2`,
      },
      {
        text: "Static methods are hidden rather than overridden; selecting one uses the compile-time reference type.",
        source: `${JLS}jls-8.html#jls-8.4.8.2`,
      },
      {
        text: "A non-static member class needs an enclosing instance; a local or anonymous class may capture only final or effectively final local variables.",
        source: `${JLS}jls-8.html#jls-8.1.3`,
      },
      {
        text: "A varargs parameter is an array inside the method and must be the final formal parameter; ordinary fixed-arity applicability is considered before variable arity.",
        source: `${JLS}jls-8.html#jls-8.4.1`,
      },
      {
        text: "An enum constructor is not invoked directly; enum constants are the instances and may supply constant-specific class bodies.",
        source: `${JLS}jls-8.html#jls-8.9`,
      },
      {
        text: "A functional interface has one abstract method after Object-method and inherited-method rules; private interface methods can share implementation but are not inherited.",
        source: `${JLS}jls-9.html#jls-9.8`,
      },
    ],
    pitfall: {
      assumption: "The reference type decides an overridden instance method.",
      reality:
        "The runtime object decides the implementation; the reference type only constrains which members are callable.",
    },
  },
  {
    id: "exceptions",
    title: "Exceptions & resources",
    description:
      "Separate compile-time handling obligations from runtime control flow.",
    concepts: [
      "checked exceptions",
      "custom exceptions",
      "catch ordering",
      "try with resources",
      "suppression",
      "finally",
    ],
    rules: [
      {
        text: "A checked exception that can escape a method must be caught or declared in its throws clause.",
        source: `${JLS}jls-11.html#jls-11.2`,
      },
      {
        text: "A catch clause is illegal if an earlier catch already handles all of its possible exception types.",
        source: `${JLS}jls-11.html#jls-11.2.3`,
      },
      {
        text: "Try-with-resources closes successfully initialized resources in reverse declaration order.",
        source: `${JLS}jls-14.html#jls-14.20.3`,
      },
      {
        text: "When both the try body and a resource close throw, the body exception is primary and close exceptions are suppressed.",
        source: `${JLS}jls-14.html#jls-14.20.3`,
      },
      {
        text: "If finally completes abruptly, its reason replaces the pending return or exception from try or catch.",
        source: `${JLS}jls-14.html#jls-14.20.2`,
      },
      {
        text: "A custom checked exception extends Exception (but not RuntimeException) and must obey catch-or-declare rules when it can escape.",
        source: `${JLS}jls-11.html#jls-11.1.1`,
      },
    ],
    pitfall: {
      assumption:
        "A close failure always replaces the exception from the try body.",
      reality:
        "The body failure stays primary and the close failure is suppressed.",
    },
  },
  {
    id: "collections",
    title: "Collections & generics",
    description:
      "Reason from each collection contract, mutability boundary, and type parameter.",
    concepts: [
      "arrays",
      "factory collections",
      "Deque",
      "sequenced collections",
      "maps",
      "generics",
      "comparators",
    ],
    rules: [
      {
        text: "List.of creates an unmodifiable list and rejects null elements; its list order is the argument order.",
        source: `${API}java/util/List.html`,
      },
      {
        text: "Set.of rejects null and duplicate arguments; its iteration order is unspecified.",
        source: `${API}java/util/Set.html`,
      },
      {
        text: "Arrays.asList returns a fixed-size list backed by the array: set changes an element, while add and remove are unsupported.",
        source: `${API}java/util/Arrays.html`,
      },
      {
        text: "List<String> is not a subtype of List<Object>; a wildcard can express safe read or write constraints.",
        source: `${JLS}jls-4.html#jls-4.5.1`,
      },
      {
        text: "A List.reversed() result is a reverse-ordered view, so changes in a mutable backing list can be reflected in the view.",
        source: `${API}java/util/List.html`,
      },
      {
        text: "ArrayDeque supports queue operations at both ends, rejects null, and uses add/remove/element methods that throw where offer/poll/peek use status values.",
        source: `${API}java/util/ArrayDeque.html`,
      },
    ],
    pitfall: {
      assumption:
        "Unmodifiable, fixed-size, and immutable-backed lists behave alike.",
      reality:
        "List.of rejects element replacement; Arrays.asList permits it and writes through to the array.",
    },
  },
  {
    id: "streams",
    title: "Streams & pipelines",
    description:
      "Trace when a pipeline runs and what each operation is permitted to promise.",
    concepts: [
      "lambdas and functional interfaces",
      "object and primitive streams",
      "laziness",
      "intermediate and terminal operations",
      "sorting and concatenation",
      "reduction and grouping",
      "collectors",
      "Optional",
      "gatherers",
    ],
    rules: [
      {
        text: "Intermediate operations are lazy; a terminal operation triggers evaluation of the pipeline.",
        source: `${API}java/util/stream/package-summary.html`,
      },
      {
        text: "A terminal operation need not invoke every intermediate lambda: the implementation may elide stages whose removal cannot affect the result, so do not rely on their side effects.",
        source: `${API}java/util/stream/package-summary.html`,
      },
      {
        text: "A stream should be operated on only once; reusing it after a terminal operation may throw IllegalStateException.",
        source: `${API}java/util/stream/Stream.html`,
      },
      {
        text: "Stream.toList returns an unmodifiable list; it need not have the same null policy as List.of.",
        source: `${API}java/util/stream/Stream.html#toList()`,
      },
      {
        text: "findFirst respects encounter order when present; findAny may return any element, which is useful for parallel evaluation.",
        source: `${API}java/util/stream/Stream.html`,
      },
      {
        text: "A gatherer defines a custom intermediate operation; a gatherer without a combiner is evaluated sequentially even in a parallel pipeline.",
        source: `${API}java/util/stream/Gatherer.html`,
      },
      {
        text: "A lambda is typed by its target functional interface, and captured local variables must be final or effectively final.",
        source: `${JLS}jls-15.html#jls-15.27`,
      },
      {
        text: "A reduce identity must be neutral and the accumulator/combiner must be associative for reliable parallel reduction.",
        source: `${API}java/util/stream/Stream.html#reduce(java.lang.Object,java.util.function.BinaryOperator)`,
      },
      {
        text: "groupingBy produces a Map of classification keys to downstream results; partitioningBy always produces Boolean true and false keys.",
        source: `${API}java/util/stream/Collectors.html`,
      },
    ],
    pitfall: {
      assumption: "Calling filter or map executes the lambda immediately.",
      reality:
        "The pipeline stays lazy until a terminal operation needs elements.",
    },
  },
  {
    id: "packaging",
    title: "Modules & launch",
    description:
      "Resolve visibility, imports, and entry points with the exact Java 25 rules.",
    concepts: [
      "JPMS",
      "exports and opens",
      "requires transitive",
      "module imports",
      "instance main",
      "multi-file source programs",
      "unnamed and automatic modules",
    ],
    rules: [
      {
        text: "A module import declaration imports accessible public top-level types from packages exported by a module; it does not itself require the source file to be in a named module.",
        source:
          "https://docs.oracle.com/en/java/javase/25/language/module-import-declarations.html",
      },
      {
        text: "Multiple module imports may make a simple type name ambiguous; a single-type import can resolve that name.",
        source:
          "https://docs.oracle.com/en/java/javase/25/language/module-import-declarations.html",
      },
      {
        text: "requires transitive makes a dependency readable to modules that require the declaring module.",
        source: `${JLS}jls-7.html#jls-7.7.1`,
      },
      {
        text: "exports allows ordinary access to public types in a package; opens grants reflective access to that package.",
        source: `${JLS}jls-7.html#jls-7.7.2`,
      },
      {
        text: "A compact source file implicitly declares a class and can use an instance main; its java.lang.IO calls still need the IO qualifier unless explicitly imported.",
        source:
          "https://docs.oracle.com/en/java/javase/25/language/java-language-changes-release.html",
      },
      {
        text: "Classpath code belongs to the unnamed module, which reads every observable module; a plain JAR on the module path can become an automatic module.",
        source: `${JLS}jls-7.html#jls-7.7.5`,
      },
      {
        text: "The launcher accepts one initial source file, derives its source tree, and compiles referenced source files found there as needed for a multi-file program.",
        source:
          "https://docs.oracle.com/en/java/javase/25/docs/specs/man/java.html#using-source-file-mode-to-launch-source-code-programs",
      },
    ],
    pitfall: {
      assumption:
        "import module java.base has the same reach as import java.util.*.",
      reality:
        "It also imports accessible public types from other packages exported by java.base, such as java.util.stream.",
    },
  },
  {
    id: "concurrency",
    title: "Concurrency & context",
    description:
      "Predict task lifecycle, visibility, and bounded context propagation.",
    concepts: [
      "threads and executors",
      "Runnable and Callable",
      "virtual threads",
      "synchronization",
      "Lock and atomic APIs",
      "concurrent collections and parallel streams",
      "scoped values",
      "structured concurrency",
    ],
    rules: [
      {
        text: "Virtual threads are Java Thread instances designed for many concurrent tasks that spend time blocked; they are not faster CPU workers.",
        source:
          "https://docs.oracle.com/en/java/javase/25/core/virtual-threads.html",
      },
      {
        text: "Thread.start schedules a new thread; directly calling run on a platform Thread created with a Runnable invokes that task in the caller, while directly calling run on a virtual Thread does nothing.",
        source: `${API}java/lang/Thread.html`,
      },
      {
        text: "A ScopedValue binding is available only during its dynamic scope and reverts when that scope exits.",
        source: `${API}java/lang/ScopedValue.html`,
      },
      {
        text: "An inner ScopedValue binding temporarily shadows an outer binding; the outer value returns afterward.",
        source: `${API}java/lang/ScopedValue.html`,
      },
      {
        text: "Supplemental preview study: StructuredTaskScope is a preview API in Java 25; its use requires preview to be enabled.",
        source: `${API}java/util/concurrent/StructuredTaskScope.html`,
      },
      {
        text: "Callable produces a result and may throw checked exceptions; ExecutorService.submit returns a Future whose get reports task failure through ExecutionException.",
        source: `${API}java/util/concurrent/Callable.html`,
      },
      {
        text: "A Lock must normally be released in finally after a successful lock call; ReentrantLock supports reentrancy but does not create automatic lexical locking.",
        source: `${API}java/util/concurrent/locks/ReentrantLock.html`,
      },
    ],
    pitfall: {
      assumption: "ScopedValue is a mutable variable shared by every thread.",
      reality:
        "Bindings are per thread and scoped to a call; structured child tasks can inherit them under the specified rules.",
    },
  },
  {
    id: "io",
    title: "Files, paths & I/O",
    description:
      "Follow path operations, stream ownership, and failure timing.",
    concepts: [
      "Path",
      "Files",
      "character streams",
      "buffering",
      "serialization",
      "file attributes",
      "Reader.of and locale-aware Console I/O",
    ],
    rules: [
      {
        text: "Path.normalize removes redundant name elements lexically; it does not access the file system.",
        source: `${API}java/nio/file/Path.html#normalize()`,
      },
      {
        text: "Resolving an absolute Path against another Path returns the absolute argument on the default provider.",
        source: `${API}java/nio/file/Path.html#resolve(java.nio.file.Path)`,
      },
      {
        text: "Files.lines returns a lazy Stream backed by an open file; close the stream, normally with try-with-resources.",
        source: `${API}java/nio/file/Files.html#lines(java.nio.file.Path)`,
      },
      {
        text: "Files.readString reads the full file into a String and decodes UTF-8 when no charset is supplied.",
        source: `${API}java/nio/file/Files.html#readString(java.nio.file.Path)`,
      },
      {
        text: "Object serialization requires a class to implement Serializable; static fields are not part of an instance’s serialized state.",
        source:
          "https://docs.oracle.com/en/java/javase/25/docs/specs/serialization/serial-arch.html",
      },
      {
        text: "Files.readAttributes can read BasicFileAttributes such as size, timestamps and file kind in one operation.",
        source: `${API}java/nio/file/Files.html#readAttributes(java.nio.file.Path,java.lang.Class,java.nio.file.LinkOption...)`,
      },
      {
        text: "Reader.of creates a Reader over a CharSequence; closing it has no external resource to release.",
        source: `${API}java/io/Reader.html#of(java.lang.CharSequence)`,
      },
    ],
    pitfall: {
      assumption:
        "Path.normalize proves that a path exists or resolves symbolic links.",
      reality:
        "It only transforms path names; toRealPath performs file-system resolution.",
    },
  },
  {
    id: "localization",
    title: "Locales & formatting",
    description:
      "Separate a value from the locale, zone, and pattern used to display it.",
    concepts: [
      "Locale",
      "ResourceBundle",
      "NumberFormat",
      "MessageFormat",
      "currency and percentage",
      "parsing",
      "java.time",
    ],
    rules: [
      {
        text: "Locale identifies language and optional region or variant; it does not itself translate application text.",
        source:
          "https://docs.oracle.com/en/java/javase/25/intl/internationalization-overview.html",
      },
      {
        text: "ResourceBundle.getBundle searches candidates for the requested locale and can fall back to a base bundle.",
        source: `${API}java/util/ResourceBundle.html`,
      },
      {
        text: "NumberFormat currency and number factories use locale-specific presentation rules; their output should not be hard-coded by country guesswork.",
        source: `${API}java/text/NumberFormat.html`,
      },
      {
        text: "MessageFormat refers to arguments by numeric indexes such as {0}; locale-sensitive subformats are specified by the pattern or formatter.",
        source: `${API}java/text/MessageFormat.html`,
      },
      {
        text: "LocalDate holds a date without a time or time zone; ZonedDateTime includes zone rules.",
        source: `${API}java/time/LocalDate.html`,
      },
      {
        text: "NumberFormat currency and percent instances both format and parse with locale-specific symbols; parsing returns a Number and may stop before the end unless the position is checked.",
        source: `${API}java/text/NumberFormat.html`,
      },
      {
        text: "MessageFormat.parse returns argument values according to the pattern's subformats, while apostrophes quote pattern text.",
        source: `${API}java/text/MessageFormat.html#parse(java.lang.String)`,
      },
    ],
    pitfall: {
      assumption: "Changing the default Locale changes a LocalDate value.",
      reality:
        "It changes locale-sensitive formatting and lookup; the date value remains the same.",
    },
  },
];

export const JAVA_25_FEATURES: Java25FeatureBrief[] = [
  {
    id: "module-imports",
    title: "Module import declarations",
    status: "permanent",
    scope: "objective-aligned",
    summary:
      "import module M imports accessible public types from packages exported by M and qualifying readable modules.",
    examLens:
      "Resolve simple-name collisions; do not confuse an import with a module requires directive.",
    source:
      "https://docs.oracle.com/en/java/javase/25/language/module-import-declarations.html",
  },
  {
    id: "compact-source",
    title: "Compact source files & instance main",
    status: "permanent",
    scope: "objective-aligned",
    summary:
      "A source file can implicitly declare a class and launch an eligible instance main method.",
    examLens:
      "Identify launchable main forms and remember that IO.println needs its class qualifier.",
    source:
      "https://docs.oracle.com/en/java/javase/25/language/java-language-changes-release.html",
  },
  {
    id: "flexible-constructors",
    title: "Flexible constructor bodies",
    status: "permanent",
    scope: "objective-aligned",
    summary:
      "Validation and simple assignments to eligible fields may precede this(...) or super(...); reading the instance or invoking its methods remains restricted.",
    examLens:
      "Distinguish legal early field initialization from illegal reads, compound updates, or instance method calls.",
    source:
      "https://docs.oracle.com/en/java/javase/25/language/flexible-constructor-bodies.html",
  },
  {
    id: "unnamed-variables",
    title: "Unnamed variables & patterns",
    status: "permanent",
    scope: "objective-aligned",
    summary:
      "The underscore can declare a value that is intentionally unused in supported declaration and pattern contexts.",
    examLens:
      "Know where _ may be declared, that it cannot be read, and how multiple unnamed declarations can share a scope.",
    source:
      "https://docs.oracle.com/en/java/javase/25/language/unnamed-variables-and-patterns.html",
  },
  {
    id: "stream-gatherers",
    title: "Stream Gatherers",
    status: "permanent",
    scope: "objective-aligned",
    summary:
      "Gatherers provide reusable custom intermediate operations including fixed/sliding windows, folds and scans.",
    examLens:
      "Separate gatherers from terminal collectors and recognize when a missing combiner forces sequential evaluation.",
    source: `${API}java/util/stream/Gatherer.html`,
  },
  {
    id: "instant-until",
    title: "Instant.until(Instant)",
    status: "permanent",
    scope: "objective-aligned",
    summary:
      "Instant can directly return the Duration from itself until another instant.",
    examLens:
      "Keep timeline Duration arithmetic distinct from calendar Period arithmetic.",
    source: `${API}java/time/Instant.html#until(java.time.Instant)`,
  },
  {
    id: "reader-of",
    title: "Reader.of(CharSequence)",
    status: "permanent",
    scope: "objective-aligned",
    summary:
      "Reader.of exposes any CharSequence through the character-stream API without an external resource.",
    examLens:
      "Trace reads and end-of-stream behavior, and do not assume close owns an external file or socket.",
    source: `${API}java/io/Reader.html#of(java.lang.CharSequence)`,
  },
  {
    id: "console-locale",
    title: "Locale-aware Console output",
    status: "permanent",
    scope: "objective-aligned",
    summary:
      "Console formatting methods can use an explicit Locale for localized terminal output.",
    examLens:
      "Distinguish explicit-locale formatting from methods that use the formatter or JVM default locale.",
    source: `${API}java/io/Console.html`,
  },
  {
    id: "forkjoin-scheduling",
    title: "ForkJoinPool scheduling updates",
    status: "permanent",
    scope: "objective-aligned",
    summary:
      "ForkJoinPool implements ScheduledExecutorService in Java 25 and adds timeout-aware task submission.",
    examLens:
      "Recognize scheduling contracts without confusing a timeout action with successful task completion.",
    source: `${API}java/util/concurrent/ForkJoinPool.html`,
  },
  {
    id: "primitive-patterns",
    title: "Primitive patterns & switch",
    status: "preview",
    scope: "supplemental",
    summary:
      "Primitive types participate in more pattern, instanceof, and switch contexts when preview is enabled.",
    examLens:
      "Supplemental preview material: not explicitly listed in the reproduced 1Z0–831 objectives. Keep it outside exam-scored practice unless Oracle confirms scope.",
    source:
      "https://docs.oracle.com/en/java/javase/25/language/java-language-changes-summary.html",
  },
  {
    id: "scoped-values",
    title: "Scoped values",
    status: "permanent",
    scope: "objective-aligned",
    summary:
      "A value can be bound for a bounded call and read by callees without threading it through parameters.",
    examLens:
      "Trace nested rebinding and the value after control exits the inner and outer scopes.",
    source: `${API}java/lang/ScopedValue.html`,
  },
  {
    id: "structured-concurrency",
    title: "Structured concurrency",
    status: "preview",
    scope: "supplemental",
    summary:
      "A task scope groups forked work under a bounded lifetime, with coordinated completion and cancellation.",
    examLens:
      "Supplemental preview material: not explicitly listed in the reproduced 1Z0–831 objectives. Keep it outside exam-scored practice unless Oracle confirms scope.",
    source:
      "https://docs.oracle.com/en/java/javase/25/core/structured-concurrency.html",
  },
];
