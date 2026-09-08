"use client";

import { useState } from "react";
import PracticeCard from "@/components/PracticeCard";
import { Button, Eyebrow } from "@/components/ui";
import { PRACTICES } from "@/data/practice";
import { PREREQ_IDS, SUBSKILL_MAP } from "@/data/subskills";
import type { Problem, SubskillId } from "@/data/types";
import type { PracticePrompt as Prompt } from "@/lib/session";

/** Dim the iPad screen and centre a card. Positioned against `.ipad-screen`. */
function Scrim({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-ink/35 p-10 backdrop-blur-[2px]" role="dialog" aria-modal>
      {children}
    </div>
  );
}

/** The isolated-practice prompt. Same card whether the counter triggered it or the student asked. */
export function PromptModal({ prompt, problem, onAccept, onDecline }: { prompt: Prompt; problem: Problem; onAccept: () => void; onDecline: () => void }) {
  const s = SUBSKILL_MAP[prompt.subskill];
  const practice = PRACTICES[prompt.subskill as Exclude<SubskillId, "roots">];
  return (
    <Scrim>
      <div className="w-[560px] rounded-3xl bg-paper p-8 shadow-lift">
        <Eyebrow>{prompt.reason === "help" ? "You asked for a hand" : "A natural next step"}</Eyebrow>
        <h2 className="font-display mt-2 text-[28px] leading-tight text-ink">Two minutes on {s.name.toLowerCase()}?</h2>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
          {prompt.reason === "help"
            ? `Let's take ${s.short.toLowerCase()} on its own for a minute, away from ${problem.label}.`
            : `A couple of lines in ${problem.label} and earlier leaned on ${s.short.toLowerCase()} and didn't quite hold.`}{" "}
          {practice.why} Then straight back to {problem.label}, exactly where you left off.
        </p>
        <p className="mt-2 text-[12.5px] text-ink-muted">Not marked. It just makes the next problem easier.</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" size="lg" onClick={onDecline}>
            Not now
          </Button>
          <Button size="lg" onClick={onAccept}>
            Yes, two minutes
          </Button>
        </div>
      </div>
    </Scrim>
  );
}

/** The isolated practice itself, over the working screen. */
export function PracticeOverlay({ subskill, problem, onDone }: { subskill: SubskillId; problem: Problem; onDone: () => void }) {
  const practice = PRACTICES[subskill as Exclude<SubskillId, "roots">];
  const s = SUBSKILL_MAP[subskill];
  const [all, setAll] = useState(false);
  return (
    <div className="absolute inset-0 z-20 overflow-y-auto bg-cream">
      <div className="mx-auto flex min-h-full max-w-3xl flex-col px-9 py-9">
        <Eyebrow>On its own · {s.name}</Eyebrow>
        <h1 className="font-display mt-3 text-[32px] leading-tight text-ink">Just this one move</h1>
        <p className="mt-2 text-[14.5px] text-ink-soft">{practice.why} Work it on paper, then reveal each step to compare.</p>
        <div className="mt-7">
          <PracticeCard practice={practice} onAllShown={setAll} />
        </div>
        <div className="mt-auto flex items-center justify-between pt-6">
          <span className="text-[12.5px] text-ink-muted">Not marked. Your teacher sees that you practised {s.short.toLowerCase()}.</span>
          <Button size="lg" onClick={onDone}>
            {all ? `Got it — back to ${problem.label}` : `Back to ${problem.label}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** "I need help": pick what's getting in the way. Runs the identical flow a detected trigger would. */
export function HelpPicker({ problem, onPick, onClose }: { problem: Problem; onPick: (s: SubskillId) => void; onClose: () => void }) {
  const ordered = [...problem.prereqs, ...PREREQ_IDS.filter((id) => !problem.prereqs.includes(id))];
  return (
    <Scrim>
      <div className="w-[560px] rounded-3xl bg-paper p-8 shadow-lift">
        <Eyebrow>I need help</Eyebrow>
        <h2 className="font-display mt-2 text-[28px] leading-tight text-ink">What's getting in the way?</h2>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
          Pick the skill and you'll get one short problem on just that, then come straight back to {problem.label}. The ones {problem.label} leans on are first.
        </p>
        <ul className="mt-5 space-y-2">
          {ordered.map((id) => {
            const s = SUBSKILL_MAP[id];
            const leans = problem.prereqs.includes(id);
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onPick(id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors hover:border-ink-muted ${leans ? "border-accent-line bg-accent-soft/50" : "border-line bg-paper"}`}
                >
                  <span>
                    <span className="block text-[15px] font-medium text-ink">{s.name}</span>
                    <span className="block text-[12.5px] text-ink-muted">{s.description}</span>
                  </span>
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
