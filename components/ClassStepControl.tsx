"use client";

import { graceFor, isPending } from "@/lib/classroom";
import { CLASS_STEP_WORD, type ClassStep } from "@/lib/classReview";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { useNow } from "@/lib/store";

const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/**
 * The one control that moves class review on (ticket 344), in the same place on the board and on the laptop: through the
 * question's steps ("Worked example", "First line" / "Next line", "Students' turn"), then "Next question" — or "Finish" on
 * the last question — which starts the five-second countdown (`advance/start`, ticket 145's machinery with class review's
 * own grace). While it runs the button gives way to the countdown with Cancel, as force submit's does, so the class on the
 * board and the teacher on the laptop read the same seconds. A question with no pair has the one move on and no steps.
 */
export default function ClassStepControl({ step, reveal, lines, last, hasPair, size }: { step: ClassStep; reveal: number; lines: number; last: boolean; hasPair: boolean; size: "board" | "laptop" }) {
  const classroom = useClassroom();
  const now = useNow();
  const advance = classroom.advance;
  const pending = isPending(classroom, now) && advance?.kind === "class-review-next";
  const board = size === "board";
  if (pending && advance)
    return (
      <span className={`flex items-center gap-2 whitespace-nowrap text-ink ${board ? "text-[20px]" : "text-[15px]"}`} data-class-countdown={last ? "finish" : "next"}>
        <span className={`shrink-0 animate-pulse rounded-full bg-accent ${board ? "h-2.5 w-2.5" : "h-1.5 w-1.5"}`} aria-hidden />
        {last ? "Finishing in" : "Next question in"}{" "}
        {/* The clock ticks once a second, so a fresh countdown never claims more than the grace (ticket 145). */}
        <span className="tabular-nums">{mmss(Math.min(graceFor("class-review-next"), advance.deadline - now))}</span>
        <span aria-hidden>·</span>
        <button type="button" className="text-accent-deep hover:underline" onClick={() => dispatchClassroom({ type: "advance/clear" })} data-class-countdown-cancel>
          Cancel
        </button>
      </span>
    );
  const moving = !hasPair || step === "turn";
  const label = moving ? (last ? "Finish" : "Next question →") : step === "examples" ? `${CLASS_STEP_WORD.worked} →` : reveal < lines ? (reveal === 0 ? "First line" : "Next line") : `${CLASS_STEP_WORD.turn} →`;
  return (
    <button
      type="button"
      className={`whitespace-nowrap rounded-full bg-ink font-medium text-white transition-colors hover:bg-ink-soft ${board ? "px-6 py-2 text-[16px]" : "px-6 py-2.5 text-[15px]"}`}
      onClick={() => dispatchClassroom(moving ? { type: "advance/start", kind: "class-review-next" } : { type: "wc/next" })}
      data-class-step={step}
      data-class-forward={moving ? "move" : "step"}
    >
      {label}
    </button>
  );
}
