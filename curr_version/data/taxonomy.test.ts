import { describe, expect, it, vi } from "vitest";
import { ALL_GROUPS, ALL_LEAVES, CATEGORY_ORDER, categoryOf, groupOf, groupsOf, isLeafId, leafName, leavesOf, resolveLeaf, unitOf } from "./taxonomy";

describe("taxonomy", () => {
  it("has seven categories in canonical order", () => {
    expect(CATEGORY_ORDER).toEqual(["algebra", "functions", "graphing", "communication", "reasoning", "stats", "unit"]);
  });

  it("every leaf round-trips to its group and category, and names resolve", () => {
    for (const l of ALL_LEAVES) {
      const g = groupOf(l);
      expect(ALL_GROUPS).toContain(g);
      expect(leavesOf(g)).toContain(l);
      expect(groupsOf(categoryOf(l))).toContain(g);
      expect(categoryOf(g)).toBe(categoryOf(l));
      expect(leafName(l).short.length).toBeGreaterThan(0);
    }
    expect(ALL_LEAVES.length).toBeGreaterThan(25);
  });

  it("an unknown id is dropped with one warning, never a throw", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(isLeafId("algebra.equations.quadratic")).toBe(true);
    expect(isLeafId("algebra.nope")).toBe(false);
    expect(resolveLeaf("algebra.nope.x")).toBeNull();
    expect(resolveLeaf("algebra.nope.x")).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it("unit focus leaves know their unit", () => {
    expect(unitOf("unit.u1.nfl")).toBe(1);
    expect(unitOf("unit.u3.chain")).toBe(3);
    expect(unitOf("algebra.number.fractions")).toBeNull();
  });
});
