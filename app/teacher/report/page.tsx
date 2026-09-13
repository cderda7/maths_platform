import { redirect } from "next/navigation";
import { assignmentReportHref, LIVE_ASSIGNMENT_ID } from "@/lib/assignments";

/** The old individual-view URL (before ticket 187): Problem Set 6's, `?student=` kept. Every set's is `/teacher/a/<id>/report`. */
export default async function Page(props: PageProps<"/teacher/report">) {
  const sp = await props.searchParams;
  const raw = Array.isArray(sp.student) ? sp.student[0] : sp.student;
  redirect(assignmentReportHref(LIVE_ASSIGNMENT_ID, raw));
}
