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
  note,
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
  /** A line pinned to the foot of the pad, inside its border: "Provide your final answer as a full sentence." once a worded problem's working is read (ticket 111). */
  note?: string;
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
      <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-card">
        <div className="min-h-0 flex-1">
          <DrawPad strokes={strokes} onStrokesChange={onStrokesChange} onBurstEnd={onBurstEnd} onPenDown={onPenDown} readOnly={readOnly} />
        </div>
        {/* The note takes the foot of the paper and the canvas gives it up; the ink above is redrawn in place (its coordinates are from the top), so nothing written moves. */}
        {note && (
          <p className="offer-in mx-6 mb-5 rounded-xl border border-accent-line bg-accent-soft/60 px-4 py-3 text-[14px] font-medium text-accent-deep" data-pad-note>
            {note}
          </p>
        )}
      </div>
    </section>
  );
}
