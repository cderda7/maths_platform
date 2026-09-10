"use client";

import M from "@/components/Math";
import InkView from "@/components/InkView";
import PadSection from "@/components/PadSection";
import { Eyebrow } from "@/components/ui";
import { ASSIGNMENT } from "@/data/assignment";
import type { Stroke } from "@/data/types";
import { FOLLOW_MODE_WORD } from "@/lib/classroom";
import { useClassroom } from "@/lib/classroom-store";
import { branchesOf } from "@/lib/branches";
import { frozenView } from "@/lib/frozen";
import type { SessionAction, StudentSession } from "@/lib/session";

/**
 * Whole-class review on the student's screen: their own versions of the board's problem beside a
 * pad. One or two versions take half the width, three take two thirds; the pad takes the rest. In
 * "screens frozen" the pad mirrors the teacher's writing and takes no input; in "write with me" it
 * is the student's own, to copy the teacher's working. Marks appear only while the board shows them.
 */
export default function FrozenScreen({ session, dispatch }: { session: StudentSession; dispatch: (a: SessionAction) => void }) {
  const v = frozenView(session, useClassroom());
  const live = v?.mode === "write-with-me";
  const pid = v?.problem.id ?? "";
  const own = session.followInk[pid] ?? [];
  const addStroke = (next: Stroke[]) => dispatch({ type: "follow/stroke", problem: pid, stroke: next[next.length - 1] });
  return (
    <div className={`flex h-full min-h-0 flex-col px-9 py-6 ${live ? "" : "select-none"}`} data-frozen data-view={v?.view ?? "none"} data-mode={v?.mode ?? "none"}>
      <div className="flex items-center justify-center gap-3 rounded-full border border-accent-line bg-accent-soft px-4 py-1.5 text-[13px] text-ink" data-frozen-banner>
        <span className="h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden />
        {ASSIGNMENT.teacher} is reviewing this with the class
        {v && (
          <span className="rounded-full border border-accent-line bg-paper px-2.5 py-0.5 text-[12px] text-accent-deep" data-mode-chip>
            {FOLLOW_MODE_WORD[v.mode]}
          </span>
        )}
      </div>
      {v ? (
        <div className="mt-4 flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-4">
            <span className="font-display text-[30px] text-ink">{v.problem.label}</span>
            <span className="math-lg text-ink">
              <M tex={v.problem.tex} />
            </span>
          </div>
          <div className={`mt-3 grid min-h-0 flex-1 gap-4 ${v.versions.length >= 3 ? "grid-cols-[2fr_1fr]" : "grid-cols-2"}`} data-split={v.versions.length >= 3 ? "2/3" : "1/2"}>
            {v.attempted ? (
              <div className={`grid min-h-0 gap-3 ${v.versions.length === 1 ? "grid-cols-1" : v.versions.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                {v.versions.map((ver) => (
                  <section key={ver.label} className="flex min-h-0 flex-col overflow-y-auto rounded-2xl border border-line bg-paper p-4" data-version={ver.label}>
                    <Eyebrow>{ver.label}</Eyebrow>
                    {ver.ink.length > 0 && (
                      <div className="mt-3 h-[120px] shrink-0 rounded-xl border border-line bg-cream/50 px-3 py-2">
                        <InkView strokes={ver.ink} />
                      </div>
                    )}
                    <ol className="mt-3 space-y-2">
                      {ver.lines.map((l, i) => {
                        const tone = l.mark === "wrong" ? "border-wrong-line bg-wrong-soft" : l.mark === "standout" ? "border-standout-line bg-standout-soft" : "border-line bg-cream/40";
                        const box = `rounded-xl border px-3 py-2 text-[15px] text-ink ${tone}`;
                        const branches = branchesOf(l.tex);
                        return branches.length === 2 ? (
                          <li key={i} data-mark={l.mark ?? undefined} className="grid grid-cols-2 gap-2" data-branches>
                            {branches.map((b, j) => (
                              <span key={j} className={`${box} min-w-0 overflow-x-auto`}>
                                <M tex={b} />
                              </span>
                            ))}
                          </li>
                        ) : (
                          <li key={i} data-mark={l.mark ?? undefined} className={box}>
                            <M tex={l.tex} />
                          </li>
                        );
                      })}
                    </ol>
                  </section>
                ))}
              </div>
            ) : (
              <p className="mt-10 text-center text-[15px] text-ink-muted" data-not-attempted>
                You haven&apos;t attempted this one yet
              </p>
            )}
            <div className="flex min-h-0 flex-col rounded-2xl border border-line bg-paper" data-follow-pad>
              {live ? (
                <PadSection title="Write with me" strokes={own} onStrokesChange={addStroke} onBurstEnd={() => undefined} onPenDown={() => undefined} onUndo={() => dispatch({ type: "follow/undo", problem: pid })} onClear={() => dispatch({ type: "follow/clear", problem: pid })} />
              ) : (
                <PadSection title={`${ASSIGNMENT.teacher}'s working`} strokes={v.teacherInk} onStrokesChange={() => undefined} onBurstEnd={() => undefined} onPenDown={() => undefined} onUndo={() => undefined} onClear={() => undefined} readOnly />
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-10 text-center text-[15px] text-ink-muted">Waiting for the board</p>
      )}
    </div>
  );
}
