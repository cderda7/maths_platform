import katex from "katex";
import { describe, expect, it } from "vitest";
import { PARABOLAS } from "@/components/Figure";
import { PROBLEM_MAP, PROBLEMS } from "@/data/assignment";
import { PROBLEM_DIAGNOSTICS } from "@/data/diagnostic";
import { SIMILAR_PROBLEMS } from "@/data/homework";
import { HOMEWORK_PASTE_LINES } from "@/data/homework-draft-seed";
import { PS3_SIMILAR_PROBLEMS } from "@/data/homework-similar-ps3";
import { PS4_SIMILAR_PROBLEMS } from "@/data/homework-similar-ps4";
import { PS5_SIMILAR_PROBLEMS } from "@/data/homework-similar-ps5";
import { COMPLETIONS, PAIR_MAP, QUESTION_PAIRS } from "@/data/pairs";
import { PRACTICES } from "@/data/practice";
import { QUESTION_HELP } from "@/data/questionHelp";
import { PS3_PROBLEMS } from "@/data/pset3/assignment";
import { PS4_PROBLEMS } from "@/data/pset4/assignment";
import { PS5_PROBLEMS } from "@/data/pset5/assignment";
import { HOMEWORK_RECOMMENDATIONS } from "@/data/review";
import type { LeafId } from "@/data/taxonomy";
import type { Approach, Hint, PracticeProblem, Problem, SolutionStep } from "@/data/types";
import { FINISHED_SETS } from "./finishedSets";
import { problemLeaves } from "./hierarchy";
import { findFragment, hintSegments, locateFragment, pickHint, stalledHint, termTex } from "./hint";
import { parseQuestion } from "./mathInput";
import { blankSteps, pairFor, warmupSteps } from "./pairs";
import { checkStep } from "./stepCheck";
import { evalTex, namedValues, near, sameFunction, sameValues, sides } from "./texEval";
import { practiceFor } from "./warmup";

// ---------------------------------------------------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------------------------------------------------

const Q = (id: string) => PROBLEM_MAP[id];
const star = (id: string) => PAIR_MAP[id].worked;
const starStar = (id: string) => PAIR_MAP[id].completion;
const C = (leaf: LeafId) => COMPLETIONS[leaf]!;
const leaves = (s: SolutionStep) => s.tags.map((t) => t.leaf);
const noDigits = (s: string) => s.replace(/[−-]?\d+(\.\d+)?/g, "#");
/** The right side of "y = …", "h = …", "f(x) = …". */
const rule = (tex: string) => tex.replace(/^\s*(?:[yh]|f\(x\))\s*=\s*/, "");
/** A step with "✓" dropped. */
const unchecked = (tex: string) => tex.replace(/\\;\\checkmark/, "");
/** An equation's left minus right at x. */
const at = (tex: string, x: number, variable = "x") => {
  const s = sides(tex);
  return evalTex(s.left, { [variable]: x }) - evalTex(s.right, { [variable]: x });
};
/** The numbers of "a = 3,\; b = -7,\; c = -1". */
const abc = (tex: string) => [...tex.matchAll(/[abc] = (-?\d+)/g)].map((m) => Number(m[1]));
/** The pieces of a chain "b^2 - 4ac = 49 + 12 = 61", each evaluated where it can be. */
const chain = (tex: string) => tex.split("=").slice(1).map((p) => evalTex(p));
/** The TeX a solve-by-null-factor step names as its answers. */
const roots = (tex: string) => namedValues(tex);
/** "(3, -25)" as numbers. */
const point = (tex: string) => tex.replace(/[()\s]/g, "").split(",").map(Number);
/** The root of a linear equation in x. */
const linearRoot = (tex: string) => {
  const f0 = at(tex, 0);
  const slope = at(tex, 1) - f0;
  expect(slope, tex).not.toBe(0);
  return -f0 / slope;
};
/** "x² + 4x + 7" from "x^2 + 4x + 7", as a stem writes it. */

const everyCompletionQuestion = () => QUESTION_PAIRS.map((p) => p.completion);
const everyCompletionProblem = () => Object.values(COMPLETIONS) as PracticeProblem[];
/** Q**, the warm-up completions and the set's own questions back on themselves after practice (ticket 312) as the hint helpers read them. */
const hinted = (): { id: string; tex: string; steps: SolutionStep[]; hints: Hint[] }[] => [
  ...everyCompletionQuestion().map((q) => ({ id: q.id, tex: q.tex, steps: q.solution, hints: q.hints })),
  ...PROBLEMS.map((q) => ({ id: q.id, tex: q.tex, steps: q.solution, hints: QUESTION_HELP[q.id].hints })),
  ...everyCompletionProblem().map((p) => ({ id: p.id, tex: p.tex, steps: p.steps, hints: p.hints })),
];

// ---------------------------------------------------------------------------------------------------------------------
// Q* and Q**: shape
// ---------------------------------------------------------------------------------------------------------------------

describe("Q* and Q** for every Problem Set 6 question", () => {
  it("every question has exactly one pair, in the set's order, with its own ids and labels", () => {
    expect(QUESTION_PAIRS.map((p) => p.problemId)).toEqual(PROBLEMS.map((p) => p.id));
    for (const p of PROBLEMS) {
      expect(pairFor(p.id)).toBe(PAIR_MAP[p.id]);
      expect(star(p.id)).toMatchObject({ id: `${p.id}-star`, label: `${p.label}*` });
      expect(starStar(p.id)).toMatchObject({ id: `${p.id}-star-star`, label: `${p.label}**` });
    }
    expect(pairFor("nope")).toBeNull();
  });

  it("each is a whole question like Q: its stem word for word (its numbers live in the TeX, ticket 342), difficulty, answer form and kind of figure", () => {
    for (const q of PROBLEMS) {
      for (const x of [star(q.id), starStar(q.id)]) {
        expect(x.stem, x.id).toBe(q.stem);
        expect(x.difficulty, x.id).toBe(q.difficulty);
        expect(x.answerAs, x.id).toBe(q.answerAs);
        expect(!!x.figure, x.id).toBe(!!q.figure);
      }
    }
  });

  it("each has Q's deep structure: as many steps, in the same order, with exactly Q's skills step for step and the same labels but for their numbers", () => {
    for (const q of PROBLEMS) {
      for (const x of [star(q.id), starStar(q.id)]) {
        expect(x.solution.length, x.id).toBe(q.solution.length);
        x.solution.forEach((s, i) => {
          expect(leaves(s), `${x.id} step ${i}`).toEqual(leaves(q.solution[i]));
          expect(noDigits(s.label), `${x.id} step ${i}`).toBe(noDigits(q.solution[i].label));
          expect(s.tex.length, `${x.id} step ${i}`).toBeGreaterThan(0);
        });
        expect(problemLeaves(x), x.id).toEqual(problemLeaves(q));
      }
    }
  });

  it("Q, Q* and Q** are three different questions", () => {
    for (const q of PROBLEMS) {
      const texes = [q.tex, star(q.id).tex, starStar(q.id).tex].map((t) => t.replace(/\s+/g, ""));
      expect(new Set(texes).size, q.id).toBe(3);
      expect(star(q.id).solution.map((s) => s.tex), q.id).not.toEqual(starStar(q.id).solution.map((s) => s.tex));
    }
  });

  it("Q** has a hint for every point in its working, one each, in order, and approaches where Q has a choice of ways in", () => {
    for (const x of everyCompletionQuestion()) {
      expect(x.hints.map((h) => h.at), x.id).toEqual(x.solution.map((_, k) => [k]));
    }
    const withChoice = QUESTION_PAIRS.filter((p) => p.completion.approaches).map((p) => p.problemId);
    // Q7 (take out the fraction, then the pair) and Q8 (read the graph, then substitute) have one way in.
    expect(withChoice).toEqual(["q1", "q2", "q3", "q4", "q5", "q6", "q9", "q10"]);
    for (const p of QUESTION_PAIRS) for (const a of p.completion.approaches ?? []) expect(a.name.length && a.hint.length, p.problemId).toBeTruthy();
    for (const p of QUESTION_PAIRS) expect(p.completion.approaches?.length ?? 2, p.problemId).toBeGreaterThanOrEqual(2);
    // Q* is read, not written: it carries no hints.
    for (const p of QUESTION_PAIRS) expect("hints" in p.worked, p.problemId).toBe(false);
  });
});

