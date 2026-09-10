"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * One line of text that never wraps: it renders at `max` px and, when wider than the box it sits
 * in, scales its font down until it fits (text width is linear in font size, so one measurement
 * is enough). Re-fits when the box resizes.
 */
export default function FitText({ children, max = 13, className = "" }: { children: string; max?: number; className?: string }) {
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
  }, [max, children]);
  return (
    <span ref={ref} className={`block whitespace-nowrap ${className}`} style={{ fontSize: size }} data-fit-text>
      {children}
    </span>
  );
}
