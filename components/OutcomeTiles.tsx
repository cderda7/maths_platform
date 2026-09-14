"use client";

import type { Problem } from "@/data/types";
import type { Outcome, OutcomeColumn } from "@/lib/report";
import { outcomeTemplate } from "@/lib/reportWork";

/** The tile tint per column: green right away, blue after the student's own rework, amber after the group's, red still wrong. */
const TILE: Record<Outcome, string> = {
  first: "border-secure-line bg-secure-soft",
  individual: "border-standout-line bg-standout-soft",
  group: "border-developing-line bg-developing-soft",
  wrong: "border-wrong-line bg-wrong-soft",
};

/** The narrowest each column may be: its label on two lines at most (Incorrect wider when it carries the not-solved note). */
const FLOOR: Record<Outcome, number> = { first: 100, individual: 110, group: 90, wrong: 64 };
const NOTE_FLOOR = 120;

/**
 * What happened's tiles (ticket 233, shared with the teacher's report in ticket 243): a column per review stage the
 * pathway has, every problem a tile in the column it ended in, the not-solved note under Incorrect. A press on a tile
 * is the caller's (`onPress`); `open` rings the one showing. On the teacher's report a starred problem carries a ★ and,
 * while a commentary idea is chosen, the tiles outside it (`lit`) fade; there the not-solved note is Incorrect's second
 * label line (`noteInLabel`, ticket 244), on one line, so a record with problems its group closed unsolved is no taller.
 */
export default function OutcomeTiles({
  columns,
  unsolved,
  open,
  onPress,
  describe,
  starred = [],
  lit = null,
  noteFloor = NOTE_FLOOR,
  noteInLabel = false,
}: {
  columns: OutcomeColumn[];
  unsolved: Problem[];
  open: string | null;
  onPress: (id: string) => void;
  /** The tile's accessible name from its label. */
  describe: (label: string) => string;
  starred?: string[];
  lit?: string[] | null;
  /** Incorrect's narrowest when it carries the not-solved note. */
  noteFloor?: number;
  /** The not-solved note as Incorrect's second label line, kept on one line, instead of under the tiles. */
  noteInLabel?: boolean;
}) {
  const note = unsolved.length > 0 ? `${unsolved.map((p) => p.label).join(", ")} not solved in group review` : null;
  const template = outcomeTemplate(
    columns.map((c) => c.problems.length),
    columns.map((c) => (c.id === "wrong" && unsolved.length > 0 ? noteFloor : FLOOR[c.id])),
  );
  return (
    <div className="mt-3 grid gap-4" style={{ gridTemplateColumns: template }}>
      {columns.map((c) => (
        <div key={c.id} className="min-w-0" data-outcome={c.id}>
          {/* Two lines tall whether the label wraps or not, so every column's tiles start on the same row. */}
          <div className="min-h-[33px] text-[12px] font-medium leading-snug text-ink-soft">
            {c.label}
            {noteInLabel && c.id === "wrong" && note && (
              <span className="block whitespace-nowrap font-normal text-ink-muted" data-unsolved-note>
                {note}
              </span>
            )}
          </div>
          {c.problems.length === 0 ? (
            <div className="mt-2 text-[13px] text-ink-muted">None</div>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {c.problems.map((p) => {
                const pressed = open === p.id;
                const star = starred.includes(p.id);
                const faded = lit !== null && !lit.includes(p.id);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => onPress(p.id)}
                      aria-pressed={pressed}
                      aria-label={`${p.label}${star ? ", starred" : ""}: ${describe(p.label)}`}
                      className={`inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-lg border px-2 text-[13px] font-medium text-ink transition-[box-shadow,opacity] hover:shadow-card ${TILE[c.id]} ${pressed ? "ring-2 ring-ink ring-offset-1 ring-offset-paper" : ""} ${faded ? "opacity-35" : ""}`}
                      data-work-tile={p.id}
                      data-starred={star || undefined}
                      data-faded={faded || undefined}
                    >
                      {star && (
                        <span className="text-[11px] leading-none" aria-hidden>
                          ★
                        </span>
                      )}
                      {p.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {!noteInLabel && c.id === "wrong" && note && (
            <p className="mt-1.5 text-[12px] leading-snug text-ink-muted" data-unsolved-note>
              {note}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
