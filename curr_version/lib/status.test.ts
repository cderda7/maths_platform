import { describe, expect, it } from "vitest";
import { sessionAt, sessionReducer, type StudentSession } from "./session";
import { problemsStarted, subskillStatuses } from "./status";

const reveal = (s: StudentSession, problem: string, tex: string, n: number) => sessionReducer(s, { type: "line/reveal", problem, line: { tex, strokeCount: n } });

describe("teacher-side subskill status", () => {
  it("starts with everything not seen yet", () => {
    const st = subskillStatuses(sessionAt("working"));
    expect(Object.values(st).every((v) => v === "unseen")).toBe(true);
    expect(problemsStarted(sessionAt("working"))).toBe(0);
  });

  it("Q1 correct: algebra, factorising and roots secure; the rest unseen", () => {
    let s = sessionAt("working");
    s = reveal(s, "q1", "x^2 - 5x + 6 = 0", 1);
    s = reveal(s, "q1", "(x-2)(x-3) = 0", 2);
    s = reveal(s, "q1", "x = 2 \\;\\text{or}\\; x = 3", 3);
    const st = subskillStatuses(s);
    expect(st.algebra).toBe("secure");
    expect(st.factoring).toBe("secure");
    expect(st.roots).toBe("secure");
    expect(st.fractions).toBe("unseen");
  });

  it("the scripted run: factorising is a gap after Q1 and Q2, algebra developing after Q3", () => {
    let s = sessionAt("working");
    s = reveal(s, "q1", "x^2 - 5x + 6 = 0", 1);
    s = reveal(s, "q1", "(x + 2)(x + 3) = 0", 2);
    expect(subskillStatuses(s).factoring).toBe("gap");
    s = reveal(s, "q2", "2x^2 + 7x - 4 = 0", 1);
    s = reveal(s, "q2", "(2x + 4)(x - 1) = 0", 2);
    s = reveal(s, "q3", "(x - 3)(x + 2) = 6", 1);
    s = reveal(s, "q3", "x - 3 = 6 \\;\\text{or}\\; x + 2 = 6", 2);
    const st = subskillStatuses(s);
    expect(st.factoring).toBe("gap");
    expect(st.algebra).toBe("developing");
    expect(problemsStarted(s)).toBe(3);
  });

  it("a subskill under caution is a gap even with sound lines", () => {
    let s = sessionAt("working");
    s = reveal(s, "q1", "(x-2)(x-3) = 0", 1);
    expect(subskillStatuses(s).factoring).toBe("secure");
    s = sessionReducer(s, { type: "help/request", subskill: "factoring", problem: "q1" });
    s = sessionReducer(s, { type: "prompt/decline", problem: "q1" });
    s = sessionReducer(s, { type: "help/request", subskill: "factoring", problem: "q1" });
    expect(s.escalation.caution).toEqual(["factoring"]);
    expect(subskillStatuses(s).factoring).toBe("gap");
  });
});
