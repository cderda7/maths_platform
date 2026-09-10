import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATE_MAP, GROUPMATE_IDS } from "@/data/classmates";
import type { Problem } from "@/data/types";
import { feedbackFor } from "./feedback";
import type { StudentSession } from "./session";

/**
 * The two-phase group review, computed from wrong-problem sets:
 *   quick pass  = problems every member got right   (intersection of the correct sets)
 *   discussion  = problems any member got wrong      (union of the wrong sets)
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

export function groupPlan(session: StudentSession): GroupPlan {
  const mine = feedbackFor(session)
    .filter((p) => p.slips.length > 0)
    .map((p) => p.problem.id);
  const mates = GROUPMATE_IDS.map((id) => CLASSMATE_MAP[id]);
  const wrongSets = [mine, ...mates.map((m) => m.wrong)];
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
