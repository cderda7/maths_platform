import { describe, expect, it } from "vitest";
import { ANCHOR, isMarkup, nearestAnchor, pinStroke, placeMark, type AnchorBox } from "./markup";

/** One example line and its letter as the board sets them (21 px maths, 44 px letter), and the same as the iPad does (16 px, 30 px), elsewhere on its screen. */
const board: AnchorBox[] = [
  { key: "A", left: 56, top: 120, width: 26, height: 44, em: 44 },
  { key: "A/0", left: 70, top: 190, width: 210, height: 30, em: 21 },
  { key: "A/1", left: 70, top: 250, width: 160, height: 30, em: 21 },
  { key: "B/0", left: 420, top: 190, width: 200, height: 30, em: 21 },
];
const ipad: AnchorBox[] = [
  { key: "A", left: 30, top: 80, width: 18, height: 30, em: 30 },
  { key: "A/0", left: 40, top: 130, width: 160, height: 22.9, em: 16 },
  { key: "A/1", left: 40, top: 170, width: 121.9, height: 22.9, em: 16 },
  { key: "B/0", left: 300, top: 130, width: 152.4, height: 22.9, em: 16 },
];

/** A circle of radius r round (cx, cy). */
const circle = (cx: number, cy: number, r: number) => Array.from({ length: 13 }, (_, i) => ({ x: cx + r * Math.cos((i / 12) * 2 * Math.PI), y: cy + r * Math.sin((i / 12) * 2 * Math.PI) }));

describe("pinning a mark to the slide", () => {
  it("a circle belongs to what it circles, even when it strays over a neighbour", () => {
    expect(nearestAnchor(circle(140, 205, 40), board)?.key).toBe("A/0");
    expect(nearestAnchor(circle(500, 205, 60), board)?.key).toBe("B/0");
  });

  it("a mark in the blank space goes to the nearest piece, and a tie goes to the smaller one", () => {
    expect(nearestAnchor([{ x: 100, y: 320 }], board)?.key).toBe("A/1");
    const nested: AnchorBox[] = [
      { key: "stem", left: 0, top: 0, width: 400, height: 40, em: 20 },
      { key: "tex", left: 100, top: 5, width: 80, height: 30, em: 20 },
    ];
    expect(nearestAnchor([{ x: 120, y: 20 }], nested)?.key).toBe("tex");
  });

  it("a circle round a term on the board is round the same term on the iPad", () => {
    // Round the maths 3 em into line A/0 on the board…
    const mark = pinStroke(circle(70 + 3 * 21, 190 + 0.7 * 21, 21), board)!;
    expect(mark.anchor).toBe(ANCHOR.line("A", 0));
    // …and 3 em into the same line on the iPad, the radius scaled with the maths.
    const there = placeMark(mark, ipad)!;
    const xs = there.map((p) => p.x);
    const ys = there.map((p) => p.y);
    expect((Math.min(...xs) + Math.max(...xs)) / 2).toBeCloseTo(40 + 3 * 16, 1);
    expect((Math.min(...ys) + Math.max(...ys)) / 2).toBeCloseTo(130 + 0.7 * 16, 1);
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(32, 1);
  });

  it("comes back where it was drawn on the surface that drew it", () => {
    const stroke = [
      { x: 60, y: 300 },
      { x: 120, y: 262 },
    ];
    const back = placeMark(pinStroke(stroke, board)!, board)!;
    back.forEach((p, i) => {
      expect(p.x).toBeCloseTo(stroke[i].x, 1);
      expect(p.y).toBeCloseTo(stroke[i].y, 1);
    });
  });

  it("is not drawn on a surface without its anchor, and nothing is pinned on a slide with none", () => {
    expect(placeMark({ anchor: "C/2", points: [{ x: 0, y: 0 }] }, ipad)).toBeNull();
    expect(pinStroke([{ x: 1, y: 1 }], [])).toBeNull();
    expect(pinStroke([], board)).toBeNull();
  });

  it("tells a mark from a pad stroke", () => {
    expect(isMarkup({ anchor: "A", points: [] })).toBe(true);
    expect(isMarkup([{ x: 1, y: 1 }])).toBe(false);
  });
});
