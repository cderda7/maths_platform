import { describe, expect, it } from "vitest";
import { assignmentBundle, assignmentIds } from "./assignments";
import { INITIAL_CLASSROOM } from "./classroom";
import { countMisconceptions, sightingsOn, type Sighting } from "./misconceptionCounts";
import { mistakesByProblem } from "./mistakes";

const sighting = (misconception: Sighting["misconception"], cohort: string, student: string, set: string, problem: string): Sighting => ({ misconception, cohort, student, set, problem });

describe("counting misconceptions (ticket 299)", () => {
  it("counts sightings, distinct students, sets and classes under one id; a student id is only the same student inside one class", () => {
    const counts = countMisconceptions([
      sighting("nfl-without-zero", "11 Methods", "oliver", "pset-4", "ps4-q5"),
      sighting("nfl-without-zero", "11 Methods", "oliver", "pset-6", "q3"),
      sighting("nfl-without-zero", "11 Methods", "oliver", "pset-6", "q3"), // the same problem again: one sighting
      sighting("nfl-without-zero", "11 Specialist", "oliver", "pset-2", "q3"), // another class's Oliver
      sighting("pair-sum-wrong", "11 Methods", "liam", "pset-6", "q1"),
    ]);
    expect(counts).toEqual([
      { misconception: "nfl-without-zero", name: "null factor law without zero", sightings: 3, students: 2, sets: 3, cohorts: 2 },
      { misconception: "pair-sum-wrong", name: "product right, sum wrong", sightings: 1, students: 1, sets: 1, cohorts: 1 },
    ]);
    expect(countMisconceptions([])).toEqual([]);
  });

  it("reads a set's sightings off its Mistakes tab: one per student, problem and misconception, each row's own", () => {
    for (const id of assignmentIds(INITIAL_CLASSROOM)) {
      const b = assignmentBundle(id, INITIAL_CLASSROOM)!;
      const seen = sightingsOn(b);
      const rows = mistakesByProblem(null, b).flatMap((p) => p.rows.map((r) => ({ p: p.problem.id, r })));
      expect(seen.length, id).toBe(rows.reduce((n, { r }) => n + new Set(r.misconceptions).size, 0));
      for (const s of seen) expect(s, id).toMatchObject({ cohort: b.className, set: b.id });
    }
  });

  it("across the class's five finished sets, the same misconception adds up from set to set", () => {
    const all = assignmentIds(INITIAL_CLASSROOM).flatMap((id) => sightingsOn(assignmentBundle(id, INITIAL_CLASSROOM)!));
    const counts = countMisconceptions(all);
    const of = (id: string) => counts.find((c) => c.misconception === id)!;
    // Brackets that don't expand back to the quadratic: Problem Sets 3, 4 and 5 (PS6 is not created yet on the initial classroom).
    expect(of("brackets-dont-expand")).toMatchObject({ sets: 3, cohorts: 1 });
    expect(of("brackets-dont-expand").students).toBeGreaterThanOrEqual(8);
    // A root's or turning point's sign taken from its bracket: Problem Sets 4 and 5.
    expect(of("root-vertex-sign").sets).toBe(2);
    for (const c of counts) expect(c.students, c.misconception).toBeLessThanOrEqual(20);
    expect(counts[0].students).toBeGreaterThanOrEqual(counts[counts.length - 1].students);
  });
});
