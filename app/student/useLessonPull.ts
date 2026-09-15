"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LIVE_ASSIGNMENT_ID } from "@/lib/assignments";
import { subscribeLessonMoves } from "@/lib/store";
import { studentSetHref } from "@/lib/studentClassroom";

/**
 * The lesson reaching Sam on a screen outside the live set (tickets 264, 272; shared since 287 by his Classroom and his
 * report on a Completed set): when class review freezes the class, the iPad goes to the set, as every student screen
 * does; so does a presenter's jump from another tab that moves the lesson with a set out (the teacher's "students done"
 * and "activity completed"), landing where the jump put him. A jump that leaves nothing out ("send assignment", Reset
 * demo) leaves him where he is.
 */
export function useLessonPull(sent: boolean, frozen: boolean) {
  const router = useRouter();
  useEffect(() => {
    if (sent && frozen) router.replace(studentSetHref(LIVE_ASSIGNMENT_ID));
  }, [sent, frozen, router]);
  const opened = useRef(false);
  useEffect(
    () =>
      subscribeLessonMoves((l) => {
        // A jump that lands Sam on his Classroom ("homework open", ticket 295) opens no set: `StudentShell` takes him there.
        if (!l.classroom.assignment || l.land === "classroom" || opened.current) return;
        opened.current = true;
        router.push(studentSetHref(LIVE_ASSIGNMENT_ID));
      }),
    [router],
  );
}
