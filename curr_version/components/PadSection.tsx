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
  readOnly = false,
  padded = true,
}: {
  title?: string;
  strokes: Stroke[];
  onStrokesChange: (s: Stroke[]) => void;
  onBurstEnd: (n: number) => void;
  onPenDown: () => void;
  onUndo: () => void;
  onClear: () => void;
  /** A mirror: no toolbar, no input. */
  readOnly?: boolean;
  /** `false` when the pad sits in a grid beside other columns: no inset, so its eyebrow lines up with theirs. */
  padded?: boolean;
}) {
  return (
    <section className={`flex h-full min-h-0 flex-1 flex-col ${padded ? "px-6 py-6" : ""}`}>
      {/* The eyebrow marks the top of the row and the taller buttons are pulled up to centre on it, so the title lines up with a neighbouring column's eyebrow. */}
      <div className="flex items-start justify-between">
        <Eyebrow>{title}</Eyebrow>
        {!readOnly && (
          <div className="-mt-2.5 flex gap-1.5">
            <Button variant="ghost" onClick={onUndo} disabled={strokes.length === 0}>
              Undo
            </Button>
            <Button variant="ghost" onClick={onClear} disabled={strokes.length === 0}>
              Clear
            </Button>
          </div>
        )}
      </div>
      <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded-2xl border border-line bg-paper shadow-card">
        <DrawPad strokes={strokes} onStrokesChange={onStrokesChange} onBurstEnd={onBurstEnd} onPenDown={onPenDown} readOnly={readOnly} />
      </div>
    </section>
  );
}
