import type { Classmate } from "@/data/classmates";
import { NEW_SKILLS, type CategoryId } from "@/data/taxonomy";
import type { Status } from "@/data/types";
import { assignmentBundle, assignmentHref, earlierAssignmentIds, studentRecord, type AssignmentBundle } from "./assignments";
import { categoriesTouched, classmateHierarchy, type SetScope } from "./hierarchy";
import { historyWith, type EarlierResult, type HistoryPoint } from "./history";

/**
 * A student's history on a set's Class View (tickets 187, 215, 237), read from the Classroom's registry: a
 * category's pills are the last five earlier finished sets that assessed it (New skills: every earlier set
 * with New skills), oldest first, each dated by its day. Only those sets: fewer than five shows fewer, none
 * shows none, and a set with no earlier set offers no history at all (ticket 237). A pill opens the student's
 * report on that set inside this set's Class View, with the way back to this student's history. Reads the
 * registry only through `earlierAssignmentIds` and `assignmentBundle`, so every set registered later is picked
 * up as it lands. Pure: the finished sets are fixed data, whatever the classroom holds.
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
    return [{ set: { id: s.id, name: s.name, due: s.due }, status }];
  });
}

/** A history over given sets (the registry's, or a test's): `earlier` the sets before this one, oldest first. */
export function historyFrom(earlier: readonly HistorySource[], student: string, category: CategoryId): HistoryPoint[] {
  return historyWith(resultsFrom(earlier, student, category));
}

/** The registry's finished sets before `id`, oldest first. */
export function earlierSources(id: string): HistorySource[] {
  return earlierAssignmentIds(id).flatMap((e) => {
    const b = assignmentBundle(e, null);
    return b && b.kind === "finished" ? [{ id: b.id, name: b.name, due: b.due, problems: b.problems, newSkills: b.newSkills, record: (student: string) => studentRecord(b, student) }] : [];
  });
}

/** Whether set `id` has any history to show (ticket 237): an earlier finished set. The first set's rows have no "see history". */
export function hasEarlierSets(id: string): boolean {
  return earlierSources(id).length > 0;
}

/** The earlier finished sets' results for a student in a category on set `id`, oldest first. */
export function earlierResults(id: string, student: string, category: CategoryId): EarlierResult[] {
  return resultsFrom(earlierSources(id), student, category);
}

/** The pills above a student's category pill on set `id`'s Class View, oldest first, at most five; none when no earlier set assessed the category. */
export function categoryHistory(id: string, student: string, category: CategoryId): HistoryPoint[] {
  return historyFrom(earlierSources(id), student, category);
}

/**
 * Where a history pill goes (ticket 237): the student's report on the earlier set, shown inside this set's Class View
 * (`?report=<earlier>&student=<student>&open=<category>`), so the teacher never leaves this set; the tabs stay its own.
 */
export function historyReportHref(setId: string, earlierId: string, student: string, category: CategoryId): string {
  return `${assignmentHref(setId, "class")}?report=${encodeURIComponent(earlierId)}&student=${encodeURIComponent(student)}&open=${encodeURIComponent(category)}`;
}

/** The way back from that report: this set's Class View in history mode on the student, the category's stack standing (`?history=<student>&open=<category>`). */
export function historyReturnHref(setId: string, student: string, category: string | null): string {
  return `${assignmentHref(setId, "class")}?history=${encodeURIComponent(student)}${category ? `&open=${encodeURIComponent(category)}` : ""}`;
}

/** The earlier set a Class View's `?report=` names (ticket 237), when it is a finished set before `id` and the student sat it; else null, and the Class View shows its roster. */
export function earlierReportSet(id: string, report: string | null, student: string | null): AssignmentBundle | null {
  if (!report || !student || !earlierAssignmentIds(id).includes(report)) return null;
  const b = assignmentBundle(report, null);
  return b && b.kind === "finished" && studentRecord(b, student) ? b : null;
}
