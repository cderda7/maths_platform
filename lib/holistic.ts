import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATE_MAP } from "@/data/classmates";
import { STORY, STORY_CATEGORIES, STORY_SETS, type StoryCategory } from "@/data/story";
import { categoryName } from "@/data/taxonomy";
import type { Problem, Status } from "@/data/types";
import { patternTagLabel } from "@/data/patternTags";
import { assignmentBundle, rosterEvidence, type AssignmentBundle } from "./assignments";
import type { ClassroomState } from "./classroom";
import { dueOrder } from "./dueDate";
import { categoriesTouched, hierarchyFor, type HierarchyResult } from "./hierarchy";
import type { StudentSession } from "./session";

/**
 * A student across every set (ticket 251): the view model of the holistic page, one student's summary line,
 * the category × set grid and the patterns behind every result short of secure, organised by category. Pure.
 *
 * The source is the class story sheet (`data/story.ts`), which the finished sets equal (`data/finishedSets.test.ts`).
 * The live set (Problem Set 6) is read as its Class View reads it now (`rosterEvidence`): Sam from his session, each
 * classmate as far as the stream has reached, so the page never shows a result the class has not produced yet; its
 * patterns are the sheet's, on the problems the teacher can see so far. A set the Classroom does not hold (Problem Set 6
 * before Create) has no column: the page shows the sets a teacher could open. A student marked absent on a set (ticket 250,
 * the bundle's `absent`, the list the Class View greys its row by) reads absent in every category that set assesses, with no patterns. See DECISION_LOG.md, 2026-09-14 (ticket 251).
 *
 * Only recent patterns surface (ticket 276, `surfacing`): a pattern shows when it occurred on one of the class's five
 * most recent sets, and then with every set it occurred on, older ones included. The tiles read the view, so they
 * surface exactly what the page does. See DECISION_LOG.md, 2026-09-14 (ticket 276).
 */

/**
 * What a cell reads: the four colours, `unseen` (the set assesses the category but the student has nothing on it),
 * `absent` (the student was away for the set, ticket 250), `none` (the set does not assess it, the sheet's "—").
 */
export type HolisticStatus = Status | "absent" | "none";

export interface HolisticSet {
  /** The set's id (`pset-4`): its per-assignment report and Class View. */
  id: string;
  /** "PS4". */
  label: string;
  /** The set's topic, its name after the dash: "Non-monic factorising and completing the square". */
  topic: string;
  /** As on the card: "Fri 4 Sep". */
  due: string;
  /** A finished set: its results are final. The live set is still being handed in, so "not seen" there is not yet a result (ticket 252's strengths). */
  finished: boolean;
}

export interface HolisticCategory {
  category: StoryCategory;
  name: string;
  /** One per set, in the sets' order. */
  cells: HolisticStatus[];
}

/** One set a pattern shows on: the set, its result there, and the problems that carry it. */
export interface PatternRef {
  set: string;
  label: string;
  status: Status;
  problems: { id: string; label: string }[];
}

/**
 * One wording of a pattern, once per category however many sets it shows on (the same words on two sets are one
 * wording with two refs), oldest set first. Wordings that share a `tag` are one pattern (`data/patternTags.ts`).
 */
export interface HolisticPattern {
  text: string;
  /** The pattern this wording belongs to: its tag's label, or the wording itself (`patternTagLabel`). */
  tag: string;
  refs: PatternRef[];
}

export interface PatternGroup {
  category: StoryCategory;
  name: string;
  patterns: HolisticPattern[];
}

