"use client";

import M from "@/components/Math";
import { Button, Card, Eyebrow } from "@/components/ui";
import { DifficultyTag, SubskillChip } from "@/components/Tag";
import { ASSIGNMENT } from "@/data/assignment";
import { PRACTICE } from "@/data/practice";
import { useAssignment } from "@/lib/classroom-store";
import { PREREQ_IDS, SUBSKILL_MAP, TARGET_ID } from "@/data/subskills";

export default function OverviewScreen({ onPractice, onStart }: { onPractice: () => void; onStart: () => void }) {
  const target = SUBSKILL_MAP[TARGET_ID];
  const active = useAssignment();
  return (
    <div className="grid h-full min-h-0 grid-cols-[440px_1fr]">
      <aside className="min-h-0 overflow-y-auto border-r border-line px-9 py-8">
        <Eyebrow>{ASSIGNMENT.unit}</Eyebrow>
        <h1 className="font-display mt-3 text-[34px] leading-[1.08] text-ink">{active.title}</h1>
        <p className="mt-3 text-[13px] text-ink-muted">
          {ASSIGNMENT.teacher} · due {ASSIGNMENT.due}
        </p>
        <Eyebrow className="mt-6">About</Eyebrow>
        <div className="mt-3 rounded-xl border border-accent-line bg-accent-soft/60 px-4 py-2.5 text-[14.5px] font-medium text-ink">{target.name}</div>

        <Eyebrow className="mt-5">Leans on</Eyebrow>
        <ul className="mt-3 space-y-1.5">
          {PREREQ_IDS.map((id) => (
            <li key={id} className="flex items-center gap-3 text-[14px] font-medium text-ink">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
              {SUBSKILL_MAP[id].name}
            </li>
          ))}
        </ul>
      </aside>

      <section className="flex min-h-0 flex-col px-9 py-8">
        <Eyebrow>Problems</Eyebrow>
        <ol className="mt-5 grid min-h-0 grid-cols-2 gap-4 overflow-y-auto pb-2">
          {active.problems.map((p) => (
            <li key={p.id}>
              <Card className="h-full p-5">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[20px] text-ink">{p.label}</span>
                  <DifficultyTag d={p.difficulty} />
                </div>
                <p className="mt-2.5 text-[13.5px] text-ink-soft">{p.stem}</p>
                <div className="math-lg mt-2.5 text-ink">
                  <M tex={p.tex} display />
                </div>
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {p.prereqs.map((id) => (
                    <SubskillChip key={id} id={id} />
                  ))}
                </div>
              </Card>
            </li>
          ))}
        </ol>

        <Card tone="soft" className="mt-4 flex shrink-0 items-center justify-between gap-6 p-5">
          <div>
            <div className="text-[15px] font-medium text-ink">Two-minute warm-up?</div>
            <p className="mt-1 text-[13px] text-ink-muted">{SUBSKILL_MAP[PRACTICE.subskill].name} · not marked</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="secondary" size="lg" onClick={onPractice}>
              Warm up
            </Button>
            <Button size="lg" onClick={onStart}>
              Start
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
