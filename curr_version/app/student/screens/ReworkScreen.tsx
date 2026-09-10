"use client";

import { useState } from "react";
import M from "@/components/Math";
import type { Stroke } from "@/data/types";
import PadSection from "@/components/PadSection";
import ReadAs from "@/components/ReadAs";
import { Button, Card, Eyebrow } from "@/components/ui";
import { RECOGNITION_REWORK } from "@/data/recognition";
import { useAssignment } from "@/lib/classroom-store";
import { GUARD_TEXT, guardFor, trippedProblems } from "@/lib/guard";
import { nextLine } from "@/lib/recognition";
import type { SessionAction, StudentSession } from "@/lib/session";

/**
 * Independent rework. Every problem is open, correct ones included; the first attempt sits
 * beside the pad with no marks. The one signal in the whole flow: a rework that breaks a problem
 * whose first attempt was correct gets a banner the moment the line is read, with a way back, and
 * hand-in waits until it is restored or cleared.
 */
export default function ReworkScreen({ session, dispatch }: { session: StudentSession; dispatch: (a: SessionAction) => void }) {
  const problems = useAssignment().problems;
  const i = Math.min(session.reworkIndex, problems.length - 1);
  const p = problems[i];
  const original = session.lines[p.id] ?? [];
  const lines = session.rework[p.id] ?? [];
  const strokes = session.reworkInk[p.id] ?? [];
  const [recognising, setRecognising] = useState(false);
  const guard = guardFor(session, p.id);
  const tripped = trippedProblems(session).filter((id) => problems.some((q) => q.id === id));
  const addStroke = (next: Stroke[]) => dispatch({ type: "rework/stroke", problem: p.id, stroke: next[next.length - 1] });

  const onBurstEnd = (strokeCount: number) => {
    setRecognising(false);
    const line = nextLine(RECOGNITION_REWORK[p.id] ?? [], session.rework[p.id] ?? [], strokeCount);
    if (line) dispatch({ type: "rework/reveal", problem: p.id, line });
  };
  const undo = () => {
    setRecognising(false);
    dispatch({ type: "rework/undo", problem: p.id });
  };
  const clear = () => {
    setRecognising(false);
    dispatch({ type: "rework/clear", problem: p.id });
  };
  const go = (n: number) => {
    setRecognising(false);
    dispatch({ type: "rework/goto", index: n });
  };

  return (
    <div className="grid h-full min-h-0 grid-cols-[320px_1fr_300px]">
      <aside className="flex min-h-0 flex-col overflow-y-auto border-r border-line px-7 py-6">
        <span className="font-display text-[26px] text-ink">{p.label}</span>
        <div className="math-lg mt-2 text-ink">
          <M tex={p.tex} display />
        </div>

        <Eyebrow className="mt-5">First attempt</Eyebrow>
        <ol className="mt-2 space-y-1.5" data-original>
          {original.map((l, n) => (
            <li key={n} className="rounded-lg border border-line bg-paper/70 px-3 py-1.5 text-[14px] text-ink-soft">
              <M tex={l.tex} />
            </li>
          ))}
          {original.length === 0 && <li className="rounded-lg border border-dashed border-line-strong px-3 py-1.5 text-[12.5px] text-ink-muted">Not attempted</li>}
        </ol>

        {guard.tripped && (
          <Card className="mt-4 border-wrong-line bg-wrong-soft p-4" data-guard>
            <p className="text-[13.5px] leading-snug text-ink">{GUARD_TEXT}</p>
            <Button variant="secondary" className="mt-3 w-full" onClick={clear} data-restore>
              Restore my original
            </Button>
          </Card>
        )}

        <div className="mt-auto pt-5">
          <Eyebrow>Problems</Eyebrow>
          <ol className="mt-2.5 flex flex-wrap gap-1.5">
            {problems.map((q, n) => {
              const active = n === i;
              const started = (session.rework[q.id]?.length ?? 0) > 0;
              const broken = tripped.includes(q.id);
              return (
                <li key={q.id}>
                  <button
                    type="button"
                    onClick={() => go(n)}
                    aria-current={active ? "step" : undefined}
                    data-broken={broken ? "true" : undefined}
                    className={`relative h-9 w-10 rounded-lg border text-[13px] font-medium transition-colors ${
                      active ? "border-ink bg-ink text-white" : started ? "border-accent-line bg-accent-soft text-accent-deep" : "border-line bg-paper text-ink-soft hover:border-ink-muted"
                    }`}
                  >
                    {q.label}
                    {broken && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-paper bg-wrong" aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </aside>

      <PadSection title="Reworked" strokes={strokes} onStrokesChange={addStroke} onBurstEnd={onBurstEnd} onPenDown={() => setRecognising(true)} onUndo={undo} onClear={clear} />

      <aside className="flex min-h-0 flex-col border-l border-line px-6 py-6">
        <ReadAs lines={lines} recognising={recognising} empty="Reworked lines appear here." className="flex-1" />
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-4">
          <Button variant="ghost" onClick={() => go(i - 1)} className={i === 0 ? "invisible" : ""}>
            ← {problems[i - 1]?.label ?? ""}
          </Button>
          {i < problems.length - 1 ? (
            <Button onClick={() => go(i + 1)}>Next: {problems[i + 1].label} →</Button>
          ) : (
            <div className="flex flex-col items-end gap-1.5">
              {tripped.length > 0 && (
                <span className="text-[12px] text-wrong" data-blocked>
                  Restore {tripped.map((id) => problems.find((q) => q.id === id)?.label ?? id).join(", ")} first
                </span>
              )}
              <Button variant="accent" disabled={tripped.length > 0} onClick={() => dispatch({ type: "rework/done" })} data-done>
                Hand in
              </Button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
