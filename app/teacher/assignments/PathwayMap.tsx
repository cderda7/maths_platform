"use client";

import type { Pathway } from "@/data/types";
import { PathwayCheck, PathwayStop } from "@/components/PathwayStop";
import { REVIEW_ORDER, STAGE_DESCRIPTION, STAGE_WORD, togglePathway } from "@/lib/pathway";

/** Every pill is one fixed height so the track runs through their centres by geometry alone. */
const PILL_H = 42;
/** All five pills share one width, so in five equal columns every gap on the line is the same step. */
const PILL_W = 156;

/**
 * The review-pathway line (ticket 246, replacing the branching map of tickets 197–239): individual working → individual review
 * → group review → class review → done, five equal columns, every stop always in its place, so the pathway reads as one
 * sequence the teacher trims rather than branches to pick from. A stop is a toggle; its description sits under it all the
 * time. "No review, working only" sits under the line as a worded choice of its own.
 *
 * `value` is `null` until the teacher chooses, and the three looks tell the states apart: undecided (plain outlined stops, a
 * pale track, done grey), decided (an on stop in accent with ✓ like a New skills chip, an off stop dashed and faded, the ink
 * track running on past it to done) and No review (every stop dashed, the ink track from working to done). Nothing moves or
 * resizes between them: only colours and borders change.
 */
export default function PathwayMap({ value, onChange }: { value: Pathway | null; onChange: (p: Pathway | null) => void }) {
  const decided = value !== null;
  const none = decided && value.length === 0;
  const state = !decided ? "undecided" : none ? "none" : "decided";

  return (
    <div data-pathway-line data-state={state}>
      <div className="relative grid grid-cols-5">
        {/* The track: from the first column's centre to the last's, behind the pills, through their middles. */}
        <div className={`absolute left-[10%] right-[10%] h-0.5 -translate-y-1/2 transition-colors ${decided ? "bg-ink" : "bg-line"}`} style={{ top: PILL_H / 2 }} aria-hidden data-track />
        <Column pill={<Pill ink data-end="working">individual working</Pill>} />
        {REVIEW_ORDER.map((s) => {
          const on = !!value?.includes(s);
          const off = decided && !on;
          return (
            <Column
              key={s}
              arrow={decided}
              pill={
                <Pill on={on} off={off} onClick={() => onChange(togglePathway(value, s))} aria-pressed={on} data-stop={s} data-on={on || undefined} data-off={off || undefined}>
                  {STAGE_WORD[s]}
                </Pill>
              }
            >
              <p className={`mt-3 px-2 text-center text-[12.5px] leading-snug text-balance text-ink-muted transition-opacity ${off ? "opacity-45" : ""}`} data-stage-description={s}>
                {STAGE_DESCRIPTION[s]}
              </p>
            </Column>
          );
        })}
        <Column arrow={decided} pill={<Pill ink={decided} muted={!decided} data-end="done">done</Pill>} />
      </div>
      <div className="mt-6">
        <button
          type="button"
          onClick={() => onChange(none ? null : [])}
          aria-pressed={none}
          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-[12.5px] transition-colors ${none ? "border-accent bg-accent font-medium text-white hover:bg-accent-deep" : "border-line bg-paper text-ink-soft hover:bg-cream-deep"}`}
          data-no-review
          data-on={none || undefined}
        >
          {none && <Check />}
          No review, working only
        </button>
      </div>
    </div>
  );
}

/** One of the five equal columns; the pill centred, and, once the pathway is decided, a small ink arrowhead pointing into it. */
function Column({ pill, arrow, children }: { pill: React.ReactNode; arrow?: boolean; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {arrow !== undefined && (
          <svg width={7} height={10} viewBox="0 0 7 10" className={`absolute top-1/2 -translate-y-1/2 transition-colors ${arrow ? "text-ink" : "text-line"}`} style={{ right: "calc(100% + 4px)" }} aria-hidden data-arrowhead>
            <path d="M1 1 L6 5 L1 9" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {pill}
      </div>
      {children}
    </div>
  );
}

/** A stop on the line: Create's size (`components/PathwayStop.tsx`, shared with the decision card's Change, ticket 336). */
function Pill(props: Omit<React.ComponentProps<typeof PathwayStop>, "width" | "height" | "size">) {
  return <PathwayStop {...props} size="line" width={PILL_W} height={PILL_H} />;
}

const Check = PathwayCheck;
