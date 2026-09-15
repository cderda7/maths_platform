import type { Classmate } from "@/data/classmates";
import { GROUP_COLOURS, type GroupColour, type SeatingGroups } from "@/data/groups";
import { STORY, type ReviewOutcome, type StoryCategory, type StoryStatus } from "@/data/story";
import type { MisconceptionId } from "@/data/misconceptions";
import { evaluateLine } from "./evaluate";
import { classmateLines, columnOf, type SetScope } from "./hierarchy";

/**
 * The agreed rules for what review made of a set record's problems (tickets 244 and 281), applied literally so a test
 * can hold the class story sheet's review part to them.
 *
 * What a member brings to their group (ticket 278): every problem they did not get right first time, one they got wrong,
 * one they started and left incomplete, and one they did not attempt. An absent member brings nothing (ticket 250).
 *
 * Where a member's problem ends (the user, 2026-09-14, ticket 281):
 * - a **one-off** slip (its mistake made on that one problem of the set, the sheet's pattern for it naming only that
 *   problem, and no gap in its category) is fixed on the student's own rework;
 * - everything else goes to the group: a **repeated** slip, a **pattern** (a gap in the slip's category on the set), a
 *   problem left **incomplete** or **not attempted**. The group **solves** a problem when at least one present member
 *   had it right first time, a pattern at the table included (a groupmate shows them within two or three tries); a
 *   problem nobody present had right stays **unsolved**, and the group's last try is its own freshly written working.
 * - The one **exception**, at most once per set: a problem nobody present had right that the group still solves,
 *   because one member's first submission went wrong on a single line and the hint after the group's second wrong check
 *   names exactly that slip (`exception`). Where a set's group run is scripted (`fixed`: the live set's demo group),
 *   the script decides, and `data/group-scripts.test.ts` holds the script to these rules.
 */
export type ReviewBasis = "one-off" | "repeated" | "pattern" | "incomplete" | "not attempted";

export interface ReviewSlip {
  /** The wrong line's misconception (`LineVerdict.misconception`, ticket 299). */
  misconception: MisconceptionId;
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
  /** The slip that decided the basis (the strictest of the problem's wrong lines); null for a problem with none. */
  slip: ReviewSlip | null;
  /** The present groupmates who had the problem right first time. */
  helpers: string[];
}

export interface GroupCall {
  colour: GroupColour;
  q: number;
  solved: boolean;
  /** The present members who had the problem right first time: the group solves it when there is one. */
  helpers: string[];
  /** The member whose single-line slip the exception's hint named, when the group solved it that way; else null. */
  excepted: string | null;
  /** The group's run is scripted (`fixed`), so the script decided. */
  scripted: boolean;
}

/** The set's one allowed exception: the group, the problem, and the member whose first submission went wrong on one line. */
export interface ReviewException {
  colour: GroupColour;
  problem: string;
  member: string;
}

export interface RuleOptions {
  /** Students away for the set: in no group (ticket 250). */
  absent?: readonly string[];
  exception?: ReviewException | null;
  /** A group whose run is scripted: solved or not, by problem id. */
  fixed?: Partial<Record<GroupColour, Record<string, boolean>>>;
}

const STRICT: Record<"one-off" | "repeated" | "pattern", number> = { "one-off": 0, repeated: 1, pattern: 2 };

type Slipped = { misconception: MisconceptionId; leaf: Parameters<typeof columnOf>[0] };

/** Whether a record handed a problem in right first time: reached inside `done` and off the wrong list. */
export const rightFirstTime = (r: Pick<Classmate, "done" | "wrong">, set: SetScope, pid: string): boolean => {
  const i = set.problems.findIndex((p) => p.id === pid);
  return i >= 0 && i < r.done && !r.wrong.includes(pid);
};

/** A record's problems for its group (ticket 278) on a set, in set order: every problem not right first time. */
export const groupProblemsOf = (r: Pick<Classmate, "done" | "wrong">, set: SetScope): string[] => set.problems.filter((p) => !rightFirstTime(r, set, p.id)).map((p) => p.id);

