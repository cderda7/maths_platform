import { describe, expect, it } from "vitest";
import { CLASSMATES } from "@/data/classmates";
import { ASSIGNMENT } from "@/data/assignment";
import { CLASS_SIZE, groupByMistake, groupBySlip, groupByWork, mistakeKey, mistakesByProblem, rightCount, type MistakeRow } from "./mistakes";
import { sessionAt } from "./session";
import { assignmentBundle, assignmentIds } from "./assignments";

describe("teacher mistake view", () => {
  it("lists problems first, then who slipped on each, live student first", () => {
    const m = mistakesByProblem(sessionAt("feedback"));
    // Problems in set order, the live student first on each row, then classmates in fixture order; a problem nobody slipped on is absent.
    const wrongBy = (pid: string) => CLASSMATES.filter((c) => c.wrong.includes(pid)).map((c) => c.id);
    const samWrong = ["q1", "q2", "q3", "q7", "q10"];
    expect(m.map((p) => p.problem.id)).toEqual(["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"]);
    for (const p of m) expect(p.rows.map((r) => r.id)).toEqual([...(samWrong.includes(p.problem.id) ? ["sam"] : []), ...wrongBy(p.problem.id)]);
    expect(m[1].rows[0].live).toBe(true);
    expect(m[1].rows[1].live).toBe(false);
  });

  it("counts the class who got each problem right: reached it and not wrong on it, the live student when his hand-in is clean (ticket 140)", () => {
    expect(CLASS_SIZE).toBe(20);
    const classmatesRight = (pid: string, index: number) => CLASSMATES.filter((c) => index < c.done && !c.wrong.includes(pid)).length;
    // Nobody live: the classmates alone. Q1: Chloe never started, Liam, Ethan and Oliver got it wrong, so fifteen. Q7: Priya and Noah alone.
    const none = mistakesByProblem(null);
    for (const p of none) expect(p.right, p.problem.id).toBe(classmatesRight(p.problem.id, ASSIGNMENT.problems.indexOf(p.problem)));
    expect(none.find((p) => p.problem.id === "q1")!.right).toBe(15);
    expect(none.find((p) => p.problem.id === "q7")!.right).toBe(2);
    // With Sam's hand-in: one more on every problem he finished cleanly (Q4, Q5, Q6, Q8), the same on the five he slipped on and on Q9, where his working stops before the height (unfinished, so neither); right and wrong never overlap.
    const live = mistakesByProblem(sessionAt("feedback"));
    const samRight = ["q4", "q5", "q6", "q8"];
    for (const p of live) {
      const index = ASSIGNMENT.problems.indexOf(p.problem);
      expect(p.right, p.problem.id).toBe(classmatesRight(p.problem.id, index) + (samRight.includes(p.problem.id) ? 1 : 0));
      expect(p.right + p.rows.length, p.problem.id).toBeLessThanOrEqual(CLASS_SIZE);
    }
    expect(live.find((p) => p.problem.id === "q4")!.right).toBe(14); // Jordan reaches Q7 since ticket 189; Liam hands Q4 in right since ticket 281
    // Q8 (ticket 347): Priya, Amelia and Aiden reached it and slipped, so rightCount agrees with the general rule above.
    expect(rightCount(ASSIGNMENT.problems[7], 7, sessionAt("feedback"))).toBe(classmatesRight("q8", 7) + 1);
  });

  it("every row's working contains at least one step that didn't hold, and the fixture lines are all known", () => {
    for (const p of mistakesByProblem(sessionAt("feedback"))) {
      for (const r of p.rows) {
        expect(r.misconceptions.length, `${p.problem.id} ${r.id}`).toBeGreaterThan(0);
        for (const l of r.lines) expect(l.verdict.verdict, `${p.problem.id} ${r.id} ${l.tex}`).not.toBe("unclear");
      }
    }
  });

  it("groups a problem's students by the misconceptions they slipped with, adjacent and in order of first appearance (ticket 299)", () => {
    const row = (id: string, misconceptions: string[]) => ({ id, name: id, initials: id, live: false, lines: [], misconceptions: misconceptions as MistakeRow["misconceptions"] });
    const a = row("a", ["x"]);
    const b = row("b", ["y"]);
    const c = row("c", ["x", "x"]);
    const d = row("d", ["y", "x"]);
    const groups = groupBySlip([a, b, c, d]);
    // a and c wrote the same (empty) working, so they share one column and the next pill starts at column 1 (ticket 138).
    expect(groups.map((g) => ({ misconceptions: g.misconceptions, start: g.start, ids: g.rows.map((r) => r.id), columns: g.columns.length }))).toEqual([
      { misconceptions: ["x"], start: 0, ids: ["a", "c"], columns: 1 },
      { misconceptions: ["y"], start: 1, ids: ["b"], columns: 1 },
      { misconceptions: ["y", "x"], start: 2, ids: ["d"], columns: 1 },
    ]);
    // Q5 in the fixtures: Tomas and Liam (ticket 281) read the roots' signs off the brackets, then Harper, Ruby and Finn under one value-read-off-the-wrong-line pill.
    const q5 = mistakesByProblem(sessionAt("feedback")).find((p) => p.problem.id === "q5")!;
    expect(groupBySlip(q5.rows).map((g) => g.rows.map((r) => r.id))).toEqual([["tomas", "liam"], ["harper", "ruby", "finn"]]);
  });

  it("inside a slip group, students on the exact same wrong line sit together, groups by first appearance (ticket 135)", () => {
    const wrong = (tex: string) => ({ tex, verdict: { verdict: "wrong", tags: [], label: "" } as unknown as MistakeRow["lines"][number]["verdict"] });
    const ok = (tex: string) => ({ tex, verdict: { verdict: "ok", tags: [], label: "" } as unknown as MistakeRow["lines"][number]["verdict"] });
    const row = (id: string, lines: MistakeRow["lines"]) => ({ id, name: id, initials: id, live: false, lines, misconceptions: ["x"] as unknown as MistakeRow["misconceptions"] });
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
    // Each group's label is its wrong lines one by one (ticket 245), both of e's.
    expect(groupByMistake([a, b, c, d, e]).map((g) => g.wrongLines)).toEqual([["m1"], ["m2"], ["m1", "m3"]]);
    // One slip group: its rows are reordered to the exact groups' order and its starts are absolute (five different workings, so five columns).
    const [g] = groupBySlip([a, b, c, d, e]);
    expect(g.rows.map((r) => r.id)).toEqual(["a", "c", "b", "d", "e"]);
    expect(g.mistakes.map((m) => m.start)).toEqual([0, 2, 4]);
    expect(g.columns.length).toBe(5);
    // Q7 in the fixtures: first the three on the wrong pair (Jordan, second in the roster, since ticket 189), then the four who never took the third back out (Amelia first), then the six who scaled two terms: three misconceptions, three pills (ticket 299; one fractions pill held the last two before).
    const q7 = mistakesByProblem(null).find((p) => p.problem.id === "q7")!;
    const groups = groupBySlip(q7.rows);
    // Each of the three is one working, so one column each: the starts count columns (ticket 138).
    expect(groups.map((s) => s.mistakes.map((m) => [m.start, m.rows.length, m.columns.length]))).toEqual([[[0, 3, 1]], [[1, 4, 1]], [[2, 6, 1]]]);
    expect(groups[1].rows.slice(0, 4).map((r) => r.id)).toEqual(["amelia", "zara", "ethan", "finn"]);
    // With the live student first (Sam scaled two terms), that group leads.
    const live = groupBySlip(mistakesByProblem(sessionAt("feedback")).find((p) => p.problem.id === "q7")!.rows);
    expect(live.map((g) => g.mistakes.map((m) => [m.rows[0].id, m.rows.length]))).toEqual([[["sam", 7]], [["jordan", 3]], [["amelia", 4]]]);
    // Q9: the four on "h = 6" by two routes are one group; Mia's sign slip its own pill.
    const q9 = groupBySlip(mistakesByProblem(null).find((p) => p.problem.id === "q9")!.rows);
    expect(q9.map((s) => s.mistakes.map((m) => m.rows.length))).toEqual([[4], [1]]);
  });

  it("the shape of the class's slips (ticket 130): Q7 has thirteen classmates across three strategies, Q6 one, Q8 three (all the same mirrored read, ticket 347), 50 wrongs in all (Jordan's Q7 since ticket 189, Liam's Q5 since ticket 281, Priya's/Amelia's/Aiden's Q8 since ticket 347)", () => {
    const m = mistakesByProblem(null);
    const rows = (pid: string) => m.find((p) => p.problem.id === pid)?.rows ?? [];
    expect(CLASSMATES.reduce((n, c) => n + c.wrong.length, 0)).toBe(50);
    expect(rows("q7")).toHaveLength(13);
    expect(rows("q7").map((r) => r.id)).not.toContain("noah");
    // The wrong line is the mistake's identity: three different ones on Q7, six / four / three.
    const wrongLine = (r: MistakeRow) => r.lines.filter((l) => l.verdict.verdict === "wrong").map((l) => l.tex).join("|");
    const byLine = new Map<string, number>();
    for (const r of rows("q7")) byLine.set(wrongLine(r), (byLine.get(wrongLine(r)) ?? 0) + 1);
    expect([...byLine.values()].sort((a, b) => b - a)).toEqual([6, 4, 3]);
    expect(rows("q6").map((r) => r.id)).toEqual(["amelia"]);
    // Ticket 347: Priya, Amelia and Aiden (coral) all read Q8's graph mirrored, the class's only recognised slip on it.
    expect(rows("q8").map((r) => r.id)).toEqual(["priya", "amelia", "aiden"]);
    expect(new Set(rows("q8").map(wrongLine)).size).toBe(1);
    // Two different wrong lines on Q1 and Q4, each its own misconception (one skill held both before ticket 299); two misconceptions on Q2, Q3, Q9 and Q10.
    const lines = (pid: string) => new Set(rows(pid).map(wrongLine)).size;
    const leaves = (pid: string) => groupBySlip(rows(pid)).length; // pills: misconceptions since ticket 299
    expect([lines("q1"), leaves("q1")]).toEqual([2, 2]);
    expect([lines("q4"), leaves("q4")]).toEqual([2, 2]);
    for (const pid of ["q2", "q3", "q9", "q10"]) expect(leaves(pid), pid).toBe(2);
    // Chloe and Grace untouched; every wrong problem has a teacher note about it.
    for (const id of ["chloe", "grace"]) expect(CLASSMATES.find((c) => c.id === id)!.wrong).toEqual([]);
    for (const c of CLASSMATES) for (const pid of c.wrong) expect(c.notes.some((n) => n.problems.includes(pid)), `${c.id} ${pid}`).toBe(true);
  });

  it("students whose working is identical line for line share one column (ticket 138), in order of first appearance", () => {
    const line = (tex: string, verdict: "right" | "wrong" = "right") => ({ tex, verdict: { verdict, tags: [] } as unknown as MistakeRow["lines"][number]["verdict"] });
    const row = (id: string, lines: MistakeRow["lines"], live = false) => ({ id, name: id, initials: id, live, lines, misconceptions: ["x"] as unknown as MistakeRow["misconceptions"] });
    const a = row("a", [line("p"), line("q", "wrong")], true);
    const b = row("b", [line("p"), line("r", "wrong")]);
    const c = row("c", [line("p"), line("q", "wrong")]);
    const d = row("d", [line("q", "wrong")]);
    expect(groupByWork([a, b, c, d]).map((k) => ({ ids: k.rows.map((r) => r.id), live: k.live, lines: k.lines.map((l) => l.tex) }))).toEqual([
      { ids: ["a", "c"], live: true, lines: ["p", "q"] },
      { ids: ["b"], live: false, lines: ["p", "r"] },
      { ids: ["d"], live: false, lines: ["q"] },
    ]);
    // The live student's column carries the flag whichever member is live.
    expect(groupByWork([c, a]).map((k) => [k.rows.map((r) => r.id), k.live])).toEqual([[["c", "a"], true]]);
    // Inside a pill and a mistake group the columns follow first appearance, students keep their order inside one, and the starts count columns.
    const e = { ...row("e", [line("p"), line("r", "wrong")]), misconceptions: ["y"] as unknown as MistakeRow["misconceptions"] };
    const groups = groupBySlip([b, a, e, c]);
    expect(groups.map((g) => ({ start: g.start, columns: g.columns.map((k) => k.rows.map((r) => r.id)), mistakes: g.mistakes.map((m) => [m.start, m.columns.length]) }))).toEqual([
      { start: 0, columns: [["b"], ["a", "c"]], mistakes: [[0, 1], [1, 1]] },
      { start: 2, columns: [["e"]], mistakes: [[2, 1]] },
    ]);
    expect(groups[0].rows.map((r) => r.id)).toEqual(["b", "a", "c"]);
  });

  it("the fixtures collapse: Q9 three columns, Q7 three strategies, Q5's vertex-height trio one column", () => {
    const columnsOf = (session: ReturnType<typeof sessionAt> | null, pid: string) => {
      const p = mistakesByProblem(session).find((x) => x.problem.id === pid)!;
      return groupBySlip(p.rows).flatMap((g) => g.columns.map((k) => k.rows.map((r) => r.id)));
    };
    // Zara and Ruby wrote the same four lines, Ethan and Harper the same rushed three, Mia her own.
    expect(columnsOf(null, "q9")).toEqual([["zara", "ruby"], ["ethan", "harper"], ["mia"]]);
    // Thirteen classmates wrong on Q7 take three columns (Jordan's pair first since ticket 189, then Amelia's lost third, then the two terms): three / four / six.
    expect(columnsOf(null, "q7").map((c) => c.length)).toEqual([3, 4, 6]);
    expect(columnsOf(null, "q5")).toEqual([["tomas"], ["liam"], ["harper", "ruby", "finn"]]);
    // With the live session Sam leads Q7, and his working is the six classmates' two-terms slip line for line: one live column of seven, first; then the pair and the lost third, each its own pill since ticket 299.
    const q7 = columnsOf(sessionAt("feedback"), "q7");
    expect(q7[0][0]).toBe("sam");
    expect(q7.map((c) => c.length)).toEqual([7, 3, 4]);
    const q7Rows = mistakesByProblem(sessionAt("feedback")).find((x) => x.problem.id === "q7")!.rows;
    expect(groupBySlip(q7Rows).flatMap((g) => g.columns.map((k) => k.live))).toEqual([true, false, false]);
    // The pill's start counts columns, not students.
    const q9 = mistakesByProblem(null).find((x) => x.problem.id === "q9")!;
    expect(groupBySlip(q9.rows).map((g) => [g.start, g.columns.length])).toEqual([
      [0, 2],
      [2, 1],
    ]);
  });

  it("without a live session only the classmates appear", () => {
    const m = mistakesByProblem(null);
    expect(m.map((p) => p.problem.id)).toEqual(["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"]); // ethan and oliver slip on Q1 now
    expect(m.flatMap((p) => p.rows.map((r) => r.id))).not.toContain("sam");
  });

  it("every mistake group on every set is labelled with exactly the wrong lines each of its students wrote (ticket 245)", () => {
    // The five finished sets, and the live set before Create (its classmates, with Sam handed in).
    const sets = assignmentIds(null).map((id) => assignmentBundle(id, null)!);
    expect(sets.length).toBe(5);
    let groups = 0;
    let twoLines = 0;
    for (const problems of [...sets.map((set) => mistakesByProblem(null, set)), mistakesByProblem(sessionAt("feedback"))])
      for (const p of problems)
        for (const g of groupBySlip(p.rows).flatMap((s) => s.mistakes)) {
          groups++;
          expect(g.wrongLines.length).toBeGreaterThan(0);
          expect(g.wrongLines.join(" | ")).toBe(g.key);
          for (const r of g.rows) expect(r.lines.filter((l) => l.verdict.verdict === "wrong").map((l) => l.tex)).toEqual(g.wrongLines);
          if (g.wrongLines.length > 1) twoLines++;
        }
    expect(groups).toBeGreaterThan(122);
    expect(twoLines).toBeGreaterThanOrEqual(8);
  });
});
