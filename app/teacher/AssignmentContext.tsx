"use client";

import { createContext, useContext } from "react";
import Link from "next/link";
import { CLASSROOM_HREF, type AssignmentBundle } from "@/lib/assignments";

/**
 * The assignment a teacher page is about (ticket 185), live in every tab: the bundle for the id in
 * the route (`app/teacher/a/[id]/layout.tsx`), or Problem Set 6 for the live-lesson pages outside
 * it (report, compare, class review setup, board). A page without a provider is a Classroom page
 * (the Classroom, the class's default groups, Create). The provider is `AssignmentProvider.tsx`.
 */
export const AssignmentContext = createContext<AssignmentBundle | null>(null);

/** The page's assignment. Only under an `AssignmentProvider`. */
export function useAssignmentBundle(): AssignmentBundle {
  const b = useContext(AssignmentContext);
  if (!b) throw new Error("useAssignmentBundle outside an AssignmentProvider");
  return b;
}

/** The page's assignment, or null on a Classroom page. */
export const useOptionalAssignment = (): AssignmentBundle | null => useContext(AssignmentContext);

/** "← Edexia Classroom", above the eyebrow on every assignment page: white on a dark purple box (ticket 200), so the way back reads as a button. */
export function BackToClassroom() {
  return (
    <Link
      href={CLASSROOM_HREF}
      className="mb-1 inline-flex items-center rounded-md bg-accent-dark px-3 py-1.5 text-[13.5px] font-medium text-white transition-colors hover:bg-accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      data-back-to-classroom
    >
      ← Edexia Classroom
    </Link>
  );
}
