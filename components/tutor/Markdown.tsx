import type { ReactNode } from "react";

/**
 * Renders the small Markdown subset the tutor is told to use: paragraphs,
 * bullet / numbered lists, fenced code, `inline code` and **bold**.
 * Builds React elements directly, so model output can never inject HTML.
 */
export function Markdown({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  const lines = text.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;

    if (line.trimStart().startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.trimStart().startsWith("```")) code.push(lines[i++]!);
      i++; // closing fence (or end of a still-streaming answer)
      blocks.push(
        <pre
          key={blocks.length}
          className="overflow-x-auto rounded-md border border-border bg-background px-3 py-2 font-mono text-[13px]"
        >
          {code.join("\n")}
        </pre>,
      );
      continue;
    }

    const bullet = /^\s*(?:[-*•]|\d+[.)])\s+/;
    if (bullet.test(line)) {
      const ordered = /^\s*\d/.test(line);
      const items: string[] = [];
      while (i < lines.length && bullet.test(lines[i]!)) items.push(lines[i++]!.replace(bullet, ""));
      const List = ordered ? "ol" : "ul";
      blocks.push(
        <List
          key={blocks.length}
          className={`space-y-1 pl-5 ${ordered ? "list-decimal" : "list-disc"}`}
        >
          {items.map((item, j) => (
            <li key={j}>{inline(item)}</li>
          ))}
        </List>,
      );
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i]!.trim() !== "" &&
      !bullet.test(lines[i]!) &&
      !lines[i]!.trimStart().startsWith("```")
    ) {
      para.push(lines[i++]!.replace(/^#+\s*/, ""));
    }
    blocks.push(<p key={blocks.length}>{inline(para.join(" "))}</p>);
  }

  return <div className="space-y-2 text-sm leading-relaxed">{blocks}</div>;
}

/** Models sometimes write LaTeX like `$O(n^2)$` despite instructions; show it as `O(n²)`. */
function plainMath(text: string): string {
  return text.replace(/\$([^$\n]+)\$/g, (_, math: string) =>
    math
      .replace(/\^\{?2\}?/g, "²")
      .replace(/\^\{?3\}?/g, "³")
      .replace(/\\log/g, "log")
      .replace(/\\cdot/g, "·")
      .replace(/\\times/g, "×")
      .replace(/\\le(q)?/g, "≤")
      .replace(/\\ge(q)?/g, "≥"),
  );
}

function inline(raw: string): ReactNode[] {
  const text = plainMath(raw);
  const out: ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const token = m[0];
    out.push(
      token.startsWith("`") ? (
        <code key={m.index} className="rounded bg-primary/10 px-1 font-mono text-[0.9em]">
          {token.slice(1, -1)}
        </code>
      ) : (
        <strong key={m.index}>{token.slice(2, -2)}</strong>
      ),
    );
    last = m.index + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
