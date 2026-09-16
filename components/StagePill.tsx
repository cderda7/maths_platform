import type { ReactNode } from "react";
import { CLASS_STAGE_WORD, type ClassStageId, type StagePillState } from "@/lib/classStage";

/**
 * Every stage pill in the product (ticket 334): a stage's short word ("indiv working", "indiv review", "group review",
 * "class review") in one of four states, `stagePillState` in `lib/classStage.ts`:
 *
 * - `over`, the class has moved on: the lit skill button's blue with white text (ticket 134)
 * - `current`: light blue ringed in purple
 * - `ahead`, still to come: light blue
 * - `finished`, current but everyone in the room is done with it: the blue with the purple ring
 *
 * The ring is a shadow, so nothing moves when it arrives or goes. Two sizes: `ipad`, the student's header strip (ticket
 * 151, 15 px), and `laptop`, the teacher's strip on the back button's line (13.5 px, the back button's size and line, so
 * the pill is the button's height). `badge` is laid over the pill's bottom right corner without taking room (ticket 335's dot);
 * it took the top corner until ticket 345 stood force submit there, and stayed at the bottom corner once 358 moved that
 * stack below the pill instead — nothing stands over the top corner any more, but there was no call to move it back.
 */
export type StagePillSize = "ipad" | "laptop";

const SIZE: Record<StagePillSize, string> = {
  ipad: "text-[15px] leading-none",
  laptop: "text-[13.5px] leading-normal",
};

const LOOK: Record<StagePillState, string> = {
  over: "bg-standout text-white",
  current: "bg-standout-soft text-ink ring-2 ring-accent",
  ahead: "bg-standout-soft text-ink",
  finished: "bg-standout text-white ring-2 ring-accent",
};

export function StagePill({ stage, state, size = "ipad", badge }: { stage: ClassStageId; state: StagePillState; size?: StagePillSize; badge?: ReactNode }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-lg px-3 py-1.5 font-display ${SIZE[size]} ${LOOK[state]} ${badge ? "relative" : ""}`}
      aria-current={state === "current" || state === "finished" ? "step" : undefined}
      data-stage-pill={state}
    >
      {CLASS_STAGE_WORD[stage]}
      {badge && <span className="absolute -bottom-1.5 -right-1.5 leading-none" data-stage-pill-badge>{badge}</span>}
    </span>
  );
}

/** The thin arrow between two pills. */
export function StageArrow() {
  return (
    <svg viewBox="0 0 18 12" className="mx-1.5 h-3 w-[18px] text-ink-muted/70" aria-hidden data-stage-arrow>
      <path d="M1 6h15M12.5 2.5 16 6l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * A pathway laid out horizontally: its stages in order, the working first, a thin arrow between each. `below` stands under the
 * current (or finished) pill, centred on it: force submit right under the pill, the teacher's count under that (ticket 358;
 * stood over the pill, count on top, until then — ticket 345). `beside` sits right after that pill, before the next arrow: end
 * lesson. `badge` goes on the pill itself.
 *
 * `below`'s own text is centred on the pill by `absolute`, the same trick the `above` it replaced used, just hung off
 * `top-full` instead of `bottom-full` — not because it should take no room (it should: unlike `above`, that room is the
 * whole point) but because its width isn't fixed: force submit's pending countdown ("handing in · 0:47 · Cancel") is wider
 * than the plain button, and if that width could grow the `<li>` itself, pressing force submit would shove every pill after
 * it sideways. Centring it on the pill by absolute position keeps it immune to that. The real room comes from the empty,
 * width-less `data-stage-below-spacer` sibling in flow after it, whose fixed height (`BELOW_HEIGHT`, matching the stack's
 * own — button and pending are both height-matched, ticket 345) is what actually grows the `<li>`, the strip, and the back
 * line under it. `ol` aligns every `<li>` to `items-start` (rather than centring them) so that growth never moves any other
 * pill's top edge or the arrows around it.
 *
 * The pill-to-button and button-to-count gaps (`pt-2`, `gap-1.5`) were doubled and tripled from their ticket 345 values
 * (`pt-1`, `gap-[2px]`) once the stack stood below the pill, in the clear: bunched that close together read fine layered
 * over the pill, less fine sitting in a teacher's actual eyeline (ticket 359). `BELOW_HEIGHT` grows by exactly the same
 * amount so the spacer still matches the stack's real rendered height.
 */
const BELOW_HEIGHT = 50;
const STACK_BELOW = "absolute top-full left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 pt-2";

export function PathwayPills({ stages, size = "ipad", beside, below, badge }: { stages: readonly { id: ClassStageId; state: StagePillState }[]; size?: StagePillSize; beside?: ReactNode; below?: ReactNode; badge?: ReactNode }) {
  return (
    <ol className="flex shrink-0 items-start" aria-label="Review pathway" data-pathway-strip={size}>
      {stages.map((stage, i) => {
        const here = stage.state === "current" || stage.state === "finished";
        return (
          <li key={stage.id} className="flex flex-col items-center" data-stage={stage.id} data-stage-state={stage.state}>
            <span className="flex items-center">
              {i > 0 && <StageArrow />}
              <span className="relative flex items-center">
                <StagePill stage={stage.id} state={stage.state} size={size} badge={here ? badge : undefined} />
                {here && below && (
                  <span className={STACK_BELOW} data-stage-below>
                    {below}
                  </span>
                )}
              </span>
              {/* 12 px from the pill, and 12 px to the next arrow (its own 6 px and 6 px here), none after the last stage so the strip ends on its pill or note. */}
              {here && beside && <span className={`ml-3 flex items-center ${i < stages.length - 1 ? "mr-1.5" : ""}`}>{beside}</span>}
            </span>
            {here && below && <span className="w-0" style={{ height: BELOW_HEIGHT }} aria-hidden data-stage-below-spacer />}
          </li>
        );
      })}
    </ol>
  );
}
