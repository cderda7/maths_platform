"use client";

import Link from "next/link";
import { Card, Eyebrow } from "@/components/ui";
import { PROBLEM_MAP } from "@/data/assignment";
import { boardCovered, currentSlide, isPending, lessonOver, pathwayOf } from "@/lib/classroom";
import { CLASS_STEP_WORD } from "@/lib/classReview";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { useNow } from "@/lib/store";

const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/**
 * Entry to whole-class review on the live view, only when the pathway includes it; the escape hatch while it runs. Once the
 * lesson is over (class review ended, or the lesson ended outright) the card reads "over", as the strip's class review pill and
 * the "· complete" beside the title do (ticket 335: it offered "Set up →" after the session had ended), naming the problems the
 * board went through when it was projected.
 */
export default function WholeClassCard() {
  const classroom = useClassroom();
  const now = useNow();
  if (!pathwayOf(classroom).includes("whole-class")) return null;
  const slide = currentSlide(classroom);
  const starting = isPending(classroom, now) && classroom.advance?.kind === "whole-class-start";
  const over = lessonOver(classroom);
  const covered = over ? (boardCovered(classroom) ?? []).map((id) => PROBLEM_MAP[id]?.label ?? id) : [];
  return (
    <Card className={`p-6 ${slide ? "border-accent-line" : ""}`} data-whole-class-card>
      <Eyebrow>Class review</Eyebrow>
      {slide ? (
        <div className="mt-3 text-[14px]">
          <span className="flex items-center gap-2 whitespace-nowrap text-ink" data-wc-status>
            <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-accent" aria-hidden />
            {starting && classroom.advance ? `Starting · ${mmss(classroom.advance.deadline - now)}` : `${CLASS_STEP_WORD[slide.step]} · problem ${slide.index + 1} of ${slide.total}`}
          </span>
          <div className="mt-3 flex items-center gap-2">
            <Link href="/teacher/board" className="inline-flex items-center rounded-full border border-line-strong bg-paper px-3.5 py-1.5 text-[13px] font-medium text-ink hover:border-ink-muted" data-wc-controls>
              Controls →
            </Link>
            <button type="button" className="inline-flex items-center rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-ink-soft" onClick={() => dispatchClassroom({ type: "wc/end" })} data-wc-end>
              End session
            </button>
          </div>
        </div>
      ) : over ? (
        <p className="mt-3 flex min-h-[37px] items-center gap-2 text-[13.5px] text-ink-muted" data-wc-over>
          <span className="font-medium text-ink-soft">Over</span>
          {covered.length > 0 && (
            <>
              <span aria-hidden>·</span>
              <span data-wc-covered>went through {covered.length === 1 ? covered[0] : `${covered.slice(0, -1).join(", ")} and ${covered[covered.length - 1]}`}</span>
            </>
          )}
        </p>
      ) : (
        <div className="mt-3">
          <Link href="/teacher/whole-class" className="inline-flex items-center rounded-full border border-line-strong bg-paper px-4 py-2 text-[13.5px] font-medium text-ink hover:border-ink-muted" data-wc-setup>
            Set up →
          </Link>
        </div>
      )}
    </Card>
  );
}
