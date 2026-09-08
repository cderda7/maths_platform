"use client";

import M from "@/components/Math";
import { Button, Card, Eyebrow } from "@/components/ui";
import { DifficultyTag } from "@/components/Tag";
import { SUBSKILL_MAP } from "@/data/subskills";
import { peerStruggles } from "@/lib/peers";

/** For a student whose every step held: where the class is finding it hard, in counts only. */
export default function PeerScreen({ onBack }: { onBack: () => void }) {
  const p = peerStruggles();
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-9 py-8">
      <Eyebrow>Where the class is finding it hard</Eyebrow>
      <h1 className="font-display mt-2 text-[30px] leading-tight text-ink">Every step of yours held. Here's where others are stuck.</h1>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
        Counts only, nobody's work. If your teacher asks you to help in a mini-lesson, this is what to have ready.
      </p>

      <div className="mt-6 grid grid-cols-[300px_1fr] gap-4">
        <Card className="p-5">
          <Eyebrow>Skills, by how many find them hard</Eyebrow>
          <ul className="mt-3 space-y-2.5" data-peer-skills>
            {p.subskills.map((s) => (
              <li key={s.id}>
                <div className="flex items-baseline justify-between text-[13.5px]">
                  <span className="font-medium text-ink">{SUBSKILL_MAP[s.id].name}</span>
                  <span className="text-ink-muted">
                    {s.struggling} of {p.classSize}
                  </span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-cream-deep">
                  <div className="h-1.5 rounded-full bg-developing" style={{ width: `${(s.struggling / p.classSize) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <div className="space-y-3">
          {p.problems.map((x) => (
            <Card key={x.problem.id} className="p-5" data-peer-problem>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-display text-[22px] text-ink">{x.problem.label}</span>
                  <DifficultyTag d={x.problem.difficulty} />
                </div>
                <span className="whitespace-nowrap text-[13px] text-ink-muted">
                  missed by {x.missed} of {p.classSize}
                </span>
              </div>
              <div className="mt-1.5 text-[18px] text-ink">
                <M tex={x.problem.tex} />
              </div>
              <p className="mt-2.5 text-[13.5px] leading-snug text-ink-soft">
                <span className="font-medium text-ink">What tends to go wrong: </span>
                {x.pattern}
              </p>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between pt-6">
        <span className="text-[12.5px] text-ink-muted">A good mini-lesson shows the check, not the answer.</span>
        <Button size="lg" variant="secondary" onClick={onBack}>
          ← Back to your report
        </Button>
      </div>
    </div>
  );
}
