import { HOMEWORKS, SAM_HOMEWORK_STORY, type HomeworkDef, type HomeworkRecord } from "@/data/homeworks";
import { storySet } from "@/data/story";
import { activeAssignment } from "./assignment";
import { assignmentBundle, assignmentIds, LIVE_ASSIGNMENT_ID } from "./assignments";
import { addDays, dayLabel, DEMO_TODAY, DUE_DEFAULT, dueOrder, isIsoDay, laterOf, type IsoDay } from "./dueDate";
import { lessonOver, type ClassroomState, type SentHomework } from "./classroom";

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

/**
 * The homework a set goes into (ticket 292): the one that froze it at opening; else the date rule's (`homeworkForDue`), passing
 * over every homework that opened without it, so a set created after its homework opened goes to the next one. Undefined when
 * no homework takes it yet (the next one is not created).
 */
export function homeworkForSet(set: { id: string; due: string }, homeworks: readonly HomeworkDef[] = HOMEWORKS): HomeworkDef | undefined {
  const list = oldestFirst(homeworks);
  const frozen = list.find((h) => h.setIds?.includes(set.id));
  if (frozen) return frozen;
  const byDate = homeworkForDue(set.due, list);
  return byDate && list.slice(list.indexOf(byDate)).find((h) => !h.setIds);
}

/** The sets a homework covers, in the order given (`homeworkForSet`: frozen at opening, else by date). */
export function coveredSetIds(homework: HomeworkDef, sets: readonly { id: string; due: string }[], homeworks: readonly HomeworkDef[] = HOMEWORKS): string[] {
  return sets.filter((s) => homeworkForSet(s, homeworks)?.id === homework.id).map((s) => s.id);
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
/** The same note once that next homework has opened and is under way (ticket 292). */
export const MISSED_NOTE_CURRENT = "problems added to current HW";

/**
 * One piece of the Classroom's homework column (ticket 290), beside Sam's Completed cards: a homework's cell spanning the
 * rows of the Completed sets it covers, or the empty space beside a Completed set no homework covers yet. `row` is the
 * first covered card's index in the Completed list (newest first), `span` how many cards it runs down.
 */
export type HomeworkColumnPiece =
  | { kind: "homework"; id: string; n: number; name: string; due: string; status: HomeworkStatus; /** Opened to the students (ticket 292): the cell opens the homework; not yet, it waits in the Future panel. */ opened: boolean; row: number; span: number; setIds: string[] }
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
    const hw = homeworkForSet(card, homeworks);
    const last = pieces[pieces.length - 1];
    if (!hw) pieces.push({ kind: "empty", row, span: 1, setIds: [card.id] });
    else if (last?.kind === "homework" && last.id === hw.id) {
      last.span++;
      last.setIds.push(card.id);
    } else pieces.push({ kind: "homework", id: hw.id, n: hw.n, name: hw.name, due: hw.due, status: homeworkStatus(hw, records[hw.id], today), opened: !!hw.setIds, row, span: 1, setIds: [card.id] });
  });
  return pieces;
}

/** A sent homework (ticket 291) read as the fixtures' homeworks are. */
export const homeworkDefOf = (h: SentHomework): HomeworkDef => ({ kind: "homework", id: h.id, n: h.n, name: h.name, due: dayLabel(h.due), day: h.due, ...(h.openedAt !== undefined ? { setIds: [...(h.setIds ?? [])] } : {}) });

/**
 * The class's homeworks, oldest due first (ticket 291): the fixtures' Homework 1 and 2, then every homework the teacher has
 * sent from +Homework (`ClassroomState.homeworks`). The one list every homework rule reads (`homeworkForDue`, `coveredSetIds`,
 * `homeworkColumn`, `nextHomework`), so a sent Homework 3 covers Problem Sets 5 and 6 as the date rule says.
 */
export function classHomeworks(c: ClassroomState | null | undefined): HomeworkDef[] {
  return listOf(openHomeworks(c));
}

const listOf = (c: ClassroomState | null | undefined): HomeworkDef[] => oldestFirst([...HOMEWORKS, ...(c?.homeworks ?? []).filter((h) => isIsoDay(h.due)).map(homeworkDefOf)]);

/**
 * Whether a homework has opened to the students, its contents frozen (ticket 292, `openHomeworks`). The fixtures' Homework 1
 * and 2 opened long ago; a sent homework opens when the last lesson among its sets ends.
 */
export function homeworkOpened(homework: Pick<HomeworkDef, "id">, c: ClassroomState | null | undefined): boolean {
  return !!classHomeworks(c).find((h) => h.id === homework.id)?.setIds;
}

/**
 * A set a homework can cover (ticket 292): every set in the Classroom, and the live set (Problem Set 6) even before its Create,
 * since it is the lesson the week already has in the timetable; with its due date (the teacher's pick once created), its short
 * name, and whether its lesson is over: a finished set's always, the live set's once it is sent and its lesson has ended however
 * it ended (the teacher's end lesson after its minute, the presenter's activity completed, class review ended: `lessonOver`).
 */
