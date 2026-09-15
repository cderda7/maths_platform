"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { subscribeLessonMoves } from "@/lib/store";
import { STUDENT_CLASSROOM_HREF } from "@/lib/studentClassroom";

/**
 * A presenter's jump from another tab that names Sam's Classroom as where his iPad goes (`Lesson.land`, ticket 295: "homework
 * open") takes him there from any student screen, the live set or a Completed report included. Mounted by `StudentShell`, so
 * it listens whichever screen is open. The move can arrive twice (channel and storage event), so it replaces rather than
 * pushes: a second delivery changes nothing.
 */
export function useLessonLanding() {
  const router = useRouter();
  useEffect(
    () =>
      subscribeLessonMoves((l) => {
        if (l.land === "classroom" && window.location.pathname !== STUDENT_CLASSROOM_HREF) router.replace(STUDENT_CLASSROOM_HREF);
      }),
    [router],
  );
}
