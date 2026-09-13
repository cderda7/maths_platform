"use client";

import { forwardRef, useLayoutEffect, useMemo, useRef, useState } from "react";
import FitText from "@/components/FitText";
import M from "@/components/Math";
import { Eyebrow } from "@/components/ui";
import { DifficultyTag, StatusDot, STATUS_TEXT, STATUS_WORD } from "@/components/Tag";
import { categoryOf, groupName, groupOf, groupsOf, isFlat, leafName, studentLeafName, type CategoryId, type GroupId, type LeafId } from "@/data/taxonomy";
import type { Problem, Status } from "@/data/types";
import { evaluateLine } from "@/lib/evaluate";
import { lineMarks } from "@/lib/examples";
import { columnOf, homeLeaves, problemsForLeaf, STATUS_RANK, type HierarchyResult } from "@/lib/hierarchy";

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
let family = "";
/** Measures with the page's real body font (next/font gives Inter a generated family name), padded 4 % for rendering slack. */
export function textWidth(text: string, size: number, weight = 400): number {
  if (typeof document === "undefined") return text.length * size * 0.55;
  if (ctx === undefined) {
    ctx = document.createElement("canvas").getContext("2d");
    family = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
  }
  if (!ctx) return text.length * size * 0.55;
  ctx.font = `${weight} ${size}px ${family}`;
  return ctx.measureText(text).width * 1.04;
}

export interface Fit {
  size: number;
  dot: number;
  indent: number;
  wrap: boolean;
}
const FULL: Fit = { size: 13.5, dot: 15, indent: 28, wrap: false };
const SIZES = [13.5, 12.5, 11.5, 10.5, 9.5, 9];
/** A node's own horizontal box around dot and text (`Node`'s layout: pl-1.5 + pr-2.5 − ml-[7px]); left out, a wrapped name broke a line early (ticket 227). */
export const NODE_PAD = 6 + 10 - 7;

/** The largest text size at which every label (its indent, the node's padding, dot + gap + text) fits in `available`; wrapping as a last resort. */
export function fitLabels(labels: { text: string; depth: number }[], available: number | undefined): Fit {
  if (!available || labels.length === 0) return FULL;
  for (const size of SIZES) {
    const dot = size >= 12 ? 15 : 12;
    const indent = Math.round(size * 2);
    const gap = 8;
    if (labels.every((l) => l.depth * indent + NODE_PAD + dot + gap + textWidth(l.text, size) <= available)) return { size, dot, indent, wrap: false };
  }
  const size = 10.5;
  const dot = 12;
  const indent = 21;
  // Wrapped at 10.5 only when no name takes more than two lines; a word alone on a third ("sketching / a / parabola") drops to 9 (ticket 227).
  const twoLines = labels.every((l) => lineCount(l.text, size, available - (l.depth * indent + NODE_PAD + dot + 8)) <= 2);
  return twoLines ? { size, dot, indent, wrap: true } : { size: 9, dot: 12, indent: 18, wrap: true };
}

/** Lines a greedy break of `text` takes in `width` at `size` (balanced wrapping never takes more); Infinity when a word is wider than the line, since the browser would split it ("zero- / finding"). */
export function lineCount(text: string, size: number, width: number): number {
  let lines = 0;
  let line = "";
  for (const word of text.split(" ")) {
    if (textWidth(word, size) > width) return Infinity;
    const next = line ? `${line} ${word}` : word;
    if (line && textWidth(next, size) > width) {
      lines++;
      line = word;
    } else line = next;
  }
  return lines + (line ? 1 : 0);
}

/* ---------- nodes and trees ---------- */

/**
 * Group and skill names read lowercase behind a dot; a category (`category`) keeps its case and
 * carries the pill. A `fixed` node is the same row drawn as plain text (ticket 169): no button, no
 * hover, no pressed state, for a tree that never opens or closes.
 */
