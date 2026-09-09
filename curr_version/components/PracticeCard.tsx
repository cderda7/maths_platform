"use client";

import { useState } from "react";
import M from "@/components/Math";
import { Button, Card } from "@/components/ui";
import { SubskillChip } from "@/components/Tag";
import type { PracticeProblem } from "@/data/types";

/**
 * One isolated practice problem: the stem, then the worked steps revealed one at a time so the
 * student can compare against their own working on paper (or, once the pad is in, on the pad).
 * Used by the pre-set warm-up, the escalation prompt and the help flow alike.
 */
export default function PracticeCard({ practice, onAllShown }: { practice: PracticeProblem; onAllShown?: (all: boolean) => void }) {
  const [shown, setShown] = useState(0);
  const all = shown >= practice.steps.length;
  const reveal = () => {
    const n = shown + 1;
    setShown(n);
    onAllShown?.(n >= practice.steps.length);
  };
  return (
    <Card className="p-7">
      <div className="flex items-center justify-between">
        <span className="text-[14px] text-ink-soft">{practice.stem}</span>
        <SubskillChip id={practice.subskill} />
      </div>
      <div className="math-lg mt-3 text-ink">
        <M tex={practice.tex} display />
      </div>
      <ol className="mt-6 space-y-3 border-t border-line pt-6">
        {practice.steps.slice(0, shown).map((st, i) => (
          <li key={i} className="flex items-center gap-5">
            <span className="w-44 shrink-0 text-[12.5px] text-ink-muted">{st.label}</span>
            <span className="text-[17px] text-ink">
              <M tex={st.tex} />
            </span>
          </li>
        ))}
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
