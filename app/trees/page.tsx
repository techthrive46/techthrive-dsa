import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { TREE_OP_LIST } from "@/lib/trees";

export const metadata: Metadata = {
  title: "Trees — AlgoThrive",
  description:
    "Insert, delete, traverse, and rebalance a binary search tree, one comparison at a time.",
};

export default function TreesPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-5 py-14">
      <Link
        href="/"
        className="text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Home
      </Link>
      <h1 className="heading-slab mt-3 text-4xl sm:text-5xl">Trees</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Pick an operation to watch a binary search tree grow, shrink,
        traverse, or rebalance — with pseudocode highlighting the line
        that&apos;s executing right now.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TREE_OP_LIST.map((op) => (
          <Link
            key={op.key}
            href={`/trees/${op.key}`}
            className="paper-sheet ink-lift block rounded-xl p-5"
          >
            <span className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
              {op.time} · {op.space} space
            </span>
            <h2 className="heading-slab mt-3 text-xl">{op.name}</h2>
            <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
              {op.blurb}
            </p>
            <p className="mt-4 flex items-center gap-1.5 text-sm font-bold text-primary">
              Open visualizer <ArrowRight className="size-4" />
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
