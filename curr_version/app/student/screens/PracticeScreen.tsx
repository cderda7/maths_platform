"use client";

import { useState } from "react";
import M from "@/components/Math";
import type { Stroke } from "@/data/types";
import PadSection from "@/components/PadSection";
import PracticeCard from "@/components/PracticeCard";
import ReadAs from "@/components/ReadAs";
import { Button, Card, Eyebrow } from "@/components/ui";
import { LeafChip } from "@/components/Tag";
import { nextLine } from "@/lib/recognition";
import { warmupFocus, warmupProblem, warmupStep, type SessionAction, type StudentSession } from "@/lib/session";
import { warmupScript, warmupSequence } from "@/lib/warmup";
import { Scrim } from "./PracticePrompt";

/**
 * The warm-up, on the pad: the working screen's own layout with one unmarked problem. "I need help"
 * offers a hint, a worked example or a video. The worked example plays where the pad was; once it
 * is complete a follow-up problem opens beside it, the example staying in view on the left.
 */
export default function PracticeScreen({ session, dispatch }: { session: StudentSession; dispatch: (a: SessionAction) => void }) {
  const w = session.warmup;
  const sequence = warmupSequence(warmupFocus(session));
  const first = warmupStep(session);
  const p = warmupProblem(session);
  const lastStep = w.step >= sequence.length - 1;
  const second = w.problem === "second";
  const lines = w.lines[p.id] ?? [];
  const strokes = w.ink[p.id] ?? [];
  const [recognising, setRecognising] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const hinted = w.hinted.includes(p.id);
  const exampled = w.exampled.includes(p.id);

  const addStroke = (next: Stroke[]) => dispatch({ type: "warmup/stroke", problem: p.id, stroke: next[next.length - 1] });
  const onBurstEnd = (strokeCount: number) => {
    setRecognising(false);
    const line = nextLine(warmupScript(p), w.lines[p.id] ?? [], strokeCount);
    if (line) dispatch({ type: "warmup/reveal", problem: p.id, line });
  };
  const undo = () => {
    setRecognising(false);
    dispatch({ type: "warmup/undo", problem: p.id });
  };
  const clear = () => {
    setRecognising(false);
    dispatch({ type: "warmup/clear", problem: p.id });
  };
  const skip = () => dispatch({ type: "practice/finish" });
  /** Finishes this skill: the next one, or the set after the last. */
  const done = () => dispatch({ type: "warmup/skill-done" });
  const doneLabel = lastStep ? "On to the set" : "Next skill →";

  return (
    <div className={`grid h-full min-h-0 ${second ? "grid-cols-[400px_1fr_300px]" : "grid-cols-[300px_1fr_320px]"}`} data-warmup={w.problem}>
      <aside className="flex min-h-0 flex-col overflow-y-auto border-r border-line px-7 py-6">
        {second && (
          <div className="mb-6 border-b border-line pb-6" data-worked-example>
            <Eyebrow>Worked example</Eyebrow>
            <div className="mt-3">
              <PracticeCard practice={first} shown={first.steps.length} compact />
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="font-display text-[26px] text-ink">{second ? "One more" : "Warm-up"}</span>
          <span className="text-[12px] uppercase tracking-wide text-ink-muted">not marked</span>
        </div>
        {!second && (
          <div className="mt-3 flex flex-wrap justify-center gap-1.5" data-sequence>
            {sequence.map((q, i) => {
              const state = i < w.step ? "done" : i === w.step ? "current" : "todo";
              return (
                <LeafChip
                  key={q.id}
                  id={q.leaf}
                  data-state={state}
                  className={state === "current" ? "!border-standout !bg-standout !text-white" : "!border-standout-line !bg-standout-soft !text-standout"}
                  after={state === "done" ? <span aria-label="done" className="font-semibold">✓</span> : undefined}
                />
              );
            })}
          </div>
        )}
        <p className="mt-3 text-[14px] text-ink-soft">{p.stem}</p>
        <div className="math-lg mt-3 text-ink">
          <M tex={p.tex} display />
        </div>
        {second && (
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            <LeafChip id={p.leaf} />
          </div>
        )}
        {hinted && (
          <Card tone="soft" className="mt-5 p-4" data-hint>
            <Eyebrow>Hint</Eyebrow>
            <p className="mt-1.5 text-[14px] leading-snug text-ink">{p.hint}</p>
          </Card>
        )}
        <div className="mt-auto pt-6">
          <Button variant="secondary" className="w-full" onClick={() => setHelpOpen(true)} disabled={w.example}>
            I need help
          </Button>
        </div>
      </aside>

      {w.example ? (
        <section className="flex min-h-0 flex-col overflow-y-auto px-6 py-6" data-example>
          <div className="flex items-center justify-between">
            <Eyebrow>Worked example</Eyebrow>
            <span className="text-[12.5px] text-ink-muted">Guess the next step before you show it</span>
          </div>
          <div className="mt-3">
            <PracticeCard practice={p} shown={w.exampleShown} onReveal={() => dispatch({ type: "warmup/example-step" })} />
          </div>
          {exampled && (
            <div className="mt-6 flex justify-end">
              {!second && first.followUp ? (
                <Button size="lg" onClick={() => dispatch({ type: "warmup/next" })}>
                  Try one more →
                </Button>
              ) : (
                <Button size="lg" variant="accent" onClick={done}>
                  {doneLabel}
                </Button>
              )}
            </div>
          )}
        </section>
      ) : (
        <PadSection strokes={strokes} onStrokesChange={addStroke} onBurstEnd={onBurstEnd} onPenDown={() => setRecognising(true)} onUndo={undo} onClear={clear} />
      )}

      <aside className="flex min-h-0 flex-col border-l border-line px-6 py-6">
        <ReadAs lines={lines} recognising={recognising} empty="Lines appear here as you write." className="flex-1" />
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-line pt-4">
          {!lastStep && (
            <Button variant="ghost" onClick={skip}>
              Skip to the set
            </Button>
          )}
          <Button variant="accent" onClick={done} data-done>
            {doneLabel}
          </Button>
        </div>
      </aside>

      {helpOpen && (
        <HelpMenu
          hinted={hinted}
          exampled={exampled}
          onHint={() => {
            setHelpOpen(false);
            dispatch({ type: "warmup/hint" });
          }}
          onExample={() => {
            setHelpOpen(false);
            dispatch({ type: "warmup/example" });
          }}
          onClose={() => setHelpOpen(false)}
        />
      )}
    </div>
  );
}

/** "I need help" on the warm-up: pick how much help. The video is listed so the shape is visible; it goes nowhere yet. */
function HelpMenu({ hinted, exampled, onHint, onExample, onClose }: { hinted: boolean; exampled: boolean; onHint: () => void; onExample: () => void; onClose: () => void }) {
  const options: { key: string; title: string; onPick?: () => void; note?: string }[] = [
    { key: "hint", title: "hint", onPick: hinted ? undefined : onHint, note: hinted ? "Shown" : undefined },
    { key: "example", title: "worked example", onPick: exampled ? undefined : onExample, note: exampled ? "Seen" : undefined },
    { key: "video", title: "video", note: "Not available yet" },
  ];
  const row = "relative block w-full rounded-xl border border-line bg-paper px-4 py-3 text-center";
  return (
    <Scrim onDismiss={onClose}>
      <div className="w-[480px] rounded-3xl bg-paper p-8 shadow-lift" data-help-menu>
        <h2 className="font-display text-[28px] leading-tight text-ink">I&rsquo;d like a…</h2>
        <ul className="mt-5 space-y-2">
          {options.map((o) =>
            o.key === "video" ? (
              <li key={o.key}>
                <a href="#" aria-disabled onClick={(e) => e.preventDefault()} className={`${row} opacity-60`} data-help-option={o.key}>
                  <span className="text-[15px] font-medium text-ink">{o.title}</span>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-ink-muted">{o.note}</span>
                </a>
              </li>
            ) : (
              <li key={o.key}>
                <button type="button" onClick={o.onPick} disabled={!o.onPick} className={`${row} transition-colors enabled:hover:border-ink-muted disabled:opacity-60`} data-help-option={o.key}>
                  <span className="text-[15px] font-medium text-ink">{o.title}</span>
                  <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[13px] ${o.onPick ? "text-accent-deep" : "text-ink-muted"}`}>{o.note ?? "Show →"}</span>
                </button>
              </li>
            ),
          )}
        </ul>
      </div>
    </Scrim>
  );
}
