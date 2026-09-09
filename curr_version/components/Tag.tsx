import type { Difficulty, Status } from "@/data/types";
import { leafName, type LeafId } from "@/data/taxonomy";

const DIFF_STYLES: Record<Difficulty, string> = {
  "simple familiar": "bg-cream-deep text-ink-soft border-line-strong",
  "simple unfamiliar": "bg-standout-soft text-standout border-standout-line",
  "complex familiar": "bg-accent-soft text-accent-deep border-accent-line",
  "complex unfamiliar": "bg-ink text-white border-ink",
};

export function DifficultyTag({ d, className = "" }: { d: Difficulty; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${DIFF_STYLES[d]} ${className}`}>
      {d}
    </span>
  );
}

/** A taxonomy leaf by its short name. */
export function LeafChip({ id, status, className = "" }: { id: LeafId; status?: Status; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-0.5 text-[11.5px] text-ink-soft ${className}`} data-leaf={id}>
      {status && <StatusDot status={status} size="h-2 w-2" />}
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
 * A status dot. `half` fills the left half only: the student has handed in but skipped a problem
 * that invokes this node, so the colour comes from attempted work alone.
 */
export function StatusDot({ status, size = "h-2 w-2", half = false, className = "" }: { status: Status; size?: string; half?: boolean; className?: string }) {
  const color = DOT_COLOR[status];
  const style =
    status === "unseen"
      ? undefined
      : half
        ? { backgroundImage: `linear-gradient(90deg, ${color} 50%, transparent 50%)`, borderColor: color }
        : { backgroundColor: color, borderColor: color };
  return <span className={`inline-block shrink-0 rounded-full border ${status === "unseen" ? "border-line-strong" : ""} ${size} ${className}`} style={style} aria-hidden data-status={status} data-half={half || undefined} />;
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
