"use client";

import ExampleColumns from "@/components/ExampleColumns";
import M from "@/components/Math";
import PadSection from "@/components/PadSection";
import { ASSIGNMENT } from "@/data/assignment";
import type { Stroke } from "@/data/types";
import { FOLLOW_MODE_WORD } from "@/lib/classroom";
import { useClassroom } from "@/lib/classroom-store";
import { frozenView } from "@/lib/frozen";
import type { SessionAction, StudentSession } from "@/lib/session";

/**
 * Whole-class review on the student's screen: the board's slide, as the board shows it (ticket
 * 161). The problem, its examples in the same columns (`ExampleColumns`), and a pad in the
 * board's place for the teacher's working. The one difference from the board is each example's
 * corner: no count here, only a tag on the example that was this student's own first hand-in.
 * In "screens frozen" the pad mirrors the teacher's writing and takes no input; in "write with
 * me" it is the student's own, to copy the teacher's working. Marks appear only while the board
 * shows them.
 */
export default function FrozenScreen({ session, dispatch }: { session: StudentSession; dispatch: (a: SessionAction) => void }) {
  const v = frozenView(session, useClassroom());
  const live = v?.mode === "write-with-me";
  const pid = v?.problem.id ?? "";
  const own = session.followInk[pid] ?? [];
  const addStroke = (next: Stroke[]) => dispatch({ type: "follow/stroke", problem: pid, stroke: next[next.length - 1] });
  return (
    <div className={`flex h-full min-h-0 flex-col px-9 py-6 ${live ? "" : "select-none"}`} data-frozen data-view={v?.view ?? "none"} data-mode={v?.mode ?? "none"}>
      <div className="flex items-center justify-center gap-3 rounded-full border border-accent-line bg-accent-soft px-4 py-1.5 text-[13px] text-ink" data-frozen-banner>
        <span className="h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden />
        {ASSIGNMENT.teacher} is reviewing this with the class
        {v && (
          <span className="rounded-full border border-accent-line bg-paper px-2.5 py-0.5 text-[12px] text-accent-deep" data-mode-chip>
            {FOLLOW_MODE_WORD[v.mode]}
          </span>
        )}
      </div>
      {v ? (
        <div className="mt-4 flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-4">
            <span className="font-display text-[30px] text-ink">{v.problem.label}</span>
            <span className="math-lg text-ink">
              <M tex={v.problem.tex} />
            </span>
          </div>
          <p className="mt-1 text-[15px] text-ink-soft">{v.problem.stem}</p>
          {/* The pad is 310 wide, enough for "Write with me" and Undo / Clear on one line; the example columns are fitted to the rest (ticket 161). */}
          <div className="mt-3 grid min-h-0 flex-1 grid-cols-[1fr_310px] gap-4">
            <ExampleColumns
              size="student"
              examples={v.examples.map((e) => ({
                letter: e.letter,
                lines: e.lines,
                corner: e.mine ? (
                  // Centred on the letter's row, not on its baseline: a pill on the baseline would make this column's header taller than its neighbours' and drop its lines out of line with theirs.
                  <span className="self-center rounded-full border border-standout-line bg-standout-soft px-2.5 py-0.5 text-[12px] font-medium whitespace-nowrap text-standout" data-mine>
                    your approach
                  </span>
                ) : undefined,
              }))}
            />
            <div className="flex min-h-0 flex-col rounded-2xl border border-line bg-paper" data-follow-pad>
              {live ? (
                <PadSection title="Write with me" strokes={own} onStrokesChange={addStroke} onBurstEnd={() => undefined} onPenDown={() => undefined} onUndo={() => dispatch({ type: "follow/undo", problem: pid })} onClear={() => dispatch({ type: "follow/clear", problem: pid })} />
              ) : (
                <PadSection title={`${ASSIGNMENT.teacher}'s working`} strokes={v.teacherInk} onStrokesChange={() => undefined} onBurstEnd={() => undefined} onPenDown={() => undefined} onUndo={() => undefined} onClear={() => undefined} readOnly />
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-10 text-center text-[15px] text-ink-muted">Waiting for the board</p>
      )}
    </div>
  );
}
