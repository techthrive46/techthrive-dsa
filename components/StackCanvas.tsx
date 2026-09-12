"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Frame } from "@/lib/stacksQueues";

export function StackCanvas({ frame }: { frame: Frame }) {
  const { elements, highlightId, action } = frame;

  return (
    <div className="paper-sheet rounded-xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
          stack
        </p>
        <p className="script-note text-base text-primary sm:text-lg">
          LIFO — last in, first out
        </p>
      </div>

      <p className="mt-4 text-center font-mono text-xs text-muted-foreground">
        ↓ top
      </p>
      <div className="mt-1 flex min-h-[220px] flex-col-reverse items-center gap-2">
        <AnimatePresence initial={false}>
          {elements.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted-foreground"
            >
              stack is empty
            </motion.p>
          ) : (
            elements.map((el) => (
              <motion.div
                key={el.id}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: el.id === highlightId ? 1.08 : 1,
                }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: "spring", stiffness: 340, damping: 28 }}
                className={`flex w-24 items-center justify-center rounded-md border py-2 font-mono text-sm font-bold transition-colors duration-200 ${
                  el.id === highlightId
                    ? action === "pop"
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
      <p className="mt-1 text-center font-mono text-xs text-muted-foreground">
        ↑ bottom (fixed)
      </p>
    </div>
  );
}
