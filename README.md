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

### AI tutor (optional)

On every visualizer, an **Ask AI tutor** button floats in the bottom-right corner. It opens a popup over the page (a bottom sheet on phones) where a student can pause on any step and ask about it ("Why did 9 and 4 swap?"). It runs on the student's **own free Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey). The site works fully without one.

- **A popup, not a page section:** there's no backdrop, so the playback controls stay clickable while it's open. Escape or the ✕ closes it. Closing doesn't lose anything: the chat is kept, and an answer in progress keeps streaming. A dot on the button shows that the tutor is working or has a new answer.

- **Grounded answers:** each question is sent with the step on screen: caption, the pseudocode line running, the highlighted lines in the code tab being viewed, and the step's data as JSON. Follow-up questions include the last few messages.
- **It acts, not just answers.** The tutor is an agent using Gemini function calling. It can:
  - jump to a step (`go_to_step`)
  - search the steps for moments like "swap" or "found" (`find_steps`)
  - play or pause the animation
  - load a new input (`set_input`), validated by the same rules as the input boxes
  - switch the code tab (`show_code`)
  - open another algorithm, optionally with an input (`open_algorithm`)

  Each action appears in the chat as it happens. After an action, the agent receives the new step's state and explains it. If it opens another page, the conversation carries over and the answer continues there.
- **The agent loop** runs up to 6 act → observe rounds per question. Each model turn, including its `thoughtSignature` parts, is sent back exactly as received, which newer Gemini models require. Tools and input loaders are in `lib/tutor/agent.ts`.
- **No backend:** the browser calls Google's API directly. The key is stored in `localStorage` under `algothrive:tutor` and is sent only to Google, in the `x-goog-api-key` header.
- **Model choice:** when a key is connected, the app lists the models it can use and picks the first stable Flash-Lite / Flash model that answers. Nothing is hardcoded, because Gemini model names change often.
- **Answer language:** English, Tenglish or Telugu.
- **Clear errors:** messages for an invalid key, the free-tier limit (with a retry time), a model that's no longer available, and network failures.

The code is in `lib/tutor/` (API client and prompt) and `components/tutor/` (panel, key setup, Markdown renderer).

## Project layout

- `app/` — routes; each topic has an index page and a `[slug]` page per algorithm
- `lib/<topic>.ts` — algorithm metadata, pseudocode, and the step-by-step frame builders
- `lib/code/` — C++ / Java / Python implementations mapped to pseudocode lines
- `lib/inputs.ts` — input validation shared by the controls and the URL reader
- `hooks/` — frame players per topic, `useUrlSync`, `useCodeTab`
- `components/` — canvases, controls, and the shared pseudocode/code panel
