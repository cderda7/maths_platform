import katex from "katex";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Steps from "@/app/teacher/assignments/create/review/Steps";
import { ASSIGNMENT } from "@/data/assignment";
import { DEMO_PASTE_LINES } from "@/data/draft-seed";
import { PS5 } from "@/data/finishedSets";
import { HOMEWORK_PASTE_LINES } from "@/data/homework-draft-seed";
import { HOMEWORK_RECOMMENDATIONS, RECOMMENDATIONS } from "@/data/review";
import { assignmentBundle } from "./assignments";
import { classroomReducer, draftFor, INITIAL_CLASSROOM, migrateClassroom, reviewStateFor, type ClassroomState } from "./classroom";
import { clearDraft, created, homeworkSendAction, homeworkSent } from "./create";
import { assessMsFrom, CREATE_ROUTES, hasPathway, PIPELINES } from "./createPipeline";
import { readyDraft } from "./demo";
import { dueRange, generatedDraft, generatedDraftFor, generatedHomeworkDraft, isGenerated } from "./draft";
import { dayLabel, DEMO_TODAY, DUE_DEFAULT } from "./dueDate";
import { classHomeworks, coveredSetIds, homeworkForDue, nextHomework, psetDueNote } from "./homeworks";
import { parseQuestion, stemText } from "./mathInput";
import { applyReview, draftKey, normTex, recommendationsFor, type ReviewState } from "./review";

const now = 1_700_000_000_000;
const renders = (tex: string) => katex.renderToString(tex, { throwOnError: true, strict: false, trust: true });

/** A classroom with Homework 3's draft generated and, with `answers`, Refine answered. */
function drafted(c: ClassroomState = INITIAL_CLASSROOM, answer?: "accept" | "keep", due?: string): ClassroomState {
  const draft = generatedHomeworkDraft(c, now);
  const withDue = due ? { ...draft, due } : draft;
  let next = classroomReducer(c, { type: "draft/set", draft: withDue, kind: "homework" });
  if (answer) {
    const review: ReviewState = { step: "recommendations", forDraft: draftKey(withDue.questions), labels: {}, answers: Object.fromEntries(HOMEWORK_RECOMMENDATIONS.map((r) => [r.id, answer])), addition: 0, pathway: null };
    next = classroomReducer(next, { type: "review/set", review, kind: "homework" });
  }
  return next;
}

describe("+Homework's pipeline (ticket 291)", () => {
  it("reads Questions, Difficulty, Refine, Send: no Pathway, and its own routes", () => {
    expect(PIPELINES.homework.map((s) => s.label)).toEqual(["Questions", "Difficulty", "Refine", "Send"]);
    expect(hasPathway("homework")).toBe(false);
    expect(hasPathway("pset")).toBe(true);
    expect(PIPELINES.pset.map((s) => s.label)).toEqual(["Questions", "Difficulty", "Refine", "Pathway", "Send"]);
    expect(CREATE_ROUTES.homework).toEqual({ questions: "/teacher/homework/create", review: "/teacher/homework/create/review" });
    expect(CREATE_ROUTES.pset).toEqual({ questions: "/teacher/assignments/create", review: "/teacher/assignments/create/review" });
  });

  it("the strip never shows Pathway for homework, and its Questions goes back to +Homework's page", () => {
    for (const current of ["difficulty", "assessment", "send"] as const) {
      const html = renderToStaticMarkup(createElement(Steps, { steps: PIPELINES.homework, questionsHref: CREATE_ROUTES.homework.questions, current, locked: current === "send", onBack: () => {} }));
      expect(html).not.toMatch(/pathway/i);
      expect(html).toContain("Send");
      if (current !== "send") expect(html).toContain('href="/teacher/homework/create"');
    }
  });

  it("the review route's assessing bar length", () => {
    expect(assessMsFrom("300", 5000)).toBe(300);
    expect(assessMsFrom(["40"], 5000)).toBe(100);
    expect(assessMsFrom("soon", 5000)).toBe(5000);
    expect(assessMsFrom(undefined, 5000)).toBe(5000);
  });
});

describe("Homework 3's due date (ticket 291)", () => {
  it("starts at Mon 14 Sep and cannot be on or before Homework 2's Mon 7 Sep, nor before today", () => {
    const next = nextHomework(INITIAL_CLASSROOM);
    expect(next).toMatchObject({ n: 3, id: "hw-3", min: DEMO_TODAY, due: "2026-09-14" });
    expect(next.previous?.id).toBe("hw-2");
    expect(dayLabel(DUE_DEFAULT.homework)).toBe("Mon 14 Sep");
    expect(next.min > "2026-09-07").toBe(true);
    expect(dueRange("homework", INITIAL_CLASSROOM)).toEqual({ min: DEMO_TODAY, fallback: "2026-09-14" });
    // Seen from a day before today's demo, the earliest is still the day after Homework 2.
    expect(nextHomework(INITIAL_CLASSROOM, "2026-09-02").min).toBe("2026-09-08");
    expect(dueRange("pset", INITIAL_CLASSROOM)).toEqual({ min: DEMO_TODAY, fallback: DEMO_TODAY });
  });

  it("after Homework 3 is sent, the next is Homework 4, from the day after Homework 3's due date, a week on", () => {
    const c = homeworkSent(drafted(INITIAL_CLASSROOM, "accept"), now);
    expect(nextHomework(c)).toMatchObject({ n: 4, id: "hw-4", min: "2026-09-15", due: "2026-09-21" });
  });
});

