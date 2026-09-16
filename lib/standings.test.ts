import { describe, expect, it } from "vitest";
import { GROUP_COLOURS, type GroupColour } from "@/data/groups";
import { DEMO_STUDENT } from "@/data/assignment";
import { HOLD_MS, UNMARKED_MS } from "./debrief";
import { classroomReducer } from "./classroom";
import { REPORT_RUN_FINISHED_AGO_MS, REPORT_RUN_STARTED_AGO_MS, skipFixture } from "./demo";
import { boardOpensAt } from "./groupIntro";
import { beginRun, checkBoard, closedInOrder, closedMoment, groupProgress, LEAVE_AFTER_WRONG, LEAVE_PAUSE_MS, ownAttemptScript, resolvedMoment, runAttempts, runStartedAt, turnScript, visitsOf, type GroupRun } from "./groupReview";
import { sessionAt } from "./session";
import { groupsAt, leaderboardAt, ownStanding, pensAt, rankStandings, standingsAt, unionOf, wrongSetsOf, type GroupStanding } from "./standings";

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

  it("the demo group jumps 1, 1, 1, 1, 1, 4, 2, 4, 2 seventeenths across its nine questions (ticket 332: each member's questions after individual review; Liam brings Q1–Q3, Q5–Q10, Jordan Q7–Q10, Sam and Zara Q7 and Q9)", () => {
    const { classroom, session } = skipFixture("group review", now);
    const run = classroom.group!;
    const percents = run.problems.map((_, i) => standingsAt({ ...classroom, group: { ...run, resolved: run.problems.slice(0, i + 1) } }, session, now).find((s) => s.live)!.percent);
    expect(percents).toEqual([6, 12, 18, 24, 29, 53, 65, 88, 100]);
    expect(wrongSetsOf(run.members, session, true)).toEqual({ sam: ["q7", "q9"], jordan: ["q7", "q8", "q9", "q10"], zara: ["q7", "q9"], liam: ["q1", "q2", "q3", "q5", "q6", "q7", "q8", "q9", "q10"] });
  });
});

