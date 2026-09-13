import { describe, expect, it } from "vitest";
import { PS2 } from ".";
import { PS2_CLASSMATES, PS2_SAM } from "./classmates";
import { assignmentBundle } from "@/lib/assignments";
import { INITIAL_CLASSROOM } from "@/lib/classroom";
import { assignmentCard, topGap } from "@/lib/classroomCards";
import { evaluateLine } from "@/lib/evaluate";
import { groupBySlip, mistakesByProblem } from "@/lib/mistakes";

/**
 * Problem Set 2's particulars (ticket 212): its top gap's clusters, its named habits and Sam's slips. The shared
 * suite (`data/finishedSets.test.ts`) checks the contract and every student's results against the class story sheet.
 */

const now = 1_700_000_000_000;
const everyone = [PS2_SAM, ...PS2_CLASSMATES];
const byId = Object.fromEntries(everyone.map((c) => [c.id, c]));
const b = assignmentBundle("pset-2", INITIAL_CLASSROOM)!;
const names = (id: string) => byId[id].wrong.flatMap((pid) => byId[id].attempts[pid].map((tex) => evaluateLine(pid, tex)).flatMap((v) => (v.verdict === "wrong" ? [v.name] : [])));

describe("Problem Set 2's data (ticket 212)", () => {
  it("is registered under pset-2 with its own name and date", () => {
    expect(b).toMatchObject({ id: "pset-2", kind: "finished", name: "Problem Set 2 — Rationalising and expanding with surds", due: "Fri 28 Aug" });
    expect(PS2.fixture.newSkills).toEqual(["algebra.number.surds", "algebra.expand-factor.binomial"]);
  });

  it("Sam slips twice: a surd product's sign on Q2 and the same bracket for the conjugate on Q7", () => {
    expect(PS2_SAM).toMatchObject({ done: 10, wrong: ["ps2-q2", "ps2-q7"] });
    expect(names("sam")).toEqual(["√5 × (−√5) as +5", "same bracket, not the conjugate", "square taken as difference"]);
  });

  it("the habits the sheet names: Liam and Noah square term by term, Amelia puts the conjugate on the bottom twice, Tomas turns fractions over", () => {
    expect(names("liam")).toContain("squared each term separately");
    expect(names("noah")).toEqual(["squared each term separately"]);
    expect(names("amelia").filter((n) => n === "conjugate on the bottom only")).toHaveLength(2);
    expect(names("chloe")).toContain("conjugate on the bottom only");
    expect(names("tomas").filter((n) => n === "fraction turned over")).toHaveLength(2);
    expect(names("finn")).toEqual(["fraction turned over"]);
    expect(names("sofia").filter((n) => n === "rationalised the top, not bottom")).toHaveLength(2);
    expect(byId.grace).toMatchObject({ done: 7, wrong: [] });
    expect(everyone.filter((c) => c.done < 10).map((c) => [c.id, c.done])).toEqual([["tomas", 8], ["liam", 3], ["grace", 7]]);
  });

  it("has a clear top gap: the binomial identity on nine students, expansion next on eight, fractions on seven", () => {
    const ms = mistakesByProblem(null, b);
    expect(topGap(ms)).toEqual({ slips: ["algebra.expand-factor.binomial"], name: "binomial identity", students: 9 });
    const without = (leaf: string) => ms.map((m) => ({ ...m, rows: m.rows.filter((r) => !(r.slips.length === 1 && r.slips[0] === leaf)) }));
    expect(topGap(without("algebra.expand-factor.binomial"))).toEqual({ slips: ["algebra.expand-factor.expand"], name: "expansion", students: 8 });
    const rest = without("algebra.expand-factor.binomial").map((m) => ({ ...m, rows: m.rows.filter((r) => r.slips.join() !== "algebra.expand-factor.expand") }));
    expect(topGap(rest)!.students).toBe(7);
    expect(assignmentCard(b, INITIAL_CLASSROOM, null, now).topGap!.name).toBe("binomial identity");
  });

  it("keeps every problem to four columns of working or fewer, so no line overflows its box at 1280", () => {
    const ms = mistakesByProblem(null, b);
    for (const m of ms) expect(groupBySlip(m.rows).flatMap((g) => g.columns).length, m.problem.id).toBeLessThanOrEqual(4);
    expect(ms.find((m) => m.problem.id === "ps2-q10")!.rows.map((r) => r.id)).toEqual(["amelia", "isla", "lucas"]);
  });
});
