"use client";

import { useState } from "react";
import HelpChat from "@/components/HelpChat";
import { StallNotice } from "@/components/HelpMenu";
import { HintCards, useHints } from "@/components/HintCards";
import M from "@/components/Math";
import { useEscape } from "@/components/useEscape";
import type { Stroke } from "@/data/types";
import PadSection from "@/components/PadSection";
import ReadAs from "@/components/ReadAs";
import { Button, Eyebrow } from "@/components/ui";
import StarButton from "@/components/StarButton";
import Figure from "@/components/Figure";
import { RECOGNITION } from "@/data/recognition";
import { useAssignment } from "@/lib/classroom-store";
import { nextLine, scriptDone } from "@/lib/recognition";
import { hintOpener, TALK_OPENER } from "@/lib/helpChat";
import { pickHint, stalledHint, termTex } from "@/lib/hint";
import { questionPractice } from "@/lib/ladder";
import { HelpPicker, PracticeOverlay, PromptModal } from "./PracticePrompt";
import HandInCheck from "./HandInCheck";
import HelpLadder from "./HelpLadder";
import { blankProblems, ladderEntry, promptSentence, type SessionAction, type StudentSession } from "@/lib/session";

/** The back-on-the-question help pills (ticket 312), the pad's help menu's pills at the column's size. */
const PILL = "block w-full whitespace-nowrap rounded-full border border-accent-deep bg-paper px-4 py-2 text-center text-[14px] font-medium text-ink transition-colors enabled:hover:bg-accent-soft disabled:opacity-40";

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
  // A worded problem, every line of the working read: a field under the working asks for the answer in a sentence (tickets 111, 114). Undo below the last line takes it away again; what was typed is kept.
  const askSentence = p.answerAs === "sentence" && scriptDone(RECOGNITION[p.id] ?? [], lines);
  const addStroke = (next: Stroke[]) => dispatch({ type: "ink/stroke", problem: p.id, stroke: next[next.length - 1] });

  // Back on the question after practice on it (ticket 312): "see the example again" beside a hint and a chat on the question itself.
  const entry = ladderEntry(session, p.id);
  const qp = entry ? questionPractice(p, entry.leaf) : null;
  const texs = lines.map((l) => l.tex);
  const shownHints = session.questionRun.hinted[p.id] ?? [];
  const h = useHints(qp ?? { hints: [] }, qp ? shownHints : [], lines.length);
  const nextHint = qp ? pickHint(qp, texs, shownHints) !== null : false;
  const stalled = qp ? stalledHint(qp, texs, shownHints) !== null : false;
  const [stall, setStall] = useState(false);
  const [chatOpen, setChatOpen] = useState<string | null>(null);
  const [chatAsks, setChatAsks] = useState(0);
  const chatOn = qp !== null && chatOpen === p.id;
  const chat = session.questionRun.chat[p.id] ?? [];
  useEscape(chatOn, () => setChatOpen(null));
  const openChat = () => {
    setChatOpen(p.id);
    setChatAsks((n) => n + 1);
  };
  const talkHint = (text: string) => {
    setStall(false);
    const last = chat[chat.length - 1];
    if (!(last?.from === "tutor" && last.text === text)) dispatch({ type: "run/chat", run: "question", problem: p.id, message: { from: "tutor", text } });
    openChat();
  };

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
  const returnTo = (i: number) => {
    setRecognising(false);
    dispatch({ type: "hand-in/return", index: i });
  };
  // The hand-in check (ticket 115): the blank problems, in set order. While the student is returning to them the
  // footer offers Hand in on every problem, with a jump to the next blank one after this (wrapping round) when there is one.
  const blank = blankProblems(session).map((id) => ({ problem: problems.find((q) => q.id === id)!, index: problems.findIndex((q) => q.id === id) })).filter((b) => b.index >= 0);
  const returning = session.handInCheck === "returning";
  const last = session.problemIndex === problems.length - 1;
  const jump = returning ? problems.map((_, k) => (session.problemIndex + 1 + k) % problems.length).find((i) => i !== session.problemIndex && blank.some((b) => b.index === i)) : undefined;

  return (
    <div className="grid h-full min-h-0 grid-cols-[300px_1fr_320px]" data-working-screen>
      <aside className="flex min-h-0 flex-col overflow-y-auto border-r border-line px-7 py-6">
        <div className="flex items-center justify-between">
          <span className="font-display text-[26px] text-ink">{p.label}</span>
          <StarButton on={session.stars.includes(p.id)} onToggle={() => dispatch({ type: "star/toggle", problem: p.id })} />
        </div>
        <p className="mt-3 text-[14px] text-ink-soft">{p.stem}</p>
        <div className="math-lg mt-3 text-ink">
          <M tex={termTex(p.tex, h.termsAt(0), h.litAt(0))} display />
        </div>
        {p.figure && (
          <div className="mt-3">
            <Figure id={p.figure} />
          </div>
        )}
        {qp && <HintCards p={qp} h={h} onTalk={() => talkHint(TALK_OPENER)} />}
        <div className="mt-auto pt-6">
          {qp && (
            <div className="mb-2 grid grid-cols-2 gap-2" data-back-on-question>
              <button type="button" className={`${PILL} col-span-2`} onClick={() => dispatch({ type: "ladder/again", problem: p.id })} data-help-option="example-again">
                see the example again
              </button>
              <button type="button" className={PILL} disabled={!nextHint && !stalled} onClick={() => (stalled ? setStall(true) : dispatch({ type: "question/hint", problem: p.id }))} data-help-option="hint">
                hint
              </button>
              <button type="button" className={PILL} onClick={openChat} data-help-option="chat">
                chat
              </button>
            </div>
          )}
          <Button variant="deep" className="mb-6 w-full" onClick={() => setHelpOpen(true)}>
            I need help
          </Button>
          <Eyebrow>Problems</Eyebrow>
          <ol className="mt-2.5 flex flex-wrap gap-1.5">
            {problems.map((q, i) => {
              const active = i === session.problemIndex;
              const started = (session.lines[q.id]?.length ?? 0) > 0;
              // A starred problem's tile is the star alone (ticket 115); its colour still says whether it was started.
              const starred = session.stars.includes(q.id);
              return (
                <li key={q.id}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={active ? "step" : undefined}
                    aria-label={starred ? `${q.label}, starred` : undefined}
                    data-starred={starred || undefined}
                    className={`h-9 w-10 rounded-lg border font-medium transition-colors ${starred ? "text-[16px] leading-none" : "text-[13px]"} ${
                      active ? "border-ink bg-ink text-white" : started ? "border-accent-line bg-accent-soft text-accent-deep" : "border-line bg-paper text-ink-soft hover:border-ink-muted"
                    }`}
                  >
                    {starred ? "★" : q.label}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </aside>

      <PadSection
        strokes={strokes}
        onStrokesChange={addStroke}
        onBurstEnd={onBurstEnd}
        onPenDown={() => setRecognising(true)}
        onUndo={undo}
        onClear={clear}
        answer={
          askSentence
            ? { placeholder: "Provide your final answer as a full sentence.", value: session.answers[p.id] ?? "", onChange: (text) => dispatch({ type: "answer/set", problem: p.id, text }) }
            : undefined
        }
      />

      <aside className="flex min-h-0 flex-col border-l border-line px-6 py-6">
        <ReadAs
          lines={lines}
          recognising={recognising}
          empty="Lines appear here as you write."
          decorate={qp ? (tex, i) => termTex(tex, h.termsAt(i + 1), h.litAt(i + 1)) : undefined}
          highlight={h.litAnchor > 0 ? h.litAnchor - 1 : undefined}
          className="flex-1"
        />
        {chatOn && qp && (
          <HelpChat key={p.id} problem={qp} lines={texs} messages={chat} hinted={shownHints} runKey="question" dispatch={dispatch} asked={chatAsks} onClose={() => setChatOpen(null)} className="mt-5 max-h-[42%] shrink-0 border-t border-line pt-4" />
        )}
        <div className={`mt-4 flex items-center justify-between border-t border-line pt-4 ${jump !== undefined ? "gap-1.5" : "gap-2"}`}>
          {/* Three buttons in a 320px column while a jump shows: the back button loses 4px of padding a side (inline, as the Button's own px-4 outranks a utility on it) and the gaps tighten, so nothing wraps or spills. */}
          <Button variant="ghost" onClick={() => go(session.problemIndex - 1)} className={`whitespace-nowrap ${session.problemIndex === 0 ? "invisible" : ""}`} style={jump !== undefined ? { paddingInline: 12 } : undefined}>
            ← {problems[session.problemIndex - 1]?.label ?? ""}
          </Button>
          {returning || last ? (
            <div className={`flex items-center ${jump !== undefined ? "gap-1.5" : "gap-2"}`}>
              {jump !== undefined && (
                <Button variant="secondary" onClick={() => go(jump)} data-jump={problems[jump].id} className="whitespace-nowrap">
                  Jump to {problems[jump].label}
                </Button>
              )}
              <Button variant="accent" onClick={() => dispatch({ type: "hand-in" })} data-hand-in className="whitespace-nowrap">
                Hand in
              </Button>
            </div>
          ) : (
            <Button onClick={() => go(session.problemIndex + 1)}>Next: {problems[session.problemIndex + 1].label} →</Button>
          )}
        </div>
      </aside>

      {session.handInCheck === "open" && blank.length > 0 && !helpOpen && !session.overlay && (
        <HandInCheck blank={blank} onReturn={returnTo} onConfirm={() => dispatch({ type: "hand-in/confirm" })} />
      )}

      {helpOpen && (
        <HelpPicker
          problem={p}
          onClose={() => setHelpOpen(false)}
          onPick={(subskill) => {
            setHelpOpen(false);
            dispatch({ type: "help/request", leaf: subskill, problem: p.id, at: Date.now() });
          }}
        />
      )}
      {session.prompt && !helpOpen && (
        <PromptModal
          prompt={session.prompt}
          sentence={promptSentence(session) ?? ""}
          problem={p}
          onAccept={() => dispatch({ type: "prompt/accept", problem: p.id, at: Date.now() })}
          onDecline={() => dispatch({ type: "prompt/decline", problem: p.id })}
        />
      )}
      {session.overlay && (session.ladder ? <HelpLadder session={session} problem={p} dispatch={dispatch} /> : <PracticeOverlay session={session} problem={p} dispatch={dispatch} />)}
      {stall && <StallNotice onTalk={() => talkHint(hintOpener(h.hints.length))} onClose={() => setStall(false)} />}
    </div>
  );
}
