import { describe, expect, it } from "vitest";
import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { classroomReducer, type ClassroomState } from "./classroom";
import { skipFixture } from "./demo";
import { countParts, everyGroupSolved, gridAt, gridOf, groupCounts, groupsNotSolved, toneOf, type GridColumn } from "./groupGrid";
import { runStartedAt } from "./groupReview";
import { sessionAt } from "./session";
import { groupsAt, pensAt, timelinesAt } from "./standings";

const now = 1_700_000_000_000;
const MIN = 60_000;
const P = ASSIGNMENT.problems;
const col = (grid: GridColumn[], colour: string) => grid.find((g) => g.colour === colour)!;
const tones = (column: GridColumn) => Object.fromEntries(column.cells.map((c) => [c.problem, c.tone]));

describe("the group grid during group review (ticket 319)", () => {
  const { classroom, session } = skipFixture("group review", now);
  const opens = runStartedAt(classroom.group!);
  /** Every 10 s over the first hour of the boards. */
  const moments = Array.from({ length: 361 }, (_, i) => opens + i * 10_000);

  it("a column per group in review, in seating order, with a cell per question of the set; a question not in a group's union is light blue", () => {
    const grid = gridAt(classroom, session, opens, P);
    expect(grid.map((g) => g.colour)).toEqual(["coral", "amber", "mint", "sky", "violet"]);
    for (const g of grid) expect(g.cells.map((c) => c.problem)).toEqual(P.map((p) => p.id));
    const union = Object.fromEntries(groupsAt(classroom, session, opens).map((g) => [g.colour, g.union]));
    for (const g of grid) for (const c of g.cells) expect(c.tone === "not-in-queue", `${g.colour} ${c.problem}`).toBe(!union[g.colour].includes(c.problem));
    expect(grid.map((g) => `${g.closed}/${g.total}`)).toEqual(["0/6", "0/4", "0/7", "0/9", "0/7"]);
  });

  it("at the end: coral and amber all green; mint Q7 and Q10, violet Q7 unsolved; nothing red left; every simulated group done with a full count", () => {
    const grid = gridAt(classroom, session, opens + 60 * MIN, P);
    const inUnion = (g: GridColumn) => g.cells.filter((c) => c.tone !== "not-in-queue");
    expect(inUnion(col(grid, "coral")).every((c) => c.tone === "solved")).toBe(true);
    expect(inUnion(col(grid, "amber")).every((c) => c.tone === "solved")).toBe(true);
    expect(Object.entries(tones(col(grid, "mint"))).filter(([, t]) => t === "unsolved").map(([p]) => p)).toEqual(["q7", "q10"]);
    expect(Object.entries(tones(col(grid, "violet"))).filter(([, t]) => t === "unsolved").map(([p]) => p)).toEqual(["q7"]);
    for (const colour of ["coral", "amber", "mint", "violet"]) {
      const g = col(grid, colour);
      expect([g.done, g.closed, g.pen], colour).toEqual([true, g.total, null]);
      expect(g.cells.some((c) => c.tone === "left" || c.current), colour).toBe(false);
    }
  });

  it("coral and amber never show red; mint's Q10 goes red once left for now, stays out of the count while red, then turns unsolved and counts", () => {
    let redAt: number | null = null;
    let unsolvedAt: number | null = null;
    for (const t of moments) {
      const grid = gridAt(classroom, session, t, P);
      for (const colour of ["coral", "amber"]) expect(col(grid, colour).cells.some((c) => c.tone === "left" || c.tone === "unsolved"), `${colour} ${t - opens}`).toBe(false);
      const mint = col(grid, "mint");
      const q10 = mint.cells.find((c) => c.problem === "q10")!;
      const closedTimeline = timelinesAt(classroom, session, t).find((x) => x.colour === "mint")!.questions.filter((q) => q.status === "solved" || q.status === "unsolved").length;
      expect(mint.closed).toBe(closedTimeline);
      if (q10.tone === "left" && redAt === null) redAt = t;
      if (q10.tone === "unsolved" && unsolvedAt === null) unsolvedAt = t;
      if (redAt !== null && unsolvedAt === null) expect(mint.closed, `${t - opens}`).toBeLessThan(mint.total);
    }
    expect(redAt).not.toBeNull();
    expect(unsolvedAt).not.toBeNull();
    expect(unsolvedAt!).toBeGreaterThan(redAt!);
  });

  it("the current cell is the pen's question, one per working group, and the pen is that group's member", () => {
    for (const t of moments.filter((_, i) => i % 6 === 0)) {
      const grid = gridAt(classroom, session, t, P);
      const pens = pensAt(classroom, session, t);
      for (const g of grid) {
        const p = pens.find((x) => x.colour === g.colour)!;
        const current = g.cells.filter((c) => c.current).map((c) => c.problem);
        expect(current, `${g.colour} ${t - opens}`).toEqual(p.problem ? [p.problem] : []);
        expect(g.pen).toBe(p.pen);
        if (g.pen) expect(g.members).toContain(g.pen);
      }
    }
  });

  it("a question on its return visit keeps its red under the ring; on its first visit it is blank, wrong checks and all", () => {
    expect(toneOf({ problem: "q7", visits: [{ pen: "a", returning: false, checks: [{ at: 1, correct: false, lines: [] }, { at: 2, correct: false, lines: [] }], leftAt: null, closedAt: null }], status: "working", solvedOnReturn: false })).toBe("ahead");
    expect(
      toneOf({
        problem: "q7",
        visits: [
          { pen: "a", returning: false, checks: [], leftAt: 5, closedAt: null },
          { pen: "b", returning: true, checks: [], leftAt: null, closedAt: null },
        ],
        status: "working",
        solvedOnReturn: false,
      }),
    ).toBe("left");
    expect(toneOf(undefined)).toBe("not-in-queue");
  });

  it("a question moved to class review is grey across every group and out of every card", () => {
    const grid = gridOf(groupsAt(classroom, session, opens), P, ["q9"]);
    expect(grid.map((g) => g.cells.find((c) => c.problem === "q9")!.tone)).toEqual(["class-review", "class-review", "class-review", "class-review", "class-review"]);
    expect(groupCounts(grid, "q9").groups).toEqual([]);
  });

  it("cards count groups over the groups whose union has the question; the thin line once every one of them has solved it", () => {
    const start = gridAt(classroom, session, opens, P);
    const q10 = groupCounts(start, "q10");
    expect(q10.groups.map((g) => g.colour)).toEqual(["coral", "amber", "mint", "sky", "violet"]);
    expect(countParts(q10)).toEqual([{ n: 5, words: "still to go" }]);
    expect(everyGroupSolved(q10)).toBe(false);
    const end = gridAt(classroom, session, opens + 60 * MIN, P);
    const q7 = groupCounts(end, "q7");
    // Sky is the live board: it has not moved in a pure read.
    expect(countParts(q7)).toEqual([
      { n: 2, words: "solved" },
      { n: 2, words: "unsolved" },
      { n: 1, words: "still to go" },
    ]);
    expect(groupsNotSolved(q7).map((g) => g.colour)).toEqual(["mint", "sky", "violet"]);
    const q4 = groupCounts(end, "q4");
    expect(q4.groups.map((g) => [g.colour, g.tone])).toEqual([
      ["coral", "solved"],
      ["violet", "solved"],
    ]);
    expect(everyGroupSolved(q4)).toBe(true);
    // No group had it at all: nothing left to solve, the thin line.
    expect(everyGroupSolved({ problem: "x", groups: [], solved: 0, left: 0, unsolved: 0, toGo: 0 })).toBe(true);
  });
});

describe("a group sitting out has no column (ticket 319)", () => {
  it("five groups with one sitting out show four columns", () => {
    const { classroom } = skipFixture("class wait", now);
    let c: ClassroomState = classroom;
    for (const id of ["jordan", "zara", "liam"]) c = classroomReducer(c, { type: "absence/set", assignment: ASSIGNMENT.id, student: id, absent: true });
    const session = { ...sessionAt("class-wait", "strong"), stage: "class-wait" as const };
    c = classroomReducer(c, { type: "group/begin", members: [DEMO_STUDENT.id], problems: [], at: now + 30_000 });
    expect(gridAt(c, session, now + 2 * MIN, P).map((g) => g.colour)).toEqual(["coral", "amber", "mint", "violet"]);
  });
});
