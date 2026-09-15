/**
 * One stop on a pathway the teacher sets (ticket 246's creation line, lifted out of `PathwayMap` for ticket 336's Change on the
 * decision card): a fixed-size pill whose look says what the stop is.
 *
 * - `ink`: fixed, not a choice (individual working; done once decided; on the card, a stage students have entered)
 * - `muted`: done while the pathway is undecided
 * - `on`: switched on, in accent with a ✓ like a New skills chip
 * - `off`: switched off, dashed and faded
 * - none of these: a plain outlined stop, not yet decided
 *
 * With `onClick` it is a toggle button, otherwise a span. `size` is `line` (Create's line, 14 px) or `card` (the decision
 * card, 13.5 px, the strip's pill size). Width and height are fixed by the caller so a column of stops lines up and nothing
 * moves when a stop changes look: only colours and borders change.
 */
export type PathwayStopSize = "line" | "card";

const TEXT: Record<PathwayStopSize, string> = { line: "px-4 text-[14px]", card: "px-3 text-[13.5px]" };

export function PathwayStop({
  children,
  ink,
  muted,
  on,
  off,
  onClick,
  size = "line",
  width,
  height,
  ...rest
}: {
  children: React.ReactNode;
  ink?: boolean;
  muted?: boolean;
  on?: boolean;
  off?: boolean;
  onClick?: () => void;
  size?: PathwayStopSize;
  width: number;
  height: number;
} & { "aria-pressed"?: boolean; "aria-disabled"?: boolean; title?: string } & { [data: `data-${string}`]: string | boolean | undefined }) {
  const tone = ink
    ? "border-ink bg-ink text-white"
    : muted
      ? "border-line bg-paper text-ink-muted"
      : on
        ? "border-accent bg-accent text-white hover:bg-accent-deep"
        : off
          ? "border-dashed border-line-strong bg-paper text-ink-muted hover:border-ink-muted hover:text-ink"
          : "border-line-strong bg-paper text-ink hover:border-ink-muted";
  const cls = `inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border ${TEXT[size]} font-medium transition-colors ${tone}`;
  const style = { height, width };
  if (!onClick)
    return (
      <span className={cls} style={style} {...rest}>
        {children}
      </span>
    );
  return (
    <button type="button" onClick={onClick} className={cls} style={style} {...rest}>
      {on && <PathwayCheck />}
      {children}
    </button>
  );
}

export function PathwayCheck() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3 shrink-0" aria-hidden>
      <path d="M2.5 6.2 5 8.6l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
