"use client";

import { useState } from "react";
import M from "@/components/Math";
import { LeafChip } from "@/components/Tag";
import { CORRECT, exampleOf, optionOf, type Candidate, type ExampleOption, type ExampleRef } from "@/lib/examples";

const BADGE = "rounded-full px-1.5 py-px text-[10px] font-semibold uppercase tracking-[0.06em]";

/**
 * One example slot on the class review setup (ticket 148): the letter, then the mistake the
 * working stands for (or "correct") with how many made it; a click opens a menu of the
 * problem's mistakes with their counts, and choosing one puts the working most of those
 * students wrote into the slot. Names sit small under the working, here and nowhere near the
 * projector. The menu is a flyout over whatever is below, as wide as the slot and no wider so
 * the card never clips it (ticket 152): nothing on the card moves.
 */
export default function ExamplePicker({ letter, candidate, options, onPick }: { letter: string; candidate: Candidate; options: ExampleOption[]; onPick: (ref: ExampleRef) => void }) {
  const [open, setOpen] = useState(false);
  const current = optionOf(options, candidate.studentId);
  const column = current?.columns.find((c) => c.students.some((s) => s.studentId === candidate.studentId));
  const names = (column?.students ?? [candidate]).map((s) => s.name.split(" ")[0]);
  return (
    <div className="relative px-5 py-4" data-example={letter}>
      <div className="flex items-start gap-3">
        <span className="font-display text-[18px] leading-none text-ink">{letter}</span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="menu"
          className={`flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-3 py-1.5 text-left text-[13px] transition-colors hover:border-ink-muted ${current?.key === CORRECT ? "border-secure-line bg-secure-soft text-secure" : "border-wrong-line bg-wrong-soft text-wrong"}`}
          data-pick={letter}
          data-pick-key={current?.key === CORRECT ? "correct" : (current?.key ?? "")}
        >
          <span className="min-w-0 flex-1 truncate font-medium">{current?.name ?? "correct"}</span>
          <span className="shrink-0 text-[12px] opacity-80" data-pick-count>
            {current?.count ?? 1}
          </span>
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>
            <path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {current && (current.leaf || current.unitFocus || current.fixedInGroup) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 pl-[30px]">
          {current.leaf && <LeafChip id={current.leaf} />}
          {current.unitFocus && <span className={`${BADGE} bg-standout-soft text-standout`} data-badge="unit">unit focus</span>}
          {current.fixedInGroup && <span className={`${BADGE} bg-secure-soft text-secure`} data-badge="group">fixed in group review</span>}
        </div>
      )}
      <ol className="mt-3 space-y-1.5">
        {candidate.lines.map((tex, n) => (
          <li key={n} className="rounded-lg border border-line bg-cream/60 px-3 py-1.5 text-[14px] text-ink">
            <M tex={tex} />
          </li>
        ))}
      </ol>
      <p className="mt-2 truncate text-[12px] text-ink-muted" data-names>
        {names.slice(0, 3).join(", ")}
        {names.length > 3 && ` +${names.length - 3}`}
      </p>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-20 cursor-default" aria-label="Close" onClick={() => setOpen(false)} data-pick-close />
          {/* As wide as the slot, never wider (ticket 152): the card clips at its edge, so a menu past column C's edge lost its counts. Long names wrap; the count stays on the right. */}
          <ul role="menu" className="absolute left-5 right-5 top-[52px] z-30 rounded-xl border border-line bg-paper p-1 shadow-lift" data-pick-menu={letter}>
            {options.map((o) => {
              const on = o === current;
              const correct = o.key === CORRECT;
              return (
                <li key={o.key || "correct"} role="none">
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={on}
                    onClick={() => {
                      onPick(exampleOf(o));
                      setOpen(false);
                    }}
                    className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] leading-snug transition-colors hover:bg-cream-deep ${on ? "bg-accent-soft/60" : ""}`}
                    data-pick-option={correct ? "correct" : o.key}
                  >
                    <span className={`mt-[5px] h-2.5 w-2.5 shrink-0 rounded-full ${correct ? "bg-secure" : "bg-wrong"}`} aria-hidden />
                    <span className="min-w-0 flex-1 text-ink">
                      {o.name}
                      {o.unitFocus && <span className={`${BADGE} ml-1.5 bg-standout-soft text-standout`}>unit focus</span>}
                      {o.fixedInGroup && <span className={`${BADGE} ml-1.5 bg-secure-soft text-secure`}>fixed in group review</span>}
                    </span>
                    <span className="shrink-0 text-[12px] text-ink-muted">{o.count} {o.count === 1 ? "student" : "students"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
