import { redirect } from "next/navigation";
import { assignmentHref, LIVE_ASSIGNMENT_ID } from "@/lib/assignments";

/** The old single-assignment Mistakes URL (before ticket 185): Problem Set 2's Mistakes tab. */
export default function Page() {
  redirect(assignmentHref(LIVE_ASSIGNMENT_ID, "mistakes"));
}
