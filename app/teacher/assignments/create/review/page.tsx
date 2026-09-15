import ReviewAssignment from "./ReviewAssignment";
import { ASSESS_MS } from "@/data/review";
import { assessMsFrom } from "@/lib/createPipeline";

/**
 * Step two of a new assignment. `?assess=<ms>` shortens the assessing bar (the browser sweep
 * passes 300); anything missing or invalid runs the full five seconds.
 */
export default async function Page(props: PageProps<"/teacher/assignments/create/review">) {
  const sp = await props.searchParams;
  return <ReviewAssignment kind="pset" assessMs={assessMsFrom(sp.assess, ASSESS_MS)} />;
}
