import katex from "katex";
import { describe, expect, it } from "vitest";
import { PROBLEMS } from "@/data/assignment";
import { PROBLEM_DIAGNOSTICS } from "@/data/diagnostic";
import { SIMILAR_PROBLEMS, SIMILAR_MAP } from "@/data/homework";
import * as homework from "./homework";
import { everWrong, HOMEWORK_LEAD_MS, homeworkDone, homeworkProblems, lastLanded, MOTION, perTile, REDUCED_MOTION, sameTypeLine, stemWords, texDiff, texShape, tileLands, tileMoment, tileStart, wordDiff } from "./homework";
import { INITIAL_SESSION, sessionAt, sessionReducer, type StudentSession } from "./session";
import { skipFixture } from "./demo";
import { evalTex, namedValues, sameFunction, sameValues, sides } from "./texEval";

const compact = (tex: string) => tex.replace(/\s+/g, "");
const line = (tex: string, n = 0) => ({ tex, strokeCount: (n + 1) * 5 });

describe("which problems go into homework (ticket 256)", () => {
  // Q1 in four ways: wrong at first submit then fixed, still wrong, never wrong, not attempted.
  const withQ1 = (first: string[], second: string[] = []): StudentSession => ({
    ...INITIAL_SESSION,
    lines: { q1: first.map(line) },
    rework: second.length ? { q1: second.map(line) } : {},
  });
  const q1 = (s: StudentSession) => homeworkProblems(s, PROBLEMS.slice(0, 1)).map((p) => p.id);

  it("wrong at first submit and fixed in review still goes", () => {
    expect(q1(withQ1(["x^2 - 5x + 6 = 0", "(x + 2)(x + 3) = 0"], ["(x - 2)(x - 3) = 0", "x = 2 \\;\\text{or}\\; x = 3"]))).toEqual(["q1"]);
  });
  it("still wrong goes", () => {
    expect(q1(withQ1(["(x + 2)(x + 3) = 0"], ["(x + 2)(x + 3) = 0"]))).toEqual(["q1"]);
  });
  it("never wrong stays", () => {
    expect(q1(withQ1(["x^2 - 5x + 6 = 0", "(x-2)(x-3) = 0", "x = 2 \\;\\text{or}\\; x = 3"]))).toEqual([]);
  });
  it("not attempted goes", () => {
    expect(q1(withQ1([]))).toEqual(["q1"]);
    expect(everWrong("q1", { first: [], finished: false, second: [] })).toBe(true);
  });
  it("right at first but wrong on a second submission goes", () => {
    expect(everWrong("q1", { first: ["(x-2)(x-3) = 0"], finished: true, second: ["(x + 2)(x + 3) = 0"] })).toBe(true);
  });

  it("Sam's run sends Q1, Q2, Q3, Q7 and Q10, in set order; a run where every step held sends none", () => {
    expect(homeworkProblems(sessionAt("report")).map((p) => p.label)).toEqual(["Q1", "Q2", "Q3", "Q7", "Q10"]);
    expect(homeworkProblems(sessionAt("report", "strong"))).toEqual([]);
  });
});

