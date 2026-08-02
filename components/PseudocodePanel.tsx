type PseudocodePanelProps = {
  pseudocode: string[];
  line: number;
};

export function PseudocodePanel({ pseudocode, line }: PseudocodePanelProps) {
  return (
    <div className="paper-sheet rounded-xl p-5">
      <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
        pseudocode
      </p>
      <pre className="mt-3 overflow-x-auto font-mono text-sm leading-relaxed">
        {pseudocode.map((text, i) => (
          <div
            key={i}
            className={`rounded px-2 py-0.5 ${
              i === line
                ? "bg-primary/15 font-bold text-foreground"
                : "text-muted-foreground"
            }`}
          >
            {text}
          </div>
        ))}
      </pre>
    </div>
  );
}
