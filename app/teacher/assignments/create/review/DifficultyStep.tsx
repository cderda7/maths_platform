"use client";

import Link from "next/link";
import QuestionGrid from "./QuestionGrid";
import { Button } from "@/components/ui";
import { DifficultyTag } from "@/components/Tag";
import type { Difficulty } from "@/data/types";
import type { DraftQuestion } from "@/lib/classroom";
import { countByDifficulty, DIFFICULTIES, labelsOf } from "@/lib/review";

/**
 * The difficulty step: the draft's tiles, each with its label, and the count of each label
 * above the grid. A tap on a label rotates it to the next of the four. "Assess set" bottom right
 * runs the assessment.
 */
export default function DifficultyStep({ questions, overrides, onLabel, onAssess }: { questions: DraftQuestion[]; overrides: Record<string, Difficulty>; onLabel: (id: string, d: Difficulty) => void; onAssess: () => void }) {
  const labels = labelsOf(questions, overrides);
  const counts = countByDifficulty(Object.values(labels));
  return (
    <div className="pb-24" data-difficulty-step>
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
      <QuestionGrid items={questions.map((q) => ({ id: q.id, text: q.text, difficulty: labels[q.id] }))} onLabel={onLabel} animate />
      <div className="fixed bottom-16 right-6 z-30 flex items-center gap-3">
        <Link href="/teacher/assignments/create" className="rounded-full px-4 py-2 text-[13.5px] font-medium text-ink-soft hover:bg-cream-deep hover:text-ink" data-back>
          Back
        </Link>
        <Button size="lg" onClick={onAssess} className="shadow-lift" data-assess>
          Assess set
        </Button>
      </div>
    </div>
  );
}
