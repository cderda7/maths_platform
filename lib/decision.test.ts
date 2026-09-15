import { describe, expect, it } from "vitest";
import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATES, type Classmate } from "@/data/classmates";
import type { Problem } from "@/data/types";
import { assignmentBundle } from "./assignments";
import { classroomReducer, INITIAL_CLASSROOM, migrateClassroom, type ClassroomAction, type ClassroomState } from "./classroom";
import { currentClassStage } from "./classStage";
import { closeEvidence, closeQuestionNumber, decisionScreen, dueDecision, lessonDecision, moreThanHalf, sessionSubmitted } from "./decision";
import { decisionsReducer } from "./decisionState";
import { DEMO_PATHWAY, demoSend, skipFixture, teacherSkip } from "./demo";
import { INITIAL_SESSION, sessionAt, type StudentSession } from "./session";
import { scheduleFor } from "./stream";

const now = 1_700_000_000_000;

/** A made-up class on a set of `n` of the fixture's problems: `answered[i]` questions submitted by classmate i, a fixed set (no stream). */
function madeUp(n: number, answered: number[], absent: string[] = []) {
  const problems: Problem[] = Array.from({ length: n }, (_, i) => ({ ...ASSIGNMENT.problems[i % ASSIGNMENT.problems.length], id: `p${i + 1}`, label: `Q${i + 1}` }));
  const classmates = answered.map((done, i): Classmate => ({ ...CLASSMATES[1], id: `m${i}`, name: `M ${i}`, done }));
  return { problems, classmates, startedAt: null, absent };
}

/** Sam on the set, written on the first `k` questions and on the one after them. */
function samPast(k: number, problems: readonly Pick<Problem, "id">[]): StudentSession {
  const lines = Object.fromEntries(problems.slice(0, k).map((p) => [p.id, [{ tex: "x", strokeCount: 1 }]]));
  return { ...INITIAL_SESSION, stage: "working", lines, problemIndex: Math.min(k, problems.length - 1) };
}

const sent: ClassroomState = classroomReducer(INITIAL_CLASSROOM, demoSend(DEMO_PATHWAY, now, now));

