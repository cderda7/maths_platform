/**
 * The finished sets the Classroom holds (ticket 210): one line per set, in date order, each re-exporting
 * the `FinishedSet` from its folder's `index.ts` (`data/finishedSet.ts` has the shape). `lib/finishedSets.ts`
 * reads every export here and orders them by due date, so the order below is for the reader.
 *
 * Tickets 211–214 each replace their own commented slot with the line. The blank line between slots is
 * load-bearing: four branches changing neighbouring lines would conflict when they merge; separated,
 * they merge cleanly in any order.
 */

export { PS1 } from "./pset1";

export { PS2 } from "./pset2";

// Problem Set 3 — Expanding and factorising, Tue 1 Sep (ticket 213): export { PS3 } from "./pset3";

// Problem Set 4 — Non-monic factorising and completing the square, Fri 4 Sep (ticket 214): export { PS4 } from "./pset4";

export { PS5 } from "./pset5";
