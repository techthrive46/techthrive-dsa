import { ALGO_LIST } from "@/lib/sorting";
import { MAX_TARGET, MIN_TARGET, SEARCH_ALGO_LIST } from "@/lib/searching";
import { RECURSION_ALGO_LIST } from "@/lib/recursion";
import { TREE_OP_LIST } from "@/lib/trees";
import { STRUCTURE_LIST, parseScript, type Operation, type StructureKey } from "@/lib/stacksQueues";
import { ARRAY_LIMITS, TREE_LIMITS, parseIntList } from "@/lib/inputs";
import type { CodeTab } from "@/hooks/useCodeTab";
import type { FunctionDeclaration, Part, Schema } from "@/lib/tutor/gemini";
import { compactState, type StepContext } from "@/lib/tutor/prompt";

/* ---------------- What the agent can touch ---------------- */

/** Topic-specific "load a new input" tool, plus suggestions that use it. */
export type AgentInput = {
  description: string;
  properties: Record<string, Schema>;
  required: string[];
  /** Applies validated args; returns an error message for the model, or null. */
  apply: (args: Record<string, unknown>) => string | null;
  suggestions: string[];
};

export type AgentHost = {
  frames: () => { caption: string; note: string }[];
  currentIndex: () => number;
  goTo: (index: number) => void;
  play: () => void;
  pause: () => void;
  setSpeed: (speed: number) => void;
  setCodeTab: (tab: CodeTab) => void;
  input: AgentInput;
  /** Step context after React has re-rendered with the latest state. */
  snapshot: () => Promise<StepContext>;
};

export type ActionKind = "step" | "search" | "play" | "pause" | "input" | "code" | "open" | "error";
export type ActionLog = { kind: ActionKind; label: string };

/* ---------------- Pages the agent can open ---------------- */

type PageEntry = { path: string; name: string; topic: string };

export const PAGES: PageEntry[] = [
  ...ALGO_LIST.map((a) => ({ path: `sorting/${a.key}`, name: a.name, topic: "sorting" })),
  ...SEARCH_ALGO_LIST.map((a) => ({ path: `searching/${a.key}`, name: a.name, topic: "searching" })),
  ...TREE_OP_LIST.map((a) => ({ path: `trees/${a.key}`, name: a.name, topic: "trees" })),
  ...RECURSION_ALGO_LIST.map((a) => ({ path: `recursion/${a.key}`, name: a.name, topic: "recursion" })),
  ...STRUCTURE_LIST.map((a) => ({ path: `stacks-queues/${a.key}`, name: a.name, topic: "stacks" })),
];

/* ---------------- Input loaders per topic ---------------- */

const intArray = (description: string): Schema => ({
  type: "ARRAY",
  description,
  items: { type: "INTEGER" },
});

const toInts = (v: unknown): number[] | null =>
  Array.isArray(v) && v.every((x) => typeof x === "number") ? (v as number[]) : null;

const listError = (values: number[] | null, limits = ARRAY_LIMITS, unique = false) => {
  if (!values) return "Pass the values as an array of integers.";
  const r = parseIntList(values.join(","), { ...limits, unique });
  return r.ok ? null : r.error;
};

export function sortingInput(setArray: (a: number[]) => void): AgentInput {
  const { minSize, maxSize, minValue, maxValue } = ARRAY_LIMITS;
  return {
    description: `Load a new array and restart the animation from step 1. ${minSize}–${maxSize} integers, each ${minValue}–${maxValue}. Use it to show a best case, worst case, duplicates, or an input the student asks for.`,
    properties: { array: intArray(`${minSize}–${maxSize} integers between ${minValue} and ${maxValue}.`) },
    required: ["array"],
    apply: (args) => {
      const values = toInts(args.array);
      const err = listError(values);
      if (err) return err;
      setArray(values!);
      return null;
    },
    suggestions: [
      "Show me the worst case",
      "Jump to the first swap and explain it",
      "Compare with Insertion Sort on this array",
    ],
  };
}

