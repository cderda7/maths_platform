import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATES, type Classmate } from "@/data/classmates";
import type { SeatingGroups } from "@/data/groups";
import type { LeafId } from "@/data/taxonomy";
import type { Assignment, Pathway, Problem, UnitRef } from "@/data/types";
import { activeAssignment } from "./assignment";
import { pathwayOf, type ClassroomState } from "./classroom";
import { CLASS_STAGE_WORD, classStages, type ClassStage, type ClassStageId } from "./classStage";
import { classmateEvidence, sessionEvidence, type Evidence } from "./hierarchy";
import { isSubmitted, progressTag, sessionProgress, type StudentProgress } from "./progress";
import { FINISHED_SETS } from "./finishedSets";
import { assignmentGroupsOf } from "./seating";
import type { StudentSession } from "./session";
import { chainPauses } from "./diagnosticChain";
import { classmatesAt, type StreamPause } from "./stream";
import { absentOf, presentCount } from "./absence";
import { liveClassReview, recordedClassReview, type ClassReviewShown } from "./report";

/**
 * The assignments (ticket 185): every set the teacher's Classroom holds, by id, and everything a
 * teacher screen needs to show one of them. Screens take the id from the route
 * (`/teacher/a/<id>/…`) and read the bundle through `AssignmentProvider`
 * (`app/teacher/AssignmentContext.tsx`); nothing on the teacher side reads the fixture's module
 * constants for "the set" any more. Pure. See DECISION_LOG.md, 2026-09-13.
 *
 * Two kinds of set:
 * - `live`: the lesson running now (Problem Set 6). Its title, problems, goal and pathway are the
 *   created assignment's when there is one (`activeAssignment`), its stage follows the classroom
 *   and Sam's session (`classStages`), and Sam's row is his live session.
 * - `finished`: a past set (Problem Set 5, ticket 187): fixed data, every stage over. Every finished set
 *   comes from the one list in `data/finishedSets.ts` (ticket 210), newest due first after the live set.
 */
export type AssignmentKind = "live" | "finished";
export type AssignmentTab = "class" | "mistakes" | "groups";

/** A registered set: its fixture and its classmates' results. A live set's pathway is the classroom's; a finished set carries its own. */
type AssignmentDef = ({ kind: "live" } | { kind: "finished"; pathway: Pathway; sam: Classmate }) & {
  fixture: Assignment;
  /**
   * The set's name as a teacher writes it, for the Classroom's cards (ticket 186): "Problem Set 6 — Roots of a
   * quadratic". The fixture's `title` is upper-cased for the student's eyebrow; without a name the card shows the title.
   */
  name?: string;
  /**
   * The nineteen classmates' results on this set, as handed in at the end. On the live set they arrive over time
   * (ticket 189): `lib/stream.ts` reads them at `now` from the bundle's `startedAt`.
   */
  classmates: readonly Classmate[];
  /** Whether the Classroom holds the set in this classroom state. */
  exists: (c: ClassroomState | null | undefined) => boolean;
};

/**
 * The switch ticket 185 left for ticket 188: whether Problem Set 6 is in the Classroom before the
 * teacher creates it. Off since 188: the set exists once `assignment/create` has stored it
 * (`c.assignment`), from the create flow's Create or a presenter skip; Reset demo removes it.
 */
export const LIVE_SET_BEFORE_CREATE = false;

/** Newest first: Problem Set 6, then every finished set (ticket 210) newest due first, which the Classroom always holds. */
const REGISTRY: readonly AssignmentDef[] = [
  {
    fixture: ASSIGNMENT,
    name: "Problem Set 6 — Roots of a quadratic",
    kind: "live",
    classmates: CLASSMATES,
    exists: (c) => LIVE_SET_BEFORE_CREATE || !!c?.assignment,
  },
  ...[...FINISHED_SETS].reverse().map((s): AssignmentDef => ({ fixture: s.fixture, name: s.name, kind: "finished", pathway: s.pathway, classmates: s.classmates, sam: s.sam, exists: () => true })),
];

/**
 * When the live set went live (ticket 188), or null before it is created: the created assignment's
 * `startedAt`, else (stored before 188) its `createdAt`. Ticket 189's stream counts from it.
 */