describe("the similar problems (ticket 256)", () => {
  it("one per Problem Set 6 problem, in set order", () => {
    expect(SIMILAR_PROBLEMS.map((s) => s.problemId)).toEqual(PROBLEMS.map((p) => p.id));
  });

  it("every question, stem and step typesets", () => {
    for (const s of SIMILAR_PROBLEMS) {
      for (const tex of [s.tex, ...s.solution.map((st) => st.tex)]) expect(() => katex.renderToString(tex, { throwOnError: true, strict: false, trust: true }), `${s.problemId}: ${tex}`).not.toThrow();
      const d = texDiff(PROBLEMS.find((p) => p.id === s.problemId)!.tex, s.tex);
      for (const tex of [d.from, d.to]) expect(() => katex.renderToString(tex, { throwOnError: true, strict: false, trust: true }), `${s.problemId}: ${tex}`).not.toThrow();
    }
  });

  it("differs from its original in numbers only, digit for digit, so the change keeps the question's shape", () => {
    for (const s of SIMILAR_PROBLEMS) {
      const p = PROBLEMS.find((x) => x.id === s.problemId)!;
      expect(compact(s.tex), s.problemId).not.toBe(compact(p.tex));
      expect(texShape(s.tex), s.problemId).toBe(texShape(p.tex));
      expect(texDiff(p.tex, s.tex).aligned, s.problemId).toBe(true);
      expect(texDiff(p.tex, s.tex).changes, s.problemId).toBeGreaterThan(0);
    }
  });

  it("is not a live diagnostic's similar problem either (ticket 240)", () => {
    for (const s of SIMILAR_PROBLEMS) for (const d of PROBLEM_DIAGNOSTICS) expect(compact(s.tex), `${s.problemId} vs ${d.problemId}`).not.toBe(compact(d.similar));
  });

  it("carries exactly its original's skills and a named type", () => {
    for (const s of SIMILAR_PROBLEMS) {
      const p = PROBLEMS.find((x) => x.id === s.problemId)!;
      const leaves = (steps: { tags: { leaf: string }[] }[]) => [...new Set(steps.flatMap((st) => st.tags.map((t) => t.leaf)))].sort();
      expect(leaves(s.solution), s.problemId).toEqual(leaves(p.solution));
      expect(s.solution.length, s.problemId).toBe(p.solution.length);
      expect(s.type.trim().length, s.problemId).toBeGreaterThan(0);
      expect(!!s.figure, s.problemId).toBe(!!p.figure);
      expect(s.stem.endsWith("?") || s.stem.endsWith("."), s.problemId).toBe(p.stem.endsWith("?") || p.stem.endsWith("."));
    }
  });

  // The maths, problem by problem.
  const S = (id: string) => SIMILAR_MAP[id];
  const st = (id: string, i: number) => S(id).solution[i].tex;
  const roots = (tex: string) => namedValues(tex);
  const satisfies = (eq: string, xs: number[]) => xs.every((x) => Math.abs(evalTex(sides(eq).left, { x }) - evalTex(sides(eq).right, { x })) < 1e-9);

  it("Q1: x² − 8x + 7 = (x − 1)(x − 7), zeros 1 and 7", () => {
    expect(sameFunction(st("q1", 1), S("q1").tex)).toBe(true);
    expect(sameValues(roots(st("q1", 2)), [1, 7])).toBe(true);
    expect(satisfies(S("q1").tex, [1, 7])).toBe(true);
  });

  it("Q2: 2x² + 3x − 9 split, grouped and factorised, zeros 3/2 and −3", () => {
    expect(evalTex("-18")).toBe(2 * -9);
    expect(6 * -3).toBe(-18);
    expect(6 + -3).toBe(3);
    for (const i of [2, 3, 4]) expect(sameFunction(st("q2", i), S("q2").tex), st("q2", i)).toBe(true);
    expect(sameValues(roots(st("q2", 5)), [1.5, -3])).toBe(true);
    expect(satisfies(S("q2").tex, [1.5, -3])).toBe(true);
  });

  it("Q3: (x − 4)(x + 1) = 6 expanded, rearranged, factorised, x = 5 or −2", () => {
    expect(sameFunction(st("q3", 1), S("q3").tex)).toBe(true);
    expect(sameFunction(st("q3", 2), S("q3").tex)).toBe(true);
    expect(sameFunction(st("q3", 3), st("q3", 2))).toBe(true);
    expect(sameValues(roots(st("q3", 4)), [5, -2])).toBe(true);
    expect(satisfies(S("q3").tex, [5, -2])).toBe(true);
  });

  it("Q4: 2x² − 3x − 4 = 0 has discriminant 41 and x = (3 ± √41)/4", () => {
    expect(evalTex("(-3)^2 - 4(2)(-4)")).toBe(41);
    expect(evalTex("9 + 32")).toBe(41);
    const xs = roots(st("q4", 2));
    expect(xs).toHaveLength(2);
    expect(satisfies(S("q4").tex, xs)).toBe(true);
  });

  it("Q5: y = x² − 2x − 8 crosses at 4 and −2, turning point (1, −9)", () => {
    expect(sameFunction(st("q5", 0), S("q5").tex.replace(/^y = /, "") + " = 0")).toBe(true);
    expect(sameValues(roots(st("q5", 1)), [4, -2])).toBe(true);
    expect(evalTex("\\tfrac{4 + (-2)}{2}")).toBe(1);
    expect(evalTex("1 - 2 - 8")).toBe(evalTex("x^2 - 2x - 8", { x: 1 }));
    expect(evalTex("1 - 2 - 8")).toBe(-9);
    expect(st("q5", 4)).toBe("(1, -9)");
  });

  it("Q6: y = x² + 4x + k touches once when 16 − 4k = 0, k = 4", () => {
    expect(sameFunction(st("q6", 0).split("=")[1], "4^2 - 4(1)(k)", "k")).toBe(true);
    expect(evalTex("16 - 4k", { k: 4 })).toBe(0);
    expect(st("q6", 2)).toBe("k = 4");
  });

  it("Q7: ½x² + 2x + 3/2 = ½(x² + 4x + 3) = ½(x + 1)(x + 3)", () => {
    for (const i of [0, 2]) expect(sameFunction(st("q7", i), S("q7").tex), st("q7", i)).toBe(true);
    expect(1 * 3).toBe(3);
    expect(1 + 3).toBe(4);
  });

  it("Q8: y = x² − 6x + 5 crosses at 1 and 5, checked", () => {
    expect(sameValues(roots(st("q8", 0)), [1, 5])).toBe(true);
    expect(satisfies("x^2 - 6x + 5 = 0", [1, 5])).toBe(true);
    expect(evalTex("1 - 6 + 5")).toBe(0);
  });

  it("Q9: h = −x² + 4x lands at 4, greatest height 4 at x = 2", () => {
    expect(sameFunction(st("q9", 0), "-x^2 + 4x = 0")).toBe(true);
    expect(sameValues(roots(st("q9", 1)), [0, 4])).toBe(true);
    expect(evalTex("-x^2 + 4x", { x: 2 })).toBe(4);
    expect(evalTex("-4 + 8")).toBe(4);
    expect(S("q9").solution[3].label).toMatch(/4 m/);
  });

  it("Q10: x² + 3x + 4 = 0 has discriminant 9 − 16 = −7, and the stem is the bank's (the graph is the expression's, said once)", () => {
    expect(evalTex("3^2 - 4(1)(4)")).toBe(-7);
    expect(evalTex("9 - 16")).toBe(-7);
    expect(S("q10").stem).toBe(PROBLEMS[9].stem);
  });
});

