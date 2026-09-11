import { describe, expect, it } from "vitest";
import katex from "katex";
import { PRACTICES } from "@/data/practice";
import type { PracticeProblem } from "@/data/types";
import { findFragment, hintSegments, hoistSpacing, locateFragment, pickHint, positionOf, termTex } from "./hint";

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
      // The pad wraps the terms of every hint shown so far together; all of them is the widest case.
      const terms = p.hints.flatMap((h) => h.terms ?? []);
      if (!terms.length) continue;
      const rest = termTex(p.tex, terms);
      const abutting = rest.includes("\\;\\htmlClass");
      if (!abutting) expect(spacing(rest), p.id).toBe(spacing(p.tex));
      for (const lit of terms) if (!lit.insert) expect(spacing(termTex(p.tex, terms, lit)), `${p.id}: ${lit.phrase}`).toBe(spacing(rest));
    }
  });
});

describe("hoistSpacing", () => {
  const render = (t: string) => katex.renderToString(t, { trust: true, strict: false, displayMode: true });

  it("moves the spacing KaTeX puts inside a hint-term span to outside it, leaving the rest of the markup as it was", () => {
    const html = render("x^2 + 2x + \\htmlClass{hint-term hint-term-lit}{5} = 0");
    expect(html).toContain('<span class="enclosing hint-term hint-term-lit"><span class="mord">5</span><span class="mspace" style="margin-right:0.2778em;"></span></span>');
    const fixed = hoistSpacing(html);
    expect(fixed).toContain('<span class="enclosing hint-term hint-term-lit"><span class="mord">5</span></span><span class="mspace" style="margin-right:0.2778em;"></span><span class="mrel">=</span>');
    expect(fixed.replace(/<span class="mspace" style="[^"]*"><\/span>/g, "")).toBe(html.replace(/<span class="mspace" style="[^"]*"><\/span>/g, ""));
    expect(fixed.match(/mspace/g)?.length).toBe(html.match(/mspace/g)?.length);
  });

  it("handles nested spans and a fragment with no spacing, and leaves markup without hint terms alone", () => {
    const plain = render("x^2 + 7x + 12 = 0");
    expect(hoistSpacing(plain)).toBe(plain);
    const nested = render("3x^2 + \\htmlClass{hint-term}{\\htmlClass{hint-term hint-term-lit}{10}x} + 8");
    const fixed = hoistSpacing(nested);
    expect(fixed).not.toBe(nested);
    expect(hoistSpacing(fixed)).toBe(fixed);
    expect(fixed.match(/mspace/g)?.length).toBe(nested.match(/mspace/g)?.length);
    expect(fixed).toContain('<span class="enclosing hint-term hint-term-lit"><span class="mord">10</span></span>');
  });
});

