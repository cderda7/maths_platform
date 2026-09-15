"use client";

import Link from "next/link";
import QuestionGrid from "./QuestionGrid";
import { Button } from "@/components/ui";
import { DifficultyTag } from "@/components/Tag";
import type { Difficulty } from "@/data/types";
import type { DraftQuestion } from "@/lib/classroom";
import { countByDifficulty, DIFFICULTIES, labelsOf } from "@/lib/review";
import { CREATE_BAR, CREATE_BAR_CLEARANCE } from "../createBar";

/**
 * The difficulty step: the draft's tiles, each with its label, and the count of each label
 * above the grid. A tap on a label rotates it to the next of the four. "Assess set" bottom right
 * runs the assessment.
 */
export default function DifficultyStep({ backHref, questions, overrides, onLabel, onMove, onAssess }: { /** The kind's Questions page (ticket 291). */ backHref: string; questions: DraftQuestion[]; overrides: Record<string, Difficulty>; onLabel: (id: string, d: Difficulty) => void; onMove: (from: number, to: number) => void; onAssess: () => void }) {
  const labels = labelsOf(questions, overrides);
  const counts = countByDifficulty(Object.values(labels));
  return (
    <div className={CREATE_BAR_CLEARANCE} data-difficulty-step>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3" data-counts>
        {DIFFICULTIES.map((d) => (
          <span key={d} className="flex items-center gap-2" data-count={d}>
            <span className="font-display text-[22px] leading-none text-ink" data-count-n>
              {counts[d]}
            </span>
            <DifficultyTag d={d} />
          </span>
        ))}
        <span className="text-[13px] text-ink-muted">Tap a label to change it.</span>
      </div>
      <QuestionGrid items={questions.map((q) => ({ id: q.id, text: q.text, stem: q.stem, tex: q.tex, figureUrl: q.figureUrl, difficulty: labels[q.id] }))} onLabel={onLabel} onMove={onMove} animate />
      <div className={CREATE_BAR}>
        {/* Back is a paper pill like the create bar's secondary buttons, so it reads as a control over content scrolling beneath (ticket 188). */}
        <Link href={backHref} className="inline-flex items-center justify-center rounded-full border border-line-strong bg-paper px-6 py-3 text-[15px] font-medium text-ink shadow-lift transition-colors hover:border-ink-muted" data-back>
          Back
        </Link>
        <Button size="lg" onClick={onAssess} className="shadow-lift" data-assess>
          Assess set
        </Button>
      </div>
    </div>
  );
}
