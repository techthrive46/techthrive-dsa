"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { MergeNodeStatus, MergeTree, MergeTreeNode } from "@/lib/sorting";

const LEAF_MIN_WIDTH = 46;
const LEVEL_HEIGHT = 76;
const NODE_HEIGHT = 44;

const STATUS_STYLES: Record<Exclude<MergeNodeStatus, "hidden">, string> = {
  idle: "border-border bg-background/70 text-muted-foreground",
  splitting: "border-bar-compare bg-bar-compare/25 text-foreground",
  merging: "border-bar-swap bg-bar-swap/15 text-foreground",
  merged: "border-bar-sorted bg-bar-sorted/15 text-foreground",
};

export function MergeTreeCanvas({ tree }: { tree: MergeTree }) {
  const { leaves, maxDepth } = tree;
  const nodes = tree.nodes.filter((node) => node.status !== "hidden");
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const height = maxDepth * LEVEL_HEIGHT + NODE_HEIGHT;

  // x is a percentage so the tree always spans the panel; y stays in pixels.
  const centerX = (node: MergeTreeNode) =>
    (((node.lo + node.hi + 1) / 2) / leaves) * 100;

  return (
    <div className="paper-sheet rounded-xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
          recursion tree
        </p>
        <p className="script-note text-base text-primary sm:text-lg">
          split downwards, merge back up
        </p>
      </div>

      <div className="mt-4 overflow-x-auto pb-1">
        <div
          className="relative"
          style={{ height, minWidth: leaves * LEAF_MIN_WIDTH }}
        >
          <svg
            className="absolute inset-0 h-full w-full text-foreground/30"
            viewBox={`0 0 100 ${height}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            <AnimatePresence>
              {nodes.map((node) => {
                const parent = node.parentId ? byId.get(node.parentId) : null;
                if (!parent) return null;
                return (
                  <motion.line
                    key={node.id}
                    x1={centerX(parent)}
                    y1={parent.depth * LEVEL_HEIGHT + NODE_HEIGHT}
                    x2={centerX(node)}
                    y2={node.depth * LEVEL_HEIGHT}
                    stroke="currentColor"
                    strokeWidth={1.5}
                    vectorEffect="non-scaling-stroke"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                );
              })}
            </AnimatePresence>
          </svg>

          <AnimatePresence>
            {nodes.map((node) => (
              <TreeNode key={node.id} node={node} leaves={leaves} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function TreeNode({ node, leaves }: { node: MergeTreeNode; leaves: number }) {
  const span = node.hi - node.lo + 1;
  const status = node.status as Exclude<MergeNodeStatus, "hidden">;
  const lastFilled =
    status === "merging"
      ? node.slots.reduce((acc, slot, i) => (slot !== null ? i : acc), -1)
      : -1;

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${(node.lo / leaves) * 100}%`,
        width: `${(span / leaves) * 100}%`,
        top: node.depth * LEVEL_HEIGHT,
      }}
      initial={{ opacity: 0, y: -10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: status === "merging" ? 1.03 : 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 340, damping: 26 }}
    >
      <div
        className={`mx-1 flex items-center justify-center gap-0.5 rounded-md border px-1 transition-colors duration-300 ${STATUS_STYLES[status]}`}
        style={{ height: NODE_HEIGHT }}
      >
        {node.slots.map((slot, i) => (
          <span
            key={i}
            className={`flex min-w-0 flex-1 items-center justify-center rounded-sm py-0.5 font-mono text-xs font-bold tabular-nums transition-colors duration-200 sm:text-sm ${
              slot === null ? "text-muted-foreground/40" : ""
            } ${i === lastFilled ? "bg-bar-swap text-primary-foreground" : ""}`}
          >
            {slot ? (
              <motion.span
                layoutId={`merge-item-${slot.id}`}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
              >
                {slot.value}
              </motion.span>
            ) : (
              "·"
            )}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
