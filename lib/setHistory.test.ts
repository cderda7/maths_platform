import { describe, expect, it } from "vitest";
import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATES, type Classmate } from "@/data/classmates";
import { PS5_ASSIGNMENT, PS5_PROBLEMS } from "@/data/pset5/assignment";
import { PS5_CLASSMATES, PS5_SAM } from "@/data/pset5/classmates";
import { NEW_SKILLS, type CategoryId } from "@/data/taxonomy";
import type { Problem, Status } from "@/data/types";
import { assignmentBundle, assignmentHref, assignmentIds, earlierAssignmentIds } from "./assignments";
import { INITIAL_CLASSROOM, classroomReducer } from "./classroom";
import { categoriesTouched, classmateHierarchy } from "./hierarchy";
import { FINISHED_SETS } from "./finishedSets";
import { ALL_SECURE_STUDENT, HISTORY_LENGTH, parseDay, pillLabel, simulatedDates, stepsApart, type HistoryPoint } from "./history";
import { assessed, categoryHistory, earlierResults, earlierSources, historyFrom, historyPillHref, type HistorySource } from "./setHistory";

const ps5Everyone = [PS5_SAM, ...PS5_CLASSMATES];
const ps5Record = (student: string): Classmate | null => ps5Everyone.find((c) => c.id === student) ?? null;
const DAY = 24 * 60 * 60 * 1000;

/** The problems of Problem Set 5 that do not touch a category, so a synthetic set can skip it. */
const problemsWithout = (category: CategoryId): Problem[] => PS5_PROBLEMS.filter((p) => !categoriesTouched({ problems: [p], newSkills: [] }).includes(category));

/** A synthetic earlier set built from Problem Set 5's problems and records (the registry has only Sets 5 and 6 today). */
const synthetic = (n: number, due: string, opts: { problems?: Problem[]; newSkills?: HistorySource["newSkills"] } = {}): HistorySource => ({
  id: `synthetic-${n}`,
  name: `Problem Set ${n} — synthetic`,
  due,
  problems: opts.problems ?? PS5_PROBLEMS,
  newSkills: opts.newSkills ?? PS5_ASSIGNMENT.newSkills,
  record: ps5Record,
});

