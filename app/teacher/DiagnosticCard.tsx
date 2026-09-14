"use client";

import Link from "next/link";
import { assignmentHref, LIVE_ASSIGNMENT_ID } from "@/lib/assignments";
import DiagnosticControl from "@/components/DiagnosticControl";
import DiagnosticResults from "@/components/DiagnosticResults";
import { Card, Eyebrow } from "@/components/ui";
import { liveDiagnostic, problemLabelOf, questionFor, tally } from "@/lib/diagnostic";
import { chainPosition, currentIndex } from "@/lib/diagnosticChain";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { useNow } from "@/lib/store";

export const DIAGNOSTIC_CHIP = "inline-flex items-center gap-1.5 rounded-md bg-accent px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white";

/**
 * The class view's diagnostic card (ticket 137). No chain out: a white box with the chip, a link to the mistake view where
 * steps are chosen and sent. While a chain is out (ticket 241) it shows the current step only, never an earlier or a later
 * one: "1st of 3" on a longer chain, how many have answered, the question and its live result grid (each option's count and
 * misconception, the right one green from the push), Withdraw, and the teacher's one control (force submit, next step,
 * back to work). Back to work or a withdraw returns it to the empty box. The step's problem ("Q1") leads the eyebrow line
 * above the question (ticket 242); who picked each option is the mistake view's flyout's alone, never shown here.
 */
export default function DiagnosticCard({ className = "" }: { className?: string }) {
  const classroom = useClassroom();
  const now = useNow();
  const run = liveDiagnostic(classroom);
  const question = run && questionFor(run.steps[currentIndex(run)]);
  if (!run || !question)
    return (
      <Link href={assignmentHref(LIVE_ASSIGNMENT_ID, "mistakes")} className={`block ${className}`} data-diagnostic-card="empty">
        <Card className="flex items-center justify-between p-6 transition-colors hover:border-ink-muted">
          <Eyebrow className={DIAGNOSTIC_CHIP}>Live diagnostic</Eyebrow>
          <span className="text-[12.5px] text-ink-soft">Mistakes →</span>
        </Card>
      </Link>
    );
  const t = tally(run, now);
  const position = chainPosition(run);
  const label = problemLabelOf(question);
  return (
    <Card className={`p-6 ${className}`} data-diagnostic-card={t.revealed ? "revealed" : "open"} data-step={question.id}>
      <div className="flex items-center justify-between gap-3">
        <Eyebrow className={`${DIAGNOSTIC_CHIP} shrink-0 whitespace-nowrap`}>Live diagnostic</Eyebrow>
        <span className="flex items-center gap-2 whitespace-nowrap text-[12.5px] text-ink-soft" data-diag-status>
          {!t.revealed && <span className="h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden />}
          <span data-diag-answered>
            <span className="tabular-nums">
              {t.answered}/{t.total}
            </span>{" "}
            answered
          </span>
        </span>
      </div>
      {/* The step's problem, since the similar problem no longer names it (ticket 242), and where the step is in a longer chain, on their own line above the question. */}
      {(label || position) && (
        <Eyebrow className="mt-3">
          {label && <span data-diag-problem>{label}</span>}
          {label && position && <span aria-hidden> · </span>}
          {position && <span data-chain-position>{position}</span>}
        </Eyebrow>
      )}
      <DiagnosticResults question={question} tally={t} className={label || position ? "mt-1.5" : "mt-3"} />
      <div className="mt-3 flex min-h-[26px] items-center justify-between text-[12.5px]">
        <button type="button" className="text-accent-deep hover:underline" onClick={() => dispatchClassroom({ type: "diagnostic/withdraw" })} data-diag-withdraw>
          Withdraw
        </button>
        <DiagnosticControl size="card" />
      </div>
    </Card>
  );
}
