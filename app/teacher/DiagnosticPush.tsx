"use client";

import { useState, type ReactNode } from "react";
import M from "@/components/Math";
import { Button, Card, Eyebrow } from "@/components/ui";
import { DEMO_STUDENT } from "@/data/assignment";
import { DIAGNOSTICS, type Diagnostic } from "@/data/diagnostic";
import { customQuestion, isCorrect, pushBelongsTo } from "@/lib/diagnostic";
import type { StudentSession } from "@/lib/session";
import { dispatch } from "@/lib/store";

type Tab = "example" | "own";

const CHIP = "inline-flex items-center gap-1.5 rounded-md bg-accent px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white";

/** The flyout's frame: the card's border (1) plus padding (24) so the chip in flow sits exactly where the card's own chip would. */
const FRAME = 25;
/** The collapsed chip's top: centred on the problem card's header row beside it (1 px border, then 69 px of header, the chip 25 tall). */
const CHIP_TOP = 23;

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
 * Push a live diagnostic to the (mocked) class. Two tabs in the same shape: the suggested
 * example (the class view's fixture, or the problem's own on the mistake view), and one the
 * teacher writes here (stem, optional expression, up to four options, the right one). Respond
 * online or not recorded is chosen before pushing; the pending band and the response show in
 * the panel the push came from. On the mistake view the panel is `collapsible`: the "Live
 * diagnostic" chip stays in flow beside the problem and a click opens the card as a flyout
 * from the chip's corner, down and to the right over blank space; the problem card beside it
 * never changes size (ticket 132).
 */
