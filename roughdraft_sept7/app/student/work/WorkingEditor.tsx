"use client";

import { useEffect, useRef } from "react";
import M from "@/components/Math";
import { toTex } from "@/lib/evaluate";

/**
 * Line-by-line working editor. Each line is one move; the student sees it typeset as they type.
 * Enter adds a line below, Backspace on an empty line removes it. In the real product the same
 * lines could arrive by photo — the evaluator only cares about the lines.
 */
export default function WorkingEditor({
  lines,
  onChange,
  onSubmit,
}: {
  lines: string[];
  onChange: (lines: string[]) => void;
  onSubmit?: () => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const pendingFocus = useRef<number | null>(null);

  // Focus the line that was just added or the one above a removed line, once it exists in the DOM.
  useEffect(() => {
    if (pendingFocus.current === null) return;
    refs.current[pendingFocus.current]?.focus();
    pendingFocus.current = null;
  });

  const set = (i: number, v: string) => onChange(lines.map((l, j) => (j === i ? v : l)));
  const insertAfter = (i: number) => {
    onChange([...lines.slice(0, i + 1), "", ...lines.slice(i + 1)]);
    pendingFocus.current = i + 1;
  };
  const remove = (i: number) => {
    if (lines.length === 1) return onChange([""]);
    onChange(lines.filter((_, j) => j !== i));
    pendingFocus.current = Math.max(0, i - 1);
  };

  return (
    <div>
      <ol className="space-y-2">
        {lines.map((line, i) => {
          const empty = line.trim() === "";
          return (
            <li key={i} className="group flex items-center gap-3 rounded-lg border border-line bg-cream/60 px-3 py-2 focus-within:border-ink-muted">
              <span className="w-5 text-[11px] text-ink-muted tabular-nums">{i + 1}</span>
              <input
                ref={(el) => {
                  refs.current[i] = el;
                }}
                value={line}
                onChange={(e) => set(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (e.metaKey || e.ctrlKey) onSubmit?.();
                    else insertAfter(i);
                  } else if (e.key === "Backspace" && empty && lines.length > 1) {
                    e.preventDefault();
                    remove(i);
                  } else if (e.key === "ArrowUp" && i > 0) {
                    e.preventDefault();
                    refs.current[i - 1]?.focus();
                  } else if (e.key === "ArrowDown" && i < lines.length - 1) {
                    e.preventDefault();
                    refs.current[i + 1]?.focus();
                  }
                }}
                placeholder={i === 0 ? "first line of your working" : "next line"}
                spellCheck={false}
                autoComplete="off"
                aria-label={`Line ${i + 1} of your working`}
                className="min-w-0 flex-1 bg-transparent font-mono text-[13.5px] text-ink placeholder:text-ink-muted/70 outline-none"
              />
              {!empty && (
                <span className="math-lg hidden sm:block min-w-[40%] text-right text-ink" aria-hidden>
                  <M tex={toTex(line)} />
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Remove line ${i + 1}`}
                className="text-[14px] leading-none text-ink-muted opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:text-ink"
              >
                ×
              </button>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={() => insertAfter(lines.length - 1)}
            className="flex w-full items-center gap-3 rounded-lg border border-dashed border-line-strong px-3 py-2 text-left text-[13px] text-ink-muted hover:border-ink-muted hover:text-ink"
          >
            <span className="w-5 text-[11px] tabular-nums">{lines.length + 1}</span>
            <span>add a line…</span>
          </button>
        </li>
      </ol>
      <div className="mt-2 text-[11.5px] text-ink-muted">
        Type maths as you'd say it: <code className="font-mono">x^2</code>, <code className="font-mono">sqrt(37)</code>,{" "}
        <code className="font-mono">1/2</code>, <code className="font-mono">+-</code> for ±, and <code className="font-mono">or</code> between answers.
        One move per line — the check reads each line against the one above.
      </div>
    </div>
  );
}
