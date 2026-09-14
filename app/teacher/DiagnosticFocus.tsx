"use client";

import DiagnosticControl from "@/components/DiagnosticControl";
import DiagnosticResults from "@/components/DiagnosticResults";
import ProblemQuestion from "@/components/ProblemQuestion";
import type { Problem } from "@/data/types";
import { pickersAt, questionFor, slippedAt, stepsFor, tally, type SlipRow } from "@/lib/diagnostic";
import { chainPosition, currentIndex, forceDeadline, type DiagnosticRun } from "@/lib/diagnosticChain";
import { liveAbsent } from "@/lib/absence";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { useNow } from "@/lib/store";
import { pickersFor, StepHeading, StepQuestion } from "./DiagnosticStep";

/** A card's natural width, layout px: the flyout's (460). Narrower only when the chain would not fit the row. */
export const FOCUS_CARD = 460;
/** Between cards, layout px. */
export const FOCUS_GAP = 20;

/**
 * The Mistakes view while a diagnostic chain is out (ticket 260): the chain alone, in place of the problems. The user
 * (2026-09-14): "the teacher won't need to see the other questions when focused on one diagnostic question or chain of
 * qs … after all diagnostics answered & teacher selects 'done', return to mistakes page view. best to organize side by
 * side — so Q2 to the right of Q1, Q3 right of Q2, & the question / chain of questions is center aligned in the page".
 *
 * A header names the problem ("Q1 · Live diagnostic") over the whole question, stem then expression (ticket 271). Under it every step of the chain sits in one row,
 * in solution order, the row centred on the page: a step already asked keeps its result (counts, misconceptions, who
 * picked what, the students repeating their own slip marked); the step being asked carries the accent border and fills in
 * as answers land; a step still to come shows its question and options only, dimmed. Under the row, centred: where the
 * chain is and how many have answered, the teacher's one control (force submit, next question, done) and Withdraw, held
 * at the window's foot while the row runs taller than the window so the control is always in reach.
 *
 * Everything is read from the stored chain, so another tab's press, a switch to Class and back, or a reload shows the
 * same view. A chain wider than the page never scrolls or wraps: the cards narrow equally to fit one row (flex), and a
 * card too narrow for two columns of options stacks them in one (`@max-[300px]` in `StepQuestion` and
 * `DiagnosticResults`), its step's name over its slip count; an option scales inside its cell (`FitText`), a stem whose
 * widest maths would pass the card scales as a whole (`FitStem`), and maths never splits (`.katex` nowrap). The text
 * keeps its size otherwise: a narrower card, not a smaller one (DECISION_LOG.md, 2026-09-14, the focused view).
 */
export default function DiagnosticFocus({ run, problem, rows, className = "" }: { run: DiagnosticRun; problem: Problem | undefined; rows: readonly SlipRow[]; className?: string }) {
  const now = useNow();
  /** The live set's absent students (ticket 250): out of the answers and the counts. */
  const absent = liveAbsent(useClassroom());
  const index = currentIndex(run);
  const t = tally(run, now, index, absent);
  const position = chainPosition(run, index);
  const counting = forceDeadline(run, now, absent) !== null;
  return (
    <div className={className} data-diagnostic-focus={run.pushedAt}>
      <h1 className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-display text-[40px] leading-[1.15] text-ink md:text-[48px]" data-focus-header>
        {problem && (
          <>
            <span data-focus-problem>{problem.label}</span>
            <span className="text-ink-muted" aria-hidden>
              ·
            </span>
          </>
        )}
        <span>Live diagnostic</span>
      </h1>
      {/* The whole question under the header (ticket 271): the stem's words, then the expression, never the expression alone. */}
      {problem && (
        <p className="mt-2 max-w-[1100px] text-[22px] leading-snug text-ink" data-focus-question>
          <ProblemQuestion problem={problem} mathClass="text-[26px]" />
        </p>
      )}

      <div className="mt-8 flex items-stretch justify-center" style={{ gap: FOCUS_GAP }} data-focus-row>
        {run.steps.map((id, i) => {
          const q = questionFor(id);
          if (!q) return null;
          const state = i < index ? "asked" : i === index ? "current" : "later";
          const edge = state === "current" ? "border-accent ring-1 ring-accent shadow-lift" : "border-line shadow-card";
          const r = state === "later" ? null : tally(run, now, i, absent);
          return (
            <section
              key={id}
              className={`@container min-w-0 rounded-2xl border bg-paper px-5 pt-4 pb-5 transition-opacity ${edge} ${state === "later" ? "opacity-50" : ""}`}
              style={{ flex: `0 1 ${FOCUS_CARD}px` }}
              data-focus-step={id}
              data-state={state}
            >
              {/* The step's number among its problem's steps, as in the flyout it was sent from, and how many slipped on it in the original. */}
              <StepHeading index={Math.max(0, stepsFor(q.problemId).findIndex((x) => x.id === id))} step={q} slipped={slippedAt(q, rows)} />
              {r ? <DiagnosticResults question={q} tally={r} size="panel" pickers={pickersFor(q, pickersAt(run, now, i, absent), rows)} className="mt-3" /> : <StepQuestion step={q} />}
            </section>
          );
        })}
      </div>

      {/* Centred under the row, and held at the bottom of the window while the row runs taller than it, so the control is always in reach: the cards pass under a band of the page's ground. */}
      <div className="sticky bottom-0 z-10 flex flex-col items-center gap-2 pt-6 pb-4" style={{ background: "linear-gradient(to top, var(--color-cream) 72%, transparent)" }} data-focus-controls>
        <span className="flex items-center gap-2 whitespace-nowrap text-[15px] text-ink-soft" data-focus-status>
          {!t.revealed && !counting && <span className="h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden />}
          {position && (
            <>
              <span data-chain-position>{position}</span>
              <span aria-hidden>·</span>
            </>
          )}
          <span data-diag-answered>
            <span className="tabular-nums">
              {t.answered}/{t.total}
            </span>{" "}
            answered
          </span>
        </span>
        {/* The control's height held, so the countdown taking its place moves nothing; Withdraw on its own line under it, apart from the countdown's Cancel (as in the flyout, ticket 241). */}
        <div className="flex min-h-[42px] items-center">
          <DiagnosticControl size="focus" />
        </div>
        <button type="button" className="text-[14px] text-accent-deep hover:underline" onClick={() => dispatchClassroom({ type: "diagnostic/withdraw" })} data-diag-withdraw>
          Withdraw
        </button>
      </div>
    </div>
  );
}
