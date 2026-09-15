"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import StudentChrome from "./StudentChrome";
import { useLessonPull } from "./useLessonPull";
import CautionTriangle from "@/components/CautionTriangle";
import { Button, Eyebrow } from "@/components/ui";
import { ASSIGNMENT } from "@/data/assignment";
import { CLASS_SUBJECT } from "@/lib/classroomCards";
import { useClassroom } from "@/lib/classroom-store";
import { classHomeworks, futureHomeworks, homeworkColumn, type FutureHomework } from "@/lib/homeworks";
import { flasher, HW_INSIGHT_MESSAGE, studentCellShowsInsight } from "@/lib/hwInsight";
import type { ClassroomState } from "@/lib/classroom";
import { useNow, useStudentSession } from "@/lib/store";
import { STUDENT_SECTION_EMPTY, STUDENT_SECTION_LABEL, STUDENT_SECTIONS, studentClassroom, studentHomeworkHref, studentSetHref, type StudentSection, type StudentSetCard } from "@/lib/studentClassroom";

const noSubscribe = () => () => {};

/**
 * Sam's Classroom on the iPad (ticket 264), his landing: every set in his Classroom under To do, Missing and Completed
 * (`lib/studentClassroom`), each newest due first. A To do card's one action opens the set where his run is (its start
 * once sent); a press anywhere on a Completed card opens his read-only report on the set (ticket 287); Missing cards open
 * nothing. Beside Completed sits the homework column (ticket 290): each homework's cell spans the sets it covers. A homework
 * the teacher has sent waits greyed in the Future panel at the top right, not pressable (ticket 292), until the last lesson
 * among its sets ends; then it is the first card in To do and its cell opens it too. Every other cell (completed, missed, still in
 * the Future) shows the demo's "HW insight scoped in FUTURE_FEATURES" placeholder over itself for a moment when pressed (ticket 326).
 * Live in every tab: the teacher's Create puts Problem Set 6 in
 * To do without a reload. When class review freezes the class, the iPad goes to the set, as every student screen does; so
 * does a presenter's jump from another tab that moves the lesson with a set out (the teacher's "students done" and
 * "activity completed", ticket 272), landing where the jump put Sam (`useLessonPull`). A jump that leaves nothing out
 * ("send assignment", Reset demo) leaves him here.
 * No difficulty tags: this is the student's side.
 */
export default function StudentClassroom() {
  const router = useRouter();
  const classroom = useClassroom();
  const session = useStudentSession("overview", false);
  const now = useNow();
  // The stores are the browser's: until the client has read them the sections would be a fresh demo's, so they wait.
  const client = useSyncExternalStore(noSubscribe, () => true, () => false);
  const sections = studentClassroom(classroom, session, now);
  const future = futureHomeworks(classroom);
  useLessonPull(!!classroom.assignment, session.stage === "frozen");
  return (
    <StudentChrome>
      {/* The bottom padding lets the last Completed card and its homework cell scroll clear of the presenter's SKIP TO, as the homework screen's does. */}
      <div className="relative mx-auto flex max-w-[1066px] flex-col px-10 pt-8 pb-20" data-student-classroom>
        <Eyebrow>
          {ASSIGNMENT.classCode} · {CLASS_SUBJECT} · {ASSIGNMENT.teacher}
        </Eyebrow>
        <h1 className="font-display mt-1.5 text-[30px] leading-[1.1] text-ink">Edexia Classroom</h1>
        {client && future.length > 0 && <FuturePanel homeworks={future} />}
        {client && STUDENT_SECTIONS.map((s) => <Section key={s} section={s} cards={sections[s]} classroom={classroom} onOpen={(href) => router.push(href)} />)}
      </div>
    </StudentChrome>
  );
}

/**
 * The Future panel (ticket 292): every homework sent and not yet open, greyed behind a dashed line, so it reads as off his list.
 * Top right, level with the eyebrow and the title, over the homework column's width, out of the flow: nothing below it moves,
 * and it ends beside To do's first row, where that column is empty. Nothing in it is pressable. Hidden when nothing is scheduled.
 */
function FuturePanel({ homeworks }: { homeworks: FutureHomework[] }) {
  return (
    <aside aria-label="Future" className="absolute top-8 right-10 w-[190px] rounded-2xl border border-dashed border-line-strong px-4 pt-3 pb-3.5 select-none" data-future-panel>
      <Eyebrow>Future</Eyebrow>
      {homeworks.map((h) => (
        <div key={h.id} className="mt-2 flex flex-col" data-future-homework={h.id}>
          <span className="font-display text-[17px] leading-[22px] text-ink-muted">{h.name}</span>
          <span className="text-[13px] leading-[18px] text-ink-muted" data-due>
            due {h.due}
          </span>
          {h.opensAfter && (
            <span className="mt-1 text-[12px] leading-[16px] text-ink-muted/80" data-opens-after>
              opens after {h.opensAfter}
            </span>
          )}
        </div>
      ))}
    </aside>
  );
}

