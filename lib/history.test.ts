import { describe, expect, it } from "vitest";
import { ALL_SECURE_STUDENT, formatDay, historyWith, parseDay, pillLabel, shortSetName, simulatedDates, simulatedWalk, stepsApart } from "./history";
import { classmateEvidence, hierarchyFor } from "./hierarchy";
import { CLASSMATES } from "@/data/classmates";
import { ASSIGNMENT, PROBLEMS } from "@/data/assignment";
import { CATEGORY_ORDER } from "@/data/taxonomy";
import type { Status } from "@/data/types";

const STATUSES: Status[] = ["gap", "developing", "solid", "secure", "unseen"];

describe("category history (tickets 175, 215)", () => {
  it("steps: red, orange, light green, dark green; a hollow pill is off the ladder", () => {
    expect(stepsApart("gap", "developing")).toBe(1);
    expect(stepsApart("gap", "solid")).toBe(2);
    expect(stepsApart("secure", "gap")).toBe(3);
    expect(stepsApart("unseen", "gap")).toBe(0);
  });

  it("a simulated walk never moves more than one step, lands within one step of its anchor, never hollow, and is the same on every call", () => {
    for (const student of CLASSMATES.map((c) => c.id).filter((id) => id !== ALL_SECURE_STUDENT)) {
      for (const c of CATEGORY_ORDER) {
        for (const anchor of STATUSES) {
          const walk = simulatedWalk(student, c, anchor, 5);
          expect(walk).toHaveLength(5);
          expect(walk).toEqual(simulatedWalk(student, c, anchor, 5));
          expect(stepsApart(walk[4], anchor === "unseen" ? "developing" : anchor)).toBeLessThanOrEqual(1);
          for (let i = 1; i < 5; i++) expect(stepsApart(walk[i - 1], walk[i])).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it("walks vary between students and categories, and no longer shuffle a mix", () => {
    const seen = new Set(CLASSMATES.map((c) => simulatedWalk(c.id, "algebra", "developing", 5).join()));
    expect(seen.size).toBeGreaterThan(3);
    expect(CATEGORY_ORDER.map((c) => simulatedWalk("tomas", c, "developing", 5).join()).some((w, _, all) => w !== all[0])).toBe(true);
  });

  it("the all-secure student is dark green today in every category and dark green on every set behind it", () => {
    const priya = CLASSMATES.find((c) => c.id === ALL_SECURE_STUDENT)!;
    const result = hierarchyFor(classmateEvidence(priya, PROBLEMS), { problems: PROBLEMS, newSkills: ASSIGNMENT.newSkills });
    for (const c of result.columns) {
      expect(result.categories[c]).toBe("secure");
      for (const anchor of STATUSES) expect(simulatedWalk(priya.id, c, anchor, 5).every((s) => s === "secure")).toBe(true);
    }
  });

  it("days: a set's due reads as a day and back; simulated days run from a week before the first set, on weekdays, before it", () => {
    expect(formatDay(parseDay("Mon 7 Sep")!)).toBe("Mon 7 Sep");
    expect(formatDay(parseDay("Tue 25 Aug")!)).toBe("Tue 25 Aug");
    expect(parseDay("soon")).toBeNull();
    expect(simulatedDates("Tue 25 Aug", 5)).toEqual(["Tue 18 Aug", "Wed 19 Aug", "Thu 20 Aug", "Fri 21 Aug", "Mon 24 Aug"]);
    expect(simulatedDates("Tue 25 Aug", 2)).toEqual(["Tue 18 Aug", "Mon 24 Aug"]);
    expect(simulatedDates("Tue 25 Aug", 1)).toEqual(["Tue 18 Aug"]);
    expect(simulatedDates("Tue 25 Aug", 0)).toEqual([]);
  });

  it("a history with no earlier sets is five simulated points; with more than five real results, the last five", () => {
    const set = (n: number, due: string) => ({ set: { id: `s${n}`, short: `PS${n}`, name: `Problem Set ${n}`, due }, status: "solid" as Status });
    expect(historyWith("mia", "algebra", "solid", [], "Mon 7 Sep").every((p) => p.set === null)).toBe(true);
    const many = [set(1, "Tue 25 Aug"), set(2, "Fri 28 Aug"), set(3, "Tue 1 Sep"), set(4, "Fri 4 Sep"), set(5, "Mon 7 Sep"), set(6, "Thu 10 Sep")];
    expect(historyWith("mia", "algebra", "solid", many, "Tue 25 Aug").map(pillLabel)).toEqual(["PS2 · Fri 28 Aug", "PS3 · Tue 1 Sep", "PS4 · Fri 4 Sep", "PS5 · Mon 7 Sep", "PS6 · Thu 10 Sep"]);
  });

  it("short set names", () => {
    expect(shortSetName("Problem Set 5 — Features of a parabola")).toBe("PS5");
    expect(shortSetName("PROBLEM SET 12 — X")).toBe("PS12");
    expect(shortSetName("Quadratics quiz")).toBe("Quadratics");
  });
});
