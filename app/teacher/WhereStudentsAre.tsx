"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui";
import { arriving } from "@/lib/arrivals";
import type { AssignmentBundle } from "@/lib/assignments";
import { classPlaces } from "@/lib/place";
import type { StudentSession } from "@/lib/session";
import { carryPlaces, checkIns, classmatesEntered, emptyQuestionRuns, whereRows, type SeenPlace, type WherePill, type WhereRow } from "@/lib/whereStudents";

/** The row label's fixed cell, layout px: wide enough for "Handed in" and a range ("Q7–Q10") at the label's size. */
const LABEL_CELL = 132;
/** Kept between the column's foot and the scroll region's, layout px, before empty question rows fold. */
const FOOT_ROOM = 12;

const TONE: Record<WherePill["tone"], { pill: string; bar: string }> = {
  warmup: { pill: "border-accent-line bg-accent-soft", bar: "bg-accent" },
  practice: { pill: "border-standout-line bg-standout-soft", bar: "bg-standout" },
  plain: { pill: "border-line bg-paper", bar: "bg-ink-muted" },
};

/**
 * The class's rows during individual working at `now` (ticket 315): everyone's place from the model (`classPlaces`, ticket
 * 314), with Sam's first-seen time and every row entry carried between reads (`carryPlaces`), as the column's rows. The
 * carried places are held in state and replaced during render only when a place, a step time or a row entry changes (the
 * Mistakes tab's own hold works the same way), so a tick that moves nobody re-renders nothing new.
 */
export function useWhereRows(assignment: AssignmentBundle, session: StudentSession | null, now: number): WhereRow[] {
  const [seen, setSeen] = useState<readonly SeenPlace[]>([]);
  const places = now === 0 ? [] : classPlaces(assignment, session, now, assignment.absent);
  const next = carryPlaces(seen, places, now, now === 0 ? {} : classmatesEntered(assignment, session, now));
  if (next !== seen) setSeen(next);
  return whereRows(next, assignment.problems, assignment.classmates, now, now === 0 ? {} : checkIns(assignment, session, now));
}

/** A step of three as three short bars, the steps reached filled in the pill's tone. */
function StepBar({ step, tone }: { step: 1 | 2 | 3; tone: WherePill["tone"] }) {
  return (
    <span className="flex shrink-0 items-center gap-[3px]" aria-label={`step ${step} of 3`} data-step-bar={step}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={`h-[5px] w-[14px] rounded-full ${i <= step ? TONE[tone].bar : "bg-line-strong"}`} />
      ))}
    </span>
  );
}

/**
 * One student in a row: avatar, name, the detail in muted words, the step bar for warm-up and practice, and the time in
 * plain muted words (never coloured: whether it changes colour past a limit is still Carson's call). One line, never
 * wrapping. The time says which it is (ticket 327): "3 min here" in the row, ticking, its figures in a fixed slot so a tick
 * from "9 s" to "10 s" or "59 s" to "1 min" never changes the pill's width and never re-wraps its row; "took 7 min" once
 * handed in, fixed, so it needs no slot. A student who has just come into the row glows faintly and fades, as a name
 * landing in a mistake card does (`.arrive-ring`, a ring on a wrapper so the pill keeps its own tint).
 *
 * `onPress` makes the pill a button (ticket 316 opens the student's work from it); without one it is plain text.
 */
export function StudentPill({ pill, now, onPress }: { pill: WherePill; now: number; onPress?: (id: string) => void }) {
  const [since] = useState(() => (pill.arrivedAt === null ? null : Math.max(0, now - pill.arrivedAt)));
  const glow = since !== null && pill.arrivedAt !== null && arriving(pill.arrivedAt, now);
  const tone = TONE[pill.tone];
  const inner = (
    <>
      <Avatar initials={pill.initials} size="h-6 w-6 text-[9.5px]" />
      <span className="font-medium text-ink">{pill.name}</span>
      {pill.detail && (
        <span className="text-[13px] text-ink-muted" data-pill-detail>
          {pill.detail}
        </span>
      )}
      {pill.step && <StepBar step={pill.step} tone={pill.tone} />}
      {pill.time?.kind === "here" && (
        <span className="flex shrink-0 gap-1 text-[13px] text-ink-muted" data-pill-time="here">
          <span className="w-[46px] text-right tabular-nums">{pill.time.span}</span>
          here
        </span>
      )}
      {pill.time?.kind === "took" && (
        <span className="shrink-0 text-[13px] tabular-nums text-ink-muted" data-pill-time="took">
          took {pill.time.span}
        </span>
      )}
    </>
  );
  const cls = `flex items-center gap-2 whitespace-nowrap rounded-full border py-[2px] pr-3 pl-[2px] text-[14px] leading-none ${tone.pill}`;
  return (
    <span className={`inline-flex rounded-full ${glow ? "arrive-ring" : ""}`} style={glow ? { animationDelay: `-${since}ms` } : undefined} data-arriving={glow || undefined}>
      {onPress ? (
        <button type="button" className={`${cls} text-left transition-colors hover:border-ink-muted`} onClick={() => onPress(pill.id)} data-place-pill={pill.id} data-tone={pill.tone}>
          {inner}
        </button>
      ) : (
        <span className={cls} data-place-pill={pill.id} data-tone={pill.tone}>
          {inner}
        </span>
      )}
    </span>
  );
}

