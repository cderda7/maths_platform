import { describe, expect, it } from "vitest";
import { branchesOf } from "./branches";
import { RECOGNITION } from "@/data/recognition";

describe("branchesOf", () => {
  it("matches the fixture's own spelling of 'or'", () => {
    expect(branchesOf(RECOGNITION.q2[2])).toEqual(["2x + 4 = 0", "x - 1 = 0"]);
    expect(branchesOf(RECOGNITION.q2[3])).toEqual(["x = -2", "x = 1"]);
  });
  it("splits a two-case line on its 'or'", () => {
    expect(branchesOf("x = -2 \\;\\text{or}\\; x = 1")).toEqual(["x = -2", "x = 1"]);
    expect(branchesOf("2x + 4 = 0 \\;\\text{or}\\; x - 1 = 0")).toEqual(["2x + 4 = 0", "x - 1 = 0"]);
    expect(branchesOf("x = \\tfrac{1}{2} \\;\\text{or}\\; x = -4")).toEqual(["x = \\tfrac{1}{2}", "x = -4"]);
  });
  it("leaves a plain line, an implication, and anything with more than two cases whole", () => {
    expect(branchesOf("x^2 - 5x + 6 = 0")).toEqual(["x^2 - 5x + 6 = 0"]);
    expect(branchesOf("(x - 4)(x + 2) = 0 \\Rightarrow x = 4 \\;\\text{or}\\; x = -2")).toEqual(["(x - 4)(x + 2) = 0 \\Rightarrow x = 4 \\;\\text{or}\\; x = -2"]);
    expect(branchesOf("a \\;\\text{or}\\; b \\;\\text{or}\\; c")).toEqual(["a \\;\\text{or}\\; b \\;\\text{or}\\; c"]);
  });
});
