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
import { dispatchClassroom, useAssignment, useClassroom } from "@/lib/classroom-store";
import { isDue, isPending, isProjecting } from "@/lib/classroom";
import FrozenScreen from "./screens/FrozenScreen";
import { useNow } from "@/lib/store";
import { ASSIGNMENT } from "@/data/assignment";
import type { Pathway, Stage } from "@/data/types";
import type { RunKindParam } from "@/lib/session";
import WaitingScreen from "./screens/WaitingScreen";
import PeerScreen from "./screens/PeerScreen";
import HistoryScreen from "./screens/HistoryScreen";
import DiagnosticModal from "./screens/DiagnosticModal";

const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

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
  const classroom = useClassroom();
  const now = useNow();
  const advance = classroom.advance;
  const counting = isPending(classroom, now);
  const due = isDue(classroom, now) && advance && !session.appliedAdvances.includes(advance.id);
  useEffect(() => {
    // The grace ran out: apply the teacher's advance once (the reducer ignores repeats by id).
    if (due && advance) dispatch({ type: "advance/apply", id: advance.id, kind: advance.kind, at: now });
  }, [due, advance, now]);
  const projecting = isProjecting(classroom);
  const frozen = session.stage === "frozen";
  useEffect(() => {
    // Whole-class review: once the grace is over, every student tab is frozen (a late-opened tab too); ending releases to the report.
    if (projecting && !counting && !frozen) dispatch({ type: "freeze" });
    if (!projecting && frozen) dispatch({ type: "release" });
  }, [projecting, counting, frozen]);
  const crumb = CRUMB[session.stage] ?? (["working", "feedback", "waiting", "frozen"].includes(session.stage) ? title : ASSIGNMENT.className);
  return (
    <IpadStage>
      <StudentChrome crumb={crumb} frozen={frozen}>
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
        {session.stage === "frozen" && <FrozenScreen session={session} />}
        {session.stage === "rework" && <ReworkScreen session={session} dispatch={dispatch} />}
        {session.stage === "group-pass" && <GroupPassScreen session={session} dispatch={dispatch} />}
        {session.stage === "group-discuss" && <GroupDiscussScreen session={session} dispatch={dispatch} />}
        {session.stage === "report" && <ReportScreen session={session} dispatch={dispatch} />}
        {session.stage === "peers" && <PeerScreen onBack={() => dispatch({ type: "peers/close" })} />}
        {session.stage === "history" && <HistoryScreen session={session} onBack={() => dispatch({ type: "history/close" })} />}
        {counting && advance && (
          <div className="pointer-events-none absolute inset-x-0 top-[33px] z-20 flex justify-center px-8" data-countdown>
            <div className="flex items-center gap-3 rounded-full border border-accent-line bg-accent-soft px-4 py-1.5 text-[13.5px] text-ink shadow-card">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden />
              Your teacher is moving the class on in {mmss(advance.deadline - now)}
            </div>
          </div>
        )}
        {session.notice && !frozen && (
          <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center px-8" data-notice>
            <div className="flex items-center gap-4 rounded-full border border-accent-line bg-paper px-5 py-2.5 text-[14px] text-ink shadow-lift">
              <span>{session.notice}</span>
              <button type="button" className="text-ink-muted hover:text-ink" onClick={() => dispatch({ type: "notice/dismiss" })} aria-label="Dismiss" data-notice-dismiss>
                ✕
              </button>
            </div>
          </div>
        )}
        {session.diagnostic && !frozen && (
          <DiagnosticModal questionId={session.diagnostic.questionId} recorded={session.diagnostic.recorded} onAnswer={(option) => dispatch({ type: "diagnostic/answer", option })} />
        )}
      </StudentChrome>
    </IpadStage>
  );
}
