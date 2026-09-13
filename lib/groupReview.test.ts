import { describe, expect, it } from "vitest";
import { beginRun, boardHint, checkBoard, closedInOrder, comingBack, currentProblem, dealPens, DEMO_SEED, groupProgress, HINT_AFTER_WRONG, LEAVE_AFTER_WRONG, LEAVE_PAUSE_MS, leaveAt, leaving, markFirstMistake, ownAttemptScript, penHolder, penOrder, shuffle, stuckProblems, turnScript, visitsOf, writerOf, wrongChecks, type GroupRun } from "./groupReview";
import { classroomReducer, INITIAL_CLASSROOM, type ClassroomState } from "./classroom";
import { PROBLEM_MAP } from "@/data/assignment";
import { DEMO_PENS, GROUP_SCRIPTS } from "@/data/group-scripts";
import { RECOGNITION, RECOGNITION_REWORK } from "@/data/recognition";
import { evaluateLine } from "./evaluate";
import { pendingDebrief } from "./debrief";

const MEMBERS = ["sam", "jordan", "zara", "liam"];
const UNION = ["q1", "q2", "q3", "q7", "q9", "q10"];

describe("the pen", () => {
  it("is a shuffle that reshuffles when it runs out: nobody writes twice before everyone has once", () => {
    for (const seed of [1, 2, 3, 99, DEMO_SEED]) {
      const pen = penOrder(UNION, MEMBERS, seed);
      const first = UNION.slice(0, 4).map((p) => pen[p]);
      expect([...first].sort()).toEqual([...MEMBERS].sort());
      expect(new Set(UNION.slice(4).map((p) => pen[p])).size).toBe(2);
    }
    expect(shuffle([1, 2, 3, 4], 5)).toEqual(shuffle([1, 2, 3, 4], 5));
  });
  it("the demo seed deals Sam, Zara, Jordan, Liam, then Sam, Zara", () => {
    expect(penOrder(UNION, MEMBERS, DEMO_SEED)).toEqual({ q1: "sam", q2: "zara", q3: "jordan", q7: "liam", q9: "sam", q10: "zara" });
    expect(penHolder(beginRun(MEMBERS, UNION, 0))).toBe("sam");
  });
});

