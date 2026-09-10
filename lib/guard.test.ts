import { describe, expect, it } from "vitest";
import { guardFor, trippedProblems } from "./guard";
import { sessionAt, sessionReducer } from "./session";

const WRONG_Q4 = "x = \\dfrac{5 \\pm \\sqrt{37}}{3}";

describe("the guard", () => {
  it("trips only when an originally-correct problem gains a wrong rework line", () => {
    let s = sessionAt("feedback"); // scripted run: Q1–Q3 slipped, Q4 correct
    expect(guardFor(s, "q4")).toEqual({ originalCorrect: true, tripped: false });
    expect(guardFor(s, "q1").originalCorrect).toBe(false);
    s = sessionReducer(s, { type: "rework/reveal", problem: "q4", line: { tex: WRONG_Q4, strokeCount: 1 } });
    expect(guardFor(s, "q4").tripped).toBe(true);
    expect(trippedProblems(s)).toEqual(["q4"]);
  });

  it("never fires for a problem whose first attempt had a mistake, however wrong the rework is", () => {
    let s = sessionAt("feedback");
    s = sessionReducer(s, { type: "rework/reveal", problem: "q1", line: { tex: "(x + 2)(x + 3) = 0", strokeCount: 1 } });
    s = sessionReducer(s, { type: "rework/reveal", problem: "q1", line: { tex: "nonsense", strokeCount: 2 } });
    expect(guardFor(s, "q1").tripped).toBe(false);
    expect(trippedProblems(s)).toEqual([]);
  });

  it("clears on undo, clear and a correct rewrite", () => {
    let s = sessionAt("feedback");
    s = sessionReducer(s, { type: "rework/stroke", problem: "q4", stroke: [{ x: 1, y: 1 }] });
    s = sessionReducer(s, { type: "rework/reveal", problem: "q4", line: { tex: WRONG_Q4, strokeCount: 1 } });
    expect(guardFor(s, "q4").tripped).toBe(true);
    const undone = sessionReducer(s, { type: "rework/undo", problem: "q4" });
    expect(guardFor(undone, "q4").tripped).toBe(false);
    const cleared = sessionReducer(s, { type: "rework/clear", problem: "q4" });
    expect(guardFor(cleared, "q4").tripped).toBe(false);
    expect(cleared.reworkInk.q4).toEqual([]);
  });

  it("an unattempted problem is not 'correct', so it cannot trip", () => {
    let s = sessionAt("working");
    s = sessionReducer(s, { type: "rework/reveal", problem: "q4", line: { tex: WRONG_Q4, strokeCount: 1 } });
    expect(guardFor(s, "q4")).toEqual({ originalCorrect: false, tripped: false });
  });
});
