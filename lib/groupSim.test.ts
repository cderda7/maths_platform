import { describe, expect, it } from "vitest";
import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATE_MAP, CLASSMATES } from "@/data/classmates";
import { SET6_REVIEW } from "@/data/classmates-review";
import { GROUP_SCRIPTS, SIMULATED_BOARDS } from "@/data/group-scripts";
import { GROUP_COLOURS } from "@/data/groups";
import { SLIPS } from "@/data/slips";
import { boardContent } from "./board";
import { classroomReducer, type ClassroomState } from "./classroom";
import { classStages } from "./classStage";
import { skipFixture } from "./demo";
import { evaluateLine } from "./evaluate";
import { explainableAt } from "./group";
import { checkBoard, HINT_AFTER_WRONG, LEAVE_AFTER_WRONG, LEAVE_PAUSE_MS, runStartedAt, stuckProblems } from "./groupReview";
import { boardScripts, playBoard, ruleTries, runTimeline, simulatedRunAt, triesFitRule, type SimulatedBoard } from "./groupSim";
import { recordScore, sessionScore } from "./setScore";
import { NOTHING_TO_REVIEW_TEXT, sessionAt, sessionReducer } from "./session";
import { groupsAt, leaderboardAt, pensAt, simulatedBoardOf, sittingOut, standingsAt, timelinesAt } from "./standings";

const now = 1_700_000_000_000;
const MIN = 60_000;
const correct = (pid: string, lines: readonly string[]) => checkBoard(pid, [...lines]).correct;
const solution = (pid: string) => ASSIGNMENT.problems.find((p) => p.id === pid)!.solution.map((s) => s.tex);

describe("the rule's shape for a table's tries (ticket 332)", () => {
  it("with someone who can explain: one or two tries, only the last holding; with nobody: three wrong checks and a wrong return, or a holding return for the named exception", () => {
    expect(triesFitRule("q1", [solution("q1")], true)).toBe(true);
    expect(triesFitRule("q1", [SLIPS.q1, solution("q1")], true)).toBe(true);
    expect(triesFitRule("q1", [SLIPS.q1, SLIPS.q1, solution("q1")], true)).toBe(false);
    expect(triesFitRule("q7", GROUP_SCRIPTS.q7.attempts, false)).toBe(true);
    expect(triesFitRule("q7", GROUP_SCRIPTS.q7.attempts, true)).toBe(false);
    expect(triesFitRule("q9", GROUP_SCRIPTS.q9.attempts, false)).toBe(false);
    expect(triesFitRule("q9", GROUP_SCRIPTS.q9.attempts, false, true)).toBe(true);
  });

  it("the rule's own tries come from the table's real slips, and a board falls back to them wherever authored tries do not fit who is there", () => {
    expect(ruleTries("q2", true, [SLIPS.q2])).toEqual([SLIPS.q2, solution("q2")]);
    expect(ruleTries("q2", true, [])).toEqual([solution("q2")]);
    expect(ruleTries("q8", false, []).map((lines) => correct("q8", lines))).toEqual([false, false, false, false]);
    // Mint's Q7 with a helper sat down at the table: two tries, not the ladder.
    const scripts = boardScripts(["q7"], SIMULATED_BOARDS.mint, () => true, () => [SLIPS.q7]);
    expect(scripts.q7.map((lines) => correct("q7", lines))).toEqual([false, true]);
  });
});

