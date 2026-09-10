import type { FigureId } from "@/data/types";

/** Inline SVG figures a problem can show. Vector, so they read on the iPad and the board alike. */
export default function Figure({ id, className = "" }: { id: FigureId; className?: string }) {
  if (id === "q8-parabola") return <ParabolaQ8 className={className} />;
  return null;
}

/** y = x² − 4x + 3: intercepts at 1 and 3, turning point (2, −1), y-intercept 3. */
function ParabolaQ8({ className }: { className: string }) {
  const sx = (x: number) => 40 + (x + 1) * 40; // x from −1 to 5
  const sy = (y: number) => 130 - y * 25; // y from −2 to 4
  const pts: string[] = [];
  for (let x = -0.6; x <= 4.6; x += 0.1) pts.push(`${sx(x).toFixed(1)},${sy(x * x - 4 * x + 3).toFixed(1)}`);
  return (
    <svg viewBox="0 0 300 190" className={`block w-full ${className}`} role="img" aria-label="Parabola crossing the x-axis at 1 and 3, turning point at (2, −1)" data-figure="q8-parabola">
      <line x1={sx(-1)} y1={sy(0)} x2={sx(5.2)} y2={sy(0)} stroke="#7b7997" strokeWidth="1" />
      <line x1={sx(0)} y1={sy(4.2)} x2={sx(0)} y2={sy(-2)} stroke="#7b7997" strokeWidth="1" />
      {[1, 2, 3, 4].map((x) => (
        <g key={x}>
          <line x1={sx(x)} y1={sy(0) - 3} x2={sx(x)} y2={sy(0) + 3} stroke="#7b7997" />
          <text x={sx(x)} y={sy(0) + 16} fontSize="11" textAnchor="middle" fill="#3d3b66">
            {x}
          </text>
        </g>
      ))}
      {[1, 2, 3, -1].map((y) => (
        <g key={y}>
          <line x1={sx(0) - 3} y1={sy(y)} x2={sx(0) + 3} y2={sy(y)} stroke="#7b7997" />
          <text x={sx(0) - 8} y={sy(y) + 4} fontSize="11" textAnchor="end" fill="#3d3b66">
            {y}
          </text>
        </g>
      ))}
      <polyline points={pts.join(" ")} fill="none" stroke="#5b4ae8" strokeWidth="2.4" strokeLinejoin="round" />
      <circle cx={sx(1)} cy={sy(0)} r="3.2" fill="#14123a" />
      <circle cx={sx(3)} cy={sy(0)} r="3.2" fill="#14123a" />
      <text x={sx(5)} y={sy(0) - 6} fontSize="11" fill="#3d3b66">
        x
      </text>
      <text x={sx(0) + 6} y={sy(4)} fontSize="11" fill="#3d3b66">
        y
      </text>
    </svg>
  );
}
