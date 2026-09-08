import { describe, expect, it } from "vitest";
import { mistakesByProblem } from "./mistakes";
import { sessionAt } from "./session";

describe("teacher mistake view", () => {
  it("lists problems first, then who slipped on each, live student first", () => {
    const m = mistakesByProblem(sessionAt("feedback"));
    expect(m.map((p) => [p.problem.id, p.rows.map((r) => r.id)])).toEqual([
      ["q1", ["sam"]],
      ["q2", ["sam", "jordan", "liam"]],
      ["q3", ["sam", "tomas", "zara", "liam"]],
      ["q4", ["tomas"]],
    ]);
    expect(m[1].rows[0].live).toBe(true);
    expect(m[1].rows[1].live).toBe(false);
  });

  it("every row's working contains at least one step that didn't hold, and the fixture lines are all known", () => {
    for (const p of mistakesByProblem(sessionAt("feedback"))) {
      for (const r of p.rows) {
        expect(r.slips.length, `${p.problem.id} ${r.id}`).toBeGreaterThan(0);
        for (const l of r.lines) expect(l.verdict.verdict, `${p.problem.id} ${r.id} ${l.tex}`).not.toBe("unclear");
      }
    }
  });

  it("without a live session only the classmates appear", () => {
    const m = mistakesByProblem(null);
    expect(m.map((p) => p.problem.id)).toEqual(["q2", "q3", "q4"]);
    expect(m.flatMap((p) => p.rows.map((r) => r.id))).not.toContain("sam");
  });
});
