import { describe, expect, it } from "vitest";
import { skipFixture, SKIP_TARGETS } from "./demo";
import { isDue, isPending, isProjecting } from "./classroom";
import { INITIAL_SESSION } from "./session";

describe("skip-to fixtures", () => {
  const now = 1_700_000_000_000;

  it("every target lands on its stage with the three-stage pathway and, except whole-class, no projection", () => {
    const stages = { start: "overview", "warm-up": "warmup-pick", working: "working", "indiv review": "feedback", "group review": "group-pass", "whole-class review": "frozen", report: "report" } as const;
    for (const t of SKIP_TARGETS) {
      const { session, classroom } = skipFixture(t, now);
      expect(session.stage, t).toBe(stages[t]);
      expect(classroom.assignment?.pathway, t).toEqual(["individual", "group", "whole-class"]);
      expect(isProjecting(classroom), t).toBe(t === "whole-class review");
    }
    expect(skipFixture("start", now).session).toEqual(INITIAL_SESSION);
  });

  it("what Sam submitted is the same at every review stage", () => {
    const a = skipFixture("indiv review", now).session.lines;
    for (const t of ["group review", "whole-class review", "report"] as const) expect(skipFixture(t, now).session.lines).toEqual(a);
  });

  it("the whole-class jump projects the two most-struggled problems with examples, the grace already over", () => {
    const { classroom } = skipFixture("whole-class review", now);
    expect(classroom.wholeClass?.problems).toHaveLength(2);
    for (const id of classroom.wholeClass!.problems) expect(classroom.wholeClass!.examples[id].length).toBeGreaterThanOrEqual(2);
    expect(isPending(classroom, now)).toBe(false);
    expect(isDue(classroom, now)).toBe(true);
  });
});
