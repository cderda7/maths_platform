import { describe, expect, it } from "vitest";
import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATES } from "@/data/classmates";
import { STORY, STORY_CATEGORIES, STORY_SETS } from "@/data/story";
import { assignmentBundle, assignmentReportHref, holisticHref, isHolisticHref, rosterEvidence } from "./assignments";
import { classroomReducer, INITIAL_CLASSROOM } from "./classroom";
import { skipFixture } from "./demo";
import { hierarchyFor } from "./hierarchy";
import { holisticView, isHolisticStudent, type HolisticNow } from "./holistic";

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
    expect(holisticView("mia", fresh)!.columns.map((c) => c.label)).toEqual(["PS1", "PS2", "PS3", "PS4", "PS5"]);
    const cols = holisticView("mia", over)!.columns;
    expect(cols.map((c) => c.label)).toEqual(["PS1", "PS2", "PS3", "PS4", "PS5", "PS6"]);
    expect(cols.map((c) => c.id)).toEqual(STORY_SETS.map((s) => s.id));
    expect(cols.map((c) => c.due)).toEqual(STORY_SETS.map((s) => s.due));
    expect(cols[3].topic).toBe("Non-monic factorising and completing the square");
    expect(cols.every((c) => !c.live)).toBe(true);
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
      expect(v.rows.map((r) => r.category), id).toEqual([...STORY_CATEGORIES]);
      v.rows.forEach((r) =>
        r.cells.forEach((cell, i) => {
          const story = STORY[id].cells[r.category][i].status;
          if (story === "live") return;
          expect(cell, `${id} ${r.category} PS${i + 1}`).toBe(WORD[story as keyof typeof WORD] ?? story);
        }),
      );
    }
  });

  it("Priya: secure wherever a set assesses the category, no habits", () => {
    for (const at of [fresh, over]) {
      const v = holisticView("priya", at)!;
      for (const r of v.rows) for (const [i, cell] of r.cells.entries()) expect(cell, `${r.category} PS${i + 1}`).toBe(STORY_SETS[i].categories.includes(r.category) ? "secure" : "none");
      expect(v.habits).toEqual([]);
    }
  });

  it("Sam: Problem Set 6 is live, read from his session as the Class View reads it, with no habits from the sheet", () => {
    const v = holisticView("sam", over)!;
    expect(v.columns[5]).toMatchObject({ label: "PS6", live: true });
    const bundle = assignmentBundle(ASSIGNMENT.id, over.classroom)!;
    const classView = hierarchyFor(rosterEvidence(bundle, over.session, now).sam, bundle).categories;
    for (const r of v.rows) expect(r.cells[5], r.category).toBe(classView[r.category] ?? "unseen");
    expect(v.rows.some((r) => ["gap", "developing", "solid"].includes(r.cells[5]))).toBe(true);
    expect(v.habits.flatMap((g) => g.habits.flatMap((h) => h.refs)).some((ref) => ref.set === ASSIGNMENT.id)).toBe(false);
    // Before he has started, his live column reads not seen.
    const start = skipFixture("start", now);
    const early = holisticView("sam", { classroom: start.classroom, session: start.session, now })!;
    expect(early.columns[5].live).toBe(true);
    for (const r of early.rows) expect(r.cells[5]).toBe("unseen");
  });

  it("Liam: the sets he missed read not seen, and his habits come only from the sets he handed in", () => {
    const v = holisticView("liam", over)!;
    for (const i of [2, 4]) for (const r of v.rows) expect(r.cells[i], `${r.category} PS${i + 1}`).toBe(STORY_SETS[i].categories.includes(r.category) ? "unseen" : "none");
    const sets = new Set(v.habits.flatMap((g) => g.habits.flatMap((h) => h.refs.map((ref) => ref.label))));
    expect([...sets].sort()).toEqual(["PS1", "PS2", "PS4", "PS6"]);
  });

  it("Chloe: absent on Problem Set 6 once it is live (ticket 250): every assessed category reads absent, no PS6 habits; PS1–PS5 untouched", () => {
    const v = holisticView("chloe", over)!;
    expect(over.classroom!.absences?.[ASSIGNMENT.id]).toBeUndefined();
    for (const r of v.rows) expect(r.cells[5], r.category).toBe("absent");
    for (const r of v.rows) for (const i of [0, 1, 2, 3, 4]) expect(r.cells[i], `${r.category} PS${i + 1}`).not.toBe("absent");
    expect(v.habits.flatMap((g) => g.habits.flatMap((h) => h.refs)).some((ref) => ref.label === "PS6")).toBe(false);
    // Before Create there is no PS6 column to be absent on.
    expect(holisticView("chloe", fresh)!.rows.every((r) => !r.cells.includes("absent"))).toBe(true);
  });

  it("follows the teacher's absence toggle on any set, as the Class View does", () => {
    // Chloe marked present on PS6: she has nothing handed in, so not seen.
    const present = classroomReducer(over.classroom!, { type: "absence/set", assignment: ASSIGNMENT.id, student: "chloe", absent: false });
    const back = holisticView("chloe", { ...over, classroom: present })!;
    for (const r of back.rows) expect(r.cells[5], r.category).toBe("unseen");
    // Tomas marked absent on PS4 (it assesses all six): absent in every row, his PS4 habits gone, the rest kept.
    const away = classroomReducer(over.classroom!, { type: "absence/set", assignment: "pset-4", student: "tomas", absent: true });
    const tomas = holisticView("tomas", { ...over, classroom: away })!;
    for (const r of tomas.rows) expect(r.cells[3], r.category).toBe("absent");
    const labels = tomas.habits.flatMap((g) => g.habits.flatMap((h) => h.refs.map((ref) => ref.label)));
    expect(labels).not.toContain("PS4");
    expect(labels).toContain("PS5");
    // PS1 does not assess functions or graphing: those stay "—".
    const early = holisticView("mia", { ...over, classroom: classroomReducer(over.classroom!, { type: "absence/set", assignment: "pset-1", student: "mia", absent: true }) })!;
    expect(early.rows.map((r) => r.cells[0])).toEqual(["absent", "none", "none", "absent", "absent", "absent"]);
  });

  it("habits are grouped by category in canonical order, each with the set, its result and the problems, oldest set first", () => {
    const v = holisticView("tomas", over)!;
    const order = v.habits.map((g) => g.category);
    expect(order).toEqual(STORY_CATEGORIES.filter((c) => order.includes(c)));
    expect(order).toEqual(["algebra", "functions", "graphing", "reasoning", "new"]);
    const algebra = v.habits[0];
    expect(algebra.name).toBe("Algebra");
    expect(algebra.habits[0]).toEqual({ text: "the fraction turned over dividing surds", refs: [{ set: "pset-1", label: "PS1", status: "developing", problems: [{ id: "ps1-q7", label: "Q7" }] }] });
    // Every habit of the sheet on a result short of secure is on the page, once per set.
    for (const id of everyone) {
      const page = holisticView(id, over)!.habits.flatMap((g) => g.habits.flatMap((h) => h.refs.map((ref) => `${g.category} ${ref.label} ${h.text} ${ref.problems.map((p) => p.label).join(",")}`)));
      const sheet = STORY_CATEGORIES.flatMap((c) => STORY[id].cells[c].flatMap((cell, i) => cell.habits.map((h) => `${c} PS${i + 1} ${h.text} ${h.problems.map((n) => `Q${n}`).join(",")}`)));
      expect(page.sort(), id).toEqual(sheet.sort());
    }
  });

  it("a habit worded the same on two sets is one habit with a ref for each", () => {
    const jordan = holisticView("jordan", over)!.habits.find((g) => g.category === "algebra")!;
    const guessed = jordan.habits.find((h) => h.text === "non-monic pairs guessed, never expanded back")!;
    expect(guessed.refs.map((r) => [r.label, r.status, r.problems.map((p) => p.label)])).toEqual([
      ["PS4", "gap", ["Q1", "Q2", "Q4"]],
      ["PS5", "gap", ["Q4", "Q8"]],
    ]);
  });

  it("on the live set mid-stream, a classmate's cells and habits are only what the teacher has seen so far", () => {
    const working = skipFixture("working", now);
    const justLive = { ...working.classroom, assignment: { ...working.classroom.assignment!, startedAt: now } };
    const v = holisticView("jordan", { classroom: justLive, session: working.session, now })!;
    for (const r of v.rows) expect(r.cells[5], r.category).toBe("unseen");
    expect(v.habits.flatMap((g) => g.habits.flatMap((h) => h.refs)).some((ref) => ref.label === "PS6")).toBe(false);
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
