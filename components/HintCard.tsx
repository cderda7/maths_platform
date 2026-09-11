"use client";

import { Card, Eyebrow } from "@/components/ui";
import type { Hint, HintTerm } from "@/data/types";
import { hintSegments } from "@/lib/hint";

/**
 * One of a practice problem's hints with its linked words: light blue at rest, dark blue while
 * hovered (or focused). The hovered term is reported through `onLit`; the caller lights the
 * matching fragment in its own rendering of the problem with `termTex`. `label` is the eyebrow:
 * "Hint" when the problem has one, "Hint 1", "Hint 2" when several stack. A hint the student has
 * moved past is `collapsed`: one muted line, no linked words, and the whole card is a button that
 * opens it (`onToggle`); the latest hint is never collapsed. Practice problems only, the warm-up
 * and the mid-set "one move": a problem in the set never shows one.
 */
export default function HintCard({
  hint,
  label,
  note,
  lit,
  onLit,
  collapsed = false,
  onToggle,
  className = "",
}: {
  hint: Hint;
  label: string;
  /** Beside the label, muted: the piece of the pad the linked words point at ("your line 3"). */
  note?: string;
  lit: HintTerm | null;
  onLit: (term: HintTerm | null) => void;
  collapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}) {
  const focus = "rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-standout-line";
  const heading = (
    <span className="flex items-baseline gap-2">
      <Eyebrow>{label}</Eyebrow>
      {note && <span className="text-[12px] text-ink-muted">{note}</span>}
    </span>
  );
  if (collapsed) {
    return (
      <Card tone="soft" className={`p-0 ${className}`} data-hint data-collapsed>
        <button type="button" onClick={onToggle} className={`block w-full px-4 py-3 text-left ${focus}`} aria-expanded={false}>
          <span className="flex items-baseline gap-2">
            {heading}
            <span className="min-w-0 flex-1 truncate text-[13px] text-ink-muted">{hint.text}</span>
          </span>
        </button>
      </Card>
    );
  }
  return (
    <Card tone="soft" className={`p-4 ${className}`} data-hint>
      {onToggle ? (
        <button type="button" onClick={onToggle} className={`block w-full text-left ${focus}`} aria-expanded>
          {heading}
        </button>
      ) : (
        heading
      )}
      <p className="mt-1.5 text-[14px] leading-snug text-ink">
        {hintSegments(hint.text, hint.terms).map((seg, i) => {
          const term = seg.term;
          if (!term) return <span key={i}>{seg.text}</span>;
          const on = lit === term;
          return (
            <span
              key={i}
              tabIndex={0}
              data-hint-term={term.phrase}
              data-lit={on || undefined}
              className={`mx-[2px] cursor-help whitespace-nowrap rounded-[3px] px-[3px] ring-1 transition-colors ${on ? "bg-standout text-white ring-standout" : "bg-standout-soft text-standout ring-standout-line"}`}
              onMouseOver={() => onLit(term)}
              onMouseOut={() => onLit(null)}
              onFocus={() => onLit(term)}
              onBlur={() => onLit(null)}
            >
              {seg.text}
            </span>
          );
        })}
      </p>
    </Card>
  );
}