export function searchingInput(
  setArray: (a: number[]) => void,
  setTarget: (t: number) => void,
  sorted: boolean,
): AgentInput {
  const { minSize, maxSize, minValue, maxValue } = ARRAY_LIMITS;
  return {
    description: `Load a new array and/or target and restart from step 1. Array: ${minSize}–${maxSize} integers, each ${minValue}–${maxValue}${sorted ? " (sorted automatically, since this search needs sorted input)" : ""}. Target: ${MIN_TARGET}–${MAX_TARGET}. Use a target that is missing to show the "not found" case.`,
    properties: {
      array: intArray(`Optional. ${minSize}–${maxSize} integers between ${minValue} and ${maxValue}.`),
      target: { type: "INTEGER", description: `Optional. Value to search for, ${MIN_TARGET}–${MAX_TARGET}.` },
    },
    required: [],
    apply: (args) => {
      const values = args.array === undefined ? undefined : toInts(args.array);
      if (values !== undefined) {
        const err = listError(values);
        if (err) return err;
      }
      const t = args.target;
      if (t !== undefined && (typeof t !== "number" || !Number.isInteger(t) || t < MIN_TARGET || t > MAX_TARGET)) {
        return `Target must be an integer from ${MIN_TARGET} to ${MAX_TARGET}.`;
      }
      if (values === undefined && t === undefined) return "Pass an array, a target, or both.";
      if (values) setArray(values);
      if (typeof t === "number") setTarget(t);
      return null;
    },
    suggestions: [
      "Try a target that isn't in the array",
      "Show me the worst case",
      "Compare with Linear Search on this input",
    ],
  };
}

export function treeInput(
  apply: (values: number[], target: number | null) => void,
  current: () => { values: number[]; target: number | null },
  needsTarget: boolean,
): AgentInput {
  const { minSize, maxSize, minValue, maxValue } = TREE_LIMITS;
  return {
    description: `Rebuild the BST by inserting new values in order, then restart from step 1. ${minSize}–${maxSize} unique integers, each ${minValue}–${maxValue}. Insertion order decides the shape (sorted input makes a skewed tree).${needsTarget ? ` Optionally set the target value (${minValue}–${maxValue}).` : ""}`,
    properties: {
      values: intArray(`${minSize}–${maxSize} unique integers between ${minValue} and ${maxValue}, inserted in this order.`),
      ...(needsTarget
        ? { target: { type: "INTEGER" as const, description: `Optional. Value to insert/delete, ${minValue}–${maxValue}.` } }
        : {}),
    },
    required: ["values"],
    apply: (args) => {
      const values = toInts(args.values);
      const err = listError(values, TREE_LIMITS, true);
      if (err) return err;
      let target = current().target;
      if (needsTarget && args.target !== undefined) {
        const t = args.target;
        if (typeof t !== "number" || !Number.isInteger(t) || t < minValue || t > maxValue) {
          return `Target must be an integer from ${minValue} to ${maxValue}.`;
        }
        target = t;
      }
      apply(values!, needsTarget ? target : null);
      return null;
    },
    suggestions: needsTarget
      ? ["Load a tree that shows the tricky case", "Jump to the most important step", "What's the worst-case shape for this?"]
      : ["Build a skewed tree and replay it", "Jump to the most important step", "Compare with another traversal"],
  };
}

export function recursionInput(
  labels: string[],
  mins: number[],
  maxs: number[],
  setParams: (p: number[]) => void,
): AgentInput {
  return {
    description: `Run the recursion with new arguments and restart from step 1. ${labels
      .map((l, i) => `${l}: ${mins[i]}–${maxs[i]}`)
      .join(", ")}.`,
    properties: Object.fromEntries(
      labels.map((l, i) => [l, { type: "INTEGER" as const, description: `${mins[i]}–${maxs[i]}` }]),
    ),
    required: labels,
    apply: (args) => {
      const next: number[] = [];
      for (let i = 0; i < labels.length; i++) {
        const v = args[labels[i]!];
        if (typeof v !== "number" || !Number.isInteger(v) || v < mins[i]! || v > maxs[i]!) {
          return `${labels[i]} must be an integer from ${mins[i]} to ${maxs[i]}.`;
        }
        next.push(v);
      }
      setParams(next);
      return null;
    },
    suggestions: [
      "Try a bigger input and show the deepest call",
      "Jump to the first base case",
      "What happens without the base case?",
    ],
  };
}

