"use client";

import ProblemCard from "@/components/ProblemCard";
import { Button, Eyebrow } from "@/components/ui";
import { ASSIGNMENT, unitLabel } from "@/data/assignment";
import { useAssignment } from "@/lib/classroom-store";

/**
 * The start screen: the set's title, then every problem as one square tile in a five-wide grid so
 * the whole set sits on the iPad at once. No skill words anywhere on this screen (no summary panel,
 * no chips on the tiles); the skills a student ticks under "not confident with…" are what the
 * warm-up is about. "WARM UP" and "START" sit in the bottom-right corner.
 */
export default function OverviewScreen({ onPractice, onStart }: { onPractice: () => void; onStart: () => void }) {
  const active = useAssignment();
  return (
    <div className="flex h-full min-h-0 flex-col px-10 pt-6 pb-5">
      <header className="shrink-0">
        <Eyebrow>{unitLabel(ASSIGNMENT.unit)}</Eyebrow>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-4">
          <h1 className="font-display text-[30px] leading-[1.1] text-ink">{active.title}</h1>
          <p className="text-[13px] text-ink-muted">
            {ASSIGNMENT.teacher} · due {ASSIGNMENT.due}
          </p>
        </div>
      </header>

      <ol className="mt-4 grid shrink-0 grid-cols-5 gap-3" data-problems>
        {active.problems.map((p) => (
          <li key={p.id} className="aspect-square min-h-0" data-problem={p.id}>
            <ProblemCard problem={p} chips={false} compact />
          </li>
        ))}
      </ol>

      <div className="mt-auto flex shrink-0 justify-end gap-2 pt-4" data-warmup-offer>
        <Button variant="accent" size="lg" className="uppercase tracking-[0.08em]" onClick={onPractice}>
          warm up
        </Button>
        <Button variant="accent" size="lg" className="uppercase tracking-[0.08em]" onClick={onStart}>
          start
        </Button>
      </div>
    </div>
  );
}
