import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import type { Pathway, ReviewStage } from "@/data/types";
import { classroomReducer, GRACE_MS, INITIAL_CLASSROOM, lessonOver, pathwayOf, unsent, type AssignmentDraft, type ClassroomAction, type ClassroomState } from "./classroom";
import { generatedDraft, generatedHomeworkDraft } from "./draft";
import { draftKey, type ReviewState } from "./review";
import { HOMEWORK_RECOMMENDATIONS, RECOMMENDATIONS } from "@/data/review";
import { homeworkSent } from "./create";
import { currentClassStage, type ClassStageId } from "./classStage";
import { DEFAULT_PATHWAY } from "./pathway";
import { candidatesFor, problemsByStruggle, suggestExamples } from "./examples";
import { DEMO_REFLECTION, INITIAL_SESSION, reworkedSession, scriptedSession, sessionAt, type StudentSession } from "./session";
import { LAST_ARRIVAL_MS } from "./readiness";
import { groupPlan } from "./group";
import { liveAbsent } from "./absence";
import { DEMO_PENS } from "@/data/group-scripts";
import { DEMO_SEED, LEAVE_PAUSE_MS, type GroupRun } from "./groupReview";
import { playBoard, simulatedRunAt, type SimulatedBoard } from "./groupSim";
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
 * The report jump's group review, already run: begun fifteen minutes ago and finished seven minutes in, every other group
 * home well before now on any pathway (the slowest, violet without individual review, takes about fourteen and a half). The demo group's board plays as the simulated groups' do (`playBoard`, ticket 332), at the pace that
 * closes its last question at the finish: each question's scripted tries, Q7 left for now and closed unsolved on its
 * return (ticket 222), Q9 left for now and solved on its return (the set's exception).
 */
export const REPORT_RUN_STARTED_AGO_MS = 15 * 60_000;
export const REPORT_RUN_FINISHED_AGO_MS = 8 * 60_000;
function finishedRun(session: StudentSession, now: number, absent: readonly string[], afterIndividual: boolean): GroupRun {
  const plan = groupPlan(session, absent, afterIndividual);
  const board: SimulatedBoard = { members: plan.members.map((m) => m.id), problems: plan.discussion.problems.map((p) => p.id), scripts: plan.scripts, seed: DEMO_SEED, pens: DEMO_PENS };
  const startedAt = now - REPORT_RUN_STARTED_AGO_MS;
  const finishedAt = now - REPORT_RUN_FINISHED_AGO_MS;
  // One pass at a unit pace measures the board; the real pace stretches it to end on the finish.
  const unit = playBoard(board, { tryS: 1, nextS: 1 }, 0);
  const checks = unit.filter((e) => e.action.type === "group/check").length;
  const moves = unit.filter((e) => e.action.type === "group/next").length;
  const leaves = unit.filter((e) => e.action.type === "group/leave").length;
  const tryS = (finishedAt - startedAt - leaves * LEAVE_PAUSE_MS) / 1000 / (checks + (moves - 1) / 2);
  return simulatedRunAt(board, { tryS, nextS: tryS / 2 }, startedAt, now);
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

/** How long individual review ran before a skip to the gate (ticket 318): the classmates are partway through their corrections. */
export const REVIEW_SKIPPED_MS = 6 * 60_000;

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
      // Sam has just handed in: the class's individual review runs from now (ticket 318).
      return { session: { ...sessionAt("feedback"), handedInAt: now }, classroom };
    case "class wait":
      // Sam has just handed in corrections: the classmates' scripted arrivals start now.
      return { session: { ...sessionAt("class-wait"), handedInAt: now - REVIEW_SKIPPED_MS }, classroom: classroomReducer(classroom, { type: "class/arrive", student: DEMO_STUDENT.id, at: now }) };
    case "group review": {
      // The class has just gone in: the intro is read first, then the board opens (ticket 220).
      const session = sessionAt("group");
      const c = everyoneIn(classroom, now);
      const plan = groupPlan(session, liveAbsent(c), pathwayOf(c).includes("individual"));
      return { session, classroom: classroomReducer(c, { type: "group/begin", members: plan.members.map((m) => m.id), problems: plan.discussion.problems.map((p) => p.id), at: boardOpensAt(now), pens: DEMO_PENS, scripts: plan.scripts }) };
    }
    case "report": {
      // Group review is behind the class: the standings hold on the board with the demo group's run finished.
      const session = sessionAt("report");
      return { session, classroom: { ...everyoneIn(classroom, now), group: finishedRun(session, now, liveAbsent(classroom), true) } };
    }
    case "homework": {
      // The report's moment with the reflection just sent: the homework sequence plays from the jump (ticket 256).
      const session = { ...sessionAt("homework"), homeworkAt: now };
      return { session, classroom: { ...everyoneIn(classroom, now), group: finishedRun(session, now, liveAbsent(classroom), true) } };
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
 * - `send` (ticket 272): the moment before sending. Create's last step filled in and not yet pressed (`readyToSend`):
 *   Problem Set 6's problems, goal and New skills under the demo pathway. Nothing is out: whatever was sent, and the
 *   lesson it started, goes (`unsent`), seating and absences kept, and Sam is at his Classroom with nothing to do. The
 *   teacher's bar opens the step; pressing Create there sends as a real Create does (a new lesson, Sam at his start).
 * - `done`: the stage the class is on (`currentClassStage`, by the pathway in force) ends for every student in the room.
 *   The class goes into the next stage of the pathway, Sam with his scripted work: individual review on his hand-in,
 *   group review at its intro with everyone through the gate, class review projected from the teacher's setup (or the
 *   suggested one) with the grace over. On the last stage, and on a lesson already over, it is `completed`. Nothing
 *   before the set is sent (`canTeacherSkip`).
 * - `completed`: every stage over (group review run, class review ended, `lessonEndedAt` stamped), Sam's report sent
 *   with its reflection and his homework playing from the jump: PS6 in the teacher's Past and Sam's Completed. Sends
 *   the set first when nothing is sent, as Sam's skips do. A lesson already completed stays as it is.
 *
 * On Sam's iPad a jump that leaves a set out opens it from his Classroom (`StudentClassroom`, ticket 272).
 */
export type TeacherSkipTarget = "send" | "done" | "completed";

export const TEACHER_SKIP_TARGETS: TeacherSkipTarget[] = ["send", "done", "completed"];

export const TEACHER_SKIP_LABEL: Record<TeacherSkipTarget, string> = { send: "send assignment", done: "students done with current stage", completed: "activity completed" };

export interface DemoState {
  classroom: ClassroomState;
  session: StudentSession;
}

/**
 * Create's draft as the demo teacher leaves it on the last step (ticket 272): Generate's set (`generatedDraft`) with every
 * scripted recommendation accepted, the first addition shown, which is Problem Set 6's ten problems, and the demo
 * pathway switched on. The pathway is the simulation's choice, standing in for the teacher's (Create waits for one,
 * ticket 246); the New skills stay inferred and the groups the class defaults, as a teacher who changed neither has them.
 */
export function readyDraft(now: number): { draft: AssignmentDraft; review: ReviewState } {
  const draft = generatedDraft(now);
  const answers = Object.fromEntries(RECOMMENDATIONS.map((r) => [r.id, "accept" as const]));
  return { draft, review: { step: "pathway", forDraft: draftKey(draft.questions), labels: {}, answers, addition: 0, pathway: [...DEMO_PATHWAY] } };
}

/** The demo just before its Create: nothing out, no lesson, Create's last step filled in (`readyDraft`). */
function readyToSend(c: ClassroomState, now: number): ClassroomState {
  const { draft, review } = readyDraft(now);
  return { ...unsent(c), draft, review };
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
const groupOver = (c: ClassroomState, session: StudentSession, now: number): GroupRun => (c.group?.done ? c.group : finishedRun(session, now, liveAbsent(c), pathwayOf(c).includes("individual")));

/** The class's stages in order: the working, then the pathway's review stages. */
const stagesOf = (c: ClassroomState): ClassStageId[] => ["working", ...pathwayOf(c)];

/** The class, and Sam, into a review stage of the pathway, everything before it over. */
function enter(stage: ReviewStage, c: ClassroomState, now: number): DemoState {
  const pathway = pathwayOf(c);
  const before = { ...streamOver(c, now), advance: null };
  switch (stage) {
    case "individual":
      // Sam's hand-in moves the class into individual review; the classmates' corrections arrive from it.
      return { classroom: before, session: { ...sessionAt("feedback"), handedInAt: now } };
    case "group": {
      // Everyone through the gate and the class just gone in: the intro is read first, then the board opens (ticket 220).
      const session = { ...handedInWork(pathway), stage: "group" as const };
      const c2 = throughGate(before, now);
      const plan = groupPlan(session, liveAbsent(c2), pathway.includes("individual"));
      return { session, classroom: classroomReducer({ ...c2, group: null }, { type: "group/begin", members: plan.members.map((m) => m.id), problems: plan.discussion.problems.map((p) => p.id), at: boardOpensAt(now), pens: DEMO_PENS, scripts: plan.scripts }) };
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
    // Class review run to its end (ticket 282): set up if it was not, projected if it was not, every slide shown, then ended,
    // so the report's "Covered in class review" reads every projected problem. A class review already ended stands.
    if (!next.wholeClass) next = classroomReducer(next, suggestedSetup(sam, liveAbsent(next)));
    if (next.wholeClass?.status === "setup") next = classroomReducer(next, { type: "wc/project", at: now - GRACE_MS - 1000 });
    while (next.wholeClass?.status === "active" && next.wholeClass.slide < next.wholeClass.problems.length - 1) next = classroomReducer(next, { type: "wc/next" });
    if (next.wholeClass?.status === "active") next = classroomReducer(next, { type: "wc/end" });
  }
  return { classroom: next, session: sam };
}

/** A teacher jump applied to the demo as it stands. Pure: the bar writes the result through the stores. */
export function teacherSkip(target: TeacherSkipTarget, c: ClassroomState, session: StudentSession | null, now: number): DemoState {
  switch (target) {
    case "send":
      return { classroom: readyToSend(c, now), session: INITIAL_SESSION };
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

/**
 * The presenter's homework jumps (ticket 295), shown in both skip lists (the teacher's strip and Sam's SKIP TO) only once the
 * teacher has pressed +Homework in this demo (`homeworkSkipsShown`), so a fresh demo offers no homework shortcut. Each is a
 * pure step from the demo as it stands, like the teacher's jumps, and lands on the state the real flow lands on:
 *
 * - `send homework`: +Homework's Create without walking it. Homework 3 as Generate fills it and Refine leaves it with every
 *   recommendation accepted (`readyHomework`), due on the picker's default (Mon 14 Sep), sent now through the same pure step
 *   as the real Create (`homeworkSent`); any homework sent before it goes first, so a second press is Homework 3 again, never
 *   Homework 4. Nothing else moves: no lesson, Sam's session as it is. It waits in Sam's Future panel until Problem Set 6's
 *   lesson ends, which is also true before Problem Set 6 is sent ("opens after Problem Set 6", ticket 292); sent after that
 *   lesson has ended it opens at once, as a real send would.
 * - `homework open`: Problem Set 6's lesson over as "activity completed" leaves it (`completeLesson`: the set sent first when
 *   nothing is out, Sam's report sent), with Homework 3 sent first if nothing is (a homework the teacher sent stands, its ten
 *   and due date as they chose). The store's write opens it (`openHomeworks`): the first card in Sam's To do, its cell a
 *   press target, HW2's note "current HW". Sam's iPad goes to his Classroom to show it (`land`).
 */
export type HomeworkSkipTarget = "send homework" | "homework open";

export const HOMEWORK_SKIP_TARGETS: HomeworkSkipTarget[] = ["send homework", "homework open"];

/** Whether the skip lists offer the homework jumps: +Homework pressed in this demo (ticket 295). */
export const homeworkSkipsShown = (c: ClassroomState | null | undefined): boolean => c?.homeworkStartedAt !== undefined;

/** The +Homework mark carried onto a classroom rebuilt from nothing (Sam's skips, `skipFixture`): only Reset demo clears it. */
export const keepHomeworkStarted = (from: ClassroomState, to: ClassroomState): ClassroomState =>
  from.homeworkStartedAt === undefined || to.homeworkStartedAt !== undefined ? to : { ...to, homeworkStartedAt: from.homeworkStartedAt };

/** +Homework's draft as the demo teacher leaves it on Refine: Generate's ten for the next homework, every recommendation accepted, the first addition shown. */
export function readyHomework(c: ClassroomState, now: number): { draft: AssignmentDraft; review: ReviewState } {
  const draft = generatedHomeworkDraft(c, now);
  const answers = Object.fromEntries(HOMEWORK_RECOMMENDATIONS.map((r) => [r.id, "accept" as const]));
  return { draft, review: { step: "recommendations", forDraft: draftKey(draft.questions), labels: {}, answers, addition: 0, pathway: null } };
}

/** Homework 3 sent now from the ready draft, replacing any homework sent before; the homework draft cleared as Create clears it. */
function sendHomework(c: ClassroomState, now: number): ClassroomState {
  const before: ClassroomState = { ...c };
  delete before.homeworks;
  const { draft, review } = readyHomework(before, now);
  return homeworkSent({ ...before, homeworkDraft: draft, homeworkReview: review }, now);
}

/** A homework jump applied to the demo as it stands, and where Sam's iPad goes. Pure: the bars write the result through the stores. */
export function homeworkSkip(target: HomeworkSkipTarget, c: ClassroomState, session: StudentSession | null, now: number): DemoState {
  switch (target) {
    case "send homework":
      return { classroom: sendHomework(c, now), session: session ?? INITIAL_SESSION };
    case "homework open": {
      const withHomework = c.homeworks?.length ? c : sendHomework(c, now);
      return completeLesson(withHomework, session, now);
    }
  }
}
