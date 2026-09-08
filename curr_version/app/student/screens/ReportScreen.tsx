"use client";

import M from "@/components/Math";
import { Button, Card, Eyebrow } from "@/components/ui";
import { StatusDot, STATUS_WORD } from "@/components/Tag";
import { ASSIGNMENT, PROBLEM_MAP } from "@/data/assignment";
import { PREREQ_IDS, SUBSKILL_MAP, TARGET_ID } from "@/data/subskills";
import type { SubskillStatus } from "@/data/types";
import { feedbackFor } from "@/lib/feedback";
import type { SessionAction, StudentSession } from "@/lib/session";
import { subskillStatuses } from "@/lib/status";

const STATUS_LINE: Record<SubskillStatus, string> = {
  secure: "Every step that leaned on this held.",
  developing: "Some steps held, some didn't.",
  gap: "The steps that leaned on this didn't hold, or practice came up twice.",
  unseen: "Nothing in this set leaned on it.",
};

const sentences = (t: string) => t.split(/[.!?]+/).map((x) => x.trim()).filter(Boolean).length;

/**
 * The final report: the same subskill colours the teacher sees, the starred problems, the
 * practices taken, and a short reflection sent to the teacher. No scores anywhere.
 */
export default function ReportScreen({ session, dispatch }: { session: StudentSession; dispatch: (a: SessionAction) => void }) {
  const st = subskillStatuses(session);
  const fb = feedbackFor(session);
  const reworked = Object.keys(session.rework).filter((id) => (session.rework[id]?.length ?? 0) > 0);
  const n = sentences(session.reflection);
  const sent = session.reportSent;

  return (
    <div className="grid h-full min-h-0 grid-cols-[1fr_440px]">
      <section className="flex min-h-0 flex-col overflow-y-auto px-9 py-7">
        <Eyebrow>{ASSIGNMENT.title}</Eyebrow>
        <h1 className="font-display mt-2 text-[30px] leading-tight text-ink">Your report</h1>
        <p className="mt-2 text-[13.5px] leading-snug text-ink-soft">
          Exactly what {ASSIGNMENT.teacher} sees: how each skill held up, step by step. No marks, no percentages.
        </p>

        <Card className="mt-5 overflow-hidden">
          <ul className="divide-y divide-line" data-statuses>
            {[TARGET_ID, ...PREREQ_IDS].map((id) => {
              const s = SUBSKILL_MAP[id];
              const v = st[id];
              return (
                <li key={id} className="flex items-center gap-4 px-5 py-3">
                  <StatusDot status={v} size="h-3 w-3" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[14.5px] font-medium text-ink">{s.name}</span>
                      <span
                        className={`text-[12px] font-medium ${v === "secure" ? "text-secure" : v === "developing" ? "text-developing" : v === "gap" ? "text-gap" : "text-ink-muted"}`}
                      >
                        {STATUS_WORD[v]}
                      </span>
                    </div>
                    <div className="text-[12px] text-ink-muted">{STATUS_LINE[v]}</div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-4 border-t border-line px-5 py-2.5 text-[11.5px] text-ink-muted">
            {(["secure", "developing", "gap", "unseen"] as const).map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <StatusDot status={s} /> {STATUS_WORD[s]}
              </span>
            ))}
          </div>
        </Card>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Card className="p-4">
            <Eyebrow>Starred</Eyebrow>
            {session.stars.length === 0 ? (
              <p className="mt-2 text-[13px] text-ink-muted">Nothing starred.</p>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {session.stars.map((id) => (
                  <li key={id} className="flex items-center gap-2 text-[13.5px] text-ink">
                    <span aria-hidden>★</span> {PROBLEM_MAP[id].label}
                    <span className="text-ink-muted">
                      <M tex={PROBLEM_MAP[id].tex} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-[11.5px] text-ink-muted">Right, but worth coming back to.</p>
          </Card>
          <Card className="p-4">
            <Eyebrow>What happened</Eyebrow>
            <ul className="mt-2 space-y-1 text-[13px] text-ink-soft">
              <li>{fb.filter((p) => p.slips.length > 0).length} of {fb.length} problems had a step that didn't hold.</li>
              <li>{reworked.length > 0 ? `Reworked ${reworked.map((id) => PROBLEM_MAP[id].label).join(", ")} on your own.` : "No rework."}</li>
              {session.practices.map((p, i) => (
                <li key={i}>
                  {p.reason === "help" ? "Asked for help with" : "Offered practice on"} {SUBSKILL_MAP[p.subskill].short.toLowerCase()} · {p.accepted ? "took it" : "not now"}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <aside className="flex min-h-0 flex-col border-l border-line bg-paper/60 px-8 py-7">
        <Eyebrow>Your reflection</Eyebrow>
        <h2 className="font-display mt-2 text-[24px] leading-tight text-ink">Two or three sentences</h2>
        <p className="mt-2 text-[13px] leading-snug text-ink-soft">
          What went wrong and what you'd check next time. It goes to {ASSIGNMENT.teacher} beside the colours above, in your words.
        </p>
        <textarea
          value={session.reflection}
          onChange={(e) => dispatch({ type: "reflection/set", text: e.target.value })}
          disabled={sent}
          rows={7}
          placeholder="I guessed factor pairs in Q1 and Q2 without expanding back…"
          className="mt-4 w-full resize-none rounded-2xl border border-line bg-paper px-4 py-3 text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink-muted/70 focus:border-accent disabled:bg-cream-deep/50"
          aria-label="Reflection"
        />
        <div className="mt-2 flex items-center justify-between text-[12px] text-ink-muted">
          <span>
            {n === 0 ? "Nothing yet" : `${n} ${n === 1 ? "sentence" : "sentences"}`}
            {n > 3 && " · a bit long, but fine"}
          </span>
          <span>Optional</span>
        </div>
        <div className="mt-auto pt-6">
          {sent ? (
            <div className="rounded-2xl border border-secure-line bg-secure-soft px-5 py-4 text-[14px] text-ink" data-sent>
              Sent to {ASSIGNMENT.teacher}. Your report and reflection sit side by side on their screen.
            </div>
          ) : (
            <Button size="lg" className="w-full" onClick={() => dispatch({ type: "report/send" })}>
              {session.reflection.trim() ? `Send to ${ASSIGNMENT.teacher}` : "Send without a reflection"}
            </Button>
          )}
        </div>
      </aside>
    </div>
  );
}
