import { runStartedAt, type GroupRun } from "./groupReview";

/**
 * The read before group review (ticket 220): why the group works together, over the problems it
 * will work, then the board opens on its own. No button, so no group gets onto the board before
 * another and the race stays fair: every run's clock (the board, the peers' scripts, the standings)
 * starts when the read is over. The time is worked out from the words, so editing the message
 * retimes the screen. Pure.
 */
export const GROUP_INTRO_PARAGRAPHS = [
  "You're about to work as a team to fix your mistakes. Each problem you're about to go through, at least one of you made a mistake on. Discuss your approaches and come up with a final answer.",
  "If you think you know the approach, be gracious in explaining to your peers. If the group's approach doesn't make sense to you, advocate for yourself and make sure you're on the same page before your group submits.",
];

/** A slow silent-reading pace for a 14 to 15 year old, so the slowest readers in the class still finish. */
export const READING_WPM = 130;
/** Taking in the screen besides the words: the heading and the problem tiles. */
export const LOOK_MS = 4_000;

export const wordCount = (text: string): number => text.split(/\s+/).filter(Boolean).length;

/** How long a screen with these paragraphs is held: the words at the reading pace plus the look, to the next whole second. */
export function readMs(paragraphs: string[]): number {
  const words = paragraphs.reduce((n, p) => n + wordCount(p), 0);
  return Math.ceil((words / READING_WPM) * 60 + LOOK_MS / 1000) * 1000;
}

export const GROUP_INTRO_MS = readMs(GROUP_INTRO_PARAGRAPHS);

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

/** The read's progress, 0 at its start and 1 when the board opens. */
export function introProgress(run: GroupRun, now: number): number {
  const left = runStartedAt(run) - now;
  return Math.min(1, Math.max(0, 1 - left / GROUP_INTRO_MS));
}
