"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { WorkLines } from "@/components/HierarchyDrill";
import ProblemQuestion from "@/components/ProblemQuestion";
import { Avatar, Card, Eyebrow } from "@/components/ui";
import { useEscape } from "@/components/useEscape";
import type { Problem } from "@/data/types";
import { progressTag } from "@/lib/progress";
import { confidenceTone } from "@/lib/report";
import type { WorkSoFar } from "@/lib/studentWork";
import type { WherePill } from "@/lib/whereStudents";
import { setStudentOpen } from "./diagnosticFlyout";
import ProgressPill from "./ProgressPill";

/** Kept between the panel's foot and the foot of the scroll region, layout px. */
const FOOT_ROOM = 12;
/** The panel's least height, layout px, however little of the region is left below its top. */
const LEAST = 280;
/**
 * The marked lines at the size the teacher's report sets them on screen: `WorkLines` is drawn for the report, which sits at
 * 125% of the teacher side's zoom (ticket 227), so here, at the teacher side's own zoom, the lines take that 125% back. The
 * in-progress pill takes it too, so it stands to the 17 px question as the roster's stands to a 16 px name.
 */
const LINES_ZOOM = 1.25;

/**
 * A student's work so far, over the split's left column below the headers (ticket 316), opened by pressing their pill on
 * Where students are: headed with their avatar and name, then their confidence answer as the Class view's Confidence column
 * words it and colours it; then every question they have moved past, in order, each the whole question (`ProblemQuestion`)
 * with their marked lines under it as the report draws them (`WorkLines`: red lines with their misconception chips), shown
 * outright; then the question they are on with the roster's "in progress" pill and no lines. Nothing after it, and "No
 * questions yet" before the first.
 *
 * It reads the model every tick, so it moves on with the student. Its height is what it holds, up to the foot of the scroll
 * region as the page lies unscrolled (a style write before paint, again on a resize), and past that the questions scroll
 * inside it under the fixed head. It sits over the rows, never the mistakes, and moves nothing behind it. Escape (focus back
 * on the pill), a press anywhere outside it and opening a diagnostic close it; a press on another pill opens that student.
 */
export default function StudentWorkPanel({ pill, work }: { pill: Pick<WherePill, "id" | "name" | "initials">; work: WorkSoFar<Problem> }) {
  const ref = useRef<HTMLDivElement>(null);
  const close = () => setStudentOpen(null);
  useEscape(true, close, () => document.querySelector<HTMLElement>(`[data-place-pill="${CSS.escape(pill.id)}"]`));
  useEffect(() => {
    const press = (e: PointerEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      // A pill's own press opens its student (or closes this one's panel); the panel's own presses keep it.
      if (!target || ref.current?.contains(target) || target.closest("[data-place-pill]")) return;
      setStudentOpen(null);
    };
    document.addEventListener("pointerdown", press, true);
    return () => document.removeEventListener("pointerdown", press, true);
  }, []);
  useLayoutEffect(() => {
    const panel = ref.current;
    const main = panel?.closest<HTMLElement>("[data-teacher-scroll]");
    if (!panel || !main) return;
    const fit = () => {
      const zoom = main.getBoundingClientRect().height / main.clientHeight || 1;
      const top = (panel.getBoundingClientRect().top - main.getBoundingClientRect().top) / zoom + main.scrollTop;
      panel.style.maxHeight = `${Math.max(LEAST, main.clientHeight - top - FOOT_ROOM)}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(main);
    return () => ro.disconnect();
  }, []);

  const tag = work.on && progressTag({ kind: "working", label: work.on.label });
  const questions = [...work.moved.map((m) => ({ problem: m.problem, lines: m.lines as string[] | null })), ...(work.on ? [{ problem: work.on, lines: null }] : [])];
  return (
    <div ref={ref} className="flex flex-col" role="dialog" aria-label={`${pill.name}'s work so far`} data-student-panel={pill.id}>
      <Card className="flex min-h-0 flex-col overflow-hidden shadow-lift">
        <div className="shrink-0 border-b border-line px-6 pt-5 pb-4" data-panel-head>
          <div className="flex items-center gap-3">
            <Avatar initials={pill.initials} size="h-10 w-10 text-[13px]" />
            <span className="font-display text-[28px] leading-none text-ink" data-panel-name>
              {pill.name}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <Eyebrow>Confidence</Eyebrow>
            <span className={`text-[17px] ${confidenceTone(work.confidence)}`} data-panel-confidence={work.confidence}>
              {work.confidence}
            </span>
          </div>
        </div>
        <div className="min-h-0 overflow-y-auto px-6 pb-1" data-panel-scroll>
          {questions.length === 0 ? (
            <p className="py-5 text-[17px] text-ink-muted" data-panel-empty>
              No questions yet
            </p>
          ) : (
            questions.map(({ problem, lines }) => (
              <section key={problem.id} className="border-b border-line py-4 last:border-b-0" data-panel-question={problem.id} data-in-progress={lines === null || undefined}>
                <div className="flex items-baseline gap-3">
                  <span className="shrink-0 font-display text-[24px] leading-none text-ink">{problem.label}</span>
                  <p className="min-w-0 flex-1 text-[17px] leading-snug text-ink" data-panel-question-text>
                    <ProblemQuestion problem={problem} mathClass="math-lg" />
                  </p>
                  {lines === null && tag && <ProgressPill tag={tag} className="self-center" style={{ zoom: LINES_ZOOM }} />}
                </div>
                {lines !== null && (
                  <div style={{ zoom: LINES_ZOOM }} data-panel-lines>
                    <WorkLines problem={problem.id} texs={lines} />
                  </div>
                )}
              </section>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
