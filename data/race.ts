import type { GroupColour } from "./groups";

/**
 * The other groups' race, scripted: seconds after group review starts at which each problem of a
 * group's union checks correct, in union order. The demo student's group runs live on the
 * whiteboard and never reads its colour's row; the four others are pure functions of the clock.
 * Re-timed for ticket 278 (every problem a member did not get right joins the union, so the unions grew): the demo
 * group's board is nine problems since ticket 281 (Q4 left it; Q5 gained Liam's slip as a first try, so the board is as long), five and a half minutes at the quickest (every peer turn as scripted, Sam
 * writing fast) and plausibly six to eight with a presenter, so two groups finish before it (4:15 and 4:25, before even the click-through's instant presenter at about 5:00) and two
 * after (10:10 and 11:00), inside twelve. The gaps stay between 30 and 100 seconds so no
 * bar jumps or finishes at once. A union longer than its row carries on at the row's last gap; a shorter one finishes
 * at its own last moment. Sizes below match Problem Set 6's seating, Chloe absent (mint 8 · amber 7 · coral 8 ·
 * violet 9 · sky 9, the live group's row unread).
 */
export const RACE_SCHEDULE: Record<GroupColour, number[]> = {
  mint: [30, 60, 95, 125, 160, 190, 225, 255],
  amber: [30, 70, 110, 150, 190, 230, 265],
  coral: [60, 140, 230, 320, 400, 480, 550, 610],
  violet: [80, 180, 280, 370, 450, 520, 580, 630, 660],
  sky: [45, 95, 150, 200, 250, 300, 350, 400, 440],
};
