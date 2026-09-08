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

describe("escalation inside the session", () => {
  const reveal = (s: ReturnType<typeof sessionAt>, problem: string, tex: string, strokeCount: number) =>
    sessionReducer(s, { type: "line/reveal", problem, line: { tex, strokeCount } });

  it("the scripted run: Q1's factorising slip passes, Q2's triggers the prompt", () => {
    let s = sessionAt("working");
    s = reveal(s, "q1", "x^2 - 5x + 6 = 0", 5);
    s = reveal(s, "q1", "(x + 2)(x + 3) = 0", 12);
    expect(s.prompt).toBeNull();
    expect(s.escalation.counts.factoring).toBe(1);
    s = sessionReducer(s, { type: "problem/goto", index: 1 });
    s = reveal(s, "q2", "2x^2 + 7x - 4 = 0", 6);
    s = reveal(s, "q2", "(2x + 4)(x - 1) = 0", 14);
    expect(s.prompt).toEqual({ subskill: "factoring", reason: "detected" });
    expect(s.escalation.counts.factoring).toBe(0);
    expect(s.escalation.caution).toEqual([]);
  });

  it("undo and re-reveal of the same wrong line is counted once", () => {
    let s = sessionAt("working");
    s = reveal(s, "q1", "x^2 - 5x + 6 = 0", 5);
    s = reveal(s, "q1", "(x + 2)(x + 3) = 0", 12);
    s = sessionReducer(s, { type: "lines/undo", problem: "q1", strokeCount: 11 });
    s = reveal(s, "q1", "(x + 2)(x + 3) = 0", 12);
    expect(s.escalation.counts.factoring).toBe(1);
    expect(s.prompt).toBeNull();
  });

  it("accepting the prompt opens the practice overlay; finishing it returns to the same problem", () => {
    let s = sessionAt("working");
    s = reveal(s, "q1", "(x + 2)(x + 3) = 0", 3);
    s = sessionReducer(s, { type: "problem/goto", index: 1 });
    s = reveal(s, "q2", "(2x + 4)(x - 1) = 0", 3);
    s = sessionReducer(s, { type: "prompt/accept", problem: "q2" });
    expect(s.prompt).toBeNull();
    expect(s.overlay).toBe("factoring");
    s = sessionReducer(s, { type: "overlay/done" });
    expect(s.overlay).toBeNull();
    expect(s.problemIndex).toBe(1);
    expect(s.practices).toEqual([{ subskill: "factoring", reason: "detected", accepted: true, problem: "q2" }]);
  });

  it("'I need help' after a detected practice raises the caution flag", () => {
    let s = sessionAt("working");
    s = reveal(s, "q1", "(x + 2)(x + 3) = 0", 3);
    s = reveal(s, "q2", "(2x + 4)(x - 1) = 0", 3);
    s = sessionReducer(s, { type: "prompt/decline", problem: "q2" });
    expect(s.escalation.caution).toEqual([]);
    s = sessionReducer(s, { type: "help/request", subskill: "factoring", problem: "q3" });
    expect(s.prompt).toEqual({ subskill: "factoring", reason: "help" });
    expect(s.escalation.caution).toEqual(["factoring"]);
  });
});

describe("independent rework", () => {
  it("keeps the original version untouched while a second version builds up", () => {
    let s = sessionAt("rework");
    const original = s.lines.q1.map((l) => l.tex);
    s = sessionReducer(s, { type: "rework/reveal", problem: "q1", line: { tex: "(x - 2)(x - 3) = 0", strokeCount: 4 } });
    s = sessionReducer(s, { type: "rework/reveal", problem: "q1", line: { tex: "x = 2", strokeCount: 8 } });
    expect(s.rework.q1.map((l) => l.tex)).toEqual(["(x - 2)(x - 3) = 0", "x = 2"]);
    expect(s.lines.q1.map((l) => l.tex)).toEqual(original);
    s = sessionReducer(s, { type: "rework/undo", problem: "q1", strokeCount: 7 });
    expect(s.rework.q1.map((l) => l.tex)).toEqual(["(x - 2)(x - 3) = 0"]);
    expect(s.escalation).toEqual(sessionAt("rework").escalation);
  });

  it("finishing the rework hands off to the group stage", () => {
    const s = sessionReducer(sessionAt("rework"), { type: "rework/done" });
    expect(s.stage).toBe("group-pass");
  });

  it("deep links past the rework carry both versions", () => {
    const s = sessionAt("group-pass");
    expect(Object.keys(s.rework).sort()).toEqual(["q1", "q2", "q3"]);
    expect(s.lines.q1.length).toBe(3);
    expect(s.stars).toEqual(["q4"]);
  });
});

describe("group review stages", () => {
  it("quick pass → discussion → report, remembering what was talked through", () => {
    let s = sessionAt("group-pass");
    s = sessionReducer(s, { type: "group/discuss" });
    expect(s.stage).toBe("group-discuss");
    s = sessionReducer(s, { type: "group/talked", problem: "q2" });
    expect(s.talked).toEqual(["q2"]);
    s = sessionReducer(s, { type: "group/done" });
    expect(s.stage).toBe("report");
  });
});

describe("final report", () => {
  it("keeps the reflection and marks the report sent", () => {
    let s = sessionAt("report");
    expect(s.reportSent).toBe(false);
    s = sessionReducer(s, { type: "reflection/set", text: "I guessed factor pairs. Expanding back would have caught both." });
    s = sessionReducer(s, { type: "report/send" });
    expect(s.reflection).toMatch(/Expanding back/);
    expect(s.reportSent).toBe(true);
    expect(s.stars).toEqual(["q4"]);
  });
});

describe("diagnostic push", () => {
  it("interrupts, is answered once, and is logged with its recorded flag; the stage is untouched", () => {
    let s = sessionAt("working");
    s = sessionReducer(s, { type: "diagnostic/push", questionId: "d-factor-check", recorded: false });
    expect(s.diagnostic).toEqual({ questionId: "d-factor-check", recorded: false });
    expect(s.stage).toBe("working");
    s = sessionReducer(s, { type: "diagnostic/answer", option: "b" });
    expect(s.diagnostic).toBeNull();
    expect(s.diagnosticAnswers).toEqual([{ questionId: "d-factor-check", recorded: false, option: "b" }]);
    expect(s.stage).toBe("working");
    // A second answer with nothing pending is ignored.
    expect(sessionReducer(s, { type: "diagnostic/answer", option: "a" }).diagnosticAnswers.length).toBe(1);
  });

  it("can be withdrawn before it's answered", () => {
    let s = sessionReducer(sessionAt("working"), { type: "diagnostic/push", questionId: "d-factor-check", recorded: true });
    s = sessionReducer(s, { type: "diagnostic/withdraw" });
    expect(s.diagnostic).toBeNull();
    expect(s.diagnosticAnswers).toEqual([]);
  });
});
