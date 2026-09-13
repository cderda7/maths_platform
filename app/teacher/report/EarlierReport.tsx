"use client";

import TeacherChrome from "../TeacherChrome";
import { AssignmentContext, useAssignmentBundle } from "../AssignmentContext";
import { ReportBody, REPORT_ZOOM } from "./TeacherReport";
import type { AssignmentBundle } from "@/lib/assignments";
import { psetName } from "@/lib/history";
import { historyReturnHref } from "@/lib/setHistory";

/**
 * A student's report on an earlier set, opened from a history pill on this set's Class View (ticket 237). The chrome is
 * this set's (its tabs, Class current), so the teacher never lands on the earlier set's pages; the report under it is the
 * earlier set's, and a pulsing "← Return to PSet N" goes back to this student's history with the category's stack standing.
 */
export default function EarlierReport({ earlier, student, open }: { earlier: AssignmentBundle; student: string; open: string | null }) {
  const current = useAssignmentBundle();
  return (
    <TeacherChrome zoom={REPORT_ZOOM}>
      <div data-earlier-report={earlier.id}>
        <AssignmentContext.Provider value={earlier}>
          <ReportBody student={student} back={{ href: historyReturnHref(current.id, student, open), label: `Return to ${psetName(current.name)}` }} />
        </AssignmentContext.Provider>
      </div>
    </TeacherChrome>
  );
}
