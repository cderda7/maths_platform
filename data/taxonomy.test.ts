import { describe, expect, it, vi } from "vitest";
import { ALL_GROUPS, ALL_LEAVES, CATEGORY_ORDER, categoryOf, groupOf, groupsOf, HOME_CATEGORIES, isLeafId, LEAF_ALIASES, leafName, leavesOf, resolveLeaf } from "./taxonomy";

describe("taxonomy", () => {
  it("has seven home categories in canonical order, then the New skills column", () => {
    expect(HOME_CATEGORIES).toEqual(["algebra", "functions", "graphing", "communication", "reasoning", "stats", "calculus"]);
    expect(CATEGORY_ORDER).toEqual([...HOME_CATEGORIES, "new"]);
    expect(groupsOf("new")).toEqual([]);
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

  it("every skill has one home: the old Unit Focus leaves live in their homes, and their old ids resolve there (ticket 209)", () => {
    expect(categoryOf("functions.zeros.nfl")).toBe("functions");
    expect(groupOf("algebra.equations.discriminant")).toBe("algebra.equations");
    expect(groupOf("algebra.expand-factor.binomial")).toBe("algebra.expand-factor");
    expect(isLeafId("algebra.number.surds")).toBe(true);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(resolveLeaf("unit.u1.nfl")).toBe("functions.zeros.nfl");
    expect(resolveLeaf("unit.u1.discriminant")).toBe("algebra.equations.discriminant");
    expect(resolveLeaf("unit.u1.binomial")).toBe("algebra.expand-factor.binomial");
    // Special products merged into the binomial identity: one leaf for the same facts.
    expect(isLeafId("algebra.expand-factor.special")).toBe(false);
    expect(resolveLeaf("algebra.expand-factor.special")).toBe("algebra.expand-factor.binomial");
    for (const [old, now] of Object.entries(LEAF_ALIASES)) {
      expect(isLeafId(old), old).toBe(false);
      expect(isLeafId(now), now).toBe(true);
    }
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
    // No two leaves share a name: a skill is in one place.
    const names = ALL_LEAVES.map((l) => leafName(l).name);
    expect(new Set(names).size).toBe(names.length);
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
  it("New skills is drawn with two layers and named New skills", async () => {
    const { categoryName, isFlat } = await import("./taxonomy");
    expect(isFlat("new")).toBe(true);
    expect(isFlat("algebra")).toBe(false);
    expect(categoryName("new")).toEqual({ name: "New skills", short: "New skills" });
    expect(categoryName("algebra").name).toBe("Algebra");
  });
});
