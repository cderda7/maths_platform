import { describe, expect, it } from "vitest";
import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATES } from "@/data/classmates";
import { assignmentBundle } from "./assignments";
import { classroomReducer, INITIAL_CLASSROOM } from "./classroom";
import { evaluateLine } from "./evaluate";
import { classmateTimeline, classPlaces, type Place } from "./place";
import { confidenceTone, NO_CONFIDENCE } from "./report";
import { INITIAL_SESSION, type StudentSession } from "./session";
import { scheduleFor, streamEndMs } from "./stream";
import { studentWorkAt, workFromPlace } from "./studentWork";

const P = ASSIGNMENT.problems;
const T0 = 1_700_000_000_000;
const CREATED = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: ASSIGNMENT.title, problemIds: P.map((p) => p.id), pathway: ["individual", "group", "whole-class"], goal: ASSIGNMENT.goal, at: T0 });
const LIVE = assignmentBundle("pset-6", CREATED)!;
const END = streamEndMs(CLASSMATES, P);
const q = (problem: string): Place => ({ kind: "question", problem, label: P.find((p) => p.id === problem)!.label, detail: null });
const ids = <T extends { id: string }>(xs: readonly { problem: T }[]) => xs.map((x) => x.problem.id);
/** A classmate's place and work at `ms` into the stream, as the panel reads them. */
const at = (id: string, ms: number, session: StudentSession | null = null) => {
  const now = T0 + ms;
  const place = classPlaces(LIVE, session, now, LIVE.absent).find((p) => p.id === id)!.place;
  return { place, work: studentWorkAt(LIVE, session, now, id, place) };
};
/** The first moment of a classmate's timeline at `place`. */
const firstAt = (id: string, match: (p: Place) => boolean) => classmateTimeline(CLASSMATES.find((m) => m.id === id)!, P).find((s) => match(s.place))!.at;

describe("what a student has moved past, from their place (ticket 316)", () => {
  const lines = { q1: ["a"], q3: ["c"] };
  it("nothing before the questions: not started, the check-in, the warm-up chat and steps, absent", () => {
    for (const place of [{ kind: "not-started" }, { kind: "confidence" }, { kind: "warmup-chat" }, { kind: "warmup", leaf: "algebra.expand-factor.monic", step: 2 }, { kind: "absent" }] as Place[]) {
      expect(workFromPlace(place, P, lines, "low")).toEqual({ confidence: "low", moved: [], on: null });
    }
  });

  it("on a question: the questions before it in set order with their lines (none written reads empty), and it, with no lines", () => {
    const w = workFromPlace(q("q4"), P, lines, "confident");
    expect(ids(w.moved)).toEqual(["q1", "q2", "q3"]);
    expect(w.moved.map((m) => m.lines)).toEqual([["a"], [], ["c"]]);
    expect(w.on?.id).toBe("q4");
    expect(ids(workFromPlace(q("q1"), P, lines, "low").moved)).toEqual([]);
    // A hint or practice on the question keeps them on it.
    expect(workFromPlace({ ...q("q2"), detail: { kind: "hint", hint: 1 } } as Place, P, lines, "low").on?.id).toBe("q2");
  });

  it("handed in: every question moved past, none on", () => {
    const w = workFromPlace({ kind: "handed-in" }, P, lines, "low");
    expect(ids(w.moved)).toEqual(P.map((p) => p.id));
    expect(w.on).toBeNull();
  });

  it("colours the label as the Class view does", () => {
    expect(confidenceTone("confident")).toBe("text-secure");
    expect(confidenceTone("low")).toBe("text-accent-deep");
    expect(confidenceTone("low: fractions")).toBe("text-accent-deep");
    expect(confidenceTone(NO_CONFIDENCE)).toBe("text-ink-muted");
  });
});

