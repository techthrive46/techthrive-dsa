export type SearchItem = { id: number; value: number };

export type SearchStatus = "searching" | "found" | "missing";

export type SearchWindow = { lo: number; hi: number };

export type SearchFrame = {
  array: SearchItem[];
  target: number;
  /** Index under the microscope in this frame. */
  checking: number | null;
  /** Range still in play — binary search only. */
  window: SearchWindow | null;
  ruledOut: number[];
  found: number | null;
  caption: string;
  note: string;
  line: number;
  comparisons: number;
  status: SearchStatus;
};

export type SearchAlgoKey = "linear" | "binary";

export type SearchAlgoMeta = {
  key: SearchAlgoKey;
  name: string;
  time: string;
  space: string;
  blurb: string;
  needsSorted: boolean;
  pointerLabel: string;
  pseudocode: string[];
};

export const SEARCH_ALGOS: Record<SearchAlgoKey, SearchAlgoMeta> = {
  linear: {
    key: "linear",
    name: "Linear Search",
    time: "O(n)",
    space: "O(1)",
    blurb:
      "Checks every value from left to right until the target shows up — no ordering required.",
    needsSorted: false,
    pointerLabel: "i",
    pseudocode: [
      "linearSearch(a, target)",
      "  for i from 0 to n-1",
      "    if a[i] == target",
      "      return i",
      "  return -1",
    ],
  },
  binary: {
    key: "binary",
    name: "Binary Search",
    time: "O(log n)",
    space: "O(1)",
    blurb:
      "Compares the middle of a sorted array and throws away half the window every step.",
    needsSorted: true,
    pointerLabel: "mid",
    pseudocode: [
      "binarySearch(a, target)",
      "  lo = 0; hi = n - 1",
      "  while lo <= hi",
      "    mid = (lo + hi) / 2",
      "    if a[mid] == target return mid",
      "    if a[mid] < target then lo = mid + 1",
      "    else hi = mid - 1",
      "  return -1",
    ],
  },
};

export const SEARCH_ALGO_LIST = Object.values(SEARCH_ALGOS);

export const MIN_TARGET = 1;
export const MAX_TARGET = 20;

/** Binary search only makes sense on ordered data, so its input is sorted first. */
export function prepareArray(input: number[], algo: SearchAlgoKey): number[] {
  return algo === "binary" ? [...input].sort((x, y) => x - y) : [...input];
}

export function buildSearchFrames(
  input: number[],
  target: number,
  algo: SearchAlgoKey,
): SearchFrame[] {
  const a: SearchItem[] = prepareArray(input, algo).map((value, i) => ({
    id: i,
    value,
  }));
  const frames: SearchFrame[] = [];
  const ruledOut = new Set<number>();
  let comparisons = 0;
  let found: number | null = null;
  let status: SearchStatus = "searching";
  let activeWindow: SearchWindow | null = null;

  const push = (p: {
    caption: string;
    note: string;
    line: number;
    checking?: number;
  }) => {
    frames.push({
      array: a.map((item) => ({ ...item })),
      target,
      checking: p.checking ?? null,
      window: activeWindow ? { ...activeWindow } : null,
      ruledOut: [...ruledOut],
      found,
      caption: p.caption,
      note: p.note,
      line: p.line,
      comparisons,
      status,
    });
  };

  if (algo === "linear") {
    push({
      caption: `Looking for ${target}`,
      note: "scan from the left",
      line: 0,
    });

    for (let i = 0; i < a.length; i++) {
      const value = a[i]!.value;
      comparisons++;
      const hit = value === target;
      if (hit) {
        found = i;
        status = "found";
      }
      push({
        checking: i,
        caption: `Is ${value} equal to ${target}?`,
        note: hit ? "match!" : "no — step right",
        line: 2,
      });
      if (hit) {
        push({
          checking: i,
          caption: `Found ${target} at index ${i}`,
          note: `${comparisons} comparison${comparisons === 1 ? "" : "s"}`,
          line: 3,
        });
        break;
      }
      ruledOut.add(i);
    }
  }

  if (algo === "binary") {
    let lo = 0;
    let hi = a.length - 1;
    activeWindow = { lo, hi };
    push({
      caption: `Looking for ${target} in a sorted array`,
      note: `lo = ${lo}, hi = ${hi}`,
      line: 1,
    });

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const value = a[mid]!.value;
      push({
        checking: mid,
        caption: `Middle of [${lo}…${hi}] is index ${mid}`,
        note: `a[${mid}] = ${value}`,
        line: 3,
      });

      comparisons++;
      if (value === target) {
        found = mid;
        status = "found";
        push({
          checking: mid,
          caption: `Found ${target} at index ${mid}`,
          note: `${comparisons} comparison${comparisons === 1 ? "" : "s"}`,
          line: 4,
        });
        break;
      }

      if (value < target) {
        for (let k = lo; k <= mid; k++) ruledOut.add(k);
        lo = mid + 1;
        activeWindow = { lo, hi };
        push({
          checking: mid,
          caption: `${value} < ${target} — drop the left half`,
          note: `lo = ${lo}`,
          line: 5,
        });
      } else {
        for (let k = mid; k <= hi; k++) ruledOut.add(k);
        hi = mid - 1;
        activeWindow = { lo, hi };
        push({
          checking: mid,
          caption: `${value} > ${target} — drop the right half`,
          note: `hi = ${hi}`,
          line: 6,
        });
      }
    }
  }

  if (status !== "found") {
    status = "missing";
    for (let i = 0; i < a.length; i++) ruledOut.add(i);
    activeWindow = null;
    push({
      caption: `${target} is not in the array`,
      note: "returns -1",
      line: algo === "binary" ? 7 : 4,
    });
  }

  return frames;
}

/** Distinct values keep the animation readable; binary search gets them sorted. */
export function randomSearchArray(size: number, algo: SearchAlgoKey): number[] {
  const pool = Array.from({ length: MAX_TARGET }, (_, i) => i + MIN_TARGET);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  const picked = pool.slice(0, size);
  return algo === "binary" ? picked.sort((x, y) => x - y) : picked;
}

/** Usually lands on a real value, but sometimes misses so the -1 case gets seen too. */
export function randomTarget(values: number[]): number {
  if (values.length > 0 && Math.random() < 0.75) {
    return values[Math.floor(Math.random() * values.length)]!;
  }
  const missing = Array.from(
    { length: MAX_TARGET },
    (_, i) => i + MIN_TARGET,
  ).filter((value) => !values.includes(value));
  return missing.length > 0
    ? missing[Math.floor(Math.random() * missing.length)]!
    : (values[0] ?? MIN_TARGET);
}
