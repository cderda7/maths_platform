"use client";

import { useState } from "react";
import M from "@/components/Math";
import { Eyebrow } from "@/components/ui";
import { StatusDot, STATUS_TEXT, STATUS_WORD } from "@/components/Tag";
import { categoryName, groupName, groupsOf, leafName, leavesOf, type CategoryId, type GroupId, type LeafId } from "@/data/taxonomy";
import type { Problem, Status } from "@/data/types";
import { evaluateLine } from "@/lib/evaluate";
import { lineMarks } from "@/lib/examples";
import { problemsForLeaf, STATUS_RANK, type HierarchyResult } from "@/lib/hierarchy";

/**
 * The category → group → leaf → work drill, shared by the teacher's grid (one category, locked)
 * and the final reports (browse every category). Columns flow right; groups and leaves sort
 * worst-first; the work panel shows the student's lines with the marked-view treatment and a left
 * rule on the lines tagged to the chosen leaf. `compact` (the iPad) collapses visited columns to a
 * breadcrumb when four don't fit.
 */
export default function HierarchyDrill({
  result,
  lines,
  problems,
  lockCategory,
  compact = false,
}: {
  result: HierarchyResult;
  lines: Record<string, string[]>;
  problems: Problem[];
  lockCategory?: CategoryId;
  compact?: boolean;
}) {
  const [category, setCategory] = useState<CategoryId | null>(lockCategory ?? null);
  const [group, setGroup] = useState<GroupId | null>(null);
  const [leaf, setLeaf] = useState<LeafId | null>(null);
  const cat = lockCategory ?? category;
  const worst = <T extends string>(ids: T[], status: (id: T) => Status) => [...ids].sort((a, b) => STATUS_RANK[status(a)] - STATUS_RANK[status(b)]);
  const groups = cat ? worst(groupsOf(cat).filter((g) => result.groups[g] !== undefined), (g) => result.groups[g]!) : [];
  const leaves = group ? worst(leavesOf(group).filter((l) => result.leaves[l] !== undefined), (l) => result.leaves[l]!) : [];
  const depth = (lockCategory ? 0 : 1) + (cat ? 1 : 0) + (group ? 1 : 0) + (leaf ? 1 : 0);
  const collapse = compact && depth >= 4;

  const pickCategory = (c: CategoryId) => {
    setCategory(c);
    setGroup(null);
    setLeaf(null);
  };
  const pickGroup = (g: GroupId) => {
    setGroup(group === g ? null : g);
    setLeaf(null);
  };

  return (
    <div className="flex min-h-0 flex-col" data-drill data-depth={depth}>
      {lockCategory && !collapse && (
        <div className="mb-3 flex items-center gap-2.5" data-locked-category>
          <StatusDot status={result.categories[lockCategory] ?? "unseen"} half={result.half.categories.includes(lockCategory)} size="h-[15px] w-[15px]" />
          <span className="font-display text-[18px] text-ink">{categoryName(lockCategory).name}</span>
          <span className={`text-[12px] ${STATUS_TEXT[result.categories[lockCategory] ?? "unseen"]}`}>{STATUS_WORD[result.categories[lockCategory] ?? "unseen"]}</span>
        </div>
      )}
      {collapse && (
        <nav className="mb-3 flex items-center gap-2 text-[12.5px] text-ink-soft" aria-label="Drill path" data-breadcrumb>
          {!lockCategory && (
            <button type="button" className="hover:text-ink" onClick={() => pickCategory(cat!)}>
              {categoryName(cat!).name}
            </button>
          )}
          {lockCategory && <span>{categoryName(cat!).name}</span>}
          <span aria-hidden>›</span>
          <button type="button" className="hover:text-ink" onClick={() => setLeaf(null)}>
            {groupName(group!).name}
          </button>
          <span aria-hidden>›</span>
          <span className="text-ink">{leafName(leaf!).name}</span>
        </nav>
      )}
      <div className="flex min-h-0 gap-4">
        {!collapse && !lockCategory && (
          <Column title="Categories" data-col="categories">
            {result.columns.map((c) => (
              <Node key={c} label={categoryName(c).name} status={result.categories[c] ?? "unseen"} half={result.half.categories.includes(c)} active={c === cat} onClick={lockCategory ? undefined : () => pickCategory(c)} data-node={c} />
            ))}
          </Column>
        )}
        {cat && !collapse && (
          <Column title="Groups" data-col="groups">
            {groups.map((g) => (
              <Node key={g} label={groupName(g).name} status={result.groups[g]!} half={result.half.groups.includes(g)} active={g === group} onClick={() => pickGroup(g)} data-node={g} />
            ))}
          </Column>
        )}
        {group && !collapse && (
          <Column title="Skills" data-col="leaves">
            {leaves.map((l) => (
              <Node key={l} label={leafName(l).name} status={result.leaves[l]!} half={result.half.leaves.includes(l)} active={l === leaf} onClick={() => setLeaf(leaf === l ? null : l)} data-node={l} />
            ))}
          </Column>
        )}
        {leaf && <WorkPanel leaf={leaf} lines={lines} problems={problems} status={result.leaves[leaf]!} />}
      </div>
    </div>
  );
}

