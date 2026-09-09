"use client";

import TeacherChrome from "../TeacherChrome";
import { Avatar, Card, Eyebrow, H1 } from "@/components/ui";
import { ASSIGNMENT } from "@/data/assignment";
import { reviewGroups } from "@/lib/groups";
import { useBatchedSession } from "@/lib/store";

/** During review groups: each group, one line per student, one shared note for why it formed. */
export default function TeacherGroups() {
  const { session } = useBatchedSession(3000);
  const groups = reviewGroups(session);
  return (
    <TeacherChrome>
      <Eyebrow>
        {ASSIGNMENT.className} · {ASSIGNMENT.title}
      </Eyebrow>
      <H1 className="mt-3">Review groups</H1>

      <div className="mt-10 grid grid-cols-2 gap-6">
        {groups.map((g, i) => (
          <Card key={g.id} className="self-start overflow-hidden" data-group={g.id}>
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div className="font-display text-[22px] text-ink">Group {i + 1}</div>
              <div className="flex gap-1.5 text-[12px] text-ink-muted">
                {g.discussing.length === 0
                  ? "all correct"
                  : g.discussing.map((id) => (
                      <span key={id} className="rounded-full border border-line bg-paper px-2 py-0.5">
                        {ASSIGNMENT.problems.find((p) => p.id === id)?.label}
                      </span>
                    ))}
              </div>
            </div>
            <ul className="divide-y divide-line">
              {g.members.map((m) => (
                <li key={m.id} className={`flex items-center justify-between px-6 py-3 ${m.live ? "bg-accent-soft/30" : ""}`} data-member={m.id}>
                  <span className="flex items-center gap-3">
                    <Avatar initials={m.initials} />
                    <span className="font-medium text-ink">{m.name}</span>
                    {m.live && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-accent-line bg-paper px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-deep">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden /> live
                      </span>
                    )}
                  </span>
                  <span className="text-[13px] text-ink-soft" data-status>
                    {m.status}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t border-line bg-cream/70 px-6 py-4">
              <Eyebrow>Formed around</Eyebrow>
              <p className="mt-1.5 text-[13.5px] leading-snug text-ink-soft" data-note>
                {g.note}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </TeacherChrome>
  );
}
