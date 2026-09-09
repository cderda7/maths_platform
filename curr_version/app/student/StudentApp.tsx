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
import { useEffect } from "react";
import { dispatch, useStudentSession } from "@/lib/store";
import { dispatchClassroom, useAssignment } from "@/lib/classroom-store";
import { ASSIGNMENT } from "@/data/assignment";
import type { Pathway, Stage } from "@/data/types";
import type { RunKindParam } from "@/lib/session";
import WaitingScreen from "./screens/WaitingScreen";
import PeerScreen from "./screens/PeerScreen";
import HistoryScreen from "./screens/HistoryScreen";
import DiagnosticModal from "./screens/DiagnosticModal";

const CRUMB: Partial<Record<Stage, string>> = {
  practice: "Warm-up",
  confidence: "Before you start",
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
export default function StudentApp({ initStage, explicit, run = "weak", pathway = null }: { initStage: Stage; explicit: boolean; run?: RunKindParam; pathway?: Pathway | null }) {
  useEffect(() => {
    // A `?pathway=` deep link creates the demo assignment with that pathway before the run starts.
    if (pathway) dispatchClassroom({ type: "assignment/create", title: ASSIGNMENT.title, problemIds: ASSIGNMENT.problems.map((p) => p.id), pathway });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const session = useStudentSession(initStage, explicit, run);
  const { title } = useAssignment();
  const crumb = CRUMB[session.stage] ?? (["working", "feedback", "waiting"].includes(session.stage) ? title : ASSIGNMENT.className);
  return (
    <IpadStage>
      <StudentChrome crumb={crumb}>
        {session.stage === "overview" && (
          <OverviewScreen onPractice={() => dispatch({ type: "practice/accept" })} onStart={() => dispatch({ type: "practice/decline" })} />
        )}
        {session.stage === "practice" && <PracticeScreen onDone={() => dispatch({ type: "practice/finish" })} />}
        {session.stage === "confidence" && (
          <ConfidenceScreen practice={session.practice} onSubmit={(confidence) => dispatch({ type: "confidence/set", confidence })} />
        )}
        {session.stage === "working" && <WorkingScreen session={session} dispatch={dispatch} />}
        {session.stage === "feedback" && <FeedbackScreen session={session} dispatch={dispatch} />}
        {session.stage === "waiting" && <WaitingScreen />}
        {session.stage === "rework" && <ReworkScreen session={session} dispatch={dispatch} />}
        {session.stage === "group-pass" && <GroupPassScreen session={session} dispatch={dispatch} />}
        {session.stage === "group-discuss" && <GroupDiscussScreen session={session} dispatch={dispatch} />}
        {session.stage === "report" && <ReportScreen session={session} dispatch={dispatch} />}
        {session.stage === "peers" && <PeerScreen onBack={() => dispatch({ type: "peers/close" })} />}
        {session.stage === "history" && <HistoryScreen session={session} onBack={() => dispatch({ type: "history/close" })} />}
        {session.notice && (
          <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center px-8" data-notice>
            <div className="flex items-center gap-4 rounded-full border border-accent-line bg-paper px-5 py-2.5 text-[14px] text-ink shadow-lift">
              <span>{session.notice}</span>
              <button type="button" className="text-ink-muted hover:text-ink" onClick={() => dispatch({ type: "notice/dismiss" })} aria-label="Dismiss" data-notice-dismiss>
                ✕
              </button>
            </div>
          </div>
        )}
        {session.diagnostic && (
          <DiagnosticModal questionId={session.diagnostic.questionId} recorded={session.diagnostic.recorded} onAnswer={(option) => dispatch({ type: "diagnostic/answer", option })} />
        )}
      </StudentChrome>
    </IpadStage>
  );
}
