import type { Stroke } from "@/data/types";

/**
 * Handwriting that draws itself: for a peer's turn on the shared whiteboard the demo has no pen
 * to read, so each line of their working becomes a few deterministic scribbled strokes laid on
 * the pad's ruled lines. It reads as writing from across a room; it is not the text. Pure.
 */
const ROW_HEIGHT = 56;
const TOP = 34;
const LEFT = 36;

/** A small deterministic generator, so the same line always draws the same way. */
function lcg(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const hash = (text: string) => [...text].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0, 7);

/** Strokes for one line of working on row `row` (0-based): roughly one squiggle per three characters. */
export function scribble(text: string, row: number, width = 520): Stroke[] {
  const rnd = lcg(hash(text) + row * 7919);
  const words = Math.max(2, Math.min(9, Math.round(text.replace(/\\[a-z]+/g, "x").length / 3)));
  const baseline = TOP + row * ROW_HEIGHT + 30;
  const usable = Math.min(width - LEFT - 20, 60 + words * 46);
  const step = usable / words;
  const strokes: Stroke[] = [];
  for (let w = 0; w < words; w++) {
    const x0 = LEFT + w * step + rnd() * 6;
    const len = step * (0.55 + rnd() * 0.3);
    const pts = 6 + Math.floor(rnd() * 5);
    const stroke: Stroke = [];
    for (let i = 0; i < pts; i++) {
      const t = i / (pts - 1);
      const x = x0 + t * len;
      const y = baseline - 14 * Math.abs(Math.sin(t * Math.PI * (1.5 + rnd()))) + (rnd() - 0.5) * 6;
      stroke.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
    }
    strokes.push(stroke);
  }
  return strokes;
}
