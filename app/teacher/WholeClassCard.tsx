"use client";

import Link from "next/link";
import { Card, Eyebrow } from "@/components/ui";
import { currentSlide, isPending, pathwayOf } from "@/lib/classroom";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { useNow } from "@/lib/store";

const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/** Entry to whole-class review on the live view, only when the pathway includes it; the escape hatch while it runs. */
export default function WholeClassCard() {
  const classroom = useClassroom();
  const now = useNow();
  if (!pathwayOf(classroom).includes("whole-class")) return null;
  const slide = currentSlide(classroom);
  const starting = isPending(classroom, now) && classroom.advance?.kind === "whole-class-start";
  return (
    <Card className={`p-6 ${slide ? "border-accent-line" : ""}`} data-whole-class-card>
      <Eyebrow>Whole-class review</Eyebrow>
      {slide ? (
        <div className="mt-3 text-[14px]">
          <span className="flex items-center gap-2 whitespace-nowrap text-ink" data-wc-status>
            <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-accent" aria-hidden />
            {starting && classroom.advance ? `Starting · ${mmss(classroom.advance.deadline - now)}` : `Students frozen · problem ${slide.index + 1} of ${slide.total}`}
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