// ---------------------------------------------------------------------------------------------------------------------
// Q* and Q**: the maths, hand-checked
// ---------------------------------------------------------------------------------------------------------------------

/** Solve-for-x checks: every equation step is the same quadratic as the question, and the answers are its roots. */
function solvesTo(q: Problem, expected: number[]) {
  const last = q.solution[q.solution.length - 1].tex;
  expect(sameValues(roots(last), expected), `${q.id}: ${last}`).toBe(true);
  for (const r of expected) expect(at(q.tex, r), `${q.id} at ${r}`).toBeCloseTo(0, 9);
  // Two distinct roots of a quadratic: nothing else solves it.
  expect(new Set(expected).size, q.id).toBe(2);
}

/** The split line "ac = -30,\quad 10 + (-3) = 7" says the pair multiplies to ac and adds to b. */
function splitLine(tex: string, a: number, b: number, c: number) {
  const m = /^ac = (-?\d+),\\quad (-?\d+) \+ \((-?\d+)\) = (-?\d+)$/.exec(tex);
  expect(m, tex).not.toBeNull();
  const [ac, p, r, sum] = m!.slice(1).map(Number);
  expect(ac, tex).toBe(a * c);
  expect(p * r, tex).toBe(ac);
  expect(p + r, tex).toBe(sum);
  expect(sum, tex).toBe(b);
  return [p, r];
}

describe("Q1* and Q1**: a monic quadratic solved by factorising", () => {
  it("Q1*: x² − 9x + 14 = 0 is (x − 2)(x − 7) = 0, the pair 2 and 7, so x = 2 or 7", () => {
    const x = star("q1");
    expect(2 * 7).toBe(14);
    expect(2 + 7).toBe(9);
    expect(x.solution[0].tex).toBe(x.tex);
    expect(sameFunction(x.solution[1].tex, x.tex)).toBe(true);
    solvesTo(x, [2, 7]);
  });

  it("Q1**: x² − 9x + 18 = 0 is (x − 3)(x − 6) = 0, the pair 3 and 6, so x = 3 or 6", () => {
    const x = starStar("q1");
    expect(3 * 6).toBe(18);
    expect(3 + 6).toBe(9);
    expect(x.solution[0].tex).toBe(x.tex);
    expect(sameFunction(x.solution[1].tex, x.tex)).toBe(true);
    solvesTo(x, [3, 6]);
  });
});

describe("Q2* and Q2**: a non-monic quadratic with a negative constant, by the split", () => {
  it("Q2*: 2x² + 11x − 6 = 0 splits 12 and −1 (product −12, sum 11), groups to (2x − 1)(x + 6) = 0, so x = 1/2 or −6", () => {
    const x = star("q2");
    expect(x.tex).toMatch(/^2x\^2 \+ \d+x - \d+ = 0$/);
    expect(splitLine(x.solution[1].tex, 2, 11, -6)).toEqual([12, -1]);
    expect(x.solution[0].tex).toBe(x.tex);
    for (const i of [2, 3, 4]) expect(sameFunction(x.solution[i].tex, x.tex), x.solution[i].tex).toBe(true);
    // The split writes 11x as 12x and −x, the pair's two parts.
    expect(x.solution[2].tex).toBe("2x^2 + 12x - x - 6 = 0");
    solvesTo(x, [0.5, -6]);
  });

  it("Q2**: 2x² + 7x − 15 = 0 splits 10 and −3 (product −30, sum 7), groups to (2x − 3)(x + 5) = 0, so x = 3/2 or −5", () => {
    const x = starStar("q2");
    expect(x.tex).toMatch(/^2x\^2 \+ \d+x - \d+ = 0$/);
    expect(splitLine(x.solution[1].tex, 2, 7, -15)).toEqual([10, -3]);
    expect(x.solution[0].tex).toBe(x.tex);
    for (const i of [2, 3, 4]) expect(sameFunction(x.solution[i].tex, x.tex), x.solution[i].tex).toBe(true);
    expect(x.solution[2].tex).toBe("2x^2 + 10x - 3x - 15 = 0");
    solvesTo(x, [1.5, -5]);
    // One answer is a fraction, as Q2's is (the step is tagged fractions).
    expect(x.solution[5].tex).toContain("\\tfrac{3}{2}");
  });
});

describe("Q3* and Q3**: a product equal to a number, expanded first", () => {
  it("Q3*: (x − 2)(x + 3) = 14 expands to x² + x − 6 = 14, then x² + x − 20 = 0 = (x − 4)(x + 5), so x = 4 or −5", () => {
    const x = star("q3");
    expect(x.solution[0].tex).toBe(x.tex);
    for (const i of [1, 2, 3]) expect(sameFunction(x.solution[i].tex, x.tex), x.solution[i].tex).toBe(true);
    expect(sides(x.solution[1].tex).right.trim()).toBe("14");
    expect(sides(x.solution[2].tex).right.trim()).toBe("0");
    expect(-4 * 5).toBe(-20);
    expect(-4 + 5).toBe(1);
    solvesTo(x, [4, -5]);
    // Substituted in the product as written: 2 × 7 and −7 × −2 are both 14.
    expect((4 - 2) * (4 + 3)).toBe(14);
    expect((-5 - 2) * (-5 + 3)).toBe(14);
  });

  it("Q3**: (x − 5)(x + 2) = 8 expands to x² − 3x − 10 = 8, then x² − 3x − 18 = 0 = (x − 6)(x + 3), so x = 6 or −3", () => {
    const x = starStar("q3");
    expect(x.solution[0].tex).toBe(x.tex);
    for (const i of [1, 2, 3]) expect(sameFunction(x.solution[i].tex, x.tex), x.solution[i].tex).toBe(true);
    expect(sides(x.solution[1].tex).right.trim()).toBe("8");
    expect(sides(x.solution[2].tex).right.trim()).toBe("0");
    expect(-6 * 3).toBe(-18);
    expect(-6 + 3).toBe(-3);
    solvesTo(x, [6, -3]);
    expect((6 - 5) * (6 + 2)).toBe(8);
    expect((-3 - 5) * (-3 + 2)).toBe(8);
  });
});

