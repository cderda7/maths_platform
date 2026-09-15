import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATE_MAP } from "@/data/classmates";
import { GROUP_COLOURS, type GroupColour } from "@/data/groups";
import { SIMULATED_BOARDS, SIMULATED_PACE } from "@/data/group-scripts";
import { pathwayOf, type ClassroomState } from "./classroom";
import { exceptionAt, explainableAt, recordReviewProblems, reviewProblemsOf, tableSlips } from "./group";
import { closedInOrder, closedMoment, currentProblem, DEMO_SEED, groupProgress, penHolder, runStartedAt, stuckProblems, type GroupRun } from "./groupReview";
import { boardScripts, runTimeline, simulatedRunAt, type Pace, type QuestionTimeline, type SimulatedBoard } from "./groupSim";
import { unionOfMembers } from "./reviewUnion";
import { assignmentGroupsOf } from "./seating";
import { liveAbsent, presentGroups } from "./absence";
import type { StudentSession } from "./session";

/**
 * The race during group review: one standing per seating group that has anything to review. A group's progress is its
 * members' own questions on the questions the group has closed, over all of their questions on the union, so a question
 * three members still had wrong moves the bar three times as far as one only one had (`groupProgress`). The demo student's
 * group is live from the shared whiteboard's run; every other group plays its simulated board (`lib/groupSim.ts`,
 * ticket 332) on the same clock from the moment the run began. Everything here is pure and derived from state and the
 * clock, so the board, the teacher's card and the iPad's bar all agree and any tab can reload into the same picture.
 *
 * The union (ticket 332): with individual review on the pathway, the questions a present member still has wrong,
 * incomplete or not attempted once corrections are in (`lib/reviewUnion.ts`); without it, first submissions. A group
 * whose union is empty sits out group review: it is not listed (`groupsAt`), so the race, the standings, the leaderboard,
 * the teacher's card and every count of groups leave it out (five groups with one sitting out reads as four), and its
 * members are done with the stage (`sittingOut`).
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
  /** The union after individual review (ticket 332), in assignment order: never empty (a group with nothing to review is not listed). */
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
  /** Who holds the pen right now, while the group is still working (every group since ticket 332). */
  pen: string | null;
  /** The problem on the board right now, while the group is still working. */
  problem: string | null;
  /** Problems the group could not get: left for now, or closed unsolved (ticket 223; every group since ticket 332). */
  stuck: { problem: string; tries: number; status: "left" | "unsolved" }[];
}

export interface RankedStanding extends GroupStanding {
  rank: number;
  medal: Medal | null;
}

export const firstName = (id: string): string => (id === DEMO_STUDENT.id ? DEMO_STUDENT.name : CLASSMATE_MAP[id]?.name ?? id).split(" ")[0];

/** Whether the union is taken after individual review: the pathway has it (ticket 332). */
export const afterIndividualOn = (c: ClassroomState | null | undefined): boolean => pathwayOf(c).includes("individual");

/** A member's questions for the union (ticket 332): the demo student's from the session, a classmate's from the fixture. */
export function wrongOf(id: string, session: StudentSession | null, afterIndividual: boolean): string[] {
  if (id === DEMO_STUDENT.id) return session ? reviewProblemsOf(session, afterIndividual) : [];
  const m = CLASSMATE_MAP[id];
  return m ? recordReviewProblems(m, afterIndividual) : [];
}

export const wrongSetsOf = (members: string[], session: StudentSession | null, afterIndividual: boolean): Record<string, string[]> => Object.fromEntries(members.map((id) => [id, wrongOf(id, session, afterIndividual)]));

/** The union of the members' questions, in assignment order. */
export const unionOf = (wrongSets: Record<string, string[]>): string[] => unionOfMembers(ASSIGNMENT.problems, Object.values(wrongSets));

/** The pace a simulated group works at; a colour without one (none on Problem Set 6) takes the slowest authored. */
const paceOf = (colour: GroupColour): Pace => SIMULATED_PACE[colour] ?? { tryS: 38, nextS: 16 };

/** The shuffle's seed for a simulated group: the product's pen deal, stable per colour. */
const seedOf = (colour: GroupColour): number => DEMO_SEED + 101 * (GROUP_COLOURS.indexOf(colour) + 1);

/** A simulated group's board (ticket 332): its members, its union, and the tries the rule gives this table (authored where they fit). */
export function simulatedBoardOf(colour: GroupColour, members: string[], session: StudentSession | null, afterIndividual: boolean): SimulatedBoard {
  const problems = unionOf(wrongSetsOf(members, session, afterIndividual));
    const scripts = boardScripts(problems, SIMULATED_BOARDS[colour], (p) => explainableAt(members, session, afterIndividual, p), (p) => tableSlips(members, session, p), exceptionAt(members));
  return { members, problems, scripts, seed: seedOf(colour) };
}

/** One group in group review: its colour, members, union, and its run at the moment asked (null before any run exists). */
export interface GroupInReview {
  colour: GroupColour;
  members: string[];
  union: string[];
  /** The demo student's group, live on the whiteboard. */
  live: boolean;
  /** The group's run as it stands: the live board's, or the simulated board's at the clock. Null before group review has begun. */
  run: GroupRun | null;
}

/**
 * Every group in group review at `now`, in seating order (ticket 332), with its run: the live group's whiteboard, every
 * other group's simulated board on the same clock (from the live run's opening; held where it was once the teacher ended
 * it). A group with nothing to review sits out and is not listed. The accessor a per-group view reads.
 */