describe("the simulated race (ticket 332)", () => {
  const fixture = (colour: GroupColour) => standingsAt(skipFixture("group review", now).classroom, sessionAt("group"), now).find((s) => s.colour === colour)!;
  /** Every listed group's run far past its finish, from the fixture's opening. */
  const finished = () => {
    const { classroom, session } = skipFixture("group review", now);
    const opens = runStartedAt(classroom.group!);
    return { opens, groups: groupsAt(classroom, session, opens + 60 * MIN) };
  };

  it("each other group's union and total come from Problem Set 6's seating and every question a member still has after individual review", () => {
    expect(fixture("coral").union).toEqual(["q4", "q5", "q7", "q8", "q9", "q10"]);
    expect(fixture("coral").total).toBe(10);
    expect(fixture("amber").union).toEqual(["q2", "q7", "q9", "q10"]);
    expect(fixture("amber").total).toBe(5);
    expect(fixture("mint").union).toEqual(["q3", "q5", "q6", "q7", "q8", "q9", "q10"]);
    expect(fixture("mint").total).toBe(16);
    expect(fixture("violet").union).toEqual(["q1", "q2", "q4", "q7", "q8", "q9", "q10"]);
    expect(fixture("violet").total).toBe(13);
    expect(fixture("sky").union).toEqual(["q1", "q2", "q3", "q5", "q6", "q7", "q8", "q9", "q10"]);
    expect(unionOf({ a: ["q9", "q1"], b: ["q3"] })).toEqual(["q1", "q3", "q9"]);
  });

  /**
   * The quickest the demo group's live board can go (ticket 278): every peer turn as scripted, every close held for the
   * debrief (two seconds unmarked, ten on the marks), a problem left for now held for the pause, and Sam's own turns at
   * four seconds a line plus two to check. Q7 and Q9 are both left for now (ticket 332).
   */
  const skyQuickestSeconds = () => {
    const { classroom } = skipFixture("group review", now);
    const begun = classroom.group!;
    const run = { ...begun, left: ["q7", "q9"] };
    let ms = 0;
    const tries: Record<string, number> = {};
    for (const v of visitsOf(run)) {
      const from = tries[v.problem] ?? 0;
      const script = runAttempts(begun, v.problem)!;
      const played = turnScript(v.problem, from, v.returning, script);
      const checks = v.pen === DEMO_STUDENT.id ? Math.min(script.length - from, v.returning ? 1 : LEAVE_AFTER_WRONG) : played.filter((e) => e.kind === "check").length;
      const lines = script.slice(from, from + checks).reduce((n, a) => n + a.length, 0);
      ms += v.pen === DEMO_STUDENT.id ? lines * 4000 + checks * 2000 : played.at(-1)!.at;
      tries[v.problem] = from + checks;
      const closes = v.returning || checkBoard(v.problem, [...script[from + checks - 1]]).correct;
      ms += closes ? UNMARKED_MS + HOLD_MS : LEAVE_PAUSE_MS;
    }
    return ms / 1000;
  };

  it("amber finishes before the demo group's quickest board, coral (with an unsolved question of its own, ticket 347) shortly after it, and two after it has had four minutes' slack (ten minutes or more), all inside twelve; without individual review on the pathway every group is still home inside the report jump's fifteen", () => {
    const { opens, groups } = finished();
    const finishes = groups.filter((g) => !g.live).map((g) => ({ colour: g.colour, s: Math.max(...closedInOrder(g.run!).map((p) => closedMoment(g.run!, p))) / 1000 - opens / 1000 }));
    const sky = skyQuickestSeconds();
    expect(sky).toBeGreaterThan(5 * 60);
    expect(sky + 4 * 60).toBeLessThan(10 * 60);
    expect(finishes.filter((f) => f.s < sky).map((f) => f.colour)).toEqual(["amber"]);
    // Coral's own unsolved question (Q8) now costs it three wrong checks, the pause and a return, so it lands just after sky's quickest board rather than before it.
    const coral = finishes.find((f) => f.colour === "coral")!;
    expect(coral.s).toBeGreaterThan(sky);
    expect(coral.s - sky).toBeLessThan(30);
    expect(finishes.filter((f) => f.s >= 10 * 60).map((f) => f.colour)).toEqual(["mint", "violet"]);
    for (const f of finishes) expect(f.s, f.colour).toBeLessThanOrEqual(12 * 60);
    for (const g of groups) if (!g.live) expect(g.run!.done, g.colour).toBe(true);
    // First submissions (no individual review): longer unions, every simulated group home before the report jump's run began fifteen minutes ago.
    const { classroom, session } = skipFixture("group review", now);
    const firstOnly = { ...classroom, assignment: { ...classroom.assignment!, pathway: ["group" as const] } };
    const slow = groupsAt(firstOnly, session, opens + 60 * MIN).filter((g) => !g.live).map((g) => Math.max(...closedInOrder(g.run!).map((p) => closedMoment(g.run!, p))) - opens);
    for (const ms of slow) expect(ms).toBeLessThan(REPORT_RUN_STARTED_AGO_MS);
  });

  it("no simulated bar jumps or finishes at once: the first question closes after half a minute, and each close comes 30 s to 200 s after the one before (a question left for now is the long one)", () => {
    const { opens, groups } = finished();
    for (const g of groups.filter((x) => !x.live)) {
      const moments = closedInOrder(g.run!).map((p) => (closedMoment(g.run!, p) - opens) / 1000);
      expect(moments[0], g.colour).toBeGreaterThanOrEqual(30);
      for (let i = 1; i < moments.length; i++) {
        expect(moments[i] - moments[i - 1], `${g.colour} ${i}`).toBeGreaterThanOrEqual(30);
        expect(moments[i] - moments[i - 1], `${g.colour} ${i}`).toBeLessThanOrEqual(200);
      }
    }
  });

  it("progress is a function of the clock: nothing at the start, every bar only climbs, and a reload at any moment reads the same", () => {
    const { classroom, session } = skipFixture("group review", now);
    const opens = runStartedAt(classroom.group!);
    let last: Record<string, number> = {};
    for (let t = 0; t <= 12 * MIN; t += 5000) {
      const rows = standingsAt(classroom, session, opens + t);
      for (const r of rows) {
        expect(r.percent, `${r.colour} ${t}`).toBeGreaterThanOrEqual(last[r.colour] ?? 0);
        expect(standingsAt(classroom, session, opens + t).find((x) => x.colour === r.colour)!.percent).toBe(r.percent);
      }
      last = Object.fromEntries(rows.map((r) => [r.colour, r.percent]));
    }
  });

  it("at the start every bar is at zero and every group has its first pen; four minutes in amber is home, five minutes in coral too, mint and violet still climbing with Q7 left for now", () => {
    const { classroom, session } = skipFixture("group review", now);
    // The board opens once the intro is read (ticket 220): until then, and at the opening, every bar is at zero.
    const opens = boardOpensAt(now);
    expect(standingsAt(classroom, session, now + 10_000).map((s) => s.percent)).toEqual([0, 0, 0, 0, 0]);
    const start = standingsAt(classroom, session, opens);
    expect(start.map((s) => s.colour)).toEqual([...GROUP_COLOURS]);
    expect(start.map((s) => s.percent)).toEqual([0, 0, 0, 0, 0]);
    // Amber meets as three: Chloe is absent on Problem Set 6 (ticket 250).
    expect(start.map((s) => s.names.length)).toEqual([4, 3, 4, 4, 4]);
    expect(start.find((s) => s.colour === "amber")!.names).toEqual(["Mia", "Noah", "Ethan"]);
    const sky = start.find((s) => s.live)!;
    expect(sky.colour).toBe("sky");
    expect(sky.names).toEqual(["Sam", "Jordan", "Zara", "Liam"]);
    expect(sky.pen).toBe("sam");
    expect(sky.problem).toBe("q1");
    expect(start.filter((s) => s.live)).toHaveLength(1);
    // Every simulated group holds a pen on its first question, dealt by the shuffle.
    for (const s of start) if (!s.live) expect([s.members.includes(s.pen!), s.problem], s.colour).toEqual([true, s.union[0]]);
    expect(pensAt(classroom, session, opens).map((p) => p.pen)).toEqual(start.map((s) => s.pen));

    const four = Object.fromEntries(standingsAt(classroom, session, opens + 4 * MIN).map((s) => [s.colour, s])) as Record<GroupColour, GroupStanding>;
    expect(four.amber.percent).toBe(100);
    expect(four.coral.percent).toBeLessThan(100);
    const later = Object.fromEntries(standingsAt(classroom, session, opens + 6 * MIN).map((s) => [s.colour, s])) as Record<GroupColour, GroupStanding>;
    expect(later.amber.percent).toBe(100);
    expect(later.coral.percent).toBe(100);
    expect(later.mint.percent).toBeLessThan(100);
    expect(later.violet.percent).toBeLessThan(100);
    expect(later.mint.stuck).toEqual([{ problem: "q7", tries: 3, status: "left" }]);
    expect(later.violet.stuck).toEqual([]);
    expect(later.sky.percent).toBe(0);
    // Before the first tick the clock reads 0: the start, never a negative elapsed.
    expect(standingsAt(classroom, session, 0).map((s) => s.percent)).toEqual([0, 0, 0, 0, 0]);
  });

  it("ended by the teacher, the simulated race holds where it was and the demo group's pen is down", () => {
    const { classroom, session } = skipFixture("group review", now);
    const ended = classroomReducer(classroom, { type: "group/end", at: now + 5 * MIN });
    const atEnd = standingsAt(classroom, session, now + 5 * MIN).map((s) => [s.percent, s.reachedAt]);
    expect(standingsAt(ended, session, now + 5 * MIN).map((s) => [s.percent, s.reachedAt])).toEqual(atEnd);
    expect(standingsAt(ended, session, now + 30 * MIN).map((s) => [s.percent, s.reachedAt])).toEqual(atEnd);
    const sky = standingsAt(ended, session, now + 30 * MIN).find((s) => s.live)!;
    expect(sky.percent).toBe(0);
    expect(sky.pen).toBeNull();
    expect(sky.problem).toBeNull();
  });
});