function Node({ label, status, half, open, fit, onClick, node, category = false, fixed = false }: { label: string; status: Status; half: boolean; open: boolean; fit: Fit; onClick: () => void; node: string; category?: boolean; fixed?: boolean }) {
  const inner = (
    <>
      {category ? <StatusDot status={status} half={half} shape="pill" className="shrink-0" /> : <StatusDot status={status} half={half} px={fit.dot} className="shrink-0" />}
      <span className={`leading-tight text-ink ${category ? "" : "lowercase"} ${fit.wrap ? "whitespace-normal [text-wrap:balance]" : "whitespace-nowrap"}`} style={{ fontSize: fit.size }}>
        {label}
      </span>
    </>
  );
  const layout = "-ml-[7px] flex items-center gap-2 rounded-lg border py-1 pl-1.5 pr-2.5 text-left";
  if (fixed) {
    return (
      <div className={`${layout} border-transparent`} role="img" aria-label={`${label}: ${STATUS_WORD[status]}${half ? ", some problems not attempted" : ""}`} data-node={node} data-fixed>
        {inner}
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={open}
      aria-label={`${label}: ${STATUS_WORD[status]}${half ? ", some problems not attempted" : ""}`}
      className={`${layout} transition-colors ${open ? "border-ink bg-paper" : "border-transparent hover:bg-cream-deep/60"}`}
      data-node={node}
    >
      {inner}
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
  /** The student's own report: skills by their student-facing names. */
  student?: boolean;
  /** The groups are fixed rows, not toggles: whatever `openGroups` says stays as it is (ticket 169). */
  lockGroups?: boolean;
}

export const SkillTree = forwardRef<HTMLUListElement, TreeProps>(function SkillTree({ category, result, openGroups, leaf, onGroup, onLeaf, width, marginLeft, student = false, lockGroups = false }, ref) {
  const groups = worst(groupsOf(category).filter((g) => result.groups[g] !== undefined), (g) => result.groups[g]!);
  // A skill new on the set is under New skills only, never under its home group too (ticket 209).
  const leavesIn = (g: GroupId) => worst(homeLeaves(g, result.newSkills).filter((l) => result.leaves[l] !== undefined), (l) => result.leaves[l]!);
  const name = (l: LeafId) => (student ? studentLeafName(l) : leafName(l)).name;
  const flat = isFlat(category);
  const flatLeaves = flat ? worst(result.newSkills.filter((l) => result.leaves[l] !== undefined), (l) => result.leaves[l]!) : [];
  const labels = flat ? flatLeaves.map((l) => ({ text: name(l), depth: 0 })) : groups.flatMap((g) => [{ text: groupName(g).name, depth: 0 }, ...(openGroups.includes(g) ? leavesIn(g).map((l) => ({ text: name(l), depth: 1 })) : [])]);
  const fit = fitLabels(labels, width);
  const centre = (FULL.dot - fit.dot) / 2; // a smaller dot still sits centred on the category dot's line
  const style = { width, marginLeft: marginLeft === undefined ? undefined : marginLeft + centre, paddingLeft: marginLeft === undefined ? centre : undefined };
  if (flat) {
    return (
      <ul ref={ref} className="space-y-0.5 self-start" style={style} data-col="tree" data-category={category} data-fit={fit.size} data-flat>
        {flatLeaves.map((l) => (
          <li key={l}>
            <Node label={name(l)} status={result.leaves[l]!} half={result.half.leaves.includes(l)} open={l === leaf} fit={fit} onClick={() => onLeaf(l)} node={l} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul ref={ref} className="space-y-0.5 self-start" style={style} data-col="tree" data-category={category} data-fit={fit.size}>
      {groups.map((g) => (
        <li key={g}>
          <Node label={groupName(g).name} status={result.groups[g]!} half={result.half.groups.includes(g)} open={openGroups.includes(g)} fit={fit} onClick={() => onGroup(g)} node={g} fixed={lockGroups} />
          {openGroups.includes(g) && (
            <ul className="mt-0.5 space-y-0.5" style={{ paddingLeft: fit.indent }} data-col="leaves">
              {leavesIn(g).map((l) => (
                <li key={l}>
                  <Node label={name(l)} status={result.leaves[l]!} half={result.half.leaves.includes(l)} open={l === leaf} fit={fit} onClick={() => onLeaf(l)} node={l} />
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

/**
 * One problem's marked transcription (the student's final lines): red on a step that didn't hold, blue on a
 * curated standout, a left rule on lines tagged to `leaf` when there is one, and a ⚠ chip on a red line whose
 * mistake belongs to another skill (a click opens that skill). `narrow` (the student report's side column,
 * ticket 233) puts the problem under its label and fits each line to the column, since maths never splits.
 */
export function ProblemWork({ problem: p, texs, leaf = null, onGoTo, student = false, narrow = false }: { problem: Problem; texs: string[]; leaf?: LeafId | null; onGoTo: (l: LeafId) => void; student?: boolean; narrow?: boolean }) {
  const marks = lineMarks(p.id, texs);
  return (
    <section className="rounded-xl border border-line bg-paper p-3" data-work-problem={p.id}>
      <div className={narrow ? "min-w-0" : "flex items-center gap-2.5"}>
        <span className="font-display text-[16px] text-ink">{p.label}</span>
        {!student && <DifficultyTag d={p.difficulty} />}
        {narrow ? (
          <div className="mt-1 min-w-0 text-ink-soft">
            <FitText max={13} fitKey={p.tex}>
              <M tex={p.tex} />
            </FitText>
          </div>
        ) : (
          <span className="ml-auto text-[13px] text-ink-soft">
            <M tex={p.tex} />
          </span>
        )}
      </div>
      {texs.length === 0 ? (
        <p className="mt-2 text-[12.5px] text-ink-muted" data-not-attempted>
          not attempted
        </p>
      ) : (
        <ol className="mt-2 space-y-1.5">
          {texs.map((tex, i) => {
            const v = evaluateLine(p.id, tex);
            const tagged = leaf !== null && v.verdict !== "unclear" && v.tags.some((t) => t.leaf === leaf);
            const mark = marks[i];
            const blamed = v.verdict === "wrong" && v.tags[0].leaf !== leaf ? v.tags[0].leaf : null;
            return (
              <li
                key={i}
                data-mark={mark ?? undefined}
                data-tagged={tagged || undefined}
                className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg border px-3 py-1.5 text-[14.5px] text-ink ${tagged ? "border-l-[3px] border-l-ink" : ""} ${
                  mark === "wrong" ? "border-wrong-line bg-wrong-soft" : mark === "standout" ? "border-standout-line bg-standout-soft" : "border-line bg-cream/40"
                }`}
              >
                {narrow ? (
                  <span className="block w-full min-w-0">
                    <FitText max={14.5} fitKey={tex}>
                      <M tex={tex} />
                    </FitText>
                  </span>
                ) : (
                  <M tex={tex} />
                )}
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
                    {(student ? studentLeafName(blamed) : leafName(blamed)).short}
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

/** The student's work on the problems that invoke a leaf, one `ProblemWork` each. `wide` lays them in three columns, `narrow` in one. */
export function WorkPanel({ leaf, lines, problems, status, wide, onGoTo, student = false, narrow = false }: { leaf: LeafId; lines: Record<string, string[]>; problems: Problem[]; status: Status; wide: boolean; onGoTo: (l: LeafId) => void; /** The student's own report: no difficulty tags. */ student?: boolean; narrow?: boolean }) {
  const invoking = problemsForLeaf(leaf, problems);
  return (
    <div className={wide ? "w-full" : "min-w-0 flex-1"} data-col="work" data-leaf={leaf}>
      <div className="flex items-center gap-3">
        <Eyebrow>{(student ? studentLeafName(leaf) : leafName(leaf)).name}</Eyebrow>
        <span className={`text-[11.5px] ${STATUS_TEXT[status]}`}>{STATUS_WORD[status]}</span>
      </div>
      <div className={`mt-2 grid gap-3 ${narrow ? "grid-cols-1" : wide ? "grid-cols-3" : "grid-cols-2"}`}>
        {invoking.map((p) => (
          <ProblemWork key={p.id} problem={p} texs={lines[p.id] ?? []} leaf={leaf} onGoTo={onGoTo} student={student} narrow={narrow} />
        ))}
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
 * last two. `locked` keeps the groups where the mode put them: the group rows are plain text, not
 * toggles, and only a skill still opens its work (the teacher's student report, ticket 169).
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
  student = false,
  locked = false,
  pickedLeaf,
  onPickLeaf,
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
  /** The student's own report: student-facing skill names, no difficulty tags. */
  student?: boolean;
  /** No group opens or closes; the mode's initial state is the whole view. */
  locked?: boolean;
  /** The picked skill, held by the caller, who shows its work elsewhere: nothing opens beneath (the student's report, ticket 233). */
  pickedLeaf?: LeafId | null;
  onPickLeaf?: (l: LeafId) => void;
}) {
  const allGroups = useMemo(() => result.columns.flatMap((c) => groupsOf(c).filter((g) => result.groups[g] !== undefined)), [result]);
  const [openGroups, setOpenGroups] = useState<GroupId[]>(() =>
    mode === "expanded" ? allGroups : expandAll && category ? allGroups.filter((g) => categoryOf(g) === category) : initialLeaf ? [groupOf(initialLeaf)] : [],
  );
  const [ownLeaf, setLeaf] = useState<LeafId | null>(initialLeaf);
  const outside = onPickLeaf !== undefined;
  const leaf = outside ? (pickedLeaf ?? null) : ownLeaf;
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
  const pickLeaf = (l: LeafId) => (outside ? onPickLeaf(l) : setLeaf(leaf === l ? null : l));
  const goTo = (target: LeafId) => {
    if (mode === "category" && category && columnOf(target, result.newSkills) !== category) {
      onNavigate?.(target);
      return;
    }
    setOpenGroups((os) => (os.includes(groupOf(target)) ? os : [...os, groupOf(target)]));
    setLeaf(target);
  };

  if (mode === "category" && category) {
    const box = columns.find((c) => c.category === category);
    return (
      <div ref={rootRef} className={`flex min-h-0 gap-8 ${below ? "flex-col" : "items-start"}`} data-drill data-mode={mode} data-panel={below ? "below" : "beside"} data-locked={locked || undefined}>
        <SkillTree ref={treeRef} category={category} result={result} openGroups={openGroups} leaf={leaf} onGroup={toggleGroup} onLeaf={pickLeaf} marginLeft={Math.max(0, box?.left ?? 0)} student={student} lockGroups={locked} />
        {leaf && <WorkPanel leaf={leaf} lines={lines} problems={problems} status={result.leaves[leaf]!} wide={below} onGoTo={goTo} student={student} />}
      </div>
    );
  }

  const first = columns[0]?.left ?? 0;
  return (
    <div className="flex flex-col gap-5" data-drill data-mode={mode} data-panel="below" data-locked={locked || undefined}>
      <div className="grid items-start" style={{ gridTemplateColumns: `${Math.max(0, first)}px ${columns.map((c, i) => `${i < columns.length - 1 ? columns[i + 1].left - c.left : c.width}px`).join(" ")}` }} data-trees>
        <div />
        {columns.map((c) => (
          <SkillTree key={c.category} category={c.category} result={result} openGroups={openGroups} leaf={leaf} onGroup={toggleGroup} onLeaf={pickLeaf} width={c.width} student={student} lockGroups={locked} />
        ))}
      </div>
      {leaf && !outside && <WorkPanel leaf={leaf} lines={lines} problems={problems} status={result.leaves[leaf]!} wide onGoTo={goTo} student={student} />}
    </div>
  );
}
