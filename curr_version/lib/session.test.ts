import { describe, expect, it } from "vitest";
import { INITIAL_SESSION, INITIAL_WARMUP, sessionAt, sessionReducer, warmupProblem } from "./session";
import { PRACTICE, WARMUP_BANK } from "@/data/practice";
import { warmupScript } from "./warmup";
import { allPathways } from "./pathway";
import type { Pathway } from "@/data/types";

describe("student session flow", () => {
  it("declining practice goes to the confidence survey, and the answer starts the set", () => {
    let s = sessionReducer(INITIAL_SESSION, { type: "practice/decline" });
    expect(s.stage).toBe("confidence");
    expect(s.practice).toBe("declined");
    s = sessionReducer(s, { type: "confidence/set", confidence: { level: "low-when", category: "algebra" } });
    expect(s.stage).toBe("working");
    expect(s.confidence).toEqual({ level: "low-when", category: "algebra" });
  });

  it("accepting practice asks about confidence first, then opens the chooser, then the warm-up, then the set", () => {
    let s = sessionReducer(INITIAL_SESSION, { type: "practice/accept" });
    expect(s.stage).toBe("confidence");
    expect(s.practice).toBe("taken");
    s = sessionReducer(s, { type: "confidence/set", confidence: { level: "confident" } });
    expect(s.stage).toBe("warmup-pick");
    expect(sessionReducer(s, { type: "warmup/begin" })).toBe(s);
    s = sessionReducer(s, { type: "warmup/select", problem: "q2" });
    s = sessionReducer(s, { type: "warmup/begin" });
    expect(s.stage).toBe("practice");
    s = sessionReducer(s, { type: "practice/finish" });
    expect(s.stage).toBe("working");
  });

  it("the chooser keeps the selection and the chat, and the tutor answers each message", () => {
    let s = sessionAt("warmup-pick");
    s = sessionReducer(s, { type: "warmup/select", problem: "q1" });
    s = sessionReducer(s, { type: "warmup/select", problem: "q4" });
    s = sessionReducer(s, { type: "warmup/select", problem: "q1" });
    expect(s.warmup.selected).toEqual(["q4"]);
    expect(sessionReducer(s, { type: "warmup/say", text: "   " })).toBe(s);
    s = sessionReducer(s, { type: "warmup/say", text: "fractions, and Q2" });
    expect(s.warmup.messages.map((m) => m.from)).toEqual(["student", "tutor"]);
    expect(s.warmup.messages[1].text).toMatch(/^Got it\. Warming up on /);
    expect(warmupProblem(s).id).toBe("w-fraction-nonmonic");
  });

  it("deep-linking past the survey fills in earlier answers", () => {
    expect(sessionAt("working").confidence).not.toBeNull();
    expect(sessionAt("working").practice).toBe("declined");
    expect(sessionAt("practice").confidence).not.toBeNull();
    expect(sessionAt("practice").practice).toBe("taken");
    expect(sessionAt("warmup-pick").practice).toBe("taken");
    expect(sessionAt("warmup-pick").warmup.selected).toEqual([]);
    expect(warmupProblem(sessionAt("practice")).id).toBe("w-fraction-nonmonic");
    expect(sessionAt("confidence").confidence).toBeNull();
    expect(sessionAt("overview")).toEqual(INITIAL_SESSION);
  });

  it("recognised lines are kept per problem and undo withdraws them", () => {
    let s = sessionAt("working");
    s = sessionReducer(s, { type: "line/reveal", problem: "q1", line: { tex: "a", strokeCount: 3 } });
    s = sessionReducer(s, { type: "line/reveal", problem: "q1", line: { tex: "b", strokeCount: 6 } });
    s = sessionReducer(s, { type: "problem/goto", index: 1 });
    s = sessionReducer(s, { type: "line/reveal", problem: "q2", line: { tex: "c", strokeCount: 2 } });
    expect(s.lines.q1.map((l) => l.tex)).toEqual(["a", "b"]);
    expect(s.lines.q2.map((l) => l.tex)).toEqual(["c"]);
    s = sessionReducer(s, { type: "lines/undo", problem: "q1", strokeCount: 5 });
    expect(s.lines.q1.map((l) => l.tex)).toEqual(["a"]);
    s = sessionReducer(s, { type: "lines/clear", problem: "q1" });
    expect(s.lines.q1).toEqual([]);
    expect(s.problemIndex).toBe(1);
  });
});

