import { describe, expect, it } from "vitest";
import { PROBLEM_MAP, PROBLEMS } from "@/data/assignment";
import { EVALUATION } from "@/data/evaluation";
import { isMisconceptionId } from "@/data/misconceptions";
import { COMPLETIONS, QUESTION_PAIRS } from "@/data/pairs";
import { PRACTICES, WARMUP_BANK } from "@/data/practice";
import { tag, type PracticeProblem, type SolutionStep } from "@/data/types";
import type { LeafId } from "@/data/taxonomy";
import { FINISHED_SETS } from "./finishedSets";
import { problemLeaves } from "./hierarchy";
import { blankSteps } from "./pairs";
import { practiceFor } from "./warmup";
import { nextLine, type RevealedLine } from "./recognition";
import { CHECKED_MISCONCEPTIONS, checkStep, readsAsStep, type BlankStep } from "./stepCheck";
import { padScript, warmupScript } from "./warmup";

/** A step of Problem Set 6 by its question and TeX. */
const ps6 = (id: string, tex: string): SolutionStep => {
  const st = PROBLEMS.find((p) => p.id === id)!.solution.find((s) => s.tex === tex);
  if (!st) throw new Error(`no step ${tex} in ${id}`);
  return st;
};
/** A practice step by its skill, which problem (the first or its follow-up) and TeX. */
const practice = (leaf: LeafId, tex: string, second = false): SolutionStep => {
  const p = second ? PRACTICES[leaf]!.followUp! : PRACTICES[leaf]!;
  const st = p.steps.find((s) => s.tex === tex);
  if (!st) throw new Error(`no step ${tex} in ${p.id}`);
  return st;
};
const step = (tex: string, ...leaves: LeafId[]): BlankStep => ({ tex, tags: leaves.map((l) => tag(l)) });

const right = { result: "right" };
const wrong = (misconception?: string) => (misconception ? { result: "wrong", misconception } : { result: "wrong" });
const unreadable = { result: "unreadable" };

/** Every step the check must read today: Problem Set 6's solutions and every practice problem and its follow-up. */
const PS6_STEPS = PROBLEMS.flatMap((p) => p.solution.map((s) => ({ where: p.id, step: s })));
const PRACTICE_STEPS = WARMUP_BANK.flatMap((p) => [p, p.followUp!]).flatMap((p) => p.steps.map((s) => ({ where: p.id, step: s })));
const STEPS = [...PS6_STEPS, ...PRACTICE_STEPS];

/** The TeX with its spacing taken out, except inside words and where a command needs the space before a letter. */
const unspaced = (tex: string): string =>
  tex
    .split(/(\\text\{[^}]*\})/)
    .map((part, i) => (i % 2 ? part : part.replace(/(\\[a-zA-Z]+)?\s+/g, (m, cmd: string | undefined, at: number, s: string) => (cmd ? (/[a-zA-Z]/.test(s[at + m.length] ?? "") ? `${cmd} ` : cmd) : ""))))
    .join("");

describe("every step reads, and is right against itself", () => {
  it.each(STEPS.map((s) => [s.where, s.step.tex, s.step] as const))("%s: %s", (_, tex, st) => {
    expect(readsAsStep(tex)).toBe(true);
    expect(checkStep(st, tex)).toEqual(right);
    expect(checkStep(st, unspaced(tex))).toEqual(right);
    expect(checkStep(st, ` ${tex.replace(/ /g, "  ")} `)).toEqual(right);
  });

  it("covers Problem Set 6's 37 solution steps and every practice problem and follow-up", () => {
    expect(PS6_STEPS.length).toBe(37);
    expect(PRACTICE_STEPS.length).toBeGreaterThan(100);
  });
});

