import type { Difficulty, Status } from "@/data/types";
import { leafName, studentLeafName, type LeafId } from "@/data/taxonomy";

const DIFF_STYLES: Record<Difficulty, string> = {
  "simple familiar": "bg-cream-deep text-ink-soft border-line-strong",
  "simple unfamiliar": "bg-standout-soft text-standout border-standout-line",
  "complex familiar": "bg-accent-soft text-accent-deep border-accent-line",
  // Light like its three siblings (cream, blue, purple); the amber marks the hardest kind without the weight of ink on white (ticket 142).
  "complex unfamiliar": "bg-developing-soft text-developing border-developing-line",
};

export function DifficultyTag({ d, className = "" }: { d: Difficulty; className?: string }) {
  return (
    // data-difficulty: click-throughs assert no student screen shows one (ticket 233).
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${DIFF_STYLES[d]} ${className}`} data-difficulty={d}>
      {d}
    </span>
  );
}

/** A taxonomy leaf by its short name. */
export function LeafChip({ id, status, after, student = false, className = "", ...rest }: { id: LeafId; status?: Status; after?: React.ReactNode; /** Student-facing name ("factorising" for monic). */ student?: boolean; className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-0.5 text-[11.5px] text-ink-soft ${className}`} data-leaf={id} {...rest}>
      {status && <StatusDot status={status} size="h-2 w-2" />}
      {(student ? studentLeafName(id) : leafName(id)).short}
      {after}
    </span>
  );
}

/** The step a student got wrong, named by its leaf: a light red pill with a dark red border, under the student's name on the teacher's mistakes view. */
export function SlipChip({ id, className = "", ...rest }: { id: LeafId; className?: string } & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={`inline-flex items-center rounded-full border border-wrong-deep bg-wrong-soft px-3.5 py-1 text-[17px] font-medium text-wrong-deep ${className}`} data-slip={id} {...rest}>
      {leafName(id).short}
    </span>
  );
}

export const DOT_COLOR: Record<Status, string> = {
  secure: "var(--color-secure)",
  solid: "var(--color-solid)",
  developing: "var(--color-developing)",
  gap: "var(--color-gap)",
  unseen: "transparent",
};

/**
 * The category-level marker: a pill, 28 × 13, where a group's or skill's dot is 15 round. Its
 * corners follow the category header chip above it (`rounded-md` on a 22 px chip), scaled to the
 * pill's height: 4 px, not a stadium (ticket 126).
 */
export const PILL_SIZE = "h-[13px] w-[28px] rounded";

/**
 * A status marker. `half` fills the left half only: the student has handed in but skipped a
 * problem that invokes this node, so the colour comes from attempted work alone. A dot for a
 * group or a skill; `shape="pill"` for a category, the top level of every grid and drill (ticket
 * 125), so the levels read apart at a glance.
 */
/**
 * A pill's label (ticket 181): its category's name or a date in 9 px semibold uppercase, white on the
 * status colour, muted on a hollow pill; the pill keeps its 13 px height and grows to the text with a
 * 56 px floor (double the plain pill), the width animating where `interpolate-size` is supported.
 */
export const PILL_LABEL = "inline-grid w-auto min-w-[56px] place-items-center whitespace-nowrap px-1 text-[9px] font-semibold uppercase leading-none tracking-[0.06em] [interpolate-size:allow-keywords] transition-[width] duration-150";

export function StatusDot({ status, size, px, half = false, shape = "dot", label, className = "" }: { status: Status; size?: string; /** Exact diameter in px, for dots that shrink to fit. */ px?: number; half?: boolean; shape?: "dot" | "pill"; /** Text on a pill (the class view's history mode, ticket 181): the pill widens to carry it, the same element and height as without. */ label?: React.ReactNode; className?: string }) {
  const color = DOT_COLOR[status];
  const paint =
    status === "unseen"
      ? {}
      : half
        ? { backgroundImage: `linear-gradient(90deg, ${color} 50%, transparent 50%)`, borderColor: color }
        : { backgroundColor: color, borderColor: color };
  const style = px ? { ...paint, width: px, height: px } : paint;
  const dims = px ? "" : (size ?? (shape === "pill" ? PILL_SIZE : "h-2 w-2"));
  const labelled = label !== undefined && label !== null;
  return (
    <span className={`inline-block shrink-0 border ${shape === "pill" && !px ? "" : "rounded-full"} ${status === "unseen" ? "border-line-strong" : ""} ${dims} ${labelled ? `${PILL_LABEL} ${status === "unseen" ? "text-ink-muted" : "text-white"}` : ""} ${className}`} style={style} aria-hidden data-status={status} data-half={half || undefined} data-shape={shape} data-label={labelled ? "" : undefined}>
      {labelled ? label : null}
    </span>
  );
}

export const STATUS_WORD: Record<Status, string> = {
  secure: "secure",
  solid: "solid",
  developing: "developing",
  gap: "gap",
  unseen: "not seen yet",
};

export const STATUS_TEXT: Record<Status, string> = {
  secure: "text-secure",
  solid: "text-solid",
  developing: "text-developing",
  gap: "text-gap",
  unseen: "text-ink-muted",
};
