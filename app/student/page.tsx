import Link from "next/link";
import M from "@/components/Math";
import { Card, Eyebrow, H1 } from "@/components/ui";
import { DifficultyTag, SubskillChip, StatusDot } from "@/components/Tag";
import { ASSIGNMENT, ASSIGNMENT_ORDER, PROBLEM_MAP } from "@/data/problems";
import { SUBSKILL_MAP } from "@/data/subskills";
import { STUDENT_MAP } from "@/data/students";

const DONE = new Set(["q1", "q2", "p-factor", "q3"]);
const CURRENT = "q4";

export default function PracticeLanding() {
  const me = STUDENT_MAP.jordan;
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>{ASSIGNMENT.className} · {ASSIGNMENT.teacher} · due {ASSIGNMENT.due}</Eyebrow>
          <H1 className="mt-2">{ASSIGNMENT.title}</H1>
          <p className="mt-3 max-w-xl text-[15px] text-ink-soft leading-relaxed">{ASSIGNMENT.intro}</p>
        </div>
        <Card className="p-4 min-w-[260px]">
          <div className="text-[12px] text-ink-muted">Where you're up to</div>
          <div className="mt-1 text-[15px] text-ink">
            {DONE.size} of {ASSIGNMENT_ORDER.length} done · next is <span className="font-medium">Q4</span>
          </div>
          <div className="mt-3 flex gap-1">
            {ASSIGNMENT_ORDER.map((id) => (
              <span
                key={id}
                className={`h-1.5 flex-1 rounded-full ${DONE.has(id) ? "bg-accent" : id === CURRENT ? "bg-accent-line" : "bg-line"}`}
              />
            ))}
          </div>
          <Link href="/student/work" className="mt-3 inline-block text-[13px] text-accent-deep font-medium">
            Keep going →
          </Link>
        </Card>
      </div>

      <div className="mt-10 grid lg:grid-cols-[1fr_300px] gap-8">
        <ol className="space-y-3">
          {ASSIGNMENT_ORDER.map((id, i) => {
            const p = PROBLEM_MAP[id];
            const done = DONE.has(id);
            const current = id === CURRENT;
            const prereq = p.kind === "prereq";
            return (
              <li key={id}>
                <Link href={id === "q4" ? "/student/tutor" : "/student/work"} className="block group">
                  <Card
                    className={`p-5 transition-shadow group-hover:shadow-lift ${current ? "ring-2 ring-accent/40" : ""} ${prereq ? "bg-cream-deep/60" : ""}`}
                    tone={prereq ? "plain" : "paper"}
                  >
                    <div className="flex items-start gap-5">
                      <div className="w-16 shrink-0">
                        <div className={`font-display text-[22px] leading-none ${done ? "text-ink-muted" : "text-ink"}`}>
                          {prereq ? <span className="text-[11px] font-sans font-semibold text-accent-deep tracking-[0.1em] uppercase whitespace-nowrap">Warm-up</span> : p.label}
                        </div>
                        <div className="mt-1.5 text-[11px] text-ink-muted">{i + 1} of {ASSIGNMENT_ORDER.length}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <DifficultyTag d={p.difficulty} />
                          {prereq && (
                            <span className="text-[11.5px] text-ink-muted">
                              {SUBSKILL_MAP[p.subskill].name} · feeds into {id === "p-factor" ? "Q3" : id === "p-expand" ? "Q4" : "Q6"}
                            </span>
                          )}
                          {p.context && <span className="text-[11.5px] text-ink-muted">{p.context}</span>}
                        </div>
                        <div className="mt-2.5 text-[14px] text-ink-soft">{p.stem}</div>
                        {p.tex && (
                          <div className="mt-2 math-lg">
                            <M tex={p.tex} />
                          </div>
                        )}
                        {!prereq && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {p.prereqs.map((s) => (
                              <SubskillChip key={s} id={s} status={me.subskills[s]} />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="shrink-0 text-right text-[12px] text-ink-muted">
                        {done ? (
                          <span className="inline-flex items-center gap-1.5 text-sound"><StatusDot status="sound" /> done</span>
                        ) : current ? (
                          <span className="text-accent-deep font-medium">up next</span>
                        ) : (
                          <span>~{p.minutes} min</span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ol>

        <aside className="space-y-4">
          <Card className="p-5">
            <Eyebrow>What this set leans on</Eyebrow>
            <ul className="mt-3 space-y-2.5">
              {(["factoring", "expansion", "algebra", "fractions", "graphing"] as const).map((s) => (
                <li key={s} className="flex items-start gap-2.5 text-[13px]">
                  <StatusDot status={me.subskills[s]} size="mt-1.5 h-2 w-2" />
                  <div>
                    <div className="text-ink">{SUBSKILL_MAP[s].name}</div>
                    <div className="text-[12px] text-ink-muted">
                      {me.subskills[s] === "secure" && "Holding up so far."}
                      {me.subskills[s] === "developing" && "Getting there — the warm-up helped."}
                      {me.subskills[s] === "gap" && "Comes up in Q5. Worth a warm-up first."}
                      {me.subskills[s] === "unseen" && "Not come up yet in this set."}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5" tone="soft">
            <Eyebrow className="text-accent-deep">Two ways to see the flow</Eyebrow>
            <p className="mt-2 text-[13px] text-ink-soft leading-relaxed">
              The <Link href="/student/work" className="text-accent-deep underline underline-offset-2">working through</Link> screen
              lets you switch between two students on the same set to see how the pacing differs.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
