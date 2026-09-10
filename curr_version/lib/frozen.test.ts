import { describe, expect, it } from "vitest";
import { classroomReducer, INITIAL_CLASSROOM } from "./classroom";
import { frozenView } from "./frozen";
import { sessionAt, sessionReducer } from "./session";

const projecting = (problems = ["q3", "q1", "q4"]) => classroomReducer(classroomReducer(INITIAL_CLASSROOM, { type: "wc/setup", problems, examples: {} }), { type: "wc/project" });

describe("the frozen student's view", () => {
  it("is nothing unless the board is projecting", () => {
    expect(frozenView(sessionAt("waiting"), INITIAL_CLASSROOM)).toBeNull();
    expect(frozenView(sessionAt("waiting"), classroomReducer(projecting(), { type: "wc/end" }))).toBeNull();
  });

  it("follows the current slide and stacks handed-in then reworked, unmarked while the board is unmarked", () => {
    const s = sessionAt("group"); // scripted run, Q1–Q3 reworked
    let c = projecting();
    let v = frozenView(s, c)!;
    expect(v.problem.id).toBe("q3");
    expect(v.versions.map((x) => x.label)).toEqual(["Handed in", "Reworked"]);
    expect(v.versions.flatMap((x) => x.lines.map((l) => l.mark)).every((m) => m === null)).toBe(true);
    c = classroomReducer(c, { type: "wc/next" });
    c = classroomReducer(c, { type: "wc/next" });
    v = frozenView(s, c)!;
    expect(v.problem.id).toBe("q4");
    expect(v.versions.map((x) => x.label)).toEqual(["Handed in"]); // Q4 was never reworked
    expect(v.index).toBe(2);
    expect(v.total).toBe(3);
  });

  it("shows red and blue on the student's own lines only while the board shows marks", () => {
    const s = sessionAt("feedback");
    const c = classroomReducer(projecting(["q1"]), { type: "wc/marks", on: true });
    const v = frozenView(s, c)!;
    expect(v.view).toBe("marked");
    expect(v.versions[0].lines.map((l) => l.mark)).toEqual([null, "wrong", null]);
    const off = frozenView(s, classroomReducer(c, { type: "wc/marks", on: false }))!;
    expect(off.versions[0].lines.map((l) => l.mark)).toEqual([null, null, null]);
  });

  it("an unattempted problem has no versions", () => {
    let s = sessionAt("working");
    s = sessionReducer(s, { type: "line/reveal", problem: "q1", line: { tex: "x^2 - 5x + 6 = 0", strokeCount: 1 } });
    const v = frozenView(s, projecting(["q2"]))!;
    expect(v.attempted).toBe(false);
    expect(v.versions).toEqual([]);
  });
});

describe("the pad beside the versions", () => {
  it("carries the board's mode and the teacher's ink", async () => {
    const { classroomReducer, INITIAL_CLASSROOM } = await import("./classroom");
    const { frozenView } = await import("./frozen");
    const { sessionAt } = await import("./session");
    let c = classroomReducer(INITIAL_CLASSROOM, { type: "wc/setup", problems: ["q2"], examples: { q2: [] }, mode: "write-with-me" });
    c = classroomReducer(c, { type: "wc/project", at: 0 });
    c = classroomReducer(c, { type: "wc/stroke", problem: "q2", stroke: [{ x: 3, y: 4 }] });
    const v = frozenView(sessionAt("frozen"), c)!;
    expect(v.mode).toBe("write-with-me");
    expect(v.teacherInk).toEqual([[{ x: 3, y: 4 }]]);
  });
});