describe("a classmate's work so far on the live stream", () => {
  it("Finn on Q4: Q1–Q3 with his lines, Q2's red line carrying its misconception; Q4 in progress; confident", () => {
    const ms = firstAt("finn", (p) => p.kind === "question" && p.problem === "q4") + 500;
    const { place, work } = at("finn", ms);
    expect(place).toMatchObject({ kind: "question", problem: "q4" });
    expect(work.confidence).toBe("confident");
    expect(ids(work.moved)).toEqual(["q1", "q2", "q3"]);
    expect(work.on?.id).toBe("q4");
    for (const m of work.moved) expect(m.lines.length, m.problem.id).toBeGreaterThan(0);
    const q2 = work.moved[1].lines.map((tex) => evaluateLine("q2", tex));
    expect(q2.some((v) => v.verdict === "wrong" && v.misconception)).toBe(true);
    for (const i of [0, 2]) expect(work.moved[i].lines.map((tex) => evaluateLine(work.moved[i].problem.id, tex).verdict)).not.toContain("wrong");
  });

  it("at every 5 s of the stream, every classmate's moved-past questions are exactly the answered ones before the question they are on", () => {
    for (let ms = 0; ms <= END + 5000; ms += 5000) {
      for (const m of LIVE.classmates) {
        const { place, work } = at(m.id, ms);
        const s = scheduleFor(m, P);
        const answered = s.answeredAt.filter((t) => t <= ms).length;
        if (place.kind === "question") {
          expect(work.moved.length, `${m.id} at ${ms}`).toBe(P.findIndex((p) => p.id === place.problem));
          expect(work.moved.length, `${m.id} at ${ms}`).toBeLessThanOrEqual(answered);
          // Each one moved past has what they wrote on it: lines for every answered question.
          for (const w of work.moved) expect(w.lines.length, `${m.id} ${w.problem.id} at ${ms}`).toBeGreaterThan(0);
        } else if (place.kind === "handed-in") {
          expect(work.moved.length).toBe(P.length);
          expect(work.on).toBeNull();
        } else {
          expect(work.moved, `${m.id} at ${ms}`).toEqual([]);
          expect(work.on).toBeNull();
        }
        // No answer shown while a classmate is still on the check-in or has not started.
        if (place.kind === "confidence" || place.kind === "not-started" || place.kind === "absent") expect(work.confidence).toBe(NO_CONFIDENCE);
        else expect(work.confidence).toBe(m.confidence);
      }
    }
  });

  it("a warm-up student shows their answer and no questions", () => {
    const ms = firstAt("tomas", (p) => p.kind === "warmup") + 200;
    const { place, work } = at("tomas", ms);
    expect(place.kind).toBe("warmup");
    expect(work).toEqual({ confidence: "low: fractions", moved: [], on: null });
  });

  it("Liam's unfinished Q5 is in progress until he hands in, then shows with its lines and Q6–Q10 read empty", () => {
    const liam = CLASSMATES.find((m) => m.id === "liam")!;
    const s = scheduleFor(liam, P);
    const before = at("liam", s.submitAt! - 100).work;
    expect(before.on?.id).toBe("q5");
    expect(ids(before.moved)).toEqual(["q1", "q2", "q3", "q4"]);
    const after = at("liam", s.submitAt! + 100).work;
    expect(after.on).toBeNull();
    expect(after.moved[4].lines.length).toBeGreaterThan(0);
    for (const m of after.moved.slice(5)) expect(m.lines).toEqual([]);
  });
});

describe("Sam's work so far, from his session", () => {
  const base: StudentSession = { ...INITIAL_SESSION, stage: "working", confidence: { level: "low" } };
  it("before the set, no questions and no answer; on the check-in with an answer, the answer", () => {
    expect(studentWorkAt(LIVE, null, T0, DEMO_STUDENT.id, { kind: "not-started" })).toEqual({ confidence: NO_CONFIDENCE, moved: [], on: null });
    const confident: StudentSession = { ...INITIAL_SESSION, stage: "confidence", confidence: { level: "confident" } };
    expect(studentWorkAt(LIVE, confident, T0, DEMO_STUDENT.id, { kind: "confidence" })).toEqual({ confidence: "confident", moved: [], on: null });
  });

  it("on Q3: Q1 and Q2 with his session's lines (Q2 unwritten reads empty), Q3 in progress", () => {
    const tex = P[0].solution.map((l) => l.tex);
    const session: StudentSession = { ...base, problemIndex: 2, lines: { q1: tex.map((t) => ({ tex: t, strokeCount: 0 })), q3: [{ tex: "x", strokeCount: 0 }] } };
    const place = classPlaces(LIVE, session, T0 + 1000, LIVE.absent)[0].place;
    expect(place).toMatchObject({ kind: "question", problem: "q3" });
    const w = studentWorkAt(LIVE, session, T0 + 1000, DEMO_STUDENT.id, place);
    expect(ids(w.moved)).toEqual(["q1", "q2"]);
    expect(w.moved[0].lines).toEqual(tex);
    expect(w.moved[1].lines).toEqual([]);
    expect(w.on?.id).toBe("q3");
  });
});
