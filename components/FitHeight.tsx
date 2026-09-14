"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * A block that never scrolls (ticket 277): its children render at full size and, when taller than the box, are
 * zoomed down until they fit its height. The box's height comes from its parent (a flex child with `min-h-0`, or an
 * explicit height). A zoomed child lays out wider in its own px, so its text rewraps into fewer lines; the fit is a
 * short search on the measured height, not one ratio. Re-fits when the box or the children resize (a `FitText` inside
 * refitting its line). The zoom it settled on is `data-fit-zoom`. `min` is the floor: below it the content clips.
 */
export default function FitHeight({ children, min = 0.5, fitKey, className = "", ...data }: { children: ReactNode; min?: number; fitKey?: string; className?: string } & Record<`data-${string}`, string | true | undefined>) {
  const boxRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const box = boxRef.current;
    const inner = innerRef.current;
    if (!box || !inner) return;
    let frame = 0;
    const fit = () => {
      const avail = box.getBoundingClientRect().height + 0.5;
      const heightAt = (z: number) => {
        inner.style.zoom = String(z);
        return inner.getBoundingClientRect().height;
      };
      let zoom = 1;
      if (heightAt(1) > avail) {
        let lo = min;
        let hi = 1;
        for (let i = 0; i < 9; i++) {
          const mid = (lo + hi) / 2;
          if (heightAt(mid) <= avail) lo = mid;
          else hi = mid;
        }
        zoom = lo;
        heightAt(zoom);
      }
      box.dataset.fitZoom = zoom.toFixed(3);
    };
    fit();
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    });
    ro.observe(box);
    ro.observe(inner);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [min, fitKey]);
  return (
    <div ref={boxRef} className={`min-h-0 overflow-hidden ${className}`} {...data}>
      <div ref={innerRef}>{children}</div>
    </div>
  );
}
