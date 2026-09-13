import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ASSIGNMENT, DEMO_STUDENT } from "./assignment";
import { CLASSMATES } from "./classmates";
import { STORY, STORY_CATEGORIES, STORY_RANK, STORY_SETS, storyResults } from "./story";
import { CATEGORY_ORDER, isLeafId } from "./taxonomy";
import { assignmentBundle } from "@/lib/assignments";
import { missedProblems, recordStatus, renderClassStory } from "@/lib/classStory";
import { topGap } from "@/lib/classroomCards";
import { dueOrder } from "@/lib/dueDate";
import { columnOf } from "@/lib/hierarchy";
import { mistakesByProblem } from "@/lib/mistakes";
import { skipFixture } from "@/lib/demo";

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
        // Missing: nothing seen anywhere on that set.
        if (d === 0) for (const c of STORY_SETS[i].categories) expect(row.cells[c][i].status, `${id} ${c} set ${i + 1}`).toBe("unseen");
      });
    }
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
        expect(cell.status, `${m.id} ${c}`).toBe(six.categories.includes(c) ? recordStatus(m, ASSIGNMENT, c) : "none");
        const missed = missedProblems(m, ASSIGNMENT, c);
        for (const hb of cell.habits) for (const n of hb.problems) expect(missed, `${m.id} ${c} "${hb.text}"`).toContain(n);
      }
    }
  });

  it("Problem Set 6's top gap is the classmates' (Sam's live row aside)", () => {
    const b = assignmentBundle(ASSIGNMENT.id, skipFixture("working", 0).classroom)!;
    expect(topGap(mistakesByProblem(null, { ...b, startedAt: null }))!.name).toBe(STORY_SETS[5].topGap);
  });

  it("specs/class-story.md is the sheet as generated (npm run story:sheet rewrites it)", () => {
    const md = `${renderClassStory(STORY_SETS)}\n`;
    if (process.env.UPDATE_CLASS_STORY) writeFileSync(SHEET, md);
    expect(readFileSync(SHEET, "utf8")).toBe(md);
  });
});