describe("a simulated board plays by the whiteboard's own rules (ticket 332)", () => {
  const board: SimulatedBoard = { members: ["a", "b"], problems: ["q1", "q7"], scripts: { q1: [SLIPS.q1, solution("q1")], q7: GROUP_SCRIPTS.q7.attempts.map((l) => [...l]) }, seed: 7 };
  const pace = { tryS: 20, nextS: 10 };

  it("each try checked after its time, a close moves on, a third wrong check leaves for now after the pause, the return closes it", () => {
    const events = playBoard(board, pace, 0).filter((e) => e.action.type !== "group/line");
    expect(events.map((e) => [e.action.type, e.at / 1000])).toEqual([
      ["group/check", 20],
      ["group/check", 40],
      ["group/next", 50],
      ["group/check", 70],
      ["group/check", 90],
      ["group/check", 110],
      ["group/leave", 110 + LEAVE_PAUSE_MS / 1000],
      ["group/check", 136],
      ["group/next", 146],
    ]);
    const end = simulatedRunAt(board, pace, 0, 10 * MIN);
    expect(end.done).toBe(true);
    expect(end.resolved).toEqual(["q1"]);
    expect(end.unsolved).toEqual(["q7"]);
    // Mid-run: the hint's second wrong check is on the board, nothing left yet.
    const mid = simulatedRunAt(board, pace, 0, 95_000);
    expect(mid.attempts.q7.map((a) => a.correct)).toEqual([false, false]);
    expect(mid.attempts.q7.length).toBe(HINT_AFTER_WRONG);
    expect(stuckProblems(mid)).toEqual([]);
    expect(stuckProblems(simulatedRunAt(board, pace, 0, 120_000))).toEqual([{ problem: "q7", tries: LEAVE_AFTER_WRONG, status: "left" }]);
  });

  it("the timeline says when each check came, when a question was left for now and when it closed", () => {
    const [q1, q7] = runTimeline(simulatedRunAt(board, pace, 0, 10 * MIN));
    expect(q1).toMatchObject({ problem: "q1", status: "solved", solvedOnReturn: false });
    expect(q1.visits.map((v) => [v.returning, v.checks.map((c) => [c.at, c.correct]), v.leftAt, v.closedAt])).toEqual([[false, [[20_000, false], [40_000, true]], null, 40_000]]);
    expect(q7.status).toBe("unsolved");
    expect(q7.visits.map((v) => [v.returning, v.checks.length, v.leftAt, v.closedAt])).toEqual([
      [false, 3, 110_000 + LEAVE_PAUSE_MS, null],
      [true, 1, null, 136_000],
    ]);
    // Before it is reached, a question is ahead; while it is on the board, working; between its visits, left.
    expect(runTimeline(simulatedRunAt(board, pace, 0, 30_000)).map((q) => q.status)).toEqual(["working", "ahead"]);
    expect(runTimeline(simulatedRunAt(board, pace, 0, 120_000)).map((q) => q.status)).toEqual(["solved", "working"]);
  });
});

