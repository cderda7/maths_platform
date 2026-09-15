"use client";

import Link from "next/link";
import type { PipelineStep, StepName } from "@/lib/createPipeline";

/**
 * The quiet step line under the heading of a set being created: the kind's pipeline in order (`PIPELINES` in
 * `lib/createPipeline`, ticket 288), the current step in ink, the ones behind it in soft ink and tappable
 * (Questions is the create screen; an earlier step here is Back), the ones ahead muted. `locked` while the
 * assessment runs, and while Send is lit after Create: nothing is tappable then. Send is never a page, so it is
 * never tappable either.
 */
export default function Steps({ steps, current, locked = false, onBack }: { steps: readonly PipelineStep[]; current: StepName; locked?: boolean; onBack?: (step: StepName) => void }) {
  const at = steps.findIndex((s) => s.id === current);
  return (
    <ol className="mt-5 flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.12em]" data-steps data-step={current} data-locked={locked || undefined}>
      {steps.map((s, i) => {
        const done = i < at;
        // A button does not inherit the case from the list (the preflight resets it), so it is set again.
        const cls = `uppercase ${i === at ? "text-ink" : done ? "text-ink-soft hover:text-ink" : "text-ink-muted/60"}`;
        const back = done && !locked;
        return (
          <li key={s.id} className="flex items-center gap-3" data-step-item={s.id} data-current={i === at || undefined}>
            {i > 0 && <span className="h-px w-5 bg-line-strong" aria-hidden />}
            {back && s.id === "questions" ? (
              <Link href="/teacher/assignments/create" className={cls}>
                {s.label}
              </Link>
            ) : back && onBack && s.id !== "send" ? (
              <button type="button" onClick={() => onBack(s.id)} className={cls}>
                {s.label}
              </button>
            ) : (
              <span className={cls}>{s.label}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
