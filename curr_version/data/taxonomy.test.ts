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

describe("names tell groups and skills apart", () => {
  it("no skill shares its name or short name with its group, or with any category", async () => {
    const { ALL_LEAVES, ALL_GROUPS, CATEGORY_ORDER, categoryName, groupName, groupOf, leafName } = await import("./taxonomy");
    const groupNames = new Set(ALL_GROUPS.flatMap((g) => [groupName(g).name, groupName(g).short].map((n) => n.toLowerCase())));
    const catNames = new Set(CATEGORY_ORDER.flatMap((c) => [categoryName(c).name, categoryName(c).short].map((n) => n.toLowerCase())));
    for (const l of ALL_LEAVES) {
      const own = [groupName(groupOf(l)).name, groupName(groupOf(l)).short].map((n) => n.toLowerCase());
      for (const n of [leafName(l).name, leafName(l).short].map((x) => x.toLowerCase())) {
        expect(own, l).not.toContain(n);
        expect(groupNames.has(n), `${l} reuses a group name: ${n}`).toBe(false);
        expect(catNames.has(n), `${l} reuses a category name: ${n}`).toBe(false);
      }
    }
  });
});

describe("flat categories", () => {
  it("Unit Focus is drawn with two layers and named after the confirmed unit", async () => {
    const { FLAT_CATEGORIES, categoryLabel, isFlat } = await import("./taxonomy");
    expect(FLAT_CATEGORIES).toEqual(["unit"]);
    expect(isFlat("unit")).toBe(true);
    expect(isFlat("algebra")).toBe(false);
    expect(categoryLabel("unit", 1)).toEqual({ name: "Unit 1", short: "Unit 1" });
    expect(categoryLabel("unit", 3).short).toBe("Unit 3");
    expect(categoryLabel("algebra", 1).name).toBe("Algebra");
  });
});
