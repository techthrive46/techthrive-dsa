"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { LANGUAGES, parseCode, type CodeSet } from "@/lib/code/types";
import { useCodeTab, type CodeTab } from "@/hooks/useCodeTab";

type PseudocodePanelProps = {
  pseudocode: string[];
  /** Index of the pseudocode line executing right now. */
  line: number;
  /** Real implementations; each line is tagged with the pseudocode line it implements. */
  code?: CodeSet;
};

const TAB_LABELS: { key: CodeTab; label: string }[] = [
  { key: "pseudo", label: "Pseudo" },
  ...LANGUAGES,
];

export function PseudocodePanel({ pseudocode, line, code }: PseudocodePanelProps) {
  const [storedTab, setTab] = useCodeTab();
  const tab: CodeTab = code ? storedTab : "pseudo";
  const [copied, setCopied] = useState(false);
  const activeRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLPreElement | null>(null);

  const rows =
    tab === "pseudo" || !code
      ? pseudocode.map((text, i) => ({ text, active: i === line }))
      : parseCode(code[tab]).map((row) => ({ text: row.text, active: row.lines.includes(line) }));

  // Long implementations can scroll; keep the executing line in view
  // without moving the page itself.
  useEffect(() => {
    const box = scrollRef.current;
    const el = activeRef.current;
    if (!box || !el) return;
    const top = el.offsetTop; // the <pre> is `relative`, so this is measured from its top
    if (top < box.scrollTop || top + el.offsetHeight > box.scrollTop + box.clientHeight) {
      box.scrollTo({ top: Math.max(0, top - box.clientHeight / 3), behavior: "smooth" });
    }
  }, [line, tab]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rows.map((r) => r.text).join("\n"));
      setCopied(true);
    } catch {
      // Clipboard unavailable (insecure context); nothing to do.
    }
  };

  const firstActive = rows.findIndex((r) => r.active);

  return (
    <div className="paper-sheet flex min-w-0 flex-col rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {code ? (
          <div role="tablist" aria-label="Code language" className="flex flex-wrap gap-1">
            {TAB_LABELS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`rounded-md border px-2.5 py-1 font-mono text-xs font-bold transition-colors ${
                  tab === key
                    ? "border-foreground/80 bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
            pseudocode
          </p>
        )}
        {tab !== "pseudo" && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
      <pre
        ref={scrollRef}
        className="relative mt-3 max-h-[28rem] overflow-auto font-mono text-[13px] leading-relaxed"
      >
        {rows.map((row, i) => {
          return (
            <div
              key={`${tab}-${i}`}
              ref={i === firstActive ? activeRef : undefined}
              className={`min-h-[1.5em] rounded px-2 py-0.5 whitespace-pre ${
                row.active ? "bg-primary/15 font-bold text-foreground" : "text-muted-foreground"
              }`}
            >
              {row.text}
            </div>
          );
        })}
      </pre>
      {tab !== "pseudo" && (
        <p className="mt-3 text-xs text-muted-foreground">
          Highlighted lines run the step shown in the picture.
        </p>
      )}
    </div>
  );
}
