"use client";

import TeacherChrome from "../TeacherChrome";
import { BackToClassroom, useOptionalAssignment } from "../AssignmentContext";
import SeatingBoard from "./SeatingBoard";
import { Avatar, Card, Eyebrow, H1 } from "@/components/ui";
import { ASSIGNMENT } from "@/data/assignment";
import { GROUP_SIZE, type GroupColour } from "@/data/groups";
import { reviewGroups } from "@/lib/groups";
import { seatingOf } from "@/lib/seating";
import { useBatchedSession } from "@/lib/store";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";

/** The groups the platform would form from shared mistakes. Off for now (2026-09-10): the teacher wants only the seating groups on this page; see FUTURE_FEATURES. */
const SHOW_SUGGESTED = false;

/**
 * Groups: the seating groups the teacher sets by hand, on the five-column `SeatingBoard` (drag a
 * student between colours, or pick one from the chip's menu; an uneven group is flagged, never
 * refused; the create flow's Confirm groups uses the same board, ticket 188). The
 * suggested-by-mistakes groups stay in the code behind `SHOW_SUGGESTED`.
 *
 * Two pages share it (ticket 185): under an assignment (`/teacher/a/<id>/groups`) it shows and edits
 * that assignment's own frozen copy; on the Classroom (`/teacher/groups`) the class's default
 * groups, which a new assignment copies when it is created. A move on one never changes the other.
 */
export default function TeacherGroups() {
  const assignment = useOptionalAssignment();
  const { session } = useBatchedSession(3000);
  const classroom = useClassroom();
  const groups = assignment ? assignment.groups : seatingOf(classroom.groups);
  const suggested = reviewGroups(session);

  const move = (student: string, to: GroupColour) => dispatchClassroom(assignment ? { type: "groups/move", student, to, assignment: assignment.id } : { type: "groups/move", student, to });
  return (
    <TeacherChrome>
      <BackToClassroom />
      <Eyebrow className="mt-3">
        {ASSIGNMENT.className} · {assignment ? assignment.title : "Edexia Classroom"}
      </Eyebrow>
      <H1 className="mt-3">{assignment ? "Groups" : "Default groups"}</H1>

      <div className="mt-8 flex items-baseline justify-between">
        <Eyebrow>Seating groups</Eyebrow>
        <span className="text-[12.5px] text-ink-muted">Drag a student to a colour. Groups of {GROUP_SIZE}; any other size is flagged.</span>
      </div>
      <div className="mt-3">
        <SeatingBoard groups={groups} onMove={move} scope={assignment ? assignment.id : "class"} />
      </div>

      {SHOW_SUGGESTED && (
        <>
          <Eyebrow className="mt-12">Suggested by mistakes</Eyebrow>
          <p className="mt-1 text-[12.5px] text-ink-muted">What the platform would form from shared mistakes. Kept for reporting; the seating groups above are the ones in force.</p>
          <div className="mt-4 grid grid-cols-2 gap-6" data-suggested>
            {suggested.map((g, i) => (
              <Card key={g.id} className="self-start overflow-hidden" data-group={g.id}>
                <div className="flex items-center justify-between border-b border-line px-6 py-4">
                  <div className="font-display text-[22px] text-ink">Suggested group {i + 1}</div>
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
        </>
      )}
    </TeacherChrome>
  );
}
