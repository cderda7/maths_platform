"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Eyebrow } from "@/components/ui";
import { ASSIGNMENT } from "@/data/assignment";
import { pathwayOf } from "@/lib/classroom";
import { liveClassReview, reportPathway, sessionReviews, columnsOf } from "@/lib/report";
import { movedToClassReview } from "@/lib/decisionState";
import { isMastery } from "@/lib/peers";
import { useAssignment, useClassroom } from "@/lib/classroom-store";
import { sessionEvidence, sessionHierarchy } from "@/lib/hierarchy";
import type { SessionAction, StudentSession } from "@/lib/session";
import ReportLayout from "./ReportLayout";

const sentences = (t: string) => t.split(/[.!?]+/).map((x) => x.trim()).filter(Boolean).length;

/**
 * The final report, on one screen with nothing to scroll (ticket 233), laid out by `ReportLayout`: the skills, where every
 * problem ended up, and a short reflection that must be written before the report can go. No scores on the student's work;
 * the dot key above the reflection is the teacher's, bands included (tickets 225, 227). The set's name is already in the bar above.
 *
 * Send stays at the foot of the side column: with the working open it closes it, and with no reflection yet it points the
 * student at the box instead of sending (ticket 233).
 */
export default function ReportScreen({ session, dispatch }: { session: StudentSession; dispatch: (a: SessionAction) => void }) {
  const assignment = useAssignment();
  const { problems } = assignment;
  const classroom = useClassroom();
  const hierarchy = sessionHierarchy(session, assignment);
  const lines = sessionEvidence(session).lines;
  // The teacher's report's columns and versions (ticket 282): class review's column once the board's End has covered problems.
  const classReview = liveClassReview(classroom, session);
  const pathway = reportPathway(pathwayOf(classroom), classReview);
  const reviews = sessionReviews(session, classroom.group, problems, classReview, movedToClassReview(classroom));
  const columns = columnsOf(reviews, pathway, problems);
  const n = sentences(session.reflection);
  const written = session.reflection.trim() !== "";
  const sent = session.reportSent;
  const mastery = isMastery(session);

  const [nudge, setNudge] = useState(0);
  const box = useRef<HTMLTextAreaElement>(null);

  // The box is back in the column once the working closes; a nudge puts the cursor in it.
  useEffect(() => {
    if (nudge > 0) box.current?.focus();
  }, [nudge]);

  const nudged = nudge > 0 && !written;

  return (
    <ReportLayout
      problems={problems}
      hierarchy={hierarchy}
      lines={lines}
      columns={columns}
      reviews={reviews}
      pathway={pathway}
      actions={
        <>
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
        </>
      }
      reflection={
        <>
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
        </>
      }
      foot={(work) =>
        sent ? (
          <div className="rounded-2xl border border-secure-line bg-secure-soft px-5 py-4 text-[14px] text-ink" data-sent>
            Sent to {ASSIGNMENT.teacher}
          </div>
        ) : (
          // Faded until there is a reflection, but still pressable: it closes the working and points at the box (ticket 233).
          <Button
            size="lg"
            hit
            className={`w-full ${written ? "" : "opacity-40"}`}
            aria-disabled={!written}
            onClick={() => {
              if (work.open) work.close();
              if (!written) setNudge((k) => k + 1);
              else if (!work.open) dispatch({ type: "report/send", at: Date.now() });
            }}
            data-send
          >
            Send to {ASSIGNMENT.teacher}
          </Button>
        )
      }
    />
  );
}
