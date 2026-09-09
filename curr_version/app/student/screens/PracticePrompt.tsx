"use client";

import { useEffect } from "react";
import PracticePad from "@/components/PracticePad";
import { Button, Eyebrow } from "@/components/ui";
import { groupOf, groupWord, studentLeafName, type LeafId } from "@/data/taxonomy";
import type { Problem } from "@/data/types";
import { problemLeaves } from "@/lib/hierarchy";
import { runFirst, type PracticePrompt as Prompt, type SessionAction, type StudentSession } from "@/lib/session";
import { practiceFor } from "@/lib/warmup";

/** Dim the iPad screen and centre a card. Positioned against `.ipad-screen`. `onDismiss`: a tap on the dim or Escape closes it. */
export function Scrim({ children, onDismiss }: { children: React.ReactNode; onDismiss?: () => void }) {
  useEffect(() => {
    if (!onDismiss) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onDismiss();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);
  return (
    <div
      className="absolute inset-0 z-20 grid place-items-center bg-ink/35 p-10 backdrop-blur-[2px]"
      role="dialog"
      aria-modal
      onClick={onDismiss ? (e) => e.target === e.currentTarget && onDismiss() : undefined}
    >
      {children}
    </div>
  );
}

/**
 * The isolated-practice prompt, for a trigger the program raised (asking for help goes straight to
 * the pad): a second mistake in a group, or a first one where the student said they are not confident.
 */
export function PromptModal({ prompt, onAccept, onDecline }: { prompt: Prompt; problem: Problem; onAccept: () => void; onDecline: () => void }) {
  const s = studentLeafName(prompt.leaf);
  const word = groupWord(groupOf(prompt.leaf));
  return (
    <Scrim>
      <div className="w-[560px] rounded-3xl bg-paper p-8 shadow-lift" data-prompt={prompt.reason}>
        <h2 className="font-display text-[28px] leading-tight text-ink">two minutes on {s.short}?</h2>
        <p className="mt-3 text-[14px] text-ink-soft">
          {prompt.reason === "confidence"
            ? `you've made a mistake with ${word}. you told me you don't feel confident with this skill, so let's do a short problem to review.`
            : `this is your second mistake on ${word}. let's do a short problem to review.`}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" size="lg" onClick={onDecline}>
            Not now
          </Button>
          <Button size="lg" onClick={onAccept}>
            Yes
          </Button>
        </div>
      </div>
    </Scrim>
  );
}

/** The isolated practice itself, over the working screen: the same pad as the warm-up, the skill as its header, "Back to Qn" to return. */
export function PracticeOverlay({ session, problem, dispatch }: { session: StudentSession; problem: Problem; dispatch: (a: SessionAction) => void }) {
  const first = runFirst(session, "overlay");
  if (!first) return null;
  const back = () => dispatch({ type: "overlay/done" });
  return (
    <div className="absolute inset-0 z-20 bg-cream" data-overlay>
      <PracticePad
        run={session.overlayRun}
        runKey="overlay"
        first={first}
        dispatch={dispatch}
        title="On its own"
        header={
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            <span className="rounded-full border border-standout bg-standout px-2.5 py-0.5 text-[11.5px] text-white" data-leaf={first.leaf}>
              {studentLeafName(first.leaf).short}
            </span>
          </div>
        }
        footer={
          <Button variant="accent" onClick={back} data-done>
            Back to {problem.label} →
          </Button>
        }
        finished={
          <Button size="lg" variant="accent" onClick={back}>
            Back to {problem.label} →
          </Button>
        }
      />
    </div>
  );
}

/** "I need help": pick which of this problem's skills is getting in the way. Only moves with a practice are listed. Runs the identical flow a detected trigger would. */
export function HelpPicker({ problem, onPick, onClose }: { problem: Problem; onPick: (s: LeafId) => void; onClose: () => void }) {
  const own = problemLeaves(problem).filter((l) => practiceFor(l) !== null);
  return (
    <Scrim onDismiss={onClose}>
      <div className="w-[560px] rounded-3xl bg-paper p-8 shadow-lift" data-help-picker>
        <Eyebrow>I need help</Eyebrow>
        <h2 className="font-display mt-2 text-[28px] leading-tight text-ink">Which skill?</h2>
        <ul className="mt-5 space-y-2">
          {own.map((id) => {
            const s = studentLeafName(id);
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onPick(id)}
                  className="flex w-full items-center justify-between rounded-xl border border-accent-line bg-accent-soft/50 px-4 py-3 text-left transition-colors hover:border-ink-muted"
                  data-pick={id}
                >
                  <span className="text-[15px] font-medium text-ink">{s.name}</span>
                  <span className="ml-4 shrink-0 text-[13px] text-accent-deep">Practise →</span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-5 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Never mind
          </Button>
        </div>
      </div>
    </Scrim>
  );
}
