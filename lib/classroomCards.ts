import { misconceptionName, type MisconceptionId } from "@/data/misconceptions";
import { categoryName, categoryOf, leafName, NEW_SKILLS, type LeafId } from "@/data/taxonomy";
import { columnOf } from "./hierarchy";
import { dayLabel, DEMO_TODAY, dueOrder } from "./dueDate";
import { CLASS_HOMEWORK_STORY } from "@/data/homeworks";
import { classHomeworks, futureHomeworks, homeworkColumn, homeworkDoneCount } from "./homeworks";
import { assignmentBundle, assignmentHref, assignmentIds, assignmentStages, currentStageOf, submittedCount, type AssignmentBundle } from "./assignments";
import type { ClassroomState } from "./classroom";
import { mistakesByProblem, type ProblemMistakes } from "./mistakes";
import type { StudentSession } from "./session";

/**
 * The Edexia Classroom's cards (ticket 186): one per assignment the Classroom holds, sorted into
 * LIVE (the class is still working or in a review stage, ticket 234) above PAST (every stage
 * over), each newest due first (ticket 216). Everything on a card is derived from the
 * assignment bundle, the classroom, Sam's session and `now`, the same inputs the assignment's own
 * tabs read, so the live card's counts follow the class as work arrives (ticket 189's stream feeds
 * `rosterProgress` and `mistakesByProblem`, which take `now`). Pure.
 */

/** The class's subject, named in the Classroom's eyebrow ("11MAM2 · Mathematical Methods · 20 students"). One class (ASSUMPTIONS.md, ONE CLASS). */
export const CLASS_SUBJECT = "Mathematical Methods";

/**
 * How many mistakes the class has made on a set so far: every wrong answer to a problem, one per
 * student per problem (a student wrong on Q3 and Q5 counts twice; two wrong lines on one problem
 * count once). The rows of the set's Mistakes tab, so the card and the tab never disagree.
 */
export const mistakeCount = (problems: readonly ProblemMistakes[]): number => problems.reduce((n, p) => n + p.rows.length, 0);

/** How many gaps a card names (ticket 323). */
export const TOP_GAPS = 3;

/** One of a set's most common misconceptions (tickets 299, 323), named as on the Mistakes tab's chips, with the skill it sits under. */
export interface TopGap {
  misconception: MisconceptionId;
  /** The misconception's taxonomy name: "brackets don't expand back". */
  name: string;
  /** How many different students slipped with it on at least one problem. */
  students: number;
  /**
   * The skill its wrong lines are tagged with on this set: the home category's short name ("Algebra"), or, when the
   * skill is one of the set's New skills, that skill's own short name ("surds"), never "New skills". Null when no
   * wrong line carrying it has a tag.
   */
  skill: string | null;
}

/** A skill tag's label on a set (ticket 323): its home category's short name, or its own name when the set lists it as new. */
const skillLabel = (leaf: LeafId, newSkills: readonly LeafId[]): string => (columnOf(leaf, newSkills) === NEW_SKILLS ? leafName(leaf).short : categoryName(categoryOf(leaf)).short);

/**
 * A set's top gaps (tickets 186, 299, 323): every misconception any student slipped with, gathered across every problem,
 * ranked by how many different students slipped with it (a student counts once however many problems or lines), a tie
 * going to the one seen first in problem order, then row order, then line order; the first `n`. Each gap's skill is the
 * label most of its wrong lines' tags carry (`skillLabel`), a tie going to the one seen first. Empty when nobody slipped.
 */
export function topGaps(problems: readonly ProblemMistakes[], newSkills: readonly LeafId[], n: number = TOP_GAPS): TopGap[] {
  const seen = new Map<MisconceptionId, { students: Set<string>; skills: Map<string, number> }>();
  for (const p of problems) {
    for (const r of p.rows) {
      for (const m of r.misconceptions) {
        const gap = seen.get(m) ?? { students: new Set<string>(), skills: new Map<string, number>() };
        gap.students.add(r.id);
        seen.set(m, gap);
      }
      for (const { verdict } of r.lines) {
        if (verdict.verdict !== "wrong" || !verdict.misconception) continue;
        const skills = seen.get(verdict.misconception)?.skills;
        if (!skills) continue;
        for (const label of new Set(verdict.tags.map((t) => skillLabel(t.leaf, newSkills)))) skills.set(label, (skills.get(label) ?? 0) + 1);
      }
    }
  }
  const mostTagged = (skills: Map<string, number>): string | null => [...skills].reduce<[string, number] | null>((best, s) => (!best || s[1] > best[1] ? s : best), null)?.[0] ?? null;
  return [...seen]
    .map(([misconception, g]) => ({ misconception, name: misconceptionName(misconception), students: g.students.size, skill: mostTagged(g.skills) }))
    .sort((a, b) => b.students - a.students)
    .slice(0, n);
}

/** Gaps under one skill, side by side under one wide skill tag (ticket 323). */
export interface GapGroup {
  skill: string | null;
  gaps: TopGap[];
}

/**
 * The card's gaps grouped by skill (ticket 323): gaps sharing a skill sit together under one tag, the groups in the
 * order of their best-ranked gap and each group's gaps in rank order, so the first gap on the card is still the top one.
 */
