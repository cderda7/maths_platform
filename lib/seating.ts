import { DEFAULT_GROUPS, FROZEN_GROUPS, GROUP_COLOURS, GROUP_SIZE, type GroupColour, type SeatingGroups } from "@/data/groups";
import type { ClassroomState } from "./classroom";
import { finishedSetById } from "./finishedSets";

/** The teacher's seating groups: pure rules over the colour → members map the classroom keeps. */

export const groupOfStudent = (groups: SeatingGroups, studentId: string): GroupColour | null => GROUP_COLOURS.find((c) => groups[c].includes(studentId)) ?? null;

/** Move a student to a colour; a move to their own group, or of an unknown student, changes nothing. */
export function moveStudent(groups: SeatingGroups, studentId: string, to: GroupColour): SeatingGroups {
  const from = groupOfStudent(groups, studentId);
  if (!from || from === to) return groups;
  return { ...groups, [from]: groups[from].filter((id) => id !== studentId), [to]: [...groups[to], studentId] };
}

/** Colours whose group is not the intended size: allowed, flagged. */
export const unevenGroups = (groups: SeatingGroups): GroupColour[] => GROUP_COLOURS.filter((c) => groups[c].length !== GROUP_SIZE);

/** A stored classroom from before seating groups existed has none: the default fixture. */
export const seatingOf = (groups: SeatingGroups | undefined | null): SeatingGroups => groups ?? DEFAULT_GROUPS;

/** Every student in every group, once. */
export const seated = (groups: SeatingGroups): string[] => GROUP_COLOURS.flatMap((c) => groups[c]);

/**
 * An assignment's groups: its own stored copy, else the fixture copy frozen with it (the live set's
 * `FROZEN_GROUPS`, a finished set's `groups`, ticket 210), else the default fixture. Never the class's
 * live defaults, so editing those never moves an assignment's groups (ticket 185).
 */
export function assignmentGroupsOf(c: ClassroomState | null | undefined, id: string): SeatingGroups {
  return c?.assignmentGroups?.[id] ?? FROZEN_GROUPS[id] ?? finishedSetById(id)?.groups ?? DEFAULT_GROUPS;
}
