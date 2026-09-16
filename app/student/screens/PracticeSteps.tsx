"use client";

import { useState, type ReactNode } from "react";
import Figure from "@/components/Figure";
import HelpChat from "@/components/HelpChat";
import HelpMenu, { StallNotice } from "@/components/HelpMenu";
import { HintCards, useHints } from "@/components/HintCards";
import M from "@/components/Math";
import PadSection from "@/components/PadSection";
import PracticeCard from "@/components/PracticeCard";
import { MisconceptionChip } from "@/components/Tag";
import { Button, Eyebrow } from "@/components/ui";
import { useEscape } from "@/components/useEscape";
import type { PracticeProblem, Problem, Stroke } from "@/data/types";
import { hintOpener, TALK_OPENER } from "@/lib/helpChat";
import { pickHint, stalledHint, termTex } from "@/lib/hint";
import { completionScript, completionState, completionWorking, type BlankState, type LineMark } from "@/lib/ladder";
import { nextLine } from "@/lib/recognition";
import type { PracticeRun, RunKey, SessionAction } from "@/lib/session";
import StemWords from "@/components/StemWords";

/**
 * The three steps' screens, shared by help on a set question (ticket 312: Q*, Q**, back on Q) and the warm-up (ticket 313:
 * each skill's practice problem worked, its completion problem, its follow-up alone). Step 1 is `WorkedStep`, step 2
 * `CompletionStep`; the caller gives the left column's head (where the student is and how they got here), the right
 * column's footer (the ways on) and what shows once a step is through. The run (`overlayRun` or the warm-up) holds the
 * lines, hints and chat, so a reload lands where the student was.
 */

/** A question as the left column shows it: the stem, the expression set large, the figure. */
export type StepQuestion = Pick<Problem, "stem" | "tex" | "figure">;

