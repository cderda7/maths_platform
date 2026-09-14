import { describe, expect, it } from "vitest";
import { ASSIGNMENT } from "@/data/assignment";
import { FINISHED_SETS } from "./finishedSets";
import { reviewProblemsOf } from "./group";
import { outcomeOf, recordReviews } from "./report";
import { recordScore, sessionScore, setScoreText } from "./setScore";
import { sessionAt, type StudentSession } from "./session";

const PS5 = FINISHED_SETS.find((s) => s.fixture.id === "pset-5")!;
const scoreOf = (id: string) => {
  const r = [PS5.sam, ...PS5.classmates].find((m) => m.id === id)!;
  return recordScore(r, PS5.fixture.problems);
};

describe("a student's score on a set (ticket 285)", () => {
  it("Problem Set 5: right on the first submission, not what review fixed", () => {
    // Sam wrote all ten and slipped on Q4, Q6 and Q9, each fixed on his own rework: 7, not 10.
    expect(scoreOf("sam")).toBe(7);
    expect(scoreOf("priya")).toBe(10);
    expect(scoreOf("jordan")).toBe(6);
    expect(scoreOf("tomas")).toBe(3);
    expect(scoreOf("grace")).toBe(7);
    expect(scoreOf("oliver")).toBe(6);
    expect(scoreOf("aiden")).toBe(9);
    expect(scoreOf("liam")).toBe(0);
  });

  it("every finished record: the report's Correct first try, whatever review fixed after", () => {
    for (const set of FINISHED_SETS) {
      for (const r of [set.sam, ...set.classmates]) {
        const reviews = recordReviews(r, set.fixture.problems);
        const first = set.fixture.problems.filter((p) => outcomeOf(p.id, reviews[p.id], set.pathway) === "first").length;
        expect(recordScore(r, set.fixture.problems), `${set.fixture.id} ${r.id}`).toBe(first);
      }
    }
  });

  it("the live student: the problems he finished with no wrong line, the same rule as group review's union", () => {
    for (const run of ["weak", "strong"] as const) {
      const s = sessionAt("feedback", run);
      expect(sessionScore(s, ASSIGNMENT.problems), run).toBe(ASSIGNMENT.problems.length - reviewProblemsOf(s).length);
    }
  });

  it("the live student's rework does not count", () => {
    const s = sessionAt("feedback", "weak");
    const before = sessionScore(s, ASSIGNMENT.problems);
    const fixed: StudentSession = { ...s, rework: Object.fromEntries(ASSIGNMENT.problems.map((p) => [p.id, p.solution.map((l) => ({ tex: l.tex }) as StudentSession["lines"][string][number])])) };
    expect(sessionScore(fixed, ASSIGNMENT.problems)).toBe(before);
    expect(before).toBeLessThan(ASSIGNMENT.problems.length);
  });

  it("a started problem with no answer and an unattempted one both count against it", () => {
    const [p] = ASSIGNMENT.problems;
    const first = p.solution.slice(0, 1).map((l) => ({ tex: l.tex }) as StudentSession["lines"][string][number]);
    const all = p.solution.map((l) => ({ tex: l.tex }) as StudentSession["lines"][string][number]);
    expect(sessionScore({ lines: {}, answers: {} }, [p])).toBe(0);
    expect(sessionScore({ lines: { [p.id]: all }, answers: {} }, [p])).toBe(1);
    if (p.solution.length > 1) expect(sessionScore({ lines: { [p.id]: first }, answers: {} }, [p])).toBe(0);
  });

  it("the column reads a score once handed in, a dash while still on the set", () => {
    expect(setScoreText({ kind: "submitted" }, 7, 10)).toBe("7/10");
    expect(setScoreText({ kind: "not-started" }, 0, 10)).toBe("—");
    expect(setScoreText({ kind: "warming-up" }, 0, 10)).toBe("—");
    expect(setScoreText({ kind: "working", label: "Q4" }, 3, 10)).toBe("—");
  });
});
