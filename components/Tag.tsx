import type { Difficulty, SubskillId, GapStatus, SubskillStatus } from "@/data/types";
import { SUBSKILL_MAP } from "@/data/subskills";

const DIFF_STYLES: Record<Difficulty, string> = {
  "simple familiar": "bg-cream-deep text-ink-soft border-line-strong",
  "simple unfamiliar": "bg-note-soft text-note border-note-line",
  "complex familiar": "bg-accent-soft text-accent-deep border-accent-line",
  "complex unfamiliar": "bg-ink text-white border-ink",
};

export function DifficultyTag({ d, className = "" }: { d: Difficulty; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${DIFF_STYLES[d]} ${className}`}
    >
      {d}
    </span>
  );
}

export function SubskillChip({
  id,
  status,
  className = "",
}: {
  id: SubskillId;
  status?: SubskillStatus | GapStatus;
  className?: string;
}) {
  const s = SUBSKILL_MAP[id];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-0.5 text-[11.5px] text-ink-soft ${className}`}
    >
      {status && <StatusDot status={status} />}
      {s.short}
    </span>
  );
}

const DOT: Record<string, string> = {
  sound: "bg-sound",
  secure: "bg-sound",
  shaky: "bg-shaky",
  developing: "bg-shaky",
  slip: "bg-slip",
  gap: "bg-slip",
  unclear: "bg-note",
  unseen: "bg-transparent border border-line-strong",
};

export function StatusDot({ status, size = "h-2 w-2" }: { status: string; size?: string }) {
  return <span className={`inline-block rounded-full ${size} ${DOT[status] ?? "bg-line-strong"}`} aria-hidden />;
}

export const STATUS_WORD: Record<string, string> = {
  sound: "sound",
  secure: "secure",
  shaky: "shaky",
  developing: "developing",
  slip: "slip",
  gap: "gap",
  unclear: "unclear",
  unseen: "not seen yet",
};
