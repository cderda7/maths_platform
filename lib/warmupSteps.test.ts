import { describe, expect, it } from "vitest";
import { ASSIGNMENT, PROBLEMS } from "@/data/assignment";
import { COMPLETIONS } from "@/data/pairs";
import { PRACTICES, WARMUP_BANK, isolatable } from "@/data/practice";
import type { LeafId } from "@/data/taxonomy";
import { chatOn, findPractice, helpChatSystem } from "./helpChat";
import { leavesTouched } from "./hierarchy";
import { completionScript, completionState, LADDER_SLIPS, markLine, nextPhase, phaseOf, WARMUP_PHASES, warmupLadder } from "./ladder";
import { blankSteps } from "./pairs";
import { sessionPlace } from "./place";
import { nextLine, type RevealedLine } from "./recognition";
import { hydrateSession, INITIAL_SESSION, runFirst, sessionAt, sessionReducer, warmupCompletion, warmupOffered, warmupPhase, warmupProblem, warmupStep, type StudentSession } from "./session";
import { warmupSequence } from "./warmup";

const MONIC: LeafId = "algebra.expand-factor.monic";
const NFL: LeafId = "functions.zeros.nfl";
const T = 1_700_000_000_000;

/** A not-confident student who ticked monic factorising and the null factor law, the chat answered, at the warm-up's first skill. */
function warmingUp(at = T): StudentSession {
  let s = sessionReducer(sessionReducer(INITIAL_SESSION, { type: "overview/start" }), { type: "goal/continue" });
  s = sessionReducer(s, { type: "confidence/set", confidence: { level: "low-when", leaves: [MONIC, NFL] } });
  s = sessionReducer(s, { type: "warmup/accept" });
  s = sessionReducer(s, { type: "warmup/say", text: "i mix up the signs" });
  s = sessionReducer(s, { type: "warmup/say", text: "i forget to set each bracket to zero" });
  return sessionReducer(s, { type: "warmup/begin", at });
}
const seeExample = (s: StudentSession) => {
  for (let i = 0; i < warmupStep(s).steps.length; i++) s = sessionReducer(s, { type: "run/example-step", run: "warmup" });
  return s;
};
const write = (s: StudentSession, ...texs: string[]) => {
  const id = runFirst(s, "warmup")!.id;
  for (const tex of texs) s = sessionReducer(s, { type: "run/reveal", run: "warmup", problem: id, line: { tex, strokeCount: (s.warmup.lines[id]?.length ?? 0) * 3 + 3 } });
  return s;
};

describe("the warm-up's problems per skill", () => {
  it("every practice problem in the bank has its three steps: itself worked, its completion problem with at least one blank and one given line, its follow-up alone", () => {
    for (const p of WARMUP_BANK) {
      const l = warmupLadder(p)!;
      expect(l, p.id).not.toBeNull();
      expect(l.worked, p.id).toBe(p);
      expect(l.completion, p.id).toBe(COMPLETIONS[p.leaf]);
      expect(l.alone, p.id).toBe(p.followUp);
      expect(l.blanks, p.id).toEqual(blankSteps(l.completion.steps, p.leaf));
      expect(l.blanks.length, p.id).toBeGreaterThan(0);
      // Each completion problem finishes from its own blank lines, written in order.
      const st = completionState(l.completion.steps, l.blanks, l.blanks.map((i) => ({ tex: l.completion.steps[i].tex })));
      expect(st.done, p.id).toBe(true);
    }
  });

  it("the blanks follow the skill's tags, as ticket 310 wrote them: the fractions completion problem has five of its seven lines to write", () => {
    expect(warmupLadder(PRACTICES["algebra.number.fractions"]!)!.blanks).toEqual([1, 2, 3, 4, 5]);
    expect(warmupLadder(PRACTICES[MONIC]!)!.blanks).toEqual([0, 1, 2]);
  });

  it("any skill the set uses can be warmed up, New skills included, and every one runs all three steps", () => {
    const used = [...new Set([...leavesTouched(PROBLEMS), ...ASSIGNMENT.newSkills])].filter(isolatable);
    expect(used).toEqual(expect.arrayContaining([...ASSIGNMENT.newSkills]));
    for (const leaf of used) for (const p of warmupSequence([leaf])) expect(warmupLadder(p), `${leaf} → ${p.id}`).not.toBeNull();
    expect(warmupSequence(used).length).toBeGreaterThan(1);
  });

  it("the steps go worked, completion, alone; a skill is on the furthest it has reached", () => {
    expect(WARMUP_PHASES).toEqual(["worked", "completion", "alone"]);
    expect([nextPhase("worked"), nextPhase("completion"), nextPhase("alone")]).toEqual(["completion", "alone", null]);
    expect([phaseOf(undefined), phaseOf({}), phaseOf({ worked: 1 }), phaseOf({ worked: 1, completion: 2 }), phaseOf({ worked: 1, completion: 0, alone: 3 })]).toEqual(["worked", "worked", "worked", "completion", "alone"]);
  });
});

