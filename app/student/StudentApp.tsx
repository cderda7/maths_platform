"use client";

import IpadStage from "@/components/IpadStage";
import StudentChrome from "./StudentChrome";
import OverviewScreen from "./screens/OverviewScreen";
import GoalScreen from "./screens/GoalScreen";
import PracticeScreen from "./screens/PracticeScreen";
import WarmupChatScreen from "./screens/WarmupChatScreen";
import ConfidenceScreen from "./screens/ConfidenceScreen";
import WorkingScreen from "./screens/WorkingScreen";
import FeedbackScreen from "./screens/FeedbackScreen";
import GroupBoardScreen from "./screens/GroupBoardScreen";
import { groupPlan } from "@/lib/group";
import { penHolder, turnScript } from "@/lib/groupReview";
import { PEER_DEBRIEF_MS } from "@/lib/debrief";
import ReportScreen from "./screens/ReportScreen";
import { useEffect } from "react";
import { dispatch, useStudentSession } from "@/lib/store";
import { dispatchClassroom, useAssignment, useClassroom } from "@/lib/classroom-store";
import { GRACE_MS, isDue, isPending, isProjecting, openDiagnostic, pathwayOf } from "@/lib/classroom";
import { pathwayStages } from "@/lib/classStage";
import FrozenScreen from "./screens/FrozenScreen";
import { useNow } from "@/lib/store";
import { ASSIGNMENT } from "@/data/assignment";
import type { Pathway, Stage } from "@/data/types";
import { warmupOffered, type RunKindParam } from "@/lib/session";
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

// `null` is no crumb at all: the pathway strip's lit pill already names the group review (ticket 164),
// so a "Group review" beside the wordmark read the stage twice; the class name would be the wrong third.
const CRUMB: Partial<Record<Stage, string | null>> = {
  "warmup-chat": "Warm-up",
  practice: "Warm-up",
  "class-wait": null,
  group: null,
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
    if (pathway) dispatchClassroom({ type: "assignment/create", title: ASSIGNMENT.title, problemIds: ASSIGNMENT.problems.map((p) => p.id), pathway, goal: ASSIGNMENT.goal });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const session = useStudentSession(initStage, explicit, run);
  const { title, goal } = useAssignment();
  const classroom = useClassroom();
  const now = useNow();
  const advance = classroom.advance;
  const counting = isPending(classroom, now);
  const due = isDue(classroom, now) && advance && !session.appliedAdvances.includes(advance.id);
  useEffect(() => {
    // The grace ran out: apply the teacher's advance once (the reducer ignores repeats by id). Ending group review also ends the
    // classroom's shared run where it stands (idempotent), so the board and the race hold.
    if (due && advance) {
      dispatch({ type: "advance/apply", id: advance.id, kind: advance.kind, at: now });
      if (advance.kind === "force-group") dispatchClassroom({ type: "group/end", at: now });
    }
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
    const resolvedAt = board.resolvedAt?.[board.problems[board.index]];
    if (resolvedAt !== undefined) {
      // Resolved: the next pen-holder's first stroke moves the group on. A peer's comes after their own debrief; Sam's is his Next.
      const nextHolder = board.pen[board.problems[board.index + 1] ?? ""];
      const last = board.index >= board.problems.length - 1;
      if ((last || nextHolder !== DEMO_STUDENT.id) && now >= resolvedAt + PEER_DEBRIEF_MS) dispatchClassroom({ type: "group/next", at: now });
      return;
    }
    const holder = penHolder(board);
    if (!holder || holder === DEMO_STUDENT.id) return;
    const events = turnScript(board.problems[board.index]);
    const next = events[board.scriptDone];
    if (next && now >= board.turnStartedAt + next.at) dispatchClassroom({ type: "group/scripted", index: board.scriptDone, event: next, at: board.turnStartedAt + next.at });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onBoard, board, now]);
  const projecting = isProjecting(classroom);
  const frozen = session.stage === "frozen";
  // A teacher's diagnostic (ticket 137) lives on the classroom, not the session: pushed to every student, answered here.
  const diagnostic = openDiagnostic(classroom);
  useEffect(() => {
    // Whole-class review: once the grace is over, every student tab is frozen (a late-opened tab too); ending releases to the report.
    if (projecting && !counting && !frozen) dispatch({ type: "freeze" });
    if (!projecting && frozen) dispatch({ type: "release" });
  }, [projecting, counting, frozen]);
  const named = CRUMB[session.stage];
  const crumb = named !== undefined ? named : ["working", "feedback", "waiting", "frozen"].includes(session.stage) ? title : ASSIGNMENT.className;
  // Individual review forced with group review next: what the student is waiting for is the group.
  const groupStartPill = counting && advance?.kind === "force-review" && pathwayOf(classroom).includes("group");
  // The header's pathway strip (ticket 151): the same stages the teacher's Pathway card lights, from the same function.
  const stages = pathwayStages(classroom, session, now);
  return (
    <IpadStage>
      <StudentChrome crumb={crumb} frozen={frozen} stages={stages}>
        {session.stage === "overview" && (
          <OverviewScreen onStart={() => dispatch({ type: "overview/start" })} />
        )}
        {session.stage === "goal" && <GoalScreen goal={goal} onContinue={() => dispatch({ type: "goal/continue" })} />}
        {session.stage === "warmup-chat" && <WarmupChatScreen session={session} dispatch={dispatch} />}
        {session.stage === "practice" && <PracticeScreen session={session} dispatch={dispatch} />}
        {session.stage === "confidence" && (
          <ConfidenceScreen
            answered={warmupOffered(session) ? session.confidence : null}
            onSubmit={(confidence) => dispatch({ type: "confidence/set", confidence })}
            onWarmup={() => dispatch({ type: "warmup/accept" })}
            onStart={() => dispatch({ type: "warmup/decline" })}
          />
        )}
        {session.stage === "working" && <WorkingScreen session={session} dispatch={dispatch} />}
        {session.stage === "feedback" && <FeedbackScreen session={session} dispatch={dispatch} />}
        {session.stage === "waiting" && <WaitingScreen />}
        {session.stage === "class-wait" && <ClassWaitScreen />}
        {session.stage === "frozen" && <FrozenScreen session={session} dispatch={dispatch} />}
        {session.stage === "group" && <GroupBoardScreen session={session} dispatch={dispatch} />}
        {session.stage === "report" && <ReportScreen session={session} dispatch={dispatch} />}
        {session.stage === "peers" && <PeerScreen onBack={() => dispatch({ type: "peers/close" })} />}
        {session.stage === "history" && <HistoryScreen session={session} onBack={() => dispatch({ type: "history/close" })} />}
        {counting && advance && (
          <div className="pointer-events-none absolute inset-x-0 top-[33px] z-20 flex justify-center px-8" data-countdown>
            <div className="flex items-center gap-3 rounded-full border border-accent-line bg-accent-soft px-4 py-1.5 text-[13.5px] text-ink shadow-card">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden />
              {groupStartPill ? "Group review starts in" : "Your teacher is moving the class on in"} {mmss(Math.min(GRACE_MS, advance.deadline - now))}
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
        {diagnostic && !frozen && (
          <DiagnosticModal questionId={diagnostic.questionId} question={diagnostic.question} onAnswer={(option) => dispatchClassroom({ type: "diagnostic/answer", option })} />
        )}
      </StudentChrome>
      <SkipTo />
    </IpadStage>
  );
}