describe("check and the first-mistake cut", () => {
  it("every known line judged, the final line decides", () => {
    expect(checkBoard("q1", RECOGNITION_REWORK.q1)).toEqual({ correct: true, cut: -1 });
    expect(checkBoard("q3", RECOGNITION.q3)).toEqual({ correct: false, cut: 1 });
    expect(checkBoard("q1", [])).toEqual({ correct: false, cut: -1 });
    expect(checkBoard("q1", ["x^2 - 5x + 6 = 0"]).correct).toBe(true);
    expect(checkBoard("q1", ["\\text{something new}"]).correct).toBe(false);
  });
  it("shows every line of the attempt, only the first wrong one red; a clean attempt whole and unmarked", () => {
    const marked = markFirstMistake("q3", RECOGNITION.q3);
    expect(marked.map((l) => l.tex)).toEqual(RECOGNITION.q3);
    expect(marked.map((l) => l.mark)).toEqual([null, "wrong", null]);
    const clean = markFirstMistake("q1", RECOGNITION_REWORK.q1);
    expect(clean.map((l) => l.tex)).toEqual(RECOGNITION_REWORK.q1);
    expect(clean.every((l) => l.mark === null)).toBe(true);
  });
  it("every attempt of every union problem is readable line by line, wrong attempts before right ones; Q7 is never right", () => {
    for (const pid of UNION) {
      const s = GROUP_SCRIPTS[pid];
      expect(s, pid).toBeDefined();
      for (const [i, lines] of s.attempts.entries()) {
        for (const tex of lines) expect(evaluateLine(pid, tex).verdict, `${pid} ${tex}`).not.toBe("unclear");
        expect(checkBoard(pid, lines).correct, `${pid} attempt ${i}`).toBe(pid !== "q7" && i === s.attempts.length - 1);
      }
    }
    expect(ownAttemptScript("q9", 0)).toEqual(GROUP_SCRIPTS.q9.attempts[0]);
    expect(ownAttemptScript("q9", 5)).toEqual(GROUP_SCRIPTS.q9.attempts[1]);
  });
  it("a peer's turn scribbles each line, reads it, checks, and on Q3 checks twice", () => {
    const q2 = turnScript("q2");
    expect(q2.filter((e) => e.kind === "check")).toHaveLength(1);
    expect(q2.filter((e) => e.kind === "line").map((e) => e.kind === "line" && e.tex)).toEqual(RECOGNITION_REWORK.q2);
    expect(q2.every((e, i) => i === 0 || e.at >= q2[i - 1].at)).toBe(true);
    const q3 = turnScript("q3");
    expect(q3.filter((e) => e.kind === "check")).toHaveLength(2);
    expect(q3.filter((e) => e.kind === "clear")).toHaveLength(1);
    expect(q3.filter((e) => e.kind === "line")).toHaveLength(RECOGNITION.q3.length + RECOGNITION_REWORK.q3.length);
    expect(turnScript("q4")).toEqual([]);
  });
  it("the group never solves Q7: Liam's visit checks wrong three times (two terms, the lost third, the wrong pair), and the return one more (the brackets' signs)", () => {
    const [twoTerms, lostThird, wrongPair, flipped] = GROUP_SCRIPTS.q7.attempts;
    expect(GROUP_SCRIPTS.q7.attempts).toHaveLength(4);
    expect(checkBoard("q7", twoTerms)).toEqual({ correct: false, cut: 0 });
    expect(markFirstMistake("q7", twoTerms)).toEqual([{ tex: twoTerms[0], mark: "wrong" }, { tex: twoTerms[1], mark: null }, { tex: twoTerms[2], mark: null }]);
    expect(checkBoard("q7", lostThird)).toEqual({ correct: false, cut: 0 });
    expect(checkBoard("q7", wrongPair)).toEqual({ correct: false, cut: 1 });
    expect(checkBoard("q7", flipped)).toEqual({ correct: false, cut: 2 });
    // Each try gets further: the return has the third and the pair right, as the model solution does.
    expect(flipped.slice(0, 2)).toEqual(PROBLEM_MAP.q7.solution.slice(0, 2).map((s) => s.tex));
    expect(checkBoard("q7", RECOGNITION_REWORK.q7).correct).toBe(false);
    const lines = (events: ReturnType<typeof turnScript>) => events.filter((e) => e.kind === "line").map((e) => e.kind === "line" && e.tex);
    // The first visit stops after the third check, the one that leaves Q7 for now.
    const first = turnScript("q7");
    expect(first.filter((e) => e.kind === "check")).toHaveLength(LEAVE_AFTER_WRONG);
    expect(lines(first)).toEqual([...twoTerms, ...lostThird, ...wrongPair]);
    expect(first.at(-1)?.kind).toBe("check");
    // Each later try starts on a clean board, right after the pause; the first try and the return start on the board they find.
    expect(first.filter((e) => e.kind === "clear")).toHaveLength(2);
    for (const [i, e] of first.entries()) if (e.kind === "clear") expect(first[i - 1].kind).toBe("check");
    expect(turnScript("q7", 3, true).some((e) => e.kind === "clear")).toBe(false);
    // The return picks up at the fourth attempt and checks once.
    const back = turnScript("q7", 3, true);
    expect(back.filter((e) => e.kind === "check")).toHaveLength(1);
    expect(lines(back)).toEqual(flipped);
    // It starts at the top of the turn, not after the first visit's pauses.
    expect(back[0].at).toBeLessThan(first.find((e) => e.kind === "check")!.at);
  });
});

