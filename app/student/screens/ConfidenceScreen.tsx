"use client";

import { useState } from "react";
import { Button, Eyebrow } from "@/components/ui";
import type { LeafId } from "@/data/taxonomy";
import type { Confidence } from "@/data/types";
import { useAssignment } from "@/lib/classroom-store";
import { FACTORISING, FACTORISING_KINDS, pickedLeaves, pickedRows, pickerRows, type PickId } from "@/lib/confidence";
import { offerLines } from "@/lib/warmup";

type Level = Confidence["level"];

/**
 * Three answers, lowercase: "confident", "not confident" overall, then "not confident with…" over
 * the set's seven most relevant skills (always visible, stacked, tick any number; ticking one is
 * the answer). Factorising is one row; ticking it opens "monic" and "non-monic" under it to tick
 * one or both, and neither ticked means both (`lib/confidence.ts`). One button, "Submit", whatever the answer: "confident" opens Q1; either other
 * answer keeps the student here (`answered` set), dims and locks the list, and a callout rises
 * just above the spot Submit occupied (the tutor's question naming the ticked skills, the size of
 * the warm-up, "Warm up" in the accent fill / "Start the set" in the accent outline). The spot itself is left empty so reaching either
 * choice is a deliberate move rather than a second tap in the same place.
 *
 * Submit sits in the screen's bottom-right corner, at the exact spot the start screen's START
 * button occupied (the same `px-10 … pb-5` frame and `size="lg"` button, ticket 153): the student's
 * thumb is already there from the previous tap, so the button does not jump between screens. The
 * question and the answers keep their centred `max-w-3xl` column; only the button row spans the screen.
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
  const [draftPicked, setDraftPicked] = useState<PickId[]>([]);
  // Once answered, the screen shows the answer in the session (a reload shows the same offer), not the draft.
  const level = answered ? answered.level : draftLevel;
  const picked = answered ? (answered.level === "low-when" ? pickedRows(answered.leaves) : []) : draftPicked;
  const locked = answered !== null;
  const rows = pickerRows(useAssignment().problems);
  const ready = level === "low-when" ? picked.length > 0 : level !== null;

  const submit = () => {
    if (locked || !ready || !level) return;
    onSubmit(level === "low-when" ? { level, leaves: pickedLeaves(picked) } : { level });
  };
  const pick = (l: Level) => {
    if (locked) return;
    setDraftLevel(l);
    if (l !== "low-when") setDraftPicked([]);
  };
  // Unticking the factorising row unticks the kinds under it too, so they never outlive the row.
  const toggle = (id: PickId) => {
    if (locked) return;
    setDraftLevel("low-when");
    setDraftPicked((ps) => (ps.includes(id) ? ps.filter((p) => p !== id && (id !== FACTORISING || !FACTORISING_KINDS.includes(p as LeafId))) : [...ps, id]));
  };
  const tick = (on: boolean) => `grid h-4.5 w-4.5 shrink-0 place-items-center rounded-[5px] border text-[11px] ${on ? "border-accent bg-accent text-white" : "border-line-strong bg-paper text-transparent"}`;

  const head = (on: boolean) => `flex w-full items-center gap-4 px-5 py-3 text-left transition-colors ${on ? "bg-ink text-white" : "bg-paper text-ink hover:bg-cream-deep"}`;

  return (
    <div className="flex h-full min-h-0 flex-col px-10 pt-6 pb-5">
      {/* The same frame as the start screen, so the button row below lands where START was. */}
      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-col px-9" data-confidence-column>
        <Eyebrow>Check in</Eyebrow>
        <h1 className="font-display mt-2 text-[32px] leading-tight text-ink">How confident are you going into this set?</h1>

      <div className={`mt-5 min-h-0 space-y-3 overflow-y-auto pb-2 transition-opacity duration-300 ${locked ? "pointer-events-none opacity-50" : ""}`} aria-disabled={locked} data-answers>
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
            {rows.map(({ id, label, children }) => {
              const on = picked.includes(id);
              return (
                <li key={id}>
                  <button type="button" onClick={() => toggle(id)} aria-pressed={on} data-skill={id} className="flex w-full items-center gap-4 px-5 py-2 text-left transition-colors hover:bg-cream-deep">
                    <span className={`ml-9 ${tick(on)}`} aria-hidden>
                      ✓
                    </span>
                    <span className={`text-[15px] ${on ? "font-medium text-ink" : "text-ink-soft"}`}>{label}</span>
                  </button>
                  {children && on && (
                    <ul className="pb-1" data-skill-kinds>
                      {children.map((c) => {
                        const onC = picked.includes(c.id);
                        return (
                          <li key={c.id}>
                            <button type="button" onClick={() => toggle(c.id)} aria-pressed={onC} data-skill={c.id} className="flex w-full items-center gap-4 px-5 py-1 text-left transition-colors hover:bg-cream-deep">
                              <span className={`ml-[4.75rem] ${tick(onC)}`} aria-hidden>
                                ✓
                              </span>
                              <span className={`text-[14px] ${onC ? "font-medium text-ink" : "text-ink-soft"}`}>{c.label}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      </div>

      <div className="relative mt-auto flex shrink-0 flex-col items-end pt-4">
        {answered ? (
          <>
            {/* Floats over the dimmed list rather than pushing it, so nothing on the screen moves but the callout. */}
            <div className="offer-in pulse-once absolute right-0 bottom-[60px] rounded-2xl border border-accent-line bg-paper px-5 py-4 shadow-lift" role="group" aria-label="Warm up?" data-warmup-offer>
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
            {/* The spot Submit occupied, left empty on purpose: the same button, invisible, so the row keeps exactly its height. */}
            <Button size="lg" className="invisible" disabled aria-hidden tabIndex={-1} data-submit-spot>
              Submit
            </Button>
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
