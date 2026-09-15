import { describe, expect, it } from "vitest";
import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATES } from "@/data/classmates";
import { STORY, STORY_CATEGORIES, STORY_SETS } from "@/data/story";
import { assignmentBundle, assignmentReportHref, holisticHref, isHolisticHref, rosterEvidence } from "./assignments";
import { classroomReducer, INITIAL_CLASSROOM } from "./classroom";
import { skipFixture } from "./demo";
import { hierarchyFor } from "./hierarchy";
import { patternTagLabel } from "@/data/patternTags";
import { holisticView, holisticWork, isHolisticStudent, RECENT_SETS, recentSets, surfacing, type HolisticNow } from "./holistic";

/** A student across every set (ticket 251): the holistic page's view model. */

const now = 1_700_000_000_000;
/** A fresh demo: Problem Set 6 not yet created. */
const fresh: HolisticNow = { classroom: INITIAL_CLASSROOM, session: null, now };
/** Problem Set 6 an hour live and Sam handed in: the stream is over, every classmate's record whole. */
const report = skipFixture("report", now);
const over: HolisticNow = { classroom: report.classroom, session: report.session, now };
const everyone = [DEMO_STUDENT.id, ...CLASSMATES.map((c) => c.id)];
const WORD = { unseen: "unseen", absent: "absent", none: "none" } as const;

