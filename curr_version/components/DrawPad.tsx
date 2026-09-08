"use client";

import { useEffect, useRef, useState } from "react";

export type Point = { x: number; y: number };
export type Stroke = Point[];

/** Pen-up, then this long with no new stroke, closes a burst and reveals the next line. */
export const BURST_IDLE_MS = 850;

/**
 * A handwriting pad. Pointer events (mouse, trackpad, pen, touch) are drawn as smooth ink on a
 * canvas sized to the pad's CSS box. Coordinates are mapped through the canvas's own bounding
 * rect, so the pad works unchanged inside the scaled iPad stage. The pad owns the strokes; the
 * caller is told when a burst of strokes ends, and how many strokes exist, so recognition can
 * stay a pure function elsewhere.
 */
export default function DrawPad({
  strokes,
  onStrokesChange,
  onBurstEnd,
  onPenDown,
  className = "",
}: {
  strokes: Stroke[];
  onStrokesChange: (next: Stroke[]) => void;
  onBurstEnd: (strokeCount: number) => void;
  onPenDown?: () => void;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const current = useRef<Stroke | null>(null);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // Keep the bitmap matched to the CSS box (and device pixel ratio).
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ro = new ResizeObserver(() => {
      const w = c.offsetWidth;
      const h = c.offsetHeight;
      setSize({ w, h });
    });
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  // Redraw whenever strokes or size change.
  useEffect(() => {
    const c = canvasRef.current;
    if (!c || size.w === 0) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = Math.round(size.w * dpr);
    c.height = Math.round(size.h * dpr);
    const ctx = c.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.w, size.h);
    drawRuled(ctx, size.w, size.h);
    for (const s of strokes) drawStroke(ctx, s);
  }, [strokes, size]);

  const toLocal = (e: React.PointerEvent): Point => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    // r is in screen pixels and may be scaled by the iPad stage; offsetWidth is unscaled.
    return { x: ((e.clientX - r.left) * c.offsetWidth) / r.width, y: ((e.clientY - r.top) * c.offsetHeight) / r.height };
  };

  const clearIdle = () => {
    if (idle.current) clearTimeout(idle.current);
    idle.current = null;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    clearIdle();
    onPenDown?.();
    current.current = [toLocal(e)];
    const ctx = canvasRef.current!.getContext("2d")!;
    drawStroke(ctx, current.current);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!current.current) return;
    const p = toLocal(e);
    const s = current.current;
    s.push(p);
    const ctx = canvasRef.current!.getContext("2d")!;
    drawSegment(ctx, s);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!current.current) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    const finished = current.current;
    current.current = null;
    const next = [...strokes, finished];
    onStrokesChange(next);
    clearIdle();
    idle.current = setTimeout(() => {
      idle.current = null;
      onBurstEnd(next.length);
    }, BURST_IDLE_MS);
  };

  useEffect(() => clearIdle, []);

  return (
    <canvas
      ref={canvasRef}
      className={`block h-full w-full touch-none select-none cursor-crosshair ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-label="Handwriting pad"
    />
  );
}

const INK = "#1f1c4d";

function drawRuled(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.strokeStyle = "rgba(20, 18, 58, 0.07)";
  ctx.lineWidth = 1;
  for (let y = 56; y < h; y += 56) {
    ctx.beginPath();
    ctx.moveTo(24, y + 0.5);
    ctx.lineTo(w - 24, y + 0.5);
    ctx.stroke();
  }
  ctx.restore();
}

function inkStyle(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.lineWidth = 2.6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

/** Whole stroke, smoothed with quadratic midpoints. */
function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke) {
  if (s.length === 0) return;
  inkStyle(ctx);
  if (s.length === 1) {
    ctx.beginPath();
    ctx.arc(s[0].x, s[0].y, 1.4, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(s[0].x, s[0].y);
  for (let i = 1; i < s.length - 1; i++) {
    const mx = (s[i].x + s[i + 1].x) / 2;
    const my = (s[i].y + s[i + 1].y) / 2;
    ctx.quadraticCurveTo(s[i].x, s[i].y, mx, my);
  }
  const last = s[s.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
}

/** Just the newest segment, for low-latency drawing while the pointer moves. */
function drawSegment(ctx: CanvasRenderingContext2D, s: Stroke) {
  const n = s.length;
  if (n < 2) return;
  inkStyle(ctx);
  ctx.beginPath();
  if (n >= 3) {
    const a = s[n - 3];
    const b = s[n - 2];
    const c = s[n - 1];
    ctx.moveTo((a.x + b.x) / 2, (a.y + b.y) / 2);
    ctx.quadraticCurveTo(b.x, b.y, (b.x + c.x) / 2, (b.y + c.y) / 2);
  } else {
    ctx.moveTo(s[0].x, s[0].y);
    ctx.lineTo(s[1].x, s[1].y);
  }
  ctx.stroke();
}