describe("the warm-up on the pad", () => {
  // The default warm-up (monic) on the pad: a chooser run that named factorising only.
  const start = sessionReducer({ ...sessionAt("practice"), warmup: INITIAL_WARMUP }, { type: "warmup/say", text: "monic factorising" });
  it("that run's warm-up is the monic problem", () => expect(warmupProblem(start).id).toBe("w-monic"));
  const reveal = (s: ReturnType<typeof sessionAt>, problem: string, tex: string, strokeCount: number) =>
    sessionReducer(s, { type: "warmup/reveal", problem, line: { tex, strokeCount } });

  it("keeps its lines and ink apart from the marked work, with undo and clear of its own", () => {
    let s = sessionReducer(start, { type: "warmup/stroke", problem: "w-monic", stroke: [{ x: 1.26, y: 2 }] });
    s = reveal(s, "w-monic", "a", 1);
    s = sessionReducer(s, { type: "warmup/stroke", problem: "w-monic", stroke: [{ x: 3, y: 4 }] });
    s = reveal(s, "w-monic", "b", 2);
    expect(s.warmup.lines["w-monic"].map((l) => l.tex)).toEqual(["a", "b"]);
    expect(s.warmup.ink["w-monic"]).toEqual([[{ x: 1.3, y: 2 }], [{ x: 3, y: 4 }]]);
    expect(s.lines).toEqual({});
    expect(s.ink).toEqual({});
    expect(s.escalation).toEqual(start.escalation);
    s = sessionReducer(s, { type: "warmup/undo", problem: "w-monic" });
    expect(s.warmup.lines["w-monic"].map((l) => l.tex)).toEqual(["a"]);
    expect(s.warmup.ink["w-monic"]).toHaveLength(1);
    s = sessionReducer(s, { type: "warmup/clear", problem: "w-monic" });
    expect(s.warmup.lines["w-monic"]).toEqual([]);
    expect(s.warmup.ink["w-monic"]).toEqual([]);
  });

  it("a hint is remembered per problem and asked for once", () => {
    let s = sessionReducer(start, { type: "warmup/hint" });
    expect(s.warmup.hinted).toEqual(["w-monic"]);
    expect(sessionReducer(s, { type: "warmup/hint" })).toBe(s);
    s = sessionReducer(s, { type: "warmup/example" });
    for (let i = 0; i < 4; i++) s = sessionReducer(s, { type: "warmup/example-step" });
    s = sessionReducer(s, { type: "warmup/next" });
    s = sessionReducer(s, { type: "warmup/hint" });
    expect(s.warmup.hinted).toEqual(["w-monic", "w-monic-2"]);
  });

  it("the worked example reveals one step at a time, and only its completion unlocks the follow-up", () => {
    expect(sessionReducer(start, { type: "warmup/next" })).toBe(start);
    let s = sessionReducer(start, { type: "warmup/example" });
    expect(s.warmup.example).toBe(true);
    expect(sessionReducer(start, { type: "warmup/example-step" })).toBe(start);
    s = sessionReducer(s, { type: "warmup/example-step" });
    s = sessionReducer(s, { type: "warmup/example-step" });
    expect(s.warmup.exampleShown).toBe(2);
    expect(s.warmup.exampled).toEqual([]);
    expect(sessionReducer(s, { type: "warmup/next" })).toBe(s);
    s = sessionReducer(s, { type: "warmup/example-step" });
    s = sessionReducer(s, { type: "warmup/example-step" });
    expect(s.warmup.exampleShown).toBe(4);
    expect(s.warmup.exampled).toEqual(["w-monic"]);
    expect(sessionReducer(s, { type: "warmup/example-step" }).warmup.exampleShown).toBe(4);
    s = sessionReducer(s, { type: "warmup/next" });
    expect(s.warmup.problem).toBe("second");
    expect(s.warmup.example).toBe(false);
    expect(s.warmup.exampleShown).toBe(0);
    expect(warmupProblem(s).id).toBe("w-monic-2");
    expect(sessionReducer(s, { type: "warmup/next" })).toBe(s);
    s = sessionReducer(s, { type: "warmup/example" });
    for (let i = 0; i < 3; i++) s = sessionReducer(s, { type: "warmup/example-step" });
    expect(s.warmup.exampled).toEqual(["w-monic", "w-monic-2"]);
    expect(sessionReducer(s, { type: "practice/finish" }).stage).toBe("working");
  });

  it("every warm-up problem and follow-up has a recognition script the pad can read line by line", () => {
    for (const p of WARMUP_BANK) {
      expect(warmupScript(p).length).toBeGreaterThan(0);
      if (p.followUp) {
        expect(warmupScript(p.followUp).length).toBeGreaterThan(0);
        expect(p.followUp.leaf).toBe(p.leaf);
      }
    }
    expect(warmupProblem(start).id).toBe(PRACTICE.id);
  });
});

