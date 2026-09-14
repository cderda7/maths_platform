import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import type { Pathway, ReviewStage } from "@/data/types";
import { classroomReducer, GRACE_MS, INITIAL_CLASSROOM, lessonOver, pathwayOf, type ClassroomAction, type ClassroomState } from "./classroom";
import { currentClassStage, type ClassStageId } from "./classStage";
import { DEFAULT_PATHWAY } from "./pathway";
import { candidatesFor, problemsByStruggle, suggestExamples } from "./examples";
import { DEMO_REFLECTION, INITIAL_SESSION, reworkedSession, scriptedSession, sessionAt, type StudentSession } from "./session";
import { LAST_ARRIVAL_MS } from "./readiness";
import { groupPlan } from "./group";
import { liveAbsent } from "./absence";
import { DEMO_PENS, GROUP_SCRIPTS } from "@/data/group-scripts";
import { beginRun, checkBoard, type GroupRun } from "./groupReview";
import { boardOpensAt } from "./groupIntro";

/**
 * Presenter shortcuts, not product: jump the demo to a moment in Sam's run. Every jump rebuilds the
 * classroom (the full three-stage pathway, no whole-class session) and installs the scripted
 * session for that moment, so what Sam submitted is always the same. Pure: the strip applies the
 * result through the stores.
 */
export type SkipTarget = "start" | "warm-up" | "working" | "indiv review" | "class wait" | "group review" | "class review" | "report" | "homework";

export const SKIP_TARGETS: SkipTarget[] = ["start", "warm-up", "working", "indiv review", "class wait", "group review", "class review", "report", "homework"];

/** Every review stage, so any of the three jumps has somewhere to land. */
export const DEMO_PATHWAY: Pathway = ["individual", "group", "whole-class"];

/** The gate long since opened: Sam arrived before the last scripted classmate, so everyone is in. */
const everyoneIn = (c: ClassroomState, now: number) => classroomReducer(c, { type: "class/arrive", student: DEMO_STUDENT.id, at: now - LAST_ARRIVAL_MS - 1000 });

/** How many problems the whole-class jump projects: the two the class struggled with most. */
const PROJECTED = 2;

/** Class review as the teacher's setup would suggest it from `session`: the most-struggled problems in set order, suggested examples, screens frozen. */
function suggestedSetup(session: StudentSession, absent: readonly string[]): ClassroomAction {
  const problems = problemsByStruggle(session, absent)
    .slice(0, PROJECTED)
    .map((r) => r.problem.id);
  const ordered = ASSIGNMENT.problems.map((p) => p.id).filter((id) => problems.includes(id));
  const examples = Object.fromEntries(ordered.map((id) => [id, suggestExamples(candidatesFor(id, session, absent))]));
  return { type: "wc/setup", problems: ordered, examples, mode: "frozen" };
}

/**
 * The report jump's group review, already run: begun ten minutes ago, the problems closing a minute
 * apart, finished six minutes in. Each problem's attempts are its script; a problem whose script never
 * checks correct (Q7, ticket 222) was left for now and closed unsolved on its return, last.
 */
export const REPORT_RUN_STARTED_AGO_MS = 10 * 60_000;
export const REPORT_RUN_FINISHED_AGO_MS = 4 * 60_000;
function finishedRun(session: StudentSession, now: number, absent: readonly string[]): GroupRun {
  const plan = groupPlan(session, absent);
  const problems = plan.discussion.problems.map((p) => p.id);
  const startedAt = now - REPORT_RUN_STARTED_AGO_MS;
  const finishedAt = now - REPORT_RUN_FINISHED_AGO_MS;
  const step = problems.length > 1 ? (finishedAt - startedAt) / problems.length : 0;
  const run = beginRun(
    plan.members.map((m) => m.id),
    problems,
    startedAt,
    undefined,
    DEMO_PENS,
  );
  const attempts = Object.fromEntries(problems.map((p) => [p, (GROUP_SCRIPTS[p]?.attempts ?? []).map((lines) => ({ lines, correct: checkBoard(p, lines).correct }))]));
  const unsolved = problems.filter((p) => (attempts[p]?.length ?? 0) > 0 && !attempts[p].some((a) => a.correct));
  const closing = [...problems.filter((p) => !unsolved.includes(p)), ...unsolved];
  const at = (i: number) => (i === closing.length - 1 ? finishedAt : Math.round(startedAt + step * (i + 1)));
  const moments = Object.fromEntries(closing.map((p, i) => [p, at(i)]));
  const resolved = closing.filter((p) => !unsolved.includes(p));
  return {
    ...run,
    attempts,
    index: Math.max(0, problems.length + unsolved.length - 1),
    resolved,
    resolvedAt: Object.fromEntries(resolved.map((p) => [p, moments[p]])),
    left: unsolved,
    unsolved,
    unsolvedAt: Object.fromEntries(unsolved.map((p) => [p, moments[p]])),
    turnStartedAt: finishedAt,
    done: true,
  };
}

