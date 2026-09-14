import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATE_MAP } from "@/data/classmates";
import { STORY, STORY_CATEGORIES, STORY_SETS, type StoryCategory } from "@/data/story";
import { categoryName } from "@/data/taxonomy";
import type { Status } from "@/data/types";
import { assignmentBundle, rosterEvidence, type AssignmentBundle } from "./assignments";
import type { ClassroomState } from "./classroom";
import { categoriesTouched, hierarchyFor } from "./hierarchy";
import type { StudentSession } from "./session";

/**
 * A student across every set (ticket 251): the view model of the holistic page, one student's summary line,
 * the category × set grid and the habits behind every result short of secure, organised by category. Pure.
 *
 * The source is the class story sheet (`data/story.ts`), which the finished sets equal (`data/finishedSets.test.ts`).
 * The live set (Problem Set 6) is read as its Class View reads it now (`rosterEvidence`): Sam from his session, each
 * classmate as far as the stream has reached, so the page never shows a result the class has not produced yet; its
 * habits are the sheet's, on the problems the teacher can see so far. A set the Classroom does not hold (Problem Set 6
 * before Create) has no column: the page shows the sets a teacher could open. A student marked absent on a set (ticket 250,
 * the bundle's `absent`, the list the Class View greys its row by) reads absent in every category that set assesses, with no habits. See DECISION_LOG.md, 2026-09-14 (ticket 251).
 */

/**
 * What a cell reads: the four colours, `unseen` (the set assesses the category but the student has nothing on it),
 * `absent` (the student was away for the set, ticket 250), `none` (the set does not assess it, the sheet's "—").
 */
export type HolisticStatus = Status | "absent" | "none";

export interface HolisticColumn {
  /** The set's id (`pset-4`): its per-assignment report and Class View. */
  id: string;
  /** "PS4". */
  label: string;
  /** The set's topic, its name after the dash: "Non-monic factorising and completing the square". */
  topic: string;
  /** As on the card: "Fri 4 Sep". */
  due: string;
  /** Sam's column on the live set: his session, still moving. */
  live: boolean;
}

export interface HolisticRow {
  category: StoryCategory;
  name: string;
  /** One per column, in the columns' order. */
  cells: HolisticStatus[];
}

/** One set a habit shows on: the set, its result there, and the problems that carry it. */
export interface HabitRef {
  set: string;
  label: string;
  status: Status;
  problems: { id: string; label: string }[];
}

/** A habit, once per category however many sets it shows on (the same words on two sets are one habit with two refs), oldest set first. */
export interface HolisticHabit {
  text: string;
  refs: HabitRef[];
}

export interface HabitGroup {
  category: StoryCategory;
  name: string;
  habits: HolisticHabit[];
}

export interface HolisticView {
  student: { id: string; name: string; initials: string };
  /** The story sheet's line for the student. */
  summary: string;
  columns: HolisticColumn[];
  rows: HolisticRow[];
  /** Categories with a habit, in canonical order; none for a student secure everywhere. */
  habits: HabitGroup[];
}

/** The live world the live set is read from: the classroom, Sam's session, the clock. */
export interface HolisticNow {
  classroom: ClassroomState | null | undefined;
  session: StudentSession | null;
  now: number;
}

/** Whether an id is one of the twenty (a route's 404 otherwise). */
export const isHolisticStudent = (id: string): boolean => Object.hasOwn(STORY, id);

const SHORT: readonly Status[] = ["gap", "developing", "solid"];

/** The set's name after its dash ("Problem Set 4 — Non-monic …" → "Non-monic …"); a name without one whole. */
const topicOf = (name: string): string => name.split(" — ").slice(1).join(" — ") || name;

