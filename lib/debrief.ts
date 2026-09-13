import { closedInOrder, type Attempt, type GroupRun } from "./groupReview";
import { lineMarks, type LineMark } from "./examples";

/**
 * The debrief after the group's rework checks correct: each student sees their own two versions
 * beside the group's, unmarked, for two seconds from the check; the marks then open on their own
 * and Next waits ten seconds more. Nothing to write (ticket 218); two seconds, not five (ticket 219). Pure rules; the session keeps
 * only whether the student has moved on, the clock is the group's check.
 */
export const UNMARKED_MS = 2_000;
export const HOLD_MS = 10_000;

export interface DebriefNote {
  /** True once the student pressed Next and left the debrief. */
  done: boolean;
}

/** The group's correct rework of a problem, if it has one. */
export const groupRework = (run: GroupRun, problem: string): Attempt | undefined => run.attempts[problem]?.find((a) => a.correct);

export interface MarkedVersion {
  label: string;
  lines: { tex: string; mark: LineMark }[];
  /** The pane sits on green: the group's rework (it checked correct), and an own version only when it is line for line the same; nothing for an unsolved problem. */
  green: boolean;
}

const normalise = (tex: string) => tex.replace(/\s+/g, " ").trim();

/** A version matches the group's rework when it is the same lines in the same order, whitespace aside. */
export const matchesGroup = (lines: string[], group: string[]): boolean => lines.length > 0 && lines.length === group.length && lines.every((tex, i) => normalise(tex) === normalise(group[i]));

/**
 * The annotated view: full red and blue marks on the student's own versions, blue standouts on the
 * group's rework. For a problem the group closed unsolved (ticket 222) the third pane is the group's
 * last try, marked like the rest, and nothing is green.
 */
export function markedVersions(problem: string, own: { lines: string[]; rework: string[] }, group: string[], unsolved = false): MarkedVersion[] {
  const mark = (label: string, lines: string[], green: boolean): MarkedVersion => ({ label, lines: lines.map((tex, i) => ({ tex, mark: lineMarks(problem, lines)[i] })), green });
  const same = (lines: string[]) => !unsolved && matchesGroup(lines, group);
  const out = [mark("Handed in", own.lines, same(own.lines))];
  if (own.rework.length > 0) out.push(mark("Reworked", own.rework, same(own.rework)));
  out.push(unsolved ? mark("Group's last try", group, false) : mark("Group's rework", group, true));
  return out;
}

/** What the group wrote on a closed problem: its correct rework, or for an unsolved problem its last try. */
export const groupVersion = (run: GroupRun, problem: string): string[] => (run.unsolved ?? []).includes(problem) ? (run.attempts[problem]?.at(-1)?.lines ?? []) : (groupRework(run, problem)?.lines ?? []);

/** When the marks open: two seconds after the group's check. */
export const marksAt = (resolvedAt: number): number => resolvedAt + UNMARKED_MS;
export const marksOpen = (resolvedAt: number, now: number): boolean => now >= marksAt(resolvedAt);

/** How much of the hold has passed, 0–1. */
export const holdProgress = (markedAt: number | null, now: number): number => (markedAt === null ? 0 : Math.max(0, Math.min(1, (now - markedAt) / HOLD_MS)));
export const holdOver = (markedAt: number | null, now: number): boolean => markedAt !== null && now - markedAt >= HOLD_MS;

/**
 * The problem whose debrief the student is in: the most recently closed problem (resolved, or
 * unsolved on its return) they have not pressed Next on. Null once they have moved on (or before
 * anything has closed).
 */
export function pendingDebrief(run: GroupRun, notes: Record<string, DebriefNote>): string | null {
  const closed = closedInOrder(run);
  for (let i = closed.length - 1; i >= 0; i--) {
    const p = closed[i];
    if (!notes[p]?.done) return p;
  }
  return null;
}

/** How long a peer who holds the next pen waits before their first stroke moves the group on: their own debrief (two seconds unmarked, ten on the marks), and a second to press Next. */
export const PEER_DEBRIEF_MS = 13_000;