describe("a different statement is wrong, even when it is close", () => {
  it.each(STEPS.map((s) => [s.where, s.step.tex, s.step] as const))("%s: %s with a sign flipped or a number changed", (_, tex, st) => {
    const flipped = tex.includes(" + ") ? tex.replace(" + ", " - ") : tex.includes(" - ") ? tex.replace(" - ", " + ") : null;
    if (flipped) expect(checkStep(st, flipped).result, flipped).toBe("wrong");
    const changed = tex.replace(/\d/, (d) => String((Number(d) + 1) % 10));
    if (changed !== tex) expect(checkStep(st, changed).result, changed).toBe("wrong");
  });

  it("keeps the step: nothing is multiplied out, collected or worked out", () => {
    const q1 = ps6("q1", "(x-2)(x-3) = 0");
    expect(checkStep(q1, "x^2 - 5x + 6 = 0").result).toBe("wrong");
    expect(checkStep(ps6("q1", "x^2 - 5x + 6 = 0"), "(x - 2)(x - 3) = 0").result).toBe("wrong");
    expect(checkStep(ps6("q3", "x^2 - x - 12 = 0"), "x^2 - x = 12").result).toBe("wrong");
    expect(checkStep(ps6("q2", "2x^2 + 8x - x - 4 = 0"), "2x^2 + 7x - 4 = 0").result).toBe("wrong");
    expect(checkStep(ps6("q4", "b^2 - 4ac = 25 + 12 = 37"), "b^2 - 4ac = 37").result).toBe("wrong");
    expect(checkStep(step("x = \\dfrac{6}{2} = 3"), "x = 3 = 3").result).toBe("wrong");
    expect(checkStep(ps6("q9", "-x(x - 6) = 0"), "x(x - 6) = 0").result).toBe("wrong");
    expect(checkStep(ps6("q7", "\\tfrac{1}{3}(x + 2)(x + 4)"), "\\tfrac{1}{3}(x + 2)").result).toBe("wrong");
    expect(checkStep(ps6("q1", "x = 2 \\;\\text{or}\\; x = 3"), "x = 2").result).toBe("wrong");
    expect(checkStep(ps6("q10", "\\Delta < 0 \\Rightarrow \\text{no real solutions}"), "\\text{no real solutions} \\Rightarrow \\Delta < 0").result).toBe("wrong");
  });
});

describe("equivalent forms count as right", () => {
  const factorised = step("(x + 2)(3x - 1) = 0", "algebra.expand-factor.nonmonic");
  it.each([
    "(x+2)(3x-1)=0",
    "(3x - 1)(x + 2) = 0",
    "0 = (3x - 1)(x + 2)",
    "(-1 + 3x)(2 + x) = 0",
    "(x+2)(3x-1) = 0",
    "(x + 2) \\cdot (3x - 1) = 0",
    "(x + 2) \\times (3 \\cdot x - 1) = 0",
    "(x + 2)*(3x - 1) = 0",
  ])("reordered factors, sides and terms, and any product sign: %s", (line) => {
    expect(checkStep(factorised, line)).toEqual(right);
  });

  const roots = step("x = \\tfrac{1}{3} \\;\\text{or}\\; x = -2", "functions.zeros.nfl");
  it.each(["x = 1/3 or x = -2", "x = -2 or x = 1/3", "x=-2 \\;\\text{or}\\; x=\\frac{1}{3}", "x = \\dfrac{1}{3}, x = -2", "x = -2, \\tfrac{1}{3}", "-2 = x \\text{ or } \\frac{1}{3} = x", "x = \\frac{-1}{-3} or x = -2"])(
    "the two cases in either order, fractions however written: %s",
    (line) => {
      expect(checkStep(roots, line)).toEqual(right);
    },
  );

  it("reads a minus on a fraction's top or bottom as a minus in front, and a fraction of two numbers by its value (ticket 325)", () => {
    expect(checkStep(step("x = -\\tfrac{1}{2}"), "x = \\frac{-1}{2}")).toEqual(right);
    expect(checkStep(step("x = -\\tfrac{1}{2}"), "x = \\frac{1}{-2}")).toEqual(right);
    expect(checkStep(step("x = -\\tfrac{1}{2}"), "x = -0.5")).toEqual(right);
    expect(checkStep(step("x = -\\tfrac{1}{2}"), "x = 0.5").result).toBe("wrong");
  });

  it("reads the set's own steps in other hands", () => {
    expect(checkStep(ps6("q1", "x^2 - 5x + 6 = 0"), "-5x + x^2 + 6 = 0")).toEqual(right);
    expect(checkStep(ps6("q1", "x^2 - 5x + 6 = 0"), "x**2 - 5x + 6 = 0")).toEqual(right);
    expect(checkStep(ps6("q2", "2x(x+4) - 1(x+4) = 0"), "2 \\cdot x(x + 4) - 1 \\cdot (x + 4) = 0")).toEqual(right);
    expect(checkStep(ps6("q2", "2x(x+4) - 1(x+4) = 0"), "(x + 4)2x + (-1)(x + 4) = 0")).toEqual(right);
    expect(checkStep(ps6("q2", "x = \\tfrac{1}{2} \\;\\text{or}\\; x = -4"), "x = -4 or x = 1/2")).toEqual(right);
    expect(checkStep(ps6("q2", "ac = -8,\\quad 8 + (-1) = 7"), "8 - 1 = 7, ca = -8")).toEqual(right);
    expect(checkStep(ps6("q4", "a = 3,\\; b = -5,\\; c = -1"), "c = -1, a = 3, b = -5")).toEqual(right);
    expect(checkStep(ps6("q4", "x = \\dfrac{5 \\pm \\sqrt{37}}{6}"), "x = \\frac{\\pm\\sqrt{37} + 5}{6}")).toEqual(right);
    expect(checkStep(ps6("q5", "x = \\tfrac{5 + (-1)}{2} = 2"), "2 = \\frac{5 - 1}{2} = x")).toEqual(right);
    expect(checkStep(ps6("q5", "(2, -9)"), "(2,-9)")).toEqual(right);
    expect(checkStep(ps6("q5", "(2, -9)"), "(-9, 2)").result).toBe("wrong");
    expect(checkStep(ps6("q6", "36 - 4k = 0"), "0 = -4k + 36")).toEqual(right);
    expect(checkStep(ps6("q7", "2 \\times 4 = 8,\\quad 2 + 4 = 6"), "4 + 2 = 6, 4 \\times 2 = 8")).toEqual(right);
    expect(checkStep(ps6("q8", "1 - 4 + 3 = 0 \\;\\checkmark"), "1 - 4 + 3 = 0")).toEqual(right);
    expect(checkStep(ps6("q9", "-x(x - 6) = 0"), "-(x - 6)x = 0")).toEqual(right);
    expect(checkStep(ps6("q10", "\\Delta < 0 \\Rightarrow \\text{no real solutions}"), "0 > \\Delta \\Rightarrow \\text{No real solutions.}")).toEqual(right);
    expect(checkStep(ps6("q10", "\\text{The graph never meets the x-axis}"), "\\text{the graph never meets the x-axis}")).toEqual(right);
    expect(checkStep(practice("functions.notation.evaluate", "= 4 + 6 + 1 = 11"), "= 4 + 6 + 1 = 11")).toEqual(right);
    expect(checkStep(practice("functions.notation.evaluate", "= 4 + 6 + 1 = 11"), "11 = 1 + 6 + 4 =").result).toBe("unreadable");
  });
});

