"use client";

import type { Confidence } from "@/data/types";

export const CONFIDENCE_OPTIONS: Confidence[] = ["not sure", "a bit unsure", "fairly sure", "certain"];

export default function ConfidenceCheck({
  value,
  onChange,
  prompt = "Before you check — how sure are you about this one?",
  compact = false,
}: {
  value: Confidence | null;
  onChange: (c: Confidence) => void;
  prompt?: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "" : "rounded-2xl border border-line bg-cream-deep/60 p-5"}>
      <div className="text-[13.5px] text-ink">{prompt}</div>
      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {CONFIDENCE_OPTIONS.map((c, i) => {
          const active = value === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              className={`rounded-xl border px-2 py-2.5 text-[12.5px] transition-colors ${
                active
                  ? "bg-ink text-white border-ink"
                  : "bg-paper border-line text-ink-soft hover:border-ink-muted"
              }`}
            >
              <div className="flex justify-center gap-0.5 mb-1.5" aria-hidden>
                {[0, 1, 2, 3].map((j) => (
                  <span key={j} className={`h-1 w-3 rounded-full ${j <= i ? (active ? "bg-white" : "bg-accent") : active ? "bg-white/30" : "bg-line"}`} />
                ))}
              </div>
              {c}
            </button>
          );
        })}
      </div>
      {!compact && (
        <div className="mt-2.5 text-[11.5px] text-ink-muted">
          This isn't marked. It helps you notice when your feeling and your working line up — and when they don't.
        </div>
      )}
    </div>
  );
}
