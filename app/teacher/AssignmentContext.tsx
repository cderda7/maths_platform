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

/**
 * The way back's left margin (ticket 267): 21.6 screen px from the window's left edge (the report's page padding, 24 px at
 * its 0.9 zoom), whatever column the page centres. In the button's own px (each length renders × its zoom, `100vw`
 * included): the target, less where `TeacherChrome`'s column starts on screen (half of what the window has beyond its
 * `max-w-[1640px]`, plus its `px-6`, both at `--frame-zoom`), over the button's own zoom (`--back-zoom`).
 */
const BACK_LEFT = "calc((21.6px - max(0px, (100vw - 1640px * var(--frame-zoom)) / 2) - 24px * var(--frame-zoom)) / var(--back-zoom))";

/**
 * The way back above a teacher page's eyebrow: white on a dark purple box (ticket 200), so it reads as a button. It
 * pins to the window's left edge, not the page's centred column (ticket 267), so every page's way back is in one place.
 */
export function BackButton({ href, children, ...data }: { href: string; children: string } & Record<`data-${string}`, true>) {
  return (
    <Link
      href={href}
      style={{ marginLeft: BACK_LEFT }}
      className="mb-1 inline-flex items-center rounded-md bg-accent-dark px-3 py-1.5 text-[13.5px] font-medium text-white transition-colors hover:bg-accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      {...data}
    >
      ← {children}
    </Link>
  );
}

/** "← Edexia Classroom", above the eyebrow on every assignment page. */
export function BackToClassroom() {
  return (
    <BackButton href={CLASSROOM_HREF} data-back-to-classroom>
      Edexia Classroom
    </BackButton>
  );
}
