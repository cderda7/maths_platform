"use client";

import Brand from "@/components/Brand";
import M from "@/components/Math";
import PadSection from "@/components/PadSection";
import { Eyebrow } from "@/components/ui";
import { ASSIGNMENT } from "@/data/assignment";
import type { Stroke } from "@/data/types";
import { boardContent, type BoardContent } from "@/lib/board";
import { FOLLOW_MODE_WORD, type FollowMode } from "@/lib/classroom";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { lineMarks } from "@/lib/examples";
import { useLiveSession, useNow } from "@/lib/store";
import Leaderboard from "./Leaderboard";

/**
 * The smartboard: opened once at the start of the lesson and left on the projector. Display
 * only, except in whole-class review, where the teacher stands at the board: the working pad
 * takes the pen there (mirrored to frozen students and to the laptop) and a toggle switches the
 * students' screens between frozen and write with me. What it shows per stage is `boardContent`;
 * this file only draws it. Nothing here names a student or shows a difficulty.
 */
export default function SmartBoard() {
  const classroom = useClassroom();
  // Live, not batched: the room sees the board change the moment the class does.
  const session = useLiveSession();
  // The clock drives the other groups' scripted race; a tick a second is plenty for a bar that eases.
  const now = useNow();
  const content = boardContent(classroom, session, now);
  return (
    <div className="flex h-screen min-h-0 flex-col bg-cream select-none" data-board data-board-state={content.kind}>
      {/* The same Edexia bar as the laptop and the iPad, so the projector reads as the same product (ticket 65). */}
      <header className="flex h-14 shrink-0 items-center border-b border-line bg-paper/70 px-10 backdrop-blur" data-board-brand>
        <Brand />
      </header>
      {content.kind === "whole-class" ? <Slide content={content} /> : content.kind === "group" || content.kind === "holding" ? <Race content={content} /> : <Blank content={content} />}
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

/** Group review: the race while it runs, the final standings held once it is over until the teacher moves the class on. */
function Race({ content }: { content: Extract<BoardContent, { kind: "group" | "holding" }> }) {
  const live = content.kind === "group";
  return (
    <>
      <header className="flex items-center justify-between px-10 py-6">
        <div className="flex items-baseline gap-5">
          <Eyebrow className="text-[13px] tracking-[0.16em]">{content.className}</Eyebrow>
          <span className="font-display text-[20px] text-ink-muted" data-board-title>
            {content.title}
          </span>
        </div>
        <span className="flex items-center gap-3 font-display text-[30px] leading-none text-ink" data-board-holding={live ? undefined : true}>
          {live && <span className="h-3 w-3 animate-pulse rounded-full bg-accent" aria-hidden />}
          Group review
        </span>
      </header>
      <Leaderboard standings={content.standings} live={live} />
    </>
  );
}

/**
 * One projected problem: the statement, 2–3 anonymous examples, and the teacher's working. The
 * pad is live: the teacher writes on the smartboard and every frozen student's pad shows the same
 * strokes (`wc/stroke`, the same action the laptop sends). The toggle in the header sets the
 * students' mode for this problem.
 */
function Slide({ content }: { content: Extract<BoardContent, { kind: "whole-class" }> }) {
  const { problem: p, examples, view, teacherInk, mode, index } = content;
  const pid = p.id;
  const addStroke = (next: Stroke[]) => dispatchClassroom({ type: "wc/stroke", problem: pid, stroke: next[next.length - 1] });
  return (
    <>
      <header className="flex items-center justify-between px-10 py-6" data-slide={index} data-view={view}>
        <div className="flex items-center gap-5">
          <span className="font-display text-[34px] text-ink">{p.label}</span>
          <span className="math-lg text-[30px] text-ink">
            <M tex={p.tex} />
          </span>
        </div>
        <div className="flex items-center rounded-full border border-line bg-paper p-1" role="group" aria-label="Student screens" data-mode-toggle>
          {(["frozen", "write-with-me"] as FollowMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => dispatchClassroom({ type: "wc/mode", problem: pid, mode: m })}
              aria-pressed={mode === m}
              data-mode={m}
              className={`rounded-full px-5 py-2 text-[16px] transition-colors ${mode === m ? "bg-ink text-white" : "text-ink-soft hover:text-ink"}`}
            >
              {FOLLOW_MODE_WORD[m]}
            </button>
          ))}
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
        <section className="flex min-h-0 flex-col rounded-3xl border border-line bg-paper shadow-card" data-teacher-pad data-mode={mode}>
          <PadSection title={`${ASSIGNMENT.teacher}'s working`} strokes={teacherInk} onStrokesChange={addStroke} onBurstEnd={() => undefined} onPenDown={() => undefined} onUndo={() => dispatchClassroom({ type: "wc/ink-undo", problem: pid })} onClear={() => dispatchClassroom({ type: "wc/ink-clear", problem: pid })} />
        </section>
      </main>
    </>
  );
}
