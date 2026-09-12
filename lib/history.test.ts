import { describe, expect, it } from "vitest";
import { ALL_SECURE_STUDENT, HISTORY_DATES, historyFor } from "./history";
import { classmateEvidence, hierarchyFor } from "./hierarchy";
import { CLASSMATES } from "@/data/classmates";
import { PROBLEMS } from "@/data/assignment";
import { CATEGORY_ORDER } from "@/data/taxonomy";
import type { Status } from "@/data/types";

const count = (points: { status: Status }[], s: Status) => points.filter((p) => p.status === s).length;

describe("category history (ticket 175)", () => {
  it("gives five dated points, oldest first, the same on every call", () => {
    const h = historyFor("tomas", "algebra", "gap");
    expect(h.map((p) => p.date)).toEqual([...HISTORY_DATES]);
    expect(h).toEqual(historyFor("tomas", "algebra", "gap"));
  });

  it("draws a mix around today's status: red is red and orange, orange mostly orange, light green a three-way mix, dark green mostly dark green", () => {
    for (const student of CLASSMATES.map((c) => c.id).filter((id) => id !== ALL_SECURE_STUDENT)) {
      for (const c of CATEGORY_ORDER) {
        const gap = historyFor(student, c, "gap");
        expect(count(gap, "gap") + count(gap, "developing")).toBe(5);
        expect(count(gap, "gap")).toBeGreaterThanOrEqual(2);
        const dev = historyFor(student, c, "developing");
        expect(count(dev, "developing")).toBeGreaterThanOrEqual(2);
        expect(count(dev, "secure")).toBe(0);
        const solid = historyFor(student, c, "solid");
        expect(count(solid, "gap")).toBe(0);
        expect(count(solid, "solid")).toBeGreaterThanOrEqual(1);
        expect(count(solid, "developing") + count(solid, "secure")).toBeGreaterThanOrEqual(2);
        const secure = historyFor(student, c, "secure");
        expect(count(secure, "secure")).toBeGreaterThanOrEqual(3);
        expect(count(secure, "secure") + count(secure, "solid")).toBe(5);
        for (const s of ["gap", "developing", "solid", "secure", "unseen"] as Status[]) expect(count(historyFor(student, c, s), "unseen")).toBe(0);
      }
    }
  });

  it("differs between students and categories", () => {
    const seen = new Set(CLASSMATES.map((c) => historyFor(c.id, "algebra", "developing").map((p) => p.status).join()));
    expect(seen.size).toBeGreaterThan(3);
    expect(historyFor("tomas", "algebra", "developing")).not.toEqual(historyFor("tomas", "graphing", "developing"));
  });

  it("the all-secure student is dark green today in every category and dark green on every set behind it", () => {
    const priya = CLASSMATES.find((c) => c.id === ALL_SECURE_STUDENT)!;
    const result = hierarchyFor(classmateEvidence(priya, PROBLEMS), PROBLEMS);
    for (const c of result.columns) {
      expect(result.categories[c]).toBe("secure");
      expect(historyFor(priya.id, c, "secure").every((p) => p.status === "secure")).toBe(true);
    }
  });
});
