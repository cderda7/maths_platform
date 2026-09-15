import { redirect } from "next/navigation";
import CompletedReport from "../../../CompletedReport";
import { isAssignmentId } from "@/lib/assignments";
import { STUDENT_CLASSROOM_HREF } from "@/lib/studentClassroom";

/**
 * Sam's read-only report on a Completed set (ticket 287), opened from the set's card on his Classroom. An id that names
 * no set is his Classroom; whether the set is Completed for him is the browser's to say (his session and the classroom
 * live there), so the client page sends him back when it is not.
 */
export default async function Page(props: PageProps<"/student/a/[id]/report">) {
  const { id } = await props.params;
  if (!isAssignmentId(id)) redirect(STUDENT_CLASSROOM_HREF);
  return <CompletedReport id={id} />;
}
