import type { Classmate } from "./classmates";
import { DEFAULT_GROUPS, GROUP_COLOURS, type GroupColour, type SeatingGroups } from "./groups";
import type { Problem } from "./types";

/**
 * What review made of a set's problems (tickets 244, 281), in the shape it happened: each student's second submission,
 * written in individual review, and each seating group's one version of every problem it took on (the union of what its
 * present members did not get right first time: a mistake, a problem left incomplete, one not attempted; ticket 278). A
 * group's version is its rework that checked, or its last try on a problem it closed unsolved, which is the group's own
 * freshly written working and never a member's first submission (the user, 2026-09-14). `withReview` writes both onto
 * the records as `Classmate.review`, which `lib/report.ts` reads; because a group's version is stored once per group,
 * every member who brought the problem carries the same one.
 *
 * The outcomes and the reasoning behind each are the class story sheet's review part (`data/story.ts`, `STORY_REVIEW`),
 * and `lib/reviewRule.ts` holds the sheet to the agreed rules.
 */
export interface GroupVersion {
  solved: boolean;
  lines: readonly string[];
}

/**
 * The set's one allowed exception (ticket 281, at most one per set): a problem nobody at the table had right that the
 * group still solved, because `member`'s first submission went wrong on a single line and the hint after the group's
 * second wrong check named exactly that slip.
 */
export interface ReviewException {
  colour: GroupColour;
  problem: string;
  member: string;
}

export interface SetReview {
  /** Second submissions, by student, then problem id: only where the student rewrote the problem on their own. */
  second: Readonly<Record<string, Readonly<Record<string, readonly string[]>>>>;
  /** Each group's version of every problem it took on, by colour, then problem id. */
  groups: Partial<Record<GroupColour, Readonly<Record<string, GroupVersion>>>>;
  /** The exception, when the set used it. */
  exception?: ReviewException;
}

/** One example the teacher put on the board in class review: a student's real wrong first submission on the problem. The board and the report show it anonymously. */
export interface ClassReviewExample {
  student: string;
  lines: readonly string[];
}

/** A problem class review covered: one or two examples of the class's wrong working on it. */
export interface CoveredProblem {
  problem: string;
  examples: readonly ClassReviewExample[];
}

/**
 * What class review covered on a set whose pathway has it (ticket 281: Problem Sets 1, 3 and 6): every problem at least
 * one group left unsolved, in set order, each with one or two examples. Ticket 282's report reads it.
 */
export type ClassReview = readonly CoveredProblem[];

/** The students whose working class review put on the board, by problem id, in the order shown. */
export type ClassReviewPicks = Readonly<Record<string, readonly string[]>>;

/** A set's class review from its picks: each covered problem, in set order, with each picked student's first submission on it. */
export function classReviewFrom(picks: ClassReviewPicks, records: readonly Classmate[], problems: readonly Problem[]): ClassReview {
  return problems.flatMap((p) => {
    const ids = picks[p.id];
    if (!ids) return [];
    return [{ problem: p.id, examples: ids.map((student) => ({ student, lines: [...(records.find((r) => r.id === student)?.attempts[p.id] ?? [])] })) }];
  });
}

/** A record's problems for its group on a set (ticket 278), in set order: every problem not handed in right first time. */
const groupProblems = (r: Classmate, problems: readonly Problem[]): string[] => problems.filter((p, i) => i >= r.done || r.wrong.includes(p.id)).map((p) => p.id);

/**
 * The records with `review` on every problem they brought to their group that has a second submission or a group
 * version: a problem they got wrong, left incomplete or did not attempt. A record with neither, or of a student away for
 * the set (`absent`, in no group), is returned as it was.
 */
export function withReview(records: readonly Classmate[], review: SetReview, problems: readonly Problem[], seating: SeatingGroups = DEFAULT_GROUPS, absent: readonly string[] = []): Classmate[] {
  return records.map((r) => {
    if (absent.includes(r.id)) return r;
    const colour = GROUP_COLOURS.find((c) => seating[c].includes(r.id));
    const entries = groupProblems(r, problems).flatMap((pid) => {
      const second = review.second[r.id]?.[pid];
      const g = colour ? review.groups[colour]?.[pid] : undefined;
      if (!second && !g) return [];
      return [[pid, { ...(second ? { second: [...second] } : {}), ...(g ? { group: { lines: [...g.lines], solved: g.solved } } : {}) }] as const];
    });
    return entries.length === 0 ? r : { ...r, review: Object.fromEntries(entries) };
  });
}
