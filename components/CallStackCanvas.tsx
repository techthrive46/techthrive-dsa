"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { CallFrame } from "@/lib/recursion";

export function CallStackCanvas({ stack }: { stack: CallFrame[] }) {
  return (
    <div className="paper-sheet rounded-xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
          call stack
        </p>
        <p className="script-note text-base text-primary sm:text-lg">
          last in, first out
        </p>
      </div>

      <div className="mt-4 flex min-h-[220px] flex-col-reverse gap-2">
        <AnimatePresence initial={false}>
          {stack.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted-foreground"
            >
              stack is empty — nothing left to unwind
            </motion.p>
          ) : (
            stack.map((frame) => (
              <motion.div
                key={frame.id}
                layout
                initial={{ opacity: 0, y: -14, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 340, damping: 28 }}
                style={{ marginLeft: frame.depth * 16 }}
                className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 font-mono text-sm font-bold transition-colors duration-200 ${
                  frame.status === "returned"
                    ? "border-bar-sorted bg-bar-sorted/15 text-foreground"
                    : "border-bar-compare bg-bar-compare/20 text-foreground"
                }`}
              >
                <span>{frame.label}</span>
                {frame.returnValue !== null ? (
                  <span className="text-bar-sorted">→ {frame.returnValue}</span>
                ) : null}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
