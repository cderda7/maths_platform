"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import M from "@/components/Math";
import type { LineMark } from "@/lib/examples";

/**
 * The examples of whole-class review, drawn the same way on the smartboard and on the student's
 * screen (ticket 161): two or three columns, the letter at the top left, a corner slot at the top
 * right (empty on the board, which shows no counts since ticket 202; the student's screen a
 * "your approach" tag on the example that was their own first hand-in), then the working, one
 * line per box, red or blue only while the board is showing marks. A line never wraps: the lines
 * are set at the size's maximum (fitted so the widest line of the assignment stands on one line at
 * the surface's design width, the board at 1440 and the iPad at 1180) and, in a narrower window,
 * every column's lines shrink together, by the one ratio that fits the widest of them, the way
 * `FitText` fits a line. A column taller than its slot scrolls on its own.
 */
export interface ExampleColumn {
  letter: string;
  lines: { tex: string; mark: LineMark }[];
  corner?: ReactNode;
}

export type ExampleSize = "board" | "student";

const SIZE: Record<ExampleSize, { max: number; grid: string; card: string; letter: string; list: string; line: string }> = {
  board: { max: 21, grid: "gap-3", card: "rounded-3xl p-4 shadow-card", letter: "text-[44px]", list: "mt-5 space-y-3", line: "rounded-2xl px-3 py-3" },
  student: { max: 16, grid: "gap-3", card: "rounded-2xl p-4", letter: "text-[30px]", list: "mt-3 space-y-2", line: "rounded-xl px-3 py-2" },
};

const TONE: Record<NonNullable<LineMark>, string> = { wrong: "border-wrong-line bg-wrong-soft", standout: "border-standout-line bg-standout-soft" };

export default function ExampleColumns({ examples, size, className = "" }: { examples: ExampleColumn[]; size: ExampleSize; className?: string }) {
  const s = SIZE[size];
  const ref = useRef<HTMLDivElement>(null);
  // What is on show, so a re-render with the same lines (the board ticks every second) doesn't re-fit.
  const shown = examples.map((e) => `${e.letter}:${e.lines.map((l) => l.tex).join("\n")}`).join("|");
  useLayoutEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    const fit = () => {
      // Measure at the maximum: box widths come from the columns, not the font, so one measurement gives the ratio.
      grid.style.fontSize = `${s.max}px`;
      let ratio = 1;
      for (const li of grid.querySelectorAll<HTMLElement>("ol > li")) {
        const maths = li.firstElementChild as HTMLElement | null;
        const cs = getComputedStyle(li);
        const inner = li.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        const width = maths?.offsetWidth ?? 0;
        if (width > 0 && inner > 0) ratio = Math.min(ratio, inner / width);
      }
      grid.style.fontSize = `${Math.floor(s.max * ratio * 10) / 10}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(grid);
    return () => ro.disconnect();
  }, [s.max, shown]);
  return (
    <div ref={ref} className={`grid min-h-0 grid-rows-[minmax(0,1fr)] ${examples.length === 3 ? "grid-cols-3" : "grid-cols-2"} ${s.grid} ${className}`} style={{ fontSize: s.max }} data-examples data-size={size}>
      {examples.map((e) => (
        <section key={e.letter} className={`flex min-h-0 flex-col overflow-y-auto border border-line bg-paper ${s.card}`} data-example={e.letter}>
          <div className="flex shrink-0 items-baseline justify-between gap-3">
            <span className={`font-display leading-none text-ink ${s.letter}`}>{e.letter}</span>
            {e.corner}
          </div>
          <ol className={s.list}>
            {e.lines.map((l, i) => (
              <li key={i} data-mark={l.mark ?? undefined} className={`border whitespace-nowrap text-ink ${s.line} ${l.mark ? TONE[l.mark] : "border-line bg-cream/50"}`}>
                <M tex={l.tex} />
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
