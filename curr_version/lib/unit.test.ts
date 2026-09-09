import { describe, expect, it } from "vitest";
import { PROBLEMS } from "@/data/assignment";
import { inferUnitFromProblems, inferUnitFromText } from "./unit";

describe("unit inference", () => {
  it("reads the unit off the tagged Unit Focus leaves, Unit 1 by default", () => {
    expect(inferUnitFromProblems(PROBLEMS)).toBe(1);
    expect(inferUnitFromProblems([])).toBe(1);
  });

  it("re-infers from the teacher's words by keyword", () => {
    const table: [string, number][] = [
      ["mostly the chain rule and rates of change", 3],
      ["exponential growth and log laws", 2],
      ["sampling a distribution", 4],
      ["factorising and the null factor law", 1],
      ["", 1],
    ];
    for (const [text, unit] of table) expect(inferUnitFromText(text), text).toBe(unit);
  });
});
