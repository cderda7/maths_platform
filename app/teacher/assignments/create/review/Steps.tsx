"use client";

import Link from "next/link";

export type StepName = "questions" | "difficulty" | "assessment" | "pathway";
const ORDER: { id: StepName; label: string }[] = [
  { id: "questions", label: "Questions" },
  { id: "difficulty", label: "Difficulty" },
  { id: "assessment", label: "Assessment" },
  { id: "pathway", label: "Pathway" },
];

/**
 * The quiet step line under the heading of a new assignment: the four steps in order, the
 * current one in ink, the ones behind it in soft ink and tappable (Questions is the create
 * screen; an earlier step here is Back), the ones ahead muted. `locked` while the assessment
 * runs: nothing is tappable then, that run has no Back.
 */
export default function Steps({ current, locked = false, onBack }: { current: StepName; locked?: boolean; onBack?: (step: StepName) => void }) {
  const at = ORDER.findIndex((s) => s.id === current);
  return (
    <ol className="mt-5 flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-[0.12em]" data-steps data-step={current} data-locked={locked || undefined}>
      {ORDER.map((s, i) => {
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
            ) : back && onBack ? (
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
