"use client";

import { useState } from "react";
import M from "@/components/Math";
import { Button, Card } from "@/components/ui";
import { LeafChip } from "@/components/Tag";
import { branchesOf } from "@/lib/branches";
import type { PracticeProblem } from "@/data/types";

/**
 * One isolated practice problem: the stem, then the worked steps revealed one at a time so the
 * student can compare against their own working. Uncontrolled by default (the mid-set practice);
 * pass `shown` and `onReveal` to keep the count in the session (the warm-up's worked example).
 * `compact` stacks each step's label over its maths for a narrow column. A two-case step ("x = 4 or
 * x = -2") is two boxes side by side, as the read-back shows it.
 */
export default function PracticeCard({
  practice,
  onAllShown,
  shown: controlled,
  onReveal,
  compact = false,
}: {
  practice: PracticeProblem;
  onAllShown?: (all: boolean) => void;
  shown?: number;
  onReveal?: () => void;
  compact?: boolean;
}) {
  const [local, setLocal] = useState(0);
  const shown = controlled ?? local;
  const all = shown >= practice.steps.length;
  const reveal = () => {
    if (onReveal) return onReveal();
    const n = local + 1;
    setLocal(n);
    onAllShown?.(n >= practice.steps.length);
  };
  return (
    <Card className={compact ? "p-5" : "p-7"}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[14px] text-ink-soft">{practice.stem}</span>
        <LeafChip student id={practice.leaf} />
      </div>
      <div className={`${compact ? "mt-2 text-[20px]" : "math-lg mt-3"} text-ink`}>
        <M tex={practice.tex} display />
      </div>
      <ol className={`${compact ? "mt-4 space-y-3 pt-4" : "mt-6 space-y-3 pt-6"} border-t border-line`}>
        {practice.steps.slice(0, shown).map((st, i) => {
          const branches = branchesOf(st.tex);
          return (
            <li key={i} className={compact ? "flex flex-col gap-0.5" : "flex items-center gap-5"}>
              <span className={`${compact ? "" : "w-44"} shrink-0 text-[12.5px] text-ink-muted`}>{st.label}</span>
              {branches.length === 2 ? (
                <span className={`flex gap-2 ${compact ? "text-[16px]" : "text-[17px]"} text-ink`} data-branches>
                  {branches.map((b, j) => (
                    <span key={j} className="rounded-lg border border-line bg-paper px-3 py-1">
                      <M tex={b} />
                    </span>
                  ))}
                </span>
              ) : (
                <span className={`${compact ? "text-[16px]" : "text-[17px]"} text-ink`}>
                  <M tex={st.tex} />
                </span>
              )}
            </li>
          );
        })}
        {!all && (
          <li>
            <Button variant="secondary" onClick={reveal}>
              {shown === 0 ? "First step" : "Next step"}
            </Button>
          </li>
        )}
      </ol>
    </Card>
  );
}