/** The wrong lines' slips on a record's problem (first submission). */
export function slipsOn(r: Classmate, set: SetScope, pid: string): Slipped[] {
  const i = set.problems.findIndex((p) => p.id === pid);
  return (classmateLines(r, set.problems[i], i) ?? []).flatMap((tex) => {
    const v = evaluateLine(pid, tex);
    return v.verdict === "wrong" && v.misconception ? [{ misconception: v.misconception, leaf: v.tags[0].leaf }] : [];
  });
}

/** Whether a first submission on a problem went wrong on exactly one line (the exception's condition). */
export const wrongOnOneLine = (r: Classmate, set: SetScope, pid: string): boolean => slipsOn(r, set, pid).length === 1;

export function reviewByRule(set: SetScope, n: number, everyone: readonly Classmate[], seating: SeatingGroups, options: RuleOptions = {}): { cases: RuleCase[]; groups: GroupCall[] } {
  const { absent = [], exception = null, fixed = {} } = options;
  const index = (pid: string) => set.problems.findIndex((p) => p.id === pid);
  const cases: RuleCase[] = [];
  const groups: GroupCall[] = [];
  for (const colour of GROUP_COLOURS) {
    const members = seating[colour].filter((id) => !absent.includes(id)).flatMap((id) => everyone.filter((r) => r.id === id));
    const brought: { r: Classmate; pid: string; basis: ReviewBasis; slip: ReviewSlip | null }[] = [];
    for (const r of members) {
      for (const pid of groupProblemsOf(r, set)) {
        const q = index(pid) + 1;
        const slips = r.wrong.includes(pid) ? slipsOn(r, set, pid) : [];
        if (slips.length === 0) {
          brought.push({ r, pid, basis: classmateLines(r, set.problems[q - 1], q - 1) ? "incomplete" : "not attempted", slip: null });
          continue;
        }
        let pick: { basis: "one-off" | "repeated" | "pattern"; slip: ReviewSlip } | null = null;
        for (const s of slips) {
          const category = columnOf(s.leaf, set.newSkills) as StoryCategory;
          const cell = STORY[r.id].cells[category][n - 1];
          const pattern = cell.patterns.find((pt) => pt.problems.includes(q)) ?? null;
          const repeated = (pattern !== null && pattern.problems.length > 1) || r.wrong.some((other) => other !== pid && slipsOn(r, set, other).some((o) => o.misconception === s.misconception));
          const basis = cell.status === "gap" ? "pattern" : repeated ? "repeated" : "one-off";
          if (!pick || STRICT[basis] > STRICT[pick.basis]) pick = { basis, slip: { misconception: s.misconception, category, status: cell.status, pattern } };
        }
        brought.push({ r, pid, basis: pick!.basis, slip: pick!.slip });
      }
    }
    for (const p of set.problems) {
      const here = brought.filter((c) => c.pid === p.id);
      if (here.length === 0) continue;
      const q = index(p.id) + 1;
      const helpers = members.filter((m) => rightFirstTime(m, set, p.id)).map((m) => m.id);
      const scripted = fixed[colour]?.[p.id] !== undefined;
      const excepted = !scripted && helpers.length === 0 && exception?.colour === colour && exception.problem === p.id ? exception.member : null;
      const solved = scripted ? fixed[colour]![p.id] : helpers.length > 0 || excepted !== null;
      groups.push({ colour, q, solved, helpers, excepted, scripted });
      for (const c of here) {
        const outcome: ReviewOutcome = c.basis === "one-off" ? "individual" : solved ? "group" : "wrong";
        cases.push({ student: c.r.id, colour, q, outcome, basis: c.basis, slip: c.slip, helpers });
      }
    }
  }
  const order = everyone.map((r) => r.id);
  cases.sort((a, b) => order.indexOf(a.student) - order.indexOf(b.student) || a.q - b.q);
  return { cases, groups };
}
