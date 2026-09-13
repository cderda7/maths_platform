import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATE_MAP } from "@/data/classmates";
import { GROUP_COLOURS, type GroupColour } from "@/data/groups";
import { RACE_SCHEDULE } from "@/data/race";
import type { ClassroomState } from "./classroom";
import { feedbackFor } from "./feedback";
import { computePhases } from "./group";
import { closedInOrder, closedMoment, currentProblem, groupProgress, penHolder, runStartedAt, type GroupRun } from "./groupReview";
import { assignmentGroupsOf } from "./seating";
import type { StudentSession } from "./session";

/**
 * The race during group review: one standing per seating group. A group's progress is its
 * members' original mistakes on problems the group has resolved, over all of their original
 * mistakes on the union, so a problem three members had wrong moves the bar three times as far
 * as one only one had wrong. The demo student's group is live from the shared whiteboard's run;
 * the other four follow the scripted `RACE_SCHEDULE` from the moment the run began. Everything
 * here is pure and derived from state and the clock, so the board, the teacher's card and the
 * iPad's bar all agree and any tab can reload into the same picture.
 *
 * Ranking: percent first, then who reached that percent first, then seating order. A finished
 * group's moment is its finish, and nothing sorts above 100 %, so the first to finish stays first
 * however the others move: the lock is a consequence of the timestamps, not a flag.
 */
export type Medal = "gold" | "silver" | "bronze";
export const MEDALS: Medal[] = ["gold", "silver", "bronze"];

export interface GroupStanding {
  colour: GroupColour;
  members: string[];
  /** First names, in seating order. */
  names: string[];
  /** The union of the members' mistakes, in assignment order. */
  union: string[];
  /** Problems of the union closed so far (resolved, or unsolved after the return). */
  resolvedCount: number;
  /** Members' original mistakes: resolved, and in all. */
  resolved: number;
  total: number;
  percent: number;
  /** The moment the current percent was reached; the start while nothing is resolved. */
  reachedAt: number;
  /** The demo student's group, live on the whiteboard. */
  live: boolean;
  /** Who holds the pen right now (the live group, while it is still working). */
  pen: string | null;
  /** The problem on the board right now (the live group, while it is still working). */
  problem: string | null;
}

export interface RankedStanding extends GroupStanding {
  rank: number;
  medal: Medal | null;
}

export const firstName = (id: string): string => (id === DEMO_STUDENT.id ? DEMO_STUDENT.name : CLASSMATE_MAP[id]?.name ?? id).split(" ")[0];

/** A member's original mistakes: the demo student's from the session, a classmate's from the fixture. */
export function wrongOf(id: string, session: StudentSession | null): string[] {
  if (id === DEMO_STUDENT.id)
    return session
      ? feedbackFor(session)
          .filter((p) => p.slips.length > 0)
          .map((p) => p.problem.id)
      : [];
  return CLASSMATE_MAP[id]?.wrong ?? [];
}

export const wrongSetsOf = (members: string[], session: StudentSession | null): Record<string, string[]> => Object.fromEntries(members.map((id) => [id, wrongOf(id, session)]));

/** The union of the members' mistakes, in assignment order. */
export const unionOf = (wrongSets: Record<string, string[]>): string[] =>
  computePhases(
    ASSIGNMENT.problems.map((p) => p.id),
    Object.values(wrongSets),
  ).discussion;

/** Seconds at which the k-th of `n` problems resolves: the row, carried on at its last gap when the union is longer. */
export function raceMoments(schedule: number[], n: number): number[] {
  if (n === 0 || schedule.length === 0) return [];
  const gap = schedule.length > 1 ? schedule[schedule.length - 1] - schedule[schedule.length - 2] : schedule[0];
  return Array.from({ length: n }, (_, k) => (k < schedule.length ? schedule[k] : schedule[schedule.length - 1] + (k - schedule.length + 1) * gap));
}