export default function DiagnosticPush({
  session,
  example = DIAGNOSTICS[0],
  problemId,
  collapsible = false,
  className = "",
}: {
  session: StudentSession | null;
  /** The question the example tab suggests. */
  example?: Diagnostic;
  /** The problem the panel sits beside; a question written here is filed under it. */
  problemId?: string;
  collapsible?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(!collapsible);
  const [tab, setTab] = useState<Tab>("example");
  const [recorded, setRecorded] = useState(false);
  const [stem, setStem] = useState("");
  const [tex, setTex] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState("a");
  const own = customQuestion(stem, tex, options, correct, 0, problemId);
  const pending = session?.diagnostic ?? null;
  /** A push waiting on the class: this panel's own, or another panel's (which holds the send buttons). */
  const mine = !!pending && pushBelongsTo(pending, example, problemId);
  const elsewhere = !!pending && !mine;
  const answers = (session?.diagnosticAnswers ?? []).filter((a) => pushBelongsTo(a, example, problemId) && (tab === "example" ? !a.question : !!a.question));
  const last = answers[answers.length - 1];

  const push = (q: Diagnostic) => dispatch({ type: "diagnostic/push", questionId: q.id, recorded, question: q.id === example.id ? undefined : q });

  const chipLabel = (
    <>
      Live diagnostic
      {collapsible && (
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className={`transition-transform ${open ? "rotate-90" : ""}`}>
          <path d="M3 1.5 6.5 5 3 8.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </>
  );
  const chip = collapsible ? (
    <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className={`${CHIP} relative transition-colors hover:bg-accent-deep`} data-diag-toggle={problemId}>
      {chipLabel}
      {/* A badge on the corner, not in the row: the chip keeps its width, so the cards' right edges stay in line. */}
      {mine && !open && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 animate-pulse rounded-full bg-white ring-2 ring-accent" aria-hidden data-diag-waiting />}
    </button>
  ) : (
    <Eyebrow className={`${CHIP} inline-block`}>{chipLabel}</Eyebrow>
  );

  /** The card's content; `head` is what sits top-left beside the switch (the chip, or its footprint under the chip in flow). */
  const body = (head: ReactNode) => (
    <>
      <div className="flex items-center justify-between">
        {head}
        <label className="flex items-center gap-2 text-[12.5px] text-ink-soft">
          <span>{recorded ? "respond online" : "not recorded"}</span>
          <button
            type="button"
            role="switch"
            aria-checked={recorded}
            onClick={() => setRecorded((r) => !r)}
            disabled={mine}
            className={`relative h-5 w-9 rounded-full transition-colors ${recorded ? "bg-accent" : "bg-line-strong"} disabled:opacity-50`}
            data-recorded-toggle
          >
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${recorded ? "left-0.5 translate-x-4" : "left-0.5"}`} />
          </button>
        </label>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1 rounded-full border border-line bg-cream/60 p-1 text-[12.5px]" role="tablist">
        {(["example", "own"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1.5 font-medium transition-colors ${tab === t ? "bg-standout-soft text-standout" : "text-ink-soft hover:text-ink"}`}
            data-diag-tab={t}
          >
            {t === "example" ? "example" : "make your own"}
          </button>
        ))}
      </div>

      {tab === "example" ? (
        <div data-diag-example>
          <p className="mt-3 text-[14px] text-ink">
            {example.stem} <M tex={example.tex} />?
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5 text-[12.5px] text-ink-soft">
            {example.options.map((o) => (
              <span key={o.id} className={`rounded-lg border px-2 py-1 ${o.id === example.correct ? "border-secure-line bg-secure-soft" : "border-line bg-paper"}`}>
                <span className="mr-1 text-[10px] font-semibold uppercase text-ink-muted">{o.id}</span>
                <M tex={o.tex} />
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-3 space-y-2" data-diag-own>
          <input value={stem} onChange={(e) => setStem(e.target.value)} placeholder="Question" aria-label="Question" className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-[14px] text-ink outline-none focus:border-accent" data-own-stem />
          <input value={tex} onChange={(e) => setTex(e.target.value)} placeholder="Expression (TeX, optional)" aria-label="Expression" className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-[14px] text-ink outline-none focus:border-accent" data-own-tex />
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
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px] font-semibold uppercase ${correct === id ? "border-secure-line bg-secure-soft text-secure" : "border-line bg-paper text-ink-muted"}`}
                    data-own-correct={id}
                  >
                    {id}
                  </button>
                  <input
                    value={o}
                    onChange={(e) => setOptions((os) => os.map((x, n) => (n === i ? e.target.value : x)))}
                    placeholder={`Option ${id.toUpperCase()}`}
                    aria-label={`Option ${id.toUpperCase()}`}
                    className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-3 py-1.5 text-[13.5px] text-ink outline-none focus:border-accent"
                    data-own-option={id}
                  />
                  {o.trim() && (
                    <span className="hidden w-24 truncate text-[12.5px] text-ink-soft sm:block">
                      <M tex={o} />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-4">
        {mine ? (
          <div className="flex items-center justify-between rounded-xl border border-accent-line bg-accent-soft/50 px-4 py-3 text-[13px] text-ink" data-pending>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden />
              Waiting for {DEMO_STUDENT.name.split(" ")[0]}
            </span>
            <button type="button" className="text-accent-deep hover:underline" onClick={() => dispatch({ type: "diagnostic/withdraw" })}>
              Withdraw
            </button>
          </div>
        ) : tab === "example" ? (
          <Button variant="sky" disabled={elsewhere} title={elsewhere ? "Another diagnostic is waiting on the class" : undefined} onClick={() => push(example)} data-push>
            send to class
          </Button>
        ) : (
          <Button
            variant="sky"
            disabled={!own || elsewhere}
            title={elsewhere ? "Another diagnostic is waiting on the class" : undefined}
            onClick={() => own && push(customQuestion(stem, tex, options, correct, Date.now(), problemId)!)}
            data-push-own
          >
            send to class
          </Button>
        )}
      </div>
      {last && !mine && (
        <div className={`mt-3 rounded-xl border px-4 py-3 text-[13px] ${isCorrect(last.questionId, last.option, last.question) ? "border-secure-line bg-secure-soft" : "border-wrong-line bg-wrong-soft"}`} data-response>
          <span className="font-medium text-ink">{DEMO_STUDENT.name.split(" ")[0]}</span> · <span className="font-semibold uppercase">{last.option}</span> ·{" "}
          {isCorrect(last.questionId, last.option, last.question) ? "right" : "wrong"} · {last.recorded ? "recorded" : "not recorded"}
          {answers.length > 1 && <span className="text-ink-muted"> · {answers.length} pushes</span>}
        </div>
      )}
    </>
  );

  if (!collapsible)
    return (
      <Card className={`p-6 ${className}`} data-diagnostic-push="class">
        {body(chip)}
      </Card>
    );

  // Closed, the chip sits in flow. Open, its footprint holds that place (the row's layout never changes) and the chip is the
  // card's own, in the flyout laid from the chip's corner over whatever is below and to the right: unshifted, the chip is
  // exactly where it was; clamped to the viewport on a narrow window, it moves with its card. An open panel sits above the
  // chips of the rows beneath it.
  return (
    <div className={`relative ${open ? "z-40" : ""} ${className}`} data-diagnostic-push={problemId} data-collapsed={open ? undefined : true}>
      {/* A flex box, not a line box: an inline chip would sit a fraction lower on the text baseline than the card's flex row puts it. */}
      <div className="flex" style={{ paddingTop: CHIP_TOP }}>
        {open ? (
          <span className={`${CHIP} invisible`} aria-hidden data-diag-footprint>
            {chipLabel}
          </span>
        ) : (
          chip
        )}
      </div>
      {open && (
        <div ref={clampToViewport} className="absolute" style={{ top: CHIP_TOP - FRAME, left: -FRAME }} data-diag-flyout>
          <Card className="w-[380px] p-6 shadow-lift">{body(chip)}</Card>
        </div>
      )}
    </div>
  );
}
