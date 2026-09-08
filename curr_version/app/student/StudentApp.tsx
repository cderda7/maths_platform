"use client";

import IpadStage from "@/components/IpadStage";
import StudentChrome from "./StudentChrome";
import OverviewScreen from "./screens/OverviewScreen";
import PracticeScreen from "./screens/PracticeScreen";
import ConfidenceScreen from "./screens/ConfidenceScreen";
import WorkingScreen from "./screens/WorkingScreen";
import FeedbackScreen from "./screens/FeedbackScreen";
import ReworkScreen from "./screens/ReworkScreen";
import { dispatch, useStudentSession } from "@/lib/store";
import { ASSIGNMENT } from "@/data/assignment";
import type { Stage } from "@/data/types";

const CRUMB: Partial<Record<Stage, string>> = {
  practice: "Warm-up",
  confidence: "Before you start",
  working: ASSIGNMENT.title,
  feedback: ASSIGNMENT.title,
  rework: "Rework on your own",
  "group-pass": "Group review",
  "group-discuss": "Group review",
};

/**
 * The whole student side: one screen per stage, state in the shared demo session store so the
 * teacher tab sees the same run. `explicit` means the URL named a stage, which resets the run.
 */
export default function StudentApp({ initStage, explicit }: { initStage: Stage; explicit: boolean }) {
  const session = useStudentSession(initStage, explicit);
  return (
    <IpadStage>
      <StudentChrome crumb={CRUMB[session.stage] ?? ASSIGNMENT.className}>
        {session.stage === "overview" && (
          <OverviewScreen onPractice={() => dispatch({ type: "practice/accept" })} onStart={() => dispatch({ type: "practice/decline" })} />
        )}
        {session.stage === "practice" && <PracticeScreen onDone={() => dispatch({ type: "practice/finish" })} />}
        {session.stage === "confidence" && (
          <ConfidenceScreen practice={session.practice} onSubmit={(confidence) => dispatch({ type: "confidence/set", confidence })} />
        )}
        {session.stage === "working" && <WorkingScreen session={session} dispatch={dispatch} />}
        {session.stage === "feedback" && <FeedbackScreen session={session} dispatch={dispatch} />}
        {session.stage === "rework" && <ReworkScreen session={session} dispatch={dispatch} />}
        {session.stage === "group-pass" && (
          <div className="grid h-full place-items-center px-9">
            <div className="max-w-md text-center">
              <div className="font-display text-[30px] text-ink">Group review</div>
              <p className="mt-3 text-[14.5px] text-ink-soft">Opens here next.</p>
            </div>
          </div>
        )}
      </StudentChrome>
    </IpadStage>
  );
}
