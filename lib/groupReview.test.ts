import { describe, expect, it } from "vitest";
import { beginRun, checkBoard, cutAtFirstMistake, DEMO_SEED, groupProgress, ownAttemptScript, penHolder, penOrder, shuffle, turnScript } from "./groupReview";
import { classroomReducer, INITIAL_CLASSROOM, type ClassroomState } from "./classroom";
import { PROBLEM_MAP } from "@/data/assignment";
import { GROUP_SCRIPTS } from "@/data/group-scripts";
import { RECOGNITION, RECOGNITION_REWORK } from "@/data/recognition";
import { evaluateLine } from "./evaluate";

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
    expect(checkBoard("q1", ["x^2 + 5x + 6 = 0"]).correct).toBe(true);
    expect(checkBoard("q1", ["\\text{something new}"]).correct).toBe(false);
  });
  it("shows up to the first wrong line, that line red, the rest as a count; a clean attempt whole and unmarked", () => {
    const cut = cutAtFirstMistake("q3", RECOGNITION.q3);
    expect(cut.shown.map((l) => l.mark)).toEqual([null, "wrong"]);
    expect(cut.hidden).toBe(1);
    const clean = cutAtFirstMistake("q1", RECOGNITION_REWORK.q1);
    expect(clean.shown.every((l) => l.mark === null)).toBe(true);
    expect(clean.hidden).toBe(0);
  });
  it("every attempt of every union problem is readable line by line, wrong attempts before right ones", () => {
    for (const pid of UNION) {
      const s = GROUP_SCRIPTS[pid];
      expect(s, pid).toBeDefined();
      for (const [i, lines] of s.attempts.entries()) {
        for (const tex of lines) expect(evaluateLine(pid, tex).verdict, `${pid} ${tex}`).not.toBe("unclear");
        expect(checkBoard(pid, lines).correct, `${pid} attempt ${i}`).toBe(i === s.attempts.length - 1);
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
    expect(q3.filter((e) => e.kind === "line")).toHaveLength(RECOGNITION.q3.length + RECOGNITION_REWORK.q3.length);
    expect(turnScript("q4")).toEqual([]);
  });
  it("Liam's Q7 turn checks wrong once, the fraction cleared from two terms, then writes the model solution", () => {
    const q7 = turnScript("q7");
    const checks = q7.filter((e) => e.kind === "check");
    expect(checks).toHaveLength(2);
    const [firstGo, secondGo] = GROUP_SCRIPTS.q7.attempts;
    expect(checkBoard("q7", firstGo)).toEqual({ correct: false, cut: 0 });
    expect(cutAtFirstMistake("q7", firstGo)).toEqual({ shown: [{ tex: firstGo[0], mark: "wrong" }], hidden: 2 });
    // The demo student's own Q7 rework is a second slip, so the group's correct version is the model solution, not the rework path.
    expect(secondGo).toEqual(PROBLEM_MAP.q7.solution.map((s) => s.tex));
    expect(checkBoard("q7", RECOGNITION_REWORK.q7).correct).toBe(false);
    expect(q7.filter((e) => e.kind === "line").map((e) => e.kind === "line" && e.tex)).toEqual([...firstGo, ...secondGo]);
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
    expect(c.group?.attempts.q1).toEqual([{ lines: RECOGNITION_REWORK.q1, correct: true }]);
    expect(r(c, { type: "group/stroke", stroke: [{ x: 3, y: 3 }] })).toBe(c); // resolved: the board is closed
    c = r(c, { type: "group/next", at: 200 });
    expect(c.group?.index).toBe(1);
    expect(c.group?.strokes).toEqual([]);
    expect(c.group?.turnStartedAt).toBe(200);
  });

  it("a wrong check keeps the board and starts the next attempt's lines afresh; next needs a correct check; the last next finishes", () => {
    let c = begin();
    c = r(c, { type: "group/next", at: 1 });
    expect(c.group?.index).toBe(0);
    c = { ...c, group: { ...c.group!, index: 2 } }; // Q3, Jordan
    for (const tex of RECOGNITION.q3) c = r(c, { type: "group/line", tex });
    c = r(c, { type: "group/stroke", stroke: [{ x: 1, y: 1 }] });
    c = r(c, { type: "group/check" });
    expect(c.group?.attempts.q3?.[0].correct).toBe(false);
    expect(c.group?.strokes).toHaveLength(1);
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

  it("progress counts members' original mistakes on resolved problems over all of them", () => {
    const wrong = { sam: ["q1", "q2", "q3", "q7", "q10"], jordan: ["q2"], zara: ["q3", "q9"], liam: ["q2", "q3"] };
    const run = beginRun(MEMBERS, UNION, 0);
    expect(groupProgress(run, wrong)).toEqual({ resolved: 0, total: 10, percent: 0 });
    expect(groupProgress({ ...run, resolved: ["q1"] }, wrong).percent).toBe(10);
    expect(groupProgress({ ...run, resolved: ["q1", "q2"] }, wrong).percent).toBe(40);
    expect(groupProgress({ ...run, resolved: UNION }, wrong).percent).toBe(100);
  });
});
