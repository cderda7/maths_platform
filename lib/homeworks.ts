import { HOMEWORKS, SAM_HOMEWORK_STORY, type HomeworkDef, type HomeworkRecord } from "@/data/homeworks";
import { addDays, dayLabel, DEMO_TODAY, DUE_DEFAULT, dueOrder, isIsoDay, laterOf, type IsoDay } from "./dueDate";
import type { ClassroomState, SentHomework } from "./classroom";

/**
 * Homework as a kind of assignment (ticket 290; DECISION_LOG.md 2026-09-15). A homework is weekly: the teacher's ten
 * problems everyone does, plus each student's own problems ever wrong on the in-class sets it covers.
 *
 * - **Coverage by date**: a homework covers the sets due on or after the previous homework's due date and before its own
 *   (`homeworkForDue`). Homework 1 (due Tue 1 Sep) covers Problem Sets 1 and 2; Problem Set 3, due that same Tuesday, is
 *   Homework 2's. Homeworks never overlap (ASSUMPTIONS.md), so every set belongs to at most one.
 * - **Status**: completed when every problem was done by the due date; missed once the due date has passed with problems
 *   undone, and missed is final (finishing later never turns it green); open until then.
 *
 * Pure: the homeworks, the records and the day come in, so a test can play any week.
 */
export type HomeworkStatus = "completed" | "missed" | "open";

/** The homeworks oldest due first (the registry keeps that order; a caller's list may not). */
const oldestFirst = (hws: readonly HomeworkDef[]): HomeworkDef[] => [...hws].sort((a, b) => dueOrder(a.due) - dueOrder(b.due));

/** The homework a set due on `due` goes into: the first, oldest due first, due after it. Undefined past the newest homework, or for a date that does not read as one. */
export function homeworkForDue(due: string, homeworks: readonly HomeworkDef[] = HOMEWORKS): HomeworkDef | undefined {
  const d = dueOrder(due);
  if (d < 0) return undefined;
  return oldestFirst(homeworks).find((h) => d < dueOrder(h.due));
}

/** The sets a homework covers, in the order given: those whose due date falls in its window (`homeworkForDue`). */
export function coveredSetIds(homework: HomeworkDef, sets: readonly { id: string; due: string }[], homeworks: readonly HomeworkDef[] = HOMEWORKS): string[] {
  return sets.filter((s) => homeworkForDue(s.due, homeworks)?.id === homework.id).map((s) => s.id);
}

/** A student's status on a homework on `today`. No record reads as nothing done. */
export function homeworkStatus(homework: HomeworkDef, record: HomeworkRecord | undefined, today: string): HomeworkStatus {
  const due = dueOrder(homework.due);
  const finished = record?.finishedOn ? dueOrder(record.finishedOn) : -1;
  if (finished >= 0 && finished <= due) return "completed";
  return dueOrder(today) > due ? "missed" : "open";
}

/** A missed homework's cell note: its own undone problems join the next homework (ticket 294). */
export const MISSED_NOTE = "problems added to next HW";

/**
 * One piece of the Classroom's homework column (ticket 290), beside Sam's Completed cards: a homework's cell spanning the
 * rows of the Completed sets it covers, or the empty space beside a Completed set no homework covers yet. `row` is the
 * first covered card's index in the Completed list (newest first), `span` how many cards it runs down.
 */
export type HomeworkColumnPiece =
  | { kind: "homework"; id: string; n: number; name: string; due: string; status: HomeworkStatus; row: number; span: number; setIds: string[] }
  | { kind: "empty"; row: number; span: 1; setIds: [string] };

/**
 * The homework column beside Completed cards (newest due first, as `studentClassroom` lists them). A homework's covered
 * Completed sets are adjacent in that list (a date window over a date order), so each homework is one cell; a homework
 * with none of its sets Completed has no cell. Defaults: the class's homeworks, Sam's records, the demo's today (`DEMO_TODAY`, ticket 289).
 */
