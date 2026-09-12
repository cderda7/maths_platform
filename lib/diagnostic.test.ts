import { describe, expect, it } from "vitest";
import { PROBLEMS } from "@/data/assignment";
import { CLASSMATES } from "@/data/classmates";
import { DIAGNOSTICS } from "@/data/diagnostic";
import { boardContent } from "./board";
import { classroomReducer, INITIAL_CLASSROOM, type ClassroomState } from "./classroom";
import { arrivesAt, boardDiagnostic, CLASS_SIZE, classmatePick, customQuestion, diagnosticFor, isCorrect, latestDiagnostic, openDiagnostic, pushBelongsTo, questionFor, runFor, tally, TRICKLE_FROM_MS, TRICKLE_TO_MS, writtenPick } from "./diagnostic";

describe("diagnostic correctness", () => {
  it("knows the right option of a fixture question", () => {
    expect(isCorrect("d-factor-check", "b")).toBe(true);
    expect(isCorrect("d-factor-check", "a")).toBe(false);
    expect(isCorrect("nope", "b")).toBe(false);
  });

  it("a teacher-written question travels with the push and is judged by its own key", () => {
    const q = customQuestion("Which is larger", "", ["\\tfrac{1}{3}", "\\tfrac{1}{4}", "", ""], "a", 7)!;
    expect(q.id).toBe("custom-7");
    expect(q.options.map((o) => o.id)).toEqual(["a", "b"]);
    expect(isCorrect(q.id, "a", q)).toBe(true);
    expect(isCorrect(q.id, "b", q)).toBe(false);
    expect(isCorrect(q.id, "a")).toBe(false); // not a fixture
    expect(questionFor(q.id, q)).toBe(q);
  });

  it("needs a stem, two options and a correct one among them", () => {
    expect(customQuestion("", "", ["a", "b"], "a")).toBeNull();
    expect(customQuestion("Q", "", ["a", "", "", ""], "a")).toBeNull();
    expect(customQuestion("Q", "", ["a", "b", "", ""], "c")).toBeNull();
    expect(customQuestion("Q", "", ["", "b", "c", ""], "b")?.options.map((o) => o.id)).toEqual(["b", "c"]);
  });

  it("a question written on the mistake view is filed under its problem; the class view's carries none", () => {
    expect(customQuestion("Q", "", ["a", "b"], "a", 1, "q3")?.problemId).toBe("q3");
    expect(customQuestion("Q", "", ["a", "b"], "a", 1)).not.toHaveProperty("problemId");
  });
});

describe("one suggested check per problem", () => {
  it("every problem of the assignment has its own fixture, well formed", () => {
    for (const p of PROBLEMS) {
      const d = diagnosticFor(p.id);
      expect(d.problemId, p.id).toBe(p.id);
      expect(d.options.length, d.id).toBeGreaterThanOrEqual(2);
      expect(d.options.some((o) => o.id === d.correct), d.id).toBe(true);
      expect(new Set(d.options.map((o) => o.id)).size, d.id).toBe(d.options.length);
    }
    expect(new Set(DIAGNOSTICS.map((d) => d.id)).size).toBe(DIAGNOSTICS.length);
  });

  it("the class view's example stays the first fixture, and an unknown problem falls back to it", () => {
    expect(DIAGNOSTICS[0].id).toBe("d-factor-check");
    expect(diagnosticFor("q2")).toBe(DIAGNOSTICS[0]);
    expect(diagnosticFor("q99")).toBe(DIAGNOSTICS[0]);
  });

  it("every distractor names its misconception in five words or fewer; the right option names none (ticket 137)", () => {
    for (const d of DIAGNOSTICS)
      for (const o of d.options) {
        if (o.id === d.correct) expect(o.misconception, `${d.id} ${o.id}`).toBeUndefined();
        else {
          expect(o.misconception, `${d.id} ${o.id}`).toBeTruthy();
          expect(o.misconception!.split(/\s+/).length, `${d.id} ${o.id}: ${o.misconception}`).toBeLessThanOrEqual(5);
        }
      }
  });

  it("the authored picks name real classmates, on distractors only, each classmate at most once per question", () => {
    const ids = new Set(CLASSMATES.map((c) => c.id));
    for (const d of DIAGNOSTICS) {
      expect(d.picks, d.id).toBeDefined();
      const seen = new Set<string>();
      for (const [option, who] of Object.entries(d.picks!)) {
        expect(option, d.id).not.toBe(d.correct);
        expect(d.options.some((o) => o.id === option), `${d.id} ${option}`).toBe(true);
        for (const id of who ?? []) {
          expect(ids.has(id), `${d.id}: ${id}`).toBe(true);
          expect(seen.has(id), `${d.id}: ${id} twice`).toBe(false);
          seen.add(id);
        }
      }
    }
  });
});

