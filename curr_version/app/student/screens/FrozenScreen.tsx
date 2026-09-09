"use client";

import M from "@/components/Math";
import InkView from "@/components/InkView";
import { Eyebrow } from "@/components/ui";
import { DifficultyTag } from "@/components/Tag";
import { ASSIGNMENT } from "@/data/assignment";
import { useClassroom } from "@/lib/classroom-store";
import { frozenView } from "@/lib/frozen";
import type { StudentSession } from "@/lib/session";

/**
 * Frozen for whole-class review: the student's own work on the problem the board is showing, in
 * their own ink with the transcription, both versions stacked. Marks appear only while the board
 * shows marks. Nothing on this screen responds to a tap.
 */
export default function FrozenScreen({ session }: { session: StudentSession }) {
  const v = frozenView(session, useClassroom());
  return (
    <div className="flex h-full min-h-0 flex-col px-9 py-6 select-none" data-frozen data-view={v?.view ?? "none"}>
      <div className="flex items-center justify-center gap-2 rounded-full border border-accent-line bg-accent-soft px-4 py-1.5 text-[13px] text-ink" data-frozen-banner>
        <span className="h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden />
        {ASSIGNMENT.teacher} is reviewing this with the class
      </div>
      {v ? (
        <div className="mt-5 flex min-h-0 flex-1 flex-col">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="font-display text-[30px] text-ink">{v.problem.label}</span>
              <DifficultyTag d={v.problem.difficulty} />
              <span className="text-[13px] text-ink-muted">
                {v.index + 1} of {v.total}
              </span>
            </div>
            <div className="math-lg text-ink">
              <M tex={v.problem.tex} />
            </div>
          </div>
          {v.attempted ? (
            <div className={`mt-4 grid min-h-0 flex-1 gap-5 ${v.versions.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
              {v.versions.map((ver) => (
                <section key={ver.label} className="flex min-h-0 flex-col overflow-y-auto rounded-2xl border border-line bg-paper p-5" data-version={ver.label}>
                  <Eyebrow>{ver.label}</Eyebrow>
                  {ver.ink.length > 0 && (
                    <div className="mt-3 h-[180px] rounded-xl border border-line bg-cream/50 px-3 py-2">
                      <InkView strokes={ver.ink} />
                    </div>
                  )}
                  <ol className="mt-3 space-y-2">
                    {ver.lines.map((l, i) => (
                      <li
                        key={i}
                        data-mark={l.mark ?? undefined}
                        className={`rounded-xl border px-4 py-2.5 text-[17px] text-ink ${l.mark === "wrong" ? "border-wrong-line bg-wrong-soft" : l.mark === "standout" ? "border-standout-line bg-standout-soft" : "border-line bg-cream/40"}`}
                      >
                        <M tex={l.tex} />
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          ) : (
            <p className="mt-10 text-center text-[15px] text-ink-muted" data-not-attempted>
              You haven&apos;t attempted this one yet
            </p>
          )}
        </div>
      ) : (
        <p className="mt-10 text-center text-[15px] text-ink-muted">Waiting for the board</p>
      )}
    </div>
  );
}
