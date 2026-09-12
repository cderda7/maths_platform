"use client";

import { Avatar, Button, Eyebrow } from "@/components/ui";
import { ASSIGNMENT } from "@/data/assignment";

/** "Ms Okafor" → "MO": the teacher's avatar beside the bubble. */
export const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .join("")
    .slice(0, 2);

/**
 * The teacher's goal for the class (ticket 154), read once between the overview and the check-in
 * and only when the teacher wrote one. The overview's frame with the check-in's column in it, so
 * the two read as one short pre-flight and CONTINUE never moves: "Before you get started" / "Ms Okafor wants
 * you to know…", then the goal in a speech bubble with her avatar at its tail, then CONTINUE in
 * the corner the overview's button is in. The text is the teacher's, line breaks kept.
 */
export default function GoalScreen({ goal, onContinue }: { goal: string; onContinue: () => void }) {
  return (
    <div className="flex h-full min-h-0 flex-col px-10 pt-6 pb-5" data-goal-screen>
      {/* The overview's frame with the check-in's column inside it (ticket 153), so CONTINUE lands exactly where it was and where Submit will be. */}
      <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-col px-9" data-goal-column>
      <Eyebrow>Before you get started</Eyebrow>
      <h1 className="font-display mt-2 text-[32px] leading-tight text-ink">{ASSIGNMENT.teacher} wants you to know…</h1>

      <div className="mt-8 flex items-start gap-4" data-goal-bubble>
        <Avatar initials={initialsOf(ASSIGNMENT.teacher)} size="h-12 w-12 text-[15px]" />
        <div className="relative min-w-0 flex-1 rounded-2xl border border-line bg-paper px-6 py-5 shadow-card">
          {/* The tail: a square turned 45°, its left and bottom edges the bubble's border, pointing at the avatar. */}
          <span className="absolute top-[18px] -left-[7px] h-3.5 w-3.5 rotate-45 border-b border-l border-line bg-paper" aria-hidden />
          <p className="text-[20px] leading-[1.45] whitespace-pre-line text-ink" data-goal-text>
            {goal}
          </p>
        </div>
      </div>
      </div>

      <div className="mt-auto flex shrink-0 justify-end pt-4">
        <Button variant="accent" size="lg" className="uppercase tracking-[0.08em]" onClick={onContinue} data-continue>
          continue
        </Button>
      </div>
    </div>
  );
}
