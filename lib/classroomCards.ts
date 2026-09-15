import { misconceptionName, type MisconceptionId } from "@/data/misconceptions";
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

/** The set's most common mistake cluster: the misconceptions its students slipped with, named as on the Mistakes tab's chips (ticket 299). */
export interface TopGap {
  misconceptions: MisconceptionId[];
  /** The cluster's misconceptions by name, joined: "brackets don't expand back", "root or vertex sign wrong + halving step wrong". */
  name: string;
  /** How many different students are in the cluster on at least one problem. */
  students: number;
}

/**
 * The top gap across a set (tickets 186, 299): a cluster is the exact set of misconceptions a student slipped with
 * in one problem (the Mistakes tab's pill over a group of students, `groupBySlip`), gathered across
 * every problem; the cluster with the most different students wins, a tie going to the cluster seen
 * first in problem order (then row order within the problem). A row with no recognised slip joins
 * no cluster. Null when nobody has slipped.
 */
export function topGap(problems: readonly ProblemMistakes[]): TopGap | null {
  const clusters = new Map<string, { misconceptions: MisconceptionId[]; students: Set<string> }>();
  for (const p of problems) {
    for (const r of p.rows) {
      const misconceptions = [...new Set(r.misconceptions)];
      if (misconceptions.length === 0) continue;
      const key = misconceptions.join("|");
      const cluster = clusters.get(key) ?? { misconceptions, students: new Set<string>() };
      cluster.students.add(r.id);
      clusters.set(key, cluster);
    }
  }
  let best: { misconceptions: MisconceptionId[]; students: Set<string> } | null = null;
  for (const c of clusters.values()) if (!best || c.students.size > best.students.size) best = c;
  return best && { misconceptions: best.misconceptions, name: best.misconceptions.map(misconceptionName).join(" + "), students: best.students.size };
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
  // Live until class review ends (ticket 234): a set in review stays in Live, tagged "in review".
  const section: CardSection = b.kind === "live" && current !== null ? "live" : "past";
  const status: CardStatus = current === null ? "done" : current.id === "working" ? "live" : "in review";
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
