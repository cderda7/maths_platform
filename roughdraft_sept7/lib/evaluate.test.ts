import { describe, expect, it } from "vitest";
import { evaluateAttempt, nextCoreAfter, normalize, toPlain, toTex, BUILT_ON_ABOVE } from "./evaluate";
import { PROBLEM_MAP } from "@/data/problems";

const q1 = PROBLEM_MAP.q1;
const q2 = PROBLEM_MAP.q2;
const q3 = PROBLEM_MAP.q3;

describe("normalize", () => {
  it("treats typed maths and the data's TeX as the same line", () => {
    expect(normalize("x = 1/2 or x = -4")).toBe(normalize("x = \\tfrac{1}{2} \\;\\text{or}\\; x = -4"));
    expect(normalize("(2x-1)(x+4)=0")).toBe(normalize("(2x - 1)(x + 4) = 0"));
    expect(normalize("x = (5 +- sqrt(37))/6")).toBe(normalize("x = \\dfrac{5 \\pm \\sqrt{37}}{6}"));
    expect(normalize("x^2 - 5x + 6 = 0")).toBe(normalize("x² − 5x + 6 = 0"));
  });
  it("ignores the order of alternatives", () => {
    expect(normalize("x = 3 or x = 2")).toBe(normalize("x = 2 or x = 3"));
    expect(normalize("x=2, x=3")).toBe(normalize("x = 2 \\text{ or } x = 3"));
  });
  it("round-trips the data's TeX through the plain form students type", () => {
    for (const p of [q1, q2, q3]) {
      for (const s of p.solution) expect(normalize(toPlain(s.tex))).toBe(normalize(s.tex));
      for (const m of p.missteps ?? []) expect(normalize(toPlain(m.tex))).toBe(normalize(m.tex));
    }
  });
});

describe("toTex", () => {
  it("renders typed shorthand as TeX and leaves TeX alone", () => {
    expect(toTex("x = 1/2 or x = -4")).toBe("x = \\tfrac{1}{2} \\text{ or } x = -4");
    expect(toTex("x = (5 +- sqrt(37))/6")).toBe("x = (5 \\pm \\sqrt{37})/6");
    expect(toTex("\\dfrac{1}{2}")).toBe("\\dfrac{1}{2}");
  });
});

describe("evaluateAttempt", () => {
  it("marks a full correct attempt sound, reached, and advances", () => {
    const ev = evaluateAttempt(q1, ["x^2 - 5x + 6 = 0", "(x-2)(x-3) = 0", "x = 2 or x = 3"]);
    expect(ev.steps.map((s) => s.marker)).toEqual(["sound", "sound", "sound"]);
    expect(ev.steps[1].label).toBe("Factorised");
    expect(ev.reached).toBe(true);
    expect(ev.next).toMatchObject({ kind: "advance", targetProblemId: "q2" });
    expect(ev.exercised.map((e) => e.id).sort()).toEqual(["algebra", "factoring", "roots"]);
  });

  it("reproduces Jordan's Q2: slip, then sound lines built on it, then a factorising warm-up", () => {
    const ev = evaluateAttempt(q2, ["2x^2 + 7x - 4 = 0", "(2x+4)(x-1) = 0", "2x+4=0 or x-1=0", "x = -2 or x = 1"], {
      visited: ["q1"],
      evals: {},
    });
    expect(ev.steps.map((s) => s.marker)).toEqual(["sound", "slip", "sound", "sound"]);
    expect(ev.steps[2].note).toBe(BUILT_ON_ABOVE);
    expect(ev.summary).toMatch(/Line 2 doesn't hold/);
    expect(ev.exercised.find((e) => e.id === "factoring")?.status).toBe("slip");
    expect(ev.next).toMatchObject({ kind: "sidestep", targetProblemId: "p-factor" });
  });

  it("marks a line it cannot follow as unclear and asks for more, without advancing the answer", () => {
    const ev = evaluateAttempt(q1, ["x^2 - 5x + 6 = 0", "x = 7"]);
    expect(ev.steps[1].marker).toBe("unclear");
    expect(ev.steps[1].note).toMatch(/What did you do here/);
    expect(ev.reached).toBe(false);
    expect(ev.summary).toMatch(/couldn't follow/);
  });

  it("marks a correct-but-unjustified factor pair shaky", () => {
    const ev = evaluateAttempt(q2, ["2x^2 + 7x - 4 = 0", "(2x-1)(x+4) = 0", "x = 1/2 or x = -4"]);
    expect(ev.steps.map((s) => s.marker)).toEqual(["sound", "shaky", "sound"]);
    expect(ev.next.kind).toBe("advance");
  });

  it("skips blank lines and says when the answer hasn't been reached", () => {
    const ev = evaluateAttempt(q1, ["x^2 - 5x + 6 = 0", "", "  "]);
    expect(ev.steps).toHaveLength(1);
    expect(ev.reached).toBe(false);
    expect(ev.summary).toMatch(/keep going/);
  });

  it("offers the stretch after three clean core problems, and declines to re-offer a visited warm-up", () => {
    const clean = (id: string, lines: string[], visited: string[], evals: Record<string, ReturnType<typeof evaluateAttempt>>) =>
      evaluateAttempt(PROBLEM_MAP[id], lines, { visited, evals });
    const e1 = clean("q1", ["x^2 - 5x + 6 = 0", "(x-2)(x-3) = 0", "x = 2 or x = 3"], [], {});
    const e2 = clean("q2", q2.solution.map((s) => toPlain(s.tex)), ["q1"], { q1: e1 });
    const e3 = clean("q3", q3.solution.map((s) => toPlain(s.tex)), ["q1", "q2"], { q1: e1, q2: e2 });
    expect(e2.next.kind).toBe("advance");
    expect(e3.next).toMatchObject({ kind: "stretch", targetProblemId: "q6" });

    const again = evaluateAttempt(q1, ["(x+2)(x+3) = 0"], { visited: ["p-factor"], evals: {} });
    expect(again.next.kind).toBe("advance");
  });
});

describe("nextCoreAfter", () => {
  it("continues after the last core problem when leaving a warm-up", () => {
    expect(nextCoreAfter("p-factor", ["q1", "q2", "p-factor"])).toBe("q3");
    expect(nextCoreAfter("q3", ["q1", "q2", "q3", "q6"])).toBe("q4");
    expect(nextCoreAfter("q7", ["q1", "q2", "q3", "q4", "q5", "q6", "q7"])).toBeNull();
  });
});