/** How far a scripted group is `elapsedMs` after the start: problems resolved, and when the latest one was. */
export function raceProgress(schedule: number[], n: number, elapsedMs: number): { resolvedCount: number; reachedAfterMs: number } {
  const moments = raceMoments(schedule, n);
  const resolvedCount = moments.filter((s) => s * 1000 <= elapsedMs).length;
  return { resolvedCount, reachedAfterMs: resolvedCount === 0 ? 0 : moments[resolvedCount - 1] * 1000 };
}

/** The finish, in seconds, of a scripted group with `n` problems. */
export const raceFinish = (schedule: number[], n: number): number => raceMoments(schedule, n).at(-1) ?? 0;

/** Every group's standing, in seating order. Without a run nothing has started: every bar at zero. */
export function standingsAt(c: ClassroomState | null | undefined, session: StudentSession | null, now: number): GroupStanding[] {
  // Group review runs on the live assignment's own groups (ticket 185), not the class defaults.
  const seating = assignmentGroupsOf(c, ASSIGNMENT.id);
  const run = c?.group ?? null;
  const startedAt = run ? runStartedAt(run) : 0;
  // Ended by the teacher: the scripted groups hold where they were (ticket 145).
  const clock = run?.endedAt !== undefined ? Math.min(now, run.endedAt) : now;
  const elapsed = run && now > 0 ? Math.max(0, clock - startedAt) : 0;
  return GROUP_COLOURS.map((colour) => {
    const seated = seating[colour];
    const live = !!run && run.members.includes(DEMO_STUDENT.id) && seated.includes(DEMO_STUDENT.id);
    const members = live ? run!.members : seated;
    const wrongSets = wrongSetsOf(members, session);
    const union = unionOf(wrongSets);
    const base = { colour, members, names: members.map(firstName), union, live };
    if (live) return liveStanding(base, run!, wrongSets, startedAt);
    const total = Object.values(wrongSets).reduce((n, w) => n + w.length, 0);
    const { resolvedCount, reachedAfterMs } = raceProgress(RACE_SCHEDULE[colour], union.length, elapsed);
    const done = union.slice(0, resolvedCount);
    const resolved = Object.values(wrongSets).reduce((n, w) => n + w.filter((p) => done.includes(p)).length, 0);
    return { ...base, resolvedCount, resolved, total, percent: total === 0 ? 100 : Math.round((resolved / total) * 100), reachedAt: startedAt + reachedAfterMs, pen: null, problem: null };
  });
}

function liveStanding(base: Pick<GroupStanding, "colour" | "members" | "names" | "union" | "live">, run: GroupRun, wrongSets: Record<string, string[]>, startedAt: number): GroupStanding {
  const { resolved, total, percent } = groupProgress(run, wrongSets);
  const closed = closedInOrder(run);
  const reachedAt = closed.reduce((latest, p) => Math.max(latest, closedMoment(run, p)), startedAt);
  const working = !run.done && closed.length < run.problems.length;
  return { ...base, resolvedCount: closed.length, resolved, total, percent, reachedAt, pen: working ? (penHolder(run) ?? null) : null, problem: working ? (currentProblem(run) ?? null) : null };
}

/** The leaderboard: percent, then who got there first, then seating order; medals for the first three to finish. */
export function rankStandings(rows: GroupStanding[]): RankedStanding[] {
  const sorted = [...rows].sort((a, b) => b.percent - a.percent || a.reachedAt - b.reachedAt || GROUP_COLOURS.indexOf(a.colour) - GROUP_COLOURS.indexOf(b.colour));
  return sorted.map((r, rank) => ({ ...r, rank, medal: r.percent >= 100 && rank < MEDALS.length ? MEDALS[rank] : null }));
}

export const leaderboardAt = (c: ClassroomState | null | undefined, session: StudentSession | null, now: number): RankedStanding[] => rankStandings(standingsAt(c, session, now));

/** The demo student's own group's standing (its progress doesn't depend on the clock), or null before a run exists. */
export const ownStanding = (c: ClassroomState | null | undefined, session: StudentSession | null): GroupStanding | null => standingsAt(c, session, 0).find((s) => s.live) ?? null;
