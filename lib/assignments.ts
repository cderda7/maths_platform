import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATES, type Classmate } from "@/data/classmates";
import { PS1_ASSIGNMENT, PS1_PATHWAY } from "@/data/pset1/assignment";
import { PS1_CLASSMATES, PS1_SAM } from "@/data/pset1/classmates";
import type { SeatingGroups } from "@/data/groups";
import type { Assignment, Pathway, Problem, UnitRef } from "@/data/types";
import { activeAssignment } from "./assignment";
import { pathwayOf, type ClassroomState } from "./classroom";
import { CLASS_STAGE_WORD, classStages, type ClassStage, type ClassStageId } from "./classStage";
import { classmateProgress, isSubmitted, sessionProgress, type StudentProgress } from "./progress";
import { assignmentGroupsOf } from "./seating";
import type { StudentSession } from "./session";

/**
 * The assignments (ticket 185): every set the teacher's Classroom holds, by id, and everything a
 * teacher screen needs to show one of them. Screens take the id from the route
 * (`/teacher/a/<id>/…`) and read the bundle through `AssignmentProvider`
 * (`app/teacher/AssignmentContext.tsx`); nothing on the teacher side reads the fixture's module
 * constants for "the set" any more. Pure. See DECISION_LOG.md, 2026-09-13.
 *
 * Two kinds of set:
 * - `live`: the lesson running now (Problem Set 2). Its title, problems, goal and pathway are the
 *   created assignment's when there is one (`activeAssignment`), its stage follows the classroom
 *   and Sam's session (`classStages`), and Sam's row is his live session.
 * - `finished`: a past set (Problem Set 1, ticket 187): fixed data, every stage over.
 */
export type AssignmentKind = "live" | "finished";
export type AssignmentTab = "class" | "mistakes" | "groups";

/** A registered set: its fixture and its classmates' results. A live set's pathway is the classroom's; a finished set carries its own. */
type AssignmentDef = ({ kind: "live" } | { kind: "finished"; pathway: Pathway; sam: Classmate }) & {
  fixture: Assignment;
  /**
   * The set's name as a teacher writes it, for the Classroom's cards (ticket 186): "Problem Set 2 — Roots of a
   * quadratic". The fixture's `title` is upper-cased for the student's eyebrow; without a name the card shows the title.
   */
  name?: string;
  /**
   * The nineteen classmates' results on this set. A snapshot for now; ticket 189 makes the live set's
   * a function of the start time and `now` (see `rosterProgress`, which already takes `now`).
   */
  classmates: readonly Classmate[];
  /** Whether the Classroom holds the set in this classroom state. */
  exists: (c: ClassroomState | null | undefined) => boolean;
};

/**
 * The one switch for ticket 188: until Create makes Problem Set 2, it is in the Classroom from the
 * start so the demo runs end to end. Ticket 188 sets this to false; the set then exists once
 * `assignment/create` has stored it (`c.assignment`).
 */
export const PROBLEM_SET_2_BEFORE_CREATE = true;

/** Newest first: Problem Set 2, then Problem Set 1 (ticket 187), which the Classroom always holds. */
const REGISTRY: readonly AssignmentDef[] = [
  {
    fixture: ASSIGNMENT,
    name: "Problem Set 2 — Roots of a quadratic",
    kind: "live",
    classmates: CLASSMATES,
    exists: (c) => PROBLEM_SET_2_BEFORE_CREATE || !!c?.assignment,
  },
  {
    fixture: PS1_ASSIGNMENT,
    name: "Problem Set 1 — Features of a parabola",
    kind: "finished",
    pathway: PS1_PATHWAY,
    classmates: PS1_CLASSMATES,
    sam: PS1_SAM,
    exists: () => true,
  },
];

/** The id of the set the students are working on now: the student side's Problem Set 2. */
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
  due: string;
  /** The unit and topic the eyebrow names (`unitLabel`). */
  unit: UnitRef;
  /** The confirmed unit number the categories are named by (the created set's, else the fixture's). */
  unitNumber: 1 | 2 | 3 | 4;
  goal: string;
  problems: Problem[];
  pathway: Pathway;
  classmates: readonly Classmate[];
  /** The set's own groups: frozen when it was created, edited on its Groups tab only. */
  groups: SeatingGroups;
  /** Sam's handed-in record on a finished set (ticket 187); null on the live set, where his row is his session. */
  sam: Classmate | null;
}

