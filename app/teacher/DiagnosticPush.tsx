"use client";

import { useEffect, useRef } from "react";
import DiagnosticResults from "@/components/DiagnosticResults";
import ProblemQuestion from "@/components/ProblemQuestion";
import { Button, Card } from "@/components/ui";
import { useEscape } from "@/components/useEscape";
import type { DiagnosticStep } from "@/data/diagnostic";
import type { Problem } from "@/data/types";
import { liveDiagnostic, pickersAt, runFor, slippedAt, stepsFor, tally } from "@/lib/diagnostic";
import { currentIndex, inSolutionOrder } from "@/lib/diagnosticChain";
import type { MistakeRow } from "@/lib/mistakes";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { useNow } from "@/lib/store";
import { liveAbsent } from "@/lib/absence";
import { DIAGNOSTIC_CHIP as CHIP } from "./DiagnosticCard";
import { pickersFor, StepHeading, StepQuestion } from "./DiagnosticStep";
import { sentFrom, setFlyoutOpen, toggleStep, useFlyout } from "./diagnosticFlyout";

/** The flyout's frame: the card's border (1) plus padding (24) so the chip in flow sits exactly where the card's own chip would. */
const FRAME = 25;
/** The problem card's header row on the mistake view, in layout px: `py-4` around the 37 px maths line. The right count box beside the card centres on it too. */
export const PROBLEM_HEADER = 69;
/** The collapsed chip's top: centred on the problem card's header row beside it (1 px border, then the header, the chip 25 tall). */
const CHIP_TOP = 1 + (PROBLEM_HEADER - 25) / 2;

function ChipLabel({ open }: { open: boolean }) {
  return (
    <>
      Live diagnostic
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className={`transition-transform ${open ? "rotate-90" : ""}`}>
        <path d="M3 1.5 6.5 5 3 8.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </>
  );
}

/**
 * The open flyout's × (ticket 340): a press on it closes the flyout, beside Escape, a press outside and the pointer leaving.
 * Absolute in the card's top-right corner, its centre on the header row's (`top` given), so nothing in the card moves.
 */
function FlyoutClose({ problemId, top }: { problemId: string; top: number }) {
  return (
    <button
      type="button"
      onClick={() => setFlyoutOpen(problemId, false)}
      aria-label="Close the live diagnostic"
      className="absolute right-4 grid h-8 w-8 place-items-center rounded-full text-[20px] leading-none text-ink-muted transition-colors hover:bg-cream-deep hover:text-ink"
      style={{ top }}
      data-diag-close={problemId}
    >
      ×
    </button>
  );
}

/** The chip's footprint, unseen: holds the chip's place while its flyout is open, and the diagnostic column's width in the mistake view's title row (ticket 195). */
export function DiagnosticFootprint({ className = "", ...rest }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={`${CHIP} invisible ${className}`} aria-hidden {...rest}>
      <ChipLabel open={false} />
    </span>
  );
}

/**
 * Keeps an open flyout inside the viewport: measured after it mounts, shifted left by however
 * much it would overrun the right edge (a 16 px margin kept). Rects are in window px while the
 * teacher chrome is zoomed, so the shift is scaled back into the flyout's own px. Set on the node,
 * not in state: nothing else depends on it.
 */
function clampToViewport(el: HTMLDivElement | null) {
  if (!el) return;
  el.style.transform = "";
  const r = el.getBoundingClientRect();
  const scale = r.width / el.offsetWidth || 1;
  const over = r.right + 16 * scale - document.documentElement.clientWidth;
  if (over > 0) el.style.transform = `translateX(${-over / scale}px)`;
}

/**
 * The mistake view's live diagnostic, one beside each problem: the "Live diagnostic" chip in flow,
 * and on a click the push panel as a flyout from the chip's corner, down and to the right over
 * blank space; the problem card never changes size (ticket 132). The panel is the problem's step
 * questions (ticket 240), stacked in solution order and every one expanded: each asks one step of
 * a similar problem, headed for the teacher by the step's name and how many of the rows beside it
 * slipped at that step. The flyout grows down with its steps, the page scrolling with it (no scroll
 * box of its own), and collapses the moment the pointer leaves it (ticket 144).
 *
 * Sending is a chain (ticket 241): a click on a step's card selects it (accent border, a tick), a
 * second click clears it, nothing starts selected, and **send N to class** under the stack sends the
 * selection in solution order, whatever order it was clicked in. Sending closes the flyout: the chain
 * runs in the Mistakes view's focused view (`DiagnosticFocus`, ticket 260), which takes the page until
 * the teacher's done. A step sent before keeps its latest result grid here, and can be selected again.
 *
 * Whether the flyout is open and what is selected live in `diagnosticFlyout.ts`, not in this component's
 * state (ticket 260), so the flyout stays as it was when the Mistakes tree is mounted again.
 */