function RowLabel({ label, sub }: { label: string; sub: string | null }) {
  return (
    <div className="flex shrink-0 flex-col justify-center border-r border-line px-4 py-1.5" style={{ width: LABEL_CELL }}>
      <span className="font-display text-[20px] leading-tight whitespace-nowrap text-ink">{label}</span>
      {sub && <span className="text-[12px] leading-tight text-ink-muted">{sub}</span>}
    </div>
  );
}

/**
 * The rows as a table (ticket 315): a row per place, its label in a fixed left cell, its students' pills flowing and
 * wrapping beside it; a row with nobody in it stays, blank beside its label (ticket 327: no "nobody yet"); the absent named
 * in muted text in the Handed in row. Rows never reorder: a student's pill leaves one row and joins the end of the next.
 *
 * When the whole column would not fit the scroll region (1280 x 800 with all twenty in play: everyone in Starting at the
 * first seconds), each run of empty question rows folds into one range row ("Q2–Q10", blank). The fold is decided
 * before paint on the unfolded rows every render (and on a resize), written straight to the rows' `hidden`, so it holds no
 * state and cannot flip back and forth: only rows with nobody in them fold, so no pill ever leaves its question's row.
 */
export function PlaceTable({ rows, now, onPress }: { rows: readonly WhereRow[]; now: number; onPress?: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const runs = emptyQuestionRuns(rows);
  useLayoutEffect(() => {
    const table = ref.current;
    const main = table?.closest<HTMLElement>("[data-teacher-scroll]");
    if (!table || !main) return;
    const fold = () => {
      const ranges = [...table.querySelectorAll<HTMLElement>("[data-place-range]")];
      const members = [...table.querySelectorAll<HTMLElement>("[data-in-run]")];
      for (const r of ranges) r.hidden = true;
      // Every row shown first, including one that was folded and is no longer in a run (React never touches `hidden` here).
      for (const m of table.querySelectorAll<HTMLElement>("[data-place-row]")) m.hidden = false;
      const zoom = main.getBoundingClientRect().height / main.clientHeight || 1;
      const foot = (table.getBoundingClientRect().bottom - main.getBoundingClientRect().top) / zoom + main.scrollTop;
      const folded = ranges.length > 0 && foot > main.clientHeight - FOOT_ROOM;
      for (const r of ranges) r.hidden = !folded;
      for (const m of members) m.hidden = folded;
      table.dataset.folded = folded ? "true" : "false";
    };
    fold();
    const ro = new ResizeObserver(fold);
    ro.observe(main);
    document.fonts?.ready.then(fold);
    return () => ro.disconnect();
  });
  const runOf = (key: string) => runs.find((r) => r.keys.includes(key));
  return (
    <div ref={ref} className="overflow-hidden rounded-2xl border border-line bg-paper shadow-card" data-place-table>
      {rows.map((row, i) => {
        const run = runOf(row.key);
        const border = i === 0 ? "" : "border-t border-line";
        return (
          <div key={row.key} className="contents">
            {run && run.from === row.key && (
              <div hidden className={`flex min-h-[44px] ${border}`} data-place-range={`${run.from}-${run.to}`}>
                <RowLabel label={run.label} sub={null} />
                <div className="flex-1" />
              </div>
            )}
            <div className={`flex min-h-[44px] ${border}`} data-place-row={row.key} data-in-run={run ? `${run.from}-${run.to}` : undefined} data-count={row.pills.length}>
              <RowLabel label={row.label} sub={row.sub} />
              <div className="flex min-w-0 flex-1 flex-wrap content-center items-center gap-x-2 gap-y-1.5 px-3 py-1.5">
                {row.pills.map((p) => (
                  <StudentPill key={p.id} pill={p} now={now} onPress={onPress} />
                ))}
                {row.absent.length > 0 && (
                  <span className="text-[13px] text-ink-muted" data-place-note>
                    {row.absent.map((a) => `${a.name} absent`).join(" · ")}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
