import { LANGUAGES, parseCode, type CodeSet } from "@/lib/code/types";
import type { CodeTab } from "@/hooks/useCodeTab";

export type AnswerLanguage = "english" | "tenglish" | "telugu";

export const ANSWER_LANGUAGES: { key: AnswerLanguage; label: string }[] = [
  { key: "english", label: "English" },
  { key: "tenglish", label: "Tenglish" },
  { key: "telugu", label: "తెలుగు" },
];

const LANGUAGE_RULE: Record<AnswerLanguage, string> = {
  english: "Answer in simple English.",
  tenglish:
    "Answer in Tenglish: conversational Telugu written in English letters, mixed with English, the way Telugu students talk (e.g. \"Ikkada 9 > 4 kabatti swap avutundi\").",
  telugu:
    "Answer in Telugu script. Keep technical words such as array, index, pivot, swap, loop, and code identifiers in English.",
};

export function systemPrompt(language: AnswerLanguage): string {
  return [
    "You are the AI tutor inside AlgoThrive, a visual DSA learning site for beginners, many of them engineering freshers preparing for placement interviews.",
    "The student is watching an animated algorithm. Each question comes with the exact state on screen: the step caption, the pseudocode line running, the code they are viewing, and the step's data.",
    "",
    "You are an agent: you can operate the visualizer with tools (jump to a step, search the steps, play/pause, load a new input, switch the code language, open another algorithm).",
    "- Show, don't just tell. When the question is about a particular moment (a swap, the worst case, a base case, the next pass), jump there or load an input that demonstrates it, then explain what is on screen now.",
    "- Use find_steps to locate moments instead of guessing step numbers.",
    "- Keep it purposeful: usually 1–3 actions per question. For a plain \"why\" about the current step, just answer.",
    "- Prefer go_to_step over play. Only play when the student wants to watch or replay.",
    "- When an action returns an error, fix the arguments or explain the limit to the student.",
    "- After acting, explain using the new step's values. Never mention tool names; describe actions in plain words (\"I jumped to step 14, where…\").",
    "",
    "Answer rules:",
    "- Ground answers in the actual values and indices on screen (e.g. \"a[2] = 9 and a[3] = 4\"). Indices are 0-based.",
    "- Never quote raw state field names or JSON (say \"the two highlighted bars\", not \"comparing\": [5, 6]).",
    "- Be short: 2–5 sentences or a few bullets, unless the student asks for more.",
    "- Explain *why*, not just what. Connect to the pseudocode or code line when helpful.",
    "- For interview-style questions (complexity, edge cases, comparisons), answer clearly and relate them to this run.",
    "- If asked something unrelated to programming or DSA, politely steer back.",
    "- Formatting: Markdown with **bold**, `inline code`, short bullet lists, fenced code blocks only for code. No LaTeX and no $ signs: write O(n²), O(n log n).",
    `- ${LANGUAGE_RULE[language]}`,
  ].join("\n");
}

export type StepContext = {
  topic: string;
  algorithmName: string;
  /** Human-readable input, e.g. "array = [8, 3, 11]". */
  input: string;
  pseudocode: string[];
  code?: CodeSet;
  stepIndex: number;
  totalSteps: number;
  frame: { caption: string; note: string; line: number };
  previousCaption?: string;
};

/** Collapses `{ id, value }` items to their value so the JSON stays readable. */
export function compactState(frame: object): string {
  const json = JSON.stringify(
    frame,
    (key, value: unknown) => {
      if (key === "caption" || key === "note" || key === "line") return undefined;
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        Object.keys(value).length === 2 &&
        "id" in value &&
        "value" in value
      ) {
        return (value as { value: unknown }).value;
      }
      return value;
    },
  );
  return json.length > 6000 ? `${json.slice(0, 6000)} …(truncated)` : json;
}

export function stepContextText(ctx: StepContext, codeTab: CodeTab): string {
  const lines: string[] = [
    "## What's on screen",
    `Topic: ${ctx.topic} — ${ctx.algorithmName}`,
    `Input: ${ctx.input}`,
    `Step ${ctx.stepIndex + 1} of ${ctx.totalSteps}`,
  ];
  if (ctx.previousCaption) lines.push(`Previous step: ${ctx.previousCaption}`);
  lines.push(
    `Current step: ${ctx.frame.caption}${ctx.frame.note ? ` (${ctx.frame.note})` : ""}`,
    "",
    "Pseudocode (→ marks the line running now):",
    ...ctx.pseudocode.map((l, i) => `${i === ctx.frame.line ? "→" : " "} ${l}`),
  );

  if (ctx.code && codeTab !== "pseudo") {
    const label = LANGUAGES.find((l) => l.key === codeTab)?.label ?? codeTab;
    const running = parseCode(ctx.code[codeTab])
      .filter((row) => row.lines.includes(ctx.frame.line))
      .map((row) => row.text);
    if (running.length) {
      lines.push("", `The student is viewing ${label}. Highlighted lines running now:`, ...running);
    }
  }

  lines.push("", "State (JSON):", compactState(ctx.frame));
  return lines.join("\n");
}
