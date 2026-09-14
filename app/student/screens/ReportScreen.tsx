"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Card, Eyebrow } from "@/components/ui";
import { ProblemWork, WorkPanel } from "@/components/HierarchyDrill";
import SkillColumns from "@/components/SkillColumns";
import StatusKey from "@/components/StatusKey";
import { ASSIGNMENT } from "@/data/assignment";
import { pathwayOf } from "@/lib/classroom";
import OutcomeTiles from "@/components/OutcomeTiles";
import { OUTCOME_LABEL, outcomeColumns, unsolvedInGroup } from "@/lib/report";
import { isMastery } from "@/lib/peers";
import { useAssignment, useClassroom } from "@/lib/classroom-store";
import { sessionEvidence, sessionHierarchy } from "@/lib/hierarchy";
import { pressWork, type ReportWork } from "@/lib/reportWork";
import { useEscape } from "@/components/useEscape";
import type { SessionAction, StudentSession } from "@/lib/session";

const sentences = (t: string) => t.split(/[.!?]+/).map((x) => x.trim()).filter(Boolean).length;

/**
 * What keeps the side column's working open when pressed: the working itself (not the blank column under it), a Q tile, a skill row (they switch it),
 * and Send (it closes it its own way); and what is not the report at all (ticket 247): the teacher's quick check over it and the demo's controls.
 */
const KEEPS_WORK = "[data-work-content], [data-work-tile], [data-hierarchy] button[data-node], [data-send], [data-diagnostic], [data-skip-to], [data-reset]";

/**
 * The final report, on one screen with nothing to scroll (ticket 233): the skills laid out as the teacher's
 * student report (a column per category, every group and every skill beneath it out at once, fixed, ticket 227),
 * where every problem ended up as a tile in a column per review stage the teacher set, and a short reflection
 * that must be written before the report can go. No scores on the student's work; the dot key above the
 * reflection is the teacher's, bands included (tickets 225, 227). The set's name is already in the bar above.
 *
 * A Q tile or a skill row shows its marked working in the side column in place of the key and the reflection
 * (ticket 233); another tile or skill switches it, the same one again or a press anywhere else closes it. Send
 * stays at the foot of the column: with the working open it closes it, and with no reflection yet it points the
 * student at the box instead of sending.
 */
