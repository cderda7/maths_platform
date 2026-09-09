"use client";

import ProblemCard from "@/components/ProblemCard";
import { Button, Eyebrow } from "@/components/ui";
import { ASSIGNMENT, unitLabel } from "@/data/assignment";
import { categoryName, leafName } from "@/data/taxonomy";
import { useAssignment } from "@/lib/classroom-store";
import { categoriesTouched, leavesTouched } from "@/lib/hierarchy";

export default function OverviewScreen({ onPractice, onStart }: { onPractice: () => void; onStart: () => void }) {
  const active = useAssignment();
  const categories = categoriesTouched(active.problems);
  const leaves = leavesTouched(active.problems).filter((l) => !l.startsWith("communication."));
  return (
    <div className="grid h-full min-h-0 grid-cols-[440px_1fr]">
      <aside className="min-h-0 overflow-y-auto border-r border-line px-9 py-8">
        <Eyebrow>{unitLabel(ASSIGNMENT.unit)}</Eyebrow>
        <h1 className="font-display mt-3 text-[34px] leading-[1.08] text-ink">{active.title}</h1>
        <p className="mt-3 text-[13px] text-ink-muted">
          {ASSIGNMENT.teacher} · due {ASSIGNMENT.due}
        </p>
        <Eyebrow className="mt-6">Covers</Eyebrow>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <span key={c} className="rounded-xl border border-accent-line bg-accent-soft/60 px-3 py-1.5 text-[13.5px] font-medium text-ink">
              {categoryName(c).name}
            </span>
          ))}
        </div>

        <Eyebrow className="mt-5">Leans on</Eyebrow>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {leaves.map((id) => (
            <li key={id} className="rounded-full border border-line bg-paper px-2.5 py-1 text-[12.5px] text-ink-soft">
              {leafName(id).name}
            </li>
          ))}
        </ul>
      </aside>

      <section className="flex min-h-0 flex-col px-9 py-8">
        <Eyebrow>Problems</Eyebrow>
        <ol className="mt-5 grid min-h-0 grid-cols-2 gap-4 overflow-y-auto pb-2">
          {active.problems.map((p) => (
            <li key={p.id}>
              <ProblemCard problem={p} />
            </li>
          ))}
        </ol>

        <div className="mt-4 flex shrink-0 justify-end gap-2 border-t border-line pt-4" data-warmup-offer>
          <Button variant="secondary" size="lg" onClick={onPractice}>
            warm up
          </Button>
          <Button size="lg" onClick={onStart}>
            start
          </Button>
        </div>
      </section>
    </div>
  );
}
