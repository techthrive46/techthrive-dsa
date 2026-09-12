"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { QuickNodeStatus, QuickTree, QuickTreeNode } from "@/lib/sorting";

const LEAF_MIN_WIDTH = 46;
const LEVEL_HEIGHT = 76;
const NODE_HEIGHT = 44;

const STATUS_STYLES: Record<QuickNodeStatus, string> = {
  idle: "border-border bg-background/70 text-muted-foreground",
  pivoting: "border-bar-pivot bg-bar-pivot/15 text-foreground",
  partitioning: "border-bar-compare bg-bar-compare/20 text-foreground",
  placed: "border-bar-swap bg-bar-swap/15 text-foreground",
  sorted: "border-bar-sorted bg-bar-sorted/15 text-foreground",
};

export function QuickTreeCanvas({ tree }: { tree: QuickTree }) {
  const { leaves, maxDepth, nodes } = tree;
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const height = maxDepth * LEVEL_HEIGHT + NODE_HEIGHT;

  const centerX = (node: QuickTreeNode) =>
    (((node.lo + node.hi + 1) / 2) / leaves) * 100;

  return (
    <div className="paper-sheet rounded-xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
          partition tree
        </p>
        <p className="script-note text-base text-primary sm:text-lg">
          pick a pivot, split, recurse
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

function TreeNode({ node, leaves }: { node: QuickTreeNode; leaves: number }) {
  const span = node.hi - node.lo + 1;
  const pivotOffset =
    node.pivotIndex !== null ? node.pivotIndex - node.lo : -1;

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${(node.lo / leaves) * 100}%`,
        width: `${(span / leaves) * 100}%`,
        top: node.depth * LEVEL_HEIGHT,
      }}
      initial={{ opacity: 0, y: -10, scale: 0.9 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: node.status === "partitioning" || node.status === "pivoting" ? 1.03 : 1,
      }}
      exit={{ opacity: 0, y: -10, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 340, damping: 26 }}
    >
      <div
        className={`mx-1 flex items-center justify-center gap-0.5 rounded-md border px-1 transition-colors duration-300 ${STATUS_STYLES[node.status]}`}
        style={{ height: NODE_HEIGHT }}
      >
        {node.values.map((value, i) => (
          <span
            key={i}
            className={`min-w-0 flex-1 rounded-sm py-0.5 text-center font-mono text-xs font-bold tabular-nums transition-colors duration-200 sm:text-sm ${
              i === pivotOffset ? "bg-bar-pivot text-primary-foreground" : ""
            }`}
          >
            {value}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
