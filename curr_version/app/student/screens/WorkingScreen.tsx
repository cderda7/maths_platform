"use client";

import { useState } from "react";
import M from "@/components/Math";
import type { Stroke } from "@/data/types";
import PadSection from "@/components/PadSection";
import ReadAs from "@/components/ReadAs";
import { Button, Eyebrow } from "@/components/ui";
import Figure from "@/components/Figure";
import { DifficultyTag, LeafChip } from "@/components/Tag";
import { problemLeaves } from "@/lib/hierarchy";
import { RECOGNITION } from "@/data/recognition";
import { useAssignment } from "@/lib/classroom-store";
import { nextLine } from "@/lib/recognition";
import { HelpPicker, PracticeOverlay, PromptModal } from "./PracticePrompt";
import type { SessionAction, StudentSession } from "@/lib/session";

/**
 * The working screen: problem on the left, the drawpad in the middle, and the transcription
 * column on the right that fills in one line per burst of strokes. Strokes and recognised lines
 * both live in the session, so undo and clear move them together and the ink survives a reload.
 */
export default function WorkingScreen({ session, dispatch }: { session: StudentSession; dispatch: (a: SessionAction) => void }) {
  const problems = useAssignment().problems;
  const p = problems[Math.min(session.problemIndex, problems.length - 1)];
  const lines = session.lines[p.id] ?? [];
  const [recognising, setRecognising] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const strokes = session.ink[p.id] ?? [];
  const addStroke = (next: Stroke[]) => dispatch({ type: "ink/stroke", problem: p.id, stroke: next[next.length - 1] });

  const onBurstEnd = (strokeCount: number) => {
    setRecognising(false);
    const line = nextLine(RECOGNITION[p.id] ?? [], session.lines[p.id] ?? [], strokeCount);
    if (line) dispatch({ type: "line/reveal", problem: p.id, line });
  };
  const undo = () => {
    setRecognising(false);
    dispatch({ type: "lines/undo", problem: p.id });
  };
  const clear = () => {
    setRecognising(false);
    dispatch({ type: "lines/clear", problem: p.id });
  };
  const go = (i: number) => {
    setRecognising(false);
    dispatch({ type: "problem/goto", index: i });
  };

  return (
    <div className="grid h-full min-h-0 grid-cols-[300px_1fr_320px]">
      <aside className="flex min-h-0 flex-col overflow-y-auto border-r border-line px-7 py-6">
        <div className="flex items-center justify-between">
          <span className="font-display text-[26px] text-ink">{p.label}</span>
          <DifficultyTag d={p.difficulty} />
        </div>
        <p className="mt-3 text-[14px] text-ink-soft">{p.stem}</p>
        <div className="math-lg mt-3 text-ink">
          <M tex={p.tex} display />
        </div>
        {p.figure && (
          <div className="mt-3">
            <Figure id={p.figure} />
          </div>
        )}
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {problemLeaves(p).map((id) => (
            <LeafChip student key={id} id={id} />
          ))}
        </div>
        <div className="mt-auto pt-6">
          <Button variant="secondary" className="mb-6 w-full" onClick={() => setHelpOpen(true)}>
            I need help
          </Button>
          <Eyebrow>Problems</Eyebrow>
          <ol className="mt-2.5 flex flex-wrap gap-1.5">
            {problems.map((q, i) => {
              const active = i === session.problemIndex;
              const started = (session.lines[q.id]?.length ?? 0) > 0;
              return (
                <li key={q.id}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={active ? "step" : undefined}
                    className={`h-9 w-10 rounded-lg border text-[13px] font-medium transition-colors ${
                      active ? "border-ink bg-ink text-white" : started ? "border-accent-line bg-accent-soft text-accent-deep" : "border-line bg-paper text-ink-soft hover:border-ink-muted"
                    }`}
                  >
                    {q.label}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </aside>

      <PadSection strokes={strokes} onStrokesChange={addStroke} onBurstEnd={onBurstEnd} onPenDown={() => setRecognising(true)} onUndo={undo} onClear={clear} />

      <aside className="flex min-h-0 flex-col border-l border-line px-6 py-6">
        <ReadAs lines={lines} recognising={recognising} empty="Lines appear here as you write." className="flex-1" />
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-4">
          <Button variant="ghost" onClick={() => go(session.problemIndex - 1)} className={session.problemIndex === 0 ? "invisible" : ""}>
            ← {problems[session.problemIndex - 1]?.label ?? ""}
          </Button>
          {session.problemIndex < problems.length - 1 ? (
            <Button onClick={() => go(session.problemIndex + 1)}>Next: {problems[session.problemIndex + 1].label} →</Button>
          ) : (
            <Button variant="accent" onClick={() => dispatch({ type: "hand-in" })}>
              Hand in
            </Button>
          )}
        </div>
      </aside>

      {helpOpen && (
        <HelpPicker
          problem={p}
          onClose={() => setHelpOpen(false)}
          onPick={(subskill) => {
            setHelpOpen(false);
            dispatch({ type: "help/request", leaf: subskill, problem: p.id });
          }}
        />
      )}
      {session.prompt && !helpOpen && (
        <PromptModal
          prompt={session.prompt}
          problem={p}
          onAccept={() => dispatch({ type: "prompt/accept", problem: p.id })}
          onDecline={() => dispatch({ type: "prompt/decline", problem: p.id })}
        />
      )}
      {session.overlay && <PracticeOverlay session={session} problem={p} dispatch={dispatch} />}
    </div>
  );
}
