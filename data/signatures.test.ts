import { describe, expect, it } from "vitest";
import { MISCONCEPTION_IDS } from "./misconceptions";
import { FAMILIES, FAMILY_IDS, familyOf } from "./signatures";

/** The error families over the misconception taxonomy (ticket 303). */
describe("error families (ticket 303)", () => {
  it("place every misconception in exactly one family, and name nothing outside the taxonomy", () => {
    const placed = FAMILY_IDS.flatMap((f) => FAMILIES[f].misconceptions as readonly string[]);
    expect(new Set(placed).size, "a misconception in two families").toBe(placed.length);
    expect([...placed].sort()).toEqual([...MISCONCEPTION_IDS].sort());
  });

  it("keep communication patterns (no misconception) in steps, the one family without misconceptions", () => {
    expect(familyOf(null)).toBe("steps");
    expect(FAMILY_IDS.filter((f) => FAMILIES[f].misconceptions.length === 0)).toEqual(["steps"]);
  });

  it("say what is wrong, never why", () => {
    const WHY = /guess|rush|careless|without checking|not checked|to check\b|copied|tried|\bhope|confiden/i;
    for (const f of FAMILY_IDS) {
      expect(FAMILIES[f].name, f).not.toMatch(WHY);
      expect(FAMILIES[f].gloss, f).not.toMatch(WHY);
    }
  });
});
