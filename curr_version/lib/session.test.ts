import { describe, expect, it } from "vitest";
import { INITIAL_SESSION, sessionAt, sessionReducer } from "./session";

describe("student session flow", () => {
  it("declining practice goes straight to the confidence survey", () => {
    const s = sessionReducer(INITIAL_SESSION, { type: "practice/decline" });
    expect(s.stage).toBe("confidence");
    expect(s.practice).toBe("declined");
  });

  it("accepting practice visits the warm-up, then the survey", () => {
    let s = sessionReducer(INITIAL_SESSION, { type: "practice/accept" });
    expect(s.stage).toBe("practice");
    s = sessionReducer(s, { type: "practice/finish" });
    expect(s.stage).toBe("confidence");
    expect(s.practice).toBe("taken");
  });

  it("the confidence answer is kept and starts the set", () => {
    const s = sessionReducer(sessionAt("confidence"), { type: "confidence/set", confidence: { level: "low-when", subskill: "fractions" } });
    expect(s.stage).toBe("working");
    expect(s.confidence).toEqual({ level: "low-when", subskill: "fractions" });
  });

  it("deep-linking past the survey fills in earlier answers", () => {
    expect(sessionAt("working").confidence).not.toBeNull();
    expect(sessionAt("overview")).toEqual(INITIAL_SESSION);
  });

  it("recognised lines are kept per problem and undo withdraws them", () => {
    let s = sessionAt("working");
    s = sessionReducer(s, { type: "line/reveal", problem: "q1", line: { tex: "a", strokeCount: 3 } });
    s = sessionReducer(s, { type: "line/reveal", problem: "q1", line: { tex: "b", strokeCount: 6 } });
    s = sessionReducer(s, { type: "problem/goto", index: 1 });
    s = sessionReducer(s, { type: "line/reveal", problem: "q2", line: { tex: "c", strokeCount: 2 } });
    expect(s.lines.q1.map((l) => l.tex)).toEqual(["a", "b"]);
    expect(s.lines.q2.map((l) => l.tex)).toEqual(["c"]);
    s = sessionReducer(s, { type: "lines/undo", problem: "q1", strokeCount: 5 });
    expect(s.lines.q1.map((l) => l.tex)).toEqual(["a"]);
    s = sessionReducer(s, { type: "lines/clear", problem: "q1" });
    expect(s.lines.q1).toEqual([]);
    expect(s.problemIndex).toBe(1);
  });
});
