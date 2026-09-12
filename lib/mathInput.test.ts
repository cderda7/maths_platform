import { describe, expect, it } from "vitest";
import { parseQuestion, splitPaste, stemText, toTex, typesets, draftText, isTex } from "./mathInput";
import { DEMO_PASTE_LINES } from "@/data/draft-seed";
import { PROBLEMS } from "@/data/assignment";

const text = (t: string) => ({ kind: "text", text: t });
const math = (tex: string, raw: string) => ({ kind: "math", tex, raw });

describe("the typing shorthand as TeX", () => {
  it("powers with ** or ^, bracketed or signed exponents", () => {
    expect(toTex("x**2 + 5x + 6 = 0")).toBe("x^{2} + 5x + 6 = 0");
    expect(toTex("x^10")).toBe("x^{10}");
    expect(toTex("e^(2x)")).toBe("e^{2x}");
    expect(toTex("x^-1")).toBe("x^{-1}");
    expect(toTex("a_1 + a_(n+1)")).toBe("a_{1} + a_{n+1}");
  });

  it("fractions bind to the atoms either side", () => {
    expect(toTex("1/3x**2 + 2x + 8/3")).toBe("\\frac{1}{3}x^{2} + 2x + \\frac{8}{3}");
    expect(toTex("(x+1)/(x-2)")).toBe("\\frac{x+1}{x-2}");
    expect(toTex("x^2/4")).toBe("\\frac{x^{2}}{4}");
    expect(toTex("x/4 + x/2 = 9/2")).toBe("\\frac{x}{4} + \\frac{x}{2} = \\frac{9}{2}");
    expect(toTex("-1/2")).toBe("\\frac{-1}{2}");
  });

  it("the star vanishes between a number and a letter and is × between numbers", () => {
    expect(toTex("2*x")).toBe("2x");
    expect(toTex("(x+1)*(x-2)")).toBe("(x+1)(x-2)");
    expect(toTex("3*4")).toBe("3 \\times 4");
  });

  it("roots, constants, relations and functions", () => {
    expect(toTex("sqrt(x+1) = 2")).toBe("\\sqrt{x+1} = 2");
    expect(toTex("sqrt(2)/2")).toBe("\\frac{\\sqrt{2}}{2}");
    expect(toTex("pi r^2")).toBe("\\pi r^{2}");
    expect(toTex("x <= 3")).toBe("x \\le 3");
    expect(toTex("x >= -1")).toBe("x \\ge -1");
    expect(toTex("x != 0")).toBe("x \\ne 0");
    expect(toTex("x = 2 +- 1")).toBe("x = 2 \\pm 1");
    expect(toTex("sin(x) + cos(x)")).toBe("\\sin(x) + \\cos(x)");
    expect(toTex("x -> inf")).toBe("x -> \\infty");
  });

  it("pasted unicode is read too", () => {
    expect(toTex("x² − 4 ≤ 0")).toBe("x^{2} - 4 \\le 0");
    expect(toTex("2 × 3 ± 1")).toBe("2 \\times 3 \\pm 1");
  });
});

