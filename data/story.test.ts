import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ASSIGNMENT, DEMO_STUDENT } from "./assignment";
import { CLASSMATES } from "./classmates";
import { GROUP_SCRIPTS } from "./group-scripts";
import { FROZEN_GROUPS } from "./groups";
import { STORY, STORY_CATEGORIES, STORY_RANK, STORY_REVIEW, STORY_SETS, storyAbsent, storyResults } from "./story";
import { DEMO_ABSENCES } from "./absences";
import { CATEGORY_ORDER, isLeafId } from "./taxonomy";
import { assignmentBundle } from "@/lib/assignments";
import { missedProblems, recordStatus, renderClassStory, reviewMismatches } from "@/lib/classStory";
import { topGap } from "@/lib/classroomCards";
import { dueOrder } from "@/lib/dueDate";
import { columnOf } from "@/lib/hierarchy";
import { mistakesByProblem } from "@/lib/mistakes";
import { skipFixture } from "@/lib/demo";
import { checkBoard } from "@/lib/groupReview";
import { sessionReviews } from "@/lib/report";

/**
 * The class story sheet (ticket 210): complete, one step at a time, and Problem Set 6's rows equal to the
 * classmates' real end state. Each registered finished set is checked against its rows in
 * `data/finishedSets.test.ts`.
 */

const SHEET = join(__dirname, "..", "specs", "class-story.md");
const students = Object.keys(STORY);

