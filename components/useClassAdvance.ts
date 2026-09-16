"use client";

import { useEffect } from "react";
import { isDue } from "@/lib/classroom";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { useNow } from "@/lib/store";

/**
 * The five-second countdown between class review's questions (ticket 344), applied where it is seen. Every surface that
 * shows the countdown calls this — the board, the teacher's controls, every iPad — and whichever tab's clock reaches the
 * deadline first moves the class on; the reducer records the advance's id on the session, so the others change nothing.
 * That way the class still moves with the board alone on the projector, or with the laptop alone in the teacher's hand.
 */
export function useClassAdvance() {
  const classroom = useClassroom();
  const now = useNow();
  const advance = classroom.advance;
  const due = advance?.kind === "class-review-next" && isDue(classroom, now) && classroom.wholeClass?.movedBy !== advance.id;
  useEffect(() => {
    if (due && advance) dispatchClassroom({ type: "wc/advance", id: advance.id });
  }, [due, advance]);
}
