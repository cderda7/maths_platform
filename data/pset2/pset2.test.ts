import { describe, expect, it } from "vitest";
import { PS2 } from ".";
import { PS2_CLASSMATES, PS2_SAM } from "./classmates";
import { assignmentBundle } from "@/lib/assignments";
import { INITIAL_CLASSROOM } from "@/lib/classroom";
import { assignmentCard } from "@/lib/classroomCards";
import { evaluateLine } from "@/lib/evaluate";
import { groupBySlip, mistakesByProblem } from "@/lib/mistakes";

/**
 * Problem Set 2's particulars (ticket 212): its top gap's clusters, its named patterns and Sam's slips. The shared
 * suite (`data/finishedSets.test.ts`) checks the contract and every student's results against the class story sheet.
 */

const now = 1_700_000_000_000;
const everyone = [PS2_SAM, ...PS2_CLASSMATES];
const byId = Object.fromEntries(everyone.map((c) => [c.id, c]));
const b = assignmentBundle("pset-2", INITIAL_CLASSROOM)!;
const names = (id: string) => byId[id].wrong.flatMap((pid) => byId[id].attempts[pid].map((tex) => evaluateLine(pid, tex)).flatMap((v) => (v.verdict === "wrong" ? [v.misconception] : [])));

describe("Problem Set 2's data (ticket 212)", () => {
  it("is registered under pset-2 with its own name and date", () => {
    expect(b).toMatchObject({ id: "pset-2", kind: "finished", name: "Problem Set 2 — Rationalising and expanding with surds", due: "Fri 28 Aug" });
    expect(PS2.fixture.newSkills).toEqual(["algebra.number.surds", "algebra.expand-factor.binomial"]);
  });

  it("Sam slips twice: a surd product's sign on Q2 and the same bracket for the conjugate on Q7", () => {
    expect(PS2_SAM).toMatchObject({ done: 10, wrong: ["ps2-q2", "ps2-q7"] });
    expect(names("sam")).toEqual(["product-sign", "rationalise-wrong-factor", "square-vs-difference"]);
  });

  it("the patterns the sheet names: Liam and Noah square term by term, Amelia puts the conjugate on the bottom twice, Tomas turns fractions over", () => {
    expect(names("liam")).toContain("squared-termwise");
    expect(names("noah")).toEqual(["squared-termwise"]);
    expect(names("amelia").filter((n) => n === "partial-distribution")).toHaveLength(2);
    expect(names("chloe")).toContain("partial-distribution");
    expect(names("tomas").filter((n) => n === "divided-wrong-way")).toHaveLength(2);
    expect(names("finn")).toEqual(["divided-wrong-way"]);
    expect(names("sofia").filter((n) => n === "rationalise-wrong-factor")).toHaveLength(2);
    expect(byId.grace).toMatchObject({ done: 7, wrong: [] });
    expect(everyone.filter((c) => c.done < 10).map((c) => [c.id, c.done])).toEqual([["tomas", 8], ["liam", 5], ["grace", 7]]);
  });

  it("has a clear top gap: a number not multiplied into every term on six students, then a square and difference mixed on four under the binomial identity, a product's sign on three (tickets 299, 323)", () => {
    expect(assignmentCard(b, INITIAL_CLASSROOM, null, now).topGaps).toEqual([
      { misconception: "partial-distribution", name: "not multiplied into every term", students: 6, skill: "Algebra" },
      { misconception: "square-vs-difference", name: "square and difference mixed", students: 4, skill: "binomial identity" },
      { misconception: "product-sign", name: "sign of a product wrong", students: 3, skill: "Algebra" },
    ]);
  });

  it("keeps every problem to four columns of working or fewer, so no line overflows its box at 1280", () => {
    const ms = mistakesByProblem(null, b);
    for (const m of ms) expect(groupBySlip(m.rows).flatMap((g) => g.columns).length, m.problem.id).toBeLessThanOrEqual(4);
    expect(ms.find((m) => m.problem.id === "ps2-q10")!.rows.map((r) => r.id)).toEqual(["amelia", "isla", "lucas", "harper"]);
  });
});
