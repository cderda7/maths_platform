import { describe, expect, it } from "vitest";
import { PS1_CLASSMATES, PS1_SAM } from "./classmates";
import { assignmentBundle } from "@/lib/assignments";
import { INITIAL_CLASSROOM } from "@/lib/classroom";
import { assignmentCard, topGap } from "@/lib/classroomCards";
import { evaluateLine } from "@/lib/evaluate";
import { groupBySlip, mistakesByProblem } from "@/lib/mistakes";

/** Only what is particular to Problem Set 1 (ticket 211); `data/finishedSets.test.ts` checks the rest. */

const now = 1_700_000_000_000;
const everyone = [PS1_SAM, ...PS1_CLASSMATES];
const byId = Object.fromEntries(everyone.map((c) => [c.id, c]));
const b = assignmentBundle("pset-1", INITIAL_CLASSROOM)!;

/** The misconceptions of a student's wrong lines, problem by problem (ticket 299). */
const names = (id: string) => byId[id].wrong.flatMap((pid) => byId[id].attempts[pid].map((tex) => evaluateLine(pid, tex)).flatMap((v) => (v.verdict === "wrong" ? [v.misconception] : [])));

describe("Problem Set 1 — Surds (ticket 211)", () => {
  it("Sam's answers are fixed and finished: all ten reached, nothing wrong", () => {
    expect(PS1_SAM).toMatchObject({ done: 10, wrong: [], attempts: {} });
  });

  it("nobody is missing; Tomas stops after Q9, Grace after Q8, Liam after Q5 (Q1 and Q2 before ticket 281)", () => {
    expect(everyone.filter((c) => c.done === 0)).toEqual([]);
    expect(everyone.filter((c) => c.done < 10).map((c) => [c.id, c.done])).toEqual([["tomas", 9], ["liam", 5], ["grace", 8]]);
  });

  it("the patterns later sets catch start here, each under one name across problems", () => {
    expect(names("liam")).toEqual(["root-not-taken", "roots-added", "collecting-sign"]);
    expect(names("oliver")).toEqual(["root-not-taken", "roots-added"]);
    expect(names("chloe")).toEqual(["square-left-in-root", "root-not-taken"]);
    expect(names("ruby")).toEqual(["square-left-in-root", "square-left-in-root", "square-left-in-root"]);
    expect(names("tomas")).toEqual(["collecting-sign", "divided-wrong-way"]);
    expect(names("sofia")).toEqual(["divided-wrong-way", "divided-wrong-way"]);
    expect(names("aiden")).toEqual(["partial-distribution"]);
    expect(names("finn")).toEqual(["divided-wrong-way", "divided-wrong-way"]);
  });

  it("the Classroom's card: 20/20, 20 mistakes (15 before ticket 281), top gap a square out with its root not taken on three students, roots added like numbers tied on three but seen later (ticket 299)", () => {
    const card = assignmentCard(b, INITIAL_CLASSROOM, null, now);
    expect(card).toMatchObject({ submitted: 20, total: 20, mistakes: 20 });
    expect(card.topGap).toEqual({ misconceptions: ["root-not-taken"], name: "square out, root not taken", students: 3 });
    const ms = mistakesByProblem(null, b);
    const rest = ms.map((m) => ({ ...m, rows: m.rows.filter((r) => !r.misconceptions.includes("root-not-taken")) }));
    expect(topGap(rest)).toEqual({ misconceptions: ["roots-added"], name: "roots added like numbers", students: 3 });
  });

  it("every problem's Mistakes row keeps to three columns of working or fewer (a sentence answer overflows five at 1280)", () => {
    const ms = mistakesByProblem(null, b);
    expect(ms.map((m) => [m.problem.label, m.rows.map((r) => r.id)])).toEqual([
      ["Q1", ["chloe", "ruby"]],
      ["Q2", ["liam"]],
      ["Q3", ["amelia", "liam"]],
      ["Q4", ["tomas", "liam", "isla", "oliver"]],
      ["Q5", ["chloe"]],
      ["Q6", ["ruby"]],
      ["Q7", ["amelia", "tomas", "sofia"]],
      ["Q8", ["aiden"]],
      ["Q9", ["finn"]],
      ["Q10", ["oliver", "ruby", "finn", "sofia"]],
    ]);
    for (const m of ms) expect(groupBySlip(m.rows).flatMap((g) => g.columns).length, m.problem.label).toBeLessThanOrEqual(3);
  });
});
