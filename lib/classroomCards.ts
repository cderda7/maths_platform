import type { LeafId } from "@/data/taxonomy";
import { leafName } from "@/data/taxonomy";
import { dueOrder } from "./dueDate";
import { assignmentBundle, assignmentHref, assignmentIds, assignmentStages, currentStageOf, submittedCount, type AssignmentBundle } from "./assignments";
import type { ClassroomState } from "./classroom";
import { mistakesByProblem, type ProblemMistakes } from "./mistakes";
import type { StudentSession } from "./session";

/**
 * The Edexia Classroom's cards (ticket 186): one per assignment the Classroom holds, sorted into
 * LIVE (the class is still in individual working) above PAST (a review stage, or every stage
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

/** The set's most common mistake cluster: the leaves its students slipped on, named as on the Mistakes tab's chips. */
export interface TopGap {
  slips: LeafId[];
  /** The cluster's leaves in their short names, joined: "non-monic factorising", "surds + fractions". */
  name: string;
  /** How many different students are in the cluster on at least one problem. */
  students: number;
}

/**
 * The top gap across a set (ticket 186): a cluster is the exact set of leaves a student slipped on
 * in one problem (the Mistakes tab's pill over a group of students, `groupBySlip`), gathered across
 * every problem; the cluster with the most different students wins, a tie going to the cluster seen
 * first in problem order (then row order within the problem). A row with no recognised slip joins
 * no cluster. Null when nobody has slipped.
 */
export function topGap(problems: readonly ProblemMistakes[]): TopGap | null {
  const clusters = new Map<string, { slips: LeafId[]; students: Set<string> }>();
  for (const p of problems) {
    for (const r of p.rows) {
      const slips = [...new Set(r.slips)];
      if (slips.length === 0) continue;
      const key = slips.join("|");
      const cluster = clusters.get(key) ?? { slips, students: new Set<string>() };
      cluster.students.add(r.id);
      clusters.set(key, cluster);
    }
  }
  let best: { slips: LeafId[]; students: Set<string> } | null = null;
  for (const c of clusters.values()) if (!best || c.students.size > best.students.size) best = c;
  return best && { slips: best.slips, name: best.slips.map((l) => leafName(l).short).join(" + "), students: best.students.size };
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
  /** `mistakeCount` of the set: the live card's "7 mistakes so far". */
  mistakes: number;
  /** The past card's insight; computed for every card, null when nobody has slipped. */
  topGap: TopGap | null;
}

export function assignmentCard(b: AssignmentBundle, c: ClassroomState | null | undefined, session: StudentSession | null, now: number): AssignmentCard {
  const current = currentStageOf(assignmentStages(b, c, session, now));
  const section: CardSection = b.kind === "live" && current?.id === "working" ? "live" : "past";
  const status: CardStatus = section === "live" ? "live" : current ? "in review" : "done";
  const mistakes = mistakesByProblem(session, b, now);
  const { submitted, total } = submittedCount(b, session, now);
  return { id: b.id, name: b.name, due: b.due, href: assignmentHref(b.id), section, status, submitted, total, mistakes: mistakeCount(mistakes), topGap: topGap(mistakes) };
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