describe("the class story sheet (ticket 210)", () => {
  it("has the twenty students, Sam first, then the class order", () => {
    expect(students).toEqual([DEMO_STUDENT.id, ...CLASSMATES.map((c) => c.id)]);
  });

  it("has Problem Sets 1–6 in date order with the agreed New skills", () => {
    expect(STORY_SETS.map((s) => [s.n, s.id])).toEqual([1, 2, 3, 4, 5, 6].map((n) => [n, `pset-${n}`]));
    const order = STORY_SETS.map((s) => dueOrder(s.due));
    expect(order.every((d, i) => d > 0 && (i === 0 || d > order[i - 1]))).toBe(true);
    expect(STORY_SETS.map((s) => s.due)).toEqual(["Tue 25 Aug", "Fri 28 Aug", "Tue 1 Sep", "Fri 4 Sep", "Mon 7 Sep", "Thu 10 Sep"]);
    expect(STORY_SETS.map((s) => s.newSkills)).toEqual([
      ["algebra.number.surds"],
      ["algebra.number.surds", "algebra.expand-factor.binomial"],
      ["algebra.expand-factor.binomial"],
      ["algebra.expand-factor.binomial", "functions.zeros.nfl"],
      ["functions.zeros.nfl", "algebra.expand-factor.binomial"],
      ["algebra.equations.discriminant", "functions.zeros.nfl"],
    ]);
    for (const s of STORY_SETS) expect(s.categories).toEqual(CATEGORY_ORDER.filter((c) => (s.categories as readonly string[]).includes(c)));
  });

  it("Problem Set 6's row is the live fixture's", () => {
    const six = STORY_SETS[5];
    expect(six).toMatchObject({ id: ASSIGNMENT.id, due: ASSIGNMENT.due, newSkills: ASSIGNMENT.newSkills });
    expect(six.name).toBe(assignmentBundle(ASSIGNMENT.id, skipFixture("working", 0).classroom)!.name);
  });

  it("each set still to be authored has ten outlined problems whose leaves give exactly its categories, each New skill in two or more", () => {
    for (const s of STORY_SETS.filter((x) => x.outline)) {
      expect(s.outline, s.id).toHaveLength(10);
      for (const p of s.outline!) for (const l of p.leaves) expect(isLeafId(l), `${s.id} ${l}`).toBe(true);
      const cats = new Set(s.outline!.flatMap((p) => p.leaves.map((l) => columnOf(l, s.newSkills))));
      cats.add("communication");
      expect(s.categories, s.id).toEqual(CATEGORY_ORDER.filter((c) => cats.has(c)));
      for (const skill of s.newSkills) expect(s.outline!.filter((p) => p.leaves.includes(skill)).length, `${s.id} ${skill}`).toBeGreaterThanOrEqual(2);
    }
  });

  it("is complete: every student × category × set has a cell, — exactly where the set does not assess the category, live only for Sam on Set 6", () => {
    for (const id of students) {
      const row = STORY[id];
      expect(row.arc.length, id).toBeGreaterThan(20);
      expect(Object.keys(row.cells).sort(), id).toEqual([...STORY_CATEGORIES].sort());
      for (const c of STORY_CATEGORIES) {
        expect(row.cells[c], `${id} ${c}`).toHaveLength(6);
        row.cells[c].forEach((cell, i) => {
          const set = STORY_SETS[i];
          const where = `${id} ${c} ${set.id}`;
          expect(cell.status === "none", where).toBe(!set.categories.includes(c));
          expect(cell.status === "live", where).toBe(id === DEMO_STUDENT.id && set.n === 6);
        });
      }
      row.done.forEach((d, i) => {
        if (d === null) return expect(id === DEMO_STUDENT.id && i === 5, id).toBe(true);
        expect(d, `${id} set ${i + 1}`).toBeGreaterThanOrEqual(0);
        expect(d, `${id} set ${i + 1}`).toBeLessThanOrEqual(10);
        // Missing: nothing seen anywhere on that set. Absent (ticket 250): every assessed category reads absent.
        const away = storyAbsent(row, i);
        if (d === 0) for (const c of STORY_SETS[i].categories) expect(row.cells[c][i].status, `${id} ${c} set ${i + 1}`).toBe(away ? "absent" : "unseen");
        if (away) expect(d, `${id} set ${i + 1} absent`).toBe(0);
      });
    }
  });

  it("marks absent exactly the students the demo has away on each set (ticket 250): Chloe on Problem Set 6, nobody else", () => {
    for (const s of STORY_SETS) expect(students.filter((id) => storyAbsent(STORY[id], s.n - 1)), s.id).toEqual([...(DEMO_ABSENCES[s.id] ?? [])]);
    expect(DEMO_ABSENCES).toEqual({ "pset-6": ["chloe"] });
  });

  it("gives every result short of secure one or two habits on real problems of the set, and nothing else a habit", () => {
    for (const id of students) {
      for (const c of STORY_CATEGORIES) {
        STORY[id].cells[c].forEach((cell, i) => {
          const set = STORY_SETS[i];
          const where = `${id} ${c} ${set.id}`;
          const shortOfSecure = cell.status === "gap" || cell.status === "developing" || cell.status === "solid";
          if (!shortOfSecure) return expect(cell.habits, where).toEqual([]);
          expect(cell.habits.length, where).toBeGreaterThanOrEqual(1);
          expect(cell.habits.length, where).toBeLessThanOrEqual(2);
          for (const hb of cell.habits) {
            expect(hb.text.length, where).toBeGreaterThan(5);
            expect(hb.problems.length, where).toBeGreaterThan(0);
            for (const n of hb.problems) {
              expect(n, where).toBeGreaterThanOrEqual(1);
              expect(n, where).toBeLessThanOrEqual(10);
              // On a set still to be authored, the problem must carry the category (communication: any problem).
              if (set.outline && c !== "communication") expect(set.outline[n - 1].leaves.some((l) => columnOf(l, set.newSkills) === c), `${where} Q${n}`).toBe(true);
            }
          }
        });
      }
    }
  });

  it("never jumps: each student's neighbouring results in a category differ by at most one step", () => {
    const jumps: string[] = [];
    for (const id of students) {
      for (const c of STORY_CATEGORIES) {
        const rs = storyResults(id, c);
        for (let i = 1; i < rs.length; i++) if (Math.abs(STORY_RANK[rs[i].status] - STORY_RANK[rs[i - 1].status]) > 1) jumps.push(`${id} ${c}: PS${rs[i - 1].n} ${rs[i - 1].status} → PS${rs[i].n} ${rs[i].status}`);
      }
    }
    expect(jumps).toEqual([]);
  });

  it("Priya is secure in every category on every set and hands everything in", () => {
    const priya = STORY.priya;
    expect(priya.done).toEqual([10, 10, 10, 10, 10, 10]);
    STORY_SETS.forEach((s, i) => {
      for (const c of STORY_CATEGORIES) expect(priya.cells[c][i].status, `${c} ${s.id}`).toBe(s.categories.includes(c) ? "secure" : "none");
    });
  });

  it("Problem Set 6's rows equal the classmates' end state: status, hand-in count, and each habit on a problem where they missed it", () => {
    const six = STORY_SETS[5];
    for (const m of CLASSMATES) {
      const row = STORY[m.id];
      expect(row.done[5], m.id).toBe(m.done);
      for (const c of STORY_CATEGORIES) {
        const cell = row.cells[c][5];
        const away = (DEMO_ABSENCES[six.id] ?? []).includes(m.id);
        expect(cell.status, `${m.id} ${c}`).toBe(!six.categories.includes(c) ? "none" : away ? "absent" : recordStatus(m, ASSIGNMENT, c));
        const missed = missedProblems(m, ASSIGNMENT, c);
        for (const hb of cell.habits) for (const n of hb.problems) expect(missed, `${m.id} ${c} "${hb.text}"`).toContain(n);
      }
    }
  });

  it("Problem Set 6's top gap is the classmates' (Sam's live row aside)", () => {
    const b = assignmentBundle(ASSIGNMENT.id, skipFixture("working", 0).classroom)!;
    expect(topGap(mistakesByProblem(null, { ...b, startedAt: null }))!.name).toBe(STORY_SETS[5].topGap);
  });

  it("has a review part for every set: each student's cases in problem order, a known outcome and reasoning, none for Sam on the live set (ticket 244)", () => {
    expect(STORY_REVIEW).toHaveLength(STORY_SETS.length);
    STORY_REVIEW.forEach((review, i) => {
      for (const [id, rows] of Object.entries(review)) {
        expect(students, `PS${i + 1} ${id}`).toContain(id);
        expect(rows.length, `PS${i + 1} ${id}`).toBeGreaterThan(0);
        expect(rows.map((c) => c.q), `PS${i + 1} ${id}`).toEqual([...rows.map((c) => c.q)].sort((a, b) => a - b));
        for (const c of rows) {
          expect(["individual", "group", "wrong"], `PS${i + 1} ${id} Q${c.q}`).toContain(c.outcome);
          expect(c.why.length, `PS${i + 1} ${id} Q${c.q}`).toBeGreaterThan(30);
        }
      }
    });
    expect(STORY_REVIEW[5][DEMO_STUDENT.id]).toBeUndefined();
  });

  it("Problem Set 6's review part is the classmates' records, by the agreed rules, with the demo group's versions its scripted run (ticket 244)", () => {
    // Sky's group review is scripted: solved where the script's last attempt checks.
    const sky = Object.fromEntries(Object.entries(GROUP_SCRIPTS).map(([pid, s]) => [pid, checkBoard(pid, s.attempts.at(-1)!).correct]));
    expect(sky).toEqual({ q1: true, q2: true, q3: true, q7: false, q9: true, q10: true });
    expect(reviewMismatches(CLASSMATES, ASSIGNMENT, 6, FROZEN_GROUPS[ASSIGNMENT.id], { sky })).toEqual([]);
    // The check bites: a second submission taken away, a group version changed for one member, a last try that holds.
    const tamper = (id: string, pid: string, review: NonNullable<(typeof CLASSMATES)[number]["review"]>[string]) => CLASSMATES.map((c) => (c.id === id ? { ...c, review: { ...c.review, [pid]: review } } : c));
    const ethan = CLASSMATES.find((c) => c.id === "ethan")!;
    expect(reviewMismatches(tamper("ethan", "q1", { group: ethan.review!.q1.group }), ASSIGNMENT, 6, FROZEN_GROUPS[ASSIGNMENT.id], { sky })).toEqual(["ethan Q1: the record reads group, the sheet says individual", "ethan Q1: no second submission for individual"]);
    const mia = CLASSMATES.find((c) => c.id === "mia")!;
    const solved = { lines: ASSIGNMENT.problems[1].solution.map((s) => s.tex), solved: true };
    expect(reviewMismatches(tamper("mia", "q2", { group: solved }), ASSIGNMENT, 6, FROZEN_GROUPS[ASSIGNMENT.id], { sky })).toEqual(["mia Q2: the record reads group, the sheet says wrong", "mia Q2: still wrong, the group's version solved", "mia Q2: the rules say the amber group did not solve it", "mia Q2: the last try is not mia's first submission"]);
    expect(mia.review!.q2.group).toEqual({ lines: mia.attempts.q2, solved: false });
    // Jordan, Zara and Liam carry the versions Sam's own finished run shows.
    const { session, classroom } = skipFixture("report", 1_000_000);
    const sams = sessionReviews(session, classroom.group);
    for (const id of FROZEN_GROUPS[ASSIGNMENT.id].sky.filter((m) => m !== DEMO_STUDENT.id)) {
      const record = CLASSMATES.find((c) => c.id === id)!;
      for (const pid of record.wrong) {
        expect(record.review?.[pid]?.group, `${id} ${pid}`).toEqual(sams[pid].group);
        expect(record.review?.[pid]?.group?.lines, `${id} ${pid}`).toEqual(GROUP_SCRIPTS[pid].attempts.at(-1));
      }
    }
  });

  it("specs/class-story.md is the sheet as generated (npm run story:sheet rewrites it)", () => {
    const md = `${renderClassStory(STORY_SETS)}\n`;
    if (process.env.UPDATE_CLASS_STORY) writeFileSync(SHEET, md);
    expect(readFileSync(SHEET, "utf8")).toBe(md);
  });
});
