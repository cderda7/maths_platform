"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

/**
 * One line of text that never wraps: it renders at `max` px and, when wider than the box it sits
 * in, scales its font down until it fits (text width is linear in font size, so one measurement
 * is enough). Re-fits when the box resizes. The child may be typeset maths (`<M>`, which scales
 * with the font size like text); pass `fitKey` for it, since an element is new on every render.
 */
export default function FitText({ children, max = 13, className = "", fitKey }: { children: ReactNode; max?: number; className?: string; fitKey?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState(max);
  useLayoutEffect(() => {
    const el = ref.current;
    const box = el?.parentElement;
    if (!el || !box) return;
    const fit = () => {
      el.style.fontSize = `${max}px`;
      const width = el.scrollWidth;
      const avail = box.clientWidth;
      const next = width > avail && width > 0 ? Math.floor((max * avail) / width * 10) / 10 : max;
      el.style.fontSize = `${next}px`;
      setSize(next);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- a node child is re-fitted by `fitKey`, not by identity
  }, [max, typeof children === "string" ? children : fitKey]);
  return (
    <span ref={ref} className={`block whitespace-nowrap ${className}`} style={{ fontSize: size }} data-fit-text>
      {children}
    </span>
  );
}
