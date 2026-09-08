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
    ]);
  });

  it("a weak run's standouts are the harder correct steps; a strong run's are the novel ones", () => {
    const weak = feedbackFor(scriptedSession()).flatMap((p) => p.lines.filter((l) => l.standout).map((l) => `${p.problem.id}:${l.tex.slice(0, 10)}`));
    expect(weak).toEqual(["q2:2x + 4 = 0", "q4:b^2 - 4ac ", "q4:x = \\dfrac"]);
    const strong = feedbackFor(modelRun()).flatMap((p) => p.lines.filter((l) => l.standout).map((l) => `${p.problem.id}:${l.tex.slice(0, 10)}`));
    expect(strong).toEqual(["q2:ac = -8,\\q", "q3:x^2 - x - ", "q4:b^2 - 4ac "]);
  });

  it("clues are pattern-level and only on problems with a slip; a clean problem can be starred", () => {
    const fb = feedbackFor(scriptedSession());
    expect(fb.map((p) => !!p.clue)).toEqual([true, true, true, false]);
    expect(fb.map((p) => p.clean)).toEqual([false, false, false, true]);
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
