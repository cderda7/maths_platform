import { DEFAULT_GROUPS, GROUP_COLOURS, GROUP_SIZE, type GroupColour, type SeatingGroups } from "@/data/groups";

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
