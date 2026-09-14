import { describe, expect, it } from "vitest";
import { computePhases, groupPlan, recordReviewProblems, reviewProblemsOf } from "./group";
import { CLASSMATE_MAP } from "@/data/classmates";
import { progressOf } from "./feedback";
import { INITIAL_SESSION, sessionAt, type StudentSession } from "./session";

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

  it("the demo group: the all-correct problems are the quick pass, every problem a member did not get right the discussion (ticket 278)", () => {
    const g = groupPlan(sessionAt("group"));
    expect(g.members.map((m) => m.id)).toEqual(["sam", "jordan", "zara", "liam"]);
    // Ticket 281: Liam answers Q1–Q4 (the formula right) and starts Q5, so Q4 is right for all four.
    expect(g.quickPass.map((p) => p.id)).toEqual(["q4"]);
    expect(g.discussion.problems.map((p) => p.id)).toEqual(["q1", "q2", "q3", "q5", "q6", "q7", "q8", "q9", "q10"]);
    expect(g.discussion.memberCount).toBe(4);
    // Sam 6 (five slips, Q9 unfinished), Jordan 5 (Q2, Q7 wrong; Q8–Q10 not reached), Zara 3, Liam 9 (Q1–Q3 and his started Q5 wrong, Q6–Q10 not reached).
    expect(g.discussion.totalWrong).toBe(6 + 5 + 3 + 9);
    expect(g.discussion.perMember).toBe(6);
  });

  it("the discussion view carries no correctness data: nothing per member, nothing per problem", () => {
    const d = groupPlan(sessionAt("group")).discussion;
    expect(Object.keys(d).sort()).toEqual(["memberCount", "perMember", "problems", "totalWrong"]);
    for (const p of d.problems) expect(Object.keys(p)).not.toContain("wrong");
    const json = JSON.stringify(d);
    for (const name of ["sam", "jordan", "zara", "liam", "slip", "wrong\":", "verdict"]) expect(json).not.toContain(name);
  });

  describe("a member's problems for the union (ticket 278): wrong, incomplete and not attempted all count; absent members bring nothing", () => {
    it("the demo student: a wrong line counts, Q9 started and left incomplete counts, a problem with nothing on it counts, a finished right one does not", () => {
      const s = sessionAt("group");
      expect(progressOf(s, "q9")).toBe("unfinished");
      expect(reviewProblemsOf(s)).toEqual(["q1", "q2", "q3", "q7", "q9", "q10"]);
      // Q9's working taken away: not attempted, and it still counts.
      const blank: StudentSession = { ...s, lines: { ...s.lines, q9: [] }, rework: { ...s.rework, q9: [] } };
      expect(progressOf(blank, "q9")).toBe("not-attempted");
      expect(reviewProblemsOf(blank)).toEqual(["q1", "q2", "q3", "q7", "q9", "q10"]);
      // Q4 right: out. With its working taken away it is not attempted, and in.
      const noQ4: StudentSession = { ...s, lines: { ...s.lines, q4: [] }, rework: { ...s.rework, q4: [] } };
      expect(reviewProblemsOf(noQ4)).toEqual(["q1", "q2", "q3", "q4", "q7", "q9", "q10"]);
      // Nothing written anywhere: every problem.
      expect(reviewProblemsOf(INITIAL_SESSION)).toHaveLength(10);
    });

    it("a classmate: wrong counts, working left past where they finished counts, a problem never reached counts; right inside what they finished does not", () => {
      // Finished Q1–Q2 (Q2 wrong), started Q3 and stopped, never reached Q4 on.
      const m = { done: 2, wrong: ["q2"] };
      expect(recordReviewProblems(m)).toEqual(["q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"]);
      expect(recordReviewProblems({ done: 0, wrong: [] })).toHaveLength(10);
      expect(recordReviewProblems({ done: 10, wrong: [] })).toEqual([]);
      expect(recordReviewProblems({ done: 10, wrong: ["q3", "q7"] })).toEqual(["q3", "q7"]);
      // The demo group's classmates as the fixture has them.
      expect(recordReviewProblems(CLASSMATE_MAP.jordan)).toEqual(["q2", "q7", "q8", "q9", "q10"]);
      expect(recordReviewProblems(CLASSMATE_MAP.zara)).toEqual(["q3", "q7", "q9"]);
      expect(recordReviewProblems(CLASSMATE_MAP.liam)).toEqual(["q1", "q2", "q3", "q5", "q6", "q7", "q8", "q9", "q10"]);
    });

    it("the union takes a problem only a not-attempting member brings, and an absent member brings nothing", () => {
      const ids = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"];
      const s = sessionAt("group");
      // A partner who finished everything right but Q3 and Q7, and one who stopped after Q8.
      const union = (mates: { done: number; wrong: string[] }[]) => computePhases(ids, [reviewProblemsOf(s), ...mates.map(recordReviewProblems)]).discussion;
      expect(union([{ done: 10, wrong: ["q3"] }])).toEqual(["q1", "q2", "q3", "q7", "q9", "q10"]);
      expect(union([{ done: 10, wrong: ["q3"] }, { done: 8, wrong: [] }])).toEqual(["q1", "q2", "q3", "q7", "q9", "q10"]);
      expect(union([{ done: 6, wrong: [] }])).toEqual(["q1", "q2", "q3", "q7", "q8", "q9", "q10"]);
      // Liam away: nobody brings Q5 or Q6, and Q8 only through Jordan, who never reached it.
      expect(groupPlan(s, ["liam"]).discussion.problems.map((p) => p.id)).toEqual(["q1", "q2", "q3", "q7", "q8", "q9", "q10"]);
      expect(groupPlan(s, ["liam", "jordan"]).discussion.problems.map((p) => p.id)).toEqual(["q1", "q2", "q3", "q7", "q9", "q10"]);
    });
  });
});
