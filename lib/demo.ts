import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import type { Pathway } from "@/data/types";
import { classroomReducer, GRACE_MS, INITIAL_CLASSROOM, type ClassroomState } from "./classroom";
import { candidatesFor, problemsByStruggle, suggestExamples } from "./examples";
import { INITIAL_SESSION, reworkedSession, sessionAt, type StudentSession } from "./session";
import { LAST_ARRIVAL_MS } from "./readiness";
import { groupPlan } from "./group";
import { beginRun, type GroupRun } from "./groupReview";

/**
 * Presenter shortcuts, not product: jump the demo to a moment in Sam's run. Every jump rebuilds the
 * classroom (the full three-stage pathway, no whole-class session) and installs the scripted
 * session for that moment, so what Sam submitted is always the same. Pure: the strip applies the
 * result through the stores.
 */
export type SkipTarget = "start" | "warm-up" | "working" | "indiv review" | "class wait" | "group review" | "class review" | "report";

export const SKIP_TARGETS: SkipTarget[] = ["start", "warm-up", "working", "indiv review", "class wait", "group review", "class review", "report"];

/** Every review stage, so any of the three jumps has somewhere to land. */
export const DEMO_PATHWAY: Pathway = ["individual", "group", "whole-class"];

/** The gate long since opened: Sam arrived before the last scripted classmate, so everyone is in. */
const everyoneIn = (c: ClassroomState, now: number) => classroomReducer(c, { type: "class/arrive", student: DEMO_STUDENT.id, at: now - LAST_ARRIVAL_MS - 1000 });

/** How many problems the whole-class jump projects: the two the class struggled with most. */
const PROJECTED = 2;

/** The report jump's group review, already run: begun ten minutes ago, every problem resolved a minute apart, finished six minutes in. */
export const REPORT_RUN_STARTED_AGO_MS = 10 * 60_000;
export const REPORT_RUN_FINISHED_AGO_MS = 4 * 60_000;
function finishedRun(session: StudentSession, now: number): GroupRun {
  const plan = groupPlan(session);
  const problems = plan.discussion.problems.map((p) => p.id);
  const startedAt = now - REPORT_RUN_STARTED_AGO_MS;
  const finishedAt = now - REPORT_RUN_FINISHED_AGO_MS;
  const step = problems.length > 1 ? (finishedAt - startedAt) / problems.length : 0;
  const run = beginRun(
    plan.members.map((m) => m.id),
    problems,
    startedAt,
  );
  return { ...run, index: Math.max(0, problems.length - 1), resolved: problems, resolvedAt: Object.fromEntries(problems.map((p, i) => [p, i === problems.length - 1 ? finishedAt : Math.round(startedAt + step * (i + 1))])), turnStartedAt: finishedAt, done: true };
}

/**
 * A skip jumps past the teacher's Create (ticket 188): Problem Set 6 exists, and went live this long
 * before the jump, so a stream counted from its start (ticket 189) is long over.
 */
export const SKIP_STARTED_AGO_MS = 60 * 60_000;

export function skipFixture(target: SkipTarget, now: number): { session: StudentSession; classroom: ClassroomState } {
  let classroom = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: ASSIGNMENT.title, problemIds: ASSIGNMENT.problems.map((p) => p.id), pathway: DEMO_PATHWAY, goal: ASSIGNMENT.goal, at: now, startedAt: now - SKIP_STARTED_AGO_MS });
  switch (target) {
    case "start":
      return { session: INITIAL_SESSION, classroom };
    case "warm-up":
      return { session: sessionAt("warmup-chat"), classroom };
    case "working":
      return { session: sessionAt("working"), classroom };
    case "indiv review":
      return { session: sessionAt("feedback"), classroom };
    case "class wait":
      // Sam has just handed in corrections: the classmates' scripted arrivals start now.
      return { session: sessionAt("class-wait"), classroom: classroomReducer(classroom, { type: "class/arrive", student: DEMO_STUDENT.id, at: now }) };
    case "group review": {
      const session = sessionAt("group");
      const c = everyoneIn(classroom, now);
      return { session, classroom: classroomReducer(c, { type: "group/begin", members: groupPlan(session).members.map((m) => m.id), problems: groupPlan(session).discussion.problems.map((p) => p.id), at: now }) };
    }
    case "report": {
      // Group review is behind the class: the standings hold on the board with the demo group's run finished.
      const session = sessionAt("report");
      return { session, classroom: { ...everyoneIn(classroom, now), group: finishedRun(session, now) } };
    }
    case "class review": {
      // The teacher's setup, as it would be done from the reworked run: the most-struggled problems, suggested examples, projected with the grace already over.
      const session = { ...reworkedSession(), stage: "frozen" as const };
      const problems = problemsByStruggle(session)
        .slice(0, PROJECTED)
        .map((r) => r.problem.id);
      const ordered = ASSIGNMENT.problems.map((p) => p.id).filter((id) => problems.includes(id));
      const examples = Object.fromEntries(ordered.map((id) => [id, suggestExamples(candidatesFor(id, session))]));
      classroom = classroomReducer(everyoneIn(classroom, now), { type: "wc/setup", problems: ordered, examples, mode: "frozen" });
      classroom = classroomReducer(classroom, { type: "wc/project", at: now - GRACE_MS - 1000 });
      return { session, classroom };
    }
  }
}
