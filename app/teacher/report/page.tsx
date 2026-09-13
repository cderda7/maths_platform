import TeacherReport from "./TeacherReport";
import AssignmentProvider from "../AssignmentProvider";
import { LIVE_ASSIGNMENT_ID } from "@/lib/assignments";

/** The individual view: /teacher/report?student=<id> for a classmate, plain /teacher/report for the demo student. The server page parses the URL; the client screen owns the rest. */
export default async function Page(props: PageProps<"/teacher/report">) {
  const sp = await props.searchParams;
  const raw = Array.isArray(sp.student) ? sp.student[0] : sp.student;
  return (
    <AssignmentProvider id={LIVE_ASSIGNMENT_ID}>
      <TeacherReport student={raw ?? null} />
    </AssignmentProvider>
  );
}
