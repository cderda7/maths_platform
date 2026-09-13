import { EVALUATION, type LineVerdict } from "@/data/evaluation";
import { PS1_EVALUATION } from "@/data/pset1/evaluation";

export type Verdict = LineVerdict | { verdict: "unclear" };

/** Every set's table, by problem id: Problem Set 2's `q1` … `q10` and Problem Set 1's `ps1-q1` … (ticket 187). Ids never collide. */
const TABLES: Record<string, Record<string, LineVerdict>> = { ...EVALUATION, ...PS1_EVALUATION };

/** Looks a recognised line up in the scripted table. Unknown lines are "unclear", never wrong. */
export function evaluateLine(problemId: string, tex: string): Verdict {
  return TABLES[problemId]?.[tex] ?? { verdict: "unclear" };
}
