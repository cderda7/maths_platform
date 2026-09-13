import type { Classmate } from "@/data/classmates";
import { NEW_SKILLS, type CategoryId } from "@/data/taxonomy";
import type { Status } from "@/data/types";
import { assignmentBundle, assignmentHref, earlierAssignmentIds, studentRecord } from "./assignments";
import { categoriesTouched, classmateHierarchy, type SetScope } from "./hierarchy";
import { historyWith, shortSetName, type EarlierResult, type HistoryPoint } from "./history";

/**
 * A student's history on a set's Class View (tickets 187, 215), read from the Classroom's registry: a
 * category's pills are the last five earlier finished sets that assessed it (New skills: every earlier set
 * with New skills), oldest first, each dated by its day and linking to that set's Class View; simulated
 * points fill the top when there are fewer (`lib/history.ts`). Reads the registry only through
 * `earlierAssignmentIds` and `assignmentBundle`, so every set registered later is picked up as it lands.
 * Pure: the finished sets are fixed data, whatever the classroom holds.
 */

/** One earlier set as the history needs it: its name and day, what it assessed, and each student's record on it. */
export interface HistorySource extends SetScope {
  id: string;
  name: string;
  due: string;
  record: (student: string) => Classmate | null;
}

/** Whether a set assessed a category: its problems touch it (a home category), or it has New skills. */
export function assessed(set: SetScope, category: CategoryId): boolean {
  return category === NEW_SKILLS ? set.newSkills.length > 0 : categoriesTouched(set).includes(category);
}

/**
 * The student's result on each of `sets` (oldest first) that assessed the category. A set with no record of
 * the student (never sat it) is skipped; a record with nothing seen in the category is a hollow pill.
 */
export function resultsFrom(sets: readonly HistorySource[], student: string, category: CategoryId): EarlierResult[] {
  return sets.flatMap((s) => {
    if (!assessed(s, category)) return [];
    const record = s.record(student);
    if (!record) return [];
    const status: Status = classmateHierarchy(record, s).categories[category] ?? "unseen";
    return [{ set: { id: s.id, short: shortSetName(s.name), name: s.name, due: s.due }, status }];
  });
}

/**
 * A history over given sets (the registry's, or a test's): `earlier` the sets before this one, oldest first;
 * `ownDue` this set's day, the first set's when nothing came before.
 */
export function historyFrom(earlier: readonly HistorySource[], ownDue: string, student: string, category: CategoryId, today: Status): HistoryPoint[] {
  return historyWith(student, category, today, resultsFrom(earlier, student, category), earlier[0]?.due ?? ownDue);
}

/** The registry's finished sets before `id`, oldest first. */
export function earlierSources(id: string): HistorySource[] {
  return earlierAssignmentIds(id).flatMap((e) => {
    const b = assignmentBundle(e, null);
    return b && b.kind === "finished" ? [{ id: b.id, name: b.name, due: b.due, problems: b.problems, newSkills: b.newSkills, record: (student: string) => studentRecord(b, student) }] : [];
  });
}

/** The earlier finished sets' results for a student in a category on set `id`, oldest first. */
export function earlierResults(id: string, student: string, category: CategoryId): EarlierResult[] {
  return resultsFrom(earlierSources(id), student, category);
}

/** The five pills above a student's category pill on a set's Class View, oldest first; `today` is the pill itself. */
export function categoryHistory(set: { id: string; due: string }, student: string, category: CategoryId, today: Status): HistoryPoint[] {
  return historyFrom(earlierSources(set.id), set.due, student, category, today);
}

/**
 * Where a real pill goes: that set's Class View, with the student in history mode and the category's stack open
 * (`?history=<student>&open=<category>`), so the teacher reads the same student one set further back.
 */
export function historyPillHref(setId: string, student: string, category: CategoryId): string {
  return `${assignmentHref(setId, "class")}?history=${encodeURIComponent(student)}&open=${encodeURIComponent(category)}`;
}
