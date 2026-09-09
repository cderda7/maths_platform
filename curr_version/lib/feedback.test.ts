import { describe, expect, it } from "vitest";
import { PROBLEMS } from "@/data/assignment";
import { feedbackFor, runKind } from "./feedback";
import { scriptedSession, sessionAt, sessionReducer, type StudentSession } from "./session";

const modelRun = (): StudentSession => {
  let s = sessionAt("working");
  for (const p of PROBLEMS) for (const [i, st] of p.solution.entries()) s = sessionReducer(s, { type: "line/reveal", problem: p.id, line: { tex: st.tex, strokeCount: i + 1 } });
  return s;
};

describe("feedback layers", () => {
  it("the scripted run is a weak run; the model solution is a strong one", () => {
    expect(runKind(scriptedSession())).toBe("weak");
    expect(runKind(modelRun())).toBe("strong");
  });

  it("every step that didn't hold is red, and only those", () => {
    const fb = feedbackFor(scriptedSession());
    const reds = fb.flatMap((p) => p.lines.filter((l) => l.verdict.verdict === "wrong").map((l) => [p.problem.id, l.tex.slice(0, 12)]));
    expect(reds).toEqual([
      ["q1", "(x + 2)(x + "],
      ["q2", "(2x + 4)(x -"],
      ["q3", "x - 3 = 6 \\;"],
      ["q7", "x^2 + 6x + \\"],
      ["q10", "\\Delta < 0 \\"],
    ]);
  });

  it("a weak run's standouts are the harder correct steps; a strong run's are the novel ones", () => {
    const weak = feedbackFor(scriptedSession()).flatMap((p) => p.lines.filter((l) => l.standout).map((l) => `${p.problem.id}:${l.tex.slice(0, 10)}`));
    expect(weak).toEqual(["q2:2x + 4 = 0", "q4:b^2 - 4ac ", "q4:x = \\dfrac", "q8:1 - 4 + 3 "]);
    const strong = feedbackFor(modelRun()).flatMap((p) => p.lines.filter((l) => l.standout).map((l) => `${p.problem.id}:${l.tex.slice(0, 10)}`));
    expect(strong).toEqual(["q2:ac = -8,\\q", "q3:x^2 - x - ", "q4:b^2 - 4ac ", "q5:x = \\tfrac", "q6:36 - 4k = ", "q8:1 - 4 + 3 ", "q10:\\text{The "]);
  });

  it("clues are pattern-level and only on problems with a slip; a clean problem can be starred", () => {
    const fb = feedbackFor(scriptedSession());
    expect(fb.map((p) => !!p.clue)).toEqual([true, true, true, false, false, false, true, false, false, true]);
    expect(fb.map((p) => p.clean)).toEqual([false, false, false, true, true, true, false, true, true, false]);
    for (const p of fb) if (p.clue) expect(p.clue).not.toMatch(/line \d/i);
  });

  it("starring toggles and only clean problems are meant to be starred", () => {
    let s = scriptedSession();
    s = sessionReducer(s, { type: "star/toggle", problem: "q4" });
    expect(s.stars).toEqual(["q4"]);
    s = sessionReducer(s, { type: "star/toggle", problem: "q4" });
    expect(s.stars).toEqual([]);
  });
});

describe("detective feedback summary", () => {
  it("zero mistakes: every problem held, no hint", async () => {
    const { feedbackSummary } = await import("./feedback");
    const s = feedbackSummary(modelRun());
    expect(s).toMatchObject({ count: 0, total: 10, subskills: [] });
    expect(s.sentence).toBe("Every problem held.");
  });

  it("one mistake still gets a hint naming its subskill", async () => {
    const { summarySentence } = await import("./feedback");
    expect(summarySentence(1, ["algebra.number.fractions"])).toBe("1 of your problems contains a mistake. Double-check fractions.");
  });

  it("the scripted run: five problems, leaves in first-occurrence order, hint capped at three", async () => {
    const { feedbackSummary } = await import("./feedback");
    const s = feedbackSummary(scriptedSession());
    expect(s.count).toBe(5);
    expect(s.subskills).toEqual(["algebra.expand-factor.monic", "algebra.expand-factor.nonmonic", "unit.u1.nfl", "algebra.number.fractions", "reasoning.justify.formal"]);
    expect(s.sentence).toBe("5 of your problems contain a mistake. Double-check factorising, non-monic factorising and null factor law.");
  });

  it("caps the hint at three subskills", async () => {
    const { summarySentence } = await import("./feedback");
    expect(summarySentence(4, ["algebra.equations.linear", "algebra.number.fractions", "algebra.expand-factor.monic", "algebra.expand-factor.expand"])).toBe("4 of your problems contain a mistake. Double-check linear equations, fractions and factorising.");
  });

  it("the final version reads the rework and says 'still'", async () => {
    const { feedbackSummary } = await import("./feedback");
    const reworked = sessionAt("group-pass"); // scripted run with every slipped problem corrected
    expect(feedbackSummary(reworked, "final").sentence).toBe("Every problem holds now.");
    expect(feedbackSummary(reworked, "original").count).toBe(5);
    let partial = sessionAt("rework");
    partial = sessionReducer(partial, { type: "rework/reveal", problem: "q1", line: { tex: "(x - 2)(x - 3) = 0", strokeCount: 1 } });
    partial = sessionReducer(partial, { type: "rework/reveal", problem: "q1", line: { tex: "x = 2 \\text{ or } x = 3", strokeCount: 2 } });
    const f = feedbackSummary(partial, "final");
    expect(f.count).toBe(4);
    expect(f.sentence).toMatch(/^4 of your problems still contain a mistake\./);
  });
});
