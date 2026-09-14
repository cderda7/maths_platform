"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import StudentChrome from "./StudentChrome";
import { Button, Eyebrow } from "@/components/ui";
import { ASSIGNMENT } from "@/data/assignment";
import { CLASS_SUBJECT } from "@/lib/classroomCards";
import { useClassroom } from "@/lib/classroom-store";
import { LIVE_ASSIGNMENT_ID } from "@/lib/assignments";
import { subscribeLessonMoves, useNow, useStudentSession } from "@/lib/store";
import { STUDENT_SECTION_EMPTY, STUDENT_SECTION_LABEL, STUDENT_SECTIONS, studentClassroom, studentSetHref, type StudentSection, type StudentSetCard } from "@/lib/studentClassroom";

const noSubscribe = () => () => {};

/**
 * Sam's Classroom on the iPad (ticket 264), his landing: every set in his Classroom under To do, Missing and Completed
 * (`lib/studentClassroom`), each newest due first. A To do card's one action opens the set where his run is (its start
 * once sent); Missing and Completed cards open nothing. Live in every tab: the teacher's Create puts Problem Set 6 in
 * To do without a reload. When class review freezes the class, the iPad goes to the set, as every student screen does; so
 * does a presenter's jump from another tab that moves the lesson with a set out (the teacher's "students done" and
 * "activity completed", ticket 272), landing where the jump put Sam. A jump that leaves nothing out ("send assignment",
 * Reset demo) leaves him here.
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
  const sent = !!classroom.assignment;
  const frozen = session.stage === "frozen";
  useEffect(() => {
    if (sent && frozen) router.replace(studentSetHref(LIVE_ASSIGNMENT_ID));
  }, [sent, frozen, router]);
  const opened = useRef(false);
  useEffect(
    () =>
      subscribeLessonMoves((l) => {
        if (!l.classroom.assignment || opened.current) return;
        opened.current = true;
        router.push(studentSetHref(LIVE_ASSIGNMENT_ID));
      }),
    [router],
  );
  return (
    <StudentChrome>
      <div className="mx-auto flex max-w-[860px] flex-col px-10 pt-8 pb-6" data-student-classroom>
        <Eyebrow>
          {ASSIGNMENT.classCode} · {CLASS_SUBJECT} · {ASSIGNMENT.teacher}
        </Eyebrow>
        <h1 className="font-display mt-1.5 text-[30px] leading-[1.1] text-ink">Edexia Classroom</h1>
        {client && STUDENT_SECTIONS.map((s) => <Section key={s} section={s} cards={sections[s]} onOpen={(id) => router.push(studentSetHref(id))} />)}
      </div>
    </StudentChrome>
  );
}

function Section({ section, cards, onOpen }: { section: StudentSection; cards: StudentSetCard[]; onOpen: (id: string) => void }) {
  return (
    <section className="mt-7" aria-label={STUDENT_SECTION_LABEL[section]} data-student-section={section}>
      <Eyebrow>{STUDENT_SECTION_LABEL[section]}</Eyebrow>
      {cards.length === 0 ? (
        <p className="mt-2 text-[14px] leading-[22px] text-ink-muted" data-empty>
          {STUDENT_SECTION_EMPTY[section]}
        </p>
      ) : (
        <ul className="mt-2.5 space-y-2">
          {cards.map((card) => (
            <SetCard key={card.id} card={card} onOpen={onOpen} />
          ))}
        </ul>
      )}
    </section>
  );
}

/** One set: its name, its due date, and on a To do card the one action. */
function SetCard({ card, onOpen }: { card: StudentSetCard; onOpen: (id: string) => void }) {
  const todo = card.section === "todo";
  return (
    <li
      className={`flex h-14 items-center gap-6 rounded-2xl border px-6 ${todo ? "border-accent-line bg-paper shadow-card" : "border-line bg-paper/70"}`}
      data-student-set={card.id}
      data-section={card.section}
    >
      <span className="min-w-0 flex-1 truncate font-display text-[19px] leading-tight text-ink" data-set-name>
        {card.name}
      </span>
      <span className="shrink-0 whitespace-nowrap text-[13.5px] text-ink-muted" data-due>
        due {card.due}
      </span>
      {card.action && (
        <Button variant="accent" hit className="uppercase tracking-[0.08em]" onClick={() => onOpen(card.id)} data-open-set={card.id}>
          {card.action}
        </Button>
      )}
    </li>
  );
}