describe("Problem Set 6's groups after individual review (ticket 332)", () => {
  const { classroom, session } = skipFixture("group review", now);
  const opens = runStartedAt(classroom.group!);
  const end = groupsAt(classroom, session, opens + 60 * MIN);
  const byColour = Object.fromEntries(end.map((g) => [g.colour, g]));
  const timelines = Object.fromEntries(timelinesAt(classroom, session, opens + 60 * MIN).map((t) => [t.colour, t.questions]));

  it("every group is listed, each with its union after individual review", () => {
    expect(end.map((g) => [g.colour, g.union.map((p) => p.slice(1)).join(",")])).toEqual([
      ["coral", "4,5,7,8,9,10"],
      ["amber", "2,7,9,10"],
      ["mint", "3,5,6,7,8,9,10"],
      ["sky", "1,2,3,5,6,7,8,9,10"],
      ["violet", "1,2,4,7,8,9,10"],
    ]);
    expect(sittingOut(classroom, session)).toEqual([]);
  });

  it("every simulated board is the authored one, which fits the rule for its table, and its last tries are the records' group versions", () => {
    for (const colour of GROUP_COLOURS.filter((c) => c !== "sky")) {
      const board = simulatedBoardOf(colour, byColour[colour].members, session, true);
      expect(Object.keys(SIMULATED_BOARDS[colour]!), colour).toEqual(board.problems);
      expect(board.scripts, colour).toEqual(Object.fromEntries(board.problems.map((p) => [p, SIMULATED_BOARDS[colour]![p]])));
      for (const pid of board.problems) {
        for (const lines of board.scripts[pid]) for (const tex of lines) expect(evaluateLine(pid, tex).verdict, `${colour} ${pid} ${tex}`).not.toBe("unclear");
        const version = SET6_REVIEW.groups[colour]![pid];
        expect(board.scripts[pid].at(-1), `${colour} ${pid}`).toEqual(version.lines);
        expect(correct(pid, board.scripts[pid].at(-1)!), `${colour} ${pid}`).toBe(version.solved);
        // A first wrong go on a question someone can explain is a slip a member really wrote.
        if (explainableAt(board.members, session, true, pid) && board.scripts[pid].length === 2) {
          const written = board.members.flatMap((m) => (CLASSMATE_MAP[m].wrong.includes(pid) ? [JSON.stringify(CLASSMATE_MAP[m].attempts[pid])] : []));
          expect(written, `${colour} ${pid}`).toContain(JSON.stringify(board.scripts[pid][0]));
        }
      }
      expect(Object.keys(SET6_REVIEW.groups[colour]!), colour).toEqual(board.problems);
    }
    expect(Object.keys(SET6_REVIEW.groups.sky!)).toEqual(byColour.sky.union);
  });

  it("the outcomes: sky's Q9 left for now then solved on the return; Q7 left for now then unsolved at mint, sky and violet; mint's Q10 too; everything else solved in one or two tries", () => {
    const outcomes = (colour: string) => Object.fromEntries(timelines[colour].map((q) => [q.problem, `${q.status}${q.solvedOnReturn ? " on return" : ""}${q.visits.length > 1 ? ` after ${q.visits[0].checks.length} + ${q.visits[1].checks.length}` : ` in ${q.visits[0]?.checks.length}`}`]));
    expect(outcomes("coral")).toEqual({ q4: "solved in 2", q5: "solved in 2", q7: "solved in 2", q8: "unsolved after 3 + 1", q9: "solved in 1", q10: "solved in 2" });
    expect(outcomes("amber")).toEqual({ q2: "solved in 2", q7: "solved in 2", q9: "solved in 2", q10: "solved in 1" });
    expect(outcomes("mint")).toEqual({ q3: "solved in 2", q5: "solved in 1", q6: "solved in 1", q7: "unsolved after 3 + 1", q8: "solved in 1", q9: "solved in 2", q10: "unsolved after 3 + 1" });
    expect(outcomes("violet")).toEqual({ q1: "solved in 2", q2: "solved in 2", q4: "solved in 2", q7: "unsolved after 3 + 1", q8: "solved in 1", q9: "solved in 1", q10: "solved in 1" });
    // Sky's own board, as the report jump plays it through.
    const report = skipFixture("report", now);
    const sky = Object.fromEntries(runTimeline(report.classroom.group!).map((q) => [q.problem, q]));
    expect([sky.q9.status, sky.q9.solvedOnReturn, sky.q9.visits.map((v) => v.checks.length)]).toEqual(["solved", true, [3, 1]]);
    expect([sky.q7.status, sky.q7.visits.map((v) => v.checks.length)]).toEqual(["unsolved", [3, 1]]);
  });

  it("each group with a question nobody at the table can explain has it: mint Q7 and Q10, sky Q7 and Q9, violet Q7, coral Q8 (ticket 347); amber cannot have one (Noah and Mia between them had every question right)", () => {
    const nobody = Object.fromEntries(end.map((g) => [g.colour, g.union.filter((p) => !explainableAt(g.members, session, true, p))]));
    expect(nobody).toEqual({ coral: ["q8"], amber: [], mint: ["q7", "q10"], sky: ["q7", "q9"], violet: ["q7"] });
    expect(ASSIGNMENT.problems.every((p, i) => ["mia", "noah"].some((m) => i < CLASSMATE_MAP[m].done && !CLASSMATE_MAP[m].wrong.includes(p.id)))).toBe(true);
  });

  it("set scores are unchanged by review: first submissions only", () => {
    expect(Object.fromEntries(CLASSMATES.map((m) => [m.id, recordScore(m, ASSIGNMENT.problems)]))).toEqual({ priya: 9, jordan: 5, amelia: 6, tomas: 3, zara: 7, liam: 1, aiden: 8, mia: 7, noah: 8, chloe: 0, ethan: 5, isla: 7, lucas: 8, grace: 4, harper: 4, oliver: 3, ruby: 7, finn: 6, sofia: 7 });
    expect(sessionScore(session, ASSIGNMENT.problems)).toBe(4);
  });

  it("every group has a pen at every moment it is still working, and the timeline and pens are the same run", () => {
    for (const t of [0, 2 * MIN, 5 * MIN, 9 * MIN]) {
      const pens = pensAt(classroom, session, opens + t);
      const rows = standingsAt(classroom, session, opens + t);
      expect(pens.map((p) => p.pen), `${t}`).toEqual(rows.map((r) => r.pen));
      for (const p of pens) if (p.pen) expect(byColour[p.colour].members, `${p.colour} ${t}`).toContain(p.pen);
    }
  });
});

