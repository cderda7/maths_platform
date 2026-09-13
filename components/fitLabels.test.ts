import { describe, expect, it } from "vitest";
import { fitLabels, lineCount, NODE_PAD, textWidth } from "./HierarchyDrill";

const row = (text: string, depth: number, size: number, indent: number, dot: number) => depth * indent + NODE_PAD + dot + 8 + textWidth(text, size);

describe("fitLabels (ticket 227)", () => {
  it("counts the node's own padding: a name that fits only without it shrinks or wraps", () => {
    const labels = [{ text: "Sketching a parabola", depth: 1 }];
    const tight = row("Sketching a parabola", 1, 13.5, 27, 15) - 1;
    const fit = fitLabels(labels, tight);
    expect(fit.size).toBeLessThan(13.5);
    expect(row("Sketching a parabola", 1, fit.size, fit.indent, fit.dot)).toBeLessThanOrEqual(tight);
  });

  it("keeps the full size when every row fits with its padding", () => {
    const labels = [{ text: "Equations", depth: 0 }, { text: "Linear equations", depth: 1 }];
    expect(fitLabels(labels, row("Linear equations", 1, 13.5, 27, 15)).size).toBe(13.5);
  });

  it("wraps at 10.5 only when every name, padding included, takes two lines at most", () => {
    const labels = [{ text: "Sketching a parabola", depth: 1 }];
    const pad = 21 + NODE_PAD + 12 + 8;
    const twoLines = pad + textWidth("a parabola", 10.5) + 0.5; // "Sketching / a parabola"
    expect(fitLabels(labels, twoLines)).toMatchObject({ size: 10.5, wrap: true });
    // Neither "Sketching a" nor "a parabola" fits: "sketching / a / parabola" would be three lines, so the size drops.
    expect(fitLabels(labels, twoLines - 1)).toMatchObject({ size: 9, wrap: true });
  });
});

describe("lineCount", () => {
  it("breaks greedily, and a word wider than the line never fits", () => {
    const w = (s: string) => textWidth(s, 10) + 0.5;
    expect(lineCount("drawing conclusions in context", 10, w("drawing conclusions in context"))).toBe(1);
    expect(lineCount("drawing conclusions in context", 10, w("conclusions in"))).toBe(3);
    expect(lineCount("sketching a parabola", 10, w("sketching"))).toBe(3);
    expect(lineCount("sketching a parabola", 10, w("sketching a"))).toBe(2);
    expect(lineCount("zero-finding", 10, w("zero-finding") - 1)).toBe(Infinity);
  });

  it("shrinks rather than split a hyphenated word at 10.5", () => {
    const labels = [{ text: "Zero-finding", depth: 1 }, { text: "Zeros & solving", depth: 0 }];
    const pad = 21 + NODE_PAD + 12 + 8;
    expect(fitLabels(labels, pad + textWidth("Zero-finding", 10.5) - 1).size).toBeLessThan(10.5);
  });
});
