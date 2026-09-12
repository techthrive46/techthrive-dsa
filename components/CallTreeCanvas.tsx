"use client";

import { motion } from "framer-motion";
import type { CallTree, CallTreeNode } from "@/lib/recursion";

const LEVEL_HEIGHT = 76;
const NODE_SLOT_WIDTH = 96;
const NODE_HEIGHT = 40;

/** Tidy-tree layout: leaves get sequential slots, parents center over their children. */
function layoutTree(nodes: CallTreeNode[]) {
  const childrenOf = new Map<string, CallTreeNode[]>();
  for (const node of nodes) {
    if (node.parentId) {
      const list = childrenOf.get(node.parentId) ?? [];
      list.push(node);
      childrenOf.set(node.parentId, list);
    }
  }

  const xOf = new Map<string, number>();
  let nextX = 0;

  const assign = (node: CallTreeNode) => {
    const kids = childrenOf.get(node.id) ?? [];
    if (kids.length === 0) {
      xOf.set(node.id, nextX);
      nextX += 1;
      return;
    }
    kids.forEach(assign);
    const xs = kids.map((kid) => xOf.get(kid.id)!);
    xOf.set(node.id, (Math.min(...xs) + Math.max(...xs)) / 2);
  };

  const root = nodes.find((node) => node.parentId === null);
  if (root) assign(root);

  return { xOf, leaves: Math.max(nextX, 1) };
}

export function CallTreeCanvas({ tree }: { tree: CallTree }) {
  const { nodes, maxDepth } = tree;
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const { xOf, leaves } = layoutTree(nodes);
  const height = maxDepth * LEVEL_HEIGHT + NODE_HEIGHT;

  const centerX = (node: CallTreeNode) => (((xOf.get(node.id) ?? 0) + 0.5) / leaves) * 100;

  return (
    <div className="paper-sheet rounded-xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
          recursion tree
        </p>
        <p className="script-note text-base text-primary sm:text-lg">
          every call branches, every return climbs back
        </p>
      </div>

      <div className="mt-4 overflow-x-auto pb-1">
        <div className="relative" style={{ height, minWidth: leaves * NODE_SLOT_WIDTH }}>
          <svg
            className="absolute inset-0 h-full w-full text-foreground/30"
            viewBox={`0 0 100 ${height}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            {nodes.map((node) => {
              const parent = node.parentId ? byId.get(node.parentId) : null;
              if (!parent) return null;
              return (
                <line
                  key={node.id}
                  x1={centerX(parent)}
                  y1={parent.depth * LEVEL_HEIGHT + NODE_HEIGHT}
                  x2={centerX(node)}
                  y2={node.depth * LEVEL_HEIGHT}
                  stroke="currentColor"
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>

          {nodes.map((node) => (
            <motion.div
              key={node.id}
              layout
              className="absolute -translate-x-1/2"
              style={{ left: `${centerX(node)}%`, top: node.depth * LEVEL_HEIGHT }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: node.status === "active" ? 1.06 : 1 }}
              transition={{ type: "spring", stiffness: 340, damping: 26 }}
            >
              <div
                className={`flex flex-col items-center rounded-md border px-2 py-1 font-mono text-xs font-bold whitespace-nowrap sm:text-sm ${
                  node.status === "returned"
                    ? "border-bar-sorted bg-bar-sorted/15 text-foreground"
                    : "border-bar-compare bg-bar-compare/20 text-foreground"
                }`}
                style={{ minHeight: NODE_HEIGHT }}
              >
                <span>{node.label}</span>
                {node.returnValue !== null ? (
                  <span className="text-bar-sorted">→ {node.returnValue}</span>
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