export function liveStartedAt(c: ClassroomState | null | undefined): number | null {
  const a = c?.assignment;
  return a ? (a.startedAt ?? a.createdAt) : null;
}

/** The id of the set the students are working on now: the student side's Problem Set 6. */
export const LIVE_ASSIGNMENT_ID = ASSIGNMENT.id;

const defOf = (id: string): AssignmentDef | undefined => REGISTRY.find((d) => d.fixture.id === id);

/** Whether an id names a registered set at all (the route's 404), whatever the classroom holds. */
export const isAssignmentId = (id: string): boolean => defOf(id) !== undefined;

/** The sets the Classroom holds right now, newest first. */
export function assignmentIds(c: ClassroomState | null | undefined): string[] {
  return REGISTRY.filter((d) => d.exists(c)).map((d) => d.fixture.id);
}

/** The registered sets older than `id`, oldest first (ticket 187): the sets a student's history on `id` reads real results from. */
export function earlierAssignmentIds(id: string): string[] {
  const i = REGISTRY.findIndex((d) => d.fixture.id === id);
  return i < 0 ? [] : REGISTRY.slice(i + 1).map((d) => d.fixture.id).reverse();
}

/**
 * The registered finished sets older than `id`, newest first, at most `n` (ticket 209): what the class
 * met most recently, which Create's New skills inference reads (`inferNewSkills`, the last two sets).
 */
export function recentSets(id: string, n: number): Pick<Assignment, "id" | "problems" | "newSkills">[] {
  return earlierAssignmentIds(id)
    .reverse()
    .flatMap((e) => {
      const d = defOf(e);
      return d && d.kind === "finished" ? [d.fixture] : [];
    })
    .slice(0, n);
}

/** Everything a teacher screen shows about one set. */
export interface AssignmentBundle {
  id: string;
  kind: AssignmentKind;
  /** As the teacher named it. */
  title: string;
  /** The display name in sentence case (the registry's `name`, else the title); a created set's own title when it differs from the fixture's. */
  name: string;
  className: string;
  classCode: string;
  teacher: string;
  /** As cards show it ("Thu 10 Sep"): a finished set's fixture day; the live set's the day picked on Create (ticket 289), else its fixture's. */
  due: string;
  /** The unit and topic the eyebrow names (`unitLabel`). */
  unit: UnitRef;
  /** The skills new on this set (ticket 209): their evidence shows under New skills, not their home (`lib/hierarchy`). A finished set's are its fixture's; the live set's the created assignment's (`activeAssignment`). */
  newSkills: readonly LeafId[];
  goal: string;
  problems: Problem[];
  pathway: Pathway;
  classmates: readonly Classmate[];
  /** The set's own groups: frozen when it was created, edited on its Groups tab only. */
  groups: SeatingGroups;
  /** Sam's handed-in record on a finished set (ticket 187); null on the live set, where his row is his session. */
  sam: Classmate | null;
  /** When the live set went live (`liveStartedAt`): the classmates' stream counts from it (ticket 189). Null on a finished set, whose results are fixed. */
  startedAt: number | null;
  /** When the live set's stream stood still (ticket 241): each diagnostic chain while it was out. Empty on a finished set. */
  pauses: StreamPause[];
  /** The students marked absent on this set (ticket 250, `absentOf`): greyed on its screens, out of every count (`classSize`). */
  absent: readonly string[];
}

/** One set's bundle, or null when the Classroom does not hold it. */
export function assignmentBundle(id: string, c: ClassroomState | null | undefined): AssignmentBundle | null {
  const def = defOf(id);
  if (!def || !def.exists(c)) return null;
  const f = def.fixture;
  const base = { id, kind: def.kind, className: f.className, classCode: f.classCode, teacher: f.teacher, due: f.due, unit: f.unit, classmates: def.classmates, groups: assignmentGroupsOf(c, id), absent: absentOf(c, id) };
  if (def.kind === "finished") return { ...base, title: f.title, name: def.name ?? f.title, newSkills: f.newSkills, goal: f.goal, problems: f.problems, pathway: def.pathway, sam: def.sam, startedAt: null, pauses: [] };
  const active = activeAssignment(c);
  return { ...base, due: active.due, title: active.title, name: active.title === f.title ? (def.name ?? f.title) : active.title, newSkills: active.newSkills, goal: active.goal, problems: active.problems, pathway: pathwayOf(c), sam: null, startedAt: liveStartedAt(c), pauses: chainPauses(c?.diagnostics) };
}

