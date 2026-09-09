"use client";

import { forwardRef, useLayoutEffect, useMemo, useRef, useState } from "react";
import M from "@/components/Math";
import { Eyebrow } from "@/components/ui";
import { DifficultyTag, StatusDot, STATUS_TEXT, STATUS_WORD } from "@/components/Tag";
import { categoryName, categoryOf, groupName, groupOf, groupsOf, leafName, leavesOf, type CategoryId, type GroupId, type LeafId } from "@/data/taxonomy";
import type { Problem, Status } from "@/data/types";
import { evaluateLine } from "@/lib/evaluate";
import { lineMarks } from "@/lib/examples";
import { problemsForLeaf, STATUS_RANK, type HierarchyResult } from "@/lib/hierarchy";

/*
 * The skill drill as an outline. Rules, in order: a group's dot sits on the same vertical line as
 * its category's dot; a skill's dot is indented right of its group's; text sits to the right of
 * the dot and is never truncated; when a tree must stay inside its category's column, the text
 * and dots shrink, and only if that gets ridiculous does a name break onto a second line.
 */

const MIN_PANEL = 600;
const worst = <T extends string>(ids: T[], status: (id: T) => Status) => [...ids].sort((a, b) => STATUS_RANK[status(a)] - STATUS_RANK[status(b)]);

/* ---------- text fitting ---------- */

let ctx: CanvasRenderingContext2D | null | undefined;
function textWidth(text: string, size: number): number {
  if (typeof document === "undefined") return text.length * size * 0.55;
  if (ctx === undefined) ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return text.length * size * 0.55;
  ctx.font = `${size}px Inter, system-ui, sans-serif`;
  return ctx.measureText(text).width;
}

export interface Fit {
  size: number;
  dot: number;
  indent: number;
  wrap: boolean;
}
const FULL: Fit = { size: 13.5, dot: 15, indent: 28, wrap: false };
const SIZES = [13.5, 12.5, 11.5, 10.5, 9.5, 9];

/** The largest text size at which every label (dot + gap + text, plus its indent) fits in `available`; wrapping as a last resort. */
export function fitLabels(labels: { text: string; depth: number }[], available: number | undefined): Fit {
  if (!available || labels.length === 0) return FULL;
  for (const size of SIZES) {
    const dot = size >= 12 ? 15 : 12;
    const indent = Math.round(size * 2);
    const gap = 8;
    if (labels.every((l) => l.depth * indent + dot + gap + textWidth(l.text, size) <= available)) return { size, dot, indent, wrap: false };
  }
  const size = 10.5;
  const dot = 12;
  const indent = 21;
  const longestWord = Math.max(...labels.flatMap((l) => l.text.split(" ").map((w) => l.depth * indent + dot + 8 + textWidth(w, size))));
  return longestWord <= available ? { size, dot, indent, wrap: true } : { size: 9, dot: 12, indent: 18, wrap: true };
}

/* ---------- nodes and trees ---------- */

function Node({ label, status, half, open, fit, onClick, node }: { label: string; status: Status; half: boolean; open: boolean; fit: Fit; onClick: () => void; node: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={open}
      aria-label={`${label}: ${STATUS_WORD[status]}${half ? ", some problems not attempted" : ""}`}
      className={`-ml-[7px] flex items-center gap-2 rounded-lg border py-1 pl-1.5 pr-2.5 text-left transition-colors ${open ? "border-ink bg-paper" : "border-transparent hover:bg-cream-deep/60"}`}
      data-node={node}
    >
      <StatusDot status={status} half={half} px={fit.dot} className="shrink-0" />
      <span className={`leading-tight text-ink ${fit.wrap ? "whitespace-normal [text-wrap:balance]" : "whitespace-nowrap"}`} style={{ fontSize: fit.size }}>
        {label}
      </span>
    </button>
  );
}

/**
 * One category's groups (worst-first), each open group's skills indented beneath it. `width`, when
 * given, is the column the tree must stay inside; the text fits itself to it.
 */
