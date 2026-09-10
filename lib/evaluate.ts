import { EVALUATION, type LineVerdict } from "@/data/evaluation";

export type Verdict = LineVerdict | { verdict: "unclear" };

/** Looks a recognised line up in the scripted table. Unknown lines are "unclear", never wrong. */
export function evaluateLine(problemId: string, tex: string): Verdict {
  return EVALUATION[problemId]?.[tex] ?? { verdict: "unclear" };
}
