"use client";

import { useState } from "react";
import DiagnosticResults, { type Picker } from "@/components/DiagnosticResults";
import DiagnosticStem from "@/components/DiagnosticStem";
import FitText from "@/components/FitText";
import M from "@/components/Math";
import { Button, Card } from "@/components/ui";
import type { DiagnosticStep } from "@/data/diagnostic";
import DiagnosticControl from "@/components/DiagnosticControl";
import { liveDiagnostic, pickersAt, problemLabelOf, repeatedSlip, runFor, slippedAt, stepsFor, studentFor, tally } from "@/lib/diagnostic";
import { chainPosition, currentIndex, forceDeadline, inSolutionOrder } from "@/lib/diagnosticChain";
import type { MistakeRow } from "@/lib/mistakes";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { useNow } from "@/lib/store";
import { DIAGNOSTIC_CHIP as CHIP } from "./DiagnosticCard";

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
 * selection in solution order, whatever order it was clicked in. While a chain is out nothing can be
 * selected or sent, from here or from another problem's flyout. The chain's steps show their live
 * result grids as they open (counts, the right option green, from the push); the current one carries
 * "1st of 3", how many have answered, Withdraw (discards the whole chain) and the teacher's one
 * control. A step sent before keeps its latest result grid, and can be selected again.
 */
export default function DiagnosticPush({ problemId, rows, className = "" }: { problemId: string; rows: readonly MistakeRow[]; className?: string }) {
  const classroom = useClassroom();
  const now = useNow();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const steps = stepsFor(problemId);
  const live = liveDiagnostic(classroom);
  /** This panel's chain is out: the chip carries a badge while it is. */
  const mine = !!live && steps.some((s) => live.steps.includes(s.id));
  const label = problemLabelOf(steps[0]) ?? undefined;
  const pickersOf = (q: DiagnosticStep, ids: Record<string, string[]>): Record<string, Picker[]> =>
    Object.fromEntries(
      Object.entries(ids).map(([option, who]) => [
        option,
        who.flatMap((id) => {
          const s = studentFor(id);
          return s ? [{ ...s, repeatedOn: repeatedSlip(q, id, option, rows) ? label : undefined }] : [];
        }),
      ]),
    );
  const toggle = (id: string) => setSelected((sel) => (sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]));
  const send = () => {
    dispatchClassroom({ type: "diagnostic/push", steps: inSolutionOrder(selected) });
    setSelected([]);
  };

  const chip = (
    <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className={`${CHIP} relative transition-colors hover:bg-accent-deep`} data-diag-toggle={problemId}>
      <ChipLabel open={open} />
      {/* A badge on the corner, not in the row: the chip keeps its width, so the cards' right edges stay in line. */}
      {mine && !open && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 animate-pulse rounded-full bg-white ring-2 ring-accent" aria-hidden data-diag-waiting />}
    </button>
  );

  const step = (q: DiagnosticStep, index: number) => {
    const inLive = live ? live.steps.indexOf(q.id) : -1;
    const liveIndex = live ? currentIndex(live) : -1;
    /** The step's result to show: its place in the chain that is out once it has opened, else its latest earlier send. */
    const shown = live && inLive >= 0 ? (inLive <= liveIndex ? { run: live, index: inLive } : null) : runFor(classroom, q.id);
    const current = !!live && inLive >= 0 && inLive === liveIndex;
    const t = shown && tally(shown.run, now, shown.index);
    /** Who picked each option (ticket 242), the students repeating their own slip on this problem marked. */
    const pickers = shown && pickersOf(q, pickersAt(shown.run, now, shown.index));
    const selectable = !live;
    const isSelected = selectable ? selected.includes(q.id) : inLive >= 0;
    const slipped = slippedAt(q, rows);
    const border = isSelected ? "border-accent ring-1 ring-accent" : selectable ? "border-line hover:border-ink-muted" : "border-line";
    return (
      <section
        key={q.id}
        className={`relative -mx-3 rounded-xl border px-3 pt-2.5 pb-3 transition-colors ${index === 0 ? "mt-4" : "mt-3"} ${border} ${selectable ? "cursor-pointer" : ""}`}
        onClick={selectable ? () => toggle(q.id) : undefined}
        onKeyDown={selectable ? (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggle(q.id)) : undefined}
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
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-muted" data-step-name>
            {index + 1} · {q.name}
          </span>
          <span className={`shrink-0 text-[14px] ${slipped > 0 ? "font-medium text-wrong" : "text-ink-muted"}`} data-slipped={slipped}>
            {slipped} slipped here
          </span>
        </div>
        {shown && t ? (
          <DiagnosticResults question={q} tally={t} size="panel" pickers={pickers ?? undefined} className="mt-3" />
        ) : (
          <>
            <p className="mt-3 text-[17px] leading-snug text-ink" data-diag-stem>
              <DiagnosticStem question={q} />
            </p>
            {/* Two equal columns, as the result grid after a send: A and C share a width, B and D start on one line (ticket 207). */}
            <ul className="mt-4 grid grid-cols-2 gap-2 text-ink" data-diag-options>
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
        )}
        {/* The current step of the chain that is out: where it is in the chain, how many have answered, Withdraw and the one control. */}
        {current && live && t && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-accent-line bg-accent-soft/50 px-3 py-2.5 text-[14px] text-ink" data-pending>
            <span className="flex items-center gap-2 whitespace-nowrap">
              {/* The pulse while answers come in; the countdown carries its own. */}
              {!t.revealed && forceDeadline(live, now) === null && <span className="h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden />}
              {chainPosition(live) && (
                <>
                  <span data-chain-position>{chainPosition(live)}</span>
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
            <DiagnosticControl size="panel" />
          </div>
        )}
        {current && (
          <div className="mt-2 flex text-[14px]">
            <button type="button" className="text-accent-deep hover:underline" onClick={() => dispatchClassroom({ type: "diagnostic/withdraw" })} data-diag-withdraw>
              Withdraw
            </button>
          </div>
        )}
      </section>
    );
  };

  const body = (
    <>
      <div className="flex items-center">{chip}</div>
      <div data-diag-steps>{steps.map(step)}</div>
      <div className="mt-4 flex justify-end">
        <Button variant="sky" disabled={selected.length === 0 || !!live} title={live ? "A diagnostic is out with the class" : undefined} onClick={send} data-push-chain={selected.length}>
          send {selected.length} to class
        </Button>
      </div>
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
        {open ? (
          <DiagnosticFootprint data-diag-footprint />
        ) : (
          chip
        )}
      </div>
      {open && (
        <div ref={clampToViewport} className="absolute" style={{ top: CHIP_TOP - FRAME, left: -FRAME }} data-diag-flyout>
          <Card className="w-[460px] p-6 shadow-lift">{body}</Card>
          {/* Room under a tall flyout, so the page scrolls its last send button clear of the demo's corner controls; unhoverable, so the pointer over it has left. */}
          <div className="pointer-events-none h-16" aria-hidden />
        </div>
      )}
    </div>
  );
}
