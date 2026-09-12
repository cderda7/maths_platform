import { describe, expect, it } from "vitest";
import { GROUP_COLOURS, type GroupColour } from "@/data/groups";
import { RACE_SCHEDULE } from "@/data/race";
import { classroomReducer } from "./classroom";
import { REPORT_RUN_FINISHED_AGO_MS, REPORT_RUN_STARTED_AGO_MS, skipFixture } from "./demo";
import { beginRun, groupProgress, ownAttemptScript, resolvedMoment, runStartedAt, type GroupRun } from "./groupReview";
import { sessionAt } from "./session";
import { leaderboardAt, ownStanding, raceFinish, raceMoments, raceProgress, rankStandings, standingsAt, unionOf, wrongSetsOf, type GroupStanding } from "./standings";

const now = 1_700_000_000_000;
const MIN = 60_000;

describe("the progress rule", () => {
  it("a union of three problems with 2, 2 and 1 members wrong jumps 40 %, 40 %, 20 %", () => {
    const wrong = { a: ["p1", "p2"], b: ["p1", "p3"], c: ["p2"] };
    const run = beginRun(["a", "b", "c"], ["p1", "p2", "p3"], 0);
    const at = (resolved: string[]) => groupProgress({ ...run, resolved }, wrong).percent;
    expect(at([])).toBe(0);
    expect(at(["p1"])).toBe(40);
    expect(at(["p1", "p2"])).toBe(80);
    expect(at(["p1", "p2", "p3"])).toBe(100);
  });

  it("the demo group jumps 2, 3, 3, 2, 1, 1 twelfths across its six problems", () => {
    const { classroom, session } = skipFixture("group review", now);
    const run = classroom.group!;
    const percents = run.problems.map((_, i) => standingsAt({ ...classroom, group: { ...run, resolved: run.problems.slice(0, i + 1) } }, session, now).find((s) => s.live)!.percent);
    expect(percents).toEqual([17, 42, 67, 83, 92, 100]);
    expect(wrongSetsOf(run.members, session)).toEqual({ sam: ["q1", "q2", "q3", "q7", "q10"], jordan: ["q2"], zara: ["q3", "q7", "q9"], liam: ["q1", "q2", "q3"] });
  });
});

