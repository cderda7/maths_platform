"use client";

import { homeworkSkip, type HomeworkSkipTarget } from "@/lib/demo";
import { getClassroom, setClassroom } from "@/lib/classroom-store";
import { getSnapshot, refreshBatchedSession, setLesson } from "@/lib/store";

/**
 * A homework jump (ticket 295) written through the stores, from either skip list. "send homework" moves only the classroom,
 * announced as the real Create's send is, so no student screen answers it as a lesson move (Sam stays where he is, and his
 * Classroom shows the Future panel live). "homework open" moves the lesson as one change, naming his Classroom as where his
 * iPad goes (`Lesson.land`), so it shows Homework 3 in To do rather than opening Problem Set 6.
 */
export function homeworkJump(t: HomeworkSkipTarget) {
  const { classroom, session } = homeworkSkip(t, getClassroom(), getSnapshot(), Date.now());
  if (t === "send homework") setClassroom(classroom);
  else setLesson({ classroom, session, land: "classroom" });
  refreshBatchedSession();
}
