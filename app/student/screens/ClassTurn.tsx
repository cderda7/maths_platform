"use client";

import { useState } from "react";
import M from "@/components/Math";
import PadSection from "@/components/PadSection";
import { MisconceptionChip } from "@/components/Tag";
import { Eyebrow } from "@/components/ui";
import type { Stroke } from "@/data/types";
import { classTurnScript, turnFor, type TurnLine } from "@/lib/classReview";
import type { LineMark } from "@/lib/ladder";
import { nextLine } from "@/lib/recognition";
import { classWorkOf, type SessionAction, type StudentSession } from "@/lib/session";

/**
 * Class review's third step on the student's own iPad (ticket 344): Q**, the whole question, written on their own pad
 * with every line marked as the pad reads it. Nothing is blanked and nothing is given: a wrong line stays wrong until the
 * student writes a right one, so the mark is feedback, not the answer. The marks are exactly the help steps' (ticket 312's
 * `markLine` over ticket 311's check) and the rows look exactly the same, so a student who has had help on a question
 * reads this without learning anything new.
 *
 * Nothing here is scored or recorded: the lines live on the session (`classReview`) so a reload lands on the same work,
 * and no report, version or set score reads them. A student who finishes early waits on their own working until the
 * teacher moves the class on.
 */
export default function ClassTurn({ problem, session, dispatch }: { problem: string; session: StudentSession; dispatch: (a: SessionAction) => void }) {
  const work = classWorkOf(session, problem);
  const state = turnFor(problem, work.lines);
  const [recognising, setRecognising] = useState(false);
  if (!state) return null;
  const addStroke = (next: Stroke[]) => dispatch({ type: "class-review/stroke", problem, stroke: next[next.length - 1] });
  const onBurstEnd = (strokeCount: number) => {
    setRecognising(false);
    const line = nextLine(classTurnScript(problem), work.lines, strokeCount);
    if (line) dispatch({ type: "class-review/reveal", problem, line });
  };
  return (
    <div className="mt-3 grid min-h-0 flex-1 grid-cols-[1fr_310px] gap-4" data-class-turn={state.done ? "done" : "writing"}>
      <PadSection
        strokes={work.ink}
        onStrokesChange={addStroke}
        onBurstEnd={onBurstEnd}
        onPenDown={() => setRecognising(true)}
        onUndo={() => {
          setRecognising(false);
          dispatch({ type: "class-review/undo", problem });
        }}
        onClear={() => {
          setRecognising(false);
          dispatch({ type: "class-review/clear", problem });
        }}
      />
      <div className="flex min-h-0 flex-col rounded-2xl border border-line bg-paper px-4 py-4">
        {/* "Working", as the help steps head the same column (ticket 312): the pad beside it is headed "Your working" by its own title. */}
        <Eyebrow>Working</Eyebrow>
        <ol className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto" data-class-working>
          {state.written.map((w) => (
            <Row key={w.index} line={w} />
          ))}
          {recognising ? (
            <li className="shimmer h-11 rounded-xl" aria-label="Recognising" />
          ) : (
            <li className="rounded-xl border border-dashed border-line-strong px-3.5 py-3 text-[12.5px] leading-snug text-ink-muted" data-class-slot={state.done ? "done" : "open"}>
              {state.done ? "Every line in. Wait for the class." : state.written.length === 0 ? "Write the whole working on the pad." : "Write the next line on the pad."}
            </li>
          )}
        </ol>
      </div>
    </div>
  );
}

const ROW = "rounded-xl border px-3.5 py-2.5 text-[16px] text-ink";

/** How a written line looks, by its mark: the same table the help steps read (`MARK_LOOK` in `PracticeSteps`). */
const MARK_LOOK: Record<LineMark["kind"], string> = {
  right: "border-line border-l-[3px] border-l-secure bg-paper",
  wrong: "border-wrong-line bg-wrong-soft",
  unreadable: "border-dashed border-line-strong bg-paper",
};

function Row({ line }: { line: TurnLine }) {
  return (
    <li className={`${ROW} ${MARK_LOOK[line.mark.kind]}`} data-mark={line.mark.kind}>
      <span className="block overflow-x-auto">
        <M tex={line.tex} />
      </span>
      {line.mark.kind === "wrong" && line.mark.misconception && (
        <div className="mt-1.5">
          <MisconceptionChip id={line.mark.misconception} />
        </div>
      )}
      {line.mark.kind === "unreadable" && <div className="mt-1 text-[12.5px] text-ink-muted">Couldn&rsquo;t read this line. Try writing it again.</div>}
    </li>
  );
}
