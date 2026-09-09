"use client";

import { useEffect, useState } from "react";
import PracticeCard from "@/components/PracticeCard";
import { Button, Eyebrow } from "@/components/ui";
import { PRACTICES } from "@/data/practice";
import { leafName, type LeafId } from "@/data/taxonomy";
import type { Problem } from "@/data/types";
import { problemLeaves } from "@/lib/hierarchy";
import type { PracticePrompt as Prompt } from "@/lib/session";

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

/** The isolated-practice prompt. Same card whether the counter triggered it or the student asked. */
export function PromptModal({ prompt, problem, onAccept, onDecline }: { prompt: Prompt; problem: Problem; onAccept: () => void; onDecline: () => void }) {
  const s = leafName(prompt.leaf);
  return (
    <Scrim>
      <div className="w-[560px] rounded-3xl bg-paper p-8 shadow-lift">
        <Eyebrow>{prompt.reason === "help" ? "You asked for a hand" : "A natural next step"}</Eyebrow>
        <h2 className="font-display mt-2 text-[28px] leading-tight text-ink">Two minutes on {s.short}?</h2>
        <p className="mt-3 text-[14px] text-ink-soft">
          {prompt.reason === "help" ? `One short problem on ${s.short}, then back to ${problem.label}.` : `Something in ${problem.label} leaned on ${s.short}. One short problem, then back.`}
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

/** The isolated practice itself, over the working screen. */
export function PracticeOverlay({ subskill, problem, onDone }: { subskill: LeafId; problem: Problem; onDone: () => void }) {
  const practice = PRACTICES[subskill]!;
  const s = leafName(subskill);
  const [all, setAll] = useState(false);
  return (
    <div className="absolute inset-0 z-20 overflow-y-auto bg-cream">
      <div className="mx-auto flex min-h-full max-w-3xl flex-col px-9 py-9">
        <Eyebrow>On its own · {s.name}</Eyebrow>
        <h1 className="font-display mt-3 text-[32px] leading-tight text-ink">One move</h1>
        <div className="mt-7">
          <PracticeCard practice={practice} onAllShown={setAll} />
        </div>
        <div className="mt-auto flex items-center justify-end pt-6">
          <Button size="lg" onClick={onDone}>
            {all ? `Back to ${problem.label} →` : `Back to ${problem.label}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** "I need help": pick what's getting in the way. Runs the identical flow a detected trigger would. */
export function HelpPicker({ problem, onPick, onClose }: { problem: Problem; onPick: (s: LeafId) => void; onClose: () => void }) {
  const withPractice = (Object.keys(PRACTICES) as LeafId[]);
  const own = problemLeaves(problem).filter((l) => withPractice.includes(l));
  const ordered = [...own, ...withPractice.filter((id) => !own.includes(id))];
  return (
    <Scrim>
      <div className="w-[560px] rounded-3xl bg-paper p-8 shadow-lift">
        <Eyebrow>I need help</Eyebrow>
        <h2 className="font-display mt-2 text-[28px] leading-tight text-ink">Which skill?</h2>
        <ul className="mt-5 space-y-2">
          {ordered.map((id) => {
            const s = leafName(id);
            const leans = own.includes(id);
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onPick(id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors hover:border-ink-muted ${leans ? "border-accent-line bg-accent-soft/50" : "border-line bg-paper"}`}
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
