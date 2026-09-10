"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { RowDrill, type ColumnBox } from "@/components/HierarchyDrill";
import { StatusDot, STATUS_WORD } from "@/components/Tag";
import { categoryLabel, categoryName, isFlat } from "@/data/taxonomy";
import type { Problem } from "@/data/types";
import type { HierarchyResult } from "@/lib/hierarchy";

/** The grey uppercase label beside the Unit dot, as on the teacher's grid. */
const LABEL = "pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-muted";

/**
 * The student's skills drawn as the teacher's class-view row: one column per category the set
 * touches, the category chip over its dot, and under every dot at once the groups beneath it
 * (the skills themselves for a flat category), each group's dot on its category dot's line.
 * Nothing is collapsed and nothing has to be opened; a group shows its skills, a skill the work
 * behind it beneath the columns, exactly as on the teacher's grid.
 */
export default function SkillColumns({ result, lines, problems, unit = 1 }: { result: HierarchyResult; lines: Record<string, string[]>; problems: Problem[]; unit?: 1 | 2 | 3 | 4 }) {
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
            <span className="shrink-0 whitespace-nowrap rounded-md bg-standout-soft px-2 py-1 text-standout">{categoryName(c).short}</span>
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
                  <span className="inline-grid h-7 w-7 place-items-center rounded-full" role="img" aria-label={`${categoryLabel(c, unit).name}: ${STATUS_WORD[st]}${half ? ", some problems not attempted" : ""}`}>
                    <StatusDot status={st} half={half} size="h-[15px] w-[15px]" />
                  </span>
                  {isFlat(c) && (
                    <span className={`${LABEL} left-[calc(50%+12px)]`} data-unit-label>
                      {categoryLabel(c, unit).name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {boxes.length > 0 && <RowDrill mode="groups" result={result} lines={lines} problems={problems} columns={boxes} student />}
        </div>
      </div>
    </div>
  );
}
