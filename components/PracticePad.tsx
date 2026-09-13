"use client";

import { useState, type ReactNode } from "react";
import HelpChat from "@/components/HelpChat";
import HintCard from "@/components/HintCard";
import M from "@/components/Math";
import type { HintTerm, PracticeProblem, Stroke } from "@/data/types";
import PadSection from "@/components/PadSection";
import PracticeCard from "@/components/PracticeCard";
import ReadAs from "@/components/ReadAs";
import { Button, Eyebrow } from "@/components/ui";
import { LeafChip } from "@/components/Tag";
import { hintOpener, TALK_OPENER } from "@/lib/helpChat";
import { hintAnchor, pickHint, stalledHint, termTex } from "@/lib/hint";
import { nextLine } from "@/lib/recognition";
import type { PracticeRun, RunKey, SessionAction } from "@/lib/session";
import { warmupScript } from "@/lib/warmup";
import { Scrim } from "@/app/student/screens/PracticePrompt";

/**
 * Practice on the pad, for the warm-up and the mid-set isolated practice alike: the working
 * screen's own layout with one unmarked problem. "I need help" offers a hint, a worked example, a
 * video or a chat. The worked example plays where the pad was; once it is complete a follow-up opens
 * beside it, the example staying in view on the left. The chat takes the right column in place of
 * the read-back until closed; while the example plays the column is the chat, headed "Question
 * about a step?", since there is no read-back. `header` sits above the problem (the warm-up's chip
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
  /** The help overlay: the "I'd like a…" menu, or the notice shown when "hint" is pressed while the previous hint is still to be acted on. */
  const [help, setHelp] = useState<"closed" | "menu" | "stall">("closed");
  const setHelpOpen = (open: boolean) => setHelp(open ? "menu" : "closed");
  const [chatOpen, setChatOpen] = useState(false);
  /** The hints shown so far, in the order they were given (each picked for where the lines were); their terms together are what the problem wraps. */
  const shown = run.hinted[p.id] ?? [];
  const hints = shown.map((i) => p.hints[i]).filter((h) => h !== undefined);
  const terms = hints.flatMap((h) => h.terms ?? []);
  const nextHint = pickHint(p, lines.map((l) => l.tex), shown) !== null;
  /** The latest hint, while the lines have not moved past what it asks for: "hint" then shows the stall notice, which leads into the chat on it. */
  const stalled = stalledHint(p, lines.map((l) => l.tex), shown) !== null;
  /** Per shown hint, what its linked words point at: 0 the problem, k the student's k-th read line. The problem and each line wrap only the terms anchored to them. */
  const anchors = hints.map((h) => hintAnchor(h, lines.length));
  const termsAt = (k: number) => hints.flatMap((h, i) => (anchors[i] === k ? (h.terms ?? []) : []));
  /** Earlier hints (every one but the latest) collapse to a line; these are the ones the student has opened back up. */
  const [reopened, setReopened] = useState<number[]>([]);
  const toggle = (i: number) => setReopened((r) => (r.includes(i) ? r.filter((x) => x !== i) : [...r, i]));
  const exampled = run.exampled.includes(p.id);
  const chat = run.chat[p.id] ?? [];
  /** The hint word under the pointer; lights its fragments of the problem while it stays there. */
  const [lit, setLit] = useState<HintTerm | null>(null);
  const litTerm = lit && terms.includes(lit) ? lit : undefined;
  const litAnchor = litTerm ? anchors[hints.findIndex((h) => h.terms?.includes(litTerm))] : 0;
  /** The lit term is passed only to the piece its hint points at: the same fragment on another line (an earlier hint's x/4) stays unlit. */
  const litAt = (k: number) => (litTerm && litAnchor === k ? litTerm : undefined);

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
  /**
   * Opens the chat on the latest hint, with the tutor's line about it said by the pad and stored, once: a second press
   * the same way adds nothing. From the stall notice (another hint was asked for) the line says why there is no new one
   * yet (`hintOpener`); from the card's "Talk it through" it is only the question (`TALK_OPENER`).
   */
  const talkHint = (text: string) => {
    setHelpOpen(false);
    const last = chat[chat.length - 1];
    if (!(last?.from === "tutor" && last.text === text)) dispatch({ type: "run/chat", run: runKey, problem: p.id, message: { from: "tutor", text } });
    setChatOpen(true);
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
          <M tex={termTex(p.tex, termsAt(0), litAt(0))} display />
        </div>
        {second && (
          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            <LeafChip student id={p.leaf} />
          </div>
        )}
        {hints.map((h, i) => (
          <HintCard
            key={shown[i]}
            hint={h}
            label={p.hints.length > 1 ? `Hint ${i + 1}` : "Hint"}
            note={anchors[i] > 0 ? `your line ${anchors[i]}` : undefined}
            lit={litTerm ?? null}
            onLit={setLit}
            collapsed={i < hints.length - 1 && !reopened.includes(shown[i])}
            onToggle={i < hints.length - 1 ? () => toggle(shown[i]) : undefined}
            onTalk={i === hints.length - 1 && !run.example ? () => talkHint(TALK_OPENER) : undefined}
            className={i === 0 ? "mt-5" : "mt-2"}
          />
        ))}
        {/* While the worked example plays the help is on screen already, so the button goes, not greys. */}
        {!run.example && (
          <div className="mt-5">
            <Button variant="deep" className="w-full" onClick={() => setHelpOpen(true)}>
              I need help
            </Button>
          </div>
        )}
      </aside>

      {run.example ? (
        <section className="flex min-h-0 flex-col overflow-y-auto px-6 py-6" data-example>
          <Eyebrow>Worked example</Eyebrow>
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
        {run.example ? (
          // Beside the worked example there is nothing to read back, so the column is the chat, headed "Question about a step?".
          <HelpChat key={p.id} problem={p} lines={lines.map((l) => l.tex)} messages={chat} hinted={shown} runKey={runKey} dispatch={dispatch} exampleShown={run.exampleShown} className="flex-1" />
        ) : (
          <>
            {/* The student's read lines keep the column while the chat is open: the chat sits under them, only as tall as it needs up to about the bottom third, and scrolls past that. */}
            <ReadAs
              lines={lines}
              recognising={recognising}
              empty="Lines appear here as you write."
              decorate={(tex, i) => termTex(tex, termsAt(i + 1), litAt(i + 1))}
              highlight={litAnchor > 0 ? litAnchor - 1 : undefined}
              className="flex-1"
            />
            {chatOpen && (
              <HelpChat
                key={p.id}
                problem={p}
                lines={lines.map((l) => l.tex)}
                messages={chat}
                hinted={shown}
                runKey={runKey}
                dispatch={dispatch}
                onClose={() => setChatOpen(false)}
                className="mt-5 max-h-[42%] shrink-0 border-t border-line pt-4"
              />
            )}
          </>
        )}
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-line pt-4">{footer}</div>
      </aside>

      {help === "menu" && (
        <HelpMenu
          hints={{ next: nextHint, stalled }}
          exampled={exampled}
          onChat={() => {
            setHelpOpen(false);
            setChatOpen(true);
          }}
          onHint={() => {
            // "hint" while the previous one is still to be acted on: the notice, which leads into the chat on it.
            if (stalled) return setHelp("stall");
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
      {help === "stall" && <StallNotice onTalk={() => talkHint(hintOpener(hints.length))} onClose={() => setHelpOpen(false)} />}
    </div>
  );
}

/** "hint" pressed while the previous hint is still to be acted on (ticket 86's stall): one sentence and the one way on, the same chat the hint card's "Talk it through" opens. */
function StallNotice({ onTalk, onClose }: { onTalk: () => void; onClose: () => void }) {
  return (
    <Scrim onDismiss={onClose}>
      <div className="w-[300px] rounded-3xl bg-paper p-7 shadow-lift" data-stall-notice>
        <p className="font-display text-[22px] leading-snug text-ink">Let&rsquo;s talk through the previous hint before giving you another.</p>
        <button type="button" onClick={onTalk} className="mt-5 inline-flex items-center rounded-full border border-accent-deep bg-paper px-6 py-2.5 text-[15px] font-medium text-ink transition-colors hover:bg-accent-soft" data-stall-talk>
          Talk it through
        </button>
      </div>
    </Scrim>
  );
}

/** "I need help" on the pad: pick how much help. Four bare pills, one word each, no side notes. Hints come one per ask, each picked for where the student's lines have got (`next` says one is available), the row always reading "hint"; while the latest hint is `stalled` (the lines have not moved past what it asks for) the row stays live and the caller shows the stall notice instead of a hint. A seen worked example greys its row. The video is listed so the shape is visible; it goes nowhere yet. The chat can always be reopened. */
function HelpMenu({
  hints,
  exampled,
  onHint,
  onExample,
  onChat,
  onClose,
}: {
  hints: { next: boolean; stalled: boolean };
  exampled: boolean;
  onHint: () => void;
  onExample: () => void;
  onChat: () => void;
  onClose: () => void;
}) {
  const options: { key: string; title: string; onPick?: () => void }[] = [
    { key: "hint", title: "hint", onPick: hints.next || hints.stalled ? onHint : undefined },
    { key: "example", title: "worked example", onPick: exampled ? undefined : onExample },
    { key: "video", title: "video" },
    { key: "chat", title: "chat", onPick: onChat },
  ];
  const pill = "block w-full rounded-full border border-accent-deep bg-paper px-6 py-2.5 text-center text-[15px] font-medium text-ink";
  return (
    <Scrim onDismiss={onClose}>
      <div className="w-fit min-w-[248px] rounded-3xl bg-paper p-7 shadow-lift" data-help-menu>
        <h2 className="font-display text-[28px] leading-tight text-ink">I&rsquo;d like a…</h2>
        {/* A fit-width grid: every pill is the width of the widest one ("worked example"), no wider. */}
        <ul className="mt-5 grid w-fit gap-2">
          {options.map((o) =>
            o.key === "video" ? (
              <li key={o.key}>
                <a href="#" aria-disabled onClick={(e) => e.preventDefault()} className={`${pill} opacity-40`} data-help-option={o.key}>
                  {o.title}
                </a>
              </li>
            ) : (
              <li key={o.key}>
                <button type="button" onClick={o.onPick} disabled={!o.onPick} className={`${pill} transition-colors enabled:hover:bg-accent-soft disabled:opacity-40`} data-help-option={o.key}>
                  {o.title}
                </button>
              </li>
            ),
          )}
        </ul>
      </div>
    </Scrim>
  );
}