interface TreeProps {
  category: CategoryId;
  result: HierarchyResult;
  openGroups: GroupId[];
  leaf: LeafId | null;
  onGroup: (g: GroupId) => void;
  onLeaf: (l: LeafId) => void;
  /** The column the tree must stay inside; the text fits itself to it. */
  width?: number;
  marginLeft?: number;
}

export const SkillTree = forwardRef<HTMLUListElement, TreeProps>(function SkillTree({ category, result, openGroups, leaf, onGroup, onLeaf, width, marginLeft }, ref) {
  const groups = worst(groupsOf(category).filter((g) => result.groups[g] !== undefined), (g) => result.groups[g]!);
  const leavesIn = (g: GroupId) => worst(leavesOf(g).filter((l) => result.leaves[l] !== undefined), (l) => result.leaves[l]!);
  const labels = groups.flatMap((g) => [{ text: groupName(g).name, depth: 0 }, ...(openGroups.includes(g) ? leavesIn(g).map((l) => ({ text: leafName(l).name, depth: 1 })) : [])]);
  const fit = fitLabels(labels, width);
  const centre = (FULL.dot - fit.dot) / 2; // a smaller dot still sits centred on the category dot's line
  return (
    <ul ref={ref} className="space-y-0.5 self-start" style={{ width, marginLeft: marginLeft === undefined ? undefined : marginLeft + centre, paddingLeft: marginLeft === undefined ? centre : undefined }} data-col="tree" data-category={category} data-fit={fit.size}>
      {groups.map((g) => (
        <li key={g}>
          <Node label={groupName(g).name} status={result.groups[g]!} half={result.half.groups.includes(g)} open={openGroups.includes(g)} fit={fit} onClick={() => onGroup(g)} node={g} />
          {openGroups.includes(g) && (
            <ul className="mt-0.5 space-y-0.5" style={{ paddingLeft: fit.indent }} data-col="leaves">
              {leavesIn(g).map((l) => (
                <li key={l}>
                  <Node label={leafName(l).name} status={result.leaves[l]!} half={result.half.leaves.includes(l)} open={l === leaf} fit={fit} onClick={() => onLeaf(l)} node={l} />
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
});

/* ---------- the work behind a skill ---------- */

/** The student's work on the problems that invoke a leaf: marked lines, a left rule on the lines tagged to that leaf, and a ⚠ chip on a red line whose mistake belongs to another skill. */
export function WorkPanel({ leaf, lines, problems, status, wide, onGoTo }: { leaf: LeafId; lines: Record<string, string[]>; problems: Problem[]; status: Status; wide: boolean; onGoTo: (l: LeafId) => void }) {
  const invoking = problemsForLeaf(leaf, problems);
  return (
    <div className={wide ? "w-full" : "min-w-0 flex-1"} data-col="work" data-leaf={leaf}>
      <div className="flex items-center gap-3">
        <Eyebrow>{leafName(leaf).name}</Eyebrow>
        <span className={`text-[11.5px] ${STATUS_TEXT[status]}`}>{STATUS_WORD[status]}</span>
      </div>
      <div className={`mt-2 grid gap-3 ${wide ? "grid-cols-3" : "grid-cols-2"}`}>
        {invoking.map((p) => {
          const texs = lines[p.id] ?? [];
          const marks = lineMarks(p.id, texs);
          return (
            <section key={p.id} className="rounded-xl border border-line bg-paper p-3" data-work-problem={p.id}>
              <div className="flex items-center gap-2.5">
                <span className="font-display text-[16px] text-ink">{p.label}</span>
                <DifficultyTag d={p.difficulty} />
                <span className="ml-auto text-[13px] text-ink-soft">
                  <M tex={p.tex} />
                </span>
              </div>
              {texs.length === 0 ? (
                <p className="mt-2 text-[12.5px] text-ink-muted" data-not-attempted>
                  not attempted
                </p>
              ) : (
                <ol className="mt-2 space-y-1.5">
                  {texs.map((tex, i) => {
                    const v = evaluateLine(p.id, tex);
                    const tagged = v.verdict !== "unclear" && v.tags.some((t) => t.leaf === leaf);
                    const mark = marks[i];
                    const blamed = v.verdict === "wrong" && v.tags[0].leaf !== leaf ? v.tags[0].leaf : null;
                    return (
                      <li
                        key={i}
                        data-mark={mark ?? undefined}
                        data-tagged={tagged || undefined}
                        className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-1.5 text-[14.5px] text-ink ${tagged ? "border-l-[3px] border-l-ink" : ""} ${
                          mark === "wrong" ? "border-wrong-line bg-wrong-soft" : mark === "standout" ? "border-standout-line bg-standout-soft" : "border-line bg-cream/40"
                        }`}
                      >
                        <M tex={tex} />
                        {blamed && (
                          <button
                            type="button"
                            onClick={() => onGoTo(blamed)}
                            className="flex shrink-0 items-center gap-1.5 rounded-full border border-wrong-line bg-paper px-2 py-0.5 text-[11.5px] text-wrong hover:bg-wrong-soft"
                            title={`Identified as ${leafName(blamed).short}. Open that skill.`}
                            data-blame={blamed}
                          >
                            <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden>
                              <path d="M8 1.5 15 14H1z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                              <path d="M8 6v4M8 11.6v.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                            </svg>
                            {leafName(blamed).short}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- the grid's drill row ---------- */

export type RowMode = "category" | "groups" | "expanded";
export interface ColumnBox {
  category: CategoryId;
  left: number;
  width: number;
}

/**
 * What opens under a student's row. `category`: one tree under the clicked dot, work beside it
 * (or beneath when there's no room). `groups`: every category's groups, each tree inside its own
 * column, skills on demand. `expanded`: the same with every group open. Work always beneath in the
 * last two.
 */
export function RowDrill({
  mode,
  result,
  lines,
  problems,
  columns,
  category,
  initialLeaf = null,
  expandAll = false,
  onNavigate,
}: {
  mode: RowMode;
  result: HierarchyResult;
  lines: Record<string, string[]>;
  problems: Problem[];
  columns: ColumnBox[];
  category?: CategoryId;
  initialLeaf?: LeafId | null;
  /** Category mode: open every group of the category (a double-click on the dot, or a column view at skill level). */
  expandAll?: boolean;
  onNavigate?: (leaf: LeafId) => void;
}) {
  const allGroups = useMemo(() => result.columns.flatMap((c) => groupsOf(c).filter((g) => result.groups[g] !== undefined)), [result]);
  const [openGroups, setOpenGroups] = useState<GroupId[]>(() =>
    mode === "expanded" ? allGroups : expandAll && category ? allGroups.filter((g) => categoryOf(g) === category) : initialLeaf ? [groupOf(initialLeaf)] : [],
  );
  const [leaf, setLeaf] = useState<LeafId | null>(initialLeaf);
  const rootRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLUListElement>(null);
  const [below, setBelow] = useState(mode !== "category");
  useLayoutEffect(() => {
    if (mode !== "category") return;
    const root = rootRef.current;
    const tree = treeRef.current;
    if (!root || !tree) return;
    const measure = () => setBelow(root.clientWidth - tree.offsetLeft - tree.offsetWidth - 32 < MIN_PANEL);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    ro.observe(tree);
    return () => ro.disconnect();
  }, [mode, leaf, openGroups]);

  const toggleGroup = (g: GroupId) => {
    setOpenGroups((os) => (os.includes(g) ? os.filter((x) => x !== g) : [...os, g]));
    setLeaf(null);
  };
  const pickLeaf = (l: LeafId) => setLeaf(leaf === l ? null : l);
  const goTo = (target: LeafId) => {
    if (mode === "category" && category && categoryOf(target) !== category) {
      onNavigate?.(target);
      return;
    }
    setOpenGroups((os) => (os.includes(groupOf(target)) ? os : [...os, groupOf(target)]));
    setLeaf(target);
  };

  if (mode === "category" && category) {
    const box = columns.find((c) => c.category === category);
    return (
      <div ref={rootRef} className={`flex min-h-0 gap-8 ${below ? "flex-col" : "items-start"}`} data-drill data-mode={mode} data-panel={below ? "below" : "beside"}>
        <SkillTree ref={treeRef} category={category} result={result} openGroups={openGroups} leaf={leaf} onGroup={toggleGroup} onLeaf={pickLeaf} marginLeft={Math.max(0, box?.left ?? 0)} />
        {leaf && <WorkPanel leaf={leaf} lines={lines} problems={problems} status={result.leaves[leaf]!} wide={below} onGoTo={goTo} />}
      </div>
    );
  }

  const first = columns[0]?.left ?? 0;
  return (
    <div className="flex flex-col gap-5" data-drill data-mode={mode} data-panel="below">
      <div className="grid items-start" style={{ gridTemplateColumns: `${Math.max(0, first)}px ${columns.map((c, i) => `${i < columns.length - 1 ? columns[i + 1].left - c.left : c.width}px`).join(" ")}` }} data-trees>
        <div />
        {columns.map((c) => (
          <SkillTree key={c.category} category={c.category} result={result} openGroups={openGroups} leaf={leaf} onGroup={toggleGroup} onLeaf={pickLeaf} width={c.width} />
        ))}
      </div>
      {leaf && <WorkPanel leaf={leaf} lines={lines} problems={problems} status={result.leaves[leaf]!} wide onGoTo={goTo} />}
    </div>
  );
}

/* ---------- the reports' browse drill ---------- */

/** Categories at the top level, groups nested, skills nested; work to the right, or beneath when it won't fit. */
export default function HierarchyDrill({ result, lines, problems }: { result: HierarchyResult; lines: Record<string, string[]>; problems: Problem[] }) {
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [group, setGroup] = useState<GroupId | null>(null);
  const [leaf, setLeaf] = useState<LeafId | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLUListElement>(null);
  const [below, setBelow] = useState(false);
  useLayoutEffect(() => {
    const root = rootRef.current;
    const tree = treeRef.current;
    if (!root || !tree) return;
    const measure = () => setBelow(root.clientWidth - tree.offsetWidth - 32 < MIN_PANEL);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    ro.observe(tree);
    return () => ro.disconnect();
  }, [leaf, group, category]);
  const leavesIn = (g: GroupId) => worst(leavesOf(g).filter((l) => result.leaves[l] !== undefined), (l) => result.leaves[l]!);
  const goTo = (target: LeafId) => {
    setCategory(categoryOf(target));
    setGroup(groupOf(target));
    setLeaf(target);
  };
  return (
    <div ref={rootRef} className={`flex min-h-0 gap-8 ${below ? "flex-col" : "items-start"}`} data-drill data-mode="browse" data-panel={below ? "below" : "beside"}>
      <ul ref={treeRef} className="shrink-0 space-y-1 self-start" data-col="tree">
        {result.columns.map((c) => (
          <li key={c}>
            <Node label={categoryName(c).name} status={result.categories[c] ?? "unseen"} half={result.half.categories.includes(c)} open={c === category} fit={FULL} onClick={() => { setCategory(category === c ? null : c); setGroup(null); setLeaf(null); }} node={c} />
            {c === category && (
              <ul className="mt-1 space-y-1 pl-7" data-col="groups">
                {worst(groupsOf(c).filter((g) => result.groups[g] !== undefined), (g) => result.groups[g]!).map((g) => (
                  <li key={g}>
                    <Node label={groupName(g).name} status={result.groups[g]!} half={result.half.groups.includes(g)} open={g === group} fit={FULL} onClick={() => { setGroup(group === g ? null : g); setLeaf(null); }} node={g} />
                    {g === group && (
                      <ul className="mt-1 space-y-1 pl-7" data-col="leaves">
                        {leavesIn(g).map((l) => (
                          <li key={l}>
                            <Node label={leafName(l).name} status={result.leaves[l]!} half={result.half.leaves.includes(l)} open={l === leaf} fit={FULL} onClick={() => setLeaf(leaf === l ? null : l)} node={l} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      {leaf && <WorkPanel leaf={leaf} lines={lines} problems={problems} status={result.leaves[leaf]!} wide={below} onGoTo={goTo} />}
    </div>
  );
}
