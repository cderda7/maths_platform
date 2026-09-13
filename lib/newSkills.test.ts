import { describe, expect, it } from "vitest";
import { ASSIGNMENT, PROBLEMS } from "@/data/assignment";
import { PS5_ASSIGNMENT } from "@/data/pset5/assignment";
import { tag, type Problem } from "@/data/types";
import type { LeafId } from "@/data/taxonomy";
import { LIVE_ASSIGNMENT_ID, recentSets } from "./assignments";
import { FOCUS_PROBLEMS, inferNewSkills, newSkillCandidates, RECENT_SETS } from "./newSkills";

/** A problem whose one step is tagged with `leaves`. */
const problem = (id: string, ...leaves: LeafId[]): Problem => ({ id, label: id, difficulty: "simple familiar", stem: "", tex: "", solution: [{ tex: "x", label: "", tags: leaves.map((l) => tag(l)) }] });
const set = (problems: Problem[], newSkills: LeafId[] = []) => ({ problems, newSkills });

const NFL: LeafId = "functions.zeros.nfl";
const DISC: LeafId = "algebra.equations.discriminant";
const SURDS: LeafId = "algebra.number.surds";
const MONIC: LeafId = "algebra.expand-factor.monic";

describe("New skills inference (ticket 209)", () => {
  it("reproduces Problem Set 6's New skills from its problems against Problem Set 5", () => {
    expect([...inferNewSkills(PROBLEMS, [PS5_ASSIGNMENT])].sort()).toEqual([...ASSIGNMENT.newSkills].sort());
  });

  it("with all six sets registered, Create's inference over the Classroom's last two sets (Sets 5 and 4) still gives Problem Set 6's New skills (ticket 217)", () => {
    const recent = recentSets(LIVE_ASSIGNMENT_ID, RECENT_SETS);
    expect(recent.map((s) => s.id)).toEqual(["pset-5", "pset-4"]);
    expect([...inferNewSkills(PROBLEMS, recent)].sort()).toEqual([...ASSIGNMENT.newSkills].sort());
  });

  it("a skill the set is focused on is new unless the class met it in either of its last two sets; a third set back is not read", () => {
    const now = [problem("a", NFL, DISC), problem("b", NFL, DISC, SURDS), problem("c", SURDS, MONIC), problem("d", MONIC)];
    expect(RECENT_SETS).toBe(2);
    // Nothing earlier: every focus skill is new.
    expect(inferNewSkills(now, [])).toEqual([NFL, DISC, SURDS, MONIC]);
    // Met in the newest set, or in the one before it: not new.
    expect(inferNewSkills(now, [set([problem("x", MONIC)])])).toEqual([NFL, DISC, SURDS]);
    expect(inferNewSkills(now, [set([problem("x", MONIC)]), set([problem("y", SURDS)])])).toEqual([NFL, DISC]);
    // Met only three sets back: new again.
    expect(inferNewSkills(now, [set([problem("x", MONIC)]), set([problem("y", SURDS)]), set([problem("z", NFL, DISC)])])).toEqual([NFL, DISC]);
  });

  it("a skill a recent set listed as new was still being introduced there: it stays new", () => {
    const now = [problem("a", NFL), problem("b", NFL)];
    expect(inferNewSkills(now, [set([problem("x", NFL)], [NFL])])).toEqual([NFL]);
    expect(inferNewSkills(now, [set([problem("x", NFL)], [NFL]), set([problem("y", NFL)])])).toEqual([]);
  });

  it("needs the set to lean on the skill: one problem in passing is not new", () => {
    expect(FOCUS_PROBLEMS).toBe(2);
    expect(inferNewSkills([problem("a", NFL, DISC), problem("b", NFL)], [])).toEqual([NFL]);
  });

  it("candidates are the set's moves, most-invoked first, never a whole-task leaf", () => {
    const c = newSkillCandidates([problem("a", DISC, "communication.process.working", "algebra.equations.quadratic"), problem("b", NFL, DISC)]);
    expect(c).toEqual([
      { leaf: DISC, problems: 2 },
      { leaf: NFL, problems: 1 },
    ]);
  });
});
