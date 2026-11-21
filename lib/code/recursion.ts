import type { RecursionAlgoKey } from "@/lib/recursion";
import type { CodeSet } from "@/lib/code/types";

export const RECURSION_CODE: Record<RecursionAlgoKey, CodeSet> = {
  factorial: {
    cpp: `
0|long long factorial(int n) {
1|  if (n <= 1) return 1;           // base case
2|  return n * factorial(n - 1);    // recursive case
 |}`,
    java: `
0|static long factorial(int n) {
1|  if (n <= 1) return 1;           // base case
2|  return n * factorial(n - 1);    // recursive case
 |}`,
    python: `
0|def factorial(n):
1|    if n <= 1:                     # base case
1|        return 1
2|    return n * factorial(n - 1)    # recursive case`,
  },

  gcd: {
    cpp: `
0|int gcd(int a, int b) {
1|  if (b == 0) return a;
2|  return gcd(b, a % b);
 |}`,
    java: `
0|static int gcd(int a, int b) {
1|  if (b == 0) return a;
2|  return gcd(b, a % b);
 |}`,
    python: `
0|def gcd(a, b):
1|    if b == 0:
1|        return a
2|    return gcd(b, a % b)`,
  },

  fibonacci: {
    cpp: `
0|int fib(int n) {
1|  if (n <= 1) return n;
2|  return fib(n - 1) + fib(n - 2);
 |}`,
    java: `
0|static int fib(int n) {
1|  if (n <= 1) return n;
2|  return fib(n - 1) + fib(n - 2);
 |}`,
    python: `
0|def fib(n):
1|    if n <= 1:
1|        return n
2|    return fib(n - 1) + fib(n - 2)`,
  },

  hanoi: {
    cpp: `
0|void hanoi(int n, char from, char to, char via) {
1|  if (n == 0) return;
2|  hanoi(n - 1, from, via, to);
3|  cout << "Move disk " << n << ": " << from << " -> " << to << endl;
4|  hanoi(n - 1, via, to, from);
 |}`,
    java: `
0|static void hanoi(int n, char from, char to, char via) {
1|  if (n == 0) return;
2|  hanoi(n - 1, from, via, to);
3|  System.out.println("Move disk " + n + ": " + from + " -> " + to);
4|  hanoi(n - 1, via, to, from);
 |}`,
    python: `
 |# "from" is a Python keyword, so the pegs are src / dst / via
0|def hanoi(n, src, dst, via):
1|    if n == 0:
1|        return
2|    hanoi(n - 1, src, via, dst)
3|    print(f"Move disk {n}: {src} -> {dst}")
4|    hanoi(n - 1, via, dst, src)`,
  },
};
