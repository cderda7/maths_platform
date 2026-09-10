import { describe, expect, it } from "vitest";
import { skipFixture, SKIP_TARGETS } from "./demo";
import { isDue, isPending, isProjecting } from "./classroom";
import { INITIAL_SESSION } from "./session";
import { classReadiness, LAST_ARRIVAL_MS } from "./readiness";

describe("skip-to fixtures", () => {
  const now = 1_700_000_000_000;

  it("every target lands on its stage with the three-stage pathway and, except whole-class, no projection", () => {
    const stages = { start: "overview", "warm-up": "warmup-pick", working: "working", "indiv review": "feedback", "class wait": "class-wait", "group review": "group-pass", "whole-class review": "frozen", report: "report" } as const;
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
    for (const t of ["class wait", "group review", "whole-class review", "report"] as const) expect(skipFixture(t, now).session.lines).toEqual(a);
  });

  it("the class-wait jump has Sam just arrived and the count climbing; the later jumps have everyone in", () => {
    const wait = skipFixture("class wait", now).classroom;
    expect(classReadiness(wait, now).handedIn).toBe(1);
    expect(classReadiness(wait, now).started).toBe(false);
    expect(classReadiness(wait, now + LAST_ARRIVAL_MS).started).toBe(true);
    for (const t of ["group review", "whole-class review", "report"] as const) expect(classReadiness(skipFixture(t, now).classroom, now).started, t).toBe(true);
  });

  it("the whole-class jump projects the two most-struggled problems with examples, the grace already over", () => {
    const { classroom } = skipFixture("whole-class review", now);
    expect(classroom.wholeClass?.problems).toHaveLength(2);
    for (const id of classroom.wholeClass!.problems) expect(classroom.wholeClass!.examples[id].length).toBeGreaterThanOrEqual(2);
    expect(isPending(classroom, now)).toBe(false);
    expect(isDue(classroom, now)).toBe(true);
  });
});
