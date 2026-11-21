import type { SearchAlgoKey } from "@/lib/searching";
import type { CodeSet } from "@/lib/code/types";

export const SEARCHING_CODE: Record<SearchAlgoKey, CodeSet> = {
  linear: {
    cpp: `
0|int linearSearch(const vector<int>& a, int target) {
1|  for (int i = 0; i < (int)a.size(); i++) {
2|    if (a[i] == target)
3|      return i;
 |  }
4|  return -1;
 |}`,
    java: `
0|static int linearSearch(int[] a, int target) {
1|  for (int i = 0; i < a.length; i++) {
2|    if (a[i] == target)
3|      return i;
 |  }
4|  return -1;
 |}`,
    python: `
0|def linear_search(a, target):
1|    for i in range(len(a)):
2|        if a[i] == target:
3|            return i
4|    return -1`,
  },

  binary: {
    cpp: `
0|int binarySearch(const vector<int>& a, int target) {
1|  int lo = 0, hi = (int)a.size() - 1;
2|  while (lo <= hi) {
3|    int mid = lo + (hi - lo) / 2;  // avoids int overflow
4|    if (a[mid] == target) return mid;
5|    if (a[mid] < target) lo = mid + 1;
6|    else hi = mid - 1;
 |  }
7|  return -1;
 |}`,
    java: `
0|static int binarySearch(int[] a, int target) {
1|  int lo = 0, hi = a.length - 1;
2|  while (lo <= hi) {
3|    int mid = lo + (hi - lo) / 2;  // avoids int overflow
4|    if (a[mid] == target) return mid;
5|    if (a[mid] < target) lo = mid + 1;
6|    else hi = mid - 1;
 |  }
7|  return -1;
 |}`,
    python: `
0|def binary_search(a, target):
1|    lo, hi = 0, len(a) - 1
2|    while lo <= hi:
3|        mid = (lo + hi) // 2
4|        if a[mid] == target:
4|            return mid
5|        if a[mid] < target:
5|            lo = mid + 1
6|        else:
6|            hi = mid - 1
7|    return -1`,
  },

  jump: {
    cpp: `
0|int jumpSearch(const vector<int>& a, int target) {
0|  int n = a.size();
1|  int step = (int)sqrt(n), prev = 0;
2|  while (a[min(step, n) - 1] < target) {
3|    prev = step;
3|    step += (int)sqrt(n);
4|    if (prev >= n) return -1;
 |  }
5|  while (a[prev] < target) {
6|    prev++;
7|    if (prev == min(step, n)) return -1;
 |  }
8|  if (a[prev] == target) return prev;
9|  return -1;
 |}`,
    java: `
0|static int jumpSearch(int[] a, int target) {
0|  int n = a.length;
1|  int step = (int) Math.sqrt(n), prev = 0;
2|  while (a[Math.min(step, n) - 1] < target) {
3|    prev = step;
3|    step += (int) Math.sqrt(n);
4|    if (prev >= n) return -1;
 |  }
5|  while (a[prev] < target) {
6|    prev++;
7|    if (prev == Math.min(step, n)) return -1;
 |  }
8|  if (a[prev] == target) return prev;
9|  return -1;
 |}`,
    python: `
 |import math
 |
0|def jump_search(a, target):
0|    n = len(a)
1|    step, prev = math.isqrt(n), 0
2|    while a[min(step, n) - 1] < target:
3|        prev = step
3|        step += math.isqrt(n)
4|        if prev >= n:
4|            return -1
5|    while a[prev] < target:
6|        prev += 1
7|        if prev == min(step, n):
7|            return -1
8|    if a[prev] == target:
8|        return prev
9|    return -1`,
  },

  interpolation: {
    cpp: `
0|int interpolationSearch(const vector<int>& a, int target) {
1|  int lo = 0, hi = (int)a.size() - 1;
2|  while (lo <= hi && target >= a[lo] && target <= a[hi]) {
3|    if (a[hi] == a[lo]) return a[lo] == target ? lo : -1;
3|    int pos = lo + (long long)(target - a[lo]) * (hi - lo) / (a[hi] - a[lo]);
4|    if (a[pos] == target) return pos;
5|    if (a[pos] < target) lo = pos + 1;
6|    else hi = pos - 1;
 |  }
7|  return -1;
 |}`,
    java: `
0|static int interpolationSearch(int[] a, int target) {
1|  int lo = 0, hi = a.length - 1;
2|  while (lo <= hi && target >= a[lo] && target <= a[hi]) {
3|    if (a[hi] == a[lo]) return a[lo] == target ? lo : -1;
3|    int pos = lo + (int) ((long) (target - a[lo]) * (hi - lo) / (a[hi] - a[lo]));
4|    if (a[pos] == target) return pos;
5|    if (a[pos] < target) lo = pos + 1;
6|    else hi = pos - 1;
 |  }
7|  return -1;
 |}`,
    python: `
0|def interpolation_search(a, target):
1|    lo, hi = 0, len(a) - 1
2|    while lo <= hi and a[lo] <= target <= a[hi]:
3|        if a[hi] == a[lo]:
3|            return lo if a[lo] == target else -1
3|        pos = lo + (target - a[lo]) * (hi - lo) // (a[hi] - a[lo])
4|        if a[pos] == target:
4|            return pos
5|        if a[pos] < target:
5|            lo = pos + 1
6|        else:
6|            hi = pos - 1
7|    return -1`,
  },

  exponential: {
    cpp: `
5|int binarySearch(const vector<int>& a, int target, int lo, int hi) {
5|  while (lo <= hi) {
5|    int mid = lo + (hi - lo) / 2;
5|    if (a[mid] == target) return mid;
5|    if (a[mid] < target) lo = mid + 1; else hi = mid - 1;
5|  }
5|  return -1;
5|}
 |
0|int exponentialSearch(const vector<int>& a, int target) {
0|  int n = a.size();
1|  if (a[0] == target) return 0;
2|  int i = 1;
3|  while (i < n && a[i] <= target)
4|    i *= 2;
5|  return binarySearch(a, target, i / 2, min(i, n - 1));
 |}`,
    java: `
5|static int binarySearch(int[] a, int target, int lo, int hi) {
5|  while (lo <= hi) {
5|    int mid = lo + (hi - lo) / 2;
5|    if (a[mid] == target) return mid;
5|    if (a[mid] < target) lo = mid + 1; else hi = mid - 1;
5|  }
5|  return -1;
5|}
 |
0|static int exponentialSearch(int[] a, int target) {
0|  int n = a.length;
1|  if (a[0] == target) return 0;
2|  int i = 1;
3|  while (i < n && a[i] <= target)
4|    i *= 2;
5|  return binarySearch(a, target, i / 2, Math.min(i, n - 1));
 |}`,
    python: `
5|def binary_search(a, target, lo, hi):
5|    while lo <= hi:
5|        mid = (lo + hi) // 2
5|        if a[mid] == target:
5|            return mid
5|        if a[mid] < target:
5|            lo = mid + 1
5|        else:
5|            hi = mid - 1
5|    return -1
 |
0|def exponential_search(a, target):
0|    n = len(a)
1|    if a[0] == target:
1|        return 0
2|    i = 1
3|    while i < n and a[i] <= target:
4|        i *= 2
5|    return binary_search(a, target, i // 2, min(i, n - 1))`,
  },

  ternary: {
    cpp: `
0|int ternarySearch(const vector<int>& a, int target) {
0|  int lo = 0, hi = (int)a.size() - 1;
1|  while (lo <= hi) {
2|    int mid1 = lo + (hi - lo) / 3;
3|    int mid2 = hi - (hi - lo) / 3;
4|    if (a[mid1] == target) return mid1;
5|    if (a[mid2] == target) return mid2;
6|    if (target < a[mid1]) hi = mid1 - 1;
7|    else if (target > a[mid2]) lo = mid2 + 1;
8|    else { lo = mid1 + 1; hi = mid2 - 1; }
 |  }
9|  return -1;
 |}`,
    java: `
0|static int ternarySearch(int[] a, int target) {
0|  int lo = 0, hi = a.length - 1;
1|  while (lo <= hi) {
2|    int mid1 = lo + (hi - lo) / 3;
3|    int mid2 = hi - (hi - lo) / 3;
4|    if (a[mid1] == target) return mid1;
5|    if (a[mid2] == target) return mid2;
6|    if (target < a[mid1]) hi = mid1 - 1;
7|    else if (target > a[mid2]) lo = mid2 + 1;
8|    else { lo = mid1 + 1; hi = mid2 - 1; }
 |  }
9|  return -1;
 |}`,
    python: `
0|def ternary_search(a, target):
0|    lo, hi = 0, len(a) - 1
1|    while lo <= hi:
2|        mid1 = lo + (hi - lo) // 3
3|        mid2 = hi - (hi - lo) // 3
4|        if a[mid1] == target:
4|            return mid1
5|        if a[mid2] == target:
5|            return mid2
6|        if target < a[mid1]:
6|            hi = mid1 - 1
7|        elif target > a[mid2]:
7|            lo = mid2 + 1
8|        else:
8|            lo, hi = mid1 + 1, mid2 - 1
9|    return -1`,
  },
};
