import type { Question } from "./questions";

type Pattern = "trace" | "compilation" | "api" | "scenario" | "select";
type Choice = readonly [text: string, explanation: string];
type Draft = Omit<Question, "options"> & {
  pattern: Pattern;
  choices: readonly [Choice, Choice, Choice, Choice];
};

function item({
  choices,
  ...question
}: Draft): Question & { pattern: Pattern } {
  return {
    ...question,
    options: choices.map(([text, explanation], index) => ({
      id: "ABCD"[index],
      text,
      explanation,
    })),
  };
}

/** Original study questions. These are not reproduced certification items. */
export const expansionCQuestions: Question[] = [
  item({
    id: "CPKG-01",
    domain: "packaging",
    difficulty: "Applied",
    type: "single",
    pattern: "compilation",
    prompt:
      "In this ordinary class, which Date type does the field use? Assume java.sql is observable.",
    code: "import module java.base;\nimport java.sql.Date;\nclass Ledger { Date posted; }",
    choices: [
      [
        "java.util.Date",
        "The module import brings java.util.Date in on demand, but a single-type import takes precedence.",
      ],
      [
        "The field is ambiguous between two Date types",
        "The explicit single-type import shadows the on-demand Date from java.base.",
      ],
      [
        "The class does not compile because module imports are preview",
        "Module import declarations are permanent in Java 25.",
      ],
      [
        "java.sql.Date",
        "Correct. The explicit single-type import wins over the on-demand module import.",
      ],
    ],
    answer: ["D"],
    explanation:
      "A module import imports exported public types on demand. A single-type import of java.sql.Date shadows the on-demand java.util.Date, so the field has type java.sql.Date.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/language/module-import-declarations.html",
    tags: ["Java 25", "module import", "import precedence"],
  }),
  item({
    id: "CPKG-02",
    domain: "packaging",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt:
      "What does requires static m.optional; mean in a module declaration? Select all that apply.",
    choices: [
      [
        "m.optional is required when compiling this module",
        "Correct. A static dependence must be observable at compile time.",
      ],
      [
        "m.optional is optional at run time",
        "Correct. The static modifier permits run-time resolution without that dependency.",
      ],
      [
        "Every module reading this module automatically reads m.optional",
        "Propagation is the role of transitive, not static alone.",
      ],
      [
        "The directive exposes non-exported packages of m.optional",
        "Readability never overrides a dependency's export boundaries.",
      ],
    ],
    answer: ["A", "B"],
    explanation:
      "The static modifier makes a module dependence mandatory at compile time but optional at run time. It does not imply transitive readability or bypass package exports.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html#jls-7.7.1",
    tags: ["JPMS", "requires static", "module resolution"],
  }),
  item({
    id: "CPKG-03",
    domain: "packaging",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt:
      "Module m.library contains exports lib.api to m.friend;. Which statements are true? Select all that apply.",
    choices: [
      [
        "m.friend can compile against public types in lib.api if it reads m.library",
        "Correct. A qualified export grants ordinary access to the named friend module.",
      ],
      [
        "Any module that reads m.library can compile against lib.api",
        "The to clause limits this export to m.friend.",
      ],
      [
        "The directive does not by itself allow deep reflection into private members",
        "Correct. Deep reflection requires an opening, not merely an export.",
      ],
      [
        "The export affects only run-time access, not compilation",
        "Exports enable ordinary compile-time access to public types.",
      ],
    ],
    answer: ["A", "C"],
    explanation:
      "A qualified export makes a package's public API accessible only to the specified target modules that can read the exporter. Private reflective access is controlled separately by opens.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html#jls-7.7.2",
    tags: ["JPMS", "qualified exports", "accessibility"],
  }),
  item({
    id: "CPKG-04",
    domain: "packaging",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt:
      "A plain JAR without module-info.class is placed on the module path and resolved as an automatic module. Which statements are true? Select all that apply.",
    choices: [
      [
        "It exports all of its packages",
        "Correct. Automatic modules export their packages to ease migration.",
      ],
      [
        "Its module name may come from an Automatic-Module-Name manifest attribute",
        "Correct. That attribute gives a stable name when present.",
      ],
      [
        "It becomes the unnamed module because it lacks module-info.class",
        "Placement on the module path makes it an automatic named module when resolved.",
      ],
      [
        "Its packages remain hidden unless an exports directive is written",
        "There is no descriptor to write such directives; automatic modules export their packages.",
      ],
    ],
    answer: ["A", "B"],
    explanation:
      "A non-modular JAR can migrate onto the module path as an automatic named module. Its packages are exported, and Automatic-Module-Name can supply the name instead of deriving one from the filename.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/module/ModuleFinder.html",
    tags: ["automatic modules", "module path", "JAR manifest"],
  }),
  item({
    id: "CPKG-05",
    domain: "packaging",
    difficulty: "Applied",
    type: "single",
    pattern: "api",
    prompt:
      "Classes under out include p/Main.class. What is the purpose of this command?",
    code: "jar --create --file app.jar --main-class p.Main -C out .",
    choices: [
      [
        "Launch p.Main immediately",
        "jar creates or updates an archive; the java launcher runs it later.",
      ],
      [
        "Create app.jar with out's contents and record p.Main as its entry point",
        "Correct. -C changes input directory and --main-class records the entry point.",
      ],
      [
        "Compile Java sources found under out",
        "Compilation is javac's job; jar packages existing files.",
      ],
      [
        "Link a custom runtime image named app.jar",
        "jlink creates runtime images; jar creates an archive.",
      ],
    ],
    answer: ["B"],
    explanation:
      "jar --create archives the files selected by -C out ., and --main-class records p.Main as the entry point. It neither compiles nor launches code.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/specs/man/jar.html",
    tags: ["jar", "main class", "packaging command"],
  }),
  item({
    id: "CPKG-06",
    domain: "packaging",
    difficulty: "Foundation",
    type: "single",
    pattern: "api",
    prompt:
      "Which command launches p.Main from named module m.app in the mods directory?",
    choices: [
      [
        "java -jar mods/m.app/p.Main",
        "-jar expects an executable JAR file, not a module/class path.",
      ],
      [
        "java --class-path mods --module p.Main/m.app",
        "The --module operand names the module first, then optionally /main-class.",
      ],
      [
        "java --module-path mods --module m.app/p.Main",
        "Correct. The module path locates m.app and the slash supplies p.Main.",
      ],
      [
        "jar --module-path mods --main-class p.Main m.app",
        "jar packages archives; it does not launch a module.",
      ],
    ],
    answer: ["C"],
    explanation:
      "The java launcher's --module-path option supplies modules, while -m or --module accepts module[/mainclass]. Thus m.app/p.Main identifies the entry point.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/specs/man/java.html",
    tags: ["java launcher", "module path", "-m"],
  }),
  item({
    id: "CPKG-07",
    domain: "packaging",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt:
      "Hello.java contains only this compact source. What happens with java Hello.java on Java 25?",
    code: 'void main() {\n    IO.println("ready");\n}',
    choices: [
      [
        "It fails because IO is in java.io and needs an import",
        "Java 25 places IO in java.lang, which ordinary source files implicitly import.",
      ],
      [
        "It fails because main must be static",
        "A launchable instance main is permanent in Java 25.",
      ],
      [
        "It prints nothing because IO.println requires an interactive console",
        "IO.println writes through standard output and does not require System.console().",
      ],
      [
        "It prints ready",
        "Correct. IO.println is the qualified call to Java 25's basic line-output API.",
      ],
    ],
    answer: ["D"],
    explanation:
      "A compact source file can declare an instance void main(). In Java 25, java.lang.IO is implicitly visible and its static println method is called as IO.println.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/language/compact-source-files-and-instance-main-methods.html",
    tags: ["Java 25", "compact source", "java.lang.IO"],
  }),
  item({
    id: "CPKG-08",
    domain: "packaging",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt:
      "Which statements hold for a Java 25 compact source file with an implicitly declared class? Select all that apply.",
    choices: [
      [
        "Public top-level types from packages exported by java.base are imported on demand",
        "Correct. Compact source files act as though they contain import module java.base.",
      ],
      [
        "Static methods of java.lang.IO can be called as bare println without a static import",
        "Java 25 requires qualifying them with IO or explicitly importing the static method.",
      ],
      [
        "A top-level method outside an explicit class can become a member of the implicit class",
        "Correct. That is the core compact-source transformation.",
      ],
      [
        "The file automatically imports every package from java.sql",
        "The implicit module import is java.base, not every standard module.",
      ],
    ],
    answer: ["A", "C"],
    explanation:
      "Java 25 compact sources implicitly import exported java.base packages on demand and gather top-level members into an implicit class. IO's static methods are not implicitly statically imported.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/language/module-import-declarations.html",
    tags: ["Java 25", "compact source", "implicit module import"],
  }),
  item({
    id: "CPKG-09",
    domain: "packaging",
    difficulty: "Applied",
    type: "single",
    pattern: "scenario",
    prompt:
      "A multi-release JAR has Multi-Release: true and class p.C at the root and under META-INF/versions/17 and META-INF/versions/25. Which p.C does Java 25 load?",
    choices: [
      [
        "The version 25 entry",
        "Correct. The runtime chooses the highest applicable versioned entry, here 25.",
      ],
      [
        "The root entry",
        "The root is the fallback when no applicable versioned entry exists.",
      ],
      [
        "The version 17 entry",
        "Version 25 is present and is a closer applicable match for a Java 25 runtime.",
      ],
      [
        "Loading fails because a class may appear only once in the archive",
        "Multi-release JARs intentionally contain version-specific alternatives.",
      ],
    ],
    answer: ["A"],
    explanation:
      "With a valid multi-release JAR, Java searches applicable versioned directories from the running release downward, then the root. Java 25 therefore selects META-INF/versions/25/p/C.class.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/specs/man/jar.html",
    tags: ["multi-release JAR", "class loading", "Java 25"],
  }),
  item({
    id: "CPKG-10",
    domain: "packaging",
    difficulty: "Expert",
    type: "multiple",
    pattern: "select",
    prompt:
      "What is true of open module m.library { exports lib.api; }? Select all that apply.",
    choices: [
      [
        "Its packages are open for deep reflection at run time",
        "Correct. An open module opens all of its packages.",
      ],
      [
        "Only lib.api is exported for ordinary compile-time access",
        "Correct. Opening the module does not export its other packages at compile time.",
      ],
      [
        "It may also declare opens lib.internal; for emphasis",
        "An opens directive is a compile-time error inside an open module.",
      ],
      [
        "Every package is automatically imported by modules that require m.library",
        "Module readability never imports every package into source code.",
      ],
    ],
    answer: ["A", "B"],
    explanation:
      "An open module opens all of its packages at run time, while ordinary compile-time access still follows exports. Explicit opens directives are forbidden in an open module.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-7.html#jls-7.7",
    tags: ["open module", "reflection", "exports"],
  }),
  item({
    id: "CCON-01",
    domain: "concurrency",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed before the unstarted thread is started?",
    code: 'Thread worker = Thread.ofVirtual().unstarted(() -> {});\nSystem.out.println(worker.isVirtual() + ":" + worker.isAlive());',
    choices: [
      [
        "false:false",
        "The thread is not alive yet, but it is already configured as virtual.",
      ],
      [
        "true:false",
        "Correct. The builder creates a virtual Thread, and unstarted leaves it not alive.",
      ],
      ["true:true", "Creating an unstarted thread does not execute its task."],
      [
        "The code does not compile",
        "Thread.ofVirtual and Builder.unstarted are Java 25 APIs.",
      ],
    ],
    answer: ["B"],
    explanation:
      "Thread.ofVirtual().unstarted creates a virtual Thread without starting it. isVirtual is true immediately; isAlive becomes true only while a started thread is executing.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Thread.Builder.html#unstarted(java.lang.Runnable)",
    tags: ["virtual threads", "Thread.Builder", "lifecycle"],
  }),
  item({
    id: "CCON-02",
    domain: "concurrency",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt:
      "What is printed? Assume the enclosing method handles InterruptedException.",
    code: 'try (var pool = java.util.concurrent.Executors.newSingleThreadExecutor()) {\n    var task = pool.submit(() -> { throw new IllegalArgumentException("bad"); });\n    try { task.get(); }\n    catch (java.util.concurrent.ExecutionException ex) {\n        System.out.println(ex.getCause().getClass().getSimpleName());\n    }\n}',
    choices: [
      [
        "ExecutionException",
        "The printed value is the class of the cause inside ExecutionException, not the wrapper.",
      ],
      ["bad", "The code prints the cause's class name, not its message."],
      [
        "IllegalArgumentException",
        "Correct. Future.get wraps the task's failure, and getCause reveals the original exception.",
      ],
      [
        "Nothing because submit discards task exceptions",
        "The exception is retained by the Future and reported by get.",
      ],
    ],
    answer: ["C"],
    explanation:
      "ExecutorService.submit returns a Future. A task exception makes Future.get throw ExecutionException whose cause is the original IllegalArgumentException.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/Future.html#get()",
    tags: ["Future", "ExecutionException", "ExecutorService"],
  }),
  item({
    id: "CCON-03",
    domain: "concurrency",
    difficulty: "Foundation",
    type: "multiple",
    pattern: "api",
    prompt:
      "Under normal completion, what does ExecutorService.close() do? Select all that apply.",
    choices: [
      [
        "It immediately interrupts every running task",
        "close normally starts an orderly shutdown rather than forcing all running tasks to stop.",
      ],
      [
        "It initiates an orderly shutdown",
        "Correct. Previously submitted tasks are allowed to execute.",
      ],
      [
        "It accepts new tasks until the last running task completes",
        "A shut-down executor rejects new submissions.",
      ],
      [
        "It waits until the executor terminates",
        "Correct. close waits for submitted tasks to finish and termination to occur.",
      ],
    ],
    answer: ["B", "D"],
    explanation:
      "ExecutorService.close initiates an orderly shutdown and waits for termination. Calling it does not normally discard queued work or continue accepting new work.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ExecutorService.html#close()",
    tags: ["ExecutorService", "close", "task lifecycle"],
  }),
  item({
    id: "CCON-04",
    domain: "concurrency",
    difficulty: "Applied",
    type: "multiple",
    pattern: "api",
    prompt:
      "Which statements about Future.cancel(true) are correct? Select all that apply.",
    choices: [
      [
        "It guarantees the computation has stopped before cancel returns",
        "Interruption is cooperative; a task may ignore it or take time to stop.",
      ],
      [
        "It may interrupt a running task's thread to attempt cancellation",
        "Correct. true permits interruption when the implementation knows the runner.",
      ],
      [
        "A successfully cancelled Future reports isDone() as true",
        "Correct. Cancellation is one of the completion states counted by isDone.",
      ],
      [
        "Future.get() then returns null for the cancelled task",
        "get throws CancellationException for a cancelled Future.",
      ],
    ],
    answer: ["B", "C"],
    explanation:
      "Cancellation is an attempt, not a guarantee of prompt task termination. A cancelled Future is done, and get reports cancellation by throwing CancellationException.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/Future.html#cancel(boolean)",
    tags: ["Future", "cancellation", "interruption"],
  }),
  item({
    id: "CCON-05",
    domain: "concurrency",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "Assuming outer() is called once, what happens?",
    code: 'static synchronized void outer() { inner(); }\nstatic synchronized void inner() { System.out.print("ok"); }',
    choices: [
      [
        "It prints ok",
        "Correct. Java monitors are reentrant, so the same thread can enter another synchronized static method of this class.",
      ],
      [
        "It deadlocks trying to enter inner",
        "The thread already owns the Class monitor and may reenter it.",
      ],
      [
        "It prints nothing because synchronized methods cannot call each other",
        "There is no such restriction; monitor reentrancy permits the call.",
      ],
      [
        "It does not compile because static methods cannot be synchronized",
        "Static synchronized methods are legal and lock the associated Class object.",
      ],
    ],
    answer: ["A"],
    explanation:
      "Both static synchronized methods use the class monitor. Java monitor locks are reentrant: a thread that owns a monitor can acquire it again, so inner prints ok.",
    sourceUrl:
      "https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html#jls-17.1",
    tags: ["synchronized", "monitor", "reentrancy"],
  }),
  item({
    id: "CCON-06",
    domain: "concurrency",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt:
      "Which statements about CountDownLatch are true? Select all that apply.",
    choices: [
      [
        "await() can proceed once the count reaches zero",
        "Correct. Zero releases current waiters and lets later await calls return.",
      ],
      [
        "countDown() throws when called again after the count reaches zero",
        "Extra countDown calls have no effect once the count is zero.",
      ],
      [
        "The same latch cannot be reset for another cycle",
        "Correct. CountDownLatch is one-shot; use another synchronization aid for repeated cycles.",
      ],
      [
        "await() itself decrements the count",
        "Only countDown decrements; await waits for that condition.",
      ],
    ],
    answer: ["A", "C"],
    explanation:
      "CountDownLatch starts with a fixed count. countDown moves it toward zero, await waits for zero, and the latch cannot be reset after release.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/CountDownLatch.html",
    tags: ["CountDownLatch", "await", "one-shot synchronization"],
  }),
  item({
    id: "CCON-07",
    domain: "concurrency",
    difficulty: "Foundation",
    type: "single",
    pattern: "trace",
    prompt: "What is printed by this bounded queue code?",
    code: 'var queue = new java.util.concurrent.ArrayBlockingQueue<Integer>(1);\nqueue.add(7);\nSystem.out.println(queue.offer(8) + ":" + queue.peek());',
    choices: [
      ["true:8", "The full queue cannot accept 8, and peek still sees 7."],
      ["false:8", "offer fails without replacing the existing head."],
      [
        "An IllegalStateException is thrown",
        "offer returns false on capacity failure; add would throw if it were used for the second insertion.",
      ],
      [
        "false:7",
        "Correct. offer is nonblocking and reports false when this capacity-one queue is full.",
      ],
    ],
    answer: ["D"],
    explanation:
      "ArrayBlockingQueue has capacity one and already contains 7. offer(8) returns false rather than blocking or throwing, leaving peek() at 7.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ArrayBlockingQueue.html#offer(E)",
    tags: ["BlockingQueue", "offer", "bounded capacity"],
    objectives: ["conc-parallel"],
  }),
  item({
    id: "CCON-08",
    domain: "concurrency",
    difficulty: "Expert",
    type: "multiple",
    pattern: "api",
    prompt:
      "For a CompletableFuture<Integer>, which statements about thenApply and thenCompose are true? Select all that apply.",
    code: "var base = java.util.concurrent.CompletableFuture.completedFuture(2);\nvar nested = base.thenApply(n -> java.util.concurrent.CompletableFuture.completedFuture(n + 1));\nvar flat = base.thenCompose(n -> java.util.concurrent.CompletableFuture.completedFuture(n + 1));",
    choices: [
      [
        "nested has type CompletableFuture<CompletableFuture<Integer>>",
        "Correct. thenApply wraps the function's Future result as its value.",
      ],
      [
        "flat has type CompletableFuture<CompletableFuture<Integer>>",
        "thenCompose flattens the returned completion stage.",
      ],
      [
        "thenApply waits on nested's inner Future automatically when nested.join() is called",
        "nested.join() returns the inner Future; it does not join that inner stage.",
      ],
      [
        "flat has type CompletableFuture<Integer>",
        "Correct. thenCompose returns a stage completed with the inner stage's value.",
      ],
    ],
    answer: ["A", "D"],
    explanation:
      "thenApply maps a value, so a function returning a CompletableFuture creates a nested stage. thenCompose flattens a function-returned completion stage into one CompletableFuture<Integer>.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/CompletableFuture.html#thenCompose(java.util.function.Function)",
    tags: ["CompletableFuture", "thenApply", "thenCompose"],
  }),
  item({
    id: "CCON-09",
    domain: "concurrency",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt:
      "Which statements about ConcurrentHashMap are correct? Select all that apply.",
    choices: [
      [
        "It accepts null values but not null keys",
        "ConcurrentHashMap rejects both null keys and null values.",
      ],
      [
        "put(null, value) throws NullPointerException",
        "Correct. Null keys are prohibited.",
      ],
      [
        "computeIfAbsent applies its mapping function atomically for an absent key",
        "Correct. The entire method invocation is atomic for that key.",
      ],
      [
        "Its iterators always throw ConcurrentModificationException if another thread writes",
        "Its iterators are weakly consistent, not fail-fast in that way.",
      ],
    ],
    answer: ["B", "C"],
    explanation:
      "ConcurrentHashMap disallows null keys and values. computeIfAbsent is atomic for the key, while its iterators are designed for concurrent access rather than guaranteed fail-fast exceptions.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html",
    tags: ["ConcurrentHashMap", "null", "computeIfAbsent"],
  }),
  item({
    id: "CCON-10",
    domain: "concurrency",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed by this code on the current thread?",
    code: 'Thread.currentThread().interrupt();\nboolean first = Thread.interrupted();\nboolean second = Thread.currentThread().isInterrupted();\nSystem.out.println(first + ":" + second);',
    choices: [
      [
        "false:false",
        "The first call sees the interrupt set by the preceding line.",
      ],
      [
        "true:true",
        "Thread.interrupted clears the current thread's interrupted status after reading it.",
      ],
      [
        "true:false",
        "Correct. The static call reads and clears the flag, so the subsequent instance check is false.",
      ],
      [
        "false:true",
        "The first call does not leave the flag set; it reads true and clears it.",
      ],
    ],
    answer: ["C"],
    explanation:
      "Thread.interrupted() checks and clears the current thread's interrupted status. isInterrupted() only checks the status, so it sees false afterward.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Thread.html#interrupted()",
    tags: ["interrupt", "Thread.interrupted", "thread state"],
  }),
  item({
    id: "CIO-01",
    domain: "io",
    difficulty: "Foundation",
    type: "single",
    pattern: "trace",
    prompt: "What is printed on any default file system?",
    code: 'var whole = java.nio.file.Path.of("reporting");\nvar prefix = java.nio.file.Path.of("report");\nSystem.out.println(whole.startsWith(prefix));',
    choices: [
      [
        "true, because reporting begins with the characters report",
        "Path.startsWith compares path elements, not a character prefix.",
      ],
      [
        "false, because reporting and report are different name elements",
        "Correct. Neither is a path-element prefix of the other.",
      ],
      [
        "The result depends on the file separator",
        "Both paths have one name element; the separator is irrelevant.",
      ],
      [
        "An exception because the paths need not exist",
        "Path.startsWith is lexical and does not require file existence.",
      ],
    ],
    answer: ["B"],
    explanation:
      "Path.startsWith(Path) compares the sequence of path elements. A single element reporting is not the same element as report, so the result is false.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Path.html#startsWith(java.nio.file.Path)",
    tags: ["Path", "startsWith", "lexical paths"],
  }),
  item({
    id: "CIO-02",
    domain: "io",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does this lexical path comparison print?",
    code: 'var from = java.nio.file.Path.of("a", "b");\nvar to = java.nio.file.Path.of("a", "c");\nSystem.out.println(from.relativize(to).equals(java.nio.file.Path.of("..", "c")));',
    choices: [
      [
        "false because relativize resolves both paths against the file system",
        "relativize computes a lexical relative path; it need not touch the file system.",
      ],
      [
        "false because the relative path is only c",
        "Starting at a/b requires moving up one name to a before entering c.",
      ],
      [
        "An exception because b and c do not exist",
        "No existence check is required for lexical relativization.",
      ],
      [
        "true",
        "Correct. From a/b, the relative path to a/c is ../c as path elements.",
      ],
    ],
    answer: ["D"],
    explanation:
      "Path.relativize constructs a relative Path; from a/b to a/c the elements are .. and c. Comparing Path objects avoids depending on a platform's separator character.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Path.html#relativize(java.nio.file.Path)",
    tags: ["Path", "relativize", "platform-independent"],
  }),
  item({
    id: "CIO-03",
    domain: "io",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt:
      "Assume ordinary regular files, matching providers, permission to copy, and no concurrent changes. Which Files.copy statements are true? Select all that apply.",
    choices: [
      [
        "REPLACE_EXISTING permits replacing an existing target file",
        "Correct. This option directs copy to replace an existing target.",
      ],
      [
        "Copying a directory with Files.copy recursively copies every descendant",
        "Files.copy does not recursively copy a directory tree; walkFileTree can be used for that.",
      ],
      [
        "COPY_ATTRIBUTES requests copying supported file attributes",
        "Correct. Which attributes can be copied still depends on file-system support.",
      ],
      [
        "Files.copy always performs an atomic transaction",
        "The API does not guarantee atomic copy; failure can leave an incomplete target.",
      ],
    ],
    answer: ["A", "C"],
    explanation:
      "REPLACE_EXISTING governs an existing target and COPY_ATTRIBUTES requests supported metadata. Copying a directory is not a recursive tree copy, and Files.copy is not atomic.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Files.html#copy(java.nio.file.Path,java.nio.file.Path,java.nio.file.CopyOption...)",
    tags: ["Files.copy", "CopyOption", "file tree"],
  }),
  item({
    id: "CIO-04",
    domain: "io",
    difficulty: "Applied",
    type: "multiple",
    pattern: "api",
    prompt:
      "Which statements about Files.walk(start) are correct? Select all that apply.",
    choices: [
      [
        "It eagerly materializes every descendant before returning",
        "The returned Stream visits entries as it is consumed.",
      ],
      [
        "The resulting Stream should be closed after use",
        "Correct. It holds directory resources and supports try-with-resources.",
      ],
      [
        "The starting path is included in the stream",
        "Correct. The walk begins with start at depth zero.",
      ],
      [
        "It follows symbolic links by default",
        "Following symbolic links requires the FOLLOW_LINKS option.",
      ],
    ],
    answer: ["B", "C"],
    explanation:
      "Files.walk returns a lazily populated Stream<Path> whose first element is the starting path. Close the stream to release open directory resources; symbolic links are not followed by default.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/nio/file/Files.html#walk(java.nio.file.Path,java.nio.file.FileVisitOption...)",
    tags: ["Files.walk", "Stream", "file tree"],
  }),
  item({
    id: "CIO-05",
    domain: "io",
    difficulty: "Applied",
    type: "multiple",
    pattern: "api",
    prompt:
      "For InputStream.transferTo(OutputStream), which statements are true? Select all that apply.",
    choices: [
      [
        "It returns the number of bytes transferred",
        "Correct. Its long result reports the number of copied bytes.",
      ],
      [
        "It always closes the input when transfer completes",
        "transferTo leaves stream closure to the caller.",
      ],
      [
        "It always flushes and closes the output",
        "The API does not promise to flush or close the target stream.",
      ],
      [
        "It transfers the remaining bytes from the input to the output",
        "Correct. It reads until end of stream and writes those bytes to the target.",
      ],
    ],
    answer: ["A", "D"],
    explanation:
      "transferTo copies all remaining input bytes into an OutputStream and returns the count. Neither stream is automatically closed by this method.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/InputStream.html#transferTo(java.io.OutputStream)",
    tags: ["InputStream", "transferTo", "resource ownership"],
  }),
  item({
    id: "CIO-06",
    domain: "io",
    difficulty: "Applied",
    type: "multiple",
    pattern: "api",
    prompt:
      "A PrintWriter is constructed with autoFlush set to true. Which calls trigger automatic flushing? Select all that apply.",
    choices: [
      [
        'print("x")',
        "print alone is not one of PrintWriter's automatic-flush triggers.",
      ],
      [
        'println("x")',
        "Correct. println triggers auto-flush when it is enabled.",
      ],
      [
        'printf("%s", "x")',
        "Correct. printf, like format, triggers auto-flush.",
      ],
      [
        'print("\\n")',
        "A newline character passed to print is not itself an auto-flush trigger for PrintWriter.",
      ],
    ],
    answer: ["B", "C"],
    explanation:
      "For PrintWriter, autoFlush runs on println, printf, and format calls. Unlike PrintStream, merely printing a newline does not trigger that behavior.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/PrintWriter.html",
    tags: ["PrintWriter", "autoFlush", "buffering"],
  }),
  item({
    id: "CIO-07",
    domain: "io",
    difficulty: "Foundation",
    type: "single",
    pattern: "trace",
    prompt: "What is printed by this reader code?",
    code: 'var reader = new java.io.BufferedReader(new java.io.StringReader("a\\r\\nb"));\nSystem.out.println(reader.readLine() + "|" + reader.readLine());',
    choices: [
      [
        "a\\r|b",
        "readLine removes the CRLF line terminator rather than retaining carriage return.",
      ],
      [
        "a\\n|b",
        "readLine does not include the newline character in its returned text.",
      ],
      [
        "a|b",
        "Correct. The first readLine returns a and the second returns b.",
      ],
      [
        "a|",
        "The trailing b is a second line even without a final line terminator.",
      ],
    ],
    answer: ["C"],
    explanation:
      "BufferedReader.readLine recognizes CR, LF, or CRLF as a line terminator and returns the line text without that terminator. The final unterminated line b is still returned.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/BufferedReader.html#readLine()",
    tags: ["BufferedReader", "readLine", "line terminators"],
  }),
  item({
    id: "CIO-08",
    domain: "io",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What is printed after writing one int to this byte-array stream?",
    code: 'var bytes = new java.io.ByteArrayOutputStream();\nvar data = new java.io.DataOutputStream(bytes);\ndata.writeInt(0x01020304);\nbyte[] raw = bytes.toByteArray();\nSystem.out.println(raw[0] + ":" + raw[3]);',
    choices: [
      [
        "1:4",
        "Correct. writeInt writes the high-order byte first, then the low-order byte.",
      ],
      [
        "4:1",
        "That would be low-order-byte-first encoding; DataOutputStream writes high-order first.",
      ],
      [
        "16909060:4",
        "Each raw array element is one byte, not the entire integer value.",
      ],
      [
        "The result depends on CPU endianness",
        "DataOutputStream specifies its byte order independently of the machine.",
      ],
    ],
    answer: ["A"],
    explanation:
      "DataOutputStream.writeInt emits four bytes in big-endian order. 0x01020304 therefore yields first byte 1 and fourth byte 4 on every platform.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/DataOutputStream.html#writeInt(int)",
    tags: ["DataOutputStream", "byte order", "binary I/O"],
  }),
  item({
    id: "CIO-09",
    domain: "io",
    difficulty: "Applied",
    type: "single",
    pattern: "scenario",
    prompt:
      "With default Java serialization and no writeReplace method, what happens when an ObjectOutputStream writes an instance of this class?",
    code: "class Plain { int value = 3; }\n// out is an ObjectOutputStream\nout.writeObject(new Plain());",
    choices: [
      [
        "Plain is serialized because it has only a primitive field",
        "Field types do not make an otherwise non-serializable class serializable.",
      ],
      [
        "Only value is skipped and an empty Plain object is written",
        "Default serialization requires the object class to be serializable.",
      ],
      [
        "NotSerializableException is thrown",
        "Correct. Plain does not implement Serializable.",
      ],
      [
        "The code does not compile",
        "writeObject accepts Object; the failure occurs when serialization is attempted.",
      ],
    ],
    answer: ["C"],
    explanation:
      "ObjectOutputStream.writeObject checks serializability at run time. Plain lacks Serializable and no substitution is provided, so it throws NotSerializableException.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/ObjectOutputStream.html#writeObject(java.lang.Object)",
    tags: ["serialization", "Serializable", "NotSerializableException"],
  }),
  item({
    id: "CIO-10",
    domain: "io",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What byte count is printed? The charset is explicit.",
    code: 'var bytes = new java.io.ByteArrayOutputStream();\ntry (var writer = new java.io.OutputStreamWriter(bytes, java.nio.charset.StandardCharsets.UTF_8)) {\n    writer.write("é");\n}\nSystem.out.println(bytes.toByteArray().length);',
    choices: [
      [
        "1",
        "The character é needs two bytes in UTF-8, even though Java represents it with one UTF-16 code unit.",
      ],
      [
        "2",
        "Correct. Closing the writer flushes the UTF-8 encoding of é as two bytes.",
      ],
      ["4", "UTF-8 encodes this character in two bytes, not four."],
      [
        "The count depends on the default charset",
        "StandardCharsets.UTF_8 is supplied explicitly.",
      ],
    ],
    answer: ["B"],
    explanation:
      "OutputStreamWriter encodes characters using the specified UTF-8 charset. The character é is U+00E9, encoded as two UTF-8 bytes; try-with-resources flushes the writer before inspection.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/io/OutputStreamWriter.html",
    tags: ["OutputStreamWriter", "UTF-8", "encoding"],
  }),
  item({
    id: "CLOC-01",
    domain: "localization",
    difficulty: "Applied",
    type: "multiple",
    pattern: "api",
    prompt:
      "Which statements about Locale.Builder are correct? Select all that apply.",
    choices: [
      [
        'setRegion("US") accepts a two-letter region code',
        "Correct. A two-letter ISO region is well-formed.",
      ],
      [
        'setRegion("USA") throws IllformedLocaleException',
        "Correct. A three-letter region is not a valid region subtag; three-digit codes are allowed instead.",
      ],
      [
        'setRegion("us") makes getCountry() return lowercase us',
        "Builder normalizes the resulting region to uppercase.",
      ],
      [
        "build() changes the JVM's default Locale",
        "Building a Locale object does not call Locale.setDefault.",
      ],
    ],
    answer: ["A", "B"],
    explanation:
      "Locale.Builder validates BCP 47 field syntax. US is a valid two-letter region; USA is not a valid two-letter or three-digit region. Building a Locale is separate from setting the default.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Locale.Builder.html#setRegion(java.lang.String)",
    tags: ["Locale.Builder", "BCP 47", "region validation"],
  }),
  item({
    id: "CLOC-02",
    domain: "localization",
    difficulty: "Foundation",
    type: "single",
    pattern: "trace",
    prompt: "What does this explicitly parsed BCP 47 tag print?",
    code: 'var locale = java.util.Locale.forLanguageTag("zh-Hant-TW");\nSystem.out.println(locale.getScript() + "/" + locale.getCountry());',
    choices: [
      [
        "zh/TW",
        "zh is the language; getScript returns the separate Hant script subtag.",
      ],
      [
        "HANT/tw",
        "Locale normalizes script to title case and region to upper case.",
      ],
      ["Hant/TW", "Correct. Hant is the script and TW is the region."],
      [
        "An IllformedLocaleException",
        "zh-Hant-TW is a well-formed language tag.",
      ],
    ],
    answer: ["C"],
    explanation:
      "Locale.forLanguageTag separates language, script, and region. The Hant script is title case and the TW region is uppercase in the resulting Locale.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Locale.html#forLanguageTag(java.lang.String)",
    tags: ["Locale", "script", "BCP 47"],
  }),
  item({
    id: "CLOC-03",
    domain: "localization",
    difficulty: "Applied",
    type: "single",
    pattern: "scenario",
    prompt:
      "Messages.properties exists with only title=Ready, and no other Messages bundle exists. What happens on the final line?",
    code: 'var bundle = java.util.ResourceBundle.getBundle("Messages", java.util.Locale.ROOT);\nbundle.getString("missing");',
    choices: [
      [
        "It returns null",
        "ResourceBundle.getString throws for an absent key rather than returning null.",
      ],
      [
        "It returns the key string missing",
        "ResourceBundle does not automatically use a missing key as its value.",
      ],
      ["It returns Ready", "Ready belongs to a different key, title."],
      [
        "It throws MissingResourceException",
        "Correct. The bundle exists but the requested key has no value.",
      ],
    ],
    answer: ["D"],
    explanation:
      "ResourceBundle.getString looks up the requested key through the bundle's parent chain. With no matching key, it throws MissingResourceException.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ResourceBundle.html#getString(java.lang.String)",
    tags: ["ResourceBundle", "missing key", "exception"],
  }),
  item({
    id: "CLOC-04",
    domain: "localization",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What does this explicitly German number parse print?",
    code: 'var nf = java.text.NumberFormat.getNumberInstance(java.util.Locale.GERMANY);\nSystem.out.println(nf.parse("1.234,5").doubleValue());',
    choices: [
      [
        "1.2345",
        "In German formatting the dot groups thousands and the comma separates the fractional part.",
      ],
      [
        "1234.5",
        "Correct. The grouping dot is removed and the decimal comma becomes the decimal fraction.",
      ],
      [
        "12345.0",
        "The comma is a decimal separator, not another grouping separator.",
      ],
      [
        "A ParseException because the JVM default locale may differ",
        "The explicit Locale.GERMANY controls this formatter.",
      ],
    ],
    answer: ["B"],
    explanation:
      "NumberFormat created for Locale.GERMANY parses the dot as a grouping separator and comma as a decimal separator, yielding the numeric value 1234.5.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/text/NumberFormat.html#parse(java.lang.String)",
    tags: ["NumberFormat", "parsing", "Locale.GERMANY"],
  }),
  item({
    id: "CLOC-05",
    domain: "localization",
    difficulty: "Applied",
    type: "single",
    pattern: "trace",
    prompt: "What string does this US formatter produce?",
    code: "var nf = java.text.NumberFormat.getNumberInstance(java.util.Locale.US);\nnf.setMinimumFractionDigits(2);\nnf.setMaximumFractionDigits(2);\nSystem.out.println(nf.format(1.2));",
    choices: [
      ["1.2", "The minimum fraction-digit setting adds a trailing zero."],
      ["1,20", "Locale.US uses a dot for decimal fractions, not a comma."],
      ["1.20", "Correct. Exactly two fraction digits are required."],
      [
        "1.200",
        "The maximum fraction-digit setting limits the output to two fractional digits.",
      ],
    ],
    answer: ["C"],
    explanation:
      "The explicit US NumberFormat uses a dot decimal separator. Setting both minimum and maximum fraction digits to two makes 1.2 display as 1.20.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/text/NumberFormat.html#setMinimumFractionDigits(int)",
    tags: ["NumberFormat", "fraction digits", "Locale.US"],
  }),
  item({
    id: "CLOC-06",
    domain: "localization",
    difficulty: "Foundation",
    type: "single",
    pattern: "trace",
    prompt: "What does this locale-aware date formatter print?",
    code: 'var date = java.time.LocalDate.of(2025, 1, 2);\nvar fmt = java.time.format.DateTimeFormatter.ofPattern("MMM d, uuuu", java.util.Locale.US);\nSystem.out.println(fmt.format(date));',
    choices: [
      [
        "January 2, 2025",
        "MMMM requests a full month name; MMM requests the abbreviated form.",
      ],
      [
        "Jan 02, 2025",
        "A single d prints the day without forced zero padding.",
      ],
      ["2 Jan, 2025", "The pattern places month before day."],
      [
        "Jan 2, 2025",
        "Correct. US MMM is the abbreviated month, and d is an unpadded day.",
      ],
    ],
    answer: ["D"],
    explanation:
      "With Locale.US, MMM formats January as Jan. A single d formats day 2 without a leading zero; uuuu prints the four-digit proleptic year.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/format/DateTimeFormatter.html#ofPattern(java.lang.String,java.util.Locale)",
    tags: ["DateTimeFormatter", "Locale.US", "pattern letters"],
  }),
  item({
    id: "CLOC-07",
    domain: "localization",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt:
      "What does the explicitly UK week-date formatter print for 1 January 2021?",
    code: "var date = java.time.LocalDate.of(2021, 1, 1);\nvar fmt = java.time.format.DateTimeFormatter.ofPattern(\"YYYY-'W'ww\", java.util.Locale.UK);\nSystem.out.println(fmt.format(date));",
    choices: [
      [
        "2020-W53",
        "Correct. This date belongs to the last UK week-based week of 2020.",
      ],
      [
        "2021-W01",
        "YYYY is week-based-year, which can differ from the calendar year near New Year.",
      ],
      ["2021-W53", "The week number is 53, but its week-based year is 2020."],
      [
        "2020-W01",
        "The week-based year is 2020, but this is its final week, not its first.",
      ],
    ],
    answer: ["A"],
    explanation:
      "Pattern Y is week-based-year and w is week-of-week-based-year. Under Locale.UK week rules, 2021-01-01 is in week 53 of week-based year 2020.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/format/DateTimeFormatter.html#patterns",
    tags: ["DateTimeFormatter", "week-based year", "Locale.UK"],
  }),
  item({
    id: "CLOC-08",
    domain: "localization",
    difficulty: "Expert",
    type: "single",
    pattern: "trace",
    prompt:
      "Using Java 25's America/New_York time-zone rules, what does this gap-time construction print?",
    code: 'var local = java.time.LocalDateTime.of(2025, 3, 9, 2, 30);\nvar zoned = java.time.ZonedDateTime.of(local, java.time.ZoneId.of("America/New_York"));\nSystem.out.println(zoned.toLocalTime() + "/" + zoned.getOffset());',
    choices: [
      [
        "02:30/-05:00",
        "02:30 falls in the spring gap and is not retained with the earlier offset.",
      ],
      [
        "03:30/-04:00",
        "Correct. The nonexistent local time shifts forward by the one-hour gap.",
      ],
      [
        "02:30/-04:00",
        "ZonedDateTime.of shifts the local time forward rather than pairing it with an offset that makes it invalid.",
      ],
      [
        "DateTimeException",
        "The ordinary of factory resolves a gap by shifting forward; ofStrict would reject invalid combinations.",
      ],
    ],
    answer: ["B"],
    explanation:
      "At the March 2025 New York spring transition, local 02:30 does not exist. ZonedDateTime.of moves it forward by the one-hour gap to 03:30 with offset -04:00.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/ZonedDateTime.html#of(java.time.LocalDateTime,java.time.ZoneId)",
    tags: ["ZoneId", "DST gap", "ZonedDateTime"],
    objectives: ["val-time"],
  }),
  item({
    id: "CLOC-09",
    domain: "localization",
    difficulty: "Applied",
    type: "multiple",
    pattern: "select",
    prompt:
      "Which statements about Java time-zone types are correct? Select all that apply.",
    choices: [
      [
        "ZoneOffset.ofHours(2) is a fixed +02:00 offset",
        "Correct. A ZoneOffset does not apply regional daylight-saving changes.",
      ],
      [
        'ZoneId.of("America/New_York") uses region-based rules that can differ by date',
        "Correct. A geographical ZoneId resolves to rules with time-dependent offsets.",
      ],
      [
        "ZoneId.systemDefault() is guaranteed to be UTC",
        "It reflects the host/JVM default zone and is not guaranteed to be UTC.",
      ],
      [
        "LocalDateTime.of(2025, 1, 1, 9, 0) already stores a ZoneId",
        "LocalDateTime has no zone or offset; a zone must be supplied separately.",
      ],
    ],
    answer: ["A", "B"],
    explanation:
      "ZoneOffset is a fixed offset, while a region ZoneId provides rules that may produce different offsets at different instants. LocalDateTime alone carries neither.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/ZoneId.html",
    tags: ["ZoneId", "ZoneOffset", "LocalDateTime"],
    objectives: ["val-time"],
  }),
  item({
    id: "CLOC-10",
    domain: "localization",
    difficulty: "Applied",
    type: "multiple",
    pattern: "api",
    prompt:
      "Which statements about explicit and default locales in NumberFormat are correct? Select all that apply.",
    choices: [
      [
        "getNumberInstance(Locale.US) selects US conventions regardless of the current FORMAT default",
        "Correct. The overload receives its Locale explicitly.",
      ],
      [
        "getNumberInstance() selects the current default FORMAT locale",
        "Correct. The no-argument factory uses the default formatting locale.",
      ],
      [
        "Locale.setDefault changes the default only for the calling thread",
        "The default Locale is JVM-wide, not thread-local.",
      ],
      [
        "Passing Locale.US to the factory permanently changes the JVM default",
        "Constructing a formatter for a Locale does not call Locale.setDefault.",
      ],
    ],
    answer: ["A", "B"],
    explanation:
      "An explicit Locale controls that NumberFormat instance. The no-argument factory uses the current default FORMAT locale; neither factory changes the JVM's default Locale.",
    sourceUrl:
      "https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/text/NumberFormat.html#getNumberInstance(java.util.Locale)",
    tags: ["NumberFormat", "default locale", "explicit Locale"],
  }),
];
