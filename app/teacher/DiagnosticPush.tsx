"use client";

import { useState } from "react";
import DiagnosticResults from "@/components/DiagnosticResults";
import FitText from "@/components/FitText";
import M from "@/components/Math";
import { Button, Card } from "@/components/ui";
import type { Diagnostic } from "@/data/diagnostic";
import { boardDiagnostic, customQuestion, openDiagnostic, pushBelongsTo, runFor, tally } from "@/lib/diagnostic";
import type { DiagnosticRun } from "@/lib/classroom";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { useNow } from "@/lib/store";
import { DIAGNOSTIC_CHIP as CHIP } from "./DiagnosticCard";

type Tab = "example" | "own";

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
 * blank space; the problem card never changes size (ticket 132). Two tabs in one shape: the
 * problem's own suggested question, and one the teacher writes here (stem, optional expression,
 * up to four options, the right one). Once a question is out (ticket 137) the tab's option grid is its result: each option with the
 * class's count and the misconception it reveals, the right one green, live as the answers land;
 * Withdraw while the class is still answering, then "show on board" / "clear board". Each tab
 * keeps its own latest result; a push waits its turn while another panel's is open. The flyout
 * collapses the moment the pointer leaves it (ticket 144); what the teacher had typed or chosen
 * (the tab, a question of their own) is state on this component, not on the flyout, so it is
 * there again when the chip is clicked next.
 */