describe("escalation inside the session", () => {
  const reveal = (s: ReturnType<typeof sessionAt>, problem: string, tex: string, strokeCount: number) =>
    sessionReducer(s, { type: "line/reveal", problem, line: { tex, strokeCount } });

  it("the scripted run: Q1's factorising slip passes, Q2's triggers the prompt", () => {
    let s = sessionAt("working");
    s = reveal(s, "q1", "x^2 - 5x + 6 = 0", 5);
    s = reveal(s, "q1", "(x + 2)(x + 3) = 0", 12);
    expect(s.prompt).toBeNull();
    expect(s.escalation.counts["algebra.expand-factor"]).toBe(1);
    s = sessionReducer(s, { type: "problem/goto", index: 1 });
    s = reveal(s, "q2", "2x^2 + 7x - 4 = 0", 6);
    s = reveal(s, "q2", "(2x + 4)(x - 1) = 0", 14);
    expect(s.prompt).toEqual({ leaf: "algebra.expand-factor.nonmonic", reason: "detected" });
    expect(s.escalation.counts["algebra.expand-factor"]).toBe(0);
    expect(s.escalation.caution).toEqual([]);
  });

  it("undo and re-reveal of the same wrong line is counted once", () => {
    let s = sessionAt("working");
    s = reveal(s, "q1", "x^2 - 5x + 6 = 0", 5);
    s = reveal(s, "q1", "(x + 2)(x + 3) = 0", 12);
    s = sessionReducer(s, { type: "lines/undo", problem: "q1", strokeCount: 11 });
    s = reveal(s, "q1", "(x + 2)(x + 3) = 0", 12);
    expect(s.escalation.counts["algebra.expand-factor"]).toBe(1);
    expect(s.prompt).toBeNull();
  });

  it("accepting the prompt opens the practice overlay; finishing it returns to the same problem", () => {
    let s = sessionAt("working");
    s = reveal(s, "q1", "(x + 2)(x + 3) = 0", 3);
    s = sessionReducer(s, { type: "problem/goto", index: 1 });
    s = reveal(s, "q2", "(2x + 4)(x - 1) = 0", 3);
    s = sessionReducer(s, { type: "prompt/accept", problem: "q2" });
    expect(s.prompt).toBeNull();
    expect(s.overlay).toBe("algebra.expand-factor.nonmonic");
    s = sessionReducer(s, { type: "overlay/done" });
    expect(s.overlay).toBeNull();
    expect(s.problemIndex).toBe(1);
    expect(s.practices).toEqual([{ leaf: "algebra.expand-factor.nonmonic", reason: "detected", accepted: true, problem: "q2" }]);
  });

  it("'I need help' after a detected practice raises the caution flag", () => {
    let s = sessionAt("working");
    s = reveal(s, "q1", "(x + 2)(x + 3) = 0", 3);
    s = reveal(s, "q2", "(2x + 4)(x - 1) = 0", 3);
    s = sessionReducer(s, { type: "prompt/decline", problem: "q2" });
    expect(s.escalation.caution).toEqual([]);
    s = sessionReducer(s, { type: "help/request", leaf: "algebra.expand-factor.monic", problem: "q3" });
    expect(s.prompt).toEqual({ leaf: "algebra.expand-factor.monic", reason: "help" });
    expect(s.escalation.caution).toEqual(["algebra.expand-factor"]);
  });
});

