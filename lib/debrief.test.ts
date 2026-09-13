import { describe, expect, it } from "vitest";
import { groupRework, HOLD_MS, holdOver, holdProgress, markedVersions, marksAt, marksOpen, matchesGroup, pendingDebrief, PEER_DEBRIEF_MS, UNMARKED_MS } from "./debrief";
import { beginRun } from "./groupReview";
import { classroomReducer, INITIAL_CLASSROOM } from "./classroom";
import { RECOGNITION, RECOGNITION_REWORK } from "@/data/recognition";
import { sessionAt, sessionReducer } from "./session";

describe("the marked view", () => {
  it("marks the student's own versions fully and gives the group's rework blue standouts", () => {
    const v = markedVersions("q3", { lines: RECOGNITION.q3, rework: RECOGNITION_REWORK.q3 }, RECOGNITION_REWORK.q3);
    expect(v.map((x) => x.label)).toEqual(["Handed in", "Reworked", "Group's rework"]);
    expect(v[0].lines.map((l) => l.mark)).toEqual([null, "wrong", null]);
    expect(v[2].lines.some((l) => l.mark === "standout")).toBe(true); // "expanded first" is the Q3 standout
    expect(markedVersions("q1", { lines: RECOGNITION.q1, rework: [] }, RECOGNITION_REWORK.q1).map((x) => x.label)).toEqual(["Handed in", "Group's rework"]);
  });
  it("greens the group's rework always, and the student's own version only when it is line for line the same", () => {
    const v = markedVersions("q1", { lines: RECOGNITION.q1, rework: RECOGNITION_REWORK.q1 }, RECOGNITION_REWORK.q1);
    expect(v.map((x) => [x.label, x.green])).toEqual([
      ["Handed in", false],
      ["Reworked", true],
      ["Group's rework", true],
    ]);
    expect(markedVersions("q1", { lines: RECOGNITION_REWORK.q1, rework: [] }, RECOGNITION_REWORK.q1).map((x) => x.green)).toEqual([true, true]);
    expect(markedVersions("q1", { lines: RECOGNITION.q1, rework: [] }, RECOGNITION_REWORK.q1).map((x) => x.green)).toEqual([false, true]);
    expect(matchesGroup(["(x - 2)(x - 3) = 0", "x = 2 \\;\\text{or}\\;  x = 3"], RECOGNITION_REWORK.q1)).toBe(true); // whitespace aside
    expect(matchesGroup([...RECOGNITION_REWORK.q1].reverse(), RECOGNITION_REWORK.q1)).toBe(false); // same lines, wrong order
    expect(matchesGroup(RECOGNITION_REWORK.q1.slice(0, 1), RECOGNITION_REWORK.q1)).toBe(false); // a prefix is not a match
    expect(matchesGroup([], [])).toBe(false); // nothing written matches nothing
  });
  it("the marks open on their own two seconds after the group's check", () => {
    expect(UNMARKED_MS).toBe(2_000);
    expect(marksAt(1000)).toBe(3_000);
    expect(marksOpen(1000, 2_999)).toBe(false);
    expect(marksOpen(1000, 3_000)).toBe(true);
    // A peer's whole debrief (unmarked, then the hold) fits before their first stroke moves the group on.
    expect(UNMARKED_MS + HOLD_MS).toBeLessThan(PEER_DEBRIEF_MS);
  });
  it("the hold: ten seconds from the marks opening", () => {
    expect(HOLD_MS).toBe(10_000);
    expect(holdProgress(null, 5)).toBe(0);
    expect(holdProgress(1000, 6_000)).toBe(0.5);
    expect(holdProgress(1000, 11_000)).toBe(1);
    expect(holdOver(1000, 1000 + HOLD_MS - 1)).toBe(false);
    expect(holdOver(1000, 1000 + HOLD_MS)).toBe(true);
  });
});

describe("the session's debrief notes", () => {
  it("marks the student moved on, once, with nothing to write", () => {
    let s = sessionAt("group");
    expect(s.debrief).toEqual({});
    s = sessionReducer(s, { type: "debrief/done", problem: "q1" });
    expect(s.debrief.q1).toEqual({ done: true });
    expect(sessionReducer(s, { type: "debrief/done", problem: "q1" })).toBe(s);
  });

  it("the pending debrief is the latest resolved problem not yet moved on from", () => {
    let c = classroomReducer(INITIAL_CLASSROOM, { type: "group/begin", members: ["sam", "jordan", "zara", "liam"], problems: ["q1", "q2"], at: 0 });
    expect(pendingDebrief(c.group!, {})).toBeNull();
    for (const tex of RECOGNITION_REWORK.q1) c = classroomReducer(c, { type: "group/line", tex });
    c = classroomReducer(c, { type: "group/check", at: 70 });
    expect(c.group?.resolvedAt?.q1).toBe(70);
    expect(pendingDebrief(c.group!, {})).toBe("q1");
    expect(groupRework(c.group!, "q1")?.lines).toEqual(RECOGNITION_REWORK.q1);
    expect(pendingDebrief(c.group!, { q1: { done: true } })).toBeNull();
    c = classroomReducer(c, { type: "group/next", at: 99 });
    expect(c.group?.resolvedAt?.q1).toBe(70); // the finish moment is kept for the standings
    expect(pendingDebrief(c.group!, {})).toBe("q1"); // the group moved on; the student lingers until Next
    expect(beginRun(["a"], ["q1"], 0).resolvedAt).toEqual({});
  });
});
