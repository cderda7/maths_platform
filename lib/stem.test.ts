import { describe, expect, it } from "vitest";
import { stemParts } from "./stem";

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
