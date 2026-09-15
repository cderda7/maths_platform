/**
 * How the classmates move through individual review in the live demo (ticket 318): named simulation timing, apart from the
 * product rule (DECISION_LOG.md, 2026-09-15, the demo-exceptions rule). Nothing here says what a classmate fixes: that is
 * their record's second submissions (`data/classmates-review.ts`), and when they reach the gate is `lib/readiness.ts`'s.
 * This only paces the minutes in between, the same way every run, so every tab and every reload agree.
 *
 * A classmate reads their feedback first (`REWORK_READ_MS`, spread by roster position), then opens the problems they have to
 * fix one at a time; each takes `REWORK_PROBLEM_MS` spread by a fixed hash of student and problem, a correction that stays
 * wrong `REWORK_STILL_WRONG_MS` longer, and the correction lands `REWORK_LANDS_AT` of the way through. A student with
 * odd roster position opens the problems they got wrong before the ones they never finished; the rest go in set order.
 */

/** Reading the feedback before the first problem opens: the least, and the spread across the roster. */
export const REWORK_READ_MS = { least: 15_000, spread: 30_000 };

/** One problem, opened to the next: the least, and the spread across students and problems. */
export const REWORK_PROBLEM_MS = { least: 35_000, spread: 45_000 };

/** Added to a problem whose correction stays wrong: the student keeps at it. */
export const REWORK_STILL_WRONG_MS = 25_000;

/** Where in a problem's time its correction lands (the last line written). */
export const REWORK_LANDS_AT = 0.75;
