import type { Frame } from "@/lib/sorting";

type FrameCaptionProps = {
  frame: Frame;
  frameIndex: number;
  totalFrames: number;
};

export function FrameCaption({ frame, frameIndex, totalFrames }: FrameCaptionProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Frame {Math.min(frameIndex + 1, totalFrames)} / {totalFrames}
        </p>
        <h2 className="heading-slab text-xl sm:text-2xl">{frame.caption}</h2>
      </div>
      <p className="script-note text-lg text-primary sm:text-xl">{frame.note}</p>
    </div>
  );
}
