import { PS5_PS6_PRIMARY_SKILL } from "@/data/problem-skills";
import { STORY_SETS } from "@/data/story";
import type { LeafId } from "@/data/taxonomy";

/** Problem Sets 1–4's problems by id (`ps3-q8`), each the first leaf of its line in the story sheet's outline. */
const FROM_OUTLINE: Readonly<Record<string, LeafId>> = Object.fromEntries(
  STORY_SETS.flatMap((s) => (s.outline ?? []).map((p, k) => [`ps${s.n}-q${k + 1}`, p.leaves[0]] as const)),
);

/** A problem's one skill (ticket 294, `data/problem-skills.ts`); undefined for a problem no set names (a teacher's typed question). */
export const primarySkill = (problemId: string): LeafId | undefined => FROM_OUTLINE[problemId] ?? PS5_PS6_PRIMARY_SKILL[problemId];
