import { notFound } from "next/navigation";
import HolisticPage from "../../../../students/HolisticPage";
import { isHolisticStudent } from "@/lib/holistic";

/** A student across every set (ticket 251), from a set's Class View: the same page under the set's tabs, Back to that Class View. The layout provides the set. */
export default async function Page({ params }: PageProps<"/teacher/a/[id]/students/[student]">) {
  const { id, student } = await params;
  if (!isHolisticStudent(student)) notFound();
  return <HolisticPage student={student} set={id} />;
}
