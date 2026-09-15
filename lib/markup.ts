import type { Point, Stroke } from "@/data/types";

/**
 * The teacher's markup on a class review slide (ticket 330): strokes drawn anywhere over the problem and its examples,
 * not in the working pad. The board, the laptop and the iPad set the slide at different sizes (the example columns are
 * fitted per surface, ticket 161), so a mark is never kept in screen pixels. It is pinned to the piece of the slide it
 * was drawn on (an anchor: an example line's maths, an example letter, the problem label, expression or stem) and kept
 * in ems of that anchor's font size from the anchor's top left corner. Glyphs scale with the font size, so a circle
 * round a term is round that term on every surface.
 */
export interface Markup {
  /** `label`, `tex`, `stem`, an example letter (`A`), or an example line (`A/0`, zero-based). */
  anchor: string;
  /** Ems of the anchor's font size from its top left corner. */
  points: Point[];
}

/** What the class's shared whole-class ink holds per problem, in drawing order: a pad stroke (as before ticket 330) or a slide mark. */
export type WholeClassInk = Stroke | Markup;

export function isMarkup(ink: WholeClassInk): ink is Markup {
  return !Array.isArray(ink);
}

/** The anchor keys a slide carries, one per piece a mark can be pinned to. */
export const ANCHOR = {
  label: "label",
  tex: "tex",
  stem: "stem",
  letter: (letter: string) => letter,
  line: (letter: string, index: number) => `${letter}/${index}`,
} as const;

/** An anchor as laid out on one surface, in the slide's own layout px (not screen px: the teacher side is zoomed, the iPad scaled). */
export interface AnchorBox {
  key: string;
  left: number;
  top: number;
  width: number;
  height: number;
  /** The anchor's font size in layout px. */
  em: number;
}

/** How far a point is from a box: 0 inside it. */
function distance(p: Point, b: AnchorBox): number {
  const dx = Math.max(b.left - p.x, 0, p.x - (b.left + b.width));
  const dy = Math.max(b.top - p.y, 0, p.y - (b.top + b.height));
  return Math.hypot(dx, dy);
}

/** The anchor a stroke belongs to: the one nearest the middle of its bounding box (a circle's middle is what it circles), the smaller on a tie. */
export function nearestAnchor(stroke: Stroke, boxes: AnchorBox[]): AnchorBox | null {
  if (stroke.length === 0 || boxes.length === 0) return null;
  const xs = stroke.map((p) => p.x);
  const ys = stroke.map((p) => p.y);
  const mid = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
  let best: AnchorBox | null = null;
  let bestDistance = Infinity;
  for (const b of boxes) {
    const d = distance(mid, b);
    if (d < bestDistance || (d === bestDistance && best && b.width * b.height < best.width * best.height)) {
      best = b;
      bestDistance = d;
    }
  }
  return best;
}

const round = (n: number) => Math.round(n * 1000) / 1000;

/** A stroke drawn in layout px on this surface, as a mark pinned to its nearest anchor. Null when the slide has no anchors. */
export function pinStroke(stroke: Stroke, boxes: AnchorBox[]): Markup | null {
  const b = nearestAnchor(stroke, boxes);
  if (!b || b.em <= 0) return null;
  return { anchor: b.key, points: stroke.map((p) => ({ x: round((p.x - b.left) / b.em), y: round((p.y - b.top) / b.em) })) };
}

/** A mark in layout px on this surface. Null when this surface has no such anchor (nothing is drawn rather than drawn in the wrong place). */
export function placeMark(mark: Markup, boxes: AnchorBox[]): Stroke | null {
  const b = boxes.find((x) => x.key === mark.anchor);
  if (!b) return null;
  return mark.points.map((p) => ({ x: b.left + p.x * b.em, y: b.top + p.y * b.em }));
}
