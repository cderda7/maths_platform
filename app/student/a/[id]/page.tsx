import { redirect } from "next/navigation";
import StudentApp from "../../StudentApp";
import type { Stage } from "@/data/types";
import { parsePathway } from "@/lib/pathway";
import { LIVE_ASSIGNMENT_ID } from "@/lib/assignments";
import { STUDENT_CLASSROOM_HREF } from "@/lib/studentClassroom";

const STAGES: Stage[] = ["overview", "goal", "confidence", "warmup-chat", "practice", "working", "feedback", "waiting", "frozen", "class-wait", "group", "report", "peers", "history", "homework"];

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/**
 * A set opened from Sam's Classroom (ticket 264). Only the live set runs on the iPad; any other id is his Classroom.
 * Plain, it continues the stored run. Deep links land a reviewer on a specific moment and send the set first when it
 * is not sent: /student/a/pset-6?stage=confidence, ?stage=working. A named stage starts a fresh run at that stage.
 * Add &run=strong for a run where every step held (the mastery path, ?stage=report&run=strong).
 * Add &pathway=wc (or indiv,group · group,wc · none …) to send the demo assignment with that review pathway before
 * the run starts. `/student?stage=…` still works: it redirects here. The server page parses the URL; the client app
 * owns all state from there.
 */
export default async function Page(props: PageProps<"/student/a/[id]">) {
  const { id } = await props.params;
  if (id !== LIVE_ASSIGNMENT_ID) redirect(STUDENT_CLASSROOM_HREF);
  const sp = await props.searchParams;
  const stage = STAGES.find((s) => s === one(sp.stage));
  const pathway = parsePathway(one(sp.pathway));
  return <StudentApp initStage={stage ?? "overview"} explicit={stage !== undefined} run={one(sp.run) === "strong" ? "strong" : "weak"} pathway={pathway} />;
}
