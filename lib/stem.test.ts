import { describe, expect, it } from "vitest";
import { stemParts, unbrokenHyphens } from "./stem";
import { assignmentBundle, assignmentIds } from "./assignments";
import { PROBLEMS } from "@/data/assignment";

describe("a diagnostic's question in pieces (ticket 240)", () => {
  it("words then the expression, which takes the question mark", () => {
    expect(stemParts("Which is the factorised form of", "x^2 - 7x + 12")).toEqual([
      { kind: "text", text: "Which is the factorised form of " },
      { kind: "math", tex: "x^2 - 7x + 12", after: "?" },
    ]);
  });

  it("inline maths between dollar signs keeps the punctuation after it, and a stem ending in maths takes the question mark there", () => {
    expect(stemParts("Given that $a = 2$, which is $b$")).toEqual([
      { kind: "text", text: "Given that " },
      { kind: "math", tex: "a = 2", after: "," },
      { kind: "text", text: " which is " },
      { kind: "math", tex: "b", after: "?" },
    ]);
  });

  it("a stem of words alone ends in its question mark", () => {
    expect(stemParts("What does that show")).toEqual([{ kind: "text", text: "What does that show?" }]);
    expect(stemParts("")).toEqual([{ kind: "text", text: "?" }]);
  });
});

describe("a problem's whole question (ticket 271)", () => {
  it("keeps a hyphenated word whole and leaves a minus sign or a dash between words alone", () => {
    expect(unbrokenHyphens("give the x-intercepts and the y-intercept")).toBe("give the x\u2011intercepts and the y\u2011intercept");
    expect(unbrokenHyphens("Problem Set 5 - Features")).toBe("Problem Set 5 - Features");
  });

  it("every problem on every set has words to show beside its expression", () => {
    const sets = assignmentIds(null).map((id) => ({ id, problems: assignmentBundle(id, null)!.problems }));
    for (const { id, problems } of [...sets, { id: "pset-6", problems: PROBLEMS }]) {
      for (const p of problems) expect(p.stem.trim(), `${id} ${p.label}`).not.toBe("");
    }
    expect(sets.length).toBeGreaterThanOrEqual(5);
  });
});
