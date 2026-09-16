import { describe, expect, it } from "vitest";
import { ASSIGNMENT } from "@/data/assignment";
import { CLASSMATE_MAP } from "@/data/classmates";
import { Q7_LOST_THIRD } from "@/data/slips";
import { explainableAt, groupPlan, recordReviewProblems, reviewProblemsOf } from "./group";
import { canExplain, fixedInIndividualReview, recordWork, sessionWork, stillToReview, toReview, unionOfMembers } from "./reviewUnion";
import { sessionAt, sessionReducer, type StudentSession } from "./session";

/**
 * Ticket 332's two rules: which questions a member brings to their group once individual review is over, and who at the
 * table can explain one.
 */
const solution = (pid: string) => ASSIGNMENT.problems.find((p) => p.id === pid)!.solution.map((s) => s.tex);

describe("a member's questions after individual review (ticket 332)", () => {
  // A record on Q1–Q6: Q1 right first time; Q2 wrong and fixed; Q3 wrong and wrong again; Q4 wrong, never rewritten; Q5 started and left; Q6 never reached.
  const record = {
    done: 4,
    wrong: ["q2", "q3", "q4", "q5"],
    review: { q2: { second: solution("q2") }, q3: { second: ["(x - 3)(x + 2) = 6", "x - 3 = 6 \\;\\text{or}\\; x + 2 = 6", "x = 9 \\;\\text{or}\\; x = 4"] } },
  };
  const work = (pid: string) => recordWork(record, ASSIGNMENT.problems, pid);

  it("right first time stays out; fixed in individual review stays out; wrong again, never rewritten, incomplete and not attempted all go to the group", () => {
    expect(["q1", "q2", "q3", "q4", "q5", "q6"].map((pid) => [pid, stillToReview(pid, work(pid), true)])).toEqual([
      ["q1", false],
      ["q2", false],
      ["q3", true],
      ["q4", true],
      ["q5", true],
      ["q6", true],
    ]);
    expect(fixedInIndividualReview("q2", work("q2"))).toBe(true);
    expect(fixedInIndividualReview("q3", work("q3"))).toBe(false);
    // A second submission never makes a question right first time: the set score is untouched.
    expect(work("q2").rightFirstTime).toBe(false);
  });

  it("on a pathway without individual review, first submissions decide: the fix does not count (ticket 278)", () => {
    expect(stillToReview("q2", work("q2"), false)).toBe(true);
    expect(toReview(ASSIGNMENT.problems, work, false)).toEqual(["q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"]);
    expect(toReview(ASSIGNMENT.problems, work, true)).toEqual(["q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"]);
  });

  it("the demo student: his rework fixes Q1–Q3 and Q10; Q7 slipped again and Q9 stayed unfinished, so those two go on", () => {
    const s = sessionAt("group");
    expect(reviewProblemsOf(s, true)).toEqual(["q7", "q9"]);
    expect(reviewProblemsOf(s, false)).toEqual(["q1", "q2", "q3", "q7", "q9", "q10"]);
    expect(sessionWork(s, "q4").rightFirstTime).toBe(true);
    expect(fixedInIndividualReview("q1", sessionWork(s, "q1"))).toBe(true);
    // Finishing Q9 in individual review takes it out too.
    const finished: StudentSession = sessionReducer({ ...s, stage: "feedback" }, { type: "rework/reveal", problem: "q9", line: { tex: "h = -9 + 18 = 9", strokeCount: 5 } });
    expect(reviewProblemsOf(finished, true)).toEqual(["q7"]);
  });

  it("Problem Set 6's sky classmates after individual review", () => {
    expect(recordReviewProblems(CLASSMATE_MAP.jordan, true)).toEqual(["q7", "q8", "q9", "q10"]);
    expect(recordReviewProblems(CLASSMATE_MAP.zara, true)).toEqual(["q7", "q9"]);
    expect(recordReviewProblems(CLASSMATE_MAP.liam, true)).toEqual(["q1", "q2", "q3", "q5", "q6", "q7", "q8", "q9", "q10"]);
    expect(recordReviewProblems(CLASSMATE_MAP.priya, true)).toEqual(["q8"]); // ticket 347: Priya's one slip, its rework slipped again
    expect(recordReviewProblems(CLASSMATE_MAP.aiden, true)).toEqual(["q8"]); // Q7 fixed in individual review; Q8 did not
  });

  it("an absent member brings nothing: the group's union is the present members' alone", () => {
    const s = sessionAt("group");
    expect(groupPlan(s, [], true).discussion.problems.map((p) => p.id)).toEqual(["q1", "q2", "q3", "q5", "q6", "q7", "q8", "q9", "q10"]);
    // Liam away: nobody present still has Q1–Q3, Q5 or Q6.
    expect(groupPlan(s, ["liam"], true).discussion.problems.map((p) => p.id)).toEqual(["q7", "q8", "q9", "q10"]);
    // Everyone but Sam away: his two.
    expect(groupPlan(s, ["liam", "jordan", "zara"], true).discussion.problems.map((p) => p.id)).toEqual(["q7", "q9"]);
    expect(unionOfMembers(ASSIGNMENT.problems, [[], []])).toEqual([]);
  });
});

describe("who can explain a question (ticket 332)", () => {
  const rightFirst = { rightFirstTime: true, second: [] };
  const fixer = { rightFirstTime: false, second: solution("q7") };
  const wrongAgain = { rightFirstTime: false, second: Q7_LOST_THIRD };
  const nothing = { rightFirstTime: false, second: [] };

  it("a member right first time, or one who fixed it in individual review; not one whose rewrite slipped again, nor one with no rewrite", () => {
    expect(canExplain("q7", rightFirst, true)).toBe(true);
    expect(canExplain("q7", fixer, true)).toBe(true);
    expect(canExplain("q7", wrongAgain, true)).toBe(false);
    expect(canExplain("q7", nothing, true)).toBe(false);
    // Without individual review only right first time explains.
    expect(canExplain("q7", fixer, false)).toBe(false);
    expect(canExplain("q7", rightFirst, false)).toBe(true);
  });

  it("at the sky table: Jordan and Zara right first time on Q1, Sam a fixer on Q10 beside Zara, and nobody on Q7 or Q9", () => {
    const s = sessionAt("group");
    const table = ["sam", "jordan", "zara", "liam"];
    expect(explainableAt(table, s, true, "q1")).toBe(true);
    // Q10 with Zara away: Sam's fix alone explains it.
    expect(explainableAt(["sam", "jordan", "liam"], s, true, "q10")).toBe(true);
    expect(explainableAt(["sam", "jordan", "liam"], s, false, "q10")).toBe(false);
    expect(explainableAt(table, s, true, "q7")).toBe(false);
    expect(explainableAt(table, s, true, "q9")).toBe(false);
  });
});
