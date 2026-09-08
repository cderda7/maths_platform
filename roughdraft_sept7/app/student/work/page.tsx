import WorkFlow, { type WorkFlowInit } from "./WorkFlow";
import type { Confidence } from "@/data/types";

// Kept here rather than imported from the client-side ConfidenceCheck module: a value imported
// from a "use client" file into a server component arrives as a client reference, not an array.
const CONFIDENCE: Confidence[] = ["not sure", "a bit unsure", "fairly sure", "certain"];

/**
 * Query params let a reviewer deep-link into a mid-flow state, e.g.
 * /student/work?who=jordan&stage=1&phase=evaluated
 * /student/work?who=sam                      — a blank attempt
 * /student/work?who=sam&problem=q2&lines=2x^2+7x-4=0|(2x+4)(x-1)=0&confidence=certain&phase=evaluated
 *   — a typed attempt at Q2 (lines separated by |) already checked
 */
export default async function Page(props: PageProps<"/student/work">) {
  const sp = await props.searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const who = one(sp.who);
  const phase = one(sp.phase);
  const stage = Number(one(sp.stage));
  const confidence = one(sp.confidence);
  const lines = one(sp.lines);
  const init: WorkFlowInit = {
    who: who === "priya" || who === "jordan" || who === "sam" ? who : undefined,
    stage: Number.isFinite(stage) ? stage : undefined,
    phase: phase === "evaluated" ? "evaluated" : undefined,
    confidence: CONFIDENCE.find((c) => c === confidence),
    lines: lines ? lines.split("|") : undefined,
    problem: one(sp.problem),
  };
  return <WorkFlow init={init} />;
}
