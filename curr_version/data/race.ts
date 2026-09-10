import type { GroupColour } from "./groups";

/**
 * The other groups' race, scripted: seconds after group review starts at which each problem of a
 * group's union checks correct, in union order. The demo student's group runs live on the
 * whiteboard and never reads its colour's row; the four others are pure functions of the clock.
 * Tuned so that two groups finish before the demo group plausibly does (about five to six
 * minutes) and two after, inside ten minutes. A union longer than its row carries on at the
 * row's last gap; a shorter one finishes at its own last moment. Sizes below match the default
 * seating and the classmates' wrong lists (mint 3 · amber 6 · coral 6 · violet 5).
 */
export const RACE_SCHEDULE: Record<GroupColour, number[]> = {
  mint: [70, 150, 220],
  amber: [35, 80, 130, 185, 240, 290],
  coral: [60, 150, 260, 360, 460, 550],
  violet: [80, 200, 330, 470, 590],
  sky: [50, 110, 190, 270, 350, 420],
};
