import M from "@/components/Math";
import { Eyebrow } from "@/components/ui";
import { DifficultyTag, SubskillChip } from "@/components/Tag";
import { ASSIGNMENT } from "@/data/assignment";
import { SUBSKILL_MAP } from "@/data/subskills";
import type { StudentSession } from "@/lib/session";

/** The working screen. Ticket 03 fills the right-hand side with the drawpad and transcription. */
export default function WorkingScreen({ session }: { session: StudentSession }) {
  const p = ASSIGNMENT.problems[0];
  const c = session.confidence;
  return (
    <div className="grid h-full min-h-0 grid-cols-[360px_1fr]">
      <aside className="min-h-0 overflow-y-auto border-r border-line px-8 py-7">
        <div className="flex items-center justify-between">
          <span className="font-display text-[26px] text-ink">{p.label}</span>
          <DifficultyTag d={p.difficulty} />
        </div>
        <p className="mt-3 text-[14px] text-ink-soft">{p.stem}</p>
        <div className="math-lg mt-3 text-ink">
          <M tex={p.tex} display />
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {p.prereqs.map((id) => (
            <SubskillChip key={id} id={id} />
          ))}
        </div>
        {c && (
          <div className="mt-8 rounded-xl border border-line bg-cream-deep/60 px-4 py-3 text-[12.5px] leading-snug text-ink-soft">
            You said you were{" "}
            {c.level === "confident" ? "confident" : c.level === "low" ? "not so sure about this topic" : `less sure when ${SUBSKILL_MAP[c.subskill].name.toLowerCase()} comes up`}
            . We'll keep an eye on that together.
          </div>
        )}
      </aside>
      <section className="flex min-h-0 flex-col px-8 py-7">
        <Eyebrow>Your working</Eyebrow>
        <div className="mt-3 flex-1 rounded-2xl border border-dashed border-line-strong bg-paper" />
      </section>
    </div>
  );
}
