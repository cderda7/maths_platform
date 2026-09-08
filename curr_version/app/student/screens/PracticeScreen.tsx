"use client";

import { useState } from "react";
import PracticeCard from "@/components/PracticeCard";
import { Button, Eyebrow } from "@/components/ui";
import { PRACTICE } from "@/data/practice";
import { SUBSKILL_MAP } from "@/data/subskills";

/** The warm-up offered before the set. */
export default function PracticeScreen({ onDone }: { onDone: () => void }) {
  const [all, setAll] = useState(false);
  const s = SUBSKILL_MAP[PRACTICE.subskill];
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-9 py-9">
      <Eyebrow>Warm-up · {s.name}</Eyebrow>
      <h1 className="font-display mt-3 text-[32px] leading-tight text-ink">A quick one before the set</h1>
      <p className="mt-2 text-[14.5px] text-ink-soft">{PRACTICE.why} Work it through, then reveal each step to compare.</p>
      <div className="mt-7">
        <PracticeCard practice={PRACTICE} onAllShown={setAll} />
      </div>
      <div className="mt-auto flex items-center justify-between pt-6">
        <span className="text-[12.5px] text-ink-muted">Not marked. Your teacher sees that you warmed up, nothing else.</span>
        <Button size="lg" onClick={onDone}>
          {all ? "Got it — on to the set" : "Skip to the set"}
        </Button>
      </div>
    </div>
  );
}
