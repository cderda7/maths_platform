"use client";

import FitText from "@/components/FitText";
import M from "@/components/Math";
import type { Diagnostic } from "@/data/diagnostic";
import type { Tally } from "@/lib/diagnostic";

/**
 * A diagnostic's result (ticket 137): the question, then one cell per option with the option as
 * written, how many of the class picked it, and (teacher side only) the misconception a
 * distractor reveals in five words or fewer; the right option's cell is green and says
 * "correct". The same component on the class view's card, in the mistake view's flyout and on
 * the board (`size="board"`, no misconceptions: the wording is the teacher's reasoning, not the
 * class's). Counts are live: the classmates' answers land over a few seconds after the push.
 */
export default function DiagnosticResults({ question: q, tally, size = "card", misconceptions = size !== "board", className = "" }: { question: Diagnostic; tally: Tally; size?: "card" | "board" | "panel"; misconceptions?: boolean; className?: string }) {
  const board = size === "board";
  /** The mistake view's flyout (ticket 194): read at the 17 px of the problem cards beside it, the class view's side card keeps its compact sizes. */
  const panel = size === "panel";
  const optionPx = board ? 26 : panel ? 16 : 12.5;
  return (
    <div className={className} data-diagnostic-results={q.id}>
      <p className={board ? "font-display text-[34px] leading-tight text-ink" : panel ? "text-[17px] leading-snug text-ink" : "text-[14px] text-ink"} data-diag-stem>
        {q.stem}
        {q.tex ? (
          <>
            {" "}
            <span className="whitespace-nowrap">
              <M tex={q.tex} />?
            </span>
          </>
        ) : (
          "?"
        )}
      </p>
      <ul className={`grid grid-cols-2 ${board ? "mt-8 gap-6" : panel ? "mt-4 gap-2" : "mt-3 gap-1.5"}`} data-diag-cells>
        {q.options.map((o) => {
          const correct = o.id === q.correct;
          const n = tally.counts[o.id] ?? 0;
          return (
            <li key={o.id} className={`min-w-0 border ${board ? "rounded-2xl px-6 py-5" : panel ? "rounded-xl px-3 py-2.5" : "rounded-lg px-2.5 py-1.5"} ${correct ? "border-secure-line bg-secure-soft" : "border-line bg-paper"}`} data-option={o.id} data-count={n} data-correct={correct || undefined}>
              <div className={`flex min-w-0 items-baseline ${board ? "gap-3" : panel ? "gap-2" : "gap-1.5"}`}>
                <span className={`shrink-0 font-semibold uppercase text-ink-muted ${board ? "text-[18px]" : panel ? "text-[12px]" : "text-[10px]"}`}>{o.id}</span>
                <div className="min-w-0 flex-1 text-ink" style={{ fontSize: optionPx }}>
                  <FitText max={optionPx} fitKey={`${q.id}:${o.id}`}>
                    <M tex={o.tex} />
                  </FitText>
                </div>
              </div>
              <div className={`text-ink-soft ${board ? "mt-2 text-[20px]" : panel ? "mt-1 text-[14px]" : "mt-0.5 text-[12px]"}`} data-students>
                {n}/{tally.total} students
              </div>
              {misconceptions && (
                <div className={`mt-0.5 line-clamp-2 leading-snug ${panel ? "text-[14px]" : "text-[11.5px]"} ${correct ? "font-medium text-secure" : "text-ink-muted"}`} data-misconception>
                  {correct ? "correct" : o.misconception ?? ""}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