describe("the close-to-finishing trigger", () => {
  it("counts the question 70% of the way through, rounded up", () => {
    expect(closeQuestionNumber(10)).toBe(7);
    expect(closeQuestionNumber(6)).toBe(5);
    expect(closeQuestionNumber(12)).toBe(9);
    expect(closeQuestionNumber(20)).toBe(14);
    expect(closeQuestionNumber(30)).toBe(21);
    expect(closeQuestionNumber(1)).toBe(1);
  });

  it("wants more than half of the room, never exactly half", () => {
    expect(moreThanHalf(10, 19)).toBe(true);
    expect(moreThanHalf(9, 19)).toBe(false);
    expect(moreThanHalf(10, 20)).toBe(false);
    expect(moreThanHalf(11, 20)).toBe(true);
    expect(moreThanHalf(0, 0)).toBe(false);
  });

  for (const n of [6, 10, 12]) {
    const k = closeQuestionNumber(n);
    it(`fires on a set of ${n} (Q${k}) just over half the present class, not just under`, () => {
      // Nine classmates and Sam (past it): ten in the room, so six is more than half and five is not.
      const under = madeUp(n, [k, k, k, k - 1, k - 1, k - 1, k - 1, n, 0], []);
      const sam = samPast(k, under.problems);
      expect(closeEvidence(sent, under, sam, now)).toMatchObject({ question: `Q${k}`, submitted: 5, present: 10 });
      expect(dueDecision(sent, under, sam, now)).toBeNull();
      const over = madeUp(n, [k, k, k, k, k - 1, k - 1, k - 1, n, 0]);
      expect(closeEvidence(sent, over, sam, now)).toMatchObject({ submitted: 6, present: 10 });
      expect(dueDecision(sent, over, sam, now)).toMatchObject({ kind: "close-to-finishing", stage: "working" });
    });

    it(`on a set of ${n} counts only the students in the room`, () => {
      // Five classmates and Sam past Q${k}, then two of those classmates marked absent: four of eight is not more than half.
      const set = madeUp(n, [k, k, k, k, k, 0, 0, 0, 0], ["m0", "m1"]);
      const sam = samPast(k, set.problems);
      expect(closeEvidence(sent, set, sam, now)).toMatchObject({ submitted: 4, present: 8 });
      expect(dueDecision(sent, set, sam, now)).toBeNull();
      // An absent student who had not got there leaving the room tips it: five of nine.
      const tipped = madeUp(n, [k, k, k, k, 0, 0, 0, 0, 0], ["m5"]);
      expect(closeEvidence(sent, tipped, sam, now)).toMatchObject({ submitted: 5, present: 9 });
      expect(dueDecision(sent, tipped, sam, now)).not.toBeNull();
    });
  }

  it("counts Sam once he has written on the question and moved off it, or handed in with work on it", () => {
    const problems = ASSIGNMENT.problems;
    expect(sessionSubmitted(null, problems, 6)).toBe(false);
    expect(sessionSubmitted(samPast(6, problems), problems, 6)).toBe(false);
    const onQ7 = { ...samPast(7, problems), problemIndex: 6 };
    expect(sessionSubmitted(onQ7, problems, 6)).toBe(false);
    expect(sessionSubmitted(samPast(7, problems), problems, 6)).toBe(true);
    expect(sessionSubmitted({ ...samPast(7, problems), problemIndex: 2 }, problems, 6)).toBe(true);
    expect(sessionSubmitted({ ...samPast(7, problems), stage: "feedback" }, problems, 6)).toBe(true);
    expect(sessionSubmitted({ ...samPast(6, problems), stage: "feedback" }, problems, 6)).toBe(false);
  });

  it("is due only while the class is on individual working", () => {
    const { classroom, session } = skipFixture("working", now);
    expect(dueDecision(classroom, assignmentBundle(ASSIGNMENT.id, classroom)!, session, now)).not.toBeNull();
    for (const target of ["indiv review", "class wait", "group review", "class review", "report"] as const) {
      const f = skipFixture(target, now);
      expect(dueDecision(f.classroom, assignmentBundle(ASSIGNMENT.id, f.classroom)!, f.session, now)).toBeNull();
      expect(lessonDecision(f.classroom, assignmentBundle(ASSIGNMENT.id, f.classroom)!, f.session, now)).toBeNull();
    }
    expect(dueDecision(INITIAL_CLASSROOM, { problems: ASSIGNMENT.problems, classmates: CLASSMATES, absent: [] }, null, now)).toBeNull();
  });

  it("reaches the demo's trigger from the stream alone, before the first classmate hands in", () => {
    // The normal presenter path: Create at `now`, Sam on the set and not yet past Q7. Chloe is absent: nineteen in the room.
    const b = assignmentBundle(ASSIGNMENT.id, sent)!;
    const sam = sessionAt("working");
    let crossed: number | null = null;
    for (let e = 0; e <= 10 * 60_000 && crossed === null; e += 1000) if (dueDecision(sent, b, sam, now + e)) crossed = e;
    const firstHandIn = Math.min(...CLASSMATES.map((m) => scheduleFor(m, ASSIGNMENT.problems).submitAt ?? Infinity));
    expect(crossed).not.toBeNull();
    expect(closeEvidence(sent, b, sam, now + crossed!)).toEqual({ question: "Q7", number: 7, submitted: 10, present: 19 });
    expect(crossed!).toBeLessThan(firstHandIn);
    expect(dueDecision(sent, b, sam, now + crossed! - 1000)).toBeNull();
  });
});

