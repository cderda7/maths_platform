import { DEMO_ABSENCES } from "@/data/absences";
import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { GROUP_COLOURS, type SeatingGroups } from "@/data/groups";
import type { ClassroomState } from "./classroom";

/**
 * Absent students (ticket 250): per assignment, the students the teacher has marked as not in the room. An
 * absent student stays on the Class View roster, greyed, and leaves everything the class is counted by on
 * that assignment: numerator and denominator (a fraction reads x/19 with one away), the stage counts, the
 * gate into group review, the diagnostic's answers, the class review's examples, and their seating group
 * for that assignment's group review (a group of four with one away is a group of three). The class's
 * default groups and every other assignment are untouched. Pure. See DECISION_LOG.md, 2026-09-14
 * (absent students leave the counts).
 */

/** An assignment's absent students: the classroom's list once the teacher has marked anyone on it, else the demo's (`DEMO_ABSENCES`). */
export function absentOf(c: ClassroomState | null | undefined, assignmentId: string): readonly string[] {
  return c?.absences?.[assignmentId] ?? DEMO_ABSENCES[assignmentId] ?? [];
}

/** The live set's absent students: the lesson running now (Problem Set 6). */
export const liveAbsent = (c: ClassroomState | null | undefined): readonly string[] => absentOf(c, ASSIGNMENT.id);

/**
 * A list with `student` marked absent or present; the same list when nothing changes. The demo student on the live
 * set is never absent: his own iPad is running the set, so he is in the room (`absence/set` refuses it).
 */
export function withAbsence(list: readonly string[], student: string, absent: boolean): readonly string[] {
  const has = list.includes(student);
  if (has === absent) return list;
  return absent ? [...list, student] : list.filter((id) => id !== student);
}

/** Whether the roster offers the toggle: every row but the live student's on the live set. */
export const canMarkAbsent = (assignmentKind: "live" | "finished", student: string): boolean => assignmentKind !== "live" || student !== DEMO_STUDENT.id;

/** The ids of those present, in the order given. */
export const presentOf = <T extends string>(ids: readonly T[], absent: readonly string[]): T[] => ids.filter((id) => !absent.includes(id));

/** The class counted on an assignment: the demo student and the classmates, less the absent. */
export const presentCount = (classmates: readonly { id: string }[], absent: readonly string[]): number => presentOf([DEMO_STUDENT.id, ...classmates.map((m) => m.id)], absent).length;

/** The seating groups for group review: each colour's members with the absent left out. Seats stay where the teacher put them. */
export function presentGroups(groups: SeatingGroups, absent: readonly string[]): SeatingGroups {
  if (absent.length === 0) return groups;
  return Object.fromEntries(GROUP_COLOURS.map((c) => [c, presentOf(groups[c], absent)])) as SeatingGroups;
}
