export type Language = "cpp" | "java" | "python";

export const LANGUAGES: { key: Language; label: string }[] = [
  { key: "cpp", label: "C++" },
  { key: "java", label: "Java" },
  { key: "python", label: "Python" },
];

/**
 * Source for each language. Every line starts with the pseudocode line(s) it
 * implements, then a `|`, then the code:
 *
 *   0|for (int i = 0; i < n; i++) {
 *   2,3|  if (a[i] == target) return i;
 *    |}
 *
 * The visualizer highlights every code line whose tags include the pseudocode
 * line currently executing. Lines with no tag never highlight.
 */
export type CodeSet = Record<Language, string>;

export type CodeLine = { text: string; lines: number[] };

const cache = new Map<string, CodeLine[]>();

export function parseCode(source: string): CodeLine[] {
  const hit = cache.get(source);
  if (hit) return hit;

  const raw = source.split("\n");
  if (raw[0]?.trim() === "") raw.shift();
  if (raw.at(-1)?.trim() === "") raw.pop();

  const parsed = raw.map((row) => {
    const bar = row.indexOf("|");
    if (bar === -1) return { text: row, lines: [] };
    const tag = row.slice(0, bar).trim();
    return {
      text: row.slice(bar + 1),
      lines: tag ? tag.split(",").map((t) => Number(t.trim())) : [],
    };
  });
  cache.set(source, parsed);
  return parsed;
}