/** Where in the three steps the student is: each step named, the current one dark. */
export function StepLine({ names, at }: { names: readonly [string, string, string]; at: 1 | 2 | 3 }) {
  return (
    <ol className="mt-2 flex items-center gap-1.5 text-[12px]" data-ladder-steps>
      {names.map((n, i) => (
        <li key={n} className="flex items-center gap-1.5 whitespace-nowrap" aria-current={i + 1 === at ? "step" : undefined}>
          {i > 0 && <span className="text-ink-muted" aria-hidden>›</span>}
          <span className={i + 1 === at ? "font-semibold text-ink" : "text-ink-muted"}>
            {i + 1} {n}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** The title row under the step line: the step's name and "not marked". */
export function StepTitle({ title }: { title: string }) {
  return (
    <div className="mt-5 flex items-center justify-between">
      <span className="font-display text-[26px] text-ink">{title}</span>
      <span className="text-[12px] uppercase tracking-wide text-ink-muted">not marked</span>
    </div>
  );
}

/** The worked example once more, in the pad's place until "Back to your turn": a look, not a step, and not saved. Its question shows only when its working does not open on it. */
export function ExamplePeek({ worked, onBack }: { worked: PracticeProblem; onBack: () => void }) {
  return (
    <section className="flex min-h-0 flex-col overflow-y-auto px-6 py-6" data-example data-peek>
      <Eyebrow>Worked example</Eyebrow>
      <div className="mt-3">
        {/* The left column is the student's own problem: a first line that is the example's equation itself already says the example's question. */}
        <PracticeCard practice={worked} shown={worked.steps.length} question={worked.steps[0]?.tex.replace(/\s+/g, "") !== worked.tex.replace(/\s+/g, "")} />
      </div>
      <div className="mt-6 flex justify-end">
        <Button size="lg" onClick={onBack} data-peek-back>
          Back to your turn
        </Button>
      </div>
    </section>
  );
}

/**
 * Step 1: the question on the left under the caller's head, its worked example step by step in the middle (every step at
 * once when opened again, or once seen), and the chat beside it, silent until the student writes. `next` ("Your turn")
 * shows once every step has been seen.
 */
export function WorkedStep({
  head,
  question,
  practice,
  run,
  runKey,
  again = false,
  next,
  dispatch,
  footer,
}: {
  head: ReactNode;
  question: StepQuestion;
  practice: PracticeProblem;
  run: PracticeRun;
  runKey: RunKey;
  again?: boolean;
  next: ReactNode;
  dispatch: (a: SessionAction) => void;
  footer: ReactNode;
}) {
  const p = practice;
  const seen = run.exampled.includes(p.id);
  // A worked example already seen in full (a skill come back to) shows whole, as it does opened again.
  const shown = again || seen ? p.steps.length : run.exampleShown;
  return (
    <div className="grid h-full min-h-0 grid-cols-[300px_1fr_320px]" data-run={runKey} data-ladder-worked>
      <aside className="flex min-h-0 flex-col overflow-y-auto border-r border-line px-7 py-6">
        {head}
        <p className="mt-3 text-[14px] text-ink-soft"><StemWords stem={question.stem} /></p>
        <div className="math-lg mt-3 text-ink">
          <M tex={question.tex} display />
        </div>
        {question.figure && (
          <div className="mt-3">
            <Figure id={question.figure} />
          </div>
        )}
      </aside>
      <section className="relative flex min-h-0 flex-col" data-example>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 pb-24">
          <Eyebrow>Worked example</Eyebrow>
          <div className="mt-3">
            <PracticeCard practice={p} shown={shown} question={false} onReveal={() => dispatch({ type: "run/example-step", run: runKey })} />
          </div>
        </div>
        {/* Pinned to the corner, not below the last step: a long example that needs a scroll must never hide the way on. */}
        {seen && !again && <div className="absolute bottom-4 right-4 z-10">{next}</div>}
      </section>
      <aside className="flex min-h-0 flex-col border-l border-line px-6 py-6">
        {/* Beside the worked example the column is the chat, headed "Question about a step?"; the tutor says nothing until the student writes. */}
        <HelpChat key={p.id} problem={p} lines={[]} messages={run.chat[p.id] ?? []} hinted={[]} runKey={runKey} dispatch={dispatch} exampleShown={shown} className="flex-1" />
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-line pt-4">{footer}</div>
      </aside>
    </div>
  );
}

/**
 * Step 2: the question on the left under the caller's head, with its hints and "I need help" (hint, see the example again,
 * chat); the pad in the middle; and the working on the right: the given lines up to the blank being written, that blank,
 * and nothing after it (so no later line gives it away). Each line the pad reads is marked against the blank
 * (`completionState`): right moves on, wrong is red in place with its misconception chip where known, and after two wrong
 * lines the blank fills in. Nothing else happens on a wrong line: the chat opens only when the student presses it. `done`
 * shows under the working once every blank is in.
 */
export function CompletionStep({
  head,
  question,
  practice,
  blanks,
  worked,
  run,
  runKey,
  dispatch,
  footer,
  done,
  next,
}: {
  head: ReactNode;
  question: StepQuestion;
  /** The completion problem as the pad's helpers read it: its working as `steps`, its hints, the skill named. */
  practice: PracticeProblem;
  blanks: readonly number[];
  /** Step 1's worked example, for "see the example again". */
  worked: PracticeProblem;
  run: PracticeRun;
  runKey: RunKey;
  dispatch: (a: SessionAction) => void;
  footer: ReactNode;
  /** The message shown once every blank is in; no button (the way on, if any, is `next`). */
  done: ReactNode;
  /** The way on once every blank is in, pinned to the pad's corner rather than the end of the working list. Omitted where the way on is only the footer's "Back to Qn" (the help ladder). */
  next?: ReactNode;
}) {
  const p = practice;
  const lines = run.lines[p.id] ?? [];
  const strokes = run.ink[p.id] ?? [];
  const state = completionState(p.steps, blanks, lines);
  const working = completionWorking(p.steps, state);
  const shownHints = run.hinted[p.id] ?? [];
  const h = useHints(p, shownHints, working.length);
  const nextHint = pickHint(p, working, shownHints) !== null;
  const stalled = stalledHint(p, working, shownHints) !== null;
  const [recognising, setRecognising] = useState(false);
  const [menu, setMenu] = useState<"closed" | "menu" | "stall">("closed");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatAsks, setChatAsks] = useState(0);
  /** "see the example again": step 1's worked example takes the pad's place until "Back to your turn". A look, not a step. */
  const [peek, setPeek] = useState(false);
  useEscape(chatOpen, () => setChatOpen(false));
  useEscape(peek, () => setPeek(false));
  const chat = run.chat[p.id] ?? [];
  const openChat = () => {
    setChatOpen(true);
    setChatAsks((n) => n + 1);
  };
  const talkHint = (text: string) => {
    setMenu("closed");
    const last = chat[chat.length - 1];
    if (!(last?.from === "tutor" && last.text === text)) dispatch({ type: "run/chat", run: runKey, problem: p.id, message: { from: "tutor", text } });
    openChat();
  };
  const addStroke = (next: Stroke[]) => dispatch({ type: "run/stroke", run: runKey, problem: p.id, stroke: next[next.length - 1] });
  const onBurstEnd = (strokeCount: number) => {
    setRecognising(false);
    const line = nextLine(completionScript(p, blanks), lines, strokeCount);
    if (line) dispatch({ type: "run/reveal", run: runKey, problem: p.id, line });
  };
  /** The on-screen working as the chat reads it: every line shown, the student's own as written. */
  const onScreen = p.steps.slice(0, state.shown).flatMap((st, i) => {
    const b = state.blanks.find((x) => x.step === i);
    return b ? b.written.map((w) => w.tex).concat(b.status === "filled" ? [st.tex] : []) : [st.tex];
  });

  return (
    <div className="grid h-full min-h-0 grid-cols-[300px_1fr_320px]" data-run={runKey} data-ladder-completion>
      <aside className="flex min-h-0 flex-col overflow-y-auto border-r border-line px-7 py-6">
        {head}
        <p className="mt-3 text-[14px] text-ink-soft"><StemWords stem={question.stem} /></p>
        <div className="math-lg mt-3 text-ink">
          <M tex={termTex(question.tex, h.termsAt(0), h.litAt(0))} display />
        </div>
        {question.figure && (
          <div className="mt-3">
            <Figure id={question.figure} />
          </div>
        )}
        <p className="mt-3 text-[13px] leading-snug text-ink-soft">Some lines are written for you. Write the missing ones.</p>
        <HintCards p={p} h={h} lineWord="line" onTalk={() => talkHint(TALK_OPENER)} />
        <div className="mt-5">
          <Button variant="deep" className="w-full" onClick={() => setMenu("menu")} data-need-help>
            I need help
          </Button>
        </div>
      </aside>

      <div className="relative flex min-h-0 flex-col">
        {peek ? (
          <ExamplePeek worked={worked} onBack={() => setPeek(false)} />
        ) : (
          <PadSection
            strokes={strokes}
            onStrokesChange={addStroke}
            onBurstEnd={onBurstEnd}
            onPenDown={() => setRecognising(true)}
            onUndo={() => {
              setRecognising(false);
              dispatch({ type: "run/undo", run: runKey, problem: p.id });
            }}
            onClear={() => {
              setRecognising(false);
              dispatch({ type: "run/clear", run: runKey, problem: p.id });
            }}
          />
        )}
        {/* Pinned to the corner once every blank is in, not at the end of the working list (which may need a scroll to reach). */}
        {state.done && !peek && next && <div className="absolute bottom-4 right-4 z-10">{next}</div>}
      </div>

      <aside className="flex min-h-0 flex-col border-l border-line px-6 py-6">
        <Eyebrow>Working</Eyebrow>
        <ol className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto" data-working>
          {p.steps.slice(0, state.shown).map((st, i) => {
            const b = state.blanks.find((x) => x.step === i);
            const decorate = (tex: string) => termTex(tex, h.termsAt(i + 1), h.litAt(i + 1));
            const lit = h.litAnchor === i + 1;
            return b ? <BlankRow key={i} blank={b} expected={st.tex} current={state.current === i} recognising={recognising} decorate={decorate} lit={lit} /> : <GivenRow key={i} tex={decorate(st.tex)} lit={lit} />;
          })}
          {state.done && (
            <li className="px-1 pt-1 text-[13px] text-ink-soft" data-working-done>
              {done}
            </li>
          )}
        </ol>
        {chatOpen && <HelpChat key={p.id} problem={p} lines={onScreen} messages={chat} hinted={shownHints} runKey={runKey} dispatch={dispatch} asked={chatAsks} onClose={() => setChatOpen(false)} className="mt-5 max-h-[42%] shrink-0 border-t border-line pt-4" />}
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-line pt-4">{footer}</div>
      </aside>

      {menu === "menu" && (
        <HelpMenu
          options={[
            { key: "hint", title: "hint", onPick: nextHint || stalled ? () => (stalled ? setMenu("stall") : (setMenu("closed"), dispatch({ type: "run/hint", run: runKey }))) : undefined },
            {
              key: "example",
              title: "see the example again",
              onPick: () => {
                setMenu("closed");
                setPeek(true);
              },
            },
            {
              key: "chat",
              title: "chat",
              onPick: () => {
                setMenu("closed");
                openChat();
              },
            },
          ]}
          onClose={() => setMenu("closed")}
        />
      )}
      {menu === "stall" && <StallNotice onTalk={() => talkHint(hintOpener(h.hints.length))} onClose={() => setMenu("closed")} />}
    </div>
  );
}

const ROW = "rounded-xl border px-3.5 py-2.5 text-[16px] text-ink transition-colors";

/** A line of the working written for the student. */
function GivenRow({ tex, lit }: { tex: string; lit: boolean }) {
  return (
    <li className={`${ROW} ${lit ? "border-standout-line bg-standout-soft" : "border-line bg-paper"}`} data-given data-highlight={lit || undefined}>
      <M tex={tex} />
    </li>
  );
}

/** How a written line looks, by its mark: the one table the screen reads, beside `MARK_RULES` in `lib/ladder.ts`. */
const MARK_LOOK: Record<LineMark["kind"], string> = {
  right: "border-line border-l-[3px] border-l-secure bg-paper",
  wrong: "border-wrong-line bg-wrong-soft",
  unreadable: "border-dashed border-line-strong bg-paper",
};

/** A blank: each line written into it, marked; the blank still open as a dashed slot; filled in after two wrong lines. */
function BlankRow({ blank, expected, current, recognising, decorate, lit }: { blank: BlankState; expected: string; current: boolean; recognising: boolean; decorate: (tex: string) => string; lit: boolean }) {
  return (
    <li className="space-y-2" data-blank={blank.status}>
      {blank.written.map((w) => (
        <div key={w.index} className={`${ROW} ${MARK_LOOK[w.mark.kind]}`} data-mark={w.mark.kind}>
          <M tex={w.mark.kind === "right" ? decorate(w.tex) : w.tex} />
          {w.mark.kind === "wrong" && w.mark.misconception && (
            <div className="mt-1.5">
              <MisconceptionChip id={w.mark.misconception} />
            </div>
          )}
          {w.mark.kind === "unreadable" && <div className="mt-1 text-[12.5px] text-ink-muted">Couldn&rsquo;t read this line. Try writing it again.</div>}
        </div>
      ))}
      {blank.status === "filled" && (
        <div className={`${ROW} ${lit ? "border-standout-line bg-standout-soft" : "border-line bg-paper"}`} data-filled>
          <M tex={decorate(expected)} />
          <div className="mt-1 text-[12.5px] text-ink-muted">Filled in for you.</div>
        </div>
      )}
      {current &&
        (recognising ? (
          <div className="shimmer h-11 rounded-xl" aria-label="Recognising" />
        ) : (
          <div className={`rounded-xl border border-dashed px-3.5 py-3 text-[12.5px] leading-snug ${lit ? "border-standout-line bg-standout-soft text-standout" : "border-line-strong text-ink-muted"}`} data-slot>
            Write this line on the pad.
          </div>
        ))}
    </li>
  );
}
