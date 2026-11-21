import type { AlgoKey } from "@/lib/sorting";
import type { CodeSet } from "@/lib/code/types";

const JAVA_SWAP = `
 |
 |static void swap(int[] a, int i, int j) {
 |  int t = a[i]; a[i] = a[j]; a[j] = t;
 |}`;

export const SORTING_CODE: Record<AlgoKey, CodeSet> = {
  bubble: {
    cpp: `
 |void bubbleSort(vector<int>& a) {
 |  int n = a.size();
0|  for (int i = 0; i < n - 1; i++) {
1|    for (int j = 0; j < n - i - 1; j++) {
2|      if (a[j] > a[j + 1]) {
3|        swap(a[j], a[j + 1]);
 |      }
 |    }
4|    // a[n - i - 1] is now in its final place
 |  }
 |}`,
    java: `
 |static void bubbleSort(int[] a) {
 |  int n = a.length;
0|  for (int i = 0; i < n - 1; i++) {
1|    for (int j = 0; j < n - i - 1; j++) {
2|      if (a[j] > a[j + 1]) {
3|        swap(a, j, j + 1);
 |      }
 |    }
4|    // a[n - i - 1] is now in its final place
 |  }
 |}${JAVA_SWAP}`,
    python: `
 |def bubble_sort(a):
 |    n = len(a)
0|    for i in range(n - 1):
1|        for j in range(n - i - 1):
2|            if a[j] > a[j + 1]:
3|                a[j], a[j + 1] = a[j + 1], a[j]
4|        # a[n - i - 1] is now in its final place`,
  },

  selection: {
    cpp: `
 |void selectionSort(vector<int>& a) {
 |  int n = a.size();
0|  for (int i = 0; i < n - 1; i++) {
1|    int minIdx = i;
2|    for (int j = i + 1; j < n; j++) {
3|      if (a[j] < a[minIdx]) minIdx = j;
 |    }
4|    swap(a[i], a[minIdx]);
 |  }
 |}`,
    java: `
 |static void selectionSort(int[] a) {
 |  int n = a.length;
0|  for (int i = 0; i < n - 1; i++) {
1|    int minIdx = i;
2|    for (int j = i + 1; j < n; j++) {
3|      if (a[j] < a[minIdx]) minIdx = j;
 |    }
4|    swap(a, i, minIdx);
 |  }
 |}${JAVA_SWAP}`,
    python: `
 |def selection_sort(a):
 |    n = len(a)
0|    for i in range(n - 1):
1|        min_idx = i
2|        for j in range(i + 1, n):
3|            if a[j] < a[min_idx]:
3|                min_idx = j
4|        a[i], a[min_idx] = a[min_idx], a[i]`,
  },

  insertion: {
    cpp: `
 |void insertionSort(vector<int>& a) {
0|  for (int i = 1; i < (int)a.size(); i++) {
1|    int key = a[i];
2|    int j = i - 1;
3|    while (j >= 0 && a[j] > key) {
4|      a[j + 1] = a[j];
4|      j--;
 |    }
5|    a[j + 1] = key;
 |  }
 |}`,
    java: `
 |static void insertionSort(int[] a) {
0|  for (int i = 1; i < a.length; i++) {
1|    int key = a[i];
2|    int j = i - 1;
3|    while (j >= 0 && a[j] > key) {
4|      a[j + 1] = a[j];
4|      j--;
 |    }
5|    a[j + 1] = key;
 |  }
 |}`,
    python: `
 |def insertion_sort(a):
0|    for i in range(1, len(a)):
1|        key = a[i]
2|        j = i - 1
3|        while j >= 0 and a[j] > key:
4|            a[j + 1] = a[j]
4|            j -= 1
5|        a[j + 1] = key`,
  },

  merge: {
    cpp: `
0|void mergeSort(vector<int>& a, int lo, int hi) {
1|  if (lo >= hi) return;
2|  int mid = lo + (hi - lo) / 2;
3|  mergeSort(a, lo, mid);
3|  mergeSort(a, mid + 1, hi);
 |
4|  vector<int> tmp;
4|  int i = lo, j = mid + 1;
4|  while (i <= mid && j <= hi)
4|    tmp.push_back(a[i] <= a[j] ? a[i++] : a[j++]);
4|  while (i <= mid) tmp.push_back(a[i++]);
4|  while (j <= hi) tmp.push_back(a[j++]);
 |
5|  for (int k = 0; k < (int)tmp.size(); k++) a[lo + k] = tmp[k];
 |}`,
    java: `
0|static void mergeSort(int[] a, int lo, int hi) {
1|  if (lo >= hi) return;
2|  int mid = lo + (hi - lo) / 2;
3|  mergeSort(a, lo, mid);
3|  mergeSort(a, mid + 1, hi);
 |
4|  int[] tmp = new int[hi - lo + 1];
4|  int i = lo, j = mid + 1, k = 0;
4|  while (i <= mid && j <= hi)
4|    tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];
4|  while (i <= mid) tmp[k++] = a[i++];
4|  while (j <= hi) tmp[k++] = a[j++];
 |
5|  System.arraycopy(tmp, 0, a, lo, tmp.length);
 |}`,
    python: `
0|def merge_sort(a, lo, hi):
1|    if lo >= hi:
1|        return
2|    mid = (lo + hi) // 2
3|    merge_sort(a, lo, mid)
3|    merge_sort(a, mid + 1, hi)
 |
4|    tmp, i, j = [], lo, mid + 1
4|    while i <= mid and j <= hi:
4|        if a[i] <= a[j]:
4|            tmp.append(a[i])
4|            i += 1
4|        else:
4|            tmp.append(a[j])
4|            j += 1
4|    tmp += a[i:mid + 1] + a[j:hi + 1]
 |
5|    a[lo:hi + 1] = tmp`,
  },

  quick: {
    cpp: `
0|void quickSort(vector<int>& a, int lo, int hi) {
1|  if (lo >= hi) return;
2|  int pivot = a[hi];
3|  int i = lo;
3|  for (int j = lo; j < hi; j++) {
3|    if (a[j] < pivot) swap(a[i++], a[j]);
 |  }
4|  swap(a[i], a[hi]);
4|  int p = i;
5|  quickSort(a, lo, p - 1);
5|  quickSort(a, p + 1, hi);
 |}`,
    java: `
0|static void quickSort(int[] a, int lo, int hi) {
1|  if (lo >= hi) return;
2|  int pivot = a[hi];
3|  int i = lo;
3|  for (int j = lo; j < hi; j++) {
3|    if (a[j] < pivot) swap(a, i++, j);
 |  }
4|  swap(a, i, hi);
4|  int p = i;
5|  quickSort(a, lo, p - 1);
5|  quickSort(a, p + 1, hi);
 |}${JAVA_SWAP}`,
    python: `
0|def quick_sort(a, lo, hi):
1|    if lo >= hi:
1|        return
2|    pivot = a[hi]
3|    i = lo
3|    for j in range(lo, hi):
3|        if a[j] < pivot:
3|            a[i], a[j] = a[j], a[i]
3|            i += 1
4|    a[i], a[hi] = a[hi], a[i]
4|    p = i
5|    quick_sort(a, lo, p - 1)
5|    quick_sort(a, p + 1, hi)`,
  },

  heap: {
    cpp: `
0|void heapify(vector<int>& a, int i, int size) {
1|  int left = 2 * i + 1, right = 2 * i + 2;
2|  int largest = i;
2|  if (left < size && a[left] > a[largest]) largest = left;
2|  if (right < size && a[right] > a[largest]) largest = right;
3|  if (largest != i) {
4|    swap(a[i], a[largest]);
5|    heapify(a, largest, size);
 |  }
 |}
 |
6|void heapSort(vector<int>& a) {
6|  int n = a.size();
7|  for (int i = n / 2 - 1; i >= 0; i--) heapify(a, i, n);
8|  for (int i = n - 1; i > 0; i--) {
9|    swap(a[0], a[i]);
9|    heapify(a, 0, i);
 |  }
 |}`,
    java: `
0|static void heapify(int[] a, int i, int size) {
1|  int left = 2 * i + 1, right = 2 * i + 2;
2|  int largest = i;
2|  if (left < size && a[left] > a[largest]) largest = left;
2|  if (right < size && a[right] > a[largest]) largest = right;
3|  if (largest != i) {
4|    swap(a, i, largest);
5|    heapify(a, largest, size);
 |  }
 |}
 |
6|static void heapSort(int[] a) {
6|  int n = a.length;
7|  for (int i = n / 2 - 1; i >= 0; i--) heapify(a, i, n);
8|  for (int i = n - 1; i > 0; i--) {
9|    swap(a, 0, i);
9|    heapify(a, 0, i);
 |  }
 |}${JAVA_SWAP}`,
    python: `
0|def heapify(a, i, size):
1|    left, right = 2 * i + 1, 2 * i + 2
2|    largest = i
2|    if left < size and a[left] > a[largest]:
2|        largest = left
2|    if right < size and a[right] > a[largest]:
2|        largest = right
3|    if largest != i:
4|        a[i], a[largest] = a[largest], a[i]
5|        heapify(a, largest, size)
 |
6|def heap_sort(a):
6|    n = len(a)
7|    for i in range(n // 2 - 1, -1, -1):
7|        heapify(a, i, n)
8|    for i in range(n - 1, 0, -1):
9|        a[0], a[i] = a[i], a[0]
9|        heapify(a, 0, i)`,
  },

  shell: {
    cpp: `
0|void shellSort(vector<int>& a) {
0|  int n = a.size();
1|  for (int gap = n / 2; gap > 0; gap /= 2) {
2|    for (int i = gap; i < n; i++) {
3|      int j = i;
4|      while (j >= gap && a[j - gap] > a[j]) {
5|        swap(a[j - gap], a[j]);
6|        j -= gap;
 |      }
 |    }
 |  }
 |}`,
    java: `
0|static void shellSort(int[] a) {
0|  int n = a.length;
1|  for (int gap = n / 2; gap > 0; gap /= 2) {
2|    for (int i = gap; i < n; i++) {
3|      int j = i;
4|      while (j >= gap && a[j - gap] > a[j]) {
5|        swap(a, j - gap, j);
6|        j -= gap;
 |      }
 |    }
 |  }
 |}${JAVA_SWAP}`,
    python: `
0|def shell_sort(a):
0|    n = len(a)
1|    gap = n // 2
1|    while gap > 0:
2|        for i in range(gap, n):
3|            j = i
4|            while j >= gap and a[j - gap] > a[j]:
5|                a[j - gap], a[j] = a[j], a[j - gap]
6|                j -= gap
1|        gap //= 2`,
  },

  counting: {
    cpp: `
 |void countingSort(vector<int>& a) {
0|  int k = *max_element(a.begin(), a.end());
1|  vector<int> count(k + 1, 0);
2|  for (int x : a) count[x]++;
3|  int idx = 0;
3|  for (int v = 0; v <= k; v++)
3|    while (count[v]-- > 0) a[idx++] = v;
 |}`,
    java: `
 |static void countingSort(int[] a) {
0|  int k = Arrays.stream(a).max().getAsInt();
1|  int[] count = new int[k + 1];
2|  for (int x : a) count[x]++;
3|  int idx = 0;
3|  for (int v = 0; v <= k; v++)
3|    while (count[v]-- > 0) a[idx++] = v;
 |}`,
    python: `
 |def counting_sort(a):
0|    k = max(a)
1|    count = [0] * (k + 1)
2|    for x in a:
2|        count[x] += 1
3|    idx = 0
3|    for v in range(k + 1):
3|        for _ in range(count[v]):
3|            a[idx] = v
3|            idx += 1`,
  },

  radix: {
    cpp: `
2|void countSortByDigit(vector<int>& a, int exp) {
2|  vector<int> out(a.size()), count(10, 0);
2|  for (int x : a) count[(x / exp) % 10]++;
2|  for (int d = 1; d < 10; d++) count[d] += count[d - 1];
2|  for (int i = (int)a.size() - 1; i >= 0; i--)
2|    out[--count[(a[i] / exp) % 10]] = a[i];
2|  a = out;
2|}
 |
 |void radixSort(vector<int>& a) {
0|  int m = *max_element(a.begin(), a.end());
1|  for (int exp = 1; m / exp > 0; exp *= 10)
2|    countSortByDigit(a, exp);
 |}`,
    java: `
 |static void radixSort(int[] a) {
0|  int m = Arrays.stream(a).max().getAsInt();
1|  for (int exp = 1; m / exp > 0; exp *= 10)
2|    countSortByDigit(a, exp);
 |}
 |
2|static void countSortByDigit(int[] a, int exp) {
2|  int[] out = new int[a.length], count = new int[10];
2|  for (int x : a) count[(x / exp) % 10]++;
2|  for (int d = 1; d < 10; d++) count[d] += count[d - 1];
2|  for (int i = a.length - 1; i >= 0; i--)
2|    out[--count[(a[i] / exp) % 10]] = a[i];
2|  System.arraycopy(out, 0, a, 0, a.length);
2|}`,
    python: `
 |def radix_sort(a):
0|    m = max(a)
1|    exp = 1
1|    while m // exp > 0:
2|        count_sort_by_digit(a, exp)
1|        exp *= 10
 |
2|def count_sort_by_digit(a, exp):
2|    buckets = [[] for _ in range(10)]
2|    for x in a:
2|        buckets[(x // exp) % 10].append(x)
2|    a[:] = [x for b in buckets for x in b]`,
  },

  bucket: {
    cpp: `
 |void bucketSort(vector<int>& a, int bucketCount = 5) {
0|  int mx = *max_element(a.begin(), a.end());
0|  int interval = mx / bucketCount + 1;
0|  vector<vector<int>> buckets(bucketCount);
1|  for (int x : a) buckets[x / interval].push_back(x);
2|  for (auto& b : buckets) sort(b.begin(), b.end());
3|  int idx = 0;
3|  for (auto& b : buckets)
3|    for (int x : b) a[idx++] = x;
 |}`,
    java: `
 |static void bucketSort(int[] a, int bucketCount) {
0|  int mx = Arrays.stream(a).max().getAsInt();
0|  int interval = mx / bucketCount + 1;
0|  List<List<Integer>> buckets = new ArrayList<>();
0|  for (int b = 0; b < bucketCount; b++) buckets.add(new ArrayList<>());
1|  for (int x : a) buckets.get(x / interval).add(x);
2|  for (List<Integer> b : buckets) Collections.sort(b);
3|  int idx = 0;
3|  for (List<Integer> b : buckets)
3|    for (int x : b) a[idx++] = x;
 |}`,
    python: `
 |def bucket_sort(a, bucket_count=5):
0|    interval = max(a) // bucket_count + 1
0|    buckets = [[] for _ in range(bucket_count)]
1|    for x in a:
1|        buckets[x // interval].append(x)
2|    for b in buckets:
2|        b.sort()
3|    a[:] = [x for b in buckets for x in b]`,
  },

  cocktail: {
    cpp: `
0|void cocktailSort(vector<int>& a) {
1|  int start = 0, end = (int)a.size() - 1;
1|  bool swapped = true;
2|  while (swapped) {
3|    swapped = false;
4|    for (int i = start; i < end; i++)
4|      if (a[i] > a[i + 1]) { swap(a[i], a[i + 1]); swapped = true; }
5|    end--;
6|    if (!swapped) break;
6|    swapped = false;
7|    for (int i = end - 1; i >= start; i--)
7|      if (a[i] > a[i + 1]) { swap(a[i], a[i + 1]); swapped = true; }
8|    start++;
 |  }
 |}`,
    java: `
0|static void cocktailSort(int[] a) {
1|  int start = 0, end = a.length - 1;
1|  boolean swapped = true;
2|  while (swapped) {
3|    swapped = false;
4|    for (int i = start; i < end; i++)
4|      if (a[i] > a[i + 1]) { swap(a, i, i + 1); swapped = true; }
5|    end--;
6|    if (!swapped) break;
6|    swapped = false;
7|    for (int i = end - 1; i >= start; i--)
7|      if (a[i] > a[i + 1]) { swap(a, i, i + 1); swapped = true; }
8|    start++;
 |  }
 |}${JAVA_SWAP}`,
    python: `
0|def cocktail_sort(a):
1|    start, end = 0, len(a) - 1
1|    swapped = True
2|    while swapped:
3|        swapped = False
4|        for i in range(start, end):
4|            if a[i] > a[i + 1]:
4|                a[i], a[i + 1] = a[i + 1], a[i]
4|                swapped = True
5|        end -= 1
6|        if not swapped:
6|            break
6|        swapped = False
7|        for i in range(end - 1, start - 1, -1):
7|            if a[i] > a[i + 1]:
7|                a[i], a[i + 1] = a[i + 1], a[i]
7|                swapped = True
8|        start += 1`,
  },

  gnome: {
    cpp: `
 |void gnomeSort(vector<int>& a) {
0|  int pos = 0, n = a.size();
1|  while (pos < n) {
2|    if (pos == 0 || a[pos] >= a[pos - 1]) {
3|      pos++;
4|    } else {
5|      swap(a[pos], a[pos - 1]);
5|      pos--;
 |    }
 |  }
 |}`,
    java: `
 |static void gnomeSort(int[] a) {
0|  int pos = 0, n = a.length;
1|  while (pos < n) {
2|    if (pos == 0 || a[pos] >= a[pos - 1]) {
3|      pos++;
4|    } else {
5|      swap(a, pos, pos - 1);
5|      pos--;
 |    }
 |  }
 |}${JAVA_SWAP}`,
    python: `
 |def gnome_sort(a):
0|    pos, n = 0, len(a)
1|    while pos < n:
2|        if pos == 0 or a[pos] >= a[pos - 1]:
3|            pos += 1
4|        else:
5|            a[pos], a[pos - 1] = a[pos - 1], a[pos]
5|            pos -= 1`,
  },
};
