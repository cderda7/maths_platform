import type { Attempt, GroupRun } from "./groupReview";
import { checkBoard } from "./groupReview";
import { lineMarks, type LineMark } from "./examples";

/**
 * The debrief after the group's rework checks correct: each student sees their own two versions
 * beside the group's, names a mistake in their own words, then looks at the marks for at least
 * twenty seconds. Pure rules; the session keeps each student's note and when the marks opened.
 */
export const HOLD_MS = 20_000;

export type DebriefPrompt = "own" | "peers";

export interface DebriefNote {
  prompt: DebriefPrompt;
  text: string;
  /** When the annotated view opened; null while the student is still on the unmarked comparison. */
  markedAt: number | null;
  /** True once the student pressed Next and left the debrief. */
  done: boolean;
}

/** A version is functional when it would pass the same check the group's rework passed. */
export const functional = (problem: string, lines: string[]): boolean => checkBoard(problem, lines).correct;

/** Describe your own mistake when neither earlier attempt was functional; otherwise the mistake your peers most likely made. */
export function debriefPrompt(problem: string, own: { lines: string[]; rework: string[] }): DebriefPrompt {
  return functional(problem, own.lines) || (own.rework.length > 0 && functional(problem, own.rework)) ? "peers" : "own";
}

export const PROMPT_TEXT: Record<DebriefPrompt, string> = {
  own: "describe the mistake you made",
  peers: "describe the mistake your peers most likely made",
};

/** The group's correct rework of a problem, if it has one. */
export const groupRework = (run: GroupRun, problem: string): Attempt | undefined => run.attempts[problem]?.find((a) => a.correct);

export interface MarkedVersion {
  label: string;
  lines: { tex: string; mark: LineMark }[];
}

/** The annotated view: full red and blue marks on the student's own versions, blue standouts on the group's rework. */
export function markedVersions(problem: string, own: { lines: string[]; rework: string[] }, group: string[]): MarkedVersion[] {
  const mark = (label: string, lines: string[]): MarkedVersion => ({ label, lines: lines.map((tex, i) => ({ tex, mark: lineMarks(problem, lines)[i] })) });
  const out = [mark("Handed in", own.lines)];
  if (own.rework.length > 0) out.push(mark("Reworked", own.rework));
  out.push(mark("Group's rework", group));
  return out;
}

/** How much of the hold has passed, 0–1. */
export const holdProgress = (markedAt: number | null, now: number): number => (markedAt === null ? 0 : Math.max(0, Math.min(1, (now - markedAt) / HOLD_MS)));
export const holdOver = (markedAt: number | null, now: number): boolean => markedAt !== null && now - markedAt >= HOLD_MS;

/**
 * The problem whose debrief the student is in: the most recent resolved problem they have not
 * pressed Next on. Null once they have moved on (or before anything is resolved).
 */
export function pendingDebrief(run: GroupRun, notes: Record<string, DebriefNote>): string | null {
  for (let i = run.resolved.length - 1; i >= 0; i--) {
    const p = run.resolved[i];
    if (!notes[p]?.done) return p;
  }
  return null;
}

/** How long a peer who holds the next pen waits before their first stroke moves the group on: their own debrief, roughly. */
export const PEER_DEBRIEF_MS = 26_000;
