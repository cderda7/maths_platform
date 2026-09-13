"use client";

import { Card, Eyebrow } from "@/components/ui";
import { DIAGNOSTIC_CHIP } from "../DiagnosticCard";
import { categoryName, categoryOf, groupName, groupOf, leafName, type LeafId } from "@/data/taxonomy";

/**
 * The "New skills" card on the review's pathway step (ticket 209; the "Unit focus" card before it):
 * every skill the set's problems invoke as a chip, the ones new on this set switched on. The list
 * starts as inferred (a skill the set is focused on that the class has not met in its last two sets,
 * `lib/newSkills`) and a click switches a chip on or off; nothing is confirmed and Create never waits
 * on it (tickets 123, 209). The caller owns the changed list, so a reload keeps it where the caller does.
 */
export default function NewSkills({
  candidates,
  chosen,
  changed,
  onChange,
}: {
  /** Every skill the set could name, in a fixed order (a chip never moves when switched). */
  candidates: LeafId[];
  /** The skills new on the set: the teacher's when `changed`, else the inferred ones. */
  chosen: LeafId[];
  changed: boolean;
  /** A new list, or null to go back to the inferred one. */
  onChange: (next: LeafId[] | null) => void;
}) {
  const toggle = (l: LeafId) => onChange(chosen.includes(l) ? chosen.filter((x) => x !== l) : candidates.filter((x) => x === l || chosen.includes(x)));
  return (
    <Card className="p-6" data-new-skills>
      <div className="flex items-center justify-between gap-4">
        <Eyebrow className={DIAGNOSTIC_CHIP}>New skills</Eyebrow>
        {changed ? (
          <span className="text-[11.5px] text-ink-muted" data-new-skills-changed>
            changed by you ·{" "}
            <button type="button" onClick={() => onChange(null)} className="font-medium text-accent-deep hover:underline" data-new-skills-reset>
              use suggested
            </button>
          </span>
        ) : (
          <span className="text-[11.5px] text-ink-muted" data-new-skills-inferred>
            suggested from the class&apos;s last two sets
          </span>
        )}
      </div>
      <p className="mt-3 max-w-[720px] text-[13px] leading-snug text-ink-soft">
        {chosen.length === 0 ? "No new skills on this set." : `${chosen.length === 1 ? "This skill shows" : "These skills show"} under New skills on this set instead of ${chosen.length === 1 ? "its" : "their"} home column.`} Click a skill to change it.
      </p>
      <ul className="mt-3 flex flex-wrap gap-2" aria-label="New skills on this set">
        {candidates.map((l) => {
          const on = chosen.includes(l);
          return (
            <li key={l}>
              <button
                type="button"
                onClick={() => toggle(l)}
                aria-pressed={on}
                title={`Home: ${categoryName(categoryOf(l)).name} › ${groupName(groupOf(l)).name}`}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-[12.5px] transition-colors ${on ? "border-accent bg-accent font-medium text-white hover:bg-accent-deep" : "border-line bg-paper text-ink-soft hover:bg-cream-deep"}`}
                data-new-skill={l}
                data-on={on || undefined}
              >
                {on && (
                  <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
                    <path d="M2.5 6.2 5 8.6l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {leafName(l).short}
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