/** One set's bundle, or null when the Classroom does not hold it. */
export function assignmentBundle(id: string, c: ClassroomState | null | undefined): AssignmentBundle | null {
  const def = defOf(id);
  if (!def || !def.exists(c)) return null;
  const f = def.fixture;
  const base = { id, kind: def.kind, className: f.className, classCode: f.classCode, teacher: f.teacher, due: f.due, unit: f.unit, classmates: def.classmates, groups: assignmentGroupsOf(c, id) };
  if (def.kind === "finished") return { ...base, title: f.title, name: def.name ?? f.title, unitNumber: f.unit.number, goal: f.goal, problems: f.problems, pathway: def.pathway, sam: def.sam };
  const active = activeAssignment(c);
  return { ...base, title: active.title, name: active.title === f.title ? (def.name ?? f.title) : active.title, unitNumber: active.unit, goal: active.goal, problems: active.problems, pathway: pathwayOf(c), sam: null };
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
 * set Sam's comes from his session; on a finished set he handed in. `now` is for ticket 189's
 * stream, which makes the classmates' progress a function of the time since the set went live.
 */
export function rosterProgress(b: AssignmentBundle, session: StudentSession | null, now: number): Record<string, StudentProgress> {
  void now;
  const sam: StudentProgress = b.kind === "live" ? sessionProgress(session, b.problems) : { kind: "submitted" };
  return { [DEMO_STUDENT.id]: sam, ...Object.fromEntries(b.classmates.map((m) => [m.id, classmateProgress(m, b.problems)])) };
}

/** How many of the class have handed the set in, and whether that is all of them. */
export function submittedCount(b: AssignmentBundle, session: StudentSession | null, now: number): { submitted: number; total: number } {
  const all = Object.values(rosterProgress(b, session, now));
  return { submitted: all.filter(isSubmitted).length, total: all.length };
}

/** The set's pathway, stage by stage: a live set's from the classroom and the session; a finished set's all over. */
export function assignmentStages(b: AssignmentBundle, c: ClassroomState | null | undefined, session: StudentSession | null, now: number): ClassStage[] {
  if (b.kind === "finished") {
    const ids: ClassStageId[] = ["working", ...b.pathway];
    return ids.map((id) => ({ id, word: CLASS_STAGE_WORD[id], state: "over", done: null, total: 1 + b.classmates.length }));
  }
  return classStages(c, session, now, b.classmates);
}

/** The stage the set is on, or null once every stage is over. */
export const currentStageOf = (stages: readonly ClassStage[]): ClassStage | null => stages.find((s) => s.state === "current") ?? null;

/**
 * Where opening a set lands (ticket 185): on Class once everyone has handed in or the set is past
 * individual working (a review stage, or finished); on Mistakes while the class is still working.
 */
export function landingFor(everyoneSubmitted: boolean, stage: ClassStageId | null): Extract<AssignmentTab, "class" | "mistakes"> {
  return everyoneSubmitted || stage !== "working" ? "class" : "mistakes";
}

export function landingTab(b: AssignmentBundle, c: ClassroomState | null | undefined, session: StudentSession | null, now: number): Extract<AssignmentTab, "class" | "mistakes"> {
  const { submitted, total } = submittedCount(b, session, now);
  return landingFor(submitted >= total, currentStageOf(assignmentStages(b, c, session, now))?.id ?? null);
}

/** The Classroom, and the class's default groups on it. */
export const CLASSROOM_HREF = "/teacher";
export const CLASS_GROUPS_HREF = "/teacher/groups";

/** A set's page: no tab is the landing, which redirects to Class or Mistakes. */
export function assignmentHref(id: string, tab?: AssignmentTab): string {
  return tab ? `/teacher/a/${id}/${tab}` : `/teacher/a/${id}`;
}

/** A student's individual view on a set (ticket 187): no student is Sam. `/teacher/report` redirects to Problem Set 2's. */
export function assignmentReportHref(id: string, student?: string): string {
  return `/teacher/a/${id}/report${student ? `?student=${encodeURIComponent(student)}` : ""}`;
}

/** The tabs a set's header offers: Groups only when its pathway has group review. */
export function assignmentTabs(b: Pick<AssignmentBundle, "id" | "pathway">): { tab: AssignmentTab; label: string; href: string }[] {
  const all: { tab: AssignmentTab; label: string }[] = [
    { tab: "class", label: "Class" },
    { tab: "mistakes", label: "Mistakes" },
    { tab: "groups", label: "Groups" },
  ];
  return all.filter((t) => t.tab !== "groups" || b.pathway.includes("group")).map((t) => ({ ...t, href: assignmentHref(b.id, t.tab) }));
}