describe("the hint on the board", () => {
  const at = (attempts: string[][], problem = "q7") => {
    const run = beginRun(MEMBERS, UNION, 0);
    return { ...run, index: UNION.indexOf(problem), attempts: { [problem]: attempts.map((lines) => ({ lines, correct: checkBoard(problem, lines).correct })) } };
  };
  const [twoTerms, lostThird, model] = GROUP_SCRIPTS.q7.attempts;

  it("appears from the second wrong check, on the latest attempt's first mistake, and names the move", () => {
    expect(HINT_AFTER_WRONG).toBe(2);
    expect(boardHint(at([]))).toBeNull();
    expect(boardHint(at([twoTerms]))).toBeNull();
    expect(wrongChecks(at([twoTerms, lostThird]), "q7")).toBe(2);
    expect(boardHint(at([twoTerms, lostThird]))).toEqual({ text: (evaluateLine("q7", "x^2 + 6x + 8") as { clue: string }).clue });
    expect(boardHint(at([lostThird, twoTerms]))?.text).toMatch(/One of them didn't get the same treatment/);
  });

  it("goes once the problem checks correct, and never shows on a problem with one wrong check", () => {
    expect(boardHint({ ...at([twoTerms, lostThird, model]), resolved: ["q7"] })).toBeNull();
    expect(boardHint(at([RECOGNITION.q3], "q3"))).toBeNull();
  });
});

describe("the run on the classroom", () => {
  const begin = (c: ClassroomState = INITIAL_CLASSROOM) => classroomReducer(c, { type: "group/begin", members: MEMBERS, problems: UNION, at: 100 });
  const r = classroomReducer;

  it("begins once, keeps the board per problem, and only a check with lines counts", () => {
    let c = begin();
    expect(r(c, { type: "group/begin", members: [], problems: [], at: 5 }).group).toBe(c.group);
    expect(r(c, { type: "group/check" })).toBe(c);
    c = r(c, { type: "group/stroke", stroke: [{ x: 1, y: 1 }] });
    c = r(c, { type: "group/line", tex: RECOGNITION_REWORK.q1[0] });
    c = r(c, { type: "group/stroke", stroke: [{ x: 2, y: 2 }] });
    c = r(c, { type: "group/line", tex: RECOGNITION_REWORK.q1[1] });
    expect(c.group?.strokes).toHaveLength(2);
    c = r(c, { type: "group/undo" });
    expect(c.group?.strokes).toHaveLength(1);
    expect(c.group?.lines).toHaveLength(1);
    c = r(c, { type: "group/line", tex: RECOGNITION_REWORK.q1[1] });
    c = r(c, { type: "group/check" });
    expect(c.group?.resolved).toEqual(["q1"]);
    expect(c.group?.attempts.q1).toEqual([{ lines: RECOGNITION_REWORK.q1, correct: true, at: 100 }]);
    expect(r(c, { type: "group/stroke", stroke: [{ x: 3, y: 3 }] })).toBe(c); // resolved: the board is closed
    c = r(c, { type: "group/next", at: 200 });
    expect(c.group?.index).toBe(1);
    expect(c.group?.strokes).toEqual([]);
    expect(c.group?.turnStartedAt).toBe(200);
  });

  it("a wrong check wipes the board and starts the next attempt afresh; next needs a correct check; the last next finishes", () => {
    let c = begin();
    c = r(c, { type: "group/next", at: 1 });
    expect(c.group?.index).toBe(0);
    c = { ...c, group: { ...c.group!, index: 2 } }; // Q3, Jordan
    for (const tex of RECOGNITION.q3) c = r(c, { type: "group/line", tex });
    c = r(c, { type: "group/stroke", stroke: [{ x: 1, y: 1 }] });
    c = r(c, { type: "group/check" });
    expect(c.group?.attempts.q3?.[0]).toMatchObject({ lines: RECOGNITION.q3, correct: false });
    expect(c.group?.strokes).toEqual([]);
    expect(c.group?.lines).toEqual([]);
    for (const tex of RECOGNITION_REWORK.q3) c = r(c, { type: "group/line", tex });
    c = r(c, { type: "group/check" });
    expect(c.group?.resolved).toEqual(["q3"]);
    c = { ...c, group: { ...c.group!, index: 5, resolved: [...c.group!.resolved, "q10"] } };
    c = r(c, { type: "group/next", at: 9 });
    expect(c.group?.done).toBe(true);
  });

  it("scripted events apply once each, by index", () => {
    let c = begin();
    const e = turnScript("q2")[0];
    c = r(c, { type: "group/scripted", index: 1, event: e });
    expect(c.group?.scriptDone).toBe(0);
    c = r(c, { type: "group/scripted", index: 0, event: e });
    expect(c.group?.scriptDone).toBe(1);
    expect(c.group?.strokes).toHaveLength(1);
    expect(r(c, { type: "group/scripted", index: 0, event: e }).group?.strokes).toHaveLength(1);
  });

  it("progress counts members' original mistakes on closed problems (resolved or unsolved) over all of them", () => {
    const wrong = { sam: ["q1", "q2", "q3", "q7", "q10"], jordan: ["q2"], zara: ["q3", "q9"], liam: ["q2", "q3"] };
    const run = beginRun(MEMBERS, UNION, 0);
    expect(groupProgress(run, wrong)).toEqual({ resolved: 0, total: 10, percent: 0 });
    expect(groupProgress({ ...run, resolved: ["q1"] }, wrong).percent).toBe(10);
    expect(groupProgress({ ...run, resolved: ["q1", "q2"] }, wrong).percent).toBe(40);
    expect(groupProgress({ ...run, resolved: UNION }, wrong).percent).toBe(100);
    // A problem closed unsolved counts the same (ticket 222): the bar can reach 100% without it.
    expect(groupProgress({ ...run, resolved: UNION.filter((p) => p !== "q7"), unsolved: ["q7"] }, wrong).percent).toBe(100);
    expect(groupProgress({ ...run, resolved: UNION.filter((p) => p !== "q7"), left: ["q7"] }, wrong).percent).toBe(90);
  });
});

describe("a problem the group cannot get (ticket 222)", () => {
  const r = classroomReducer;
  const Q7 = UNION.indexOf("q7");
  const write = (c: ClassroomState, lines: string[], at: number) => {
    for (const tex of lines) c = r(c, { type: "group/line", tex });
    return r(c, { type: "group/check", at });
  };
  /** Q1–Q3 resolved and the board on Q7 with Liam's pen. */
  const onQ7 = (): ClassroomState => {
    const c = classroomReducer(INITIAL_CLASSROOM, { type: "group/begin", members: MEMBERS, problems: UNION, at: 0 });
    return { ...c, group: { ...c.group!, index: Q7, resolved: ["q1", "q2", "q3"], resolvedAt: { q1: 10, q2: 20, q3: 30 }, turnStartedAt: 40 } };
  };
  const [twoTerms, lostThird, wrongPair, flipped] = GROUP_SCRIPTS.q7.attempts;

  it("deals the pens for the return after the union's: the demo's return to Q7 is Jordan's", () => {
    expect(dealPens(7, MEMBERS, DEMO_SEED)).toEqual(["sam", "zara", "jordan", "liam", "sam", "zara", "jordan"]);
    const run = { ...beginRun(MEMBERS, UNION, 0), left: ["q7"] };
    expect(visitsOf(run).map((v) => [v.problem, v.pen, v.returning])).toEqual([
      ["q1", "sam", false],
      ["q2", "zara", false],
      ["q3", "jordan", false],
      ["q7", "liam", false],
      ["q9", "sam", false],
      ["q10", "zara", false],
      ["q7", "jordan", true],
    ]);
    expect(visitsOf(beginRun(MEMBERS, UNION, 0))).toHaveLength(6);
  });

  it("the third wrong check holds, then leaves the problem for now; the board takes nothing meanwhile and two tabs leave once", () => {
    let c = onQ7();
    c = write(c, twoTerms, 1000);
    c = write(c, lostThird, 2000);
    expect(leaving(c.group!)).toBe(false);
    c = write(c, wrongPair, 3000);
    expect(wrongChecks(c.group!, "q7")).toBe(3);
    expect(leaving(c.group!)).toBe(true);
    expect(leaveAt(c.group!)).toBe(3000 + LEAVE_PAUSE_MS);
    expect(r(c, { type: "group/stroke", stroke: [{ x: 1, y: 1 }] })).toBe(c);
    expect(r(c, { type: "group/line", tex: "x" })).toBe(c);
    expect(r(c, { type: "group/next", at: 9 })).toBe(c); // not closed
    expect(r(c, { type: "group/leave", index: Q7 + 1, at: 9000 })).toBe(c); // a stale or future index does nothing
    c = r(c, { type: "group/leave", index: Q7, at: 9000 });
    expect(c.group!.left).toEqual(["q7"]);
    expect(currentProblem(c.group!)).toBe("q9");
    expect(penHolder(c.group!)).toBe("sam");
    expect(c.group!).toMatchObject({ strokes: [], lines: [], turnStartedAt: 9000, scriptDone: 0, turnFrom: 0 });
    expect(r(c, { type: "group/leave", index: Q7, at: 9500 })).toBe(c); // the second tab's leave
    expect(c.group!.resolved).not.toContain("q7");
    expect(comingBack(c.group!)).toEqual(["q7"]);
  });

  it("after the union the board returns with the next pen, the hint still up; a wrong check there closes it unsolved and the last Next finishes", () => {
    let c = onQ7();
    for (const [i, lines] of [twoTerms, lostThird, wrongPair].entries()) c = write(c, lines, 1000 * (i + 1));
    c = r(c, { type: "group/leave", index: Q7, at: 9000 });
    c = { ...c, group: { ...c.group!, resolved: [...c.group!.resolved, "q9"], resolvedAt: { ...c.group!.resolvedAt, q9: 20_000 } } };
    c = r(c, { type: "group/next", at: 21_000 }); // on to Q10
    c = { ...c, group: { ...c.group!, resolved: [...c.group!.resolved, "q10"], resolvedAt: { ...c.group!.resolvedAt, q10: 30_000 } } };
    c = r(c, { type: "group/next", at: 31_000 }); // back to Q7
    const back = c.group!;
    expect(back.done).toBe(false);
    expect([currentProblem(back), penHolder(back), back.turnFrom]).toEqual(["q7", "jordan", 3]);
    expect(comingBack(back)).toEqual([]);
    expect(leaving(back)).toBe(false);
    expect(boardHint(back)?.text).toMatch(/The pair has two jobs at once/);
    c = write(c, flipped, 40_000);
    expect(c.group!.unsolved).toEqual(["q7"]);
    expect(c.group!.unsolvedAt).toEqual({ q7: 40_000 });
    expect(c.group!.resolved).not.toContain("q7");
    expect(writerOf(c.group!, "q7")).toBe("jordan");
    expect(closedInOrder(c.group!)).toEqual(["q1", "q2", "q3", "q9", "q10", "q7"]);
    expect(pendingDebrief(c.group!, { q1: { done: true }, q2: { done: true }, q3: { done: true }, q9: { done: true }, q10: { done: true } })).toBe("q7");
    expect(r(c, { type: "group/line", tex: "x" })).toBe(c); // closed
    c = r(c, { type: "group/next", at: 50_000 });
    expect(c.group!.done).toBe(true);
    expect(stuckProblems(c.group!)).toEqual([{ problem: "q7", tries: 4, status: "unsolved" }]);
  });

  it("the teacher's list of problems the group could not get: left for now with its tries, then unsolved; a problem solved on its return drops off (ticket 223)", () => {
    let c = onQ7();
    expect(stuckProblems(c.group!)).toEqual([]);
    for (const [i, lines] of [twoTerms, lostThird, wrongPair].entries()) c = write(c, lines, 1000 * (i + 1));
    expect(stuckProblems(c.group!)).toEqual([]); // still on the board, holding the third wrong check
    c = r(c, { type: "group/leave", index: Q7, at: 9000 });
    expect(stuckProblems(c.group!)).toEqual([{ problem: "q7", tries: 3, status: "left" }]);
    const solved = write({ ...c, group: { ...c.group!, index: 6, resolved: [...c.group!.resolved, "q9", "q10"] } }, PROBLEM_MAP.q7.solution.map((s) => s.tex), 60_000);
    expect(stuckProblems(solved.group!)).toEqual([]);
  });

  it("a problem that checks correct on its return is resolved as usual", () => {
    let c = onQ7();
    for (const [i, lines] of [twoTerms, lostThird, wrongPair].entries()) c = write(c, lines, 1000 * (i + 1));
    c = r(c, { type: "group/leave", index: Q7, at: 9000 });
    c = { ...c, group: { ...c.group!, index: 6, resolved: [...c.group!.resolved, "q9", "q10"] } };
    c = write(c, PROBLEM_MAP.q7.solution.map((s) => s.tex), 60_000);
    expect(c.group!.resolved).toContain("q7");
    expect(c.group!.unsolved ?? []).toEqual([]);
  });

  it("a stored run from before the ladder reads as a first pass with the demo's seed", () => {
    const old = { ...beginRun(MEMBERS, UNION, 0) } as Partial<GroupRun>;
    delete old.seed;
    expect(visitsOf(old as GroupRun).map((v) => v.pen)).toEqual(["sam", "zara", "jordan", "liam", "sam", "zara"]);
  });
});

describe("the simulation's fixed pens (ticket 228)", () => {
  it("pin a problem to a member on its first visit and its return; the rest keep the deal; a real run has none", () => {
    const run = beginRun(MEMBERS, UNION, 0, DEMO_SEED, DEMO_PENS);
    expect(run.pen).toEqual(DEMO_PENS);
    expect(visitsOf({ ...run, left: ["q7"] }).at(-1)).toEqual({ problem: "q7", pen: "sam", returning: true });
    // Sam writes Q1 and Q7, nothing else.
    expect(Object.entries(DEMO_PENS).filter(([, m]) => m === "sam").map(([p]) => p)).toEqual(["q1", "q7"]);
    // A pen for a problem not on the board, or for someone not in the group, is ignored.
    const partial = beginRun(MEMBERS, ["q1", "q2"], 0, DEMO_SEED, { q2: "liam", q9: "sam", q1: "priya" });
    expect(partial.pen).toEqual({ q1: "sam", q2: "liam" });
    expect(partial.pens).toEqual({ q2: "liam" });
    expect(beginRun(MEMBERS, UNION, 0).pens).toBeUndefined();
    expect(beginRun(MEMBERS, UNION, 0).pen).toEqual(penOrder(UNION, MEMBERS, DEMO_SEED));
  });
});
