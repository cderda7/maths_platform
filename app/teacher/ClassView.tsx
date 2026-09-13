"use client";

import TeacherLive, { type ClassViewInit } from "./TeacherLive";
import { useAssignmentBundle } from "./AssignmentContext";
import EarlierReport from "./report/EarlierReport";
import { earlierReportSet } from "@/lib/setHistory";

/**
 * A set's Class View route (ticket 237): the roster, or, when a history pill asked for it (`?report=<earlier>&student=<id>`),
 * that student's report on the earlier set under this set's chrome. A `report` that is not an earlier set the student sat shows the roster.
 */
export default function ClassView({ init, report, student }: { init: ClassViewInit; report: string | null; student: string | null }) {
  const current = useAssignmentBundle();
  const earlier = earlierReportSet(current.id, report, student);
  return earlier && student ? <EarlierReport earlier={earlier} student={student} open={init.open} /> : <TeacherLive init={init} />;
}
