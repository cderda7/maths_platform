"use client";

import { useRouter } from "next/navigation";
import { canTeacherSkip, HOMEWORK_SKIP_TARGETS, homeworkSkipsShown, TEACHER_SKIP_LABEL, TEACHER_SKIP_TARGETS, teacherSkip, type TeacherSkipTarget } from "@/lib/demo";
import { CLASSROOM_HREF, REVIEW_ASSIGNMENT_HREF } from "@/lib/assignments";
import { getClassroom, useClassroom } from "@/lib/classroom-store";
import { getSnapshot, refreshBatchedSession, setLesson } from "@/lib/store";
import { homeworkJump } from "@/components/homeworkJump";

/**
 * The teacher's presenter jumps (ticket 263): send assignment, students done with the current stage, activity completed.
 * Bottom-left in the teacher frame's presenter strip (`TeacherChrome`), outside the product's chrome and across from
 * "Reset demo", in the same dashed look as Sam's SKIP TO (`components/SkipTo.tsx`), so they read as demo controls. A
 * jump moves the whole lesson as one change (`teacherSkip`, `setLesson`), so the board and Sam's iPad move with it.
 * "send assignment" takes the teacher to Create's last step, filled in and not yet sent, so the presenter shows the
 * moment of sending by pressing Create (ticket 272); the other two leave the teacher on the screen they are on, which
 * re-renders from the new state. "students done" waits for a set to be sent.
 *
 * Once +Homework has been pressed in this demo (ticket 295), "send homework" and "homework open" follow (`homeworkJump`):
 * send homework lands on the Classroom as the real Create's Send does; homework open leaves the teacher where they are, as
 * activity completed does, and takes Sam's iPad to his Classroom.
 */
function jump(t: TeacherSkipTarget) {
  const { classroom, session } = teacherSkip(t, getClassroom(), getSnapshot(), Date.now());
  setLesson({ classroom, session });
  refreshBatchedSession();
}

const BUTTON = "rounded-full px-2.5 py-1 text-[12px] whitespace-nowrap text-ink-muted transition-colors enabled:hover:bg-cream-deep enabled:hover:text-ink disabled:cursor-default disabled:opacity-40";

export default function TeacherSkipTo() {
  const router = useRouter();
  const classroom = useClassroom();
  return (
    <div className="flex min-w-0 items-center gap-1.5 rounded-full border border-dashed border-line-strong bg-paper/80 px-2 py-1 backdrop-blur" data-teacher-skip-to>
      <span className="pl-1.5 text-[11px] uppercase tracking-wide text-ink-muted">skip to</span>
      {TEACHER_SKIP_TARGETS.map((t) => {
        const enabled = canTeacherSkip(t, classroom);
        return (
          <button
            key={t}
            type="button"
            disabled={!enabled}
            onClick={() => {
              jump(t);
              if (t === "send") router.push(REVIEW_ASSIGNMENT_HREF);
            }}
            data-teacher-skip={t}
            className={BUTTON}
          >
            {TEACHER_SKIP_LABEL[t]}
          </button>
        );
      })}
      {homeworkSkipsShown(classroom) &&
        HOMEWORK_SKIP_TARGETS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              homeworkJump(t);
              if (t === "send homework") router.push(CLASSROOM_HREF);
            }}
            data-teacher-skip={t}
            className={BUTTON}
          >
            {t}
          </button>
        ))}
    </div>
  );
}