describe("history reads real earlier sets (ticket 215)", () => {
  // Six earlier sets like the class's Sets 1 to 5 and one more; Sets 1 and 3 never touch graphing, Set 2 has no New skills.
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
    const graphing = historyFrom(sets, "Thu 10 Sep", "mia", "graphing", "solid");
    expect(graphing.map((p) => p.set?.id ?? null)).toEqual([null, "synthetic-0", "synthetic-2", "synthetic-4", "synthetic-5"]);
    const algebra = historyFrom(sets, "Thu 10 Sep", "mia", "algebra", "solid");
    expect(algebra.map((p) => p.set?.id)).toEqual(["synthetic-1", "synthetic-2", "synthetic-3", "synthetic-4", "synthetic-5"]);
    const news = historyFrom(sets, "Thu 10 Sep", "mia", NEW_SKILLS, "solid");
    expect(news.map((p) => p.set?.id)).toEqual(["synthetic-0", "synthetic-1", "synthetic-3", "synthetic-4", "synthetic-5"]);
    for (const h of [graphing, algebra, news]) expect(h).toHaveLength(HISTORY_LENGTH);
    // The real status is the student's roll-up on that set.
    expect(graphing[4].status).toBe(classmateHierarchy(ps5Record("mia")!, sets[5]).categories.graphing ?? "unseen");
  });

  it("too few sets: simulated points fill the top, the oldest a week before the first set, the rest between it and the first set, on weekdays", () => {
    const two = [synthetic(1, "Tue 25 Aug", { problems: problemsWithout("graphing") }), synthetic(2, "Fri 28 Aug")];
    const graphing = historyFrom(two, "Tue 1 Sep", "mia", "graphing", "solid");
    expect(graphing.map((p) => p.date)).toEqual(["Tue 18 Aug", "Wed 19 Aug", "Fri 21 Aug", "Mon 24 Aug", "Fri 28 Aug"]);
    expect(graphing.map((p) => p.set?.id ?? null)).toEqual([null, null, null, null, "synthetic-2"]);
    const algebra = historyFrom(two, "Tue 1 Sep", "mia", "algebra", "solid");
    expect(algebra.map((p) => p.date)).toEqual(["Tue 18 Aug", "Thu 20 Aug", "Mon 24 Aug", "Tue 25 Aug", "Fri 28 Aug"]);
    // The first set alone: five simulated, the week before it.
    const own = historyFrom([], "Tue 25 Aug", "mia", "algebra", "solid");
    expect(own.map((p) => p.date)).toEqual(["Tue 18 Aug", "Wed 19 Aug", "Thu 20 Aug", "Fri 21 Aug", "Mon 24 Aug"]);
    expect(own.every((p) => p.set === null)).toBe(true);
  });

  it("simulated days never fall on a weekend or on or after the first set, and run oldest first, for any first day and any number", () => {
    for (let day = 1; day <= 30; day++) {
      const first = `${day} Sep`;
      for (let real = 0; real < HISTORY_LENGTH; real++) {
        const sets = Array.from({ length: real }, (_, i) => synthetic(i + 1, i === 0 ? first : `${Math.min(30, day + i)} Sep`));
        const h = historyFrom(sets, first, "mia", "algebra", "solid");
        const simulated = h.filter((p) => !p.set).map((p) => parseDay(p.date)!);
        expect(simulated).toHaveLength(HISTORY_LENGTH - real);
        expect(simulated[0], first).toBe(parseDay(first)! - 7 * DAY);
        for (let i = 1; i < simulated.length; i++) {
          expect(simulated[i]).toBeGreaterThan(simulated[i - 1]);
          expect(simulated[i]).toBeLessThan(parseDay(first)!);
          expect([0, 6]).not.toContain(new Date(simulated[i]).getUTCDay());
        }
      }
    }
  });

  it("the simulated walk moves at most one step between neighbours and ends within one step of the oldest real pill, for every student, category and status", () => {
    const statuses: Status[] = ["gap", "developing", "solid", "secure", "unseen"];
    for (const c of ps5Everyone) {
      for (const cat of categoriesTouched(ASSIGNMENT)) {
        // Priya is dark green today everywhere (and so on every set behind): only that anchor is hers.
        for (const today of c.id === ALL_SECURE_STUDENT ? (["secure"] as Status[]) : statuses) {
          for (const n of [0, 1, 2, 4]) {
            const h = historyFrom(sets.slice(0, n), "Thu 10 Sep", c.id, cat, today);
            // Up to and including the oldest real pill (today's with none): the walk's own steps and its landing.
            const firstReal = h.findIndex((p) => p.set);
            if (firstReal < 0) expectNoJumps(h, today, `${c.id} ${cat} ${today} ${n}`);
            else expectNoJumps(h.slice(0, firstReal), h.slice(firstReal).find((p) => p.status !== "unseen")?.status ?? today, `${c.id} ${cat} ${today} ${n}`);
            expect(h.filter((p) => !p.set).every((p) => p.status !== "unseen")).toBe(true);
          }
        }
      }
    }
  });

  it("is the same on every call, and differs between students", () => {
    expect(historyFrom([], "Mon 7 Sep", "tomas", "algebra", "developing")).toEqual(historyFrom([], "Mon 7 Sep", "tomas", "algebra", "developing"));
    const seen = new Set(PS5_CLASSMATES.map((c) => historyFrom([], "Mon 7 Sep", c.id, "algebra", "developing").map((p) => p.status).join()));
    expect(seen.size).toBeGreaterThan(3);
  });

  it("a real pill reads the set's short name and day; a simulated one the day alone; its link opens that set's Class View on the student's history", () => {
    const h = historyFrom(sets.slice(4), "Thu 10 Sep", "mia", "algebra", "solid");
    expect(pillLabel(h[4])).toBe("PS5 · Mon 7 Sep");
    expect(pillLabel(h[0])).toBe("Fri 28 Aug");
    expect(historyPillHref("pset-5", "mia", "algebra")).toBe(`${assignmentHref("pset-5", "class")}?history=mia&open=algebra`);
  });
});

