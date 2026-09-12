export type CallStatus = "active" | "returned";

export type CallFrame = {
  id: string;
  label: string;
  depth: number;
  status: CallStatus;
  returnValue: number | null;
};

export type CallTreeNode = {
  id: string;
  label: string;
  depth: number;
  parentId: string | null;
  status: CallStatus;
  returnValue: number | null;
};

export type CallTree = {
  nodes: CallTreeNode[];
  maxDepth: number;
};

export type PegId = "A" | "B" | "C";

export type Towers = {
  /** Disk sizes per peg, bottom to top (largest first). */
  pegs: Record<PegId, number[]>;
  totalDisks: number;
  /** The disk mid-move this frame, if any — lets the canvas highlight the two pegs involved. */
  move: { disk: number; from: PegId; to: PegId } | null;
};

export type Frame = {
  /** The live call stack, bottom (first call) to top (most recent). */
  stack: CallFrame[];
  /** The full recursion tree seen so far; only populated for branching algorithms. */
  tree: CallTree | null;
  /** Physical peg/disk state; only populated for Tower of Hanoi. */
  towers: Towers | null;
  caption: string;
  note: string;
  line: number;
  calls: number;
  result: number | null;
};

export type RecursionAlgoKey = "factorial" | "gcd" | "fibonacci" | "hanoi";

export type RecursionAlgoMeta = {
  key: RecursionAlgoKey;
  name: string;
  time: string;
  space: string;
  blurb: string;
  /** Whether this recursion branches (worth drawing as a tree) or just chains linearly. */
  hasTree: boolean;
  /** Whether to show the physical pegs-and-disks canvas instead of the call stack. */
  hasTowers: boolean;
  pseudocode: string[];
  paramLabels: string[];
  defaultParams: number[];
  minParams: number[];
  maxParams: number[];
};

export const RECURSION_ALGOS: Record<RecursionAlgoKey, RecursionAlgoMeta> = {
  factorial: {
    key: "factorial",
    name: "Factorial",
    time: "O(n)",
    space: "O(n)",
    blurb:
      "The textbook first example of recursion. n! is defined by a base case (0! = 1) and a recursive case (n! = n × (n-1)!). Each call pushes a new frame and waits for its single recursive child to return before it can multiply and hand its own result back down the stack — a straight chain n frames deep.",
    hasTree: false,
    hasTowers: false,
    pseudocode: [
      "factorial(n)",
      "  if n <= 1: return 1",
      "  return n * factorial(n - 1)",
    ],
    paramLabels: ["n"],
    defaultParams: [5],
    minParams: [1],
    maxParams: [8],
  },
  gcd: {
    key: "gcd",
    name: "Euclid's GCD",
    time: "O(log(min(a, b)))",
    space: "O(log(min(a, b)))",
    blurb:
      "Computes the greatest common divisor with Euclid's algorithm: gcd(a, b) = gcd(b, a mod b), until b reaches 0 — at which point a is the answer. Each step's arguments shrink fast (by at least the golden ratio), so the call stack never gets deep even for large numbers.",
    hasTree: false,
    hasTowers: false,
    pseudocode: [
      "gcd(a, b)",
      "  if b == 0: return a",
      "  return gcd(b, a mod b)",
    ],
    paramLabels: ["a", "b"],
    defaultParams: [48, 18],
    minParams: [1, 1],
    maxParams: [500, 500],
  },
  fibonacci: {
    key: "fibonacci",
    name: "Fibonacci (naive)",
    time: "O(2ⁿ)",
    space: "O(n)",
    blurb:
      "The classic example of exponential recursion. fib(n) = fib(n-1) + fib(n-2) branches into two recursive calls every time, and because fib(n-2) gets fully recomputed inside both branches — nothing is remembered between calls — the same sub-calls repeat over and over. The recursion tree's size explodes exponentially with n, which is exactly why memoization exists.",
    hasTree: true,
    hasTowers: false,
    pseudocode: [
      "fib(n)",
      "  if n <= 1: return n",
      "  return fib(n - 1) + fib(n - 2)",
    ],
    paramLabels: ["n"],
    defaultParams: [5],
    minParams: [0],
    maxParams: [6],
  },
  hanoi: {
    key: "hanoi",
    name: "Tower of Hanoi",
    time: "O(2ⁿ)",
    space: "O(n)",
    blurb:
      "Move n disks from one peg to another, one at a time, never placing a larger disk on a smaller one. The recursive insight: to move n disks from A to C, first move the top n-1 disks out of the way onto the spare peg, move the largest disk directly, then move those n-1 disks onto it. Each call branches into exactly two same-sized recursive calls around one move, giving 2ⁿ - 1 moves in total.",
    hasTree: true,
    hasTowers: true,
    pseudocode: [
      "hanoi(n, from, to, via)",
      "  if n == 0: return",
      "  hanoi(n-1, from, via, to)",
      "  move disk n: from -> to",
      "  hanoi(n-1, via, to, from)",
    ],
    paramLabels: ["n"],
    defaultParams: [3],
    minParams: [1],
    maxParams: [4],
  },
};

