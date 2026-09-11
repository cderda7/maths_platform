import { describe, expect, it } from "vitest";
import { byEase, concernPrompts, concernsAnswered, concernTranscript, EASE, focusLeaves, interpret, offerLines, practiceFor, warmupScript, warmupSequence } from "./warmup";
import { isolatable, PRACTICE, WARMUP_BANK } from "@/data/practice";
import { ASSIGNMENT } from "@/data/assignment";
import { leavesTouched } from "./hierarchy";

describe("the warm-up offer's lines", () => {
  it("names the ticked skills in tick order and counts one short problem each", () => {
    expect(offerLines({ level: "low-when", leaves: ["algebra.expand-factor.monic", "unit.u1.discriminant"] })).toEqual({ question: "Warm up on factorising & the discriminant first?", size: "2 short problems, then the set" });
    expect(offerLines({ level: "low-when", leaves: ["unit.u1.discriminant", "algebra.expand-factor.monic", "algebra.number.fractions"] })).toEqual({ question: "Warm up on the discriminant, factorising, & fractions first?", size: "3 short problems, then the set" });
    expect(offerLines({ level: "low-when", leaves: ["unit.u1.nfl"] })).toEqual({ question: "Warm up on null factor law first?", size: "1 short problem, then the set" });
  });
  it("asks the open question for a plain \"not confident\"", () => {
    expect(offerLines({ level: "low" })).toEqual({ question: "Warm up before the set?", size: "a few short problems, then the set" });
    expect(offerLines({ level: "low-when", leaves: [] })).toEqual({ question: "Warm up before the set?", size: "a few short problems, then the set" });
  });
});

describe("interpreting the student's words", () => {
  it("reads skill words and question references", () => {
    const r = interpret("i feel like i haven't mastered factoring still, like Q1 i could maybe do but something like Q2 & Q4. also i'm nervous about working with fractions");
    expect(r.leaves).toEqual(["algebra.expand-factor.monic", "algebra.expand-factor.nonmonic", "algebra.number.fractions"]);
    expect(r.problems).toEqual(["q1", "q2", "q4"]);
  });
  it("non-monic alone does not drag in monic; an unknown message points at nothing", () => {
    expect(interpret("non monic").leaves).toEqual(["algebra.expand-factor.nonmonic"]);
    expect(interpret("non-monic factorising").leaves).toEqual(["algebra.expand-factor.nonmonic"]);
    expect(interpret("monic factorising").leaves).toEqual(["algebra.expand-factor.monic"]);
    expect(interpret("factorising").leaves).toEqual(["algebra.expand-factor.monic", "algebra.expand-factor.nonmonic"]);
    expect(interpret("hello there")).toEqual({ leaves: [], problems: [] });
    expect(interpret("q99").problems).toEqual([]);
  });
});

describe("the focus", () => {
  it("is the ticked skills plus what the answers named (a skill, a question's skills), communication excluded, in first-mention order", () => {
    const f = focusLeaves(["unit.u1.discriminant", "algebra.equations.quadratic"], [{ from: "student", text: "fractions and Q1" }, { from: "tutor", text: "monic" }]);
    expect(f).toEqual(["unit.u1.discriminant", "algebra.number.fractions", "algebra.expand-factor.monic", "unit.u1.nfl"]);
    expect(f.some((l) => l.startsWith("communication."))).toBe(false);
    expect(f).not.toContain("algebra.equations.quadratic");
  });
  it("is empty with nothing ticked and nothing said", () => {
    expect(focusLeaves([], [])).toEqual([]);
  });
});

describe("the warm-up sequence", () => {
  it("walks the focus easiest first: fractions, monic, null factor law, non-monic (quadratic equations is never isolated)", () => {
    const focus = focusLeaves(["algebra.expand-factor.monic"], [{ from: "student", text: "fractions, and Q2 looks hard" }]);
    expect(warmupSequence(focus).map((p) => p.leaf)).toEqual(["algebra.number.fractions", "algebra.expand-factor.monic", "unit.u1.nfl", "algebra.expand-factor.nonmonic"]);
  });
  it("nothing in focus → the default warm-up alone", () => {
    expect(warmupSequence([]).map((p) => p.id)).toEqual([PRACTICE.id]);
  });
  it("one problem per leaf, never the same problem twice, and every leaf in the set is served by a problem on that leaf", () => {
    const all = leavesTouched(ASSIGNMENT.problems).filter(isolatable);
    const seq = warmupSequence(all);
    expect(seq.length).toBe(all.length);
    expect(new Set(seq.map((p) => p.id)).size).toBe(seq.length);
    for (const l of all) expect(seq.some((p) => p.leaf === l), l).toBe(true);
  });
  it("a whole-task leaf is never practised, even by a sibling", () => {
    expect(practiceFor("algebra.equations.quadratic")).toBeNull();
    expect(practiceFor("algebra.equations.linear")?.id).toBe("w-linear");
    expect(practiceFor("communication.process.working")).toBeNull();
  });
  it("unlisted leaves come after listed ones, in focus order", () => {
    expect(byEase(["stats.data.summary", "algebra.number.fractions"])).toEqual(["algebra.number.fractions", "stats.data.summary"]);
    expect(new Set(EASE).size).toBe(EASE.length);
  });
  it("every practice has a hint and a script the pad can read", () => {
    for (const p of WARMUP_BANK) {
      expect(p.hint.length).toBeGreaterThan(0);
      expect(warmupScript(p)).toEqual(p.steps.map((s) => s.tex));
      if (p.followUp) expect(p.followUp.leaf).toBe(p.leaf);
    }
  });
});

describe("the concerns chat", () => {
  const three = ["algebra.expand-factor.monic", "algebra.number.fractions", "unit.u1.nfl"] as const;
  it("asks one question per ticked skill, the first naming them all, in the order they were ticked", () => {
    expect(concernPrompts([...three])).toEqual([
      "Let's do a warm up on factorising, fractions, & null factor law. First, tell me a little bit about your concerns with factorising.",
      "Next, tell me about your concerns with fractions.",
      "Next, tell me about your concerns with null factor law.",
    ]);
    expect(concernPrompts(["algebra.number.fractions", "algebra.expand-factor.monic"])[0]).toBe("Let's do a warm up on fractions & factorising. First, tell me a little bit about your concerns with fractions.");
    expect(concernPrompts(["algebra.expand-factor.monic"])).toEqual(["Let's do a warm up on factorising. Tell me a little bit about your concerns with factorising."]);
    expect(concernPrompts([])).toEqual(["Let's do a warm up. Tell me a little bit about what you'd like to warm up on."]);
  });
  it("shows each question followed by its answer, up to the first still unanswered, ignoring any stored tutor lines", () => {
    const a = { from: "student", text: "signs" } as const;
    const b = { from: "student", text: "dividing" } as const;
    expect(concernTranscript([...three], []).map((m) => m.from)).toEqual(["tutor"]);
    expect(concernTranscript([...three], [a, { from: "tutor", text: "old reply" }, b])).toEqual([
      { from: "tutor", text: concernPrompts([...three])[0] },
      a,
      { from: "tutor", text: concernPrompts([...three])[1] },
      b,
      { from: "tutor", text: concernPrompts([...three])[2] },
    ]);
    expect(concernsAnswered([...three], [a, b])).toBe(false);
    expect(concernsAnswered([...three], [a, b, a])).toBe(true);
    expect(concernsAnswered([], [])).toBe(false);
    expect(concernsAnswered([], [a])).toBe(true);
  });
});
