"use client";

import { useState } from "react";
import M from "@/components/Math";
import type { Stroke } from "@/data/types";
import PadSection from "@/components/PadSection";
import ReadAs from "@/components/ReadAs";
import { Button, Card, Eyebrow } from "@/components/ui";
import { DifficultyTag } from "@/components/Tag";
import { RECOGNITION_REWORK } from "@/data/recognition";
import { feedbackFor } from "@/lib/feedback";
import { useAssignment } from "@/lib/classroom-store";
import { nextLine } from "@/lib/recognition";
import type { SessionAction, StudentSession } from "@/lib/session";

/**
 * Independent rework, before any group step. The student sees the detective-work clue and their
 * first attempt with no highlights of any kind, and reworks on the pad. The first attempt is
 * preserved; the rework becomes a second version.
 */
export default function ReworkScreen({ session, dispatch }: { session: StudentSession; dispatch: (a: SessionAction) => void }) {
  const ids = useAssignment().problems.map((p) => p.id);
  const fb = feedbackFor(session).filter((p) => ids.includes(p.problem.id));
  const todo = fb.filter((p) => p.slips.length > 0);
  const held = fb.filter((p) => p.slips.length === 0);
  const i = Math.min(session.reworkIndex, todo.length - 1);
  const cur = todo[i];
  const p = cur.problem;
  const lines = session.rework[p.id] ?? [];
  const [recognising, setRecognising] = useState(false);
  const strokes = session.reworkInk[p.id] ?? [];
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
        <div className="flex items-center justify-between">
          <span className="font-display text-[26px] text-ink">{p.label}</span>
          <DifficultyTag d={p.difficulty} />
        </div>
        <div className="math-lg mt-2 text-ink">
          <M tex={p.tex} display />
        </div>

        <Card tone="soft" className="mt-4 p-4">
          <Eyebrow>Detective work</Eyebrow>
          <p className="mt-1.5 text-[13.5px] leading-snug text-ink">{cur.clue}</p>
        </Card>

        <Eyebrow className="mt-5">First attempt</Eyebrow>
        <ol className="mt-2 space-y-1.5" data-original>
          {cur.lines.map((l, n) => (
            <li key={n} className="rounded-lg border border-line bg-paper/70 px-3 py-1.5 text-[14px] text-ink-soft">
              <M tex={l.tex} />
            </li>
          ))}
        </ol>

        <div className="mt-auto pt-5">
          <Eyebrow>To rework</Eyebrow>
          <ol className="mt-2.5 flex gap-1.5">
            {todo.map((q, n) => {
              const active = n === i;
              const started = (session.rework[q.problem.id]?.length ?? 0) > 0;
              return (
                <li key={q.problem.id}>
                  <button
                    type="button"
                    onClick={() => go(n)}
                    aria-current={active ? "step" : undefined}
                    className={`h-9 w-11 rounded-lg border text-[13px] font-medium transition-colors ${
                      active ? "border-ink bg-ink text-white" : started ? "border-accent-line bg-accent-soft text-accent-deep" : "border-line bg-paper text-ink-soft hover:border-ink-muted"
                    }`}
                  >
                    {q.problem.label}
                  </button>
                </li>
              );
            })}
            {held.map((q) => (
              <li key={q.problem.id} className="grid h-9 w-11 place-items-center rounded-lg border border-dashed border-line text-[13px] text-ink-muted" title="Held">
                {q.problem.label}
              </li>
            ))}
          </ol>
        </div>
      </aside>

      <PadSection title="Reworked" strokes={strokes} onStrokesChange={addStroke} onBurstEnd={onBurstEnd} onPenDown={() => setRecognising(true)} onUndo={undo} onClear={clear} />

      <aside className="flex min-h-0 flex-col border-l border-line px-6 py-6">
        <ReadAs lines={lines} recognising={recognising} empty="Reworked lines appear here." className="flex-1" />
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-4">
          <Button variant="ghost" onClick={() => go(i - 1)} className={i === 0 ? "invisible" : ""}>
            ← {todo[i - 1]?.problem.label ?? ""}
          </Button>
          {i < todo.length - 1 ? (
            <Button onClick={() => go(i + 1)}>Next: {todo[i + 1].problem.label} →</Button>
          ) : (
            <Button variant="accent" onClick={() => dispatch({ type: "rework/done" })}>
              Done
            </Button>
          )}
        </div>
      </aside>
    </div>
  );
}
