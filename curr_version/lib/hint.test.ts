import { describe, expect, it } from "vitest";
import katex from "katex";
import { PRACTICES } from "@/data/practice";
import type { PracticeProblem } from "@/data/types";
import { findFragment, hintSegments, termTex } from "./hint";

const constant = { phrase: "constant", tex: ["12"] };
const middle = { phrase: "middle coefficient", tex: ["7"] };
const hint = "Look for two numbers that multiply to the constant and add to the middle coefficient.";

const every = (): PracticeProblem[] => Object.values(PRACTICES).flatMap((p) => [p, ...(p.followUp ? [p.followUp] : [])]);

describe("hintSegments", () => {
  it("splits the hint around each linked phrase, in order", () => {
    expect(hintSegments(hint, [middle, constant])).toEqual([
      { text: "Look for two numbers that multiply to the " },
      { text: "constant", term: constant },
      { text: " and add to the " },
      { text: "middle coefficient", term: middle },
      { text: "." },
    ]);
  });

  it("matches whole words only, so single letters are safe", () => {
    const a = { phrase: "a", tex: ["3"] };
    const b = { phrase: "b", tex: ["10"] };
    const c = { phrase: "c", tex: ["8"] };
    const term = { phrase: "middle term", tex: ["10x"] };
    const segs = hintSegments("Multiply a by c, then split the middle term into two parts that add to b.", [a, b, c, term]);
    expect(segs.filter((s) => s.term).map((s) => s.text)).toEqual(["a", "c", "middle term", "b"]);
    expect(segs.map((s) => s.text).join("")).toBe("Multiply a by c, then split the middle term into two parts that add to b.");
  });

  it("links every occurrence, keeps capitalisation, matches case-insensitively", () => {
    const segs = hintSegments("The constant here; the constant there.", [constant]);
    expect(segs.filter((s) => s.term).map((s) => s.text)).toEqual(["constant", "constant"]);
    expect(segs[0]).toEqual({ text: "The " });
  });

  it("prefers the longest phrase and ignores phrases the hint lacks", () => {
    const short = { phrase: "middle", tex: ["7"] };
    expect(hintSegments(hint, [short, middle]).filter((s) => s.term)).toEqual([{ text: "middle coefficient", term: middle }]);
    expect(hintSegments(hint, [{ phrase: "discriminant", tex: ["b"] }])).toEqual([{ text: hint }]);
  });

  it("reads b before a superscript as a word", () => {
    const b = { phrase: "b", tex: ["2"] };
    expect(hintSegments("Work out b² − 4ac.", [b]).filter((s) => s.term)).toEqual([{ text: "b", term: b }]);
  });

  it("matches a term inside a longer word only where told to", () => {
    const hint = "Work out b² − 4ac and look only at its sign.";
    const a = { phrase: "a", within: "4ac", tex: [] };
    const c = { phrase: "c", within: "4ac", tex: ["5"] };
    const b = { phrase: "b", tex: ["2"] };
    const segs = hintSegments(hint, [b, a, c]);
    expect(segs.filter((s) => s.term).map((s) => s.text)).toEqual(["b", "a", "c"]);
    expect(segs.map((s) => s.text).join("")).toBe(hint);
    expect(hintSegments(hint, [{ phrase: "a", within: "zzz", tex: [] }]).every((s) => !s.term)).toBe(true);
  });

  it("returns the whole hint as one run without terms", () => {
    expect(hintSegments(hint)).toEqual([{ text: hint }]);
  });
});

