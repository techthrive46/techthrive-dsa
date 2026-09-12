export type StructureKey = "stack" | "queue";

export type Operation =
  | { type: "push"; value: number }
  | { type: "pop" }
  | { type: "enqueue"; value: number }
  | { type: "dequeue" };

export type ElementState = {
  id: number;
  value: number;
};

export type Action = "push" | "pop" | "enqueue" | "dequeue" | null;

export type Frame = {
  /** Stack: bottom (index 0) to top. Queue: front (index 0) to back. */
  elements: ElementState[];
  highlightId: number | null;
  action: Action;
  caption: string;
  note: string;
  line: number;
};

export type StructureMeta = {
  key: StructureKey;
  name: string;
  time: string;
  space: string;
  order: "LIFO" | "FIFO";
  blurb: string;
  pseudocode: string[];
  defaultScript: Operation[];
};

export const STRUCTURES: Record<StructureKey, StructureMeta> = {
  stack: {
    key: "stack",
    name: "Stack",
    time: "O(1) push / pop",
    space: "O(n)",
    order: "LIFO",
    blurb:
      "A stack holds elements in Last-In-First-Out order: the most recently pushed element is always the first one popped. Both push (add to the top) and pop (remove from the top) touch only one end, so each operation runs in constant time no matter how many elements sit underneath. Call stacks, undo history, and backtracking all lean on this discipline.",
    pseudocode: [
      "push(x)",
      "  top++; a[top] = x",
      "pop()",
      "  x = a[top]; top--",
      "  return x",
    ],
    defaultScript: [
      { type: "push", value: 5 },
      { type: "push", value: 3 },
      { type: "push", value: 9 },
      { type: "pop" },
      { type: "push", value: 7 },
      { type: "pop" },
      { type: "pop" },
    ],
  },
  queue: {
    key: "queue",
    name: "Queue",
    time: "O(1) enqueue / dequeue",
    space: "O(n)",
    order: "FIFO",
    blurb:
      "A queue holds elements in First-In-First-Out order: whichever element has waited longest is the next one out. Enqueue adds to the back, dequeue removes from the front — two different ends, so nothing needs to shift out of the way. Print spoolers, task schedulers, and breadth-first search all rely on this ordering.",
    pseudocode: [
      "enqueue(x)",
      "  a[back] = x; back++",
      "dequeue()",
      "  x = a[front]; front++",
      "  return x",
    ],
    defaultScript: [
      { type: "enqueue", value: 5 },
      { type: "enqueue", value: 3 },
      { type: "enqueue", value: 9 },
      { type: "dequeue" },
      { type: "enqueue", value: 7 },
      { type: "dequeue" },
      { type: "dequeue" },
    ],
  },
};

export const STRUCTURE_LIST = Object.values(STRUCTURES);

export function buildStructureFrames(
  structure: StructureKey,
  script: Operation[],
): Frame[] {
  const frames: Frame[] = [];
  const elements: ElementState[] = [];
  let nextId = 0;

  const push = (p: {
    highlightId: number | null;
    action: Action;
    caption: string;
    note: string;
    line: number;
  }) => {
    frames.push({
      elements: elements.map((e) => ({ ...e })),
      highlightId: p.highlightId,
      action: p.action,
      caption: p.caption,
      note: p.note,
      line: p.line,
    });
  };

  push({
    highlightId: null,
    action: null,
    caption: "Start",
    note: `empty ${structure}`,
    line: 0,
  });

  for (const op of script) {
    if (structure === "stack") {
      if (op.type === "push") {
        const id = nextId++;
        elements.push({ id, value: op.value });
        push({
          highlightId: id,
          action: "push",
          caption: `push(${op.value})`,
          note: "placed on top",
          line: 1,
        });
      } else if (op.type === "pop") {
        if (elements.length === 0) {
          push({
            highlightId: null,
            action: null,
            caption: "pop() on an empty stack",
            note: "nothing to remove",
            line: 3,
          });
        } else {
          const top = elements[elements.length - 1]!;
          push({
            highlightId: top.id,
            action: "pop",
            caption: `pop() -> ${top.value}`,
            note: "about to remove the top",
            line: 3,
          });
          elements.pop();
          push({
            highlightId: null,
            action: null,
            caption: `${top.value} popped`,
            note: "LIFO: last in, first out",
            line: 4,
          });
        }
      }
    } else {
      if (op.type === "enqueue") {
        const id = nextId++;
        elements.push({ id, value: op.value });
        push({
          highlightId: id,
          action: "enqueue",
          caption: `enqueue(${op.value})`,
          note: "joins the back",
          line: 1,
        });
      } else if (op.type === "dequeue") {
        if (elements.length === 0) {
          push({
            highlightId: null,
            action: null,
            caption: "dequeue() on an empty queue",
            note: "nothing to remove",
            line: 3,
          });
        } else {
          const front = elements[0]!;
          push({
            highlightId: front.id,
            action: "dequeue",
            caption: `dequeue() -> ${front.value}`,
            note: "about to leave from the front",
            line: 3,
          });
          elements.shift();
          push({
            highlightId: null,
            action: null,
            caption: `${front.value} dequeued`,
            note: "FIFO: first in, first out",
            line: 4,
          });
        }
      }
    }
  }

  push({
    highlightId: null,
    action: null,
    caption: "Script complete",
    note: `${elements.length} element${elements.length === 1 ? "" : "s"} remain`,
    line: 0,
  });

  return frames;
}

export function scriptToText(structure: StructureKey, ops: Operation[]): string {
  return ops
    .map((op) =>
      op.type === "push" || op.type === "enqueue" ? `${op.type} ${op.value}` : op.type,
    )
    .join(", ");
}

export function parseScript(
  structure: StructureKey,
  input: string,
): { ok: true; ops: Operation[] } | { ok: false; error: string } {
  const parts = input
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length < 1 || parts.length > 12) {
    return { ok: false, error: "Enter 1–12 operations." };
  }

  const addWord = structure === "stack" ? "push" : "enqueue";
  const removeWord = structure === "stack" ? "pop" : "dequeue";
  const ops: Operation[] = [];

  for (const part of parts) {
    const addMatch = new RegExp(`^${addWord}\\s+(-?\\d+)$`, "i").exec(part);
    if (addMatch) {
      const value = Number(addMatch[1]);
      if (!Number.isInteger(value) || value < 1 || value > 99) {
        return { ok: false, error: `"${part}" needs a value from 1 to 99.` };
      }
      ops.push(
        structure === "stack"
          ? { type: "push", value }
          : { type: "enqueue", value },
      );
      continue;
    }
    if (new RegExp(`^${removeWord}$`, "i").test(part)) {
      ops.push(structure === "stack" ? { type: "pop" } : { type: "dequeue" });
      continue;
    }
    return {
      ok: false,
      error: `Couldn't parse "${part}". Use "${addWord} N" or "${removeWord}".`,
    };
  }

  return { ok: true, ops };
}

export function randomScript(structure: StructureKey): Operation[] {
  const isStack = structure === "stack";
  const opsCount = 6 + Math.floor(Math.random() * 3);
  const ops: Operation[] = [];
  let size = 0;

  for (let i = 0; i < opsCount; i++) {
    const doRemove = size > 0 && Math.random() < 0.35;
    if (doRemove) {
      ops.push(isStack ? { type: "pop" } : { type: "dequeue" });
      size--;
    } else {
      const value = 1 + Math.floor(Math.random() * 20);
      ops.push(isStack ? { type: "push", value } : { type: "enqueue", value });
      size++;
    }
  }

  return ops;
}
