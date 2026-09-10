"use client";

import IpadStage from "@/components/IpadStage";
import StudentChrome from "./StudentChrome";
import OverviewScreen from "./screens/OverviewScreen";
import PracticeScreen from "./screens/PracticeScreen";
import WarmupPickScreen from "./screens/WarmupPickScreen";
import ConfidenceScreen from "./screens/ConfidenceScreen";
import WorkingScreen from "./screens/WorkingScreen";
import FeedbackScreen from "./screens/FeedbackScreen";
import GroupBoardScreen from "./screens/GroupBoardScreen";
import { groupPlan } from "@/lib/group";
import { penHolder, turnScript } from "@/lib/groupReview";
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
import ClassWaitScreen from "./screens/ClassWaitScreen";
import { classReadiness } from "@/lib/readiness";
import { DEMO_STUDENT } from "@/data/assignment";
import PeerScreen from "./screens/PeerScreen";
import HistoryScreen from "./screens/HistoryScreen";
import DiagnosticModal from "./screens/DiagnosticModal";
import SkipTo from "@/components/SkipTo";

const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const CRUMB: Partial<Record<Stage, string>> = {
  "warmup-pick": "Warm-up",
  practice: "Warm-up",
  confidence: "Before you start",
  "class-wait": "Group review",
  group: "Group review",
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
  const atGate = session.stage === "class-wait";
  const arrived = classroom.arrivals?.[DEMO_STUDENT.id] !== undefined;
  const started = classReadiness(classroom, now).started;
  useEffect(() => {
    // The gate into group review: record the arrival once; go in the moment the class is in (or the teacher started it).
    if (atGate && !arrived) dispatchClassroom({ type: "class/arrive", student: DEMO_STUDENT.id, at: now });
    if (atGate && arrived && started) dispatch({ type: "group/start" });
  }, [atGate, arrived, started, now]);
  // The shared whiteboard: begin the run on arrival; while a peer holds the pen, play their scripted turn (each event once, by index).
  const onBoard = session.stage === "group";
  const board = classroom.group ?? null;
  useEffect(() => {
    if (!onBoard) return;
    if (!board) {
      const plan = groupPlan(session);
      dispatchClassroom({ type: "group/begin", members: plan.members.map((m) => m.id), problems: plan.discussion.problems.map((p) => p.id), at: now });
      return;
    }
    if (board.done) {
      dispatch({ type: "group/done" });
      return;
    }
    const holder = penHolder(board);
    if (!holder || holder === DEMO_STUDENT.id) return;
    const events = turnScript(board.problems[board.index]);
    const next = events[board.scriptDone];
    if (next && now >= board.turnStartedAt + next.at) dispatchClassroom({ type: "group/scripted", index: board.scriptDone, event: next });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onBoard, board, now]);
  const projecting = isProjecting(classroom);
  const frozen = session.stage === "frozen";
  useEffect(() => {
    // Whole-class review: once the grace is over, every student tab is frozen (a late-opened tab too); ending releases to the report.
    if (projecting && !counting && !frozen) dispatch({ type: "freeze" });
    if (!projecting && frozen) dispatch({ type: "release" });
  }, [projecting, counting, frozen]);
  const crumb = CRUMB[session.stage] ?? (["working", "feedback", "waiting", "frozen"].includes(session.stage) ? title : ASSIGNMENT.className);
  const groupStartPill = counting && advance?.kind === "group-start";
  return (
    <IpadStage>
      <StudentChrome crumb={crumb} frozen={frozen}>
        {session.stage === "overview" && (
          <OverviewScreen onPractice={() => dispatch({ type: "practice/accept" })} onStart={() => dispatch({ type: "practice/decline" })} />
        )}
        {session.stage === "warmup-pick" && <WarmupPickScreen session={session} dispatch={dispatch} />}
        {session.stage === "practice" && <PracticeScreen session={session} dispatch={dispatch} />}
        {session.stage === "confidence" && (
          <ConfidenceScreen practice={session.practice} onSubmit={(confidence) => dispatch({ type: "confidence/set", confidence })} />
        )}
        {session.stage === "working" && <WorkingScreen session={session} dispatch={dispatch} />}
        {session.stage === "feedback" && <FeedbackScreen session={session} dispatch={dispatch} />}
        {session.stage === "waiting" && <WaitingScreen />}
        {session.stage === "class-wait" && <ClassWaitScreen />}
        {session.stage === "frozen" && <FrozenScreen session={session} dispatch={dispatch} />}
        {session.stage === "group" && <GroupBoardScreen session={session} />}
        {session.stage === "report" && <ReportScreen session={session} dispatch={dispatch} />}
        {session.stage === "peers" && <PeerScreen onBack={() => dispatch({ type: "peers/close" })} />}
        {session.stage === "history" && <HistoryScreen session={session} onBack={() => dispatch({ type: "history/close" })} />}
        {counting && advance && (
          <div className="pointer-events-none absolute inset-x-0 top-[33px] z-20 flex justify-center px-8" data-countdown>
            <div className="flex items-center gap-3 rounded-full border border-accent-line bg-accent-soft px-4 py-1.5 text-[13.5px] text-ink shadow-card">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden />
              {groupStartPill ? "Group review starts in" : "Your teacher is moving the class on in"} {mmss(advance.deadline - now)}
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
          <DiagnosticModal questionId={session.diagnostic.questionId} recorded={session.diagnostic.recorded} question={session.diagnostic.question} onAnswer={(option) => dispatch({ type: "diagnostic/answer", option })} />
        )}
      </StudentChrome>
      <SkipTo />
    </IpadStage>
  );
}
