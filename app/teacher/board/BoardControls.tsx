"use client";

import Link from "next/link";
import { assignmentHref, LIVE_ASSIGNMENT_ID } from "@/lib/assignments";
import { useRouter } from "next/navigation";
import TeacherChrome from "../TeacherChrome";
import M from "@/components/Math";
import PadSection from "@/components/PadSection";
import { Card, Eyebrow, H1 } from "@/components/ui";
import { PROBLEM_MAP } from "@/data/assignment";
import type { Stroke } from "@/data/types";
import { currentSlide, FOLLOW_MODE_WORD, type FollowMode } from "@/lib/classroom";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { useAssignmentBundle } from "../AssignmentContext";

/**
 * The teacher's side of whole-class review, on the laptop: the controls and the pad, nothing
 * projected. The examples are on the smartboard (`/board`); this page says which problem is up,
 * takes the teacher's writing (mirrored to frozen students and to the board, and the board's own
 * writing shows here), and steps the session: previous · screens frozen / write with me · marks ·
 * End · next.
 */
export default function BoardControls() {
  const router = useRouter();
  const classroom = useClassroom();
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
  const end = () => {
    dispatchClassroom({ type: "wc/end" });
    router.push(assignmentHref(LIVE_ASSIGNMENT_ID, "class"));
  };

  return (
    <TeacherChrome>
      {heading}
      <div className="mt-8 space-y-5" data-board-controls="active" data-slide={slide.index} data-view={slide.view}>
        <Card className="flex items-center gap-5 px-6 py-4" data-controls-problem>
          <span className="font-display text-[26px] text-ink">{p.label}</span>
          <span className="math-lg text-[20px] text-ink">
            <M tex={p.tex} />
          </span>
          <span className="min-w-0 flex-1 truncate text-[14px] text-ink-soft">{p.stem}</span>
        </Card>

        <Card className="flex h-[560px] min-h-0 flex-col" data-teacher-pad>
          <PadSection title="Your working" strokes={slide.teacherInk} onStrokesChange={addStroke} onBurstEnd={() => undefined} onPenDown={() => undefined} onUndo={() => dispatchClassroom({ type: "wc/ink-undo", problem: pid })} onClear={() => dispatchClassroom({ type: "wc/ink-clear", problem: pid })} />
        </Card>

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