export function scriptInput(structure: StructureKey, setScript: (ops: Operation[]) => void): AgentInput {
  const [add, remove] = structure === "stack" ? ["push", "pop"] : ["enqueue", "dequeue"];
  return {
    description: `Run a new list of operations and restart from step 1. 1–12 operations, comma-separated: "${add} N" (N 1–99) or "${remove}". Example: "${add} 5, ${add} 3, ${remove}".`,
    properties: { ops: { type: "STRING", description: `e.g. "${add} 5, ${add} 3, ${remove}"` } },
    required: ["ops"],
    apply: (args) => {
      if (typeof args.ops !== "string") return "Pass the operations as a string.";
      const r = parseScript(structure, args.ops);
      if (!r.ok) return r.error;
      setScript(r.ops);
      return null;
    },
    suggestions: [
      `Show the ${structure === "stack" ? "LIFO" : "FIFO"} order with a clear example`,
      `Jump to the first ${remove}`,
      `Compare with a ${structure === "stack" ? "queue" : "stack"} on the same operations`,
    ],
  };
}

/* ---------------- Tool declarations ---------------- */

export function toolDeclarations(input: AgentInput): FunctionDeclaration[] {
  return [
    {
      name: "go_to_step",
      description:
        "Jump the animation to a step (1-based) and pause there, so the student sees that exact moment. Returns the new step's caption and state.",
      parameters: {
        type: "OBJECT",
        properties: { step: { type: "INTEGER", description: "1-based step number." } },
        required: ["step"],
      },
    },
    {
      name: "find_steps",
      description:
        "Search the captions of every step in this run, to find moments like a swap, a pivot being placed, a match, or a base case. Without a query, lists the captions in a range. Use this instead of guessing step numbers.",
      parameters: {
        type: "OBJECT",
        properties: {
          query: { type: "STRING", description: "Words that must all appear in the caption, e.g. \"swap\" or \"found\". Optional." },
          from: { type: "INTEGER", description: "First step to list (1-based). Optional." },
          to: { type: "INTEGER", description: "Last step to list (1-based). Optional." },
        },
      },
    },
    {
      name: "play",
      description:
        "Start playing the animation from the current step. Only when the student wants to watch or replay something.",
      parameters: {
        type: "OBJECT",
        properties: { speed: { type: "INTEGER", description: "1 (slow) to 10 (fast). Optional; 3 is good for explaining." } },
      },
    },
    { name: "pause", description: "Pause the animation." },
    {
      name: "set_input",
      description: input.description,
      parameters: { type: "OBJECT", properties: input.properties, required: input.required },
    },
    {
      name: "show_code",
      description: "Switch the code panel to pseudocode or a language, e.g. when the student asks about Java or Python code.",
      parameters: {
        type: "OBJECT",
        properties: { language: { type: "STRING", enum: ["pseudo", "cpp", "java", "python"] } },
        required: ["language"],
      },
    },
    {
      name: "open_algorithm",
      description:
        "Open another algorithm's page, optionally with an input, e.g. to compare two sorts on the same array. The conversation continues on the new page. Input fields depend on the page: sorting → array; searching → array, target; trees → values, target; recursion → args (in parameter order); stacks/queues → ops.",
      parameters: {
        type: "OBJECT",
        properties: {
          page: { type: "STRING", enum: PAGES.map((p) => p.path) },
          array: intArray("Optional, for sorting/searching pages."),
          target: { type: "INTEGER", description: "Optional, for searching/trees pages." },
          values: intArray("Optional, for trees pages."),
          args: intArray("Optional, for recursion pages."),
          ops: { type: "STRING", description: "Optional, for stacks-queues pages." },
        },
        required: ["page"],
      },
    },
  ];
}

/* ---------------- Running a call ---------------- */

const stepView = (ctx: StepContext) => ({
  step: ctx.stepIndex + 1,
  totalSteps: ctx.totalSteps,
  caption: ctx.frame.caption,
  note: ctx.frame.note,
  state: compactState(ctx.frame),
});

export type ToolOutcome = {
  part: Part;
  log: ActionLog;
  /** Set when the call navigated away; the turn must end here. */
  navigatedTo?: string;
};