export function holisticView(student: string, { classroom, session, now }: HolisticNow): HolisticView | null {
  if (!isHolisticStudent(student)) return null;
  const row = STORY[student];
  const who = student === DEMO_STUDENT.id ? DEMO_STUDENT : CLASSMATE_MAP[student];
  const sets = STORY_SETS.flatMap((s) => {
    const bundle = assignmentBundle(s.id, classroom);
    return bundle ? [{ story: s, bundle }] : [];
  });

  /** Each set's cell and habits for the student. */
  const read = sets.map(({ story, bundle }) => {
    const i = story.n - 1;
    if (bundle.absent.includes(student)) return STORY_CATEGORIES.map((c) => ({ status: (categoriesTouched(bundle).includes(c) ? "absent" : "none") as HolisticStatus, habits: [] }));
    if (bundle.kind === "finished") {
      return STORY_CATEGORIES.map((c) => {
        const cell = row.cells[c][i];
        // The sheet's absent is the demo's list; a set the teacher has marked them present on reads what they have (none).
        const status: HolisticStatus = cell.status === "live" || cell.status === "absent" ? "unseen" : cell.status;
        return { status, habits: cell.habits.map((h) => ({ text: h.text, problems: h.problems.flatMap((n) => problemAt(bundle, n)) })) };
      });
    }
    return liveCells(bundle, student, i, { classroom, session, now });
  });

  const columns: HolisticColumn[] = sets.map(({ story, bundle }) => ({ id: bundle.id, label: `PS${story.n}`, topic: topicOf(bundle.name), due: bundle.due, live: bundle.kind === "live" && student === DEMO_STUDENT.id }));
  const rows: HolisticRow[] = STORY_CATEGORIES.map((c, k) => ({ category: c, name: categoryName(c).name, cells: read.map((cells) => cells[k].status) }));

  const habits: HabitGroup[] = STORY_CATEGORIES.flatMap((c, k) => {
    const out: HolisticHabit[] = [];
    read.forEach((cells, j) => {
      const { status, habits: hs } = cells[k];
      if (!SHORT.includes(status as Status)) return;
      for (const h of hs) {
        if (h.problems.length === 0) continue;
        const ref: HabitRef = { set: columns[j].id, label: columns[j].label, status: status as Status, problems: h.problems };
        const same = out.find((x) => x.text === h.text);
        if (same) same.refs.push(ref);
        else out.push({ text: h.text, refs: [ref] });
      }
    });
    return out.length ? [{ category: c, name: categoryName(c).name, habits: out }] : [];
  });

  return { student: { id: student, name: who.name, initials: who.initials }, summary: row.arc, columns, rows, habits };
}

/** Problem `n` (Q1 = 1) of a set as the set holds it: its id and label; none when the set does not hold it (a created set without that problem). */
function problemAt(bundle: Pick<AssignmentBundle, "problems">, n: number, fixture: readonly { id: string }[] = bundle.problems): { id: string; label: string }[] {
  const id = fixture[n - 1]?.id;
  const p = bundle.problems.find((x) => x.id === id);
  return p ? [{ id: p.id, label: p.label }] : [];
}

/**
 * The live set's cells for a student, as its Class View reads them now: the status from the student's evidence (a
 * category the set's problems do not touch is "—"), and the sheet's habits kept on the problems the teacher has seen.
 */
function liveCells(bundle: AssignmentBundle, student: string, i: number, at: HolisticNow): { status: HolisticStatus; habits: { text: string; problems: { id: string; label: string }[] }[] }[] {
  const evidence = rosterEvidence(bundle, at.session, at.now)[student];
  const result = hierarchyFor(evidence, bundle);
  const touched = categoriesTouched(bundle);
  // The sheet numbers the live set's problems as the fixture has them; a created set may hold fewer.
  const fixture = ASSIGNMENT.problems;
  return STORY_CATEGORIES.map((c) => {
    if (!touched.includes(c)) return { status: "none" as const, habits: [] };
    const status: HolisticStatus = result.categories[c] ?? "unseen";
    const habits = STORY[student].cells[c][i].habits.map((h) => ({ text: h.text, problems: h.problems.flatMap((n) => problemAt(bundle, n, fixture)).filter((p) => (evidence.lines[p.id]?.length ?? 0) > 0) }));
    return { status, habits };
  });
}
