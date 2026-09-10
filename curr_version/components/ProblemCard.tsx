"use client";

import M from "@/components/Math";
import { Card } from "@/components/ui";
import Figure from "@/components/Figure";
import { LeafChip } from "@/components/Tag";
import type { Problem } from "@/data/types";
import { problemLeaves } from "@/lib/hierarchy";

/**
 * One problem as the student sees it before the set: label, stem, expression, figure, and (unless
 * `chips` is off) its leaf chips. No difficulty tag: the student judges the problem by looking at
 * it. `compact` is the start screen's little tile: tighter padding, smaller type, a smaller figure.
 */
export default function ProblemCard({ problem: p, chips = true, compact = false }: { problem: Problem; chips?: boolean; compact?: boolean }) {
  return (
    <Card className={`h-full ${compact ? "p-3.5" : "p-5"}`}>
      <div className="flex items-center justify-between">
        <span className={`font-display text-ink ${compact ? "text-[18px]" : "text-[20px]"}`}>{p.label}</span>
      </div>
      <p className={`text-ink-soft ${compact ? "mt-2 text-[12.5px] leading-snug" : "mt-2.5 text-[13.5px]"}`}>{p.stem}</p>
      <div className={`text-ink ${compact ? "mt-2" : "math-lg mt-2.5"}`}>
        <M tex={p.tex} display />
      </div>
      {p.figure && (
        <div className={`mx-auto ${compact ? "mt-1 max-w-[100px]" : "mt-2 max-w-[260px]"}`}>
          <Figure id={p.figure} />
        </div>
      )}
      {chips && (
        <div className="mt-3.5 flex flex-wrap justify-center gap-1.5">
          {problemLeaves(p).map((id) => (
            <LeafChip student key={id} id={id} />
          ))}
        </div>
      )}
    </Card>
  );
}
