import { notFound } from "next/navigation";
import HolisticPage from "../HolisticPage";
import { isHolisticStudent } from "@/lib/holistic";

/** A student across every set (ticket 251), from Holistic Assessment: Back goes to its tiles. A student the class does not have is a 404. */
export default async function Page({ params }: PageProps<"/teacher/students/[id]">) {
  const { id } = await params;
  if (!isHolisticStudent(id)) notFound();
  return <HolisticPage student={id} />;
}
