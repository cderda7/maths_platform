"use client";

import { useState } from "react";
import M from "@/components/Math";
import { Button, Card, Eyebrow } from "@/components/ui";
import { DifficultyTag, SubskillChip } from "@/components/Tag";
import { SUBSKILL_MAP } from "@/data/subskills";
import { feedbackFor, runKind } from "@/lib/feedback";
import type { SessionAction, StudentSession } from "@/lib/session";

/**
 * Feedback after handing in. Two layers over the transcription: red for every step that didn't
 * hold, blue for a curated few that did. A pattern-level clue per problem with a slip, never the
 * line. A star on a problem that was right but felt unsure.
 */
export default function FeedbackScreen({ session, dispatch }: { session: StudentSession; dispatch: (a: SessionAction) => void }) {
  const fb = feedbackFor(session);
  const kind = runKind(session);
  const [sel, setSel] = useState(0);
  const cur = fb[sel];
  const slipsTotal = fb.reduce((n, p) => n + p.slips.length, 0);
  const starred = session.stars.includes(cur.problem.id);

  return (
    <div className="grid h-full min-h-0 grid-cols-[320px_1fr]">
      <aside className="flex min-h-0 flex-col overflow-y-auto border-r border-line px-7 py-7">
        <Eyebrow>Handed in</Eyebrow>
        <h1 className="font-display mt-2 text-[28px] leading-tight text-ink">How it held up</h1>
        <p className="mt-2 text-[13px] leading-snug text-ink-soft">
          {slipsTotal === 0
            ? "Every step held. A few are worth a second look because of how you did them."
            : `${slipsTotal} ${slipsTotal === 1 ? "step" : "steps"} didn't hold. Everything else did, and a few steps stood out.`}
        </p>
        <ol className="mt-5 space-y-2">
          {fb.map((p, i) => {
            const active = i === sel;
            return (
              <li key={p.problem.id}>
                <button
                  type="button"
                  onClick={() => setSel(i)}
                  aria-current={active ? "true" : undefined}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                    active ? "border-ink bg-ink text-white" : "border-line bg-paper text-ink hover:border-ink-muted"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="font-display text-[18px]">{p.problem.label}</span>
                    <span className={`text-[12.5px] ${active ? "text-white/75" : "text-ink-muted"}`}>
                      {p.slips.length === 0 ? "held" : `${p.slips.length} didn't hold`}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    {session.stars.includes(p.problem.id) && <span aria-label="starred">★</span>}
                    {p.lines.some((l) => l.standout) && <span className={`h-2 w-2 rounded-full ${active ? "bg-white" : "bg-standout"}`} aria-hidden />}
                    {p.slips.length > 0 && <span className={`h-2 w-2 rounded-full ${active ? "bg-white/60" : "bg-wrong"}`} aria-hidden />}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="mt-5 space-y-1.5 text-[12px] text-ink-muted">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-wrong" aria-hidden /> a step that didn't hold
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-standout" aria-hidden /> {kind === "strong" ? "a step worth noticing" : "a harder step that held"}
          </div>
        </div>
        <div className="mt-auto pt-6">
          <Button size="lg" className="w-full" onClick={() => dispatch({ type: "goto", stage: "rework" })}>
            Rework on your own →
          </Button>
          <p className="mt-2 text-center text-[11.5px] text-ink-muted">Then a short group review.</p>
        </div>
      </aside>

      <section className="flex min-h-0 flex-col overflow-y-auto px-8 py-7">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-display text-[26px] text-ink">{cur.problem.label}</span>
              <DifficultyTag d={cur.problem.difficulty} />
            </div>
            <p className="mt-1.5 text-[13.5px] text-ink-soft">{cur.problem.stem}</p>
          </div>
          <div className="math-lg text-ink">
            <M tex={cur.problem.tex} />
          </div>
        </div>

        <ol className="mt-5 space-y-2">
          {cur.lines.map((l, i) => {
            const v = l.verdict;
            const wrong = v.verdict === "wrong";
            const tone = wrong
              ? "border-wrong-line bg-wrong-soft"
              : l.standout
                ? "border-standout-line bg-standout-soft"
                : "border-line bg-paper";
            return (
              <li key={i} className={`rounded-xl border px-4 py-3 ${tone}`}>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[17px] text-ink">
                    <M tex={l.tex} />
                  </span>
                  {v.verdict !== "unclear" && (
                    <span className="flex shrink-0 items-center gap-2 text-[12px] text-ink-muted">
                      {v.label}
                      <SubskillChip id={v.subskill} />
                    </span>
                  )}
                </div>
                {wrong && v.verdict === "wrong" && <p className="mt-1.5 text-[13px] leading-snug text-wrong">{v.note}</p>}
                {l.standout && <p className="mt-1.5 text-[13px] leading-snug text-standout">{l.standout}</p>}
                {v.verdict === "ok" && v.builtOn && !l.standout && (
                  <p className="mt-1.5 text-[12.5px] leading-snug text-ink-muted">Right move. This step is sound, it's just built on the line above.</p>
                )}
              </li>
            );
          })}
          {cur.lines.length === 0 && <li className="rounded-xl border border-dashed border-line-strong px-4 py-3 text-[13px] text-ink-muted">No working was read for this one.</li>}
        </ol>

        {cur.clue ? (
          <Card tone="soft" className="mt-5 p-5">
            <Eyebrow>Detective work</Eyebrow>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink">{cur.clue}</p>
            <p className="mt-2 text-[12.5px] text-ink-muted">
              That's the pattern, not the place. When you rework this one you'll see only this clue, so the finding is yours.
            </p>
          </Card>
        ) : (
          cur.clean && (
            <Card className="mt-5 flex items-center justify-between gap-6 p-5">
              <div>
                <div className="text-[15px] font-medium text-ink">Every step held.</div>
                <p className="mt-1 text-[13px] leading-snug text-ink-soft">
                  Right but not sure why, or got there by feel? Star it and it goes on your report as one to come back to.
                  {cur.problem.prereqs.length > 0 && ` It leaned on ${cur.problem.prereqs.map((id) => SUBSKILL_MAP[id].short.toLowerCase()).join(" and ")}.`}
                </p>
              </div>
              <Button variant={starred ? "accent" : "secondary"} className="whitespace-nowrap" onClick={() => dispatch({ type: "star/toggle", problem: cur.problem.id })} aria-pressed={starred}>
                {starred ? "★ Starred" : "☆ Star this one"}
              </Button>
            </Card>
          )
        )}
      </section>
    </div>
  );
}
