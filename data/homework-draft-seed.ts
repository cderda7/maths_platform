/**
 * The demo teacher's Homework 3, as "Generate simulated assignment" types it on +Homework's Questions page (ticket 291):
 * the ten problems everyone in the class does this week, on the week's topics, features of a parabola (Problem Set 5)
 * and roots of a quadratic (Problem Set 6). New problems, not copies of either set's. One line per question in the
 * editor's shorthand, as `DEMO_PASTE_LINES` is for Problem Set 6.
 *
 * Two lines are flawed on purpose, so Refine has something to recommend (`HOMEWORK_RECOMMENDATIONS` in `data/review.ts`):
 * Q8 asks for the x-intercepts of a parabola that has none (its turning point sits above the x-axis and it opens
 * upward), and Q9 is Q3 again with the numbers changed.
 */
export const HOMEWORK_PASTE_LINES: readonly string[] = [
  "Find the x-intercepts of the graph of y = x**2 - 2x - 15",
  "State the turning point of the graph of the following, and whether it is a maximum or a minimum. y = -(x+2)**2 + 5",
  "Solve for x. x**2 + 3x - 10 = 0",
  "Solve for x. 2x**2 - 5x - 3 = 0",
  "Solve, giving exact values. x**2 - 6x + 4 = 0",
  "Find the y-intercept and the axis of symmetry of the graph of y = 2x**2 + 12x + 7",
  "For which values of k does the following have two real solutions? x**2 + 4x + k = 0",
  "Find the x-intercepts of the graph of y = (x-3)**2 + 4",
  "Solve for x. x**2 + 2x - 8 = 0",
  "Find the x-intercepts and the turning point of the graph, then sketch it. y = -x**2 + 4x + 5",
];

/** The homework's name as Generate types it: the class's next homework by number ("Homework 3"). */
export const homeworkTitle = (n: number): string => `Homework ${n}`;
