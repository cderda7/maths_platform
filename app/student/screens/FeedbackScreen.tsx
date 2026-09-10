"use client";

import { useState } from "react";
import M from "@/components/Math";
import type { Stroke } from "@/data/types";
import PadSection from "@/components/PadSection";
import ReadAs from "@/components/ReadAs";
import { Button, Card, Eyebrow } from "@/components/ui";
import StarButton from "@/components/StarButton";
import { LeafChip } from "@/components/Tag";
import { RECOGNITION_REWORK } from "@/data/recognition";
import { useAssignment } from "@/lib/classroom-store";
import { branchesOf } from "@/lib/branches";
import { feedbackSummary } from "@/lib/feedback";
import { GUARD_TEXT, guardFor, trippedProblems } from "@/lib/guard";
import { nextLine } from "@/lib/recognition";
import type { SessionAction, StudentSession } from "@/lib/session";

/**
 * Individual review: detective feedback after handing in, and the place to correct it. One
 * conversational sentence (how many problems contain a mistake, which subskills to double-check);
 * for the chosen problem, what was submitted (no marks of any kind), a pad, and the lines read
 * from it. Corrections are the rework version. The one signal in the whole flow: a correction that
 * breaks a problem whose first attempt was correct gets a banner the moment the line is read, with
 * a way back, and hand-in waits until it is restored or cleared. The star is the student's own marker.
 */
export default function FeedbackScreen({ session, dispatch }: { session: StudentSession; dispatch: (a: SessionAction) => void }) {
  const problems = useAssignment().problems;
  const summary = feedbackSummary(session, "original", problems);
  const [sel, setSel] = useState(0);
  const cur = problems[Math.min(sel, problems.length - 1)];
  const lines = session.lines[cur.id] ?? [];
  const starred = session.stars.includes(cur.id);
  const rework = session.rework[cur.id] ?? [];
  const strokes = session.reworkInk[cur.id] ?? [];
  const guard = guardFor(session, cur.id);
  const tripped = trippedProblems(session).filter((id) => problems.some((q) => q.id === id));
  const [recognising, setRecognising] = useState(false);
  const addStroke = (next: Stroke[]) => dispatch({ type: "rework/stroke", problem: cur.id, stroke: next[next.length - 1] });
  const onBurstEnd = (strokeCount: number) => {
    setRecognising(false);
    const line = nextLine(RECOGNITION_REWORK[cur.id] ?? [], session.rework[cur.id] ?? [], strokeCount);
    if (line) dispatch({ type: "rework/reveal", problem: cur.id, line });
  };
  const undo = () => {
    setRecognising(false);
    dispatch({ type: "rework/undo", problem: cur.id });
  };
  const clear = () => {
    setRecognising(false);
    dispatch({ type: "rework/clear", problem: cur.id });
  };
  const choose = (i: number) => {
    setRecognising(false);
    setSel(i);
  };

  return (
    <div className="grid h-full min-h-0 grid-cols-[300px_1fr]">
      <aside className="flex min-h-0 flex-col border-r border-line px-7 py-7">
        <Eyebrow>Handed in</Eyebrow>
        <h1 className="font-display mt-2 text-[28px] leading-tight text-ink">How it held up</h1>
        <Card tone="soft" className="mt-4 p-4" data-summary>
          <p className="text-[15px] leading-relaxed text-ink">{summary.head}</p>
          {summary.hint.length > 0 && (
            <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[15px] leading-relaxed text-ink" data-hint>
              <span>Double-check</span>
              {summary.hint.map((id) => (
                <LeafChip student key={id} id={id} className="!border-accent-deep !bg-accent-deep !text-white" />
              ))}
            </p>
          )}
        </Card>
        <ol className="mt-5 min-h-0 flex-1 space-y-2 overflow-y-auto pb-1">
          {problems.map((p, i) => {
            const active = i === sel;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => choose(i)}
                  aria-current={active ? "true" : undefined}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                    active ? "border-ink bg-ink text-white" : "border-line bg-paper text-ink hover:border-ink-muted"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="font-display text-[18px]">{p.label}</span>
                    <span className={`text-[12.5px] ${active ? "text-white/75" : "text-ink-muted"}`}>{(session.lines[p.id]?.length ?? 0) === 0 ? "not attempted" : `${session.lines[p.id].length} lines`}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    {tripped.includes(p.id) && <span className="h-2.5 w-2.5 rounded-full bg-wrong" aria-label="broken" data-broken />}
                    {session.stars.includes(p.id) && <span aria-label="starred">★</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="flex shrink-0 flex-col items-stretch gap-1.5 border-t border-line pt-4">
          {tripped.length > 0 && (
            <span className="text-center text-[12px] text-wrong" data-blocked>
              Restore {tripped.map((id) => problems.find((q) => q.id === id)?.label ?? id).join(", ")} first
            </span>
          )}
          <Button size="lg" variant="accent" className="w-full" disabled={tripped.length > 0} onClick={() => dispatch({ type: "rework/done" })} data-done>
            Hand in
          </Button>
        </div>
      </aside>

      <section className="flex min-h-0 flex-col px-7 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-4">
              <span className="font-display text-[26px] text-ink">{cur.label}</span>
              <span className="math-lg text-ink">
                <M tex={cur.tex} />
              </span>
            </div>
            <p className="mt-1 text-[13.5px] text-ink-soft">{cur.stem}</p>
          </div>
          <StarButton on={starred} onToggle={() => dispatch({ type: "star/toggle", problem: cur.id })} />
        </div>

        <div className="mt-4 grid min-h-0 flex-1 grid-cols-[220px_1fr_230px] gap-3">
          <div className="flex min-h-0 flex-col overflow-y-auto">
            <Eyebrow>What you submitted</Eyebrow>
            <ol className="mt-3 space-y-2" data-lines>
              {lines.map((l, i) => {
                const branches = branchesOf(l.tex);
                const box = "rounded-xl border border-line bg-paper px-3 py-2.5 text-[15px] text-ink";
                return branches.length === 2 ? (
                  <li key={i} className="grid grid-cols-2 gap-2" data-branches>
                    {branches.map((b, j) => (
                      <span key={j} className={`${box} min-w-0 overflow-x-auto`}>
                        <M tex={b} />
                      </span>
                    ))}
                  </li>
                ) : (
                  <li key={i} className={box}>
                    <M tex={l.tex} />
                  </li>
                );
              })}
              {lines.length === 0 && <li className="rounded-xl border border-dashed border-line-strong px-3 py-3 text-[13px] text-ink-muted">Not attempted</li>}
            </ol>
            {guard.tripped && (
              <Card className="mt-3 border-wrong-line bg-wrong-soft p-3.5" data-guard>
                <p className="text-[13px] leading-snug text-ink">{GUARD_TEXT}</p>
                <Button variant="secondary" className="mt-2.5 w-full" onClick={clear} data-restore>
                  Restore my original
                </Button>
              </Card>
            )}
          </div>

          <PadSection title="If needed, correct it here" padded={false} strokes={strokes} onStrokesChange={addStroke} onBurstEnd={onBurstEnd} onPenDown={() => setRecognising(true)} onUndo={undo} onClear={clear} />

          <ReadAs lines={rework} recognising={recognising} empty="Corrected lines appear here as you write." />
        </div>
      </section>
    </div>
  );
}
