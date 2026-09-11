"use client";

import { useState } from "react";
import { Button, Eyebrow } from "@/components/ui";
import { studentLeafName, type LeafId } from "@/data/taxonomy";
import type { Confidence } from "@/data/types";
import { useAssignment } from "@/lib/classroom-store";
import { relevantSkills } from "@/lib/hierarchy";
import { offerLines } from "@/lib/warmup";

type Level = Confidence["level"];

/**
 * Three answers, lowercase: "confident", "not confident" overall, then "not confident with…" over
 * the set's seven most relevant skills (always visible, stacked, tick any number; ticking one is
 * the answer). One button, "Submit", whatever the answer: "confident" opens Q1; either other
 * answer keeps the student here (`answered` set), dims and locks the list, and a callout rises
 * just above the spot Submit occupied (the tutor's question naming the ticked skills, the size of
 * the warm-up, "Warm up" in the accent fill / "Start the set" in the accent outline). The spot itself is left empty so reaching either
 * choice is a deliberate move rather than a second tap in the same place.
 */
/** The radio dot at the head of each answer, filled when that answer is picked. */
function Radio({ on }: { on: boolean }) {
  return (
    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${on ? "border-white" : "border-line-strong"}`} aria-hidden>
      {on && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
    </span>
  );
}

export default function ConfidenceScreen({
  answered,
  onSubmit,
  onWarmup,
  onStart,
}: {
  /** The not-confident answer already in, while the warm-up offer is open; null while the student is still answering. */
  answered: Confidence | null;
  onSubmit: (c: Confidence) => void;
  onWarmup: () => void;
  onStart: () => void;
}) {
  const [draftLevel, setDraftLevel] = useState<Level | null>(null);
  const [draftLeaves, setDraftLeaves] = useState<LeafId[]>([]);
  // Once answered, the screen shows the answer in the session (a reload shows the same offer), not the draft.
  const level = answered ? answered.level : draftLevel;
  const leaves = answered ? (answered.level === "low-when" ? answered.leaves : []) : draftLeaves;
  const locked = answered !== null;
  const skills = relevantSkills(useAssignment().problems);
  const ready = level === "low-when" ? leaves.length > 0 : level !== null;

  const submit = () => {
    if (locked || !ready || !level) return;
    onSubmit(level === "low-when" ? { level, leaves } : { level });
  };
  const pick = (l: Level) => {
    if (locked) return;
    setDraftLevel(l);
    if (l !== "low-when") setDraftLeaves([]);
  };
  const toggle = (id: LeafId) => {
    if (locked) return;
    setDraftLevel("low-when");
    setDraftLeaves((ls) => (ls.includes(id) ? ls.filter((l) => l !== id) : [...ls, id]));
  };

  const head = (on: boolean) => `flex w-full items-center gap-4 px-5 py-4 text-left transition-colors ${on ? "bg-ink text-white" : "bg-paper text-ink hover:bg-cream-deep"}`;

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-9 py-9">
      <Eyebrow>Before you start</Eyebrow>
      <h1 className="font-display mt-3 text-[32px] leading-tight text-ink">How confident are you?</h1>

      <div className={`mt-7 min-h-0 space-y-3 overflow-y-auto pb-2 transition-opacity duration-300 ${locked ? "pointer-events-none opacity-50" : ""}`} aria-disabled={locked} data-answers>
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

      <div className="relative mt-auto flex flex-col items-end pt-6">
        {answered ? (
          <>
            {/* Floats over the dimmed list rather than pushing it, so nothing on the screen moves but the callout. */}
            <div className="offer-in absolute right-0 bottom-[60px] rounded-2xl border border-accent-line bg-paper px-5 py-4 shadow-lift" role="group" aria-label="Warm up?" data-warmup-offer>
              <p className="text-[16px] font-medium text-ink" data-offer-question>
                {offerLines(answered).question}
              </p>
              <p className="mt-0.5 text-[13.5px] text-ink-muted" data-offer-size>
                {offerLines(answered).size}
              </p>
              <div className="mt-3.5 flex items-center justify-end gap-2">
                <Button variant="accent" size="lg" onClick={onWarmup} data-warmup-accept>
                  Warm up
                </Button>
                <Button variant="outline" size="lg" onClick={onStart} data-warmup-decline>
                  Start the set
                </Button>
              </div>
            </div>
            {/* The spot Submit occupied, left empty on purpose. */}
            <div className="h-[48px] shrink-0" aria-hidden data-submit-spot />
          </>
        ) : (
          <Button size="lg" disabled={!ready} onClick={submit} data-submit>
            Submit
          </Button>
        )}
      </div>
    </div>
  );
}