describe("one typed question as the student's card", () => {
  it("prose then the final maths run as the expression", () => {
    expect(parseQuestion("Solve for x. x**2 + 5x + 6 = 0")).toEqual({ stem: [text("Solve for x.")], tex: "x^{2} + 5x + 6 = 0", raw: "x**2 + 5x + 6 = 0" });
    expect(parseQuestion("Find all values of x for which the following holds. (x-3)(x+2) = 6")).toEqual({
      stem: [text("Find all values of x for which the following holds.")],
      tex: "(x-3)(x+2) = 6",
      raw: "(x-3)(x+2) = 6",
    });
  });

  it("a trailing full stop after the expression is allowed", () => {
    expect(parseQuestion("Solve for x. x**2 = 4.")).toEqual({ stem: [text("Solve for x.")], tex: "x^{2} = 4", raw: "x**2 = 4" });
  });

  it("maths inside the prose stays inline; the last run ending the text is the expression", () => {
    const q = parseQuestion("Show that the following has no real solutions, and say what that means for the graph of y = x**2 + 4x + 5. x**2 + 4x + 5 = 0");
    expect(q.stem).toEqual([text("Show that the following has no real solutions, and say what that means for the graph of "), math("y = x^{2} + 4x + 5", "y = x**2 + 4x + 5"), text(".")]);
    expect(q.tex).toBe("x^{2} + 4x + 5 = 0");
  });

  it("a single letter is prose unless it sits in a run with real maths", () => {
    const q = parseQuestion("A ball's height after travelling x metres is given below. Where does it land? h = -x**2 + 6x");
    expect(q.stem).toEqual([text("A ball's height after travelling x metres is given below. Where does it land?")]);
    expect(q.tex).toBe("h = -x^{2} + 6x");
    expect(parseQuestion("For which value of k does the graph touch the x-axis exactly once? y = x**2 + 6x + k").stem).toEqual([text("For which value of k does the graph touch the x-axis exactly once?")]);
  });

  it("a question with no trailing maths has no expression; inline maths is kept", () => {
    expect(parseQuestion("Factorise fully.")).toEqual({ stem: [text("Factorise fully.")], tex: null, raw: null });
    expect(parseQuestion("Solve 2x + 1 = 7 for x.")).toEqual({ stem: [text("Solve "), math("2x + 1 = 7", "2x + 1 = 7"), text(" for x.")], tex: null, raw: null });
    expect(parseQuestion("")).toEqual({ stem: [], tex: null, raw: null });
  });

  it("a newline forces the split, whatever follows read whole as maths", () => {
    expect(parseQuestion("Factorise fully.\n1/3x**2 + 2x + 8/3")).toEqual({ stem: [text("Factorise fully.")], tex: "\\frac{1}{3}x^{2} + 2x + \\frac{8}{3}", raw: "1/3x**2 + 2x + 8/3" });
    expect(parseQuestion("Find the roots of\ny = x**2 - 4x - 5")).toEqual({ stem: [text("Find the roots of")], tex: "y = x^{2} - 4x - 5", raw: "y = x**2 - 4x - 5" });
    expect(parseQuestion("Explain why.\n")).toEqual({ stem: [text("Explain why.")], tex: null, raw: null });
  });

  it("the stem as one string keeps inline maths between dollars", () => {
    expect(stemText(parseQuestion("Solve 2x + 1 = 7 for x.").stem)).toBe("Solve $2x + 1 = 7$ for x.");
  });

  it("knows what KaTeX will not set", () => {
    expect(typesets("x^{2} + 1")).toBe(true);
    expect(typesets("\\frac{1}{")).toBe(false);
  });

  it("a pasted block is one question per non-empty line", () => {
    expect(splitPaste("Solve for x. x**2 = 4\r\n\n  Factorise fully. x**2 - 9  \n")).toEqual(["Solve for x. x**2 = 4", "Factorise fully. x**2 - 9"]);
  });

  it("a run between dollars is maths by declaration, kept as written, inline, and never the expression (ticket 171)", () => {
    const q = parseQuestion("Say what that means for the graph of $y = x^2 + 4x + 5$.");
    expect(q.stem).toEqual([text("Say what that means for the graph of "), { kind: "math", tex: "y = x^2 + 4x + 5", raw: "$y = x^2 + 4x + 5$", explicit: true }, text(".")]);
    expect(q.tex).toBeNull();
    expect(stemText(q.stem)).toBe("Say what that means for the graph of $y = x^2 + 4x + 5$.");
    // Shorthand around a dollar run is still read; the pieces of prose around it are one segment.
    const r = parseQuestion("Given $f(x) = \\sqrt{x}$, solve 2x + 1 = 7 for x. x**2 = 9");
    expect(r.stem).toEqual([text("Given "), { kind: "math", tex: "f(x) = \\sqrt{x}", raw: "$f(x) = \\sqrt{x}$", explicit: true }, text(", solve "), math("2x + 1 = 7", "2x + 1 = 7"), text(" for x.")]);
    expect(r.tex).toBe("x^{2} = 9");
    expect(parseQuestion("$$ alone")).toEqual({ stem: [text("$$ alone")], tex: null, raw: null });
  });

  it("a line that is TeX already passes through untouched; the newline form takes a dollar-wrapped expression (ticket 171)", () => {
    expect(isTex("\\frac{1}{3}x^2")).toBe(true);
    expect(isTex("x^{2}")).toBe(true);
    expect(isTex("x**2 + 5x")).toBe(false);
    expect(toTex("\\frac{1}{3}x^2 + 2x +   \\frac{8}{3}")).toBe("\\frac{1}{3}x^2 + 2x + \\frac{8}{3}");
    expect(parseQuestion("Factorise fully.\n\\frac{1}{3}x^2 + 2x + \\frac{8}{3}")).toEqual({ stem: [text("Factorise fully.")], tex: "\\frac{1}{3}x^2 + 2x + \\frac{8}{3}", raw: "\\frac{1}{3}x^2 + 2x + \\frac{8}{3}" });
    expect(parseQuestion("Solve.\n$x^2 = 4$")).toEqual({ stem: [text("Solve.")], tex: "x^{2} = 4", raw: "x^2 = 4" });
  });

  it("draftText is the newline form parseQuestion reads back (ticket 171)", () => {
    expect(draftText("Solve for x.", "x^2 + 5x + 6 = 0")).toBe("Solve for x.\nx^2 + 5x + 6 = 0");
    expect(draftText("", "x^2 = 4")).toBe("x^2 = 4");
    expect(draftText("Prose only.", null)).toBe("Prose only.\n");
    expect(draftText("  Padded.  ", null)).toBe("Padded.\n");
    expect(draftText("", null)).toBe("");
    // The newline keeps a prose stem prose: without it the trailing "tiny0.png" or "5 seconds" would be read as the expression.
    expect(parseQuestion(draftText("No fixture for tiny0.png", null)).tex).toBeNull();
    expect(parseQuestion("No fixture for tiny0.png").tex).not.toBeNull();
    for (const [stem, tex] of [
      ["Solve for x.", "x^2 + 5x + 6 = 0"],
      ["Factorise fully.", "\\frac{1}{3}x^2 + 2x + \\frac{8}{3}"],
      ["Say what that means for the graph of $y = x^2 + 4x + 5$.", null],
      ["", "(x+1)(x-4) = 6"],
    ] as const) {
      const p = parseQuestion(draftText(stem, tex));
      expect(stemText(p.stem)).toBe(stem);
      // A TeX line with no command or brace is the shorthand's own subset and comes back normalised (x^2 as x^{2}); one with either passes through untouched.
      expect(p.tex).toBe(tex === null ? null : toTex(tex));
    }
  });
});

