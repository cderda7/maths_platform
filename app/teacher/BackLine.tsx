"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { BackToClassroom, useAssignmentBundle } from "./AssignmentContext";
import { DecisionDot, useLessonDecision } from "./DecisionCard";
import EndLesson from "./EndLesson";
import ForceSubmit from "./ForceSubmit";
import { PathwayPills } from "@/components/StagePill";
import { assignmentStages, currentStageOf } from "@/lib/assignments";
import { isEnding } from "@/lib/classroom";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { endsLesson, stagePillState } from "@/lib/classStage";
import type { StudentSession } from "@/lib/session";
import { useBatchedSession, useNow } from "@/lib/store";

/**
 * The first line of a set's Class View and Mistakes tab (ticket 334): "← Edexia Classroom" at its left, and on the live set
 * the lesson's pathway at its right, ending on the page column's right edge. Both tabs render this one line first in the
 * same frame, so every pill, arrow, force submit and count has the same rect from the window on either tab.
 *
 * The strip is the stages in order as `StagePill`s at the back button's 13.5 px, with the thin arrows between. Under the current
 * stage hang its two notes (over the pill, count on top, until ticket 358): the pill on top, force submit under it, "n/total
 * done" under that, all three centred on one another. Unlike the stack it replaced, this one takes real room — the strip and
 * this whole line grow by its height, and `--backline-h` (below) carries that growth to whatever is stuck under this row. End
 * lesson stays beside the pill, on a last stage that is not class review; while its minute runs, its countdown takes the place
 * of the stack. Class review has no count and no force submit, so its pill stands alone; once the lesson is over every pill is
 * over and nothing stands under or beside them. A finished set shows no strip (its stages are all over, as the Pathway card was
 * hidden on one, ticket 191).
 *
 * The row is the back button's own line: `items-start` keeps the button's top where it always was (ticket 268), and the strip
 * stretches to the row less the button's 4 px bottom margin, so it is centred on the button. `badge` is laid on the current
 * pill without moving anything. Unless the page passes its own, it is the lesson's decision tucked away by Later (ticket 335):
 * a dot whose press opens the card again.
 *
 * Pinned to the top of the chrome's scroll region (ticket 356), the same way Classroom's own heading is (`Classroom.tsx`,
 * ticket 216): "← Edexia Classroom" is the one constant across every stage and every tab (Class, Mistakes; Groups pins its
 * own bare button the same way), so a teacher scrolling a long roster or mistakes list never loses it. The wrapper bleeds
 * over the chrome's top and side padding and paints it back in (`-mx-6 -mt-12 bg-cream px-6 pt-12`) so nothing scrolling
 * under it shows through at the edges, then gives back nothing extra below: the row's own spacing to whatever follows is
 * unchanged, so scroll 0 looks exactly as it did before this stuck.
 *
 * Class View's roster head is its own `sticky top-0` (ticket 167): left alone, it would freeze at the same spot this
 * row does. A `ResizeObserver` publishes this row's own rendered height, undone by the frame's zoom (`getComputedStyle`'s
 * `zoom`, since `offsetHeight` already comes back scaled), as `--backline-h` on `[data-teacher-root]`; the roster head
 * reads it back for its own `top` so it stacks below this row instead of fighting it for the same pixels.
 */
export default function BackLine({ session, badge }: { session: StudentSession | null; badge?: ReactNode }) {
  const assignment = useAssignmentBundle();
  const classroom = useClassroom();
  const now = useNow();
  const live = assignment.kind === "live";
  const stages = live ? assignmentStages(assignment, classroom, session, now) : [];
  const current = currentStageOf(stages);
  const ending = isEnding(classroom, now);
  const { updatedAt } = useBatchedSession(3000);
  const decision = useLessonDecision(session, live && updatedAt !== null);
  const dot = decision?.shown === "dot" ? <DecisionDot view={decision} onPress={() => dispatchClassroom({ type: "decision/reopen", due: decision.due })} /> : undefined;
  const below = current && current.done !== null && !ending && (
    <>
      <ForceSubmit stage={current.id} session={session} />
      <span className="text-[13px] leading-none text-ink-muted" data-stage-count>
        <span className="tabular-nums">
          {current.done}/{current.total}
        </span>{" "}
        done
      </span>
    </>
  );
  const beside = current && current.done !== null && endsLesson(current.id, classroom) && (
    <span className="flex items-center whitespace-nowrap" data-stage-note>
      <EndLesson stage={current.id} session={session} notDone={Math.max(0, current.total - current.done)} />
    </span>
  );
  const pinnedRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = pinnedRef.current;
    const scope = el?.closest<HTMLElement>("[data-teacher-root]");
    if (!el || !scope) return;
    const sync = () => {
      const zoom = Number(getComputedStyle(scope).zoom) || 1;
      scope.style.setProperty("--backline-h", `${el.offsetHeight / zoom}px`);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      ro.disconnect();
      scope.style.removeProperty("--backline-h");
    };
  }, []);
  return (
    <div ref={pinnedRef} className="sticky top-0 z-10 -mx-6 -mt-12 bg-cream px-6 pt-12" data-back-line-pinned>
      <div className="flex items-start justify-between gap-6" data-back-line>
        <BackToClassroom />
        {live && (
          <div className="flex items-center self-stretch pb-1" data-teacher-pathway>
            <PathwayPills stages={stages.map((s) => ({ id: s.id, state: stagePillState(s) }))} size="laptop" below={below} beside={beside} badge={badge ?? dot} />
          </div>
        )}
      </div>
    </div>
  );
}
