"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Frame } from "@/lib/stacksQueues";

export function QueueCanvas({ frame }: { frame: Frame }) {
  const { elements, highlightId, action } = frame;

  return (
    <div className="paper-sheet rounded-xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
          queue
        </p>
        <p className="script-note text-base text-primary sm:text-lg">
          FIFO — first in, first out
        </p>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <span className="shrink-0 font-mono text-xs font-bold text-muted-foreground">
          front →
        </span>
        <div className="flex min-h-16 flex-1 flex-wrap items-center gap-2 overflow-x-auto">
          <AnimatePresence initial={false}>
            {elements.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-muted-foreground"
              >
                queue is empty
              </motion.p>
            ) : (
              elements.map((el) => (
                <motion.div
                  key={el.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: el.id === highlightId ? 1.08 : 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ type: "spring", stiffness: 340, damping: 28 }}
                  className={`flex size-14 shrink-0 items-center justify-center rounded-md border font-mono text-sm font-bold transition-colors duration-200 ${
                    el.id === highlightId
                      ? action === "dequeue"
                        ? "border-bar-swap bg-bar-swap/20 text-foreground"
                        : "border-bar-compare bg-bar-compare/20 text-foreground"
                      : "border-border bg-background/70 text-foreground"
                  }`}
                >
                  {el.value}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
        <span className="shrink-0 font-mono text-xs font-bold text-muted-foreground">
          → back
        </span>
      </div>
    </div>
  );
}