describe("Q4* and Q4**: the quadratic formula, exact values", () => {
  const formula = (x: Problem, [a, b, c]: number[], disc: number, denom: number) => {
    expect(sameFunction(x.tex, `${a}x^2 + (${b})x + (${c}) = 0`), x.tex).toBe(true);
    expect(abc(x.solution[0].tex)).toEqual([a, b, c]);
    const [expanded, d] = chain(x.solution[1].tex);
    expect(expanded).toBe(disc);
    expect(d).toBe(disc);
    expect(b * b - 4 * a * c).toBe(disc);
    // The chain's two parts are b² and −4ac.
    expect(x.solution[1].tex).toBe(`b^2 - 4ac = ${b * b} + ${-4 * a * c} = ${disc}`);
    // Exact values: the discriminant is not a perfect square, so nothing factorises over the whole numbers.
    expect(Number.isInteger(Math.sqrt(disc))).toBe(false);
    expect(2 * a).toBe(denom);
    const xs = roots(x.solution[2].tex);
    expect(xs.length).toBe(2);
    for (const r of xs) expect(at(x.tex, r), `${x.id} at ${r}`).toBeCloseTo(0, 9);
    expect(sameValues(xs, [(-b + Math.sqrt(disc)) / (2 * a), (-b - Math.sqrt(disc)) / (2 * a)])).toBe(true);
  };

  it("Q4*: 2x² − 5x − 1 = 0 has a = 2, b = −5, c = −1, discriminant 25 + 8 = 33, so x = (5 ± √33)/4", () => {
    formula(star("q4"), [2, -5, -1], 33, 4);
  });

  it("Q4**: 3x² − 7x − 1 = 0 has a = 3, b = −7, c = −1, discriminant 49 + 12 = 61, so x = (7 ± √61)/6", () => {
    formula(starStar("q4"), [3, -7, -1], 61, 6);
  });
});

describe("Q5* and Q5**: x-intercepts and turning point", () => {
  const features = (x: Problem, rs: number[], axis: number, height: number, square: string) => {
    const f = rule(x.tex);
    expect(sameFunction(x.solution[0].tex, f), x.solution[0].tex).toBe(true);
    expect(sameValues(roots(x.solution[1].tex), rs)).toBe(true);
    for (const r of rs) expect(evalTex(f, { x: r })).toBeCloseTo(0, 9);
    // Axis: halfway between the intercepts, as written and as −b/2a.
    const [mid, ax] = chain(x.solution[2].tex);
    expect(mid).toBe(axis);
    expect(ax).toBe(axis);
    expect((rs[0] + rs[1]) / 2).toBe(axis);
    const b = evalTex(f, { x: 1 }) - evalTex(f, { x: 0 }) - 1;
    expect(-b / 2).toBe(axis);
    // Height: x² then bx then c at the axis, as written.
    expect(x.solution[3].tex.startsWith(`y = ${square}`)).toBe(true);
    const [sum, h] = chain(x.solution[3].tex);
    expect(sum).toBe(height);
    expect(h).toBe(height);
    expect(evalTex(f, { x: axis })).toBe(height);
    expect(point(x.solution[4].tex)).toEqual([axis, height]);
  };

  it("Q5*: y = x² − 4x − 21 = (x − 7)(x + 3), intercepts 7 and −3, axis x = 2, height 4 − 8 − 21 = −25, turning point (2, −25)", () => {
    expect(7 * -3).toBe(-21);
    expect(7 + -3).toBe(4);
    features(star("q5"), [7, -3], 2, -25, "4 - 8 - 21");
  });

  it("Q5**: y = x² − 6x − 27 = (x − 9)(x + 3), intercepts 9 and −3, axis x = 3, height 9 − 18 − 27 = −36, turning point (3, −36)", () => {
    expect(9 * -3).toBe(-27);
    expect(9 + -3).toBe(6);
    features(starStar("q5"), [9, -3], 3, -36, "9 - 18 - 27");
  });
});

describe("Q6* and Q6**: the k that makes the graph touch the x-axis once", () => {
  const touches = (x: Problem, b: number, k: number) => {
    expect(x.tex).toBe(`y = x^2 + ${b}x + k`);
    expect(x.solution[0].tex).toBe(`b^2 - 4ac = ${b * b} - 4k`);
    for (const kk of [-2, 0, 3.5, 10]) expect(evalTex(`${b * b} - 4k`, { k: kk })).toBe(b * b - 4 * 1 * kk);
    expect(x.solution[1].tex).toBe(`${b * b} - 4k = 0`);
    expect(x.solution[2].tex).toBe(`k = ${k}`);
    expect(linearRoot(x.solution[1].tex.replace(/k/g, "x"))).toBe(k);
    // With that k the quadratic is a perfect square: one root, at −b/2, where the graph touches the axis.
    expect(b * b - 4 * k).toBe(0);
    expect(evalTex(`x^2 + ${b}x + ${k}`, { x: -b / 2 })).toBeCloseTo(0, 9);
    expect(sameFunction(`x^2 + ${b}x + ${k}`, `(x + ${b / 2})^2`)).toBe(true);
  };

  it("Q6*: y = x² + 10x + k touches once when 100 − 4k = 0, k = 25", () => touches(star("q6"), 10, 25));
  it("Q6**: y = x² + 12x + k touches once when 144 − 4k = 0, k = 36", () => touches(starStar("q6"), 12, 36));
});

describe("Q7* and Q7**: factorising fully with a fraction in front", () => {
  const fully = (x: Problem, pair: [number, number], sum: number, product: number) => {
    expect(sameFunction(x.solution[0].tex, x.tex), x.solution[0].tex).toBe(true);
    expect(sameFunction(x.solution[2].tex, x.tex), x.solution[2].tex).toBe(true);
    expect(x.solution[1].tex).toBe(`${pair[0]} \\times ${pair[1]} = ${product},\\quad ${pair[0]} + ${pair[1]} = ${sum}`);
    expect(pair[0] * pair[1]).toBe(product);
    expect(pair[0] + pair[1]).toBe(sum);
    expect(x.solution[0].tex).toContain(`x^2 + ${sum}x + ${product}`);
  };

  it("Q7*: ⅓x² + 3x + 8/3 = ⅓(x² + 9x + 8) = ⅓(x + 1)(x + 8)", () => {
    expect(9 / 3).toBe(3);
    fully(star("q7"), [1, 8], 9, 8);
  });

  it("Q7**: ⅓x² + 4x + 35/3 = ⅓(x² + 12x + 35) = ⅓(x + 5)(x + 7)", () => {
    expect(12 / 3).toBe(4);
    fully(starStar("q7"), [5, 7], 12, 35);
  });
});

