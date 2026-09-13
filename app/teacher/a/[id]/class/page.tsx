import ClassView from "../../../ClassView";

/**
 * A set's Class View. The way back from a history pill's report links here with `?history=<student>&open=<category>` (tickets 215, 237): the page opens on
 * that student's history. A history pill links here with `?report=<earlier set>&student=<id>&open=<category>`: that report, under this set's chrome. The layout provides the set.
 */
export default async function Page(props: PageProps<"/teacher/a/[id]/class">) {
  const sp = await props.searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;
  return <ClassView init={{ history: first(sp.history), open: first(sp.open) }} report={first(sp.report)} student={first(sp.student)} />;
}
