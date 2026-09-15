"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import StudentChrome from "./StudentChrome";
import { Button } from "@/components/ui";
import { useEscape } from "@/components/useEscape";
import { useClassroom } from "@/lib/classroom-store";
import { openHomeworksFor } from "@/lib/homeworks";
import { STUDENT_CLASSROOM_HREF } from "@/lib/studentClassroom";

const noSubscribe = () => () => {};

/**
 * Sam's homework screen (ticket 292): where the open Homework card's OPEN and its HW cell go. For now its heading and the way
 * back ("← Classroom", or Escape); ticket 293 lists his own problems and the teacher's ten under it. A homework that is not open
 * for him (still in the Future panel, past its due date, a stale link, Reset demo in another tab) is his Classroom, live.
 * No difficulty tags: this is the student's side.
 */
export default function HomeworkScreen({ id }: { id: string }) {
  const router = useRouter();
  const classroom = useClassroom();
  // The store is the browser's: until the client has read it every homework would read as not open, so it waits.
  const client = useSyncExternalStore(noSubscribe, () => true, () => false);
  const homework = client ? (openHomeworksFor(classroom).find((h) => h.id === id) ?? null) : null;
  const missing = client && !homework;
  useEffect(() => {
    if (missing) router.replace(STUDENT_CLASSROOM_HREF);
  }, [missing, router]);
  const back = () => router.push(STUDENT_CLASSROOM_HREF);
  useEscape(!!homework, back);

  return (
    <StudentChrome crumb={homework?.name}>
      {homework && (
        <div className="mx-auto flex max-w-[1066px] flex-col px-10 pt-8 pb-6" data-homework-screen={id}>
          <div className="flex items-center justify-between gap-6">
            <h1 className="font-display text-[30px] leading-[1.1] text-ink" data-homework-heading>
              {homework.name} · due {homework.due}
            </h1>
            <Button variant="secondary" className="whitespace-nowrap" onClick={back} data-homework-back>
              ← Classroom
            </Button>
          </div>
        </div>
      )}
    </StudentChrome>
  );
}