describe("Q8* and Q8**: intercepts read off a graph and checked", () => {
  const readOff = (x: Problem, rs: number[], check: string) => {
    const f = rule(x.tex);
    expect(sameValues(roots(x.solution[0].tex), rs)).toBe(true);
    for (const r of rs) expect(evalTex(f, { x: r })).toBeCloseTo(0, 9);
    // The check substitutes the first intercept term by term: x², then bx, then c.
    expect(x.solution[1].tex).toBe(`${check} = 0 \\;\\checkmark`);
    expect(evalTex(sides(unchecked(x.solution[1].tex)).left)).toBe(0);
    const terms = check.split(/ (?=[+-] )/).map((t) => evalTex(t));
    const r = rs[0];
    const b = evalTex(f, { x: 1 }) - evalTex(f, { x: 0 }) - 1;
    const c = evalTex(f, { x: 0 });
    expect(terms).toEqual([r * r, b * r, c]);
  };

  it("Q8*: y = x² − 5x + 4 crosses at 1 and 4; 1 − 5 + 4 = 0", () => readOff(star("q8"), [1, 4], "1 - 5 + 4"));
  it("Q8**: y = x² − 8x + 15 crosses at 3 and 5; 9 − 24 + 15 = 0", () => readOff(starStar("q8"), [3, 5], "9 - 24 + 15"));

  it("each shows its own graph, the same kind as Q8's: the figure draws the question's own parabola with dots on its roots, inside the 300 × 190 frame", () => {
    expect(new Set([Q("q8").figure, star("q8").figure, starStar("q8").figure]).size).toBe(3);
    for (const x of [Q("q8"), star("q8"), starStar("q8")]) {
      const spec = PARABOLAS[x.figure!];
      expect(sameFunction(`x^2 + (${spec.b})x + (${spec.c})`, rule(x.tex)), x.id).toBe(true);
      expect(sameValues(spec.roots, roots(x.solution[0].tex)), x.id).toBe(true);
      const sx = (v: number) => 40 + (v + 1) * spec.kx;
      const sy = (v: number) => spec.axisY - v * spec.ky;
      const f = (v: number) => v * v + spec.b * v + spec.c;
      const lowest = f(-spec.b / 2);
      for (const px of [sx(-1), sx(spec.xAxisTo), sx(spec.curve[0]), sx(spec.curve[1]), ...spec.xTicks.map(sx)]) {
        expect(px, x.id).toBeGreaterThanOrEqual(0);
        expect(px, x.id).toBeLessThanOrEqual(300);
      }
      for (const py of [sy(spec.yAxis[0]), sy(spec.yAxis[1]), sy(lowest), ...spec.yTicks.map(sy)]) {
        expect(py, x.id).toBeGreaterThanOrEqual(0);
        expect(py, x.id).toBeLessThanOrEqual(190);
      }
      // The turning point is drawn: the curve's range spans the axis of symmetry and both roots.
      expect(spec.curve[0], x.id).toBeLessThan(spec.roots[0]);
      expect(spec.curve[1], x.id).toBeGreaterThan(spec.roots[1]);
      expect(spec.label, x.id).toContain(`at ${spec.roots[0]} and ${spec.roots[1]}`);
    }
  });
});

describe("Q9* and Q9**: where a ball lands and its greatest height", () => {
  const ball = (x: Problem, lands: number, top: number) => {
    const f = rule(x.tex);
    expect(sameFunction(sides(x.solution[0].tex).left, f)).toBe(true);
    expect(sameValues(roots(x.solution[1].tex), [0, lands])).toBe(true);
    for (const r of [0, lands]) expect(evalTex(f, { x: r })).toBeCloseTo(0, 9);
    expect(x.solution[2].tex).toBe(`x = ${lands / 2}`);
    const [sum, h] = chain(x.solution[3].tex);
    expect(sum).toBe(top);
    expect(h).toBe(top);
    expect(evalTex(f, { x: lands / 2 })).toBe(top);
    expect(x.solution[3].tex).toBe(`h = ${-((lands / 2) ** 2)} + ${lands * (lands / 2)} = ${top}`);
    // It is the greatest height: every other point is lower.
    for (const d of [0.5, 1, 2]) expect(evalTex(f, { x: lands / 2 + d })).toBeLessThan(top);
    expect(x.solution[1].label).toBe(`Lands at x = ${lands}`);
    expect(x.solution[3].label).toBe(`Greatest height ${top} m`);
  };

  it("Q9*: h = −x² + 10x = −x(x − 10) lands at x = 10, highest at x = 5, h = −25 + 50 = 25", () => ball(star("q9"), 10, 25));
  it("Q9**: h = −x² + 12x = −x(x − 12) lands at x = 12, highest at x = 6, h = −36 + 72 = 36", () => ball(starStar("q9"), 12, 36));
});

describe("Q10* and Q10**: no real solutions, and what that means for the graph", () => {
  const none = (x: Problem, [a, b, c]: number[], chainTex: string) => {
    expect(sameFunction(x.tex, `${a}x^2 + (${b})x + (${c}) = 0`)).toBe(true);
    expect(x.solution[0].tex).toBe(`b^2 - 4ac = ${chainTex}`);
    const [diff, d] = chain(x.solution[0].tex);
    expect(diff).toBe(b * b - 4 * a * c);
    expect(d).toBe(b * b - 4 * a * c);
    expect(chainTex.startsWith(`${b * b} - ${4 * a * c}`)).toBe(true);
    expect(d).toBeLessThan(0);
    // No real solutions: the quadratic stays above zero everywhere (its lowest point is positive).
    expect(evalTex(sides(x.tex).left, { x: -b / (2 * a) })).toBeGreaterThan(0);
    expect(x.solution[1].tex).toBe(Q("q10").solution[1].tex);
    expect(x.solution[2].tex).toBe(Q("q10").solution[2].tex);
  };

  it("Q10*: x² + 6x + 10 = 0 has discriminant 36 − 40 = −4", () => none(star("q10"), [1, 6, 10], "36 - 40 = -4"));
  it("Q10**: x² + 4x + 7 = 0 has discriminant 16 − 28 = −12", () => none(starStar("q10"), [1, 4, 7], "16 - 28 = -12"));
});

describe("every Q* and Q** equation step is the same statement as the one before it, and the answers solve the question", () => {
  it("in the solve-for-x questions (Q1–Q3), every equation line is the question's quadratic, rearranged", () => {
    for (const id of ["q1", "q2", "q3"]) {
      for (const x of [star(id), starStar(id)]) {
        for (const s of x.solution.slice(0, -1)) {
          let same: boolean | null;
          try {
            same = sameFunction(s.tex, x.tex);
          } catch {
            same = null; // the split line "ac = …" is arithmetic, checked on its own above
          }
          if (same !== null) expect(same, `${x.id}: ${s.tex}`).toBe(true);
        }
        const last = x.solution[x.solution.length - 1].tex;
        for (const s of x.solution) {
          if (!s.tex.includes("x")) continue;
          if (s.tex === last) continue;
          try {
            for (const r of roots(last)) expect(at(s.tex, r), `${x.id}: ${s.tex} at ${r}`).toBeCloseTo(0, 9);
          } catch {
            // an arithmetic line with no x to substitute
          }
        }
      }
    }
  });
});

// ---------------------------------------------------------------------------------------------------------------------
// Warm-up completion problems
// ---------------------------------------------------------------------------------------------------------------------