describe("the leaderboard", () => {
  const row = (colour: GroupColour, percent: number, reachedAt: number): GroupStanding => ({ colour, members: [], names: [], union: [], resolvedCount: 0, resolved: percent, total: 100, percent, reachedAt, live: false, pen: null, problem: null, stuck: [] });

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

  it("the report jump holds the final standings: everyone home, the demo group third after amber and coral", () => {
    const { classroom, session } = skipFixture("report", now);
    const run = classroom.group!;
    expect(run.done).toBe(true);
    expect(runStartedAt(run)).toBe(now - REPORT_RUN_STARTED_AGO_MS);
    // Q7 left for now and closed unsolved on its return (ticket 222); Q9 left for now and solved on its return, last (ticket 332).
    expect(run.left).toEqual(["q7", "q9"]);
    expect(run.unsolved).toEqual(["q7"]);
    expect(run.resolved.at(-1)).toBe("q9");
    expect(Math.round(closedMoment(run, "q9"))).toBe(now - REPORT_RUN_FINISHED_AGO_MS);
    expect(closedMoment(run, "q7")).toBeLessThan(closedMoment(run, "q9"));
    const ranked = leaderboardAt(classroom, session, now);
    expect(ranked.map((r) => r.colour)).toEqual(["amber", "coral", "sky", "mint", "violet"]);
    expect(ranked.map((r) => r.percent)).toEqual([100, 100, 100, 100, 100]);
    expect(ranked.map((r) => r.medal)).toEqual(["gold", "silver", "bronze", null, null]);
    expect(ranked.find((r) => r.live)!.pen).toBeNull();
    // The teacher's card names what each group could not get (ticket 223; every group since ticket 332).
    const stuck = Object.fromEntries(ranked.map((r) => [r.colour, r.stuck]));
    expect(stuck).toEqual({ coral: [{ problem: "q8", tries: 4, status: "unsolved" }], amber: [], sky: [{ problem: "q7", tries: 4, status: "unsolved" }], mint: [{ problem: "q7", tries: 4, status: "unsolved" }, { problem: "q10", tries: 4, status: "unsolved" }], violet: [{ problem: "q7", tries: 4, status: "unsolved" }] });
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
    expect(sky.percent).toBe(6);
    expect(sky.reachedAt).toBe(now + 42_000);
    expect(sky.problem).toBe("q1");
    expect(ownStanding(classroom, session)?.percent).toBe(6);
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