/**
 * One student's fixed record on a set (ticket 187): a classmate's results, or on a finished set Sam's
 * handed-in record. Null for Sam on the live set (his session is his record) and for an unknown id.
 */
export function studentRecord(b: Pick<AssignmentBundle, "classmates" | "sam">, student: string): Classmate | null {
  if (student === DEMO_STUDENT.id) return b.sam;
  return b.classmates.find((m) => m.id === student) ?? null;
}

/**
 * Every student's progress on the set, Sam first then the classmates in fixture order. On the live
 * set Sam's comes from his session and the classmates' from the stream at `now` (ticket 189); on a
 * finished set Sam handed in and the classmates' records are fixed.
 */
export function rosterProgress(b: AssignmentBundle, session: StudentSession | null, now: number): Record<string, StudentProgress> {
  const sam: StudentProgress = b.kind === "live" ? sessionProgress(session, b.problems) : { kind: "submitted" };
  return { [DEMO_STUDENT.id]: sam, ...Object.fromEntries(classmatesAt(b, b.kind === "live" ? session : null, now).map((m) => [m.record.id, m.progress])) };
}

/** Nothing handed in yet: a row's pills stay not seen until the student submits (ticket 185). */
export const NO_EVIDENCE: Evidence = { lines: {}, submitted: false, caution: [] };

/**
 * Every student's evidence on the set as its Class View reads it at `now` (tickets 185, 189; shared since ticket 251):
 * a student still on the set (a progress tag: not started, warming up, a Q in progress) has none yet; on the live set
 * Sam's is his session and each classmate's the part of the record the stream has reached; on a finished set every
 * record whole. Sam first, then the classmates in fixture order.
 */
export function rosterEvidence(b: AssignmentBundle, session: StudentSession | null, now: number): Record<string, Evidence> {
  const live = b.kind === "live" ? session : null;
  const progress = rosterProgress(b, live, now);
  const sam = b.sam ? (progressTag(progress[DEMO_STUDENT.id]) ? NO_EVIDENCE : classmateEvidence(b.sam, b.problems)) : live && !progressTag(progress[DEMO_STUDENT.id]) ? sessionEvidence(live) : NO_EVIDENCE;
  return {
    [DEMO_STUDENT.id]: sam,
    ...Object.fromEntries(classmatesAt(b, live, now).map((m) => [m.record.id, progressTag(progress[m.record.id]) ? NO_EVIDENCE : classmateEvidence(m.record, b.problems)])),
  };
}

/** The class a set counts (ticket 250): Sam and the classmates, less the students marked absent on it. Every "x/20" on the set's screens is over this. */
export const classSize = (b: Pick<AssignmentBundle, "classmates" | "absent">): number => presentCount(b.classmates, b.absent);

/** How many of the class in the room have handed the set in, and whether that is all of them: an absent student is in neither (ticket 250). */
export function submittedCount(b: AssignmentBundle, session: StudentSession | null, now: number): { submitted: number; total: number } {
  const all = Object.entries(rosterProgress(b, session, now)).flatMap(([id, p]) => (b.absent.includes(id) ? [] : [p]));
  return { submitted: all.filter(isSubmitted).length, total: all.length };
}

/** The set's pathway, stage by stage: a live set's from the classroom and the session; a finished set's all over. */
export function assignmentStages(b: AssignmentBundle, c: ClassroomState | null | undefined, session: StudentSession | null, now: number): ClassStage[] {
  if (b.kind === "finished") {
    const ids: ClassStageId[] = ["working", ...b.pathway];
    return ids.map((id) => ({ id, word: CLASS_STAGE_WORD[id], state: "over", done: null, total: classSize(b) }));
  }
  return classStages(c, session, now, b);
}

/**
 * What class review covered on a set, for its reports (ticket 282): a finished set's record (`FinishedSet.classReview`), the
 * live set's board once class review is over (`liveClassReview`); null when the set has had no class review.
 */
