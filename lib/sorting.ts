export type Frame = {
  array: { id: number; value: number }[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  pivot: number | null;
  minPointer?: number | null;
  keyIndex?: number | null;
  gap?: number | null;
  direction?: "forward" | "backward" | null;
  digitPlace?: number | null;
  heapSize?: number | null;
  gnomePos?: number | null;
  caption: string;
  note: string;
  line: number;
  comparisons: number;
  swaps: number;
  tree: RecursionTree | null;
  counts?: number[] | null;
  activeCountIndex?: number | null;
  buckets?: { label: string; values: number[] }[] | null;
};

export type MergeNodeStatus = "hidden" | "idle" | "splitting" | "merging" | "merged";

/** Carries the original item id so the UI can fly the same token between boxes. */
export type MergeSlot = { id: number; value: number } | null;

export type MergeTreeNode = {
  id: string;
  lo: number;
  hi: number;
  depth: number;
  parentId: string | null;
  /** Values held by this sub-array; `null` marks a slot still waiting to be merged. */
  slots: MergeSlot[];
  status: MergeNodeStatus;
};

export type MergeTree = {
  kind: "merge";
  nodes: MergeTreeNode[];
  maxDepth: number;
  leaves: number;
};

export type QuickNodeStatus = "idle" | "pivoting" | "partitioning" | "placed" | "sorted";

export type QuickTreeNode = {
  id: string;
  lo: number;
  hi: number;
  depth: number;
  parentId: string | null;
  /** Current values held by a[lo..hi]. */
  values: number[];
  pivotValue: number | null;
  /** Absolute index (into the full array) currently holding the pivot. */
  pivotIndex: number | null;
  status: QuickNodeStatus;
};

export type QuickTree = {
  kind: "quick";
  nodes: QuickTreeNode[];
  maxDepth: number;
  leaves: number;
};

export type RecursionTree = MergeTree | QuickTree;

export type Item = { id: number; value: number };

export type AlgoKey =
  | "bubble"
  | "selection"
  | "insertion"
  | "merge"
  | "quick"
  | "heap"
  | "shell"
  | "counting"
  | "radix"
  | "bucket"
  | "cocktail"
  | "gnome";

export type AlgoMeta = {
  key: AlgoKey;
  name: string;
  time: string;
  space: string;
  blurb: string;
  stable: boolean;
  inPlace: boolean;
  pseudocode: string[];
};

export const ALGOS: Record<AlgoKey, AlgoMeta> = {
  bubble: {
    key: "bubble",
    name: "Bubble Sort",
    time: "O(n²)",
    space: "O(1)",
    blurb:
      "A comparison sort that repeatedly steps through the array, compares each pair of adjacent elements, and swaps them if they are in the wrong order. Each full pass 'bubbles' the largest remaining value to its final position, so the algorithm needs at most n-1 passes.",
    stable: true,
    inPlace: true,
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
    blurb:
      "A comparison sort that divides the array into a sorted prefix and an unsorted suffix. On each pass it selects the minimum element of the unsorted suffix and swaps it into the next position of the sorted prefix, growing it by one element at a time.",
    stable: false,
    inPlace: true,
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
    blurb:
      "A comparison sort that builds the final sorted array one element at a time. It takes each element from the unsorted part and inserts it into its correct position within the already-sorted prefix, shifting larger elements right to make room — the same way you'd sort playing cards in your hand.",
    stable: true,
    inPlace: true,
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
    blurb:
      "A divide-and-conquer comparison sort. It recursively splits the array in half until each piece is a single element (trivially sorted), then merges pairs of sorted pieces back together in order. The recursion forms a binary tree: dividing takes it down, merging brings the sorted result back up.",
    stable: true,
    inPlace: false,
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
    time: "O(n log n) avg, O(n²) worst",
    space: "O(log n)",
    blurb:
      "A divide-and-conquer comparison sort. It chooses a pivot element and partitions the array so everything smaller than the pivot ends up on its left and everything larger ends up on its right, placing the pivot at its final sorted index. It then recurses on the two partitions independently — the pivot never needs to move again.",
    stable: false,
    inPlace: true,
    pseudocode: [
      "quickSort(lo, hi)",
      "  if lo >= hi return",
      "  pivot = a[hi]",
      "  partition: move smaller values left",
      "  place pivot at its final index p",
      "  quickSort(lo, p-1); quickSort(p+1, hi)",
    ],
  },
  heap: {
    key: "heap",
    name: "Heap Sort",
    time: "O(n log n)",
    space: "O(1)",
    blurb:
      "A comparison sort built on the binary heap data structure. It first arranges the array into a max-heap (every parent is ≥ its children), so the largest value sits at the root. It then repeatedly swaps the root with the last unsorted element and 'sifts down' the new root to restore the heap property, shrinking the heap by one each time.",
    stable: false,
    inPlace: true,
    pseudocode: [
      "heapify(a, i, size):",
      "  left = 2*i + 1; right = 2*i + 2",
      "  largest = maxIndex(i, left, right)",
      "  if largest != i:",
      "    swap a[i], a[largest]",
      "    heapify(a, largest, size)",
      "heapSort(a):",
      "  buildMaxHeap: heapify all non-leaf nodes",
      "  for i from n-1 down to 1:",
      "    swap a[0], a[i]; heapify(a, 0, i)",
    ],
  },
  shell: {
    key: "shell",
    name: "Shell Sort",
    time: "O(n log² n) (gap-dependent)",
    space: "O(1)",
    blurb:
      "A generalization of insertion sort. Instead of only comparing neighbours, it compares elements a fixed gap h apart, insertion-sorting each of those interleaved sub-sequences. The gap shrinks on each pass (here, halved every time) down to 1, so early passes move far-out-of-place elements long distances quickly, leaving little work for the final gap-1 pass.",
    stable: false,
    inPlace: true,
    pseudocode: [
      "shellSort(a):",
      "  for gap = floor(n/2) down to 1 (gap /= 2):",
      "    for i = gap to n-1:",
      "      j = i",
      "      while j >= gap and a[j-gap] > a[j]:",
      "        swap a[j-gap], a[j]",
      "        j = j - gap // step backward by gap",
    ],
  },
  counting: {
    key: "counting",
    name: "Counting Sort",
    time: "O(n + k)",
    space: "O(k)",
    blurb:
      "A non-comparison integer sort. Instead of comparing elements, it counts how many times each distinct value (0 to k) occurs, then uses those counts to write every value directly into its final sorted position. Because it never compares elements, it beats the O(n log n) comparison-sort lower bound — at the cost of needing k to be small relative to n.",
    stable: true,
    inPlace: false,
    pseudocode: [
      "find max value k in array",
      "count = array of size k+1 initialized to 0",
      "for each element x in a: count[x]++",
      "reconstruct array a using count frequencies",
    ],
  },
  radix: {
    key: "radix",
    name: "Radix Sort",
    time: "O(d · (n + b))",
    space: "O(n + b)",
    blurb:
      "A non-comparison integer sort that processes digits rather than whole values. It repeatedly buckets elements by one digit at a time — least significant first — using a stable counting/bucket pass, and re-collects them after each pass. After d passes (d = number of digits in the largest value), the array is fully sorted.",
    stable: true,
    inPlace: false,
    pseudocode: [
      "m = max(a)",
      "for exp = 1; m / exp > 0; exp *= 10",
      "  countSortByDigit(a, exp)",
    ],
  },
  bucket: {
    key: "bucket",
    name: "Bucket Sort",
    time: "O(n + k) avg, O(n²) worst",
    space: "O(n + k)",
    blurb:
      "A distribution sort that scatters elements into a fixed number of buckets based on their value range, sorts each (usually small) bucket individually, and concatenates the buckets back together in order. It works best when input values are spread roughly uniformly across the range, so buckets fill evenly.",
    stable: true,
    inPlace: false,
    pseudocode: [
      "buckets = array of empty buckets",
      "for x in a: insert x into bucket[floor(x / interval)]",
      "sort individual buckets",
      "concatenate buckets into original array",
    ],
  },
  cocktail: {
    key: "cocktail",
    name: "Cocktail Shaker Sort",
    time: "O(n²)",
    space: "O(1)",
    blurb:
      "A bidirectional variant of bubble sort. It alternates passes: left-to-right, bubbling the largest remaining value to the end, then right-to-left, sinking the smallest remaining value to the start. Shrinking the unsorted window from both ends each round lets small values near the end escape faster than plain bubble sort would move them.",
    stable: true,
    inPlace: true,
    pseudocode: [
      "cocktailSort(a):",
      "  start = 0; end = n - 1; swapped = true",
      "  while swapped:",
      "    // Pass 1 (L->R): bubble largest value to end",
      "    for i = start to end-1: if a[i] > a[i+1] swap",
      "    end-- // lock rightmost element",
      "    // Pass 2 (R->L): sink smallest value to start",
      "    for i = end-1 down to start: if a[i] > a[i+1] swap",
      "    start++ // lock leftmost element",
    ],
  },
  gnome: {
    key: "gnome",
    name: "Gnome Sort",
    time: "O(n²)",
    space: "O(1)",
    blurb:
      "A comparison sort resembling insertion sort but implemented with a single moving position instead of nested loops. It steps forward whenever the current pair is in order, and whenever it isn't, it swaps the pair and steps back one place — repeating the check — until the prefix behind it is locally sorted again.",
    stable: true,
    inPlace: true,
    pseudocode: [
      "pos = 0",
      "while pos < n",
      "  if pos == 0 or a[pos] >= a[pos-1]",
      "    pos++",
      "  else",
      "    swap a[pos], a[pos-1]; pos--",
    ],
  },
};

export const ALGO_LIST = Object.values(ALGOS);

function clone(a: Item[]): Item[] {
  return a.map((x) => ({ ...x }));
}

type MergeTreeState = {
  node: (lo: number, hi: number) => MergeTreeNode;
  /** Hides everything below [lo…hi] once that range is merged. */
  collapse: (lo: number, hi: number) => void;
  snapshot: () => MergeTree;
};

/** Pre-builds every node of the merge-sort recursion tree; all but the root start hidden. */
function createMergeTree(items: Item[]): MergeTreeState {
  const nodes = new Map<string, MergeTreeNode>();
  let maxDepth = 0;

  const add = (lo: number, hi: number, depth: number, parentId: string | null) => {
    const id = `${lo}-${hi}`;
    maxDepth = Math.max(maxDepth, depth);
    nodes.set(id, {
      id,
      lo,
      hi,
      depth,
      parentId,
      slots: items.slice(lo, hi + 1).map((item) => ({ id: item.id, value: item.value })),
      status: depth === 0 ? "idle" : "hidden",
    });
    if (lo >= hi) return;
    const mid = Math.floor((lo + hi) / 2);
    add(lo, mid, depth + 1, id);
    add(mid + 1, hi, depth + 1, id);
  };

  add(0, items.length - 1, 0, null);

  return {
    node: (lo, hi) => nodes.get(`${lo}-${hi}`)!,
    collapse: (lo, hi) => {
      for (const node of nodes.values()) {
        const isDescendant =
          node.lo >= lo && node.hi <= hi && !(node.lo === lo && node.hi === hi);
        if (isDescendant) node.status = "hidden";
      }
    },
    snapshot: () => ({
      kind: "merge",
      maxDepth,
      leaves: items.length,
      nodes: [...nodes.values()].map((n) => ({ ...n, slots: [...n.slots] })),
    }),
  };
}

type QuickTreeState = {
  ensure: (lo: number, hi: number, parentId: string | null, depth: number) => QuickTreeNode;
  snapshot: () => QuickTree;
};

/** Builds the quick-sort partition tree lazily, since split points depend on runtime values. */
function createQuickTree(leaves: number): QuickTreeState {
  const nodes = new Map<string, QuickTreeNode>();
  let maxDepth = 0;

  return {
    ensure: (lo, hi, parentId, depth) => {
      const id = `${lo}-${hi}`;
      maxDepth = Math.max(maxDepth, depth);
      let node = nodes.get(id);
      if (!node) {
        node = { id, lo, hi, depth, parentId, values: [], pivotValue: null, pivotIndex: null, status: "idle" };
        nodes.set(id, node);
      }
      return node;
    },
    snapshot: () => ({
      kind: "quick",
      maxDepth,
      leaves,
      nodes: [...nodes.values()].map((n) => ({ ...n, values: [...n.values] })),
    }),
  };
}

export function buildFrames(input: number[], algo: AlgoKey): Frame[] {
  const a: Item[] = input.map((value, i) => ({ id: i, value }));
  const frames: Frame[] = [];
  let comparisons = 0;
  let swaps = 0;
  const sorted = new Set<number>();
  const mergeTree = algo === "merge" ? createMergeTree(a) : null;
  const quickTree = algo === "quick" ? createQuickTree(input.length) : null;

  const push = (p: Partial<Frame> & { caption: string; note: string; line: number }) => {
    frames.push({
      array: clone(a),
      comparing: [],
      swapping: [],
      pivot: null,
      minPointer: null,
      keyIndex: null,
      gap: null,
      direction: null,
      digitPlace: null,
      heapSize: null,
      gnomePos: null,
      counts: null,
      activeCountIndex: null,
      buckets: null,
      ...p,
      sorted: [...sorted],
      comparisons,
      swaps,
      tree: mergeTree ? mergeTree.snapshot() : quickTree ? quickTree.snapshot() : null,
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
      push({ minPointer: min, comparing: [i], caption: `Assume ${a[i]!.value} is the minimum`, note: "scan the rest", line: 1 });
      for (let j = i + 1; j < n; j++) {
        comparisons++;
        const cur = a[j]!.value;
        const best = a[min]!.value;
        push({
          minPointer: min,
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
        push({ minPointer: min, swapping: [i, min], caption: `Swap into position ${i}`, note: "minimum placed", line: 4 });
      }
      sorted.add(i);
      push({ minPointer: null, caption: `${a[i]!.value} is in place`, note: "locked in", line: 4 });
    }
    sorted.add(n - 1);
  }

  if (algo === "insertion") {
    const n = a.length;
    sorted.add(0);
    for (let i = 1; i < n; i++) {
      const keyVal = a[i]!.value;
      push({
        keyIndex: i,
        comparing: [i],
        caption: `Take ${keyVal} as the key`,
        note: "insert into sorted part",
        line: 1,
      });
      let j = i;
      while (j > 0) {
        comparisons++;
        const left = a[j - 1]!.value;
        const right = a[j]!.value;
        push({
          keyIndex: j,
          comparing: [j - 1, j],
          caption: `Compare ${left} and ${right}`,
          note: left > right ? "shift key left" : "key found its place",
          line: 3,
        });
        if (left <= right) break;
        const tmp = a[j - 1]!;
        a[j - 1] = a[j]!;
        a[j] = tmp;
        swaps++;
        push({
          keyIndex: j - 1,
          swapping: [j - 1, j],
          caption: `Shift ${keyVal} left`,
          note: "swap with neighbour",
          line: 4,
        });
        j--;
      }
      sorted.add(i);
      push({
        keyIndex: j,
        swapping: [j],
        caption: `Insert ${keyVal} at index ${j}`,
        note: "prefix sorted",
        line: 5,
      });
    }
  }

  if (algo === "merge" && mergeTree) {
    const mergeSort = (lo: number, hi: number) => {
      const node = mergeTree.node(lo, hi);

      if (lo >= hi) {
        node.status = "merged";
        push({
          comparing: [lo],
          caption: `[${a[lo]!.value}] is a single element`,
          note: "already sorted",
          line: 1,
        });
        return;
      }

      const mid = Math.floor((lo + hi) / 2);
      const leftNode = mergeTree.node(lo, mid);
      const rightNode = mergeTree.node(mid + 1, hi);
      node.status = "splitting";
      leftNode.status = "idle";
      leftNode.slots = a.slice(lo, mid + 1).map((item) => ({ id: item.id, value: item.value }));
      rightNode.status = "idle";
      rightNode.slots = a.slice(mid + 1, hi + 1).map((item) => ({ id: item.id, value: item.value }));
      push({
        comparing: range(lo, hi),
        caption: `Split [${lo}…${hi}] at ${mid}`,
        note: "divide",
        line: 2,
      });

      mergeSort(lo, mid);
      mergeSort(mid + 1, hi);

      const left = a.slice(lo, mid + 1);
      const right = a.slice(mid + 1, hi + 1);
      const merged: Item[] = [];
      let i = 0;
      let j = 0;
      node.status = "merging";
      node.slots = new Array<MergeSlot>(hi - lo + 1).fill(null);
      push({
        comparing: range(lo, hi),
        caption: `Merge [${lo}…${mid}] with [${mid + 1}…${hi}]`,
        note: "conquer",
        line: 4,
      });

      // Clearing the source box's slot in the same step that fills the destination
      // slot is what lets the UI fly the same token from one box to the other.
      const take = (source: "left" | "right", index: number, item: Item) => {
        node.slots[merged.length] = { id: item.id, value: item.value };
        if (source === "left") leftNode.slots[index] = null;
        else rightNode.slots[index] = null;
        merged.push(item);
        swaps++;
      };

      while (i < left.length && j < right.length) {
        comparisons++;
        const lv = left[i]!.value;
        const rv = right[j]!.value;
        const fromLeft = lv <= rv;
        if (fromLeft) {
          take("left", i, left[i]!);
          i++;
        } else {
          take("right", j, right[j]!);
          j++;
        }
        push({
          comparing: [lo + merged.length - 1],
          caption: `Compare ${lv} and ${rv} — take ${fromLeft ? lv : rv}`,
          note: fromLeft ? "left half wins" : "right half wins",
          line: 4,
        });
      }

      if (i < left.length || j < right.length) {
        const rest = i < left.length ? left.slice(i) : right.slice(j);
        while (i < left.length) {
          take("left", i, left[i]!);
          i++;
        }
        while (j < right.length) {
          take("right", j, right[j]!);
          j++;
        }
        push({
          comparing: range(lo + merged.length - rest.length, lo + merged.length - 1),
          caption: `Copy remaining ${rest.map((item) => item.value).join(", ")}`,
          note: "one half is empty",
          line: 4,
        });
      }

      merged.forEach((item, offset) => {
        a[lo + offset] = item;
      });
      node.status = "merged";
      mergeTree.collapse(lo, hi);
      push({
        swapping: range(lo, hi),
        caption: `Merged [${lo}…${hi}]`,
        note: "halves folded in",
        line: 5,
      });
    };
    mergeSort(0, a.length - 1);
    for (let i = 0; i < a.length; i++) sorted.add(i);
  }

  if (algo === "quick" && quickTree) {
    const syncValues = (node: QuickTreeNode, lo: number, hi: number) => {
      node.values = a.slice(lo, hi + 1).map((item) => item.value);
    };

    const quickSort = (lo: number, hi: number, parentId: string | null, depth: number) => {
      if (lo > hi) return;
      const node = quickTree.ensure(lo, hi, parentId, depth);
      syncValues(node, lo, hi);

      if (lo === hi) {
        node.status = "sorted";
        sorted.add(lo);
        push({ caption: `${a[lo]!.value} is in place`, note: "single element", line: 1 });
        return;
      }

      const pivotVal = a[hi]!.value;
      node.pivotValue = pivotVal;
      node.pivotIndex = hi;
      node.status = "pivoting";
      push({ pivot: hi, caption: `Pivot = ${pivotVal}`, note: "partition around it", line: 2 });

      node.status = "partitioning";
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
            syncValues(node, lo, hi);
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
      node.pivotIndex = i;
      node.status = "placed";
      syncValues(node, lo, hi);
      push({ swapping: [i, hi], caption: `Pivot ${pivotVal} lands at index ${i}`, note: "final position", line: 4 });

      quickSort(lo, i - 1, node.id, depth + 1);
      quickSort(i + 1, hi, node.id, depth + 1);

      node.status = "sorted";
      push({ caption: `[${lo}…${hi}] is fully sorted`, note: "left and right partitions merged in place", line: 4 });
    };
    quickSort(0, a.length - 1, null, 0);
    for (let i = 0; i < a.length; i++) sorted.add(i);
  }

  if (algo === "heap") {
    const n = a.length;

    const siftDown = (i: number, heapSize: number) => {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      const compareIndices = [i];
      if (left < heapSize) compareIndices.push(left);
      if (right < heapSize) compareIndices.push(right);

      if (left < heapSize) {
        comparisons++;
        if (a[left]!.value > a[largest]!.value) {
          largest = left;
        }
      }
      if (right < heapSize) {
        comparisons++;
        if (a[right]!.value > a[largest]!.value) {
          largest = right;
        }
      }

      const leftText = left < heapSize ? `left child a[${left}] (${a[left]!.value})` : "no left child";
      const rightText = right < heapSize ? `right child a[${right}] (${a[right]!.value})` : "no right child";

      push({
        heapSize,
        comparing: compareIndices,
        caption: `heapify(node ${i}): Compare parent a[${i}] (${a[i]!.value}) with ${leftText} and ${rightText}`,
        note: `largest = ${a[largest]!.value} at index ${largest}`,
        line: 2,
      });

      if (largest !== i) {
        const tmp = a[i]!;
        a[i] = a[largest]!;
        a[largest] = tmp;
        swaps++;
        push({
          heapSize,
          swapping: [i, largest],
          caption: `heapify(node ${i}): Parent ${tmp.value} < Child ${a[i]!.value} → swap to restore Max Heap property`,
          note: "trickle down smaller value",
          line: 4,
        });
        siftDown(largest, heapSize);
      } else {
        push({
          heapSize,
          comparing: [i],
          caption: `heapify(node ${i}): Parent ${a[i]!.value} is ≥ children → Max Heap property satisfied!`,
          note: "no swap required",
          line: 2,
        });
      }
    };

    push({
      heapSize: n,
      caption: "Build Max Heap: call heapify on all non-leaf nodes (from index floor(n/2)-1 down to 0)",
      note: "building max heap",
      line: 7,
    });
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      siftDown(i, n);
    }

    push({
      heapSize: n,
      caption: "Max Heap built! Root a[0] now holds the array maximum element",
      note: "max heap ready",
      line: 7,
    });

    for (let i = n - 1; i > 0; i--) {
      const rootVal = a[0]!.value;
      const tmp = a[0]!;
      a[0] = a[i]!;
      a[i] = tmp;
      swaps++;
      sorted.add(i);
      push({
        heapSize: i,
        swapping: [0, i],
        caption: `Extract root max ${rootVal}: swap root a[0] with a[${i}]`,
        note: `element ${rootVal} locked in place at end`,
        line: 9,
      });

      siftDown(0, i);
    }
    sorted.add(0);
  }

  if (algo === "shell") {
    const n = a.length;
    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
      push({
        gap,
        caption: `Shell sort gap = ${gap}: Compare elements separated by ${gap} positions`,
        note: `starting pass for gap ${gap}`,
        line: 1,
      });

      for (let i = gap; i < n; i++) {
        let j = i;

        while (j >= gap) {
          comparisons++;
          const leftIdx = j - gap;
          const rightIdx = j;
          const leftVal = a[leftIdx]!.value;
          const rightVal = a[rightIdx]!.value;

          push({
            gap,
            comparing: [leftIdx, rightIdx],
            caption: `Gap comparison (gap=${gap}): Compare a[${leftIdx}] (${leftVal}) and a[${rightIdx}] (${rightVal})`,
            note: leftVal > rightVal ? `${leftVal} > ${rightVal} → swap across gap ${gap}` : "in order",
            line: 4,
          });

          if (leftVal <= rightVal) break;

          const tmp = a[j]!;
          a[j] = a[j - gap]!;
          a[j - gap] = tmp;
          swaps++;

          push({
            gap,
            swapping: [leftIdx, rightIdx],
            caption: `Swap a[${leftIdx}] (${leftVal}) and a[${rightIdx}] (${rightVal}) across gap ${gap}`,
            note: `item ${leftVal} moved ${gap} positions right`,
            line: 5,
          });

          j -= gap;
        }
      }
    }
    for (let i = 0; i < n; i++) sorted.add(i);
  }

  if (algo === "counting") {
    const n = a.length;
    const maxVal = Math.max(...a.map((x) => x.value));
    const counts = new Array(maxVal + 1).fill(0);

    push({
      caption: `Count occurrences of each value (0 to ${maxVal})`,
      note: "non-comparison frequency tally",
      counts: [...counts],
      activeCountIndex: null,
      line: 1,
    });

    for (let i = 0; i < n; i++) {
      const val = a[i]!.value;
      counts[val]++;
      push({
        comparing: [i],
        counts: [...counts],
        activeCountIndex: val,
        caption: `Tally value ${val} -> count[${val}] = ${counts[val]}`,
        note: `incrementing count at index ${val}`,
        line: 2,
      });
    }

    let writeIdx = 0;
    for (let val = 0; val <= maxVal; val++) {
      while (counts[val] > 0) {
        a[writeIdx]!.value = val;
        sorted.add(writeIdx);
        counts[val]--;
        swaps++;
        push({
          swapping: [writeIdx],
          counts: [...counts],
          activeCountIndex: val,
          caption: `Reconstruct sorted array: place ${val} at index ${writeIdx}`,
          note: `count[${val}] decremented to ${counts[val]}`,
          line: 3,
        });
        writeIdx++;
      }
    }
  }

  if (algo === "radix") {
    const n = a.length;
    const maxVal = Math.max(...a.map((x) => x.value));

    for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
      push({
        digitPlace: exp,
        caption: `Radix pass for digit place ${exp}`,
        note: "sorting by current digit",
        line: 1,
      });

      const buckets: number[][] = Array.from({ length: 10 }, () => []);
      for (let i = 0; i < n; i++) {
        const val = a[i]!.value;
        const digit = Math.floor(val / exp) % 10;
        buckets[digit]!.push(val);
        push({
          digitPlace: exp,
          comparing: [i],
          buckets: buckets.map((b, d) => ({
            label: `Digit ${d}`,
            values: [...b],
          })),
          caption: `Element ${val} has digit ${digit} at place ${exp}`,
          note: `placed in bucket ${digit}`,
          line: 2,
        });
      }

      let idx = 0;
      for (let d = 0; d < 10; d++) {
        for (const val of buckets[d]!) {
          a[idx]!.value = val;
          swaps++;
          push({
            digitPlace: exp,
            swapping: [idx],
            buckets: buckets.map((b, bIdx) => ({
              label: `Digit ${bIdx}`,
              values: [...b],
            })),
            caption: `Gather bucket ${d}: place ${val} at index ${idx}`,
            note: "rebuilding from buckets",
            line: 2,
          });
          idx++;
        }
      }
    }
    for (let i = 0; i < n; i++) sorted.add(i);
  }

  if (algo === "bucket") {
    const n = a.length;
    const maxVal = Math.max(...a.map((x) => x.value)) || 1;
    const bucketCount = 3;
    const buckets: number[][] = Array.from({ length: bucketCount }, () => []);

    push({
      caption: `Scatter ${n} elements into ${bucketCount} buckets`,
      note: "distribute by value ranges",
      line: 1,
    });

    for (let i = 0; i < n; i++) {
      const val = a[i]!.value;
      const bIdx = Math.min(
        bucketCount - 1,
        Math.floor((val / (maxVal + 1)) * bucketCount),
      );
      buckets[bIdx]!.push(val);
      push({
        comparing: [i],
        buckets: buckets.map((b, idx) => ({
          label: `Bucket ${idx + 1}`,
          values: [...b],
        })),
        caption: `Value ${val} -> Bucket ${bIdx + 1}`,
        note: `scatter stage`,
        line: 1,
      });
    }

    let writeIdx = 0;
    for (let b = 0; b < bucketCount; b++) {
      buckets[b]!.sort((x, y) => x - y);
      for (const val of buckets[b]!) {
        a[writeIdx]!.value = val;
        swaps++;
        sorted.add(writeIdx);
        push({
          swapping: [writeIdx],
          buckets: buckets.map((bItems, idx) => ({
            label: `Bucket ${idx + 1}`,
            values: [...bItems],
          })),
          caption: `Gather from Bucket ${b + 1}: place ${val} at index ${writeIdx}`,
          note: "gather stage",
          line: 3,
        });
        writeIdx++;
      }
    }
  }

  if (algo === "cocktail") {
    let start = 0;
    let end = a.length - 1;
    let swapped = true;

    while (swapped) {
      swapped = false;

      for (let i = start; i < end; i++) {
        comparisons++;
        const x = a[i]!.value;
        const y = a[i + 1]!.value;
        push({
          direction: "forward",
          comparing: [i, i + 1],
          caption: `Forward pass (L->R): compare ${x} and ${y} — bubbling max right`,
          note: x > y ? `${x} > ${y} → swap` : "in order",
          line: 4,
        });
        if (x > y) {
          const tmp = a[i]!;
          a[i] = a[i + 1]!;
          a[i + 1] = tmp;
          swaps++;
          swapped = true;
          push({
            direction: "forward",
            swapping: [i, i + 1],
            caption: `Swap ${x} and ${y} (bubbling larger element right)`,
            note: "forward swap",
            line: 4,
          });
        }
      }

      if (!swapped) break;
      sorted.add(end);
      push({
        direction: "forward",
        caption: `Lock rightmost element ${a[end]!.value} at index ${end}`,
        note: "end boundary decreased",
        line: 5,
      });
      end--;
      swapped = false;

      for (let i = end - 1; i >= start; i--) {
        comparisons++;
        const x = a[i]!.value;
        const y = a[i + 1]!.value;
        push({
          direction: "backward",
          comparing: [i, i + 1],
          caption: `Backward pass (R->L): compare ${x} and ${y} — sinking min left`,
          note: x > y ? `${x} > ${y} → swap` : "in order",
          line: 7,
        });
        if (x > y) {
          const tmp = a[i]!;
          a[i] = a[i + 1]!;
          a[i + 1] = tmp;
          swaps++;
          swapped = true;
          push({
            direction: "backward",
            swapping: [i, i + 1],
            caption: `Swap ${x} and ${y} (sinking smaller element left)`,
            note: "backward swap",
            line: 7,
          });
        }
      }
      sorted.add(start);
      push({
        direction: "backward",
        caption: `Lock leftmost element ${a[start]!.value} at index ${start}`,
        note: "start boundary increased",
        line: 8,
      });
      start++;
    }
    for (let i = 0; i < a.length; i++) sorted.add(i);
  }

  if (algo === "gnome") {
    let pos = 0;
    const n = a.length;

    while (pos < n) {
      if (pos === 0) {
        pos++;
      } else {
        comparisons++;
        const cur = a[pos]!.value;
        const prev = a[pos - 1]!.value;
        push({
          gnomePos: pos,
          comparing: [pos - 1, pos],
          caption: `Gnome compare: ${prev} vs ${cur}`,
          note: prev <= cur ? "in order -> step right" : "out of order -> swap and step left",
          line: 2,
        });

        if (a[pos]!.value >= a[pos - 1]!.value) {
          pos++;
        } else {
          const tmp = a[pos]!;
          a[pos] = a[pos - 1]!;
          a[pos - 1] = tmp;
          swaps++;
          push({ gnomePos: pos - 1, swapping: [pos - 1, pos], caption: `Swap ${prev} and ${cur}`, note: "step left", line: 5 });
          pos--;
        }
      }
    }
    for (let i = 0; i < n; i++) sorted.add(i);
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
