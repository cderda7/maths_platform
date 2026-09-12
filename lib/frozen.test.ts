import { describe, expect, it } from "vitest";
import { classroomReducer, INITIAL_CLASSROOM } from "./classroom";
import { skipFixture } from "./demo";
import { boardExamples, lineMarks, mistakeOf } from "./examples";
import { frozenView } from "./frozen";
import { sessionAt, sessionReducer } from "./session";

const projecting = (problems = ["q3", "q1", "q4"]) => classroomReducer(classroomReducer(INITIAL_CLASSROOM, { type: "wc/setup", problems, examples: {} }), { type: "wc/project" });
const now = 1_700_000_000_000;

describe("the frozen student's view", () => {
  it("is nothing unless the board is projecting", () => {
    expect(frozenView(sessionAt("waiting"), INITIAL_CLASSROOM)).toBeNull();
    expect(frozenView(sessionAt("waiting"), classroomReducer(projecting(), { type: "wc/end" }))).toBeNull();
  });

  it("shows the board's own examples for the current slide, unmarked while the board is unmarked, and follows the controls", () => {
    let { classroom } = skipFixture("class review", now);
    const { session } = skipFixture("class review", now);
    const w = classroom.wholeClass!;
    let v = frozenView(session, classroom)!;
    expect(v.problem.id).toBe(w.problems[0]);
    const board = boardExamples(w.examples[w.problems[0]], w.problems[0], session);
    expect(v.examples.map((e) => e.letter)).toEqual(board.map((e) => e.letter));
    expect(v.examples.map((e) => e.lines.map((l) => l.tex))).toEqual(board.map((e) => e.lines));
    expect(v.examples.flatMap((e) => e.lines.map((l) => l.mark)).every((m) => m === null)).toBe(true);
    classroom = classroomReducer(classroom, { type: "wc/next" });
    v = frozenView(session, classroom)!;
    expect(v.problem.id).toBe(w.problems[1]);
    expect(v.index).toBe(1);
    expect(v.total).toBe(w.problems.length);
    expect(v.examples.length).toBeGreaterThanOrEqual(2);
  });

  it("tags exactly the example that is the student's first hand-in, even after they reworked it", () => {
    const { session, classroom } = skipFixture("class review", now);
    const pid = classroom.wholeClass!.problems[0];
    const v = frozenView(session, classroom)!;
    const mine = v.examples.filter((e) => e.mine);
    expect(mine).toHaveLength(1);
    // The example with Sam's first hand-in's exact mistake (a classmate's working of it, one step shorter than Sam's); the rework, which is correct, is not what is tagged.
    const initial = session.lines[pid].map((l) => l.tex);
    const key = mistakeOf(pid, initial);
    expect(key).not.toBe("");
    expect(mistakeOf(pid, mine[0].lines.map((l) => l.tex))).toBe(key);
    expect(initial).toContain(key);
    expect(mistakeOf(pid, session.rework[pid].map((l) => l.tex))).toBe("");
    expect(mine[0].letter).not.toBe("A");
  });

  it("shows red and blue on the examples' lines only while the board shows marks", () => {
    const { session, classroom } = skipFixture("class review", now);
    const pid = classroom.wholeClass!.problems[0];
    const on = frozenView(session, classroomReducer(classroom, { type: "wc/marks", on: true }))!;
    expect(on.view).toBe("marked");
    for (const e of on.examples) expect(e.lines.map((l) => l.mark)).toEqual(lineMarks(pid, e.lines.map((l) => l.tex)));
    expect(on.examples.find((e) => e.mine)!.lines.map((l) => l.mark)).toContain("wrong");
    const off = frozenView(session, classroom)!;
    expect(off.examples.flatMap((e) => e.lines.map((l) => l.mark)).every((m) => m === null)).toBe(true);
  });

  it("a student who never attempted the problem sees the same examples with no tag", () => {
    const { classroom } = skipFixture("class review", now);
    let s = sessionAt("working");
    s = sessionReducer(s, { type: "line/reveal", problem: "q1", line: { tex: "x^2 - 5x + 6 = 0", strokeCount: 1 } });
    const v = frozenView(s, classroom)!;
    expect(v.examples.length).toBeGreaterThanOrEqual(2);
    expect(v.examples.some((e) => e.mine)).toBe(false);
  });
});

describe("the pad beside the examples", () => {
  it("carries the board's mode and the teacher's ink", () => {
    let c = classroomReducer(INITIAL_CLASSROOM, { type: "wc/setup", problems: ["q2"], examples: { q2: [] }, mode: "write-with-me" });
    c = classroomReducer(c, { type: "wc/project", at: 0 });
    c = classroomReducer(c, { type: "wc/stroke", problem: "q2", stroke: [{ x: 3, y: 4 }] });
    const v = frozenView(sessionAt("frozen"), c)!;
    expect(v.mode).toBe("write-with-me");
    expect(v.teacherInk).toEqual([[{ x: 3, y: 4 }]]);
    expect(v.examples).toEqual([]);
  });
});
