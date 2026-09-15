"use client";

import DiagnosticStem from "@/components/DiagnosticStem";
import FitStem from "@/components/FitStem";
import FitText from "@/components/FitText";
import M from "@/components/Math";
import MathProse from "@/components/MathProse";
import type { Diagnostic } from "@/data/diagnostic";
import { misconceptionName } from "@/data/misconceptions";
import type { Tally } from "@/lib/diagnostic";

/**
 * A diagnostic's result (ticket 137): the question, then one cell per option with the option as
 * written, how many of the class picked it, and (teacher side only) the misconception a
 * distractor reveals in five words or fewer; the right option's cell is green and says
 * "correct". The same component on the class view's card, in the mistake view's flyout and on
 * the board (`size="board"`). Counts are live: the classmates' answers land over a few seconds
 * after the step opens.
 *
 * The board (ticket 241) shows no count per option, before or after the reveal (a lone student on
 * a wrong option could be embarrassed), no misconceptions (the teacher's reasoning, not the
 * class's), and the right option green only once the step is revealed (`tally.revealed`). The
 * teacher's surfaces show everything live from the push. Once revealed, each wrong option's cell on the board says what
 * picking it means, "If you chose A, you…" (ticket 304, the distractor's `ifChosen`), so the teacher need not supply it.
 *
 * In the mistake view's flyout only (`size="panel"` with `pickers`, ticket 242) each cell also shows who picked it: a row of
 * small initials avatars at the foot of the cell, under the count and its misconception, one per answer in the order they landed, wrapping inside the cell. A student whose
 * pick repeats the slip they made on the original problem wears the slip pill's red. The class card and the board are
 * never given pickers, and the board stays anonymous. The focused view a sent chain runs in (ticket 260) shows the same panel
 * results, pickers included, one card per step.
 */
export default function DiagnosticResults({
  question: q,
  tally,
  size = "card",
  pickers,
  className = "",
}: {
  question: Diagnostic;
  tally: Tally;
  size?: "card" | "board" | "panel";
  /** Who picked each option, by option id (ticket 242): shown on the panel only. */
  pickers?: Record<string, readonly Picker[]>;
  className?: string;
}) {
  const board = size === "board";
  const misconceptions = !board;
  const counts = !board;
  const green = !board || tally.revealed;
  /** The mistake view's flyout (ticket 194): read at the 17 px of the problem cards beside it, the class view's side card keeps its compact sizes. */
  const panel = size === "panel";
  const who = panel ? pickers : undefined;
  const optionPx = board ? 26 : panel ? 16 : 12.5;
  return (
    <div className={className} data-diagnostic-results={q.id}>
      {panel ? (
        // At the problem cards' size, or smaller where its widest maths would run past a narrow card (ticket 260).
        <FitStem max={17} fitKey={q.id} className="leading-snug text-ink" data-diag-stem>
          <DiagnosticStem question={q} />
        </FitStem>
      ) : (
        <p className={board ? "font-display text-balance text-[34px] leading-tight text-ink" : "text-[14px] text-ink"} data-diag-stem>
          <DiagnosticStem question={q} />
        </p>
      )}
      {/* In a card too narrow for two columns (the Mistakes view's focused view on a long chain, ticket 260: a `@container` card) the cells stack in one. */}
      <ul className={`grid grid-cols-2 ${board ? "mt-8 gap-6" : panel ? "mt-4 gap-2 @max-[300px]:grid-cols-1" : "mt-3 gap-1.5"}`} data-diag-cells>
        {q.options.map((o) => {
          const correct = green && o.id === q.correct;
          const n = tally.counts[o.id] ?? 0;
          return (
            <li key={o.id} className={`min-w-0 border ${board ? "rounded-2xl px-6 py-5" : panel ? "rounded-xl px-3 py-2.5" : "rounded-lg px-2.5 py-1.5"} ${correct ? "border-secure-line bg-secure-soft" : "border-line bg-paper"}`} data-option={o.id} data-count={counts ? n : undefined} data-correct={correct || undefined}>
              <div className={`flex min-w-0 items-baseline ${board ? "gap-3" : panel ? "gap-2" : "gap-1.5"}`}>
                <span className={`shrink-0 font-semibold uppercase text-ink-muted ${board ? "text-[18px]" : panel ? "text-[12px]" : "text-[10px]"}`}>{o.id}</span>
                <div className="min-w-0 flex-1 text-ink" style={{ fontSize: optionPx }}>
                  <FitText max={optionPx} fitKey={`${q.id}:${o.id}`}>
                    <M tex={o.tex} />
                  </FitText>
                </div>
              </div>
              {board && o.id !== q.correct && (
                // What picking it means (ticket 304), for the whole class once the step is revealed. Laid out, unseen, from the
                // push, so the cells are already their revealed height and the reveal moves nothing on the board. Two set lines,
                // "If you chose A," then the clause scaled to its row, so no word is ever left alone on a line.
                <p
                  className={`mt-2 text-[21px] leading-snug text-ink-soft ${tally.revealed ? "" : "invisible"}`}
                  aria-hidden={!tally.revealed || undefined}
                  data-if-chosen={o.id}
                  data-shown={tally.revealed || undefined}
                >
                  <span className="block">If you chose {o.id.toUpperCase()},{" "}</span>
                  <FitText max={21} fitKey={`${q.id}:${o.id}:if-chosen`}>
                    you <MathProse text={o.ifChosen ?? ""} />
                  </FitText>
                </p>
              )}
              {counts && (
                <div className={`text-ink-soft ${panel ? "mt-1 text-[14px]" : "mt-0.5 text-[12px]"}`} data-students>
                  {n}/{tally.total} students
                </div>
              )}
              {misconceptions && (
                // The misconception's name (ticket 302), then what this option does, which tells apart two options sharing a misconception.
                <div className={`mt-0.5 leading-snug ${panel ? "text-[14px]" : "text-[11.5px]"}`}>
                  <div className={correct ? "font-medium text-secure" : "text-ink-soft"} data-misconception>
                    {correct ? "correct" : o.misconception ? misconceptionName(o.misconception) : ""}
                  </div>
                  {!correct && o.detail && (
                    <div className="text-ink-muted" data-misconception-detail>
                      {o.detail}
                    </div>
                  )}
                </div>
              )}
              {who && (
                // Last in the cell, so the count and its misconception read as on every other surface. One avatar row held from the push, so the first answers landing move nothing; more rows wrap inside the cell.
                <div className="mt-1.5 flex min-h-[22px] flex-wrap gap-[3px]" data-pickers={o.id}>
                  {(who[o.id] ?? []).map((p) => (
                    <PickerAvatar key={p.id} picker={p} />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** A student who picked an option: their initials and name, and when their pick repeats their own slip on the original, that problem's label ("Q1"). */
export interface Picker {
  id: string;
  name: string;
  initials: string;
  repeatedOn?: string;
}

/**
 * The roster's avatar (`Avatar` in `components/ui`), smaller; a repeated slip in the mistake view's slip pill colours
 * (`SlipChip`), its title naming the student and the problem.
 */
function PickerAvatar({ picker: p }: { picker: Picker }) {
  const tone = p.repeatedOn ? "border-wrong-deep bg-wrong-soft text-wrong-deep" : "border-accent-line bg-accent-soft text-accent-deep";
  return (
    <span
      className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border text-[9px] leading-none font-semibold ${tone}`}
      title={p.repeatedOn ? `${p.name}, same slip as on ${p.repeatedOn}` : p.name}
      data-picker={p.id}
      data-repeated={p.repeatedOn ? true : undefined}
    >
      {p.initials}
    </span>
  );
}