describe("Homework 3's generated draft (ticket 291)", () => {
  it("is Homework 3: ten problems read as typed, due Mon 14 Sep, no goal, flagged generated", () => {
    const d = generatedHomeworkDraft(INITIAL_CLASSROOM, 42);
    expect(d).toMatchObject({ title: "Homework 3", goal: "", updatedAt: 42, generated: true, due: "2026-09-14" });
    expect(d.questions).toHaveLength(10);
    for (const [i, q] of d.questions.entries()) {
      const p = parseQuestion(HOMEWORK_PASTE_LINES[i]);
      expect(q).toEqual({ id: `hw-seed-${i + 1}`, text: HOMEWORK_PASTE_LINES[i], stem: stemText(p.stem), tex: p.tex });
      // Every line reads as prose over one centred expression, and the expression sets in KaTeX.
      expect(q.tex, q.text).toBeTruthy();
      expect(q.stem, q.text).not.toContain("$");
      expect(() => renders(q.tex!)).not.toThrow();
    }
    expect(generatedDraftFor("homework", INITIAL_CLASSROOM, 42)).toEqual(d);
    expect(generatedDraftFor("pset", INITIAL_CLASSROOM, 42)).toEqual(generatedDraft(42));
  });

  it("is new: no problem copies Problem Set 5's or 6's, before or after Refine", () => {
    const setTex = new Set([...ASSIGNMENT.problems, ...PS5.fixture.problems].map((p) => normTex(p.tex)).concat(DEMO_PASTE_LINES.map((l) => normTex(parseQuestion(l).tex))));
    const d = generatedHomeworkDraft(INITIAL_CLASSROOM, 1);
    for (const q of d.questions) expect(setTex.has(normTex(q.tex)), q.text).toBe(false);
    for (const answer of ["accept", "keep"] as const) {
      const c = drafted(INITIAL_CLASSROOM, answer);
      const final = applyReview(d.questions, reviewStateFor(c, "homework")!, "homework");
      expect(final).toHaveLength(10);
      for (const q of final) expect(setTex.has(normTex(q.tex)), q.text).toBe(false);
    }
  });

  it("lives apart from the in-class set's draft: generating one leaves the other blank", () => {
    const c = drafted();
    expect(isGenerated(c, "homework")).toBe(true);
    expect(isGenerated(c, "pset")).toBe(false);
    expect(c.draft).toBeUndefined();
    const both = classroomReducer(c, { type: "draft/set", draft: generatedDraft(1) });
    expect(draftFor(both, "pset")?.title).toBe("Problem Set 6 — Roots of a quadratic");
    expect(draftFor(both, "homework")?.title).toBe("Homework 3");
    const cleared = clearDraft("homework").reduce(classroomReducer, both);
    expect(isGenerated(cleared, "homework")).toBe(false);
    expect(isGenerated(cleared, "pset")).toBe(true);
    expect(isGenerated(classroomReducer(both, { type: "reset" }), "homework")).toBe(false);
  });
});

describe("Refine on Homework 3 (ticket 291)", () => {
  it("recommends changing Q8, removing Q9 and adding a rule-from-features problem; never an in-class set's", () => {
    const d = generatedHomeworkDraft(INITIAL_CLASSROOM, 1);
    expect(recommendationsFor(d.questions, "homework").map((a) => [a.rec.id, a.targetId])).toEqual([
      ["hw-no-intercepts", "hw-seed-8"],
      ["hw-remove-repeat", "hw-seed-9"],
      ["hw-add-rule", undefined],
    ]);
    expect(recommendationsFor(generatedDraft(1).questions, "pset").map((a) => a.rec.id)).toEqual(RECOMMENDATIONS.map((r) => r.id));
    expect(recommendationsFor(generatedDraft(1).questions).map((a) => a.rec.id)).toEqual(RECOMMENDATIONS.map((r) => r.id));
  });

  it("accepted, Q8 has x-intercepts and the new problem takes Q9's slot; every recommendation's TeX sets in KaTeX", () => {
    const d = generatedHomeworkDraft(INITIAL_CLASSROOM, 1);
    const final = applyReview(d.questions, reviewStateFor(drafted(INITIAL_CLASSROOM, "accept"), "homework")!, "homework");
    expect(final.map((q) => q.origin)).toEqual(["typed", "typed", "typed", "typed", "typed", "typed", "typed", "changed", "added", "typed"]);
    expect(final[7].tex).toBe("y = (x - 3)^{2} - 4");
    expect(final[8].tex).toBe("y = a(x + 2)(x - 4)");
    for (const r of HOMEWORK_RECOMMENDATIONS) {
      if (r.kind === "change") expect(() => renders(r.to.tex)).not.toThrow();
      if (r.kind === "add")
        for (const o of r.options) {
          expect(() => renders(o.tex)).not.toThrow();
          // The typed form reads back as the card shape it is shown in.
          const p = parseQuestion(o.text);
          expect([stemText(p.stem), normTex(p.tex)]).toEqual([o.stem, normTex(o.tex)]);
        }
    }
  });
});