export interface HolisticView {
  student: { id: string; name: string; initials: string };
  /** The story sheet's line for the student. */
  summary: string;
  /** The sets the Classroom holds, oldest first: the grid's rows (ticket 269). */
  sets: HolisticSet[];
  /** Every story category in canonical order, each with its cell per set: the grid's columns (ticket 269). */
  categories: HolisticCategory[];
  /** Categories with a pattern that surfaces (`surfacing`), in canonical order; none for a student secure everywhere. */
  patterns: PatternGroup[];
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

/** How many of the class's most recent sets a pattern must have occurred on one of to surface (ticket 276). */
export const RECENT_SETS = 5;

/** The recent window (ticket 276): the ids of the class's latest `RECENT_SETS` sets by due date; sets due the same day keep the order given. */
export function recentSets(sets: readonly { id: string; due: string }[]): Set<string> {
  const byDue = [...sets].sort((a, b) => dueOrder(a.due) - dueOrder(b.due));
  return new Set(byDue.slice(-RECENT_SETS).map((s) => s.id));
}

/**
 * The patterns that surface (ticket 276), the one rule the page and the tiles read: a pattern (the wordings sharing a
 * tag) surfaces when one of its occurrences is on a set in the recent window, and a surfacing pattern keeps every
 * wording and every occurrence, older sets included. A pattern seen on one set only surfaces too, if that set is recent.
 * The live set's occurrences are only those the teacher has seen, so an unseen one does not count. Order kept.
 */
export function surfacing<T extends { tag: string; refs: readonly { set: string }[] }>(patterns: readonly T[], window: ReadonlySet<string>): T[] {
  const recent = new Set(patterns.filter((p) => p.refs.some((r) => window.has(r.set))).map((p) => p.tag));
  return patterns.filter((p) => recent.has(p.tag));
}

/** The set's name after its dash ("Problem Set 4 — Non-monic …" → "Non-monic …"); a name without one whole. */
const topicOf = (name: string): string => name.split(" — ").slice(1).join(" — ") || name;

export function holisticView(student: string, { classroom, session, now }: HolisticNow): HolisticView | null {
  if (!isHolisticStudent(student)) return null;
  const row = STORY[student];
  const who = student === DEMO_STUDENT.id ? DEMO_STUDENT : CLASSMATE_MAP[student];
  const bundles = STORY_SETS.flatMap((s) => {
    const bundle = assignmentBundle(s.id, classroom);
    return bundle ? [{ story: s, bundle }] : [];
  });

  /** Each set's cell and patterns for the student. */
  const read = bundles.map(({ story, bundle }) => {
    const i = story.n - 1;
    if (bundle.absent.includes(student)) return STORY_CATEGORIES.map((c) => ({ status: (categoriesTouched(bundle).includes(c) ? "absent" : "none") as HolisticStatus, patterns: [] }));
    if (bundle.kind === "finished") {
      return STORY_CATEGORIES.map((c) => {
        const cell = row.cells[c][i];
        // The sheet's absent is the demo's list; a set the teacher has marked them present on reads what they have (none).
        const status: HolisticStatus = cell.status === "live" || cell.status === "absent" ? "unseen" : cell.status;
        return { status, patterns: cell.patterns.map((h) => ({ text: h.text, problems: h.problems.flatMap((n) => problemAt(bundle, n)) })) };
      });
    }
    return liveCells(bundle, student, i, { classroom, session, now });
  });

  const sets: HolisticSet[] = bundles.map(({ story, bundle }) => ({ id: bundle.id, label: `PS${story.n}`, topic: topicOf(bundle.name), due: bundle.due, finished: bundle.kind === "finished" }));
  const categories: HolisticCategory[] = STORY_CATEGORIES.map((c, k) => ({ category: c, name: categoryName(c).name, cells: read.map((cells) => cells[k].status) }));

  const window = recentSets(sets);
  const patterns: PatternGroup[] = STORY_CATEGORIES.flatMap((c, k) => {
    const all: HolisticPattern[] = [];
    read.forEach((cells, j) => {
      const { status, patterns: ps } = cells[k];
      if (!SHORT.includes(status as Status)) return;
      for (const p of ps) {
        if (p.problems.length === 0) continue;
        const ref: PatternRef = { set: sets[j].id, label: sets[j].label, status: status as Status, problems: p.problems };
        const same = all.find((x) => x.text === p.text);
        if (same) same.refs.push(ref);
        else all.push({ text: p.text, tag: patternTagLabel(student, c, p.text), refs: [ref] });
      }
    });
    const out = surfacing(all, window);
    return out.length ? [{ category: c, name: categoryName(c).name, patterns: out }] : [];
  });

  return { student: { id: student, name: who.name, initials: who.initials }, summary: row.arc, sets, categories, patterns };
}

/** The work behind a student's row of results on one set (ticket 277): the set's skill hierarchy for them, their lines, the set's problems. */
export interface HolisticWork {
  result: HierarchyResult;
  lines: Record<string, string[]>;
  problems: Problem[];
}

/**
 * What a grid cell opens (ticket 277): the student's hierarchy on the set as its Class View reads it (`rosterEvidence`,
 * the same evidence the live row's cells come from), so the tree under a result always rolls up to that result
 * (`holistic.test.ts` holds every coloured cell to it). Null for an unknown student or set, or a set they were away for.
 */
export function holisticWork(student: string, set: string, { classroom, session, now }: HolisticNow): HolisticWork | null {
  if (!isHolisticStudent(student)) return null;
  const bundle = assignmentBundle(set, classroom);
  if (!bundle || bundle.absent.includes(student)) return null;
  const evidence = rosterEvidence(bundle, session, now)[student];
  if (!evidence) return null;
  return { result: hierarchyFor(evidence, bundle), lines: evidence.lines, problems: bundle.problems };
}

/** Problem `n` (Q1 = 1) of a set as the set holds it: its id and label; none when the set does not hold it (a created set without that problem). */
function problemAt(bundle: Pick<AssignmentBundle, "problems">, n: number, fixture: readonly { id: string }[] = bundle.problems): { id: string; label: string }[] {
  const id = fixture[n - 1]?.id;
  const p = bundle.problems.find((x) => x.id === id);
  return p ? [{ id: p.id, label: p.label }] : [];
}

/**
 * The live set's cells for a student, as its Class View reads them now: the status from the student's evidence (a
 * category the set's problems do not touch is "—"), and the sheet's patterns kept on the problems the teacher has seen.
 */
function liveCells(bundle: AssignmentBundle, student: string, i: number, at: HolisticNow): { status: HolisticStatus; patterns: { text: string; problems: { id: string; label: string }[] }[] }[] {
  const evidence = rosterEvidence(bundle, at.session, at.now)[student];
  const result = hierarchyFor(evidence, bundle);
  const touched = categoriesTouched(bundle);
  // The sheet numbers the live set's problems as the fixture has them; a created set may hold fewer.
  const fixture = ASSIGNMENT.problems;
  return STORY_CATEGORIES.map((c) => {
    if (!touched.includes(c)) return { status: "none" as const, patterns: [] };
    const status: HolisticStatus = result.categories[c] ?? "unseen";
    const patterns = STORY[student].cells[c][i].patterns.map((h) => ({ text: h.text, problems: h.problems.flatMap((n) => problemAt(bundle, n, fixture)).filter((p) => (evidence.lines[p.id]?.length ?? 0) > 0) }));
    return { status, patterns };
  });
}
