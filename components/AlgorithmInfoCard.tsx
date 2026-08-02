type Stat = {
  label: string;
  value: string | number;
};

type AlgorithmInfoCardProps = {
  name: string;
  blurb: string;
  time: string;
  space: string;
  stats: Stat[];
};

export function AlgorithmInfoCard({
  name,
  blurb,
  time,
  space,
  stats,
}: AlgorithmInfoCardProps) {
  return (
    <aside className="paper-sheet rounded-xl p-5">
      <h3 className="heading-slab text-lg">{name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{blurb}</p>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {[
          { label: "Time", value: time },
          { label: "Space", value: space },
          ...stats,
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-background/60 p-3"
          >
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </dt>
            <dd className="mt-1 font-mono font-bold">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
