"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { INK, INK_WIDTH } from "@/components/DrawPad";
import type { Point, Stroke } from "@/data/types";
import { placeMark, pinStroke, type AnchorBox, type Markup } from "@/lib/markup";

/** What the pen never draws over: the controls stay controls, and the working pad keeps its own ink. */
const NOT_INK = "button, a, input, textarea, select, [data-teacher-pad], [data-follow-pad]";

/**
 * A class review slide with the teacher's markup over it (ticket 330). The marks are an SVG laid over the children,
 * each pinned to a `data-ink-anchor` inside them (`lib/markup.ts`) and redrawn whenever the slide moves under it: a
 * resize, a column's scroll, the columns' font fit, a new slide. With `onMark` the slide takes the pen anywhere
 * inside it except controls and the pad, and a finished stroke is handed over pinned to its nearest anchor; without
 * it the marks are a read-only mirror. A mark on an anchor that is scrolled out of its column is not drawn.
 */
export default function SlideInk({ marks, onMark, className = "", children }: { marks: Markup[]; onMark?: (mark: Markup) => void; className?: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const layer = useRef<SVGGElement>(null);
  const live = useRef<SVGPathElement>(null);
  const current = useRef<Stroke | null>(null);
  const marksRef = useRef(marks);

  useLayoutEffect(() => {
    marksRef.current = marks;
    redraw(root.current, layer.current, marks);
  }, [marks]);

  // Anything that moves an anchor redraws on the next frame: sizes, scrolls, the fit's font size, a new slide's maths.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        redraw(root.current, layer.current, marksRef.current);
      });
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(el);
    const mutation = new MutationObserver(schedule);
    mutation.observe(el, { subtree: true, childList: true, attributes: true, attributeFilter: ["style", "class"] });
    el.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    void document.fonts?.ready.then(schedule);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      el.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const toLocal = (e: React.PointerEvent): Point => {
    const el = root.current!;
    const r = el.getBoundingClientRect();
    const scale = el.offsetWidth / r.width;
    return { x: (e.clientX - r.left) * scale, y: (e.clientY - r.top) * scale };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!onMark) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if ((e.target as Element).closest(NOT_INK)) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    current.current = [toLocal(e)];
    live.current?.setAttribute("d", pathOf(current.current));
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = current.current;
    if (!s) return;
    s.push(toLocal(e));
    live.current?.setAttribute("d", pathOf(s));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = current.current;
    if (!s) return;
    current.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    const mark = pinStroke(s, anchorBoxes(root.current!));
    if (mark) onMark?.(mark);
    live.current?.setAttribute("d", "");
  };

  return (
    <div
      ref={root}
      className={`relative ${onMark ? "touch-none cursor-crosshair" : ""} ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      data-slide-ink={onMark ? "pen" : "mirror"}
      data-mark-count={marks.length}
    >
      {children}
      <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible" aria-hidden data-slide-ink-layer>
        <g ref={layer} fill="none" stroke={INK} strokeWidth={INK_WIDTH} strokeLinecap="round" strokeLinejoin="round" />
        <path ref={live} fill="none" stroke={INK} strokeWidth={INK_WIDTH} strokeLinecap="round" strokeLinejoin="round" data-slide-ink-live />
      </svg>
    </div>
  );
}

/** Every anchor inside the slide in the slide's layout px; an anchor whose middle is scrolled out of its clipping column is left out. */
function anchorBoxes(el: HTMLElement): AnchorBox[] {
  const r = el.getBoundingClientRect();
  if (r.width === 0) return [];
  const scale = el.offsetWidth / r.width;
  const boxes: AnchorBox[] = [];
  for (const a of el.querySelectorAll<HTMLElement>("[data-ink-anchor]")) {
    const ar = a.getBoundingClientRect();
    const clip = a.closest("[data-ink-clip]")?.getBoundingClientRect();
    const midY = ar.top + ar.height / 2;
    if (clip && (midY < clip.top || midY > clip.bottom)) continue;
    boxes.push({ key: a.dataset.inkAnchor!, left: (ar.left - r.left) * scale, top: (ar.top - r.top) * scale, width: ar.width * scale, height: ar.height * scale, em: parseFloat(getComputedStyle(a).fontSize) });
  }
  return boxes;
}

function redraw(el: HTMLElement | null, g: SVGGElement | null, marks: Markup[]) {
  if (!el || !g) return;
  const boxes = marks.length > 0 ? anchorBoxes(el) : [];
  const paths = marks.flatMap((m) => {
    const s = placeMark(m, boxes);
    if (!s) return [];
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", pathOf(s));
    return [p];
  });
  g.replaceChildren(...paths);
}

/** A stroke as an SVG path, smoothed through quadratic midpoints as the pad draws it; a dot for a tap. */
function pathOf(s: Stroke): string {
  if (s.length === 0) return "";
  const f = (n: number) => Math.round(n * 10) / 10;
  if (s.length === 1) return `M${f(s[0].x)} ${f(s[0].y)}h0.01`;
  let d = `M${f(s[0].x)} ${f(s[0].y)}`;
  for (let i = 1; i < s.length - 1; i++) d += `Q${f(s[i].x)} ${f(s[i].y)} ${f((s[i].x + s[i + 1].x) / 2)} ${f((s[i].y + s[i + 1].y) / 2)}`;
  const last = s[s.length - 1];
  return `${d}L${f(last.x)} ${f(last.y)}`;
}
