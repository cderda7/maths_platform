import { describe, expect, it } from "vitest";
import { CLASSMATES } from "@/data/classmates";
import { groupBySlip, mistakesByProblem, type MistakeRow } from "./mistakes";
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

  it("groups a problem's students by the leaves they slipped on, adjacent and in order of first appearance", () => {
    const row = (id: string, slips: string[]) => ({ id, name: id, initials: id, live: false, lines: [], slips: slips as MistakeRow["slips"] });
    const a = row("a", ["x"]);
    const b = row("b", ["y"]);
    const c = row("c", ["x", "x"]);
    const d = row("d", ["y", "x"]);
    const groups = groupBySlip([a, b, c, d]);
    expect(groups.map((g) => ({ slips: g.slips, start: g.start, ids: g.rows.map((r) => r.id) }))).toEqual([
      { slips: ["x"], start: 0, ids: ["a", "c"] },
      { slips: ["y"], start: 2, ids: ["b"] },
      { slips: ["y", "x"], start: 3, ids: ["d"] },
    ]);
    // Q5 in the fixtures: Tomas alone on quadratic equations, then Harper, Ruby and Finn under one graph-features pill.
    const q5 = mistakesByProblem(sessionAt("feedback")).find((p) => p.problem.id === "q5")!;
    expect(groupBySlip(q5.rows).map((g) => g.rows.map((r) => r.id))).toEqual([["tomas"], ["harper", "ruby", "finn"]]);
  });

  it("without a live session only the classmates appear", () => {
    const m = mistakesByProblem(null);
    expect(m.map((p) => p.problem.id)).toEqual(["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q9", "q10"]); // ethan and oliver slip on Q1 now
    expect(m.flatMap((p) => p.rows.map((r) => r.id))).not.toContain("sam");
  });
});