describe("history over the Classroom's registry (ticket 215)", () => {
  const classroom = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: ASSIGNMENT.title, problemIds: ASSIGNMENT.problems.map((p) => p.id), pathway: ["individual", "group"], at: 1_700_000_000_000 });
  const ids = assignmentIds(classroom);

  /** Every registered set's final records: a finished set's bundle, and the live set's full classmates (Sam's live session has no fixed record). */
  const recordsOf = (id: string): Classmate[] => {
    const b = assignmentBundle(id, classroom)!;
    return b.kind === "finished" ? [b.sam!, ...b.classmates] : [...CLASSMATES];
  };

  // Registry-derived (ticket 210): these hold as Problem Sets 1–4 are registered (tickets 211–214); the synthetic suite above pins the dates.
  it("on Problem Set 6 each category's newest pill is Problem Set 5, linked; the real pills are the last registered sets that assessed the category, oldest first; simulated pills come before the class's first set", () => {
    expect(ids).toEqual([ASSIGNMENT.id, ...[...FINISHED_SETS].reverse().map((s) => s.fixture.id)]);
    const sources = earlierSources("pset-6");
    const firstDay = parseDay(FINISHED_SETS[0].fixture.due)!;
    for (const c of ps5Everyone) {
      for (const cat of categoriesTouched(ASSIGNMENT)) {
        const h = categoryHistory({ id: "pset-6", due: ASSIGNMENT.due }, c.id, cat, "solid");
        expect(h).toHaveLength(HISTORY_LENGTH);
        expect(h.flatMap((p) => (p.set ? [p.set.id] : []))).toEqual(sources.filter((s) => assessed(s, cat)).slice(-HISTORY_LENGTH).map((s) => s.id));
        expect(h[4].set).toMatchObject({ id: "pset-5", short: "PS5", due: "Mon 7 Sep" });
        expect(h[4].status).toBe(classmateHierarchy(c, PS5_ASSIGNMENT).categories[cat] ?? "unseen");
        for (const p of h.filter((x) => !x.set)) expect(parseDay(p.date)!, `${c.id} ${cat} ${p.date}`).toBeLessThan(firstDay);
      }
    }
    expect(pillLabel(categoryHistory({ id: "pset-6", due: ASSIGNMENT.due }, "mia", "algebra", "solid")[4])).toBe("PS5 · Mon 7 Sep");
  });

  it("on the class's first set all five are simulated, the week before it", () => {
    const first = FINISHED_SETS[0].fixture;
    for (const cat of categoriesTouched(first)) {
      const h = categoryHistory({ id: first.id, due: first.due }, "mia", cat, "developing");
      expect(h.map((p) => p.date)).toEqual(simulatedDates(first.due, HISTORY_LENGTH));
      expect(h.every((p) => p.set === null)).toBe(true);
    }
  });

  it("reads real statuses: Priya dark green, Liam nothing seen on Problem Set 5, a student with no record skipped", () => {
    for (const cat of categoriesTouched(ASSIGNMENT)) {
      expect(earlierResults("pset-6", "priya", cat).every((r) => r.status === "secure")).toBe(true);
      expect(earlierResults("pset-6", "liam", cat).at(-1)).toMatchObject({ status: "unseen" });
      expect(earlierResults("pset-6", "nobody", cat)).toEqual([]);
      expect(earlierResults(FINISHED_SETS[0].fixture.id, "mia", cat)).toEqual([]);
    }
    expect(earlierSources("pset-6").map((s) => s.id)).toEqual(earlierAssignmentIds("pset-6"));
  });

  it("every set × student × category: no neighbouring pills, nor the newest against today's, more than one step apart, real results included (the class story sheet, ticket 210); Priya dark green throughout", () => {
    const jumps: string[] = [];
    for (const id of ids) {
      const b = assignmentBundle(id, classroom)!;
      for (const record of recordsOf(id)) {
        const today = classmateHierarchy(record, b).categories;
        for (const cat of categoriesTouched(b)) {
          const now = today[cat] ?? "unseen";
          const h = categoryHistory(b, record.id, cat, now);
          const chain = [...h.map((p) => ({ status: p.status, from: p.set?.id ?? null })), { status: now, from: `${id} (today)` }];
          for (let i = 1; i < chain.length; i++) {
            if (stepsApart(chain[i - 1].status, chain[i].status) <= 1) continue;
            jumps.push(`${record.id} ${cat}: ${chain[i - 1].from} ${chain[i - 1].status} → ${chain[i].from} ${chain[i].status}`);
          }
          if (record.id === ALL_SECURE_STUDENT) expect(chain.every((p) => p.status === "secure"), `${id} ${cat}`).toBe(true);
        }
      }
    }
    // Ticket 210 made Problem Set 5 agree with the class story sheet: no real pair jumps either.
    expect(jumps).toEqual([]);
  });

  it("Sam's live row on Problem Set 6 has no fixed record, and his history still reads his Problem Set 5 result", () => {
    const h = categoryHistory({ id: "pset-6", due: ASSIGNMENT.due }, DEMO_STUDENT.id, "algebra", "unseen");
    expect(h[4].set?.id).toBe("pset-5");
    expectNoJumps(h.slice(0, 5), h[4].status, "sam");
  });
});

function expectNoJumps(h: readonly HistoryPoint[], today: Status, what: string) {
  const chain = [...h.map((p) => p.status), today];
  for (let i = 1; i < chain.length; i++) expect(stepsApart(chain[i - 1], chain[i]), `${what}: ${chain.join(" ")}`).toBeLessThanOrEqual(1);
}
