import WorkFlow, { type WorkFlowInit } from "./WorkFlow";

/**
 * Query params let a reviewer deep-link into a mid-flow state, e.g.
 * /student/work?who=jordan&stage=1&phase=evaluated
 */
export default async function Page(props: PageProps<"/student/work">) {
  const sp = await props.searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const who = one(sp.who);
  const phase = one(sp.phase);
  const stage = Number(one(sp.stage));
  const init: WorkFlowInit = {
    who: who === "priya" || who === "jordan" ? who : undefined,
    stage: Number.isFinite(stage) ? stage : undefined,
    phase: phase === "evaluated" ? "evaluated" : undefined,
  };
  return <WorkFlow init={init} />;
}
