import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ASSIGNMENT, DEMO_STUDENT } from "./assignment";
import { CLASSMATES, SET6_CLASS_REVIEW } from "./classmates";
import { SET6_REVIEW } from "./classmates-review";
import { GROUP_SCRIPTS } from "./group-scripts";
import { DEFAULT_GROUPS, FROZEN_GROUPS } from "./groups";
import { STORY, STORY_CATEGORIES, STORY_CLASS_REVIEW, STORY_RANK, STORY_REVIEW, STORY_SETS, storyAbsent, storyResults, type StoryCategory } from "./story";
import { DEMO_ABSENCES } from "./absences";
import { PATTERN_TAGS } from "./patternTags";
import { familyOf } from "./signatures";
import { CATEGORY_ORDER, isLeafId } from "./taxonomy";
import { assignmentBundle } from "@/lib/assignments";
import { classReviewMismatches, hardestUnsolved, missedProblems, recordStatus, renderClassStory, reviewMismatches } from "@/lib/classStory";
import { FINISHED_SETS } from "@/lib/finishedSets";
import { recordReviewProblems } from "@/lib/group";
import { classmateLines } from "@/lib/hierarchy";
import { reviewByRule, wrongOnOneLine } from "@/lib/reviewRule";
import { topGaps } from "@/lib/classroomCards";
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

  it("gives every result short of secure one or two patterns on real problems of the set, and nothing else a pattern", () => {
    for (const id of students) {
      for (const c of STORY_CATEGORIES) {
        STORY[id].cells[c].forEach((cell, i) => {
          const set = STORY_SETS[i];
          const where = `${id} ${c} ${set.id}`;
          const shortOfSecure = cell.status === "gap" || cell.status === "developing" || cell.status === "solid";
          if (!shortOfSecure) return expect(cell.patterns, where).toEqual([]);
          expect(cell.patterns.length, where).toBeGreaterThanOrEqual(1);
          expect(cell.patterns.length, where).toBeLessThanOrEqual(2);
          for (const pt of cell.patterns) {
            expect(pt.text.length, where).toBeGreaterThan(5);
            expect(pt.problems.length, where).toBeGreaterThan(0);
            for (const n of pt.problems) {
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

  it("describes behaviour, never a trait (ticket 298): no summary, pattern, tag or review reason judges the student", () => {
    const TRAIT = /careless|confiden|\blazy|sloppy|silly|\brush|guess|\bhope|too fast|\bslow|\bunsure|struggl|\bweak|astray|\bjump|out of reach|attention|in (his|her|their) head/i;
    const texts = students.flatMap((id) => [
      [`${id} summary`, STORY[id].arc],
      ...STORY_CATEGORIES.flatMap((c) => STORY[id].cells[c].flatMap((cell) => cell.patterns.map((p) => [`${id} ${c} pattern`, p.text]))),
      ...Object.entries(PATTERN_TAGS[id] ?? {}).flatMap(([c, tags]) => (tags ?? []).map((t) => [`${id} ${c} tag`, t.label])),
      ...STORY_REVIEW.flatMap((set) => (set[id] ?? []).map((r) => [`${id} review Q${r.q}`, r.why])),
    ]);
    for (const [where, text] of texts) expect(text, where).not.toMatch(TRAIT);
    // Ticket 303: what is wrong, never why the student is supposed to have gone wrong.
    const WHY = /without checking|not checked|to check\b|expanded back|expanding back|copied|\btried\b|looks? close/i;
    for (const [where, text] of texts) expect(text, where).not.toMatch(WHY);
  });

  it("names on every pattern the misconception the student's own wrong lines show (ticket 303); communication patterns none", () => {
    const { classroom, session } = skipFixture("report", 1_000_000);
    const off: string[] = [];
    STORY_SETS.forEach((s, i) => {
      const bundle = assignmentBundle(s.id, classroom)!;
      const fixture = s.n === 6 ? ASSIGNMENT.problems : bundle.problems;
      const rows = mistakesByProblem(session, bundle, 1_000_000);
      const shown = (student: string, n: number) => rows.find((p) => p.problem.id === fixture[n - 1].id)?.rows.find((r) => r.id === student)?.misconceptions ?? [];
      for (const id of students)
        for (const c of STORY_CATEGORIES)
          for (const p of STORY[id].cells[c][i].patterns) {
            const where = `${id} ${c} ${s.id} "${p.text}"`;
            if (c === "communication") {
              if (p.misconception !== null) off.push(`${where}: a communication pattern names ${p.misconception}`);
              continue;
            }
            if (p.misconception === null) {
              off.push(`${where}: no misconception`);
              continue;
            }
            // The id on one of its problems at least, and every problem showing a misconception of the same family.
            if (!p.problems.some((n) => shown(id, n).includes(p.misconception!))) off.push(`${where}: ${p.misconception} on none of Q${p.problems.join(", Q")}`);
            for (const n of p.problems) if (!shown(id, n).some((m) => familyOf(m) === familyOf(p.misconception))) off.push(`${where}: Q${n} shows ${shown(id, n).join("+") || "nothing"}`);
          }
    });
    expect(off).toEqual([]);
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

  it("Priya is secure in every category on every set, save graphing on Set 6 (ticket 347: one slip, still solid), and hands everything in", () => {
    const priya = STORY.priya;
    expect(priya.done).toEqual([10, 10, 10, 10, 10, 10]);
    STORY_SETS.forEach((s, i) => {
      for (const c of STORY_CATEGORIES) {
        if (c === "graphing" && s.n === 6) {
          expect(priya.cells[c][i].status, `${c} ${s.id}`).toBe("solid");
          continue;
        }
        expect(priya.cells[c][i].status, `${c} ${s.id}`).toBe(s.categories.includes(c) ? "secure" : "none");
      }
    });
  });

  it("Problem Set 6's rows equal the classmates' end state: status, hand-in count, and each pattern on a problem where they missed it", () => {
    const six = STORY_SETS[5];
    for (const m of CLASSMATES) {
      const row = STORY[m.id];
      expect(row.done[5], m.id).toBe(m.done);
      for (const c of STORY_CATEGORIES) {
        const cell = row.cells[c][5];
        const away = (DEMO_ABSENCES[six.id] ?? []).includes(m.id);
        expect(cell.status, `${m.id} ${c}`).toBe(!six.categories.includes(c) ? "none" : away ? "absent" : recordStatus(m, ASSIGNMENT, c));
        const missed = missedProblems(m, ASSIGNMENT, c);
        for (const pt of cell.patterns) for (const n of pt.problems) expect(missed, `${m.id} ${c} "${pt.text}"`).toContain(n);
      }
    }
  });

  it("Problem Set 6's top gaps are the classmates' (Sam's live row aside)", () => {
    const b = assignmentBundle(ASSIGNMENT.id, skipFixture("working", 0).classroom)!;
    expect(topGaps(mistakesByProblem(null, { ...b, startedAt: null }), b.newSkills).map((g) => g.name)).toEqual(STORY_SETS[5].topGaps);
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

  it("Problem Set 6's review part is the classmates' records, by the agreed rules, with the demo group's versions its scripted run (tickets 244, 281)", () => {
    // Sky's group review is scripted: solved where the script's last attempt checks.
    const sky = Object.fromEntries(Object.entries(GROUP_SCRIPTS).map(([pid, s]) => [pid, checkBoard(pid, s.attempts.at(-1)!).correct]));
    expect(sky).toEqual({ q1: true, q2: true, q3: true, q5: true, q6: true, q7: false, q8: true, q9: true, q10: true });
    const options = { absent: DEMO_ABSENCES[ASSIGNMENT.id], fixed: { sky }, exception: SET6_REVIEW.exception };
    expect(reviewMismatches(CLASSMATES, ASSIGNMENT, 6, FROZEN_GROUPS[ASSIGNMENT.id], options)).toEqual([]);
    // The check bites: a second submission taken away, a solved group version made wrong for one member, a last try that is a member's first submission.
    const tamper = (id: string, pid: string, review: NonNullable<(typeof CLASSMATES)[number]["review"]>[string]) => CLASSMATES.map((c) => (c.id === id ? { ...c, review: { ...c.review, [pid]: review } } : c));
    expect(reviewMismatches(tamper("ethan", "q1", {}), ASSIGNMENT, 6, FROZEN_GROUPS[ASSIGNMENT.id], options)).toEqual(["ethan Q1: the record reads wrong, the sheet says individual", "ethan Q1: the rules say group (one-off), the sheet says individual", "ethan Q1: no second submission for individual", "ethan Q1: a one-off slip with no second submission", "ethan Q1: no group version"]);
    // Ticket 332: a fix that holds for a question the sheet sends on, and a group version on a question outside the group's union.
    const zara = CLASSMATES.find((c) => c.id === "zara")!;
    expect(reviewMismatches(tamper("zara", "q9", { second: ASSIGNMENT.problems[8].solution.map((st) => st.tex), group: zara.review!.q9.group }), ASSIGNMENT, 6, FROZEN_GROUPS[ASSIGNMENT.id], options)).toEqual(["the exception on sky q9 is not a solved problem nobody at the table had right", "zara Q9: the record reads individual, the sheet says group", "zara Q9: the rules say individual (one-off), the sheet says group", "zara Q9: a second submission that holds for group"]);
    const aiden = CLASSMATES.find((c) => c.id === "aiden")!;
    expect(reviewMismatches(tamper("aiden", "q3", { group: { lines: ASSIGNMENT.problems[2].solution.map((st) => st.tex), solved: true } }), ASSIGNMENT, 6, FROZEN_GROUPS[ASSIGNMENT.id], options)).toEqual(["aiden: review on q3, which they had right first time"]);
    expect(aiden.review?.q7?.group).toEqual(SET6_REVIEW.groups.coral!.q7);
    const mia = CLASSMATES.find((c) => c.id === "mia")!;
    const unsolved = { lines: mia.attempts.q2, solved: false };
    expect(reviewMismatches(tamper("mia", "q2", { group: unsolved }), ASSIGNMENT, 6, FROZEN_GROUPS[ASSIGNMENT.id], options)).toEqual(["mia Q2: the record reads wrong, the sheet says group", "mia Q2: solved in group review, the group's version unsolved", "mia Q2: the rules say the amber group solved it", "mia Q2: the group's last try is jordan's first submission"]);
    const isla = CLASSMATES.find((c) => c.id === "isla")!;
    const reused = { lines: isla.attempts.q10, solved: false };
    expect(reviewMismatches(tamper("isla", "q10", { group: reused }), ASSIGNMENT, 6, FROZEN_GROUPS[ASSIGNMENT.id], options)).toEqual(["isla Q10: the group's last try is amelia's first submission", "isla Q10: lucas, in the same group, carries another version", "isla Q10: grace, in the same group, carries another version", "isla Q10: harper, in the same group, carries another version", "lucas Q10: isla, in the same group, carries another version", "grace Q10: isla, in the same group, carries another version", "harper Q10: isla, in the same group, carries another version"]);
    // Jordan, Zara and Liam carry the versions Sam's own finished run shows, on every problem they brought.
    const { session, classroom } = skipFixture("report", 1_000_000);
    const sams = sessionReviews(session, classroom.group);
    for (const id of FROZEN_GROUPS[ASSIGNMENT.id].sky.filter((m) => m !== DEMO_STUDENT.id)) {
      const record = CLASSMATES.find((c) => c.id === id)!;
      for (const pid of recordReviewProblems(record, true)) {
        expect(record.review?.[pid]?.group, `${id} ${pid}`).toEqual(sams[pid].group);
        expect(record.review?.[pid]?.group?.lines, `${id} ${pid}`).toEqual(GROUP_SCRIPTS[pid].attempts.at(-1));
      }
    }
  });

  it("the new rules leave no case ticket 244's rules had to settle against themselves (ticket 281): no problem stays wrong beside a member who had it right, and no group version carries a pattern the rules would keep", () => {
    const sky = Object.fromEntries(Object.entries(GROUP_SCRIPTS).map(([pid, s]) => [pid, checkBoard(pid, s.attempts.at(-1)!).correct]));
    const sets = [
      ...FINISHED_SETS.map((f, i) => ({ n: i + 1, set: f.fixture, everyone: [f.sam, ...f.classmates], seating: f.groups ?? DEFAULT_GROUPS, options: {} })),
      { n: 6, set: ASSIGNMENT, everyone: CLASSMATES, seating: FROZEN_GROUPS[ASSIGNMENT.id], options: { absent: DEMO_ABSENCES[ASSIGNMENT.id], fixed: { sky }, exception: SET6_REVIEW.exception } },
    ];
    const conflicts: string[] = [];
    const unsolvedBesideHelpers: string[] = [];
    for (const { n, set, everyone, seating, options } of sets) {
      const { cases, groups } = reviewByRule(set, n, everyone, seating, options);
      // Ticket 244's nine conflicts: a pattern the rules kept wrong, carried to "fixed" by the group's single rework. Now a pattern goes to the group, whose call decides.
      for (const c of cases) if (c.basis === "pattern" && c.outcome !== (groups.find((g) => g.colour === c.colour && g.q === c.q)!.solved ? "group" : "wrong")) conflicts.push(`PS${n} ${c.student} Q${c.q}`);
      // Ticket 244's 45 habits left unsolved beside helpers.
      for (const c of cases) if (c.outcome === "wrong" && c.helpers.length > 0 && !groups.find((g) => g.colour === c.colour && g.q === c.q)!.scripted) unsolvedBesideHelpers.push(`PS${n} ${c.student} Q${c.q}`);
      for (const [id, rows] of Object.entries(STORY_REVIEW[n - 1])) for (const row of rows) if (row.why.includes("but the group's rework holds")) conflicts.push(`PS${n} ${id} Q${row.q} (sheet)`);
    }
    expect(conflicts).toEqual([]);
    expect(unsolvedBesideHelpers).toEqual([]);
  });

  it("on every set one or two groups meet the hardest problem (Q9/Q10, complex unfamiliar) with nobody at the table able to do it, and at most one exception is used (ticket 281)", () => {
    const sky = Object.fromEntries(Object.entries(GROUP_SCRIPTS).map(([pid, s]) => [pid, checkBoard(pid, s.attempts.at(-1)!).correct]));
    const hardest = [
      ...FINISHED_SETS.map((f, i) => hardestUnsolved([f.sam, ...f.classmates], f.fixture, i + 1, f.groups ?? DEFAULT_GROUPS)),
      hardestUnsolved(CLASSMATES, ASSIGNMENT, 6, FROZEN_GROUPS[ASSIGNMENT.id], { absent: DEMO_ABSENCES[ASSIGNMENT.id], fixed: { sky } }),
    ].map((groups) => groups.map((g) => `${g.colour} Q${g.q}`));
    expect(hardest).toEqual([["violet Q10"], ["mint Q10"], ["mint Q10"], ["mint Q10"], ["mint Q10"], ["mint Q10"]]);
    for (const groups of hardest) expect(new Set(groups.map((g) => g.split(" ")[0])).size).toBeGreaterThanOrEqual(1);
    for (const groups of hardest) expect(new Set(groups.map((g) => g.split(" ")[0])).size).toBeLessThanOrEqual(2);
    // The exception's condition holds for Zara, and no finished set uses one: every solved problem there has a helper.
    expect(wrongOnOneLine(CLASSMATES.find((c) => c.id === "zara")!, ASSIGNMENT, "q9")).toBe(true);
    for (const [i, f] of FINISHED_SETS.entries()) expect(reviewByRule(f.fixture, i + 1, [f.sam, ...f.classmates], f.groups ?? DEFAULT_GROUPS).groups.filter((g) => g.solved && g.helpers.length === 0), f.fixture.id).toEqual([]);
    // Where a scripted problem nobody had right is solved, it is the declared exception.
    const none = reviewByRule(ASSIGNMENT, 6, CLASSMATES, FROZEN_GROUPS[ASSIGNMENT.id], { absent: DEMO_ABSENCES[ASSIGNMENT.id], fixed: { sky } }).groups.filter((g) => g.solved && g.helpers.length === 0 && g.colour !== "sky");
    expect(none).toEqual([]);
  });

  it("Liam attempts at least five problems on every set, and his statuses are the sheet's (ticket 281)", () => {
    const records = [...FINISHED_SETS.map((f) => ({ record: f.classmates.find((c) => c.id === "liam")!, set: f.fixture })), { record: CLASSMATES.find((c) => c.id === "liam")!, set: ASSIGNMENT }];
    records.forEach(({ record, set }, i) => {
      const attempted = set.problems.filter((p, k) => classmateLines(record, p, k) !== null).length;
      expect(attempted, `PS${i + 1}`).toBeGreaterThanOrEqual(5);
      for (const c of STORY_CATEGORIES) if (STORY_SETS[i].categories.includes(c)) expect(recordStatus(record, set, c), `PS${i + 1} ${c}`).toBe(STORY.liam.cells[c][i].status);
    });
    expect(STORY.liam.done).toEqual([5, 5, 5, 5, 5, 4]);
    // Where the sheet already saw his work (Sets 1, 2, 4, 6), every status is the one it had before ticket 281, not seen included.
    const before: Record<StoryCategory, (string | null)[]> = {
      algebra: ["unseen", "developing", null, "gap", null, "gap"],
      functions: ["none", "none", null, "unseen", null, "unseen"],
      graphing: ["none", "none", null, "unseen", null, "unseen"],
      communication: ["secure", "secure", null, "secure", null, "secure"],
      reasoning: ["unseen", "unseen", null, "unseen", null, "unseen"],
      new: ["developing", "gap", null, "unseen", null, "gap"],
    };
    for (const c of STORY_CATEGORIES) before[c].forEach((status, i) => status && expect(STORY.liam.cells[c][i].status, `${c} PS${i + 1}`).toBe(status));
    // Sets 3 and 5, where he handed nothing in, now read what his five show, one step from their neighbours (the jump test above).
    expect(STORY_CATEGORIES.map((c) => STORY.liam.cells[c][2].status)).toEqual(["gap", "none", "none", "secure", "unseen", "developing"]);
    expect(STORY_CATEGORIES.map((c) => STORY.liam.cells[c][4].status)).toEqual(["gap", "secure", "secure", "secure", "unseen", "gap"]);
  });

  it("class review runs on Problem Sets 1, 3 and 6 only, and covers every problem a group left unsolved there with one or two real examples (ticket 281)", () => {
    expect(STORY_SETS.map((s) => s.pathway.includes("whole-class"))).toEqual([true, false, true, false, false, true]);
    expect(STORY_CLASS_REVIEW.map((c) => c !== null)).toEqual([true, false, true, false, false, true]);
    const sky = Object.fromEntries(Object.entries(GROUP_SCRIPTS).map(([pid, s]) => [pid, checkBoard(pid, s.attempts.at(-1)!).correct]));
    expect(classReviewMismatches(SET6_CLASS_REVIEW, STORY_SETS[5].pathway, CLASSMATES, ASSIGNMENT, 6, FROZEN_GROUPS[ASSIGNMENT.id], { absent: DEMO_ABSENCES[ASSIGNMENT.id], fixed: { sky } })).toEqual([]);
    expect(SET6_CLASS_REVIEW.map((c) => [c.problem, c.examples.map((e) => e.student)])).toEqual([["q7", ["isla", "zara"]], ["q8", ["priya", "amelia"]], ["q10", ["isla", "lucas"]]]);
    // The check bites: a covered problem dropped, an example that is not the student's working.
    expect(classReviewMismatches(SET6_CLASS_REVIEW.slice(0, 1), STORY_SETS[5].pathway, CLASSMATES, ASSIGNMENT, 6, FROZEN_GROUPS[ASSIGNMENT.id], { absent: DEMO_ABSENCES[ASSIGNMENT.id], fixed: { sky } })).toEqual(["class review covers Q7, the groups left Q7, Q8, Q10 unsolved", "the sheet's class review covers Q7, Q8, Q10, the record Q7"]);
    const swapped = [{ problem: "q10", examples: [{ student: "isla", lines: ASSIGNMENT.problems[9].solution.map((st) => st.tex) }] }];
    expect(classReviewMismatches([SET6_CLASS_REVIEW[0], SET6_CLASS_REVIEW[1], ...swapped], STORY_SETS[5].pathway, CLASSMATES, ASSIGNMENT, 6, FROZEN_GROUPS[ASSIGNMENT.id], { absent: DEMO_ABSENCES[ASSIGNMENT.id], fixed: { sky } })).toEqual(["Q10: isla's example is not their first submission on it", "Q10: the sheet shows isla, lucas, the record isla"]);
    expect(classReviewMismatches(undefined, ["individual", "group"], CLASSMATES, ASSIGNMENT, 6, FROZEN_GROUPS[ASSIGNMENT.id])).toEqual(["the sheet has a class review part for a set without it"]);
  });

  it("specs/class-story.md is the sheet as generated (npm run story:sheet rewrites it)", () => {
    const md = `${renderClassStory(STORY_SETS)}\n`;
    if (process.env.UPDATE_CLASS_STORY) writeFileSync(SHEET, md);
    expect(readFileSync(SHEET, "utf8")).toBe(md);
  });
});
