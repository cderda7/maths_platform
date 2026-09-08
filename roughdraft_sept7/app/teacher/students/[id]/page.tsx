import { notFound } from "next/navigation";
import { STUDENT_MAP } from "@/data/students";
import StudentDetail from "./StudentDetail";

export default async function Page(props: PageProps<"/teacher/students/[id]">) {
  const { id } = await props.params;
  const student = STUDENT_MAP[id];
  if (!student) notFound();
  return <StudentDetail studentId={id} />;
}
