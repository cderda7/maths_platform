import { runStartedAt, type GroupRun } from "./groupReview";

/**
 * The read before group review (ticket 220): why the group works together, over the problems it
 * will work, then the board opens on its own. No button, so no group gets onto the board before
 * another and the race stays fair: every run's clock (the board, the peers' scripts, the standings)
 * starts when the read is over. Pure.
 */
export const GROUP_INTRO_PARAGRAPHS = [
  "You're about to work as a team to fix your mistakes. Each problem you're about to go through, at least one of you made a mistake on. Discuss your approaches and come up with a final answer.",
  "If you think you know the approach, be gracious in explaining to your peers. If the group's approach doesn't make sense to you, advocate for yourself and make sure you're on the same page before your group submits.",
];

/** How long the read holds before the boards open: 30 s, set by the user (ticket 224; ticket 220 derived 39 s from the words). */
export const GROUP_INTRO_MS = 30_000;

/** When a class that went into group review at `classStartedAt` opens its boards. */
export const boardOpensAt = (classStartedAt: number): number => classStartedAt + GROUP_INTRO_MS;

/**
 * When a run begun now opens its board: counted from when the class went in (the gate's moment), so
 * a tab that gets there late, or a student forced out of their corrections, reads only what is left.
 * No known moment (a deep link) counts from now.
 */
export const boardOpensFor = (classStartedAt: number | null, now: number): number => boardOpensAt(Math.min(now, classStartedAt ?? now));

/** Columns for the problem tiles: one row up to five, then two even rows (6 → 3, 7 → 4, 10 → 5). */
export const tileColumns = (count: number): number => (count <= 5 ? Math.max(1, count) : Math.ceil(count / 2));

/** Still reading: the run exists but its board has not opened. */
export const introShowing = (run: GroupRun, now: number): boolean => now < runStartedAt(run);

/**
 * The time left as the corner shows it: whole seconds, rounded to the nearest, so the number and the bar
 * (the fraction left) agree at every moment: "0:15" only while the bar is within a sixtieth of half (ticket 232).
 */
export function introSecondsLeft(run: GroupRun, now: number): number {
  const left = Math.min(GROUP_INTRO_MS, Math.max(0, runStartedAt(run) - now));
  return Math.round(left / 1000);
}

/** The read's progress, 0 at its start and 1 when the board opens. */
export function introProgress(run: GroupRun, now: number): number {
  const left = runStartedAt(run) - now;
  return Math.min(1, Math.max(0, 1 - left / GROUP_INTRO_MS));
}
