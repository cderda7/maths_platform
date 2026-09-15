"use client";

import Link from "next/link";
import { assignmentHref, LIVE_ASSIGNMENT_ID } from "@/lib/assignments";
import { useRouter } from "next/navigation";
import TeacherChrome from "../TeacherChrome";
import ProblemQuestion from "@/components/ProblemQuestion";
import ExampleColumns from "@/components/ExampleColumns";
import PadSection from "@/components/PadSection";
import SlideInk from "@/components/SlideInk";
import { Card, Eyebrow, H1 } from "@/components/ui";
import { PROBLEM_MAP } from "@/data/assignment";
import type { Stroke } from "@/data/types";
import { currentSlide, FOLLOW_MODE_WORD, type FollowMode } from "@/lib/classroom";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { boardExamples, lineMarks } from "@/lib/examples";
import { ANCHOR } from "@/lib/markup";
import { useLiveSession } from "@/lib/store";
import { useAssignmentBundle } from "../AssignmentContext";

/**
 * The teacher's side of whole-class review, on the laptop: the controls and the pad, nothing
 * projected. This page says which problem is up, shows its examples as the board does, takes the
 * teacher's writing (mirrored to frozen students and to the board, and the board's own writing
 * shows here), and steps the session: previous · screens frozen / write with me · marks · End · next.
 * The pen works over the question and the examples too (ticket 330): a mark is pinned to the maths
 * under it and shows over the same maths on the board and every student's screen.
 */
export default function BoardControls() {
  const router = useRouter();
  const classroom = useClassroom();
  // Live, as the board reads it: the examples here are the board's, line for line, so a mark lands on the same line.
  const session = useLiveSession();
  const { title, className } = useAssignmentBundle();
  const slide = currentSlide(classroom);

  const heading = (
    <>
      <Eyebrow>
        {className} · {title}
      </Eyebrow>
      <div className="mt-3">
        <H1>Board controls</H1>
      </div>
    </>
  );

  if (!slide) {
    return (
      <TeacherChrome>
        {heading}
        <Card className="mt-8 flex items-center justify-between p-6" data-board-controls="idle">
          <p className="text-[14px] text-ink-muted">No session projecting</p>
          <Link href="/teacher/whole-class" className="inline-flex items-center rounded-full border border-line-strong bg-paper px-4 py-2 text-[13.5px] font-medium text-ink hover:border-ink-muted" data-wc-setup>
            Set up →
          </Link>
        </Card>
      </TeacherChrome>
    );
  }

  const p = PROBLEM_MAP[slide.problemId];
  const pid = slide.problemId;
  const addStroke = (next: Stroke[]) => dispatchClassroom({ type: "wc/stroke", problem: pid, stroke: next[next.length - 1] });
  const setMode = (mode: FollowMode) => dispatchClassroom({ type: "wc/mode", problem: pid, mode });
  const examples = boardExamples(classroom?.wholeClass?.examples[pid] ?? [], pid, session);
  const end = () => {
    dispatchClassroom({ type: "wc/end" });
    router.push(assignmentHref(LIVE_ASSIGNMENT_ID, "class"));
  };

  return (
    <TeacherChrome>
      {heading}
      <div className="mt-8 space-y-5" data-board-controls="active" data-slide={slide.index} data-view={slide.view}>
        <SlideInk marks={slide.markup} onMark={(mark) => dispatchClassroom({ type: "wc/stroke", problem: pid, stroke: mark })} className="space-y-5">
          <Card className="flex items-center gap-5 px-6 py-4" data-controls-problem>
            <span className="shrink-0 font-display text-[26px] text-ink" data-ink-anchor={ANCHOR.label}>
              {p.label}
            </span>
            {/* The whole question, stem then expression, as it reads on the board (ticket 271); it wraps rather than truncating. */}
            <p className="min-w-0 flex-1 text-[15px] leading-snug text-ink" data-controls-question>
              <ProblemQuestion problem={p} mathClass="math-lg text-[20px]" figureWidth={96} inkAnchors />
            </p>
          </Card>

          {/* The board's row: its columns at the board's size beside the pad, 380 wide as on the board (ticket 330). */}
          <div className="grid h-[560px] min-h-0 grid-cols-[1fr_380px] gap-4" data-controls-slide>
            <ExampleColumns
              size="board"
              examples={examples.map((e) => {
                const marks = slide.view === "marked" ? lineMarks(pid, e.lines) : [];
                return { letter: e.letter, lines: e.lines.map((tex, i) => ({ tex, mark: marks[i] ?? null })) };
              })}
            />
            <Card className="flex min-h-0 flex-col" data-teacher-pad>
              <PadSection title="Your working" strokes={slide.teacherInk} inkCount={slide.inkCount} onStrokesChange={addStroke} onBurstEnd={() => undefined} onPenDown={() => undefined} onUndo={() => dispatchClassroom({ type: "wc/ink-undo", problem: pid })} onClear={() => dispatchClassroom({ type: "wc/ink-clear", problem: pid })} />
            </Card>
          </div>
        </SlideInk>

        <div className="flex items-center justify-between" data-controls>
          <button type="button" className="rounded-full border border-line bg-paper px-5 py-2.5 text-[15px] text-ink hover:border-ink-muted disabled:opacity-30" onClick={() => dispatchClassroom({ type: "wc/prev" })} disabled={slide.index === 0 && slide.view === "unmarked"} data-prev>
            ← Previous
          </button>
          <div className="flex items-center rounded-full border border-line bg-paper p-1" role="group" aria-label="Student screens" data-mode-toggle>
            {(["frozen", "write-with-me"] as FollowMode[]).map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)} aria-pressed={slide.mode === m} data-mode={m} className={`rounded-full px-4 py-1.5 text-[13.5px] transition-colors ${slide.mode === m ? "bg-ink text-white" : "text-ink-soft hover:text-ink"}`}>
                {FOLLOW_MODE_WORD[m]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className={`rounded-full border px-5 py-2.5 text-[15px] transition-colors ${slide.view === "marked" ? "border-ink bg-ink text-white" : "border-line bg-paper text-ink hover:border-ink-muted"}`}
              onClick={() => dispatchClassroom({ type: "wc/marks", on: slide.view !== "marked" })}
              aria-pressed={slide.view === "marked"}
              data-marks
            >
              {slide.view === "marked" ? "Hide marks" : "Show marks"}
            </button>
            <button type="button" className="rounded-full border border-line bg-paper px-5 py-2.5 text-[15px] text-ink hover:border-ink-muted" onClick={end} data-end>
              End
            </button>
            <button type="button" className="rounded-full bg-ink px-6 py-2.5 text-[15px] font-medium text-white hover:bg-ink-soft disabled:opacity-30" onClick={() => dispatchClassroom({ type: "wc/next" })} disabled={slide.index >= slide.total - 1} data-next>
              Next →
            </button>
          </div>
        </div>
      </div>
    </TeacherChrome>
  );
}
