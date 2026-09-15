import type { GroupColour } from "@/data/groups";
import type { Problem } from "@/data/types";
import type { ClassroomState } from "./classroom";
import { runTimeline, type QuestionTimeline } from "./groupSim";
import type { StudentSession } from "./session";
import { groupsAt, penOf, type GroupInReview } from "./standings";

/**
 * Where groups are during group review (ticket 319): the Mistakes tab's left column is a grid, a row per question and a
 * column per group taking part (a group sitting out has no column, ticket 332), each cell saying where that group is on
 * that question; the right column's cards count groups. Everything is read from the runs `groupsAt` gives (the live
 * whiteboard, and every other group's simulated board on the same clock), so the grid, the Class tab's group card and
 * the board agree. No React. See DECISION_LOG.md, 2026-09-16 (Where groups are during group review).
 */

/**
 * What a cell shows:
 * - `not-in-queue` (light blue): every present member has it right after individual review, so it is not in the union;
 * - `ahead` (blank): in the union and not closed; a first or second wrong check leaves it blank;
 * - `left` (red): left for now after the third wrong check, the group coming back to it;
 * - `solved` (green); `unsolved` (dark red with a ✕): closed wrong on its return;
 * - `class-review` (grey): moved to class review by the teacher (ticket 337), across every group.
 */
export type GridTone = "not-in-queue" | "ahead" | "left" | "solved" | "unsolved" | "class-review";

export interface GridCell {
  problem: string;
  tone: GridTone;
  /** The question on the group's board right now: ringed in the group's colour with the pen-holder inside. */
  current: boolean;
}

export interface GridColumn {
  colour: GroupColour;
  members: string[];
  live: boolean;
  /** One cell per question of the set, in set order. */
  cells: GridCell[];
  /** Questions closed (solved, or unsolved after the return) out of the union: "n/m". A question left for now counts only once its return has closed it. */
  closed: number;
  total: number;
  /** Every question of the union closed: the chip fills in the group's colour. */
  done: boolean;
  /** Who holds the pen now, while the group is still working. */
  pen: string | null;
}

/** A question's cell tone from its timeline: a question on the board keeps the colour it had (red on its return, blank on its first visit). */
export function toneOf(q: QuestionTimeline | undefined): Exclude<GridTone, "class-review"> {
  if (!q) return "not-in-queue";
  if (q.status === "solved" || q.status === "unsolved" || q.status === "left") return q.status;
  if (q.status === "working" && q.visits.some((v) => v.leftAt !== null)) return "left";
  return "ahead";
}

/**
 * The grid from the groups in review: `movedToClass` names the questions the teacher moved to class review (ticket 337 is
 * not built yet, so today it is always empty), whose row is grey across every group.
 */
export function gridOf(groups: readonly GroupInReview[], problems: readonly Pick<Problem, "id">[], movedToClass: readonly string[] = []): GridColumn[] {
  return groups.map((g) => {
    const questions = g.run ? runTimeline(g.run) : g.union.map((problem): QuestionTimeline => ({ problem, visits: [], status: "ahead", solvedOnReturn: false }));
    const byProblem = new Map(questions.map((q) => [q.problem, q]));
    const { pen, problem: onBoard } = penOf(g);
    const cells = problems.map((p): GridCell => {
      if (movedToClass.includes(p.id)) return { problem: p.id, tone: "class-review", current: false };
      return { problem: p.id, tone: toneOf(byProblem.get(p.id)), current: onBoard === p.id };
    });
    const closed = questions.filter((q) => q.status === "solved" || q.status === "unsolved").length;
    return { colour: g.colour, members: g.members, live: g.live, cells, closed, total: g.union.length, done: g.union.length > 0 && closed === g.union.length, pen };
  });
}

/** The grid at `now`: every group in group review, in seating order. */
export const gridAt = (c: ClassroomState | null | undefined, session: StudentSession | null, now: number, problems: readonly Pick<Problem, "id">[], movedToClass: readonly string[] = []): GridColumn[] => gridOf(groupsAt(c, session, now), problems, movedToClass);

