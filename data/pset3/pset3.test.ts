import { describe, expect, it } from "vitest";
import { PS3 } from ".";
import { PS3_PROBLEMS } from "./assignment";
import { PS3_CLASSMATES, PS3_SAM } from "./classmates";
import { assignmentBundle } from "@/lib/assignments";
import { INITIAL_CLASSROOM } from "@/lib/classroom";
import { assignmentCard } from "@/lib/classroomCards";
import { evaluateLine } from "@/lib/evaluate";
import { groupBySlip, mistakesByProblem } from "@/lib/mistakes";

/** Only what is particular to Problem Set 3 (ticket 213); the shared suite in data/finishedSets.test.ts checks the rest. */

const now = 1_700_000_000_000;
const everyone = [PS3_SAM, ...PS3_CLASSMATES];
const byId = Object.fromEntries(everyone.map((c) => [c.id, c]));
const b = assignmentBundle("pset-3", INITIAL_CLASSROOM)!;
const names = (id: string) => byId[id].wrong.flatMap((pid) => byId[id].attempts[pid].map((tex) => evaluateLine(pid, tex)).flatMap((v) => (v.verdict === "wrong" ? [v.misconception] : [])));

describe("Problem Set 3's data (ticket 213)", () => {
  it("is the registered set, on the default seating", () => {
    expect(b.problems).toBe(PS3_PROBLEMS);
    expect(PS3.groups).toBeUndefined();
  });

  it("Sam slips once, on Q8's pair; Liam hands in five (nothing before ticket 281); Jordan, Grace and Oliver stop at nine", () => {
    expect(PS3_SAM).toMatchObject({ done: 10, wrong: ["ps3-q8"] });
    expect(names("sam")).toEqual(["pair-signs-swapped"]);
    expect(everyone.filter((c) => c.done === 0).map((c) => c.id)).toEqual([]);
    expect(byId.liam).toMatchObject({ done: 5, wrong: ["ps3-q2", "ps3-q5"] });
    expect(everyone.filter((c) => c.done === 9).map((c) => c.id)).toEqual(["jordan", "grace", "oliver"]);
  });

  it("Jordan's factor brackets go wrong from here (Q8, Q9); Mia's brackets don't expand back on Q9; Noah squares term by term on Q2 and Q10", () => {
    // Ticket 343: Q8's (x − 2)(x − 12) multiplies to 24 and adds to −14, product right and sum wrong.
    expect(names("jordan")).toEqual(["square-vs-difference", "pair-sum-wrong", "brackets-dont-expand"]);
    expect(names("mia")).toContain("brackets-dont-expand");
    expect(names("noah")).toEqual(["squared-termwise", "squared-termwise"]);
  });

  it("names Q5's (x + 15)(x − 1) and Q8's (x − 2)(x − 12) product right, sum wrong, and every writer's commentary and pattern say so (ticket 343)", () => {
    expect(evaluateLine("ps3-q5", "(x + 15)(x - 1)")).toMatchObject({ verdict: "wrong", misconception: "pair-sum-wrong" });
    expect(evaluateLine("ps3-q8", "(x - 2)(x - 12)")).toMatchObject({ verdict: "wrong", misconception: "pair-sum-wrong" });
    const note = (id: string, pid: string) => byId[id].notes.filter((n) => n.problems.includes(pid)).map((n) => n.text);
    expect(note("liam", "ps3-q5")).toEqual(["a pair that multiplies to −15 but adds to 14"]);
    expect(note("oliver", "ps3-q5")).toEqual(["a pair that multiplies but doesn't add"]);
    expect(note("oliver", "ps3-q8")).toEqual(["a pair that multiplies but doesn't add"]);
    expect(note("chloe", "ps3-q8")).toEqual(["a pair that multiplies to 24 but adds to −14"]);
    expect(note("ethan", "ps3-q8")).toEqual(["a pair that multiplies to 24 but adds to −14"]);
    // Jordan's Q8 and Q9 stay one pattern (a pair product right on Q8, brackets that don't expand back on Q9), so review still reads it as repeated.
    expect(note("jordan", "ps3-q8")).toEqual(["a factor pair that multiplies to the constant, the brackets wrong"]);
  });
});

describe("Problem Set 3's Mistakes tab and card (ticket 213)", () => {
  const ms = mistakesByProblem(null, b);

  it("keeps every problem to four columns of working or fewer, so no line overflows its box at 1280, but Q10's five (ticket 281: Harper's slip, measured at 1280 and 1440 with nothing wider than its box)", () => {
    for (const m of ms) expect(groupBySlip(m.rows).flatMap((g) => g.columns).length, m.problem.id).toBeLessThanOrEqual(m.problem.id === "ps3-q10" ? 5 : 4);
  });

  it("has clear top gaps: a pair whose product is right and sum wrong on seven students, a square and a difference of squares mixed next on five (tickets 299, 323, 343)", () => {
    const card = assignmentCard(b, INITIAL_CLASSROOM, null, now);
    expect(card).toMatchObject({ submitted: 20, total: 20 });
    expect(card.topGaps).toEqual([
      { misconception: "pair-sum-wrong", name: "product right, sum wrong", students: 7, skill: "Algebra" },
      { misconception: "square-vs-difference", name: "square and difference mixed", students: 5, skill: "binomial identity" },
      { misconception: "minus-not-distributed", name: "minus not carried through", students: 4, skill: "Algebra" },
    ]);
  });
});