describe("a line that cannot be read is unreadable", () => {
  it.each(["", "   ", ")(", "x = ", "= =", "(x + 2(x - 1) = 0", "\\sin x = 0", "x = 2 or", "\\frac{1}{", "#$%", "x @ 3"])("%j", (line) => {
    for (const { step: st } of STEPS) expect(checkStep(st, line)).toEqual(unreadable);
  });
});

describe("a wrong line that matches a known slip carries its misconception", () => {
  it.each([
    // Signs swapped in the pair
    ["q1 factorised", ps6("q1", "(x-2)(x-3) = 0"), "(x + 2)(x + 3) = 0", "pair-signs-swapped"],
    ["q1 factorised, one sign", ps6("q1", "(x-2)(x-3) = 0"), "(x + 2)(x - 3) = 0", "pair-signs-swapped"],
    ["q2 factorised", ps6("q2", "(2x - 1)(x + 4) = 0"), "(2x + 1)(x - 4) = 0", "pair-signs-swapped"],
    ["q7 factorised", ps6("q7", "\\tfrac{1}{3}(x + 2)(x + 4)"), "\\tfrac{1}{3}(x - 2)(x - 4)", "pair-signs-swapped"],
    ["practice monic follow-up", PRACTICES["algebra.expand-factor.monic"]!.followUp!.steps.find((s) => s.label === "Factorised")!, "(x + 2)(x + 5) = 0", "pair-signs-swapped"],
    ["a pair stated with its signs flipped", step("(-6) \\times (-4) = 24,\\; (-6) + (-4) = -10"), "6 \\times 4 = 24,\\; 6 + 4 = 10", "pair-signs-swapped"],
    // Product right, sum wrong (and the other way round)
    ["q1 factorised", ps6("q1", "(x-2)(x-3) = 0"), "(x - 1)(x - 6) = 0", "pair-sum-wrong"],
    ["q7 the pair", ps6("q7", "2 \\times 4 = 8,\\quad 2 + 4 = 6"), "1 \\times 8 = 8,\\quad 1 + 8 = 9", "pair-sum-wrong"],
    ["q3 factorised", ps6("q3", "(x - 4)(x + 3) = 0"), "(x - 6)(x + 2) = 0", "pair-sum-wrong"],
    ["q5 factorised", ps6("q5", "(x - 5)(x + 1) = 0"), "(x - 4)(x + 0) = 0", "pair-product-wrong"],
    ["q7 the pair", ps6("q7", "2 \\times 4 = 8,\\quad 2 + 4 = 6"), "3 \\times 3 = 9,\\quad 3 + 3 = 6", "pair-product-wrong"],
    // Sign lost solving for x
    ["q2 null factor law", ps6("q2", "x = \\tfrac{1}{2} \\;\\text{or}\\; x = -4"), "x = -\\tfrac{1}{2} \\;\\text{or}\\; x = -4", "solving-sign"],
    ["q2 typed", ps6("q2", "x = \\tfrac{1}{2} \\;\\text{or}\\; x = -4"), "x = -4 or x = -1/2", "solving-sign"],
    ["q6 solved for k", ps6("q6", "k = 9"), "k = -9", "solving-sign"],
    ["practice fractions: divided by 3", practice("algebra.number.fractions", "x = 14"), "x = -14", "solving-sign"],
    // Root or vertex sign wrong, and an intercept read off a graph
    ["q5 x-intercepts", ps6("q5", "x = 5 \\;\\text{or}\\; x = -1"), "x = -5 \\;\\text{or}\\; x = 1", "root-vertex-sign"],
    ["q1 null factor law", ps6("q1", "x = 2 \\;\\text{or}\\; x = 3"), "x = -2 or x = -3", "root-vertex-sign"],
    ["q8 read from the graph", ps6("q8", "x = 1 \\;\\text{or}\\; x = 3"), "x = -1 \\;\\text{or}\\; x = -3", "graph-signs"],
    // Minus not carried through
    ["q9 height zero, factorised", ps6("q9", "-x(x - 6) = 0"), "-x(x + 6) = 0", "minus-not-distributed"],
    ["q9 typed", ps6("q9", "-x(x - 6) = 0"), "-x(6 + x) = 0", "minus-not-distributed"],
    ["a negative taken out of three terms", step("-2(x^2 - 3x + 1)"), "-2(x^2 + 3x + 1)", "minus-not-distributed"],
    // Divided by a, not 2a; −b's minus dropped
    ["q4 quadratic formula", ps6("q4", "x = \\dfrac{5 \\pm \\sqrt{37}}{6}"), "x = \\dfrac{5 \\pm \\sqrt{37}}{3}", "formula-2a"],
    ["q4 typed", ps6("q4", "x = \\dfrac{5 \\pm \\sqrt{37}}{6}"), "x = \\frac{5 \\pm \\sqrt{37}}{3}", "formula-2a"],
    ["q4 quadratic formula", ps6("q4", "x = \\dfrac{5 \\pm \\sqrt{37}}{6}"), "x = \\dfrac{-5 \\pm \\sqrt{37}}{6}", "minus-b-dropped"],
    // Factor missing, a factor of the bottom dropped, brackets that don't expand back, a check that is wrong
    ["q7 factorised", ps6("q7", "\\tfrac{1}{3}(x + 2)(x + 4)"), "(x + 2)(x + 4)", "factor-missing"],
    ["q7 took out the third", ps6("q7", "\\tfrac{1}{3}(x^2 + 6x + 8)"), "x^2 + 6x + 8", "factor-missing"],
    ["a fraction's bottom", step("\\dfrac{4}{(\\sqrt{5} - 1)(\\sqrt{5} + 1)}"), "\\dfrac{4}{\\sqrt{5} - 1}", "denominator-dropped"],
    ["q2 factorised", ps6("q2", "(2x - 1)(x + 4) = 0"), "(2x + 4)(x - 1) = 0", "brackets-dont-expand"],
    ["practice non-monic", practice("algebra.expand-factor.nonmonic", "(3x + 4)(x + 2)"), "(3x + 2)(x + 4)", "brackets-dont-expand"],
    ["an expand-back check", step("(x - 3)(x - 8) = x^2 - 11x + 24"), "(x - 3)(x + 8) = x^2 - 11x + 24", "check-wrong"],
  ] as const)("%s: %s", (_, st, line, id) => {
    expect(checkStep(st, line)).toEqual(wrong(id));
  });

  it("names nothing for a wrong line no slip fits", () => {
    expect(checkStep(ps6("q3", "x^2 - x - 6 = 6"), "x^2 + x - 6 = 6")).toEqual(wrong());
    expect(checkStep(ps6("q5", "(2, -9)"), "(2, -5)")).toEqual(wrong());
    expect(checkStep(ps6("q10", "\\text{The graph never meets the x-axis}"), "\\text{The graph crosses the x-axis twice}")).toEqual(wrong());
  });

  it("names only real misconceptions", () => {
    for (const id of CHECKED_MISCONCEPTIONS) expect(isMisconceptionId(id), id).toBe(true);
  });
});