export const RECURSION_ALGO_LIST = Object.values(RECURSION_ALGOS);

export function buildRecursionFrames(
  algo: RecursionAlgoKey,
  params: number[],
): Frame[] {
  const frames: Frame[] = [];
  const stack: CallFrame[] = [];
  const treeNodes = new Map<string, CallTreeNode>();
  const hasTree = RECURSION_ALGOS[algo].hasTree;

  let calls = 0;
  let maxDepthSeen = 0;
  let result: number | null = null;
  let nextId = 0;
  const makeId = () => `call-${nextId++}`;
  let towersState: Towers | null = null;

  const push = (p: { caption: string; note: string; line: number }) => {
    frames.push({
      stack: stack.map((f) => ({ ...f })),
      tree: hasTree
        ? {
            nodes: [...treeNodes.values()].map((n) => ({ ...n })),
            maxDepth: maxDepthSeen,
          }
        : null,
      towers: towersState
        ? {
            pegs: {
              A: [...towersState.pegs.A],
              B: [...towersState.pegs.B],
              C: [...towersState.pegs.C],
            },
            totalDisks: towersState.totalDisks,
            move: towersState.move,
          }
        : null,
      caption: p.caption,
      note: p.note,
      line: p.line,
      calls,
      result,
    });
  };

  if (algo === "factorial") {
    const [n0] = params;
    const call = (n: number, depth: number): number => {
      const id = makeId();
      calls++;
      maxDepthSeen = Math.max(maxDepthSeen, depth);
      const label = `factorial(${n})`;
      stack.push({ id, label, depth, status: "active", returnValue: null });
      push({
        caption: `Call ${label}`,
        note: depth === 0 ? "start" : `pushed at depth ${depth}`,
        line: 0,
      });

      let value: number;
      if (n <= 1) {
        value = 1;
        push({ caption: `${label}: base case, n ≤ 1`, note: "return 1", line: 1 });
      } else {
        const sub = call(n - 1, depth + 1);
        value = n * sub;
        push({
          caption: `${label} = ${n} × factorial(${n - 1}) = ${value}`,
          note: "combine on the way back up",
          line: 2,
        });
      }

      const frame = stack.find((f) => f.id === id)!;
      frame.status = "returned";
      frame.returnValue = value;
      push({ caption: `${label} returns ${value}`, note: "pop the frame", line: 2 });
      stack.pop();
      return value;
    };
    result = call(n0!, 0);
    push({ caption: `factorial(${n0}) = ${result}`, note: "done", line: 2 });
  }

  if (algo === "gcd") {
    const [a0, b0] = params;
    const call = (a: number, b: number, depth: number): number => {
      const id = makeId();
      calls++;
      maxDepthSeen = Math.max(maxDepthSeen, depth);
      const label = `gcd(${a}, ${b})`;
      stack.push({ id, label, depth, status: "active", returnValue: null });
      push({
        caption: `Call ${label}`,
        note: depth === 0 ? "start" : `pushed at depth ${depth}`,
        line: 0,
      });

      let value: number;
      if (b === 0) {
        value = a;
        push({ caption: `${label}: base case, b = 0`, note: `return ${a}`, line: 1 });
      } else {
        push({
          caption: `${a} mod ${b} = ${a % b}`,
          note: "recurse with (b, a mod b)",
          line: 2,
        });
        value = call(b, a % b, depth + 1);
      }

      const frame = stack.find((f) => f.id === id)!;
      frame.status = "returned";
      frame.returnValue = value;
      push({ caption: `${label} returns ${value}`, note: "pop the frame", line: 2 });
      stack.pop();
      return value;
    };
    result = call(a0!, b0!, 0);
    push({ caption: `gcd(${a0}, ${b0}) = ${result}`, note: "done", line: 2 });
  }

  if (algo === "fibonacci") {
    const [n0] = params;
    const call = (n: number, depth: number, parentId: string | null): number => {
      const id = makeId();
      calls++;
      maxDepthSeen = Math.max(maxDepthSeen, depth);
      const label = `fib(${n})`;
      stack.push({ id, label, depth, status: "active", returnValue: null });
      treeNodes.set(id, { id, label, depth, parentId, status: "active", returnValue: null });
      push({
        caption: `Call ${label}`,
        note: depth === 0 ? "start" : `pushed at depth ${depth}`,
        line: 0,
      });

      let value: number;
      if (n <= 1) {
        value = n;
        push({ caption: `${label}: base case, n ≤ 1`, note: `return ${n}`, line: 1 });
      } else {
        const left = call(n - 1, depth + 1, id);
        const right = call(n - 2, depth + 1, id);
        value = left + right;
        push({
          caption: `${label} = fib(${n - 1}) + fib(${n - 2}) = ${left} + ${right} = ${value}`,
          note: "combine both branches",
          line: 2,
        });
      }

      const frame = stack.find((f) => f.id === id)!;
      frame.status = "returned";
      frame.returnValue = value;
      const node = treeNodes.get(id)!;
      node.status = "returned";
      node.returnValue = value;
      push({ caption: `${label} returns ${value}`, note: "pop the frame", line: 2 });
      stack.pop();
      return value;
    };
    result = call(n0!, 0, null);
    push({ caption: `fib(${n0}) = ${result}`, note: "done", line: 2 });
  }

  if (algo === "hanoi") {
    const [n0] = params;
    let moveCount = 0;
    towersState = {
      pegs: {
        A: Array.from({ length: n0! }, (_, i) => n0! - i),
        B: [],
        C: [],
      },
      totalDisks: n0!,
      move: null,
    };

    const call = (
      n: number,
      from: PegId,
      to: PegId,
      via: PegId,
      depth: number,
      parentId: string | null,
    ) => {
      const id = makeId();
      calls++;
      maxDepthSeen = Math.max(maxDepthSeen, depth);
      const label = `hanoi(${n}, ${from}→${to})`;
      stack.push({ id, label, depth, status: "active", returnValue: null });
      treeNodes.set(id, { id, label, depth, parentId, status: "active", returnValue: null });
      push({
        caption: `Call ${label}`,
        note: depth === 0 ? "start" : `via ${via}`,
        line: 0,
      });

      if (n === 0) {
        push({ caption: `${label}: base case, 0 disks`, note: "nothing to move", line: 1 });
      } else {
        push({
          caption: `${label}: move top ${n - 1} disk${n - 1 === 1 ? "" : "s"} out of the way`,
          note: `${from} → ${via}`,
          line: 2,
        });
        call(n - 1, from, via, to, depth + 1, id);

        moveCount++;
        const disk = towersState!.pegs[from].pop()!;
        towersState!.pegs[to].push(disk);
        towersState!.move = { disk, from, to };
        push({ caption: `Move disk ${n}: ${from} → ${to}`, note: `move #${moveCount}`, line: 3 });
        towersState!.move = null;

        push({
          caption: `${label}: move those ${n - 1} disk${n - 1 === 1 ? "" : "s"} onto disk ${n}`,
          note: `${via} → ${to}`,
          line: 4,
        });
        call(n - 1, via, to, from, depth + 1, id);
      }

      const frame = stack.find((f) => f.id === id)!;
      frame.status = "returned";
      const node = treeNodes.get(id)!;
      node.status = "returned";
      push({ caption: `${label} complete`, note: "pop the frame", line: 4 });
      stack.pop();
    };
    call(n0!, "A", "C", "B", 0, null);
    result = moveCount;
    push({
      caption: `Solved Tower of Hanoi with ${n0} disks in ${moveCount} moves`,
      note: "done",
      line: 4,
    });
  }

  return frames;
}
