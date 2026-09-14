import type { FigureId } from "@/data/types";

/** Inline SVG figures a problem can show. Vector, so they read on the iPad and the board alike. */
export default function Figure({ id, className = "" }: { id: FigureId; className?: string }) {
  if (id === "q8-parabola") return <Parabola className={className} id={id} spec={Q8} />;
  if (id === "q8-similar-parabola") return <Parabola className={className} id={id} spec={Q8_SIMILAR} />;
  return null;
}

/** One monic parabola y = x² + bx + c on its axes: the scale, the ticks and where the curve and the labels stop. */
interface ParabolaSpec {
  b: number;
  c: number;
  roots: [number, number];
  /** Pixels per unit and the SVG y of the x-axis. */
  kx: number;
  ky: number;
  axisY: number;
  xAxisTo: number;
  yAxis: [number, number];
  xTicks: number[];
  yTicks: number[];
  curve: [number, number];
  xLabelAt: number;
  yLabelAt: number;
  label: string;
}

/** y = x² − 4x + 3: intercepts at 1 and 3, turning point (2, −1), y-intercept 3. */
const Q8: ParabolaSpec = { b: -4, c: 3, roots: [1, 3], kx: 40, ky: 25, axisY: 130, xAxisTo: 5.2, yAxis: [4.2, -2], xTicks: [1, 2, 3, 4], yTicks: [1, 2, 3, -1], curve: [-0.6, 4.6], xLabelAt: 5, yLabelAt: 4, label: "Parabola crossing the x-axis at 1 and 3, turning point at (2, −1)" };

/** Q8's similar problem (ticket 256), y = x² − 6x + 5: intercepts at 1 and 5, turning point (3, −4), on the same 300 × 190 frame. */
const Q8_SIMILAR: ParabolaSpec = { b: -6, c: 5, roots: [1, 5], kx: 30, ky: 17, axisY: 105, xAxisTo: 7.2, yAxis: [5.4, -4.6], xTicks: [1, 2, 3, 4, 5, 6], yTicks: [2, 4, -2, -4], curve: [0.1, 5.9], xLabelAt: 7, yLabelAt: 5.2, label: "Parabola crossing the x-axis at 1 and 5, turning point at (3, −4)" };

function Parabola({ className, id, spec }: { className: string; id: FigureId; spec: ParabolaSpec }) {
  const { b, c, kx, ky, axisY } = spec;
  const sx = (x: number) => 40 + (x + 1) * kx; // x from −1
  const sy = (y: number) => axisY - y * ky;
  const pts: string[] = [];
  for (let x = spec.curve[0]; x <= spec.curve[1]; x += 0.1) pts.push(`${sx(x).toFixed(1)},${sy(x * x + b * x + c).toFixed(1)}`);
  return (
    <svg viewBox="0 0 300 190" className={`block w-full ${className}`} role="img" aria-label={spec.label} data-figure={id}>
      <line x1={sx(-1)} y1={sy(0)} x2={sx(spec.xAxisTo)} y2={sy(0)} stroke="#7b7997" strokeWidth="1" />
      <line x1={sx(0)} y1={sy(spec.yAxis[0])} x2={sx(0)} y2={sy(spec.yAxis[1])} stroke="#7b7997" strokeWidth="1" />
      {spec.xTicks.map((x) => (
        <g key={x}>
          <line x1={sx(x)} y1={sy(0) - 3} x2={sx(x)} y2={sy(0) + 3} stroke="#7b7997" />
          <text x={sx(x)} y={sy(0) + 16} fontSize="11" textAnchor="middle" fill="#3d3b66">
            {x}
          </text>
        </g>
      ))}
      {spec.yTicks.map((y) => (
        <g key={y}>
          <line x1={sx(0) - 3} y1={sy(y)} x2={sx(0) + 3} y2={sy(y)} stroke="#7b7997" />
          <text x={sx(0) - 8} y={sy(y) + 4} fontSize="11" textAnchor="end" fill="#3d3b66">
            {y}
          </text>
        </g>
      ))}
      <polyline points={pts.join(" ")} fill="none" stroke="#5b4ae8" strokeWidth="2.4" strokeLinejoin="round" />
      {spec.roots.map((r) => (
        <circle key={r} cx={sx(r)} cy={sy(0)} r="3.2" fill="#14123a" />
      ))}
      <text x={sx(spec.xLabelAt)} y={sy(0) - 6} fontSize="11" fill="#3d3b66">
        x
      </text>
      <text x={sx(0) + 6} y={sy(spec.yLabelAt)} fontSize="11" fill="#3d3b66">
        y
      </text>
    </svg>
  );
}
