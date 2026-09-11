"use client";

import { useState } from "react";
import M from "@/components/Math";
import { Button, Card } from "@/components/ui";
import { LeafChip } from "@/components/Tag";
import { branchesOf } from "@/lib/branches";
import type { PracticeProblem } from "@/data/types";

/**
 * One isolated practice problem: the stem, then the worked steps revealed one at a time so the
 * student can compare against their own working. Each step is the maths alone, set at the
 * problem's own size and against the left edge under it (`math-left`), so the working reads as
 * one column; what a step does
 * is for the chat beside the example, not a caption. Uncontrolled by default (the mid-set
 * practice); pass `shown` and `onReveal` to keep the count in the session (the warm-up's worked
 * example). `compact` is the size for a narrow column. A two-case step ("x = 4 or x = -2") is
 * two boxes side by side, as the read-back shows it.
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
  /** The problem and every step share one size, so the column reads as one piece of working. */
  const size = compact ? "text-[20px]" : "math-lg";
  /** Every step is a row under a rule, the same air above and below the rule as between the problem and the first step. */
  const row = compact ? "mt-4 border-t border-line pt-4" : "mt-6 border-t border-line pt-6";
  return (
    <Card className={`math-left ${compact ? "p-5" : "p-7"}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[14px] text-ink-soft">{practice.stem}</span>
        <LeafChip student id={practice.leaf} />
      </div>
      <div className={`${size} ${compact ? "mt-2" : "mt-3"} text-ink`}>
        <M tex={practice.tex} display />
      </div>
      <ol>
        {practice.steps.slice(0, shown).map((st, i) => {
          const branches = branchesOf(st.tex);
          return (
            <li key={i} className={`${row} ${size} text-ink`} data-step={i + 1}>
              {branches.length === 2 ? (
                <span className="flex gap-2" data-branches>
                  {branches.map((b, j) => (
                    <span key={j} className="rounded-lg border border-line bg-paper px-3 py-1">
                      <M tex={b} display />
                    </span>
                  ))}
                </span>
              ) : (
                <M tex={st.tex} display />
              )}
            </li>
          );
        })}
        {!all && (
          <li className={compact ? "mt-4" : "mt-6"}>
            <Button variant="secondary" onClick={reveal}>
              {shown === 0 ? "First step" : "Next step"}
            </Button>
          </li>
        )}
      </ol>
    </Card>
  );
}
