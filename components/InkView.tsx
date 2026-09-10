import type { Stroke } from "@/data/types";

/**
 * Read-only handwriting: the stored strokes as SVG paths, cropped to their bounding box and fitted
 * inside whatever box the caller sizes, so two versions side by side keep the same row heights.
 * Same smoothing as the pad (quadratic midpoints).
 */
export default function InkView({ strokes, className = "" }: { strokes: Stroke[]; className?: string }) {
  const pts = strokes.flat();
  if (pts.length === 0) return null;
  const pad = 12;
  const minX = Math.min(...pts.map((p) => p.x)) - pad;
  const maxX = Math.max(...pts.map((p) => p.x)) + pad;
  const minY = Math.min(...pts.map((p) => p.y)) - pad;
  const maxY = Math.max(...pts.map((p) => p.y)) + pad;
  const w = Math.max(maxX - minX, 40);
  const h = Math.max(maxY - minY, 40);
  return (
    <svg viewBox={`${minX} ${minY} ${w} ${h}`} className={`block h-full w-full ${className}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Handwriting" data-ink>
      {strokes.map((s, i) => (
        <path key={i} d={pathOf(s)} fill="none" stroke="#1f1c4d" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

function pathOf(s: Stroke): string {
  if (s.length === 0) return "";
  if (s.length === 1) return `M ${s[0].x} ${s[0].y} l 0.1 0`;
  let d = `M ${s[0].x} ${s[0].y}`;
  for (let i = 1; i < s.length - 1; i++) {
    const mx = (s[i].x + s[i + 1].x) / 2;
    const my = (s[i].y + s[i + 1].y) / 2;
    d += ` Q ${s[i].x} ${s[i].y} ${mx} ${my}`;
  }
  const last = s[s.length - 1];
  return d + ` L ${last.x} ${last.y}`;
}
