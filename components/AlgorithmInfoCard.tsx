import type { AlgoMeta, Frame } from "@/lib/sorting";

type AlgorithmInfoCardProps = {
  algo: AlgoMeta;
  frame: Frame;
};

export function AlgorithmInfoCard({ algo, frame }: AlgorithmInfoCardProps) {
  return (
    <aside className="paper-sheet rounded-xl p-5">
      <h3 className="heading-slab text-lg">{algo.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {algo.blurb}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Time</dt>
          <dd className="mt-1 font-mono font-bold">{algo.time}</dd>
        </div>
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Space</dt>
          <dd className="mt-1 font-mono font-bold">{algo.space}</dd>
        </div>
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Comparisons</dt>
          <dd className="mt-1 font-mono font-bold">{frame.comparisons}</dd>
        </div>
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Swaps</dt>
          <dd className="mt-1 font-mono font-bold">{frame.swaps}</dd>
        </div>
      </dl>
    </aside>
  );
}
