import { describe, expect, it } from "vitest";
import { sessionAt } from "./session";
import { alignVersions, changedRowCount, rowChanged, versionsOf } from "./versions";

describe("submission history", () => {
  it("the final version is the rework where there is one, otherwise the handed-in lines", () => {
    const [original, final] = versionsOf(sessionAt("history"));
    expect(original.lines.q1.map((l) => l.tex)[1]).toBe("(x + 2)(x + 3) = 0");
    expect(final.lines.q1.map((l) => l.tex)[0]).toBe("(x - 2)(x - 3) = 0");
    expect(final.lines.q4).toEqual(original.lines.q4);
    expect(original.at).toBeGreaterThan(0);
    expect(final.at).toBeGreaterThan(original.at);
  });

  it("aligns the two versions line for line, padding the shorter problem", () => {
    const [original, final] = versionsOf(sessionAt("history"));
    const aligned = alignVersions(original, final);
    const q2 = aligned.find((a) => a.problem.id === "q2")!;
    expect(q2.rows.length).toBe(5);
    expect(q2.rows[4].left).toBeNull();
    expect(q2.rows[4].right?.tex).toContain("tfrac");
    expect(q2.changed).toBe(true);
    const q4 = aligned.find((a) => a.problem.id === "q4")!;
    expect(q4.changed).toBe(false);
    expect(q4.rows.every((r) => r.left && r.right)).toBe(true);
  });
});

describe("before / after", () => {
  it("counts the lines that changed between handed-in and final", () => {
    const [original, final] = versionsOf(sessionAt("history"));
    const aligned = alignVersions(original, final);
    // Q1: 3 rows all differ; Q2: 5 rows all differ; Q3: 4 rows all differ; Q4: unchanged.
    expect(changedRowCount(aligned)).toBe(12);
    expect(aligned.find((a) => a.problem.id === "q4")!.rows.some(rowChanged)).toBe(false);
  });
});
