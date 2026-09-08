"use client";

import { useState } from "react";
import { Button, Eyebrow } from "@/components/ui";
import { PREREQ_IDS, SUBSKILL_MAP } from "@/data/subskills";
import type { Confidence, SubskillId } from "@/data/types";

type Level = Confidence["level"];

const OPTIONS: { level: Level; title: string; blurb: string }[] = [
  { level: "confident", title: "Confident", blurb: "I know how to do these and expect them to go fine." },
  { level: "low-when", title: "Low confidence when a particular skill is involved", blurb: "Mostly fine, but one of the skills this set leans on tends to trip me up." },
  { level: "low", title: "Low confidence", blurb: "Not sure about this topic yet." },
];

export default function ConfidenceScreen({ practice, onSubmit }: { practice: "taken" | "declined" | null; onSubmit: (c: Confidence) => void }) {
  const [level, setLevel] = useState<Level | null>(null);
  const [subskill, setSubskill] = useState<SubskillId | null>(null);
  const ready = level === "low-when" ? subskill !== null : level !== null;

  const submit = () => {
    if (!ready || !level) return;
    onSubmit(level === "low-when" ? { level, subskill: subskill! } : { level });
  };

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-9 py-9">
      <Eyebrow>Before you start</Eyebrow>
      <h1 className="font-display mt-3 text-[32px] leading-tight text-ink">How are you feeling about this set?</h1>
      <p className="mt-2 text-[14.5px] text-ink-soft">
        {practice === "taken" ? "Nice warm-up. " : ""}This isn't marked. It helps you notice when your feeling and your working line up, and helps your teacher know where to look first.
      </p>

      <div className="mt-7 space-y-3">
        {OPTIONS.map((o) => {
          const active = level === o.level;
          return (
            <div key={o.level}>
              <button
                type="button"
                onClick={() => setLevel(o.level)}
                aria-pressed={active}
                className={`flex w-full items-start gap-4 rounded-2xl border px-5 py-4 text-left transition-colors ${
                  active ? "border-ink bg-ink text-white" : "border-line bg-paper text-ink hover:border-ink-muted"
                }`}
              >
                <span className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${active ? "border-white" : "border-line-strong"}`} aria-hidden>
                  {active && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                </span>
                <span>
                  <span className="block text-[16px] font-medium">{o.title}</span>
                  <span className={`mt-0.5 block text-[13px] ${active ? "text-white/75" : "text-ink-soft"}`}>{o.blurb}</span>
                </span>
              </button>
              {o.level === "low-when" && active && (
                <div className="ml-14 mt-3 flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-[13px] text-ink-soft">Which one?</span>
                  {PREREQ_IDS.map((id) => {
                    const on = subskill === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSubskill(id)}
                        aria-pressed={on}
                        className={`rounded-full border px-3.5 py-1.5 text-[13px] transition-colors ${
                          on ? "border-accent bg-accent text-white" : "border-line bg-paper text-ink-soft hover:border-ink-muted"
                        }`}
                      >
                        {SUBSKILL_MAP[id].name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-auto flex items-center justify-end pt-6">
        <Button size="lg" disabled={!ready} onClick={submit}>
          Start Q1
        </Button>
      </div>
    </div>
  );
}
