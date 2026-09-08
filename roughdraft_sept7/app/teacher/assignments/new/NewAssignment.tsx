"use client";

import { useState } from "react";
import M from "@/components/Math";
import { Button, Card, Eyebrow, H1 } from "@/components/ui";
import { DifficultyTag, SubskillChip } from "@/components/Tag";
import { PROBLEMS, PROBLEM_MAP } from "@/data/problems";
import { SUBSKILL_MAP } from "@/data/subskills";

const CORE = PROBLEMS.filter((p) => p.kind === "core");
const WARMUPS = PROBLEMS.filter((p) => p.kind === "prereq");

export default function NewAssignment() {
  const [added, setAdded] = useState<string[]>(["q1", "q2", "q3"]);
  const [selected, setSelected] = useState<string>("q3");
  const [title, setTitle] = useState("Roots of a quadratic — Set 3");
  const sel = PROBLEM_MAP[selected];
  const warmupsFor = (id: string) => WARMUPS.filter((w) => PROBLEM_MAP[id].prereqs.includes(w.subskill));

  const toggle = (id: string) => {
    setAdded((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
    setSelected(id);
  };

  const coverage = Array.from(new Set(added.flatMap((id) => PROBLEM_MAP[id].prereqs)));

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Eyebrow>11 Methods B · Unit 1 · Topic 2</Eyebrow>
      <H1 className="mt-2">New assignment</H1>
      <p className="mt-3 max-w-xl text-[15px] text-ink-soft">
        Add problems from the bank. Each one is broken down into the prerequisite skills a student needs to get through it, so you can see what the set is really asking for.
      </p>

      <div className="mt-8 grid lg:grid-cols-[400px_1fr] gap-6 items-start">
        <div className="space-y-4">
          <Card className="p-5">
            <label className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-2 text-[14px] text-ink" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted">Class</label>
                <div className="mt-1.5 rounded-xl border border-line bg-cream/60 px-3 py-2 text-[13.5px] text-ink">11 Methods B</div>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted">Due</label>
                <div className="mt-1.5 rounded-xl border border-line bg-cream/60 px-3 py-2 text-[13.5px] text-ink">Thu 10 Sep</div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <Eyebrow>Problem bank · finding roots</Eyebrow>
            <ul className="mt-3 space-y-1.5">
              {CORE.map((p) => {
                const on = added.includes(p.id);
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => toggle(p.id)}
                      className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
                        selected === p.id ? "border-accent bg-accent-soft/60" : on ? "border-line bg-paper" : "border-dashed border-line-strong bg-transparent"
                      }`}
                    >
                      <span className={`grid place-items-center h-5 w-5 rounded-full text-[11px] ${on ? "bg-ink text-white" : "border border-line-strong text-ink-muted"}`}>{on ? "✓" : "+"}</span>
                      <span className="w-7 text-[12.5px] font-medium text-ink">{p.label}</span>
                      <span className="flex-1 min-w-0 overflow-hidden whitespace-nowrap text-[12.5px]"><M tex={p.tex ?? ""} /></span>
                      <DifficultyTag d={p.difficulty} className="shrink-0" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>

          <div className="flex gap-2">
            <Button>Assign to 11 Methods B</Button>
            <Button variant="ghost">Save draft</Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex flex-wrap items-center gap-3">
              <Eyebrow>Auto-generated breakdown</Eyebrow>
              <span className="text-[11.5px] text-ink-muted">· {sel.label}</span>
              <span className="ml-auto text-[11.5px] text-ink-muted">generated at creation · editable</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="font-display text-[24px] text-ink">{sel.label}</span>
              <DifficultyTag d={sel.difficulty} />
              <span className="text-[14px] text-ink-soft">{sel.stem}</span>
            </div>
            <div className="mt-2 text-[18px]"><M tex={sel.tex ?? ""} display /></div>

            <div className="mt-6 grid md:grid-cols-2 gap-5">
              <div>
                <div className="text-[12px] font-medium text-ink">Main skill</div>
                <div className="mt-2 rounded-xl border border-accent-line bg-accent-soft/60 px-4 py-3">
                  <div className="text-[13.5px] text-ink font-medium">{SUBSKILL_MAP[sel.subskill].name}</div>
                  <div className="text-[12px] text-ink-soft mt-0.5">{SUBSKILL_MAP[sel.subskill].description}</div>
                </div>
                <div className="mt-4 text-[12px] font-medium text-ink">Leans on</div>
                <ul className="mt-2 space-y-2">
                  {sel.prereqs.map((s) => (
                    <li key={s} className="rounded-xl border border-line bg-paper px-4 py-3">
                      <div className="text-[13px] text-ink">{SUBSKILL_MAP[s].name}</div>
                      <div className="text-[12px] text-ink-muted mt-0.5">{SUBSKILL_MAP[s].description}</div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-[12px] font-medium text-ink">Why it's tagged <span className="text-accent-deep">{sel.difficulty}</span></div>
                  <p className="mt-1.5 text-[13px] text-ink-soft leading-relaxed">{sel.difficultyWhy}</p>
                </div>
                <div>
                  <div className="text-[12px] font-medium text-ink">Likely stumble</div>
                  <p className="mt-1.5 text-[13px] text-ink-soft leading-relaxed">{sel.stumble}</p>
                </div>
                <div>
                  <div className="text-[12px] font-medium text-ink">Solution trace the checker will compare against</div>
                  <ol className="mt-1.5 space-y-1.5">
                    {sel.solution.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[12.5px]">
                        <span className="w-4 text-ink-muted tabular-nums">{i + 1}</span>
                        <span><M tex={s.tex} /><span className="text-ink-muted"> — {s.note}</span></span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-1.5 text-[11.5px] text-ink-muted">Other valid methods are accepted; this is one route, not the route.</div>
                </div>
                <div>
                  <div className="text-[12px] font-medium text-ink">Warm-ups the system can offer</div>
                  {warmupsFor(sel.id).length ? (
                    <ul className="mt-1.5 space-y-1.5">
                      {warmupsFor(sel.id).map((w) => (
                        <li key={w.id} className="flex items-center gap-2 text-[12.5px] rounded-lg border border-line bg-cream/60 px-3 py-1.5">
                          <SubskillChip id={w.subskill} />
                          <M tex={w.tex ?? ""} />
                          <span className="ml-auto text-ink-muted">~{w.minutes} min</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-1.5 text-[12.5px] text-ink-muted">None in the bank for these skills yet.</div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5" tone="plain">
            <Eyebrow>What this set covers so far</Eyebrow>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {coverage.map((c) => <SubskillChip key={c} id={c} />)}
              {coverage.length === 0 && <span className="text-[12.5px] text-ink-muted">Add a problem to see the breakdown.</span>}
            </div>
            <p className="mt-3 text-[12.5px] text-ink-soft">
              {added.length} problem{added.length === 1 ? "" : "s"}, about {added.reduce((n, id) => n + PROBLEM_MAP[id].minutes, 0)} min. Warm-ups are offered to students who need them, and not to those who don't.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
