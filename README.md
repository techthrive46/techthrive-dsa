# AlgoThrive

Visual data structures and algorithms for students — learn DSA by watching it move on animated graph paper.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What's included

Every visualizer runs as an animation you control: play, pause, step forward and back, change speed, and enter your own input.

| Topic | Covers |
| --- | --- |
| **Sorting** | Bubble, Selection, Insertion, Merge, Quick, Heap, Shell, Counting, Radix, Bucket, Cocktail, Gnome. Merge and Quick Sort animate as recursion trees. |
| **Searching** | Linear, Binary, Jump, Interpolation, Exponential, Ternary, with a movable pointer, a shrinking `lo…hi` window and a target you choose. |
| **Trees** | BST insert, delete, in/pre/post-order traversals, AVL rotations. |
| **Recursion** | Factorial, GCD, Fibonacci, Tower of Hanoi, shown as a call stack and a call tree. |
| **Stacks & Queues** | Push / pop and enqueue / dequeue from a script of operations you write. |

Pathfinding (BFS, DFS, Dijkstra, A\*) is on the roadmap.

### Code tabs

Next to the pseudocode, each algorithm has **C++, Java and Python** tabs. The line executing in the animation is highlighted in whichever language is open, and the chosen language is remembered across pages. A **Copy** button copies the implementation.

Implementations live in [`lib/code/`](lib/code/). Each line is prefixed with the pseudocode line(s) it implements:

```
0|for (int i = 0; i < n - 1; i++) {
3|  swap(a[j], a[j + 1]);
 |}
```

`3|` means "highlight this line while pseudocode line 3 runs"; ` |` means never highlight. Use `4,5|` for a line that covers two pseudocode steps.

### Shareable links

Each visualizer writes its input into the URL, and **Copy link** copies it, so a student can send the exact run they are looking at:

| Page | Query |
| --- | --- |
| Sorting | `?arr=8,3,11,6` |
| Searching | `?arr=2,4,6,9&target=6` |
| Trees | `?values=50,30,70&target=40` |
| Recursion | `?args=48,18` |
| Stacks & Queues | `?ops=push+5,push+3,pop` |

Invalid or out-of-range values are ignored and the default input is used.

## Project layout

- `app/` — routes; each topic has an index page and a `[slug]` page per algorithm
- `lib/<topic>.ts` — algorithm metadata, pseudocode, and the step-by-step frame builders
- `lib/code/` — C++ / Java / Python implementations mapped to pseudocode lines
- `lib/inputs.ts` — input validation shared by the controls and the URL reader
- `hooks/` — frame players per topic, `useUrlSync`, `useCodeTab`
- `components/` — canvases, controls, and the shared pseudocode/code panel
