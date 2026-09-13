import { describe, expect, it } from "vitest";
import { ASSIGNMENT } from "@/data/assignment";
import { crumbTitle } from "./crumbTitle";

describe("crumbTitle", () => {
  it("shortens the live set's title to PSET", () => {
    expect(crumbTitle(ASSIGNMENT.title)).toBe("PSET 6 — ROOTS OF A QUADRATIC");
  });

  it("shortens any Problem Set number, whatever the case", () => {
    expect(crumbTitle("PROBLEM SET 1 — SURDS")).toBe("PSET 1 — SURDS");
    expect(crumbTitle("Problem Set 12 — Roots of a quadratic")).toBe("PSET 12 — Roots of a quadratic");
  });

  it("leaves other titles alone", () => {
    expect(crumbTitle("Quadratics warm-up")).toBe("Quadratics warm-up");
    expect(crumbTitle("My problem set 3")).toBe("My problem set 3");
  });
});
