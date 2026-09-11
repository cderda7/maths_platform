import ReviewAssignment from "./ReviewAssignment";
import { ASSESS_MS } from "@/data/review";

/**
 * Step two of a new assignment. `?assess=<ms>` shortens the assessing bar (the browser sweep
 * passes 300); anything missing or invalid runs the full five seconds.
 */
export default async function Page(props: PageProps<"/teacher/assignments/create/review">) {
  const sp = await props.searchParams;
  const raw = Array.isArray(sp.assess) ? sp.assess[0] : sp.assess;
  const ms = raw !== undefined && /^\d+$/.test(raw) ? Math.max(100, Number(raw)) : ASSESS_MS;
  return <ReviewAssignment assessMs={ms} />;
}
