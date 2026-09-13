import { ASSIGNMENT, DEMO_STUDENT } from "./assignment";

/**
 * Seating groups: five static groups the teacher sets by hand, in practice the seating chart.
 * A group's only identity is its colour, chosen to read on a projector and to imply no order.
 * The default is a fixture; the teacher rearranges it on the groups page and the classroom
 * keeps the result per class.
 */
export const GROUP_COLOURS = ["coral", "amber", "mint", "sky", "violet"] as const;
export type GroupColour = (typeof GROUP_COLOURS)[number];

export const GROUP_HEX: Record<GroupColour, { fill: string; soft: string }> = {
  coral: { fill: "#e07a6b", soft: "#fbe9e6" },
  amber: { fill: "#d9a441", soft: "#faf1dd" },
  mint: { fill: "#5fb894", soft: "#e6f5ee" },
  sky: { fill: "#4f8fd6", soft: "#e6f0fb" },
  violet: { fill: "#8b6fd6", soft: "#eee9fa" },
};

export type SeatingGroups = Record<GroupColour, string[]>;

/** Twenty students, four to a group. The demo student sits in sky with the three groupmates of ticket 08. */
export const DEFAULT_GROUPS: SeatingGroups = {
  coral: ["priya", "amelia", "tomas", "aiden"],
  amber: ["mia", "noah", "chloe", "ethan"],
  mint: ["isla", "lucas", "grace", "harper"],
  sky: [DEMO_STUDENT.id, "jordan", "zara", "liam"],
  violet: ["oliver", "ruby", "finn", "sofia"],
};

/**
 * Each fixed assignment's frozen copy of the groups, as it was taken when the set was created
 * (ticket 185): what the assignment's Groups tab shows until the teacher moves someone there.
 * Problem Set 2's is the class default fixture; ticket 187 adds Problem Set 1's.
 */
export const FROZEN_GROUPS: Record<string, SeatingGroups> = { [ASSIGNMENT.id]: DEFAULT_GROUPS };

/** The intended group size; a group of any other size is flagged, never refused. */
export const GROUP_SIZE = 4;
