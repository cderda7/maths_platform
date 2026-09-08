import StudentApp from "./StudentApp";
import type { Stage } from "@/data/types";

const STAGES: Stage[] = ["overview", "practice", "confidence", "working", "feedback", "rework", "group-pass", "group-discuss", "report"];

/**
 * Deep links land a reviewer on a specific moment: /student?stage=confidence, /student?stage=working.
 * The server page parses the URL; the client app owns all state from there.
 */
export default async function Page(props: PageProps<"/student">) {
  const sp = await props.searchParams;
  const raw = Array.isArray(sp.stage) ? sp.stage[0] : sp.stage;
  const stage = STAGES.find((s) => s === raw) ?? "overview";
  return <StudentApp initStage={stage} />;
}