describe("Create sends Homework 3 (ticket 291)", () => {
  it("waits for every recommendation's answer, then sends Homework 3 due as picked", () => {
    expect(homeworkSendAction(INITIAL_CLASSROOM, now)).toBeNull();
    expect(homeworkSendAction(drafted(), now)).toBeNull();
    const action = homeworkSendAction(drafted(INITIAL_CLASSROOM, "keep", "2026-09-15"), now);
    expect(action).toMatchObject({ type: "homework/send", homework: { id: "hw-3", n: 3, name: "Homework 3", due: "2026-09-15", sentAt: now } });
  });

  it("a stored day before the earliest reads as the default", () => {
    const action = homeworkSendAction(drafted(INITIAL_CLASSROOM, "accept", "2026-09-07"), now);
    expect(action?.type === "homework/send" && action.homework.due).toBe("2026-09-14");
  });

  it("joins the class's homeworks, clears its draft, and touches no set, lesson or in-class draft", () => {
    const sentPset = created({ ...INITIAL_CLASSROOM, ...readyDraft(now - 10) }, now - 5);
    const before = drafted(classroomReducer(sentPset, { type: "draft/set", draft: generatedDraft(1) }), "accept");
    const after = homeworkSent(before, now);
    expect(after.homeworks?.map((h) => [h.id, h.name, h.due, h.questions.length])).toEqual([["hw-3", "Homework 3", "2026-09-14", 10]]);
    expect(isGenerated(after, "homework")).toBe(false);
    expect(after.homeworkReview).toBeNull();
    expect(after.assignment).toBe(before.assignment);
    expect(after.draft).toBe(before.draft);
    for (const k of ["advance", "wholeClass", "arrivals", "group", "diagnostics", "lessonEndedAt", "assignmentGroups", "absences"] as const) expect(after[k]).toBe(before[k]);
    // Sent twice (another tab's Create landing too): one Homework 3.
    const action = homeworkSendAction(before, now)!;
    expect(classroomReducer(after, action).homeworks).toHaveLength(1);
  });

  it("survives a reload and every tab (the stored classroom read back), and Reset demo clears it", () => {
    const after = homeworkSent(drafted(INITIAL_CLASSROOM, "accept"), now);
    const read = migrateClassroom(JSON.parse(JSON.stringify(after)));
    expect(read.homeworks).toEqual(after.homeworks);
    expect(classHomeworks(read).map((h) => [h.name, h.due])).toEqual([
      ["Homework 1", "Tue 1 Sep"],
      ["Homework 2", "Mon 7 Sep"],
      ["Homework 3", "Mon 14 Sep"],
    ]);
    expect(classroomReducer(read, { type: "reset" }).homeworks).toBeUndefined();
  });

  it("covers Problem Sets 5 and 6 by the date rule", () => {
    const after = homeworkSent(created({ ...INITIAL_CLASSROOM, ...readyDraft(now - 10) }, now - 5), now);
    expect(after.homeworks).toBeUndefined();
    const sent = homeworkSent(drafted(after, "accept"), now);
    const list = classHomeworks(sent);
    const sets = ["pset-6", "pset-5", "pset-4", "pset-3", "pset-2", "pset-1"].map((id) => assignmentBundle(id, sent)!);
    expect(coveredSetIds(list[2], sets, list)).toEqual(["pset-6", "pset-5"]);
    expect(homeworkForDue("Thu 10 Sep", list)?.id).toBe("hw-3");
  });
});

describe("the in-class set's due-date note (ticket 291)", () => {
  const sent = homeworkSent(drafted(INITIAL_CLASSROOM, "accept"), now);
  const opened: ClassroomState = { ...sent, homeworks: sent.homeworks!.map((h) => ({ ...h, openedAt: now })) };

  it("says nothing while no homework the date falls in has opened", () => {
    expect(psetDueNote("2026-09-10", INITIAL_CLASSROOM)).toBeNull();
    expect(psetDueNote("2026-09-10", sent)).toBeNull();
    expect(psetDueNote("2026-09-13", sent)).toBeNull();
  });

  it("names the next homework for a date inside one already open (its contents froze at opening)", () => {
    for (const day of ["2026-09-10", "2026-09-11", "2026-09-13"]) expect(psetDueNote(day, opened)).toBe("Mistakes from this set go into Homework 4");
    // Due on Homework 3's own day or later: in no homework yet, so nothing to say.
    expect(psetDueNote("2026-09-14", opened)).toBeNull();
    expect(psetDueNote("2026-09-21", opened)).toBeNull();
    // Inside the fixtures' past homeworks, which opened long ago.
    expect(psetDueNote("2026-09-02", INITIAL_CLASSROOM)).toBe("Mistakes from this set go into Homework 3");
  });
});
