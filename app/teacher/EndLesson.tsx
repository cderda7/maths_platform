"use client";

import { useEffect } from "react";
import { GRACE_MS, isDue, isEnding, lessonOver } from "@/lib/classroom";
import { canEndLesson, endsLesson, type ClassStageId } from "@/lib/classStage";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import type { StudentSession } from "@/lib/session";
import { useNow } from "@/lib/store";
import { FORCE_PILL, mmss } from "./ForceSubmit";

/**
 * "end lesson" on the Pathway card (ticket 273): on the pathway's last stage when it is not class review, in force submit's
 * pill, laid over the blank room above force submit (`absolute bottom-full` of the stage note), so force submit, the count and
 * the stage pills stay exactly where they were when it appears. One press starts the one-minute grace every student sees ("Your
 * teacher is ending the lesson in"). While it runs the pill's room is left blank and "ending lesson", how many of the class are
 * not done with the stage, and the countdown with Cancel are laid over force submit and its count from force submit's top
 * (`absolute top-0`; the stage note hides those two, `isEnding`, keeping their room), so the block never rises beside the stage
 * above (on a two-stage pathway "indiv working" ends a few px left of the note). When the minute is out every student still in
 * the lesson lands on their report and the lesson ends (`lesson/end`): the set moves to Past. No confirmation step, as force
 * submit (ticket 145): the minute with Cancel is the undo, and the count says who it cuts short. Disabled while force submit's
 * own minute runs.
 */
export default function EndLesson({ stage, session, notDone }: { stage: ClassStageId; session: StudentSession | null; notDone: number }) {
  const classroom = useClassroom();
  const now = useNow();
  if (!endsLesson(stage, classroom)) return null;
  const advance = classroom.advance;
  return isEnding(classroom, now) && advance ? (
    <span className="absolute left-0 top-0 flex flex-col items-start text-ink" data-end-lesson-pending>
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-accent" aria-hidden />
        ending lesson
      </span>
      <span className="text-ink-muted" data-end-lesson-left>
        {notDone === 0 ? "everyone done" : <><span className="tabular-nums">{notDone}</span> not done</>}
      </span>
      <span className="flex items-center gap-1.5">
        {/* The clock ticks once a second, so a fresh countdown never claims more than the grace. */}
        <span className="tabular-nums">{mmss(Math.min(GRACE_MS, advance.deadline - now))}</span>
        <span aria-hidden>·</span>
        <button type="button" className="text-accent-deep hover:underline" onClick={() => dispatchClassroom({ type: "advance/clear" })} data-end-lesson-cancel>
          Cancel
        </button>
      </span>
    </span>
  ) : (
    <span className="absolute bottom-full left-0 pb-1" data-end-lesson-slot>
      <button type="button" className={`${FORCE_PILL} block px-2.5 py-1 text-[12px]`} disabled={!canEndLesson(stage, classroom, session, now)} onClick={() => dispatchClassroom({ type: "advance/start", kind: "end-lesson" })} data-end-lesson={stage}>
        end lesson
      </button>
    </span>
  );
}

/**
 * The teacher's tabs stamp the lesson's end when "end lesson"'s minute runs out (ticket 273), on whatever teacher screen is open,
 * so the set moves to Past without waiting on a student's tab (which stamps the same moment and lands the student on the report).
 * Renders nothing.
 */
export function LessonEnds() {
  const classroom = useClassroom();
  const now = useNow();
  const advance = classroom.advance;
  const due = advance?.kind === "end-lesson" && isDue(classroom, now) && !lessonOver(classroom);
  useEffect(() => {
    if (due && advance) dispatchClassroom({ type: "lesson/end", at: advance.deadline });
  }, [due, advance]);
  return null;
}
