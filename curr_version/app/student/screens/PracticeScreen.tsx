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
      <h1 className="font-display mt-3 text-[32px] leading-tight text-ink">Quick warm-up</h1>
      <div className="mt-7">
        <PracticeCard practice={PRACTICE} onAllShown={setAll} />
      </div>
      <div className="mt-auto flex items-center justify-end pt-6">
        <Button size="lg" onClick={onDone}>
          {all ? "On to the set" : "Skip to the set"}
        </Button>
      </div>
    </div>
  );
}
