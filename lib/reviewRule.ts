import type { Classmate } from "@/data/classmates";
import { GROUP_COLOURS, type GroupColour, type SeatingGroups } from "@/data/groups";
import { STORY, type ReviewOutcome, type StoryCategory, type StoryStatus } from "@/data/story";
import { evaluateLine } from "./evaluate";
import { classmateLines, columnOf, type SetScope } from "./hierarchy";

/**
 * The agreed rules for what review made of a set record's mistakes (ticket 244), applied literally so a test can
 * hold the class story sheet's review part to them:
 *
 * - a **pattern** (the sheet shows a gap, for that student on that set, in the category the slip counts under)
 *   stays wrong;
 * - a **one-off** slip (its mistake made on that one problem of the set, and the sheet's pattern for it naming
 *   only that problem) is fixed on the student's own rework;
 * - a **repeated** slip is fixed in group review when another member of their seating group handed that
 *   problem in without making it; with nobody to show them (`unhelped`), it stays wrong.
 *
 * A group takes on every problem one of its members got wrong, and its version of a problem is one: its rework
 * checks when a member's slip there is the group's to fix (or every member there fixed it alone), and is its
 * last try otherwise, the first pattern-holder's working in seating order. When the group's rework checks, every
 * member still wrong on the problem reads as fixed in group review, a pattern included (`conflict`: the rules
 * disagree, and the group's single version decides). Where a set's group run is scripted (`fixed`: the live
 * set's demo group), the script decides solved or not.
 */
export type ReviewBasis = "one-off" | "repeated" | "pattern" | "unhelped";

export interface ReviewSlip {
  /** The wrong line's mistake name (`LineVerdict.name`). */
  name: string;
  category: StoryCategory;
  status: StoryStatus | "unseen" | "absent" | "none" | "live";
  /** The sheet's pattern on this problem in that category, or null when the sheet names none there. */
  pattern: { text: string; problems: readonly number[] } | null;
}

export interface RuleCase {
  student: string;
  colour: GroupColour;
  q: number;
  outcome: ReviewOutcome;
  basis: ReviewBasis;
  /** The slip that decided the basis (the strictest of the problem's wrong lines). */
  slip: ReviewSlip;
  /** For a repeated slip: the groupmates who handed the problem in without making it. */
  helpers: string[];
  /** The rules disagree (a pattern on a problem the group's rework checked): the group's version decided. */
  conflict: boolean;
}

export interface GroupCall {
  colour: GroupColour;
  q: number;
  solved: boolean;
  /** Whose first submission the group's last try is (unsolved and not scripted); null otherwise. */
  lastTryOf: string | null;
}

const STRICT: Record<ReviewBasis, number> = { "one-off": 0, repeated: 1, unhelped: 2, pattern: 3 };
const RAW: Record<ReviewBasis, ReviewOutcome> = { "one-off": "individual", repeated: "group", unhelped: "wrong", pattern: "wrong" };

type Slipped = { name: string; leaf: Parameters<typeof columnOf>[0] };

export function reviewByRule(set: SetScope, n: number, everyone: readonly Classmate[], seating: SeatingGroups, fixed: Partial<Record<GroupColour, Record<string, boolean>>> = {}): { cases: RuleCase[]; groups: GroupCall[] } {
  const index = (pid: string) => set.problems.findIndex((p) => p.id === pid);
  const linesOf = (r: Classmate, pid: string) => classmateLines(r, set.problems[index(pid)], index(pid));
  const slipsOf = (r: Classmate, pid: string): Slipped[] =>
    (linesOf(r, pid) ?? []).flatMap((tex) => {
      const v = evaluateLine(pid, tex);
      return v.verdict === "wrong" ? [{ name: v.name ?? "", leaf: v.tags[0].leaf }] : [];
    });
  const cases: RuleCase[] = [];
  const groups: GroupCall[] = [];
  for (const colour of GROUP_COLOURS) {
    const members = seating[colour].flatMap((id) => everyone.filter((r) => r.id === id));
    const raw: { student: string; pid: string; basis: ReviewBasis; slip: ReviewSlip; helpers: string[] }[] = [];
    for (const r of members) {
      for (const pid of r.wrong) {
        const q = index(pid) + 1;
        let pick: (typeof raw)[number] | null = null;
        for (const s of slipsOf(r, pid)) {
          const category = columnOf(s.leaf, set.newSkills) as StoryCategory;
          const cell = STORY[r.id].cells[category][n - 1];
          const pattern = cell.patterns.find((pt) => pt.problems.includes(q)) ?? null;
          const slip: ReviewSlip = { name: s.name, category, status: cell.status, pattern };
          const repeated = (pattern !== null && pattern.problems.length > 1) || r.wrong.some((other) => other !== pid && slipsOf(r, other).some((o) => o.name === s.name));
          const helpers = repeated ? members.filter((m) => m.id !== r.id && linesOf(m, pid) !== null && !slipsOf(m, pid).some((o) => o.name === s.name)).map((m) => m.id) : [];
          const basis: ReviewBasis = cell.status === "gap" ? "pattern" : !repeated ? "one-off" : helpers.length > 0 ? "repeated" : "unhelped";
          if (!pick || STRICT[basis] > STRICT[pick.basis]) pick = { student: r.id, pid, basis, slip, helpers };
        }
        if (pick) raw.push(pick);
      }
    }
    for (const p of set.problems) {
      const here = raw.filter((c) => c.pid === p.id);
      if (here.length === 0 && fixed[colour]?.[p.id] === undefined) continue;
      const q = index(p.id) + 1;
      const solved = fixed[colour]?.[p.id] ?? (here.some((c) => RAW[c.basis] === "group") || !here.some((c) => RAW[c.basis] === "wrong"));
      const lastTryOf = solved || fixed[colour]?.[p.id] !== undefined ? null : (here.find((c) => RAW[c.basis] === "wrong")?.student ?? null);
      groups.push({ colour, q, solved, lastTryOf });
      for (const c of here) {
        const first = RAW[c.basis];
        const outcome: ReviewOutcome = first === "individual" ? "individual" : solved ? "group" : "wrong";
        cases.push({ student: c.student, colour, q, outcome, basis: c.basis, slip: c.slip, helpers: c.helpers, conflict: first !== "individual" && outcome !== first });
      }
    }
  }
  const order = everyone.map((r) => r.id);
  cases.sort((a, b) => order.indexOf(a.student) - order.indexOf(b.student) || a.q - b.q);
  return { cases, groups };
}
