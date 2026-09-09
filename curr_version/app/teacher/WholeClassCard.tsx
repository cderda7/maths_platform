"use client";

import Link from "next/link";
import { Card, Eyebrow } from "@/components/ui";
import { currentSlide, pathwayOf } from "@/lib/classroom";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";

/** Entry to whole-class review on the live view, only when the pathway includes it. */
export default function WholeClassCard() {
  const classroom = useClassroom();
  if (!pathwayOf(classroom).includes("whole-class")) return null;
  const slide = currentSlide(classroom);
  return (
    <Card className={`p-6 ${slide ? "border-accent-line" : ""}`} data-whole-class-card>
      <Eyebrow>Whole-class review</Eyebrow>
      {slide ? (
        <div className="mt-3 flex items-center justify-between text-[14px]">
          <span className="flex items-center gap-2 text-ink">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden />
            Projecting · problem {slide.index + 1} of {slide.total}
          </span>
          <span className="flex items-center gap-3">
            <Link href="/teacher/board" className="text-accent-deep hover:underline">
              Board →
            </Link>
            <button type="button" className="text-ink-soft hover:text-ink" onClick={() => dispatchClassroom({ type: "wc/end" })} data-wc-end>
              End
            </button>
          </span>
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