export async function runTool(
  call: NonNullable<Part["functionCall"]>,
  host: AgentHost,
): Promise<ToolOutcome> {
  const args = call.args ?? {};
  const reply = (response: Record<string, unknown>, log: ActionLog, navigatedTo?: string): ToolOutcome => ({
    part: { functionResponse: { name: call.name, response, ...(call.id ? { id: call.id } : {}) } },
    log,
    navigatedTo,
  });
  const fail = (error: string) => reply({ error }, { kind: "error", label: `Couldn't ${call.name.replace(/_/g, " ")}: ${error}` });

  switch (call.name) {
    case "go_to_step": {
      const total = host.frames().length;
      const step = Number(args.step);
      if (!Number.isInteger(step) || step < 1 || step > total) return fail(`step must be 1–${total}`);
      host.goTo(step - 1);
      const ctx = await host.snapshot();
      return reply(stepView(ctx), { kind: "step", label: `Jumped to step ${step}` });
    }
    case "find_steps": {
      const frames = host.frames();
      const query = typeof args.query === "string" ? args.query.trim().toLowerCase() : "";
      const all = frames.map((f, i) => ({ step: i + 1, caption: f.caption, note: f.note }));
      let rows: typeof all;
      if (query) {
        const terms = query.split(/\s+/);
        const hits = (s: string) => terms.every((t) => s.toLowerCase().includes(t));
        // Caption matches first: notes like "8 ≤ 3 — no swap" also contain
        // "swap", and the first result is usually the one the agent jumps to.
        rows = all
          .filter((r) => hits(`${r.caption} ${r.note}`))
          .sort((a, b) => Number(hits(b.caption)) - Number(hits(a.caption)) || a.step - b.step)
          .slice(0, 20);
      } else {
        const cur = host.currentIndex() + 1;
        const from = Math.max(1, Number.isInteger(args.from) ? Number(args.from) : cur - 5);
        const to = Math.min(frames.length, Number.isInteger(args.to) ? Number(args.to) : from + 29, from + 39);
        rows = all.slice(from - 1, to);
      }
      return reply(
        { totalSteps: frames.length, currentStep: host.currentIndex() + 1, matches: rows },
        { kind: "search", label: query ? `Searched the steps for “${query}”` : "Read the step list" },
      );
    }
    case "play": {
      const speed = Number(args.speed);
      if (Number.isInteger(speed) && speed >= 1 && speed <= 10) host.setSpeed(speed);
      host.play();
      return reply(
        { playing: true, fromStep: host.currentIndex() + 1 },
        { kind: "play", label: Number.isInteger(speed) ? `Playing at speed ${speed}` : "Playing" },
      );
    }
    case "pause": {
      host.pause();
      return reply({ paused: true, step: host.currentIndex() + 1 }, { kind: "pause", label: "Paused" });
    }
    case "set_input": {
      const err = host.input.apply(args);
      if (err) return fail(err);
      const ctx = await host.snapshot();
      return reply(
        { loaded: ctx.input, ...stepView(ctx) },
        { kind: "input", label: `Loaded ${ctx.input}` },
      );
    }
    case "show_code": {
      const lang = args.language;
      if (lang !== "pseudo" && lang !== "cpp" && lang !== "java" && lang !== "python") {
        return fail("language must be pseudo, cpp, java or python");
      }
      host.setCodeTab(lang);
      const label = { pseudo: "pseudocode", cpp: "C++", java: "Java", python: "Python" }[lang];
      return reply({ showing: lang }, { kind: "code", label: `Showing ${label}` });
    }
    case "open_algorithm": {
      const page = PAGES.find((p) => p.path === args.page);
      if (!page) return fail("unknown page");
      const q: string[] = [];
      const list = (v: unknown) => (toInts(v) ?? []).join(",");
      if (args.array !== undefined) q.push(`arr=${list(args.array)}`);
      if (args.values !== undefined) q.push(`values=${list(args.values)}`);
      if (args.args !== undefined) q.push(`args=${list(args.args)}`);
      if (typeof args.target === "number") q.push(`target=${args.target}`);
      if (typeof args.ops === "string") q.push(`ops=${encodeURIComponent(args.ops).replace(/%2C/gi, ",").replace(/%20/g, "+")}`);
      const href = `/${page.path}${q.length ? `?${q.join("&")}` : ""}`;
      return reply({ opening: page.name }, { kind: "open", label: `Opening ${page.name}` }, href);
    }
    default:
      return fail("unknown tool");
  }
}
