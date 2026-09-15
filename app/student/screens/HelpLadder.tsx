"use client";

import { useState } from "react";
import Figure from "@/components/Figure";
import HelpChat from "@/components/HelpChat";
import HelpMenu, { StallNotice } from "@/components/HelpMenu";
import { HintCards, useHints } from "@/components/HintCards";
import M from "@/components/Math";
import PadSection from "@/components/PadSection";
import PracticeCard from "@/components/PracticeCard";
import { LeafChip, MisconceptionChip } from "@/components/Tag";
import { Button, Eyebrow } from "@/components/ui";
import { useEscape } from "@/components/useEscape";
import type { LeafId } from "@/data/taxonomy";
import type { Problem, Stroke } from "@/data/types";
import { hintOpener, TALK_OPENER } from "@/lib/helpChat";
import { pickHint, stalledHint, termTex } from "@/lib/hint";
import { asPractice, completionScript, completionState, completionWorking, ladderFor, type BlankState, type LineMark } from "@/lib/ladder";
import { nextLine } from "@/lib/recognition";
import type { SessionAction, StudentSession } from "@/lib/session";

/**
 * Help on a set question in three steps (ticket 312), over the working screen: Q* worked (step 1), Q** with the named
 * skill's lines blank for the student to write (step 2), then back on Q (the working screen itself, step 3). Q*'s worked
 * example also opens again from back on Q. "Back to Qn" is at every step and leaves the student's own lines on Q as they
 * were; Escape is the same. The session holds the step, so a reload lands on it.
 */
export default function HelpLadder({ session, problem, dispatch }: { session: StudentSession; problem: Problem; dispatch: (a: SessionAction) => void }) {
  const view = session.ladder;
  const leaf = session.overlay;
  const back = () => dispatch({ type: "overlay/done", at: Date.now() });
  // Escape is "Back to Qn" (ticket 247); a help card open over the step closes first.
  useEscape(!!view && !!leaf, back);
  const ladder = view && leaf ? ladderFor(view.problem, leaf) : null;
  if (!view || !leaf || !ladder) return null;
  const backButton = (
    <Button size="lg" variant="accent" onClick={back} data-done className="whitespace-nowrap">
      Back to {problem.label} →
    </Button>
  );
  return (
    <div className="absolute inset-0 z-20 bg-cream" data-overlay data-ladder={view.step}>
      {view.step === "completion" ? (
        <CompletionStep session={session} leaf={leaf} problem={problem} ladder={ladder} dispatch={dispatch} footer={backButton} />
      ) : (
        <WorkedStep session={session} leaf={leaf} problem={problem} worked={ladder.worked} again={view.step === "again"} dispatch={dispatch} footer={backButton} />
      )}
    </div>
  );
}