describe("the scripted race", () => {
  const fixture = (colour: GroupColour) => standingsAt(skipFixture("group review", now).classroom, sessionAt("group"), now).find((s) => s.colour === colour)!;

  it("each other group's union and mistake total come from the seating and the classmates' wrong lists", () => {
    expect(fixture("coral").union).toEqual(["q3", "q4", "q5", "q6", "q7", "q10"]);
    expect(fixture("coral").total).toBe(8);
    expect(fixture("amber").union).toEqual(["q1", "q2", "q3", "q4", "q7", "q9"]);
    expect(fixture("amber").total).toBe(8);
    expect(fixture("mint").union).toEqual(["q3", "q4", "q5", "q7", "q9", "q10"]);
    expect(fixture("mint").total).toBe(8);
    expect(fixture("violet").union).toEqual(["q1", "q2", "q3", "q4", "q5", "q7", "q9"]);
    expect(fixture("violet").total).toBe(14);
    expect(unionOf({ a: ["q9", "q1"], b: ["q3"] })).toEqual(["q1", "q3", "q9"]);
  });

  it("two groups finish before the demo group plausibly would (under five minutes) and two after (nine minutes or more), all inside ten", () => {
    const finishes = GROUP_COLOURS.filter((c) => c !== "sky").map((c) => raceFinish(RACE_SCHEDULE[c], fixture(c).union.length));
    expect(finishes.filter((s) => s < 5 * 60)).toHaveLength(2);
    expect(finishes.filter((s) => s >= 9 * 60)).toHaveLength(2);
    for (const s of finishes) expect(s).toBeLessThanOrEqual(10 * 60);
    expect(GROUP_COLOURS.filter((c) => c !== "sky").map((c) => RACE_SCHEDULE[c].length)).toEqual(GROUP_COLOURS.filter((c) => c !== "sky").map((c) => fixture(c).union.length));
  });

  it("a union longer than its row carries on at the last gap; a shorter one finishes at its own last moment", () => {
    expect(raceMoments([70, 150, 220], 5)).toEqual([70, 150, 220, 290, 360]);
    expect(raceMoments([35, 80, 130, 185, 240, 290], 2)).toEqual([35, 80]);
    expect(raceMoments([40], 3)).toEqual([40, 80, 120]);
    expect(raceMoments([40], 0)).toEqual([]);
    expect(raceFinish([70, 150, 220], 3)).toBe(220);
  });

  it("progress is a function of elapsed time: nothing at the start, monotone, the latest moment kept for ties", () => {
    expect(raceProgress([70, 150, 220], 3, 0)).toEqual({ resolvedCount: 0, reachedAfterMs: 0 });
    expect(raceProgress([70, 150, 220], 3, 69_999)).toEqual({ resolvedCount: 0, reachedAfterMs: 0 });
    expect(raceProgress([70, 150, 220], 3, 70_000)).toEqual({ resolvedCount: 1, reachedAfterMs: 70_000 });
    expect(raceProgress([70, 150, 220], 3, 10 * MIN)).toEqual({ resolvedCount: 3, reachedAfterMs: 220_000 });
    let last = -1;
    for (let t = 0; t <= 10 * MIN; t += 5000) {
      const { resolvedCount } = raceProgress(RACE_SCHEDULE.coral, 6, t);
      expect(resolvedCount).toBeGreaterThanOrEqual(last);
      last = resolvedCount;
    }
  });

  it("at the start every bar is at zero and the demo group holds the pen on Q1; five minutes in, mint and amber are home and coral is ahead of violet", () => {
    const { classroom, session } = skipFixture("group review", now);
    const start = standingsAt(classroom, session, now);
    expect(start.map((s) => s.colour)).toEqual([...GROUP_COLOURS]);
    expect(start.map((s) => s.percent)).toEqual([0, 0, 0, 0, 0]);
    expect(start.map((s) => s.names.length)).toEqual([4, 4, 4, 4, 4]);
    const sky = start.find((s) => s.live)!;
    expect(sky.colour).toBe("sky");
    expect(sky.names).toEqual(["Sam", "Jordan", "Zara", "Liam"]);
    expect(sky.pen).toBe("sam");
    expect(sky.problem).toBe("q1");
    expect(start.filter((s) => s.live)).toHaveLength(1);
    for (const s of start) if (!s.live) expect(s.pen).toBeNull();

    const later = standingsAt(classroom, session, now + 5 * MIN);
    const by = Object.fromEntries(later.map((s) => [s.colour, s])) as Record<GroupColour, GroupStanding>;
    expect(by.mint.percent).toBe(100);
    expect(by.amber.percent).toBe(100);
    expect(by.coral.percent).toBe(38);
    expect(by.violet.percent).toBe(29);
    expect(by.sky.percent).toBe(0);
    expect(by.violet.reachedAt).toBeLessThan(by.coral.reachedAt);
    // Before the first tick the clock reads 0: the start, never a negative elapsed.
    expect(standingsAt(classroom, session, 0).map((s) => s.percent)).toEqual([0, 0, 0, 0, 0]);
  });
});

