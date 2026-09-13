import { describe, expect, it } from "vitest";
import { historyWith, parseDay, pillLabel, psetName, stepsApart, type EarlierResult } from "./history";
import type { Status } from "@/data/types";

const result = (n: number, due: string, status: Status = "solid"): EarlierResult => ({ set: { id: `pset-${n}`, name: `Problem Set ${n} — x`, due }, status });

describe("category history (tickets 175, 215, 237)", () => {
  it("steps: red, orange, light green, dark green; a hollow pill is off the ladder", () => {
    expect(stepsApart("gap", "developing")).toBe(1);
    expect(stepsApart("gap", "solid")).toBe(2);
    expect(stepsApart("secure", "gap")).toBe(3);
    expect(stepsApart("unseen", "gap")).toBe(0);
  });

  it("a set's due reads as a day", () => {
    expect(parseDay("Mon 7 Sep")).toBe(Date.UTC(2026, 8, 7));
    expect(parseDay("Tue 25 Aug")).toBeLessThan(parseDay("Mon 7 Sep")!);
    expect(parseDay("soon")).toBeNull();
  });

  it("only real sets: none is an empty history, fewer than five stay fewer, more than five keep the last five", () => {
    expect(historyWith([])).toEqual([]);
    const two = historyWith([result(4, "Fri 4 Sep", "developing"), result(5, "Mon 7 Sep", "gap")]);
    expect(two.map((p) => [p.set.id, p.date, p.status])).toEqual([
      ["pset-4", "Fri 4 Sep", "developing"],
      ["pset-5", "Mon 7 Sep", "gap"],
    ]);
    const many = [result(1, "Tue 25 Aug"), result(2, "Fri 28 Aug"), result(3, "Tue 1 Sep"), result(4, "Fri 4 Sep"), result(5, "Mon 7 Sep"), result(6, "Thu 10 Sep")];
    expect(historyWith(many).map((p) => p.set.id)).toEqual(["pset-2", "pset-3", "pset-4", "pset-5", "pset-6"]);
  });

  it("a pill reads its day alone (ticket 237)", () => {
    expect(historyWith([result(5, "Mon 7 Sep")]).map(pillLabel)).toEqual(["Mon 7 Sep"]);
  });

  it("the way back names the set as PSet N", () => {
    expect(psetName("Problem Set 6 — Roots of a quadratic")).toBe("PSet 6");
    expect(psetName("PROBLEM SET 12 — X")).toBe("PSet 12");
    expect(psetName("Quadratics quiz")).toBe("Quadratics quiz");
  });
});
