import { describe, expect, it } from "vitest";
import { CLASSMATES } from "@/data/classmates";
import { isMastery, peerStruggles } from "./peers";
import { sessionAt } from "./session";

describe("peer struggles for a mastery-level student", () => {
  it("aggregates counts only: no names, no lines of work", () => {
    const p = peerStruggles();
    expect(p.classSize).toBe(CLASSMATES.length);
    const missed = (pid: string) => CLASSMATES.filter((c) => c.wrong.includes(pid)).length;
    // Q7 draws the most slips in the class (twelve); Q2 and Q3 tie at six and Q2 comes first in set order.
    expect(p.problems.slice(0, 2).map((x) => [x.problem.id, x.missed])).toEqual([
      ["q7", missed("q7")],
      ["q2", missed("q2")],
    ]);
    expect(missed("q7")).toBe(12);
    expect(p.leaves[0].struggling).toBeGreaterThan(0);
    expect(p.leaves.map((l) => l.id)).toContain("algebra.expand-factor.nonmonic");
    const json = JSON.stringify(p);
    for (const name of ["Jordan", "Zara", "Liam", "Tomas", "attempts", "x = 9"]) expect(json).not.toContain(name);
    for (const x of p.problems) expect(x.pattern.length).toBeGreaterThan(0);
  });

  it("the strong run is mastery; the scripted run is not", () => {
    expect(isMastery(sessionAt("report", "strong"))).toBe(true);
    expect(isMastery(sessionAt("report"))).toBe(false);
    expect(isMastery(sessionAt("working"))).toBe(false);
  });
});