/**
 * The evaluation tables are the teacher-facing verdicts on every line anyone wrote. Read against the step with the same
 * label (a label used once in its question, and never a line marked right only given a wrong line above), the check
 * agrees with them: right where the table says ok, wrong where it says wrong, and a wrong line's misconception is the
 * table's or none. A handful of older table entries use the broader "brackets don't expand back" where the line fits
 * a narrower misconception's own description; those are listed with the misconception the check names.
 */
describe("agrees with the evaluation tables", () => {
  const NARROWER: Record<string, string> = {
    "ps3-q5 (x + 15)(x - 1)": "pair-sum-wrong",
    "ps3-q8 (x - 2)(x - 12)": "pair-sum-wrong",
    "ps4-q4 (2x - 1)(x + 3) = 0": "pair-signs-swapped",
    "ps5-q8 y = (2x + 1)(x - 3)": "pair-signs-swapped",
  };
  /** A right line the table accepts that takes another route to the step: a blank asks for the step's own line. */
  const OTHER_ROUTE = ["ps1-q10 d = \\sqrt{s^2 + s^2} = \\sqrt{72 + 72}"];
  const sets = [{ name: "Problem Set 6", problems: PROBLEMS, evaluation: EVALUATION }, ...FINISHED_SETS.map((s) => ({ name: s.name, problems: s.fixture.problems, evaluation: s.evaluation }))];
  const cases = sets.flatMap((s) =>
    s.problems.flatMap((p) =>
      Object.entries(s.evaluation[p.id] ?? {}).flatMap(([line, v]) => {
        const at = p.solution.filter((st) => st.label === v.label);
        return v.builtOn || v.compounds || OTHER_ROUTE.includes(`${p.id} ${line}`) || at.length !== 1 || !readsAsStep(at[0].tex) ? [] : [{ set: s.name, key: `${p.id} ${line}`, step: at[0], line, v }];
      }),
    ),
  );

  it("reads every step of every finished set too", () => {
    const unread = sets.flatMap((s) => s.problems.flatMap((p) => p.solution.filter((st) => !readsAsStep(st.tex)).map((st) => `${p.id}: ${st.tex}`)));
    expect(unread).toEqual([]);
  });

  it.each(cases.map((c) => [c.key, c] as const))("%s", (_, c) => {
    const r = checkStep(c.step, c.line);
    expect(r.result).toBe(c.v.verdict === "ok" ? "right" : "wrong");
    if (r.result !== "wrong" || !r.misconception) return;
    expect(r.misconception).toBe(NARROWER[c.key] ?? c.v.misconception);
  });

  it("covers Problem Set 6's authored slips on the five required misconceptions", () => {
    const named = cases.filter((c) => c.set === "Problem Set 6" && c.v.verdict === "wrong").map((c) => checkStep(c.step, c.line));
    const ids = named.flatMap((r) => (r.result === "wrong" && r.misconception ? [r.misconception] : []));
    for (const id of ["pair-signs-swapped", "pair-sum-wrong", "minus-not-distributed", "formula-2a"]) expect(ids).toContain(id);
    expect(checkStep(ps6("q2", "x = \\tfrac{1}{2} \\;\\text{or}\\; x = -4"), "x = -\\tfrac{1}{2} \\;\\text{or}\\; x = -4")).toEqual(wrong("solving-sign"));
    expect(Object.keys(NARROWER).every((k) => cases.some((c) => c.key === k))).toBe(true);
    expect(OTHER_ROUTE.every((k) => sets.some((s) => s.problems.some((p) => k.startsWith(`${p.id} `) && s.evaluation[p.id]?.[k.slice(p.id.length + 1)])))).toBe(true);
  });
});

