import { StatusDot, STATUS_WORD } from "@/components/Tag";
import type { Status } from "@/data/types";

const ROWS: { status: Status; means: string }[] = [
  { status: "secure", means: "100%" },
  { status: "solid", means: "80–99%" },
  { status: "developing", means: "60–79%" },
  { status: "gap", means: "under 60%" },
  { status: "unseen", means: "no evidence yet" },
];

/**
 * The dot key, one row per status: dot, word, what the colour means, in aligned columns. The half dot is grey: incomplete, not a grade.
 * `split` sets it as two lists of three side by side, grades on the left and gap, half and not seen on the right (the teacher's report, ticket 243).
 */
export default function StatusKey({ className = "", split = false }: { className?: string; split?: boolean }) {
  if (split)
    return (
      <div className={`flex gap-x-10 ${className}`} data-status-key>
        <KeyRows rows={ROWS.slice(0, 3)} />
        <KeyRows rows={ROWS.slice(3)} />
      </div>
    );
  return <KeyRows rows={ROWS} className={className} data-status-key />;
}

function KeyRows({ rows, className = "", ...rest }: { rows: typeof ROWS; className?: string; "data-status-key"?: boolean }) {
  return (
    <ul className={`grid grid-cols-[15px_auto_1fr] items-center gap-x-3 gap-y-2 text-[12.5px] ${className}`} {...rest}>
      {rows.map((r) => (
        <li key={r.status} className="contents">
          {r.status === "unseen" && (
            <>
              <span className="inline-block h-[15px] w-[15px] shrink-0 marker-half rounded-[var(--marker-dot-radius)] border border-line-strong" style={{ "--marker-color": "var(--color-line-strong)" } as React.CSSProperties} aria-hidden data-half-key />
              <span className="text-ink">half</span>
              <span className="text-ink-muted">incomplete</span>
            </>
          )}
          <StatusDot status={r.status} size="h-[15px] w-[15px]" />
          <span className="whitespace-nowrap text-ink">{STATUS_WORD[r.status]}</span>
          <span className="whitespace-nowrap text-ink-muted">{r.means}</span>
        </li>
      ))}
    </ul>
  );
}
