"use client";

import { useRouter } from "next/navigation";
import StudentChrome from "./StudentChrome";
import OverviewScreen from "./screens/OverviewScreen";
import GoalScreen from "./screens/GoalScreen";
import PracticeScreen from "./screens/PracticeScreen";
import WarmupChatScreen from "./screens/WarmupChatScreen";
import ConfidenceScreen from "./screens/ConfidenceScreen";
import WorkingScreen from "./screens/WorkingScreen";
import FeedbackScreen from "./screens/FeedbackScreen";
import GroupBoardScreen from "./screens/GroupBoardScreen";
import ReportScreen from "./screens/ReportScreen";
import { useEffect } from "react";
import { dispatch, useStudentSession } from "@/lib/store";
import { dispatchClassroom, getClassroom, setClassroom, useAssignment, useClassroom } from "@/lib/classroom-store";
import { pathwayStages } from "@/lib/classStage";
import { crumbTitle } from "@/lib/crumbTitle";
import FrozenScreen from "./screens/FrozenScreen";
import { useNow } from "@/lib/store";
import type { Pathway, Stage } from "@/data/types";
import { warmupOffered, type RunKindParam } from "@/lib/session";
import WaitingScreen from "./screens/WaitingScreen";
import ClassWaitScreen from "./screens/ClassWaitScreen";
import { introShowing } from "@/lib/groupIntro";
import { DEMO_STUDENT } from "@/data/assignment";
import PeerScreen from "./screens/PeerScreen";
import HistoryScreen from "./screens/HistoryScreen";
import HomeworkScreen from "./screens/HomeworkScreen";
import { EscapeLayer } from "@/components/useEscape";
import { deepLinkClassroom } from "@/lib/demo";
import { STUDENT_CLASSROOM_HREF } from "@/lib/studentClassroom";

/**
 * A set on Sam's iPad (`/student/a/pset-6`, ticket 264): one screen per stage, state in the shared demo session
 * store so the teacher tab sees the same run. `explicit` means the URL named a stage, which resets the run. The
 * lesson's clockwork (advances, the gate, the whiteboard, class review's freeze, diagnostics) runs in the
 * iPad around it (`StudentShell`), so it keeps going on his Classroom too. A set not sent is not in his
 * Classroom: a deep link sends it first (`deepLinkClassroom`); otherwise the iPad goes back to the Classroom.
 */
export default function StudentApp({ initStage, explicit, run = "weak", pathway = null }: { initStage: Stage; explicit: boolean; run?: RunKindParam; pathway?: Pathway | null }) {
  const router = useRouter();
  useEffect(() => {
    // A deep link sends Problem Set 6 before the run starts: `?pathway=` with that pathway, a named stage when nothing is sent yet.
    const linked = deepLinkClassroom(getClassroom(), { explicit, pathway }, Date.now());
    if (linked !== getClassroom()) setClassroom(linked);
    // A named stage starts a fresh run at that stage: at the gate or on the board, that is a fresh group review, intro first (ticket 226).
    if (explicit && (initStage === "class-wait" || initStage === "group")) dispatchClassroom({ type: "group/restart", student: DEMO_STUDENT.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const session = useStudentSession(initStage, explicit, run);
  const { title, goal } = useAssignment();
  const classroom = useClassroom();
  const sent = !!classroom.assignment;
  useEffect(() => {
    // Not sent (never, or Reset demo in another tab): the set is not in his Classroom, so that is where the iPad goes. Read from the
    // store, not the render: on mount the deep link above has just sent it.
    if (!getClassroom().assignment) router.replace(STUDENT_CLASSROOM_HREF);
  }, [sent, router]);
  const now = useNow();
  // The group intro hides what each student got wrong, so a forced hand-in's "still contain a mistake" notice waits for the board (ticket 220).
  const onBoard = session.stage === "group";
  const board = classroom.group ?? null;
  const reading = onBoard && !!board && introShowing(board, now);
  const frozen = session.stage === "frozen";
  // The header's rule (ticket 168): the assignment title beside the wordmark on every screen. The pathway
  // strip names the stage, each screen's own heading names itself; the crumb is the one thing that never changes.
  // "PSET 6" rather than "PROBLEM SET 6" (ticket 236), so the whole title fits beside the four-stage strip.
  const crumb = crumbTitle(title);
  // The header's pathway strip (ticket 151): the same stages the teacher's Pathway card lights, from the same function.
  // Not on the report or the screens it opens (ticket 178): the pathway is behind the student there, so the
  // header's right end is the name and avatar alone and the space the strip took stays blank.
  const afterPathway = session.stage === "report" || session.stage === "peers" || session.stage === "history" || session.stage === "homework";
  const stages = afterPathway ? [] : pathwayStages(classroom, session, now);
  // Before the store is read on the client, a plain link cannot know whether the set is sent: nothing, rather than a flash of a set that is not his.
  if (!sent && !explicit && !pathway) return <StudentChrome frozen={frozen}>{null}</StudentChrome>;
  return (
    <StudentChrome crumb={crumb} frozen={frozen} stages={stages}>
      {session.stage === "overview" && <OverviewScreen onStart={() => dispatch({ type: "overview/start", at: Date.now() })} />}
      {session.stage === "goal" && <GoalScreen goal={goal} onContinue={() => dispatch({ type: "goal/continue", at: Date.now() })} />}
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
      {session.stage === "homework" && <HomeworkScreen session={session} />}
      {session.notice && !frozen && !reading && <EscapeLayer active onEscape={() => dispatch({ type: "notice/dismiss" })} />}
      {session.notice && !frozen && !reading && (
        <div className="absolute inset-x-0 bottom-6 z-20 flex justify-center px-8" data-notice>
          <div className="flex items-center gap-4 rounded-full border border-accent-line bg-paper px-5 py-2.5 text-[14px] text-ink shadow-lift">
            <span>{session.notice}</span>
            <button type="button" className="text-ink-muted hover:text-ink" onClick={() => dispatch({ type: "notice/dismiss" })} aria-label="Dismiss" data-notice-dismiss>
              ✕
            </button>
          </div>
        </div>
      )}
    </StudentChrome>
  );
}