/**
 * A skip jumps past the teacher's Create (ticket 188): Problem Set 6 exists, and went live this long
 * before the jump, so a stream counted from its start (ticket 189) is long over.
 */
export const SKIP_STARTED_AGO_MS = 60 * 60_000;

/**
 * Problem Set 6 sent by a presenter jump rather than the teacher's Create: the fixture's problems and goal
 * under `pathway`, created at `now` and live since `startedAt` (a skip's hour ago unless given).
 */
export function demoSend(pathway: Pathway, now: number, startedAt = now - SKIP_STARTED_AGO_MS): ClassroomAction {
  return { type: "assignment/create", title: ASSIGNMENT.title, problemIds: ASSIGNMENT.problems.map((p) => p.id), pathway: [...pathway], goal: ASSIGNMENT.goal, at: now, startedAt };
}

/**
 * What a deep link into the student app (`/student/a/pset-6?stage=…&run=…&pathway=…`) does to the classroom
 * before the run starts (ticket 264: a fresh demo has not sent Problem Set 6). `?pathway=` sends the set
 * with that pathway, live from now, whatever is there (as before ticket 264). A named stage sends the
 * set only when nothing is sent yet, under the pathway a run read before any set was sent
 * (`DEFAULT_PATHWAY`) and live for an hour like a skip, so the classmates are where they were; a set
 * already sent stays as it is. A plain link changes nothing.
 */
export function deepLinkClassroom(c: ClassroomState, link: { explicit: boolean; pathway: Pathway | null }, now: number): ClassroomState {
  if (link.pathway) return classroomReducer(c, demoSend(link.pathway, now, now));
  if (link.explicit && !c.assignment) return classroomReducer(c, demoSend(DEFAULT_PATHWAY, now));
  return c;
}

export function skipFixture(target: SkipTarget, now: number): { session: StudentSession; classroom: ClassroomState } {
  let classroom = classroomReducer(INITIAL_CLASSROOM, demoSend(DEMO_PATHWAY, now));
  switch (target) {
    case "start":
      return { session: INITIAL_SESSION, classroom };
    case "warm-up":
      return { session: sessionAt("warmup-chat"), classroom };
    case "working":
      return { session: sessionAt("working"), classroom };
    case "indiv review":
      return { session: sessionAt("feedback"), classroom };
    case "class wait":
      // Sam has just handed in corrections: the classmates' scripted arrivals start now.
      return { session: sessionAt("class-wait"), classroom: classroomReducer(classroom, { type: "class/arrive", student: DEMO_STUDENT.id, at: now }) };
    case "group review": {
      // The class has just gone in: the intro is read first, then the board opens (ticket 220).
      const session = sessionAt("group");
      const c = everyoneIn(classroom, now);
      const plan = groupPlan(session, liveAbsent(c));
      return { session, classroom: classroomReducer(c, { type: "group/begin", members: plan.members.map((m) => m.id), problems: plan.discussion.problems.map((p) => p.id), at: boardOpensAt(now), pens: DEMO_PENS }) };
    }
    case "report": {
      // Group review is behind the class: the standings hold on the board with the demo group's run finished.
      const session = sessionAt("report");
      return { session, classroom: { ...everyoneIn(classroom, now), group: finishedRun(session, now, liveAbsent(classroom)) } };
    }
    case "homework": {
      // The report's moment with the reflection just sent: the homework sequence plays from the jump (ticket 256).
      const session = { ...sessionAt("homework"), homeworkAt: now };
      return { session, classroom: { ...everyoneIn(classroom, now), group: finishedRun(session, now, liveAbsent(classroom)) } };
    }
    case "class review": {
      // The teacher's setup, as it would be done from the reworked run: the most-struggled problems, suggested examples, projected with the grace already over.
      const session = { ...reworkedSession(), stage: "frozen" as const };
      classroom = classroomReducer(everyoneIn(classroom, now), suggestedSetup(session, liveAbsent(classroom)));
      classroom = classroomReducer(classroom, { type: "wc/project", at: now - GRACE_MS - 1000 });
      return { session, classroom };
    }
  }
}

