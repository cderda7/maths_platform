import { describe, expect, it } from "vitest";
import { byEase, CHAT_BEAT_MS, CHAT_CLOSE_MS, CHAT_DOTS_MS, closingTurn, concernsAnswered, concernTranscript, concernTurns, EASE, focusLeaves, howAbout, interpret, offerLines, practiceFor, reflection, REFLECTIONS, skillRuns, turnSteps, warmupScript, warmupSequence } from "./warmup";
import { isolatable, PRACTICE, PRACTICES, WARMUP_BANK } from "@/data/practice";
import { branchesOf } from "./branches";
import { ASSIGNMENT } from "@/data/assignment";
import { leavesTouched } from "./hierarchy";

describe("the warm-up offer's lines", () => {
  it("names the ticked skills in tick order and sizes it at three short steps a skill", () => {
    expect(offerLines({ level: "low-when", leaves: ["algebra.expand-factor.monic", "algebra.equations.discriminant"] })).toEqual({ question: "Warm up on factorising & the discriminant first?", size: "2 skills, 3 short steps each, then the set" });
    expect(offerLines({ level: "low-when", leaves: ["algebra.equations.discriminant", "algebra.expand-factor.monic", "algebra.number.fractions"] })).toEqual({ question: "Warm up on the discriminant, factorising, & fractions first?", size: "3 skills, 3 short steps each, then the set" });
    expect(offerLines({ level: "low-when", leaves: ["functions.zeros.nfl"] })).toEqual({ question: "Warm up on null factor law first?", size: "3 short steps, then the set" });
  });
  it("asks the open question for a plain \"not confident\"", () => {
    expect(offerLines({ level: "low" })).toEqual({ question: "Warm up before the set?", size: "3 short steps per skill, then the set" });
    expect(offerLines({ level: "low-when", leaves: [] })).toEqual({ question: "Warm up before the set?", size: "3 short steps per skill, then the set" });
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
  it("reads non-monic said without the word: a number in front of the x², the leading coefficient, a that isn't 1; factorising said alongside it stays non-monic (ticket 300)", () => {
    const non = ["algebra.expand-factor.nonmonic"];
    expect(interpret("the coefficient in front of the x² throws me").leaves).toEqual(non);
    expect(interpret("when there's a number in front of x^2").leaves).toEqual(non);
    expect(interpret("factorising with a coefficient on the x squared").leaves).toEqual(non);
    expect(interpret("the leading coefficient").leaves).toEqual(non);
    expect(interpret("factorising when a isn't 1").leaves).toEqual(non);
    // The middle coefficient is monic's own word, not non-monic.
    expect(interpret("finding the middle coefficient when i factorise").leaves).toEqual(["algebra.expand-factor.monic", "algebra.expand-factor.nonmonic"]);
  });
});

describe("the focus", () => {
  it("is the ticked skills plus what the answers named (a skill, a question's skills), communication excluded, in first-mention order", () => {
    const f = focusLeaves(["algebra.equations.discriminant", "algebra.equations.quadratic"], [{ from: "student", text: "fractions and Q1" }, { from: "tutor", text: "monic" }]);
    expect(f).toEqual(["algebra.equations.discriminant", "algebra.number.fractions", "algebra.expand-factor.monic", "functions.zeros.nfl"]);
    expect(f.some((l) => l.startsWith("communication."))).toBe(false);
    expect(f).not.toContain("algebra.equations.quadratic");
  });
  it("is empty with nothing ticked and nothing said", () => {
    expect(focusLeaves([], [])).toEqual([]);
  });
  describe("factorising ticked as both kinds narrows to the kind the answers name (ticket 300)", () => {
    const both = ["algebra.expand-factor.monic", "algebra.expand-factor.nonmonic"] as const;
    const say = (...texts: string[]) => texts.map((text) => ({ from: "student" as const, text }));
    it("a student who names non-monic practises non-monic only, and it opens the warm-up", () => {
      expect(focusLeaves([...both], say("the coefficient in front of the x² throws me", "same thing"))).toEqual(["algebra.expand-factor.nonmonic"]);
      expect(warmupSequence(focusLeaves([...both, "algebra.number.fractions"], say("non-monic ones", "fractions are fine")))[0].leaf).toBe("algebra.number.fractions");
      expect(warmupSequence(focusLeaves([...both], say("non-monic ones", "yeah"))).map((p) => p.leaf)).toEqual(["algebra.expand-factor.nonmonic"]);
    });
    it("and one who names monic practises monic only", () => {
      expect(focusLeaves([...both], say("the monic ones actually"))).toEqual(["algebra.expand-factor.monic"]);
    });
    it("stays both when the answers name both, neither, or only a question", () => {
      expect(focusLeaves([...both], say("i mix up the signs when i factorise"))).toEqual([...both]);
      expect(focusLeaves([...both], say("no idea", "not sure"))).toEqual([...both]);
      expect(focusLeaves([...both], say("monic is ok but non-monic isn't"))).toEqual([...both]);
      expect(focusLeaves([...both], say("Q2 looks hard"))).toEqual([...both, "functions.zeros.nfl", "algebra.number.fractions"]);
    });
    it("never drops a kind the student ticked on its own, and a question can still add the other", () => {
      expect(focusLeaves(["algebra.expand-factor.monic"], say("non-monic"))).toEqual([...both]);
      expect(focusLeaves([...both], say("the leading coefficient, like Q1"))).toEqual(["algebra.expand-factor.nonmonic", "algebra.expand-factor.monic", "functions.zeros.nfl"]);
    });
  });
});

describe("the warm-up sequence", () => {
  it("walks the focus easiest first: fractions, monic, null factor law, non-monic (quadratic equations is never isolated)", () => {
    const focus = focusLeaves(["algebra.expand-factor.monic"], [{ from: "student", text: "fractions, and Q2 looks hard" }]);
    expect(warmupSequence(focus).map((p) => p.leaf)).toEqual(["algebra.number.fractions", "algebra.expand-factor.monic", "functions.zeros.nfl", "algebra.expand-factor.nonmonic"]);
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
  it("every practice behaves alike: exactly one follow-up, on the same leaf, a different problem with the same instruction, and a choice of ways in exactly when the first has one (ticket 300)", () => {
    for (const p of WARMUP_BANK) {
      const f = p.followUp;
      expect(f, p.id).toBeDefined();
      expect(f!.id, p.id).toBe(`${p.id}-2`);
      expect(f!.leaf, p.id).toBe(p.leaf);
      expect(f!.tex, p.id).not.toBe(p.tex);
      expect(f!.followUp, `${f!.id} has no follow-up of its own`).toBeUndefined();
      expect(!!f!.approaches, `${f!.id}: approaches like ${p.id}`).toBe(!!p.approaches);
      expect(f!.hints.length, f!.id).toBeGreaterThan(0);
      expect(warmupScript(f!)).toEqual(f!.steps.map((s) => s.tex));
    }
    expect(new Set(WARMUP_BANK.flatMap((p) => [p.id, p.followUp!.id])).size).toBe(WARMUP_BANK.length * 2);
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
  const three = ["algebra.expand-factor.monic", "algebra.number.fractions", "functions.zeros.nfl"] as const;
  it("asks one turn per ticked skill, the opening in two bubbles naming them all, each later turn a reflection then the question, in the order they were ticked", () => {
    expect(concernTurns([...three])).toEqual([
      ["Let's do a warm up on factorising, fractions, & null factor law.", "First, tell me a little bit about your concerns with **factorising**."],
      ["Gotcha. It sounds like…", "How about with **fractions**?"],
      ["Agreed: that's a tricky skill.", "How about the **null factor law**?"],
    ]);
    const five = [...three, "algebra.equations.discriminant", "algebra.equations.linear"] as const;
    expect(concernTurns([...five]).map((t) => t[0])).toEqual([expect.stringMatching(/^Let's do a warm up on /), "Gotcha. It sounds like…", "Agreed: that's a tricky skill.", "A lot of students share that struggle.", "A lot of students share that struggle."]);
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
  it("reflects on each answer in turn, the last line for every later answer", () => {
    expect(REFLECTIONS).toEqual(["Gotcha. It sounds like…", "Agreed: that's a tricky skill.", "A lot of students share that struggle."]);
    expect([0, 1, 2, 3, 7].map(reflection)).toEqual([REFLECTIONS[0], REFLECTIONS[1], REFLECTIONS[2], REFLECTIONS[2], REFLECTIONS[2]]);
  });
  it("closes with the reflection on the last answer, then thanks for that insight or those insights, naming the skill the warm-up opens on", () => {
    expect(closingTurn("algebra.number.fractions", 1)).toEqual(["Gotcha. It sounds like…", "Thank you for that insight. Let's start with fractions."]);
    expect(closingTurn("algebra.number.fractions", 2)).toEqual(["Agreed: that's a tricky skill.", "Thank you for those insights. Let's start with fractions."]);
    expect(closingTurn("algebra.number.fractions", 4)).toEqual(["A lot of students share that struggle.", "Thank you for those insights. Let's start with fractions."]);
    expect(closingTurn(undefined, 1)).toEqual(["Gotcha. It sounds like…", "Thank you for that insight. Let's start."]);
  });
  it("holds the closing bubble for the length of a whole two-bubble turn before the pad", () => {
    expect(CHAT_CLOSE_MS).toBe(2800);
    expect(CHAT_CLOSE_MS).toBe(2 * (CHAT_BEAT_MS + CHAT_DOTS_MS));
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
      { from: "tutor", text: "Gotcha. It sounds like…" },
      { from: "tutor", text: turns[1][1] },
      b,
      { from: "tutor", text: "Agreed: that's a tricky skill." },
      { from: "tutor", text: turns[2][1] },
    ]);
    expect(concernsAnswered([...three], [a, b])).toBe(false);
    expect(concernsAnswered([...three], [a, b, a])).toBe(true);
    expect(concernsAnswered([], [])).toBe(false);
    expect(concernsAnswered([], [a])).toBe(true);
  });
});
