import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { STRUCTURE_LIST } from "@/lib/stacksQueues";

export const metadata: Metadata = {
  title: "Stacks & Queues — AlgoThrive",
  description:
    "Push, pop, enqueue and dequeue — watch LIFO and FIFO order play out operation by operation.",
};

export default function StacksQueuesPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-5 py-14">
      <Link
        href="/"
        className="text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Home
      </Link>
      <h1 className="heading-slab mt-3 text-4xl sm:text-5xl">Stacks &amp; Queues</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Two of the simplest data structures, and two opposite disciplines for
        removing what you added — watch LIFO and FIFO order play out
        operation by operation.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {STRUCTURE_LIST.map((s) => (
          <Link
            key={s.key}
            href={`/stacks-queues/${s.key}`}
            className="paper-sheet ink-lift block rounded-xl p-5"
          >
            <span className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
              {s.time} · {s.space} space
            </span>
            <h2 className="heading-slab mt-3 text-xl">{s.name}</h2>
            <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
              {s.blurb}
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
