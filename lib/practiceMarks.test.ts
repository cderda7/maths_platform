import { describe, expect, it } from "vitest";
import { ASSIGNMENT, PROBLEMS } from "@/data/assignment";
import { CLASSMATE_MAP, CLASSMATES } from "@/data/classmates";
import { HELP_STEP_AT, WARM_UP_IDS } from "@/data/stream";
import type { LeafId } from "@/data/taxonomy";
import { assignmentBundle } from "./assignments";
import { classroomReducer, INITIAL_CLASSROOM } from "./classroom";
import { classmateTimeline } from "./place";
import { afterPracticeText, classmatePracticeMarks, reportPracticeMarks, sessionPracticeMarks, warmUpText } from "./practiceMarks";
import { INITIAL_SESSION, sessionAt, sessionReducer, type StudentSession } from "./session";
import { recordScore, sessionScore } from "./setScore";
import { scheduleFor } from "./stream";

const P = ASSIGNMENT.problems;
const T0 = 1_700_000_000_000;
const MONIC: LeafId = "algebra.expand-factor.monic";
const NONMONIC: LeafId = "algebra.expand-factor.nonmonic";
const FRACTIONS: LeafId = "algebra.number.fractions";
const CREATED = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: ASSIGNMENT.title, problemIds: P.map((p) => p.id), pathway: ["individual", "group", "whole-class"], goal: ASSIGNMENT.goal, at: T0 });
const LIVE = assignmentBundle("pset-6", CREATED)!;
const whole = (id: string) => classmatePracticeMarks(CLASSMATE_MAP[id], P, null);

describe("the practice a classmate took, from ticket 314's story (ticket 317)", () => {
  it("four students are marked on the question they took help on, with its skill, and nobody else on any question", () => {
    const marked = Object.fromEntries(CLASSMATES.map((m) => [m.id, whole(m.id).questions]).filter(([, q]) => Object.keys(q).length > 0));
    expect(marked).toEqual({
      liam: { q1: [MONIC] },
      sofia: { q2: [NONMONIC] },
      harper: { q3: ["algebra.expand-factor.expand"] },
      finn: { q5: ["graphing.quadratics.features"] },
    });
  });

  it("the five who warmed up name their skills in the order taken; hints alone (Noah, Ethan, Ruby) mark nothing", () => {
    const warm = Object.fromEntries(CLASSMATES.map((m) => [m.id, whole(m.id).warmUp]).filter(([, w]) => w.length > 0));
    expect(warm).toEqual({ jordan: [NONMONIC], mia: [FRACTIONS, NONMONIC], oliver: [MONIC, NONMONIC], tomas: [FRACTIONS], amelia: ["algebra.equations.discriminant"] });
    expect(Object.keys(warm).sort()).toEqual([...WARM_UP_IDS].sort());
    for (const id of ["noah", "ethan", "ruby", "priya", "chloe"]) expect(whole(id), id).toEqual({ questions: {}, warmUp: [] });
  });

  it("on the live set only what the stream has reached: help from its worked example on, a warm-up skill from its first step", () => {
    const liam = CLASSMATE_MAP.liam;
    const helpAt = classmateTimeline(liam, P).find((seg) => seg.place.kind === "question" && seg.place.detail?.kind === "practice")!.at;
    // Its worked example begins a fifth of the way into Q1, which runs from the confidence check to the first answer.
    const q1End = scheduleFor(liam, P).answeredAt[0];
    expect(helpAt).toBeGreaterThan(0);
    expect(helpAt).toBeLessThan(HELP_STEP_AT[1] * q1End);
    expect(classmatePracticeMarks(liam, P, helpAt - 1).questions).toEqual({});
    expect(classmatePracticeMarks(liam, P, helpAt).questions).toEqual({ q1: [MONIC] });
    const mia = classmateTimeline(CLASSMATE_MAP.mia, P);
    const secondSkill = mia.find((seg) => seg.place.kind === "warmup" && seg.place.leaf === NONMONIC)!.at;
    expect(classmatePracticeMarks(CLASSMATE_MAP.mia, P, secondSkill - 1).warmUp).toEqual([FRACTIONS]);
    expect(classmatePracticeMarks(CLASSMATE_MAP.mia, P, secondSkill).warmUp).toEqual([FRACTIONS, NONMONIC]);
  });

  it("the report reads the stream's clock on the live set, the whole story before it starts and once the class has handed in, and nothing on a finished set", () => {
    const liam = CLASSMATE_MAP.liam;
    expect(reportPracticeMarks(LIVE, liam, sessionAt("working"), T0 + 1000).questions).toEqual({});
    expect(reportPracticeMarks(LIVE, liam, sessionAt("working"), T0 + 60 * 60_000).questions).toEqual({ q1: [MONIC] });
    expect(reportPracticeMarks(LIVE, liam, sessionAt("report"), T0 + 1000).questions).toEqual({ q1: [MONIC] });
    expect(reportPracticeMarks({ ...LIVE, startedAt: null }, liam, null, T0).questions).toEqual({ q1: [MONIC] });
    const finished = assignmentBundle("pset-5", CREATED)!;
    expect(reportPracticeMarks(finished, finished.classmates.find((m) => m.id === "liam")!, null, T0)).toEqual({ questions: {}, warmUp: [] });
    expect(reportPracticeMarks(finished, finished.sam, sessionAt("report"), T0)).toEqual({ questions: {}, warmUp: [] });
  });
});