export default function DiagnosticPush({ problemId, rows, className = "" }: { problemId: string; rows: readonly MistakeRow[]; className?: string }) {
  const { open } = useFlyout(problemId);
  const setOpen = (o: boolean) => setFlyoutOpen(problemId, o);
  // Escape collapses the flyout (ticket 247), a way out for the keyboard and touch that the pointer's leave never gave; the chip is re-created on close, so focus goes to the new one.
  useEscape(open, () => setOpen(false), () => document.querySelector<HTMLElement>(`[data-diag-toggle="${CSS.escape(problemId)}"]`));

  const chip = (
    <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className={`${CHIP} relative transition-colors hover:bg-accent-deep`} data-diag-toggle={problemId}>
      <ChipLabel open={open} />
    </button>
  );

  const body = (
    <>
      <div className="flex items-center">{chip}</div>
      <DiagnosticSteps problemId={problemId} rows={rows} />
    </>
  );

  // Closed, the chip sits in flow. Open, its footprint holds that place (the row's layout never changes) and the chip is the
  // card's own, in the flyout laid from the chip's corner over whatever is below and to the right: unshifted, the chip is
  // exactly where it was; clamped to the viewport on a narrow window, it moves with its card. An open panel sits above the
  // chips of the rows beneath it. The flyout is a descendant of this wrapper, so one mouseleave covers the chip's footprint
  // and the whole panel: the pointer leaving either collapses it (ticket 144).
  return (
    <div className={`relative ${open ? "z-40" : ""} ${className}`} onMouseLeave={() => open && setOpen(false)} data-diagnostic-push={problemId} data-collapsed={open ? undefined : true}>
      {/* A flex box, not a line box: an inline chip would sit a fraction lower on the text baseline than the card's flex row puts it. */}
      <div className="flex" style={{ paddingTop: CHIP_TOP }}>
        {open ? <DiagnosticFootprint data-diag-footprint /> : chip}
      </div>
      {open && (
        <div ref={clampToViewport} className="absolute" style={{ top: CHIP_TOP - FRAME, left: -FRAME }} data-diag-flyout>
          <Card className="relative w-[460px] p-6 shadow-lift">
            {body}
            {/* Centred on the 25 px chip under the 24 px padding. */}
            <FlyoutClose problemId={problemId} top={24 + (25 - 32) / 2} />
          </Card>
          {/* Room under a tall flyout, so the page scrolls its last send button clear of the demo's corner controls; unhoverable, so the pointer over it has left. */}
          <div className="pointer-events-none h-16" aria-hidden />
        </div>
      )}
    </div>
  );
}

/**
 * A problem's step questions and the send (tickets 240, 241): the body of the live diagnostic's flyout, beside the card
 * (`DiagnosticPush`) or over the split's left column (`DiagnosticOverlay`, ticket 315). A click on a step's card selects it
 * (accent border, a tick), a second click clears it, nothing starts selected, and **send N to class** sends the selection
 * in solution order. A step sent before keeps its latest result grid, and can be selected again.
 */
