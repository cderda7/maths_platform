"use client";

import Figure from "@/components/Figure";
import M from "@/components/Math";
import { LeafChip } from "@/components/Tag";
import { Button, Eyebrow } from "@/components/ui";
import { ASSIGNMENT, unitLabel } from "@/data/assignment";
import type { Problem } from "@/data/types";
import { useAssignment } from "@/lib/classroom-store";
import { problemLeaves } from "@/lib/hierarchy";

/**
 * The start screen: the set's title, then every problem as one row so the whole set fits on the
 * iPad without scrolling. No skill summary here; the chips on each row are the only skill words,
 * and the warm-up chooser is where the set's skills are laid out.
 */
export default function OverviewScreen({ onPractice, onStart }: { onPractice: () => void; onStart: () => void }) {
  const active = useAssignment();
  return (
    <div className="flex h-full min-h-0 flex-col px-10 pt-6 pb-5">
      <header className="flex shrink-0 items-end justify-between gap-8">
        <div>
          <Eyebrow>{unitLabel(ASSIGNMENT.unit)}</Eyebrow>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-4">
            <h1 className="font-display text-[30px] leading-[1.1] text-ink">{active.title}</h1>
            <p className="text-[13px] text-ink-muted">
              {ASSIGNMENT.teacher} · due {ASSIGNMENT.due}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2" data-warmup-offer>
          <Button variant="accent" size="lg" onClick={onPractice}>
            warm up
          </Button>
          <Button variant="accent" size="lg" onClick={onStart}>
            start
          </Button>
        </div>
      </header>

      <ol className="mt-4 min-h-0 flex-1 divide-y divide-line overflow-y-auto border-t border-line" data-problems>
        {active.problems.map((p) => (
          <ProblemRow key={p.id} problem={p} />
        ))}
      </ol>
    </div>
  );
}

/** One problem on one line: label, the stem with its expression inline, a figure if it has one, its skill chips. */
function ProblemRow({ problem: p }: { problem: Problem }) {
  return (
    <li className="grid grid-cols-[44px_minmax(0,1fr)_500px] items-center gap-x-5 py-1.5" data-problem={p.id}>
      <span className="font-display text-[19px] text-ink">{p.label}</span>
      <div className="flex min-w-0 items-center gap-x-5">
        <p className="text-[14px] leading-snug text-ink-soft">
          {p.stem}
          <span className="math-row ml-3 whitespace-nowrap text-ink">
            <M tex={p.tex} />
          </span>
        </p>
        {p.figure && (
          <div className="w-[120px] shrink-0">
            <Figure id={p.figure} />
          </div>
        )}
      </div>
      <div className="flex flex-wrap justify-end gap-1.5">
        {problemLeaves(p).map((id) => (
          <LeafChip student key={id} id={id} />
        ))}
      </div>
    </li>
  );
}