describe("independent rework", () => {
  it("keeps the original version untouched while a second version builds up", () => {
    let s = sessionAt("rework");
    const original = s.lines.q1.map((l) => l.tex);
    s = sessionReducer(s, { type: "rework/reveal", problem: "q1", line: { tex: "(x - 2)(x - 3) = 0", strokeCount: 4 } });
    s = sessionReducer(s, { type: "rework/reveal", problem: "q1", line: { tex: "x = 2", strokeCount: 8 } });
    expect(s.rework.q1.map((l) => l.tex)).toEqual(["(x - 2)(x - 3) = 0", "x = 2"]);
    expect(s.lines.q1.map((l) => l.tex)).toEqual(original);
    s = sessionReducer(s, { type: "rework/undo", problem: "q1", strokeCount: 7 });
    expect(s.rework.q1.map((l) => l.tex)).toEqual(["(x - 2)(x - 3) = 0"]);
    expect(s.escalation).toEqual(sessionAt("rework").escalation);
  });

  it("finishing the rework hands off to the group stage", () => {
    const s = sessionReducer(sessionAt("rework"), { type: "rework/done" });
    expect(s.stage).toBe("group-pass");
  });

  it("deep links past the rework carry both versions", () => {
    const s = sessionAt("group-pass");
    expect(Object.keys(s.rework).sort()).toEqual(["q1", "q10", "q2", "q3", "q7"]);
    expect(s.lines.q1.length).toBe(3);
    expect(s.stars).toEqual(["q4"]);
  });
});

describe("group review stages", () => {
  it("quick pass → discussion → report, remembering what was talked through", () => {
    let s = sessionAt("group-pass");
    s = sessionReducer(s, { type: "group/discuss" });
    expect(s.stage).toBe("group-discuss");
    s = sessionReducer(s, { type: "group/talked", problem: "q2" });
    expect(s.talked).toEqual(["q2"]);
    s = sessionReducer(s, { type: "group/done" });
    expect(s.stage).toBe("report");
  });
});

describe("final report", () => {
  it("keeps the reflection and marks the report sent", () => {
    let s = sessionAt("report");
    expect(s.reportSent).toBe(false);
    s = sessionReducer(s, { type: "reflection/set", text: "I guessed factor pairs. Expanding back would have caught both." });
    s = sessionReducer(s, { type: "report/send" });
    expect(s.reflection).toMatch(/Expanding back/);
    expect(s.reportSent).toBe(true);
    expect(s.stars).toEqual(["q4"]);
  });
});