/**
 * Ticket 325: the same statement with its numbers written another way is right. A number is compared by value (a
 * decimal, a fraction of two numbers however written), a bracket in a product either way round; the statement's shape
 * is kept (same factors, same cases, same terms up to order), so a line that is equal but another step stays wrong.
 */
describe("equal values count as right, a different step does not (ticket 325)", () => {
  it.each([
    ["x = \\tfrac{1}{2}", ["x = 0.5", "x = 1/2", "x = \\frac{1}{2}", "x = \\dfrac{2}{4}", "x = 0.50", "x = \\tfrac{3}{6}", "x = \\frac{-1}{-2}", "\\tfrac{2}{4} = x"]],
    ["x = 3", ["x = 6/2", "x = \\tfrac{6}{2}", "x = \\dfrac{9}{3}", "x = 3.0", "x = \\frac{-6}{-2}"]],
    ["x = -\\tfrac{1}{2}", ["x = -0.5", "x = \\frac{-2}{4}", "x = -1/2", "x = \\tfrac{1}{-2}"]],
    ["(x - 2)(x + 3) = 0", ["-(2 - x)(x + 3) = 0", "(2 - x)(-3 - x) = 0", "(x + 3)(x - 2) = 0"]],
    ["-(x - 2)(x + 3) = 0", ["(2 - x)(x + 3) = 0", "(x + 3)(2 - x) = 0", "(x - 2)(-x - 3) = 0"]],
    ["\\tfrac{1}{3}(x + 2)(x + 4)", ["\\tfrac{2}{6}(x + 2)(x + 4)", "\\dfrac{3}{9}(x + 2)(x + 4)", "\\dfrac{2}{6}(x + 4)(x + 2)", "\\frac{1}{3}(-x - 2)(-x - 4)"]],
    ["x = \\tfrac{1}{4} \\;\\text{or}\\; x = -2", ["x = 0.25 or x = -2", "x = -\\tfrac{4}{2} or x = \\tfrac{2}{8}", "x = -2, 0.25"]],
    ["y = 0.5x^2 - 3", ["y = \\tfrac{1}{2}x^2 - 3", "y = \\tfrac{2}{4}x^2 - \\tfrac{6}{2}", "y = -3 + 0.50x^2"]],
  ] as const)("%s", (tex, lines) => {
    for (const line of lines) expect(checkStep(step(tex), line), line).toEqual(right);
  });

  it("a number that only rounds to the value is wrong", () => {
    for (const line of ["x = 0.33", "x = 0.333", "x = 0.3333333333333333", "x = 0.3333333333333333333333"]) expect(checkStep(step("x = \\tfrac{1}{3}"), line).result, line).toBe("wrong");
    expect(checkStep(step("x = \\tfrac{1}{2}"), "x = 0.50000000000000000001").result).toBe("wrong");
    expect(checkStep(step("x = \\tfrac{1}{2}"), "x = 0.49").result).toBe("wrong");
    expect(checkStep(step("x = \\tfrac{2}{3}"), "x = 0.67").result).toBe("wrong");
  });

  it("an equal line that is another step stays wrong", () => {
    expect(checkStep(ps6("q1", "(x-2)(x-3) = 0"), "x^2 - 5x + 6 = 0").result).toBe("wrong");
    expect(checkStep(ps6("q1", "(x-2)(x-3) = 0"), "x = 2 \\;\\text{or}\\; x = 3").result).toBe("wrong");
    expect(checkStep(ps6("q1", "x = 2 \\;\\text{or}\\; x = 3"), "x - 2 = 0 \\;\\text{or}\\; x - 3 = 0").result).toBe("wrong");
    expect(checkStep(ps6("q1", "x = 2 \\;\\text{or}\\; x = 3"), "(x - 2)(x - 3) = 0").result).toBe("wrong");
    expect(checkStep(ps6("q7", "\\tfrac{1}{3}(x + 2)(x + 4)"), "\\tfrac{1}{3}(x^2 + 6x + 8)").result).toBe("wrong");
    expect(checkStep(ps6("q7", "\\tfrac{1}{3}(x^2 + 6x + 8)"), "\\tfrac{1}{3}x^2 + 2x + \\tfrac{8}{3}").result).toBe("wrong");
    expect(checkStep(ps6("q4", "b^2 - 4ac = 25 + 12 = 37"), "b^2 - 4ac = 37").result).toBe("wrong");
    expect(checkStep(ps6("q4", "b^2 - 4ac = 25 + 12 = 37"), "b^2 - 4ac = 37 = 37").result).toBe("wrong");
    expect(checkStep(ps6("q5", "x = \\tfrac{5 + (-1)}{2} = 2"), "x = \\tfrac{4}{2} = 2").result).toBe("wrong");
    expect(checkStep(ps6("q7", "2 \\times 4 = 8,\\quad 2 + 4 = 6"), "8 = 8,\\quad 6 = 6").result).toBe("wrong");
    expect(checkStep(step("x = \\dfrac{6}{2} = 3"), "x = 3").result).toBe("wrong");
    // A fraction the step writes not in lowest terms is the step's point: the number rewritten to match another.
    const overTwo = step("\\dfrac{x}{8} + \\dfrac{x}{4} = \\dfrac{3}{2} + \\dfrac{6}{2}", "algebra.number.fractions");
    expect(checkStep(overTwo, "\\dfrac{x}{8} + \\dfrac{x}{4} = \\dfrac{3}{2} + 3").result).toBe("wrong");
    expect(checkStep(overTwo, "\\dfrac{x}{8} + \\dfrac{x}{4} = \\dfrac{3}{2} + \\dfrac{12}{4}").result).toBe("wrong");
    expect(checkStep(overTwo, "\\frac{x}{8} + \\frac{x}{4} = 1.5 + \\frac{-6}{-2}")).toEqual(right);
    expect(checkStep(step("\\dfrac{2x}{8} = \\dfrac{9}{2}"), "\\dfrac{x}{4} = 4.5").result).toBe("wrong");
    expect(checkStep(step("\\tfrac{8}{1}"), "8").result).toBe("wrong");
    // A changed shape, not only a number: a fraction of x for a coefficient, both sides of an equation turned.
    expect(checkStep(step("y = \\tfrac{1}{2}x"), "y = \\tfrac{x}{2}").result).toBe("wrong");
    expect(checkStep(step("(x - 2)(x + 3) = 0"), "(2 - x)(x + 3) = 0").result).toBe("wrong");
    expect(checkStep(step("6x"), "2 \\cdot 3x").result).toBe("wrong");
    expect(checkStep(step("\\tfrac{3}{2}"), "\\tfrac{2 \\times 3}{4}").result).toBe("wrong");
    expect(checkStep(ps6("q9", "-x(x - 6) = 0"), "x(x - 6) = 0").result).toBe("wrong");
  });

  it("sentences are still judged by their words (a meaning check is in FUTURE_FEATURES)", () => {
    const sentence = ps6("q10", "\\text{The graph never meets the x-axis}");
    expect(checkStep(sentence, "\\text{the graph never meets the x-axis.}")).toEqual(right);
    expect(checkStep(sentence, "\\text{The graph does not touch the x-axis}").result).toBe("wrong");
  });

  it("a slip written with its numbers another way still names its misconception", () => {
    expect(checkStep(ps6("q2", "x = \\tfrac{1}{2} \\;\\text{or}\\; x = -4"), "x = -0.5 or x = -4")).toEqual(wrong("solving-sign"));
    expect(checkStep(ps6("q7", "\\tfrac{1}{3}(x + 2)(x + 4)"), "\\tfrac{2}{6}(x - 2)(x - 4)")).toEqual(wrong("pair-signs-swapped"));
    expect(checkStep(ps6("q4", "x = \\dfrac{5 \\pm \\sqrt{37}}{6}"), "x = \\dfrac{5 \\pm \\sqrt{37}}{\\tfrac{6}{2}}")).toEqual(wrong("formula-2a"));
  });

  /** Every line a student can be asked to write: each blank of every Q** (for every skill the help picker offers) and of every completion problem. */
  const blanks = [
    ...QUESTION_PAIRS.flatMap((p) =>
      problemLeaves(PROBLEM_MAP[p.problemId])
        .filter((l) => practiceFor(l) !== null)
        .flatMap((leaf) => blankSteps(p.completion.solution, leaf).map((i) => ({ id: `${p.completion.id} ${leaf} line ${i}`, steps: p.completion.solution, i }))),
    ),
    ...(Object.entries(COMPLETIONS) as [LeafId, PracticeProblem][]).flatMap(([leaf, c]) => blankSteps(c.steps, leaf).map((i) => ({ id: `${c.id} line ${i}`, steps: c.steps, i }))),
  ];

  it("covers every blank of the pairs and completion problems, and the rewrites below change most of them", () => {
    expect(blanks.length).toBeGreaterThan(40);
    const written = blanks.filter((b) => asDecimals(b.steps[b.i].tex) !== b.steps[b.i].tex || asUnsimplified(b.steps[b.i].tex) !== b.steps[b.i].tex);
    expect(written.length).toBeGreaterThan(blanks.length / 2);
    expect(blanks.some((b) => asDecimals(b.steps[b.i].tex) !== b.steps[b.i].tex)).toBe(true);  });

  it.each(blanks.map((b) => [b.id, b] as const))("%s: its fractions as decimals and its numbers as unsimplified fractions are right; the step before or after is not", (_, b) => {
    const st = b.steps[b.i];
    for (const line of [asDecimals(st.tex), asUnsimplified(st.tex), asUnsimplified(asDecimals(st.tex))]) expect(checkStep(st, line), line).toEqual(right);
    for (const other of [b.steps[b.i - 1], b.steps[b.i + 1]]) if (other) expect(checkStep(st, other.tex).result, other.tex).not.toBe("right");
  });
});