describe("the leaderboard", () => {
  const row = (colour: GroupColour, percent: number, reachedAt: number): GroupStanding => ({ colour, members: [], names: [], union: [], resolvedCount: 0, resolved: percent, total: 100, percent, reachedAt, live: false, pen: null, problem: null });

  it("orders by percent, then by who got there first, then by seating", () => {
    const ranked = rankStandings([row("coral", 60, 400), row("amber", 100, 500), row("mint", 100, 300), row("sky", 60, 100), row("violet", 0, 0)]);
    expect(ranked.map((r) => r.colour)).toEqual(["mint", "amber", "sky", "coral", "violet"]);
    expect(ranked.map((r) => r.rank)).toEqual([0, 1, 2, 3, 4]);
    const level = rankStandings([row("violet", 40, 10), row("coral", 40, 10), row("mint", 40, 10), row("sky", 40, 10), row("amber", 40, 10)]);
    expect(level.map((r) => r.colour)).toEqual([...GROUP_COLOURS]);
  });

  it("medals go to the first three across the line, in finishing order, and nobody else", () => {
    const ranked = rankStandings([row("coral", 60, 400), row("amber", 100, 500), row("mint", 100, 300), row("sky", 60, 100), row("violet", 0, 0)]);
    expect(ranked.map((r) => r.medal)).toEqual(["gold", "silver", null, null, null]);
    const all = rankStandings([row("coral", 100, 5), row("amber", 100, 4), row("mint", 100, 3), row("sky", 100, 2), row("violet", 100, 1)]);
    expect(all.map((r) => r.colour)).toEqual(["violet", "sky", "mint", "amber", "coral"]);
    expect(all.map((r) => r.medal)).toEqual(["gold", "silver", "bronze", null, null]);
    expect(rankStandings([row("coral", 99, 1), row("amber", 0, 0)]).map((r) => r.medal)).toEqual([null, null]);
  });

  it("100 % locks the position: a group that finishes later never passes one already home", () => {
    const before = rankStandings([row("mint", 100, 300), row("amber", 100, 500), row("coral", 60, 400), row("sky", 60, 100), row("violet", 0, 0)]);
    expect(before.slice(0, 2).map((r) => r.colour)).toEqual(["mint", "amber"]);
    // Coral finishes, then sky: bronze to coral, nothing for sky, the top two untouched.
    const after = rankStandings([row("mint", 100, 300), row("amber", 100, 500), row("coral", 100, 600), row("sky", 100, 700), row("violet", 80, 650)]);
    expect(after.map((r) => r.colour)).toEqual(["mint", "amber", "coral", "sky", "violet"]);
    expect(after.map((r) => r.medal)).toEqual(["gold", "silver", "bronze", null, null]);
  });

  it("the report jump holds the final standings: everyone home, the demo group third after mint and amber", () => {
    const { classroom, session } = skipFixture("report", now);
    const run = classroom.group!;
    expect(run.done).toBe(true);
    expect(runStartedAt(run)).toBe(now - REPORT_RUN_STARTED_AGO_MS);
    expect(resolvedMoment(run, run.problems.at(-1)!)).toBe(now - REPORT_RUN_FINISHED_AGO_MS);
    const ranked = leaderboardAt(classroom, session, now);
    expect(ranked.map((r) => r.colour)).toEqual(["mint", "amber", "sky", "coral", "violet"]);
    expect(ranked.map((r) => r.percent)).toEqual([100, 100, 100, 100, 100]);
    expect(ranked.map((r) => r.medal)).toEqual(["gold", "silver", "bronze", null, null]);
    expect(ranked.find((r) => r.live)!.pen).toBeNull();
  });
});

describe("the demo group's moments", () => {
  it("a correct check records when the problem was resolved, so ties go to whoever got there first", () => {
    let { classroom } = skipFixture("group review", now);
    const { session } = skipFixture("group review", now);
    for (const tex of ownAttemptScript("q1", 0)) classroom = classroomReducer(classroom, { type: "group/line", tex });
    classroom = classroomReducer(classroom, { type: "group/check", at: now + 42_000 });
    expect(classroom.group!.resolved).toEqual(["q1"]);
    expect(classroom.group!.resolvedAt).toEqual({ q1: now + 42_000 });
    const sky = standingsAt(classroom, session, now + 60_000).find((s) => s.live)!;
    expect(sky.percent).toBe(17);
    expect(sky.reachedAt).toBe(now + 42_000);
    expect(sky.problem).toBe("q1");
    expect(ownStanding(classroom, session)?.percent).toBe(17);
  });

  it("a scripted check carries its moment through; a run stored before the moments existed counts from its start", () => {
    let { classroom } = skipFixture("group review", now);
    classroom = { ...classroom, group: { ...classroom.group!, index: 1, turnStartedAt: now + 10_000 } };
    for (const tex of ownAttemptScript("q2", 0)) classroom = classroomReducer(classroom, { type: "group/scripted", index: classroom.group!.scriptDone, event: { at: 0, kind: "line", tex }, at: now + 10_000 });
    classroom = classroomReducer(classroom, { type: "group/scripted", index: classroom.group!.scriptDone, event: { at: 0, kind: "check" }, at: now + 25_000 });
    expect(classroom.group!.resolvedAt?.q2).toBe(now + 25_000);
    // No moment given: the turn's start stands in.
    const bare = classroomReducer({ ...classroom, group: { ...classroom.group!, index: 0, lines: ownAttemptScript("q1", 0) } }, { type: "group/check" });
    expect(bare.group!.resolvedAt?.q1).toBe(now + 10_000);
    const old = { members: ["sam"], problems: ["q1"], pen: { q1: "sam" }, index: 0, strokes: [], lines: [], attempts: {}, resolved: ["q1"], turnStartedAt: 5, scriptDone: 0, done: false } as GroupRun;
    expect(runStartedAt(old)).toBe(5);
    expect(resolvedMoment(old, "q1")).toBe(5);
  });
});
