"use client";

import { useEffect, useMemo, useRef, type ClipboardEvent, type KeyboardEvent, type MouseEvent } from "react";
import QuestionView from "@/components/QuestionView";
import { parseQuestion, splitPaste } from "@/lib/mathInput";

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
}

/**
 * One question as a tile in the five-wide grid, the same tile the student's overview shows
 * (ticket 119). The tile is the editor: focused, it shows the typed text in a box at the top and
 * the rendered question beneath, live; blurred, only the rendered question. The last tile is the
 * ghost, "Q{n+1}" muted with "Type a question", until it has text. Enter moves to the next tile,
 * Shift+Enter breaks the line (which forces the prose/expression split), Backspace in an empty
 * tile removes it, a × in the corner does the same. Fixed size, nothing scrolls or grows: a
 * question is assumed to fit (ASSUMPTIONS.md). Press and hold anywhere on it to drag it to
 * another slot (ticket 150); `slot` is where it shows while a drag is on, so its label
 * renumbers as the tiles slide.
 */
export default function QuestionTile({ index, slot = index, text, ghost, focused, h }: { index: number; slot?: number; text: string; ghost: boolean; focused: boolean; h: TileHandlers }) {
  const parsed = useMemo(() => parseQuestion(text), [text]);
  const area = useRef<HTMLTextAreaElement>(null);
  const label = `Q${slot + 1}`;

  useEffect(() => {
    if (!focused) return;
    const el = area.current;
    if (!el || document.activeElement === el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, [focused]);

  const keyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      h.onNext();
    } else if (e.key === "Backspace" && text === "") {
      e.preventDefault();
      h.onBackspaceEmpty();
    }
  };

  const paste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
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

  return (
    <div
      onMouseDown={mouseDown}
      onClick={click}
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border p-5 transition-[border-color,box-shadow] ${
        ghost && !focused ? "border-dashed border-line-strong bg-transparent" : focused ? "border-accent-line bg-paper shadow-lift" : "border-line bg-paper shadow-card"
      }`}
      data-tile={index + 1}
      data-ghost={ghost || undefined}
      data-focused={focused || undefined}
    >
      <div className="flex items-center justify-between">
        <span className={`font-display text-[20px] ${ghost ? "text-ink-muted" : "text-ink"}`} data-label>
          {label}
        </span>
        {!ghost && (
          <button
            type="button"
            onClick={h.onRemove}
            aria-label={`Remove ${label}`}
            className={`-mr-2 -mt-1 grid h-7 w-7 place-items-center rounded-full text-[16px] leading-none text-ink-muted transition-opacity hover:bg-cream-deep hover:text-ink ${focused ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"}`}
            data-remove
          >
            ×
          </button>
        )}
      </div>
      {focused && (
        <div className="grow-wrap mt-2 text-[13.5px] leading-snug text-ink" data-value={text}>
          <textarea
            ref={area}
            value={text}
            rows={1}
            placeholder="Type a question"
            aria-label={`${label} text`}
            onChange={(e) => h.onChange(e.target.value)}
            onKeyDown={keyDown}
            onPaste={paste}
            onBlur={h.onBlur}
            className="w-full bg-cream-deep/70 text-ink outline-none placeholder:text-ink-muted/60"
            data-editor
          />
        </div>
      )}
      <div className={focused ? "mt-3" : "mt-2.5"}>
        <QuestionView parsed={parsed} placeholder={focused ? undefined : "Type a question"} />
      </div>
    </div>
  );
}
