import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ALGO_LIST } from "@/lib/sorting";

export default function SortingPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-5 py-14">
      <Link
        href="/"
        className="text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Home
      </Link>
      <h1 className="heading-slab mt-3 text-4xl sm:text-5xl">
        Sorting Algorithms
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Pick an algorithm to watch comparisons, swaps and sorted regions
        animate on the graph-paper canvas — with pseudocode highlighting
        the line that&apos;s executing right now.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ALGO_LIST.map((algo) => (
          <Link
            key={algo.key}
            href={`/sorting/${algo.key}`}
            className="paper-sheet ink-lift block rounded-xl p-5"
          >
            <span className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
              {algo.time} · {algo.space} space
            </span>
            <h2 className="heading-slab mt-3 text-xl">{algo.name}</h2>
            <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{algo.blurb}</p>
            <p className="mt-4 flex items-center gap-1.5 text-sm font-bold text-primary">
              Open visualizer <ArrowRight className="size-4" />
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
