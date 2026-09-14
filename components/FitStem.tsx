"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * A paragraph of prose with inline maths that wraps between words but never inside the maths (`.katex` is nowrap): set
 * at `max` px, or smaller by the one factor that fits its widest piece of maths inside the paragraph's width (ticket 260,
 * the focused view's narrow cards on a five-step chain, where "3x² + 5x − 2 = 3x(x + 2) − 1(x + 2)" ran past its card).
 * KaTeX scales with the font size, so one measurement is enough. Written to the node, not state; re-fitted when the box
 * resizes and once the maths fonts have loaded.
 */
export default function FitStem({ max, fitKey, className = "", children, ...rest }: { max: number; fitKey: string; className?: string; children: ReactNode } & React.HTMLAttributes<HTMLParagraphElement>) {
  const ref = useRef<HTMLParagraphElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      el.style.fontSize = `${max}px`;
      const avail = el.clientWidth;
      // Each piece of maths with the punctuation kept beside it (`DiagnosticStem`'s nowrap spans), in layout px on both sides (the teacher chrome is zoomed, so client rects would be in other units).
      const widest = Math.max(0, ...[...el.querySelectorAll<HTMLElement>(".whitespace-nowrap, .katex")].map((k) => k.offsetWidth + 1));
      if (avail > 0 && widest > avail) el.style.fontSize = `${Math.floor(((max * avail) / widest) * 10) / 10}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [max, fitKey]);
  return (
    <p ref={ref} className={className} style={{ fontSize: max }} {...rest}>
      {children}
    </p>
  );
}
