"use client";

import { useState } from "react";
import { Button, Card, Eyebrow } from "@/components/ui";
import { inferUnitFromText, UNIT_TITLES } from "@/lib/unit";

/**
 * The "Unit focus" card: the unit the set points at, to confirm, or to describe in a note and
 * reassess (the reassessed unit replaces the inferred one until the note changes it again). The
 * old create screen and the review step's pathway screen share it (ticket 120); the caller owns
 * the reassessed unit and the confirmation, so a reload keeps them where the caller keeps them.
 */
export default function UnitFocus({
  inferred,
  reassessed,
  confirmed,
  onConfirm,
  onReassess,
}: {
  /** The unit inferred from the problems. */
  inferred: 1 | 2 | 3 | 4;
  /** The unit reassessed from the teacher's note, if they wrote one. */
  reassessed: 1 | 2 | 3 | 4 | null;
  confirmed: boolean;
  onConfirm: () => void;
  onReassess: (unit: 1 | 2 | 3 | 4) => void;
}) {
  const [note, setNote] = useState("");
  const unit = reassessed ?? inferred;
  return (
    <Card className="p-6" data-unit-focus>
      <div className="flex items-center justify-between">
        <Eyebrow>Unit focus</Eyebrow>
        {reassessed !== null && <span className="text-[11.5px] text-ink-muted">reassessed from your note</span>}
      </div>
      <div className="mt-3 flex items-center justify-between gap-4">
        <div>
          <div className="font-display text-[22px] text-ink" data-unit-inferred>
            Unit {unit}
          </div>
          <div className="text-[13px] text-ink-soft">{UNIT_TITLES[unit]}</div>
        </div>
        <Button variant={confirmed ? "accent" : "secondary"} onClick={onConfirm} aria-pressed={confirmed} data-unit-confirm>
          {confirmed ? "✓ Confirmed" : "Confirm"}
        </Button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Not quite? describe the focus"
          aria-label="Describe the focus"
          className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-3 py-2 text-[13.5px] text-ink outline-none focus:border-accent"
          data-unit-note
        />
        <Button variant="ghost" onClick={() => onReassess(inferUnitFromText(note))} disabled={!note.trim()} data-unit-reassess>
          Reassess
        </Button>
      </div>
    </Card>
  );
}
