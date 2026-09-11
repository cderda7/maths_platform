"use client";

import { useMemo, useState } from "react";
import QuestionView from "@/components/QuestionView";
import { DifficultyTag } from "@/components/Tag";
import type { Difficulty } from "@/data/types";
import { parseQuestion } from "@/lib/mathInput";
import { nextDifficulty } from "@/lib/review";

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
 * 120). With `onLabel` the pill is a button: a tap rotates the label to the next of the four
 * (simple familiar → simple unfamiliar → complex familiar → complex unfamiliar → round again;
 * ticket 122). `animate` fades the pills in one after another on arrival, the sign that the
 * labelling was done for the teacher. A changed or added question says so in a line at the foot
 * of its tile.
 */
export default function QuestionGrid({ items, onLabel, animate = false }: { items: GridItem[]; onLabel?: (id: string, d: Difficulty) => void; animate?: boolean }) {
  return (
    <ol className="mt-6 grid grid-cols-5 gap-4" data-questions>
      {items.map((q, i) => (
        <li key={q.id} className="aspect-square min-h-0" data-question={i + 1} data-origin={q.origin && q.origin !== "typed" ? q.origin : undefined}>
          <Tile item={q} index={i} onRotate={onLabel ? () => onLabel(q.id, nextDifficulty(q.difficulty)) : undefined} animate={animate} />
        </li>
      ))}
    </ol>
  );
}

function Tile({ item, index, onRotate, animate }: { item: GridItem; index: number; onRotate?: () => void; animate: boolean }) {
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
        <span className={`-mt-0.5 ${arriving ? "label-in" : ""}`} style={arriving ? { animationDelay: `${index * 90}ms` } : undefined} data-label-picker>
          {onRotate ? (
            <button type="button" onClick={onRotate} aria-label={`Q${index + 1} difficulty: ${item.difficulty}. Tap for the next.`} className="rounded-full transition-shadow hover:shadow-card focus-visible:ring-2 focus-visible:ring-accent/40" data-difficulty={item.difficulty}>
              <DifficultyTag d={item.difficulty} />
            </button>
          ) : (
            <span data-difficulty={item.difficulty}>
              <DifficultyTag d={item.difficulty} />
            </span>
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
