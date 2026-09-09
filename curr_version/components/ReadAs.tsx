import M from "@/components/Math";
import { Eyebrow } from "@/components/ui";
import type { RevealedLine } from "@/lib/recognition";

/** The transcription column: one typeset row per recognised line, a shimmer while a burst is being read. */
export default function ReadAs({ lines, recognising, empty, className = "" }: { lines: RevealedLine[]; recognising: boolean; empty: string; className?: string }) {
  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <Eyebrow>Read as</Eyebrow>
      <ol className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto">
        {lines.map((l, i) => (
          <li key={i} className="rounded-xl border border-line bg-paper px-3.5 py-2.5 text-[16px] text-ink">
            <M tex={l.tex} />
          </li>
        ))}
        {recognising && <li className="shimmer h-11 rounded-xl" aria-label="Recognising" />}
        {lines.length === 0 && !recognising && (
          <li className="rounded-xl border border-dashed border-line-strong px-3.5 py-3 text-[12.5px] leading-snug text-ink-muted">{empty}</li>
        )}
      </ol>
    </div>
  );
}
