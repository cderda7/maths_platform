import { describe, expect, it } from "vitest";
import { PS3 } from ".";
import { PS3_PROBLEMS } from "./assignment";
import { PS3_CLASSMATES, PS3_SAM } from "./classmates";
import { assignmentBundle } from "@/lib/assignments";
import { INITIAL_CLASSROOM } from "@/lib/classroom";
import { assignmentCard, topGap } from "@/lib/classroomCards";
import { evaluateLine } from "@/lib/evaluate";
import { groupBySlip, mistakesByProblem } from "@/lib/mistakes";

/** Only what is particular to Problem Set 3 (ticket 213); the shared suite in data/finishedSets.test.ts checks the rest. */

const now = 1_700_000_000_000;
const everyone = [PS3_SAM, ...PS3_CLASSMATES];
const byId = Object.fromEntries(everyone.map((c) => [c.id, c]));
const b = assignmentBundle("pset-3", INITIAL_CLASSROOM)!;
const names = (id: string) => byId[id].wrong.flatMap((pid) => byId[id].attempts[pid].map((tex) => evaluateLine(pid, tex)).flatMap((v) => (v.verdict === "wrong" ? [v.name] : [])));

describe("Problem Set 3's data (ticket 213)", () => {
  it("is the registered set, on the default seating", () => {
    expect(b.problems).toBe(PS3_PROBLEMS);
    expect(PS3.groups).toBeUndefined();
  });

  it("Sam slips once, on Q8's pair; Liam handed nothing in; Jordan, Grace and Oliver stop at nine", () => {
    expect(PS3_SAM).toMatchObject({ done: 10, wrong: ["ps3-q8"] });
    expect(names("sam")).toEqual(["pair's signs swapped"]);
    expect(everyone.filter((c) => c.done === 0).map((c) => c.id)).toEqual(["liam"]);
    expect(everyone.filter((c) => c.done === 9).map((c) => c.id)).toEqual(["jordan", "grace", "oliver"]);
  });

  it("Jordan's unchecked pairs begin here (Q8, Q9); Mia stops at a close try; Noah squares term by term on Q2 and Q10", () => {
    expect(names("jordan")).toEqual(["perfect square as difference", "pair guessed, not expanded back", "non-monic pair guessed"]);
    expect(names("mia")).toContain("stopped at a close try");
    expect(names("noah")).toEqual(["squared each term separately", "squared each term separately"]);
  });
});

describe("Problem Set 3's Mistakes tab and card (ticket 213)", () => {
  const ms = mistakesByProblem(null, b);

  it("keeps every problem to four columns of working or fewer, so no line overflows its box at 1280", () => {
    for (const m of ms) expect(groupBySlip(m.rows).flatMap((g) => g.columns).length, m.problem.id).toBeLessThanOrEqual(4);
  });

  it("has a clear top gap: the binomial identity on nine students, monic factorising next on seven", () => {
    const card = assignmentCard(b, INITIAL_CLASSROOM, null, now);
    expect(card).toMatchObject({ submitted: 19, total: 20 });
    expect(card.topGap).toEqual({ slips: ["algebra.expand-factor.binomial"], name: "binomial identity", students: 9 });
    const rest = ms.map((m) => ({ ...m, rows: m.rows.filter((r) => !(r.slips.length === 1 && r.slips[0] === "algebra.expand-factor.binomial")) }));
    expect(topGap(rest)).toEqual({ slips: ["algebra.expand-factor.monic"], name: "monic factorising", students: 7 });
  });
});
