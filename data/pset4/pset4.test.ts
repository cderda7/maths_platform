import { describe, expect, it } from "vitest";
import { PS4_ASSIGNMENT } from "./assignment";
import { PS4_CLASSMATES, PS4_SAM } from "./classmates";
import { assignmentBundle } from "@/lib/assignments";
import { INITIAL_CLASSROOM } from "@/lib/classroom";
import { assignmentCard, topGap } from "@/lib/classroomCards";
import { evaluateLine } from "@/lib/evaluate";
import { categoriesTouched } from "@/lib/hierarchy";
import { groupBySlip, mistakesByProblem } from "@/lib/mistakes";

/**
 * Problem Set 4's particulars (ticket 214). The shared suite (`data/finishedSets.test.ts`) checks the contract
 * and every student's results against the class story sheet; this file holds what only this set has.
 */

const now = 1_700_000_000_000;
const everyone = [PS4_SAM, ...PS4_CLASSMATES];
const byId = Object.fromEntries(everyone.map((c) => [c.id, c]));
const names = (id: string) => byId[id].wrong.flatMap((pid) => byId[id].attempts[pid].map((tex) => evaluateLine(pid, tex)).flatMap((v) => (v.verdict === "wrong" ? [v.name] : [])));

describe("Problem Set 4's data (ticket 214)", () => {
  it("is the first set to assess Functions and Graphing, with binomial identity and the null factor law as New skills", () => {
    expect(categoriesTouched(PS4_ASSIGNMENT)).toEqual(["algebra", "functions", "graphing", "communication", "reasoning", "new"]);
    expect(PS4_ASSIGNMENT.newSkills).toEqual(["algebra.expand-factor.binomial", "functions.zeros.nfl"]);
  });

  it("Sam's answers are fixed and finished: all ten reached, the split's signs swapped twice, half of b's sign, a turning point's sign", () => {
    expect(PS4_SAM.done).toBe(10);
    expect(PS4_SAM.wrong).toEqual(["ps4-q1", "ps4-q2", "ps4-q7", "ps4-q8"]);
    expect(names("sam")).toEqual(["signs swapped in the pair", "signs swapped in the pair", "half of b, wrong sign", "turning point sign flipped"]);
  });

  it("nobody is missing: Liam hands in two, Grace six, Jordan and Oliver eight, Tomas nine; Priya is all right", () => {
    expect(everyone.filter((c) => c.done < 10).map((c) => [c.id, c.done])).toEqual([["jordan", 8], ["tomas", 9], ["liam", 2], ["grace", 6], ["oliver", 8]]);
    expect(byId.priya).toMatchObject({ done: 10, wrong: [], attempts: {} });
  });

  it("the habits Problem Sets 5 and 6 catch start here, under the same names", () => {
    for (const id of ["jordan", "liam", "oliver"]) expect(names(id).filter((n) => n === "guessed pair, not expanded back").length, id).toBeGreaterThanOrEqual(2);
    expect(names("mia")).toContain("guessed pair, not expanded back");
    expect(names("zara")).toEqual(["square added, never taken away", "(5/2)² taken as 25/2", "square added, never taken away", "square added, never taken away", "x given as the minimum"]);
    expect(names("oliver")).toContain("null factor law without zero");
    for (const id of ["zara", "ruby", "ethan"]) expect(names(id), id).toContain("x given as the minimum");
    for (const id of ["sam", "isla", "lucas", "finn", "tomas"]) expect(names(id), id).toContain("turning point sign flipped");
  });
});

describe("Problem Set 4 in the registry (ticket 214)", () => {
  const b = assignmentBundle("pset-4", INITIAL_CLASSROOM)!;
  const ms = mistakesByProblem(null, b);

  it("has a clear top gap: non-monic factorising on nine students, graph features next on eight", () => {
    const card = assignmentCard(b, INITIAL_CLASSROOM, null, now);
    expect(card).toMatchObject({ id: "pset-4", due: "Fri 4 Sep", section: "past", status: "done", submitted: 20, total: 20, mistakes: 54 });
    expect(card.topGap).toEqual({ slips: ["algebra.expand-factor.nonmonic"], name: "non-monic factorising", students: 9 });
    const rest = ms.map((m) => ({ ...m, rows: m.rows.filter((r) => !(r.slips.length === 1 && r.slips[0] === "algebra.expand-factor.nonmonic")) }));
    expect(topGap(rest)).toEqual({ slips: ["graphing.quadratics.features"], name: "graph features", students: 8 });
  });

  it("keeps every problem's wrong workings to four columns or fewer, but for Q5's six short lines", () => {
    const columns = Object.fromEntries(ms.map((m) => [m.problem.label, groupBySlip(m.rows).reduce((n, g) => n + g.columns.length, 0)]));
    expect(columns).toEqual({ Q1: 2, Q2: 3, Q3: 2, Q4: 4, Q5: 6, Q6: 4, Q7: 5, Q8: 3, Q9: 4, Q10: 3 });
  });
});
