"use client";

import { useLayoutEffect, useRef, useState } from "react";
import M from "@/components/Math";
import { Eyebrow } from "@/components/ui";
import { DifficultyTag, StatusDot, STATUS_TEXT, STATUS_WORD } from "@/components/Tag";
import { categoryName, categoryOf, groupName, groupOf, groupsOf, leafName, leavesOf, type CategoryId, type GroupId, type LeafId } from "@/data/taxonomy";
import type { Problem, Status } from "@/data/types";
import { evaluateLine } from "@/lib/evaluate";
import { lineMarks } from "@/lib/examples";
import { problemsForLeaf, STATUS_RANK, type HierarchyResult } from "@/lib/hierarchy";

/**
 * The skill drill as an outline: groups stacked with their dots on one vertical line (under the
 * category dot when the grid opens it), the open group's skills indented beneath it, text always
 * to the right of the dot, never truncated. The rule: the category dot and the group dots
 * stay on one vertical line at all times, so the drill never scrolls. The work for the chosen skill
 * sits to the right when there is room beside the tree, otherwise beneath it at full width. In browse mode (the
 * reports) categories are the top level and everything nests in place.
 */
export default function HierarchyDrill({
  result,
  lines,
  problems,
  lockCategory,
  offsetLeft = 0,
  initialLeaf = null,
  onNavigate,
}: {
  result: HierarchyResult;
  lines: Record<string, string[]>;
  problems: Problem[];
  lockCategory?: CategoryId;
  /** Pixels from the container's left edge to where the tree's dots should sit (under the category dot). */
  offsetLeft?: number;
  /** Open straight onto this skill (its group expanded, its work shown). */
  initialLeaf?: LeafId | null;
  /** In locked mode, asked to open a skill in another category: the owner re-opens the drill there. */
  onNavigate?: (leaf: LeafId) => void;
}) {
  const [category, setCategory] = useState<CategoryId | null>(lockCategory ?? (initialLeaf ? categoryOf(initialLeaf) : null));
  const [group, setGroup] = useState<GroupId | null>(initialLeaf ? groupOf(initialLeaf) : null);
  const [leaf, setLeaf] = useState<LeafId | null>(initialLeaf);
  /** Jump to a skill's own view: same category → expand in place; another category → hand over to the owner. */
  const goTo = (target: LeafId) => {
    if (lockCategory && categoryOf(target) !== lockCategory) {
      onNavigate?.(target);
      return;
    }
    setCategory(categoryOf(target));
    setGroup(groupOf(target));
    setLeaf(target);
  };
  const rootRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLUListElement>(null);
  const [below, setBelow] = useState(false);
  useLayoutEffect(() => {
    const root = rootRef.current;
    const tree = treeRef.current;
    if (!root || !tree) return;
    const measure = () => setBelow(root.clientWidth - tree.offsetLeft - tree.offsetWidth - 32 < MIN_PANEL);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    ro.observe(tree);
    return () => ro.disconnect();
  }, [offsetLeft, leaf, group, category]);
  const worst = <T extends string>(ids: T[], status: (id: T) => Status) => [...ids].sort((a, b) => STATUS_RANK[status(a)] - STATUS_RANK[status(b)]);
  const groupsIn = (c: CategoryId) => worst(groupsOf(c).filter((g) => result.groups[g] !== undefined), (g) => result.groups[g]!);
  const leavesIn = (g: GroupId) => worst(leavesOf(g).filter((l) => result.leaves[l] !== undefined), (l) => result.leaves[l]!);
  const pickCategory = (c: CategoryId) => {
    setCategory(category === c ? null : c);
    setGroup(null);
    setLeaf(null);
  };
  const pickGroup = (g: GroupId) => {
    setGroup(group === g ? null : g);
    setLeaf(null);
  };

  const groupTree = (c: CategoryId, indent: number) =>
    groupsIn(c).map((g) => (
      <li key={g}>
        <Node label={groupName(g).name} status={result.groups[g]!} half={result.half.groups.includes(g)} open={g === group} onClick={() => pickGroup(g)} data-node={g} />
        {g === group && (
          <ul className="mt-1 space-y-1" style={{ paddingLeft: indent }} data-col="leaves">
            {leavesIn(g).map((l) => (
              <li key={l}>
                <Node label={leafName(l).name} status={result.leaves[l]!} half={result.half.leaves.includes(l)} open={l === leaf} onClick={() => setLeaf(leaf === l ? null : l)} data-node={l} />
              </li>
            ))}
          </ul>
        )}
      </li>
    ));

  return (
    <div ref={rootRef} className={`flex min-h-0 gap-8 ${below ? "flex-col" : "items-start"}`} data-drill data-mode={lockCategory ? "locked" : "browse"} data-panel={below ? "below" : "beside"}>
      <ul ref={treeRef} className="shrink-0 space-y-1 self-start whitespace-nowrap" style={{ marginLeft: Math.max(0, offsetLeft) }} data-col="tree">
        {lockCategory
          ? groupTree(lockCategory, 28)
          : result.columns.map((c) => (
              <li key={c}>
                <Node label={categoryName(c).name} status={result.categories[c] ?? "unseen"} half={result.half.categories.includes(c)} open={c === category} onClick={() => pickCategory(c)} data-node={c} />
                {c === category && (
                  <ul className="mt-1 space-y-1 pl-7" data-col="groups">
                    {groupTree(c, 28)}
                  </ul>
                )}
              </li>
            ))}
      </ul>
      {leaf && <WorkPanel leaf={leaf} lines={lines} problems={problems} status={result.leaves[leaf]!} wide={below} onGoTo={goTo} />}
    </div>
  );
}

const MIN_PANEL = 600;

/** A dot with its name to the right. Status is in the dot's colour (and the accessible name), not in words. */
function Node({ label, status, half, open, onClick, ...rest }: { label: string; status: Status; half: boolean; open: boolean; onClick: () => void } & Record<string, unknown>) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={open}
      aria-label={`${label}: ${STATUS_WORD[status]}${half ? ", some problems not attempted" : ""}`}
      className={`-ml-1.5 flex items-center gap-2.5 rounded-lg border py-1 pl-1.5 pr-3 text-left transition-colors ${open ? "border-ink bg-paper" : "border-transparent hover:bg-cream-deep/60"}`}
      {...rest}
    >
      <StatusDot status={status} half={half} size="h-[15px] w-[15px]" />
      <span className="text-[13.5px] text-ink">{label}</span>
    </button>
  );
}

/** The student's work on the problems that invoke a leaf: marked lines, with a left rule on the lines tagged to that leaf. */
function WorkPanel({ leaf, lines, problems, status, wide, onGoTo }: { leaf: LeafId; lines: Record<string, string[]>; problems: Problem[]; status: Status; wide: boolean; onGoTo: (l: LeafId) => void }) {
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
                    const blamed = v.verdict === "wrong" ? v.tags[0].leaf : null;
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
