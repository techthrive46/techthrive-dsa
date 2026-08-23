export type SearchItem = { id: number; value: number };

export type SearchStatus = "searching" | "found" | "missing";

export type SearchWindow = { lo: number; hi: number };

export type SearchFrame = {
  array: SearchItem[];
  target: number;
  /** Index under the microscope in this frame. */
  checking: number | null;
  /** Range still in play. */
  window: SearchWindow | null;
  ruledOut: number[];
  found: number | null;
  caption: string;
  note: string;
  line: number;
  comparisons: number;
  status: SearchStatus;
};

export type SearchAlgoKey =
  | "linear"
  | "binary"
  | "jump"
  | "interpolation"
  | "exponential"
  | "ternary";

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
  jump: {
    key: "jump",
    name: "Jump Search",
    time: "O(√n)",
    space: "O(1)",
    blurb:
      "Jumps ahead by fixed blocks of size √n on a sorted array, then performs a linear search in the identified block.",
    needsSorted: true,
    pointerLabel: "step",
    pseudocode: [
      "jumpSearch(a, target)",
      "  step = floor(sqrt(n)); prev = 0",
      "  while a[min(step, n)-1] < target",
      "    prev = step; step += floor(sqrt(n))",
      "    if prev >= n return -1",
      "  while a[prev] < target",
      "    prev++",
      "    if prev == min(step, n) return -1",
      "  if a[prev] == target return prev",
      "  return -1",
    ],
  },
  interpolation: {
    key: "interpolation",
    name: "Interpolation Search",
    time: "O(log log n)",
    space: "O(1)",
    blurb:
      "Estimates target index based on value bounds on uniformly distributed sorted data, probing directly toward target.",
    needsSorted: true,
    pointerLabel: "pos",
    pseudocode: [
      "interpolationSearch(a, target)",
      "  lo = 0; hi = n - 1",
      "  while lo <= hi and target >= a[lo] and target <= a[hi]",
      "    pos = lo + ((target - a[lo]) * (hi - lo)) / (a[hi] - a[lo])",
      "    if a[pos] == target return pos",
      "    if a[pos] < target then lo = pos + 1",
      "    else hi = pos - 1",
      "  return -1",
    ],
  },
  exponential: {
    key: "exponential",
    name: "Exponential Search",
    time: "O(log n)",
    space: "O(1)",
    blurb:
      "Doubles the search bound range exponentially (1, 2, 4, 8...) to locate the interval, then runs binary search.",
    needsSorted: true,
    pointerLabel: "bound",
    pseudocode: [
      "exponentialSearch(a, target)",
      "  if a[0] == target return 0",
      "  i = 1",
      "  while i < n and a[i] <= target",
      "    i = i * 2",
      "  return binarySearch(a, target, i/2, min(i, n-1))",
    ],
  },
  ternary: {
    key: "ternary",
    name: "Ternary Search",
    time: "O(log₃ n)",
    space: "O(1)",
    blurb:
      "Divides the sorted array into three equal segments using two midpoints, narrowing search space by 2/3 each step.",
    needsSorted: true,
    pointerLabel: "mid1, mid2",
    pseudocode: [
      "ternarySearch(a, target, lo, hi)",
      "  while lo <= hi",
      "    mid1 = lo + (hi - lo) / 3",
      "    mid2 = hi - (hi - lo) / 3",
      "    if a[mid1] == target return mid1",
      "    if a[mid2] == target return mid2",
      "    if target < a[mid1] hi = mid1 - 1",
      "    else if target > a[mid2] lo = mid2 + 1",
      "    else lo = mid1 + 1; hi = mid2 - 1",
      "  return -1",
    ],
  },
};

export const SEARCH_ALGO_LIST = Object.values(SEARCH_ALGOS);

export const MIN_TARGET = 1;
export const MAX_TARGET = 20;

