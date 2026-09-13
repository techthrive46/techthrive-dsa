"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { BSTNode, BSTNodeStatus, BSTSnapshot } from "@/lib/trees";

const LEVEL_HEIGHT = 76;
const NODE_SLOT_WIDTH = 64;
const NODE_SIZE = 44;

const STATUS_STYLES: Record<BSTNodeStatus, string> = {
  idle: "border-border bg-background/70 text-foreground",
  comparing: "border-bar-compare bg-bar-compare/25 text-foreground",
  inserted: "border-bar-sorted bg-bar-sorted/20 text-foreground",
  found: "border-bar-pivot bg-bar-pivot/20 text-foreground",
  deleted: "border-bar-swap bg-bar-swap/25 text-foreground",
  visiting: "border-bar-compare bg-bar-compare/15 text-foreground",
  visited: "border-bar-sorted bg-bar-sorted/20 text-foreground",
  unbalanced: "border-bar-swap bg-bar-swap/25 text-foreground",
  rotating: "border-bar-pivot bg-bar-pivot/25 text-foreground",
};

/** Lays out nodes via an in-order walk: it naturally puts every left descendant to the left of its parent. */
function layoutTree(nodes: BSTNode[], rootId: string | null) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const xOf = new Map<string, number>();
  const depthOf = new Map<string, number>();
  let counter = 0;
  let maxDepth = 0;

  const walk = (id: string | null, depth: number) => {
    if (!id) return;
    const node = byId.get(id);
    if (!node) return;
    walk(node.left, depth + 1);
    xOf.set(id, counter++);
    depthOf.set(id, depth);
    maxDepth = Math.max(maxDepth, depth);
    walk(node.right, depth + 1);
  };
  walk(rootId, 0);

  return { xOf, depthOf, leaves: Math.max(counter, 1), maxDepth };
}

export function TreeCanvas({ tree }: { tree: BSTSnapshot }) {
  const { nodes, rootId } = tree;
  const { xOf, depthOf, leaves, maxDepth } = layoutTree(nodes, rootId);
  const height = maxDepth * LEVEL_HEIGHT + NODE_SIZE;

  const centerX = (id: string) => (((xOf.get(id) ?? 0) + 0.5) / leaves) * 100;
  const topOf = (id: string) => (depthOf.get(id) ?? 0) * LEVEL_HEIGHT;

  return (
    <div className="paper-sheet rounded-xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
          binary search tree
        </p>
        <p className="script-note text-base text-primary sm:text-lg">
          left is smaller, right is larger
        </p>
      </div>

      <div className="mt-4 overflow-x-auto pb-1">
        {nodes.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">tree is empty</p>
        ) : (
          <div className="relative" style={{ height, minWidth: leaves * NODE_SLOT_WIDTH }}>
            <svg
              className="absolute inset-0 h-full w-full text-foreground/30"
              viewBox={`0 0 100 ${height}`}
              preserveAspectRatio="none"
              aria-hidden
            >
              {nodes.flatMap((node) =>
                [node.left, node.right]
                  .filter((childId): childId is string => childId !== null)
                  .map((childId) => (
                    <line
                      key={`${node.id}-${childId}`}
                      x1={centerX(node.id)}
                      y1={topOf(node.id) + NODE_SIZE}
                      x2={centerX(childId)}
                      y2={topOf(childId)}
                      stroke="currentColor"
                      strokeWidth={1.5}
                      vectorEffect="non-scaling-stroke"
                    />
                  )),
              )}
            </svg>

            <AnimatePresence>
              {nodes.map((node) => (
                <motion.div
                  key={node.id}
                  layout
                  className="absolute -translate-x-1/2"
                  style={{ left: `${centerX(node.id)}%`, top: topOf(node.id) }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale:
                      node.status === "comparing" ||
                      node.status === "visiting" ||
                      node.status === "rotating" ||
                      node.status === "unbalanced"
                        ? 1.1
                        : 1,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 340, damping: 26 }}
                >
                  <div
                    className={`flex items-center justify-center rounded-full border font-mono text-sm font-bold transition-colors duration-300 ${STATUS_STYLES[node.status]}`}
                    style={{ width: NODE_SIZE, height: NODE_SIZE }}
                  >
                    <motion.span
                      layoutId={`bst-token-${node.valueId}`}
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    >
                      {node.value}
                    </motion.span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