describe("the practice Sam took, from his session (ticket 317)", () => {
  const onQ2 = (): StudentSession => sessionReducer(sessionAt("working"), { type: "problem/goto", index: 1 });

  it("the scripted run's Q2 offer taken marks Q2 on non-monic factorising; he declined the warm-up, so none", () => {
    const s = sessionAt("report");
    expect(sessionPracticeMarks(s)).toEqual({ questions: { q2: [NONMONIC] }, warmUp: [] });
    expect(reportPracticeMarks(LIVE, null, s, T0)).toEqual({ questions: { q2: [NONMONIC] }, warmUp: [] });
    expect(reportPracticeMarks(LIVE, null, null, T0)).toEqual({ questions: {}, warmUp: [] });
  });

  it("help left from its worked example still marks the question; an offer declined marks nothing", () => {
    const back = sessionReducer(sessionReducer(onQ2(), { type: "help/request", leaf: NONMONIC, problem: "q2", at: T0 }), { type: "overlay/done", at: T0 + 5 });
    expect(back.practices[0].steps).toEqual({ worked: T0, back: T0 + 5 });
    expect(sessionPracticeMarks(back).questions).toEqual({ q2: [NONMONIC] });
    const declined = { ...onQ2(), practices: [{ leaf: NONMONIC, reason: "detected" as const, accepted: false, problem: "q2" }] };
    expect(sessionPracticeMarks(declined).questions).toEqual({});
  });

  it("two skills practised on one question are both named, once each", () => {
    let s = sessionReducer(sessionReducer(onQ2(), { type: "help/request", leaf: NONMONIC, problem: "q2", at: T0 }), { type: "overlay/done", at: T0 + 5 });
    s = sessionReducer(sessionReducer(s, { type: "help/request", leaf: MONIC, problem: "q2", at: T0 + 9 }), { type: "overlay/done", at: T0 + 12 });
    s = sessionReducer(sessionReducer(s, { type: "help/request", leaf: NONMONIC, problem: "q2", at: T0 + 20 }), { type: "overlay/done", at: T0 + 25 });
    expect(sessionPracticeMarks(s).questions).toEqual({ q2: [NONMONIC, MONIC] });
    expect(afterPracticeText(sessionPracticeMarks(s).questions.q2)).toBe("after practice on non-monic factorising & monic factorising");
  });

  it("the warm-up names each skill whose steps began, in the order taken, and not one never opened", () => {
    let s = sessionReducer(sessionReducer(INITIAL_SESSION, { type: "overview/start" }), { type: "goal/continue" });
    s = sessionReducer(s, { type: "confidence/set", confidence: { level: "low-when", leaves: [MONIC, FRACTIONS] } });
    s = sessionReducer(s, { type: "warmup/accept" });
    s = sessionReducer(s, { type: "warmup/say", text: "i mix up the signs" });
    s = sessionReducer(s, { type: "warmup/say", text: "i forget which way the fraction flips" });
    s = sessionReducer(s, { type: "warmup/begin", at: T0 });
    const first = sessionPracticeMarks(s).warmUp;
    expect(first).toHaveLength(1);
    // Skipped to the set from the first skill: the second was never opened.
    const skipped: StudentSession = { ...s, stage: "working" };
    expect(sessionPracticeMarks(skipped).warmUp).toEqual(first);
    s = sessionReducer(s, { type: "warmup/goto", step: 1, at: T0 + 1000 });
    const both = sessionPracticeMarks(s).warmUp;
    expect([...both].sort()).toEqual([FRACTIONS, MONIC].sort());
    expect(sessionPracticeMarks({ ...s, practice: "declined" }).warmUp).toEqual([]);
  });
});

describe("the words (ticket 317)", () => {
  it("a question's marker and the warm-up's note name skills as the report does and join them as the chat does", () => {
    expect(afterPracticeText([NONMONIC])).toBe("after practice on non-monic factorising");
    expect(afterPracticeText([])).toBeNull();
    expect(afterPracticeText(undefined)).toBeNull();
    expect(warmUpText([NONMONIC])).toBe("Warmed up on non-monic factorising");
    expect(warmUpText([FRACTIONS, NONMONIC])).toBe("Warmed up on fractions & non-monic factorising");
    expect(warmUpText([])).toBeNull();
  });

  it("describe what happened, never a trait", () => {
    const words = [...CLASSMATES.flatMap((m) => [warmUpText(whole(m.id).warmUp), ...Object.values(whole(m.id).questions).map(afterPracticeText)]), afterPracticeText([MONIC])].filter(Boolean).join(" ");
    expect(words).not.toMatch(/struggl|needed|needs|help|careless|confident|weak|rush|guess|unsure|slow/i);
  });
});

describe("practice never changes a score (ticket 317)", () => {
  it("the live student's score is the same with and without the practice he took, and a record's reads only done and wrong", () => {
    const s = sessionAt("report");
    expect(s.practices.length).toBeGreaterThan(0);
    const without: StudentSession = { ...s, practices: [], practice: "declined" };
    expect(sessionScore(s, PROBLEMS)).toBe(sessionScore(without, PROBLEMS));
    const warmed = { ...s, practice: "taken" as const, confidence: { level: "low-when" as const, leaves: [NONMONIC] }, warmup: { ...s.warmup, phases: { "w-nonmonic": { worked: T0 } } } };
    expect(sessionPracticeMarks(warmed).warmUp).toEqual([NONMONIC]);
    expect(sessionScore(warmed, PROBLEMS)).toBe(sessionScore(s, PROBLEMS));
    for (const id of ["liam", "sofia", "harper", "finn", "mia"]) expect(recordScore(CLASSMATE_MAP[id], P), id).toBe(P.filter((p, i) => i < CLASSMATE_MAP[id].done && !CLASSMATE_MAP[id].wrong.includes(p.id)).length);
  });
});