/**
 * The teacher's presenter jumps (ticket 263), beside Sam's: the lesson moved for the whole class at once. Unlike Sam's
 * skips, which rebuild the demo from nothing, each is a pure step from the classroom and session as they are, so what
 * the teacher set up stays (the pathway Create chose, the seating, the students marked absent, a class review already
 * set up) and only the lesson moves. Every surface reads the result: the teacher's screens, the board, Sam's iPad and
 * his Classroom.
 *
 * - `send`: Problem Set 6 sent now under the demo pathway, the classmates' stream from zero, Sam at his run's start
 *   (PS6 in his To do). A new lesson: whatever an earlier one left goes (`assignment/create`).
 * - `done`: the stage the class is on (`currentClassStage`, by the pathway in force) ends for every student in the room.
 *   The class goes into the next stage of the pathway, Sam with his scripted work: individual review on his hand-in,
 *   group review at its intro with everyone through the gate, class review projected from the teacher's setup (or the
 *   suggested one) with the grace over. On the last stage, and on a lesson already over, it is `completed`. Nothing
 *   before the set is sent (`canTeacherSkip`).
 * - `completed`: every stage over (group review run, class review ended, `lessonEndedAt` stamped), Sam's report sent
 *   with its reflection and his homework playing from the jump: PS6 in the teacher's Past and Sam's Completed. Sends
 *   the set first when nothing is sent, as Sam's skips do. A lesson already completed stays as it is.
 */
export type TeacherSkipTarget = "send" | "done" | "completed";

export const TEACHER_SKIP_TARGETS: TeacherSkipTarget[] = ["send", "done", "completed"];

export const TEACHER_SKIP_LABEL: Record<TeacherSkipTarget, string> = { send: "send assignment", done: "students done with current stage", completed: "activity completed" };

export interface DemoState {
  classroom: ClassroomState;
  session: StudentSession;
}

/** Whether a teacher jump has anything to do: "students done" waits for a set to be sent. */
export const canTeacherSkip = (target: TeacherSkipTarget, c: ClassroomState): boolean => target !== "done" || !!c.assignment;

/** Sam's scripted work once handed in, as the pathway has it: corrected when individual review is on it, as handed in when it is not. */
const handedInWork = (pathway: Pathway): StudentSession => (pathway.includes("individual") ? reworkedSession() : scriptedSession());

/** The classmates' stream at its end (ticket 189): the set live long enough that every event has landed, so no arrival glows in the future. */
function streamOver(c: ClassroomState, now: number): ClassroomState {
  const a = c.assignment;
  if (!a) return c;
  const startedAt = Math.min(a.startedAt ?? a.createdAt, now - SKIP_STARTED_AGO_MS);
  return { ...c, assignment: { ...a, startedAt } };
}

/** Through the gate: Sam in before the last scripted classmate, so the whole class in the room is in (an earlier arrival stands). */
function throughGate(c: ClassroomState, now: number): ClassroomState {
  const at = now - LAST_ARRIVAL_MS - 1000;
  const prev = c.arrivals?.[DEMO_STUDENT.id];
  return prev !== undefined && prev <= at ? c : { ...c, arrivals: { ...(c.arrivals ?? {}), [DEMO_STUDENT.id]: at } };
}

