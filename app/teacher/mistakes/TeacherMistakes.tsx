"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import TeacherChrome from "../TeacherChrome";
import M from "@/components/Math";
import { Avatar, Card, Eyebrow, H1 } from "@/components/ui";
import { DifficultyTag, SlipChip } from "@/components/Tag";
import { ASSIGNMENT } from "@/data/assignment";
import { CLASS_SIZE, groupBySlip, mistakesByProblem, type WorkColumn } from "@/lib/mistakes";
import { diagnosticFor } from "@/lib/diagnostic";
import { useBatchedSession } from "@/lib/store";
import { useAssignment } from "@/lib/classroom-store";
import DiagnosticPush, { PROBLEM_HEADER } from "../DiagnosticPush";

// The same button as the class view's row actions ("see dot skills" / "close").
const ACTION = "w-[96px] rounded-md px-2 py-[3px] text-[11px] font-medium leading-snug transition-colors";
const ACTION_IDLE = `${ACTION} bg-standout-soft text-accent-deep hover:bg-standout-line`;
const ACTION_ACTIVE = `${ACTION} bg-accent text-white hover:bg-accent-deep`;

/**
 * The narrowest a column goes (ticket 135). Columns share the card evenly; a problem with more
 * columns (distinct workings, ticket 138) than fit at this width scrolls sideways. The working shrinks to fit: a
 * problem's lines are set at 17 px, or smaller by the one factor (`--fit`, measured by
 * `FitGrid`) that puts its widest line on one row inside its box, never under 13 px; under
 * 260 px of column the padding inside tightens too (`@max-[260px]`, a container query on the
 * cell). The floor is measured so the widest line in the fixtures (Q7's pair check,
 * 2 × 4 = 8, 2 + 4 = 6, at 13 px) sits on one row inside the box's edge cell, whose margin
 * takes 10 px of the column.
 */
const COLUMN_FLOOR = 186;
const LINE = "rounded-xl border px-4 py-2.5 text-[clamp(13px,calc(17px*var(--fit,1)),17px)] whitespace-nowrap text-ink @max-[260px]:px-2 @max-[260px]:py-1.5";

/**
 * The students' grid of one problem, which measures its own lines: before paint, with `--fit`
 * at 1, the widest line's overshoot of its box sets the factor every line in the grid is
 * scaled by (KaTeX scales with the font size, so one measurement is enough); measured again
 * whenever the grid's size changes (the window, a panel opening beside the card) and once the
 * maths fonts have loaded. Writes the factor straight to the element: no state, no re-render.
 */
function FitGrid({ children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      el.style.setProperty("--fit", "1");
      let scale = 1;
      for (const li of el.querySelectorAll<HTMLElement>("li[data-line]")) {
        const k = li.querySelector<HTMLElement>(".katex");
        if (!k) continue;
        // Layout px throughout (offsetWidth, clientWidth, computed padding): the teacher chrome is zoomed, so client rects would be in other units.
        const cs = getComputedStyle(li);
        const avail = li.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        const w = k.offsetWidth + 1; // offsetWidth rounds down
        if (w > avail) scale = Math.min(scale, avail / w);
      }
      el.style.setProperty("--fit", scale.toFixed(4));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  });
  return (
    <div ref={ref} {...rest}>
      {children}
    </div>
  );
}

/**
 * Mistakes by problem. Under each problem the students who slipped sit side by side, those who
 * slipped on the same step next to each other under one pill that spans them, and inside a
 * pill those who made the exact same mistake (the same wrong line, whatever the lines around
 * it) next to each other. Students whose working is identical line for line share one column
 * (ticket 138): their names sit together over the one copy of the work, so a problem twelve
 * students got wrong in three ways takes three columns. Any number of problems can be open at
 * once: clicking the problem's header, any student, or the "expand" button that shows on hover
 * opens the working for that problem, one column each, the wrong line in red, and one box in
 * the pill's red around the working of every group of students on the same exact mistake (a
 * student alone on theirs boxed alone). An open problem carries a "close" button; once pressed, the button reads
 * "close all" (while other problems are still open) until the pointer leaves the card.
 * To the right of each problem sits its live diagnostic (ticket 127): the "Live diagnostic" chip
 * alone until clicked, then the push panel with the problem's own suggested question and the
 * make-your-own tab as a flyout from the chip, down and to the right (ticket 132); the card
 * keeps its width either way, and a little clear of the card so the open flyout never touches
 * it (ticket 142). Left of the card, level with its header row, a small box counts the class who
 * got it right, "14/20 right" (ticket 140; outside the card since 142), its tooltip splitting the
 * rest into the wrong (the rows) and those who never finished it. The difficulty tag sits after
 * the maths, not at the header's far end (142); no live pill on a name here (142).
 */
