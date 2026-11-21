"use client";

import { useEffect, useState } from "react";
import { Check, Link2 } from "lucide-react";

/** Copies the current URL, which carries the visualizer's input (see useUrlSync). */
export function ShareLinkButton() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      // Clipboard unavailable; the address bar still has the link.
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Copy a link to this exact run"
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
    >
      {copied ? <Check className="size-3.5" /> : <Link2 className="size-3.5" />}
      {copied ? "Link copied" : "Copy link"}
    </button>
  );
}
