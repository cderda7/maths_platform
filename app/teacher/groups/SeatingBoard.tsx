"use client";

import { useState, type DragEvent } from "react";
import { Avatar } from "@/components/ui";
import { DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATE_MAP } from "@/data/classmates";
import { GROUP_COLOURS, GROUP_HEX, type GroupColour, type SeatingGroups } from "@/data/groups";
import { unevenGroups } from "@/lib/seating";

const person = (id: string) => (id === DEMO_STUDENT.id ? DEMO_STUDENT : CLASSMATE_MAP[id]);

/**
 * The seating groups as five colour columns (ticket 188, lifted out of the Groups page): each known
 * by its coloured top edge alone, a student moved by dragging their chip to another column or by the
 * small colour menu on the chip, a group of any size other than four flagged, never refused. Pure
 * view: the caller owns the groups and what a move does (the class defaults, an assignment's frozen
 * copy, or a new assignment's groups on the create flow's pathway step). `scope` names the board for
 * the page's checks (`data-seating`); `minHeight` is each column's floor in px.
 */
export default function SeatingBoard({ groups, onMove, scope, minHeight = 280 }: { groups: SeatingGroups; onMove: (student: string, to: GroupColour) => void; scope: string; minHeight?: number }) {
  const uneven = unevenGroups(groups);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<GroupColour | null>(null);

  const onDragStart = (e: DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDragging(id);
  };
  const onDrop = (e: DragEvent, colour: GroupColour) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragging;
    if (id) onMove(id, colour);
    setDragging(null);
    setOver(null);
  };

  return (
    <div className="grid grid-cols-5 gap-4" data-seating={scope}>
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
            className={`flex flex-col rounded-2xl border bg-paper transition-colors ${over === colour ? "border-ink" : "border-line"}`}
            style={{ borderTopColor: GROUP_HEX[colour].fill, borderTopWidth: 6, minHeight }}
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
                      onChange={(e) => onMove(id, e.target.value as GroupColour)}
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
  );
}
