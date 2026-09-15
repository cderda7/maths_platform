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
 * the pill is the button's height). `badge` is laid over the pill's top right corner without taking room (ticket 335's dot).
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
      {badge && <span className="absolute -right-1.5 -top-1.5 leading-none" data-stage-pill-badge>{badge}</span>}
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
 * A pathway laid out horizontally: its stages in order, the working first, a thin arrow between each. `beside` sits right
 * after the current (or finished) pill, before the next arrow: the teacher's force submit and count. `badge` goes on that pill.
 */
export function PathwayPills({ stages, size = "ipad", beside, badge }: { stages: readonly { id: ClassStageId; state: StagePillState }[]; size?: StagePillSize; beside?: ReactNode; badge?: ReactNode }) {
  return (
    <ol className="flex shrink-0 items-center" aria-label="Review pathway" data-pathway-strip={size}>
      {stages.map((stage, i) => {
        const here = stage.state === "current" || stage.state === "finished";
        return (
          <li key={stage.id} className="flex items-center" data-stage={stage.id} data-stage-state={stage.state}>
            {i > 0 && <StageArrow />}
            <StagePill stage={stage.id} state={stage.state} size={size} badge={here ? badge : undefined} />
            {/* 12 px from the pill, and 12 px to the next arrow (its own 6 px and 6 px here), none after the last stage so the strip ends on its pill or note. */}
            {here && beside && <span className={`ml-3 flex items-center ${i < stages.length - 1 ? "mr-1.5" : ""}`}>{beside}</span>}
          </li>
        );
      })}
    </ol>
  );
}
