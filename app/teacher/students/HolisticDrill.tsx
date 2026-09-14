"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import FitHeight from "@/components/FitHeight";
import { ProblemWork, SkillTree } from "@/components/HierarchyDrill";
import { StatusDot, STATUS_TEXT, STATUS_WORD } from "@/components/Tag";
import { Eyebrow } from "@/components/ui";
import { categoryName, groupsOf, leafName, type CategoryId, type LeafId } from "@/data/taxonomy";
import { problemsBehindLeaf } from "@/lib/hierarchy";
import type { HolisticSet, HolisticWork } from "@/lib/holistic";

/*
 * What a result on a student's holistic page opens (ticket 277). A press on a grid cell opens the category's whole
 * tree on that set (every group open, down to its skills) as a flyout under the cell, over the rows below, so nothing
 * on the page moves; grey "click to see examples" sits left of the tree with an arrow to each skill. A skill's press
 * puts its problems (the whole question and the student's marked working) in the page's side column, where they take
 * the patterns' place until closed.
 */

/** The grey label's box and the run its arrows take before the tree, layout px. */
const LABEL_TEXT = 92;
const LABEL_RUN = 64;
const LABEL_W = LABEL_TEXT + LABEL_RUN;
/** The flyout's padding, layout px. */
const PAD = 16;
/** The gap between the cell and the flyout, layout px. */
const GAP = 8;

/**
 * The flyout. `wrapRef` is the positioned box around the grid it lays over; the cell it opens from is found there by
 * `data-cell`. Placed after mount, in layout px (the teacher frame is zoomed): the tree's dots start at the cell's left
 * edge, the label to their left; shifted left if it would run past the box; opened above the cell instead when there
 * is no room for it below in the scroll region and more above.
 */
export function CellDrill({ work, set, category, picked, onPick, wrapRef }: { work: HolisticWork; set: HolisticSet; category: CategoryId; picked: LeafId | null; onPick: (l: LeafId) => void; wrapRef: RefObject<HTMLDivElement | null> }) {
  const ref = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const openGroups = groupsOf(category).filter((g) => work.result.groups[g] !== undefined);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const node = ref.current;
    const body = bodyRef.current;
    const label = labelRef.current;
    const svg = svgRef.current;
    const cell = wrap?.querySelector<HTMLElement>(`[data-cell="${category}:${set.id}"] [data-cell-pill]`);
    if (!wrap || !node || !body || !label || !svg || !cell) return;
    const place = () => {
      const w = wrap.getBoundingClientRect();
      const z = w.width / wrap.offsetWidth || 1;
      const c = cell.getBoundingClientRect();
      // Vertically from the row, so the flyout never covers the row's own set head (a two-line topic).
      const row = (cell.closest("tr") ?? cell).getBoundingClientRect();
      const width = node.offsetWidth;
      const height = node.offsetHeight;
      const left = Math.max(-PAD, Math.min((c.left - w.left) / z - PAD - LABEL_W, wrap.offsetWidth - width));
      let top = (row.bottom - w.top) / z + GAP;
      let side = "below";
      const scroller = wrap.closest("[data-teacher-scroll]")?.getBoundingClientRect();
      if (scroller) {
        const roomBelow = (scroller.bottom - row.bottom) / z - GAP;
        const roomAbove = (row.top - scroller.top) / z - GAP;
        if (height > roomBelow && roomAbove > roomBelow) {
          top = (row.top - w.top) / z - GAP - height;
          side = "above";
        }
      }
      node.style.left = `${left}px`;
      node.style.top = `${top}px`;
      node.dataset.side = side;

      // Arrows: from the label's right edge to just left of each skill's dot; the bend stays left of the tree.
      const b = body.getBoundingClientRect();
      const dots = [...body.querySelectorAll<HTMLElement>('[data-col="leaves"] > li > [data-node] > [data-status], [data-flat] > li > [data-node] > [data-status]')];
      const ends = dots.map((d) => {
        const r = d.getBoundingClientRect();
        return { x: (r.left - b.left) / z - 5, y: (r.top + r.height / 2 - b.top) / z };
      });
      if (ends.length === 0) return;
      const mid = (ends[0].y + ends[ends.length - 1].y) / 2;
      label.style.top = `${mid - label.offsetHeight / 2}px`;
      const sx = LABEL_TEXT + 6;
      const turn = LABEL_W - 6;
      // Drawn here, not by React: how many there are is only known from the tree as laid out. The svg has no React children.
      svg.replaceChildren(
        ...ends.flatMap((e) =>
          [`M ${sx} ${mid} C ${sx + 26} ${mid}, ${turn - 26} ${e.y}, ${turn} ${e.y} L ${e.x} ${e.y}`, `M ${e.x - 5} ${e.y - 3.5} L ${e.x} ${e.y} L ${e.x - 5} ${e.y + 3.5}`].map((d) => {
            const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
            p.setAttribute("d", d);
            return p;
          }),
        ),
      );
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(wrap);
    ro.observe(node);
    return () => ro.disconnect();
  }, [wrapRef, set.id, category, picked]);

  return (
    <div ref={ref} className="absolute z-20 w-max rounded-xl border border-line bg-paper shadow-lift" style={{ padding: PAD }} data-holistic-drill={`${category}:${set.id}`} role="dialog" aria-label={`${categoryName(category).name} on ${set.label}: the skills behind the result`}>
      <div ref={bodyRef} className="relative" style={{ paddingLeft: LABEL_W }}>
        <span ref={labelRef} className="absolute left-0 text-[12.5px] leading-snug text-ink-muted" style={{ width: LABEL_TEXT }} data-drill-hint>
          click to see examples
        </span>
        <svg ref={svgRef} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" fill="none" stroke="var(--color-ink-muted)" strokeOpacity={0.6} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden data-drill-arrows />

        <SkillTree category={category} result={work.result} openGroups={openGroups} leaf={picked} onGroup={() => {}} onLeaf={onPick} lockGroups />
      </div>
    </div>
  );
}

