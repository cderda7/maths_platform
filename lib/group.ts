import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATE_MAP, GROUPMATE_IDS, type Classmate } from "@/data/classmates";
import type { Problem } from "@/data/types";
import { feedbackFor, progressOf } from "./feedback";
import type { StudentSession } from "./session";

/**
 * The two-phase group review, computed from wrong-problem sets:
 *   quick pass  = problems every member got right   (intersection of the correct sets)
 *   discussion  = problems any member got wrong      (union of the wrong sets)
 * A member's set (ticket 278, settled with the user 2026-09-14, replacing ticket 250's rule): every problem they did not
 * get right first time: one with a wrong line in it, one they started and left incomplete, and one they did not attempt.
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
 * The demo student's problems for the union, in set order (ticket 278): every problem with a wrong line, every problem he
 * started and has not finished (some working, no answer: `progressOf`), and every problem with nothing written on it.
 * Only a problem finished with no wrong line stays out.
 */
export function reviewProblemsOf(session: StudentSession): string[] {
  const fb = feedbackFor(session);
  return fb.filter((p) => p.slips.length > 0 || progressOf(session, p.problem.id) !== "finished").map((p) => p.problem.id);
}

/**
 * A classmate's problems for the union, in set order (ticket 278): every problem not finished right. A problem they got
 * wrong, one they started past where they finished (working at or beyond `done`), and one they never reached all count;
 * only a problem inside `done` and off the wrong list (right first time) stays out.
 */
export function recordReviewProblems(m: Pick<Classmate, "done" | "wrong">): string[] {
  return ASSIGNMENT.problems.flatMap((p, i) => (i < m.done && !m.wrong.includes(p.id) ? [] : [p.id]));
}

/** The demo student's review group: him and his groupmates, less any marked absent on the live set (`liveAbsent`, ticket 250). */
export function groupPlan(session: StudentSession, absent: readonly string[] = []): GroupPlan {
  const mine = reviewProblemsOf(session);
  const mates = GROUPMATE_IDS.filter((id) => !absent.includes(id)).map((id) => CLASSMATE_MAP[id]);
  const wrongSets = [mine, ...mates.map(recordReviewProblems)];
  const ids = ASSIGNMENT.problems.map((p) => p.id);
  const { quickPass, discussion, totalWrong } = computePhases(ids, wrongSets);
  const byId = (id: string) => ASSIGNMENT.problems.find((p) => p.id === id)!;
  const memberCount = wrongSets.length;
  return {
    members: [{ id: DEMO_STUDENT.id, name: DEMO_STUDENT.name, initials: DEMO_STUDENT.initials }, ...mates.map((m) => ({ id: m.id, name: m.name, initials: m.initials }))],
    quickPass: quickPass.map(byId),
    discussion: { problems: discussion.map(byId), memberCount, totalWrong, perMember: Math.round(totalWrong / memberCount) },
  };
}
