import M from "@/components/Math";
import { Eyebrow } from "@/components/ui";
import { branchesOf } from "@/lib/branches";
import type { RevealedLine } from "@/lib/recognition";

/**
 * The transcription column: one typeset row per recognised line, a shimmer while a burst is being
 * read. A line with two cases ("x = -2 or x = 1") is two half-width boxes side by side.
 */
export default function ReadAs({ lines, recognising, empty, className = "" }: { lines: RevealedLine[]; recognising: boolean; empty: string; className?: string }) {
  const box = "rounded-xl border border-line bg-paper px-3.5 py-2.5 text-[16px] text-ink";
  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <Eyebrow>Read as</Eyebrow>
      <ol className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto">
        {lines.map((l, i) => {
          const branches = branchesOf(l.tex);
          return branches.length === 2 ? (
            <li key={i} className="grid grid-cols-2 gap-2" data-branches>
              {branches.map((b, j) => (
                <span key={j} className={`${box} min-w-0 overflow-x-auto`}>
                  <M tex={b} />
                </span>
              ))}
            </li>
          ) : (
            <li key={i} className={box}>
              <M tex={l.tex} />
            </li>
          );
        })}
        {recognising && <li className="shimmer h-11 rounded-xl" aria-label="Recognising" />}
        {lines.length === 0 && !recognising && (
          <li className="rounded-xl border border-dashed border-line-strong px-3.5 py-3 text-[12.5px] leading-snug text-ink-muted">{empty}</li>
        )}
      </ol>
    </div>
  );
}