describe("termTex", () => {
  const tex = "x^2 + 7x + 12 = 0";

  it("wraps every fragment so the layout never changes, and lights only the hovered term", () => {
    expect(termTex(tex, [constant, middle])).toBe("x^2 + \\htmlClass{hint-term}{7}x + \\htmlClass{hint-term}{12} = 0");
    expect(termTex(tex, [constant, middle], constant)).toBe("x^2 + \\htmlClass{hint-term}{7}x + \\htmlClass{hint-term hint-term-lit}{12} = 0");
  });

  it("lights every fragment of a term with several, with a thin space between two that abut", () => {
    const factors = { phrase: "factors", tex: ["(x - 2)", "(x + 5)"] };
    expect(termTex("(x - 2)(x + 5) = 0", [factors], factors)).toBe("\\htmlClass{hint-term hint-term-lit}{(x - 2)}\\;\\htmlClass{hint-term hint-term-lit}{(x + 5)} = 0");
    expect(termTex("(x - 2)(x + 5) = 0", [factors])).toBe("\\htmlClass{hint-term}{(x - 2)}\\;\\htmlClass{hint-term}{(x + 5)} = 0");
  });

  it("conjures an unwritten fragment while its term is lit, and only then", () => {
    const a = { phrase: "a", within: "4ac", tex: [], insert: { before: "x^2", tex: "1" } };
    const c = { phrase: "c", within: "4ac", tex: ["5"] };
    expect(termTex("x^2 + 2x + 5 = 0", [a, c])).toBe("x^2 + 2x + \\htmlClass{hint-term}{5} = 0");
    expect(termTex("x^2 + 2x + 5 = 0", [a, c], a)).toBe("\\htmlClass{hint-term hint-term-lit}{1}x^2 + 2x + \\htmlClass{hint-term}{5} = 0");
    expect(termTex("x^2 + 2x + 5 = 0", [a, c], c)).toBe("x^2 + 2x + \\htmlClass{hint-term hint-term-lit}{5} = 0");
    expect(termTex("y = 3", [{ phrase: "a", tex: [], insert: { before: "x^2", tex: "1" } }], { phrase: "a", tex: [], insert: { before: "x^2", tex: "1" } })).toBe("y = 3");
  });

  it("nests a fragment inside a longer one", () => {
    const b = { phrase: "b", tex: ["10"] };
    const term = { phrase: "middle term", tex: ["10x"] };
    expect(termTex("3x^2 + 10x + 8", [b, term], b)).toBe("3x^2 + \\htmlClass{hint-term}{\\htmlClass{hint-term hint-term-lit}{10}x} + 8");
    expect(termTex("3x^2 + 10x + 8", [b, term], term)).toBe("3x^2 + \\htmlClass{hint-term hint-term-lit}{\\htmlClass{hint-term}{10}x} + 8");
  });

  it("skips superscripts, longer numbers and command names when finding a fragment", () => {
    expect(findFragment("x^2 + 2x + 5 = 0", "2")).toBe(6);
    expect(findFragment("x^{2} + 2x", "2")).toBe(8);
    expect(findFragment("x^2 - 7x + 10 = 0", "1")).toBe(-1);
    expect(findFragment("\\alpha + a", "a")).toBe(9);
    expect(findFragment("\\dfrac{x^2}{3} = 12", "\\dfrac{x^2}{3}")).toBe(0);
    expect(termTex("x^2 + 2x + 5 = 0", [{ phrase: "b", tex: ["2"] }])).toBe("x^2 + \\htmlClass{hint-term}{2}x + 5 = 0");
  });

  it("leaves the TeX alone with no terms or a fragment it does not contain", () => {
    expect(termTex(tex)).toBe(tex);
    expect(termTex(tex, [{ phrase: "k", tex: ["k"] }])).toBe(tex);
  });

  it("typesets through KaTeX with the class on the fragment", () => {
    const html = katex.renderToString(termTex(tex, [constant, middle], constant), { trust: true, strict: false });
    expect(html).toContain('class="enclosing hint-term hint-term-lit"');
    expect(html).toContain('class="enclosing hint-term"');
  });

  it("lighting changes no spacing in any warm-up problem, except a conjured fragment; the only change at rest is the gap between abutting fragments", () => {
    const spacing = (t: string) => {
      const html = katex.renderToString(t, { trust: true, strict: false, displayMode: true });
      return [...html.matchAll(/mspace" style="margin-right:([^;"]+)/g)].map((m) => m[1]).join(" ") + " | " + (html.match(/mbin|mrel|mopen|mclose/g) ?? []).join(" ");
    };
    for (const p of every()) {
      if (!p.hintTerms) continue;
      const rest = termTex(p.tex, p.hintTerms);
      const abutting = rest.includes("\\;\\htmlClass");
      if (!abutting) expect(spacing(rest), p.id).toBe(spacing(p.tex));
      for (const lit of p.hintTerms) if (!lit.insert) expect(spacing(termTex(p.tex, p.hintTerms, lit)), `${p.id}: ${lit.phrase}`).toBe(spacing(rest));
    }
  });
});

describe("warm-up hint terms", () => {
  it("every phrase is found whole in its hint, every fragment in its TeX", () => {
    for (const p of every()) {
      for (const t of p.hintTerms ?? []) {
        expect(hintSegments(p.hint, [t]).some((s) => s.term === t), `${p.id}: "${t.phrase}"`).toBe(true);
        expect(t.tex.length > 0 || !!t.insert, `${p.id}: "${t.phrase}"`).toBe(true);
        for (const f of t.tex) expect(findFragment(p.tex, f), `${p.id}: ${f}`).toBeGreaterThanOrEqual(0);
        if (t.insert) expect(findFragment(p.tex, t.insert.before), `${p.id}: ${t.insert.before}`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("the monic warm-up links its constant and middle coefficient", () => {
    expect(PRACTICES["algebra.expand-factor.monic"]?.hintTerms).toEqual([
      { phrase: "constant", tex: ["12"] },
      { phrase: "middle coefficient", tex: ["7"] },
    ]);
  });
});
