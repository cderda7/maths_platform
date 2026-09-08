import type { Difficulty, SubskillId, SubskillStatus } from "@/data/types";
import { SUBSKILL_MAP } from "@/data/subskills";

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

export function SubskillChip({ id, status, className = "" }: { id: SubskillId; status?: SubskillStatus; className?: string }) {
  const s = SUBSKILL_MAP[id];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-0.5 text-[11.5px] text-ink-soft ${className}`}>
      {status && <StatusDot status={status} />}
      {s.short}
    </span>
  );
}

const DOT: Record<SubskillStatus, string> = {
  secure: "bg-secure",
  developing: "bg-developing",
  gap: "bg-gap",
  unseen: "bg-transparent border border-line-strong",
};

export function StatusDot({ status, size = "h-2 w-2" }: { status: SubskillStatus; size?: string }) {
  return <span className={`inline-block rounded-full ${size} ${DOT[status]}`} aria-hidden />;
}

export const STATUS_WORD: Record<SubskillStatus, string> = {
  secure: "secure",
  developing: "developing",
  gap: "gap",
  unseen: "not seen yet",
};