export default function TeacherMistakes() {
  const { session } = useBatchedSession(3000);
  const problems = mistakesByProblem(session);
  const [open, setOpen] = useState<string[]>([]);
  /** The problem just closed by hand: its button offers "close all" until the pointer leaves it. */
  const [armed, setArmed] = useState<string | null>(null);

  const show = (id: string) => setOpen((o) => (o.includes(id) ? o : [...o, id]));
  const hide = (id: string) => {
    setOpen((o) => o.filter((x) => x !== id));
    setArmed(id);
  };
  const toggle = (id: string) => (open.includes(id) ? hide(id) : show(id));

  return (
    <TeacherChrome>
      <Eyebrow>
        {ASSIGNMENT.className} · {useAssignment().title}
      </Eyebrow>
      <H1 className="mt-3">Where it went wrong</H1>

      <div className="mt-10 space-y-6">
        {problems.map(({ problem, rows, right }) => {
          const isOpen = open.includes(problem.id);
          const othersOpen = open.some((id) => id !== problem.id);
          const groups = groupBySlip(rows);
          // One grid column per identical working (ticket 138); boxes and pills span columns.
          const columns = groups.flatMap((g) => g.columns);
          const boxes = groups.flatMap((g) => g.mistakes);
          const boxOf = (i: number) => boxes.find((m) => i >= m.start && i < m.start + m.columns.length)!;
          const ids = (c: WorkColumn) => c.rows.map((r) => r.id).join(",");
          const column = (i: number) => (i === 0 ? "" : "border-l border-line");
          // Hover shows "expand"; open shows "close" until pressed; just closed shows "close all" while others are open.
          const action: { word: "expand" | "close" | "close all"; cls: string; visible: boolean } = isOpen
            ? { word: "close", cls: ACTION_ACTIVE, visible: true }
            : armed === problem.id && othersOpen
              ? { word: "close all", cls: ACTION_ACTIVE, visible: true }
              : { word: "expand", cls: ACTION_IDLE, visible: false };
          const act = () => {
            if (action.word === "close all") {
              setOpen([]);
              setArmed(null);
            } else toggle(problem.id);
          };
          return (
            <div key={problem.id} className="flex items-start gap-4" data-problem-row={problem.id}>
            {/* Level with the header row: the card's 1 px border, then the header. */}
            <div className="flex shrink-0 items-center" style={{ height: PROBLEM_HEADER + 2 }}>
              <span
                className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-line bg-cream-deep px-2 py-1 text-[12px] leading-none"
                title={`${right} of ${CLASS_SIZE} got it right · ${rows.length} wrong · ${CLASS_SIZE - right - rows.length} didn't finish it`}
                data-right={`${problem.id}:${right}`}
              >
                <span className="font-semibold text-ink">
                  {right}/{CLASS_SIZE}
                </span>
                <span className="text-ink-muted">right</span>
              </span>
            </div>
            <Card
              className="group/q min-w-0 flex-1 overflow-hidden"
              data-problem={problem.id}
              data-open={isOpen || undefined}
              onMouseLeave={() => armed === problem.id && setArmed(null)}
            >
              <div className="flex items-center gap-4 border-b border-line px-6 py-4" onClick={() => toggle(problem.id)} data-problem-header={problem.id}>
                <div className="flex items-center gap-4">
                  <span className="font-display text-[24px] text-ink">{problem.label}</span>
                  <span className="math-lg text-ink">
                    <M tex={problem.tex} />
                  </span>
                  <DifficultyTag d={problem.difficulty} />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      // A mouse click leaves focus on the button, which would keep it visible after the pointer leaves; keyboard activation (detail 0) keeps it.
                      if (e.detail) e.currentTarget.blur();
                      act();
                    }}
                    className={`${action.cls} ${action.visible ? "" : "invisible group-hover/q:visible group-focus-within/q:visible"}`}
                    aria-expanded={isOpen}
                    data-problem-action={problem.id}
                  >
                    {action.word}
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <FitGrid className="grid" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(${COLUMN_FLOOR}px, 1fr))` }} data-students>
                  {columns.map((c, i) => (
                    // Every student who wrote this column's working, their names flowing across the column and wrapping as it narrows; the first name in every column on one line.
                    <button
                      key={ids(c)}
                      type="button"
                      onClick={() => toggle(problem.id)}
                      aria-expanded={isOpen}
                      className={`row-start-1 flex min-w-0 flex-wrap content-start items-center gap-x-5 gap-y-2 px-5 pt-4 pb-3.5 text-left transition-colors hover:bg-cream-deep/40 ${column(i)} ${isOpen ? "bg-accent-soft/30" : ""}`}
                      style={{ gridColumn: i + 1 }}
                      data-column={`${problem.id}:${ids(c)}`}
                    >
                      {c.rows.map((r) => (
                        <span key={r.id} className="flex max-w-full items-center gap-3 whitespace-nowrap" data-row={`${problem.id}:${r.id}`}>
                          <Avatar initials={r.initials} />
                          <span className="truncate font-medium text-ink">{r.name}</span>
                        </span>
                      ))}
                    </button>
                  ))}
                  {groups.map((g) => (
                    <div
                      key={g.slips.join("|")}
                      className={`row-start-2 flex min-w-0 items-start gap-1.5 pr-5 pb-4 pl-5 ${column(g.start)} ${isOpen ? "bg-accent-soft/30" : ""}`}
                      style={{ gridColumn: `${g.start + 1} / span ${g.columns.length}` }}
                      data-slip-group={g.rows.map((r) => r.id).join(",")}
                    >
                      {g.slips.map((id) => (
                        <SlipChip key={id} id={id} className="min-w-0 flex-1 justify-start" />
                      ))}
                    </div>
                  ))}
                  {/* The working row's ground: the divider under the pills and the cream behind the boxes, across every column. */}
                  {isOpen && <div className="row-start-3 border-t border-line bg-cream/60" style={{ gridColumn: "1 / -1" }} aria-hidden />}
                  {isOpen &&
                    columns.map((c, i) => {
                      // One box per exact mistake: every cell in it carries the top and bottom edge; the first the left edge and corners, the last the right; between cells a plain divider.
                      const box = boxOf(i);
                      const first = i === box.start;
                      const last = i === box.start + box.columns.length - 1;
                      const edges = `${first ? "ml-2.5 rounded-l-xl border-l border-wrong-deep" : "border-l border-line"} ${last ? "mr-2.5 rounded-r-xl border-r border-wrong-deep" : ""}`;
                      // The grid cell is the container (its width is the column's, the same for every cell); the box edges sit on the div inside it.
                      return (
                        <div
                          key={ids(c)}
                          className="@container row-start-3 min-w-0 py-4"
                          style={{ gridColumn: i + 1 }}
                          data-expanded={`${problem.id}:${ids(c)}`}
                          data-mistake-group={box.rows.map((x) => x.id).join(",")}
                          data-box-start={first || undefined}
                          data-box-end={last || undefined}
                        >
                          <div className={`h-full border-y border-wrong-deep px-2.5 py-3 @max-[260px]:px-2 ${edges}`}>
                            <ol className="space-y-2">
                              {c.lines.map((l, j) => {
                                const wrong = l.verdict.verdict === "wrong";
                                return (
                                  <li
                                    key={j}
                                    className={`${LINE} ${wrong ? "border-wrong-line bg-wrong-soft" : "border-line bg-paper"}`}
                                    data-line
                                    data-wrong={wrong || undefined}
                                  >
                                    <M tex={l.tex} />
                                  </li>
                                );
                              })}
                            </ol>
                            {c.live && (
                              <div className="mt-3 flex items-center justify-between text-[12.5px] whitespace-nowrap text-ink-muted @max-[260px]:flex-col @max-[260px]:items-start @max-[260px]:gap-0.5 @max-[260px]:text-[11px]">
                                <span>As handed in</span>
                                <Link href="/teacher/compare" className="text-accent-deep hover:underline" data-compare-link>
                                  Original vs final →
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </FitGrid>
              </div>
            </Card>
            {/* The extra margin keeps the open flyout (laid 25 px left of the chip) clear of the card. */}
            <DiagnosticPush example={diagnosticFor(problem.id)} problemId={problem.id} className="ml-5 shrink-0" />
            </div>
          );
        })}
        {problems.length === 0 && <Card className="p-6 text-[14px] text-ink-muted">No slips yet</Card>}
      </div>
    </TeacherChrome>
  );
}
