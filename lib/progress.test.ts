import { describe, expect, it } from "vitest";
import { ASSIGNMENT } from "@/data/assignment";
import { classmateProgress, isSubmitted, progressTag, sessionProgress } from "./progress";
import { INITIAL_SESSION, sessionAt, type StudentSession } from "./session";

const P = ASSIGNMENT.problems;
const line = (tex: string) => ({ tex }) as StudentSession["lines"][string][number];

describe("a student's progress on the set", () => {
  it("names the row: warming up, the problem in progress, nothing once handed in or before starting", () => {
    expect(progressTag({ kind: "warming-up" })).toBe("warming up");
    expect(progressTag({ kind: "working", label: "Q4" })).toBe("Q4 in progress");
    expect(progressTag({ kind: "submitted" })).toBeNull();
    expect(progressTag({ kind: "not-started" })).toBeNull();
  });

  it("the live student: not started on the overview, warming up from the check-in to the warm-up, handed in after", () => {
    expect(sessionProgress(null, P)).toEqual({ kind: "not-started" });
    expect(sessionProgress(INITIAL_SESSION, P)).toEqual({ kind: "not-started" });
    for (const stage of ["confidence", "warmup-chat", "practice"] as const) expect(sessionProgress({ ...INITIAL_SESSION, stage }, P)).toEqual({ kind: "warming-up" });
    for (const stage of ["feedback", "class-wait", "group", "report"] as const) expect(isSubmitted(sessionProgress({ ...INITIAL_SESSION, stage }, P))).toBe(true);
  });

  it("on the set, the first problem with no line written, whatever order he went in", () => {
    const working = { ...sessionAt("working"), lines: {} };
    expect(sessionProgress(working, P)).toEqual({ kind: "working", label: "Q1" });
    expect(sessionProgress({ ...working, lines: { q1: [line("x")], q2: [line("y")], q4: [line("z")] } }, P)).toEqual({ kind: "working", label: "Q3" });
    expect(sessionProgress({ ...working, lines: { q1: [] } }, P)).toEqual({ kind: "working", label: "Q1" });
    const all = Object.fromEntries(P.map((p) => [p.id, [line("x")]]));
    expect(sessionProgress({ ...working, lines: all, problemIndex: 9 }, P)).toEqual({ kind: "working", label: "Q10" });
  });

  it("a subset of the bank is named by the problems' own labels", () => {
    const subset = [P[1], P[3]];
    expect(sessionProgress({ ...sessionAt("working"), lines: { q2: [line("x")] } }, subset)).toEqual({ kind: "working", label: "Q4" });
  });

  it("a classmate: the fixture's snapshot, or what the stream knows at a moment (ticket 189)", () => {
    expect(classmateProgress({ done: 0 }, P)).toEqual({ kind: "not-started" });
    expect(classmateProgress({ done: 2 }, P)).toEqual({ kind: "submitted" });
    expect(classmateProgress({ done: 0 }, P, { submitted: false, warmingUp: true, answered: 0, started: true })).toEqual({ kind: "warming-up" });
    expect(classmateProgress({ done: 0 }, P, { submitted: false, warmingUp: false, answered: 7, started: true })).toEqual({ kind: "working", label: "Q8" });
    expect(classmateProgress({ done: 0 }, P, { submitted: false, warmingUp: false, answered: 0, started: false })).toEqual({ kind: "not-started" });
    expect(classmateProgress({ done: 0 }, P, { submitted: true, warmingUp: false, answered: 10, started: true })).toEqual({ kind: "submitted" });
  });
});
