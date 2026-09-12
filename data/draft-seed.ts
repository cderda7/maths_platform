import { ASSIGNMENT } from "./assignment";

/**
 * The demo teacher's draft, as typed on the create screen (ticket 121): the bank's set in the
 * editor's own shorthand, one line per question. The create screen seeds an empty store with it,
 * so the teacher lands mid-creation with the ten tiles filled rather than at a blank (the user,
 * 2026-09-11: "i don't want this blank view -- i want it prefilled for now"). Two lines differ
 * from the bank on purpose, for the review step (ticket 120) to have something to recommend: Q1
 * is `x^2 + 5x + 6 = 0` (the bank's is −5x) and the ball problem's slot is a repeat of Q3's
 * shape. The bank itself is untouched; the student side reads the bank until an assignment is
 * created.
 */
export const DEMO_PASTE_LINES: readonly string[] = [
  "Solve for x. x**2 + 5x + 6 = 0",
  "Solve for x. 2x**2 + 7x - 4 = 0",
  "Find all values of x for which the following holds. (x-3)(x+2) = 6",
  "Solve, giving exact values. 3x**2 - 5x - 1 = 0",
  "Find the x-intercepts and the turning point of the graph of y = x**2 - 4x - 5",
  "For which value of k does the graph of the following touch the x-axis exactly once? y = x**2 + 6x + k",
  "Factorise fully. 1/3x**2 + 2x + 8/3",
  "The graph of the following is shown. Read off its x-intercepts and check them. y = x**2 - 4x + 3",
  "Solve for x. (x+1)(x-4) = 6",
  "Show that the following has no real solutions, and say what that means for the graph of y = x**2 + 4x + 5. x**2 + 4x + 5 = 0",
];

/** The same ten, as one block for a paste. */
export const DEMO_PASTE = DEMO_PASTE_LINES.join("\n");

/** The draft's title: the bank's set, as the teacher would type it (the bank's own is upper-cased for the student's eyebrow). */
export const DEMO_DRAFT_TITLE = "Roots of a quadratic — Set 3";

/** The draft's goal for the class (ticket 154): the fixture's, so the create screen opens with the message written and the student sees the same one either way. */
export const DEMO_DRAFT_GOAL = ASSIGNMENT.goal;
