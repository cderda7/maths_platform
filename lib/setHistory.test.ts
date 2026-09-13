import { describe, expect, it } from "vitest";
import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATES, type Classmate } from "@/data/classmates";
import { PS5_ASSIGNMENT, PS5_PROBLEMS } from "@/data/pset5/assignment";
import { PS5_CLASSMATES, PS5_SAM } from "@/data/pset5/classmates";
import { STORY_SETS } from "@/data/story";
import { CATEGORY_ORDER, NEW_SKILLS, type CategoryId } from "@/data/taxonomy";
import type { Problem } from "@/data/types";
import { assignmentBundle, assignmentHref, assignmentIds, earlierAssignmentIds } from "./assignments";
import { INITIAL_CLASSROOM, classroomReducer } from "./classroom";
import { categoriesTouched, classmateHierarchy } from "./hierarchy";
import { FINISHED_SETS } from "./finishedSets";
import { HISTORY_LENGTH, parseDay, pillLabel, stepsApart } from "./history";
import { assessed, categoryHistory, earlierReportSet, earlierResults, earlierSources, hasEarlierSets, historyFrom, historyReportHref, historyReturnHref, type HistorySource } from "./setHistory";

const ps5Everyone = [PS5_SAM, ...PS5_CLASSMATES];
const ps5Record = (student: string): Classmate | null => ps5Everyone.find((c) => c.id === student) ?? null;

/** The problems of Problem Set 5 that do not touch a category, so a synthetic set can skip it. */
const problemsWithout = (category: CategoryId): Problem[] => PS5_PROBLEMS.filter((p) => !categoriesTouched({ problems: [p], newSkills: [] }).includes(category));

/** A synthetic earlier set built from Problem Set 5's problems and records. */
const synthetic = (n: number, due: string, opts: { problems?: Problem[]; newSkills?: HistorySource["newSkills"] } = {}): HistorySource => ({
  id: `synthetic-${n}`,
  name: `Problem Set ${n} — synthetic`,
  due,
  problems: opts.problems ?? PS5_PROBLEMS,
  newSkills: opts.newSkills ?? PS5_ASSIGNMENT.newSkills,
  record: ps5Record,
});

describe("history reads real earlier sets only (tickets 215, 237)", () => {
  // Six earlier sets; Sets 1 and 3 never touch graphing, Set 2 has no New skills.
  const sets: HistorySource[] = [
    synthetic(0, "Fri 21 Aug"),
    synthetic(1, "Tue 25 Aug", { problems: problemsWithout("graphing") }),
    synthetic(2, "Fri 28 Aug", { newSkills: [] }),
    synthetic(3, "Tue 1 Sep", { problems: problemsWithout("graphing") }),
    synthetic(4, "Fri 4 Sep"),
    synthetic(5, "Mon 7 Sep"),
  ];

  it("the synthetic sets skip what they claim to", () => {
    expect(problemsWithout("graphing").length).toBeGreaterThan(0);
    expect(assessed(sets[1], "graphing")).toBe(false);
    expect(assessed(sets[1], "algebra")).toBe(true);
    expect(assessed(sets[2], NEW_SKILLS)).toBe(false);
    expect(assessed(sets[4], NEW_SKILLS)).toBe(true);
  });

  it("a category reaches back past the sets that did not assess it, and takes only the last five", () => {
    const graphing = historyFrom(sets, "mia", "graphing");
    expect(graphing.map((p) => p.set.id)).toEqual(["synthetic-0", "synthetic-2", "synthetic-4", "synthetic-5"]);
    const algebra = historyFrom(sets, "mia", "algebra");
    expect(algebra.map((p) => p.set.id)).toEqual(["synthetic-1", "synthetic-2", "synthetic-3", "synthetic-4", "synthetic-5"]);
    const news = historyFrom(sets, "mia", NEW_SKILLS);
    expect(news.map((p) => p.set.id)).toEqual(["synthetic-0", "synthetic-1", "synthetic-3", "synthetic-4", "synthetic-5"]);
    // The status is the student's roll-up on that set, and the date its day.
    expect(graphing[3]).toMatchObject({ date: "Mon 7 Sep", status: classmateHierarchy(ps5Record("mia")!, sets[5]).categories.graphing ?? "unseen" });
  });

  it("nothing is made up: fewer sets are fewer pills, none is none, a student who sat none has none", () => {
    const two = [synthetic(1, "Tue 25 Aug", { problems: problemsWithout("graphing") }), synthetic(2, "Fri 28 Aug")];
    expect(historyFrom(two, "mia", "graphing").map((p) => p.set.id)).toEqual(["synthetic-2"]);
    expect(historyFrom(two, "mia", "algebra").map((p) => p.date)).toEqual(["Tue 25 Aug", "Fri 28 Aug"]);
    expect(historyFrom([], "mia", "algebra")).toEqual([]);
    expect(historyFrom(two, "nobody", "algebra")).toEqual([]);
  });

  it("a pill reads its day; its link opens the student's report on that set inside this set's Class View; the way back reopens the history", () => {
    const h = historyFrom(sets.slice(4), "mia", "algebra");
    expect(h.map(pillLabel)).toEqual(["Fri 4 Sep", "Mon 7 Sep"]);
    expect(historyReportHref("pset-6", "pset-4", "mia", "graphing")).toBe(`${assignmentHref("pset-6", "class")}?report=pset-4&student=mia&open=graphing`);
    expect(historyReturnHref("pset-6", "mia", "graphing")).toBe(`${assignmentHref("pset-6", "class")}?history=mia&open=graphing`);
    expect(historyReturnHref("pset-6", "mia", null)).toBe(`${assignmentHref("pset-6", "class")}?history=mia`);
  });
});

