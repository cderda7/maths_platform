"use client";

import IpadStage from "@/components/IpadStage";
import StudentChrome from "./StudentChrome";
import OverviewScreen from "./screens/OverviewScreen";
import PracticeScreen from "./screens/PracticeScreen";
import ConfidenceScreen from "./screens/ConfidenceScreen";
import WorkingScreen from "./screens/WorkingScreen";
import FeedbackScreen from "./screens/FeedbackScreen";
import ReworkScreen from "./screens/ReworkScreen";
import { GroupDiscussScreen, GroupPassScreen } from "./screens/GroupScreens";
import ReportScreen from "./screens/ReportScreen";
import { dispatch, useStudentSession } from "@/lib/store";
import { ASSIGNMENT } from "@/data/assignment";
import type { Stage } from "@/data/types";
import type { RunKindParam } from "@/lib/session";
import PeerScreen from "./screens/PeerScreen";
import HistoryScreen from "./screens/HistoryScreen";

const CRUMB: Partial<Record<Stage, string>> = {
  practice: "Warm-up",
  confidence: "Before you start",
  working: ASSIGNMENT.title,
  feedback: ASSIGNMENT.title,
  rework: "Rework on your own",
  "group-pass": "Group review",
  "group-discuss": "Group review",
  report: "Your report",
  peers: "Where the class is finding it hard",
  history: "Your working",
};

/**
 * The whole student side: one screen per stage, state in the shared demo session store so the
 * teacher tab sees the same run. `explicit` means the URL named a stage, which resets the run.
 */
export default function StudentApp({ initStage, explicit, run = "weak" }: { initStage: Stage; explicit: boolean; run?: RunKindParam }) {
  const session = useStudentSession(initStage, explicit, run);
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
        {session.stage === "group-pass" && <GroupPassScreen session={session} dispatch={dispatch} />}
        {session.stage === "group-discuss" && <GroupDiscussScreen session={session} dispatch={dispatch} />}
        {session.stage === "report" && <ReportScreen session={session} dispatch={dispatch} />}
        {session.stage === "peers" && <PeerScreen onBack={() => dispatch({ type: "peers/close" })} />}
        {session.stage === "history" && <HistoryScreen session={session} onBack={() => dispatch({ type: "history/close" })} />}
      </StudentChrome>
    </IpadStage>
  );
}