describe("diagnostic push", () => {
  it("interrupts, is answered once, and is logged with its recorded flag; the stage is untouched", () => {
    let s = sessionAt("working");
    s = sessionReducer(s, { type: "diagnostic/push", questionId: "d-factor-check", recorded: false });
    expect(s.diagnostic).toEqual({ questionId: "d-factor-check", recorded: false });
    expect(s.stage).toBe("working");
    s = sessionReducer(s, { type: "diagnostic/answer", option: "b" });
    expect(s.diagnostic).toBeNull();
    expect(s.diagnosticAnswers).toEqual([{ questionId: "d-factor-check", recorded: false, option: "b" }]);
    expect(s.stage).toBe("working");
    // A second answer with nothing pending is ignored.
    expect(sessionReducer(s, { type: "diagnostic/answer", option: "a" }).diagnosticAnswers.length).toBe(1);
  });

  it("can be withdrawn before it's answered", () => {
    let s = sessionReducer(sessionAt("working"), { type: "diagnostic/push", questionId: "d-factor-check", recorded: true });
    s = sessionReducer(s, { type: "diagnostic/withdraw" });
    expect(s.diagnostic).toBeNull();
    expect(s.diagnosticAnswers).toEqual([]);
  });
});

describe("routing by pathway", () => {
  const under = (pathway: Pathway) => (s: ReturnType<typeof sessionAt>, a: Parameters<typeof sessionReducer>[1]) => sessionReducer(s, a, { pathway });

  it("without an env the reducer follows the build's default pathway", () => {
    let s = sessionReducer(sessionAt("working"), { type: "hand-in", at: 7 });
    expect(s.stage).toBe("feedback");
    expect(s.handedInAt).toBe(7);
    s = sessionReducer({ ...s, stage: "rework" }, { type: "rework/done" });
    expect(s.stage).toBe("group-pass");
    s = sessionReducer({ ...s, stage: "group-discuss" }, { type: "group/done" });
    expect(s.stage).toBe("report");
  });

  it("every one of the eight pathways walks its stages in order and ends on the report", () => {
    const entry = { individual: "feedback", group: "group-pass", "whole-class": "waiting" } as const;
    for (const pathway of allPathways()) {
      const r = under(pathway);
      let s = r(sessionAt("working"), { type: "hand-in" });
      const expected = pathway.map((st) => entry[st]);
      expect(s.stage, pathway.join(",")).toBe(expected[0] ?? "report");
      if (pathway.includes("individual")) {
        s = r({ ...s, stage: "rework" }, { type: "rework/done" });
        expect(s.stage, pathway.join(",")).toBe(expected[pathway.indexOf("individual") + 1] ?? "report");
      }
      if (pathway.includes("group")) {
        s = r({ ...s, stage: "group-discuss" }, { type: "group/done" });
        expect(s.stage, pathway.join(",")).toBe(expected[pathway.indexOf("group") + 1] ?? "report");
      }
    }
  });

  it("submit-only lands on the report with the first attempt as the only version", () => {
    const s = under([])(sessionAt("working"), { type: "hand-in", at: 3 });
    expect(s.stage).toBe("report");
    expect(s.rework).toEqual({});
  });

  it("a waiting deep link is a handed-in run", () => {
    const s = sessionAt("waiting");
    expect(s.stage).toBe("waiting");
    expect(Object.keys(s.lines).length).toBeGreaterThan(0);
    expect(s.handedInAt).toBeGreaterThan(0);
  });
});

