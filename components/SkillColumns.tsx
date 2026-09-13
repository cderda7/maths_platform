"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { RowDrill, textWidth, type ColumnBox } from "@/components/HierarchyDrill";
import { DOT_COLOR, STATUS_WORD } from "@/components/Tag";
import { categoryName, type CategoryId, type LeafId } from "@/data/taxonomy";
import type { Problem, Status } from "@/data/types";
import type { HierarchyResult } from "@/lib/hierarchy";

/** The pill's text sizes, largest first, and the side padding that goes with each: the row picks the largest at which the widest pill clears its column. */
const PILL_SIZES = [11, 10.5, 10, 9.5, 9];
const PILL_TRACKING = 0.06;
const pillPad = (size: number) => (size >= 10.5 ? 10 : size >= 9.5 ? 8 : 6);
/** A pill's full width at a text size: the name as set (uppercase, semibold) with its tracking, the padding, a 1 px border each side. */
const pillWidth = (name: string, size: number) => textWidth(name.toUpperCase(), size, 600) + PILL_TRACKING * size * name.length + 2 * pillPad(size) + 2;
/** The largest size at which the widest name's pill fits `available`; the smallest size when none does. */
export function fitPills(names: string[], available: number): number {
  const widest = names.reduce((a, n) => (pillWidth(n, 11) > pillWidth(a, 11) ? n : a), names[0] ?? "");
  return PILL_SIZES.find((size) => pillWidth(widest, size) <= available) ?? PILL_SIZES[PILL_SIZES.length - 1];
}

/**
 * The category pill with the category's name inside it, white on the status colour (ticket 174):
 * the marker and the header in one. Every pill is as wide as the widest name: each pill stacks
 * every column's name in the same grid cell and shows only its own, so the width is the same in
 * every column with no measuring; `size` is the row's fitted text size. Not seen yet is hollow
 * with the name in grey; half (problems skipped) keeps the left half in the colour and fades the
 * right, the name still white over both.
 */
function CategoryPill({ category, status, half, names, label, size }: { category: CategoryId; status: Status; half: boolean; names: string[]; label: string; size: number }) {
  const own = categoryName(category).short;
  const color = DOT_COLOR[status];
  const paint =
    status === "unseen"
      ? {}
      : half
        ? { backgroundImage: `linear-gradient(90deg, ${color} 50%, color-mix(in srgb, ${color} 45%, white) 50%)`, borderColor: color }
        : { backgroundColor: color, borderColor: color };
  return (
    <span
      className={`inline-grid rounded-md border py-1 font-semibold uppercase leading-tight tracking-[0.06em] ${status === "unseen" ? "border-line-strong text-ink-muted" : "text-white"}`}
      style={{ ...paint, fontSize: size, paddingLeft: pillPad(size), paddingRight: pillPad(size) }}
      data-fit={size}
      role="img"
      aria-label={`${label}: ${STATUS_WORD[status]}${half ? ", some problems not attempted" : ""}`}
      data-status={status}
      data-half={half || undefined}
      data-shape="pill"
    >
      {names.map((n) => (
        <span key={n} className={`whitespace-nowrap text-center ${n === own ? "" : "invisible"}`} style={{ gridArea: "1 / 1" }} aria-hidden>
          {n}
        </span>
      ))}
    </span>
  );
}

/**
 * A student's skills drawn as the teacher's class-view row: one column per category the set
 * touches, the category's pill carrying its name, and under every pill at once the groups beneath
 * it (the skills themselves for a flat category), each group's dot on its category pill's line.
 * Nothing has to be opened: in `groups` mode (the student's own report) a group shows its skills
 * on a click; in `expanded` mode every group's skills are out from the start, and `locked` makes
 * that the one fixed view, the group rows plain text (the teacher's student report, ticket 169).
 * A skill shows the work behind it beneath the columns either way, exactly as on the teacher's grid.
 */
export default function SkillColumns({
  result,
  lines,
  problems,
  mode = "groups",
  locked = false,
  student = false,
  pickedLeaf,
  onPickLeaf,
}: {
  result: HierarchyResult;
  lines: Record<string, string[]>;
  problems: Problem[];
  mode?: "groups" | "expanded";
  /** No group opens or closes; `mode` is the whole view. */
  locked?: boolean;
  /** The student's own report: student-facing skill names, no difficulty tags. */
  student?: boolean;
  /** A picked skill's work shows elsewhere, not beneath the columns (ticket 233). */
  pickedLeaf?: LeafId | null;
  onPickLeaf?: (l: LeafId) => void;
}) {
  const columns = result.columns;
  const names = columns.map((c) => categoryName(c).short);
  const rootRef = useRef<HTMLDivElement>(null);
  const [boxes, setBoxes] = useState<ColumnBox[]>([]);
  const [pillSize, setPillSize] = useState(PILL_SIZES[0]);

  /* Where each pill sits, relative to the rows' content edge, in CSS px: the iPad stage scales rects but not margins. The pills' text size: the largest at which the widest pill clears its column (the cell less its px-1 either side). */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      const rect = root.getBoundingClientRect();
      const scale = rect.width / (root.offsetWidth || rect.width);
      const cell = root.querySelector<HTMLElement>("[data-dot]");
      if (cell) setPillSize(fitPills(names, cell.clientWidth - 8));
      const dots = columns.map((c) => root.querySelector<HTMLElement>(`[data-dot="${c}"] [data-status]`)?.getBoundingClientRect());
      setBoxes(
        columns.map((c, i) => {
          const dot = dots[i];
          const next = dots[i + 1];
          const left = dot ? (dot.left - rect.left) / scale : 0;
          const end = next ? next.left - 10 : rect.right;
          const width = dot ? Math.round((end - dot.left) / scale) : 80;
          return { category: c, left, width };
        }),
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
    // names is derived from columns; pillSize re-measures the pill lefts once the pills have taken their fitted size
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, pillSize]);

  const template = { gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr)) 0.5fr` };
  return (
    <div data-skill-columns>
      <div className="px-5 pb-5">
        <div ref={rootRef}>
          <div className="grid" style={template} data-dots>
            {columns.map((c) => {
              const st = result.categories[c] ?? "unseen";
              const half = result.half.categories.includes(c);
              return (
                <div key={c} className="px-1 py-6 text-center" data-dot={c}>
                  <span className="relative inline-block">
                    <CategoryPill category={c} status={st} half={half} names={names} label={categoryName(c).name} size={pillSize} />
                  </span>
                </div>
              );
            })}
          </div>
          {boxes.length > 0 && <RowDrill mode={mode} result={result} lines={lines} problems={problems} columns={boxes} student={student} locked={locked} pickedLeaf={pickedLeaf} onPickLeaf={onPickLeaf} />}
        </div>
      </div>
    </div>
  );
}
