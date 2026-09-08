"use client";

import { useState } from "react";
import M from "@/components/Math";
import { Button, Card, Eyebrow } from "@/components/ui";
import { SubskillChip } from "@/components/Tag";
import { PRACTICE } from "@/data/assignment";
import { SUBSKILL_MAP } from "@/data/subskills";

/**
 * The warm-up. Until the drawpad lands (ticket 03) the student works on paper and reveals the
 * worked steps one at a time to check against; ticket 03 swaps the reveal for the drawpad.
 */
export default function PracticeScreen({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState(0);
  const all = shown >= PRACTICE.steps.length;
  const s = SUBSKILL_MAP[PRACTICE.subskill];
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-9 py-9">
      <Eyebrow>Warm-up · {s.name}</Eyebrow>
      <h1 className="font-display mt-3 text-[32px] leading-tight text-ink">A quick one before the set</h1>
      <p className="mt-2 text-[14.5px] text-ink-soft">{PRACTICE.why} Work it through, then reveal each step to compare.</p>

      <Card className="mt-7 p-7">
        <div className="flex items-center justify-between">
          <span className="text-[14px] text-ink-soft">{PRACTICE.stem}</span>
          <SubskillChip id={PRACTICE.subskill} />
        </div>
        <div className="math-lg mt-3 text-ink">
          <M tex={PRACTICE.tex} display />
        </div>

        <ol className="mt-6 space-y-3 border-t border-line pt-6">
          {PRACTICE.steps.slice(0, shown).map((st, i) => (
            <li key={i} className="flex items-center gap-5">
              <span className="w-44 shrink-0 text-[12.5px] text-ink-muted">{st.label}</span>
              <span className="text-[17px] text-ink">
                <M tex={st.tex} />
              </span>
            </li>
          ))}
          {!all && (
            <li>
              <Button variant="secondary" onClick={() => setShown((n) => n + 1)}>
                {shown === 0 ? "Show the first step" : "Show the next step"}
              </Button>
            </li>
          )}
        </ol>
      </Card>

      <div className="mt-auto flex items-center justify-between pt-6">
        <span className="text-[12.5px] text-ink-muted">Not marked. Your teacher sees that you warmed up, nothing else.</span>
        <Button size="lg" onClick={onDone}>
          {all ? "Got it — on to the set" : "Skip to the set"}
        </Button>
      </div>
    </div>
  );
}
