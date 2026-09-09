import { describe, expect, it } from "vitest";
import { chooseWarmup, focusLeaves, interpret, practiceCovers, tutorReply, warmupScript } from "./warmup";
import { COMPOSITE_WARMUPS, PRACTICE, WARMUP_BANK } from "@/data/practice";
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
    expect(f).toEqual(["algebra.equations.quadratic", "unit.u1.discriminant", "algebra.number.fractions", "algebra.expand-factor.monic", "unit.u1.nfl"]);
    expect(f.some((l) => l.startsWith("communication."))).toBe(false);
  });
  it("is empty with nothing selected and nothing said", () => {
    expect(focusLeaves([], [])).toEqual([]);
  });
});

describe("choosing the warm-up", () => {
  it("nothing in focus → the default warm-up", () => {
    expect(chooseWarmup([]).id).toBe(PRACTICE.id);
  });
  it("factorising and fractions → the rational-zero composite, which covers all four", () => {
    const focus = focusLeaves([], [{ from: "student", text: "factoring and fractions" }]);
    const p = chooseWarmup(focus);
    expect(p.id).toBe("w-rational-zero");
    expect(focus.every((l) => practiceCovers(p).includes(l))).toBe(true);
  });
  it("a single skill → its own practice, not a composite with extras", () => {
    expect(chooseWarmup(["unit.u1.discriminant"]).id).toBe("w-discriminant");
    expect(chooseWarmup(["algebra.expand-factor.nonmonic"]).id).toBe("w-nonmonic");
  });
  it("Q4 selected and fractions said → the discriminant-with-a-fraction composite", () => {
    expect(chooseWarmup(focusLeaves(["q4"], [{ from: "student", text: "fractions" }])).id).toBe("w-fraction-discriminant");
  });
  it("every leaf the set leans on can be warmed up by something in the bank that covers it", () => {
    for (const l of leavesTouched(ASSIGNMENT.problems).filter((l) => !l.startsWith("communication."))) {
      expect(practiceCovers(chooseWarmup([l])), l).toContain(l);
    }
  });
  it("Q2 selected and fractions said → the fraction-clearing non-monic composite (its steps are all on focus)", () => {
    expect(chooseWarmup(focusLeaves(["q2"], [{ from: "student", text: "fractions" }])).id).toBe("w-fraction-nonmonic");
  });
  it("composites have hints, follow-ups on the same leaf, and scripts", () => {
    for (const p of COMPOSITE_WARMUPS) {
      expect(p.hint.length).toBeGreaterThan(0);
      expect(p.followUp?.leaf).toBe(p.leaf);
      expect(warmupScript(p)).toEqual(p.steps.map((s) => s.tex));
    }
    expect(new Set(WARMUP_BANK.map((p) => p.id)).size).toBe(WARMUP_BANK.length);
  });
});

describe("the tutor's reply", () => {
  it("names the focus and says what one problem covers", () => {
    const focus = focusLeaves([], [{ from: "student", text: "factoring and fractions" }]);
    expect(tutorReply("factoring and fractions", focus)).toBe("Got it. Warming up on monic factorising, non-monic factorising and fractions. One problem covers all of that.");
  });
  it("says what is left for the set when one problem cannot cover everything", () => {
    const focus = focusLeaves([], [{ from: "student", text: "fractions and sketching a parabola" }]);
    expect(tutorReply("fractions and sketching a parabola", focus)).toMatch(/can come in the set\.$/);
  });
  it("asks again when nothing matched", () => {
    expect(tutorReply("hmm", [])).toMatch(/^I couldn't match/);
    expect(tutorReply("hmm", ["algebra.number.fractions"])).toBe("I couldn't add anything from that. Still warming up on fractions.");
  });
});
