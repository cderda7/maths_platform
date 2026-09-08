import { describe, expect, it } from "vitest";
import { isCorrect } from "./diagnostic";

describe("diagnostic correctness", () => {
  it("knows the right option", () => {
    expect(isCorrect("d-factor-check", "b")).toBe(true);
    expect(isCorrect("d-factor-check", "a")).toBe(false);
    expect(isCorrect("nope", "b")).toBe(false);
  });
});
