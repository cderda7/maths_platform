"use client";

import { Avatar } from "@/components/ui";
import { DEMO_STUDENT } from "@/data/assignment";
import type { Classmate } from "@/data/classmates";
import { GROUP_HEX, type GroupColour } from "@/data/groups";
import type { Problem } from "@/data/types";
import type { GridColumn, GridTone } from "@/lib/groupGrid";

/** The question label's cell, layout px: the place table's (ticket 315), so the two stages' rows start at the same x. */
const LABEL_CELL = 132;
/** A question row's height, layout px: room for the pen-holder's avatar inside the ring. */
const ROW_H = 52;

/** Each tone's ground (ticket 319): light blue not in the queue, blank still to do, green solved, red left for now, dark red unsolved, grey moved to class review. */
const TONE: Record<GridTone, string> = {
  "not-in-queue": "bg-standout-soft",
  ahead: "bg-paper",
  left: "bg-wrong",
  solved: "bg-solid",
  unsolved: "bg-wrong-deep",
  "class-review": "bg-covered-soft",
};

/**
 * A group's chip: its name in capitals, tinted in the group's colour with a border of it; filled in the colour, the name
 * white, once the group has closed every question (ticket 319). The cards name the groups still to go with the same chip.
 */
export function GroupChip({ colour, done = false, className = "" }: { colour: GroupColour; done?: boolean; className?: string }) {
  const hex = GROUP_HEX[colour];
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border-[1.5px] px-2.5 py-[3px] text-[12px] leading-none font-semibold tracking-[0.06em] whitespace-nowrap uppercase ${done ? "text-white" : "text-ink"} ${className}`}
      style={{ borderColor: hex.fill, backgroundColor: done ? hex.fill : hex.soft }}
      data-group-chip={colour}
      data-done={done || undefined}
    >
      {colour}
    </span>
  );
}

/**
 * Where groups are during group review (ticket 319): a row per question of the set, a column per group taking part, in
 * seating order (a group sitting out has no column, ticket 332). Each column's head is the group's chip and "n/m", the
 * questions it has closed out of its union. Each cell's colour is where the group is on that question; the question on
 * the board has an inset ring in the group's colour with the pen-holder's avatar inside. A question moved to class review
 * (ticket 337) is one grey band across the groups, labelled once. Nothing here moves as the boards play: only colours,
 * the ring and the count change.
 */
export function GroupGrid({ columns, problems, classmates }: { columns: readonly GridColumn[]; problems: readonly Pick<Problem, "id" | "label">[]; classmates: readonly Pick<Classmate, "id" | "initials" | "name">[] }) {
  const initialsOf = (id: string) => (id === DEMO_STUDENT.id ? DEMO_STUDENT.initials : (classmates.find((m) => m.id === id)?.initials ?? id.slice(0, 2).toUpperCase()));
  const nameOf = (id: string) => (id === DEMO_STUDENT.id ? DEMO_STUDENT.name : (classmates.find((m) => m.id === id)?.name ?? id));
  const template = `${LABEL_CELL}px repeat(${Math.max(1, columns.length)}, minmax(0, 1fr))`;
  return (
    <div className="grid overflow-hidden rounded-2xl border border-line bg-paper shadow-card" style={{ gridTemplateColumns: template }} data-group-grid data-columns={columns.length}>
      <div className="border-b border-line-strong" aria-hidden />
      {columns.map((g) => (
        <div
          key={g.colour}
          className="flex flex-col items-center justify-center gap-1.5 border-b border-l border-line-strong px-2 py-2.5"
          data-group-column={g.colour}
          data-progress={`${g.closed}/${g.total}`}
          data-done={g.done || undefined}
        >
          <GroupChip colour={g.colour} done={g.done} />
          <span className="text-[13px] leading-none text-ink-muted tabular-nums">
            <span className="font-semibold text-ink">{g.closed}</span>/{g.total}
          </span>
        </div>
      ))}
      {problems.map((p, row) => {
        const top = row === 0 ? "" : "border-t border-line";
        const moved = columns.length > 0 && columns.every((g) => g.cells[row]?.tone === "class-review");
        return (
          <div key={p.id} className="contents" data-grid-row={p.id}>
            <div className={`flex items-center border-r border-line px-4 font-display text-[20px] leading-none whitespace-nowrap text-ink ${top}`} style={{ height: ROW_H }}>
              {p.label}
            </div>
            {moved ? (
              <div className={`grid place-items-center ${TONE["class-review"]} ${top}`} style={{ gridColumn: "2 / -1", height: ROW_H }} data-class-review-row={p.id}>
                <span className="text-[13px] text-ink-muted">class review</span>
              </div>
            ) : (
              columns.map((g, i) => {
                const cell = g.cells[row];
                const pen = cell.current ? g.pen : null;
                return (
                  <div
                    key={g.colour}
                    className={`relative grid place-items-center ${i === 0 ? "" : "border-l border-line"} ${TONE[cell.tone]} ${top}`}
                    style={{ height: ROW_H }}
                    data-cell={`${g.colour}:${p.id}`}
                    data-tone={cell.tone}
                    data-current={cell.current || undefined}
                    title={pen ? `${nameOf(pen)} has the pen` : undefined}
                  >
                    {cell.tone === "unsolved" && !cell.current && (
                      <span className="text-[20px] leading-none text-white" aria-label="unsolved">
                        ✕
                      </span>
                    )}
                    {cell.current && (
                      <>
                        <span className="pointer-events-none absolute inset-[5px] rounded-[10px]" style={{ boxShadow: `inset 0 0 0 3px ${GROUP_HEX[g.colour].fill}` }} data-ring aria-hidden />
                        {pen && (
                          <span className="relative rounded-full bg-paper" style={{ boxShadow: `0 0 0 2px ${GROUP_HEX[g.colour].fill}` }} data-pen={pen}>
                            <Avatar initials={initialsOf(pen)} size="h-7 w-7 text-[10px]" />
                          </span>
                        )}
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        );
      })}
    </div>
  );
}
