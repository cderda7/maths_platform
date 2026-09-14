import { describe, expect, it } from "vitest";
import { PROBLEMS } from "@/data/assignment";
import { CLASSMATES } from "@/data/classmates";
import { DIAGNOSTIC_MAP, FALLBACK_STEP, PROBLEM_DIAGNOSTICS, type DiagnosticOption, type DiagnosticStep } from "@/data/diagnostic";
import { boardContent } from "./board";
import { classroomReducer, INITIAL_CLASSROOM, type ClassroomState } from "./classroom";
import { arrivesAt, boardDiagnostic, CLASS_SIZE, classmatePick, isCorrect, latestDiagnostic, openDiagnostic, questionFor, runFor, slippedAt, stepsFor, tally, TRICKLE_FROM_MS, TRICKLE_TO_MS } from "./diagnostic";
import { evaluateLine } from "./evaluate";
import { mistakeKey, mistakesByProblem } from "./mistakes";
import { sessionAt } from "./session";
import { evalTex, namedValues, near, sameFunction, sameValues, sides } from "./texEval";

const ALL_STEPS = PROBLEM_DIAGNOSTICS.flatMap((p) => p.steps);
const step = (id: string) => DIAGNOSTIC_MAP[id];
const compact = (tex: string) => tex.replace(/\s+/g, "");

