import { describe, expect, it } from "vitest";
import { commentaryFor } from "./commentary";
import { sessionAt, sessionReducer } from "./session";

describe("commentary for the individual view", () => {
  it("gives a classmate the fixture's notes as ideas and their scripted clarification", () => {
    const c = commentaryFor("tomas", null);
    expect(c.ideas.map((i) => i.text)).toEqual(["divided by a, not 2a", "scaled two of three terms"]);
    expect(c.ideas[0].problems).toEqual(["q4"]);
    expect(c.clarification).toMatch(/not 2a/);
  });

  it("has nothing for a classmate without notes, and no clarification", () => {
    expect(commentaryFor("priya", null)).toEqual({ ideas: [], clarification: null });
    expect(commentaryFor("nobody", null)).toEqual({ ideas: [], clarification: null });
  });

  it("builds the demo student's ideas from the notes on the steps that didn't hold, one per distinct note", () => {
    const c = commentaryFor("sam", sessionAt("report"));
    expect(c.ideas.length).toBeGreaterThan(0);
    expect(new Set(c.ideas.map((i) => i.text)).size).toBe(c.ideas.length);
    for (const idea of c.ideas) expect(idea.problems.length).toBeGreaterThan(0);
    expect(c.clarification).toBeNull();
  });

  it("shows the demo student's reflection only once the report is sent", () => {
    let s = sessionReducer(sessionAt("report"), { type: "reflection/set", text: "I guessed factor pairs." });
    expect(commentaryFor("sam", s).clarification).toBeNull();
    s = sessionReducer(s, { type: "report/send" });
    expect(commentaryFor("sam", s).clarification).toBe("I guessed factor pairs.");
  });

  it("has nothing for the demo student before a session exists", () => {
    expect(commentaryFor("sam", null)).toEqual({ ideas: [], clarification: null });
  });
});