/** Words in `\text{…}` and exponents or subscripts are left alone by the rewrites below. */
const outsideWords = (tex: string, fn: (maths: string) => string): string =>
  tex
    .split(/(\\text\{[^}]*\})/)
    .map((part, i) => (i % 2 ? part : fn(part)))
    .join("");

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
/** A fraction of whole numbers in lowest terms (`\tfrac{1}{2}`, not `\dfrac{6}{2}`, which a step writes on purpose). */
const lowest = (a: string, b: string) => Number(b) > 1 && gcd(Number(a), Number(b)) === 1;

/** `\tfrac{a}{b}` in lowest terms (any fraction command) as its exact decimal where it has one: `\tfrac{1}{4}` is `0.25`. */
const asDecimals = (tex: string): string =>
  outsideWords(tex, (m) =>
    m.replace(/\\[td]?frac\{(\d+)\}\{(\d+)\}/g, (whole, a: string, b: string) => {
      if (!lowest(a, b)) return whole;
      const top = Number(a);
      const bottom = Number(b);
      for (let n = 1; n <= 6; n++) {
        const scale = 10 ** n;
        if (scale % bottom === 0) {
          const digits = String((top * scale) / bottom).padStart(n + 1, "0");
          return `${digits.slice(0, -n)}.${digits.slice(-n)}`;
        }
      }
      return whole;
    }),
  );

