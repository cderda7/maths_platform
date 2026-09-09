"use client";

import { useState, type ReactNode } from "react";
import HintCard from "@/components/HintCard";
import M from "@/components/Math";
import type { HintTerm, PracticeProblem, Stroke } from "@/data/types";
import PadSection from "@/components/PadSection";
import PracticeCard from "@/components/PracticeCard";
import ReadAs from "@/components/ReadAs";
import { Button, Eyebrow } from "@/components/ui";
import { LeafChip } from "@/components/Tag";
import { termTex } from "@/lib/hint";
import { nextLine } from "@/lib/recognition";
import type { PracticeRun, RunKey, SessionAction } from "@/lib/session";
import { warmupScript } from "@/lib/warmup";
import { Scrim } from "@/app/student/screens/PracticePrompt";

/**
 * Practice on the pad, for the warm-up and the mid-set isolated practice alike: the working
 * screen's own layout with one unmarked problem. "I need help" offers a hint, a worked example or a
 * video. The worked example plays where the pad was; once it is complete a follow-up opens beside
 * it, the example staying in view on the left. `header` sits above the problem (the warm-up's chip
 * strip, the overlay's skill name); `footer` is the right column's buttons; `finished` is the
 * button after a worked example with no follow-up left.
 */
export default function PracticePad({
  run,
  runKey,
  first,
  dispatch,
  title,
  header,
  footer,
  finished,
}: {
  run: PracticeRun;
  runKey: RunKey;
  first: PracticeProblem;
  dispatch: (a: SessionAction) => void;
  title: string;
  header?: ReactNode;
  footer: ReactNode;
  finished: ReactNode;
}) {
  const second = run.problem === "second" && !!first.followUp;
  const p = second ? first.followUp! : first;
  const lines = run.lines[p.id] ?? [];
  const strokes = run.ink[p.id] ?? [];
  const [recognising, setRecognising] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const hinted = run.hinted.includes(p.id);
  const exampled = run.exampled.includes(p.id);
  /** The hint word under the pointer; lights its fragments of the problem while it stays there. */
  const [lit, setLit] = useState<HintTerm | null>(null);
  const litTerm = hinted ? p.hintTerms?.find((t) => t.phrase === lit?.phrase) : undefined;

  const addStroke = (next: Stroke[]) => dispatch({ type: "run/stroke", run: runKey, problem: p.id, stroke: next[next.length - 1] });
  const onBurstEnd = (strokeCount: number) => {
    setRecognising(false);
    const line = nextLine(warmupScript(p), run.lines[p.id] ?? [], strokeCount);
    if (line) dispatch({ type: "run/reveal", run: runKey, problem: p.id, line });
  };
  const undo = () => {
    setRecognising(false);
    dispatch({ type: "run/undo", run: runKey, problem: p.id });
  };
  const clear = () => {
    setRecognising(false);
    dispatch({ type: "run/clear", run: runKey, problem: p.id });
  };

  return (
    <div className={`grid h-full min-h-0 ${second ? "grid-cols-[400px_1fr_300px]" : "grid-cols-[300px_1fr_320px]"}`} data-run={runKey} data-warmup={run.problem}>
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
          <span className="font-display text-[26px] text-ink">{second ? "One more" : title}</span>
          <span className="text-[12px] uppercase tracking-wide text-ink-muted">not marked</span>
        </div>
        {!second && header}
        <p className="mt-3 text-[14px] text-ink-soft">{p.stem}</p>
        <div className="math-lg mt-3 text-ink">
          <M tex={termTex(p.tex, p.hintTerms, litTerm)} display />
        </div>
        {second && (
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            <LeafChip id={p.leaf} />
          </div>
        )}
        {hinted && <HintCard problem={p} lit={litTerm ?? null} onLit={setLit} className="mt-5" />}
        <div className="mt-auto pt-6">
          <Button variant="secondary" className="w-full" onClick={() => setHelpOpen(true)} disabled={run.example}>
            I need help
          </Button>
        </div>
      </aside>

      {run.example ? (
        <section className="flex min-h-0 flex-col overflow-y-auto px-6 py-6" data-example>
          <div className="flex items-center justify-between">
            <Eyebrow>Worked example</Eyebrow>
            <span className="text-[12.5px] text-ink-muted">Guess the next step before you show it</span>
          </div>
          <div className="mt-3">
            <PracticeCard practice={p} shown={run.exampleShown} onReveal={() => dispatch({ type: "run/example-step", run: runKey })} />
          </div>
          {exampled && (
            <div className="mt-6 flex justify-end">
              {!second && first.followUp ? (
                <Button size="lg" onClick={() => dispatch({ type: "run/next", run: runKey })}>
                  Try one more →
                </Button>
              ) : (
                finished
              )}
            </div>
          )}
        </section>
      ) : (
        <PadSection strokes={strokes} onStrokesChange={addStroke} onBurstEnd={onBurstEnd} onPenDown={() => setRecognising(true)} onUndo={undo} onClear={clear} />
      )}

      <aside className="flex min-h-0 flex-col border-l border-line px-6 py-6">
        <ReadAs lines={lines} recognising={recognising} empty="Lines appear here as you write." className="flex-1" />
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-line pt-4">{footer}</div>
      </aside>

      {helpOpen && (
        <HelpMenu
          hinted={hinted}
          exampled={exampled}
          onHint={() => {
            setHelpOpen(false);
            dispatch({ type: "run/hint", run: runKey });
          }}
          onExample={() => {
            setHelpOpen(false);
            dispatch({ type: "run/example", run: runKey });
          }}
          onClose={() => setHelpOpen(false)}
        />
      )}
    </div>
  );
}

/** "I need help" on the pad: pick how much help. The video is listed so the shape is visible; it goes nowhere yet. */
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
