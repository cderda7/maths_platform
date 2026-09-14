"use client";

import type { Picker } from "@/components/DiagnosticResults";
import DiagnosticStem from "@/components/DiagnosticStem";
import FitStem from "@/components/FitStem";
import FitText from "@/components/FitText";
import M from "@/components/Math";
import type { DiagnosticStep } from "@/data/diagnostic";
import { problemLabelOf, repeatedSlip, studentFor, type SlipRow } from "@/lib/diagnostic";

/**
 * The pieces of one step question the teacher reads in two places (ticket 260): the Mistakes view's flyout, where steps
 * are chosen, and the focused view a sent chain runs in. Both read at the problem cards' size (ticket 194).
 */

/** "1 · FIND THE PAIR" and how many of the problem's rows slipped at that step ("3 slipped here"). */
export function StepHeading({ index, step, slipped }: { index: number; step: DiagnosticStep; slipped: number }) {
  return (
    // In a card too narrow for the name and the count on one line (the focused view on a long chain, a `@container` card), the count goes under the name.
    <div className="flex items-baseline justify-between gap-4 @max-[300px]:flex-col @max-[300px]:gap-0.5">
      <span className="min-w-0 text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-muted" data-step-name>
        {index + 1} · {step.name}
      </span>
      <span className={`shrink-0 whitespace-nowrap text-[14px] ${slipped > 0 ? "font-medium text-wrong" : "text-ink-muted"}`} data-slipped={slipped}>
        {slipped} slipped here
      </span>
    </div>
  );
}

/**
 * A step not answered yet: its question and its four options, the right one green (the teacher's view). Two equal columns
 * as the result grid after a send, A and C sharing a width (ticket 207); one column where the card is too narrow for two
 * (`@container` on the card, ticket 260). Each option scales to its cell (`FitText`), never splitting or overflowing.
 */
export function StepQuestion({ step: q }: { step: DiagnosticStep }) {
  return (
    <>
      <FitStem max={17} fitKey={q.id} className="mt-3 leading-snug text-ink" data-diag-stem>
        <DiagnosticStem question={q} />
      </FitStem>
      <ul className="mt-4 grid grid-cols-2 gap-2 text-ink @max-[300px]:grid-cols-1" data-diag-options>
        {q.options.map((o) => (
          <li key={o.id} className={`flex min-w-0 items-baseline gap-2 rounded-xl border px-3 py-1.5 ${o.id === q.correct ? "border-secure-line bg-secure-soft" : "border-line bg-paper"}`} data-option={o.id}>
            <span className="shrink-0 text-[12px] font-semibold uppercase text-ink-muted">{o.id}</span>
            <div className="min-w-0 flex-1 text-[16px]">
              <FitText max={16} fitKey={`${q.id}:${o.id}`}>
                <M tex={o.tex} />
              </FitText>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Who picked each option as avatars (ticket 242): names from the roster, a student repeating their own slip on the problem marked with its label ("Q1"). */
export function pickersFor(q: DiagnosticStep, ids: Record<string, string[]>, rows: readonly SlipRow[]): Record<string, Picker[]> {
  const label = problemLabelOf(q) ?? undefined;
  return Object.fromEntries(
    Object.entries(ids).map(([option, who]) => [
      option,
      who.flatMap((id) => {
        const s = studentFor(id);
        return s ? [{ ...s, repeatedOn: repeatedSlip(q, id, option, rows) ? label : undefined }] : [];
      }),
    ]),
  );
}
