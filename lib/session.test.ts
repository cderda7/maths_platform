import { describe, expect, it } from "vitest";
import { DEMO_CONFIDENCE, INITIAL_RUN, INITIAL_SESSION, INITIAL_WARMUP, hydrateSession, runProblem, sessionAt, sessionReducer, warmupFocus, warmupOffered, warmupProblem, warmupSeed, type StudentSession } from "./session";
import { PRACTICE, WARMUP_BANK } from "@/data/practice";
import { warmupScript } from "./warmup";
import { allPathways } from "./pathway";
import type { Confidence, Pathway } from "@/data/types";

describe("student session flow", () => {
  it("START goes to the confidence question, and \"confident\" opens Q1 with no warm-up offered", () => {
    let s = sessionReducer(INITIAL_SESSION, { type: "overview/start" });
    expect(s.stage).toBe("confidence");
    expect(s.practice).toBeNull();
    expect(warmupOffered(s)).toBe(false);
    s = sessionReducer(s, { type: "confidence/set", confidence: { level: "confident" } });
    expect(s.stage).toBe("working");
    expect(s.practice).toBe("declined");
    expect(s.confidence).toEqual({ level: "confident" });
  });

  it("a not-confident answer stays on the screen with the warm-up offered; \"Start the set\" opens Q1", () => {
    let s = sessionReducer(INITIAL_SESSION, { type: "overview/start" });
    s = sessionReducer(s, { type: "confidence/set", confidence: { level: "low-when", leaves: ["algebra.number.fractions"] } });
    expect(s.stage).toBe("confidence");
    expect(s.practice).toBeNull();
    expect(warmupOffered(s)).toBe(true);
    expect(s.confidence).toEqual({ level: "low-when", leaves: ["algebra.number.fractions"] });
    // The answer is in: a second answer is ignored.
    expect(sessionReducer(s, { type: "confidence/set", confidence: { level: "confident" } })).toBe(s);
    s = sessionReducer(s, { type: "warmup/decline" });
    expect(s.stage).toBe("working");
    expect(s.practice).toBe("declined");
    expect(warmupOffered(s)).toBe(false);
    expect(sessionReducer(s, { type: "warmup/accept" })).toBe(s);
  });

  it("the offer is only open after a not-confident answer", () => {
    expect(sessionReducer(INITIAL_SESSION, { type: "warmup/accept" })).toBe(INITIAL_SESSION);
    const asked = sessionReducer(INITIAL_SESSION, { type: "overview/start" });
    expect(sessionReducer(asked, { type: "warmup/accept" })).toBe(asked);
    expect(sessionReducer(asked, { type: "warmup/decline" })).toBe(asked);
    expect(sessionReducer(INITIAL_SESSION, { type: "confidence/set", confidence: { level: "low" } })).toBe(INITIAL_SESSION);
  });

  it("\"Warm up\" after a not-confident answer opens the concerns chat, one question per ticked skill, then the warm-up, then the set", () => {
    let s = sessionReducer(INITIAL_SESSION, { type: "overview/start" });
    s = sessionReducer(s, { type: "confidence/set", confidence: { level: "low-when", leaves: ["algebra.expand-factor.monic", "algebra.number.fractions"] } });
    expect(s.stage).toBe("confidence");
    s = sessionReducer(s, { type: "warmup/accept" });
    expect(s.practice).toBe("taken");
    expect(s.stage).toBe("warmup-chat");
    expect(warmupSeed(s)).toEqual(["algebra.expand-factor.monic", "algebra.number.fractions"]);
    expect(sessionReducer(s, { type: "warmup/say", text: "   " })).toBe(s);
    s = sessionReducer(s, { type: "warmup/say", text: "i mix up the signs" });
    expect(s.stage).toBe("warmup-chat");
    expect(s.warmup.messages).toEqual([{ from: "student", text: "i mix up the signs" }]);
    s = sessionReducer(s, { type: "warmup/say", text: "dividing them" });
    expect(s.stage).toBe("practice");
    expect(s.warmup.messages.map((m) => m.text)).toEqual(["i mix up the signs", "dividing them"]);
    expect(sessionReducer(s, { type: "warmup/say", text: "more" })).toBe(s);
    expect(warmupProblem(s).id).toBe("w-fractions");
    s = sessionReducer(s, { type: "practice/finish" });
    expect(s.stage).toBe("working");
  });

  it("an overall answer asks one open question, and what it names is the warm-up (nothing named: the default)", () => {
    let s = sessionReducer(sessionReducer(sessionReducer(INITIAL_SESSION, { type: "overview/start" }), { type: "confidence/set", confidence: { level: "low" } }), { type: "warmup/accept" });
    expect(s.stage).toBe("warmup-chat");
    expect(warmupSeed(s)).toEqual([]);
    const named = sessionReducer(s, { type: "warmup/say", text: "fractions and Q2" });
    expect(named.stage).toBe("practice");
    expect(warmupFocus(named)).toEqual(["algebra.number.fractions", "algebra.expand-factor.nonmonic", "unit.u1.nfl"]);
    s = sessionReducer(s, { type: "warmup/say", text: "not sure really" });
    expect(s.stage).toBe("practice");
    expect(warmupProblem(s).id).toBe(PRACTICE.id);
  });

  it("an answer that names a question adds that question's skills to the warm-up", () => {
    const s = sessionAt("practice");
    expect(warmupSeed(s)).toEqual(["algebra.expand-factor.monic", "algebra.number.fractions", "unit.u1.nfl"]);
    expect(warmupFocus(s)).toEqual(["algebra.expand-factor.monic", "algebra.number.fractions", "unit.u1.nfl", "algebra.expand-factor.nonmonic"]);
  });

  it("the warm-up walks its skills one at a time, marks each done, and hands over to the set after the last", () => {
    let s = sessionAt("practice");
    expect(s.warmup.step).toBe(0);
    expect(warmupProblem(s).id).toBe("w-fractions");
    s = sessionReducer(s, { type: "run/hint", run: "warmup" });
    s = sessionReducer(s, { type: "warmup/skill-done" });
    expect(s.stage).toBe("practice");
    expect(s.warmup.step).toBe(1);
    expect(s.warmup.done).toEqual(["w-fractions"]);
    expect(warmupProblem(s).id).toBe("w-monic");
    expect(s.warmup.hinted).toEqual(["w-fractions"]);
    s = sessionReducer(s, { type: "warmup/skill-done" });
    expect(warmupProblem(s).id).toBe("w-nfl");
    s = sessionReducer(s, { type: "warmup/skill-done" });
    expect(warmupProblem(s).id).toBe("w-nonmonic");
    s = sessionReducer(s, { type: "warmup/skill-done" });
    expect(s.stage).toBe("working");
    expect(s.warmup.done).toEqual(["w-fractions", "w-monic", "w-nfl", "w-nonmonic"]);
    expect(sessionReducer(s, { type: "warmup/skill-done" })).toBe(s);
  });

  it("a tap on a chip opens that skill; Next then goes to the nearest skill not yet done, wrapping round, and the set only once all are", () => {
    let s = sessionAt("practice");
    expect(sessionReducer(s, { type: "warmup/goto", step: 0 })).toBe(s);
    expect(sessionReducer(s, { type: "warmup/goto", step: 4 })).toBe(s);
    expect(sessionReducer(s, { type: "warmup/goto", step: -1 })).toBe(s);
    s = sessionReducer(s, { type: "warmup/goto", step: 2 });
    expect(warmupProblem(s).id).toBe("w-nfl");
    expect(s.warmup.done).toEqual([]);
    s = sessionReducer(s, { type: "warmup/skill-done" });
    expect(s.warmup.done).toEqual(["w-nfl"]);
    expect(warmupProblem(s).id).toBe("w-nonmonic");
    s = sessionReducer(s, { type: "warmup/skill-done" });
    expect(warmupProblem(s).id).toBe("w-fractions");
    s = sessionReducer(s, { type: "warmup/skill-done" });
    expect(warmupProblem(s).id).toBe("w-monic");
    // Back to a finished skill: it stays done, and finishing it again does not list it twice.
    s = sessionReducer(s, { type: "warmup/goto", step: 0 });
    expect(warmupProblem(s).id).toBe("w-fractions");
    s = sessionReducer(s, { type: "warmup/skill-done" });
    expect(s.warmup.done).toEqual(["w-nfl", "w-nonmonic", "w-fractions"]);
    expect(warmupProblem(s).id).toBe("w-monic");
    expect(s.stage).toBe("practice");
    s = sessionReducer(s, { type: "warmup/skill-done" });
    expect(s.stage).toBe("working");
    expect(sessionReducer(s, { type: "warmup/goto", step: 1 })).toBe(s);
  });

  it("deep-linking past the survey fills in earlier answers", () => {
    expect(sessionAt("working").confidence).not.toBeNull();
    expect(sessionAt("working").practice).toBe("declined");
    expect(sessionAt("practice").confidence).not.toBeNull();
    expect(sessionAt("practice").practice).toBe("taken");
    expect(sessionAt("warmup-chat").practice).toBe("taken");
    expect(sessionAt("warmup-chat").warmup.messages).toEqual([]);
    expect(warmupSeed(sessionAt("warmup-chat"))).toHaveLength(3);
    expect(sessionAt("working").confidence).toEqual(DEMO_CONFIDENCE);
    expect(warmupProblem(sessionAt("practice")).id).toBe("w-fractions");
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

describe("hydrating a stored session", () => {
  it("fills in fields added since the snapshot, including inside the warm-up slice", () => {
    const old = { stage: "warmup-chat", practice: "taken", warmup: { problem: "first", example: false, exampleShown: 0, hinted: [], exampled: [], lines: {}, ink: {} } };
    const s = hydrateSession(old);
    expect(s.stage).toBe("warmup-chat");
    expect(s.warmup.messages).toEqual([]);
    expect(s.warmup.done).toEqual([]);
    expect(warmupFocus(s)).toEqual([]);
    expect(hydrateSession({ stage: "overview" }).warmup).toEqual(INITIAL_WARMUP);
    expect(hydrateSession(null)).toEqual(INITIAL_SESSION);
    expect(hydrateSession("junk")).toEqual(INITIAL_SESSION);
    expect(hydrateSession({ confidence: { level: "low-when", category: "algebra" } }).confidence).toEqual({ level: "low-when", leaves: [] });
    expect(hydrateSession({ confidence: { level: "low" } }).confidence).toEqual({ level: "low" });
  });
});

describe("the warm-up on the pad", () => {
  // The default warm-up (monic) on the pad: a run whose only ticked skill is factorising.
  const start: StudentSession = { ...sessionAt("practice"), confidence: DEMO_CONFIDENCE, warmup: INITIAL_WARMUP };
  it("that run's warm-up is the monic problem", () => expect(warmupProblem(start).id).toBe("w-monic"));
  const reveal = (s: ReturnType<typeof sessionAt>, problem: string, tex: string, strokeCount: number) =>
    sessionReducer(s, { type: "run/reveal", run: "warmup", problem, line: { tex, strokeCount } });

  it("keeps its lines and ink apart from the marked work, with undo and clear of its own", () => {
    let s = sessionReducer(start, { type: "run/stroke", run: "warmup", problem: "w-monic", stroke: [{ x: 1.26, y: 2 }] });
    s = reveal(s, "w-monic", "a", 1);
    s = sessionReducer(s, { type: "run/stroke", run: "warmup", problem: "w-monic", stroke: [{ x: 3, y: 4 }] });
    s = reveal(s, "w-monic", "b", 2);
    expect(s.warmup.lines["w-monic"].map((l) => l.tex)).toEqual(["a", "b"]);
    expect(s.warmup.ink["w-monic"]).toEqual([[{ x: 1.3, y: 2 }], [{ x: 3, y: 4 }]]);
    expect(s.lines).toEqual({});
    expect(s.ink).toEqual({});
    expect(s.escalation).toEqual(start.escalation);
    s = sessionReducer(s, { type: "run/undo", run: "warmup", problem: "w-monic" });
    expect(s.warmup.lines["w-monic"].map((l) => l.tex)).toEqual(["a"]);
    expect(s.warmup.ink["w-monic"]).toHaveLength(1);
    s = sessionReducer(s, { type: "run/clear", run: "warmup", problem: "w-monic" });
    expect(s.warmup.lines["w-monic"]).toEqual([]);
    expect(s.warmup.ink["w-monic"]).toEqual([]);
  });

  it("a hint is remembered per problem and asked for once", () => {
    let s = sessionReducer(start, { type: "run/hint", run: "warmup" });
    expect(s.warmup.hinted).toEqual(["w-monic"]);
    expect(sessionReducer(s, { type: "run/hint", run: "warmup" })).toBe(s);
    s = sessionReducer(s, { type: "run/example", run: "warmup" });
    for (let i = 0; i < 4; i++) s = sessionReducer(s, { type: "run/example-step", run: "warmup" });
    s = sessionReducer(s, { type: "run/next", run: "warmup" });
    s = sessionReducer(s, { type: "run/hint", run: "warmup" });
    expect(s.warmup.hinted).toEqual(["w-monic", "w-monic-2"]);
  });

  it("the help chat is kept per problem, oldest first, blank lines dropped, and a reply lands on the problem it was asked on", () => {
    let s = sessionReducer(start, { type: "run/chat", run: "warmup", problem: "w-monic", message: { from: "student", text: "  where do I start?  " } });
    expect(s.warmup.chat).toEqual({ "w-monic": [{ from: "student", text: "where do I start?" }] });
    expect(sessionReducer(s, { type: "run/chat", run: "warmup", problem: "w-monic", message: { from: "student", text: "   " } })).toBe(s);
    s = sessionReducer(s, { type: "run/example", run: "warmup" });
    for (let i = 0; i < 4; i++) s = sessionReducer(s, { type: "run/example-step", run: "warmup" });
    s = sessionReducer(s, { type: "run/next", run: "warmup" });
    // The reply to the first problem arrives after the move to the follow-up: it stays with the first.
    s = sessionReducer(s, { type: "run/chat", run: "warmup", problem: "w-monic", message: { from: "tutor", text: "Two ways in…" } });
    s = sessionReducer(s, { type: "run/chat", run: "warmup", problem: "w-monic-2", message: { from: "student", text: "same again?" } });
    expect(s.warmup.chat["w-monic"].map((m) => m.from)).toEqual(["student", "tutor"]);
    expect(s.warmup.chat["w-monic-2"]).toEqual([{ from: "student", text: "same again?" }]);
    expect(s.lines).toEqual({});
  });

  it("a snapshot saved before the chat existed hydrates with an empty chat on both runs", () => {
    const without = (run: object) => Object.fromEntries(Object.entries(run).filter(([k]) => k !== "chat"));
    const old = hydrateSession({ ...start, warmup: without(start.warmup), overlayRun: without(start.overlayRun) });
    expect(old.warmup.chat).toEqual({});
    expect(old.overlayRun.chat).toEqual({});
  });

  it("the worked example reveals one step at a time, and only its completion unlocks the follow-up", () => {
    expect(sessionReducer(start, { type: "run/next", run: "warmup" })).toBe(start);
    let s = sessionReducer(start, { type: "run/example", run: "warmup" });
    expect(s.warmup.example).toBe(true);
    expect(sessionReducer(start, { type: "run/example-step", run: "warmup" })).toBe(start);
    s = sessionReducer(s, { type: "run/example-step", run: "warmup" });
    s = sessionReducer(s, { type: "run/example-step", run: "warmup" });
    expect(s.warmup.exampleShown).toBe(2);
    expect(s.warmup.exampled).toEqual([]);
    expect(sessionReducer(s, { type: "run/next", run: "warmup" })).toBe(s);
    s = sessionReducer(s, { type: "run/example-step", run: "warmup" });
    s = sessionReducer(s, { type: "run/example-step", run: "warmup" });
    expect(s.warmup.exampleShown).toBe(4);
    expect(s.warmup.exampled).toEqual(["w-monic"]);
    expect(sessionReducer(s, { type: "run/example-step", run: "warmup" }).warmup.exampleShown).toBe(4);
    s = sessionReducer(s, { type: "run/next", run: "warmup" });
    expect(s.warmup.problem).toBe("second");
    expect(s.warmup.example).toBe(false);
    expect(s.warmup.exampleShown).toBe(0);
    expect(warmupProblem(s).id).toBe("w-monic-2");
    expect(sessionReducer(s, { type: "run/next", run: "warmup" })).toBe(s);
    s = sessionReducer(s, { type: "run/example", run: "warmup" });
    for (let i = 0; i < 3; i++) s = sessionReducer(s, { type: "run/example-step", run: "warmup" });
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

describe("the isolated practice on the pad", () => {
  it("starts a fresh run when a prompt is accepted, keeps its own lines and help, and clears when done", () => {
    let s = sessionAt("working");
    expect(sessionReducer(s, { type: "run/hint", run: "overlay" })).toBe(s);
    s = sessionReducer(s, { type: "help/request", leaf: "algebra.expand-factor.monic", problem: "q1" });
    expect(s.prompt).toBeNull();
    expect(s.overlay).toBe("algebra.expand-factor.monic");
    expect(s.practices).toEqual([{ leaf: "algebra.expand-factor.monic", reason: "help", accepted: true, problem: "q1" }]);
    expect(runProblem(s, "overlay")?.id).toBe("w-monic");
    s = sessionReducer(s, { type: "run/reveal", run: "overlay", problem: "w-monic", line: { tex: "a", strokeCount: 1 } });
    s = sessionReducer(s, { type: "run/hint", run: "overlay" });
    expect(s.overlayRun.lines["w-monic"].map((l) => l.tex)).toEqual(["a"]);
    expect(s.overlayRun.hinted).toEqual(["w-monic"]);
    expect(s.warmup.lines).toEqual({});
    expect(s.lines.q1 ?? []).toEqual([]);
    s = sessionReducer(s, { type: "run/example", run: "overlay" });
    for (let i = 0; i < 4; i++) s = sessionReducer(s, { type: "run/example-step", run: "overlay" });
    s = sessionReducer(s, { type: "run/next", run: "overlay" });
    expect(runProblem(s, "overlay")?.id).toBe("w-monic-2");
    s = sessionReducer(s, { type: "overlay/done" });
    expect(s.overlay).toBeNull();
    s = sessionReducer(s, { type: "help/request", leaf: "algebra.expand-factor.monic", problem: "q1" });
    expect(s.overlayRun).toEqual(INITIAL_RUN);
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
    // Monic first, then non-monic: the practice goes to monic, the more fundamental of the two.
    expect(s.prompt).toEqual({ leaf: "algebra.expand-factor.monic", reason: "detected" });
    expect(s.escalation.counts["algebra.expand-factor"]).toBe(0);
    expect(s.escalation.caution).toEqual([]);
  });

  it("confidence never changes when practice is offered: the first mistake passes for everyone", () => {
    const answers: Confidence[] = [{ level: "confident" }, { level: "low" }, { level: "low-when", leaves: ["algebra.expand-factor.monic"] }];
    for (const confidence of answers) {
      let s: StudentSession = { ...sessionAt("working"), confidence };
      s = reveal(s, "q1", "(x + 2)(x + 3) = 0", 3);
      expect(s.prompt, confidence.level).toBeNull();
      expect(s.escalation.counts["algebra.expand-factor"]).toBe(1);
    }
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
    expect(s.overlay).toBe("algebra.expand-factor.monic");
    s = sessionReducer(s, { type: "overlay/done" });
    expect(s.overlay).toBeNull();
    expect(s.problemIndex).toBe(1);
    expect(s.practices).toEqual([{ leaf: "algebra.expand-factor.monic", reason: "detected", accepted: true, problem: "q2" }]);
  });

  it("'I need help' after a detected practice raises the caution flag", () => {
    let s = sessionAt("working");
    s = reveal(s, "q1", "(x + 2)(x + 3) = 0", 3);
    s = reveal(s, "q2", "(2x + 4)(x - 1) = 0", 3);
    s = sessionReducer(s, { type: "prompt/decline", problem: "q2" });
    expect(s.escalation.caution).toEqual([]);
    s = sessionReducer(s, { type: "help/request", leaf: "algebra.expand-factor.monic", problem: "q3" });
    expect(s.prompt).toBeNull();
    expect(s.overlay).toBe("algebra.expand-factor.monic");
    expect(s.escalation.caution).toEqual(["algebra.expand-factor"]);
  });
});

describe("independent rework", () => {
  it("keeps the original version untouched while a second version builds up", () => {
    let s = sessionAt("feedback");
    const original = s.lines.q1.map((l) => l.tex);
    s = sessionReducer(s, { type: "rework/reveal", problem: "q1", line: { tex: "(x - 2)(x - 3) = 0", strokeCount: 4 } });
    s = sessionReducer(s, { type: "rework/reveal", problem: "q1", line: { tex: "x = 2", strokeCount: 8 } });
    expect(s.rework.q1.map((l) => l.tex)).toEqual(["(x - 2)(x - 3) = 0", "x = 2"]);
    expect(s.lines.q1.map((l) => l.tex)).toEqual(original);
    s = sessionReducer(s, { type: "rework/undo", problem: "q1", strokeCount: 7 });
    expect(s.rework.q1.map((l) => l.tex)).toEqual(["(x - 2)(x - 3) = 0"]);
    expect(s.escalation).toEqual(sessionAt("feedback").escalation);
  });

  it("finishing the rework hands off to the group stage", () => {
    const s = sessionReducer(sessionAt("feedback"), { type: "rework/done" });
    expect(s.stage).toBe("class-wait");
  });

  it("deep links past the rework carry both versions", () => {
    const s = sessionAt("group");
    expect(Object.keys(s.rework).sort()).toEqual(["q1", "q10", "q2", "q3", "q7"]);
    expect(s.lines.q1.length).toBe(3);
    expect(s.stars).toEqual(["q4"]);
  });
});

describe("group review stage", () => {
  it("the whiteboard stage hands off to what follows group review; the run itself lives on the classroom", () => {
    const s = sessionReducer(sessionAt("group"), { type: "group/done" });
    expect(s.stage).toBe("report");
    expect("talked" in sessionAt("group")).toBe(false);
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
    s = sessionReducer({ ...s, stage: "feedback" }, { type: "rework/done" });
    expect(s.stage).toBe("class-wait");
    s = sessionReducer({ ...s, stage: "group" }, { type: "group/done" });
    expect(s.stage).toBe("report");
  });

  it("every one of the eight pathways walks its stages in order and ends on the report", () => {
    const entry = { individual: "feedback", group: "class-wait", "whole-class": "waiting" } as const;
    for (const pathway of allPathways()) {
      const r = under(pathway);
      let s = r(sessionAt("working"), { type: "hand-in" });
      const expected = pathway.map((st) => entry[st]);
      expect(s.stage, pathway.join(",")).toBe(expected[0] ?? "report");
      if (pathway.includes("individual")) {
        s = r({ ...s, stage: "feedback" }, { type: "rework/done" });
        expect(s.stage, pathway.join(",")).toBe(expected[pathway.indexOf("individual") + 1] ?? "report");
      }
      if (pathway.includes("group")) {
        s = r(s, { type: "group/start" });
        expect(s.stage, pathway.join(",")).toBe("group");
        s = r(s, { type: "group/done" });
        expect(s.stage, pathway.join(",")).toBe(expected[pathway.indexOf("group") + 1] ?? "report");
      }
    }
  });

  it("the gate: group/start only opens from class-wait; the teacher's group-start advance takes a waiting student in and hands a correcting one in as it stands", () => {
    expect(sessionReducer(sessionAt("working"), { type: "group/start" }).stage).toBe("working");
    expect(sessionReducer(sessionAt("class-wait"), { type: "group/start" }).stage).toBe("group");
    const waiting = sessionReducer(sessionAt("class-wait"), { type: "advance/apply", id: "g1", kind: "group-start", at: 9 });
    expect(waiting.stage).toBe("group");
    const correcting = sessionReducer(sessionAt("feedback"), { type: "advance/apply", id: "g1", kind: "group-start", at: 9 });
    expect(correcting.stage).toBe("group");
    expect(correcting.reworkedAt).toBe(9);
    expect(correcting.notice).toMatch(/mistake/);
    expect(sessionReducer(sessionAt("working"), { type: "advance/apply", id: "g1", kind: "group-start", at: 9 }).stage).toBe("working");
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
    let s = sessionAt("feedback");
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
    let s = sessionAt("feedback");
    s = sessionReducer(s, { type: "rework/reveal", problem: "q4", line: { tex: WRONG_Q4, strokeCount: 1 } });
    const refused = sessionReducer(s, { type: "rework/done", at: 9 });
    expect(refused.stage).toBe("feedback");
    expect(refused.reworkedAt).toBe(s.reworkedAt);
    s = sessionReducer(s, { type: "rework/clear", problem: "q4" });
    s = sessionReducer(s, { type: "rework/done", at: 9 });
    expect(s.stage).toBe("class-wait");
    expect(s.reworkedAt).toBe(9);
  });

  it("a forced hand-in goes through with the broken problem counted in the notice", () => {
    let s = sessionAt("feedback");
    s = sessionReducer(s, { type: "rework/reveal", problem: "q4", line: { tex: WRONG_Q4, strokeCount: 1 } });
    s = sessionReducer(s, { type: "rework/done", force: true });
    expect(s.stage).toBe("class-wait");
    expect(s.notice).toMatch(/^6 of your problems still contain a mistake\./);
  });

  it("the post-rework notice reads the final version and can be dismissed", () => {
    let s = sessionAt("group"); // fully corrected rework
    s = sessionReducer({ ...s, stage: "feedback" }, { type: "rework/done" });
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
    const again = sessionReducer({ ...s, stage: "feedback" }, { type: "advance/apply", id: "a", kind: "force-submit", at: 9 });
    expect(again.stage).toBe("feedback");
    expect(again.handedInAt).toBe(5);
    const later = sessionReducer(sessionAt("feedback"), { type: "advance/apply", id: "b", kind: "force-submit", at: 9 });
    expect(later.stage).toBe("feedback");
    expect(later.appliedAdvances).toEqual(["b"]);
    expect(later.notice).toBeNull();
  });

  it("dismisses an open practice prompt or overlay on the way out", () => {
    let s = sessionAt("working");
    s = sessionReducer(s, { type: "help/request", leaf: "algebra.number.fractions", problem: "q1" });
    expect(s.overlay).not.toBeNull();
    s = sessionReducer(s, { type: "advance/apply", id: "c", kind: "force-submit" });
    expect(s.overlay).toBeNull();
    expect(s.prompt).toBeNull();
    expect(s.stage).toBe("feedback");
  });
});

describe("writing along with the teacher", () => {
  it("keeps the student's follow-along ink per problem, apart from every version, with undo and clear", () => {
    let s = sessionAt("frozen");
    s = sessionReducer(s, { type: "follow/stroke", problem: "q2", stroke: [{ x: 1.26, y: 2 }] });
    s = sessionReducer(s, { type: "follow/stroke", problem: "q2", stroke: [{ x: 3, y: 4 }] });
    expect(s.followInk.q2).toEqual([[{ x: 1.3, y: 2 }], [{ x: 3, y: 4 }]]);
    expect(s.ink.q2).toEqual(sessionAt("frozen").ink.q2);
    expect(s.reworkInk.q2).toEqual(sessionAt("frozen").reworkInk.q2);
    s = sessionReducer(s, { type: "follow/undo", problem: "q2" });
    expect(s.followInk.q2).toHaveLength(1);
    s = sessionReducer(s, { type: "follow/clear", problem: "q2" });
    expect(s.followInk.q2).toEqual([]);
  });
});

describe("whole-class freeze", () => {
  it("freezes wherever the student is, dismissing prompts, and releases to the report", () => {
    let s = sessionAt("working");
    s = sessionReducer(s, { type: "help/request", leaf: "algebra.number.fractions", problem: "q1" });
    s = sessionReducer(s, { type: "advance/apply", id: "wc@1", kind: "whole-class-start" });
    expect(s.stage).toBe("frozen");
    expect(s.prompt).toBeNull();
    expect(s.overlay).toBeNull();
    expect(sessionReducer(s, { type: "freeze" })).toBe(s);
    const released = sessionReducer(s, { type: "release" });
    expect(released.stage).toBe("report");
    expect(sessionReducer(released, { type: "release" })).toBe(released);
  });

  it("a student mid-rework keeps their broken rework as it stands when frozen", () => {
    let s = sessionAt("feedback");
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
