"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import StudentChrome from "./StudentChrome";
import ProblemQuestion from "@/components/ProblemQuestion";
import { Button, Eyebrow } from "@/components/ui";
import { useEscape } from "@/components/useEscape";
import { useClassroom } from "@/lib/classroom-store";
import { homeworkList, type HomeworkItem } from "@/lib/homeworkList";
import { useStudentSession } from "@/lib/store";
import { STUDENT_CLASSROOM_HREF } from "@/lib/studentClassroom";

const noSubscribe = () => () => {};

/**
 * Sam's homework screen (tickets 292, 293): where the open Homework card's OPEN and its HW cell go. Under the heading and the way
 * back ("← Classroom", or Escape), the homework as a read-only list (`homeworkList`): **From your mistakes**, every problem he
 * ever got wrong on the sets it covers (and a missed homework's leftovers not already covered by skill, ticket 294) as its similar
 * problem, grouped under each set's name, newest set first; then
 * **Everyone**, the teacher's ten. Each question is the whole question (stem, then expression, a figure as a small thumbnail),
 * numbered in the order he does them. Nothing to press but the way back: no answering, no done marks yet.
 * A homework that is not open for him (still in the Future panel, past its due date, a stale link, Reset demo in another tab)
 * is his Classroom, live. No difficulty tags: this is the student's side.
 */
export default function HomeworkScreen({ id }: { id: string }) {
  const router = useRouter();
  const classroom = useClassroom();
  const session = useStudentSession("overview", false);
  // The stores are the browser's: until the client has read them every homework would read as not open, so it waits.
  const client = useSyncExternalStore(noSubscribe, () => true, () => false);
  const list = client ? homeworkList(id, classroom, session) : null;
  const missing = client && !list;
  useEffect(() => {
    if (missing) router.replace(STUDENT_CLASSROOM_HREF);
  }, [missing, router]);
  const back = () => router.push(STUDENT_CLASSROOM_HREF);
  useEscape(!!list, back);

  // The bottom padding lets the list's last row scroll clear of the presenter's SKIP TO, fixed over the iPad's lower edge.
  return (
    <StudentChrome crumb={list?.name}>
      {list && (
        <div className="mx-auto flex max-w-[1066px] flex-col px-10 pt-8 pb-20" data-homework-screen={id}>
          <div className="flex items-center justify-between gap-6">
            <h1 className="font-display text-[30px] leading-[1.1] text-ink" data-homework-heading>
              {list.name} · due {list.due}
            </h1>
            <Button variant="secondary" className="whitespace-nowrap" onClick={back} data-homework-back>
              ← Classroom
            </Button>
          </div>

          <section className="mt-7" aria-label="From your mistakes" data-homework-section="own">
            <Eyebrow>From your mistakes</Eyebrow>
            {list.own.length === 0 ? (
              <p className="mt-2 text-[14px] leading-[22px] text-ink-muted" data-empty>
                Nothing from your mistakes this week.
              </p>
            ) : (
              list.own.map((g) => (
                <div key={g.setId} className="mt-3.5" data-homework-group={g.setId}>
                  <h2 className="font-display text-[19px] leading-tight text-ink" data-group-name>
                    {g.name}
                  </h2>
                  <QuestionList items={g.items} />
                </div>
              ))
            )}
          </section>

          <section className="mt-9" aria-label="Everyone" data-homework-section="everyone">
            <Eyebrow>Everyone</Eyebrow>
            <QuestionList items={list.everyone} />
          </section>
        </div>
      )}
    </StudentChrome>
  );
}

/** A card of questions, one row each: its number, then the whole question wrapping between words, its maths never split. */
function QuestionList({ items }: { items: HomeworkItem[] }) {
  return (
    <ol className="mt-2.5 rounded-2xl border border-line bg-paper shadow-card" data-homework-list>
      {items.map((item) => (
        <li key={item.key} className="flex items-baseline gap-5 border-t border-line px-6 py-3.5 first:border-t-0" data-homework-item={item.key} data-n={item.n}>
          <span className="w-6 shrink-0 text-right text-[14px] leading-[26px] text-ink-muted tabular-nums" data-item-n>
            {item.n}
          </span>
          <p className="min-w-0 flex-1 text-[15px] leading-[26px]" data-item-question>
            <ProblemQuestion problem={item} mathClass="text-ink" figureWidth={72} />
          </p>
        </li>
      ))}
    </ol>
  );
}
