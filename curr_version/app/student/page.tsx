import StudentApp from "./StudentApp";
import type { Stage } from "@/data/types";
import { parsePathway } from "@/lib/pathway";

const STAGES: Stage[] = ["overview", "confidence", "warmup-pick", "practice", "working", "feedback", "waiting", "frozen", "class-wait", "group-pass", "group-discuss", "report", "peers", "history"];

/**
 * Deep links land a reviewer on a specific moment: /student?stage=confidence, /student?stage=working.
 * A named stage starts a fresh run at that stage; plain /student continues the stored run.
 * Add &run=strong for a run where every step held (the mastery path, /student?stage=report&run=strong).
 * Add &pathway=wc (or indiv,group · group,wc · none …) to create the demo assignment with that
 * review pathway before the run starts. The server page parses the URL; the client app owns all
 * state from there.
 */
export default async function Page(props: PageProps<"/student">) {
  const sp = await props.searchParams;
  const raw = Array.isArray(sp.stage) ? sp.stage[0] : sp.stage;
  const stage = STAGES.find((s) => s === raw);
  const runRaw = Array.isArray(sp.run) ? sp.run[0] : sp.run;
  const pathway = parsePathway(Array.isArray(sp.pathway) ? sp.pathway[0] : sp.pathway);
  return <StudentApp initStage={stage ?? "overview"} explicit={stage !== undefined} run={runRaw === "strong" ? "strong" : "weak"} pathway={pathway} />;
}
