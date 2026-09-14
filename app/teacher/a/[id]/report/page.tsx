import TeacherReport from "../../../report/TeacherReport";
import { isHolisticHref } from "@/lib/assignments";

/**
 * One student's individual view on a set (ticket 187): `?student=<id>`, Sam when absent. The layout provides the set.
 * From the student's holistic page (ticket 251) `?work=<problem>` opens that problem's working and `?from=<holistic page>` is the way back.
 */
export default async function Page(props: PageProps<"/teacher/a/[id]/report">) {
  const sp = await props.searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;
  const from = first(sp.from);
  return <TeacherReport student={first(sp.student)} work={first(sp.work)} from={isHolisticHref(from) ? from : null} />;
}
