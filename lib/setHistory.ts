import type { CategoryId } from "@/data/taxonomy";
import type { Status } from "@/data/types";
import { assignmentBundle, earlierAssignmentIds, studentRecord } from "./assignments";
import { classmateHierarchy } from "./hierarchy";
import { historyDate, historyWith, type HistoryPoint } from "./history";

/**
 * A student's history on a set's Class View (ticket 187): the status each earlier finished set in the
 * registry gave them in the category, dated by the set's due day, after the simulated points that come
 * before them. On Problem Set 6 the newest pill is the student's real Problem Set 5 result; on Problem
 * Set 5 all five are simulated, dated before it. Pure: the finished sets are fixed data, whatever the
 * classroom holds.
 */
export function earlierResults(id: string, student: string, category: CategoryId): HistoryPoint[] {
  return earlierAssignmentIds(id).flatMap((earlier) => {
    const b = assignmentBundle(earlier, null);
    if (!b || b.kind !== "finished") return [];
    const record = studentRecord(b, student);
    // A student the set has no record of never sat it: nothing to show for that date.
    if (!record) return [];
    const status: Status = classmateHierarchy(record, b.problems).categories[category] ?? "unseen";
    return [{ date: historyDate(b.due), status }];
  });
}

/** The five pills above a student's category pill on set `id`'s Class View, oldest first; `today` is the pill itself. */
export function categoryHistory(id: string, student: string, category: CategoryId, today: Status): HistoryPoint[] {
  return historyWith(student, category, today, earlierResults(id, student, category));
}