describe("which panel a push belongs to", () => {
  const q3 = diagnosticFor("q3");
  const q2 = diagnosticFor("q2");

  it("a fixture push belongs to the panel showing that fixture, wherever it was sent from", () => {
    expect(pushBelongsTo({ questionId: q3.id }, q3, "q3")).toBe(true);
    expect(pushBelongsTo({ questionId: q3.id }, q2, "q2")).toBe(false);
    // The class view shows the q2 fixture: its push shows on both the class view and Q2's panel.
    expect(pushBelongsTo({ questionId: q2.id }, q2)).toBe(true);
    expect(pushBelongsTo({ questionId: q2.id }, q2, "q2")).toBe(true);
  });

  it("a teacher-written push belongs to the problem it was written under, the class view's to no problem", () => {
    const underQ3 = customQuestion("Q", "", ["a", "b"], "a", 1, "q3")!;
    const onClassView = customQuestion("Q", "", ["a", "b"], "a", 1)!;
    expect(pushBelongsTo({ questionId: underQ3.id, question: underQ3 }, q3, "q3")).toBe(true);
    expect(pushBelongsTo({ questionId: underQ3.id, question: underQ3 }, q2, "q2")).toBe(false);
    expect(pushBelongsTo({ questionId: underQ3.id, question: underQ3 }, q2)).toBe(false);
    expect(pushBelongsTo({ questionId: onClassView.id, question: onClassView }, q2)).toBe(true);
    expect(pushBelongsTo({ questionId: onClassView.id, question: onClassView }, q2, "q2")).toBe(false);
  });
});

const T0 = 1_700_000_000_000;
const push = (c: ClassroomState, questionId: string, at = T0, question?: ReturnType<typeof customQuestion>) => classroomReducer(c, { type: "diagnostic/push", questionId, at, ...(question ? { question } : {}) });

describe("the class's answers (ticket 137)", () => {
  const q3 = diagnosticFor("q3");
  const run = push(INITIAL_CLASSROOM, q3.id).diagnostics![0];

  it("twenty answer: the demo student and the nineteen classmates", () => {
    expect(CLASS_SIZE).toBe(20);
    expect(CLASSMATES.length).toBe(19);
  });

  it("the classmates' answers land spread between 1.5 and 8 seconds after the push, no two at once, in a fixed order", () => {
    const times = CLASSMATES.map((_, i) => arrivesAt(i));
    expect(Math.min(...times)).toBe(TRICKLE_FROM_MS);
    expect(Math.max(...times)).toBe(TRICKLE_TO_MS);
    expect(new Set(times).size).toBe(times.length);
    // Not roster order: the first classmate is not the first to answer.
    expect(times[1]).not.toBe(times[0] + (TRICKLE_TO_MS - TRICKLE_FROM_MS) / (CLASSMATES.length - 1));
  });

  it("a fixture's picks: the named classmates take their distractor, everyone else the right answer", () => {
    const noah = CLASSMATES.findIndex((c) => c.id === "noah");
    const priya = CLASSMATES.findIndex((c) => c.id === "priya");
    expect(classmatePick(q3, noah)).toBe("a");
    expect(classmatePick(q3, priya)).toBe(q3.correct);
  });

  it("a written question: three in five take the marked answer, the rest spread across every distractor", () => {
    const q = customQuestion("Q", "", ["p", "q", "r", "s"], "c", 1, "q3")!;
    const picks = CLASSMATES.map((_, i) => writtenPick(q, i));
    const right = picks.filter((p) => p === "c").length;
    expect(right).toBeGreaterThan(CLASSMATES.length / 2);
    expect(right).toBeLessThan(CLASSMATES.length);
    for (const d of ["a", "b", "d"]) expect(picks).toContain(d);
    // Two options only: the one distractor takes the rest.
    const two = customQuestion("Q", "", ["p", "q"], "a", 1)!;
    expect(new Set(CLASSMATES.map((_, i) => writtenPick(two, i)))).toEqual(new Set(["a", "b"]));
  });

  it("the tally at the push is empty, climbs as the classmates land, and is complete only with the demo student's answer", () => {
    const t0 = tally(run, T0);
    expect(t0.answered).toBe(0);
    expect(t0.total).toBe(20);
    expect(Object.keys(t0.counts).sort()).toEqual(["a", "b", "c", "d"]);
    expect(Object.values(t0.counts).every((n) => n === 0)).toBe(true);
    const mid = tally(run, T0 + (TRICKLE_FROM_MS + TRICKLE_TO_MS) / 2);
    expect(mid.answered).toBeGreaterThan(0);
    expect(mid.answered).toBeLessThan(19);
    const late = tally(run, T0 + TRICKLE_TO_MS);
    expect(late.answered).toBe(19);
    expect(late.complete).toBe(false);
    expect(Object.values(late.counts).reduce((a, b) => a + b, 0)).toBe(19);
    // Q3's authored picks: four on a, one on b, one on d, thirteen right.
    expect(late.counts).toEqual({ a: 4, b: 1, c: 13, d: 1 });
    const answered = classroomReducer(push(INITIAL_CLASSROOM, q3.id), { type: "diagnostic/answer", option: "c" }).diagnostics![0];
    const done = tally(answered, T0 + TRICKLE_TO_MS);
    expect(done.answered).toBe(20);
    expect(done.complete).toBe(true);
    expect(done.counts.c).toBe(14);
    // The demo student's answer counts the moment it is given, before the classmates are all in.
    expect(tally(answered, T0).answered).toBe(1);
  });

  it("a push of a question nobody knows tallies nothing", () => {
    const t = tally({ questionId: "nope", pushedAt: T0 }, T0 + TRICKLE_TO_MS);
    expect(t.answered).toBe(0);
    expect(t.counts).toEqual({});
  });
});

