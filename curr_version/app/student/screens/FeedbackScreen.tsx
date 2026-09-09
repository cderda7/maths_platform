"use client";

import { useState } from "react";
import M from "@/components/Math";
import { Button, Card, Eyebrow } from "@/components/ui";
import { DifficultyTag } from "@/components/Tag";
import { useAssignment } from "@/lib/classroom-store";
import { feedbackSummary } from "@/lib/feedback";
import type { SessionAction, StudentSession } from "@/lib/session";

/**
 * Detective feedback after handing in. One conversational sentence (how many problems contain a
 * mistake, which subskills to double-check) and the transcription of every problem with no marks
 * of any kind. The star is the student's own "not sure about this one".
 */
export default function FeedbackScreen({ session, dispatch }: { session: StudentSession; dispatch: (a: SessionAction) => void }) {
  const problems = useAssignment().problems;
  const summary = feedbackSummary(session, "original", problems);
  const [sel, setSel] = useState(0);
  const cur = problems[Math.min(sel, problems.length - 1)];
  const lines = session.lines[cur.id] ?? [];
  const starred = session.stars.includes(cur.id);

  return (
    <div className="grid h-full min-h-0 grid-cols-[360px_1fr]">
      <aside className="flex min-h-0 flex-col overflow-y-auto border-r border-line px-7 py-7">
        <Eyebrow>Handed in</Eyebrow>
        <h1 className="font-display mt-2 text-[28px] leading-tight text-ink">How it held up</h1>
        <Card tone="soft" className="mt-4 p-4">
          <p className="text-[15px] leading-relaxed text-ink" data-summary>
            {summary.sentence}
          </p>
        </Card>
        <ol className="mt-5 space-y-2">
          {problems.map((p, i) => {
            const active = i === sel;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setSel(i)}
                  aria-current={active ? "true" : undefined}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                    active ? "border-ink bg-ink text-white" : "border-line bg-paper text-ink hover:border-ink-muted"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="font-display text-[18px]">{p.label}</span>
                    <span className={`text-[12.5px] ${active ? "text-white/75" : "text-ink-muted"}`}>{(session.lines[p.id]?.length ?? 0) === 0 ? "not attempted" : `${session.lines[p.id].length} lines`}</span>
                  </span>
                  {session.stars.includes(p.id) && <span aria-label="starred">★</span>}
                </button>
              </li>
            );
          })}
        </ol>
        <div className="mt-auto pt-6">
          <Button size="lg" className="w-full" onClick={() => dispatch({ type: "goto", stage: "rework" })}>
            Rework →
          </Button>
        </div>
      </aside>

      <section className="flex min-h-0 flex-col overflow-y-auto px-8 py-7">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-display text-[26px] text-ink">{cur.label}</span>
              <DifficultyTag d={cur.difficulty} />
            </div>
            <p className="mt-1.5 text-[13.5px] text-ink-soft">{cur.stem}</p>
          </div>
          <div className="math-lg text-ink">
            <M tex={cur.tex} />
          </div>
        </div>

        <ol className="mt-5 space-y-2" data-lines>
          {lines.map((l, i) => (
            <li key={i} className="rounded-xl border border-line bg-paper px-4 py-3 text-[17px] text-ink">
              <M tex={l.tex} />
            </li>
          ))}
          {lines.length === 0 && <li className="rounded-xl border border-dashed border-line-strong px-4 py-3 text-[13px] text-ink-muted">Not attempted</li>}
        </ol>

        <div className="mt-auto flex justify-end pt-5">
          <Button variant={starred ? "accent" : "secondary"} className="whitespace-nowrap" onClick={() => dispatch({ type: "star/toggle", problem: cur.id })} aria-pressed={starred} data-star>
            {starred ? "★ Starred" : "☆ Not sure about this one"}
          </Button>
        </div>
      </section>
    </div>
  );
}
