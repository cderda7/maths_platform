"use client";

import { createContext, useContext } from "react";
import Link from "next/link";
import { CLASSROOM_HREF, type AssignmentBundle } from "@/lib/assignments";

/**
 * The assignment a teacher page is about (ticket 185), live in every tab: the bundle for the id in
 * the route (`app/teacher/a/[id]/layout.tsx`), or Problem Set 2 for the live-lesson pages outside
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

/** "← Edexia Classroom", above the eyebrow on every assignment page. */
export function BackToClassroom() {
  return (
    <Link href={CLASSROOM_HREF} className="inline-block text-[13.5px] text-accent-deep hover:underline" data-back-to-classroom>
      ← Edexia Classroom
    </Link>
  );
}
