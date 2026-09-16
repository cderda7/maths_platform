import { describe, expect, it } from "vitest";
import { ASSIGNMENT } from "@/data/assignment";
import { PAIR_MAP } from "@/data/pairs";
import { CLASS_STEPS, classTurnScript, lastStep, stepsFor, turnFor, turnState, workedLines } from "./classReview";
import { CLASS_REVIEW_GRACE_MS, classroomReducer, currentSlide, GRACE_MS, graceFor, INITIAL_CLASSROOM, lessonOver } from "./classroom";
import { skipFixture } from "./demo";
import { pairFor } from "./pairs";
import { sessionReducer } from "./session";
import { sessionScore } from "./setScore";
import { sessionReviews } from "./report";

const now = 1_700_000_000_000;

/** Class review projected on the demo's two most-struggled questions, Sam frozen on it. */
const projected = () => skipFixture("class review", now);

describe("the three steps of a class review question (ticket 344)", () => {
  it("every question of the set runs its examples, Q* and Q**", () => {
    for (const p of ASSIGNMENT.problems) {
      expect(pairFor(p.id)).not.toBeNull();
      expect(stepsFor(p.id)).toEqual([...CLASS_STEPS]);
      expect(lastStep(p.id)).toBe("turn");
      expect(workedLines(p.id)).toBe(PAIR_MAP[p.id].worked.solution.length);
    }
  });

  it("a question with no Q* and Q** runs its examples alone", () => {
    expect(stepsFor("ps1-q1")).toEqual(["examples"]);
    expect(lastStep("ps1-q1")).toBe("examples");
    expect(workedLines("ps1-q1")).toBe(0);
  });

  it("the board walks forward one beat at a time and back the same way", () => {
    let c = classroomReducer(INITIAL_CLASSROOM, { type: "wc/setup", problems: ["q1", "q2"], examples: { q1: [], q2: [] } });
    c = classroomReducer(c, { type: "wc/project", at: now });
    const lines = workedLines("q1");
    const at = () => currentSlide(c)!;
    expect(at()).toMatchObject({ step: "examples", reveal: 0, index: 0, last: false });
    c = classroomReducer(c, { type: "wc/next" });
    expect(at()).toMatchObject({ step: "worked", reveal: 0 });
    for (let i = 0; i < lines; i++) c = classroomReducer(c, { type: "wc/next" });
    expect(at()).toMatchObject({ step: "worked", reveal: lines });
    c = classroomReducer(c, { type: "wc/next" });
    expect(at().step).toBe("turn");
    // The last step does not step on: the teacher's "Next question" is the countdown.
    c = classroomReducer(c, { type: "wc/next" });
    expect(at()).toMatchObject({ step: "turn", index: 0 });
  });

  it("a question with no pair never leaves its examples", () => {
    let c = classroomReducer(INITIAL_CLASSROOM, { type: "wc/setup", problems: ["ps1-q1"], examples: { "ps1-q1": [] } });
    c = classroomReducer(c, { type: "wc/project", at: now });
    c = classroomReducer(c, { type: "wc/next" });
    expect(currentSlide(c)).toMatchObject({ step: "examples", reveal: 0, last: true });
  });
});

describe("the countdown between questions", () => {
  const two = () => {
    const c = classroomReducer(INITIAL_CLASSROOM, { type: "wc/setup", problems: ["q1", "q2"], examples: { q1: [], q2: [] } });
    return classroomReducer(c, { type: "wc/project", at: now });
  };

  it("runs for five seconds, where every other advance runs for a minute", () => {
    expect(CLASS_REVIEW_GRACE_MS).toBe(5_000);
    expect(graceFor("class-review-next")).toBe(CLASS_REVIEW_GRACE_MS);
    for (const kind of ["force-submit", "force-review", "force-group", "whole-class-start", "end-lesson"] as const) expect(graceFor(kind)).toBe(GRACE_MS);
    const c = classroomReducer(two(), { type: "advance/start", kind: "class-review-next", at: now });
    expect(c.advance).toMatchObject({ kind: "class-review-next", deadline: now + 5_000 });
  });

  it("moves the class to the next question's examples once, whichever tab applies it", () => {
    let c = classroomReducer(two(), { type: "wc/next" });
    c = classroomReducer(c, { type: "advance/start", kind: "class-review-next", at: now });
    const id = c.advance!.id;
    c = classroomReducer(c, { type: "wc/advance", id });
    expect(c.wholeClass).toMatchObject({ slide: 1, step: "examples", reveal: 0, view: "unmarked", movedBy: id });
    expect(c.advance).toBeNull();
    // A second tab applying the same advance a tick later changes nothing.
    expect(classroomReducer(c, { type: "wc/advance", id })).toBe(c);
    expect(classroomReducer(c, { type: "wc/advance", id }).wholeClass?.slide).toBe(1);
  });

  it("finishes class review on the last question", () => {
    let c = classroomReducer(two(), { type: "wc/advance", id: "a" });
    expect(currentSlide(c)?.last).toBe(true);
    c = classroomReducer(c, { type: "wc/advance", id: "b" });
    expect(c.wholeClass?.status).toBe("ended");
    expect(lessonOver(c)).toBe(true);
    expect(currentSlide(c)).toBeNull();
  });
});