export function DiagnosticSteps({ problemId, rows }: { problemId: string; rows: readonly MistakeRow[] }) {
  const classroom = useClassroom();
  const now = useNow();
  const { selected } = useFlyout(problemId);
  const steps = stepsFor(problemId);
  const live = liveDiagnostic(classroom);
  /** The live set's absent students (ticket 250): out of the answers and the count. */
  const absent = liveAbsent(classroom);
  const send = () => {
    dispatchClassroom({ type: "diagnostic/push", steps: inSolutionOrder(selected) });
    sentFrom(problemId);
  };

  const step = (q: DiagnosticStep, index: number) => {
    const inLive = live ? live.steps.indexOf(q.id) : -1;
    /** The step's latest result: an earlier send, or its place in the chain that is out once it has opened (the focused view covers this page while one is). */
    const shown = live && inLive >= 0 ? (inLive <= currentIndex(live) ? { run: live, index: inLive } : null) : runFor(classroom, q.id);
    const t = shown && tally(shown.run, now, shown.index, absent);
    const selectable = !live;
    const isSelected = selectable && selected.includes(q.id);
    const border = isSelected ? "border-accent ring-1 ring-accent" : selectable ? "border-line hover:border-ink-muted" : "border-line";
    return (
      <section
        key={q.id}
        className={`relative -mx-3 rounded-xl border px-3 pt-2.5 pb-3 transition-colors ${index === 0 ? "mt-4" : "mt-3"} ${border} ${selectable ? "cursor-pointer" : ""}`}
        onClick={selectable ? () => toggleStep(problemId, q.id) : undefined}
        onKeyDown={selectable ? (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggleStep(problemId, q.id)) : undefined}
        role={selectable ? "button" : undefined}
        tabIndex={selectable ? 0 : undefined}
        aria-pressed={selectable ? isSelected : undefined}
        data-diag-step={q.id}
        data-step-index={index}
        data-selected={isSelected || undefined}
      >
        {/* The tick on the card's corner, over its border: the card's contents never move when it comes and goes. */}
        {isSelected && (
          <span className="absolute -top-2 -right-2 grid h-5 w-5 place-items-center rounded-full bg-accent text-white shadow-card" aria-hidden data-step-tick>
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M2 5.2 4.1 7.3 8 2.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
        <StepHeading index={index} step={q} slipped={slippedAt(q, rows)} />
        {shown && t ? <DiagnosticResults question={q} tally={t} size="panel" pickers={pickersFor(q, pickersAt(shown.run, now, shown.index, absent), rows)} className="mt-3" /> : <StepQuestion step={q} />}
      </section>
    );
  };

  return (
    <>
      <div data-diag-steps>{steps.map(step)}</div>
      <div className="mt-4 flex justify-end">
        <Button variant="sky" disabled={selected.length === 0 || !!live} title={live ? "A diagnostic is out with the class" : undefined} onClick={send} data-push-chain={selected.length}>
          send {selected.length} to class
        </Button>
      </div>
    </>
  );
}

/**
 * The split's live diagnostic button (ticket 315): at the top left of a mistake card's header, it opens the problem's step
 * flyout over the left column (`DiagnosticOverlay`) and, pressed again, closes it. The card's header opens the problem on a
 * press; the button's press is its own.
 */
export function DiagnosticChip({ problemId, className = "" }: { problemId: string; className?: string }) {
  const { open } = useFlyout(problemId);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setFlyoutOpen(problemId, !open);
      }}
      aria-expanded={open}
      className={`${CHIP} shrink-0 whitespace-nowrap transition-colors hover:bg-accent-deep ${className}`}
      data-diag-toggle={problemId}
    >
      <ChipLabel open={open} />
    </button>
  );
}

/**
 * The open flyout over the split's left column, below the headers (ticket 315): the problem named as its card names it
 * ("Live diagnostic", the label, the whole question), then its steps and the send (`DiagnosticSteps`). Nothing while no
 * flyout is open. It covers the rows, never the mistakes. Its ×, Escape, a press anywhere outside it (other than a Live diagnostic
 * button, whose own press opens or closes) and sending close it; the pointer leaving does not, since it has to cross from
 * the card's button to reach it.
 */
export function DiagnosticOverlay({ problem, rows }: { problem: Pick<Problem, "id" | "label" | "stem" | "tex" | "figure">; rows: readonly MistakeRow[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const close = () => setFlyoutOpen(problem.id, false);
  useEscape(true, close, () => document.querySelector<HTMLElement>(`[data-diag-toggle="${CSS.escape(problem.id)}"]`));
  useEffect(() => {
    const press = (e: PointerEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      if (!target || ref.current?.contains(target) || target.closest("[data-diag-toggle]")) return;
      setFlyoutOpen(problem.id, false);
    };
    document.addEventListener("pointerdown", press, true);
    return () => document.removeEventListener("pointerdown", press, true);
  }, [problem.id]);
  return (
    <div ref={ref} data-diag-flyout={problem.id} data-diag-overlay>
      <Card className="relative p-6 shadow-lift">
        {/* Centred on the header row: its ~44 px line box under the 24 px padding, the × 32 tall. */}
        <FlyoutClose problemId={problem.id} top={22} />
        <div className="flex items-baseline gap-3 pr-10">
          <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent-deep">Live diagnostic</span>
          <span className="shrink-0 font-display text-[24px] leading-none text-ink">{problem.label}</span>
          <p className="min-w-0 text-[15px] leading-snug text-ink" data-overlay-question>
            <ProblemQuestion problem={problem} />
          </p>
        </div>
        <DiagnosticSteps problemId={problem.id} rows={rows} />
      </Card>
      {/* Room under a tall flyout, so the page scrolls its last send button clear of the presenter's strip; unhoverable. */}
      <div className="pointer-events-none h-16" aria-hidden />
    </div>
  );
}
