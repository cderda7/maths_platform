import { redirect } from "next/navigation";
import HomeworkScreen from "../../HomeworkScreen";
import { STUDENT_CLASSROOM_HREF } from "@/lib/studentClassroom";

/**
 * Sam's homework screen (ticket 292 routes it; ticket 293 fills it), opened from the open Homework card in his To do or its HW
 * cell. An id that cannot name a homework is his Classroom; whether the homework is open for him is the browser's to say
 * (the classroom lives there), so the client page sends him back when it is not.
 */
export default async function Page(props: PageProps<"/student/homework/[id]">) {
  const { id } = await props.params;
  if (!/^hw-\d+$/.test(id)) redirect(STUDENT_CLASSROOM_HREF);
  return <HomeworkScreen id={id} />;
}
