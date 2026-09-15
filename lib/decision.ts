import { DEMO_STUDENT } from "@/data/assignment";
import { BEFORE_HAND_IN_STAGES, type Problem } from "@/data/types";
import type { ClassroomState } from "./classroom";
import { currentClassStage, type ClassStageId } from "./classStage";
import { storedDecision, type DecisionDue, type DecisionKind, type DecisionStatus, type LessonDecision } from "./decisionState";
import type { StudentSession } from "./session";
import { classmatesAt, type StreamSet } from "./stream";

/**
 * Which lesson decision is due, and where the teacher is with it (ticket 335). Pure: the class's progress (Sam's session,
 * the classmates' stream at `now`, the students marked absent) says which decision is due; the classroom's stored
 * decisions (`lib/decisionState.ts`) say what the teacher did about it. See DECISION_LOG.md, 2026-09-15 (the decision card).
 *
 * Close to finishing: while the class is on individual working, more than half of the students in the room (Sam included,
 * the absent out) have submitted the question 70% of the way through the set, rounded up (Q7 of 10, Q5 of 6, Q9 of 12).
 * A classmate has submitted it once the stream has them past it; Sam once he has written on it and moved off it, or
 * handed the set in with work on it.
 */

/** How far through the set the question is: 70%, rounded up. */
export const CLOSE_SHARE = 0.7;

/** The question the trigger counts, 1-based: Q7 of 10, Q5 of 6, Q9 of 12. Rounded to a millionth first, so 0.7 × 10 is 7, not 7.000…1. */
export function closeQuestionNumber(problems: number): number {
  if (problems <= 0) return 0;
  return Math.max(1, Math.min(problems, Math.ceil(Math.round(CLOSE_SHARE * problems * 1e6) / 1e6)));
}

/** More than half of those present: 10 of 19, 11 of 20, never 10 of 20. */
export const moreThanHalf = (count: number, present: number): boolean => present > 0 && count * 2 > present;

/** Whether Sam has submitted a question on the live set: written on it and moved to another, or handed the set in with work on it. */
export function sessionSubmitted(session: StudentSession | null, problems: readonly Pick<Problem, "id">[], index: number): boolean {
  const problem = problems[index];
  if (!session || !problem) return false;
  if (!(session.lines[problem.id]?.length ?? 0)) return false;
  return !BEFORE_HAND_IN_STAGES.includes(session.stage) || (session.stage === "working" && session.problemIndex !== index);
}

/** The evidence on the card: who in the room has submitted the counted question, over how many are in the room. */
export interface CloseEvidence {
  /** The counted question's label ("Q7"). */
  question: string;
  /** Its number, 1-based. */
  number: number;
  submitted: number;
  present: number;
}

/** How many of the class in the room have submitted the question at 70% of `set`, at `now`. */
export function closeEvidence(c: ClassroomState | null | undefined, set: StreamSet & { absent: readonly string[] }, session: StudentSession | null, now: number): CloseEvidence {
  const number = closeQuestionNumber(set.problems.length);
  const index = number - 1;
  const classmates = classmatesAt(set, session, now).filter((m) => !set.absent.includes(m.record.id));
  const samHere = !set.absent.includes(DEMO_STUDENT.id);
  const sam = samHere && sessionSubmitted(session, set.problems, index) ? 1 : 0;
  return {
    question: set.problems[index]?.label ?? `Q${number}`,
    number,
    submitted: sam + classmates.filter((m) => m.state.answered >= number).length,
    present: (samHere ? 1 : 0) + classmates.length,
  };
}

/** The decision the class's progress has due now, if any: close to finishing while the class is on individual working and more than half the room is past the 70% question. */
export function dueDecision(c: ClassroomState | null | undefined, set: StreamSet & { absent: readonly string[] }, session: StudentSession | null, now: number): { kind: DecisionKind; stage: ClassStageId; evidence: CloseEvidence } | null {
  if (!c?.assignment || set.problems.length === 0) return null;
  if (currentClassStage(c, session, now) !== "working") return null;
  const evidence = closeEvidence(c, set, session, now);
  return moreThanHalf(evidence.submitted, evidence.present) ? { kind: "close-to-finishing", stage: "working", evidence } : null;
}

/** What the teacher screens show of the lesson's decision: the card, the dot, or nothing. */
export type DecisionShown = "card" | "dot" | null;

export interface DecisionView {
  kind: DecisionKind;
  stage: ClassStageId;
  dueAt: number;
  status: DecisionStatus;
  answer: LessonDecision["answer"] | null;
  /** The class has left the stage it came due in, unanswered or not: the plan runs as it was. */
  lapsed: boolean;
  /** Whether a tab has stored it yet (`decision/raise`); a derived one is open. */
  stored: boolean;
  shown: DecisionShown;
  /** What any action on it carries, so a press on a card no tab has stored yet stores it as it acts. */
  due: DecisionDue;
  /** The counts on the card as they are now. */
  evidence: CloseEvidence;
}

/**
 * The lesson's decision at `now`: the stored one while the class is still in the stage it came due in (open, tucked or
 * answered), a derived open one when the trigger has fired and no tab has stored it yet, a lapsed one once the class has
 * moved on, and null when nothing has come due. One decision at a time: ticket 337's replaces this one when it comes due.
 */
export function lessonDecision(c: ClassroomState | null | undefined, set: StreamSet & { absent: readonly string[] }, session: StudentSession | null, now: number): DecisionView | null {
  if (!c?.assignment) return null;
  const kind: DecisionKind = "close-to-finishing";
  const stored = storedDecision(c.decisions, kind);
  const evidence = closeEvidence(c, set, session, now);
  if (stored) {
    const lapsed = currentClassStage(c, session, now) !== stored.stage;
    return view(stored, true, lapsed, evidence);
  }
  const due = dueDecision(c, set, session, now);
  if (!due) return null;
  return view({ kind: due.kind, stage: due.stage, dueAt: now, status: "open" }, false, false, due.evidence);
}

function view(d: LessonDecision, stored: boolean, lapsed: boolean, evidence: CloseEvidence): DecisionView {
  const shown: DecisionShown = lapsed ? null : d.status === "open" ? "card" : d.status === "tucked" ? "dot" : null;
  return { kind: d.kind, stage: d.stage, dueAt: d.dueAt, status: d.status, answer: d.answer ?? null, lapsed, stored, shown, due: { kind: d.kind, stage: d.stage, at: d.dueAt }, evidence };
}

/** The teacher screens that show the decision (ticket 335): Edexia Classroom and the live set's Class View and Mistakes. */
export type DecisionScreen = "classroom" | "class" | "mistakes";

export function decisionScreen(path: string | null | undefined, liveId: string): DecisionScreen | null {
  if (path === "/teacher") return "classroom";
  if (path === `/teacher/a/${liveId}/class`) return "class";
  if (path === `/teacher/a/${liveId}/mistakes`) return "mistakes";
  return null;
}
