import TeacherReport from "../../../report/TeacherReport";

/** One student's individual view on a set (ticket 187): `?student=<id>`, Sam when absent. The layout provides the set. */
export default async function Page(props: PageProps<"/teacher/a/[id]/report">) {
  const sp = await props.searchParams;
  const raw = Array.isArray(sp.student) ? sp.student[0] : sp.student;
  return <TeacherReport student={raw ?? null} />;
}