/**
 * A picked skill's problems in the side column: the set and category over the skill's name and result, then every
 * problem on the set its result is read from (`problemsBehindLeaf`) as the teacher's report draws it (the whole
 * question, the student's lines, red where a step did not hold, a rule on the lines tagged to the skill), in two
 * balanced columns (three past six problems), zoomed down to fit the column's height rather than scroll. A ⚠ chip on a line opens the skill it was identified as.
 */
export function SkillWork({ work, set, category, leaf, onGoTo, onClose }: { work: HolisticWork; set: HolisticSet; category: CategoryId; leaf: LeafId; onGoTo: (l: LeafId) => void; onClose: () => void }) {
  const problems = problemsBehindLeaf(leaf, work.problems, work.lines);
  const status = work.result.leaves[leaf] ?? "unseen";
  return (
    <section className="flex h-full min-h-0 flex-col" aria-label={`${leafName(leaf).name} on ${set.label}`} data-holistic-work={leaf} data-work-set={set.id}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <Eyebrow>
            {set.label} · {categoryName(category).name}
          </Eyebrow>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 className="font-display text-[24px] leading-tight text-ink">{leafName(leaf).name}</h2>
            <span className={`inline-flex items-center gap-1.5 text-[14px] ${STATUS_TEXT[status]}`}>
              <StatusDot status={status} />
              {STATUS_WORD[status]}
            </span>
          </div>
        </div>
        <button type="button" onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[20px] leading-none text-ink-muted transition-colors hover:bg-cream-deep hover:text-ink" aria-label="Close the examples" data-work-close>
          ×
        </button>
      </div>
      {problems.length === 0 ? (
        <p className="mt-3 text-[16px] text-ink-muted" data-work-none>
          Nothing written on this set yet
        </p>
      ) : (
        <FitHeight className="mt-3 flex-1" fitKey={`${set.id}:${leaf}`} data-work-fit>
          {/* Balanced columns, not a grid: a short card does not stretch to its row's tallest, so more fits before the zoom. */}
          <div className={`gap-3 ${problems.length > 6 ? "columns-3" : problems.length > 1 ? "columns-2" : "columns-1"}`}>
            {problems.map((p) => (
              <div key={p.id} className="mb-3 break-inside-avoid">
                <ProblemWork problem={p} texs={work.lines[p.id] ?? []} leaf={leaf} onGoTo={onGoTo} narrow />
              </div>
            ))}
          </div>
        </FitHeight>
      )}
    </section>
  );
}
