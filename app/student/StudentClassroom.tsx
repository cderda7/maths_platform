"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import StudentChrome from "./StudentChrome";
import { useLessonPull } from "./useLessonPull";
import CautionTriangle from "@/components/CautionTriangle";
import { Button, Eyebrow } from "@/components/ui";
import { ASSIGNMENT } from "@/data/assignment";
import { CLASS_SUBJECT } from "@/lib/classroomCards";
import { useClassroom } from "@/lib/classroom-store";
import { classHomeworks, futureHomeworks, homeworkColumn, type FutureHomework } from "@/lib/homeworks";
import { missedNote } from "@/lib/homeworkList";
import type { ClassroomState } from "@/lib/classroom";
import type { StudentSession } from "@/lib/session";
import { useNow, useStudentSession } from "@/lib/store";
import { STUDENT_SECTION_EMPTY, STUDENT_SECTION_LABEL, STUDENT_SECTIONS, studentClassroom, studentHomeworkHref, studentSetHref, type StudentSection, type StudentSetCard } from "@/lib/studentClassroom";

const noSubscribe = () => () => {};

/**
 * Sam's Classroom on the iPad (ticket 264), his landing: every set in his Classroom under To do, Missing and Completed
 * (`lib/studentClassroom`), each newest due first. A To do card's one action opens the set where his run is (its start
 * once sent); a press anywhere on a Completed card opens his read-only report on the set (ticket 287); Missing cards open
 * nothing. Beside Completed sits the homework column (ticket 290): each homework's cell spans the sets it covers. A homework
 * the teacher has sent waits greyed in the Future panel at the top right, not pressable (ticket 292), until the last lesson
 * among its sets ends; then it is the first card in To do and its cell opens it too.
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
      <div className="relative mx-auto flex max-w-[1066px] flex-col px-10 pt-8 pb-6" data-student-classroom>
        <Eyebrow>
          {ASSIGNMENT.classCode} · {CLASS_SUBJECT} · {ASSIGNMENT.teacher}
        </Eyebrow>
        <h1 className="font-display mt-1.5 text-[30px] leading-[1.1] text-ink">Edexia Classroom</h1>
        {client && future.length > 0 && <FuturePanel homeworks={future} />}
        {client && STUDENT_SECTIONS.map((s) => <Section key={s} section={s} cards={sections[s]} classroom={classroom} session={session} onOpen={(href) => router.push(href)} />)}
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

function Section({ section, cards, classroom, session, onOpen }: { section: StudentSection; cards: StudentSetCard[]; classroom: ClassroomState; session: StudentSession; onOpen: (href: string) => void }) {
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
          {section === "completed" && <HomeworkColumn cards={cards} classroom={classroom} session={session} onOpen={onOpen} />}
        </div>
      )}
    </section>
  );
}

/**
 * The homework column beside Completed (ticket 290, `homeworkColumn`): a homework's cell spans the rows of the sets it
 * covers; a set no homework covers yet keeps an empty space the column's width. Completed and missed cells are not pressable,
 * nor is a homework's cell while it waits in the Future panel; once it has opened the cell opens it, as its To do card does (ticket 292).
 */
function HomeworkColumn({ cards, classroom, session, onOpen }: { cards: StudentSetCard[]; classroom: ClassroomState; session: StudentSession; onOpen: (href: string) => void }) {
  return (
    <div className="contents" data-hw-column>
      {homeworkColumn(cards, classHomeworks(classroom)).map((p) => {
        const gridRow = `${p.row + 1} / span ${p.span}`;
        const rows = p.setIds.join(" ");
        if (p.kind === "empty") return <div key={`empty-${rows}`} className="col-start-2" style={{ gridRow }} data-hw-empty={rows} aria-hidden />;
        const shape = "col-start-2 flex flex-col justify-center rounded-2xl border px-4 py-2 select-none";
        if (p.status === "completed")
          return (
            <div key={p.id} className={`${shape} border-secure-line bg-secure-soft/70`} style={{ gridRow }} data-hw-cell={p.id} data-hw-status={p.status} data-hw-rows={rows}>
              <span className="flex items-center gap-2.5">
                <CompletedMark />
                <span className="whitespace-nowrap text-[15px] font-medium text-ink">HW{p.n} completed</span>
              </span>
            </div>
          );
        if (p.status === "missed") {
          // No note when every leftover was dropped as a duplicate (ticket 294): the triangle and the name alone.
          const note = missedNote(p, classroom, session);
          return (
            <div key={p.id} className={`${shape} border-line bg-paper/70`} style={{ gridRow }} data-hw-cell={p.id} data-hw-status={p.status} data-hw-rows={rows}>
              <span className="flex items-center gap-2.5">
                <CautionTriangle />
                <span className="text-[15px] font-medium text-ink">HW{p.n}</span>
              </span>
              {/* Balanced over two lines, so no word is left alone on the second; "current HW" once the next homework is open (ticket 292). */}
              {note && (
                <span className="mt-1.5 text-[12px] leading-[16px] text-balance text-ink-muted" data-hw-note>
                  {note}
                </span>
              )}
            </div>
          );
        }
        const label = (
          <span className={`whitespace-nowrap text-[14px] ${p.opened ? "text-ink" : "text-ink-muted"}`}>
            HW{p.n} · due {p.due}
          </span>
        );
        if (!p.opened)
          return (
            <div key={p.id} className={`${shape} border-line bg-paper/40`} style={{ gridRow }} data-hw-cell={p.id} data-hw-status={p.status} data-hw-opened="false" data-hw-rows={rows}>
              {label}
            </div>
          );
        // Open: the whole cell is one press target, lifting and settling as a Completed card does, to the homework's screen.
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onOpen(studentHomeworkHref(p.id))}
            aria-label={`${p.name}, open`}
            className={`${shape} items-start border-line bg-paper/70 text-left transition-[border-color,background-color,box-shadow] hover:border-line-strong hover:bg-paper hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:bg-cream-deep/60 active:shadow-none`}
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
  const shape = "flex h-14 items-center gap-6 rounded-2xl border px-6";
  const { href } = card;
  if (href)
    return (
      <li className="col-start-1" style={{ gridRow: row }} data-student-set={card.id} data-kind={card.kind} data-section={card.section}>
        <button
          type="button"
          onClick={() => onOpen(href)}
          aria-label={`${card.name}, your report`}
          className={`${shape} w-full border-line bg-paper/70 text-left transition-[border-color,background-color,box-shadow] hover:border-line-strong hover:bg-paper hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:bg-cream-deep/60 active:shadow-none`}
          data-open-report={card.id}
        >
          {body}
        </button>
      </li>
    );
  return (
    <li style={{ gridRow: row }} className={`col-start-1 ${shape} ${todo ? "border-accent-line bg-paper shadow-card" : "border-line bg-paper/70"}`} data-student-set={card.id} data-kind={card.kind} data-section={card.section}>
      {body}
      {card.action && (
        <Button variant="accent" hit className="uppercase tracking-[0.08em]" onClick={() => onOpen(card.kind === "homework" ? studentHomeworkHref(card.id) : studentSetHref(card.id))} {...(card.kind === "homework" ? { "data-open-homework": card.id } : { "data-open-set": card.id })}>
          {card.action}
        </Button>
      )}
    </li>
  );
}
