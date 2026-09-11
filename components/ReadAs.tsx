import M from "@/components/Math";
import { Eyebrow } from "@/components/ui";
import { branchesOf } from "@/lib/branches";
import type { RevealedLine } from "@/lib/recognition";

/**
 * The transcription column: one typeset row per recognised line, a shimmer while a burst is being
 * read. A line with two cases ("x = -2 or x = 1") is two half-width boxes side by side. `decorate`
 * rewrites a line's TeX before it is typeset (the practice pad wraps the pieces a hint points at);
 * `highlight` is the index of the line a lit hint word is pointing at, tinted so the eye finds it.
 */
export default function ReadAs({
  lines,
  recognising,
  empty,
  decorate,
  highlight,
  className = "",
}: {
  lines: RevealedLine[];
  recognising: boolean;
  empty: string;
  decorate?: (tex: string, index: number) => string;
  highlight?: number;
  className?: string;
}) {
  const box = (i: number) => `rounded-xl border px-3.5 py-2.5 text-[16px] text-ink transition-colors ${i === highlight ? "border-standout-line bg-standout-soft" : "border-line bg-paper"}`;
  const tex = (t: string, i: number) => (decorate ? decorate(t, i) : t);
  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <Eyebrow>Read as</Eyebrow>
      <ol className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto">
        {lines.map((l, i) => {
          const branches = branchesOf(l.tex);
          return branches.length === 2 ? (
            <li key={i} className="grid grid-cols-2 gap-2" data-branches data-highlight={i === highlight || undefined}>
              {branches.map((b, j) => (
                <span key={j} className={`${box(i)} min-w-0 overflow-x-auto`}>
                  <M tex={tex(b, i)} />
                </span>
              ))}
            </li>
          ) : (
            <li key={i} className={box(i)} data-highlight={i === highlight || undefined}>
              <M tex={tex(l.tex, i)} />
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
