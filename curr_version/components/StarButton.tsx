"use client";

/**
 * The student's own marker on a problem: a star, nothing else. Available while working through
 * the set and again in review; the starred problems are listed on the feedback screen and the
 * report.
 */
export default function StarButton({ on, onToggle, className = "" }: { on: boolean; onToggle: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={on ? "Unstar this problem" : "Star this problem"}
      title={on ? "Starred" : "Star"}
      data-star
      className={`grid h-9 w-9 place-items-center rounded-full border text-[18px] leading-none transition-colors ${on ? "border-accent bg-accent text-white" : "border-line bg-paper text-ink-muted hover:border-ink-muted hover:text-ink"} ${className}`}
    >
      {on ? "★" : "☆"}
    </button>
  );
}
