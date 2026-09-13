"use client";

import { useEffect, useMemo, useRef, useState, type ClipboardEvent, type KeyboardEvent, type MouseEvent } from "react";
import QuestionView from "@/components/QuestionView";
import { draftText, parseQuestion, splitPaste } from "@/lib/mathInput";
import type { QuestionItem } from "@/lib/upload";

export interface TileHandlers {
  onChange: (text: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  /** Enter: the next tile. */
  onNext: () => void;
  /** Backspace in an empty tile: remove it, or on the ghost just step back. */
  onBackspaceEmpty: () => void;
  onRemove: () => void;
  /** A paste of several lines: the first goes into this tile, the rest become tiles after it. */
  onPasteLines: (first: string, rest: string[]) => void;
  /** An unconfirmed uploaded question kept (ticket 171). */
  onKeep: () => void;
  /** The ghost's Upload link: open the file picker (ticket 171). */
  onUpload: () => void;
  /** The text changed while the tile was focused and the focus is leaving: have the model read it (ticket 173). */
  onRead: () => void;
  /** A correction typed into the Fix line (ticket 173). */
  onFix: (instruction: string) => void;
}

/** What the Fix line suggests. */
export const FIX_PLACEHOLDER = "Fix: e.g. the denominator is 2x";

/** What the ghost says when nothing is typed: the ways a question can arrive here (ticket 171, PDFs with ticket 172). */
export const GHOST_PLACEHOLDER = "Type a question, or drop a picture or PDF";

/**
 * One question as a tile in the five-wide grid, the same tile the student's overview shows
 * (ticket 119). The tile is the editor: focused, it shows the typed text in a box at the top and
 * the rendered question beneath, live; blurred, only the rendered question. The last tile is the
 * ghost, "Q{n+1}" muted with "Type a question, or drop a picture or PDF" (the textarea's placeholder
 * while focused, the view's while not) and an Upload link under it, until it has text. Enter moves to the next tile, Shift+Enter breaks the line (which forces the
 * prose/expression split), Backspace in an empty tile removes it, a × in the corner does the
 * same. Fixed size, nothing scrolls or grows: a question is assumed to fit (ASSUMPTIONS.md).
 * Press and hold anywhere on it to drag it to another slot (ticket 150); `slot` is where it
 * shows while a drag is on, so its label renumbers as the tiles slide.
 *
 * A question read out of a dropped file (ticket 171) arrives unconfirmed: tinted light blue
 * with a ✓ to keep it and a × to discard it always showing, its text the model's stem then its
 * TeX on a second line (editable like any other), a thumbnail of the file in the corner, and the
 * sheet's own numbering under the label when it printed one.
 *
 * Ticket 173: a typed tile whose text changed while it was focused is sent to the model as the
 * focus leaves (Enter or blur); the shorthand parser's preview stands until the model's reading
 * arrives (`item.model`, valid while the text is unchanged), then that is what renders, with no
 * tint. A dot beside the label pulses while the read is in flight. Every focused tile has a Fix
 * line under its text: a plain-language correction or a line of TeX, Enter to send, Escape to
 * clear; a shimmer covers the render while the fix is in flight. A figure cut from the source
 * shows under the question while the tile is not being edited (the editor and the Fix line
 * would push it under the tile's edge).
 */
export default function QuestionTile({ index, slot = index, item, ghost, focused, h }: { index: number; slot?: number; item: QuestionItem; ghost: boolean; focused: boolean; h: TileHandlers }) {
  const text = item.text;
  const model = item.model && item.model.for === text ? item.model : undefined;
  const parsed = useMemo(() => (model ? parseQuestion(draftText(model.stem, model.tex)) : parseQuestion(text)), [text, model]);
  const area = useRef<HTMLTextAreaElement>(null);
  /** The text when the tile took focus, so only a change is sent to the model on the way out. */
  const focusText = useRef<string | null>(null);
  const label = `Q${slot + 1}`;
  const unconfirmed = item.uploaded === true && item.confirmed === false;
  const source = item.page !== undefined ? `${item.label ? `${item.label} · ` : ""}p. ${item.page}` : item.label;

  useEffect(() => {
    if (!focused) return;
    const el = area.current;
    if (!el || document.activeElement === el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, [focused]);

  useEffect(() => {
    focusText.current = focused ? text : null;
    // The text at the moment of focusing is what a change is measured against; later edits must not move it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused]);

  /** Leaving the tile (Enter or blur): a changed, non-empty text goes to the model once. */
  const leaving = () => {
    if (focusText.current !== null && text !== focusText.current && text.trim()) {
      focusText.current = text;
      h.onRead();
    }
  };

  const keyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      leaving();
      h.onNext();
    } else if (e.key === "Backspace" && text === "") {
      e.preventDefault();
      h.onBackspaceEmpty();
    }
  };



  const paste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    // A pasted picture is the screen's business (a drop by another route); a pasted list is split into tiles here.
    if (e.clipboardData.files.length) return;
    const lines = splitPaste(e.clipboardData.getData("text"));
    if (lines.length < 2) return;
    e.preventDefault();
    const el = e.currentTarget;
    const first = el.value.slice(0, el.selectionStart) + lines[0] + el.value.slice(el.selectionEnd);
    h.onPasteLines(first, lines.slice(1));
  };

  // A click anywhere on the tile edits it (on the release, so a press held to drag it does not); while editing, a press on the rendered view keeps the caret where it is.
  const outside = (e: MouseEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement;
    return !t.closest("textarea") && !t.closest("button");
  };
  const mouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (outside(e)) e.preventDefault();
  };
  const click = (e: MouseEvent<HTMLDivElement>) => {
    if (outside(e) && !focused) h.onFocus();
  };

  const surface =
    ghost && !focused
      ? "border-dashed border-line-strong bg-transparent"
      : unconfirmed
        ? focused
          ? "border-accent-line bg-standout-soft shadow-lift"
          : "border-standout-line bg-standout-soft shadow-card"
        : focused
          ? "border-accent-line bg-paper shadow-lift"
          : "border-line bg-paper shadow-card";

  return (
    <div
      onMouseDown={mouseDown}
      onClick={click}
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border p-5 transition-[border-color,box-shadow] ${surface}`}
      data-tile={index + 1}
      data-ghost={ghost || undefined}
      data-focused={focused || undefined}
      data-uploaded={item.uploaded || undefined}
      data-unconfirmed={unconfirmed || undefined}
      data-reading={item.reading || undefined}
      data-fixing={item.fixing || undefined}
      data-model={model ? "true" : undefined}
    >
      <div className="flex items-center justify-between">
        <span className={`font-display text-[20px] ${ghost ? "text-ink-muted" : "text-ink"}`} data-label>
          {label}
          {item.reading && <span className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-standout align-middle" aria-label="Reading" data-reading-dot />}
          {source && (
            <span className="ml-2 align-middle font-sans text-[11px] font-semibold tracking-[0.08em] text-standout" data-source-label>
              {source}
            </span>
          )}
        </span>
        {!ghost && (
          <span className="-mr-2 -mt-1 flex items-center">
            {unconfirmed && (
              <button type="button" onClick={h.onKeep} aria-label={`Keep ${label}`} className="grid h-7 w-7 place-items-center rounded-full text-[15px] leading-none text-standout transition-colors hover:bg-paper hover:text-ink" data-keep>
                ✓
              </button>
            )}
            <button
              type="button"
              onClick={h.onRemove}
              aria-label={`${unconfirmed ? "Discard" : "Remove"} ${label}`}
              className={`grid h-7 w-7 place-items-center rounded-full text-[16px] leading-none text-ink-muted transition-opacity hover:bg-cream-deep hover:text-ink ${focused || unconfirmed ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"}`}
              data-remove
            >
              ×
            </button>
          </span>
        )}
      </div>
      {/* The mirror takes the placeholder while the text is empty (ticket 183), so the box is as tall as the placeholder's two lines and nothing is clipped. */}
      {focused && (
        <div className="grow-wrap mt-2 text-[13.5px] leading-snug text-ink" data-value={text || (ghost ? GHOST_PLACEHOLDER : "Type a question")}>
          <textarea
            ref={area}
            value={text}
            rows={1}
            placeholder={ghost ? GHOST_PLACEHOLDER : "Type a question"}
            aria-label={`${label} text`}
            onChange={(e) => h.onChange(e.target.value)}
            onKeyDown={keyDown}
            onPaste={paste}
            onBlur={() => {
              leaving();
              h.onBlur();
            }}
            className="w-full bg-cream-deep/70 text-ink outline-none placeholder:text-ink-muted/60"
            data-editor
          />
          {!ghost && <FixLine label={label} disabled={!!item.fixing} onFix={h.onFix} />}
        </div>
      )}
      <div className={`relative ${focused ? "mt-3" : "mt-2.5"}`}>
        <QuestionView parsed={parsed} placeholder={focused ? undefined : ghost ? GHOST_PLACEHOLDER : "Type a question"} />
        {item.fixing && <div className="shimmer absolute inset-0 rounded-md opacity-80" aria-label="Fixing" data-fixing-shimmer />}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- a data URL the browser drew */}
      {item.figure && !focused && <img src={item.figure.url} alt="" className="mt-2 max-h-[40%] w-auto max-w-full self-start rounded-md border border-line" data-figure />}
      {ghost && text === "" && (
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={h.onUpload} className="mt-2 self-start text-[13px] font-medium text-accent-deep hover:underline" data-upload>
          Upload
        </button>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element -- a data URL the browser drew; next/image has nothing to optimise */}
      {item.thumb && <img src={item.thumb} alt="" title={item.name} className="absolute bottom-3 right-3 h-10 w-10 rounded-md border border-line bg-paper object-cover" data-thumb />}
    </div>
  );
}

/**
 * The Fix line under a focused tile's text (ticket 173): a plain-language correction or a line
 * of TeX, Enter to send, Escape to clear. Its text lives with the focused block and goes when
 * the focus does. A press inside it stays inside it (the tile's own press handling would move
 * the caret).
 */
function FixLine({ label, disabled, onFix }: { label: string; disabled: boolean; onFix: (instruction: string) => void }) {
  const [fix, setFix] = useState("");
  const keyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const instruction = fix.trim();
      if (!instruction || disabled) return;
      onFix(instruction);
      setFix("");
    } else if (e.key === "Escape") {
      e.preventDefault();
      setFix("");
    }
  };
  return (
    <input
      value={fix}
      onChange={(e) => setFix(e.target.value)}
      onKeyDown={keyDown}
      onMouseDown={(e) => e.stopPropagation()}
      placeholder={FIX_PLACEHOLDER}
      aria-label={`Fix ${label}`}
      disabled={disabled}
      className="mt-1.5 w-full rounded-[10px] border border-transparent bg-transparent px-[10px] py-1 text-[12.5px] text-ink outline-none placeholder:text-ink-muted/60 focus:border-standout-line focus:bg-standout-soft/60 disabled:opacity-60"
      data-fix
    />
  );
}
