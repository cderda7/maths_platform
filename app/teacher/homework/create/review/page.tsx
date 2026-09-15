import ReviewAssignment from "../../../assignments/create/review/ReviewAssignment";
import { ASSESS_MS } from "@/data/review";
import { assessMsFrom } from "@/lib/createPipeline";

/** A homework's review steps (ticket 291): Difficulty, then Refine, whose last button creates. `?assess=<ms>` as on an in-class set's. */
export default async function Page(props: PageProps<"/teacher/homework/create/review">) {
  const sp = await props.searchParams;
  return <ReviewAssignment kind="homework" assessMs={assessMsFrom(sp.assess, ASSESS_MS)} />;
}