describe("diagnostic runs on the classroom (ticket 137)", () => {
  const q3 = diagnosticFor("q3");
  const q5 = diagnosticFor("q5");

  it("a push opens a run stamped with its time; a second push is refused while it is open", () => {
    const c = push(INITIAL_CLASSROOM, q3.id);
    expect(openDiagnostic(c)).toEqual({ questionId: q3.id, pushedAt: T0 });
    expect(latestDiagnostic(c)).toBe(openDiagnostic(c));
    expect(push(c, q5.id, T0 + 1)).toBe(c);
    expect(openDiagnostic(INITIAL_CLASSROOM)).toBeNull();
    expect(latestDiagnostic(null)).toBeNull();
  });

  it("the demo student's answer closes the run and keeps it as the latest result; a second answer is ignored", () => {
    let c = push(INITIAL_CLASSROOM, q3.id);
    c = classroomReducer(c, { type: "diagnostic/answer", option: "c" });
    expect(openDiagnostic(c)).toBeNull();
    expect(latestDiagnostic(c)?.answer).toBe("c");
    expect(classroomReducer(c, { type: "diagnostic/answer", option: "a" })).toBe(c);
    // The next push is allowed now and becomes the latest; the first stays in the list.
    c = push(c, q5.id, T0 + 60_000);
    expect(c.diagnostics).toHaveLength(2);
    expect(latestDiagnostic(c)?.questionId).toBe(q5.id);
  });

  it("withdrawing drops the open run and nothing else; with nothing open it is a no-op", () => {
    let c = push(INITIAL_CLASSROOM, q3.id);
    c = classroomReducer(c, { type: "diagnostic/answer", option: "c" });
    c = push(c, q5.id, T0 + 60_000);
    c = classroomReducer(c, { type: "diagnostic/withdraw" });
    expect(c.diagnostics?.map((r) => r.questionId)).toEqual([q3.id]);
    expect(classroomReducer(c, { type: "diagnostic/withdraw" })).toBe(c);
    expect(classroomReducer(INITIAL_CLASSROOM, { type: "diagnostic/withdraw" })).toBe(INITIAL_CLASSROOM);
  });

  it("a teacher-written question travels with the run", () => {
    const q = customQuestion("Q", "", ["p", "q"], "a", 1, "q3")!;
    const c = push(INITIAL_CLASSROOM, q.id, T0, q);
    expect(openDiagnostic(c)?.question).toEqual(q);
  });

  it("each panel reads its own latest run: Q3's keeps Q3's result after Q5's question goes out", () => {
    let c = push(INITIAL_CLASSROOM, q3.id);
    c = classroomReducer(c, { type: "diagnostic/answer", option: "c" });
    c = push(c, q5.id, T0 + 60_000);
    expect(runFor(c, q3, "q3")?.questionId).toBe(q3.id);
    expect(runFor(c, q5, "q5")?.questionId).toBe(q5.id);
    expect(runFor(c, diagnosticFor("q7"), "q7")).toBeNull();
    // A written question under Q3 is Q3's latest on its own tab; the fixture's panel keeps the fixture run.
    const q = customQuestion("Q", "", ["p", "q"], "a", 1, "q3")!;
    c = classroomReducer(c, { type: "diagnostic/answer", option: "b" });
    c = push(c, q.id, T0 + 120_000, q);
    expect(runFor(c, q3, "q3")?.questionId).toBe(q.id);
    expect(runFor(c, q3, "q3", true)?.questionId).toBe(q.id);
    expect(runFor(c, q3, "q3", false)?.questionId).toBe(q3.id);
    expect(runFor(c, q5, "q5", true)).toBeNull();
  });

  it("reset clears the runs", () => {
    expect(classroomReducer(push(INITIAL_CLASSROOM, q3.id), { type: "reset" }).diagnostics).toBeUndefined();
  });
});

