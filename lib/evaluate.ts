import { EVALUATION, type LineVerdict } from "@/data/evaluation";
import { FINISHED_SETS } from "./finishedSets";

export type Verdict = LineVerdict | { verdict: "unclear" };

/**
 * Every set's table, by problem id: Problem Set 6's `q1` … `q10` and each finished set's `psN-q1` …
 * (tickets 187, 210), from the one list of finished sets. Ids never collide (`data/finishedSets.test.ts`).
 */
const TABLES: Record<string, Record<string, LineVerdict>> = Object.assign({}, EVALUATION, ...FINISHED_SETS.map((s) => s.evaluation));

/** Looks a recognised line up in the scripted table. Unknown lines are "unclear", never wrong. */
export function evaluateLine(problemId: string, tex: string): Verdict {
  return TABLES[problemId]?.[tex] ?? { verdict: "unclear" };
}
