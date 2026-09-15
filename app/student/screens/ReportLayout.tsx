"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Card, Eyebrow } from "@/components/ui";
import { ProblemHead, WorkLines, WorkPanel } from "@/components/HierarchyDrill";
import ClassReviewExamples from "@/components/ClassReviewExamples";
import SkillColumns from "@/components/SkillColumns";
import StatusKey from "@/components/StatusKey";
import OutcomeTiles from "@/components/OutcomeTiles";
import { ASSIGNMENT } from "@/data/assignment";
import type { Problem, ReviewStage } from "@/data/types";
import type { HierarchyResult } from "@/lib/hierarchy";
import { OUTCOME_LABEL, outcomeOf, shownVersions, type OutcomeColumn, type Reviews } from "@/lib/report";
import { pressWork, type ReportWork } from "@/lib/reportWork";
import { useEscape } from "@/components/useEscape";

/**
 * What keeps the side column's working open when pressed: the working itself (not the blank column under it), a Q tile, a skill row (they switch it),
 * and Send (it closes it its own way); and what is not the report at all (ticket 247): the teacher's quick check over it and the demo's controls.
 */
const KEEPS_WORK = "[data-work-content], [data-work-tile], [data-hierarchy] button[data-node], [data-send], [data-diagnostic], [data-skip-to], [data-reset]";

/**
 * The student's report laid out, whoever holds it (ticket 287 split it from `ReportScreen`): the live report at the end of
 * in-class work, and his read-only report on a Completed set (`CompletedReport`). One screen with nothing to scroll (ticket
 * 233): the skills as the teacher's student report lays them out (a column per category, every group and skill out at once,
 * fixed, ticket 227), and What happened, every problem as a tile in a column per review stage. The side column holds the key
 * and the holder's `reflection` (the box to write in, or the sent text), with the holder's `foot` beneath (Send, or "Sent").
 *
 * A Q tile or a skill row shows its marked working in the side column in place of the key and the reflection (ticket 233);
 * another tile or skill switches it, the same one again, Escape, or a press anywhere else closes it. `foot` is told whether
 * the working is open and how to close it, so Send can close it its own way.
 */
export default function ReportLayout({
  problems,
  hierarchy,
  lines,
  columns,
  reviews,
  pathway,
  actions,
  reflection,
  foot,
}: {
  problems: Problem[];
  hierarchy: HierarchyResult;
  lines: Record<string, string[]>;
  columns: OutcomeColumn[];
  reviews: Reviews;
  pathway: readonly ReviewStage[];
  /** The heading row's right end. */
  actions: ReactNode;
  /** Under the key while no working is open. */
  reflection: ReactNode;
  /** The side column's foot, always there. */
  foot: (work: { open: boolean; close: () => void }) => ReactNode;
}) {
  const [work, setWork] = useState<ReportWork>(null);

  useEffect(() => {
    if (!work) return;
    const onPress = (e: MouseEvent) => {
      if (!(e.target instanceof Element) || !e.target.closest(KEEPS_WORK)) setWork(null);
    };
    document.addEventListener("click", onPress, true);
    return () => document.removeEventListener("click", onPress, true);
  }, [work]);
  useEscape(work !== null, () => setWork(null));

  const openProblem = work?.kind === "problem" ? problems.find((p) => p.id === work.id) : undefined;

  return (
    <div className="grid h-full min-h-0 grid-cols-[1fr_320px]">
      <section className="flex min-h-0 flex-col overflow-y-auto px-9 py-7" data-report-main>
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-baseline gap-3">
            <h1 className="font-display whitespace-nowrap text-[30px] leading-tight text-ink">Your report</h1>
            <p className="whitespace-nowrap text-[13px] text-ink-muted">What {ASSIGNMENT.teacher} sees</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        </div>

        {/* No overflow-hidden here: as a flex child it would let the card shrink and clip its skills. */}
        <Card className="mt-4 shrink-0" data-hierarchy>
          {/* Every group's skills out and fixed, nothing to open or close (ticket 227); a skill's working opens in the side column (ticket 233). */}
          <SkillColumns
            result={hierarchy}
            lines={lines}
            problems={problems}
            mode="expanded"
            locked
            student
            pickedLeaf={work?.kind === "skill" ? work.leaf : null}
            onPickLeaf={(leaf) => setWork((w) => pressWork(w, { kind: "skill", leaf }))}
          />
        </Card>

        <Card className="mt-3 shrink-0 p-4" data-outcomes>
          <Eyebrow>What happened</Eyebrow>
          <OutcomeTiles
            columns={columns}
            open={work?.kind === "problem" ? work.id : null}
            onPress={(id) => setWork((w) => pressWork(w, { kind: "problem", id }))}
            describe={() => "see your marked working"}
          />
        </Card>
      </section>

      <aside className="flex min-h-0 flex-col border-l border-line bg-paper/60 px-8 py-7" data-report-side={work ? "work" : "reflection"}>
        {work ? (
          // The working takes the column over down to the foot, and scrolls inside it when it is long.
          <div className="-mx-8 min-h-0 flex-1 overflow-y-auto px-8 pb-2" data-report-work={work.kind === "problem" ? work.id : work.leaf}>
            <div data-work-content>
              {openProblem ? (
                <>
                  <Eyebrow>{OUTCOME_LABEL[outcomeOf(openProblem.id, reviews[openProblem.id], pathway)]}</Eyebrow>
                  {/* The problem, then the versions that tell its story one under another (ticket 282, `shownVersions`, as the teacher's report). */}
                  <section className="mt-3 rounded-xl border border-line bg-paper p-3" data-work-problem={openProblem.id}>
                    <ProblemHead problem={openProblem} student />
                  </section>
                  {shownVersions(openProblem.id, reviews[openProblem.id], pathway).map((v) => (
                    <section key={v.kind} className="mt-2.5 rounded-xl border border-line bg-paper p-3" data-version={v.kind}>
                      <Eyebrow>{v.label}</Eyebrow>
                      {v.examples ? (
                        <ClassReviewExamples problem={openProblem.id} examples={v.examples} onGoTo={(leaf) => setWork({ kind: "skill", leaf })} stacked student />
                      ) : (
                        <WorkLines problem={openProblem.id} texs={v.lines} onGoTo={(leaf) => setWork({ kind: "skill", leaf })} student narrow />
                      )}
                    </section>
                  ))}
                </>
              ) : work.kind === "skill" ? (
                <WorkPanel leaf={work.leaf} lines={lines} problems={problems} status={hierarchy.leaves[work.leaf] ?? "unseen"} wide={false} onGoTo={(leaf) => setWork({ kind: "skill", leaf })} student narrow />
              ) : null}
            </div>
          </div>
        ) : (
          <>
            {/* The teacher's student report's key, word for word (ticket 225), in the column's space above the reflection (ticket 227). */}
            <div data-report-key>
              <Eyebrow>Key</Eyebrow>
              <StatusKey className="mt-3" />
            </div>
            <div className="mt-auto pt-6">{reflection}</div>
          </>
        )}
        <div className="shrink-0 pt-4">{foot({ open: work !== null, close: () => setWork(null) })}</div>
      </aside>
    </div>
  );
}
