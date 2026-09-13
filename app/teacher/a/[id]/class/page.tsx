import TeacherLive from "../../../TeacherLive";

/** A set's Class View. A real history pill on a later set links here with `?history=<student>&open=<category>` (ticket 215): the page opens on that student's history. The layout provides the set. */
export default async function Page(props: PageProps<"/teacher/a/[id]/class">) {
  const sp = await props.searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;
  return <TeacherLive init={{ history: first(sp.history), open: first(sp.open) }} />;
}