describe("persisted ink", () => {
  const stroke = (n: number) => [{ x: n + 0.123, y: 2 * n }, { x: n + 1, y: 2 * n + 1.987 }];

  it("strokes are stored per problem, rounded, and undo pops ink and lines together", () => {
    let s = sessionAt("working");
    s = sessionReducer(s, { type: "ink/stroke", problem: "q1", stroke: stroke(1) });
    s = sessionReducer(s, { type: "ink/stroke", problem: "q1", stroke: stroke(2) });
    s = sessionReducer(s, { type: "line/reveal", problem: "q1", line: { tex: "a", strokeCount: 2 } });
    s = sessionReducer(s, { type: "ink/stroke", problem: "q1", stroke: stroke(3) });
    s = sessionReducer(s, { type: "line/reveal", problem: "q1", line: { tex: "b", strokeCount: 3 } });
    expect(s.ink.q1).toHaveLength(3);
    expect(s.ink.q1[0][0]).toEqual({ x: 1.1, y: 2 });
    expect(s.ink.q1[0][1]).toEqual({ x: 2, y: 4 });
    s = sessionReducer(s, { type: "lines/undo", problem: "q1" });
    expect(s.ink.q1).toHaveLength(2);
    expect(s.lines.q1.map((l) => l.tex)).toEqual(["a"]);
    s = sessionReducer(s, { type: "lines/undo", problem: "q1" });
    expect(s.ink.q1).toHaveLength(1);
    expect(s.lines.q1).toEqual([]);
    s = sessionReducer(s, { type: "lines/undo", problem: "q1" });
    s = sessionReducer(s, { type: "lines/undo", problem: "q1" });
    expect(s.ink.q1).toEqual([]);
    s = sessionReducer(s, { type: "ink/stroke", problem: "q1", stroke: stroke(9) });
    s = sessionReducer(s, { type: "lines/clear", problem: "q1" });
    expect(s.ink.q1).toEqual([]);
    expect(s.lines.q1).toEqual([]);
  });

  it("the rework keeps its own ink, in step with its own lines", () => {
    let s = sessionAt("rework");
    s = sessionReducer(s, { type: "rework/stroke", problem: "q1", stroke: stroke(1) });
    s = sessionReducer(s, { type: "rework/reveal", problem: "q1", line: { tex: "r", strokeCount: 1 } });
    expect(s.reworkInk.q1).toHaveLength(1);
    expect(s.ink.q1 ?? []).toEqual([]);
    s = sessionReducer(s, { type: "rework/undo", problem: "q1" });
    expect(s.reworkInk.q1).toEqual([]);
    expect(s.rework.q1).toEqual([]);
    s = sessionReducer(s, { type: "rework/stroke", problem: "q1", stroke: stroke(1) });
    s = sessionReducer(s, { type: "rework/clear", problem: "q1" });
    expect(s.reworkInk.q1).toEqual([]);
  });
});

describe("rework hand-in and the guard", () => {
  const WRONG_Q4 = "x = \\dfrac{5 \\pm \\sqrt{37}}{3}";

  it("is refused while a correct problem is broken, and goes through once restored", () => {
    let s = sessionAt("rework");
    s = sessionReducer(s, { type: "rework/reveal", problem: "q4", line: { tex: WRONG_Q4, strokeCount: 1 } });
    const refused = sessionReducer(s, { type: "rework/done", at: 9 });
    expect(refused.stage).toBe("rework");
    expect(refused.reworkedAt).toBe(s.reworkedAt);
    s = sessionReducer(s, { type: "rework/clear", problem: "q4" });
    s = sessionReducer(s, { type: "rework/done", at: 9 });
    expect(s.stage).toBe("group-pass");
    expect(s.reworkedAt).toBe(9);
  });

  it("a forced hand-in goes through with the broken problem counted in the notice", () => {
    let s = sessionAt("rework");
    s = sessionReducer(s, { type: "rework/reveal", problem: "q4", line: { tex: WRONG_Q4, strokeCount: 1 } });
    s = sessionReducer(s, { type: "rework/done", force: true });
    expect(s.stage).toBe("group-pass");
    expect(s.notice).toMatch(/^6 of your problems still contain a mistake\./);
  });

  it("the post-rework notice reads the final version and can be dismissed", () => {
    let s = sessionAt("group-pass"); // fully corrected rework
    s = sessionReducer({ ...s, stage: "rework" }, { type: "rework/done" });
    expect(s.notice).toBe("Every problem holds now.");
    expect(sessionReducer(s, { type: "notice/dismiss" }).notice).toBeNull();
  });
});

