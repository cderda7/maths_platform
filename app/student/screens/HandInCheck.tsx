"use client";

import { Button } from "@/components/ui";
import type { Problem } from "@/data/types";

/**
 * The hand-in check (ticket 115): Hand in was pressed with problems still blank. A card in the
 * bottom right, over the Hand in button: a way back to each blank problem, or "Confirm submit".
 * One blank problem is a "Return to Qn" button; several read "Return to Q1, Q2, Q3", each label
 * a button that sits in a blue box under the pointer.
 */
export default function HandInCheck({
  blank,
  onReturn,
  onConfirm,
}: {
  blank: { problem: Problem; index: number }[];
  onReturn: (index: number) => void;
  onConfirm: () => void;
}) {
  const one = blank.length === 1 ? blank[0] : null;
  return (
    <div role="dialog" aria-label="Hand in with blank problems" data-hand-in-check className="absolute right-4 bottom-4 z-20 w-[340px] rounded-2xl border border-line bg-paper p-5 shadow-lift">
      <h2 className="font-display text-[20px] leading-tight text-ink">{one ? `Hand in with ${one.problem.label} blank?` : "Hand in with blanks?"}</h2>
      {one ? (
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onReturn(one.index)} data-return={one.problem.id}>
            Return to {one.problem.label}
          </Button>
          <Button variant="accent" onClick={onConfirm} data-confirm>
            Confirm submit
          </Button>
        </div>
      ) : (
        <>
          <p className="mt-3 text-[14px] text-ink-soft">
            Return to{" "}
            {blank.map(({ problem, index }, n) => (
              <span key={problem.id}>
                {n > 0 && ", "}
                <button
                  type="button"
                  onClick={() => onReturn(index)}
                  data-return={problem.id}
                  className="-mx-1 rounded-md border border-transparent px-1 py-0.5 font-medium text-accent-deep transition-colors hover:border-standout-line hover:bg-standout-soft hover:text-standout"
                >
                  {problem.label}
                </button>
              </span>
            ))}
          </p>
          <div className="mt-4 flex justify-end">
            <Button variant="accent" onClick={onConfirm} data-confirm>
              Confirm submit
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
