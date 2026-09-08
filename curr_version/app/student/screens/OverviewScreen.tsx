import M from "@/components/Math";
import { Button, Card, Eyebrow } from "@/components/ui";
import { DifficultyTag, SubskillChip } from "@/components/Tag";
import { ASSIGNMENT } from "@/data/assignment";
import { PRACTICE } from "@/data/practice";
import { PREREQ_IDS, SUBSKILL_MAP, TARGET_ID } from "@/data/subskills";

export default function OverviewScreen({ onPractice, onStart }: { onPractice: () => void; onStart: () => void }) {
  const target = SUBSKILL_MAP[TARGET_ID];
  return (
    <div className="grid h-full min-h-0 grid-cols-[440px_1fr]">
      <aside className="min-h-0 overflow-y-auto border-r border-line px-9 py-8">
        <Eyebrow>{ASSIGNMENT.unit}</Eyebrow>
        <h1 className="font-display mt-3 text-[34px] leading-[1.08] text-ink">{ASSIGNMENT.title}</h1>
        <p className="mt-3 text-[13px] text-ink-muted">
          {ASSIGNMENT.teacher} · due {ASSIGNMENT.due}
        </p>
        <p className="mt-4 text-[14.5px] leading-relaxed text-ink-soft">{ASSIGNMENT.intro}</p>

        <Eyebrow className="mt-6">This set is about</Eyebrow>
        <div className="mt-3 rounded-xl border border-accent-line bg-accent-soft/60 px-4 py-2.5 text-[14.5px] font-medium text-ink">{target.name}</div>

        <Eyebrow className="mt-5">It leans on</Eyebrow>
        <ul className="mt-3 space-y-1.5">
          {PREREQ_IDS.map((id) => {
            const s = SUBSKILL_MAP[id];
            return (
              <li key={id} className="flex gap-3">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                <div>
                  <div className="text-[14px] font-medium text-ink">{s.name}</div>
                  <div className="text-[12px] leading-snug text-ink-muted">{s.description}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className="flex min-h-0 flex-col px-9 py-8">
        <div className="flex items-end justify-between">
          <div>
            <Eyebrow>The problems</Eyebrow>
            <p className="mt-2 text-[14px] text-ink-soft">Four problems. Show every line of working as you go.</p>
          </div>
        </div>
        <ol className="mt-5 grid grid-cols-2 gap-4">
          {ASSIGNMENT.problems.map((p) => (
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

        <Card tone="soft" className="mt-auto flex items-center justify-between gap-6 p-5">
          <div>
            <div className="text-[15px] font-medium text-ink">Want a two-minute warm-up first?</div>
            <p className="mt-1 text-[13px] leading-snug text-ink-soft">
              {PRACTICE.why} It isn't marked and your teacher sees only that you took it.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="secondary" size="lg" onClick={onPractice}>
              Warm up first
            </Button>
            <Button size="lg" onClick={onStart}>
              Start the set
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