describe("the holistic view (ticket 251)", () => {
  it("knows the twenty and nobody else", () => {
    expect(everyone).toHaveLength(20);
    for (const id of everyone) expect(isHolisticStudent(id), id).toBe(true);
    expect(isHolisticStudent("nobody")).toBe(false);
    expect(isHolisticStudent("constructor")).toBe(false);
    expect(holisticView("nobody", over)).toBeNull();
  });

  it("shows the sets the Classroom holds, oldest first: PS1–PS5 before Create, PS1–PS6 after", () => {
    expect(holisticView("mia", fresh)!.sets.map((c) => c.label)).toEqual(["PS1", "PS2", "PS3", "PS4", "PS5"]);
    const cols = holisticView("mia", over)!.sets;
    expect(cols.map((c) => c.label)).toEqual(["PS1", "PS2", "PS3", "PS4", "PS5", "PS6"]);
    expect(cols.map((c) => c.id)).toEqual(STORY_SETS.map((s) => s.id));
    expect(cols.map((c) => c.due)).toEqual(STORY_SETS.map((s) => s.due));
    expect(cols[3].topic).toBe("Non-monic factorising and completing the square");
  });

  it("carries the student's name, avatar initials and the story sheet's line", () => {
    const v = holisticView("tomas", over)!;
    expect(v.student).toEqual({ id: "tomas", name: CLASSMATES.find((c) => c.id === "tomas")!.name, initials: CLASSMATES.find((c) => c.id === "tomas")!.initials });
    expect(v.summary).toBe(STORY.tomas.arc);
    expect(holisticView("sam", over)!.student).toEqual({ id: "sam", name: DEMO_STUDENT.name, initials: DEMO_STUDENT.initials });
  });

  it("every grid cell equals the story sheet for all twenty (Chloe absent on PS6), bar Sam's live Problem Set 6", () => {
    for (const id of everyone) {
      const v = holisticView(id, over)!;
      expect(v.categories.map((r) => r.category), id).toEqual([...STORY_CATEGORIES]);
      v.categories.forEach((r) =>
        r.cells.forEach((cell, i) => {
          const story = STORY[id].cells[r.category][i].status;
          if (story === "live") return;
          expect(cell, `${id} ${r.category} PS${i + 1}`).toBe(WORD[story as keyof typeof WORD] ?? story);
        }),
      );
    }
  });

  it("Priya: secure wherever a set assesses the category, no patterns", () => {
    for (const at of [fresh, over]) {
      const v = holisticView("priya", at)!;
      for (const r of v.categories) for (const [i, cell] of r.cells.entries()) expect(cell, `${r.category} PS${i + 1}`).toBe(STORY_SETS[i].categories.includes(r.category) ? "secure" : "none");
      expect(v.patterns).toEqual([]);
    }
  });

  it("Sam: Problem Set 6 is live, read from his session as the Class View reads it, with no patterns from the sheet", () => {
    const v = holisticView("sam", over)!;
    expect(v.sets[5]).toMatchObject({ label: "PS6", finished: false });
    const bundle = assignmentBundle(ASSIGNMENT.id, over.classroom)!;
    const classView = hierarchyFor(rosterEvidence(bundle, over.session, now).sam, bundle).categories;
    for (const r of v.categories) expect(r.cells[5], r.category).toBe(classView[r.category] ?? "unseen");
    expect(v.categories.some((r) => ["gap", "developing", "solid"].includes(r.cells[5]))).toBe(true);
    expect(v.patterns.flatMap((g) => g.patterns.flatMap((h) => h.refs)).some((ref) => ref.set === ASSIGNMENT.id)).toBe(false);
    // Before he has started, his live column reads not seen.
    const start = skipFixture("start", now);
    const early = holisticView("sam", { classroom: start.classroom, session: start.session, now })!;
    for (const r of early.categories) expect(r.cells[5]).toBe("unseen");
  });

  it("Liam: every set reads his five handed in (ticket 281; he missed Sets 3 and 5 before), and his patterns come from the sets he handed in", () => {
    const v = holisticView("liam", over)!;
    for (const i of [2, 4]) for (const r of v.categories) expect(r.cells[i], `${r.category} PS${i + 1}`).toBe(STORY_SETS[i].categories.includes(r.category) ? STORY.liam.cells[r.category][i].status : "none");
    expect(v.categories.find((r) => r.category === "reasoning")!.cells.slice(0, 5)).toEqual(["unseen", "unseen", "unseen", "unseen", "unseen"]);
    const sets = new Set(v.patterns.flatMap((g) => g.patterns.flatMap((h) => h.refs.map((ref) => ref.label))));
    // His PS1 pattern (√50 written as 25√2) never came back, so with PS6 live it no longer surfaces (ticket 276).
    expect([...sets].sort()).toEqual(["PS2", "PS3", "PS4", "PS5", "PS6"]);
    expect(new Set(holisticView("liam", fresh)!.patterns.flatMap((g) => g.patterns.flatMap((h) => h.refs.map((ref) => ref.label))))).toEqual(new Set(["PS1", "PS2", "PS3", "PS4", "PS5"]));
  });

  it("Chloe: absent on Problem Set 6 once it is live (ticket 250): every assessed category reads absent, no PS6 patterns; PS1–PS5 untouched", () => {
    const v = holisticView("chloe", over)!;
    expect(over.classroom!.absences?.[ASSIGNMENT.id]).toBeUndefined();
    for (const r of v.categories) expect(r.cells[5], r.category).toBe("absent");
    for (const r of v.categories) for (const i of [0, 1, 2, 3, 4]) expect(r.cells[i], `${r.category} PS${i + 1}`).not.toBe("absent");
    expect(v.patterns.flatMap((g) => g.patterns.flatMap((h) => h.refs)).some((ref) => ref.label === "PS6")).toBe(false);
    // Before Create there is no PS6 column to be absent on.
    expect(holisticView("chloe", fresh)!.categories.every((r) => !r.cells.includes("absent"))).toBe(true);
  });

  it("follows the teacher's absence toggle on any set, as the Class View does", () => {
    // Chloe marked present on PS6: she has nothing handed in, so not seen.
    const present = classroomReducer(over.classroom!, { type: "absence/set", assignment: ASSIGNMENT.id, student: "chloe", absent: false });
    const back = holisticView("chloe", { ...over, classroom: present })!;
    for (const r of back.categories) expect(r.cells[5], r.category).toBe("unseen");
    // Tomas marked absent on PS4 (it assesses all six): absent in every row, his PS4 patterns gone, the rest kept.
    const away = classroomReducer(over.classroom!, { type: "absence/set", assignment: "pset-4", student: "tomas", absent: true });
    const tomas = holisticView("tomas", { ...over, classroom: away })!;
    for (const r of tomas.categories) expect(r.cells[3], r.category).toBe("absent");
    const labels = tomas.patterns.flatMap((g) => g.patterns.flatMap((h) => h.refs.map((ref) => ref.label)));
    expect(labels).not.toContain("PS4");
    expect(labels).toContain("PS5");
    // PS1 does not assess functions or graphing: those stay "—".
    const early = holisticView("mia", { ...over, classroom: classroomReducer(over.classroom!, { type: "absence/set", assignment: "pset-1", student: "mia", absent: true }) })!;
    expect(early.categories.map((r) => r.cells[0])).toEqual(["absent", "none", "none", "absent", "absent", "absent"]);
  });

  it("patterns are grouped by category in canonical order, each with the set, its result and the problems, oldest set first", () => {
    const v = holisticView("tomas", over)!;
    const order = v.patterns.map((g) => g.category);
    expect(order).toEqual(STORY_CATEGORIES.filter((c) => order.includes(c)));
    expect(order).toEqual(["algebra", "functions", "graphing", "reasoning", "new"]);
    const algebra = v.patterns[0];
    expect(algebra.name).toBe("Algebra");
    // PS1's wording of a pattern that came back on PS2, PS4 and PS5 (ticket 276: older occurrences stay).
    expect(algebra.patterns[0]).toEqual({ text: "the fraction turned over dividing surds", misconception: "divided-wrong-way", tag: "fractions turned over", refs: [{ set: "pset-1", label: "PS1", status: "developing", problems: [{ id: "ps1-q7", label: "Q7" }] }] });
    // Every pattern of the sheet on a result short of secure is on the page, once per set, when its tag has a set in PS2–PS6 (ticket 276).
    for (const id of everyone) {
      const page = holisticView(id, over)!.patterns.flatMap((g) => g.patterns.flatMap((h) => h.refs.map((ref) => `${g.category} ${ref.label} ${h.text} ${ref.problems.map((p) => p.label).join(",")}`)));
      const recent = (c: (typeof STORY_CATEGORIES)[number], text: string) => STORY[id].cells[c].some((cell, i) => i >= 1 && cell.patterns.some((h) => patternTagLabel(id, c, h.text) === patternTagLabel(id, c, text)));
      const sheet = STORY_CATEGORIES.flatMap((c) => STORY[id].cells[c].flatMap((cell, i) => cell.patterns.filter((h) => recent(c, h.text)).map((h) => `${c} PS${i + 1} ${h.text} ${h.problems.map((n) => `Q${n}`).join(",")}`)));
      expect(page.sort(), id).toEqual(sheet.sort());
    }
  });

  it("a pattern worded the same on two sets is one pattern with a ref for each", () => {
    const jordan = holisticView("jordan", over)!.patterns.find((g) => g.category === "algebra")!;
    const guessed = jordan.patterns.find((h) => h.text === "non-monic brackets wrong")!;
    expect(guessed.refs.map((r) => [r.label, r.status, r.problems.map((p) => p.label)])).toEqual([
      ["PS4", "gap", ["Q1", "Q2", "Q4"]],
      ["PS5", "gap", ["Q4", "Q8"]],
      ["PS6", "developing", ["Q2"]],
    ]);
  });

  it("on the live set mid-stream, a classmate's cells and patterns are only what the teacher has seen so far", () => {
    const working = skipFixture("working", now);
    const justLive = { ...working.classroom, assignment: { ...working.classroom.assignment!, startedAt: now } };
    const v = holisticView("jordan", { classroom: justLive, session: working.session, now })!;
    for (const r of v.categories) expect(r.cells[5], r.category).toBe("unseen");
    expect(v.patterns.flatMap((g) => g.patterns.flatMap((h) => h.refs)).some((ref) => ref.label === "PS6")).toBe(false);
  });

  it("a coloured cell opens a tree that rolls up to it (ticket 277): every student, every set, mid-stream and after", () => {
    const working = skipFixture("working", now);
    const midStream = { classroom: working.classroom, session: working.session, now: now + 20 * 60_000 };
    for (const at of [fresh, over, midStream]) {
      for (const id of everyone) {
        const v = holisticView(id, at)!;
        v.sets.forEach((set, j) => {
          const work = holisticWork(id, set.id, at);
          const coloured = v.categories.filter((r) => ["secure", "solid", "developing", "gap"].includes(r.cells[j]));
          if (coloured.length === 0) return;
          expect(work, `${id} ${set.label}`).not.toBeNull();
          for (const r of coloured) expect(work!.result.categories[r.category], `${id} ${set.label} ${r.category}`).toBe(r.cells[j]);
        });
      }
    }
    expect(holisticWork("chloe", "pset-6", over)).toBeNull();
    expect(holisticWork("nobody", "pset-4", over)).toBeNull();
    expect(holisticWork("sam", "pset-6", fresh)).toBeNull();
    const zara = holisticWork("zara", "pset-4", over)!;
    expect(zara.problems.map((p) => p.id)).toEqual(assignmentBundle("pset-4", over.classroom)!.problems.map((p) => p.id));
    expect(Object.values(zara.lines).some((ls) => ls.length > 0)).toBe(true);
  });

  it("links: the two routes, the report opened on a problem with the way back, and only a holistic page as a way back", () => {
    expect(holisticHref("sam")).toBe("/teacher/students/sam");
    expect(holisticHref("sam", "pset-4")).toBe("/teacher/a/pset-4/students/sam");
    expect(assignmentReportHref("pset-4", "jordan", { work: "ps4-q1", from: "/teacher/students/jordan" })).toBe("/teacher/a/pset-4/report?student=jordan&work=ps4-q1&from=%2Fteacher%2Fstudents%2Fjordan");
    expect(assignmentReportHref("pset-4", "jordan")).toBe("/teacher/a/pset-4/report?student=jordan");
    expect(isHolisticHref("/teacher/students/jordan")).toBe(true);
    expect(isHolisticHref("/teacher/a/pset-6/students/jordan")).toBe(true);
    expect(isHolisticHref("https://example.com")).toBe(false);
    expect(isHolisticHref("/teacher/a/pset-6/class")).toBe(false);
    expect(isHolisticHref(null)).toBe(false);
  });
});

