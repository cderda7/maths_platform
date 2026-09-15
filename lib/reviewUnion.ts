import type { Classmate } from "@/data/classmates";
import type { Problem } from "@/data/types";
import { evaluateLine } from "./evaluate";
import { firstFinished } from "./setScore";
import type { StudentSession } from "./session";

/**
 * Which questions reach a group in group review, and who at the table can explain one (ticket 332, settled with Carson
 * 2026-09-15). The one copy of both rules: the live board (`lib/group.ts`), the standings and race (`lib/standings.ts`),
 * the simulated groups (`lib/groupSim.ts`), the stage's done count and the record-review checks (`lib/reviewRule.ts`) all
 * read them. Pure.
 *
 * - **Still to review.** On a pathway with individual review, a member brings every question still not right once their
 *   corrections are in: a wrong first submission their second submission did not fix (wrong again, or never rewritten),
 *   one left incomplete, one not attempted. A question fixed in individual review stays out, so individual review is never
 *   pointless ("otherwise, we jeopardize making indiv review seem pointless"). Without individual review, the first
 *   submission decides (ticket 278).
 * - **Can explain.** A present member who had the question right first time, or (with individual review) fixed it there.
 *
 * Right first time is the set score's rule (ticket 285, `lib/setScore.ts`): finished with no wrong line. A fix is a second
 * submission with no wrong line in it, the report's "Fixed in individual review" (`outcomeOf`, `lib/report.ts`), so a report
 * never shows a student fixing a question their group still had to work because of them.
 */
export interface MemberWork {
  /** Finished on the first submission with no wrong line (the set score's rule). */
  rightFirstTime: boolean;
  /** The second submission written in individual review; empty when there is none. */
  second: readonly string[];
}

/** Lines with something in them and no wrong line: what the report counts as a version that holds. */
export const holds = (problem: string, lines: readonly string[]): boolean => lines.length > 0 && lines.every((tex) => evaluateLine(problem, tex).verdict !== "wrong");

/** Not right first time, and the second submission holds. */
export const fixedInIndividualReview = (problem: string, w: MemberWork): boolean => !w.rightFirstTime && holds(problem, w.second);

/** Whether a member can explain the question to their group: right first time, or fixed in individual review when the pathway has it. */
export const canExplain = (problem: string, w: MemberWork, afterIndividual: boolean): boolean => w.rightFirstTime || (afterIndividual && fixedInIndividualReview(problem, w));

/** Whether a member brings the question to their group: anything they cannot explain. */
export const stillToReview = (problem: string, w: MemberWork, afterIndividual: boolean): boolean => !canExplain(problem, w, afterIndividual);

/** A set record's work on a question: right first time by `done` and `wrong` (`recordScore`), its second submission from `review`. */
export function recordWork(record: Pick<Classmate, "done" | "wrong" | "review">, problems: readonly Pick<Problem, "id">[], problem: string): MemberWork {
  const i = problems.findIndex((p) => p.id === problem);
  return { rightFirstTime: i >= 0 && i < record.done && !record.wrong.includes(problem), second: record.review?.[problem]?.second ?? [] };
}

/** The live student's work on a question: right first time from the first submission alone (`sessionScore`), the rework as the second submission. */
export function sessionWork(session: Pick<StudentSession, "lines" | "answers" | "rework">, problem: string): MemberWork {
  const lines = session.lines[problem] ?? [];
  const rightFirstTime = firstFinished(session, problem) && !lines.some((l) => evaluateLine(problem, l.tex).verdict === "wrong");
  return { rightFirstTime, second: (session.rework[problem] ?? []).map((l) => l.tex) };
}

/** A member's questions for the group, in set order. */
export const toReview = (problems: readonly Pick<Problem, "id">[], work: (problem: string) => MemberWork, afterIndividual: boolean): string[] =>
  problems.filter((p) => stillToReview(p.id, work(p.id), afterIndividual)).map((p) => p.id);

/** The group's union: every question any present member still brings, in set order. Empty: the group sits out group review. */
export const unionOfMembers = (problems: readonly Pick<Problem, "id">[], sets: readonly (readonly string[])[]): string[] => problems.map((p) => p.id).filter((id) => sets.some((s) => s.includes(id)));
