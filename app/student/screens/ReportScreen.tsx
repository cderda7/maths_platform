"use client";

import { Button, Card, Eyebrow } from "@/components/ui";
import SkillColumns from "@/components/SkillColumns";
import { ASSIGNMENT } from "@/data/assignment";
import { pathwayOf } from "@/lib/classroom";
import { outcomeColumns, type Outcome } from "@/lib/report";
import { isMastery } from "@/lib/peers";
import { useAssignment, useClassroom } from "@/lib/classroom-store";
import { sessionEvidence, sessionHierarchy } from "@/lib/hierarchy";
import type { SessionAction, StudentSession } from "@/lib/session";

const sentences = (t: string) => t.split(/[.!?]+/).map((x) => x.trim()).filter(Boolean).length;

/** The tile tint per column: green right away, blue after the student's own rework, amber after the group's, red still wrong. */
const TILE: Record<Outcome, string> = {
  first: "border-secure-line bg-secure-soft",
  individual: "border-standout-line bg-standout-soft",
  group: "border-developing-line bg-developing-soft",
  wrong: "border-wrong-line bg-wrong-soft",
};

/**
 * The final report: the skills laid out as the teacher's class-view row (a column per category,
 * every group shown at once), where every problem ended up as a tile in a column per review
 * stage the teacher set, and a short reflection that must be written before the report can go.
 * No scores anywhere.
 */
export default function ReportScreen({ session, dispatch }: { session: StudentSession; dispatch: (a: SessionAction) => void }) {
  const assignment = useAssignment();
  const { problems } = assignment;
  const classroom = useClassroom();
  const hierarchy = sessionHierarchy(session, assignment);
  const columns = outcomeColumns(session, pathwayOf(classroom), classroom.group, problems);
  const n = sentences(session.reflection);
  const written = session.reflection.trim() !== "";
  const sent = session.reportSent;
  const mastery = isMastery(session);

  return (
    <div className="grid h-full min-h-0 grid-cols-[1fr_320px]">
      <section className="flex min-h-0 flex-col overflow-y-auto px-9 py-7">
        <Eyebrow>{useAssignment().title}</Eyebrow>
        <h1 className="font-display mt-2 text-[30px] leading-tight text-ink">Your report</h1>
        <div className="mt-2 flex items-center justify-between gap-4">
          <p className="text-[13px] text-ink-muted">What {ASSIGNMENT.teacher} sees</p>
          <Button variant="ghost" className="whitespace-nowrap" onClick={() => dispatch({ type: "history/open" })}>
            Your working →
          </Button>
        </div>

        {/* No overflow-hidden here: as a flex child it would let the card shrink and clip an opened skill's work. */}
        <Card className="mt-5 shrink-0" data-hierarchy>
          <SkillColumns result={hierarchy} lines={sessionEvidence(session).lines} problems={problems} student />
        </Card>

        {mastery && (
          <Card tone="soft" className="mt-3 flex items-center justify-between gap-4 px-4 py-3" data-mastery>
            <div className="text-[14.5px] font-medium text-ink">Every step held</div>
            <Button variant="secondary" className="whitespace-nowrap" onClick={() => dispatch({ type: "peers/open" })}>
              Where the class is stuck →
            </Button>
          </Card>
        )}

        <Card className="mt-3 p-4" data-outcomes>
          <Eyebrow>What happened</Eyebrow>
          <div className="mt-3 grid gap-4" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
            {columns.map((c) => (
              <div key={c.id} data-outcome={c.id}>
                {/* Two lines tall whether the label wraps or not, so every column's tiles start on the same row. */}
                <div className="min-h-[33px] text-[12px] font-medium leading-snug text-ink-soft">{c.label}</div>
                {c.problems.length === 0 ? (
                  <div className="mt-2 text-[13px] text-ink-muted">None</div>
                ) : (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {c.problems.map((p) => (
                      <li key={p.id} className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-[13px] font-medium text-ink ${TILE[c.id]}`}>
                        {p.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Card>
      </section>

      <aside className="flex min-h-0 flex-col border-l border-line bg-paper/60 px-8 py-7">
        <div className="mt-auto">
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
          <div className="mt-2 min-h-4 text-[12px] text-ink-muted">{n === 0 ? "" : `${n} ${n === 1 ? "sentence" : "sentences"}`}</div>
          <div className="pt-4">
            {sent ? (
              <div className="rounded-2xl border border-secure-line bg-secure-soft px-5 py-4 text-[14px] text-ink" data-sent>
                Sent to {ASSIGNMENT.teacher}
              </div>
            ) : (
              <Button size="lg" hit className="w-full" disabled={!written} onClick={() => dispatch({ type: "report/send" })} data-send>
                Send to {ASSIGNMENT.teacher}
              </Button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
