import type { PathwayStage } from "@/lib/classStage";

/**
 * The review pathway in the student's header (ticket 151): the teacher's Pathway card laid
 * horizontally, one pill per stage with an arrow between. Stages over are the lit skill
 * button's blue with white text, the current one is light blue ringed in purple (a shadow, so
 * nothing moves when the ring arrives), stages ahead light blue. Not interactive: it says where
 * the class is, as the card does; it takes nobody anywhere.
 */
export default function PathwayStrip({ stages }: { stages: PathwayStage[] }) {
  return (
    <ol className="flex shrink-0 items-center font-display text-[15px] leading-none text-ink" aria-label="Review pathway" data-pathway-strip>
      {stages.map((stage, i) => (
        <li key={stage.id} className="flex items-center" data-stage={stage.id} data-stage-state={stage.state}>
          {i > 0 && (
            <svg viewBox="0 0 18 12" className="mx-1.5 h-3 w-[18px] text-ink-muted/70" aria-hidden>
              <path d="M1 6h15M12.5 2.5 16 6l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          <span className={`inline-block whitespace-nowrap rounded-lg px-3 py-1.5 ${stage.state === "over" ? "bg-standout text-white" : "bg-standout-soft"} ${stage.state === "current" ? "ring-2 ring-accent" : ""}`} aria-current={stage.state === "current" ? "step" : undefined}>
            {stage.word}
          </span>
        </li>
      ))}
    </ol>
  );
}