/** The avatars ticket 319 drew, and the smallest the initials stay readable at, layout px. */
export const AVATAR_MAX = 28;
export const AVATAR_MIN = 16;
/** The ring in the group's colour around the pen-holder's avatar: drawn outside it, so the row of avatars needs it at each end. */
export const AVATAR_RING = 2;
/** Between avatars: the wider gap while they are near full size, tighter once they shrink. It clears the pen-holder's ring, which is drawn outside their avatar. */
const GAP_WIDE = 4;
const GAP_TIGHT = 3;
/** Below this the gap tightens. */
const GAP_STEP = 22;

/**
 * The whole table in the cell it is working on (ticket 348): the avatar size, the gap between them and their initials'
 * size that put `members` avatars, with the pen-holder's ring at the ends, inside `avail` layout px of cell. Four
 * avatars share a cell of about 137 px at 1280 × 800 with five groups, so they shrink from the 28 px ticket 319 drew;
 * below 16 px initials stop being readable, so that is the floor and the fit measurement never asks for less.
 */
export function cellAvatars(avail: number, members: number): { size: number; gap: number; text: number } {
  const n = Math.max(1, members);
  const fits = (gap: number) => Math.floor((avail - 2 * AVATAR_RING - (n - 1) * gap) / n);
  let gap = GAP_WIDE;
  let size = fits(gap);
  if (size < GAP_STEP) {
    gap = GAP_TIGHT;
    size = fits(gap);
  }
  size = Math.min(AVATAR_MAX, Math.max(AVATAR_MIN, size));
  if (size >= GAP_STEP) gap = GAP_WIDE;
  return { size, gap, text: Math.max(8, Math.round(size * 0.36)) };
}

/** Where one group stands on one question, for a card: `to-go` is not reached, or on the board and not yet left. */
export type CardGroupTone = "solved" | "left" | "unsolved" | "to-go";

export interface GroupCounts {
  problem: string;
  /** The groups whose union has the question, in seating order, each with where it stands. */
  groups: { colour: GroupColour; members: string[]; tone: CardGroupTone }[];
  solved: number;
  left: number;
  unsolved: number;
  toGo: number;
}

/** A card's counts over the groups whose union has the question. */
export function groupCounts(columns: readonly GridColumn[], problem: string): GroupCounts {
  const groups = columns.flatMap((col) => {
    const cell = col.cells.find((c) => c.problem === problem);
    if (!cell || cell.tone === "not-in-queue" || cell.tone === "class-review") return [];
    const tone: CardGroupTone = cell.tone === "ahead" ? "to-go" : cell.tone;
    return [{ colour: col.colour, members: col.members, tone }];
  });
  const count = (t: CardGroupTone) => groups.filter((g) => g.tone === t).length;
  return { problem, groups, solved: count("solved"), left: count("left"), unsolved: count("unsolved"), toGo: count("to-go") };
}

/** Whether a card shrinks to its thin line: every group that had the question has solved it (or no group had it at all). */
export const everyGroupSolved = (counts: GroupCounts): boolean => counts.groups.every((g) => g.tone === "solved");

/** A card header's counts in words, the parts at zero left out: "2 solved · 1 left for now · 1 unsolved · 1 still to go". */
export function countParts(counts: GroupCounts): { n: number; words: string }[] {
  return [
    { n: counts.solved, words: "solved" },
    { n: counts.left, words: "left for now" },
    { n: counts.unsolved, words: "unsolved" },
    { n: counts.toGo, words: "still to go" },
  ].filter((p) => p.n > 0);
}

/** The groups a card names: every group whose union has the question and has not solved it. */
export const groupsNotSolved = (counts: GroupCounts): GroupCounts["groups"] => counts.groups.filter((g) => g.tone !== "solved");