describe("the diagnostic on the board (ticket 137)", () => {
  const q3 = diagnosticFor("q3");
  const q5 = diagnosticFor("q5");
  const allIn = T0 + TRICKLE_TO_MS;

  it("stays off the board while the run is open, even with every classmate in", () => {
    const c = push(INITIAL_CLASSROOM, q3.id);
    expect(boardDiagnostic(c, allIn)).toBeNull();
    expect(boardContent(c, null, allIn).kind).toBe("blank");
  });

  it("goes up on its own once all twenty have answered, with the question and the counts", () => {
    const c = classroomReducer(push(INITIAL_CLASSROOM, q3.id), { type: "diagnostic/answer", option: "c" });
    expect(boardDiagnostic(c, T0)).toBeNull(); // the demo student first, classmates still landing
    expect(boardDiagnostic(c, allIn)?.questionId).toBe(q3.id);
    const b = boardContent(c, null, allIn);
    expect(b.kind).toBe("diagnostic");
    if (b.kind === "diagnostic") {
      expect(b.question.id).toBe(q3.id);
      expect(b.tally.answered).toBe(20);
      expect(b.tally.counts.c).toBe(14);
    }
  });

  it("the teacher can put it up before everyone is in, and clear it after; a cleared run stays cleared", () => {
    let c = push(INITIAL_CLASSROOM, q3.id);
    c = classroomReducer(c, { type: "diagnostic/board", on: true });
    expect(boardDiagnostic(c, T0)?.questionId).toBe(q3.id);
    expect(boardContent(c, null, T0).kind).toBe("diagnostic");
    c = classroomReducer(c, { type: "diagnostic/board", on: false });
    expect(boardDiagnostic(c, T0)).toBeNull();
    c = classroomReducer(c, { type: "diagnostic/answer", option: "c" });
    expect(boardDiagnostic(c, allIn)).toBeNull();
    expect(classroomReducer(INITIAL_CLASSROOM, { type: "diagnostic/board", on: true })).toBe(INITIAL_CLASSROOM);
  });

  it("a new question replaces the old one on the board: only the latest run is ever shown", () => {
    let c = classroomReducer(push(INITIAL_CLASSROOM, q3.id), { type: "diagnostic/answer", option: "c" });
    expect(boardDiagnostic(c, allIn)?.questionId).toBe(q3.id);
    c = push(c, q5.id, allIn);
    expect(boardDiagnostic(c, allIn)).toBeNull();
    c = classroomReducer(c, { type: "diagnostic/answer", option: "b" });
    expect(boardDiagnostic(c, allIn + TRICKLE_TO_MS)?.questionId).toBe(q5.id);
  });

  it("outranks the race and a projected slide", () => {
    let c = classroomReducer(INITIAL_CLASSROOM, { type: "wc/setup", problems: ["q1"], examples: {} });
    c = classroomReducer(c, { type: "wc/project", at: T0 });
    expect(boardContent(c, null, T0).kind).toBe("whole-class");
    c = classroomReducer(push(c, q3.id), { type: "diagnostic/board", on: true });
    expect(boardContent(c, null, T0).kind).toBe("diagnostic");
    c = classroomReducer(c, { type: "diagnostic/board", on: false });
    expect(boardContent(c, null, T0).kind).toBe("whole-class");
  });
});