export default function ReportScreen({ session, dispatch }: { session: StudentSession; dispatch: (a: SessionAction) => void }) {
  const assignment = useAssignment();
  const { problems } = assignment;
  const classroom = useClassroom();
  const hierarchy = sessionHierarchy(session, assignment);
  const lines = sessionEvidence(session).lines;
  const columns = outcomeColumns(session, pathwayOf(classroom), classroom.group, problems);
  const unsolved = unsolvedInGroup(session, pathwayOf(classroom), classroom.group, problems);
  const n = sentences(session.reflection);
  const written = session.reflection.trim() !== "";
  const sent = session.reportSent;
  const mastery = isMastery(session);

  const [work, setWork] = useState<ReportWork>(null);
  const [nudge, setNudge] = useState(0);
  const box = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!work) return;
    const onPress = (e: MouseEvent) => {
      if (!(e.target instanceof Element) || !e.target.closest(KEEPS_WORK)) setWork(null);
    };
    document.addEventListener("click", onPress, true);
    return () => document.removeEventListener("click", onPress, true);
  }, [work]);
  useEscape(work !== null, () => setWork(null));

  // The box is back in the column once the working closes; a nudge puts the cursor in it.
  useEffect(() => {
    if (nudge > 0) box.current?.focus();
  }, [nudge]);

  const send = () => {
    if (work) setWork(null);
    if (!written) setNudge((k) => k + 1);
    else if (!work) dispatch({ type: "report/send" });
  };
  const nudged = nudge > 0 && !written;

  const outcomeOf = (id: string) => columns.find((c) => c.problems.some((p) => p.id === id))?.id;
  const openProblem = work?.kind === "problem" ? problems.find((p) => p.id === work.id) : undefined;
  const openOutcome = openProblem ? outcomeOf(openProblem.id) : undefined;

  return (
    <div className="grid h-full min-h-0 grid-cols-[1fr_320px]">
      <section className="flex min-h-0 flex-col overflow-y-auto px-9 py-7" data-report-main>
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-baseline gap-3">
            <h1 className="font-display whitespace-nowrap text-[30px] leading-tight text-ink">Your report</h1>
            <p className="whitespace-nowrap text-[13px] text-ink-muted">What {ASSIGNMENT.teacher} sees</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {mastery && (
              <div className="flex items-center gap-3" data-mastery>
                <span className="whitespace-nowrap text-[13.5px] font-medium text-ink">Every step held</span>
                <Button variant="secondary" className="whitespace-nowrap" onClick={() => dispatch({ type: "peers/open" })}>
                  Where the class is stuck →
                </Button>
              </div>
            )}
            <Button variant="ghost" className="whitespace-nowrap" onClick={() => dispatch({ type: "history/open" })}>
              Your working →
            </Button>
          </div>
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
            unsolved={unsolved}
            open={work?.kind === "problem" ? work.id : null}
            onPress={(id) => setWork((w) => pressWork(w, { kind: "problem", id }))}
            describe={() => "see your marked working"}
          />
        </Card>
      </section>

      <aside className="flex min-h-0 flex-col border-l border-line bg-paper/60 px-8 py-7" data-report-side={work ? "work" : "reflection"}>
        {work ? (
          // The working takes the column over down to Send, and scrolls inside it when it is long.
          <div className="-mx-8 min-h-0 flex-1 overflow-y-auto px-8 pb-2" data-report-work={work.kind === "problem" ? work.id : work.leaf}>
            <div data-work-content>
              {openProblem ? (
                <>
                  <Eyebrow>{openOutcome ? OUTCOME_LABEL[openOutcome] : "Your working"}</Eyebrow>
                  <div className="mt-3">
                    <ProblemWork problem={openProblem} texs={lines[openProblem.id] ?? []} onGoTo={(leaf) => setWork({ kind: "skill", leaf })} student narrow />
                  </div>
                  {unsolved.some((p) => p.id === openProblem.id) && <p className="mt-2 text-[12px] leading-snug text-ink-muted">Not solved in group review</p>}
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
            <div className="mt-auto pt-6">
              <Eyebrow>Reflection</Eyebrow>
              <h2 className="font-display mt-2 text-[24px] leading-tight text-ink">Two or three sentences</h2>
              {/* Keyed by the nudge so the accent ring plays again on every press of Send with nothing written. */}
              <div key={nudge} className={`relative mt-4 rounded-2xl ${nudged ? "pulse-once" : ""}`}>
                <textarea
                  ref={box}
                  value={session.reflection}
                  onChange={(e) => dispatch({ type: "reflection/set", text: e.target.value })}
                  disabled={sent}
                  rows={7}
                  placeholder="What went wrong, and what you'd check next time…"
                  className={`block w-full resize-none rounded-2xl border bg-paper px-4 py-3 text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink-muted/70 focus:border-accent disabled:bg-cream-deep/50 ${nudged ? "border-accent" : "border-line"}`}
                  aria-label="Reflection"
                  aria-describedby="reflection-note"
                />
              </div>
              <div id="reflection-note" className={`mt-2 min-h-4 text-[12px] ${nudged ? "text-accent-deep" : "text-ink-muted"}`} data-reflection-note={nudged ? "nudge" : undefined}>
                {nudged ? "Write your reflection before sending" : n === 0 ? "" : `${n} ${n === 1 ? "sentence" : "sentences"}`}
              </div>
            </div>
          </>
        )}
        <div className="shrink-0 pt-4">
          {sent ? (
            <div className="rounded-2xl border border-secure-line bg-secure-soft px-5 py-4 text-[14px] text-ink" data-sent>
              Sent to {ASSIGNMENT.teacher}
            </div>
          ) : (
            // Faded until there is a reflection, but still pressable: it closes the working and points at the box (ticket 233).
            <Button size="lg" hit className={`w-full ${written ? "" : "opacity-40"}`} aria-disabled={!written} onClick={send} data-send>
              Send to {ASSIGNMENT.teacher}
            </Button>
          )}
        </div>
      </aside>
    </div>
  );
}