export function homeworkColumn(
  completed: readonly { id: string; due: string }[],
  homeworks: readonly HomeworkDef[] = HOMEWORKS,
  records: Readonly<Record<string, HomeworkRecord>> = SAM_HOMEWORK_STORY,
  today: string = dayLabel(DEMO_TODAY),
): HomeworkColumnPiece[] {
  const pieces: HomeworkColumnPiece[] = [];
  completed.forEach((card, row) => {
    const hw = homeworkForDue(card.due, homeworks);
    const last = pieces[pieces.length - 1];
    if (!hw) pieces.push({ kind: "empty", row, span: 1, setIds: [card.id] });
    else if (last?.kind === "homework" && last.id === hw.id) {
      last.span++;
      last.setIds.push(card.id);
    } else pieces.push({ kind: "homework", id: hw.id, n: hw.n, name: hw.name, due: hw.due, status: homeworkStatus(hw, records[hw.id], today), row, span: 1, setIds: [card.id] });
  });
  return pieces;
}

/** A sent homework (ticket 291) read as the fixtures' homeworks are. */
export const homeworkDefOf = (h: SentHomework): HomeworkDef => ({ kind: "homework", id: h.id, n: h.n, name: h.name, due: dayLabel(h.due), day: h.due });

/**
 * The class's homeworks, oldest due first (ticket 291): the fixtures' Homework 1 and 2, then every homework the teacher has
 * sent from +Homework (`ClassroomState.homeworks`). The one list every homework rule reads (`homeworkForDue`, `coveredSetIds`,
 * `homeworkColumn`, `nextHomework`), so a sent Homework 3 covers Problem Sets 5 and 6 as the date rule says.
 */
export function classHomeworks(c: ClassroomState | null | undefined): HomeworkDef[] {
  const sent = (c?.homeworks ?? []).filter((h) => isIsoDay(h.due)).map(homeworkDefOf);
  return oldestFirst([...HOMEWORKS, ...sent]);
}

/**
 * Whether a homework has opened to the students, its contents frozen (ticket 292 opens a sent one and stamps `openedAt`).
 * The fixtures' Homework 1 and 2 opened long ago; a sent homework waits until it is stamped.
 */
export function homeworkOpened(homework: Pick<HomeworkDef, "id">, c: ClassroomState | null | undefined): boolean {
  const sent = c?.homeworks?.find((h) => h.id === homework.id);
  return sent ? sent.openedAt !== undefined : HOMEWORKS.some((h) => h.id === homework.id);
}

/** The homework +Homework creates next: its number, the earliest due date the picker offers, and where the picker starts. */
export interface NextHomework {
  n: number;
  id: string;
  /** The newest homework before it, whose due date its own must come after. */
  previous: HomeworkDef | null;
  /** The day after the previous homework's due date, and never before today. */
  min: IsoDay;
  /** A week after the previous homework's due date (Mon 14 Sep for Homework 3, `DUE_DEFAULT.homework`), never before `min`. */
  due: IsoDay;
}

export function nextHomework(c: ClassroomState | null | undefined, today: IsoDay = DEMO_TODAY): NextHomework {
  const list = classHomeworks(c);
  const previous = list[list.length - 1] ?? null;
  const n = (previous?.n ?? 0) + 1;
  const min = previous ? laterOf(today, addDays(previous.day, 1)) : today;
  const weekOn = previous ? laterOf(DUE_DEFAULT.homework, addDays(previous.day, 7)) : DUE_DEFAULT.homework;
  return { n, id: `hw-${n}`, previous, min, due: laterOf(weekOn, min) };
}

/**
 * The line under an in-class set's due date on Create (ticket 291): a set due inside a homework that has already opened
 * cannot join it (its contents froze at opening, ticket 292), so its mistakes go into the next homework, "Homework N".
 * Null when the date falls in a homework not yet open (the set simply joins it) or in none.
 */
export function psetDueNote(due: IsoDay, c: ClassroomState | null | undefined): string | null {
  const hw = homeworkForDue(dayLabel(due), classHomeworks(c));
  return hw && homeworkOpened(hw, c) ? `Mistakes from this set go into Homework ${hw.n + 1}` : null;
}

/** Sam's homework history (`SAM_HOMEWORK_STORY`), for a homework's card: his status on it on `today`. */
export const samHomeworkStatus = (homework: HomeworkDef, today: string = dayLabel(DEMO_TODAY)): HomeworkStatus => homeworkStatus(homework, SAM_HOMEWORK_STORY[homework.id], today);