describe("changing a question into its similar one", () => {
  it("wraps each changed number in both, a superscript's in braces, and leaves the rest as written", () => {
    expect(texDiff("x^2 - 5x + 6 = 0", "x^2 - 8x + 7 = 0")).toEqual({ from: "x^2 - \\htmlClass{hw-diff}{5}x + \\htmlClass{hw-diff}{6} = 0", to: "x^2 - \\htmlClass{hw-diff}{8}x + \\htmlClass{hw-diff}{7} = 0", aligned: true, changes: 2 });
    expect(texDiff("x^2 + 1", "x^3 + 1").from).toBe("x^{\\htmlClass{hw-diff}{2}} + 1");
    expect(texDiff("\\tfrac{1}{3}x^2 + 2x + \\tfrac{8}{3}", "\\tfrac{1}{2}x^2 + 2x + \\tfrac{3}{2}").to).toBe("\\tfrac{1}{\\htmlClass{hw-diff}{2}}x^2 + 2x + \\tfrac{\\htmlClass{hw-diff}{3}}{\\htmlClass{hw-diff}{2}}");
    expect(texDiff("x + 12", "x + 5").aligned).toBe(false);
  });

  it("pairs a stem's changed words and keeps the rest", () => {
    expect(wordDiff("Solve for x.", "Solve for x.")).toEqual([{ from: "Solve for x.", to: "Solve for x." }]);
    expect(wordDiff("A ball's height after", "A stone's height after")).toEqual([
      { from: "A", to: "A" },
      { from: "ball's", to: "stone's" },
      { from: "height after", to: "height after" },
    ]);
    expect(wordDiff("For $f(x) = x^2 - 3x + 1$, find", "For $f(x) = 2x^2 + x - 5$, find")).toEqual([
      { from: "For", to: "For" },
      { from: "$f(x) = x^2 - 3x + 1$,", to: "$f(x) = 2x^2 + x - 5$," },
      { from: "find", to: "find" },
    ]);
    for (const s of SIMILAR_PROBLEMS) {
      const runs = wordDiff(PROBLEMS.find((p) => p.id === s.problemId)!.stem, s.stem);
      expect(runs.map((r) => r.from).join(" "), s.problemId).toBe(PROBLEMS.find((p) => p.id === s.problemId)!.stem);
      expect(runs.map((r) => r.to).join(" "), s.problemId).toBe(s.stem);
    }
  });

  it("reads a stem's inline maths as one word, so a diff never cuts into it (ticket 342)", () => {
    expect(stemWords("Solve for x.")).toEqual(["Solve", "for", "x."]);
    expect(stemWords("Write in the form $a(x + h)^2 + k$, and state the turning point.")).toEqual(["Write", "in", "the", "form", "$a(x + h)^2 + k$,", "and", "state", "the", "turning", "point."]);
  });

  it("the line names the type and whether the numbers or the set-up changed", () => {
    expect(sameTypeLine(PROBLEMS[0], SIMILAR_MAP.q1)).toBe("Same type, new numbers: solving a quadratic by factorising");
    expect(sameTypeLine(PROBLEMS[8], SIMILAR_MAP.q9)).toMatch(/^Same type, new set-up: /);
    expect(sameTypeLine(PROBLEMS[9], SIMILAR_MAP.q10)).toMatch(/^Same type, new numbers: /);
  });
});

