"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { RowDrill, type ColumnBox } from "@/components/HierarchyDrill";
import { StatusDot, STATUS_WORD } from "@/components/Tag";
import { categoryLabel, categoryName, isFlat } from "@/data/taxonomy";
import type { Problem } from "@/data/types";
import type { HierarchyResult } from "@/lib/hierarchy";

/** The grey uppercase label beside the Unit pill, as on the teacher's grid. */
const LABEL = "pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted";

/**
 * A student's skills drawn as the teacher's class-view row: one column per category the set
 * touches, the category chip over its pill, and under every pill at once the groups beneath it
 * (the skills themselves for a flat category), each group's dot on its category dot's line.
 * Nothing has to be opened: in `groups` mode (the student's own report) a group shows its skills
 * on a click; in `expanded` mode every group's skills are out from the start, and `locked` makes
 * that the one fixed view, the group rows plain text (the teacher's student report, ticket 169).
 * A skill shows the work behind it beneath the columns either way, exactly as on the teacher's grid.
 */
export default function SkillColumns({
  result,
  lines,
  problems,
  unit = 1,
  mode = "groups",
  locked = false,
  student = false,
}: {
  result: HierarchyResult;
  lines: Record<string, string[]>;
  problems: Problem[];
  unit?: 1 | 2 | 3 | 4;
  mode?: "groups" | "expanded";
  /** No group opens or closes; `mode` is the whole view. */
  locked?: boolean;
  /** The student's own report: student-facing skill names, no difficulty tags. */
  student?: boolean;
}) {
  const columns = result.columns;
  const rootRef = useRef<HTMLDivElement>(null);
  const [boxes, setBoxes] = useState<ColumnBox[]>([]);

  /* Where each dot sits, relative to the rows' content edge, in CSS px: the iPad stage scales rects but not margins. */
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      const rect = root.getBoundingClientRect();
      const scale = rect.width / (root.offsetWidth || rect.width);
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
  }, [columns]);

  const template = { gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr)) 0.5fr` };
  return (
    <div data-skill-columns>
      <div className="grid border-b border-line px-5 text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-muted" style={template} data-column-heads>
        {columns.map((c) => (
          /* Flex centring: a chip wider than its column (Communication) spills evenly into the slack either side instead of under its neighbour. */
          <div key={c} className="flex justify-center py-4 leading-tight" data-column={c}>
            <span className="shrink-0 whitespace-nowrap rounded-md bg-standout-soft px-2.5 py-1 text-[11px] text-standout">{categoryName(c).short}</span>
          </div>
        ))}
      </div>
      <div className="px-5 pb-5">
        <div ref={rootRef}>
          <div className="grid" style={template} data-dots>
            {columns.map((c) => {
              const st = result.categories[c] ?? "unseen";
              const half = result.half.categories.includes(c);
              return (
                <div key={c} className="relative px-1 py-6 text-center" data-dot={c}>
                  <span className="inline-grid h-7 w-10 place-items-center rounded-md" role="img" aria-label={`${categoryLabel(c, unit).name}: ${STATUS_WORD[st]}${half ? ", some problems not attempted" : ""}`}>
                    <StatusDot status={st} half={half} shape="pill" />
                  </span>
                  {isFlat(c) && (
                    <span className={`${LABEL} left-[calc(50%+20px)]`} data-unit-label>
                      {categoryLabel(c, unit).name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {boxes.length > 0 && <RowDrill mode={mode} result={result} lines={lines} problems={problems} columns={boxes} student={student} locked={locked} />}
        </div>
      </div>
    </div>
  );
}
