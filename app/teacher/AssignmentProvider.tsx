"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import TeacherChrome from "./TeacherChrome";
import { AssignmentContext, BackToClassroom } from "./AssignmentContext";
import { Card, H1 } from "@/components/ui";
import { assignmentBundle, NEW_ASSIGNMENT_HREF } from "@/lib/assignments";
import { useClassroom } from "@/lib/classroom-store";

/**
 * Provides the bundle for `id` (ticket 185); a set the Classroom does not hold says so under the
 * chrome, with the way to create it. Since ticket 188 that is Problem Set 6 before Create: its
 * tabs, the old /teacher/mistakes redirect and the live-lesson pages (report, compare, class review
 * setup, board) all land here until the teacher creates it or a presenter skip does.
 */
export default function AssignmentProvider({ id, children }: { id: string; children: ReactNode }) {
  const classroom = useClassroom();
  const bundle = useMemo(() => assignmentBundle(id, classroom), [id, classroom]);
  if (!bundle)
    return (
      <TeacherChrome>
        <BackToClassroom />
        <H1 className="mt-3">Not in the Classroom</H1>
        <Card className="mt-8 p-6 text-[14px] text-ink-muted" data-assignment-missing={id}>
          This assignment has not been created yet.{" "}
          <Link href={NEW_ASSIGNMENT_HREF} className="font-medium text-accent-deep hover:underline" data-create-it>
            New assignment
          </Link>
        </Card>
      </TeacherChrome>
    );
  return <AssignmentContext.Provider value={bundle}>{children}</AssignmentContext.Provider>;
}

