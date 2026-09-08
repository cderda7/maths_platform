"use client";

import DrawPad, { type Stroke } from "@/components/DrawPad";
import { Button, Eyebrow } from "@/components/ui";

/** The pad with its Undo / Clear toolbar. Strokes are owned by the caller. */
export default function PadSection({
  title = "Your working",
  strokes,
  onStrokesChange,
  onBurstEnd,
  onPenDown,
  onUndo,
  onClear,
}: {
  title?: string;
  strokes: Stroke[];
  onStrokesChange: (s: Stroke[]) => void;
  onBurstEnd: (n: number) => void;
  onPenDown: () => void;
  onUndo: () => void;
  onClear: () => void;
}) {
  return (
    <section className="flex min-h-0 flex-col px-6 py-6">
      <div className="flex items-center justify-between">
        <Eyebrow>{title}</Eyebrow>
        <div className="flex gap-1.5">
          <Button variant="ghost" onClick={onUndo} disabled={strokes.length === 0}>
            Undo
          </Button>
          <Button variant="ghost" onClick={onClear} disabled={strokes.length === 0}>
            Clear
          </Button>
        </div>
      </div>
      <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-2xl border border-line bg-paper shadow-card">
        <DrawPad strokes={strokes} onStrokesChange={onStrokesChange} onBurstEnd={onBurstEnd} onPenDown={onPenDown} />
      </div>
    </section>
  );
}
