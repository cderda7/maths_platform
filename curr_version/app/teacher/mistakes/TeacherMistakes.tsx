"use client";

import { useState } from "react";
import Link from "next/link";
import TeacherChrome from "../TeacherChrome";
import M from "@/components/Math";
import { Avatar, Card, Eyebrow, H1 } from "@/components/ui";
import { DifficultyTag, SubskillChip } from "@/components/Tag";
import { ASSIGNMENT } from "@/data/assignment";
import { SUBSKILL_MAP } from "@/data/subskills";
import type { SubskillId } from "@/data/types";
import { mistakesByProblem } from "@/lib/mistakes";
import { useBatchedSession } from "@/lib/store";

/** Mistakes by problem, then by student; a row expands inline to the working with the slip in red. */
export default function TeacherMistakes() {
  const { session } = useBatchedSession(3000);
  const groups = mistakesByProblem(session);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <TeacherChrome>
      <Eyebrow>
        {ASSIGNMENT.className} · {ASSIGNMENT.title}
      </Eyebrow>
      <H1 className="mt-3">Where it went wrong</H1>

      <div className="mt-10 space-y-6">
        {groups.map(({ problem, rows }) => {
          const subskills = [...new Set(rows.flatMap((r) => r.slips))] as SubskillId[];
          return (
            <Card key={problem.id} className="overflow-hidden" data-problem={problem.id}>
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
                      <SubskillChip key={id} id={id} />
                    ))}
                  </span>
                </div>
              </div>
              <ul className="divide-y divide-line">
                {rows.map((r) => {
                  const key = `${problem.id}:${r.id}`;
                  const isOpen = open === key;
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : key)}
                        aria-expanded={isOpen}
                        className={`flex w-full items-center justify-between px-6 py-3.5 text-left transition-colors hover:bg-cream-deep/40 ${isOpen ? "bg-accent-soft/30" : ""}`}
                        data-row={key}
                      >
                        <span className="flex items-center gap-3">
                          <Avatar initials={r.initials} />
                          <span className="font-medium text-ink">{r.name}</span>
                          {r.live && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-accent-line bg-paper px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-deep">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden /> live
                            </span>
                          )}
                        </span>
                        <span className="flex items-center gap-4 text-[13px] text-ink-soft">
                          <span>
                            {r.slips.map((id) => SUBSKILL_MAP[id as SubskillId].short.toLowerCase()).join(", ")} · {r.lines.length} lines
                          </span>
                          <span className={`text-ink-muted transition-transform ${isOpen ? "rotate-90" : ""}`} aria-hidden>
                            ›
                          </span>
                        </span>
                      </button>
                      {isOpen && r.live && (
                        <div className="flex items-center justify-between border-t border-line bg-cream/60 px-6 pt-3 text-[12.5px] text-ink-muted">
                          <span>As handed in</span>
                          <Link href="/teacher/compare" className="text-accent-deep hover:underline" data-compare-link>
                            Original vs final →
                          </Link>
                        </div>
                      )}
                      {isOpen && (
                        <ol className={`space-y-2 bg-cream/60 px-6 py-4 ${r.live ? "" : "border-t border-line"}`} data-expanded>
                          {r.lines.map((l, i) => {
                            const v = l.verdict;
                            const wrong = v.verdict === "wrong";
                            return (
                              <li key={i} className={`rounded-xl border px-4 py-2.5 ${wrong ? "border-wrong-line bg-wrong-soft" : "border-line bg-paper"}`}>
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-[17px] text-ink">
                                    <M tex={l.tex} />
                                  </span>
                                  {v.verdict !== "unclear" && (
                                    <span className="flex shrink-0 items-center gap-2 text-[12px] text-ink-muted">
                                      {v.label}
                                      <SubskillChip id={v.subskill} />
                                    </span>
                                  )}
                                </div>
                                {wrong && v.verdict === "wrong" && <p className="mt-1 text-[13px] text-wrong">{v.note}</p>}
                              </li>
                            );
                          })}
                        </ol>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
        {groups.length === 0 && <Card className="p-6 text-[14px] text-ink-muted">No slips yet</Card>}
      </div>
    </TeacherChrome>
  );
}
