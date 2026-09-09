import { describe, expect, it } from "vitest";
import { reportFacts } from "./report";
import { sessionAt } from "./session";

describe("report facts", () => {
  it("describe the scripted, reworked run as facts", () => {
    const f = reportFacts(sessionAt("report"));
    expect(f.slipped).toBe(3);
    expect(f.total).toBe(4);
    expect(f.reworked).toEqual(["Q1", "Q2", "Q3"]);
    expect(f.practices).toEqual(["Practice · factorising · Q2 · taken"]);
    expect(f.caution).toEqual([]);
    expect(f.confidence).toMatch(/low when factorising quadratics/);
    expect(f.stars).toEqual(["Q4"]);
  });
});
