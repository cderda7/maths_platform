"use client";

import { useLayoutEffect, useRef } from "react";
import { Avatar } from "@/components/ui";
import { DEMO_STUDENT } from "@/data/assignment";
import type { Classmate } from "@/data/classmates";
import { GROUP_HEX, type GroupColour } from "@/data/groups";
import type { Problem } from "@/data/types";
import { AVATAR_MAX, AVATAR_RING, cellAvatars, type GridColumn, type GridTone } from "@/lib/groupGrid";

/** The question label's cell, layout px: the place table's (ticket 315), so the two stages' rows start at the same x. */
const LABEL_CELL = 132;
/** A question row's height, layout px: room for the table's avatars inside the cell's ring. */
const ROW_H = 52;
/** Kept clear inside a cell, each side, so the table of avatars never touches the cell's edge or its ring (ticket 348). */
const CELL_PAD = 7;

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
 * the board has a faint inset ring in the group's colour and the whole table inside it, every present member in seating
 * order with the ring in the group's colour around whoever holds the pen (ticket 348). A question moved to class review
 * (ticket 337) is one grey band across the groups, labelled once. Nothing here moves as the boards play: only colours,
 * the ring and the count change.
 */
export function GroupGrid({ columns, problems, classmates }: { columns: readonly GridColumn[]; problems: readonly Pick<Problem, "id" | "label">[]; classmates: readonly Pick<Classmate, "id" | "initials" | "name">[] }) {
  const initialsOf = (id: string) => (id === DEMO_STUDENT.id ? DEMO_STUDENT.initials : (classmates.find((m) => m.id === id)?.initials ?? id.slice(0, 2).toUpperCase()));
  const nameOf = (id: string) => (id === DEMO_STUDENT.id ? DEMO_STUDENT.name : (classmates.find((m) => m.id === id)?.name ?? id));
  const template = `${LABEL_CELL}px repeat(${Math.max(1, columns.length)}, minmax(0, 1fr))`;
  const ref = useRef<HTMLDivElement>(null);
  const seats = Math.max(1, ...columns.map((g) => g.members.length));
  /**
   * The avatars are sized to the cell they sit in before paint (ticket 348), and again when the grid's width changes or the
   * fonts land: the widest table (four, or three where a member is absent) has to fit the narrowest cell, so one measurement
   * sizes every cell and the tables all read alike. Written straight to the element as `--cell-av*`: no state, no re-render,
   * and the grid's own geometry is untouched, since a cell's width is its share of the row either way.
   */
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const cells = [...el.querySelectorAll<HTMLElement>("[data-cell]")];
      if (cells.length === 0) return;
      // The teacher's pages are zoomed, so a client rect is in screen px: read the cell's own layout width.
      const avail = Math.min(...cells.map((c) => c.offsetWidth)) - 2 * CELL_PAD;
      const { size, gap, text } = cellAvatars(avail, seats);
      el.style.setProperty("--cell-av", `${size}px`);
      el.style.setProperty("--cell-av-gap", `${gap}px`);
      el.style.setProperty("--cell-av-text", `${text}px`);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  });
  return (
    <div
      ref={ref}
      className="grid overflow-hidden rounded-2xl border border-line bg-paper shadow-card"
      style={{ gridTemplateColumns: template, "--cell-av": `${AVATAR_MAX}px`, "--cell-av-gap": "3px", "--cell-av-text": "10px" } as React.CSSProperties}
      data-group-grid
      data-columns={columns.length}
      data-seats={seats}
    >
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
                  >
                    {cell.tone === "unsolved" && !cell.current && (
                      <span className="text-[20px] leading-none text-white" aria-label="unsolved">
                        ✕
                      </span>
                    )}
                    {cell.current && (
                      <>
                        <span
                          className="pointer-events-none absolute inset-[3px] rounded-[10px]"
                          style={{ boxShadow: `inset 0 0 0 2px color-mix(in srgb, ${GROUP_HEX[g.colour].fill} 45%, transparent)` }}
                          data-ring
                          aria-hidden
                        />
                        {/* The whole table, in seating order, with the ring on whoever holds the pen (ticket 348). */}
                        <span className="relative flex items-center" style={{ gap: "var(--cell-av-gap)" }} data-cell-table={g.members.length}>
                          {g.members.map((id) => (
                            <span
                              key={id}
                              className="rounded-full"
                              style={id === pen ? { boxShadow: `0 0 0 ${AVATAR_RING}px ${GROUP_HEX[g.colour].fill}` } : undefined}
                              data-member={id}
                              data-pen={id === pen || undefined}
                              title={id === pen ? `${nameOf(id)} has the pen` : nameOf(id)}
                            >
                              <Avatar initials={initialsOf(id)} size="" style={{ width: "var(--cell-av)", height: "var(--cell-av)", fontSize: "var(--cell-av-text)" }} />
                            </span>
                          ))}
                        </span>
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