describe("who is offered a warm-up", () => {
  it("a student who answers confident is never offered one and goes straight to Q1; I need help is still theirs in the set", () => {
    let s = sessionReducer(sessionReducer(INITIAL_SESSION, { type: "overview/start" }), { type: "goal/continue" });
    s = sessionReducer(s, { type: "confidence/set", confidence: { level: "confident" } });
    expect(s).toMatchObject({ stage: "working", practice: "declined" });
    expect(warmupOffered(s)).toBe(false);
    expect(sessionReducer(s, { type: "warmup/accept" })).toBe(s);
    expect(sessionReducer(s, { type: "warmup/begin", at: T })).toBe(s);
    const help = sessionReducer(sessionReducer(s, { type: "problem/goto", index: 1 }), { type: "help/request", leaf: "algebra.expand-factor.nonmonic", problem: "q2", at: T });
    expect(help.ladder).toEqual({ problem: "q2", step: "worked" });
  });

  it("every skill a not-confident student ticks or names is warmed up, each starting on its worked example", () => {
    const s = warmingUp();
    expect(warmupSequence([MONIC, NFL]).map((p) => p.id)).toEqual(["w-monic", "w-nfl"]);
    expect(warmupStep(s).id).toBe("w-monic");
    expect(warmupPhase(s)).toBe("worked");
  });
});