/** Sort array if algorithm requires ordered data. */
export function prepareArray(input: number[], algo: SearchAlgoKey): number[] {
  return SEARCH_ALGOS[algo].needsSorted
    ? [...input].sort((x, y) => x - y)
    : [...input];
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

  if (algo === "jump") {
    const n = a.length;
    const stepSize = Math.floor(Math.sqrt(n));
    let prev = 0;
    let step = stepSize;

    push({
      caption: `Block size √${n} ≈ ${stepSize}`,
      note: `jumping blocks of size ${stepSize}`,
      line: 1,
    });

    while (a[Math.min(step, n) - 1]!.value < target) {
      comparisons++;
      const checkIdx = Math.min(step, n) - 1;
      const val = a[checkIdx]!.value;
      push({
        checking: checkIdx,
        caption: `End of block at index ${checkIdx} is ${val} < ${target}`,
        note: "jump to next block",
        line: 2,
      });

      for (let k = prev; k <= checkIdx; k++) ruledOut.add(k);
      prev = step;
      step += stepSize;

      if (prev >= n) {
        break;
      }
    }

    if (prev < n) {
      const blockEnd = Math.min(step, n);
      activeWindow = { lo: prev, hi: blockEnd - 1 };
      push({
        caption: `Target must be in block [${prev}…${blockEnd - 1}]`,
        note: "linear search inside block",
        line: 5,
      });

      while (prev < blockEnd) {
        comparisons++;
        const val = a[prev]!.value;
        const hit = val === target;
        push({
          checking: prev,
          caption: `Checking index ${prev}: ${val} ${hit ? "==" : "!="} ${target}`,
          note: hit ? "found target!" : "step forward",
          line: 8,
        });

        if (hit) {
          found = prev;
          status = "found";
          break;
        }

        ruledOut.add(prev);
        prev++;
      }
    }
  }

  if (algo === "interpolation") {
    let lo = 0;
    let hi = a.length - 1;

    push({
      caption: `Looking for ${target} in range [0…${hi}]`,
      note: "estimate index using value distribution",
      line: 1,
    });

    while (
      lo <= hi &&
      target >= a[lo]!.value &&
      target <= a[hi]!.value
    ) {
      activeWindow = { lo, hi };
      comparisons++;

      if (a[lo]!.value === a[hi]!.value) {
        if (a[lo]!.value === target) {
          found = lo;
          status = "found";
          push({
            checking: lo,
            caption: `Found ${target} at index ${lo}`,
            note: "single unique value range",
            line: 4,
          });
        }
        break;
      }

      const loVal = a[lo]!.value;
      const hiVal = a[hi]!.value;
      const pos =
        lo +
        Math.floor(
          ((target - loVal) * (hi - lo)) / (hiVal - loVal),
        );

      push({
        checking: pos,
        caption: `Probed index ${pos} with value ${a[pos]!.value}`,
        note: `estimated pos formula`,
        line: 3,
      });

      if (a[pos]!.value === target) {
        found = pos;
        status = "found";
        push({
          checking: pos,
          caption: `Found ${target} at index ${pos}`,
          note: `${comparisons} comparison${comparisons === 1 ? "" : "s"}`,
          line: 4,
        });
        break;
      }

      if (a[pos]!.value < target) {
        for (let k = lo; k <= pos; k++) ruledOut.add(k);
        lo = pos + 1;
        push({
          checking: pos,
          caption: `${a[pos]!.value} < ${target} — probe right of ${pos}`,
          note: `lo = ${lo}`,
          line: 5,
        });
      } else {
        for (let k = pos; k <= hi; k++) ruledOut.add(k);
        hi = pos - 1;
        push({
          checking: pos,
          caption: `${a[pos]!.value} > ${target} — probe left of ${pos}`,
          note: `hi = ${hi}`,
          line: 6,
        });
      }
    }
  }

  if (algo === "exponential") {
    const n = a.length;
    comparisons++;
    if (a[0]!.value === target) {
      found = 0;
      status = "found";
      push({
        checking: 0,
        caption: `Found ${target} at index 0!`,
        note: "first element hit",
        line: 1,
      });
    } else {
      ruledOut.add(0);
      let bound = 1;

      push({
        caption: `Check index 0 != ${target}. Start exponential bounds`,
        note: "bound = 1",
        line: 2,
      });

      while (bound < n && a[bound]!.value <= target) {
        comparisons++;
        const val = a[bound]!.value;
        push({
          checking: bound,
          caption: `Bound at index ${bound} is ${val} ${val === target ? "==" : "<="} ${target}`,
          note: `double bound: ${bound} -> ${bound * 2}`,
          line: 3,
        });

        if (val === target) {
          found = bound;
          status = "found";
          break;
        }

        for (let k = 0; k < bound; k++) ruledOut.add(k);
        bound = bound * 2;
      }

      if (status !== "found") {
        const lo = Math.floor(bound / 2);
        const hi = Math.min(bound, n - 1);
        activeWindow = { lo, hi };

        push({
          caption: `Target bounded in sub-range [${lo}…${hi}]`,
          note: "performing binary search",
          line: 5,
        });

        let subLo = lo;
        let subHi = hi;
        while (subLo <= subHi) {
          const mid = Math.floor((subLo + subHi) / 2);
          const val = a[mid]!.value;
          comparisons++;

          push({
            checking: mid,
            caption: `Binary search mid index ${mid} is ${val}`,
            note: `range [${subLo}…${subHi}]`,
            line: 5,
          });

          if (val === target) {
            found = mid;
            status = "found";
            push({
              checking: mid,
              caption: `Found ${target} at index ${mid}`,
              note: "match!",
              line: 5,
            });
            break;
          }

          if (val < target) {
            for (let k = subLo; k <= mid; k++) ruledOut.add(k);
            subLo = mid + 1;
          } else {
            for (let k = mid; k <= subHi; k++) ruledOut.add(k);
            subHi = mid - 1;
          }
          activeWindow = { lo: subLo, hi: subHi };
        }
      }
    }
  }

  if (algo === "ternary") {
    let lo = 0;
    let hi = a.length - 1;
    activeWindow = { lo, hi };

    push({
      caption: `Searching range [${lo}…${hi}] using two midpoints`,
      note: "divide range into 3 equal parts",
      line: 0,
    });

    while (lo <= hi) {
      const third = Math.floor((hi - lo) / 3);
      const mid1 = lo + third;
      const mid2 = hi - third;

      push({
        checking: mid1,
        caption: `Midpoint 1: index ${mid1} (${a[mid1]!.value}), Midpoint 2: index ${mid2} (${a[mid2]!.value})`,
        note: `range [${lo}…${hi}]`,
        line: 2,
      });

      comparisons++;
      if (a[mid1]!.value === target) {
        found = mid1;
        status = "found";
        push({
          checking: mid1,
          caption: `Found ${target} at mid1 (index ${mid1})`,
          note: "match!",
          line: 4,
        });
        break;
      }

      comparisons++;
      if (a[mid2]!.value === target) {
        found = mid2;
        status = "found";
        push({
          checking: mid2,
          caption: `Found ${target} at mid2 (index ${mid2})`,
          note: "match!",
          line: 5,
        });
        break;
      }

      if (target < a[mid1]!.value) {
        for (let k = mid1; k <= hi; k++) ruledOut.add(k);
        hi = mid1 - 1;
        push({
          checking: mid1,
          caption: `${target} < ${a[mid1]!.value} — discard right 2/3`,
          note: `new hi = ${hi}`,
          line: 6,
        });
      } else if (target > a[mid2]!.value) {
        for (let k = lo; k <= mid2; k++) ruledOut.add(k);
        lo = mid2 + 1;
        push({
          checking: mid2,
          caption: `${target} > ${a[mid2]!.value} — discard left 2/3`,
          note: `new lo = ${lo}`,
          line: 7,
        });
      } else {
        for (let k = lo; k <= mid1; k++) ruledOut.add(k);
        for (let k = mid2; k <= hi; k++) ruledOut.add(k);
        lo = mid1 + 1;
        hi = mid2 - 1;
        push({
          caption: `${target} is between ${a[mid1]!.value} and ${a[mid2]!.value} — keep middle 1/3`,
          note: `lo = ${lo}, hi = ${hi}`,
          line: 8,
        });
      }
      activeWindow = lo <= hi ? { lo, hi } : null;
    }
  }

  if (status !== "found") {
    status = "missing";
    for (let i = 0; i < a.length; i++) ruledOut.add(i);
    activeWindow = null;
    push({
      caption: `${target} is not in the array`,
      note: "returns -1",
      line: 0,
    });
  }

  return frames;
}

/** Distinct values keep the animation readable; ordered algorithms get them sorted. */
export function randomSearchArray(
  size: number,
  algo: SearchAlgoKey,
): number[] {
  const pool = Array.from({ length: MAX_TARGET }, (_, i) => i + MIN_TARGET);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  const picked = pool.slice(0, size);
  return SEARCH_ALGOS[algo].needsSorted
    ? picked.sort((x, y) => x - y)
    : picked;
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

