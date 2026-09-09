"use client";

import type { Pathway, ReviewStage } from "@/data/types";
import { pathwaySentence, STAGE_WORD, successors } from "@/lib/pathway";

/**
 * The review-pathway map. Column one is the fixed "1st submit". Each later column offers the
 * stages that may legally follow what is picked so far; the pick is bold, its siblings fade but
 * stay tappable, and picking clears everything downstream. Leaving a column unpicked ends the
 * pathway there. "Continue tomorrow" hangs off 1st submit, dashed and disabled.
 */
export default function PathwayMap({ value, onChange }: { value: Pathway; onChange: (p: Pathway) => void }) {
  const columns: ReviewStage[][] = [];
  for (let i = 0; ; i++) {
    if (i > 0 && value[i - 1] === undefined) break;
    const opts = successors(value.slice(0, i));
    if (opts.length === 0) break;
    columns.push(opts);
  }
  const pick = (i: number, s: ReviewStage) => onChange(value[i] === s ? value.slice(0, i) : [...value.slice(0, i), s]);

  return (
    <div data-pathway-map>
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-start gap-3">
          <Node bold label="1st submit" />
          <button type="button" disabled className="w-40 rounded-xl border border-dashed border-line-strong px-4 py-2.5 text-left text-[13px] leading-snug text-ink-muted opacity-60" data-node="continue-tomorrow" title="Coming soon">
            continue tomorrow
            <span className="ml-2 text-[10.5px] uppercase tracking-wide">soon</span>
          </button>
        </div>
        {columns.map((opts, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="mt-2.5 text-[18px] text-ink-muted" aria-hidden>
              →
            </span>
            <div className="flex flex-col gap-3" data-column={i}>
              {opts.map((s) => {
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

function Node({ label, bold, faded, onClick, stage }: { label: string; bold?: boolean; faded?: boolean; onClick?: () => void; stage?: ReviewStage }) {
  const cls = bold ? "border-ink bg-ink text-white" : "border-line bg-paper text-ink hover:border-ink-muted";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      aria-pressed={onClick ? !!bold : undefined}
      data-node={stage ?? "submit"}
      data-picked={bold ? "true" : undefined}
      data-faded={faded ? "true" : undefined}
      className={`w-40 rounded-xl border px-4 py-2.5 text-left text-[14px] font-medium leading-snug transition-colors ${cls} ${faded ? "opacity-35" : ""} ${onClick ? "" : "cursor-default"}`}
    >
      {label}
    </button>
  );
}
