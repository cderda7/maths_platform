import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATE_MAP, GROUPMATE_IDS, type Classmate } from "@/data/classmates";
import type { Problem } from "@/data/types";
import { SET6_REVIEW } from "@/data/classmates-review";
import { GROUP_SCRIPTS } from "@/data/group-scripts";
import { boardScripts } from "./groupSim";
import { canExplain, recordWork, sessionWork, toReview, type MemberWork } from "./reviewUnion";
import type { StudentSession } from "./session";

/**
 * The two-phase group review, computed from wrong-problem sets:
 *   quick pass  = problems every member got right   (intersection of the correct sets)
 *   discussion  = problems any member got wrong      (union of the wrong sets)
 * A member's set (ticket 332, settled with Carson 2026-09-15, replacing ticket 278's first-submission rule): every
 * question they still have wrong, left incomplete or did not attempt once individual review is over (`lib/reviewUnion.ts`);
 * on a pathway without individual review, every question not right first time.
 * An absent member is not in the group at all (ticket 250).
 * The discussion view model carries one shared count and nothing per member or per problem,
 * so no correctness leaks into that phase. Pure, with tests.
 */
export interface Member {
  id: string;
  name: string;
  initials: string;
}

export interface GroupPlan {
  members: Member[];
  quickPass: Problem[];
  discussion: DiscussionView;
  /** Simulation only (ticket 332): what each question's scripted tries write on this table's board, by the group rule. */
  scripts: Record<string, string[][]>;
}

export interface DiscussionView {
  problems: Problem[];
  memberCount: number;
  /** Total slips across all members on the discussion problems. */
  totalWrong: number;
  /** "About n each", rounded. The only number shown in the discussion phase. */
  perMember: number;
}

export function computePhases(problemIds: string[], wrongSets: string[][]): { quickPass: string[]; discussion: string[]; totalWrong: number } {
  const union = new Set(wrongSets.flat());
  return {
    quickPass: problemIds.filter((id) => !union.has(id)),
    discussion: problemIds.filter((id) => union.has(id)),
    totalWrong: wrongSets.reduce((n, w) => n + w.length, 0),
  };
}

/**
 * The demo student's problems for the union, in set order: every question he still brings (`stillToReview`,
 * `lib/reviewUnion.ts`, ticket 332). After individual review, a question his rework fixed stays out; without it (or
 * `afterIndividual` false) a problem with a wrong line, one started and left unfinished and one with nothing written on
 * it all count, and only one finished right first time stays out (ticket 278).
 */
export function reviewProblemsOf(session: StudentSession, afterIndividual: boolean): string[] {
  return toReview(ASSIGNMENT.problems, (pid) => sessionWork(session, pid), afterIndividual);
}

/**
 * A classmate's problems for the union, in set order (tickets 278, 332): every question not right first time (wrong, started
 * past where they finished, never reached), less, after individual review, one their second submission fixed.
 */
export function recordReviewProblems(m: Pick<Classmate, "done" | "wrong" | "review">, afterIndividual: boolean): string[] {
  return toReview(ASSIGNMENT.problems, (pid) => recordWork(m, ASSIGNMENT.problems, pid), afterIndividual);
}

/** A member's work on a question (`lib/reviewUnion.ts`): the demo student's from the session, a classmate's from the fixture. */
export function memberWork(id: string, session: StudentSession | null, problem: string): MemberWork {
  if (id === DEMO_STUDENT.id) return session ? sessionWork(session, problem) : { rightFirstTime: false, second: [] };
  const m = CLASSMATE_MAP[id];
  return m ? recordWork(m, ASSIGNMENT.problems, problem) : { rightFirstTime: false, second: [] };
}

/** Whether someone at the table can explain a question (ticket 332): right first time, or fixed in individual review. */
export const explainableAt = (members: readonly string[], session: StudentSession | null, afterIndividual: boolean, problem: string): boolean =>
  members.some((id) => canExplain(problem, memberWork(id, session, problem), afterIndividual));

/** The table's wrong first submissions on a question, for the rule's own tries: the demo student's lines, the classmates' recorded working. */
export function tableSlips(members: readonly string[], session: StudentSession | null, problem: string): string[][] {
  return members.flatMap((id) => {
    const lines = id === DEMO_STUDENT.id ? (session?.lines[problem] ?? []).map((l) => l.tex) : (CLASSMATE_MAP[id]?.wrong.includes(problem) ? (CLASSMATE_MAP[id].attempts[problem] ?? []) : []);
    return lines.length > 0 ? [lines] : [];
  });
}

/** The set's one exception (`SET6_REVIEW.exception`) when its member sits at this table: the question it may solve on its return. */
export const exceptionAt = (members: readonly string[]): string | null => (SET6_REVIEW.exception && members.includes(SET6_REVIEW.exception.member) ? SET6_REVIEW.exception.problem : null);

/**
 * The demo student's review group: him and his groupmates, less any marked absent on the live set (`liveAbsent`, ticket 250).
 * `afterIndividual`: the pathway has individual review, so the union is taken once corrections are in (ticket 332).
 */
export function groupPlan(session: StudentSession, absent: readonly string[], afterIndividual: boolean): GroupPlan {
  const mine = reviewProblemsOf(session, afterIndividual);
  const mates = GROUPMATE_IDS.filter((id) => !absent.includes(id)).map((id) => CLASSMATE_MAP[id]);
  const wrongSets = [mine, ...mates.map((m) => recordReviewProblems(m, afterIndividual))];
  const ids = ASSIGNMENT.problems.map((p) => p.id);
  const { quickPass, discussion, totalWrong } = computePhases(ids, wrongSets);
  const byId = (id: string) => ASSIGNMENT.problems.find((p) => p.id === id)!;
  const memberCount = wrongSets.length;
  const tableIds = [DEMO_STUDENT.id, ...mates.map((m) => m.id)];
  return {
    members: [{ id: DEMO_STUDENT.id, name: DEMO_STUDENT.name, initials: DEMO_STUDENT.initials }, ...mates.map((m) => ({ id: m.id, name: m.name, initials: m.initials }))],
    quickPass: quickPass.map(byId),
    discussion: { problems: discussion.map(byId), memberCount, totalWrong, perMember: Math.round(totalWrong / memberCount) },
    scripts: boardScripts(discussion, Object.fromEntries(Object.entries(GROUP_SCRIPTS).map(([p, sc]) => [p, sc.attempts])), (p) => explainableAt(tableIds, session, afterIndividual, p), (p) => tableSlips(tableIds, session, p), exceptionAt(tableIds)),
  };
}