describe("the session: a warm-up skill in three steps", () => {
  it("the first skill opens on its worked example, playing from the first step, its start recorded", () => {
    const s = warmingUp();
    expect(s.stage).toBe("practice");
    expect(s.warmup.phases).toEqual({ "w-monic": { worked: T } });
    expect(s.warmup.example).toBe(true);
    expect(runFirst(s, "warmup")?.id).toBe("w-monic");
    expect(warmupProblem(s).id).toBe("w-monic");
    expect(sessionPlace(s, PROBLEMS)).toEqual({ place: { kind: "warmup", leaf: MONIC, step: 1 }, since: T });
  });

  it("Your turn waits for every step of the example; then the completion problem, its start recorded", () => {
    let s = warmingUp();
    expect(sessionReducer(s, { type: "warmup/next", at: T + 1 })).toBe(s);
    s = sessionReducer(s, { type: "run/example-step", run: "warmup" });
    expect(s.warmup.exampleShown).toBe(1);
    expect(sessionReducer(s, { type: "warmup/next", at: T + 1 })).toBe(s);
    s = seeExample(s);
    expect(s.warmup.exampled).toEqual(["w-monic"]);
    s = sessionReducer(s, { type: "warmup/next", at: T + 40_000 });
    expect(warmupPhase(s)).toBe("completion");
    expect(runFirst(s, "warmup")?.id).toBe("w-monic-completion");
    expect(s.warmup).toMatchObject({ example: false, exampleShown: 0, phases: { "w-monic": { worked: T, completion: T + 40_000 } } });
    expect(sessionPlace(s, PROBLEMS)).toEqual({ place: { kind: "warmup", leaf: MONIC, step: 2 }, since: T + 40_000 });
  });

  it("the completion problem: a wrong line marked with its misconception and the blank still open, then the right line; On your own waits until every blank is in", () => {
    let s = sessionReducer(seeExample(warmingUp()), { type: "warmup/next", at: T + 1 });
    const C = COMPLETIONS[MONIC]!.steps.map((x) => x.tex);
    // The hint is the one for the blank being written.
    s = sessionReducer(s, { type: "run/hint", run: "warmup" });
    expect(s.warmup.hinted).toEqual({ "w-monic-completion": [0] });
    s = write(s, C[0], C[1], "(x - 4)(x - 5) = 0");
    let c = warmupCompletion(s)!;
    expect(c.state.blanks[2]).toMatchObject({ status: "open", written: [{ mark: { kind: "wrong", misconception: "pair-signs-swapped" } }] });
    expect(sessionReducer(s, { type: "warmup/next", at: T + 2 })).toBe(s);
    s = sessionReducer(s, { type: "run/hint", run: "warmup" });
    // The working on screen is at the factors (a wrong line counts for nothing): the hint for that point.
    expect(s.warmup.hinted["w-monic-completion"]).toEqual([0, 2]);
    s = write(s, C[2]);
    c = warmupCompletion(s)!;
    expect(c.state.done).toBe(true);
    s = sessionReducer(s, { type: "warmup/next", at: T + 90_000 });
    expect(warmupPhase(s)).toBe("alone");
    expect(runFirst(s, "warmup")?.id).toBe("w-monic-2");
    expect(warmupCompletion(s)).toBeNull();
    expect(s.warmup.phases["w-monic"]).toEqual({ worked: T + 0, completion: T + 1, alone: T + 90_000 });
    expect(sessionPlace(s, PROBLEMS)).toEqual({ place: { kind: "warmup", leaf: MONIC, step: 3 }, since: T + 90_000 });
    // Nothing further within the skill.
    expect(sessionReducer(s, { type: "warmup/next", at: T + 3 })).toBe(s);
  });

  it("two wrong lines on a blank fill it in, and the student carries on", () => {
    let s = sessionReducer(seeExample(warmingUp()), { type: "warmup/next", at: T });
    s = write(s, "4 \\times 4 = 20", "2 \\times 10 = 20");
    expect(warmupCompletion(s)!.state.blanks[0].status).toBe("filled");
    expect(warmupCompletion(s)!.state.current).toBe(1);
  });

  it("the demo pad writes Sam's sign slip on the monic factors, then the right line", () => {
    const l = warmupLadder(PRACTICES[MONIC]!)!;
    const script = completionScript(l.completion, l.blanks);
    const C = l.completion.steps.map((x) => x.tex);
    expect(script).toEqual([C[0], C[1], "(x - 4)(x - 5) = 0", C[2]]);
    let read: RevealedLine[] = [];
    for (let n = 1; n <= script.length; n++) read = [...read, nextLine(script, read, n * 4)!];
    expect(completionState(l.completion.steps, l.blanks, read).blanks[2].written.map((w) => w.mark)).toEqual([{ kind: "wrong", misconception: "pair-signs-swapped" }, { kind: "right" }]);
    for (const t of LADDER_SLIPS["w-monic-completion"][2]) expect(markLine(l.completion.steps[2], t)).toEqual({ kind: "wrong", misconception: "pair-signs-swapped" });
  });

  it("on its own: the follow-up's hints are picked by its own lines; the older follow-up and menu example do nothing on the warm-up", () => {
    let s = sessionReducer(seeExample(warmingUp()), { type: "warmup/next", at: T });
    s = write(s, ...warmupLadder(PRACTICES[MONIC]!)!.blanks.map((i) => COMPLETIONS[MONIC]!.steps[i].tex));
    s = sessionReducer(s, { type: "warmup/next", at: T });
    const alone = PRACTICES[MONIC]!.followUp!;
    s = sessionReducer(s, { type: "run/hint", run: "warmup" });
    expect(s.warmup.hinted["w-monic-2"]).toEqual([0]);
    s = write(s, alone.steps[0].tex);
    s = sessionReducer(s, { type: "run/hint", run: "warmup" });
    expect(s.warmup.hinted["w-monic-2"]).toEqual([0, 1]);
    expect(sessionReducer(s, { type: "run/next", run: "warmup" })).toBe(s);
    expect(sessionReducer(s, { type: "run/example", run: "warmup" })).toBe(s);
  });

  it("a student can move on from any step: Next skill opens the next on its worked example, a chip back reopens the step it was left on with its times kept, and the set is there from any step", () => {
    let s = sessionReducer(seeExample(warmingUp()), { type: "warmup/next", at: T + 10 });
    s = write(s, COMPLETIONS[MONIC]!.steps[0].tex);
    // Early, from the completion problem.
    s = sessionReducer(s, { type: "warmup/skill-done", at: T + 20 });
    expect(warmupStep(s).id).toBe("w-nfl");
    expect(warmupPhase(s)).toBe("worked");
    expect(s.warmup).toMatchObject({ example: true, exampleShown: 0, done: ["w-monic"] });
    expect(s.warmup.phases).toEqual({ "w-monic": { worked: T, completion: T + 10 }, "w-nfl": { worked: T + 20 } });
    expect(sessionPlace(s, PROBLEMS)).toEqual({ place: { kind: "warmup", leaf: NFL, step: 1 }, since: T + 20 });
    // Back to monic by its chip: on the completion problem, its line still there.
    s = sessionReducer(s, { type: "warmup/goto", step: 0, at: T + 30 });
    expect(warmupPhase(s)).toBe("completion");
    expect(s.warmup.example).toBe(false);
    expect(warmupCompletion(s)!.state.blanks[0].status).toBe("right");
    expect(s.warmup.phases["w-monic"]).toEqual({ worked: T, completion: T + 10 });
    // From the worked example of a skill, the set.
    const nfl = sessionReducer(s, { type: "warmup/goto", step: 1, at: T + 40 });
    expect(sessionReducer(nfl, { type: "practice/finish" }).stage).toBe("working");
    expect(sessionReducer(s, { type: "practice/finish" }).stage).toBe("working");
    // The last skill left: the set.
    const last = sessionReducer(nfl, { type: "warmup/skill-done", at: T + 50 });
    expect(last.stage).toBe("working");
  });

  it("nothing written in the warm-up reaches the set, and a reload lands on the same step", () => {
    let s = sessionReducer(seeExample(warmingUp()), { type: "warmup/next", at: T });
    s = write(s, COMPLETIONS[MONIC]!.steps[0].tex, "(x");
    expect(s.lines).toEqual({});
    expect(s.escalation).toEqual(warmingUp().escalation);
    const back = hydrateSession(JSON.parse(JSON.stringify(s)));
    expect(back).toEqual(s);
    expect(warmupCompletion(back)!.state).toEqual(warmupCompletion(s)!.state);
    // A session saved before ticket 313 has no steps: the skill it was on opens on its worked example.
    const old = JSON.parse(JSON.stringify(s));
    delete old.warmup.phases;
    const h = hydrateSession(old);
    expect(h.warmup.phases).toEqual({});
    expect(warmupPhase(h)).toBe("worked");
    // A deep link to the pad: the worked example plays even with no example flag stored.
    const deep = sessionAt("practice");
    expect(sessionReducer(deep, { type: "run/example-step", run: "warmup" }).warmup.exampleShown).toBe(1);
  });
});

describe("the help chat in the warm-up", () => {
  it("finds the completion problem and tells the tutor lines are given and marked", () => {
    const c = COMPLETIONS[MONIC]!;
    expect(findPractice(c.id)).toBe(c);
    expect(chatOn(c.id)).toBe("warmup-completion");
    expect(chatOn("w-monic")).toBe("practice");
    expect(chatOn("w-monic-2")).toBe("practice");
    const brief = helpChatSystem(c, [c.steps[0].tex], [], undefined, [], "warmup-completion");
    expect(brief).toContain("warming up on one skill");
    expect(brief).toContain("writes the missing ones");
    expect(brief).not.toContain("problem set, has seen a question like it");
  });
});
