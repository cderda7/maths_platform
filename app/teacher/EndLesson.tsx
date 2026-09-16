"use client";

import { useEffect } from "react";
import { GRACE_MS, isDue, isEnding, lessonOver } from "@/lib/classroom";
import { canEndLesson, endsLesson, type ClassStageId } from "@/lib/classStage";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import type { StudentSession } from "@/lib/session";
import { useNow } from "@/lib/store";
import { FORCE_PILL, FORCE_PILL_SIZE, mmss, PENDING_LINE } from "./ForceSubmit";

/**
 * "end lesson" on the pathway strip (ticket 273; on the Pathway card until ticket 334): on the pathway's last stage when it is
 * not class review, in force submit's pill, after the count. One press starts the one-minute grace every student sees ("Your
 * teacher is ending the lesson in"). While it runs the strip shows, in place of force submit, the count and this pill, one
 * line: "ending lesson", how many of the class are not done with the stage, and the countdown with Cancel (the strip leaves
 * out force submit and its count meanwhile, `isEnding`). When the minute is out every student still in the lesson lands on
 * their report and the lesson ends (`lesson/end`): the set moves to Past. No confirmation step, as force submit (ticket 145):
 * the minute with Cancel is the undo, and the count says who it cuts short. Disabled while force submit's own minute runs.
 */
export default function EndLesson({ stage, session, notDone }: { stage: ClassStageId; session: StudentSession | null; notDone: number }) {
  const classroom = useClassroom();
  const now = useNow();
  if (!endsLesson(stage, classroom)) return null;
  const advance = classroom.advance;
  return isEnding(classroom, now) && advance ? (
    <span className={PENDING_LINE} data-end-lesson-pending>
      <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-accent" aria-hidden />
      ending lesson
      <span aria-hidden>·</span>
      <span className="text-ink-muted" data-end-lesson-left>
        {notDone === 0 ? "everyone done" : <><span className="tabular-nums">{notDone}</span> not done</>}
      </span>
      <span aria-hidden>·</span>
      {/* The clock ticks once a second, so a fresh countdown never claims more than the grace. */}
      <span className="tabular-nums">{mmss(Math.min(GRACE_MS, advance.deadline - now))}</span>
      <span aria-hidden>·</span>
      <button type="button" className="text-accent-deep hover:underline" onClick={() => dispatchClassroom({ type: "advance/clear" })} data-end-lesson-cancel>
        Cancel
      </button>
    </span>
  ) : (
    <button type="button" className={`${FORCE_PILL_SIZE} ${FORCE_PILL} border-standout-line`} disabled={!canEndLesson(stage, classroom, session, now)} onClick={() => dispatchClassroom({ type: "advance/start", kind: "end-lesson" })} data-end-lesson={stage}>
      end lesson
    </button>
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
