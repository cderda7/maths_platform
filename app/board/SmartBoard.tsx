"use client";

import Brand from "@/components/Brand";
import DiagnosticControl from "@/components/DiagnosticControl";
import DiagnosticResults from "@/components/DiagnosticResults";
import ExampleColumns from "@/components/ExampleColumns";
import M from "@/components/Math";
import PadSection from "@/components/PadSection";
import SlideInk from "@/components/SlideInk";
import { Eyebrow } from "@/components/ui";
import { ASSIGNMENT } from "@/data/assignment";
import type { Stroke } from "@/data/types";
import { boardContent, type BoardContent } from "@/lib/board";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { lineMarks } from "@/lib/examples";
import { ANCHOR } from "@/lib/markup";
import { useLiveSession, useNow } from "@/lib/store";
import { useBoardBeat } from "@/lib/boardPresence-store";
import { useClassAdvance } from "@/components/useClassAdvance";
import ClassStepControl from "@/components/ClassStepControl";
import WorkedLines from "@/components/WorkedLines";
import FullscreenButton from "./FullscreenButton";
import Leaderboard from "./Leaderboard";
import StemWords from "@/components/StemWords";

/**
 * The smartboard: opened once at the start of the lesson from the laptop's Present board (ticket 333) and left on the projector. Display
 * only, except in whole-class review, where the teacher stands at the board: the working pad
 * takes the pen there (mirrored to the students and to the laptop) and the one control at the top
 * right moves the class through the question's three steps (ticket 344). What it shows per stage is `boardContent`;
 * this file only draws it. Nothing here names a student or shows a difficulty. A live diagnostic
 * chain (ticket 241) takes the whole board from the push until done, with the teacher's one control.
 */