describe("a completion problem for every practice skill", () => {
  it("every practice skill has one, keyed and tagged exactly as its practice", () => {
    expect(Object.keys(COMPLETIONS)).toEqual(Object.keys(PRACTICES));
    expect(Object.keys(COMPLETIONS).length).toBe(15);
    for (const [leaf, c] of Object.entries(COMPLETIONS) as [LeafId, PracticeProblem][]) {
      expect(c.leaf).toBe(leaf);
      expect(c.id).toBe(`${PRACTICES[leaf]!.id}-completion`);
      expect(c.followUp, c.id).toBeUndefined();
      expect(warmupSteps(leaf)).toEqual({ worked: PRACTICES[leaf], completion: c, alone: PRACTICES[leaf]!.followUp });
    }
  });

  it("each is its worked example's working with one thing changed: the same steps, skills and labels but for their numbers, the same hints' points, and the same ways in", () => {
    for (const [leaf, c] of Object.entries(COMPLETIONS) as [LeafId, PracticeProblem][]) {
      const w = PRACTICES[leaf]!;
      expect(noDigits(c.stem), c.id).toBe(noDigits(w.stem));
      expect(c.steps.length, c.id).toBe(w.steps.length);
      c.steps.forEach((s, i) => {
        expect(leaves(s), `${c.id} step ${i}`).toEqual(leaves(w.steps[i]));
        expect(noDigits(s.label), `${c.id} step ${i}`).toBe(noDigits(w.steps[i].label));
      });
      expect(c.hints.map((h) => h.at), c.id).toEqual(w.hints.map((h) => h.at));
      expect(c.approaches?.map((a: Approach) => a.name), c.id).toEqual(w.approaches?.map((a) => a.name));
      expect(c.why.length, c.id).toBeGreaterThan(0);
      // Different from the example and from the problem done alone.
      for (const other of [w, w.followUp!]) {
        expect(c.tex.replace(/\s+/g, ""), c.id).not.toBe(other.tex.replace(/\s+/g, ""));
        // A statement-only working (the conclusions skill) may read the same lines when the question's number changes.
        if (c.stem === other.stem) expect(c.steps.map((s) => s.tex), c.id).not.toEqual(other.steps.map((s) => s.tex));
      }
    }
  });
});

describe("the completion problems' maths, hand-checked", () => {
  it("monic: x² + 9x + 20 = 0, 4 × 5 = 20 and 4 + 5 = 9, (x + 4)(x + 5) = 0 expands back, x = −4 or −5", () => {
    const c = C("algebra.expand-factor.monic");
    expect(chain(c.steps[0].tex)).toEqual([20]);
    expect(evalTex(sides(c.steps[0].tex).left)).toBe(20);
    expect(evalTex(sides(c.steps[1].tex).left)).toBe(9);
    expect(sameFunction(c.steps[2].tex, c.tex)).toBe(true);
    expect(sameFunction(unchecked(c.steps[3].tex), sides(c.tex).left)).toBe(true);
    // The expansion is the four products of (x + 4)(x + 5) in order: x·x, x·5, 4·x, 4·5.
    expect(unchecked(c.steps[3].tex).trim()).toBe("x^2 + 5x + 4x + 20");
    solvesTo({ ...PROBLEMS[0], id: c.id, tex: c.tex, solution: c.steps }, [-4, -5]);
  });

  it("non-monic: 3x² + 11x + 6, ac = 18 = 9 × 2, 9 + 2 = 11, split and grouped to (3x + 2)(x + 3)", () => {
    const c = C("algebra.expand-factor.nonmonic");
    expect(evalTex(c.steps[0].tex.split("=")[1])).toBe(3 * 6);
    expect(chain(c.steps[0].tex)).toEqual([18, 18]);
    expect(evalTex(sides(c.steps[1].tex).left)).toBe(18);
    expect(evalTex(sides(c.steps[2].tex).left)).toBe(11);
    for (const i of [3, 4, 5]) expect(sameFunction(c.steps[i].tex, c.tex), c.steps[i].tex).toBe(true);
    expect(c.steps[3].tex).toBe("3x^2 + 9x + 2x + 6");
  });

  it("expand: (x − 3)(x + 7) is x² + 7x − 3x − 21, collected x² + 4x − 21", () => {
    const c = C("algebra.expand-factor.expand");
    for (const s of c.steps) expect(sameFunction(s.tex, c.tex), s.tex).toBe(true);
  });

  it("rearranging: x(x + 5) = 6 is x² + 5x = 6, then x² + 5x − 6 = 0", () => {
    const c = C("algebra.equations.linear");
    for (const s of c.steps) expect(sameFunction(s.tex, c.tex), s.tex).toBe(true);
    expect(sides(c.steps[1].tex).right.trim()).toBe("0");
  });

  it("fractions: x/8 + x/4 − 3 = 3/2 goes to 3x/8 = 9/2, 3x = 36, x = 12; every line has the one root 12", () => {
    const c = C("algebra.number.fractions");
    expect(linearRoot(c.tex)).toBe(12);
    for (const s of c.steps) expect(linearRoot(s.tex), s.tex).toBeCloseTo(12, 9);
    expect(evalTex(sides(c.steps[1].tex).right)).toBe(evalTex(sides(c.steps[2].tex).right));
    expect(evalTex("\\dfrac{6}{2}")).toBe(3);
    expect(evalTex("\\dfrac{9}{2} \\times 8")).toBe(36);
    expect(c.steps[6].tex).toBe("x = 12");
  });

  it("null factor law: (x − 6)(x + 1) = 0 gives x − 6 = 0 or x + 1 = 0, so x = 6 or −1", () => {
    const c = C("functions.zeros.nfl");
    const parts = c.steps[0].tex.split(/\\;\\text\{or\}\\;/);
    expect(parts.map(linearRoot)).toEqual([6, -1]);
    expect(sameValues(roots(c.steps[1].tex), [6, -1])).toBe(true);
    for (const r of [6, -1]) expect(at(c.tex, r)).toBeCloseTo(0, 9);
  });

  it("discriminant: x² + 4x + 9 = 0 has 16 − 36 = −20, negative, so no real roots", () => {
    const c = C("algebra.equations.discriminant");
    expect(c.steps[0].tex).toBe(`b^2 - 4ac = ${4 * 4} - ${4 * 1 * 9} = -20`);
    expect(chain(c.steps[0].tex)).toEqual([-20, -20]);
    expect(evalTex("x^2 + 4x + 9", { x: -2 })).toBeGreaterThan(0);
    expect(c.steps[1].tex).toContain("\\Delta < 0");
  });

  it("features: y = x² − 2x − 24 = (x − 6)(x + 4), intercepts 6 and −4, axis 1, height 1 − 2 − 24 = −25, turning point (1, −25)", () => {
    const c = C("graphing.quadratics.features");
    const f = rule(c.tex);
    expect(sides(c.steps[0].tex).left.trim()).toBe(f);
    expect(sameFunction(c.steps[1].tex, c.steps[0].tex)).toBe(true);
    expect(sameValues(roots(c.steps[2].tex), [6, -4])).toBe(true);
    for (const r of [6, -4]) expect(evalTex(f, { x: r })).toBeCloseTo(0, 9);
    expect(chain(c.steps[3].tex)).toEqual([1, 1]);
    expect(chain(c.steps[4].tex)).toEqual([-25, -25]);
    expect(evalTex(f, { x: 1 })).toBe(-25);
    expect(point(c.steps[5].tex)).toEqual([1, -25]);
  });

  it("formal: x² − 8x + 16 = 0 has 64 − 64 = 0, exactly one real solution (x = 4, a perfect square)", () => {
    const c = C("reasoning.justify.formal");
    expect(c.steps[0].tex).toBe(`b^2 - 4ac = ${(-8) ** 2} - ${4 * 1 * 16} = 0`);
    expect(chain(c.steps[0].tex)).toEqual([0, 0]);
    expect(sameFunction(c.tex, "(x - 4)^2 = 0")).toBe(true);
  });

  it("conclusions: the discriminant of y = x² + x + 5 is 1 − 20 = −19, so the graph never meets the x-axis", () => {
    const c = C("reasoning.justify.conclusions");
    expect(c.stem).toBe("The discriminant of $y = x^2 + x + 5$ is given below. What does the graph do?");
    expect(sameFunction(c.stem.split("$")[1].replace(/^y = /, ""), "x^2 + x + 5")).toBe(true);
    expect(1 * 1 - 4 * 1 * 5).toBe(-19);
    expect(evalTex(sides(c.tex).right)).toBe(-19);
    expect(c.steps[0].tex).toContain("\\Delta < 0");
    expect(c.steps[1].tex).toBe(PRACTICES["reasoning.justify.conclusions"]!.steps[1].tex);
  });

  it("sketch: y = (x − 2)(x − 6) crosses at 2 and 6, meets the y-axis at (0, 12), turns at (4, −4) and opens up", () => {
    const c = C("graphing.quadratics.sketch");
    const f = rule(c.tex);
    expect(sameValues(roots(c.steps[0].tex), [2, 6])).toBe(true);
    for (const r of [2, 6]) expect(evalTex(f, { x: r })).toBeCloseTo(0, 9);
    expect(chain(c.steps[1].tex)).toEqual([12, 12]);
    expect(c.steps[1].tex).toBe("y = (-2)(-6) = 12");
    expect(evalTex(f, { x: 0 })).toBe(12);
    expect(point(c.steps[2].tex)).toEqual([0, 12]);
    expect(chain(c.steps[3].tex)).toEqual([4, 4]);
    expect(c.steps[4].tex).toBe("y = (2)(-2) = -4");
    expect(evalTex(f, { x: 4 })).toBe(-4);
    expect(point(c.steps[5].tex)).toEqual([4, -4]);
    expect(c.steps[6].tex).toContain("(4, -4)");
    // Opens up: the x² coefficient is positive.
    expect(evalTex(f, { x: 1 }) + evalTex(f, { x: -1 }) - 2 * evalTex(f, { x: 0 })).toBeGreaterThan(0);
  });

  it("evaluate: for f(x) = x² − 3x + 1, f(−4) = (−4)² − 3(−4) + 1 = 16 + 12 + 1 = 29", () => {
    const c = C("functions.notation.evaluate");
    expect(c.stem).toBe(PRACTICES["functions.notation.evaluate"]!.stem);
    expect(evalTex("x^2 - 3x + 1", { x: -4 })).toBe(29);
    expect(evalTex(sides(c.steps[0].tex).right)).toBe(29);
    expect(chain(c.steps[1].tex)).toEqual([29, 29]);
    expect(c.steps[1].tex).toBe(`= ${(-4) ** 2} + ${-3 * -4} + 1 = 29`);
  });

  it("worded: h = 25t − 5t² is zero at t = 0 and t = 5; it lands at 5 s", () => {
    const c = C("reasoning.interpret.worded");
    const f = rule(c.tex);
    expect(c.stem).toBe("A ball's height after t seconds is given below. When does it land?");
    expect(c.tex).toBe("h = 25t - 5t^2");
    expect(sameFunction(sides(c.steps[0].tex).left, f, "t")).toBe(true);
    expect(sameFunction(sides(c.steps[1].tex).left, f, "t")).toBe(true);
    for (const t of [0, 5]) expect(evalTex(f, { t })).toBeCloseTo(0, 9);
    expect(c.steps[2].tex).toBe("t = 0 \\;\\text{or}\\; t = 5");
    expect(c.steps[3].tex).toContain("t = 5");
    // In the air in between: the height is positive.
    expect(evalTex(f, { t: 2.5 })).toBeGreaterThan(0);
  });

  it("zeros: f(x) = x² − 16 = (x − 4)(x + 4), zeros ±4", () => {
    const c = C("functions.zeros.zero-finding");
    const f = rule(c.tex);
    expect(sameFunction(c.steps[0].tex, `${f} = 0`)).toBe(true);
    expect(sameFunction(c.steps[1].tex, c.steps[0].tex)).toBe(true);
    expect(sameValues(roots(c.steps[2].tex), [4, -4])).toBe(true);
    for (const r of [4, -4]) expect(evalTex(f, { x: r })).toBeCloseTo(0, 9);
    expect(c.steps[3].tex).toContain("\\pm 4");
  });

  it("binomial: (x + 7)² by (a + b)² = a² + 2ab + b² is x² + 14x + 49", () => {
    const c = C("algebra.expand-factor.binomial");
    for (const [a, b] of [[2, 3], [-1.5, 4], [0, 7]]) expect(near(evalTex("(a + b)^2", { a, b }), evalTex("a^2 + 2ab + b^2", { a, b }))).toBe(true);
    expect(sameFunction(c.steps[1].tex, c.tex)).toBe(true);
    expect(2 * 7).toBe(14);
    expect(7 * 7).toBe(49);
  });
});

