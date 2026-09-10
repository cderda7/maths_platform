import SplitView from "./SplitView";
import { ALL_PANES, parseLayout, parsePanes } from "@/lib/split";

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/**
 * Everything in one tab: /split?panes=student,teacher,board&layout=beside. A named set of panes
 * is used as given; plain /split reopens the last set chosen (or all three). The server page
 * parses the URL; the client view owns the selection from there.
 */
export default async function Page(props: PageProps<"/split">) {
  const sp = await props.searchParams;
  const panes = parsePanes(one(sp.panes));
  return <SplitView init={panes ?? [...ALL_PANES]} explicit={panes !== null} initLayout={parseLayout(one(sp.layout))} />;
}
