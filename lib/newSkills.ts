import { isolatable } from "@/data/practice";
import type { LeafId } from "@/data/taxonomy";
import type { Problem } from "@/data/types";
import { problemLeaves, type SetScope } from "./hierarchy";

/**
 * Create's New skills (ticket 209). A created set's New skills are inferred, shown on the review's
 * pathway step and changeable there, never confirmed: the inferred list stands until the teacher
 * changes it, and Create is on throughout. Pure. See DECISION_LOG.md, 2026-09-13 (New skills per set).
 *
 * The rule: a skill the set is focused on is new unless the class met it in either of its last two
 * sets. "Focused on" is at least `FOCUS_PROBLEMS` of the set's problems invoking the skill (a skill
 * one problem touches in passing is not what the set is about). "Met" is assessed under its home: a
 * skill a recent set listed as new was still being introduced there, so it stays new. With the agreed
 * lists this reproduces Problem Set 6's (the discriminant and the null factor law, against Problem Set 5).
 */

/** The fewest of the set's problems that must invoke a skill for the set to be focused on it. */
export const FOCUS_PROBLEMS = 2;

/** How many earlier sets the rule reads: the class's last two. */
export const RECENT_SETS = 2;

/**
 * The skills a set could name as new: every move its problems invoke (`isolatable`: never a
 * whole-task leaf like complete working), most-invoked first, ties in first-mention order. The
 * review lists these as the choices, so a chip never moves when it is switched on or off.
 */
export function newSkillCandidates(problems: readonly Problem[]): { leaf: LeafId; problems: number }[] {
  const count = new Map<LeafId, number>();
  for (const p of problems) for (const l of problemLeaves(p)) if (isolatable(l)) count.set(l, (count.get(l) ?? 0) + 1);
  return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([leaf, n]) => ({ leaf, problems: n }));
}

/** The skills each recent set assessed under their home (tagged in its problems, not one of its New skills). */
function metIn(recent: readonly SetScope[]): Set<LeafId> {
  const met = new Set<LeafId>();
  for (const set of recent.slice(0, RECENT_SETS)) for (const p of set.problems) for (const l of problemLeaves(p)) if (!set.newSkills.includes(l)) met.add(l);
  return met;
}

/** The inferred New skills for a set of `problems`, given the class's earlier sets newest first (only the first `RECENT_SETS` are read); in candidate order. */
export function inferNewSkills(problems: readonly Problem[], recent: readonly SetScope[]): LeafId[] {
  const met = metIn(recent);
  return newSkillCandidates(problems)
    .filter((c) => c.problems >= FOCUS_PROBLEMS && !met.has(c.leaf))
    .map((c) => c.leaf);
}