export function setClassReview(b: Pick<AssignmentBundle, "id" | "kind">, c: ClassroomState | null | undefined, session: StudentSession | null): ClassReviewShown | null {
  if (b.kind === "finished") return recordedClassReview(FINISHED_SETS.find((s) => s.fixture.id === b.id)?.classReview);
  return liveClassReview(c, session);
}

/** The stage the set is on, or null once every stage is over. */
export const currentStageOf = (stages: readonly ClassStage[]): ClassStage | null => stages.find((s) => s.state === "current") ?? null;

/**
 * Where opening a set lands (ticket 185): on Mistakes while the class is still working, and during individual review, when
 * the tab shows where each student is in their corrections (ticket 318); on Class once everyone has handed in the working,
 * in the later review stages, and on a finished set.
 */
export function landingFor(everyoneSubmitted: boolean, stage: ClassStageId | null): Extract<AssignmentTab, "class" | "mistakes"> {
  if (stage === "individual") return "mistakes";
  return everyoneSubmitted || stage !== "working" ? "class" : "mistakes";
}

export function landingTab(b: AssignmentBundle, c: ClassroomState | null | undefined, session: StudentSession | null, now: number): Extract<AssignmentTab, "class" | "mistakes"> {
  const { submitted, total } = submittedCount(b, session, now);
  return landingFor(submitted >= total, currentStageOf(assignmentStages(b, c, session, now))?.id ?? null);
}

/** The Classroom, and the class's default groups on it. */
export const CLASSROOM_HREF = "/teacher";
export const CLASS_GROUPS_HREF = "/teacher/groups";
/** The create flow's first screen (blank until generated, ticket 188). */
export const NEW_ASSIGNMENT_HREF = "/teacher/assignments/create";
/** The create flow's review steps, Create on the last (ticket 120); the presenter's "send assignment" lands there (ticket 272). */
export const REVIEW_ASSIGNMENT_HREF = "/teacher/assignments/create/review";

/** A set's page: no tab is the landing, which redirects to Class or Mistakes. */
export function assignmentHref(id: string, tab?: AssignmentTab): string {
  return tab ? `/teacher/a/${id}/${tab}` : `/teacher/a/${id}`;
}

/**
 * A student's individual view on a set (ticket 187): no student is Sam. `/teacher/report` redirects to Problem Set 6's.
 * From a student's holistic page (ticket 251) it also names the problem whose working opens (`work`) and the page to go back to (`from`).
 */
export function assignmentReportHref(id: string, student?: string, opts: { work?: string; from?: string } = {}): string {
  const q = [student && `student=${encodeURIComponent(student)}`, opts.work && `work=${encodeURIComponent(opts.work)}`, opts.from && `from=${encodeURIComponent(opts.from)}`].filter(Boolean);
  return `/teacher/a/${id}/report${q.length ? `?${q.join("&")}` : ""}`;
}

/** Holistic Assessment in Edexia Classroom: every student as a tile (ticket 252). */
export const HOLISTIC_HREF = "/teacher/students";

/**
 * A student's holistic page (ticket 251): one student across every set. From Holistic Assessment it is
 * `/teacher/students/<id>` (Back to the tiles); from a set's Class View it sits under the set,
 * `/teacher/a/<set>/students/<id>` (Back to that Class View). The same page either way.
 */
export function holisticHref(student: string, set?: string): string {
  return `${set ? `/teacher/a/${set}` : "/teacher"}/students/${encodeURIComponent(student)}`;
}

/** Whether a path is a holistic page (the report's `from`): anything else is ignored, so a crafted link cannot send Back elsewhere. */
export const isHolisticHref = (path: string | null | undefined): path is string => !!path && /^\/teacher\/(a\/[a-z0-9-]+\/)?students\/[a-z0-9-]+$/.test(path);

/** The tabs a set's header offers: Groups only when its pathway has group review. */
export function assignmentTabs(b: Pick<AssignmentBundle, "id" | "pathway">): { tab: AssignmentTab; label: string; href: string }[] {
  const all: { tab: AssignmentTab; label: string }[] = [
    { tab: "class", label: "Class" },
    { tab: "mistakes", label: "Mistakes" },
    { tab: "groups", label: "Groups" },
  ];
  return all.filter((t) => t.tab !== "groups" || b.pathway.includes("group")).map((t) => ({ ...t, href: assignmentHref(b.id, t.tab) }));
}
