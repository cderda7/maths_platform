"use client";

import ExampleColumns from "@/components/ExampleColumns";
import M from "@/components/Math";
import PadSection from "@/components/PadSection";
import SlideInk from "@/components/SlideInk";
import WorkedLines from "@/components/WorkedLines";
import { useClassAdvance } from "@/components/useClassAdvance";
import { ASSIGNMENT } from "@/data/assignment";
import { CLASS_STEP_STUDENT_WORD } from "@/lib/classReview";
import { useClassroom } from "@/lib/classroom-store";
import { frozenView, type FrozenView } from "@/lib/frozen";
import { ANCHOR } from "@/lib/markup";
import type { SessionAction, StudentSession } from "@/lib/session";
import StemWords from "@/components/StemWords";
import ClassTurn from "./ClassTurn";

/**
 * Class review on the student's screen, at the step the board is on (ticket 344).
 *
 *  - examples: the board's slide, as the board shows it (ticket 161). The problem, its examples in the same columns
 *    (`ExampleColumns`), and a pad in the board's place mirroring the teacher's working, which takes no input. The one
 *    difference from the board is each example's corner: no count here, only a tag on the example that was this student's
 *    own first hand-in. Marks appear only while the board shows them, and the teacher's marks over the slide (ticket 330)
 *    lie over the same maths here.
 *  - worked example: Q*'s lines, exactly the ones the board has revealed.
 *  - your turn: Q**, this student's own, on their own pad, every line marked as it is read (`ClassTurn`).
 *
 * The step is the classroom's, so every iPad in the room turns together and a reload lands on the same step with the same
 * work. Nothing written here is marked into a version, scored or recorded anywhere.
 */
export default function FrozenScreen({ session, dispatch }: { session: StudentSession; dispatch: (a: SessionAction) => void }) {
  const v = frozenView(session, useClassroom());
  useClassAdvance();
  const step = v?.step ?? "examples";
  const shown = v ? (step === "worked" && v.pair ? v.pair.worked : step === "turn" && v.pair ? v.pair.completion : v.problem) : null;
  return (
    <div className={`flex h-full min-h-0 flex-col px-9 py-6 ${step === "turn" ? "" : "select-none"}`} data-frozen data-view={v?.view ?? "none"} data-step={v ? step : "none"}>
      <div className="flex items-center justify-center gap-3 rounded-full border border-accent-line bg-accent-soft px-4 py-1.5 text-[13px] text-ink" data-frozen-banner>
        <span className="h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden />
        {ASSIGNMENT.teacher} is reviewing this with the class
        {v && (
          <span className="rounded-full border border-accent-line bg-paper px-2.5 py-0.5 text-[12px] text-accent-deep" data-step-chip>
            {CLASS_STEP_STUDENT_WORD[step]}
          </span>
        )}
      </div>
      {v && shown ? (
        <div className="mt-4 flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-4">
            <span className="shrink-0 font-display text-[30px] text-ink" data-ink-anchor={step === "examples" ? ANCHOR.label : undefined} data-class-label>
              {shown.label}
            </span>
            <span className="math-lg min-w-0 overflow-x-auto text-ink" data-ink-anchor={step === "examples" ? ANCHOR.tex : undefined}>
              <M tex={shown.tex} />
            </span>
          </div>
          <p className="mt-1 text-[15px] text-ink-soft">
            <span data-ink-anchor={step === "examples" ? ANCHOR.stem : undefined}>
              <StemWords stem={shown.stem} />
            </span>
          </p>
          {step === "examples" ? <Examples v={v} /> : step === "worked" && v.pair ? <Worked v={v} /> : <ClassTurn problem={v.problem.id} session={session} dispatch={dispatch} />}
        </div>
      ) : (
        <p className="mt-10 text-center text-[15px] text-ink-muted">Waiting for the board</p>
      )}
    </div>
  );
}

/** The examples beside the teacher's pad, with the teacher's marks over the whole slide (ticket 330). */
function Examples({ v }: { v: FrozenView }) {
  return (
    <SlideInk marks={v.markup} className="mt-3 flex min-h-0 flex-1 flex-col">
      {/* The pad is 310 wide, enough for its title and Undo / Clear on one line; the example columns are fitted to the rest (ticket 161). */}
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_310px] gap-4">
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
          <PadSection title={`${ASSIGNMENT.teacher}'s working`} strokes={v.teacherInk} onStrokesChange={() => undefined} onBurstEnd={() => undefined} onPenDown={() => undefined} onUndo={() => undefined} onClear={() => undefined} readOnly />
        </div>
      </div>
    </SlideInk>
  );
}

/** Q* as the board is revealing it: the same lines, no more and no fewer, in the column the examples stood in. */
function Worked({ v }: { v: FrozenView }) {
  return (
    <div className="mt-3 min-h-0 flex-1 overflow-y-auto" data-class-worked>
      <div className="max-w-[560px]">
        <WorkedLines steps={v.pair!.worked.solution} shown={v.reveal} size="student" />
      </div>
    </div>
  );
}