function Section({ section, cards, classroom, onOpen }: { section: StudentSection; cards: StudentSetCard[]; classroom: ClassroomState; onOpen: (href: string) => void }) {
  return (
    <section className="mt-7" aria-label={STUDENT_SECTION_LABEL[section]} data-student-section={section}>
      <Eyebrow>{STUDENT_SECTION_LABEL[section]}</Eyebrow>
      {cards.length === 0 ? (
        <p className="mt-2 text-[14px] leading-[22px] text-ink-muted" data-empty>
          {STUDENT_SECTION_EMPTY[section]}
        </p>
      ) : (
        // Every section's cards sit in the grid's first column, so they are one width down the page; only Completed fills
        // the second, the homework column (ticket 290), each cell running from its first covered card's top to its last's bottom.
        <div className="mt-2.5 grid grid-cols-[minmax(0,1fr)_190px] gap-x-4 gap-y-2" data-card-grid>
          <ul className="contents">
            {cards.map((card, i) => (
              <SetCard key={`${card.kind}-${card.id}`} card={card} row={i + 1} onOpen={onOpen} />
            ))}
          </ul>
          {section === "completed" && <HomeworkColumn cards={cards} classroom={classroom} onOpen={onOpen} />}
        </div>
      )}
    </section>
  );
}

/**
 * The homework column beside Completed (ticket 290, `homeworkColumn`): a homework's cell spans the rows of the sets it
 * covers; a set no homework covers yet keeps an empty space the column's width. Once a homework has opened its cell opens it,
 * as its To do card does (ticket 292).
 * Every other cell, completed, missed, or waiting in the Future panel, is a button that goes nowhere (ticket 326, the teacher's
 * ticket 324 placeholder on Sam's side): a press lays "HW insight scoped in FUTURE_FEATURES" over the cell, white on dark grey,
 * for `HW_INSIGHT_MS`, one cell at a time. The message is an overlay in the cell's own box, so nothing moves; a polite live
 * region beside the cells announces it.
 */
function HomeworkColumn({ cards, classroom, onOpen }: { cards: StudentSetCard[]; classroom: ClassroomState; onOpen: (href: string) => void }) {
  const [shown, setShown] = useState<string | null>(null);
  // Lazy state: one flasher for the column's life; its timer is set from the press and cleared on unmount.
  const [flash] = useState(() => flasher<string>(setShown));
  useEffect(() => () => flash.dispose(), [flash]);
  const pieces = homeworkColumn(cards, classHomeworks(classroom));
  // A cell that opened while its message showed goes to the homework screen and never carries the message.
  const live = pieces.some((p) => p.kind === "homework" && p.id === shown && studentCellShowsInsight(p));
  return (
    <div className="contents" data-hw-column>
      {pieces.map((p) => {
        const gridRow = `${p.row + 1} / span ${p.span}`;
        const rows = p.setIds.join(" ");
        if (p.kind === "empty") return <div key={`empty-${rows}`} className="col-start-2" style={{ gridRow }} data-hw-empty={rows} aria-hidden />;
        // The line is the homework cell border tokens, an outline (ticket 321); a state colours it, a focus ring shows the 1px border under it.
        const shape = "col-start-2 flex flex-col justify-center rounded-2xl hw-card-edge px-4 py-2 select-none";
        // Its due date, then the day it was handed in when it was (ticket 307); a missed homework never handed in shows the due date alone.
        const dates = (
          <span className="mt-1.5 flex flex-col text-[12.5px] leading-[17px] whitespace-nowrap text-ink-muted" data-hw-dates>
            <span data-hw-due>due {p.due}</span>
            {p.submitted && <span data-hw-submitted>submitted {p.submitted}</span>}
          </span>
        );
        // A cell that goes nowhere (ticket 326): its state's ground and line at rest (a focus ring shows the 1px border under
        // it in the line's own colour), all of it ink-soft while the message shows.
        const insightCell = (rest: { ground: string; line: string; border: string }, body: ReactNode) => {
          const insight = shown === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => flash.press(p.id)}
              className={`${shape} relative text-left transition-[outline-color,background-color,box-shadow] hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:shadow-none ${insight ? "bg-ink-soft outline-ink-soft focus-visible:border-ink-soft" : `${rest.ground} ${rest.line} ${rest.border}`}`}
              style={{ gridRow }}
              data-hw-cell={p.id}
              data-hw-status={p.status}
              data-hw-opened={p.status === "open" ? "false" : undefined}
              data-hw-rows={rows}
              data-hw-insight={insight || undefined}
            >
              {body}
              {/* The tile's own line and ground turn ink-soft too, so the whole tile is dark grey with no sliver of line at its edge. */}
              <span
                aria-hidden
                className={`pointer-events-none absolute inset-0 grid place-items-center rounded-2xl px-3 text-center text-[15px] leading-[21px] font-medium ${insight ? "bg-ink-soft text-white" : "opacity-0"}`}
                data-hw-insight-message
              >
                {insight ? HW_INSIGHT_MESSAGE : ""}
              </span>
            </button>
          );
        };
        if (p.status === "completed")
          return insightCell(
            { ground: "bg-secure-soft/70", line: "outline-secure-line", border: "focus-visible:border-secure-line" },
            <>
              <span className="flex items-center gap-2.5">
                <CompletedMark />
                <span className="whitespace-nowrap text-[15px] font-medium text-ink">HW{p.n} completed</span>
              </span>
              {dates}
            </>,
          );
        if (p.status === "missed")
          return insightCell(
            { ground: "bg-paper/70", line: "outline-wrong-deep", border: "focus-visible:border-wrong-deep" },
            <>
              <span className="flex items-center gap-2.5">
                <CautionTriangle />
                <span className="whitespace-nowrap text-[15px] font-medium text-ink">HW{p.n} missing</span>
              </span>
              {dates}
            </>,
          );
        const label = (
          <span className={`whitespace-nowrap text-[14px] ${p.opened ? "text-ink" : "text-ink-muted"}`}>
            HW{p.n} · due {p.due}
          </span>
        );
        if (!p.opened) return insightCell({ ground: "bg-paper/40", line: "outline-hw-border", border: "focus-visible:border-hw-border" }, label);
        // Open: the whole cell is one press target, lifting and settling as a Completed card does, to the homework's screen.
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onOpen(studentHomeworkHref(p.id))}
            aria-label={`${p.name}, open`}
            className={`${shape} items-start bg-paper/70 text-left outline-hw-border transition-[outline-color,background-color,box-shadow] hover:bg-paper hover:shadow-card hover:outline-line-strong focus-visible:border-hw-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:bg-cream-deep/60 active:shadow-none`}
            style={{ gridRow }}
            data-hw-cell={p.id}
            data-hw-status={p.status}
            data-hw-opened="true"
            data-hw-rows={rows}
          >
            {label}
          </button>
        );
      })}
      {/* The announcement: a button's children are presentational to assistive tech, so the live region sits beside the cells, absolutely positioned (sr-only) so it takes no grid cell. */}
      <span role="status" aria-live="polite" className="sr-only" data-hw-insight-live>
        {live ? HW_INSIGHT_MESSAGE : ""}
      </span>
    </div>
  );
}

