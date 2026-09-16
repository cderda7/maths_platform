"use client";

import Link from "next/link";
import { assignmentHref, LIVE_ASSIGNMENT_ID } from "@/lib/assignments";
import { useRouter } from "next/navigation";
import TeacherChrome from "../TeacherChrome";
import ProblemQuestion from "@/components/ProblemQuestion";
import ExampleColumns from "@/components/ExampleColumns";
import PadSection from "@/components/PadSection";
import SlideInk from "@/components/SlideInk";
import ClassStepControl from "@/components/ClassStepControl";
import WorkedLines from "@/components/WorkedLines";
import { useClassAdvance } from "@/components/useClassAdvance";
import { Card, Eyebrow, H1 } from "@/components/ui";
import { PROBLEM_MAP } from "@/data/assignment";
import type { Stroke } from "@/data/types";
import { currentSlide } from "@/lib/classroom";
import { CLASS_STEP_WORD } from "@/lib/classReview";
import { pairFor } from "@/lib/pairs";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { boardExamples, lineMarks } from "@/lib/examples";
import { ANCHOR } from "@/lib/markup";
import { useLiveSession } from "@/lib/store";
import { useAssignmentBundle } from "../AssignmentContext";

/**
 * The teacher's side of class review, on the laptop: the controls and the pad, nothing projected. This page says which
 * question is up and which of its three steps the class is on (ticket 344), shows that step as the board shows it, and
 * steps the session: previous · marks (on the examples) · End · the one control that moves the class on.
 *
 *  - Examples: the chosen workings as the board has them, the teacher's writing (mirrored to the board and every iPad),
 *    and Show marks. The pen works over the question and the examples too (ticket 330): a mark is pinned to the maths
 *    under it and shows over the same maths on the board and every student's screen.
 *  - Worked example: Q*'s lines as the board has revealed them, "Next line" revealing the next.
 *  - Students' turn: Q**, which every student is writing on their own iPad. No count of students here either; ticket 320
 *    puts the class's progress on the Mistakes tab, where the teacher can read it without turning the board into a scoreboard.
 */
export default function BoardControls() {
  const router = useRouter();
  const classroom = useClassroom();
  // Live, as the board reads it: the examples here are the board's, line for line, so a mark lands on the same line.
  const session = useLiveSession();
  const { title, className } = useAssignmentBundle();
  const slide = currentSlide(classroom);
  useClassAdvance();

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
  const pair = pairFor(pid);
  const step = slide.step;
  const shown = step === "worked" && pair ? pair.worked : step === "turn" && pair ? pair.completion : p;
  const addStroke = (next: Stroke[]) => dispatchClassroom({ type: "wc/stroke", problem: pid, stroke: next[next.length - 1] });
  const examples = boardExamples(classroom?.wholeClass?.examples[pid] ?? [], pid, session);
  const end = () => {
    dispatchClassroom({ type: "wc/end" });
    router.push(assignmentHref(LIVE_ASSIGNMENT_ID, "class"));
  };

  /** The question at the top, the same row's height whichever step is up, so nothing below it moves as the class steps on. */
  const question = (
    <Card className="flex items-center gap-5 px-6 py-4" data-controls-problem>
      <span className="shrink-0 font-display text-[26px] text-ink" data-ink-anchor={step === "examples" ? ANCHOR.label : undefined}>
        {shown.label}
      </span>
      <p className="min-w-0 flex-1 text-[15px] leading-snug text-ink" data-controls-question>
        <ProblemQuestion problem={shown} mathClass="math-lg text-[20px]" figureWidth={96} inkAnchors={step === "examples"} />
      </p>
      <span className="ml-auto shrink-0 text-[12.5px] uppercase tracking-wide text-ink-muted" data-controls-step={step}>
        {CLASS_STEP_WORD[step]}
      </span>
    </Card>
  );

  return (
    <TeacherChrome>
      {heading}
      <div className="mt-8 space-y-5" data-board-controls="active" data-slide={slide.index} data-view={slide.view} data-step={step}>
        {step === "examples" ? (
          <SlideInk marks={slide.markup} onMark={(mark) => dispatchClassroom({ type: "wc/stroke", problem: pid, stroke: mark })} className="space-y-5">
            {question}
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
        ) : (
          <div className="space-y-5">
            {question}
            <Card className="flex h-[560px] min-h-0 flex-col overflow-y-auto p-6" data-controls-slide>
              {step === "worked" && pair ? (
                <WorkedLines steps={pair.worked.solution} shown={slide.reveal} size="student" />
              ) : (
                // The class is writing; ticket 320 puts their progress here, on the Mistakes tab's split.
                <div className="m-auto max-w-[460px] rounded-2xl border border-dashed border-line-strong px-8 py-8 text-center" data-controls-turn>
                  <p className="font-display text-[22px] text-ink">The class is writing</p>
                  <p className="mt-2 text-[14px] leading-snug text-ink-soft">Every student has {shown.label} on their own iPad, their lines marked as they write. Move the class on when you are ready.</p>
                </div>
              )}
            </Card>
          </div>
        )}

        <div className="flex items-center justify-between" data-controls>
          <button type="button" className="rounded-full border border-line bg-paper px-5 py-2.5 text-[15px] text-ink hover:border-ink-muted disabled:opacity-30" onClick={() => dispatchClassroom({ type: "wc/prev" })} disabled={slide.index === 0 && step === "examples" && slide.view === "unmarked"} data-prev>
            ← Previous
          </button>
          <div className="flex items-center gap-3">
            {step === "examples" && (
              <button
                type="button"
                className={`rounded-full border px-5 py-2.5 text-[15px] transition-colors ${slide.view === "marked" ? "border-ink bg-ink text-white" : "border-line bg-paper text-ink hover:border-ink-muted"}`}
                onClick={() => dispatchClassroom({ type: "wc/marks", on: slide.view !== "marked" })}
                aria-pressed={slide.view === "marked"}
                data-marks
              >
                {slide.view === "marked" ? "Hide marks" : "Show marks"}
              </button>
            )}
            <button type="button" className="rounded-full border border-line bg-paper px-5 py-2.5 text-[15px] text-ink hover:border-ink-muted" onClick={end} data-end>
              End
            </button>
            <ClassStepControl step={step} reveal={slide.reveal} lines={pair?.worked.solution.length ?? 0} last={slide.last} hasPair={!!pair} size="laptop" />
          </div>
        </div>
      </div>
    </TeacherChrome>
  );
}
