import { describe, expect, it } from "vitest";
import { computePhases, groupPlan, recordReviewProblems, reviewProblemsOf } from "./group";
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

  it("the demo group: the all-correct problems are the quick pass, the union of wrongs the discussion", () => {
    const g = groupPlan(sessionAt("group"));
    expect(g.members.map((m) => m.id)).toEqual(["sam", "jordan", "zara", "liam"]);
    expect(g.quickPass.map((p) => p.id)).toEqual(["q4", "q5", "q6", "q8"]);
    expect(g.discussion.problems.map((p) => p.id)).toEqual(["q1", "q2", "q3", "q7", "q9", "q10"]);
    expect(g.discussion.memberCount).toBe(4);
    expect(g.discussion.totalWrong).toBe(6 + 2 + 3 + 3); // Jordan wrong on Q2 and (ticket 189) Q7; Sam's unfinished Q9 counts (ticket 250)
    expect(g.discussion.perMember).toBe(4);
  });

  it("the discussion view carries no correctness data: nothing per member, nothing per problem", () => {
    const d = groupPlan(sessionAt("group")).discussion;
    expect(Object.keys(d).sort()).toEqual(["memberCount", "perMember", "problems", "totalWrong"]);
    for (const p of d.problems) expect(Object.keys(p)).not.toContain("wrong");
    const json = JSON.stringify(d);
    for (const name of ["sam", "jordan", "zara", "liam", "slip", "wrong\":", "verdict"]) expect(json).not.toContain(name);
  });

  describe("a member's problems for the union (ticket 250): not attempted skipped, incomplete included", () => {
    it("the demo student: a wrong line counts; Q9, started and left incomplete, counts; a problem with nothing on it does not", () => {
      const s = sessionAt("group");
      expect(progressOf(s, "q9")).toBe("unfinished");
      expect(reviewProblemsOf(s)).toEqual(["q1", "q2", "q3", "q7", "q9", "q10"]);
      // Q9's working taken away: not attempted, so it brings nothing.
      const blank: StudentSession = { ...s, lines: { ...s.lines, q9: [] }, rework: { ...s.rework, q9: [] } };
      expect(progressOf(blank, "q9")).toBe("not-attempted");
      expect(reviewProblemsOf(blank)).toEqual(["q1", "q2", "q3", "q7", "q10"]);
      expect(reviewProblemsOf(INITIAL_SESSION)).toEqual([]);
    });

    it("a classmate: wrong with working counts, working left past where they finished counts, a problem never reached does not", () => {
      // Finished Q1–Q2 (Q2 wrong), started Q3 and stopped, never reached Q4 on.
      const m = { done: 2, wrong: ["q2"], attempts: { q2: ["x"], q3: ["y"] } };
      expect(recordReviewProblems(m)).toEqual(["q2", "q3"]);
      // A wrong entry with no working is not attempted.
      expect(recordReviewProblems({ done: 0, wrong: ["q5"], attempts: {} })).toEqual([]);
      // Right on a finished problem with working: nothing to bring.
      expect(recordReviewProblems({ done: 3, wrong: [], attempts: { q1: ["z"] } })).toEqual([]);
    });

    it("the union skips a problem only a not-attempting member would bring, and includes one only an incomplete member brings", () => {
      const s = sessionAt("group");
      const zaraWithoutQ9 = { done: 10, wrong: ["q3", "q7"], attempts: { q3: ["a"], q7: ["b"] } };
      const union = (session: StudentSession) => computePhases(["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"], [reviewProblemsOf(session), recordReviewProblems(zaraWithoutQ9)]).discussion;
      expect(union(s)).toContain("q9");
      expect(union({ ...s, lines: { ...s.lines, q9: [] }, rework: { ...s.rework, q9: [] } })).not.toContain("q9");
    });
  });
});