describe("history over the Classroom's registry (tickets 215, 237)", () => {
  const classroom = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: ASSIGNMENT.title, problemIds: ASSIGNMENT.problems.map((p) => p.id), pathway: ["individual", "group"], at: 1_700_000_000_000 });
  const ids = assignmentIds(classroom);
  const first = FINISHED_SETS[0].fixture;

  /** Every registered set's final records: a finished set's bundle, and the live set's full classmates (Sam's live session has no fixed record). */
  const recordsOf = (id: string): Classmate[] => {
    const b = assignmentBundle(id, classroom)!;
    return b.kind === "finished" ? [b.sam!, ...b.classmates] : [...CLASSMATES];
  };

  it("every set's pills are exactly the earlier registered sets that assessed the category, the last five, oldest first", () => {
    expect(ids).toEqual([ASSIGNMENT.id, ...[...FINISHED_SETS].reverse().map((s) => s.fixture.id)]);
    for (const id of ids) {
      const sources = earlierSources(id);
      const b = assignmentBundle(id, classroom)!;
      for (const c of recordsOf(id)) {
        for (const cat of categoriesTouched(b)) {
          const h = categoryHistory(id, c.id, cat);
          expect(h.map((p) => p.set.id), `${id} ${c.id} ${cat}`).toEqual(sources.filter((s) => assessed(s, cat)).slice(-HISTORY_LENGTH).map((s) => s.id));
          const days = h.map((p) => parseDay(p.date)!);
          for (let i = 1; i < days.length; i++) expect(days[i]).toBeGreaterThan(days[i - 1]);
        }
      }
    }
  });

  it("Problem Set 6's Graphing reads Fri 4 Sep and Mon 7 Sep only (Sets 1–3 never assessed it); Problem Set 5's reaches back to Sets 1–4 where they assessed it", () => {
    expect(categoryHistory("pset-6", "mia", "graphing").map((p) => [p.set.id, pillLabel(p)])).toEqual([
      ["pset-4", "Fri 4 Sep"],
      ["pset-5", "Mon 7 Sep"],
    ]);
    expect(earlierAssignmentIds("pset-5")).toEqual(["pset-1", "pset-2", "pset-3", "pset-4"]);
    const ps5Longest = Math.max(...CATEGORY_ORDER.map((cat) => categoryHistory("pset-5", "mia", cat).length));
    expect(ps5Longest).toBe(4);
    expect(categoryHistory("pset-5", "mia", "graphing").map((p) => p.set.id)).toEqual(["pset-4"]);
  });

  it("the class's first set has no history: no earlier set, and every category empty; every later set has some", () => {
    expect(hasEarlierSets(first.id)).toBe(false);
    for (const cat of CATEGORY_ORDER) expect(categoryHistory(first.id, "mia", cat)).toEqual([]);
    for (const id of ids.filter((x) => x !== first.id)) expect(hasEarlierSets(id), id).toBe(true);
  });

  it("a history pill's report: only an earlier finished set the student sat; anything else shows the roster", () => {
    expect(earlierReportSet("pset-6", "pset-4", "mia")?.id).toBe("pset-4");
    expect(earlierReportSet("pset-6", "pset-4", DEMO_STUDENT.id)?.id).toBe("pset-4");
    expect(earlierReportSet("pset-4", "pset-5", "mia")).toBeNull();
    expect(earlierReportSet("pset-6", "pset-6", "mia")).toBeNull();
    expect(earlierReportSet("pset-6", "pset-9", "mia")).toBeNull();
    expect(earlierReportSet("pset-6", "pset-4", "nobody")).toBeNull();
    expect(earlierReportSet("pset-6", null, "mia")).toBeNull();
    expect(earlierReportSet("pset-6", "pset-4", null)).toBeNull();
  });

  it("reads real statuses: Priya dark green, Liam nothing seen on Problem Set 5, a student with no record skipped", () => {
    for (const cat of categoriesTouched(ASSIGNMENT)) {
      expect(earlierResults("pset-6", "priya", cat).every((r) => r.status === "secure")).toBe(true);
      expect(earlierResults("pset-6", "liam", cat).at(-1)).toMatchObject({ status: "unseen" });
      expect(earlierResults("pset-6", "nobody", cat)).toEqual([]);
      expect(earlierResults(first.id, "mia", cat)).toEqual([]);
      expect(categoryHistory("pset-6", "mia", cat).at(-1)?.set).toMatchObject({ id: "pset-5", due: "Mon 7 Sep" });
    }
    expect(earlierSources("pset-6").map((s) => s.id)).toEqual(earlierAssignmentIds("pset-6"));
  });

  it("every set × student × category: no neighbouring pills, nor the newest against today's, more than one step apart (the class story sheet, ticket 210); Priya dark green throughout", () => {
    const jumps: string[] = [];
    for (const id of ids) {
      const b = assignmentBundle(id, classroom)!;
      for (const record of recordsOf(id)) {
        const today = classmateHierarchy(record, b).categories;
        for (const cat of categoriesTouched(b)) {
          const now = today[cat] ?? "unseen";
          const chain = [...categoryHistory(id, record.id, cat).map((p) => ({ status: p.status, set: p.set.id, from: p.set.id })), { status: now, set: id, from: `${id} (today)` }];
          for (let i = 1; i < chain.length; i++) {
            if (stepsApart(chain[i - 1].status, chain[i].status) <= 1) continue;
            if (unregisteredBetween(chain[i - 1].set, chain[i].set)) continue;
            jumps.push(`${record.id} ${cat}: ${chain[i - 1].from} ${chain[i - 1].status} → ${chain[i].from} ${chain[i].status}`);
          }
          if (record.id === "priya") expect(chain.every((p) => p.status === "secure"), `${id} ${cat}`).toBe(true);
        }
      }
    }
    expect(jumps).toEqual([]);
  });

  it("Sam's live row on Problem Set 6 has no fixed record, and his history still reads his earlier results", () => {
    const h = categoryHistory("pset-6", DEMO_STUDENT.id, "algebra");
    expect(h.at(-1)?.set.id).toBe("pset-5");
    for (let i = 1; i < h.length; i++) {
      if (unregisteredBetween(h[i - 1].set.id, h[i].set.id)) continue;
      expect(stepsApart(h[i - 1].status, h[i].status), `sam: ${h.map((p) => p.status).join(" ")}`).toBeLessThanOrEqual(1);
    }
  });
});

/**
 * Whether two real sets in a history have a set of the class story sheet between them that is not registered yet (ticket 211).
 * Once every sheet set is registered this is never true, and every pair is checked.
 */
function unregisteredBetween(older: string | null, newer: string | null): boolean {
  if (!older || !newer) return false;
  const registered = new Set([ASSIGNMENT.id, ...FINISHED_SETS.map((s) => s.fixture.id)]);
  const from = STORY_SETS.findIndex((s) => s.id === older);
  const to = STORY_SETS.findIndex((s) => s.id === newer);
  return from >= 0 && to > from && STORY_SETS.slice(from + 1, to).some((s) => !registered.has(s.id));
}