/** Group review behind the class: a run the class finished stands, anything else is the scripted run, finished. */
const groupOver = (c: ClassroomState, session: StudentSession, now: number): GroupRun => (c.group?.done ? c.group : finishedRun(session, now, liveAbsent(c)));

/** The class's stages in order: the working, then the pathway's review stages. */
const stagesOf = (c: ClassroomState): ClassStageId[] => ["working", ...pathwayOf(c)];

/** The class, and Sam, into a review stage of the pathway, everything before it over. */
function enter(stage: ReviewStage, c: ClassroomState, now: number): DemoState {
  const pathway = pathwayOf(c);
  const before = { ...streamOver(c, now), advance: null };
  switch (stage) {
    case "individual":
      // Sam's hand-in moves the class into individual review; the classmates' corrections arrive from it.
      return { classroom: before, session: sessionAt("feedback") };
    case "group": {
      // Everyone through the gate and the class just gone in: the intro is read first, then the board opens (ticket 220).
      const session = { ...handedInWork(pathway), stage: "group" as const };
      const c2 = throughGate(before, now);
      const plan = groupPlan(session, liveAbsent(c2));
      return { session, classroom: classroomReducer({ ...c2, group: null }, { type: "group/begin", members: plan.members.map((m) => m.id), problems: plan.discussion.problems.map((p) => p.id), at: boardOpensAt(now), pens: DEMO_PENS }) };
    }
    case "whole-class": {
      // Projected with the grace over: the teacher's own setup when there is one, else the suggested one.
      const session = { ...handedInWork(pathway), stage: "frozen" as const };
      let c2: ClassroomState = pathway.includes("group") ? { ...throughGate(before, now), group: groupOver(c, session, now) } : before;
      if (c2.wholeClass?.status !== "setup") c2 = classroomReducer(c2, suggestedSetup(session, liveAbsent(c2)));
      return { session, classroom: classroomReducer(c2, { type: "wc/project", at: now - GRACE_MS - 1000 }) };
    }
  }
}

function completeLesson(c: ClassroomState, session: StudentSession | null, now: number): DemoState {
  const sent = c.assignment ? c : classroomReducer(c, demoSend(DEMO_PATHWAY, now));
  if (session?.reportSent && lessonOver(sent)) return { classroom: sent, session };
  const pathway = pathwayOf(sent);
  const sam: StudentSession = session?.reportSent ? session : { ...handedInWork(pathway), stage: "homework", reflection: DEMO_REFLECTION, reportSent: true, homeworkAt: now };
  let next: ClassroomState = { ...streamOver(sent, now), advance: null, lessonEndedAt: sent.lessonEndedAt ?? now };
  if (pathway.includes("group")) next = { ...throughGate(next, now), group: groupOver(sent, sam, now) };
  if (pathway.includes("whole-class")) {
    if (!next.wholeClass) next = classroomReducer(next, suggestedSetup(sam, liveAbsent(next)));
    next = classroomReducer(next, { type: "wc/end" });
  }
  return { classroom: next, session: sam };
}

/** A teacher jump applied to the demo as it stands. Pure: the bar writes the result through the stores. */
export function teacherSkip(target: TeacherSkipTarget, c: ClassroomState, session: StudentSession | null, now: number): DemoState {
  switch (target) {
    case "send":
      return { classroom: classroomReducer(c, demoSend(DEMO_PATHWAY, now, now)), session: INITIAL_SESSION };
    case "done": {
      if (!canTeacherSkip("done", c)) return { classroom: c, session: session ?? INITIAL_SESSION };
      const current = currentClassStage(c, session, now);
      const stages = stagesOf(c);
      const next = current === null ? undefined : stages[stages.indexOf(current) + 1];
      return next === undefined || next === "working" ? completeLesson(c, session, now) : enter(next, c, now);
    }
    case "completed":
      return completeLesson(c, session, now);
  }
}
