import type { StructureKey } from "@/lib/stacksQueues";
import type { CodeSet } from "@/lib/code/types";

export const STACKS_QUEUES_CODE: Record<StructureKey, CodeSet> = {
  stack: {
    cpp: `
 |int a[100], top = -1;
 |
0|void push(int x) {
1|  a[++top] = x;
 |}
 |
2|int pop() {
2|  if (top < 0) throw underflow_error("stack is empty");
3|  int x = a[top--];
4|  return x;
 |}`,
    java: `
 |static int[] a = new int[100];
 |static int top = -1;
 |
0|static void push(int x) {
1|  a[++top] = x;
 |}
 |
2|static int pop() {
2|  if (top < 0) throw new RuntimeException("stack is empty");
3|  int x = a[top--];
4|  return x;
 |}`,
    python: `
 |stack = []
 |
0|def push(x):
1|    stack.append(x)        # the top moves up by one
 |
2|def pop():
2|    if not stack:
2|        raise IndexError("stack is empty")
3|    x = stack.pop()        # take from the top
4|    return x`,
  },

  queue: {
    cpp: `
 |int a[100], front = 0, back = 0;
 |
0|void enqueue(int x) {
1|  a[back++] = x;
 |}
 |
2|int dequeue() {
2|  if (front == back) throw underflow_error("queue is empty");
3|  int x = a[front++];
4|  return x;
 |}`,
    java: `
 |static int[] a = new int[100];
 |static int front = 0, back = 0;
 |
0|static void enqueue(int x) {
1|  a[back++] = x;
 |}
 |
2|static int dequeue() {
2|  if (front == back) throw new RuntimeException("queue is empty");
3|  int x = a[front++];
4|  return x;
 |}`,
    python: `
 |from collections import deque
 |
 |queue = deque()
 |
0|def enqueue(x):
1|    queue.append(x)        # join at the back
 |
2|def dequeue():
2|    if not queue:
2|        raise IndexError("queue is empty")
3|    x = queue.popleft()    # leave from the front
4|    return x`,
  },
};
