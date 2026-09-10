"use client";

import { useState } from "react";
import { Button, Eyebrow } from "@/components/ui";
import { studentLeafName, type LeafId } from "@/data/taxonomy";
import type { Confidence } from "@/data/types";
import { useAssignment } from "@/lib/classroom-store";
import { relevantSkills } from "@/lib/hierarchy";

type Level = Confidence["level"];

/**
 * Three answers, lowercase: "confident", "not confident" overall, then "not confident with…" over
 * the set's seven most relevant skills (always visible, stacked, tick any number; ticking one is
 * the answer).
 */
/** The radio dot at the head of each answer, filled when that answer is picked. */
function Radio({ on }: { on: boolean }) {
  return (
    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${on ? "border-white" : "border-line-strong"}`} aria-hidden>
      {on && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
    </span>
  );
}

export default function ConfidenceScreen({ practice, onSubmit }: { practice: "taken" | "declined" | null; onSubmit: (c: Confidence) => void }) {
  const [level, setLevel] = useState<Level | null>(null);
  const [leaves, setLeaves] = useState<LeafId[]>([]);
  const skills = relevantSkills(useAssignment().problems);
  const ready = level === "low-when" ? leaves.length > 0 : level !== null;

  const submit = () => {
    if (!ready || !level) return;
    onSubmit(level === "low-when" ? { level, leaves } : { level });
  };
  const pick = (l: Level) => {
    setLevel(l);
    if (l !== "low-when") setLeaves([]);
  };
  const toggle = (id: LeafId) => {
    setLevel("low-when");
    setLeaves((ls) => (ls.includes(id) ? ls.filter((l) => l !== id) : [...ls, id]));
  };

  const head = (on: boolean) => `flex w-full items-center gap-4 px-5 py-4 text-left transition-colors ${on ? "bg-ink text-white" : "bg-paper text-ink hover:bg-cream-deep"}`;

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-9 py-9">
      <Eyebrow>Before you start</Eyebrow>
      <h1 className="font-display mt-3 text-[32px] leading-tight text-ink">How confident are you?</h1>

      <div className="mt-7 min-h-0 space-y-3 overflow-y-auto pb-2">
        <button type="button" onClick={() => pick("confident")} aria-pressed={level === "confident"} className={`rounded-2xl border ${level === "confident" ? "border-ink" : "border-line"} ${head(level === "confident")}`}>
          <Radio on={level === "confident"} />
          <span className="text-[16px] font-medium">confident</span>
        </button>

        <button type="button" onClick={() => pick("low")} aria-pressed={level === "low"} className={`rounded-2xl border ${level === "low" ? "border-ink" : "border-line"} ${head(level === "low")}`}>
          <Radio on={level === "low"} />
          <span className="text-[16px] font-medium">not confident</span>
        </button>

        <div className={`overflow-hidden rounded-2xl border ${level === "low-when" ? "border-ink" : "border-line"}`} data-skill-picker>
          <button type="button" onClick={() => pick("low-when")} aria-pressed={level === "low-when"} className={head(level === "low-when")}>
            <Radio on={level === "low-when"} />
            <span className="text-[16px] font-medium">not confident with…</span>
          </button>
          <ul className="divide-y divide-line border-t border-line bg-paper">
            {skills.map((id) => {
              const on = leaves.includes(id);
              return (
                <li key={id}>
                  <button type="button" onClick={() => toggle(id)} aria-pressed={on} data-skill={id} className="flex w-full items-center gap-4 px-5 py-2.5 text-left transition-colors hover:bg-cream-deep">
                    <span className={`ml-9 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-[5px] border text-[11px] ${on ? "border-accent bg-accent text-white" : "border-line-strong bg-paper text-transparent"}`} aria-hidden>
                      ✓
                    </span>
                    <span className={`text-[15px] ${on ? "font-medium text-ink" : "text-ink-soft"}`}>{studentLeafName(id).name.toLowerCase()}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-end pt-6">
        <Button size="lg" disabled={!ready} onClick={submit}>
          {practice === "taken" ? "Warm up" : "Start Q1"}
        </Button>
      </div>
    </div>
  );
}
