import { describe, expect, it } from "vitest";
import { byEase, EASE, focusLeaves, interpret, practiceFor, tutorReply, warmupScript, warmupSequence } from "./warmup";
import { isolatable, PRACTICE, WARMUP_BANK } from "@/data/practice";
import { ASSIGNMENT } from "@/data/assignment";
import { leavesTouched } from "./hierarchy";

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
  it("is the selected problems' leaves plus what the words named, communication excluded, in first-mention order", () => {
    const f = focusLeaves(["q4"], [{ from: "student", text: "fractions and Q1" }, { from: "tutor", text: "monic" }]);
    expect(f).toEqual(["unit.u1.discriminant", "algebra.number.fractions", "algebra.expand-factor.monic", "unit.u1.nfl"]);
    expect(f.some((l) => l.startsWith("communication."))).toBe(false);
    expect(f).not.toContain("algebra.equations.quadratic");
  });
  it("is empty with nothing selected and nothing said", () => {
    expect(focusLeaves([], [])).toEqual([]);
  });
});

describe("the warm-up sequence", () => {
  it("walks the focus easiest first: fractions, monic, null factor law, non-monic (quadratic equations is never isolated)", () => {
    const focus = focusLeaves(["q2"], [{ from: "student", text: "monic factorising and fractions" }]);
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

describe("the tutor's reply", () => {
  it("is short when something matched", () => {
    const focus = focusLeaves([], [{ from: "student", text: "factoring and fractions" }]);
    expect(tutorReply("factoring and fractions", focus)).toBe("Got it. Let's get started.");
  });
  it("asks again when nothing matched", () => {
    expect(tutorReply("hmm", [])).toMatch(/^I couldn't match/);
    expect(tutorReply("hmm", ["algebra.number.fractions"])).toBe("I couldn't add anything from that. Still warming up on fractions.");
  });
});
