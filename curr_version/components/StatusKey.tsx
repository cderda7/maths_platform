import { StatusDot, STATUS_WORD } from "@/components/Tag";
import type { Status } from "@/data/types";

const ROWS: { status: Status; means: string }[] = [
  { status: "secure", means: "100% of steps held" },
  { status: "solid", means: "80–99%" },
  { status: "developing", means: "60–79%" },
  { status: "gap", means: "under 60%" },
  { status: "unseen", means: "not seen yet" },
];

/** The dot key, one row per status: dot, word, what the colour means, in aligned columns. The half dot is grey: incomplete, not a grade. */
export default function StatusKey({ className = "" }: { className?: string }) {
  return (
    <ul className={`grid grid-cols-[15px_auto_1fr] items-center gap-x-3 gap-y-2 text-[12.5px] ${className}`} data-status-key>
      {ROWS.map((r) => (
        <li key={r.status} className="contents">
          <StatusDot status={r.status} size="h-[15px] w-[15px]" />
          <span className="text-ink">{STATUS_WORD[r.status]}</span>
          <span className="text-ink-muted">{r.means}</span>
        </li>
      ))}
      <li className="contents">
        <span className="inline-block h-[15px] w-[15px] shrink-0 rounded-full border border-line-strong" style={{ backgroundImage: "linear-gradient(90deg, var(--color-line-strong) 50%, transparent 50%)" }} aria-hidden data-half-key />
        <span className="text-ink">half</span>
        <span className="text-ink-muted">incomplete · problems skipped</span>
      </li>
    </ul>
  );
}
