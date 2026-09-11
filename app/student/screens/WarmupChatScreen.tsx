"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Eyebrow } from "@/components/ui";
import { warmupFocus, warmupSeed, type SessionAction, type StudentSession } from "@/lib/session";
import { byEase, CHAT_CLOSE_MS, closingLine, concernTurns, emphasis, turnSteps, type PlayStep } from "@/lib/warmup";

/**
 * The concerns chat, between the confidence answer and the warm-up. The tutor's turns are derived
 * (`concernTurns`): the opening is two bubbles, each later question one, and after the last answer
 * a closing bubble that names the first skill, then the pad. Only the student's answers are stored.
 *
 * The turn being played (the one after the last answer) arrives bubble by bubble to `turnSteps`:
 * a beat, the typing dots, the bubble. While it plays the box is off (cream, no caret, "the tutor
 * is writing…"); when the turn's last bubble has landed the box turns on, takes focus and gives
 * one ring pulse, the flow's sign for "your move". Answered turns show in full at once.
 */
export default function WarmupChatScreen({ session, dispatch }: { session: StudentSession; dispatch: (a: SessionAction) => void }) {
  const turns = concernTurns(warmupSeed(session));
  const answers = session.warmup.messages.filter((m) => m.from === "student");
  const turnIndex = answers.length;
  const closing = turnIndex >= turns.length;
  const current = closing ? [closingLine(byEase(warmupFocus(session))[0])] : turns[turnIndex];
  const steps = turnSteps(current.length, turnIndex === 0);
  // The step reached, tagged with its turn: a step from an earlier turn means this turn is at its first step.
  const [played, setPlayed] = useState<{ turn: number; step: PlayStep }>({ turn: turnIndex, step: steps[0] });
  const play = played.turn === turnIndex ? played.step : steps[0];
  useEffect(() => {
    const timers = steps.slice(1).map((st) => setTimeout(() => setPlayed({ turn: turnIndex, step: st }), st.at));
    if (closing) timers.push(setTimeout(() => dispatch({ type: "warmup/begin" }), steps[steps.length - 1].at + CHAT_CLOSE_MS));
    return () => timers.forEach(clearTimeout);
    // The playback restarts only when a new turn begins (the student answered); a reload replays the current turn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnIndex]);
  const yourTurn = !closing && play.shown >= current.length;

  const [draft, setDraft] = useState("");
  const end = useRef<HTMLLIElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [turnIndex, play]);
  useEffect(() => {
    if (yourTurn) box.current?.focus();
  }, [yourTurn]);
  const send = () => {
    const t = draft.trim();
    if (!t || !yourTurn) return;
    dispatch({ type: "warmup/say", text: t });
    setDraft("");
  };

  const tutor = "border border-line bg-paper text-ink";
  const student = "bg-ink text-white";
  const bubble = (from: "tutor" | "student", text: string, key: string) => (
    <li key={key} className={`flex ${from === "student" ? "justify-end" : "justify-start"}`} data-from={from}>
      <span className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-snug ${from === "student" ? student : tutor}`}>
        {from === "tutor" ? emphasis(text).map((run, k) => (run.bold ? <strong key={k} className="font-semibold">{run.text}</strong> : <span key={k}>{run.text}</span>)) : text}
      </span>
    </li>
  );

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-9 py-9" data-warmup-chat data-turn={turnIndex} data-your-turn={yourTurn || undefined}>
      <Eyebrow>Warm-up</Eyebrow>
      <ol className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1" data-chat aria-live="polite">
        {turns.slice(0, turnIndex).flatMap((turn, i) => [...turn.map((text, j) => bubble("tutor", text, `t${i}.${j}`)), bubble("student", answers[i].text, `s${i}`)])}
        {current.slice(0, play.shown).map((text, j) => bubble("tutor", text, `t${turnIndex}.${j}`))}
        {play.dots && (
          <li className="flex justify-start" data-from="tutor" data-pending>
            <span className={`rounded-2xl px-4 py-2.5 text-[15px] leading-snug ${tutor}`}>
              <span className="animate-pulse text-ink-muted">…</span>
            </span>
          </li>
        )}
        <li ref={end} aria-hidden />
      </ol>
      <div className="mt-4 flex items-end gap-2 border-t border-line pt-4">
        <div className={`relative min-w-0 flex-1 rounded-2xl ${yourTurn ? "pulse-once" : ""}`} data-box>
          <textarea
            ref={box}
            value={draft}
            disabled={!yourTurn}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={2}
            placeholder={yourTurn ? "in your own words…" : "the tutor is writing…"}
            aria-label="Your concerns"
            className={`block min-h-[56px] w-full resize-none rounded-2xl border px-4 py-3 text-[15px] transition-colors duration-300 focus:outline-none ${
              yourTurn ? "border-line-strong bg-paper text-ink placeholder:text-ink-muted focus:border-ink-muted" : "cursor-not-allowed border-line bg-cream-deep text-ink-muted placeholder:text-ink-muted/70"
            }`}
          />
        </div>
        <Button variant="accent" size="lg" onClick={send} disabled={!yourTurn || draft.trim() === ""} data-send>
          send
        </Button>
      </div>
    </div>
  );
}
