import { describe, expect, it } from "vitest";
import { computePhases, groupPlan } from "./group";
import { sessionAt } from "./session";

describe("group-phase computation", () => {
  it("quick pass is the intersection of correct sets, discussion the union of wrongs", () => {
    const r = computePhases(["q1", "q2", "q3", "q4"], [["q1", "q2"], ["q2"], []]);
    expect(r.quickPass).toEqual(["q3", "q4"]);
    expect(r.discussion).toEqual(["q1", "q2"]);
    expect(r.totalWrong).toBe(3);
  });

  it("edge cases: nobody wrong, everybody wrong on everything", () => {
    expect(computePhases(["q1", "q2"], [[], [], []])).toEqual({ quickPass: ["q1", "q2"], discussion: [], totalWrong: 0 });
    expect(computePhases(["q1", "q2"], [["q1", "q2"], ["q1", "q2"]])).toEqual({ quickPass: [], discussion: ["q1", "q2"], totalWrong: 4 });
  });

  it("the demo group: the all-correct problems are the quick pass, the union of wrongs the discussion", () => {
    const g = groupPlan(sessionAt("group-pass"));
    expect(g.members.map((m) => m.id)).toEqual(["sam", "jordan", "zara", "liam"]);
    expect(g.quickPass.map((p) => p.id)).toEqual(["q4", "q5", "q6", "q8"]);
    expect(g.discussion.problems.map((p) => p.id)).toEqual(["q1", "q2", "q3", "q7", "q9", "q10"]);
    expect(g.discussion.memberCount).toBe(4);
    expect(g.discussion.totalWrong).toBe(5 + 1 + 2 + 2);
    expect(g.discussion.perMember).toBe(3);
  });

  it("the discussion view carries no correctness data: nothing per member, nothing per problem", () => {
    const d = groupPlan(sessionAt("group-pass")).discussion;
    expect(Object.keys(d).sort()).toEqual(["memberCount", "perMember", "problems", "totalWrong"]);
    for (const p of d.problems) expect(Object.keys(p)).not.toContain("wrong");
    const json = JSON.stringify(d);
    for (const name of ["sam", "jordan", "zara", "liam", "slip", "wrong\":", "verdict"]) expect(json).not.toContain(name);
  });
});