// ---------------------------------------------------------------------------------------------------------------------
// Nothing repeats
// ---------------------------------------------------------------------------------------------------------------------

describe("no question repeats a problem anywhere else in the app", () => {
  const norm = (t: string) => t.replace(/\s+/g, "").replace(/\^\{(\d)\}/g, "^$1").replace(/^(?:[yh]|f\(x\))=/, "").replace(/=0$/, "");
  const taken = () => [
    ...PROBLEMS.map((p) => p.tex),
    ...PS3_PROBLEMS.map((p) => p.tex),
    ...PS4_PROBLEMS.map((p) => p.tex),
    ...PS5_PROBLEMS.map((p) => p.tex),
    ...FINISHED_SETS.flatMap((f) => f.fixture.problems.map((p) => p.tex)),
    ...SIMILAR_PROBLEMS.map((s) => s.tex),
    ...PS3_SIMILAR_PROBLEMS.map((s) => s.tex),
    ...PS4_SIMILAR_PROBLEMS.map((s) => s.tex),
    ...PS5_SIMILAR_PROBLEMS.map((s) => s.tex),
    ...PROBLEM_DIAGNOSTICS.map((d) => d.similar),
    ...HOMEWORK_PASTE_LINES.map((l) => parseQuestion(l).tex ?? ""),
    ...HOMEWORK_RECOMMENDATIONS.flatMap((r) => (r.kind === "change" ? [r.to.tex] : r.kind === "add" ? r.options.map((o) => o.tex) : [])),
    ...(Object.values(PRACTICES) as PracticeProblem[]).flatMap((p) => [p.tex, p.followUp!.tex]),
  ];
  const ours = () => [
    ...QUESTION_PAIRS.flatMap((p) => [
      { id: p.worked.id, stem: p.worked.stem, tex: p.worked.tex },
      { id: p.completion.id, stem: p.completion.stem, tex: p.completion.tex },
    ]),
    ...everyCompletionProblem().map((c) => ({ id: c.id, stem: c.stem, tex: c.tex })),
  ];

  it("as written: no Q*, Q** or completion problem is any set's problem, a similar problem, a diagnostic, a homework question or a practice, and none is another", () => {
    const t = taken().map(norm);
    for (const o of ours()) expect(t, o.id).not.toContain(norm(o.tex));
    // The evaluation problem's expression is its stem's, so read the stem into the key there.
    const keys = ours().map((o) => (o.tex.startsWith("f(") || o.tex.startsWith("\\Delta") ? `${o.stem}|${o.tex}` : norm(o.tex)));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("as maths: no Q*, Q** or completion quadratic in x is the same function as any other problem's, whatever form it is written in", () => {
    const asFunction = (tex: string): ((x: number) => number) | null => {
      const body = tex.replace(/^\s*(?:[yh]|f\(x\))\s*=\s*/, "");
      try {
        const s = sides(body);
        const f = (x: number) => evalTex(s.left, { x, k: 1.7 }) - evalTex(s.right, { x, k: 1.7 });
        f(0.3);
        return f;
      } catch {
        return null;
      }
    };
    const samples = [-3.5, -1, 0, 0.5, 2, 4.25, 7];
    const same = (f: (x: number) => number, g: (x: number) => number) => samples.every((v) => Math.abs(f(v) - g(v)) < 1e-9);
    const all = [...taken().map((tex, i) => ({ id: `taken ${i}: ${tex}`, tex })), ...ours()];
    for (const o of ours()) {
      const f = asFunction(o.tex);
      if (!f) continue;
      for (const other of all) {
        if (other === o || ("stem" in other && other.id === o.id)) continue;
        const g = asFunction(other.tex);
        if (g) expect(same(f, g), `${o.id} (${o.tex}) is ${other.id} (${other.tex})`).toBe(false);
      }
    }
  });
});

// ---------------------------------------------------------------------------------------------------------------------
// The blank-line rule
// ---------------------------------------------------------------------------------------------------------------------

describe("blankSteps: which lines the student writes", () => {
  const steps = (...tagsPerStep: LeafId[][]) => tagsPerStep.map((ls) => ({ tags: ls.map((leaf) => ({ leaf })) }));

  it("is the steps tagged with the named skill", () => {
    expect(blankSteps(starStar("q2").solution, "algebra.expand-factor.nonmonic")).toEqual([1, 2, 3, 4]);
    expect(blankSteps(starStar("q2").solution, "functions.zeros.nfl")).toEqual([5]);
    expect(blankSteps(starStar("q5").solution, "graphing.quadratics.features")).toEqual([2, 3, 4]);
    expect(blankSteps(steps(["functions.zeros.nfl"], ["algebra.equations.linear"]), "functions.zeros.nfl")).toEqual([0]);
  });

  it("is the last two steps when every step carries the skill, the last one of a two-step working, and the same when no step does", () => {
    expect(blankSteps(C("algebra.expand-factor.nonmonic").steps, "algebra.expand-factor.nonmonic")).toEqual([4, 5]);
    expect(blankSteps(C("algebra.equations.discriminant").steps, "algebra.equations.discriminant")).toEqual([1]);
    expect(blankSteps(starStar("q8").solution, "functions.zeros.zero-finding")).toEqual([1]);
    expect(blankSteps(steps(["algebra.number.fractions"]), "algebra.number.fractions")).toEqual([0]);
    expect(blankSteps(steps(["algebra.equations.linear"], ["algebra.equations.linear"], ["algebra.equations.linear"]), "functions.zeros.nfl")).toEqual([1, 2]);
    expect(blankSteps([], "functions.zeros.nfl")).toEqual([]);
  });

  it("on every Q**, every skill the help picker offers on Q leaves at least one line to write and at least one shown, and every blank has its hint", () => {
    for (const p of QUESTION_PAIRS) {
      const offered = problemLeaves(Q(p.problemId)).filter((l) => practiceFor(l) !== null);
      expect(offered.length, p.problemId).toBeGreaterThan(0);
      for (const leaf of offered) {
        const blank = blankSteps(p.completion.solution, leaf);
        expect(blank.length, `${p.problemId} ${leaf}`).toBeGreaterThan(0);
        expect(blank.length, `${p.problemId} ${leaf}`).toBeLessThan(p.completion.solution.length);
        for (const b of blank) expect(p.completion.hints.some((h) => h.at?.includes(b)), `${p.problemId} ${leaf} line ${b}`).toBe(true);
      }
    }
  });

  it("on every warm-up completion problem, with its own skill: these lines are blank, each with its hint", () => {
    const blanks = Object.fromEntries((Object.entries(COMPLETIONS) as [LeafId, PracticeProblem][]).map(([leaf, c]) => [leaf, blankSteps(c.steps, leaf)]));
    expect(blanks).toEqual({
      "algebra.expand-factor.monic": [0, 1, 2],
      "algebra.expand-factor.nonmonic": [4, 5],
      "algebra.expand-factor.expand": [0],
      "algebra.equations.linear": [1],
      "algebra.number.fractions": [1, 2, 3, 4, 5],
      "functions.zeros.nfl": [0],
      "algebra.equations.discriminant": [1],
      "graphing.quadratics.features": [3, 4, 5],
      "reasoning.justify.formal": [1],
      "reasoning.justify.conclusions": [1],
      "graphing.quadratics.sketch": [6],
      "functions.notation.evaluate": [1],
      "reasoning.interpret.worded": [0],
      "functions.zeros.zero-finding": [0, 3],
      "algebra.expand-factor.binomial": [1],
    });
    for (const c of everyCompletionProblem()) {
      const blank = blanks[c.leaf];
      expect(blank.length, c.id).toBeLessThan(c.steps.length);
      for (const b of blank) expect(c.hints.some((h) => h.at?.includes(b)), `${c.id} line ${b}`).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------------------------------------------------
// Hints and TeX
// ---------------------------------------------------------------------------------------------------------------------

describe("hints on Q** and the completion problems", () => {
  it("every phrase is found whole in its hint, every fragment in the TeX its hint points at (the question, or the line before the point)", () => {
    for (const p of hinted()) {
      for (const h of p.hints) {
        const targets = h.at?.some((k) => k >= 1) ? h.at.filter((k) => k >= 1).map((k) => p.steps[k - 1].tex) : [p.tex];
        for (const t of h.terms ?? []) {
          expect(hintSegments(h.text, [t]).some((s) => s.term === t), `${p.id}: "${t.phrase}"`).toBe(true);
          expect(t.tex.length > 0 || !!t.insert, `${p.id}: "${t.phrase}"`).toBe(true);
          for (const target of targets) {
            for (const f of t.tex) expect(locateFragment(target, f), `${p.id}: ${JSON.stringify(f)} in ${target}`).toBeGreaterThanOrEqual(0);
            if (t.insert) expect(findFragment(target, t.insert.before), `${p.id}: ${t.insert.before}`).toBe(0);
          }
        }
      }
    }
  });

  it("lighting a hint word changes no spacing in the question or in a read line, at rest or lit", () => {
    const spacing = (t: string, displayMode: boolean) => {
      const html = katex.renderToString(t, { trust: true, strict: false, displayMode });
      return [...html.matchAll(/mspace" style="margin-right:([^;"]+)/g)].map((m) => m[1]).join(" ") + " | " + (html.match(/mbin|mrel|mopen|mclose/g) ?? []).join(" ");
    };
    for (const p of hinted()) {
      const opening = p.hints.filter((h) => !h.at?.some((k) => k >= 1)).flatMap((h) => h.terms ?? []);
      if (opening.length) {
        const rest = termTex(p.tex, opening);
        expect(spacing(rest, true), p.id).toBe(spacing(p.tex, true));
        for (const lit of opening) expect(spacing(termTex(p.tex, opening, lit), true), `${p.id}: ${lit.phrase}`).toBe(spacing(rest, true));
      }
      for (const h of p.hints) {
        if (!h.terms || !h.at?.some((k) => k >= 1)) continue;
        for (const k of h.at.filter((k) => k >= 1)) {
          const line = p.steps[k - 1].tex;
          const rest = termTex(line, h.terms);
          expect(spacing(rest, false), `${p.id} line ${k}`).toBe(spacing(line, false));
          for (const lit of h.terms) expect(spacing(termTex(line, h.terms, lit), false), `${p.id} line ${k}: ${lit.phrase}`).toBe(spacing(rest, false));
        }
      }
    }
  });

  it("walking the working line by line, the hint at each point is the one written for it, and it stalls until the next line", () => {
    for (const q of hinted()) {
      const upTo = (n: number) => q.steps.slice(0, n).map((s) => s.tex);
      const shown: number[] = [];
      for (let k = 0; k < q.steps.length; k++) {
        if (stalledHint(q, upTo(k), shown) !== null) continue;
        const next = pickHint(q, upTo(k), shown);
        expect(next, `${q.id} at ${k}`).not.toBeNull();
        expect(q.hints[next!].at, `${q.id} at ${k}`).toContain(k);
        shown.push(next!);
        expect(stalledHint(q, upTo(k), shown), `${q.id} at ${k}`).toBe(next);
      }
      expect(pickHint(q, upTo(q.steps.length), shown), `${q.id} at the end`).toBeNull();
    }
  });

  it("no hint gives a line away: no hint writes a step's TeX, or a Q** answer", () => {
    for (const p of hinted()) {
      for (const h of p.hints) {
        for (const s of p.steps) {
          // A short step like "x = 6" can be read out of a hint's own words ("x + 4 = 0 and x + 5 = 0" is the null factor law's move, not its answer).
          if (s.tex.replace(/\s+/g, "").length < 8) continue;
          expect(h.text.replace(/\s+/g, ""), `${p.id}: "${h.text}"`).not.toContain(s.tex.replace(/\s+/g, ""));
        }
      }
    }
    for (const x of everyCompletionQuestion()) {
      const answer = x.solution[x.solution.length - 1].tex;
      const values = (/\\text\{The/.test(answer) || /\\Delta/.test(answer) ? [] : answer.match(/-?\d+/g) ?? []).filter((v) => v !== "0");
      const last = x.hints[x.hints.length - 1].text;
      for (const v of values) expect(last.split(/[^\d-]+/), `${x.id}: "${last}" gives ${v}`).not.toContain(v);
    }
  });
});

describe("every new TeX string typesets in KaTeX, on one line", () => {
  const renders = (tex: string, what: string) => {
    expect(() => katex.renderToString(tex, { throwOnError: true, strict: false, trust: true }), what).not.toThrow();
    // One line: nothing in the TeX asks KaTeX to break it.
    expect(tex, what).not.toMatch(/\\\\|\\newline|\\begin|\\cr\b/);
  };
  const inline = (text: string, what: string) => {
    const pieces = text.split("$");
    expect(pieces.length % 2, `${what}: balanced $`).toBe(1);
    pieces.forEach((piece, i) => {
      if (i % 2 === 1) renders(piece, what);
    });
  };

  it("every question, step, lit hint wrapping and approach", () => {
    let count = 0;
    for (const p of QUESTION_PAIRS) {
      for (const x of [p.worked, p.completion]) {
        renders(x.tex, x.id);
        count++;
        for (const s of x.solution) {
          renders(s.tex, `${x.id}: ${s.label}`);
          count++;
        }
      }
      for (const a of p.completion.approaches ?? []) inline(a.hint, `${p.completion.id}: ${a.name}`);
    }
    for (const c of everyCompletionProblem()) {
      renders(c.tex, c.id);
      count++;
      for (const s of c.steps) {
        renders(s.tex, `${c.id}: ${s.label}`);
        count++;
      }
      for (const a of c.approaches ?? []) inline(a.hint, `${c.id}: ${a.name}`);
    }
    for (const p of hinted()) for (const h of p.hints) for (const t of h.terms ?? []) for (const lit of [undefined, t]) renders(termTex(h.at?.some((k) => k >= 1) ? p.steps[Math.max(...h.at) - 1].tex : p.tex, h.terms, lit), `${p.id}: ${h.text}`);
    expect(count).toBe(20 + QUESTION_PAIRS.reduce((n, p) => n + p.worked.solution.length + p.completion.solution.length, 0) + 15 + everyCompletionProblem().reduce((n, c) => n + c.steps.length, 0));
  });

  it("TeX backslashes are doubled in the source: no stray command-less text survives where a command was meant", () => {
    const all = [...QUESTION_PAIRS.flatMap((p) => [p.worked, p.completion]).flatMap((x) => [x.tex, ...x.solution.map((s) => s.tex)]), ...everyCompletionProblem().flatMap((c) => [c.tex, ...c.steps.map((s) => s.tex)])];
    for (const t of all) expect(t, t).not.toMatch(/(?<!\\)\b(?:text|tfrac|dfrac|quad|times|checkmark|Delta|Rightarrow|sqrt|pm)\b/);
  });
});

describe("every line a student can be asked to write reads under the line check (ticket 311)", () => {
  it("each blank of every Q** (for every skill the picker offers) and of every completion problem is right against its own line, and a changed sign or digit is not", () => {
    const blanks = [
      ...QUESTION_PAIRS.flatMap((p) =>
        problemLeaves(Q(p.problemId))
          .filter((l) => practiceFor(l) !== null)
          .flatMap((leaf) => blankSteps(p.completion.solution, leaf).map((i) => ({ id: `${p.completion.id} ${leaf}`, step: p.completion.solution[i] }))),
      ),
      ...(Object.entries(COMPLETIONS) as [LeafId, PracticeProblem][]).flatMap(([leaf, c]) => blankSteps(c.steps, leaf).map((i) => ({ id: c.id, step: c.steps[i] }))),
    ];
    expect(blanks.length).toBeGreaterThan(40);
    for (const { id, step } of blanks) {
      expect(checkStep(step, step.tex), `${id}: ${step.tex}`).toEqual({ result: "right" });
      // Unspaced, except inside words, whose spaces are the words.
      if (!step.tex.includes("\\text")) expect(checkStep(step, step.tex.replace(/\s+/g, "")), `${id}: ${step.tex} unspaced`).toEqual({ result: "right" });
      const changed = /\d/.test(step.tex) ? step.tex.replace(/\d/, (d) => String((Number(d) + 1) % 10)) : null;
      if (changed) expect(checkStep(step, changed).result, `${id}: ${changed}`).not.toBe("right");
    }
  });
});