describe("the demo draft against the bank", () => {
  /** Braces, spaces and tfrac/frac aside, the same TeX. */
  const norm = (t: string) => t.replace(/\\tfrac/g, "\\frac").replace(/[{}\s]/g, "");

  it("every seeded line but Q1 (+5x on purpose) and Q9 (the repeat) parses to the bank's stem and expression", () => {
    expect(DEMO_PASTE_LINES).toHaveLength(10);
    for (const [i, line] of DEMO_PASTE_LINES.entries()) {
      if (i === 0 || i === 8) continue;
      const q = parseQuestion(line);
      const bank = PROBLEMS[i];
      expect(norm(q.tex ?? ""), bank.label).toBe(norm(bank.tex));
      if (i !== 9) expect(stemText(q.stem), bank.label).toBe(bank.stem);
    }
    expect(parseQuestion(DEMO_PASTE_LINES[0]).tex).toBe("x^{2} + 5x + 6 = 0");
    expect(parseQuestion(DEMO_PASTE_LINES[8]).tex).toBe("(x+1)(x-4) = 6");
    expect(stemText(parseQuestion(DEMO_PASTE_LINES[9]).stem)).toBe("Show that the following has no real solutions, and say what that means for the graph of $y = x^{2} + 4x + 5$.");
  });
});
