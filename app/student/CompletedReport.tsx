"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import StudentChrome from "./StudentChrome";
import ReportLayout from "./screens/ReportLayout";
import { useLessonPull } from "./useLessonPull";
import { Button, Eyebrow } from "@/components/ui";
import { useEscape } from "@/components/useEscape";
import { ASSIGNMENT } from "@/data/assignment";
import { useClassroom } from "@/lib/classroom-store";
import { crumbTitle } from "@/lib/crumbTitle";
import { useNow, useStudentSession } from "@/lib/store";
import { STUDENT_CLASSROOM_HREF } from "@/lib/studentClassroom";
import { studentReport } from "@/lib/studentReport";

const noSubscribe = () => () => {};

/**
 * Sam's report on a Completed set, read-only (ticket 287): what a Completed card on his Classroom opens
 * (`/student/a/<id>/report`). The report he gets at the end of in-class work, laid out the same (`ReportLayout`): the
 * skills, What happened's columns and tiles, a tile's or a skill's marked working in the side column. His reflection
 * is the sent text where the box was; no Send, nothing to edit, nothing that changes his run. "← Classroom" (or
 * Escape) goes back. The header's crumb names the set; no pathway strip, which is behind him here as on every report.
 *
 * The data is `studentReport`: Problem Sets 1–5 from his handed-in record, Problem Set 6 from his session once the
 * report is sent. A set that is not Completed for him (a stale link, Reset demo in another tab) is his Classroom.
 * No difficulty tags: this is the student's side.
 */
export default function CompletedReport({ id }: { id: string }) {
  const router = useRouter();
  const classroom = useClassroom();
  const session = useStudentSession("overview", false);
  const now = useNow();
  // The stores are the browser's: until the client has read them the report would be a fresh demo's, so it waits.
  const client = useSyncExternalStore(noSubscribe, () => true, () => false);
  const report = client ? studentReport(id, classroom, session, now) : null;
  const missing = client && !report;
  useEffect(() => {
    if (missing) router.replace(STUDENT_CLASSROOM_HREF);
  }, [missing, router]);
  useLessonPull(!!classroom.assignment, session.stage === "frozen");
  const back = () => router.push(STUDENT_CLASSROOM_HREF);
  useEscape(!!report, back);

  if (!report) return <StudentChrome>{null}</StudentChrome>;
  return (
    <StudentChrome crumb={crumbTitle(report.set.title)}>
      <div className="h-full" data-completed-report={id}>
        <ReportLayout
          problems={report.problems}
          hierarchy={report.hierarchy}
          lines={report.lines}
          columns={report.columns}
          reviews={report.reviews}
          pathway={report.pathway}
          actions={
            <Button variant="secondary" className="whitespace-nowrap" onClick={back} data-report-back>
              ← Classroom
            </Button>
          }
          reflection={
            <>
              <Eyebrow>Your reflection</Eyebrow>
              {/* Where the box was: the sentences he sent, as text. */}
              <p className="mt-3 rounded-2xl border border-line bg-cream-deep/50 px-4 py-3 text-[15px] leading-relaxed text-ink" data-sent-reflection>
                {report.reflection}
              </p>
            </>
          }
          foot={() => (
            <div className="rounded-2xl border border-secure-line bg-secure-soft px-5 py-4 text-[14px] text-ink" data-sent>
              Sent to {ASSIGNMENT.teacher}
            </div>
          )}
        />
      </div>
    </StudentChrome>
  );
}
