import { describe, expect, it } from "vitest";
import { reviewGroups } from "./groups";
import { sessionAt, sessionReducer } from "./session";

describe("teacher's review groups view", () => {
  it("the demo group carries one shared note about why it formed", () => {
    const [g1] = reviewGroups(sessionAt("group-discuss"));
    expect(g1.members.map((m) => m.id)).toEqual(["sam", "jordan", "zara", "liam"]);
    expect(g1.discussing).toEqual(["q1", "q2", "q3"]);
    expect(g1.note).toMatch(/Q1, Q2, Q3/);
    expect(g1.note).toMatch(/factorising and algebra/);
    expect(g1.members[0].live).toBe(true);
  });

  it("the demo student's line follows the session; classmates' lines are static", () => {
    let s = sessionAt("group-pass");
    expect(reviewGroups(s)[0].members[0].status).toBe("In the quick pass");
    s = sessionReducer(s, { type: "group/discuss" });
    expect(reviewGroups(s)[0].members[0].status).toBe("Discussing Q1 · 0 of 3 talked through");
    s = sessionReducer(s, { type: "group/talked", problem: "q1" });
    expect(reviewGroups(s)[0].members[0].status).toBe("Discussing Q2 · 1 of 3 talked through");
    s = sessionReducer(s, { type: "group/done" });
    expect(reviewGroups(s)[0].members[0].status).toBe("Finished");
    expect(reviewGroups(s)[0].members[1].status).toMatch(/Discussing Q2/);
  });

  it("other groups are static and get a note of their own", () => {
    const groups = reviewGroups(null);
    expect(groups.length).toBe(2);
    expect(groups[1].members.map((m) => m.id)).toEqual(["priya", "amelia", "tomas"]);
    expect(groups[1].discussing).toEqual(["q3", "q4"]);
    expect(groups[0].members[0].status).toBe("Not started");
  });
});
