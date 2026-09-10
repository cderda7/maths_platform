import { describe, expect, it } from "vitest";
import { debriefPrompt, groupRework, HOLD_MS, holdOver, holdProgress, markedVersions, matchesGroup, pendingDebrief } from "./debrief";
import { beginRun } from "./groupReview";
import { classroomReducer, INITIAL_CLASSROOM } from "./classroom";
import { RECOGNITION, RECOGNITION_REWORK } from "@/data/recognition";
import { sessionAt, sessionReducer } from "./session";

describe("the debrief prompt", () => {
  it("asks for your own mistake when neither earlier attempt was functional, else your peers' likely mistake", () => {
    expect(debriefPrompt("q3", { lines: RECOGNITION.q3, rework: [] })).toBe("own");
    expect(debriefPrompt("q3", { lines: RECOGNITION.q3, rework: RECOGNITION_REWORK.q3 })).toBe("peers");
    expect(debriefPrompt("q1", { lines: RECOGNITION_REWORK.q1, rework: [] })).toBe("peers");
    expect(debriefPrompt("q1", { lines: [], rework: [] })).toBe("own");
  });
});

describe("the marked view", () => {
  it("marks the student's own versions fully and gives the group's rework blue standouts", () => {
    const v = markedVersions("q3", { lines: RECOGNITION.q3, rework: RECOGNITION_REWORK.q3 }, RECOGNITION_REWORK.q3);
    expect(v.map((x) => x.label)).toEqual(["Handed in", "Reworked", "Group's rework"]);
    expect(v[0].lines.map((l) => l.mark)).toEqual([null, "wrong", null]);
    expect(v[2].lines.some((l) => l.mark === "standout")).toBe(true); // "expanded first" is the Q3 standout
    expect(markedVersions("q1", { lines: RECOGNITION.q1, rework: [] }, RECOGNITION_REWORK.q1).map((x) => x.label)).toEqual(["Handed in", "Group's rework"]);
  });
  it("flags the student's own version when it is line for line the group's rework, never the group's column", () => {
    const v = markedVersions("q1", { lines: RECOGNITION.q1, rework: RECOGNITION_REWORK.q1 }, RECOGNITION_REWORK.q1);
    expect(v.map((x) => [x.label, x.matches])).toEqual([
      ["Handed in", false],
      ["Reworked", true],
      ["Group's rework", false],
    ]);
    expect(markedVersions("q1", { lines: RECOGNITION_REWORK.q1, rework: [] }, RECOGNITION_REWORK.q1).map((x) => x.matches)).toEqual([true, false]);
    expect(matchesGroup(["(x - 2)(x - 3) = 0", "x = 2 \\;\\text{or}\\;  x = 3"], RECOGNITION_REWORK.q1)).toBe(true); // whitespace aside
    expect(matchesGroup([...RECOGNITION_REWORK.q1].reverse(), RECOGNITION_REWORK.q1)).toBe(false); // same lines, wrong order
    expect(matchesGroup(RECOGNITION_REWORK.q1.slice(0, 1), RECOGNITION_REWORK.q1)).toBe(false); // a prefix is not a match
    expect(matchesGroup([], [])).toBe(false); // nothing written matches nothing
  });
  it("the hold: twenty seconds from the marks opening", () => {
    expect(holdProgress(null, 5)).toBe(0);
    expect(holdProgress(1000, 11_000)).toBe(0.5);
    expect(holdOver(1000, 1000 + HOLD_MS - 1)).toBe(false);
    expect(holdOver(1000, 1000 + HOLD_MS)).toBe(true);
  });
});

describe("the session's debrief notes", () => {
  it("keeps the note and its prompt, opens the marks only with a note, and moves on only after the marks", () => {
    let s = sessionAt("group");
    expect(sessionReducer(s, { type: "debrief/marks", problem: "q1", at: 5 })).toBe(s);
    s = sessionReducer(s, { type: "debrief/note", problem: "q1", prompt: "own", text: "I picked the wrong signs" });
    expect(s.debrief.q1).toEqual({ prompt: "own", text: "I picked the wrong signs", markedAt: null, done: false });
    expect(sessionReducer(s, { type: "debrief/done", problem: "q1" })).toBe(s);
    s = sessionReducer(s, { type: "debrief/marks", problem: "q1", at: 5 });
    expect(s.debrief.q1.markedAt).toBe(5);
    expect(sessionReducer(s, { type: "debrief/marks", problem: "q1", at: 9 }).debrief.q1.markedAt).toBe(5);
    s = sessionReducer(s, { type: "debrief/note", problem: "q1", prompt: "peers", text: "I picked the wrong signs, both of them" });
    expect(s.debrief.q1.prompt).toBe("own"); // the prompt is fixed on first write; the text stays editable
    s = sessionReducer(s, { type: "debrief/done", problem: "q1" });
    expect(s.debrief.q1.done).toBe(true);
  });

  it("the pending debrief is the latest resolved problem not yet moved on from", () => {
    let c = classroomReducer(INITIAL_CLASSROOM, { type: "group/begin", members: ["sam", "jordan", "zara", "liam"], problems: ["q1", "q2"], at: 0 });
    expect(pendingDebrief(c.group!, {})).toBeNull();
    for (const tex of RECOGNITION_REWORK.q1) c = classroomReducer(c, { type: "group/line", tex });
    c = classroomReducer(c, { type: "group/check", at: 70 });
    expect(c.group?.resolvedAt?.q1).toBe(70);
    expect(pendingDebrief(c.group!, {})).toBe("q1");
    expect(groupRework(c.group!, "q1")?.lines).toEqual(RECOGNITION_REWORK.q1);
    expect(pendingDebrief(c.group!, { q1: { prompt: "own", text: "x", markedAt: 1, done: true } })).toBeNull();
    c = classroomReducer(c, { type: "group/next", at: 99 });
    expect(c.group?.resolvedAt?.q1).toBe(70); // the finish moment is kept for the standings
    expect(pendingDebrief(c.group!, {})).toBe("q1"); // the group moved on; the student lingers until Next
    expect(beginRun(["a"], ["q1"], 0).resolvedAt).toEqual({});
  });
});
