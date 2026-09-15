import { COMPLETIONS, PAIR_MAP } from "@/data/pairs";
import { PRACTICES } from "@/data/practice";
import type { LeafId } from "@/data/taxonomy";
import type { PracticeProblem, QuestionPair, SolutionStep } from "@/data/types";

/**
 * Which steps of a completion step's working the student writes (ticket 310), as indices into `steps`, in order. The one
 * rule for both routes, help on a set question (Q**, with the skill named in the help picker) and the warm-up (the
 * completion problem, with its practice skill):
 *
 * - the steps tagged with the named skill;
 * - when every step carries it, or none does, the last two steps (the last one of a two-step working, the only one of a
 *   one-step working), so the student still writes something and still reads something first.
 *
 * Every other step is shown, already written.
 */
export function blankSteps(steps: readonly Pick<SolutionStep, "tags">[], leaf: LeafId): number[] {
  const tagged = steps.flatMap((s, i) => (s.tags.some((t) => t.leaf === leaf) ? [i] : []));
  if (tagged.length > 0 && tagged.length < steps.length) return tagged;
  const n = steps.length;
  return n <= 2 ? [n - 1].filter((i) => i >= 0) : [n - 2, n - 1];
}

/** Q* and Q** for a set question, or null for a question without them (every Problem Set 6 question has them). */
export const pairFor = (problemId: string): QuestionPair | null => PAIR_MAP[problemId] ?? null;

/** The warm-up's three steps for a practice skill: the practice problem worked, the completion problem, then its follow-up done alone. Null for a leaf with no practice of its own. */
export function warmupSteps(leaf: LeafId): { worked: PracticeProblem; completion: PracticeProblem; alone: PracticeProblem } | null {
  const worked = PRACTICES[leaf];
  const completion = COMPLETIONS[leaf];
  if (!worked?.followUp || !completion) return null;
  return { worked, completion, alone: worked.followUp };
}