describe("teacher force submit", () => {
  it("hands in as it stands, records unattempted problems, shows the notice, and follows the pathway", () => {
    let s = sessionAt("working");
    s = sessionReducer(s, { type: "line/reveal", problem: "q1", line: { tex: "x^2 - 5x + 6 = 0", strokeCount: 1 } });
    s = sessionReducer(s, { type: "advance/apply", id: "force-submit@1", kind: "force-submit", at: 77 }, { pathway: ["whole-class"] });
    expect(s.stage).toBe("waiting");
    expect(s.handedInAt).toBe(77);
    expect(s.notAttempted).toEqual(["q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"]);
    expect(s.notice).toBe("Your teacher handed in the class's work.");
    expect(s.appliedAdvances).toEqual(["force-submit@1"]);
  });

  it("is idempotent by id and leaves a student who already handed in alone", () => {
    let s = sessionAt("working");
    s = sessionReducer(s, { type: "advance/apply", id: "a", kind: "force-submit", at: 5 });
    const again = sessionReducer({ ...s, stage: "rework" }, { type: "advance/apply", id: "a", kind: "force-submit", at: 9 });
    expect(again.stage).toBe("rework");
    expect(again.handedInAt).toBe(5);
    const later = sessionReducer(sessionAt("rework"), { type: "advance/apply", id: "b", kind: "force-submit", at: 9 });
    expect(later.stage).toBe("rework");
    expect(later.appliedAdvances).toEqual(["b"]);
    expect(later.notice).toBeNull();
  });

  it("dismisses an open practice prompt or overlay on the way out", () => {
    let s = sessionAt("working");
    s = sessionReducer(s, { type: "help/request", leaf: "algebra.number.fractions", problem: "q1" });
    expect(s.prompt).not.toBeNull();
    s = sessionReducer(s, { type: "advance/apply", id: "c", kind: "force-submit" });
    expect(s.prompt).toBeNull();
    expect(s.stage).toBe("feedback");
  });
});

describe("whole-class freeze", () => {
  it("freezes wherever the student is, dismissing prompts, and releases to the report", () => {
    let s = sessionAt("working");
    s = sessionReducer(s, { type: "help/request", leaf: "algebra.number.fractions", problem: "q1" });
    s = sessionReducer(s, { type: "advance/apply", id: "wc@1", kind: "whole-class-start" });
    expect(s.stage).toBe("frozen");
    expect(s.prompt).toBeNull();
    expect(sessionReducer(s, { type: "freeze" })).toBe(s);
    const released = sessionReducer(s, { type: "release" });
    expect(released.stage).toBe("report");
    expect(sessionReducer(released, { type: "release" })).toBe(released);
  });

  it("a student mid-rework keeps their broken rework as it stands when frozen", () => {
    let s = sessionAt("rework");
    s = sessionReducer(s, { type: "rework/reveal", problem: "q4", line: { tex: "x = \\dfrac{5 \\pm \\sqrt{37}}{3}", strokeCount: 1 } });
    s = sessionReducer(s, { type: "freeze" });
    expect(s.stage).toBe("frozen");
    expect(s.rework.q4).toHaveLength(1);
  });
});

describe("teacher-written diagnostic", () => {
  it("travels with the push and stays with the answer", () => {
    const q = { id: "custom-1", stem: "Which is larger", tex: "", options: [{ id: "a", tex: "1" }, { id: "b", tex: "2" }], correct: "b" };
    let s = sessionReducer(sessionAt("working"), { type: "diagnostic/push", questionId: q.id, recorded: true, question: q });
    expect(s.diagnostic?.question).toEqual(q);
    s = sessionReducer(s, { type: "diagnostic/answer", option: "b" });
    expect(s.diagnosticAnswers[0]).toEqual({ questionId: "custom-1", recorded: true, question: q, option: "b" });
  });
});