describe("the lesson's decision", () => {
  const working = skipFixture("working", now);
  const bundle = (c: ClassroomState) => assignmentBundle(ASSIGNMENT.id, c)!;
  const at = (c: ClassroomState, s: StudentSession | null = working.session, t = now) => lessonDecision(c, bundle(c), s, t);
  const act = (c: ClassroomState, a: ClassroomAction) => classroomReducer(c, a);
  const due = { kind: "close-to-finishing" as const, stage: "working" as const, at: now };

  it("is open when it comes due, before any tab has stored it", () => {
    expect(at(working.classroom)).toMatchObject({ status: "open", stored: false, shown: "card", lapsed: false, evidence: { question: "Q7", present: 19 } });
  });

  it("raises once: a second raise keeps the first moment", () => {
    const raised = act(working.classroom, { type: "decision/raise", due });
    expect(at(raised)).toMatchObject({ status: "open", stored: true, dueAt: now, shown: "card" });
    const again = act(raised, { type: "decision/raise", due: { ...due, at: now + 5000 } });
    expect(again).toBe(raised);
  });

  it("tucks into the dot on Later and opens again from it", () => {
    const tucked = act(act(working.classroom, { type: "decision/raise", due }), { type: "decision/tuck", due });
    expect(at(tucked)).toMatchObject({ status: "tucked", shown: "dot" });
    expect(act(tucked, { type: "decision/tuck", due })).toBe(tucked);
    const reopened = act(tucked, { type: "decision/reopen", due });
    expect(at(reopened)).toMatchObject({ status: "open", shown: "card" });
  });

  it("stores itself as it acts when no tab raised it first", () => {
    const tucked = act(working.classroom, { type: "decision/tuck", due });
    expect(tucked.decisions).toEqual([{ kind: "close-to-finishing", stage: "working", dueAt: now, status: "tucked" }]);
  });

  it("is answered for good on Keep: no card, no dot, never raised again", () => {
    const kept = act(working.classroom, { type: "decision/answer", due, answer: { kind: "keep" }, at: now + 2000 });
    expect(at(kept)).toMatchObject({ status: "answered", answer: { kind: "keep" }, shown: null });
    expect(kept.decisions?.[0].answeredAt).toBe(now + 2000);
    for (const a of [{ type: "decision/raise", due }, { type: "decision/tuck", due }, { type: "decision/reopen", due }, { type: "decision/answer", due, answer: { kind: "keep" }, at: now + 9000 }] as const) expect(act(kept, a)).toBe(kept);
    // Still due by the counts, later in the stage: still answered.
    expect(at(kept, working.session, now + 60_000)?.shown).toBeNull();
  });

  it("keeps its state through a reload (the stored classroom read back)", () => {
    for (const a of [{ type: "decision/raise", due }, { type: "decision/tuck", due }, { type: "decision/answer", due, answer: { kind: "keep" }, at: now }] as const) {
      const c = act(working.classroom, a);
      const reloaded = migrateClassroom(JSON.parse(JSON.stringify(c)));
      expect(at(reloaded)).toEqual(at(c));
    }
  });

  it("lapses when the stage ends unanswered, open or tucked: the pathway unchanged, nothing shown", () => {
    for (const status of ["open", "tucked"] as const) {
      let c = act(working.classroom, { type: "decision/raise", due });
      if (status === "tucked") c = act(c, { type: "decision/tuck", due });
      // Force submit's minute runs out: Sam's session applies it and hands in, the class is on individual review.
      const handedIn: StudentSession = { ...sessionAt("feedback") };
      expect(currentClassStage(c, handedIn, now)).toBe("individual");
      expect(at(c, handedIn)).toMatchObject({ status, lapsed: true, shown: null });
      expect(c.assignment?.pathway).toEqual(DEMO_PATHWAY);
      // The presenter's "students done" jump does the same.
      const done = teacherSkip("done", c, working.session, now);
      expect(done.classroom.assignment?.pathway).toEqual(DEMO_PATHWAY);
      expect(at(done.classroom, done.session)?.shown).toBeNull();
    }
  });

  it("starts over with a new lesson", () => {
    const c = act(working.classroom, { type: "decision/tuck", due });
    expect(act(c, demoSend(DEMO_PATHWAY, now)).decisions).toBeUndefined();
    expect(teacherSkip("send", c, working.session, now).classroom.decisions).toBeUndefined();
  });

  it("keeps an unrelated list untouched", () => {
    expect(decisionsReducer(undefined, { type: "decision/raise", due })).toHaveLength(1);
    const list = decisionsReducer(undefined, { type: "decision/answer", due, answer: { kind: "keep" }, at: now });
    expect(decisionsReducer(list, { type: "decision/tuck", due })).toBe(list);
  });

  it("shows on Edexia Classroom and the live set's Class View and Mistakes only", () => {
    expect(decisionScreen("/teacher", ASSIGNMENT.id)).toBe("classroom");
    expect(decisionScreen(`/teacher/a/${ASSIGNMENT.id}/class`, ASSIGNMENT.id)).toBe("class");
    expect(decisionScreen(`/teacher/a/${ASSIGNMENT.id}/mistakes`, ASSIGNMENT.id)).toBe("mistakes");
    for (const p of [`/teacher/a/${ASSIGNMENT.id}/groups`, `/teacher/a/${ASSIGNMENT.id}/report`, "/teacher/a/pset-5/class", "/teacher/students", "/teacher/whole-class", null]) expect(decisionScreen(p, ASSIGNMENT.id)).toBeNull();
  });

  it("never counts Sam as absent on the live set", () => {
    const c = act(working.classroom, { type: "absence/set", assignment: ASSIGNMENT.id, student: DEMO_STUDENT.id, absent: true });
    expect(at(c)?.evidence.present).toBe(19);
  });
});
