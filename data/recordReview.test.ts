import { describe, expect, it } from "vitest";
import type { Classmate } from "./classmates";
import { DEFAULT_GROUPS } from "./groups";
import { withReview } from "./recordReview";

const record = (id: string, wrong: string[], attempts: Record<string, string[]>): Classmate => ({ id, name: id, initials: id.slice(0, 2).toUpperCase(), confidence: "confident", done: 10, wrong, notes: [], attempts, groupStatus: "done" });

describe("writing review onto the records (ticket 244)", () => {
  // Priya and Amelia sit in coral, Mia in amber.
  const priya = record("priya", [], {});
  const amelia = record("amelia", ["q6", "q7"], { q6: ["a"], q7: ["b"] });
  const tomas = record("tomas", ["q7"], { q7: ["c"] });
  const mia = record("mia", ["q7"], { q7: ["d"] });
  const out = withReview([priya, amelia, tomas, mia], {
    second: { amelia: { q6: ["fixed"] } },
    groups: { coral: { q6: { solved: true, lines: ["rework"] }, q7: { solved: false, firstOf: "tomas" } } },
  });

  it("changes nothing but `review`: the first submission, the wrong list and every other field stay as they were", () => {
    out.forEach((r, i) => {
      const { review, ...rest } = r;
      void review;
      expect(rest).toEqual([priya, amelia, tomas, mia][i]);
    });
    // A record with nothing to add is the same record.
    expect(out[0]).toBe(priya);
    expect(out[3]).toBe(mia);
    expect(DEFAULT_GROUPS.coral).toEqual(expect.arrayContaining(["priya", "amelia", "tomas"]));
    expect(DEFAULT_GROUPS.amber).toContain("mia");
  });

  it("gives each wrong problem its second submission and its group's one version, a last try read from that member's first submission", () => {
    expect(out[1].review).toEqual({ q6: { second: ["fixed"], group: { lines: ["rework"], solved: true } }, q7: { group: { lines: ["c"], solved: false } } });
    expect(out[2].review).toEqual({ q7: { group: { lines: ["c"], solved: false } } });
    expect(out[1].review!.q7.group).toEqual(out[2].review!.q7.group);
    // Copies: changing one member's version never changes another's.
    expect(out[1].review!.q7.group!.lines).not.toBe(out[2].review!.q7.group!.lines);
  });
});
