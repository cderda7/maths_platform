import { describe, expect, it } from "vitest";
import { CLASSMATES } from "@/data/classmates";
import { mistakesByProblem } from "./mistakes";
import { sessionAt } from "./session";

describe("teacher mistake view", () => {
  it("lists problems first, then who slipped on each, live student first", () => {
    const m = mistakesByProblem(sessionAt("feedback"));
    // Problems in set order, the live student first on each row, then classmates in fixture order; a problem nobody slipped on is absent.
    const wrongBy = (pid: string) => CLASSMATES.filter((c) => c.wrong.includes(pid)).map((c) => c.id);
    const samWrong = ["q1", "q2", "q3", "q7", "q10"];
    expect(m.map((p) => p.problem.id)).toEqual(["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q9", "q10"]);
    for (const p of m) expect(p.rows.map((r) => r.id)).toEqual([...(samWrong.includes(p.problem.id) ? ["sam"] : []), ...wrongBy(p.problem.id)]);
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
    expect(m.map((p) => p.problem.id)).toEqual(["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q9", "q10"]); // ethan and oliver slip on Q1 now
    expect(m.flatMap((p) => p.rows.map((r) => r.id))).not.toContain("sam");
  });
});