export interface HomeworkSet {
  id: string;
  due: string;
  /** "Problem Set 6". */
  name: string;
  lessonOver: boolean;
}

/** The sets homework rules read, oldest due first. */
export function homeworkSets(c: ClassroomState | null | undefined): HomeworkSet[] {
  const ids = assignmentIds(c);
  const sets = [...(ids.includes(LIVE_ASSIGNMENT_ID) ? [] : [LIVE_ASSIGNMENT_ID]), ...ids].map((id): HomeworkSet => {
    const live = id === LIVE_ASSIGNMENT_ID;
    const name = (storySet(id)?.name ?? assignmentBundle(id, c)?.name ?? id).split(" — ")[0].trim();
    return { id, due: live ? activeAssignment(c).due : (assignmentBundle(id, c)?.due ?? ""), name, lessonOver: live ? !!c?.assignment && lessonOver(c) : true };
  });
  return sets.sort((a, b) => dueOrder(a.due) - dueOrder(b.due));
}

const opened = new WeakMap<ClassroomState, ClassroomState>();

/**
 * The classroom with every sent homework that is due to open, opened (ticket 292; DECISION_LOG.md 2026-09-15). A homework
 * opens when the last lesson among the sets it covers ends; if they had all ended when it was sent, it opens at once. Opening
 * stamps `openedAt` (that lesson's `lessonEndedAt`, never before `sentAt`: a moment every tab computes alike) and freezes
 * `setIds`, the sets it covers then; from that moment a set created in its window goes to the next homework (`homeworkForSet`).
 *
 * Pure and idempotent: the store writes it on every change (`setClassroom`), and every reader goes through it
 * (`classHomeworks`), so a tab holding a state stored before the stamp reads the same. The same object back when nothing opens.
 */
export function openHomeworks<C extends ClassroomState | null | undefined>(c: C): C {
  if (!c?.homeworks?.some((h) => h.openedAt === undefined)) return c;
  const hit = opened.get(c);
  if (hit) return hit as C;
  let next: ClassroomState = c;
  for (const h of c.homeworks) {
    if (h.openedAt !== undefined || !isIsoDay(h.due)) continue;
    const list = listOf(next);
    const covered = homeworkSets(next).filter((s) => homeworkForSet(s, list)?.id === h.id);
    if (!covered.every((s) => s.lessonOver)) continue;
    const endedAt = covered.some((s) => s.id === LIVE_ASSIGNMENT_ID) ? next.lessonEndedAt : undefined;
    const stamp: SentHomework = { ...h, openedAt: Math.max(h.sentAt, endedAt ?? h.sentAt), setIds: covered.map((s) => s.id) };
    next = { ...next, homeworks: next.homeworks!.map((x) => (x.id === h.id ? stamp : x)) };
  }
  opened.set(c, next);
  return next as C;
}

/** A homework waiting in Sam's Future panel (ticket 292): sent, not yet open. */
export interface FutureHomework {
  id: string;
  name: string;
  due: string;
  /** The set whose lesson it waits on, the last among its sets not over ("Problem Set 6"); null if none is named. */
  opensAfter: string | null;
}

/** Every sent homework not yet open, oldest due first. Empty when nothing is scheduled: the panel is hidden. */
export function futureHomeworks(c: ClassroomState | null | undefined): FutureHomework[] {
  const list = classHomeworks(c);
  const sets = homeworkSets(openHomeworks(c));
  return list
    .filter((h) => !h.setIds)
    .map((h) => {
      const waiting = sets.filter((s) => !s.lessonOver && homeworkForSet(s, list)?.id === h.id);
      return { id: h.id, name: h.name, due: h.due, opensAfter: waiting[waiting.length - 1]?.name ?? null };
    });
}

/**
 * The homeworks open for Sam to do (ticket 292), the first cards in his To do: opened, and neither completed nor missed on
 * `today` (a missed one leaves To do, ticket 290's rule). Newest due first.
 */
export function openHomeworksFor(c: ClassroomState | null | undefined, records: Readonly<Record<string, HomeworkRecord>> = SAM_HOMEWORK_STORY, today: string = dayLabel(DEMO_TODAY)): HomeworkDef[] {
  return classHomeworks(c)
    .filter((h) => !!h.setIds && homeworkStatus(h, records[h.id], today) === "open")
    .reverse();
}

/** A missed homework's note: "next HW" until the homework after it is open for Sam, then "current HW" (ticket 292). */
export function missedNote(homework: Pick<HomeworkDef, "id">, c: ClassroomState | null | undefined, records: Readonly<Record<string, HomeworkRecord>> = SAM_HOMEWORK_STORY, today: string = dayLabel(DEMO_TODAY)): string {
  const list = classHomeworks(c);
  const after = list[list.findIndex((h) => h.id === homework.id) + 1];
  return after && openHomeworksFor(c, records, today).some((h) => h.id === after.id) ? MISSED_NOTE_CURRENT : MISSED_NOTE;
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