export function gapGroups(gaps: readonly TopGap[]): GapGroup[] {
  const groups: GapGroup[] = [];
  for (const gap of gaps) {
    const group = gap.skill === null ? undefined : groups.find((g) => g.skill === gap.skill);
    if (group) group.gaps.push(gap);
    else groups.push({ skill: gap.skill, gaps: [gap] });
  }
  return groups;
}

export type CardSection = "live" | "past";
/** The card's status word: `live` while the class works individually, `in review` on a review stage, `done` once every stage is over. */
export type CardStatus = "live" | "in review" | "done";

export interface AssignmentCard {
  id: string;
  /** The set's display name in sentence case (`AssignmentBundle.name`). */
  name: string;
  due: string;
  /** The assignment's landing, which opens Class or Mistakes (ticket 185). */
  href: string;
  section: CardSection;
  status: CardStatus;
  submitted: number;
  total: number;
  /** `mistakeCount` of the set: every row of its Mistakes tab. */
  mistakes: number;
  /** The card's insight (ticket 323): "top gaps" on a past card, "top gaps so far" on a live one; empty when nobody has slipped. */
  topGaps: TopGap[];
}

export function assignmentCard(b: AssignmentBundle, c: ClassroomState | null | undefined, session: StudentSession | null, now: number): AssignmentCard {
  const current = currentStageOf(assignmentStages(b, c, session, now));
  // Live until class review ends (ticket 234): a set in review stays in Live, tagged "in review".
  const section: CardSection = b.kind === "live" && current !== null ? "live" : "past";
  const status: CardStatus = current === null ? "done" : current.id === "working" ? "live" : "in review";
  const mistakes = mistakesByProblem(session, b, now);
  const { submitted, total } = submittedCount(b, session, now);
  return { id: b.id, name: b.name, due: b.due, href: assignmentHref(b.id), section, status, submitted, total, mistakes: mistakeCount(mistakes), topGaps: topGaps(mistakes, b.newSkills) };
}

/** A due date's place in the year (`lib/dueDate.ts`), for sorting. */
export { dueOrder };

/** Cards newest due first (ticket 216); cards due the same day keep the order given. */
export const newestFirst = (cards: readonly AssignmentCard[]): AssignmentCard[] => [...cards].sort((a, b) => dueOrder(b.due) - dueOrder(a.due));

/** The cards in their sections, each newest due first (ticket 216), ties in the order given (the registry's). */
export function sectionCards(bundles: readonly AssignmentBundle[], c: ClassroomState | null | undefined, session: StudentSession | null, now: number): Record<CardSection, AssignmentCard[]> {
  const cards = newestFirst(bundles.map((b) => assignmentCard(b, c, session, now)));
  return { live: cards.filter((k) => k.section === "live"), past: cards.filter((k) => k.section === "past") };
}

/** The Classroom's cards for the sets it holds now. */
export function classroomCards(c: ClassroomState | null | undefined, session: StudentSession | null, now: number): Record<CardSection, AssignmentCard[]> {
  return sectionCards(
    assignmentIds(c).flatMap((id) => assignmentBundle(id, c) ?? []),
    c,
    session,
    now,
  );
}

/**
 * One piece of the homework column beside the teacher's Past cards (ticket 305, replacing ticket 291's homework cards): a
 * homework's cell spans the Past sets it covers (`homeworkColumn`, the rule Sam's column reads, over the class's homeworks),
 * or an empty space beside a Past set no homework covers yet. `row` is the first covered card's index in Past (newest first),
 * `span` how many cards it runs down. A cell reads the class, never one student:
 * - `sent`: sent and not yet open, waiting on `opensAfter`'s lesson ("Problem Set 6"; null if none is named);
 * - `open` (opened, not yet due) and `over` (past its due date): `done` of `total` finished it by the due date, so far while open.
 */
export type TeacherHomeworkPiece =
  | { kind: "homework"; id: string; name: string; due: string; state: "sent" | "open" | "over"; opensAfter: string | null; done: number; total: number; row: number; span: number; setIds: string[] }
  | { kind: "empty"; row: number; span: 1; setIds: [string] };

/** The teacher's homework column beside `past` (the Past cards as listed, newest due first); `today` is the demo's (ticket 289). */
export function teacherHomeworkColumn(past: readonly { id: string; due: string }[], c: ClassroomState | null | undefined, today: string = dayLabel(DEMO_TODAY)): TeacherHomeworkPiece[] {
  const homeworks = classHomeworks(c);
  const future = futureHomeworks(c);
  return homeworkColumn(past, homeworks, {}, today).map((p): TeacherHomeworkPiece => {
    if (p.kind === "empty") return p;
    const hw = homeworks.find((h) => h.id === p.id)!;
    const state = !p.opened ? "sent" : dueOrder(today) > dueOrder(hw.due) ? "over" : "open";
    const { done, total } = homeworkDoneCount(hw, CLASS_HOMEWORK_STORY, today);
    return { kind: "homework", id: p.id, name: p.name, due: p.due, state, opensAfter: future.find((f) => f.id === p.id)?.opensAfter ?? null, done, total, row: p.row, span: p.span, setIds: p.setIds };
  });
}
