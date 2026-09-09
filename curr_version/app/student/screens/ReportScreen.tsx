"use client";

import M from "@/components/Math";
import { Button, Card, Eyebrow } from "@/components/ui";
import { StatusDot, STATUS_WORD } from "@/components/Tag";
import { ASSIGNMENT, PROBLEM_MAP } from "@/data/assignment";
import { PREREQ_IDS, SUBSKILL_MAP, TARGET_ID } from "@/data/subskills";
import { reportFacts } from "@/lib/report";
import { isMastery } from "@/lib/peers";
import type { SessionAction, StudentSession } from "@/lib/session";
import { subskillStatuses } from "@/lib/status";

const sentences = (t: string) => t.split(/[.!?]+/).map((x) => x.trim()).filter(Boolean).length;

/**
 * The final report: the same subskill colours the teacher sees, the starred problems, the
 * practices taken, and a short reflection sent to the teacher. No scores anywhere.
 */
export default function ReportScreen({ session, dispatch }: { session: StudentSession; dispatch: (a: SessionAction) => void }) {
  const st = subskillStatuses(session);
  const facts = reportFacts(session);
  const n = sentences(session.reflection);
  const sent = session.reportSent;
  const mastery = isMastery(session);

  return (
    <div className="grid h-full min-h-0 grid-cols-[1fr_440px]">
      <section className="flex min-h-0 flex-col overflow-y-auto px-9 py-7">
        <Eyebrow>{ASSIGNMENT.title}</Eyebrow>
        <h1 className="font-display mt-2 text-[30px] leading-tight text-ink">Your report</h1>
        <div className="mt-2 flex items-center justify-between gap-4">
          <p className="text-[13px] text-ink-muted">What {ASSIGNMENT.teacher} sees</p>
          <Button variant="ghost" className="whitespace-nowrap" onClick={() => dispatch({ type: "history/open" })}>
            Your working →
          </Button>
        </div>

        <Card className="mt-5 overflow-hidden">
          <ul className="divide-y divide-line" data-statuses>
            {[TARGET_ID, ...PREREQ_IDS].map((id) => {
              const s = SUBSKILL_MAP[id];
              const v = st[id];
              return (
                <li key={id} className="flex items-center gap-4 px-5 py-3">
                  <StatusDot status={v} size="h-3 w-3" />
                  <div className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
                    <span className="text-[14.5px] font-medium text-ink">{s.name}</span>
                    <span className={`text-[12px] font-medium ${v === "secure" ? "text-secure" : v === "developing" ? "text-developing" : v === "gap" ? "text-gap" : "text-ink-muted"}`}>
                      {STATUS_WORD[v]}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        {mastery && (
          <Card tone="soft" className="mt-3 flex items-center justify-between gap-4 px-4 py-3" data-mastery>
            <div className="text-[14.5px] font-medium text-ink">Every step held</div>
            <Button variant="secondary" className="whitespace-nowrap" onClick={() => dispatch({ type: "peers/open" })}>
              Where the class is stuck →
            </Button>
          </Card>
        )}

        <div className="mt-3 grid grid-cols-2 gap-3">
          <Card className="p-4">
            <Eyebrow>Starred</Eyebrow>
            {session.stars.length === 0 ? (
              <p className="mt-2 text-[13px] text-ink-muted">None</p>
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
          </Card>
          <Card className="p-4">
            <Eyebrow>What happened</Eyebrow>
            <ul className="mt-2 space-y-1 text-[13px] text-ink-soft">
              <li>
                {facts.slipped} of {facts.total} problems with a slip
              </li>
              <li>{facts.reworked.length > 0 ? `Reworked ${facts.reworked.join(", ")}` : "No rework"}</li>
              {facts.practices.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <aside className="flex min-h-0 flex-col border-l border-line bg-paper/60 px-8 py-7">
        <Eyebrow>Reflection</Eyebrow>
        <h2 className="font-display mt-2 text-[24px] leading-tight text-ink">Two or three sentences</h2>
        <textarea
          value={session.reflection}
          onChange={(e) => dispatch({ type: "reflection/set", text: e.target.value })}
          disabled={sent}
          rows={7}
          placeholder="What went wrong, and what you'd check next time…"
          className="mt-4 w-full resize-none rounded-2xl border border-line bg-paper px-4 py-3 text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink-muted/70 focus:border-accent disabled:bg-cream-deep/50"
          aria-label="Reflection"
        />
        <div className="mt-2 flex items-center justify-between text-[12px] text-ink-muted">
          <span>{n === 0 ? "" : `${n} ${n === 1 ? "sentence" : "sentences"}`}</span>
          <span>Optional</span>
        </div>
        <div className="mt-auto pt-6">
          {sent ? (
            <div className="rounded-2xl border border-secure-line bg-secure-soft px-5 py-4 text-[14px] text-ink" data-sent>
              Sent to {ASSIGNMENT.teacher}
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
