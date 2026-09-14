"use client";

import { Fragment, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import M from "@/components/Math";
import Figure from "@/components/Figure";
import { Eyebrow } from "@/components/ui";
import type { Problem } from "@/data/types";
import { glueRuns, glueStem, sameTypeLine, similarFor, texDiff, wordDiff, type TilePhase, type WordRun } from "@/lib/homework";

/** A rectangle in the homework screen's own layout px. */
export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** The expanded question's width: one question, or the two side by side with reduced motion. */
const PANEL_W = 580;
const SIDE_W = 800;
/** The screen's side padding (`px-9`): the question never reaches past the cards' edges. */
const GUTTER = 36;
/** Between the tile row and the expanded question. */
const PANEL_GAP = 14;
/** What a tile shrinks to as it drops into the folder, as a share of its own size. */
const LANDING = 0.6;
/** The share of the fly phase spent shrinking back to a tile before it flies. */
const SHRINK = 0.4;

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const mix = (a: Box, b: Box, t: number): Box => ({ left: a.left + (b.left - a.left) * t, top: a.top + (b.top - a.top) * t, width: a.width + (b.width - a.width) * t, height: a.height + (b.height - a.height) * t });

/**
 * One problem on its way into homework (ticket 256), drawn over the homework screen so nothing under it moves. The tile
 * grows from its slot into its question, the question's numbers (and any changed words) change into the similar
 * problem's while everything they share stands still, the line under it names the type, then it shrinks back to a tile
 * and flies into the folder. With reduced motion the question and its similar one show side by side, and go.
 * Driven entirely by `phase` and `p` (0–1 through the phase), so a frame can be reproduced and a reload resumes.
 */
export default function HomeworkFlight({ problem, phase, p, slot, folder, bounds, reduced }: { problem: Problem; phase: TilePhase; p: number; slot: Box; folder: Box; bounds: { width: number; height: number }; reduced: boolean }) {
  const similar = similarFor(problem.id);
  const content = useRef<HTMLDivElement>(null);
  const [contentH, setContentH] = useState(220);
  useLayoutEffect(() => {
    const el = content.current;
    if (!el) return;
    // Measured before the first paint, so the box never shows a frame at a guessed height; re-measured if the content's height changes.
    const measure = () => setContentH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  if (!similar) return null;

  const width = reduced ? SIDE_W : PANEL_W;
  // Down and to the right of the tile, under the row, so every other tile stays in sight; pulled left where the screen ends.
  const panel: Box = { left: clamp(slot.left, GUTTER, bounds.width - width - GUTTER), top: slot.top + slot.height + PANEL_GAP, width, height: contentH };
  const landing: Box = { left: folder.left + folder.width / 2 - (slot.width * LANDING) / 2, top: folder.top + folder.height / 2 - (slot.height * LANDING) / 2, width: slot.width * LANDING, height: slot.height * LANDING };

  // Where the box is, what shows in it, and how far the numbers have changed.
  let box = panel;
  let face = 0; // the tile's own face over the box: 1 a tile, 0 the question
  let faceTone: "wrong" | "homework" = "wrong";
  let body = 1;
  let m = 0;
  let line = 0;
  let opacity = 1;
  let lift = 0;
  if (reduced) {
    const fade = 150 / 3800;
    opacity = clamp(p / fade) * clamp((1 - p) / fade);
    m = 1;
    line = 1;
  } else if (phase === "expanding") {
    box = mix(slot, panel, ease(p));
    // The tile's face goes first and the question comes in once the box is nearly open, so nothing reads half-clipped.
    face = 1 - clamp(p * 3.3);
    body = clamp((p - 0.6) / 0.4);
  } else if (phase === "morphing") {
    m = ease(p);
  } else if (phase === "similar") {
    m = 1;
    line = clamp(p * 4);
  } else if (phase === "flying") {
    // First the question shrinks back to a tile where it opened, then the tile flies up and over into the folder.
    const tile: Box = { left: panel.left, top: panel.top, width: slot.width, height: slot.height };
    m = 1;
    line = 1 - clamp(p / 0.2);
    body = 1 - clamp(p / 0.2);
    face = clamp((p - 0.15) / 0.25);
    faceTone = "homework";
    if (p < SHRINK) box = mix(panel, tile, ease(p / SHRINK));
    else {
      const q = ease((p - SHRINK) / (1 - SHRINK));
      box = mix(tile, landing, q);
      lift = -56 * Math.sin(Math.PI * q);
    }
    opacity = p > 0.88 ? 1 - (p - 0.88) / 0.12 : 1;
  }

  const style: CSSProperties = { left: box.left, top: box.top + lift, width: box.width, height: box.height, opacity };
  const tile = faceTone === "wrong" ? "border-wrong-line bg-wrong-soft" : "border-accent-line bg-accent-soft";
  const radius = phase === "expanding" ? 8 + 8 * ease(p) : phase === "flying" ? 16 - 8 * ease(p) : 16;
  return (
    <div className="pointer-events-none absolute z-30 overflow-hidden border border-line bg-paper shadow-lift" style={{ ...style, borderRadius: radius }} data-hw-flight={problem.id} data-hw-flight-phase={phase} aria-live="polite">
      <div ref={content} className="absolute left-0 top-0 px-6 py-5" style={{ width, opacity: body }} data-hw-panel>
        {reduced ? <SideBySide problem={problem} /> : <Stacked problem={problem} m={m} line={line} />}
      </div>
      {face > 0 && (
        // Over the box's own border (-inset-px), so at the start it is exactly the tile it left: same size, border, label and mark.
        <div className={`absolute -inset-px flex items-center justify-center gap-1.5 border text-[15px] font-medium text-ink ${tile}`} style={{ opacity: face, borderRadius: radius }} data-hw-face aria-hidden>
          {problem.label}
          {faceTone === "wrong" && <span className="text-[12px] leading-none text-wrong-deep">✕</span>}
        </div>
      )}
    </div>
  );
}

/** The question changing in place: the original's words and numbers, `m` of the way to the similar one's. */
function Stacked({ problem, m, line }: { problem: Problem; m: number; line: number }) {
  const similar = similarFor(problem.id)!;
  return (
    <div data-hw-stacked>
      <Eyebrow>{problem.label}</Eyebrow>
      <p className="mt-2 text-[16px] leading-snug text-ink-soft" data-hw-stem>
        <StemSwap runs={wordDiff(problem.stem, similar.stem)} m={m} />
      </p>
      <div className="mt-3 flex items-center gap-6">
        <MorphTex from={problem.tex} to={similar.tex} m={m} />
        {problem.figure && similar.figure && (
          <span className="relative block w-[170px] shrink-0">
            <span className="block" style={{ opacity: 1 - m }}>
              <Figure id={problem.figure} />
            </span>
            <span className="absolute inset-0" style={{ opacity: m }}>
              <Figure id={similar.figure} />
            </span>
          </span>
        )}
      </div>
      <p className="mt-4 min-h-5 text-[13.5px] font-medium text-accent-deep" style={{ opacity: line }} data-hw-line>
        {sameTypeLine(problem, similar)}
      </p>
    </div>
  );
}

/** Reduced motion: the question and its similar one side by side, the similar one's changes in the accent. */
function SideBySide({ problem }: { problem: Problem }) {
  const similar = similarFor(problem.id)!;
  const { runs, joins } = glueRuns(wordDiff(problem.stem, similar.stem));
  const d = texDiff(problem.tex, similar.tex);
  return (
    <div data-hw-side>
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-5">
        <div className="min-w-0" data-hw-side-original>
          <Eyebrow>{problem.label}</Eyebrow>
          <p className="mt-2 text-[15px] leading-snug text-ink-soft">{glueStem(problem.stem)}</p>
          <div className="mt-3 text-[22px]">
            <M tex={problem.tex} />
          </div>
          {problem.figure && <Figure id={problem.figure} className="mt-2 max-w-[170px]" />}
        </div>
        <div className="self-center text-[22px] text-ink-muted" aria-hidden>
          →
        </div>
        <div className="min-w-0" data-hw-side-similar>
          <Eyebrow>Similar</Eyebrow>
          <p className="mt-2 text-[15px] leading-snug text-ink-soft">
            {runs.map((r, i) => (
              <Fragment key={i}>
                {joins[i]}
                {r.from === r.to ? r.to : <span className="text-accent-deep">{r.to}</span>}
              </Fragment>
            ))}
          </p>
          <div className="mt-3 text-[22px]">
            <M tex={d.to} className={`hw-new ${d.aligned ? "" : "text-accent-deep"}`} />
          </div>
          {similar.figure && <Figure id={similar.figure} className="mt-2 max-w-[170px]" />}
        </div>
      </div>
      <p className="mt-4 text-[13.5px] font-medium text-accent-deep" data-hw-line>
        {sameTypeLine(problem, similar)}
      </p>
    </div>
  );
}

/**
 * The two expressions stacked, the same shape so every shared glyph of the one lies exactly on the other's: the original
 * shows whole, the similar one only its changed numbers, and `--m` rolls the old numbers up and out and the new ones up
 * and in (`.hw-morph` in app/globals.css). Not the same shape: the whole expression cross-fades.
 */
function MorphTex({ from, to, m }: { from: string; to: string; m: number }) {
  const d = texDiff(from, to);
  return (
    <span className={`hw-morph relative inline-block whitespace-nowrap text-[28px] ${d.aligned ? "hw-aligned" : ""}`} style={{ "--m": m } as CSSProperties} data-hw-tex>
      <M tex={d.from} className="hw-from" />
      <span className="absolute left-0 top-0" aria-hidden>
        <M tex={d.to} className="hw-to" />
      </span>
    </span>
  );
}

/** A stem's words, the changed runs rolling from the original's to the similar's, each run's width easing between the two. */
function StemSwap({ runs: raw, m }: { runs: WordRun[]; m: number }) {
  const { runs, joins } = glueRuns(raw);
  return (
    <>
      {runs.map((r, i) => (
        <Fragment key={i}>
          {joins[i]}
          {r.from === r.to ? r.from : <WordSwap from={r.from} to={r.to} m={m} />}
        </Fragment>
      ))}
    </>
  );
}

function WordSwap({ from, to, m }: { from: string; to: string; m: number }) {
  const a = useRef<HTMLSpanElement>(null);
  const b = useRef<HTMLSpanElement>(null);
  const [widths, setWidths] = useState<[number, number] | null>(null);
  useLayoutEffect(() => {
    if (!a.current || !b.current) return;
    const ro = new ResizeObserver(() => setWidths([a.current?.offsetWidth ?? 0, b.current?.offsetWidth ?? 0]));
    ro.observe(a.current);
    ro.observe(b.current);
    return () => ro.disconnect();
  }, []);
  // The space is never narrower than the word in it: a longer new word opens its room in the first part of the change, a
  // shorter one gives room back only once the old word has mostly gone.
  const k = widths && widths[1] > widths[0] ? Math.min(1, m / 0.6) : Math.max(0, (m - 0.4) / 0.6);
  const width = widths ? widths[0] + (widths[1] - widths[0]) * k : undefined;
  return (
    <span className="relative inline-block whitespace-nowrap" style={{ width }} data-hw-swap>
      {"​"}
      <span ref={a} className="absolute left-0" style={{ top: `${-0.4 * m}em`, opacity: 1 - m }}>
        {from}
      </span>
      <span ref={b} className="absolute left-0 text-accent-deep" style={{ top: `${0.4 * (1 - m)}em`, opacity: m }}>
        {to}
      </span>
    </span>
  );
}