export function groupsAt(c: ClassroomState | null | undefined, session: StudentSession | null, now: number): GroupInReview[] {
  // Group review runs on the live assignment's own groups (ticket 185), not the class defaults, less its absent students (ticket 250): a four with one away is a three.
  const seating = presentGroups(assignmentGroupsOf(c, ASSIGNMENT.id), liveAbsent(c));
  const after = afterIndividualOn(c);
  const run = c?.group ?? null;
  const startedAt = run ? runStartedAt(run) : 0;
  // Ended by the teacher: the simulated groups hold where they were (ticket 145). Before the first tick the clock reads the start.
  const clock = run?.endedAt !== undefined ? Math.min(now, run.endedAt) : now;
  const at = run && now > 0 ? Math.max(startedAt, clock) : startedAt;
  return GROUP_COLOURS.flatMap((colour): GroupInReview[] => {
    const seated = seating[colour];
    const live = !!run && run.members.includes(DEMO_STUDENT.id) && seated.includes(DEMO_STUDENT.id);
    if (live) return run!.problems.length === 0 ? [] : [{ colour, members: run!.members, union: run!.problems, live, run }];
    const board = simulatedBoardOf(colour, seated, session, after);
    if (board.problems.length === 0) return [];
    return [{ colour, members: seated, union: board.problems, live, run: run ? simulatedRunAt(board, paceOf(colour), startedAt, at) : null }];
  });
}

/** The groups sitting out group review (ticket 332): present members, and nothing left for any of them to review. */
export function sittingOut(c: ClassroomState | null | undefined, session: StudentSession | null): { colour: GroupColour; members: string[] }[] {
  const seating = presentGroups(assignmentGroupsOf(c, ASSIGNMENT.id), liveAbsent(c));
  const after = afterIndividualOn(c);
  const listed = groupsAt(c, session, 0).map((g) => g.colour);
  return GROUP_COLOURS.filter((colour) => seating[colour].length > 0 && !listed.includes(colour) && unionOf(wrongSetsOf(seating[colour], session, after)).length === 0).map((colour) => ({ colour, members: seating[colour] }));
}

/** A question-by-question timeline of every listed group's run at `now` (ticket 332): checks with their moments, left for now, solved on the return, closed unsolved. */
export const timelinesAt = (c: ClassroomState | null | undefined, session: StudentSession | null, now: number): { colour: GroupColour; live: boolean; questions: QuestionTimeline[] }[] =>
  groupsAt(c, session, now).map((g) => ({ colour: g.colour, live: g.live, questions: g.run ? runTimeline(g.run) : g.union.map((problem) => ({ problem, visits: [], status: "ahead" as const, solvedOnReturn: false })) }));

/** Who holds each listed group's pen at `now` (ticket 332): null before its run, once it is done, or between groups' boards. */
export const pensAt = (c: ClassroomState | null | undefined, session: StudentSession | null, now: number): { colour: GroupColour; pen: string | null; problem: string | null }[] =>
  groupsAt(c, session, now).map((g) => {
    const working = !!g.run && !g.run.done && closedInOrder(g.run).length < g.run.problems.length;
    return { colour: g.colour, pen: working ? (penHolder(g.run!) ?? null) : null, problem: working ? (currentProblem(g.run!) ?? null) : null };
  });

/** Every listed group's standing, in seating order. Without a run nothing has started: every bar at zero. */
export function standingsAt(c: ClassroomState | null | undefined, session: StudentSession | null, now: number): GroupStanding[] {
  const after = afterIndividualOn(c);
  return groupsAt(c, session, now).map((g) => {
    const wrongSets = wrongSetsOf(g.members, session, after);
    const base = { colour: g.colour, members: g.members, names: g.members.map(firstName), union: g.union, live: g.live };
    if (!g.run) {
      const total = Object.values(wrongSets).reduce((n, w) => n + w.filter((p) => g.union.includes(p)).length, 0);
      return { ...base, resolvedCount: 0, resolved: 0, total, percent: 0, reachedAt: 0, pen: null, problem: null, stuck: [] };
    }
    return standingOf(base, g.run, wrongSets);
  });
}

function standingOf(base: Pick<GroupStanding, "colour" | "members" | "names" | "union" | "live">, run: GroupRun, wrongSets: Record<string, string[]>): GroupStanding {
  const { resolved, total, percent } = groupProgress(run, wrongSets);
  const closed = closedInOrder(run);
  const startedAt = runStartedAt(run);
  const reachedAt = closed.reduce((latest, p) => Math.max(latest, closedMoment(run, p)), startedAt);
  const working = !run.done && closed.length < run.problems.length;
  return { ...base, resolvedCount: closed.length, resolved, total, percent, reachedAt, pen: working ? (penHolder(run) ?? null) : null, problem: working ? (currentProblem(run) ?? null) : null, stuck: stuckProblems(run) };
}

/** The leaderboard: percent, then who got there first, then seating order; medals for the first three to finish. */
export function rankStandings(rows: GroupStanding[]): RankedStanding[] {
  const sorted = [...rows].sort((a, b) => b.percent - a.percent || a.reachedAt - b.reachedAt || GROUP_COLOURS.indexOf(a.colour) - GROUP_COLOURS.indexOf(b.colour));
  return sorted.map((r, rank) => ({ ...r, rank, medal: r.percent >= 100 && rank < MEDALS.length ? MEDALS[rank] : null }));
}

export const leaderboardAt = (c: ClassroomState | null | undefined, session: StudentSession | null, now: number): RankedStanding[] => rankStandings(standingsAt(c, session, now));

/** The demo student's own group's standing (its progress doesn't depend on the clock), or null before a run exists. */
export const ownStanding = (c: ClassroomState | null | undefined, session: StudentSession | null): GroupStanding | null => standingsAt(c, session, 0).find((s) => s.live) ?? null;