describe("warm-up hint terms", () => {
  it("every phrase is found whole in its hint, every fragment in its TeX", () => {
    for (const p of every()) {
      expect(p.hints.length, p.id).toBeGreaterThan(0);
      for (const h of p.hints) for (const t of h.terms ?? []) {
        expect(hintSegments(h.text, [t]).some((s) => s.term === t), `${p.id}: "${t.phrase}"`).toBe(true);
        expect(t.tex.length > 0 || !!t.insert, `${p.id}: "${t.phrase}"`).toBe(true);
        for (const f of t.tex) expect(locateFragment(p.tex, f), `${p.id}: ${JSON.stringify(f)}`).toBeGreaterThanOrEqual(0);
        if (t.insert) expect(findFragment(p.tex, t.insert.before), `${p.id}: ${t.insert.before}`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("the monic warm-up has one hint linking its constant and middle coefficient", () => {
    expect(PRACTICES["algebra.expand-factor.monic"]?.hints.map((h) => h.terms)).toEqual([
      [
        { phrase: "constant", tex: ["12"] },
        { phrase: "middle coefficient", tex: ["7"] },
      ],
    ]);
  });

  it("the fractions warm-up's first hint moves the 6, its second finds a denominator the two x terms share; the pad wraps both hints' terms together", () => {
    const p = PRACTICES["algebra.number.fractions"]!;
    expect(p.tex).toBe("\\dfrac{x}{4} + \\dfrac{x}{2} - 6 = \\dfrac{9}{2}");
    const [first, second] = p.hints;
    expect(first.text).toMatch(/move the 6/);
    expect(first.text).not.toMatch(/add|subtract/i);
    expect(second.text).toMatch(/common denominator/);
    expect(second.text).toMatch(/whole line/);
    const [six, otherSide, xTerms] = first.terms!;
    const [, common] = second.terms!;
    const both = [...first.terms!, ...second.terms!];
    const x4 = "\\htmlClass{hint-term}{\\dfrac{x}{\\htmlClass{hint-term}{4}}}";
    const x2 = "\\htmlClass{hint-term}{\\dfrac{x}{\\htmlClass{hint-term}{2}}}";
    expect(termTex(p.tex, both)).toBe(`${x4} + ${x2} - \\htmlClass{hint-term}{6} = \\htmlClass{hint-term}{\\dfrac{9}{2}}`);
    expect(termTex(p.tex, both, six)).toContain("- \\htmlClass{hint-term hint-term-lit}{6} =");
    expect(termTex(p.tex, both, otherSide)).toContain("= \\htmlClass{hint-term hint-term-lit}{\\dfrac{9}{2}}");
    expect(termTex(p.tex, both, xTerms)).toBe(
      `\\htmlClass{hint-term hint-term-lit}{\\dfrac{x}{\\htmlClass{hint-term}{4}}} + \\htmlClass{hint-term hint-term-lit}{\\dfrac{x}{\\htmlClass{hint-term}{2}}} - \\htmlClass{hint-term}{6} = \\htmlClass{hint-term}{\\dfrac{9}{2}}`,
    );
    expect(termTex(p.tex, both, common)).toBe(
      `\\htmlClass{hint-term}{\\dfrac{x}{\\htmlClass{hint-term hint-term-lit}{4}}} + \\htmlClass{hint-term}{\\dfrac{x}{\\htmlClass{hint-term hint-term-lit}{2}}} - \\htmlClass{hint-term}{6} = \\htmlClass{hint-term}{\\dfrac{9}{2}}`,
    );
    // With only the first hint showing, nothing inside the fractions is wrapped yet.
    expect(termTex(p.tex, first.terms)).toBe("\\htmlClass{hint-term}{\\dfrac{x}{4}} + \\htmlClass{hint-term}{\\dfrac{x}{2}} - \\htmlClass{hint-term}{6} = \\htmlClass{hint-term}{\\dfrac{9}{2}}");
  });
});

describe("locateFragment", () => {
  const tex = "\\dfrac{x}{4} + \\dfrac{x}{2} - 6 = \\dfrac{9}{2}";

  it("a bare fragment is its first whole occurrence; a scoped one is found inside its `within`, later occurrences included", () => {
    expect(locateFragment(tex, "2")).toBe(findFragment(tex, "2"));
    expect(locateFragment(tex, { tex: "2", within: "\\dfrac{x}{2}" })).toBe(findFragment(tex, "2"));
    expect(locateFragment(tex, { tex: "2", within: "\\dfrac{9}{2}" })).toBe(tex.lastIndexOf("2"));
  });

  it("is -1 when the scope or the fragment inside it is absent", () => {
    expect(locateFragment(tex, { tex: "2", within: "\\dfrac{7}{2}" })).toBe(-1);
    expect(locateFragment(tex, { tex: "3", within: "\\dfrac{9}{2}" })).toBe(-1);
  });

  it("two terms naming the same piece share one box, lit when either is the lit term", () => {
    const a = { phrase: "a", tex: ["6"] };
    const b = { phrase: "b", tex: [{ tex: "6", within: "- 6" }] };
    expect(termTex(tex, [a, b])).toBe("\\dfrac{x}{4} + \\dfrac{x}{2} - \\htmlClass{hint-term}{6} = \\dfrac{9}{2}");
    expect(termTex(tex, [a, b], b)).toBe("\\dfrac{x}{4} + \\dfrac{x}{2} - \\htmlClass{hint-term hint-term-lit}{6} = \\dfrac{9}{2}");
  });
});

describe("pickHint", () => {
  const p = PRACTICES["algebra.number.fractions"]!;
  const step = (i: number) => p.steps[i].tex;

  it("reads the position from the last line the pad placed, by the step it matches, spacing aside", () => {
    expect(positionOf(p, [])).toBe(0);
    expect(positionOf(p, [step(0)])).toBe(1);
    expect(positionOf(p, [step(0), step(1).replace(/ /g, "")])).toBe(2);
    expect(positionOf(p, ["junk", "more junk"])).toBe(2);
  });

  it("the fractions hints are written one per point in the working", () => {
    expect(p.hints.map((h) => h.at)).toEqual([[0], [1, 2], [3], [4], [5]]);
    for (const h of p.hints) for (const at of h.at!) expect(at, h.text).toBeLessThanOrEqual(p.steps.length);
  });

  it("gives the hint written for where the student is, whatever was shown before", () => {
    expect(pickHint(p, [], [])).toBe(0);
    expect(pickHint(p, [step(0)], [])).toBe(1);
    expect(pickHint(p, [step(0), step(1)], [])).toBe(1);
    expect(pickHint(p, [step(0), step(1), step(2)], [0, 1])).toBe(2);
    expect(pickHint(p, p.steps.slice(0, 4).map((s) => s.tex), [])).toBe(3);
  });

  it("falls forward to the first hint for a later point when the one for here is spent, never back to a point already passed", () => {
    expect(pickHint(p, [], [0])).toBe(1);
    expect(pickHint(p, [step(0)], [1])).toBe(2);
    expect(pickHint(p, p.steps.slice(0, 4).map((s) => s.tex), [3])).toBe(4);
    expect(pickHint(p, p.steps.slice(0, 4).map((s) => s.tex), [3, 4])).toBeNull();
    expect(pickHint(p, p.steps.map((s) => s.tex), [])).toBeNull();
  });

  it("a general hint (no `at`) is offered wherever the student is, once", () => {
    const monic = PRACTICES["algebra.expand-factor.monic"]!;
    expect(monic.hints.every((h) => !h.at)).toBe(true);
    expect(pickHint(monic, [], [])).toBe(0);
    expect(pickHint(monic, ["x^2 + 7x + 12 = 0", "anything"], [])).toBe(0);
    expect(pickHint(monic, [], [0])).toBeNull();
    // A general hint yields to one written for the point, and is offered after it.
    const mixed = { steps: p.steps, hints: [{ text: "general" }, { text: "here", at: [1] }] };
    expect(pickHint(mixed, [step(0)], [])).toBe(1);
    expect(pickHint(mixed, [step(0)], [1])).toBe(0);
  });
});
