import { StatusDot, STATUS_WORD } from "@/components/Tag";
import type { Status } from "@/data/types";

const ROWS: { status: Status; means: string }[] = [
  { status: "secure", means: "100% of steps held" },
  { status: "solid", means: "80–99%" },
  { status: "developing", means: "60–79%" },
  { status: "gap", means: "under 60%" },
  { status: "unseen", means: "not seen yet" },
];

/** The dot key: colour, word, what the colour means. The half dot is shown in grey: incomplete, not a grade. */
export default function StatusKey({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] text-ink-muted ${className}`} data-status-key>
      {ROWS.map((r) => (
        <li key={r.status} className="flex items-center gap-1.5">
          <StatusDot status={r.status} size="h-[13px] w-[13px]" />
          <span className="text-ink-soft">{STATUS_WORD[r.status]}</span>
          <span>· {r.means}</span>
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span className="inline-block h-[13px] w-[13px] shrink-0 rounded-full border border-line-strong" style={{ backgroundImage: "linear-gradient(90deg, var(--color-line-strong) 50%, transparent 50%)" }} aria-hidden data-half-key />
        <span className="text-ink-soft">half</span>
        <span>· incomplete, problems skipped</span>
      </li>
    </ul>
  );
}
