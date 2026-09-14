import { redirect } from "next/navigation";
import StudentClassroom from "./StudentClassroom";
import { LIVE_ASSIGNMENT_ID } from "@/lib/assignments";
import { studentSetHref } from "@/lib/studentClassroom";

/** The query a deep link into the student app carries (`app/student/a/[id]/page.tsx`). */
const DEEP_LINK_KEYS = ["stage", "run", "pathway"];

/**
 * Sam's Classroom, his landing on the iPad (ticket 264): To do, Missing and Completed. A deep link from before the
 * Classroom (`/student?stage=report`, `?run=strong`, `?pathway=wc`) names a moment in Problem Set 6, so it redirects,
 * query and all, to the set's own route, which sends the set first.
 */
export default async function Page(props: PageProps<"/student">) {
  const sp = await props.searchParams;
  if (DEEP_LINK_KEYS.some((k) => sp[k] !== undefined)) {
    const query = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) for (const one of Array.isArray(v) ? v : v === undefined ? [] : [v]) query.append(k, one);
    redirect(`${studentSetHref(LIVE_ASSIGNMENT_ID)}?${query.toString()}`);
  }
  return <StudentClassroom />;
}
