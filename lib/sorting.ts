export type Frame = {
  array: { id: number; value: number }[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  pivot: number | null;
  caption: string;
  note: string;
  line: number;
  comparisons: number;
  swaps: number;
};

export type Item = { id: number; value: number };

export type AlgoKey = "bubble" | "selection" | "insertion" | "merge" | "quick";

export type AlgoMeta = {
  key: AlgoKey;
  name: string;
  time: string;
  space: string;
  blurb: string;
  pseudocode: string[];
};

export const ALGOS: Record<AlgoKey, AlgoMeta> = {
  bubble: {
    key: "bubble",
    name: "Bubble Sort",
    time: "O(n²)",
    space: "O(1)",
    blurb: "Repeatedly swaps neighbouring pairs until the largest value bubbles to the end.",
    pseudocode: [
      "for i from 0 to n-1",
      "  for j from 0 to n-i-2",
      "    if a[j] > a[j+1]",
      "      swap a[j], a[j+1]",
      "  mark a[n-i-1] sorted",
    ],
  },
  selection: {
    key: "selection",
    name: "Selection Sort",
    time: "O(n²)",
    space: "O(1)",
    blurb: "Scans for the smallest remaining value and places it at the front.",
    pseudocode: [
      "for i from 0 to n-1",
      "  min = i",
      "  for j from i+1 to n-1",
      "    if a[j] < a[min] then min = j",
      "  swap a[i], a[min]",
    ],
  },
  insertion: {
    key: "insertion",
    name: "Insertion Sort",
    time: "O(n²)",
    space: "O(1)",
    blurb: "Grows a sorted prefix by inserting each new value into its place.",
    pseudocode: [
      "for i from 1 to n-1",
      "  key = a[i]",
      "  j = i - 1",
      "  while j >= 0 and a[j] > key",
      "    a[j+1] = a[j]; j = j - 1",
      "  a[j+1] = key",
    ],
  },
  merge: {
    key: "merge",
    name: "Merge Sort",
    time: "O(n log n)",
    space: "O(n)",
    blurb: "Splits the array in half, sorts each half, then merges them in order.",
    pseudocode: [
      "mergeSort(lo, hi)",
      "  if lo >= hi return",
      "  mid = (lo + hi) / 2",
      "  mergeSort(lo, mid); mergeSort(mid+1, hi)",
      "  merge the two halves",
      "  copy merged values back",
    ],
  },
  quick: {
    key: "quick",
    name: "Quick Sort",
    time: "O(n log n) avg",
    space: "O(log n)",
    blurb: "Picks a pivot, partitions smaller/larger around it, then recurses.",
    pseudocode: [
      "quickSort(lo, hi)",
      "  if lo >= hi return",
      "  pivot = a[hi]",
      "  partition: move smaller values left",
      "  place pivot at its final index p",
      "  quickSort(lo, p-1); quickSort(p+1, hi)",
    ],
  },
};

export const ALGO_LIST = Object.values(ALGOS);

function clone(a: Item[]): Item[] {
  return a.map((x) => ({ ...x }));
}

export function buildFrames(input: number[], algo: AlgoKey): Frame[] {
  const a: Item[] = input.map((value, i) => ({ id: i, value }));
  const frames: Frame[] = [];
  let comparisons = 0;
  let swaps = 0;
  const sorted = new Set<number>();

  const push = (p: Partial<Frame> & { caption: string; note: string; line: number }) => {
    frames.push({
      array: clone(a),
      comparing: [],
      swapping: [],
      pivot: null,
      ...p,
      sorted: [...sorted],
      comparisons,
      swaps,
    });
  };

  push({ caption: "Start", note: "unsorted array", line: 0 });

  if (algo === "bubble") {
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        comparisons++;
        const x = a[j]!.value;
        const y = a[j + 1]!.value;
        push({
          comparing: [j, j + 1],
          caption: `Compare ${x} and ${y}`,
          note: x > y ? `${x} > ${y} — swap` : `${x} ≤ ${y} — no swap`,
          line: 2,
        });
        if (x > y) {
          const tmp = a[j]!;
          a[j] = a[j + 1]!;
          a[j + 1] = tmp;
          swaps++;
          push({ swapping: [j, j + 1], caption: `Swap`, note: "positions exchanged", line: 3 });
        }
      }
      sorted.add(n - i - 1);
      push({ caption: `${a[n - i - 1]!.value} is in place`, note: "locked in", line: 4 });
    }
    sorted.add(0);
  }

  if (algo === "selection") {
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
      let min = i;
      push({ comparing: [i], caption: `Assume ${a[i]!.value} is the minimum`, note: "scan the rest", line: 1 });
      for (let j = i + 1; j < n; j++) {
        comparisons++;
        const cur = a[j]!.value;
        const best = a[min]!.value;
        push({
          comparing: [min, j],
          caption: `Compare ${cur} with current min ${best}`,
          note: cur < best ? `${cur} is smaller — new min` : "keep current min",
          line: 3,
        });
        if (cur < best) min = j;
      }
      if (min !== i) {
        const tmp = a[i]!;
        a[i] = a[min]!;
        a[min] = tmp;
        swaps++;
        push({ swapping: [i, min], caption: `Swap into position ${i}`, note: "minimum placed", line: 4 });
      }
      sorted.add(i);
      push({ caption: `${a[i]!.value} is in place`, note: "locked in", line: 4 });
    }
    sorted.add(n - 1);
  }

  if (algo === "insertion") {
    const n = a.length;
    sorted.add(0);
    for (let i = 1; i < n; i++) {
      const key = a[i]!;
      push({ comparing: [i], caption: `Take ${key.value} as the key`, note: "insert into sorted part", line: 1 });
      let j = i - 1;
      while (j >= 0 && a[j]!.value > key.value) {
        comparisons++;
        push({
          comparing: [j, j + 1],
          caption: `${a[j]!.value} > ${key.value}`,
          note: "shift right",
          line: 4,
        });
        a[j + 1] = a[j]!;
        swaps++;
        j--;
      }
      if (j >= 0) comparisons++;
      a[j + 1] = key;
      sorted.add(i);
      push({ swapping: [j + 1], caption: `Insert ${key.value} at index ${j + 1}`, note: "prefix sorted", line: 5 });
    }
  }

  if (algo === "merge") {
    const mergeSort = (lo: number, hi: number) => {
      if (lo >= hi) return;
      const mid = Math.floor((lo + hi) / 2);
      push({
        comparing: range(lo, hi),
        caption: `Split [${lo}…${hi}]`,
        note: "divide",
        line: 2,
      });
      mergeSort(lo, mid);
      mergeSort(mid + 1, hi);
      const left = a.slice(lo, mid + 1);
      const right = a.slice(mid + 1, hi + 1);
      let i = 0;
      let j = 0;
      let k = lo;
      while (i < left.length && j < right.length) {
        comparisons++;
        const lv = left[i]!.value;
        const rv = right[j]!.value;
        push({
          comparing: [k],
          caption: `Merge: compare ${lv} and ${rv}`,
          note: lv <= rv ? "take left" : "take right",
          line: 4,
        });
        a[k++] = lv <= rv ? left[i++]! : right[j++]!;
        swaps++;
      }
      while (i < left.length) a[k++] = left[i++]!;
      while (j < right.length) a[k++] = right[j++]!;
      push({
        swapping: range(lo, hi),
        caption: `Merged [${lo}…${hi}]`,
        note: "sorted run",
        line: 5,
      });
    };
    mergeSort(0, a.length - 1);
    for (let i = 0; i < a.length; i++) sorted.add(i);
  }

  if (algo === "quick") {
    const quickSort = (lo: number, hi: number) => {
      if (lo > hi) return;
      if (lo === hi) {
        sorted.add(lo);
        push({ caption: `${a[lo]!.value} is in place`, note: "single element", line: 1 });
        return;
      }
      const pivotVal = a[hi]!.value;
      push({ pivot: hi, caption: `Pivot = ${pivotVal}`, note: "partition around it", line: 2 });
      let i = lo;
      for (let j = lo; j < hi; j++) {
        comparisons++;
        const cur = a[j]!.value;
        push({
          pivot: hi,
          comparing: [j],
          caption: `Compare ${cur} with pivot ${pivotVal}`,
          note: cur < pivotVal ? "smaller — move left" : "larger — stay",
          line: 3,
        });
        if (cur < pivotVal) {
          if (i !== j) {
            const tmp = a[i]!;
            a[i] = a[j]!;
            a[j] = tmp;
            swaps++;
            push({ pivot: hi, swapping: [i, j], caption: "Swap", note: "keep small values left", line: 3 });
          }
          i++;
        }
      }
      const tmp2 = a[i]!;
      a[i] = a[hi]!;
      a[hi] = tmp2;
      swaps++;
      sorted.add(i);
      push({ swapping: [i, hi], caption: `Pivot ${pivotVal} lands at index ${i}`, note: "final position", line: 4 });
      quickSort(lo, i - 1);
      quickSort(i + 1, hi);
    };
    quickSort(0, a.length - 1);
    for (let i = 0; i < a.length; i++) sorted.add(i);
  }

  push({ caption: "Sorted!", note: "done", line: 0 });
  return frames;
}

function range(lo: number, hi: number) {
  const out: number[] = [];
  for (let i = lo; i <= hi; i++) out.push(i);
  return out;
}

export function randomArray(size: number, max = 12): number[] {
  return Array.from({ length: size }, () => 1 + Math.floor(Math.random() * max));
}
