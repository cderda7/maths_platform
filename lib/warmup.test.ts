import { describe, expect, it } from "vitest";
import { byEase, CHAT_BEAT_MS, CHAT_DOTS_MS, closingLine, concernsAnswered, concernTranscript, concernTurns, EASE, focusLeaves, howAbout, interpret, offerLines, practiceFor, skillRuns, turnSteps, warmupScript, warmupSequence } from "./warmup";
import { isolatable, PRACTICE, PRACTICES, WARMUP_BANK } from "@/data/practice";
import { branchesOf } from "./branches";
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
  it("every practice has at least one hint and a script the pad can read", () => {
    for (const p of WARMUP_BANK) {
      expect(p.hints.length).toBeGreaterThan(0);
      for (const h of p.hints) expect(h.text.length, p.id).toBeGreaterThan(0);
      expect(warmupScript(p)).toEqual(p.steps.map((s) => s.tex));
      if (p.followUp) expect(p.followUp.leaf).toBe(p.leaf);
    }
  });
  it("every scripted line is one step: two cases always branch, and no line chains an implication or a second fact onto another step", () => {
    const all = WARMUP_BANK.flatMap((p) => [p, ...(p.followUp ? [p.followUp] : [])]);
    for (const p of all) {
      for (const st of p.steps) {
        if (st.tex.includes("\\text{or}")) expect(branchesOf(st.tex), `${p.id}: ${st.tex}`).toHaveLength(2);
        expect(st.tex, `${p.id}: ${st.tex}`).not.toMatch(/\\Rightarrow[^]*=[^]*=/);
        expect(st.tex, `${p.id}: ${st.tex}`).not.toContain("\\quad");
      }
    }
    const features = PRACTICES["graphing.quadratics.features"]!;
    expect(warmupScript(features)).toEqual(["x^2 - 2x - 8 = 0", "(x - 4)(x + 2) = 0", "x = 4 \\;\\text{or}\\; x = -2", "x = \\tfrac{4 + (-2)}{2} = 1", "y = 1 - 2 - 8 = -9", "(1, -9)"]);
    expect(branchesOf(features.steps[2].tex)).toEqual(["x = 4", "x = -2"]);
  });
});

describe("the concerns chat", () => {
  const three = ["algebra.expand-factor.monic", "algebra.number.fractions", "unit.u1.nfl"] as const;
  it("asks one turn per ticked skill, the opening in two bubbles naming them all, in the order they were ticked", () => {
    expect(concernTurns([...three])).toEqual([
      ["Let's do a warm up on factorising, fractions, & null factor law.", "First, tell me a little bit about your concerns with **factorising**."],
      ["How about with **fractions**?"],
      ["How about the **null factor law**?"],
    ]);
    expect(concernTurns(["algebra.number.fractions", "algebra.expand-factor.monic"])[0]).toEqual(["Let's do a warm up on fractions & factorising.", "First, tell me a little bit about your concerns with **fractions**."]);
    expect(concernTurns(["algebra.expand-factor.monic"])).toEqual([["Let's do a warm up on factorising.", "Tell me a little bit about your concerns with **factorising**."]]);
    expect(concernTurns([])).toEqual([["Let's do a warm up.", "Tell me a little bit about what you'd like to warm up on."]]);
  });
  it("asks a named rule as a thing and a topic as a place, the skill marked either way", () => {
    expect(howAbout("fractions")).toBe("How about with **fractions**?");
    expect(howAbout("factorising")).toBe("How about with **factorising**?");
    expect(howAbout("surds")).toBe("How about with **surds**?");
    expect(howAbout("null factor law")).toBe("How about the **null factor law**?");
    expect(howAbout("chain rule")).toBe("How about the **chain rule**?");
    expect(howAbout("index laws")).toBe("How about the **index laws**?");
    expect(howAbout("binomial expansion identity")).toBe("How about the **binomial expansion identity**?");
    expect(howAbout("the discriminant")).toBe("How about the **discriminant**?");
    expect(howAbout("normal distribution")).toBe("How about the **normal distribution**?");
  });
  it("splits a tutor line into plain and skill runs, and leaves a line without a skill whole", () => {
    expect(skillRuns("How about with **fractions**?")).toEqual([
      { text: "How about with ", skill: false },
      { text: "fractions", skill: true },
      { text: "?", skill: false },
    ]);
    expect(skillRuns("First, tell me a little bit about your concerns with **factorising**.")).toEqual([
      { text: "First, tell me a little bit about your concerns with ", skill: false },
      { text: "factorising", skill: true },
      { text: ".", skill: false },
    ]);
    expect(skillRuns("Let's do a warm up.")).toEqual([{ text: "Let's do a warm up.", skill: false }]);
    expect(skillRuns("**a** and **b**")).toEqual([
      { text: "a", skill: true },
      { text: " and ", skill: false },
      { text: "b", skill: true },
    ]);
  });
  it("closes by naming the skill the warm-up opens on", () => {
    expect(closingLine("algebra.number.fractions")).toBe("Thanks. Let's start with fractions.");
    expect(closingLine(undefined)).toBe("Thanks. Let's start.");
  });
  it("plays the opening's first bubble at once with the dots straight after, and every other bubble after a beat and the dots", () => {
    expect(turnSteps(2, true)).toEqual([
      { at: 0, shown: 1, dots: true },
      { at: CHAT_DOTS_MS, shown: 2, dots: false },
    ]);
    expect(turnSteps(1, false)).toEqual([
      { at: 0, shown: 0, dots: false },
      { at: CHAT_BEAT_MS, shown: 0, dots: true },
      { at: CHAT_BEAT_MS + CHAT_DOTS_MS, shown: 1, dots: false },
    ]);
    expect(turnSteps(3, true)).toEqual([
      { at: 0, shown: 1, dots: true },
      { at: CHAT_DOTS_MS, shown: 2, dots: false },
      { at: CHAT_DOTS_MS + CHAT_BEAT_MS, shown: 2, dots: true },
      { at: 2 * CHAT_DOTS_MS + CHAT_BEAT_MS, shown: 3, dots: false },
    ]);
    expect(turnSteps(1, true)).toEqual([{ at: 0, shown: 1, dots: false }]);
  });
  it("shows each turn's bubbles followed by its answer, up to the first still unanswered, ignoring any stored tutor lines", () => {
    const a = { from: "student", text: "signs" } as const;
    const b = { from: "student", text: "dividing" } as const;
    const turns = concernTurns([...three]);
    expect(concernTranscript([...three], []).map((m) => m.from)).toEqual(["tutor", "tutor"]);
    expect(concernTranscript([...three], [a, { from: "tutor", text: "old reply" }, b])).toEqual([
      { from: "tutor", text: turns[0][0] },
      { from: "tutor", text: turns[0][1] },
      a,
      { from: "tutor", text: turns[1][0] },
      b,
      { from: "tutor", text: turns[2][0] },
    ]);
    expect(concernsAnswered([...three], [a, b])).toBe(false);
    expect(concernsAnswered([...three], [a, b, a])).toBe(true);
    expect(concernsAnswered([], [])).toBe(false);
    expect(concernsAnswered([], [a])).toBe(true);
  });
});
