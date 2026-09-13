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
const SURDS = "algebra.number.surds";

/** The names of a student's wrong lines, problem by problem. */
const names = (id: string) => byId[id].wrong.flatMap((pid) => byId[id].attempts[pid].map((tex) => evaluateLine(pid, tex)).flatMap((v) => (v.verdict === "wrong" ? [v.name] : [])));

describe("Problem Set 1 — Surds (ticket 211)", () => {
  it("Sam's answers are fixed and finished: all ten reached, nothing wrong", () => {
    expect(PS1_SAM).toMatchObject({ done: 10, wrong: [], attempts: {} });
  });

  it("nobody is missing; Tomas stops after Q9, Grace after Q8, Liam hands in Q1 and Q2", () => {
    expect(everyone.filter((c) => c.done === 0)).toEqual([]);
    expect(everyone.filter((c) => c.done < 10).map((c) => [c.id, c.done])).toEqual([["tomas", 9], ["liam", 2], ["grace", 8]]);
  });

  it("the habits later sets catch start here, each under one name across problems", () => {
    expect(names("liam")).toEqual(["square out, root not taken"]);
    expect(names("oliver")).toEqual(["square out, root not taken", "root of a sum split"]);
    expect(names("chloe")).toEqual(["square factor left under root", "square out, root not taken"]);
    expect(names("ruby")).toEqual(["square factor left under root", "square factor left under root"]);
    expect(names("tomas")).toEqual(["sign lost collecting surds", "fraction turned upside down"]);
    expect(names("sofia")).toEqual(["fraction turned upside down"]);
    expect(names("aiden")).toEqual(["√2 on first term only"]);
    expect(names("finn")).toEqual(["divided the wrong way round"]);
  });

  it("the Classroom's card: 20/20, 15 mistakes, top gap surds on seven students, fractions next on three", () => {
    const card = assignmentCard(b, INITIAL_CLASSROOM, null, now);
    expect(card).toMatchObject({ submitted: 20, total: 20, mistakes: 15 });
    expect(card.topGap).toEqual({ slips: [SURDS], name: "surds", students: 7 });
    const ms = mistakesByProblem(null, b);
    const rest = ms.map((m) => ({ ...m, rows: m.rows.filter((r) => !r.slips.includes(SURDS)) }));
    expect(topGap(rest)).toEqual({ slips: ["algebra.number.fractions"], name: "fractions", students: 3 });
  });

  it("every problem's Mistakes row keeps to three columns of working or fewer (a sentence answer overflows five at 1280)", () => {
    const ms = mistakesByProblem(null, b);
    expect(ms.map((m) => [m.problem.label, m.rows.map((r) => r.id)])).toEqual([
      ["Q1", ["chloe", "ruby"]],
      ["Q2", ["liam"]],
      ["Q3", ["amelia"]],
      ["Q4", ["tomas", "isla", "oliver"]],
      ["Q5", ["chloe"]],
      ["Q6", ["ruby"]],
      ["Q7", ["amelia", "tomas", "sofia"]],
      ["Q8", ["aiden"]],
      ["Q9", ["finn"]],
      ["Q10", ["oliver"]],
    ]);
    for (const m of ms) expect(groupBySlip(m.rows).flatMap((g) => g.columns).length, m.problem.label).toBeLessThanOrEqual(3);
  });
});
