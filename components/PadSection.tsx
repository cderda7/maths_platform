"use client";

import { useEffect, useRef } from "react";
import DrawPad, { type Stroke } from "@/components/DrawPad";
import { Button, Eyebrow } from "@/components/ui";

/** What the answer field under the working shows and keeps: the instruction as its placeholder, the sentence as typed. */
export interface AnswerField {
  placeholder: string;
  value: string;
  onChange: (text: string) => void;
}

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
  answer,
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
  /** A text field at the foot of the pad, inside its border, that takes the cursor as it appears: the final answer in a sentence once a worded problem's working is read (tickets 111, 114). */
  answer?: AnswerField;
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
        {/* The field takes the foot of the paper and the canvas gives it up; the ink above is redrawn in place (its coordinates are from the top), so nothing written moves. */}
        {answer && <AnswerBox {...answer} />}
      </div>
    </section>
  );
}

/** The chat's text box (warm-up and help chats), at the foot of the pad: same border, size and muted placeholder, the cursor put in it as it appears. */
function AnswerBox({ placeholder, value, onChange }: AnswerField) {
  const box = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    box.current?.focus();
  }, []);
  return (
    <div className="offer-in pulse-once relative mx-6 mb-5 rounded-2xl" data-pad-answer>
      <textarea
        ref={box}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          // One sentence, not a paragraph: Enter ends the typing rather than starting a new line.
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
        rows={2}
        placeholder={placeholder}
        aria-label="Your final answer"
        className="block min-h-[56px] w-full resize-none rounded-2xl border border-line-strong bg-paper px-4 py-3 text-[15px] text-ink transition-colors duration-300 placeholder:text-ink-muted focus:border-ink-muted focus:outline-none"
      />
    </div>
  );
}
