"use client";

import { useState } from "react";
import Link from "next/link";
import TeacherChrome from "../TeacherChrome";
import M from "@/components/Math";
import { Avatar, Card, Eyebrow, H1 } from "@/components/ui";
import { DifficultyTag, LeafChip, SlipChip } from "@/components/Tag";
import { ASSIGNMENT } from "@/data/assignment";
import type { LeafId } from "@/data/taxonomy";
import { mistakesByProblem } from "@/lib/mistakes";
import { useBatchedSession } from "@/lib/store";
import { useAssignment } from "@/lib/classroom-store";

/**
 * Mistakes by problem. Under each problem the students who slipped sit side by side, each
 * with the step they got wrong under their name. Clicking any one of them opens every
 * student's working for that problem at once, a column each, the wrong line in red.
 */
export default function TeacherMistakes() {
  const { session } = useBatchedSession(3000);
  const groups = mistakesByProblem(session);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <TeacherChrome>
      <Eyebrow>
        {ASSIGNMENT.className} · {useAssignment().title}
      </Eyebrow>
      <H1 className="mt-3">Where it went wrong</H1>

      <div className="mt-10 space-y-6">
        {groups.map(({ problem, rows }) => {
          const subskills = [...new Set(rows.flatMap((r) => r.slips))] as LeafId[];
          const isOpen = open === problem.id;
          return (
            <Card key={problem.id} className="overflow-hidden" data-problem={problem.id} data-open={isOpen || undefined}>
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <div className="flex items-center gap-4">
                  <span className="font-display text-[24px] text-ink">{problem.label}</span>
                  <DifficultyTag d={problem.difficulty} />
                  <span className="math-lg text-ink">
                    <M tex={problem.tex} />
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[13px] text-ink-soft">
                  <span>
                    {rows.length} {rows.length === 1 ? "student" : "students"}
                  </span>
                  <span className="flex gap-1.5">
                    {subskills.map((id) => (
                      <LeafChip key={id} id={id} />
                    ))}
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <ol className="grid auto-cols-[minmax(230px,1fr)] grid-flow-col divide-x divide-line" data-students>
                  {rows.map((r) => {
                    const key = `${problem.id}:${r.id}`;
                    return (
                      <li key={r.id} className="flex min-w-0 flex-col" data-column={key}>
                        <button
                          type="button"
                          onClick={() => setOpen(isOpen ? null : problem.id)}
                          aria-expanded={isOpen}
                          className={`flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-cream-deep/40 ${isOpen ? "bg-accent-soft/30" : ""}`}
                          data-row={key}
                        >
                          <Avatar initials={r.initials} />
                          <span className="flex min-w-0 flex-col items-start gap-1.5">
                            <span className="flex items-center gap-2">
                              <span className="font-medium leading-8 text-ink">{r.name}</span>
                              {r.live && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-accent-line bg-paper px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-deep">
                                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden /> live
                                </span>
                              )}
                            </span>
                            <span className="flex flex-wrap gap-1.5">
                              {[...new Set(r.slips)].map((id) => (
                                <SlipChip key={id} id={id} />
                              ))}
                            </span>
                          </span>
                        </button>
                        {isOpen && (
                          <div className="flex-1 border-t border-line bg-cream/60 px-5 py-4" data-expanded>
                            <ol className="space-y-2">
                              {r.lines.map((l, i) => {
                                const wrong = l.verdict.verdict === "wrong";
                                return (
                                  <li key={i} className={`rounded-xl border px-4 py-2.5 text-[17px] text-ink ${wrong ? "border-wrong-line bg-wrong-soft" : "border-line bg-paper"}`} data-wrong={wrong || undefined}>
                                    <M tex={l.tex} />
                                  </li>
                                );
                              })}
                            </ol>
                            {r.live && (
                              <div className="mt-3 flex items-center justify-between text-[12.5px] text-ink-muted">
                                <span>As handed in</span>
                                <Link href="/teacher/compare" className="text-accent-deep hover:underline" data-compare-link>
                                  Original vs final →
                                </Link>
                              </div>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            </Card>
          );
        })}
        {groups.length === 0 && <Card className="p-6 text-[14px] text-ink-muted">No slips yet</Card>}
      </div>
    </TeacherChrome>
  );
}