export default function SmartBoard() {
  const classroom = useClassroom();
  // Live, not batched: the room sees the board change the moment the class does.
  const session = useLiveSession();
  // The clock drives the other groups' scripted race; a tick a second is plenty for a bar that eases.
  const now = useNow();
  const content = boardContent(classroom, session, now);
  // The laptop's header reads "Board open" while this beats (ticket 333).
  useBoardBeat();
  return (
    <div className="flex h-screen min-h-0 flex-col bg-cream select-none" data-board data-board-state={content.kind}>
      {/* The same Edexia bar as the laptop and the iPad, so the projector reads as the same product (ticket 65). */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-paper/70 px-10 backdrop-blur" data-board-brand>
        <Brand />
        <FullscreenButton />
      </header>
      {content.kind === "diagnostic" ? <DiagnosticSlide content={content} /> : content.kind === "whole-class" ? <Slide content={content} /> : content.kind === "group" || content.kind === "holding" ? <Race content={content} /> : <Blank content={content} />}
    </div>
  );
}

/** Nothing student-specific: the class and the assignment, so a projector that is on doesn't read as broken. */
function Blank({ content }: { content: BoardContent }) {
  return (
    <div className="grid flex-1 place-items-center text-center">
      <div>
        <Eyebrow className="text-[15px] tracking-[0.18em] text-ink-muted/70">{content.className}</Eyebrow>
        {content.title && (
          <p className="mt-4 font-display text-[40px] leading-tight text-ink-muted/60" data-board-title>
            {content.title}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * A live diagnostic chain's current step (ticket 241): the question and its options, "1st of 3" on a longer chain and
 * "14/20 answered" in the header (a pulse while answers are still coming in), the right option green once the step is
 * revealed with each wrong option's "If you chose A, you…" (ticket 304), and the teacher's one control at the bottom right
 * (force submit, next question, done). Never a count per option, a name or the teacher's misconception.
 */
function DiagnosticSlide({ content }: { content: Extract<BoardContent, { kind: "diagnostic" }> }) {
  const { tally: t } = content;
  return (
    <>
      <header className="flex items-center justify-between px-10 py-6">
        <div className="flex items-baseline gap-5">
          <Eyebrow className="text-[13px] tracking-[0.16em]">{content.className}</Eyebrow>
          <span className="font-display text-[20px] text-ink-muted" data-board-title>
            {content.title}
          </span>
        </div>
        <span className="flex items-center gap-6 font-display text-[30px] leading-none text-ink">
          {content.position && (
            <span className="text-ink-muted" data-chain-position>
              {content.position}
            </span>
          )}
          <span className="flex items-center gap-3" data-board-answered={t.answered}>
            {!t.revealed && <span className="h-3 w-3 animate-pulse rounded-full bg-accent" aria-hidden />}
            <span>
              <span className="tabular-nums">
                {t.answered}/{t.total}
              </span>{" "}
              answered
            </span>
          </span>
        </span>
      </header>
      <main className="grid min-h-0 flex-1 place-items-center px-10">
        <DiagnosticResults question={content.question} tally={t} size="board" className="w-full max-w-[1100px]" />
      </main>
      <footer className="flex h-24 shrink-0 items-center justify-end px-10" data-board-chain-footer>
        <DiagnosticControl size="board" />
      </footer>
    </>
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
 * One projected question, at the step the class is on (ticket 344).
 *
 *  - `examples`: the statement, 2–3 anonymous examples, and the teacher's working. The pad is live: the teacher writes on
 *    the smartboard and every student's pad shows the same strokes (`wc/stroke`, the same action the laptop sends). The pen
 *    works anywhere else on the slide too (ticket 330): a mark over the problem or an example is pinned to the maths under
 *    it and shows over the same maths on the laptop and every student's screen. Undo and Clear act on the pad and the marks
 *    alike, as the pad's own do.
 *  - `worked`: Q* for this question, revealed a line at a time, the same lines on every iPad.
 *  - `turn`: Q** while the class writes it on their own iPads. The question, and nothing about who has how much done —
 *    the board has shown no count of students since ticket 202; the counts are the teacher's, on the laptop (ticket 320).
 *
 * The one control at the top right moves the class on: through the steps, then, with the five-second countdown in its
 * place, to the next question.
 */
function Slide({ content }: { content: Extract<BoardContent, { kind: "whole-class" }> }) {
  const { problem: p, examples, view, teacherInk, markup, inkCount, index, step, pair, reveal } = content;
  const pid = p.id;
  useClassAdvance();
  const addStroke = (next: Stroke[]) => dispatchClassroom({ type: "wc/stroke", problem: pid, stroke: next[next.length - 1] });
  const undo = () => dispatchClassroom({ type: "wc/ink-undo", problem: pid });
  const clear = () => dispatchClassroom({ type: "wc/ink-clear", problem: pid });
  // Each step shows its own question: the set's, then Q*, then Q**.
  const shown = step === "worked" && pair ? pair.worked : step === "turn" && pair ? pair.completion : p;
  const anchored = step === "examples";
  const head = (
    <>
      <header className="flex items-center justify-between px-10 py-6" data-slide={index} data-view={view} data-step={step}>
        <div className="flex min-w-0 items-center gap-5">
          <span className="shrink-0 font-display text-[34px] text-ink" data-ink-anchor={anchored ? ANCHOR.label : undefined}>
            {shown.label}
          </span>
          <span className="math-lg overflow-x-auto text-[30px] text-ink" data-ink-anchor={anchored ? ANCHOR.tex : undefined}>
            <M tex={shown.tex} />
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          {anchored && (
            <div className="flex items-center gap-1" data-board-ink-tools>
              <button type="button" onClick={undo} disabled={inkCount === 0} className="rounded-full px-4 py-2 text-[16px] text-ink-soft hover:text-ink disabled:opacity-30" data-board-undo>
                Undo
              </button>
              <button type="button" onClick={clear} disabled={inkCount === 0} className="rounded-full px-4 py-2 text-[16px] text-ink-soft hover:text-ink disabled:opacity-30" data-board-clear>
                Clear
              </button>
            </div>
          )}
          <ClassStepControl step={step} reveal={reveal} lines={pair?.worked.solution.length ?? 0} last={content.last} hasPair={!!pair} size="board" />
        </div>
      </header>
      <p className="px-10 text-[20px] text-ink-soft">
        <span data-ink-anchor={anchored ? ANCHOR.stem : undefined}>
          <StemWords stem={shown.stem} />
        </span>
      </p>
    </>
  );

  if (step === "examples")
    return (
      <SlideInk marks={markup} onMark={(mark) => dispatchClassroom({ type: "wc/stroke", problem: pid, stroke: mark })} className="flex min-h-0 flex-1 flex-col">
        {head}
        {/* The pad is 380 wide (its title and toolbar on one line) and the example cards fitted (ticket 161) so the widest line of any example stands on one line at the board's 1440 width. */}
        <main className="mt-6 mb-8 grid min-h-0 flex-1 grid-cols-[1fr_380px] gap-4 px-10">
          <ExampleColumns
            size="board"
            examples={examples.map((e) => {
              const marks = view === "marked" ? lineMarks(p.id, e.lines) : [];
              return {
                letter: e.letter,
                lines: e.lines.map((tex, i) => ({ tex, mark: marks[i] ?? null })),
              };
            })}
          />
          <section className="flex min-h-0 flex-col rounded-3xl border border-line bg-paper shadow-card" data-teacher-pad>
            <PadSection title={`${ASSIGNMENT.teacher}'s working`} strokes={teacherInk} onStrokesChange={addStroke} onBurstEnd={() => undefined} onPenDown={() => undefined} onUndo={undo} onClear={clear} inkCount={inkCount} />
          </section>
        </main>
      </SlideInk>
    );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {head}
      {step === "worked" && pair ? (
        // The lines open under the stem, on the page's own left edge, so the question and its working read as one column.
        <main className="mt-6 mb-8 min-h-0 flex-1 overflow-y-auto px-10" data-board-step={step}>
          <div className="w-full max-w-[900px]">
            <WorkedLines steps={pair.worked.solution} shown={reveal} size="board" />
          </div>
        </main>
      ) : (
        // The class is writing: the board holds one calm panel, centred, and says nothing about who has how much done.
        <main className="mt-6 mb-8 grid min-h-0 flex-1 place-items-center px-10" data-board-step={step}>
          {/* Wide enough that neither line wraps at the board's 1280 (its widest sentence is 43 characters of the display face at 34px). */}
          <div className="max-w-[920px] rounded-3xl border border-dashed border-line-strong px-12 py-12 text-center" data-board-turn>
            <p className="font-display text-[34px] leading-snug text-ink">Everyone writes this one on their own iPad.</p>
            <p className="mt-4 text-[22px] leading-snug text-ink-soft">Write the whole working. Each line is marked as you write it.</p>
          </div>
        </main>
      )}
    </div>
  );
}

