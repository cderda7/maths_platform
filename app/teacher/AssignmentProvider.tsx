"use client";

import { useMemo, type ReactNode } from "react";
import TeacherChrome from "./TeacherChrome";
import { AssignmentContext, BackToClassroom } from "./AssignmentContext";
import { Card, H1 } from "@/components/ui";
import { assignmentBundle } from "@/lib/assignments";
import { useClassroom } from "@/lib/classroom-store";

/** Provides the bundle for `id` (ticket 185); a set the Classroom does not hold says so under the chrome. */
export default function AssignmentProvider({ id, children }: { id: string; children: ReactNode }) {
  const classroom = useClassroom();
  const bundle = useMemo(() => assignmentBundle(id, classroom), [id, classroom]);
  if (!bundle)
    return (
      <TeacherChrome>
        <BackToClassroom />
        <H1 className="mt-3">Not in the Classroom</H1>
        <Card className="mt-8 p-6 text-[14px] text-ink-muted" data-assignment-missing={id}>
          This assignment has not been created yet
        </Card>
      </TeacherChrome>
    );
  return <AssignmentContext.Provider value={bundle}>{children}</AssignmentContext.Provider>;
}