/** A green check in a round, the caution triangle's size, so both cells' words start at one x. */
function CompletedMark() {
  return (
    <svg viewBox="0 0 24 22" className="h-[26px] w-[28px]" aria-hidden data-hw-check>
      <circle cx="12" cy="11" r="10.2" fill="var(--color-secure)" />
      <path d="M7.4 11.3l3.1 3.1 6.1-6.3" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * One set: its name, its due date, and on a To do card the one action. A Completed card is one press target (ticket 287),
 * the whole card, with no button of its own: it lifts on hover and settles on press, and opens his report on the set.
 */
function SetCard({ card, row, onOpen }: { card: StudentSetCard; /** Its row in the section's grid, first column. */ row: number; onOpen: (href: string) => void }) {
  const todo = card.section === "todo";
  const body = (
    <>
      <span className="min-w-0 flex-1 truncate font-display text-[19px] leading-tight text-ink" data-set-name>
        {card.name}
      </span>
      <span className="shrink-0 whitespace-nowrap text-[13.5px] text-ink-muted" data-due>
        due {card.due}
      </span>
    </>
  );
  // The line is the problem set card border tokens, an outline (ticket 321); a To do card colours it accent, a focus ring shows the 1px border under it.
  const shape = "flex h-14 items-center gap-6 rounded-2xl set-card-edge px-6";
  const { href } = card;
  if (href)
    return (
      <li className="col-start-1" style={{ gridRow: row }} data-student-set={card.id} data-kind={card.kind} data-section={card.section}>
        <button
          type="button"
          onClick={() => onOpen(href)}
          aria-label={`${card.name}, your report`}
          className={`${shape} w-full bg-paper/70 text-left outline-set-border transition-[outline-color,background-color,box-shadow] hover:bg-paper hover:shadow-card hover:outline-line-strong focus-visible:border-set-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:bg-cream-deep/60 active:shadow-none`}
          data-open-report={card.id}
        >
          {body}
        </button>
      </li>
    );
  return (
    <li style={{ gridRow: row }} className={`col-start-1 ${shape} ${todo ? "bg-paper shadow-card outline-accent-line" : "bg-paper/70 outline-set-border"}`} data-student-set={card.id} data-kind={card.kind} data-section={card.section}>
      {body}
      {card.action && (
        <Button variant="accent" hit className="uppercase tracking-[0.08em]" onClick={() => onOpen(card.kind === "homework" ? studentHomeworkHref(card.id) : studentSetHref(card.id))} {...(card.kind === "homework" ? { "data-open-homework": card.id } : { "data-open-set": card.id })}>
          {card.action}
        </Button>
      )}
    </li>
  );
}
