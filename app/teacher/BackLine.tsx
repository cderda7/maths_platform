"use client";

import type { ReactNode } from "react";
import { BackToClassroom, useAssignmentBundle } from "./AssignmentContext";
import { DecisionDot, useLessonDecision } from "./DecisionCard";
import EndLesson from "./EndLesson";
import ForceSubmit from "./ForceSubmit";
import { PathwayPills } from "@/components/StagePill";
import { assignmentStages, currentStageOf } from "@/lib/assignments";
import { isEnding } from "@/lib/classroom";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { stagePillState } from "@/lib/classStage";
import type { StudentSession } from "@/lib/session";
import { useBatchedSession, useNow } from "@/lib/store";

/**
 * The first line of a set's Class View and Mistakes tab (ticket 334): "← Edexia Classroom" at its left, and on the live set
 * the lesson's pathway at its right, ending on the page column's right edge. Both tabs render this one line first in the
 * same frame, so every pill, arrow, force submit and count has the same rect from the window on either tab.
 *
 * The strip is the stages in order as `StagePill`s at the back button's 13.5 px, with the thin arrows between, and beside the
 * current stage: force submit (15 px, a size up), "n/total done", and end lesson on a last stage that is not class review.
 * While end lesson's minute runs, its countdown takes the place of all three. Class review has no count and no force submit,
 * so its pill stands alone; once the lesson is over every pill is over and nothing sits beside them. A finished set shows
 * no strip (its stages are all over, as the Pathway card was hidden on one, ticket 191).
 *
 * The row is the back button's own line: `items-start` keeps the button's top where it always was (ticket 268), and the strip
 * stretches to the row less the button's 4 px bottom margin, so it is centred on the button. `badge` is laid on the current
 * pill without moving anything. Unless the page passes its own, it is the lesson's decision tucked away by Later (ticket 335):
 * a dot whose press opens the card again.
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
  const beside = current && current.done !== null && (
    <span className="flex items-center gap-3 whitespace-nowrap" data-stage-note>
      {!ending && <ForceSubmit stage={current.id} session={session} />}
      {!ending && (
        <span className="text-[13.5px] leading-normal text-ink-muted" data-stage-count>
          <span className="tabular-nums">
            {current.done}/{current.total}
          </span>{" "}
          done
        </span>
      )}
      <EndLesson stage={current.id} session={session} notDone={Math.max(0, current.total - current.done)} />
    </span>
  );
  return (
    <div className="flex items-start justify-between gap-6" data-back-line>
      <BackToClassroom />
      {live && (
        <div className="flex items-center self-stretch pb-1" data-teacher-pathway>
          <PathwayPills stages={stages.map((s) => ({ id: s.id, state: stagePillState(s) }))} size="laptop" beside={beside} badge={badge ?? dot} />
        </div>
      )}
    </div>
  );
}