describe("a student's turn on Q**", () => {
  const steps = PAIR_MAP.q1.completion.solution;
  const lines = (...tex: string[]) => tex.map((t, i) => ({ tex: t, strokeCount: i + 1 }));

  it("marks each line against the step the student is on, and moves on only on a right one", () => {
    const s = turnState(steps, lines(steps[0].tex, steps[1].tex));
    expect(s.written.map((w) => w.mark.kind)).toEqual(["right", "right"]);
    expect(s.step).toBe(2);
    expect(s.left).toBe(steps.length - 2);
    expect(s.done).toBe(false);
  });

  it("keeps a wrong line where it was written, with its misconception, and stays on the step", () => {
    const s = turnState(steps, lines(steps[0].tex, "(x-2)(x-9) = 0"));
    expect(s.written[1].mark.kind).toBe("wrong");
    expect(s.step).toBe(1);
    // Nothing is given: a second and a third wrong line still leave the step open (the help steps fill a blank in after two).
    const more = turnState(steps, lines(steps[0].tex, "(x-2)(x-9) = 0", "(x-2)(x-9) = 0", "(x-2)(x-9) = 0"));
    expect(more.step).toBe(1);
    expect(more.written).toHaveLength(4);
    expect(more.written.every((w, i) => i === 0 || w.mark.kind === "wrong")).toBe(true);
    // The right line, written after them, moves on.
    const fixed = turnState(steps, lines(steps[0].tex, "(x-2)(x-9) = 0", steps[1].tex));
    expect(fixed.step).toBe(2);
    expect(fixed.written.map((w) => w.mark.kind)).toEqual(["right", "wrong", "right"]);
  });

  it("is done once every step is in, and ignores anything written after it", () => {
    const all = steps.map((st) => st.tex);
    const s = turnState(steps, lines(...all, "x = 99"));
    expect(s.done).toBe(true);
    expect(s.left).toBe(0);
    expect(s.written).toHaveLength(steps.length);
  });

  it("is derived from the lines alone, so a reload and the teacher's tab agree", () => {
    const written = lines(steps[0].tex, "(x-2)(x-9) = 0", steps[1].tex);
    expect(turnState(steps, written)).toEqual(turnState(steps, [...written]));
    expect(turnFor("q1", written)).toEqual(turnState(steps, written));
    expect(turnFor("ps1-q1", written)).toBeNull();
  });
});

describe("the demo's scripted turn", () => {
  it("writes Q**'s whole working, with Sam's sign slip before its step on Q2 and no slip elsewhere", () => {
    const script = classTurnScript("q2");
    const working = PAIR_MAP.q2.completion.solution.map((s) => s.tex);
    expect(script).toHaveLength(working.length + 1);
    expect(script.filter((l) => working.includes(l))).toEqual(working);
    const slip = script.find((l) => !working.includes(l))!;
    expect(slip).toBe("(2x + 3)(x - 5) = 0");
    expect(classTurnScript("q7")).toEqual(PAIR_MAP.q7.completion.solution.map((s) => s.tex));
    expect(classTurnScript("ps1-q1")).toEqual([]);
  });

  it("the slip is marked wrong and the line after it right, as the student writes them", () => {
    const script = classTurnScript("q2");
    const state = turnFor("q2", script.map((tex, i) => ({ tex, strokeCount: i + 1 })))!;
    expect(state.done).toBe(true);
    const kinds = state.written.map((w) => w.mark.kind);
    expect(kinds.filter((k) => k === "wrong")).toHaveLength(1);
    const wrong = kinds.indexOf("wrong");
    expect(kinds[wrong + 1]).toBe("right");
    expect(state.written[wrong].mark.kind === "wrong" && state.written[wrong].mark.misconception).toBeTruthy();
  });
});

describe("class review records nothing", () => {
  it("leaves the set score, the report's reviews and every version untouched", () => {
    const { session, classroom } = projected();
    const pid = classroom.wholeClass!.problems[0];
    const before = { score: sessionScore(session, ASSIGNMENT.problems), reviews: sessionReviews(session, classroom.group), lines: session.lines, rework: session.rework };
    let s = session;
    for (const [i, tex] of classTurnScript(pid).entries()) {
      s = sessionReducer(s, { type: "class-review/stroke", problem: pid, stroke: [{ x: i, y: i }] });
      s = sessionReducer(s, { type: "class-review/reveal", problem: pid, line: { tex, strokeCount: i + 1 } });
    }
    expect(s.classReview[pid].lines).toHaveLength(classTurnScript(pid).length);
    expect(sessionScore(s, ASSIGNMENT.problems)).toBe(before.score);
    expect(sessionReviews(s, classroom.group)).toEqual(before.reviews);
    expect(s.lines).toEqual(before.lines);
    expect(s.rework).toEqual(before.rework);
    expect(s.stage).toBe("frozen");
  });
});
