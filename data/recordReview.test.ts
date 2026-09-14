import { describe, expect, it } from "vitest";
import type { Classmate } from "./classmates";
import { DEFAULT_GROUPS } from "./groups";
import { classReviewFrom, withReview } from "./recordReview";
import type { Problem } from "./types";

const record = (id: string, done: number, wrong: string[], attempts: Record<string, string[]>): Classmate => ({ id, name: id, initials: id.slice(0, 2).toUpperCase(), confidence: "confident", done, wrong, notes: [], attempts, groupStatus: "done" });
const problems = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"].map((id) => ({ id }) as Problem);

describe("writing review onto the records (tickets 244, 281)", () => {
  // Priya, Amelia, Tomas and Aiden sit in coral, Mia in amber.
  const priya = record("priya", 10, [], {});
  const amelia = record("amelia", 10, ["q6", "q7"], { q6: ["a"], q7: ["b"] });
  const tomas = record("tomas", 7, ["q7"], { q7: ["c"] });
  const mia = record("mia", 10, ["q7"], { q7: ["d"] });
  const review = {
    second: { amelia: { q6: ["fixed"] } },
    groups: { coral: { q6: { solved: true, lines: ["rework"] }, q7: { solved: false, lines: ["the group's own"] }, q8: { solved: true, lines: ["q8 rework"] } } },
  };
  const out = withReview([priya, amelia, tomas, mia], review, problems);

  it("changes nothing but `review`: the first submission, the wrong list and every other field stay as they were", () => {
    out.forEach((r, i) => {
      const { review: added, ...rest } = r;
      void added;
      expect(rest).toEqual([priya, amelia, tomas, mia][i]);
    });
    // A record with nothing to add is the same record.
    expect(out[0]).toBe(priya);
    expect(out[3]).toBe(mia);
    expect(DEFAULT_GROUPS.coral).toEqual(expect.arrayContaining(["priya", "amelia", "tomas"]));
    expect(DEFAULT_GROUPS.amber).toContain("mia");
  });

  it("gives each problem a member brought its second submission and its group's one version, a problem not attempted included (ticket 281)", () => {
    expect(out[1].review).toEqual({ q6: { second: ["fixed"], group: { lines: ["rework"], solved: true } }, q7: { group: { lines: ["the group's own"], solved: false } } });
    // Tomas stopped after Q7, so Q8 is his group's problem too; Priya had it right, so she carries nothing.
    expect(out[2].review).toEqual({ q7: { group: { lines: ["the group's own"], solved: false } }, q8: { group: { lines: ["q8 rework"], solved: true } } });
    expect(out[1].review!.q7.group).toEqual(out[2].review!.q7.group);
    // Copies: changing one member's version never changes another's.
    expect(out[1].review!.q7.group!.lines).not.toBe(out[2].review!.q7.group!.lines);
  });

  it("leaves a student away for the set as they were: in no group", () => {
    const away = withReview([priya, amelia, tomas, mia], review, problems, DEFAULT_GROUPS, ["tomas"]);
    expect(away[2]).toBe(tomas);
    expect(away[1].review).toEqual(out[1].review);
  });

  it("builds a class review from its picks: each covered problem in set order, with each picked student's first submission (ticket 281)", () => {
    expect(classReviewFrom({ q7: ["tomas", "mia"], q6: ["amelia"] }, [priya, amelia, tomas, mia], problems)).toEqual([
      { problem: "q6", examples: [{ student: "amelia", lines: ["a"] }] },
      { problem: "q7", examples: [{ student: "tomas", lines: ["c"] }, { student: "mia", lines: ["d"] }] },
    ]);
  });
});
