"use client";

import { Card, Eyebrow } from "@/components/ui";
import type { Hint, HintTerm } from "@/data/types";
import { hintSegments } from "@/lib/hint";

/**
 * One of a practice problem's hints with its linked words: light blue at rest, dark blue while
 * hovered (or focused). The hovered term is reported through `onLit`; the caller lights the
 * matching fragment in its own rendering of the problem with `termTex`. `label` is the eyebrow:
 * "Hint" when the problem has one, "Hint 1", "Hint 2" when it has several and they stack.
 * Practice problems only, the warm-up and the mid-set "one move": a problem in the set never shows one.
 */
export default function HintCard({ hint, label, lit, onLit, className = "" }: { hint: Hint; label: string; lit: HintTerm | null; onLit: (term: HintTerm | null) => void; className?: string }) {
  return (
    <Card tone="soft" className={`p-4 ${className}`} data-hint>
      <Eyebrow>{label}</Eyebrow>
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