describe("only recent patterns surface (ticket 276)", () => {
  const set = (n: number, due: string) => ({ id: `pset-${n}`, due });
  const six = [set(1, "Tue 25 Aug"), set(2, "Fri 28 Aug"), set(3, "Tue 1 Sep"), set(4, "Fri 4 Sep"), set(5, "Mon 7 Sep"), set(6, "Thu 10 Sep")];
  const window = recentSets(six);
  const p = (tag: string, ...sets: number[]) => ({ tag, refs: sets.map((n) => ({ set: `pset-${n}` })) });

  it("the window is the class's latest five sets by due date: PS2–PS6 once PS6 is out, every set before", () => {
    expect(RECENT_SETS).toBe(5);
    expect([...window].sort()).toEqual(["pset-2", "pset-3", "pset-4", "pset-5", "pset-6"]);
    expect([...recentSets(six.slice(0, 5))].sort()).toEqual(["pset-1", "pset-2", "pset-3", "pset-4", "pset-5"]);
    // By due date, not by the order given.
    expect([...recentSets([...six].reverse())].sort()).toEqual(["pset-2", "pset-3", "pset-4", "pset-5", "pset-6"]);
    expect(recentSets(holisticView("sam", over)!.sets)).toEqual(window);
  });

  it("a pattern only on PS1 is hidden; PS1 and PS4 shows with both; only PS6 shows; one set shows", () => {
    expect(surfacing([p("only PS1", 1)], window)).toEqual([]);
    expect(surfacing([p("PS1 and PS4", 1, 4)], window)).toEqual([p("PS1 and PS4", 1, 4)]);
    expect(surfacing([p("only PS6", 6)], window)).toEqual([p("only PS6", 6)]);
    expect(surfacing([p("only PS3", 3)], window)).toEqual([p("only PS3", 3)]);
    // A pattern is its tag: a PS1-only wording stays when another wording of it is recent, in the order given.
    expect(surfacing([p("halves", 1), p("gone", 1), p("halves", 5)], window)).toEqual([p("halves", 1), p("halves", 5)]);
  });

  it("in the class: Amelia's PS1-only patterns leave once PS6 is out, Tomas's fractions keep PS1, Amelia's PS6-only pattern shows", () => {
    const texts = (id: string, at: HolisticNow) => holisticView(id, at)!.patterns.flatMap((g) => g.patterns.map((h) => h.text));
    expect(texts("amelia", fresh)).toContain("cancelled the numbers but not the surds when dividing");
    expect(texts("amelia", over)).not.toContain("cancelled the numbers but not the surds when dividing");
    expect(texts("amelia", over)).not.toContain("√12 + √27 collected before simplifying");
    expect(texts("amelia", over)).toContain("read “touches once” as discriminant > 0");
    const fractions = holisticView("tomas", over)!.patterns[0].patterns.filter((h) => h.tag === "fractions turned over");
    expect(fractions.flatMap((h) => h.refs.map((r) => r.label))).toEqual(["PS1", "PS2", "PS4", "PS5"]);
    // Every pattern shown has a set in PS2–PS6, for all twenty, before and after PS6.
    for (const at of [fresh, over])
      for (const id of everyone) {
        const v = holisticView(id, at)!;
        const w = recentSets(v.sets);
        for (const g of v.patterns) for (const tag of new Set(g.patterns.map((h) => h.tag))) expect(g.patterns.some((h) => h.tag === tag && h.refs.some((r) => w.has(r.set))), `${id} ${tag}`).toBe(true);
      }
  });

  it("the live set counts only for what the teacher has seen: mid-stream, a PS6-only pattern is not there yet", () => {
    const working = skipFixture("working", now);
    const justLive = { classroom: { ...working.classroom, assignment: { ...working.classroom.assignment!, startedAt: now } }, session: working.session, now };
    const texts = holisticView("amelia", justLive)!.patterns.flatMap((g) => g.patterns.map((h) => h.text));
    expect(texts).not.toContain("read “touches once” as discriminant > 0");
    expect(texts).not.toContain("cancelled the numbers but not the surds when dividing");
  });
});
