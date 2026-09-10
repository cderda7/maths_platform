"use client";

import M from "@/components/Math";
import PadSection from "@/components/PadSection";
import { Eyebrow } from "@/components/ui";
import { ASSIGNMENT } from "@/data/assignment";
import { boardContent, type BoardContent } from "@/lib/board";
import { useClassroom } from "@/lib/classroom-store";
import { lineMarks } from "@/lib/examples";
import { useLiveSession } from "@/lib/store";

/**
 * The smartboard: opened once at the start of the lesson and left on the projector. Display
 * only: no button, no link, no pad that takes the pen. What it shows per stage is `boardContent`;
 * this file only draws it. Nothing here names a student or shows a difficulty.
 */
export default function SmartBoard() {
  const classroom = useClassroom();
  // Live, not batched: the room sees the board change the moment the class does.
  const session = useLiveSession();
  const content = boardContent(classroom, session);
  return (
    <div className="flex h-screen min-h-0 flex-col bg-cream select-none" data-board data-board-state={content.kind}>
      {content.kind === "whole-class" ? <Slide content={content} /> : content.kind === "holding" ? <Holding content={content} /> : <Blank content={content} />}
    </div>
  );
}

/** Nothing student-specific: the class and the assignment, so a projector that is on doesn't read as broken. */
function Blank({ content }: { content: BoardContent }) {
  return (
    <div className="grid flex-1 place-items-center text-center">
      <div>
        <Eyebrow className="text-[15px] tracking-[0.18em] text-ink-muted/70">{content.className}</Eyebrow>
        <p className="mt-4 font-display text-[40px] leading-tight text-ink-muted/60" data-board-title>
          {content.title}
        </p>
      </div>
    </div>
  );
}

/** Group review is over and the teacher hasn't moved the class on. Ticket 42 puts the final standings here. */
function Holding({ content }: { content: BoardContent }) {
  return (
    <>
      <header className="flex items-center justify-between px-10 py-6">
        <Eyebrow className="text-[13px] tracking-[0.16em]">{content.className}</Eyebrow>
        <span className="font-display text-[20px] text-ink-muted" data-board-title>
          {content.title}
        </span>
      </header>
      <div className="grid flex-1 place-items-center text-center">
        <div>
          <Eyebrow className="text-[15px] tracking-[0.18em]">Group review</Eyebrow>
          <p className="mt-4 flex items-center justify-center gap-3 font-display text-[44px] leading-tight text-ink-muted/60" data-board-holding>
            <span className="h-3 w-3 animate-pulse rounded-full bg-accent" aria-hidden />
            Standings
          </p>
        </div>
      </div>
    </>
  );
}

/** One projected problem: the statement, 2–3 anonymous examples, and a mirror of the teacher's working. */
function Slide({ content }: { content: Extract<BoardContent, { kind: "whole-class" }> }) {
  const { problem: p, examples, view, teacherInk, index, total } = content;
  return (
    <>
      <header className="flex items-center justify-between px-10 py-6" data-slide={index} data-view={view}>
        <div className="flex items-baseline gap-5">
          <span className="font-display text-[34px] text-ink">{p.label}</span>
          <span className="text-[15px] text-ink-muted" data-position>
            problem {index + 1} of {total}
          </span>
        </div>
        <div className="math-lg text-[30px] text-ink">
          <M tex={p.tex} />
        </div>
      </header>
      <p className="px-10 text-[20px] text-ink-soft">{p.stem}</p>

      <main className="mt-6 mb-8 grid min-h-0 flex-1 grid-cols-[1fr_400px] gap-6 px-10">
        <div className={`grid min-h-0 gap-6 overflow-y-auto ${examples.length === 3 ? "grid-cols-3" : "grid-cols-2"}`} data-examples>
          {examples.map((e) => {
            const marks = view === "marked" ? lineMarks(p.id, e.lines) : [];
            return (
              <section key={e.letter} className="flex flex-col rounded-3xl border border-line bg-paper p-7 shadow-card" data-example={e.letter}>
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-[44px] leading-none text-ink">{e.letter}</span>
                  <span className="text-[18px] text-ink-soft" data-count>
                    {e.count}/{e.denominator} students
                  </span>
                </div>
                <ol className="mt-6 space-y-3">
                  {e.lines.map((tex, i) => {
                    const mark = marks[i] ?? null;
                    return (
                      <li
                        key={i}
                        data-mark={mark ?? undefined}
                        className={`rounded-2xl border px-5 py-4 text-[26px] text-ink ${mark === "wrong" ? "border-wrong-line bg-wrong-soft" : mark === "standout" ? "border-standout-line bg-standout-soft" : "border-line bg-cream/50"}`}
                      >
                        <M tex={tex} />
                      </li>
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>
        <section className="flex min-h-0 flex-col rounded-3xl border border-line bg-paper shadow-card" data-teacher-mirror>
          <PadSection title={`${ASSIGNMENT.teacher}'s working`} strokes={teacherInk} onStrokesChange={() => undefined} onBurstEnd={() => undefined} onPenDown={() => undefined} onUndo={() => undefined} onClear={() => undefined} readOnly />
        </section>
      </main>
    </>
  );
}
