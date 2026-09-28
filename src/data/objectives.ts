import type { DomainSlug } from "./curriculum";

export const EXAM_OBJECTIVES_URL =
  "https://mylearn.oracle.com/ou/exam/java-se-25-developer-professional-1z0-831/105037/161532/270890";

export const EXAM_OBJECTIVES = [
  {
    id: "val-primitives",
    domain: "values",
    title: "Primitives, wrappers, expressions and casting",
  },
  {
    id: "val-text",
    domain: "values",
    title: "String, StringBuilder and text blocks",
  },
  {
    id: "val-time",
    domain: "values",
    title: "Date, time, Duration, Period, Instant, zones and DST",
  },
  {
    id: "flow-control",
    domain: "flow",
    title: "Decisions, switches, loops, break and continue",
  },
  {
    id: "oop-lifecycle",
    domain: "oop",
    title: "Objects, nested classes, references and garbage collection",
  },
  {
    id: "oop-classes",
    domain: "oop",
    title: "Classes, records, members, constructors and initializers",
  },
  {
    id: "oop-overloads",
    domain: "oop",
    title: "Overloading and variable-argument methods",
  },
  {
    id: "oop-scope",
    domain: "oop",
    title: "Scope, encapsulation, immutability, var and unnamed variables",
  },
  {
    id: "oop-inheritance",
    domain: "oop",
    title: "Inheritance, sealed types, overriding and polymorphism",
  },
  {
    id: "oop-interfaces",
    domain: "oop",
    title: "Interfaces and functional, private, static and default methods",
  },
  {
    id: "oop-enums",
    domain: "oop",
    title: "Enums with fields, methods and constructors",
  },
  {
    id: "exceptions",
    domain: "exceptions",
    title: "Exceptions, custom exceptions, multi-catch and resources",
  },
  {
    id: "coll-arrays",
    domain: "collections",
    title: "Arrays and array type behavior",
  },
  {
    id: "coll-core",
    domain: "collections",
    title: "List, Set and Map operations and sorting",
  },
  {
    id: "coll-deque",
    domain: "collections",
    title: "Deque and sequenced collections",
  },
  {
    id: "stream-lambdas",
    domain: "streams",
    title: "Lambdas and functional interfaces",
  },
  {
    id: "stream-shapes",
    domain: "streams",
    title: "Object and primitive stream construction",
  },
  {
    id: "stream-transform",
    domain: "streams",
    title: "Filter, transform, flatten, concatenate and sort",
  },
  {
    id: "stream-reduce",
    domain: "streams",
    title: "Reduction, grouping, partitioning and collectors",
  },
  {
    id: "stream-parallel",
    domain: "streams",
    title: "Gatherers, parallel streams and encounter order",
  },
  {
    id: "pkg-modules",
    domain: "packaging",
    title: "Modules, services, reflection and module imports",
  },
  {
    id: "pkg-deploy",
    domain: "packaging",
    title: "Source launch, multi-file programs, JARs and runtime images",
  },
  {
    id: "conc-tasks",
    domain: "concurrency",
    title: "Platform/virtual threads, tasks, executors and scoped values",
  },
  {
    id: "conc-safety",
    domain: "concurrency",
    title: "Synchronization, locks, atomics and visibility",
  },
  {
    id: "conc-parallel",
    domain: "concurrency",
    title: "Concurrent collections and parallel processing",
  },
  {
    id: "io-streams",
    domain: "io",
    title: "Console, byte and character streams",
  },
  {
    id: "io-serialization",
    domain: "io",
    title: "Object serialization and deserialization",
  },
  {
    id: "io-nio",
    domain: "io",
    title: "Path, Files, traversal and file attributes",
  },
  {
    id: "loc-bundles",
    domain: "localization",
    title: "Locales and resource bundles",
  },
  {
    id: "loc-messages",
    domain: "localization",
    title: "Message and date/time parsing and formatting",
  },
  {
    id: "loc-numbers",
    domain: "localization",
    title: "Number, currency and percentage parsing and formatting",
  },
] as const satisfies readonly {
  id: string;
  domain: DomainSlug;
  title: string;
}[];

export type ExamObjectiveId = (typeof EXAM_OBJECTIVES)[number]["id"];

export function objectivesForDomain(domain: DomainSlug) {
  return EXAM_OBJECTIVES.filter((objective) => objective.domain === domain);
}

type ObjectiveQuestion = {
  domain: DomainSlug;
  prompt: string;
  code?: string;
  tags: string[];
  objectives?: ExamObjectiveId[];
};

const includesAny = (text: string, terms: string[]) =>
  terms.some((term) => text.includes(term));

/**
 * Returns atomic syllabus coverage for both newly annotated questions and the
 * original bank. The fallback is deliberately conservative: it never credits
 * an item with every objective in a broad domain.
 */
