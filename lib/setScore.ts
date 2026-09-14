import type { Classmate } from "@/data/classmates";
import type { Problem } from "@/data/types";
import { evaluateLine } from "./evaluate";
import type { StudentProgress } from "./progress";
import type { StudentSession } from "./session";

/**
 * A student's score on a set, as the Class View's Set column reads it (ticket 285): the problems right on the first
 * submission, over the set's problems. Review never changes it: a problem fixed on the student's own rework or in group
 * review still counts wrong. Right first time is ticket 278's rule (`lib/group.ts`): finished, with no wrong line; a
 * problem with a slip, one started and left unfinished, and one not attempted all count against it. Pure.
 */

/** A set record's right-first-time count: a problem inside `done` and off the wrong list. */
export function recordScore(record: Pick<Classmate, "done" | "wrong">, problems: readonly Problem[]): number {
  return problems.filter((p, i) => i < record.done && !record.wrong.includes(p.id)).length;
}

/** Whether a set record finished the problem at `index` on its first submission (ticket 282): it lies inside `done`, right or wrong. */
export const recordFinished = (record: Pick<Classmate, "done">, index: number): boolean => index < record.done;

/**
 * The live student's right-first-time count, from his first submission alone (`lines` and the typed answer, never
 * `rework`): some working, no wrong line, and an answer, a line the table marks as one or a sentence typed under it.
 */
export function sessionScore(session: Pick<StudentSession, "lines" | "answers">, problems: readonly Problem[]): number {
  return problems.filter((p) => firstFinished(session, p.id) && !(session.lines[p.id] ?? []).some((l) => evaluateLine(p.id, l.tex).verdict === "wrong")).length;
}

/**
 * Whether the live student's first submission of a problem is finished (ticket 282, the report's "Correct first try" reads
 * it too): some working and an answer on it, a line the table marks as one or a sentence typed under it, right or wrong.
 * `progressOf` (`lib/feedback.ts`) is the same notion over the first submission and the rework together.
 */
export function firstFinished(session: Pick<StudentSession, "lines" | "answers">, problem: string): boolean {
  const verdicts = (session.lines[problem] ?? []).map((l) => evaluateLine(problem, l.tex));
  if (verdicts.length === 0) return false;
  return (session.answers[problem] ?? "").trim().length > 0 || verdicts.some((v) => v.verdict !== "unclear" && v.answer === true);
}

/** The Set column's words: "7/10" once handed in; a dash while the student is still on the set, when there is no first submission to score. */
export const setScoreText = (progress: StudentProgress, right: number, total: number): string => (progress.kind === "submitted" ? `${right}/${total}` : "—");
