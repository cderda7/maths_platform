"use client";

import { usePathname, useRouter } from "next/navigation";
import { HOMEWORK_SKIP_TARGETS, homeworkSkipsShown, keepHomeworkStarted, SKIP_TARGETS, skipFixture, type HomeworkSkipTarget, type SkipTarget } from "@/lib/demo";
import { getClassroom, useClassroom } from "@/lib/classroom-store";
import { setLesson } from "@/lib/store";
import { LIVE_ASSIGNMENT_ID } from "@/lib/assignments";
import { STUDENT_CLASSROOM_HREF, studentSetHref } from "@/lib/studentClassroom";
import { homeworkJump } from "./homeworkJump";

/**
 * Presenter shortcuts into Sam's run, pinned bottom-left outside the product's chrome and drawn
 * with the same dashed border as "Reset demo", so they read as demo controls, not the interface.
 * Every jump sends Problem Set 6 (`skipFixture`) and opens it on the iPad, from his Classroom too (ticket 264).
 * Once the teacher has pressed +Homework (ticket 295), "send homework" and "homework open" follow: each a step from the demo
 * as it stands (`homeworkJump`), taking the iPad to his Classroom, where the Future panel and To do show them.
 */
function jump(t: SkipTarget) {
  const { session, classroom } = skipFixture(t, Date.now());
  // A rebuild from nothing, except the +Homework mark: only Reset demo takes the homework jumps away.
  setLesson({ classroom: keepHomeworkStarted(getClassroom(), classroom), session });
}

const BUTTON = "rounded-full px-2.5 py-1 text-[12px] whitespace-nowrap text-ink-muted transition-colors hover:bg-cream-deep hover:text-ink";

export default function SkipTo() {
  const router = useRouter();
  const pathname = usePathname();
  const classroom = useClassroom();
  const set = studentSetHref(LIVE_ASSIGNMENT_ID);
  const go = (href: string) => {
    if (pathname !== href) router.push(href);
  };
  return (
    <div className="fixed bottom-4 left-4 z-40 flex items-center gap-1.5 rounded-full border border-dashed border-line-strong bg-paper/80 px-2 py-1 backdrop-blur" data-skip-to>
      <span className="pl-1.5 text-[11px] uppercase tracking-wide text-ink-muted">skip to</span>
      {SKIP_TARGETS.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => {
            jump(t);
            go(set);
          }}
          data-skip={t}
          className={BUTTON}
        >
          {t}
        </button>
      ))}
      {homeworkSkipsShown(classroom) &&
        HOMEWORK_SKIP_TARGETS.map((t: HomeworkSkipTarget) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              homeworkJump(t);
              go(STUDENT_CLASSROOM_HREF);
            }}
            data-skip={t}
            className={BUTTON}
          >
            {t}
          </button>
        ))}
    </div>
  );
}
