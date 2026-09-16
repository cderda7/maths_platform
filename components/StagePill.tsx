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
 * it took the top corner until ticket 345 stood force submit there, where the dot's ring cut into the button's rounded end.
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
 * A pathway laid out horizontally: its stages in order, the working first, a thin arrow between each. `above` stands over the
 * current (or finished) pill, centred on it: the teacher's count and force submit, the count on top (ticket 345). `beside` sits
 * right after that pill, before the next arrow: end lesson. `badge` goes on the pill itself.
 *
 * `above` is laid over the pill and takes no room, so a strip that gains or loses it moves nothing — not the pills, not the back
 * button beside them, not a line of the page below. It draws into the 48 px of padding above the teacher's back line, which is
 * the whole budget: `main` is the scroll region, so anything above that padding is clipped by it. The stack measures 42 px
 * (`STACK_ABOVE`), leaving 6 px clear of the top bar's border.
 */
const STACK_ABOVE = "absolute bottom-full left-1/2 flex -translate-x-1/2 flex-col items-center gap-[2px] pb-[3px]";

export function PathwayPills({ stages, size = "ipad", beside, above, badge }: { stages: readonly { id: ClassStageId; state: StagePillState }[]; size?: StagePillSize; beside?: ReactNode; above?: ReactNode; badge?: ReactNode }) {
  return (
    <ol className="flex shrink-0 items-center" aria-label="Review pathway" data-pathway-strip={size}>
      {stages.map((stage, i) => {
        const here = stage.state === "current" || stage.state === "finished";
        return (
          <li key={stage.id} className="flex items-center" data-stage={stage.id} data-stage-state={stage.state}>
            {i > 0 && <StageArrow />}
            <span className="relative flex items-center">
              <StagePill stage={stage.id} state={stage.state} size={size} badge={here ? badge : undefined} />
              {here && above && (
                <span className={STACK_ABOVE} data-stage-above>
                  {above}
                </span>
              )}
            </span>
            {/* 12 px from the pill, and 12 px to the next arrow (its own 6 px and 6 px here), none after the last stage so the strip ends on its pill or note. */}
            {here && beside && <span className={`ml-3 flex items-center ${i < stages.length - 1 ? "mr-1.5" : ""}`}>{beside}</span>}
          </li>
        );
      })}
    </ol>
  );
}
