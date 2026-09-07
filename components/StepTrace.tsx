import type { EvalStep, MarkerKind } from "@/data/types";
import { SUBSKILL_MAP } from "@/data/subskills";
import M from "./Math";

const MARKER: Record<
  MarkerKind,
  { glyph: string; ring: string; text: string; soft: string; line: string; word: string }
> = {
  sound: { glyph: "✓", ring: "bg-sound text-white", text: "text-sound", soft: "bg-sound-soft", line: "border-sound-line", word: "Sound" },
  shaky: { glyph: "~", ring: "bg-shaky text-white", text: "text-shaky", soft: "bg-shaky-soft", line: "border-shaky-line", word: "Shaky" },
  slip: { glyph: "×", ring: "bg-slip text-white", text: "text-slip", soft: "bg-slip-soft", line: "border-slip-line", word: "Slip" },
  unclear: { glyph: "?", ring: "bg-note text-white", text: "text-note", soft: "bg-note-soft", line: "border-note-line", word: "Unclear" },
};

export function MarkerBadge({ kind }: { kind: MarkerKind }) {
  const m = MARKER[kind];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${m.text}`}>
      <span className={`grid place-items-center h-4 w-4 rounded-full text-[10px] ${m.ring}`}>{m.glyph}</span>
      {m.word}
    </span>
  );
}

export function MarkerLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-muted">
      {(Object.keys(MARKER) as MarkerKind[]).map((k) => (
        <span key={k} className="inline-flex items-center gap-1.5">
          <span className={`grid place-items-center h-3.5 w-3.5 rounded-full text-[9px] ${MARKER[k].ring}`}>{MARKER[k].glyph}</span>
          {k === "sound" && "step holds"}
          {k === "shaky" && "holds, but not justified"}
          {k === "slip" && "doesn't hold"}
          {k === "unclear" && "can't tell yet"}
        </span>
      ))}
    </div>
  );
}

/**
 * Worked-solution trace: the student's steps laid out as a vertical derivation, each with a
 * marker in the margin, a plain-language label of what the step does, and a note where needed.
 * This replaces the essay-style inline-highlight + card sidebar pattern.
 */
export default function StepTrace({
  steps,
  compact = false,
  showSubskill = true,
  animate = false,
}: {
  steps: EvalStep[];
  compact?: boolean;
  showSubskill?: boolean;
  animate?: boolean;
}) {
  return (
    <ol className="relative">
      {steps.map((s, i) => {
        const m = MARKER[s.marker];
        const last = i === steps.length - 1;
        return (
          <li
            key={i}
            className={`relative flex gap-4 ${compact ? "pb-4" : "pb-6"} trace-line ${last ? "trace-last" : ""} ${animate ? "rise" : ""}`}
            style={animate ? { animationDelay: `${i * 70}ms` } : undefined}
          >
            <div
              className={`relative z-10 mt-1.5 shrink-0 grid place-items-center h-8 w-8 rounded-full text-[13px] font-semibold ${m.ring}`}
              title={m.word}
            >
              {m.glyph}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <div className={`py-1 ${compact ? "" : "math-lg"}`}>
                  <M tex={s.tex} />
                </div>
                <div className="flex items-center gap-2 text-[11.5px] text-ink-muted">
                  <span>{s.label}</span>
                  {showSubskill && s.subskill && (
                    <span className="rounded-full border border-line px-2 py-px text-[10.5px] bg-paper">
                      {SUBSKILL_MAP[s.subskill].short}
                    </span>
                  )}
                </div>
              </div>
              {s.note && (
                <div className={`mt-1.5 inline-block rounded-lg border px-3 py-1.5 text-[13px] leading-snug ${m.soft} ${m.line} text-ink-soft`}>
                  {s.note}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
