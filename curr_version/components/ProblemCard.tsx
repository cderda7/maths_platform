"use client";

import M from "@/components/Math";
import { Card } from "@/components/ui";
import Figure from "@/components/Figure";
import { LeafChip } from "@/components/Tag";
import type { Problem } from "@/data/types";
import type { LeafId } from "@/data/taxonomy";
import { problemLeaves } from "@/lib/hierarchy";

/**
 * One problem as the student sees it before the set: label, stem, expression, figure, leaf chips.
 * No difficulty tag: the student judges the problem by looking at it. Selectable when `onToggle`
 * is given (the warm-up chooser); `highlight` turns those leaves' chips light blue.
 */
export default function ProblemCard({ problem: p, selected = false, onToggle, highlight = [] }: { problem: Problem; selected?: boolean; onToggle?: () => void; highlight?: LeafId[] }) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <span className="font-display text-[20px] text-ink">{p.label}</span>
        {onToggle && (
          <span
            className={`grid h-5 w-5 place-items-center rounded-full border text-[11px] ${selected ? "border-accent bg-accent text-white" : "border-line-strong text-transparent"}`}
            aria-hidden
          >
            ✓
          </span>
        )}
      </div>
      <p className="mt-2.5 text-[13.5px] text-ink-soft">{p.stem}</p>
      <div className="math-lg mt-2.5 text-ink">
        <M tex={p.tex} display />
      </div>
      {p.figure && (
        <div className="mx-auto mt-2 max-w-[260px]">
          <Figure id={p.figure} />
        </div>
      )}
      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {problemLeaves(p).map((id) => (
          <LeafChip key={id} id={id} className={highlight.includes(id) ? "!border-standout-line !bg-standout-soft !text-standout" : ""} />
        ))}
      </div>
    </>
  );
  if (!onToggle) return <Card className="h-full p-5">{body}</Card>;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      data-problem={p.id}
      className={`block h-full w-full rounded-2xl border p-5 text-left shadow-card transition-colors ${selected ? "border-accent bg-accent-soft/40" : "border-line bg-paper hover:border-ink-muted"}`}
    >
      {body}
    </button>
  );
}
