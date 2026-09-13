"use client";

import Link from "next/link";
import { assignmentHref, LIVE_ASSIGNMENT_ID } from "@/lib/assignments";
import DiagnosticResults from "@/components/DiagnosticResults";
import { Card, Eyebrow } from "@/components/ui";
import { boardDiagnostic, latestDiagnostic, questionFor, tally } from "@/lib/diagnostic";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { useNow } from "@/lib/store";

export const DIAGNOSTIC_CHIP = "inline-flex items-center gap-1.5 rounded-md bg-accent px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white";

/**
 * The class view's diagnostic card (ticket 137). Nothing sent yet: a white box with the chip, a
 * link to the mistake view where questions are chosen and sent. Once a question is out it shows
 * the latest one's result and stays that way: the question, each option with its count and its
 * misconception, the right one green; while the class is still answering, a pulsing count and
 * Withdraw. "show on board" from the first answer, "clear board" while the board has it (by hand
 * or on its own at 20/20).
 */
export default function DiagnosticCard({ className = "" }: { className?: string }) {
  const classroom = useClassroom();
  const now = useNow();
  const run = latestDiagnostic(classroom);
  const question = run && questionFor(run.questionId, run.question);
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
  const open = run.answer === undefined;
  const onBoard = boardDiagnostic(classroom, now) === run;
  return (
    <Card className={`p-6 ${className}`} data-diagnostic-card={open ? "open" : "done"}>
      <div className="flex items-center justify-between">
        <Eyebrow className={DIAGNOSTIC_CHIP}>Live diagnostic</Eyebrow>
        <span className="flex items-center gap-2 text-[12.5px] text-ink-soft" data-diag-status>
          {open && <span className="h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden />}
          {t.answered}/{t.total} {open ? "in" : "answered"}
        </span>
      </div>
      <DiagnosticResults question={question} tally={t} className="mt-3" />
      <div className="mt-3 flex items-center justify-between text-[12.5px]">
        <span>
          {open && (
            <button type="button" className="text-accent-deep hover:underline" onClick={() => dispatchClassroom({ type: "diagnostic/withdraw" })} data-diag-withdraw>
              Withdraw
            </button>
          )}
        </span>
        {onBoard ? (
          <button type="button" className="text-accent-deep hover:underline" onClick={() => dispatchClassroom({ type: "diagnostic/board", on: false })} data-diag-board="clear">
            clear board
          </button>
        ) : (
          t.answered > 0 && (
            <button type="button" className="text-accent-deep hover:underline" onClick={() => dispatchClassroom({ type: "diagnostic/board", on: true })} data-diag-board="show">
              show on board
            </button>
          )
        )}
      </div>
    </Card>
  );
}