describe("a group with nothing left to review sits out (ticket 332)", () => {
  /** Sam on a strong run with his three groupmates away: a group of one with every question right. */
  const setUp = () => {
    const { classroom } = skipFixture("class wait", now);
    let c: ClassroomState = classroom;
    for (const id of ["jordan", "zara", "liam"]) c = classroomReducer(c, { type: "absence/set", assignment: ASSIGNMENT.id, student: id, absent: true });
    const session = { ...sessionAt("class-wait", "strong"), stage: "class-wait" as const };
    c = classroomReducer(c, { type: "group/begin", members: [DEMO_STUDENT.id], problems: [], at: now + 30_000 });
    return { c, session };
  };

  it("is left out of the group list, the race, the standings, the leaderboard and the board, and its members count as done with the stage", () => {
    const { c, session } = setUp();
    expect(groupsAt(c, session, now + 2 * MIN).map((g) => g.colour)).toEqual(["coral", "amber", "mint", "violet"]);
    expect(standingsAt(c, session, now + 2 * MIN).map((s) => s.colour)).toEqual(["coral", "amber", "mint", "violet"]);
    expect(leaderboardAt(c, session, now + 2 * MIN)).toHaveLength(4);
    const board = boardContent(c, session, now + 2 * MIN);
    expect(board.kind === "group" && board.standings.map((s) => s.colour).sort()).toEqual(["amber", "coral", "mint", "violet"]);
    expect(sittingOut(c, session)).toEqual([{ colour: "sky", members: [DEMO_STUDENT.id] }]);
    // The stage's done count: Sam, sitting out, is done; the other groups still racing count nobody yet.
    expect(classStages(c, session, now + 40_000).find((s) => s.id === "group")!.done).toBe(1);
    // The race still runs on the clock from the empty board's opening.
    expect(standingsAt(c, session, now + 30_000 + 4 * MIN).find((s) => s.colour === "amber")!.percent).toBe(100);
  });

  it("the student goes straight to the stage after group review, told their group has nothing left to review", () => {
    const { session } = setUp();
    const on = sessionReducer(session, { type: "group/start", nothingToReview: true });
    expect(on.stage).toBe("waiting");
    expect(on.notice).toBe(NOTHING_TO_REVIEW_TEXT);
    expect(NOTHING_TO_REVIEW_TEXT).toBe("Your group has nothing left to review.");
    // Moved onto the board by a teacher's force instead, the same.
    const forced = sessionReducer({ ...session, stage: "group" }, { type: "group/done", nothingToReview: true });
    expect([forced.stage, forced.notice]).toEqual(["waiting", NOTHING_TO_REVIEW_TEXT]);
  });

  it("since ticket 347 every classmate has something to fix, so coral no longer sits out with only Priya and Aiden in the room: the two of them work Q8 alone instead, with nobody there to explain it", () => {
    const { classroom, session } = skipFixture("group review", now);
    let c = classroom;
    for (const id of ["amelia", "tomas"]) c = classroomReducer(c, { type: "absence/set", assignment: ASSIGNMENT.id, student: id, absent: true });
    expect(standingsAt(c, session, now).map((s) => s.colour)).toEqual(["coral", "amber", "mint", "sky", "violet"]);
    expect(sittingOut(c, session)).toEqual([]);
    expect(standingsAt(c, session, now).find((s) => s.colour === "coral")!.union).toEqual(["q8"]);
  });
});