describe("the sequence", () => {
  const per = MOTION.expand + MOTION.read + MOTION.morph + MOTION.hold + MOTION.fly + MOTION.gap;

  it("one tile at a time after the lead: expand, read, change, hold, fly, then in the folder", () => {
    expect(tileMoment(0, HOMEWORK_LEAD_MS - 1, false).phase).toBe("waiting");
    expect(tileMoment(0, HOMEWORK_LEAD_MS, false)).toEqual({ phase: "expanding", p: 0 });
    const at = (ms: number) => tileMoment(0, HOMEWORK_LEAD_MS + ms, false).phase;
    expect(at(MOTION.expand)).toBe("original");
    expect(at(MOTION.expand + MOTION.read)).toBe("morphing");
    expect(at(MOTION.expand + MOTION.read + MOTION.morph)).toBe("similar");
    expect(at(MOTION.expand + MOTION.read + MOTION.morph + MOTION.hold)).toBe("flying");
    expect(at(per - MOTION.gap)).toBe("banked");
    expect(tileStart(1, false)).toBe(HOMEWORK_LEAD_MS + per);
    // The next tile waits until the one before is in the folder.
    expect(tileMoment(1, tileLands(0, false), false).phase).toBe("waiting");
  });

  it("about two seconds a problem, the change the longest phase, the holds either side short (ticket 274)", () => {
    expect(MOTION).toEqual({ expand: 250, read: 250, morph: 650, hold: 350, fly: 450, gap: 50 });
    expect(REDUCED_MOTION).toEqual({ show: 1950, gap: 50 });
    expect(perTile(false)).toBe(2000);
    expect(perTile(true)).toBe(2000);
    const { gap, ...phases } = MOTION;
    expect(Math.max(...Object.values(phases))).toBe(MOTION.morph);
    expect(gap).toBeLessThan(MOTION.read);
    // Sam's five, from sending the report to the last tile in the folder: the lead plus about ten seconds, on either clock.
    expect(homeworkDone(5, false)).toBe(HOMEWORK_LEAD_MS + 5 * 2000 - MOTION.gap);
    expect(homeworkDone(5, true)).toBe(HOMEWORK_LEAD_MS + 5 * 2000 - REDUCED_MOTION.gap);
    expect(homeworkDone(5, false)).toBeLessThanOrEqual(11200);
  });

  it("the folder learns which tile last landed, never how many (ticket 274: no count)", () => {
    const five = ["q1", "q2", "q3", "q7", "q10"];
    expect(lastLanded(five, tileLands(0, false) - 1, false)).toBeNull();
    expect(lastLanded(five, tileLands(0, false), false)).toBe("q1");
    expect(lastLanded(five, tileLands(2, false), false)).toBe("q3");
    expect(lastLanded(five, homeworkDone(5, false), false)).toBe("q10");
    expect(lastLanded(five, Number.MAX_SAFE_INTEGER, true)).toBe("q10");
    expect(lastLanded([], Number.MAX_SAFE_INTEGER, false)).toBeNull();
    expect(homeworkDone(0, false)).toBe(0);
    expect(Object.keys(homework).filter((k) => /count/i.test(k))).toEqual([]);
  });

  it("with reduced motion each tile shows its two questions, then is in the folder", () => {
    expect(tileMoment(0, HOMEWORK_LEAD_MS, true).phase).toBe("showing");
    expect(tileMoment(0, HOMEWORK_LEAD_MS + REDUCED_MOTION.show, true).phase).toBe("banked");
    expect(tileLands(0, true)).toBe(HOMEWORK_LEAD_MS + REDUCED_MOTION.show);
  });
});

describe("the stage", () => {
  it("sending the reflection opens the homework screen, dated", () => {
    let s = sessionAt("report");
    s = sessionReducer(s, { type: "report/send", at: 5000 });
    expect(s.stage).toBe("report");
    s = sessionReducer(s, { type: "reflection/set", text: "I rushed the signs." });
    s = sessionReducer(s, { type: "report/send", at: 5000 });
    expect(s.stage).toBe("homework");
    expect(s.reportSent).toBe(true);
    expect(s.homeworkAt).toBe(5000);
  });

  it("the deep link and the skip start the sequence now, the report sent", () => {
    const before = Date.now();
    const s = sessionAt("homework");
    expect(s.stage).toBe("homework");
    expect(s.reportSent).toBe(true);
    expect(s.reflection.trim()).not.toBe("");
    expect(s.homeworkAt).toBeGreaterThanOrEqual(before);
    const strong = sessionAt("homework", "strong");
    expect(strong.stage).toBe("homework");
    expect(homeworkProblems(strong)).toEqual([]);
    const skip = skipFixture("homework", 1234);
    expect(skip.session.stage).toBe("homework");
    expect(skip.session.homeworkAt).toBe(1234);
    expect(skip.classroom.group?.done).toBe(true);
  });
});