function Column({ title, children, ...rest }: { title: string; children: React.ReactNode } & Record<string, unknown>) {
  return (
    <div className="w-48 shrink-0" {...rest}>
      <Eyebrow>{title}</Eyebrow>
      <ul className="mt-2 space-y-1.5">{children}</ul>
    </div>
  );
}

function Node({ label, status, half, active, onClick, ...rest }: { label: string; status: Status; half: boolean; active: boolean; onClick?: () => void } & Record<string, unknown>) {
  const body = (
    <>
      <StatusDot status={status} half={half} size="h-[15px] w-[15px]" />
      <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink">{label}</span>
      <span className={`text-[11.5px] ${STATUS_TEXT[status]}`}>{STATUS_WORD[status]}</span>
    </>
  );
  const cls = `flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors ${active ? "border-ink bg-cream" : "border-line bg-paper hover:border-ink-muted"}`;
  return (
    <li>
      {onClick ? (
        <button type="button" onClick={onClick} aria-pressed={active} className={cls} {...rest}>
          {body}
        </button>
      ) : (
        <div className={cls} {...rest}>
          {body}
        </div>
      )}
    </li>
  );
}

/** The student's work on the problems that invoke a leaf: marked lines, with a left rule on the lines tagged to that leaf. */
function WorkPanel({ leaf, lines, problems, status }: { leaf: LeafId; lines: Record<string, string[]>; problems: Problem[]; status: Status }) {
  const invoking = problemsForLeaf(leaf, problems);
  return (
    <div className="min-w-0 flex-1" data-col="work" data-leaf={leaf}>
      <div className="flex items-center gap-3">
        <Eyebrow>{leafName(leaf).name}</Eyebrow>
        <span className={`text-[11.5px] ${STATUS_TEXT[status]}`}>{STATUS_WORD[status]}</span>
      </div>
      <div className="mt-2 grid gap-3 xl:grid-cols-2">
        {invoking.map((p) => {
          const texs = lines[p.id] ?? [];
          const marks = lineMarks(p.id, texs);
          return (
            <section key={p.id} className="rounded-xl border border-line bg-paper p-3" data-work-problem={p.id}>
              <div className="flex items-center gap-2">
                <span className="font-display text-[16px] text-ink">{p.label}</span>
                <span className="text-[13px] text-ink-soft">
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
                    return (
                      <li
                        key={i}
                        data-mark={mark ?? undefined}
                        data-tagged={tagged || undefined}
                        className={`rounded-lg border px-3 py-1.5 text-[14.5px] text-ink ${tagged ? "border-l-[3px] border-l-ink" : ""} ${
                          mark === "wrong" ? "border-wrong-line bg-wrong-soft" : mark === "standout" ? "border-standout-line bg-standout-soft" : "border-line bg-cream/40"
                        }`}
                      >
                        <M tex={tex} />
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
