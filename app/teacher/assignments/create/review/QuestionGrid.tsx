"use client";

import { useEffect, useMemo, useState } from "react";
import QuestionView from "@/components/QuestionView";
import { DifficultyTag } from "@/components/Tag";
import type { Difficulty } from "@/data/types";
import { parseQuestion } from "@/lib/mathInput";
import { DIFFICULTIES } from "@/lib/review";

/** One tile of the review grid: the question as typed (or as the assessment changed or added it) and its label. */
export interface GridItem {
  id: string;
  text: string;
  difficulty: Difficulty;
  /** How the question came to be in the set; "typed" shows nothing. */
  origin?: "typed" | "changed" | "added";
}

/**
 * The draft in the student's five-wide tiles, each with its difficulty pill top right (ticket
 * 120). With `onLabel` the pill is a button that opens the four labels stacked beneath it; the
 * pick closes it, as does a press anywhere else or Escape. `animate` fades the pills in one
 * after another on arrival, the sign that the labelling was done for the teacher. A changed or
 * added question says so in a line at the foot of its tile.
 */
export default function QuestionGrid({ items, onLabel, animate = false }: { items: GridItem[]; onLabel?: (id: string, d: Difficulty) => void; animate?: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-label-picker]")) setOpen(null);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", down);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  return (
    <ol className="mt-6 grid grid-cols-5 gap-4" data-questions>
      {items.map((q, i) => (
        <li key={q.id} className="aspect-square min-h-0" data-question={i + 1} data-origin={q.origin && q.origin !== "typed" ? q.origin : undefined}>
          <Tile item={q} index={i} open={open === q.id} onOpen={onLabel ? () => setOpen((cur) => (cur === q.id ? null : q.id)) : undefined} onPick={onLabel ? (d) => { onLabel(q.id, d); setOpen(null); } : undefined} animate={animate} />
        </li>
      ))}
    </ol>
  );
}

function Tile({ item, index, open, onOpen, onPick, animate }: { item: GridItem; index: number; open: boolean; onOpen?: () => void; onPick?: (d: Difficulty) => void; animate: boolean }) {
  const parsed = useMemo(() => parseQuestion(item.text), [item.text]);
  const marked = item.origin === "changed" || item.origin === "added";
  // Whether this tile arrived with the animation on; a relabel later never replays it.
  const [arriving] = useState(animate);
  return (
    <div className={`relative flex h-full flex-col rounded-2xl border bg-paper p-5 shadow-card ${marked ? "border-accent-line" : "border-line"}`} data-tile={index + 1}>
      <div className="flex items-start justify-between gap-2">
        <span className="font-display text-[20px] leading-none text-ink" data-label>
          Q{index + 1}
        </span>
        <span className={`relative -mt-0.5 ${arriving ? "label-in" : ""}`} style={arriving ? { animationDelay: `${index * 90}ms` } : undefined} data-label-picker>
          {onOpen ? (
            <button type="button" onClick={onOpen} aria-haspopup="listbox" aria-expanded={open} aria-label={`Q${index + 1} difficulty: ${item.difficulty}`} className="rounded-full transition-shadow hover:shadow-card focus-visible:ring-2 focus-visible:ring-accent/40" data-difficulty={item.difficulty}>
              <DifficultyTag d={item.difficulty} />
            </button>
          ) : (
            <span data-difficulty={item.difficulty}>
              <DifficultyTag d={item.difficulty} />
            </span>
          )}
          {open && onPick && (
            <ul role="listbox" aria-label={`Q${index + 1} difficulty`} className="absolute right-0 top-full z-20 mt-1.5 flex w-max flex-col gap-1.5 rounded-xl border border-line bg-paper p-2 shadow-lift" data-label-menu>
              {DIFFICULTIES.map((d) => (
                <li key={d} role="option" aria-selected={d === item.difficulty}>
                  <button type="button" onClick={() => onPick(d)} className={`rounded-full ${d === item.difficulty ? "ring-2 ring-accent/40" : "hover:shadow-card"}`} data-label-option={d}>
                    <DifficultyTag d={d} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </span>
      </div>
      <div className="mt-2.5">
        <QuestionView parsed={parsed} />
      </div>
      {marked && (
        <div className="mt-auto pt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent-deep" data-origin-note>
          {item.origin === "changed" ? "Changed" : "Added"}
        </div>
      )}
    </div>
  );
}
