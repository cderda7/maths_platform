"use client";

import { useState, type DragEvent } from "react";
import TeacherChrome from "../TeacherChrome";
import { Avatar, Card, Eyebrow, H1 } from "@/components/ui";
import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATE_MAP } from "@/data/classmates";
import { GROUP_COLOURS, GROUP_HEX, GROUP_SIZE, type GroupColour } from "@/data/groups";
import { reviewGroups } from "@/lib/groups";
import { seatingOf, unevenGroups } from "@/lib/seating";
import { useBatchedSession } from "@/lib/store";
import { dispatchClassroom, useAssignment, useClassroom } from "@/lib/classroom-store";

const person = (id: string) => (id === DEMO_STUDENT.id ? DEMO_STUDENT : CLASSMATE_MAP[id]);

/** The groups the platform would form from shared mistakes. Off for now (2026-09-10): the teacher wants only the seating groups on this page; see FUTURE_FEATURES. */
const SHOW_SUGGESTED = false;

/**
 * Groups: the seating groups the teacher sets by hand. Five colour columns, each known by its
 * coloured top edge alone (no dot, no colour name); drag a student between them (or pick a
 * colour from the small menu on each chip); a group of any size other than four is flagged,
 * never refused. The suggested-by-mistakes groups stay in the code behind `SHOW_SUGGESTED`.
 */
export default function TeacherGroups() {
  const { session } = useBatchedSession(3000);
  const groups = seatingOf(useClassroom().groups);
  const uneven = unevenGroups(groups);
  const suggested = reviewGroups(session);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<GroupColour | null>(null);

  const move = (student: string, to: GroupColour) => dispatchClassroom({ type: "groups/move", student, to });
  const onDragStart = (e: DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDragging(id);
  };
  const onDrop = (e: DragEvent, colour: GroupColour) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragging;
    if (id) move(id, colour);
    setDragging(null);
    setOver(null);
  };

  return (
    <TeacherChrome>
      <Eyebrow>
        {ASSIGNMENT.className} · {useAssignment().title}
      </Eyebrow>
      <H1 className="mt-3">Groups</H1>

      <div className="mt-8 flex items-baseline justify-between">
        <Eyebrow>Seating groups</Eyebrow>
        <span className="text-[12.5px] text-ink-muted">Drag a student to a colour. Groups of {GROUP_SIZE}; any other size is flagged.</span>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-4" data-seating>
        {GROUP_COLOURS.map((colour) => {
          const members = groups[colour];
          const flagged = uneven.includes(colour);
          return (
            <section
              key={colour}
              data-colour={colour}
              data-count={members.length}
              data-uneven={flagged || undefined}
              onDragOver={(e) => {
                e.preventDefault();
                if (over !== colour) setOver(colour);
              }}
              onDragLeave={() => setOver((o) => (o === colour ? null : o))}
              onDrop={(e) => onDrop(e, colour)}
              className={`flex min-h-[280px] flex-col rounded-2xl border bg-paper transition-colors ${over === colour ? "border-ink" : "border-line"}`}
              style={{ borderTopColor: GROUP_HEX[colour].fill, borderTopWidth: 6 }}
            >
              <div className="flex items-center justify-between px-4 pt-3">
                <span className="sr-only">{colour}</span>
                <span className={`ml-auto text-[12px] ${flagged ? "text-developing" : "text-ink-muted"}`} data-size>
                  {members.length}
                  {flagged ? " · uneven" : ""}
                </span>
              </div>
              <ul className="mt-3 flex flex-1 flex-col gap-1.5 px-3 pb-3">
                {members.map((id) => {
                  const who = person(id);
                  return (
                    <li
                      key={id}
                      draggable
                      onDragStart={(e) => onDragStart(e, id)}
                      onDragEnd={() => setDragging(null)}
                      data-student={id}
                      className={`flex items-center gap-2.5 rounded-xl border border-line px-2.5 py-2 ${dragging === id ? "opacity-40" : ""}`}
                      style={{ backgroundColor: GROUP_HEX[colour].soft }}
                    >
                      <Avatar initials={who.initials} size="h-7 w-7 text-[10px]" />
                      <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink">{who.name}</span>
                      <select
                        aria-label={`Move ${who.name} to`}
                        value={colour}
                        onChange={(e) => move(id, e.target.value as GroupColour)}
                        data-move={id}
                        className="w-5 appearance-none bg-transparent text-center text-[12px] text-ink-muted hover:text-ink"
                      >
                        {GROUP_COLOURS.map((c) => (
                          <option key={c} value={c}>
                            {c === colour ? "⋯" : c}
                          </option>
                        ))}
                      </select>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
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
