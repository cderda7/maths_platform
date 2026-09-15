import { misconceptionName, type MisconceptionId } from "@/data/misconceptions";
import { dayLabel, DEMO_TODAY, dueOrder } from "./dueDate";
import { classHomeworks, coveredSetIds, homeworkOpened, samHomeworkStatus, type HomeworkStatus } from "./homeworks";
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
 * A homework on the teacher's Classroom (ticket 291): Homework 1 and 2 from the fixtures and every homework sent from
 * +Homework, in Past among the sets, newest due first. It opens nothing (a teacher view of homework results is future work).
 * - `state`: `sent` while it waits for its sets' lessons to end (ticket 292 opens it), `open` once opened and not yet due,
 *   `over` once its due date is behind today, when Sam's status on it shows (`sam`, from his homework history).
 * - `sets`: the sets it covers by the date rule (`coveredSetIds`), named as the teacher names them ("Problem Set 5").
 */
export interface HomeworkCard {
  kind: "homework";
  id: string;
  name: string;
  due: string;
  sets: string[];
  state: "sent" | "open" | "over";
  sam: HomeworkStatus;
}

export type ClassroomCard = AssignmentCard | HomeworkCard;

export const isHomeworkCard = (card: ClassroomCard): card is HomeworkCard => (card as HomeworkCard).kind === "homework";

/** A set's short name, before the dash of its topic: "Problem Set 5 — Features of a parabola" is "Problem Set 5". */
const shortSetName = (name: string): string => name.split(" — ")[0].trim();

/** The sets a homework covers, in a phrase: "Problem Set 5", "Problem Sets 1 and 2", "Problem Sets 3, 4 and 5". */
export function coveredSetsPhrase(names: readonly string[]): string {
  if (names.length === 0) return "";
  const nums = names.map((n) => /^Problem Set (\S+)$/.exec(n)?.[1]);
  const parts = nums.every((x) => x !== undefined) && names.length > 1 ? (nums as string[]) : [...names];
  const list = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
  return parts === nums ? `Problem Sets ${list}` : list;
}

/** The class's homeworks as the Classroom's cards (ticket 291), oldest due first; `today` is the demo's (ticket 289). */
export function homeworkCards(c: ClassroomState | null | undefined, today: string = dayLabel(DEMO_TODAY)): HomeworkCard[] {
  const homeworks = classHomeworks(c);
  // Oldest first, so a set's name reads in the order the class met them.
  const sets = assignmentIds(c)
    .flatMap((id) => assignmentBundle(id, c) ?? [])
    .sort((a, b) => dueOrder(a.due) - dueOrder(b.due));
  return homeworks.map((hw) => {
    const covered = new Set(coveredSetIds(hw, sets, homeworks));
    const over = dueOrder(today) > dueOrder(hw.due);
    const state = over ? "over" : homeworkOpened(hw, c) ? "open" : "sent";
    return { kind: "homework", id: hw.id, name: hw.name, due: hw.due, sets: sets.filter((b) => covered.has(b.id)).map((b) => shortSetName(b.name)), state, sam: samHomeworkStatus(hw, today) };
  });
}

/**
 * Past with the homework cards among the sets (ticket 291), newest due first; a set due on a homework's own due date sits
 * above it, as it belongs to the next homework (`homeworkForDue`).
 */
export function pastWithHomework(past: readonly AssignmentCard[], homework: readonly HomeworkCard[]): ClassroomCard[] {
  return [...past, ...homework].sort((a, b) => dueOrder(b.due) - dueOrder(a.due));
}