/**
 * Every number as an unsimplified fraction: a fraction of whole numbers in lowest terms with top and bottom doubled
 * (`\tfrac{1}{3}` is `\tfrac{2}{6}`), a fraction the step writes not in lowest terms left as it is, and every other
 * number n outside an exponent or subscript as `\tfrac{2n}{2}` (`6x` is `\tfrac{12}{2}x`, `0.25` is `\tfrac{50}{200}`).
 */
const asUnsimplified = (tex: string): string =>
  outsideWords(tex, (m) => {
    const held: string[] = [];
    const hold = (s: string) => ` ${held.push(s) - 1} `;
    const fractions = m.replace(/\\([td]?frac)\{(\d+)\}\{(\d+)\}/g, (whole, cmd: string, a: string, b: string) => hold(lowest(a, b) ? `\\${cmd}{${2 * Number(a)}}{${2 * Number(b)}}` : whole));
    const powers = fractions.replace(/[\^_](\{[^}]*\}|\d)/g, (s) => hold(s));
    const numbers = powers.replace(/(?<![\d ])(\d+)(?:\.(\d+))?(?![\d ])/g, (_, w: string, f = "") => hold(`\\tfrac{${2 * Number(w + f)}}{${2 * 10 ** f.length}}`));
    return numbers.replace(/ (\d+) /g, (_, k: string) => held[Number(k)]);
  });

