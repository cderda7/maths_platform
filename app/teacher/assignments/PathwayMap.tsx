"use client";

import type { Pathway, ReviewStage } from "@/data/types";
import { mapColumns, pathwaySentence, STAGE_WORD } from "@/lib/pathway";

/** Every node is one fixed height so the arrows between columns are pure geometry, never measured. */
const NODE_H = 42;
const ROW_GAP = 12;
const ARROW_W = 72;
const rowMid = (row: number) => row * (NODE_H + ROW_GAP) + NODE_H / 2;

/**
 * The review-pathway map. Column one is "individual working", always bold; tapping it clears
 * every later column and starts again. Each later column offers the
 * stages that may legally follow what is picked so far; the pick is bold, its siblings fade but
 * stay tappable, and picking clears everything downstream. Leaving a column unpicked ends the
 * pathway there. "Continue tomorrow" hangs off 1st submit, dashed and disabled. The arrows into a
 * column leave the node picked in the column before it and curve to each option (ticket 197); once the
 * column has a pick, only the arrow to the pick stays, while its siblings' boxes stay faded (ticket 201).
 */
export default function PathwayMap({ value, onChange }: { value: Pathway; onChange: (p: Pathway) => void }) {
  const columns = mapColumns(value);
  const pick = (i: number, s: ReviewStage) => onChange(value[i] === s ? value.slice(0, i) : [...value.slice(0, i), s]);

  return (
    <div data-pathway-map>
      <div className="flex items-start">
        <div className="flex flex-col items-start" style={{ gap: ROW_GAP }}>
          <Node bold label="individual working" onClick={() => onChange([])} />
          <button type="button" disabled className="w-40 rounded-xl border border-dashed border-line-strong px-4 py-2.5 text-left text-[13px] leading-snug text-ink-muted opacity-60" data-node="continue-tomorrow" title="Coming soon">
            continue tomorrow
            <span className="ml-2 text-[10.5px] uppercase tracking-wide">soon</span>
          </button>
        </div>
        {columns.map(({ options, from }, i) => (
          <div key={i} className="flex items-start">
            <Arrows from={from} options={options} picked={value[i]} column={i} />
            <div className="flex flex-col" style={{ gap: ROW_GAP }} data-column={i}>
              {options.map((s) => {
                const picked = value[i] === s;
                const faded = value[i] !== undefined && !picked;
                return <Node key={s} label={STAGE_WORD[s]} bold={picked} faded={faded} onClick={() => pick(i, s)} stage={s} />;
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-[14px] text-ink" data-pathway-sentence>
        {pathwaySentence(value)}
      </p>
    </div>
  );
}

/** One arrow from the picked node on the left to each option on the right, all muted; once an option is picked, only its arrow stays, in ink. */
function Arrows({ from, options, picked, column }: { from: number; options: ReviewStage[]; picked: ReviewStage | undefined; column: number }) {
  const rows = Math.max(from + 1, options.length);
  const height = rowMid(rows - 1) + NODE_H / 2;
  const x0 = 6;
  const x1 = ARROW_W - 8;
  const y0 = rowMid(from);
  return (
    <svg width={ARROW_W} height={height} viewBox={`0 0 ${ARROW_W} ${height}`} className="shrink-0 overflow-visible" aria-hidden data-arrows={column} data-arrows-from={from}>
      {options.map((s, row) => {
        if (picked !== undefined && s !== picked) return null;
        const y1 = rowMid(row);
        const mid = (x0 + x1) / 2;
        const tone = picked === s ? "text-ink" : "text-ink-muted";
        return (
          <g key={s} className={tone} fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" data-arrow={s} data-arrow-y0={y0} data-arrow-y1={y1}>
            <path d={`M ${x0} ${y0} C ${mid} ${y0}, ${mid} ${y1}, ${x1} ${y1}`} />
            <path d={`M ${x1 - 5} ${y1 - 4} L ${x1} ${y1} L ${x1 - 5} ${y1 + 4}`} />
          </g>
        );
      })}
    </svg>
  );
}

function Node({ label, bold, faded, onClick, stage }: { label: string; bold?: boolean; faded?: boolean; onClick?: () => void; stage?: ReviewStage }) {
  const cls = bold ? "border-ink bg-ink text-white" : "border-line bg-paper text-ink hover:border-ink-muted";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-pressed={stage ? !!bold : undefined}
      data-node={stage ?? "submit"}
      data-picked={bold ? "true" : undefined}
      data-faded={faded ? "true" : undefined}
      style={{ height: NODE_H }}
      className={`w-40 whitespace-nowrap rounded-xl border px-4 text-left text-[14px] font-medium leading-snug transition-colors ${cls} ${faded ? "opacity-35" : ""}`}
    >
      {label}
    </button>
  );
}