/** Where in the three steps the student is, above the question: Example, Your turn, back on Qn. */
function Steps({ at, problem }: { at: 1 | 2 | 3; problem: Problem }) {
  const names = ["Example", "Your turn", problem.label];
  return (
    <ol className="mt-2 flex items-center gap-1.5 text-[12px]" data-ladder-steps>
      {names.map((n, i) => (
        <li key={n} className="flex items-center gap-1.5" aria-current={i + 1 === at ? "step" : undefined}>
          {i > 0 && <span className="text-ink-muted" aria-hidden>›</span>}
          <span className={i + 1 === at ? "font-semibold text-ink" : "text-ink-muted"}>
            {i + 1} {n}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** The left column's head on either step: which question the help is for, the steps, the title and the skill (on Q**; beside Q* the worked example's card names it). */
function Head({ problem, at, title, leaf }: { problem: Problem; at: 1 | 2; title: string; leaf?: LeafId }) {
  return (
    <>
      <Eyebrow>Help with {problem.label}</Eyebrow>
      <Steps at={at} problem={problem} />
      <div className="mt-5 flex items-center justify-between">
        <span className="font-display text-[26px] text-ink">{title}</span>
        <span className="text-[12px] uppercase tracking-wide text-ink-muted">not marked</span>
      </div>
      {leaf && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          <LeafChip student id={leaf} />
        </div>
      )}
    </>
  );
}

/** Step 1: Q*'s whole question, its worked example step by step in the middle (every step at once when opened again), and the chat beside it. */
function WorkedStep({ session, leaf, problem, worked, again, dispatch, footer }: { session: StudentSession; leaf: LeafId; problem: Problem; worked: Problem; again: boolean; dispatch: (a: SessionAction) => void; footer: React.ReactNode }) {
  const p = asPractice(worked, leaf);
  const run = session.overlayRun;
  const shown = again ? p.steps.length : run.exampleShown;
  const seen = run.exampled.includes(p.id);
  return (
    <div className="grid h-full min-h-0 grid-cols-[300px_1fr_320px]" data-run="overlay" data-ladder-worked>
      <aside className="flex min-h-0 flex-col overflow-y-auto border-r border-line px-7 py-6">
        <Head problem={problem} at={1} title="Example" />
        <p className="mt-3 text-[14px] text-ink-soft">{worked.stem}</p>
        <div className="math-lg mt-3 text-ink">
          <M tex={worked.tex} display />
        </div>
        {worked.figure && (
          <div className="mt-3">
            <Figure id={worked.figure} />
          </div>
        )}
      </aside>
      <section className="flex min-h-0 flex-col overflow-y-auto px-6 py-6" data-example>
        <Eyebrow>Worked example</Eyebrow>
        <div className="mt-3">
          <PracticeCard practice={p} shown={shown} question={false} onReveal={() => dispatch({ type: "run/example-step", run: "overlay" })} />
        </div>
        {seen && !again && (
          <div className="mt-6 flex justify-end">
            <Button size="lg" onClick={() => dispatch({ type: "ladder/next", at: Date.now() })} data-ladder-next>
              Your turn →
            </Button>
          </div>
        )}
      </section>
      <aside className="flex min-h-0 flex-col border-l border-line px-6 py-6">
        {/* Beside the worked example the column is the chat, headed "Question about a step?"; the tutor says nothing until the student writes. */}
        <HelpChat key={p.id} problem={p} lines={[]} messages={run.chat[p.id] ?? []} hinted={[]} runKey="overlay" dispatch={dispatch} exampleShown={shown} className="flex-1" />
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-line pt-4">{footer}</div>
      </aside>
    </div>
  );
}

/**
 * Step 2: Q**'s whole question on the left with its hints, the pad in the middle, and the working on the right: the given
 * lines up to the blank being written, that blank, and nothing after it (so no later line gives it away). Each line the pad
 * reads is marked against the blank (`completionState`): right moves on, wrong is red in place with its misconception chip
 * where known, and after two wrong lines the blank fills in. Nothing else happens on a wrong line: the chat opens only when
 * the student presses it.
 */
function CompletionStep({
  session,
  leaf,
  problem,
  ladder,
  dispatch,
  footer,
}: {
  session: StudentSession;
  leaf: LeafId;
  problem: Problem;
  ladder: NonNullable<ReturnType<typeof ladderFor>>;
  dispatch: (a: SessionAction) => void;
  footer: React.ReactNode;
}) {
  const q = ladder.completion;
  const p = asPractice(q, leaf);
  const run = session.overlayRun;
  const lines = run.lines[q.id] ?? [];
  const strokes = run.ink[q.id] ?? [];
  const state = completionState(q.solution, ladder.blanks, lines);
  const working = completionWorking(q.solution, state);
  const shownHints = run.hinted[q.id] ?? [];
  const h = useHints(p, shownHints, working.length);
  const nextHint = pickHint(p, working, shownHints) !== null;
  const stalled = stalledHint(p, working, shownHints) !== null;
  const [recognising, setRecognising] = useState(false);
  const [menu, setMenu] = useState<"closed" | "menu" | "stall">("closed");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatAsks, setChatAsks] = useState(0);
  /** "see the example again" on Q**: Q*'s worked example takes the pad's place until "Back to your turn". A look, not a step. */
  const [peek, setPeek] = useState(false);
  useEscape(chatOpen, () => setChatOpen(false));
  useEscape(peek, () => setPeek(false));
  const chat = run.chat[q.id] ?? [];
  const openChat = () => {
    setChatOpen(true);
    setChatAsks((n) => n + 1);
  };
  const talkHint = (text: string) => {
    setMenu("closed");
    const last = chat[chat.length - 1];
    if (!(last?.from === "tutor" && last.text === text)) dispatch({ type: "run/chat", run: "overlay", problem: q.id, message: { from: "tutor", text } });
    openChat();
  };
  const addStroke = (next: Stroke[]) => dispatch({ type: "run/stroke", run: "overlay", problem: q.id, stroke: next[next.length - 1] });
  const onBurstEnd = (strokeCount: number) => {
    setRecognising(false);
    const line = nextLine(completionScript(q, ladder.blanks), lines, strokeCount);
    if (line) dispatch({ type: "run/reveal", run: "overlay", problem: q.id, line });
  };
  /** The on-screen working as the chat reads it: every line shown, the student's own as written. */
  const onScreen = q.solution.slice(0, state.shown).flatMap((st, i) => {
    const b = state.blanks.find((x) => x.step === i);
    return b ? b.written.map((w) => w.tex).concat(b.status === "filled" ? [st.tex] : []) : [st.tex];
  });
  const worked = asPractice(ladder.worked, leaf);

  return (
    <div className="grid h-full min-h-0 grid-cols-[300px_1fr_320px]" data-run="overlay" data-ladder-completion>
      <aside className="flex min-h-0 flex-col overflow-y-auto border-r border-line px-7 py-6">
        <Head problem={problem} at={2} title="Your turn" leaf={leaf} />
        <p className="mt-3 text-[14px] text-ink-soft">{q.stem}</p>
        <div className="math-lg mt-3 text-ink">
          <M tex={termTex(q.tex, h.termsAt(0), h.litAt(0))} display />
        </div>
        {q.figure && (
          <div className="mt-3">
            <Figure id={q.figure} />
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

      {peek ? (
        <section className="flex min-h-0 flex-col overflow-y-auto px-6 py-6" data-example data-peek>
          <Eyebrow>Worked example</Eyebrow>
          <div className="mt-3">
            {/* Q*'s question is named here only when its working does not open on it: the left column is Q**'s, and a first line that is the equation itself already says it. */}
            <PracticeCard practice={worked} shown={worked.steps.length} question={worked.steps[0]?.tex.replace(/\s+/g, "") !== worked.tex.replace(/\s+/g, "")} />
          </div>
          <div className="mt-6 flex justify-end">
            <Button size="lg" onClick={() => setPeek(false)}>
              Back to your turn
            </Button>
          </div>
        </section>
      ) : (
        <PadSection
          strokes={strokes}
          onStrokesChange={addStroke}
          onBurstEnd={onBurstEnd}
          onPenDown={() => setRecognising(true)}
          onUndo={() => {
            setRecognising(false);
            dispatch({ type: "run/undo", run: "overlay", problem: q.id });
          }}
          onClear={() => {
            setRecognising(false);
            dispatch({ type: "run/clear", run: "overlay", problem: q.id });
          }}
        />
      )}

      <aside className="flex min-h-0 flex-col border-l border-line px-6 py-6">
        <Eyebrow>Working</Eyebrow>
        <ol className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto" data-working>
          {q.solution.slice(0, state.shown).map((st, i) => {
            const b = state.blanks.find((x) => x.step === i);
            const decorate = (tex: string) => termTex(tex, h.termsAt(i + 1), h.litAt(i + 1));
            const lit = h.litAnchor === i + 1;
            return b ? <BlankRow key={i} blank={b} expected={st.tex} current={state.current === i} recognising={recognising} decorate={decorate} lit={lit} /> : <GivenRow key={i} tex={decorate(st.tex)} lit={lit} />;
          })}
          {state.done && (
            <li className="px-1 pt-1 text-[13px] text-ink-soft" data-working-done>
              That&rsquo;s every line. On to {problem.label} when you&rsquo;re ready.
            </li>
          )}
        </ol>
        {chatOpen && <HelpChat key={q.id} problem={p} lines={onScreen} messages={chat} hinted={shownHints} runKey="overlay" dispatch={dispatch} asked={chatAsks} onClose={() => setChatOpen(false)} className="mt-5 max-h-[42%] shrink-0 border-t border-line pt-4" />}
        <div className="mt-4 flex items-center justify-end gap-2 border-t border-line pt-4">{footer}</div>
      </aside>

      {menu === "menu" && (
        <HelpMenu
          options={[
            { key: "hint", title: "hint", onPick: nextHint || stalled ? () => (stalled ? setMenu("stall") : (setMenu("closed"), dispatch({ type: "run/hint", run: "overlay" }))) : undefined },
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

/** A line of Q** written for the student. */
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

/** A blank of Q**: each line written into it, marked; the blank still open as a dashed slot; filled in after two wrong lines. */
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
