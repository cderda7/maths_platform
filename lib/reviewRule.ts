import type { Classmate } from "@/data/classmates";
import { GROUP_COLOURS, type GroupColour, type SeatingGroups } from "@/data/groups";
import { STORY, STORY_SETS, type ReviewOutcome, type StoryCategory, type StoryStatus } from "@/data/story";
import type { MisconceptionId } from "@/data/misconceptions";
import { evaluateLine } from "./evaluate";
import { classmateLines, columnOf, type SetScope } from "./hierarchy";
import { canExplain, fixedInIndividualReview, recordWork, stillToReview } from "./reviewUnion";

/**
 * The agreed rules for what review made of a set record's problems (tickets 244, 281, 332, 338), applied literally so a
 * test can hold the class story sheet's review part to them. Every set runs the one rule (ticket 338 removed ticket 332's
 * Problem Set 6-only scoping).
 *
 * What a member has from their first submission (ticket 278): every problem they did not get right first time, one they
 * got wrong, one they started and left incomplete, and one they did not attempt. An absent member brings nothing (ticket
 * 250). Each such problem has a **basis**:
 * - a **one-off** slip (its mistake made on that one problem of the set, the sheet's pattern for it naming only that
 *   problem, and no gap in its category) is rewritten in individual review, and fixed there when the rewrite holds;
 * - a **repeated** slip, a **pattern** (a gap in the slip's category on the set), a problem left **incomplete** or **not
 *   attempted** is never rewritten alone: it is the group's.
 *
 * What the group works (ticket 332, `lib/reviewUnion.ts`): on a pathway with individual review, only the questions a present
 * member still has once corrections are in (a one-off whose rewrite slipped again included); without it, first
 * submissions. A group with nothing left sits out. The group **solves** a question when a present member can explain it:
 * right first time, or fixed in individual review (a groupmate shows them within one or two tries). A question nobody at
 * the table can explain stays **unsolved**, and the group's last try is its own freshly written working.
 * The one **exception**, at most once per set: a question nobody present could explain that the group still solves,
 * because one member's first submission went wrong on a single line and the hint after the group's second wrong check
 * names exactly that slip (`exception`). Where a set's group run is scripted (`fixed`: the live set's demo group), the
 * script decides, and `data/group-scripts.test.ts` holds the script to these rules.
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
  /** The present groupmates who can explain it: right first time, or (with individual review on the pathway) fixed there. */
  helpers: string[];
}

export interface GroupCall {
  colour: GroupColour;
  q: number;
  solved: boolean;
  /** The present members who can explain it (right first time, or fixed in individual review): the group solves it when there is one. */
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

/** Whether a set's pathway has individual review (every set's does today), so its group review takes the union after corrections (ticket 332). */
export const afterIndividual = (n: number): boolean => STORY_SETS[n - 1].pathway.includes("individual");

/** Whether a record handed a problem in right first time: reached inside `done` and off the wrong list. */
export const rightFirstTime = (r: Pick<Classmate, "done" | "wrong">, set: SetScope, pid: string): boolean => {
  const i = set.problems.findIndex((p) => p.id === pid);
  return i >= 0 && i < r.done && !r.wrong.includes(pid);
};

/** A record's problems not right first time on a set (ticket 278), in set order: what review may take up, in individual review or with the group. */
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
    const after = afterIndividual(n);
    for (const p of set.problems) {
      const here = brought.filter((c) => c.pid === p.id);
      if (here.length === 0) continue;
      const q = index(p.id) + 1;
      const work = (m: Classmate) => recordWork(m, set.problems, p.id);
      const helpers = members.filter((m) => canExplain(p.id, work(m), after)).map((m) => m.id);
      // Ticket 332: the group takes the question only when a present member still has it (after individual review, when the pathway has it).
      const inUnion = members.some((m) => stillToReview(p.id, work(m), after));
      const scripted = fixed[colour]?.[p.id] !== undefined;
      const excepted = inUnion && !scripted && helpers.length === 0 && exception?.colour === colour && exception.problem === p.id ? exception.member : null;
      const solved = scripted ? fixed[colour]![p.id] : helpers.length > 0 || excepted !== null;
      if (inUnion) groups.push({ colour, q, solved, helpers, excepted, scripted });
      for (const c of here) {
        const own = after && fixedInIndividualReview(p.id, work(c.r));
        const outcome: ReviewOutcome = own ? "individual" : solved ? "group" : "wrong";
        cases.push({ student: c.r.id, colour, q, outcome, basis: c.basis, slip: c.slip, helpers });
      }
    }
  }
  const order = everyone.map((r) => r.id);
  cases.sort((a, b) => order.indexOf(a.student) - order.indexOf(b.student) || a.q - b.q);
  return { cases, groups };
}
