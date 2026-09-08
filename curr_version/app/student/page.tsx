import StudentApp from "./StudentApp";
import type { Stage } from "@/data/types";

const STAGES: Stage[] = ["overview", "practice", "confidence", "working", "feedback", "rework", "group-pass", "group-discuss", "report", "peers"];

/**
 * Deep links land a reviewer on a specific moment: /student?stage=confidence, /student?stage=working.
 * A named stage starts a fresh run at that stage; plain /student continues the stored run.
 * Add &run=strong for a run where every step held (the mastery path, /student?stage=report&run=strong).
 * The server page parses the URL; the client app owns all state from there.
 */
export default async function Page(props: PageProps<"/student">) {
  const sp = await props.searchParams;
  const raw = Array.isArray(sp.stage) ? sp.stage[0] : sp.stage;
  const stage = STAGES.find((s) => s === raw);
  const runRaw = Array.isArray(sp.run) ? sp.run[0] : sp.run;
  return <StudentApp initStage={stage ?? "overview"} explicit={stage !== undefined} run={runRaw === "strong" ? "strong" : "weak"} />;
}
