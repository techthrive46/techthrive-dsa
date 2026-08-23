import Link from "next/link";
import type { Metadata } from "next";
import {
  BarChart3,
  Search,
  Network,
  ListTree,
  Binary,
  Layers,
  ArrowRight,
  Play,
  Rewind,
  Code2,
} from "lucide-react";
import { HeroDemo } from "@/components/hero-demo";

export const metadata: Metadata = {
  title: "AlgoThrive — Visual Data Structures & Algorithms for Students",
  description:
    "Learn DSA by watching it move. Play, pause and step through sorting, searching, trees and graphs on animated graph paper.",
};

const topics = [
  {
    icon: BarChart3,
    title: "Sorting",
    desc: "Bubble, selection, insertion, merge, quick, heap, shell, counting, radix, bucket, cocktail, and gnome sort — bar by bar.",
    count: "12 algorithms",
    to: "/sorting" as const,
  },
  {
    icon: Search,
    title: "Searching",
    desc: "Linear, binary, jump, interpolation, exponential, and ternary search.",
    count: "6 algorithms",
    to: "/searching" as const,
  },
  {
    icon: Network,
    title: "Pathfinding",
    desc: "BFS, DFS, Dijkstra and A* across a grid maze.",
    count: "4 algorithms",
  },
  {
    icon: ListTree,
    title: "Trees",
    desc: "BST insert, delete, traversals and AVL rotations.",
    count: "6 operations",
  },
  {
    icon: Binary,
    title: "Recursion",
    desc: "Call stacks and recursion trees, frame by frame.",
    count: "4 classics",
  },
  {
    icon: Layers,
    title: "Stacks & Queues",
    desc: "Push, pop, enqueue and dequeue in motion.",
    count: "2 structures",
  },
];

const features = [
  {
    icon: Play,
    title: "You hold the remote",
    desc: "Play, pause and scrub any algorithm like a video — no more static textbook diagrams.",
  },
  {
    icon: Rewind,
    title: "Rewind a mistake",
    desc: "Missed why two bars swapped? Step backwards one frame and watch it again.",
  },
  {
    icon: Code2,
    title: "Code stays in sync",
    desc: "The executing pseudocode line highlights as the picture moves, so theory and visuals click.",
  },
];

export default function Index() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-5">
      <section className="grid items-center gap-10 py-14 lg:grid-cols-[1.05fr_1fr] lg:py-20">
        <div>
          <p className="script-note text-2xl text-primary">learn it by watching it move</p>
          <h1 className="heading-slab mt-2 text-5xl leading-[0.92] sm:text-6xl xl:text-7xl">
            Data structures,
            <br />
            <span className="marker-underline">drawn on paper.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base text-muted-foreground">
            Every algorithm runs as an animation you control — hit play, pause anywhere,
            step backwards, and read the pseudocode line that&apos;s executing right now.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/sorting"
              className="ink-lift inline-flex items-center gap-2 rounded-md border border-foreground/80 bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[5px_5px_0_0_var(--ink)]"
            >
              Start with sorting <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/#topics"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-sm font-bold transition-colors hover:bg-accent"
            >
              Browse topics
            </Link>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-dashed border-border pt-6">
            {[
              ["23+", "visual lessons"],
              ["100%", "step-by-step"],
              ["0", "sign-ups"],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="heading-slab text-3xl">{n}</dt>
                <dd className="text-xs text-muted-foreground">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <HeroDemo />
      </section>

      <section className="grid gap-4 border-y border-dashed border-border py-10 sm:grid-cols-3">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex gap-3">
            <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <h3 className="heading-slab text-lg">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      <section id="topics" className="scroll-mt-20 py-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="heading-slab text-3xl sm:text-4xl">Topics</h2>
          <p className="script-note text-xl text-muted-foreground">
            more chapters landing soon
          </p>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map(({ icon: Icon, title, desc, count, to }) => {
            const inner = (
              <>
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-lg border border-border bg-background">
                    <Icon className="size-5 text-primary" />
                  </span>
                  <span className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                    {count}
                  </span>
                </div>
                <h3 className="heading-slab mt-4 text-xl">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                <p className="mt-4 flex items-center gap-1.5 text-sm font-bold text-primary">
                  {to ? (
                    <>
                      Open visualizer <ArrowRight className="size-4" />
                    </>
                  ) : (
                    <span className="script-note text-lg text-muted-foreground">
                      coming soon
                    </span>
                  )}
                </p>
              </>
            );
            return to ? (
              <Link
                key={title}
                href={to}
                className="paper-sheet ink-lift block rounded-xl p-5"
              >
                {inner}
              </Link>
            ) : (
              <div key={title} className="paper-sheet rounded-xl p-5 opacity-70">
                {inner}
              </div>
            );
          })}
        </div>
      </section>

      <section className="tape paper-sheet mb-16 rounded-xl px-6 py-12 text-center">
        <h2 className="heading-slab text-3xl sm:text-4xl">
          Stop memorising. Start <span className="marker-underline">seeing</span>.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          One click and the bars start moving. No account, no setup, no install.
        </p>
        <Link
          href="/sorting"
          className="ink-lift mt-6 inline-flex items-center gap-2 rounded-md border border-foreground/80 bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[5px_5px_0_0_var(--ink)]"
        >
          Launch the sorting visualizer <ArrowRight className="size-4" />
        </Link>
      </section>
    </main>
  );
}