describe("the demo pad's script can write a wrong line before the right one", () => {
  const monic = PRACTICES["algebra.expand-factor.monic"]!;

  it("writes exactly the steps when there are no slips, as every existing run does", () => {
    for (const p of WARMUP_BANK.flatMap((q) => [q, q.followUp!])) {
      expect(warmupScript(p)).toEqual(p.steps.map((s) => s.tex));
      expect(warmupScript(p, {})).toEqual(p.steps.map((s) => s.tex));
    }
    expect(padScript(PROBLEMS[0].solution)).toEqual(PROBLEMS[0].solution.map((s) => s.tex));
  });

  it("puts each step's slips just before its line, in order", () => {
    const script = warmupScript(monic, { 2: ["(x - 3)(x - 4) = 0", "(x + 2)(x + 6) = 0"], 4: ["x = 3 \\;\\text{or}\\; x = 4"] });
    expect(script).toEqual([
      "3 \\times 4 = 12",
      "3 + 4 = 7",
      "(x - 3)(x - 4) = 0",
      "(x + 2)(x + 6) = 0",
      "(x + 3)(x + 4) = 0",
      "x^2 + 4x + 3x + 12 \\;\\checkmark",
      "x = 3 \\;\\text{or}\\; x = 4",
      "x = -3 \\;\\text{or}\\; x = -4",
    ]);
  });

  it("reads burst by burst: the wrong line is marked, then the right line on the next burst is right", () => {
    const blank = monic.steps[2];
    const script = warmupScript(monic, { 2: ["(x - 3)(x - 4) = 0"] });
    let revealed: RevealedLine[] = [];
    for (let burst = 1; burst <= script.length; burst++) revealed = [...revealed, nextLine(script, revealed, burst * 3)!];
    expect(nextLine(script, revealed, 99)).toBeNull();
    const onBlank = revealed.slice(2, 4).map((l) => checkStep(blank, l.tex));
    expect(onBlank).toEqual([wrong("pair-signs-swapped"), right]);
    expect(revealed.map((l) => l.tex)).toEqual(script);
  });
});