export function objectiveIdsForQuestion(
  question: ObjectiveQuestion,
): ExamObjectiveId[] {
  if (question.objectives?.length) return [...new Set(question.objectives)];
  const text =
    `${question.prompt} ${question.code ?? ""} ${question.tags.join(" ")}`.toLowerCase();
  const ids: ExamObjectiveId[] = [];
  const add = (...values: ExamObjectiveId[]) => ids.push(...values);

  switch (question.domain) {
    case "values":
      if (includesAny(text, ["string", "text block", "charsequence"]))
        add("val-text");
      if (
        includesAny(text, [
          "date",
          "time",
          "period",
          "duration",
          "instant",
          "zone",
          "dst",
        ])
      )
        add("val-time");
      if (
        !ids.length ||
        includesAny(text, [
          "numeric",
          "wrapper",
          "boxing",
          "cast",
          "boolean",
          "math",
          "operator",
          "shift",
        ])
      )
        add("val-primitives");
      break;
    case "flow":
      add("flow-control");
      break;
    case "oop":
      if (
        includesAny(text, [
          "nested",
          "inner",
          "local class",
          "anonymous",
          "garbage",
          "eligible",
          "reference reassignment",
        ])
      )
        add("oop-lifecycle");
      if (
        includesAny(text, [
          "constructor",
          "initializer",
          "record",
          "field",
          "class initialization",
          "compact constructor",
        ])
      )
        add("oop-classes");
      if (includesAny(text, ["overload", "vararg", "variable argument"]))
        add("oop-overloads");
      if (
        includesAny(text, ["scope", "encaps", "immutable", "unnamed", " var "])
      )
        add("oop-scope");
      if (
        includesAny(text, [
          "inherit",
          "sealed",
          "override",
          "dispatch",
          "polymorph",
          "covariant",
          "super",
        ])
      )
        add("oop-inheritance");
      if (includesAny(text, ["interface", "default method", "functional"]))
        add("oop-interfaces");
      if (includesAny(text, ["enum"])) add("oop-enums");
      if (!ids.length) add("oop-classes");
      break;
    case "exceptions":
      add("exceptions");
      break;
    case "collections":
      if (
        includesAny(text, [
          "arraystore",
          "array covariance",
          "primitive array",
          "arrays.",
        ])
      )
        add("coll-arrays");
      if (
        includesAny(text, [
          "deque",
          "arraydeque",
          "sequenced",
          "reversed",
          "putfirst",
          "addfirst",
          "getfirst",
        ])
      )
        add("coll-deque");
      if (
        !ids.length ||
        includesAny(text, [
          "list",
          "set",
          "map",
          "collection",
          "comparator",
          "generic",
          "wildcard",
          "sort",
        ])
      )
        add("coll-core");
      break;
    case "streams":
      if (
        includesAny(text, [
          "lambda",
          "predicate",
          "function<",
          "consumer",
          "supplier",
          "effectively final",
          "target type",
        ])
      )
        add("stream-lambdas");
      if (
        includesAny(text, [
          "intstream",
          "longstream",
          "doublestream",
          "primitive stream",
          "stream.of",
        ])
      )
        add("stream-shapes");
      if (
        includesAny(text, [
          "filter",
          "map",
          "flatmap",
          "concat",
          "sorted",
          "takewhile",
          "dropwhile",
        ])
      )
        add("stream-transform");
      if (
        includesAny(text, [
          "reduce",
          "collector",
          "grouping",
          "partition",
          "tomap",
          "count",
          "average",
          "fold",
        ])
      )
        add("stream-reduce");
      if (
        includesAny(text, [
          "parallel",
          "gather",
          "foreachordered",
          "encounter order",
        ])
      )
        add("stream-parallel");
      if (!ids.length) add("stream-transform");
      break;
    case "packaging":
      if (
        includesAny(text, [
          "module",
          "exports",
          "opens",
          "requires",
          "service",
          "provides",
          "uses",
          "reflection",
        ])
      )
        add("pkg-modules");
      if (
        !ids.length ||
        includesAny(text, [
          "jar",
          "jlink",
          "launcher",
          "source file",
          "multi-file",
          "runtime image",
          "compact source",
          "main",
        ])
      )
        add("pkg-deploy");
      break;
    case "concurrency":
      if (
        includesAny(text, [
          "thread",
          "executor",
          "future",
          "callable",
          "runnable",
          "scoped",
          "latch",
          "queue",
          "interrupt",
        ])
      )
        add("conc-tasks");
      if (
        includesAny(text, [
          "synchronized",
          "lock",
          "volatile",
          "atomic",
          "happens-before",
          "thread safety",
          "compare-and-set",
        ])
      )
        add("conc-safety");
      if (
        includesAny(text, [
          "concurrenthashmap",
          "parallel stream",
          "forkjoin",
          "concurrent collection",
        ])
      )
        add("conc-parallel");
      if (!ids.length) add("conc-tasks");
      break;
    case "io":
      if (
        includesAny(text, [
          "serializ",
          "objectoutput",
          "objectinput",
          "transient",
        ])
      )
        add("io-serialization");
      if (
        includesAny(text, ["path", "files.", "file tree", "attribute", "walk"])
      )
        add("io-nio");
      if (
        !ids.length ||
        includesAny(text, [
          "console",
          "reader",
          "writer",
          "inputstream",
          "outputstream",
          "buffer",
          "encoding",
        ])
      )
        add("io-streams");
      break;
    case "localization":
      if (
        includesAny(text, [
          "locale",
          "resourcebundle",
          "resource bundle",
          "language tag",
        ])
      )
        add("loc-bundles");
      if (
        includesAny(text, [
          "messageformat",
          "datetimeformatter",
          "date formatter",
          "time formatter",
          "week-based",
        ])
      )
        add("loc-messages");
      if (
        includesAny(text, [
          "numberformat",
          "currency",
          "percent",
          "number formatter",
        ])
      )
        add("loc-numbers");
      if (!ids.length) add("loc-bundles");
      break;
  }
  return [...new Set(ids)];
}
