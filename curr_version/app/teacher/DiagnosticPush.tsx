"use client";

import { useState } from "react";
import M from "@/components/Math";
import { Button, Card, Eyebrow } from "@/components/ui";
import { DEMO_STUDENT } from "@/data/assignment";
import { DIAGNOSTICS, type Diagnostic } from "@/data/diagnostic";
import { customQuestion, isCorrect } from "@/lib/diagnostic";
import type { StudentSession } from "@/lib/session";
import { dispatch } from "@/lib/store";

type Tab = "example" | "own";

/**
 * Push a live diagnostic to the (mocked) class. Two tabs in the same shape: the fixture example,
 * and one the teacher writes here (stem, optional expression, up to four options, the right
 * one). Recorded or not is chosen before pushing; the pending band and the response are shared.
 */
export default function DiagnosticPush({ session }: { session: StudentSession | null }) {
  const example = DIAGNOSTICS[0];
  const [tab, setTab] = useState<Tab>("example");
  const [recorded, setRecorded] = useState(false);
  const [stem, setStem] = useState("");
  const [tex, setTex] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState("a");
  const own = customQuestion(stem, tex, options, correct, 0);
  const pending = session?.diagnostic ?? null;
  const answers = (session?.diagnosticAnswers ?? []).filter((a) => (tab === "example" ? a.questionId === example.id : !!a.question));
  const last = answers[answers.length - 1];

  const push = (q: Diagnostic) => dispatch({ type: "diagnostic/push", questionId: q.id, recorded, question: q.id === example.id ? undefined : q });

  return (
    <Card className="p-6" data-diagnostic-push>
      <div className="flex items-center justify-between">
        <Eyebrow>Live diagnostic</Eyebrow>
        <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-ink-soft">
          <span>{recorded ? "Recorded" : "Not recorded"}</span>
          <button
            type="button"
            role="switch"
            aria-checked={recorded}
            onClick={() => setRecorded((r) => !r)}
            disabled={!!pending}
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
            className={`rounded-full px-3 py-1.5 font-medium transition-colors ${tab === t ? "bg-ink text-white" : "text-ink-soft hover:text-ink"}`}
            data-diag-tab={t}
          >
            {t === "example" ? "Example" : "Your own"}
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
        {pending ? (
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
          <Button variant="accent" onClick={() => push(example)} data-push>
            Push
          </Button>
        ) : (
          <Button variant="accent" disabled={!own} onClick={() => own && push(customQuestion(stem, tex, options, correct)!)} data-push-own>
            Push
          </Button>
        )}
      </div>
      {last && !pending && (
        <div className={`mt-3 rounded-xl border px-4 py-3 text-[13px] ${isCorrect(last.questionId, last.option, last.question) ? "border-secure-line bg-secure-soft" : "border-wrong-line bg-wrong-soft"}`} data-response>
          <span className="font-medium text-ink">{DEMO_STUDENT.name.split(" ")[0]}</span> · <span className="font-semibold uppercase">{last.option}</span> ·{" "}
          {isCorrect(last.questionId, last.option, last.question) ? "right" : "wrong"} · {last.recorded ? "recorded" : "not recorded"}
          {answers.length > 1 && <span className="text-ink-muted"> · {answers.length} pushes</span>}
        </div>
      )}
    </Card>
  );
}
