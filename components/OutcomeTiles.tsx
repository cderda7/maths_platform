"use client";

import { notAttemptedNote, type Outcome, type OutcomeColumn } from "@/lib/report";
import { outcomeTemplate } from "@/lib/reportWork";

/**
 * The tile tint per column: green right away, blue after the student's own rework, amber after the group's, a neutral grey
 * once class review covered it (ticket 282), red still wrong.
 */
const TILE: Record<Outcome, string> = {
  first: "border-secure-line bg-secure-soft",
  individual: "border-standout-line bg-standout-soft",
  group: "border-developing-line bg-developing-soft",
  covered: "border-covered-line bg-covered-soft",
  wrong: "border-wrong-line bg-wrong-soft",
};

/** Between columns, px: the template's room for them (`outcomeTemplate`). */
const GAP = 16;

/** The narrowest each column may be: its label on two lines at most. */
const FLOOR: Record<Outcome, number> = { first: 100, individual: 110, group: 90, covered: 80, wrong: 64 };

/**
 * A column's tiles on one row (ticket 282: with five columns the fr shares alone let ten Incorrect tiles wrap): a tile is 36 px,
 * "Q10" a little wider, a ★ wider again, with 6 px between.
 */
const tilesWidth = (c: OutcomeColumn, starred: readonly string[]): number =>
  c.problems.reduce((w, p, i) => w + (p.label.length > 2 ? 42 : 36) + (starred.includes(p.id) ? 14 : 0) + (i > 0 ? 6 : 0), 0);

/**
 * What happened's tiles (ticket 233, shared with the teacher's report in ticket 243): a column per review stage the pathway
 * has, every problem a tile in the column it ended in, and under a column that holds problems the student did not attempt a
 * note naming them ("Q9, Q10 not attempted", ticket 282). A press on a tile is the caller's (`onPress`); `open` rings the one
 * showing. On the teacher's report a starred problem carries a ★ and, while a commentary idea is chosen, the tiles outside it
 * (`lit`) fade; there the note is the column label's second line (`noteInLabel`, ticket 244), each on one line (`noteFloor`
 * widens the column for it), so a report with a note is no taller.
 */
export default function OutcomeTiles({
  columns,
  open,
  onPress,
  describe,
  starred = [],
  lit = null,
  noteFloor,
  noteInLabel = false,
}: {
  columns: OutcomeColumn[];
  open: string | null;
  onPress: (id: string) => void;
  /** The tile's accessible name from its label. */
  describe: (label: string) => string;
  starred?: string[];
  lit?: string[] | null;
  /** A column's narrowest when it carries a note, from the column. */
  noteFloor?: (column: OutcomeColumn) => number;
  /** The note as the column label's second line, kept on one line, instead of under the tiles. */
  noteInLabel?: boolean;
}) {
  // A column's floor is its label's (and its note's); its tiles' one row it keeps while the card has room (`outcomeTemplate`).
  const floors = columns.map((c) => Math.max(FLOOR[c.id], noteFloor && c.notAttempted.length > 0 ? noteFloor(c) : 0));
  const template = outcomeTemplate(
    columns.map((c) => c.problems.length),
    floors,
    columns.map((c, i) => Math.max(floors[i], tilesWidth(c, starred))),
    GAP,
  );
  return (
    <div className="mt-3 grid" style={{ gridTemplateColumns: template, columnGap: GAP, rowGap: GAP }}>
      {columns.map((c) => {
        const note = notAttemptedNote(c);
        return (
          <div key={c.id} className="min-w-0" data-outcome={c.id}>
            {/* Two lines tall whether the label wraps or not, so every column's tiles start on the same row. */}
            <div className="min-h-[33px] text-[12px] font-medium leading-snug text-ink-soft" data-outcome-label>
              <span className={noteInLabel && note ? "block whitespace-nowrap" : undefined}>{c.label}</span>
              {noteInLabel && note && (
                <span className="block whitespace-nowrap font-normal text-ink-muted" data-not-attempted-note>
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
            {!noteInLabel && note && (
              <p className="mt-1.5 text-[12px] leading-snug text-ink-muted" data-not-attempted-note>
                {note}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