export default function DiagnosticPush({ example, problemId, className = "" }: { example: Diagnostic; problemId: string; className?: string }) {
  const classroom = useClassroom();
  const now = useNow();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("example");
  const [stem, setStem] = useState("");
  const [tex, setTex] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState("a");
  const own = customQuestion(stem, tex, options, correct, 0, problemId);
  const pending = openDiagnostic(classroom);
  /** A push waiting on the class: this panel's own, or another panel's (which holds the send buttons). */
  const mine = !!pending && pushBelongsTo(pending, example, problemId);
  const elsewhere = !!pending && !mine;
  const exampleRun = runFor(classroom, example, problemId, false);
  const ownRun = runFor(classroom, example, problemId, true);

  const push = (q: Diagnostic) => dispatchClassroom({ type: "diagnostic/push", questionId: q.id, question: q.id === example.id ? undefined : q });

  const chip = (
    <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className={`${CHIP} relative transition-colors hover:bg-accent-deep`} data-diag-toggle={problemId}>
      <ChipLabel open={open} />
      {/* A badge on the corner, not in the row: the chip keeps its width, so the cards' right edges stay in line. */}
      {mine && !open && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 animate-pulse rounded-full bg-white ring-2 ring-accent" aria-hidden data-diag-waiting />}
    </button>
  );

  /** The action row under a tab: the waiting band with Withdraw while this panel's push is out, else send at the panel's bottom right (off while another panel's is). */
  const actions = (run: DiagnosticRun | null, send: () => void, disabled: boolean, attr: string) => (
    <div className="mt-4 flex justify-end">
      {mine && run ? (
        <div className="flex flex-1 items-center justify-between rounded-xl border border-accent-line bg-accent-soft/50 px-4 py-3 text-[15px] text-ink" data-pending>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden />
            Waiting · {tally(run, now).answered}/{tally(run, now).total} in
          </span>
          <button type="button" className="text-accent-deep hover:underline" onClick={() => dispatchClassroom({ type: "diagnostic/withdraw" })} data-diag-withdraw>
            Withdraw
          </button>
        </div>
      ) : (
        <Button variant="sky" size="lg" disabled={disabled || elsewhere} title={elsewhere ? "Another diagnostic is waiting on the class" : undefined} onClick={send} {...{ [attr]: true }}>
          send to class
        </Button>
      )}
    </div>
  );

  /** The board links under a result: "show on board" from the first answer, "clear board" while the board has it. Only the latest run can be on the board. */
  const boardLinks = (run: DiagnosticRun) => {
    const t = tally(run, now);
    const latest = classroom.diagnostics?.[classroom.diagnostics.length - 1] === run;
    if (!latest || t.answered === 0) return null;
    const onBoard = boardDiagnostic(classroom, now) === run;
    return (
      <div className="mt-2 flex justify-end text-[15px]">
        {onBoard ? (
          <button type="button" className="text-accent-deep hover:underline" onClick={() => dispatchClassroom({ type: "diagnostic/board", on: false })} data-diag-board="clear">
            clear board
          </button>
        ) : (
          <button type="button" className="text-accent-deep hover:underline" onClick={() => dispatchClassroom({ type: "diagnostic/board", on: true })} data-diag-board="show">
            show on board
          </button>
        )}
      </div>
    );
  };

  const body = (
    <>
      <div className="flex items-center">{chip}</div>

      <div className="mt-3 grid grid-cols-2 gap-1 rounded-full border border-line bg-cream/60 p-1 text-[15px]" role="tablist">
        {(["example", "own"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-2 font-medium transition-colors ${tab === t ? "bg-standout-soft text-standout" : "text-ink-soft hover:text-ink"}`}
            data-diag-tab={t}
          >
            {t === "example" ? "example" : "make your own"}
          </button>
        ))}
      </div>

      {tab === "example" ? (
        <div data-diag-example>
          {exampleRun ? (
            <>
              <DiagnosticResults question={example} tally={tally(exampleRun, now)} size="panel" className="mt-4" />
              {!mine && boardLinks(exampleRun)}
            </>
          ) : (
            <>
              <p className="mt-4 text-[17px] leading-snug text-ink" data-diag-stem>
                {example.stem}{" "}
                {/* The question mark stays with the maths: never a line of its own. */}
                <span className="whitespace-nowrap">
                  <M tex={example.tex} />?
                </span>
              </p>
              {/* Two equal columns, as the result grid after a send: A and C share a width, B and D start on one line (ticket 207). */}
              <ul className="mt-4 grid grid-cols-2 gap-2 text-ink" data-diag-options>
                {example.options.map((o) => (
                  <li key={o.id} className={`flex min-w-0 items-baseline gap-2 rounded-xl border px-3 py-1.5 ${o.id === example.correct ? "border-secure-line bg-secure-soft" : "border-line bg-paper"}`} data-option={o.id}>
                    <span className="shrink-0 text-[12px] font-semibold uppercase text-ink-muted">{o.id}</span>
                    <div className="min-w-0 flex-1 text-[16px]">
                      <FitText max={16} fitKey={`${example.id}:${o.id}`}>
                        <M tex={o.tex} />
                      </FitText>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
          {actions(exampleRun, () => push(example), false, "data-push")}
        </div>
      ) : (
        <div data-diag-own>
          <div className="mt-3 space-y-2">
            <input value={stem} onChange={(e) => setStem(e.target.value)} placeholder="Question" aria-label="Question" className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-[16px] text-ink outline-none focus:border-accent" data-own-stem />
            <input value={tex} onChange={(e) => setTex(e.target.value)} placeholder="Expression (TeX, optional)" aria-label="Expression" className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-[16px] text-ink outline-none focus:border-accent" data-own-tex />
            <ul className="space-y-1.5">
              {options.map((o, i) => {
                const id = "abcd"[i];
                return (
                  <li key={id} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCorrect(id)}
                      aria-pressed={correct === id}
                      title="Correct answer"
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[12px] font-semibold uppercase ${correct === id ? "border-secure-line bg-secure-soft text-secure" : "border-line bg-paper text-ink-muted"}`}
                      data-own-correct={id}
                    >
                      {id}
                    </button>
                    <input
                      value={o}
                      onChange={(e) => setOptions((os) => os.map((x, n) => (n === i ? e.target.value : x)))}
                      placeholder={`Option ${id.toUpperCase()}`}
                      aria-label={`Option ${id.toUpperCase()}`}
                      className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-3 py-2 text-[16px] text-ink outline-none focus:border-accent"
                      data-own-option={id}
                    />
                    {o.trim() && (
                      <span className="hidden w-32 shrink-0 text-ink sm:block" data-own-preview>
                        <FitText max={16} fitKey={o}>
                          <M tex={o} />
                        </FitText>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          {actions(ownRun, () => own && push(customQuestion(stem, tex, options, correct, now, problemId)!), !own, "data-push-own")}
          {ownRun && ownRun.question && (
            <>
              <DiagnosticResults question={ownRun.question} tally={tally(ownRun, now)} size="panel" className="mt-4 border-t border-line pt-4" />
              {!mine && boardLinks(ownRun)}
            </>
          )}
        </div>
      )}
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
        </div>
      )}
    </div>
  );
}
