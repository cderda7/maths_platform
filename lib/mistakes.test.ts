import { describe, expect, it } from "vitest";
import { CLASSMATES } from "@/data/classmates";
import { groupByMistake, groupBySlip, mistakeKey, mistakesByProblem, type MistakeRow } from "./mistakes";
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

  it("inside a slip group, students on the exact same wrong line sit together, groups by first appearance (ticket 135)", () => {
    const wrong = (tex: string) => ({ tex, verdict: { verdict: "wrong", tags: [], label: "" } as unknown as MistakeRow["lines"][number]["verdict"] });
    const ok = (tex: string) => ({ tex, verdict: { verdict: "ok", tags: [], label: "" } as unknown as MistakeRow["lines"][number]["verdict"] });
    const row = (id: string, lines: MistakeRow["lines"]) => ({ id, name: id, initials: id, live: false, lines, slips: ["x"] as unknown as MistakeRow["slips"] });
    const a = row("a", [ok("p"), wrong("m1")]);
    const b = row("b", [wrong("m2")]);
    const c = row("c", [ok("q"), ok("r"), wrong("m1")]); // the same mistake as a by a longer route
    const d = row("d", [wrong("m2"), ok("s")]);
    const e = row("e", [wrong("m1"), wrong("m3")]); // two wrong lines: its own key
    expect(mistakeKey(e)).toBe("m1 | m3");
    expect(groupByMistake([a, b, c, d, e]).map((g) => ({ key: g.key, start: g.start, ids: g.rows.map((r) => r.id) }))).toEqual([
      { key: "m1", start: 0, ids: ["a", "c"] },
      { key: "m2", start: 2, ids: ["b", "d"] },
      { key: "m1 | m3", start: 4, ids: ["e"] },
    ]);
    // One slip group: its rows are reordered to the exact groups' order and its starts are absolute.
    const [g] = groupBySlip([a, b, c, d, e]);
    expect(g.rows.map((r) => r.id)).toEqual(["a", "c", "b", "d", "e"]);
    expect(g.mistakes.map((m) => m.start)).toEqual([0, 2, 4]);
    // Q7 in the fixtures: under the fractions pill the four who lost the third (Amelia first) then the six who scaled two terms; under monic factorising the two on the wrong pair.
    const q7 = mistakesByProblem(null).find((p) => p.problem.id === "q7")!;
    const groups = groupBySlip(q7.rows);
    expect(groups.map((s) => s.mistakes.map((m) => [m.start, m.rows.length]))).toEqual([
      [
        [0, 4],
        [4, 6],
      ],
      [[10, 2]],
    ]);
    expect(groups[0].rows.slice(0, 4).map((r) => r.id)).toEqual(["amelia", "zara", "ethan", "finn"]);
    // With the live student first (Sam scaled two terms), that group leads.
    const live = groupBySlip(mistakesByProblem(sessionAt("feedback")).find((p) => p.problem.id === "q7")!.rows);
    expect(live[0].mistakes.map((m) => [m.rows[0].id, m.rows.length])).toEqual([
      ["sam", 7],
      ["amelia", 4],
    ]);
    // Q9: the four on "h = 6" by two routes are one group; Mia's sign slip its own pill.
    const q9 = groupBySlip(mistakesByProblem(null).find((p) => p.problem.id === "q9")!.rows);
    expect(q9.map((s) => s.mistakes.map((m) => m.rows.length))).toEqual([[4], [1]]);
  });

  it("the shape of the class's slips (ticket 130): Q7 has twelve classmates across three strategies, Q6 one, Q8 none, 45 wrongs in all", () => {
    const m = mistakesByProblem(null);
    const rows = (pid: string) => m.find((p) => p.problem.id === pid)?.rows ?? [];
    expect(CLASSMATES.reduce((n, c) => n + c.wrong.length, 0)).toBe(45);
    expect(rows("q7")).toHaveLength(12);
    expect(rows("q7").map((r) => r.id)).not.toContain("noah");
    // The wrong line is the mistake's identity: three different ones on Q7, six / four / two.
    const wrongLine = (r: MistakeRow) => r.lines.filter((l) => l.verdict.verdict === "wrong").map((l) => l.tex).join("|");
    const byLine = new Map<string, number>();
    for (const r of rows("q7")) byLine.set(wrongLine(r), (byLine.get(wrongLine(r)) ?? 0) + 1);
    expect([...byLine.values()].sort((a, b) => b - a)).toEqual([6, 4, 2]);
    expect(rows("q6").map((r) => r.id)).toEqual(["amelia"]);
    expect(rows("q8")).toHaveLength(0);
    // Two different slips under one skill on Q1 and Q4; two skills on Q2, Q3, Q9 and Q10.
    const lines = (pid: string) => new Set(rows(pid).map(wrongLine)).size;
    const leaves = (pid: string) => groupBySlip(rows(pid)).length;
    expect([lines("q1"), leaves("q1")]).toEqual([2, 1]);
    expect([lines("q4"), leaves("q4")]).toEqual([2, 1]);
    for (const pid of ["q2", "q3", "q9", "q10"]) expect(leaves(pid), pid).toBe(2);
    // Priya, Chloe and Grace untouched; every wrong problem has a teacher note about it.
    for (const id of ["priya", "chloe", "grace"]) expect(CLASSMATES.find((c) => c.id === id)!.wrong).toEqual([]);
    for (const c of CLASSMATES) for (const pid of c.wrong) expect(c.notes.some((n) => n.problems.includes(pid)), `${c.id} ${pid}`).toBe(true);
  });

  it("without a live session only the classmates appear", () => {
    const m = mistakesByProblem(null);
    expect(m.map((p) => p.problem.id)).toEqual(["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q9", "q10"]); // ethan and oliver slip on Q1 now
    expect(m.flatMap((p) => p.rows.map((r) => r.id))).not.toContain("sam");
  });
});
