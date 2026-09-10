import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATE_MAP, GROUPMATE_IDS, OTHER_GROUPS } from "@/data/classmates";
import { leafName, type LeafId } from "@/data/taxonomy";
import { EVALUATION } from "@/data/evaluation";
import { computePhases, groupPlan } from "./group";
import type { StudentSession } from "./session";

/**
 * The teacher's "during review groups" view: each group, one line per student, and a single
 * shared note saying why the group formed. The demo student's group is computed from the
 * session with the same phase logic the student sees; the other groups are static fixture.
 */
export interface GroupMemberLine {
  id: string;
  name: string;
  initials: string;
  live: boolean;
  status: string;
}

export interface ReviewGroup {
  id: string;
  members: GroupMemberLine[];
  /** Why the group formed, one shared sentence. */
  note: string;
  discussing: string[];
}

function liveStatus(session: StudentSession): string {
  switch (session.stage) {
    case "class-wait":
      return "Waiting for the class";
    case "group":
      return "On the whiteboard";
    case "report":
    case "peers":
    case "history":
    case "waiting":
    case "frozen":
      return "Finished";
    default:
      return "Not started";
  }
}

/** Leaves behind the discussion set, from the first wrong pattern per problem. */
function subskillsBehind(problemIds: string[]): LeafId[] {
  const out: LeafId[] = [];
  for (const id of problemIds) {
    const v = Object.values(EVALUATION[id] ?? {}).find((x) => x.verdict === "wrong");
    const leaf = v?.tags[0]?.leaf;
    if (leaf && !out.includes(leaf)) out.push(leaf);
  }
  return out;
}

function noteFor(discussion: string[], memberCount: number): string {
  if (discussion.length === 0) return `All ${memberCount} correct · quick pass only`;
  const labels = discussion.map((id) => ASSIGNMENT.problems.find((p) => p.id === id)?.label ?? id);
  const skills = subskillsBehind(discussion).map((id) => leafName(id).short);
  return `${labels.join(", ")} · ${skills.join(" and ")}`;
}

export function reviewGroups(session: StudentSession | null): ReviewGroup[] {
  const groups: ReviewGroup[] = [];
  const ids = ASSIGNMENT.problems.map((p) => p.id);

  // The demo student's group, from the session.
  const mates = GROUPMATE_IDS.map((id) => CLASSMATE_MAP[id]);
  const discussion = session ? groupPlan(session).discussion.problems.map((p) => p.id) : computePhases(ids, mates.map((m) => m.wrong)).discussion;
  groups.push({
    id: "g1",
    members: [
      { id: DEMO_STUDENT.id, name: DEMO_STUDENT.name, initials: DEMO_STUDENT.initials, live: true, status: session ? liveStatus(session) : "Not started" },
      ...mates.map((m) => ({ id: m.id, name: m.name, initials: m.initials, live: false, status: m.groupStatus })),
    ],
    note: noteFor(discussion, mates.length + 1),
    discussing: discussion,
  });

  for (const [i, memberIds] of OTHER_GROUPS.entries()) {
    const members = memberIds.map((id) => CLASSMATE_MAP[id]);
    const { discussion: d } = computePhases(ids, members.map((m) => m.wrong));
    groups.push({
      id: `g${i + 2}`,
      members: members.map((m) => ({ id: m.id, name: m.name, initials: m.initials, live: false, status: m.groupStatus })),
      note: noteFor(d, members.length),
      discussing: d,
    });
  }
  return groups;
}
