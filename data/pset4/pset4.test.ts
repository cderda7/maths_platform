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
const names = (id: string) => byId[id].wrong.flatMap((pid) => byId[id].attempts[pid].map((tex) => evaluateLine(pid, tex)).flatMap((v) => (v.verdict === "wrong" ? [v.misconception] : [])));

describe("Problem Set 4's data (ticket 214)", () => {
  it("is the first set to assess Functions and Graphing, with binomial identity and the null factor law as New skills", () => {
    expect(categoriesTouched(PS4_ASSIGNMENT)).toEqual(["algebra", "functions", "graphing", "communication", "reasoning", "new"]);
    expect(PS4_ASSIGNMENT.newSkills).toEqual(["algebra.expand-factor.binomial", "functions.zeros.nfl"]);
  });

  it("Sam's answers are fixed and finished: all ten reached, the split's signs swapped three times (Q10 since ticket 294), half of b's sign, a turning point's sign", () => {
    expect(PS4_SAM.done).toBe(10);
    expect(PS4_SAM.wrong).toEqual(["ps4-q1", "ps4-q2", "ps4-q7", "ps4-q8", "ps4-q10"]);
    expect(names("sam")).toEqual(["pair-signs-swapped", "pair-signs-swapped", "square-sign", "root-vertex-sign", "pair-signs-swapped"]);
  });

  it("nobody is missing: Liam hands in five (two before ticket 281), Grace six, Jordan and Oliver eight, Tomas nine; Priya is all right", () => {
    expect(everyone.filter((c) => c.done < 10).map((c) => [c.id, c.done])).toEqual([["jordan", 8], ["tomas", 9], ["liam", 5], ["grace", 6], ["oliver", 8]]);
    expect(byId.priya).toMatchObject({ done: 10, wrong: [], attempts: {} });
  });

  it("the patterns Problem Sets 5 and 6 catch start here, under the same names", () => {
    for (const id of ["jordan", "liam", "oliver"]) expect(names(id).filter((n) => n === "brackets-dont-expand").length, id).toBeGreaterThanOrEqual(2);
    expect(names("mia")).toContain("brackets-dont-expand");
    expect(names("zara")).toEqual(["square-not-balanced", "power-on-part", "square-not-balanced", "square-not-balanced", "x-for-y"]);
    expect(names("oliver")).toContain("nfl-without-zero");
    for (const id of ["zara", "ruby", "ethan"]) expect(names(id), id).toContain("x-for-y");
    for (const id of ["sam", "isla", "lucas", "finn", "tomas"]) expect(names(id), id).toContain("root-vertex-sign");
  });
});

describe("Problem Set 4 in the registry (ticket 214)", () => {
  const b = assignmentBundle("pset-4", INITIAL_CLASSROOM)!;
  const ms = mistakesByProblem(null, b);

  it("has a clear top gap: a pair guessed and not expanded back on eight students, a root or vertex sign wrong next on six (ticket 299)", () => {
    const card = assignmentCard(b, INITIAL_CLASSROOM, null, now);
    expect(card).toMatchObject({ id: "pset-4", due: "Fri 4 Sep", section: "past", status: "done", submitted: 20, total: 20, mistakes: 59 });
    expect(card.topGap).toEqual({ misconceptions: ["brackets-dont-expand"], name: "brackets don't expand back", students: 8 });
    const rest = ms.map((m) => ({ ...m, rows: m.rows.filter((r) => r.misconceptions.join() !== "brackets-dont-expand") }));
    expect(topGap(rest)).toEqual({ misconceptions: ["root-vertex-sign"], name: "root or vertex sign wrong", students: 6 });
  });

  it("keeps every problem's wrong workings to four columns or fewer, but for Q5's six short lines and five on Q4, Q7 and Q10 (Liam's Q4 since ticket 281, Sam's Q10 since ticket 294)", () => {
    const columns = Object.fromEntries(ms.map((m) => [m.problem.label, groupBySlip(m.rows).reduce((n, g) => n + g.columns.length, 0)]));
    expect(columns).toEqual({ Q1: 2, Q2: 3, Q3: 3, Q4: 5, Q5: 6, Q6: 4, Q7: 5, Q8: 3, Q9: 4, Q10: 5 });
  });
});
