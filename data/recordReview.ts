import type { Classmate } from "./classmates";
import { DEFAULT_GROUPS, GROUP_COLOURS, type GroupColour, type SeatingGroups } from "./groups";

/**
 * What review made of a set's mistakes (ticket 244), in the shape it happened: each student's second submission,
 * written in individual review, and each seating group's one version of every problem it took on (the union of its
 * members' mistakes): its rework that checked, or its last try on a problem it closed unsolved. `withReview` writes
 * both onto the records as `Classmate.review`, which `lib/report.ts` reads; because a group's version is stored
 * once per group, every member wrong on the problem carries the same one.
 *
 * The outcomes and the reasoning behind each are the class story sheet's review part (`data/story.ts`,
 * `STORY_REVIEW`), and `lib/reviewRule.ts` holds the sheet to the agreed rules.
 */
export type GroupVersion =
  | { solved: boolean; lines: readonly string[] }
  /** The group's last try was a member's own first submission, line for line. */
  | { solved: false; firstOf: string };

export interface SetReview {
  /** Second submissions, by student, then problem id: only where the student rewrote the problem on their own. */
  second: Readonly<Record<string, Readonly<Record<string, readonly string[]>>>>;
  /** Each group's version of every problem it took on, by colour, then problem id. */
  groups: Partial<Record<GroupColour, Readonly<Record<string, GroupVersion>>>>;
}

/** The records with `review` on every wrong problem that has a second submission or a group version; a record with neither is returned as it was. */
export function withReview(records: readonly Classmate[], review: SetReview, seating: SeatingGroups = DEFAULT_GROUPS): Classmate[] {
  const byId = new Map(records.map((r) => [r.id, r]));
  const linesOf = (v: GroupVersion, pid: string): string[] => ("firstOf" in v ? [...(byId.get(v.firstOf)?.attempts[pid] ?? [])] : [...v.lines]);
  return records.map((r) => {
    const colour = GROUP_COLOURS.find((c) => seating[c].includes(r.id));
    const entries = r.wrong.flatMap((pid) => {
      const second = review.second[r.id]?.[pid];
      const g = colour ? review.groups[colour]?.[pid] : undefined;
      if (!second && !g) return [];
      return [[pid, { ...(second ? { second: [...second] } : {}), ...(g ? { group: { lines: linesOf(g, pid), solved: g.solved } } : {}) }] as const];
    });
    return entries.length === 0 ? r : { ...r, review: Object.fromEntries(entries) };
  });
}
