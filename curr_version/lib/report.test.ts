import { describe, expect, it } from "vitest";
import { reportFacts } from "./report";
import { sessionAt } from "./session";

describe("report facts", () => {
  it("describe the scripted, reworked run as facts", () => {
    const f = reportFacts(sessionAt("report"));
    expect(f.slipped).toBe(5);
    expect(f.total).toBe(10);
    expect(f.reworked).toEqual(["Q1", "Q2", "Q3", "Q7", "Q10"]);
    expect(f.practices).toEqual(["Practice · monic factorising · Q2 · taken"]);
    expect(f.caution).toEqual([]);
    expect(f.confidence).toMatch(/^Confident/);
    expect(f.stars).toEqual(["Q4"]);
  });
});