describe("step questions per problem (ticket 240)", () => {
  it("every Problem Set 6 problem has at least two steps, in order, each with four options and exactly one correct", () => {
    expect(PROBLEM_DIAGNOSTICS.map((p) => p.problemId)).toEqual(PROBLEMS.map((p) => p.id));
    for (const p of PROBLEM_DIAGNOSTICS) {
      expect(p.steps.length, p.problemId).toBeGreaterThanOrEqual(2);
      expect(stepsFor(p.problemId)).toBe(p.steps);
      for (const s of p.steps) {
        expect(s.problemId, s.id).toBe(p.problemId);
        expect(s.name.trim().length, s.id).toBeGreaterThan(0);
        expect(s.options.map((o) => o.id), s.id).toEqual(["a", "b", "c", "d"]);
        expect(s.options.filter((o) => o.id === s.correct), s.id).toHaveLength(1);
        expect(new Set(s.options.map((o) => compact(o.tex))).size, s.id).toBe(4);
      }
    }
    expect(new Set(ALL_STEPS.map((s) => s.id)).size).toBe(ALL_STEPS.length);
  });

  it("a similar problem, never the same: no step's expression or stem contains its problem's expression", () => {
    for (const p of PROBLEM_DIAGNOSTICS) {
      const original = PROBLEMS.find((x) => x.id === p.problemId)!.tex;
      const forms = [compact(original), compact(original.replace(/=\s*0$/, ""))];
      expect(forms.some((f) => compact(p.similar).includes(f)), p.problemId).toBe(false);
      for (const s of p.steps) for (const f of forms) {
        expect(compact(s.tex), s.id).not.toContain(f);
        expect(compact(s.stem), s.id).not.toContain(f);
      }
    }
  });

  it("the correct option's position varies across a problem's steps", () => {
    for (const p of PROBLEM_DIAGNOSTICS) expect(new Set(p.steps.map((s) => s.correct)).size, p.problemId).toBeGreaterThan(1);
  });

  it("every distractor names its misconception in five words or fewer, never a student's name; the right option names none", () => {
    const names = [...CLASSMATES.flatMap((c) => c.name.split(" ")), "Sam"].map((n) => n.toLowerCase());
    for (const s of [...ALL_STEPS, FALLBACK_STEP])
      for (const o of s.options) {
        if (o.id === s.correct) {
          expect(o.misconception, `${s.id} ${o.id}`).toBeUndefined();
          expect(o.slip, `${s.id} ${o.id}`).toBeUndefined();
        } else {
          expect(o.misconception, `${s.id} ${o.id}`).toBeTruthy();
          expect(o.misconception!.split(/\s+/).length, `${s.id} ${o.id}: ${o.misconception}`).toBeLessThanOrEqual(5);
          for (const w of o.misconception!.toLowerCase().split(/[\s,]+/)) expect(names, `${s.id} ${o.id}`).not.toContain(w);
        }
      }
  });

  it("each step's 'given that' stem states the correct result of the step before it", () => {
    // Words and maths alike, with spacing, brackets and TeX spacing commands set aside.
    const norm = (tex: string) => tex.replace(/\$/g, "").replace(/\\text\{([^}]*)\}/g, "$1").replace(/\\Rightarrow|\\quad|\\[;,]/g, "").replace(/[\s(),{}]/g, "");
    for (const p of PROBLEM_DIAGNOSTICS)
      p.steps.forEach((s, i) => {
        if (i === 0) return;
        expect(s.stem, s.id).toMatch(/^Given (that|the)/);
        const prev = p.steps[i - 1];
        const result = prev.options.find((o) => o.id === prev.correct)!.tex;
        const parts = result.split(/\\;\\text\{(?:or|and)\}\\;|,\\quad|\\Rightarrow/).map(norm);
        for (const part of parts) expect([part, part.replace(/=0$/, "")].some((x) => norm(s.stem).includes(x)), `${s.id} states ${part}`).toBe(true);
      });
  });

  it("a problem with no step questions (a set made through Create) falls back to the one fixed question", () => {
    expect(stepsFor("created-1")).toEqual([FALLBACK_STEP]);
    expect(FALLBACK_STEP.options.some((o) => o.slip)).toBe(false);
    expect(FALLBACK_STEP.picks).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------------------------
// The maths, checked (ticket 240): a wrong option would go on a projector.

const AND = /\\;\\text\{and\}\\;/;
const pairOf = (tex: string) => tex.split(AND).map((t) => evalTex(t)) as [number, number];
const eachOption = (s: DiagnosticStep, fn: (o: DiagnosticOption, correct: boolean) => void) => s.options.forEach((o) => fn(o, o.id === s.correct));
const fnOf = (tex: string) => (x: number) => {
  const sd = sides(tex);
  return evalTex(sd.left, { x }) - evalTex(sd.right, { x });
};
const coefficients = (tex: string) => {
  const f = fnOf(tex);
  const c = f(0);
  return { a: (f(1) + f(-1)) / 2 - c, b: (f(1) - f(-1)) / 2, c };
};
const label = (o: DiagnosticOption, re: RegExp) => !!o.misconception && re.test(o.misconception);

function pairStep(s: DiagnosticStep, sum: number, product: number, read: (tex: string) => [number, number] = pairOf) {
  eachOption(s, (o, correct) => {
    const [a, b] = read(o.tex);
    expect(near(a + b, sum) && near(a * b, product), `${s.id} ${o.id}`).toBe(correct);
    if (label(o, /product right, sum wrong/)) expect(near(a * b, product) && !near(a + b, sum), `${s.id} ${o.id}`).toBe(true);
    if (label(o, /sum right, product wrong/)) expect(near(a + b, sum) && !near(a * b, product), `${s.id} ${o.id}`).toBe(true);
    if (label(o, /signs (flipped|swapped) in the pair/)) expect(near(a + b, -sum) && near(a * b, product), `${s.id} ${o.id}`).toBe(true);
    if (label(o, /sign of ac lost/)) expect(near(a * b, -product) && near(a + b, sum), `${s.id} ${o.id}`).toBe(true);
    const m = o.misconception?.match(/multiplies to ([−+])(\d+)/);
    if (m) expect(a * b, `${s.id} ${o.id}`).toBe((m[1] === "−" ? -1 : 1) * Number(m[2]));
  });
}

/** Options that rewrite the target: the correct one agrees with it at every x, each distractor does not; a pair of linear equations must not give its roots. */
function rewriteStep(s: DiagnosticStep, target: string, roots: number[]) {
  const t = coefficients(target);
  eachOption(s, (o, correct) => {
    if (/\\text\{or\}/.test(o.tex)) {
      expect(correct, `${s.id} ${o.id}`).toBe(false);
      const solved = o.tex.split(/\\;\\text\{or\}\\;/).map((eq) => {
        const g = fnOf(eq);
        return -g(0) / (g(1) - g(0));
      });
      expect(sameValues(solved, roots), `${s.id} ${o.id}`).toBe(false);
      return;
    }
    expect(sameFunction(o.tex, target), `${s.id} ${o.id}: ${o.tex}`).toBe(correct);
    const c = coefficients(o.tex);
    if (label(o, /signs (flipped|swapped) in the pair/)) expect(near(c.c / c.a, t.c / t.a) && near(c.b / c.a, -t.b / t.a), `${s.id} ${o.id}`).toBe(true);
    if (label(o, /product right, sum wrong/)) expect(near(c.c / c.a, t.c / t.a) && !near(c.b / c.a, t.b / t.a), `${s.id} ${o.id}`).toBe(true);
    if (label(o, /sum right, product wrong/)) expect(near(c.b / c.a, t.b / t.a) && !near(c.c / c.a, t.c / t.a), `${s.id} ${o.id}`).toBe(true);
    const m = o.misconception?.match(/multiplies to ([−+])(\d+)/);
    if (m) expect(c.c / c.a, `${s.id} ${o.id}`).toBe((m[1] === "−" ? -1 : 1) * Number(m[2]));
  });
}

function rootsStep(s: DiagnosticStep, target: string, roots: number[]) {
  const f = fnOf(target);
  for (const r of roots) expect(near(f(r), 0), `${s.id}: ${r} is a root of ${target}`).toBe(true);
  eachOption(s, (o, correct) => {
    const v = namedValues(o.tex);
    expect(sameValues(v, roots), `${s.id} ${o.id}: ${o.tex}`).toBe(correct);
    if (!correct) expect(v.every((x) => near(f(x), 0)) && v.length === roots.length, `${s.id} ${o.id} solves it`).toBe(false);
    if (label(o, /signs of the (factors kept|pair flipped)|mirrored/)) expect(sameValues(v, roots.map((r) => -r)), `${s.id} ${o.id}`).toBe(true);
    if (label(o, /one sign flipped|sign lost solving a factor/)) expect(roots.some((r, i) => sameValues(v, roots.map((x, j) => (j === i ? -x : x)))), `${s.id} ${o.id}`).toBe(true);
  });
}

/** One named value: the correct option's is `want`; distractors' labels name what they took instead. */
function valueStep(s: DiagnosticStep, want: number, instead: [RegExp, number][] = []) {
  eachOption(s, (o, correct) => {
    const [v] = namedValues(o.tex);
    expect(near(v, want), `${s.id} ${o.id}: ${o.tex}`).toBe(correct);
    for (const [re, x] of instead) if (label(o, re)) expect(v, `${s.id} ${o.id}`).toBe(x);
  });
}

/** "L = R" options, each true as arithmetic; the correct one's value is `want`. */
function arithmeticStep(s: DiagnosticStep, want: number, instead: [RegExp, number][] = []) {
  eachOption(s, (o, correct) => {
    const sd = sides(o.tex.replace(/^b\^2 - 4ac = /, ""));
    const r = evalTex(sd.right);
    expect(near(evalTex(sd.left), r), `${s.id} ${o.id}: ${o.tex} is true arithmetic`).toBe(true);
    expect(near(r, want), `${s.id} ${o.id}`).toBe(correct);
    for (const [re, x] of instead) if (label(o, re)) expect(r, `${s.id} ${o.id}`).toBe(x);
  });
}

describe("the maths of every option, checked (ticket 240)", () => {
  it("Q1 on x² − 7x + 12: the pair, the factorisation, the zeros", () => {
    pairStep(step("d-q1-pair"), -7, 12);
    rewriteStep(step("d-q1-factorise"), "x^2 - 7x + 12", [3, 4]);
    rootsStep(step("d-q1-zeros"), "x^2 - 7x + 12", [3, 4]);
  });

  it("Q2 on 3x² + 5x − 2: the split, splitting the middle term, grouping, factorising, the null factor law", () => {
    pairStep(step("d-q2-split"), 5, -6);
    for (const id of ["d-q2-split-term", "d-q2-group", "d-q2-factorise"]) rewriteStep(step(id), "3x^2 + 5x - 2", [1 / 3, -2]);
    rootsStep(step("d-q2-solve"), "3x^2 + 5x - 2", [1 / 3, -2]);
  });

  it("Q3 on (x − 2)(x + 4) = 7: expand, rearrange, factorise, the null factor law", () => {
    rewriteStep(step("d-q3-expand"), "(x - 2)(x + 4) = 7", [-5, 3]);
    rewriteStep(step("d-q3-rearrange"), "(x - 2)(x + 4) = 7", [-5, 3]);
    rewriteStep(step("d-q3-factorise"), "x^2 + 2x - 15", [-5, 3]);
    rootsStep(step("d-q3-solve"), "(x - 2)(x + 4) = 7", [-5, 3]);
  });

  it("Q4 on 2x² − 7x − 3 = 0: a, b, c, the discriminant, the formula", () => {
    const { a, b, c } = coefficients("2x^2 - 7x - 3");
    eachOption(step("d-q4-abc"), (o, correct) => {
      const named = Object.fromEntries(o.tex.split(",").map((kv) => kv.split("=").map((x) => x.replace(/\\;/g, "").trim())));
      expect(near(evalTex(named.a), a) && near(evalTex(named.b), b) && near(evalTex(named.c), c), `d-q4-abc ${o.id}`).toBe(correct);
    });
    arithmeticStep(step("d-q4-discriminant"), b * b - 4 * a * c, [
      [/sign of 4ac lost/, b * b + 4 * a * c],
      [/4ac taken as 2ac/, b * b - 2 * a * c],
      [/b squared as negative/, -b * b - 4 * a * c],
    ]);
    const roots = [(7 + Math.sqrt(73)) / 4, (7 - Math.sqrt(73)) / 4];
    rootsStep(step("d-q4-formula"), "2x^2 - 7x - 3", roots);
    // The two class slips, as on the original: over a instead of 2a, and −b copied as b.
    expect(sameValues(namedValues(step("d-q4-formula").options.find((o) => o.slip?.includes("{3}"))!.tex), roots.map((r) => r * 2))).toBe(true);
    expect(sameValues(namedValues(step("d-q4-formula").options.find((o) => o.slip?.includes("-5"))!.tex), roots.map((r) => -r))).toBe(true);
  });

  it("Q5 on y = x² − 6x − 7: factorise, the intercepts, the axis, the turning point", () => {
    const f = fnOf("x^2 - 6x - 7");
    rewriteStep(step("d-q5-factorise"), "x^2 - 6x - 7", [7, -1]);
    rootsStep(step("d-q5-intercepts"), "x^2 - 6x - 7", [7, -1]);
    valueStep(step("d-q5-axis"), (7 + -1) / 2, [
      [/half the gap/, (7 - -1) / 2],
      [/sign of the axis flipped/, -3],
      [/sum not halved/, 6],
    ]);
    eachOption(step("d-q5-turning-point"), (o, correct) => {
      const [x, y] = o.tex.slice(1, -1).split(",").map((t) => evalTex(t));
      expect(near(x, 3) && near(y, f(3)), `turning point ${o.id}`).toBe(correct);
      if (label(o, /height from the wrong line/)) expect([x, y]).toEqual([3, f(0)]);
      if (label(o, /coordinates swapped/)) expect([x, y]).toEqual([f(3), 3]);
      if (label(o, /3 squared as 6/)) expect([x, y]).toEqual([3, 6 - 18 - 7]);
    });
  });

  it("Q6 on y = x² + 8x + k: the discriminant, one root, k", () => {
    const disc = (k: number) => 64 - 4 * k;
    eachOption(step("d-q6-discriminant"), (o, correct) => expect(sameFunction(o.tex, "64 - 4k", "k"), `d-q6-discriminant ${o.id}`).toBe(correct));
    expect(sameFunction("64 - 4k", "8^2 - 4(1)(k)", "k")).toBe(true);
    eachOption(step("d-q6-one-root"), (o, correct) => {
      const sd = sides(o.tex);
      const holds = (k: number) => {
        const l = evalTex(sd.left, { k });
        const r = evalTex(sd.right, { k });
        return sd.rel === "=" ? near(l, r) : sd.rel === "<" ? l < r : l > r;
      };
      // Touching once is exactly the discriminant zero: true at k = 16 alone.
      expect([15, 16, 17].map(holds).join() === "false,true,false", `d-q6-one-root ${o.id}`).toBe(correct);
      if (label(o, /read as positive/)) expect(sd.rel).toBe(">");
      if (label(o, /read as negative/)) expect(sd.rel).toBe("<");
    });
    expect(disc(16)).toBe(0);
    valueStep(step("d-q6-solve"), 16, [
      [/sign lost/, -16],
      [/4 subtracted/, 60],
      [/multiplied by 4/, 256],
    ]);
  });

  it("Q7 on ⅓x² + 3x + 20⁄3: the third out, the pair, the full factorisation", () => {
    const target = "\\tfrac{1}{3}x^2 + 3x + \\tfrac{20}{3}";
    rewriteStep(step("d-q7-third"), target, [-4, -5]);
    pairStep(step("d-q7-pair"), 9, 20);
    rewriteStep(step("d-q7-factorise"), target, [-4, -5]);
  });

  it("Q8 on y = x² − 6x + 8: the intercepts, the check by substitution", () => {
    rootsStep(step("d-q8-read"), "x^2 - 6x + 8", [2, 4]);
    arithmeticStep(step("d-q8-check"), 0);
    // Only the correct line substitutes x = 2 into every term as written.
    const right = step("d-q8-check").options.find((o) => o.id === step("d-q8-check").correct)!;
    expect(near(evalTex(sides(right.tex).left), fnOf("x^2 - 6x + 8")(2))).toBe(true);
  });

  it("Q9 on h = −x² + 8x: the factorised landing equation, where it lands, the axis, the greatest height", () => {
    const h = fnOf("-x^2 + 8x");
    rewriteStep(step("d-q9-factorise"), "-x^2 + 8x", [0, 8]);
    valueStep(step("d-q9-lands"), 8, [
      [/start read as landing/, 0],
      [/axis given as landing/, 4],
      [/sign of the factor flipped/, -8],
    ]);
    valueStep(step("d-q9-axis"), 4, [
      [/landing read as axis/, 8],
      [/sign of the axis flipped/, -4],
      [/doubled/, 16],
    ]);
    valueStep(step("d-q9-height"), h(4), [
      [/axis given as height/, 4],
      [/landing given as height/, 8],
      [/taken as \+x²/, 16 + 32],
    ]);
  });

  it("Q10 on x² + 2x + 3 = 0: the discriminant, no real solutions, the graph never meets the x-axis", () => {
    const { a, b, c } = coefficients("x^2 + 2x + 3");
    const disc = b * b - 4 * a * c;
    expect(disc).toBe(-8);
    arithmeticStep(step("d-q10-discriminant"), disc, [
      [/sign of 4ac lost/, b * b + 4 * a * c],
      [/b not squared/, b - 4 * a * c],
      [/4ac taken as 2ac/, b * b - 2 * a * c],
    ]);
    eachOption(step("d-q10-justify"), (o, correct) => expect(/\\text\{no real solutions\}$/.test(o.tex), `justify ${o.id}`).toBe(correct));
    // No real solutions and an upward parabola: its lowest point is above the axis.
    expect(fnOf("x^2 + 2x + 3")(-b / (2 * a))).toBeGreaterThan(0);
    eachOption(step("d-q10-context"), (o, correct) => expect(o.tex === "\\text{never meets the x-axis}", `context ${o.id}`).toBe(correct));
  });

  it("the evaluator reads the TeX it checks", () => {
    expect(evalTex("\\tfrac{1}{3}(x + 4)(x + 5)", { x: 1 })).toBeCloseTo(10);
    expect(evalTex("-x(x - 8)", { x: 2 })).toBe(12);
    expect(evalTex("2^2 - 6(2) + 8")).toBe(0);
    expect(evalTex("(-4) \\times (-5)")).toBe(20);
    expect(namedValues("x = \\dfrac{7 \\pm \\sqrt{73}}{4}").map((v) => v.toFixed(6))).toEqual([(7 - Math.sqrt(73)) / 4, (7 + Math.sqrt(73)) / 4].map((v) => v.toFixed(6)));
    expect(namedValues("x = -\\tfrac{1}{3} \\;\\text{or}\\; x = -2")).toEqual([-2, -1 / 3]);
    expect(sameFunction("3x(x + 2) - 1(x + 2) = 0", "3x^2 + 5x - 2")).toBe(true);
    expect(sameFunction("(x + 3)(x + 4)", "x^2 - 7x + 12")).toBe(false);
    expect(() => evalTex("\\sin x")).toThrow();
  });
});

// ---------------------------------------------------------------------------------------------
// The slips (ticket 240): every tied distractor mirrors a line a student really wrote, and the class picks from its own work.

describe("wrong options mirror the class's real slips (ticket 240)", () => {
  const mistakes = mistakesByProblem(sessionAt("feedback"));
  const rowsOf = (pid: string) => mistakes.find((p) => p.problem.id === pid)?.rows ?? [];
  const index = (id: string) => CLASSMATES.findIndex((c) => c.id === id);
  const reached = (pid: string, id: string) => {
    const c = CLASSMATES[index(id)];
    return PROBLEMS.findIndex((p) => p.id === pid) < c.done || c.wrong.includes(pid);
  };

  it("every tied distractor's source is a wrong line in the evaluation table for its problem", () => {
    for (const s of ALL_STEPS) for (const o of s.options) if (o.slip) expect(evaluateLine(s.problemId, o.slip).verdict, `${s.id} ${o.id}`).toBe("wrong");
  });

  it("every slip the class made is mirrored by some step of its problem", () => {
    for (const p of mistakes)
      for (const r of p.rows)
        for (const l of r.lines.filter((x) => x.verdict.verdict === "wrong"))
          expect(
            stepsFor(p.problem.id).some((s) => s.options.some((o) => o.slip === l.tex)),
            `${p.problem.id} ${r.id}: ${l.tex}`,
          ).toBe(true);
  });

  it("a classmate picks a tied distractor exactly when their own work on the problem has that wrong line", () => {
    for (const s of ALL_STEPS) {
      const rows = rowsOf(s.problemId);
      CLASSMATES.forEach((c, i) => {
        const pick = s.options.find((o) => o.id === classmatePick(s, i))!;
        const row = rows.find((r) => r.id === c.id);
        const tied = s.options.find((o) => o.slip && row && mistakeKey(row).split(" | ").includes(o.slip));
        if (tied) expect(pick.id, `${s.id} ${c.id}`).toBe(tied.id);
        if (pick.slip) expect(row && mistakeKey(row).split(" | ").includes(pick.slip), `${s.id} ${c.id} picks ${pick.id} without the slip`).toBe(true);
      });
    }
  });

  it("a common slip is picked only by classmates who have not reached the problem; Chloe never picks a tied distractor", () => {
    for (const s of ALL_STEPS) {
      for (const [option, who] of Object.entries(s.picks ?? {})) {
        const o = s.options.find((x) => x.id === option)!;
        expect(o.slip, `${s.id} ${option}`).toBeUndefined();
        expect(option, s.id).not.toBe(s.correct);
        for (const id of who ?? []) {
          expect(index(id), `${s.id}: ${id}`).toBeGreaterThanOrEqual(0);
          expect(reached(s.problemId, id), `${s.id}: ${id} reached ${s.problemId}`).toBe(false);
        }
      }
      expect(s.options.find((o) => o.id === classmatePick(s, index("chloe")))!.slip, s.id).toBeUndefined();
    }
  });

  it("the teacher's slip count per step equals who slipped there on the original, Sam's live row included", () => {
    const counts = Object.fromEntries(PROBLEM_DIAGNOSTICS.map((p) => [p.problemId, p.steps.map((s) => slippedAt(s, rowsOf(p.problemId)))]));
    expect(counts).toEqual({
      q1: [4, 4, 0], // Ethan and Sam's flipped signs, Liam and Oliver's pair: the pair and the factorisation
      q2: [0, 0, 0, 6, 1], // six unchecked pairs; Finn's sign solving a factor
      q3: [7, 0, 0, 0], // six on the null factor law without zero and Harper's expansion, both before any expanding
      q4: [0, 0, 5], // four over a, Isla's −b
      q5: [0, 1, 0, 3], // Tomas's intercepts; Harper, Ruby and Finn's height
      q6: [0, 1, 0], // Amelia
      q7: [11, 3, 0], // seven constants not scaled and four thirds lost; three wrong pairs
      q8: [0, 0], // nobody slipped on Q8
      q9: [1, 0, 0, 4], // Mia's bracket; four axes given as heights
      q10: [0, 2, 2], // Lucas and Sam's two solutions; Amelia and Isla's two crossings
    });
  });
});

// ---------------------------------------------------------------------------------------------

describe("diagnostic correctness", () => {
  it("knows the right option of a step question by id, and nothing of an id it no longer has", () => {
    expect(isCorrect("d-q1-pair", "c")).toBe(true);
    expect(isCorrect("d-q1-pair", "a")).toBe(false);
    expect(isCorrect("d-monic-pair", "c")).toBe(false); // a push stored before ticket 240
    expect(questionFor("d-q3-expand")).toBe(step("d-q3-expand"));
  });
});

const T0 = 1_700_000_000_000;
const push = (c: ClassroomState, questionId: string, at = T0) => classroomReducer(c, { type: "diagnostic/push", questionId, at });
const Q3 = "d-q3-expand";
const Q5 = "d-q5-intercepts";

describe("the class's answers (ticket 137)", () => {
  const run = push(INITIAL_CLASSROOM, Q3).diagnostics![0];

  it("twenty answer: the demo student and the nineteen classmates", () => {
    expect(CLASS_SIZE).toBe(20);
    expect(CLASSMATES.length).toBe(19);
  });

  it("the classmates' answers land spread between 1.5 and 8 seconds after the push, no two at once, in a fixed order", () => {
    const times = CLASSMATES.map((_, i) => arrivesAt(i));
    expect(Math.min(...times)).toBe(TRICKLE_FROM_MS);
    expect(Math.max(...times)).toBe(TRICKLE_TO_MS);
    expect(new Set(times).size).toBe(times.length);
    // Not roster order: the first classmate is not the first to answer.
    expect(times[1]).not.toBe(times[0] + (TRICKLE_TO_MS - TRICKLE_FROM_MS) / (CLASSMATES.length - 1));
  });

  it("the tally at the push is empty, climbs as the classmates land, and is complete only with the demo student's answer", () => {
    const t0 = tally(run, T0);
    expect(t0.answered).toBe(0);
    expect(t0.total).toBe(20);
    expect(Object.keys(t0.counts).sort()).toEqual(["a", "b", "c", "d"]);
    expect(Object.values(t0.counts).every((n) => n === 0)).toBe(true);
    const mid = tally(run, T0 + (TRICKLE_FROM_MS + TRICKLE_TO_MS) / 2);
    expect(mid.answered).toBeGreaterThan(0);
    expect(mid.answered).toBeLessThan(19);
    const late = tally(run, T0 + TRICKLE_TO_MS);
    expect(late.answered).toBe(19);
    expect(late.complete).toBe(false);
    // Q3's first step: Tomas, Zara, Liam, Noah and Oliver on the null factor law, Harper's sign, thirteen right.
    expect(late.counts).toEqual({ a: 5, b: 1, c: 0, d: 13 });
    const answered = classroomReducer(push(INITIAL_CLASSROOM, Q3), { type: "diagnostic/answer", option: "d" }).diagnostics![0];
    const done = tally(answered, T0 + TRICKLE_TO_MS);
    expect(done.answered).toBe(20);
    expect(done.complete).toBe(true);
    expect(done.counts.d).toBe(14);
    // The demo student's answer counts the moment it is given, before the classmates are all in.
    expect(tally(answered, T0).answered).toBe(1);
  });

  it("a push of a question nobody knows tallies nothing", () => {
    const t = tally({ questionId: "nope", pushedAt: T0 }, T0 + TRICKLE_TO_MS);
    expect(t.answered).toBe(0);
    expect(t.counts).toEqual({});
  });
});

describe("diagnostic runs on the classroom (ticket 137)", () => {
  it("a push opens a run stamped with its time; a second push is refused while it is open", () => {
    const c = push(INITIAL_CLASSROOM, Q3);
    expect(openDiagnostic(c)).toEqual({ questionId: Q3, pushedAt: T0 });
    expect(latestDiagnostic(c)).toBe(openDiagnostic(c));
    expect(push(c, Q5, T0 + 1)).toBe(c);
    expect(openDiagnostic(INITIAL_CLASSROOM)).toBeNull();
    expect(latestDiagnostic(null)).toBeNull();
  });

  it("the demo student's answer closes the run and keeps it as the latest result; a second answer is ignored", () => {
    let c = push(INITIAL_CLASSROOM, Q3);
    c = classroomReducer(c, { type: "diagnostic/answer", option: "d" });
    expect(openDiagnostic(c)).toBeNull();
    expect(latestDiagnostic(c)?.answer).toBe("d");
    expect(classroomReducer(c, { type: "diagnostic/answer", option: "a" })).toBe(c);
    c = push(c, Q5, T0 + 60_000);
    expect(c.diagnostics).toHaveLength(2);
    expect(latestDiagnostic(c)?.questionId).toBe(Q5);
  });

  it("withdrawing drops the open run and nothing else; with nothing open it is a no-op", () => {
    let c = push(INITIAL_CLASSROOM, Q3);
    c = classroomReducer(c, { type: "diagnostic/answer", option: "d" });
    c = push(c, Q5, T0 + 60_000);
    c = classroomReducer(c, { type: "diagnostic/withdraw" });
    expect(c.diagnostics?.map((r) => r.questionId)).toEqual([Q3]);
    expect(classroomReducer(c, { type: "diagnostic/withdraw" })).toBe(c);
    expect(classroomReducer(INITIAL_CLASSROOM, { type: "diagnostic/withdraw" })).toBe(INITIAL_CLASSROOM);
  });

  it("each step reads its own latest run: Q3's first step keeps its result after a Q5 step goes out", () => {
    let c = push(INITIAL_CLASSROOM, Q3);
    c = classroomReducer(c, { type: "diagnostic/answer", option: "d" });
    c = push(c, Q5, T0 + 60_000);
    expect(runFor(c, Q3)?.pushedAt).toBe(T0);
    expect(runFor(c, Q5)?.pushedAt).toBe(T0 + 60_000);
    expect(runFor(c, "d-q3-rearrange")).toBeNull();
  });

  it("reset clears the runs", () => {
    expect(classroomReducer(push(INITIAL_CLASSROOM, Q3), { type: "reset" }).diagnostics).toBeUndefined();
  });
});

describe("the diagnostic on the board (ticket 137)", () => {
  const allIn = T0 + TRICKLE_TO_MS;

  it("stays off the board while the run is open, even with every classmate in", () => {
    const c = push(INITIAL_CLASSROOM, Q3);
    expect(boardDiagnostic(c, allIn)).toBeNull();
    expect(boardContent(c, null, allIn).kind).toBe("blank");
  });

  it("goes up on its own once all twenty have answered, with the step's question and the counts", () => {
    const c = classroomReducer(push(INITIAL_CLASSROOM, Q3), { type: "diagnostic/answer", option: "d" });
    expect(boardDiagnostic(c, T0)).toBeNull();
    expect(boardDiagnostic(c, allIn)?.questionId).toBe(Q3);
    const b = boardContent(c, null, allIn);
    expect(b.kind).toBe("diagnostic");
    if (b.kind === "diagnostic") {
      expect(b.question.id).toBe(Q3);
      expect(b.tally.answered).toBe(20);
      expect(b.tally.counts.d).toBe(14);
    }
  });

  it("the teacher can put it up before everyone is in, and clear it after; a cleared run stays cleared", () => {
    let c = push(INITIAL_CLASSROOM, Q3);
    c = classroomReducer(c, { type: "diagnostic/board", on: true });
    expect(boardDiagnostic(c, T0)?.questionId).toBe(Q3);
    expect(boardContent(c, null, T0).kind).toBe("diagnostic");
    c = classroomReducer(c, { type: "diagnostic/board", on: false });
    expect(boardDiagnostic(c, T0)).toBeNull();
    c = classroomReducer(c, { type: "diagnostic/answer", option: "d" });
    expect(boardDiagnostic(c, allIn)).toBeNull();
    expect(classroomReducer(INITIAL_CLASSROOM, { type: "diagnostic/board", on: true })).toBe(INITIAL_CLASSROOM);
  });

  it("a new question replaces the old one on the board: only the latest run is ever shown", () => {
    let c = classroomReducer(push(INITIAL_CLASSROOM, Q3), { type: "diagnostic/answer", option: "d" });
    expect(boardDiagnostic(c, allIn)?.questionId).toBe(Q3);
    c = push(c, Q5, allIn);
    expect(boardDiagnostic(c, allIn)).toBeNull();
    c = classroomReducer(c, { type: "diagnostic/answer", option: "d" });
    expect(boardDiagnostic(c, allIn + TRICKLE_TO_MS)?.questionId).toBe(Q5);
  });

  it("outranks the race and a projected slide", () => {
    let c = classroomReducer(INITIAL_CLASSROOM, { type: "wc/setup", problems: ["q1"], examples: {} });
    c = classroomReducer(c, { type: "wc/project", at: T0 });
    expect(boardContent(c, null, T0).kind).toBe("whole-class");
    c = classroomReducer(push(c, Q3), { type: "diagnostic/board", on: true });
    expect(boardContent(c, null, T0).kind).toBe("diagnostic");
    c = classroomReducer(c, { type: "diagnostic/board", on: false });
    expect(boardContent(c, null, T0).kind).toBe("whole-class");
  });
});
