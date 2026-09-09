"use client";

import { useState } from "react";
import M from "@/components/Math";
import { Button, Card, Eyebrow } from "@/components/ui";
import { DEMO_STUDENT } from "@/data/assignment";
import { DIAGNOSTICS } from "@/data/diagnostic";
import { isCorrect } from "@/lib/diagnostic";
import type { StudentSession } from "@/lib/session";
import { dispatch } from "@/lib/store";

/** Push a live diagnostic to the (mocked) class. Recorded or not, chosen before pushing. */
export default function DiagnosticPush({ session }: { session: StudentSession | null }) {
  const d = DIAGNOSTICS[0];
  const [recorded, setRecorded] = useState(false);
  const pending = session?.diagnostic ?? null;
  const answers = (session?.diagnosticAnswers ?? []).filter((a) => a.questionId === d.id);
  const last = answers[answers.length - 1];
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
      <p className="mt-2 text-[14px] text-ink">
        {d.stem} <M tex={d.tex} />?
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5 text-[12.5px] text-ink-soft">
        {d.options.map((o) => (
          <span key={o.id} className={`rounded-lg border px-2 py-1 ${o.id === d.correct ? "border-secure-line bg-secure-soft" : "border-line bg-paper"}`}>
            <span className="mr-1 text-[10px] font-semibold uppercase text-ink-muted">{o.id}</span>
            <M tex={o.tex} />
          </span>
        ))}
      </div>
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
        ) : (
          <Button variant="accent" onClick={() => dispatch({ type: "diagnostic/push", questionId: d.id, recorded })} data-push>
            Push
          </Button>
        )}
      </div>
      {last && !pending && (
        <div className={`mt-3 rounded-xl border px-4 py-3 text-[13px] ${isCorrect(d.id, last.option) ? "border-secure-line bg-secure-soft" : "border-wrong-line bg-wrong-soft"}`} data-response>
          <span className="font-medium text-ink">{DEMO_STUDENT.name.split(" ")[0]}</span> · <span className="font-semibold uppercase">{last.option}</span> ·{" "}
          {isCorrect(d.id, last.option) ? "right" : "wrong"} · {last.recorded ? "recorded" : "not recorded"}
          {answers.length > 1 && <span className="text-ink-muted"> · {answers.length} pushes</span>}
        </div>
      )}
    </Card>
  );
}
