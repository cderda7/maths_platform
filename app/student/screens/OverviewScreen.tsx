"use client";

import ProblemCard from "@/components/ProblemCard";
import { Button, Eyebrow } from "@/components/ui";
import { ASSIGNMENT, unitLabel } from "@/data/assignment";
import { useAssignment } from "@/lib/classroom-store";

/**
 * The start screen: the set's title, then every problem as one square tile in a five-wide grid so
 * the whole set sits on the iPad at once. No skill words anywhere on this screen (no summary panel,
 * no chips on the tiles); the skills a student ticks under "not confident with…" are what the
 * warm-up is about. One button, "CONTINUE", in the bottom-right corner (the goal and the check-in
 * come before the set, so it is not a start; ticket 154), pulsing an accent ring until pressed so
 * the tiles are never mistaken for the way in. The warm-up is offered on the confidence screen,
 * to the student who says they are not confident.
 */
export default function OverviewScreen({ onStart }: { onStart: () => void }) {
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

      <div className="mt-auto flex shrink-0 justify-end pt-4" data-start>
        <Button variant="accent" size="lg" className="pulse-loop relative uppercase tracking-[0.08em]" onClick={onStart} data-continue>
          continue
        </Button>
      </div>
    </div>
  );
}
