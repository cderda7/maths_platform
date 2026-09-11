import { describe, expect, it } from "vitest";
import { PRACTICE, PRACTICES, WARMUP_BANK } from "@/data/practice";
import { studentLeafName } from "@/data/taxonomy";
import type { PracticeProblem } from "@/data/types";
import { CHAT_OPENER, chatOpener, chatSegments, EXAMPLE_OPENER, findPractice, helpChatMessages, helpChatSystem, HINT_OPENER_START, hintOpener, parseHelpChatRequest } from "./helpChat";

const every = (): PracticeProblem[] => WARMUP_BANK.flatMap((p) => (p.followUp ? [p, p.followUp] : [p]));

describe("findPractice", () => {
  it("finds a first problem and a follow-up by id, and nothing else", () => {
    expect(findPractice("w-monic")?.tex).toBe("x^2 + 7x + 12 = 0");
    expect(findPractice("w-monic-2")?.tex).toBe("x^2 - 7x + 10 = 0");
    expect(findPractice("q1")).toBeNull();
    expect(findPractice("")).toBeNull();
  });
});

describe("the ways in", () => {
  it("every problem with a choice offers at least two, each named with a hint that never carries the step out", () => {
    for (const p of every()) {
      if (!p.approaches) continue;
      expect(p.approaches.length, p.id).toBeGreaterThanOrEqual(2);
      for (const a of p.approaches) {
        expect(a.name.trim(), p.id).not.toBe("");
        expect(a.hint.trim(), p.id).not.toBe("");
        // A hint names the move; the reference working's final line is the one thing it must not say.
        const last = p.steps[p.steps.length - 1].tex;
        expect(a.hint, `${p.id}: ${a.name}`).not.toContain(last);
      }
      expect(new Set(p.approaches.map((a) => a.name)).size, p.id).toBe(p.approaches.length);
    }
  });

  it("the default warm-up and its follow-up both have a choice", () => {
    expect(PRACTICE.approaches?.map((a) => a.name)).toEqual(["factorise", "the quadratic formula"]);
    expect(PRACTICE.followUp?.approaches?.length).toBe(2);
  });

  it("a problem with one way in has none listed", () => {
    expect(PRACTICES["unit.u1.nfl"]?.approaches).toBeUndefined();
    expect(PRACTICES["algebra.number.fractions"]?.approaches).toBeUndefined();
  });
});

describe("helpChatSystem", () => {
  const p = PRACTICE;

  it("carries the problem, the skill, the reference working, the pad's hint and the ways in", () => {
    const s = helpChatSystem(p, []);
    expect(s).toContain(p.stem);
    expect(s).toContain(p.tex);
    expect(s).toContain(`Skill: ${studentLeafName(p.leaf).name}`);
    for (const st of p.steps) expect(s).toContain(`${st.label}: ${st.tex}`);
    for (const h of p.hints) expect(s).toContain(h.text);
    expect(s).toContain("- factorise: ");
    expect(s).toContain("- the quadratic formula: ");
    expect(s).toContain(`"${CHAT_OPENER}"`);
  });

  it("names the pad's own tutor line as the opener when the chat opened on a hint, and tells the tutor what such a line means", () => {
    const opened = [
      { from: "tutor" as const, text: hintOpener(2) },
      { from: "student" as const, text: "set them to zero?" },
    ];
    const s = helpChatSystem(p, [], opened);
    expect(s).toContain(`"${hintOpener(2)}"`);
    expect(s).not.toContain(`"${CHAT_OPENER}"`);
    expect(s).toContain(`beginning "${HINT_OPENER_START}"`);
    expect(s).toContain("Do not say what the next hint would say until they have used this one.");
    expect(hintOpener(2)).toBe("Let's talk more about hint 2 before another one. What is it asking you to do here, in your own words?");
    expect(chatOpener([])).toBe(CHAT_OPENER);
    expect(chatOpener([{ from: "student", text: "hi" }])).toBe(CHAT_OPENER);
    expect(chatOpener(opened)).toBe(hintOpener(2));
  });

  it("lists the lines the pad has read, numbered, or says there are none", () => {
    expect(helpChatSystem(p, [])).toContain("(nothing yet)");
    const s = helpChatSystem(p, ["3 \\times 4 = 12", "(x + 3)(x + 4) = 0"]);
    expect(s).toContain("1. 3 \\times 4 = 12\n2. (x + 3)(x + 4) = 0");
    expect(s).not.toContain("(nothing yet)");
  });

  it("beside the worked example: opens by asking which step, marks the steps on screen, and frees the tutor to explain those and only those", () => {
    expect(chatOpener([], true)).toBe(EXAMPLE_OPENER);
    expect(chatOpener([{ from: "tutor", text: hintOpener(1) }], true)).toBe(hintOpener(1));
    expect(EXAMPLE_OPENER).toBe("Which step, and what about it?");
    const s = helpChatSystem(p, [], [], 2);
    expect(s).toContain(`"${EXAMPLE_OPENER}"`);
    expect(s).not.toContain(`"${CHAT_OPENER}"`);
    expect(s).toContain('headed "Question about a step?"');
    expect(s).toContain("Steps 1 to 2 are on screen");
    expect(s).toContain(`1. (on screen) ${p.steps[0].label}: ${p.steps[0].tex}`);
    expect(s).toContain(`2. (on screen) ${p.steps[1].label}: ${p.steps[1].tex}`);
    expect(s).toContain(`3. (not yet shown) ${p.steps[2].label}: ${p.steps[2].tex}`);
    expect(s).toContain("a step on screen you may explain in full");
    expect(s).toContain("Never show, paste or paraphrase a step not yet shown");
    expect(s).not.toContain("for your eyes only. Never show it");
    expect(helpChatSystem(p, [], [], 0)).toContain("No step is on screen yet");
    expect(helpChatSystem(p, [], [], 1)).toContain("Step 1 is on screen");
    // A count past the end (a stale reload) still reads as the whole working shown.
    expect(helpChatSystem(p, [], [], 99)).toContain(`Steps 1 to ${p.steps.length} are on screen`);
  });

  it("on the pad (no step count) the brief is unchanged: the working is the tutor's alone and no step is marked", () => {
    const s = helpChatSystem(p, []);
    expect(s).toContain("for your eyes only. Never show it");
    expect(s).not.toContain("(on screen)");
    expect(s).not.toContain("(not yet shown)");
    expect(s).not.toContain("Question about a step?");
    expect(s).not.toContain("explain in full");
  });

  it("says there is one way in when the problem lists none", () => {
    expect(helpChatSystem(PRACTICES["unit.u1.nfl"]!, [])).toContain("(one way in; the hints above name it)");
  });

  it("holds the tutor to hints, to a choice of two ways, and to short replies", () => {
    const s = helpChatSystem(p, []);
    expect(s).toContain("Hints, never answers.");
    expect(s).toContain("lay out two of them");
    expect(s).toContain("which one makes more sense to them");
    expect(s).toContain("stay on the way they chose");
    expect(s).toContain("Two or three short sentences.");
    expect(s).toContain("Australian spelling");
  });
});

describe("helpChatMessages", () => {
  it("maps the chat to API turns from the student's first message on, in order", () => {
    expect(
      helpChatMessages([
        { from: "student", text: "I don't know where to start" },
        { from: "tutor", text: "Two ways in…" },
        { from: "student", text: "factorising" },
      ]),
    ).toEqual([
      { role: "user", content: "I don't know where to start" },
      { role: "assistant", content: "Two ways in…" },
      { role: "user", content: "factorising" },
    ]);
  });

  it("folds two lines in a row from one side into one turn, so the roles alternate", () => {
    expect(
      helpChatMessages([
        { from: "student", text: "stuck" },
        { from: "tutor", text: "Two ways in…" },
        { from: "tutor", text: hintOpener(2) },
        { from: "student", text: "ok" },
      ]),
    ).toEqual([
      { role: "user", content: "stuck" },
      { role: "assistant", content: `Two ways in…\n\n${hintOpener(2)}` },
      { role: "user", content: "ok" },
    ]);
  });

  it("drops anything before the student's first line, and is empty with no student line", () => {
    expect(helpChatMessages([{ from: "tutor", text: "hello" }, { from: "student", text: "hi" }])).toEqual([{ role: "user", content: "hi" }]);
    expect(helpChatMessages([{ from: "tutor", text: "hello" }])).toEqual([]);
    expect(helpChatMessages([])).toEqual([]);
  });
});

describe("parseHelpChatRequest", () => {
  const good = { problem: "w-monic", lines: ["x^2 + 7x + 12 = 0"], messages: [{ from: "student", text: "stuck" }] };

  it("accepts a well-formed turn", () => {
    expect(parseHelpChatRequest(good)).toEqual(good);
    expect(parseHelpChatRequest({ ...good, lines: [] })).toEqual({ ...good, lines: [] });
  });

  it("carries the worked example's step count when sent, and only a whole non-negative one", () => {
    expect(parseHelpChatRequest({ ...good, shown: 2 })).toEqual({ ...good, shown: 2 });
    expect(parseHelpChatRequest({ ...good, shown: 0 })).toEqual({ ...good, shown: 0 });
    expect(parseHelpChatRequest(good)).not.toHaveProperty("shown");
    expect(parseHelpChatRequest({ ...good, shown: -1 })).toBeNull();
    expect(parseHelpChatRequest({ ...good, shown: 1.5 })).toBeNull();
    expect(parseHelpChatRequest({ ...good, shown: "2" })).toBeNull();
  });

  it("refuses a missing or malformed field", () => {
    expect(parseHelpChatRequest(null)).toBeNull();
    expect(parseHelpChatRequest("x")).toBeNull();
    expect(parseHelpChatRequest({ ...good, problem: 3 })).toBeNull();
    expect(parseHelpChatRequest({ ...good, lines: "x" })).toBeNull();
    expect(parseHelpChatRequest({ ...good, lines: [1] })).toBeNull();
    expect(parseHelpChatRequest({ ...good, messages: [{ from: "teacher", text: "x" }] })).toBeNull();
    expect(parseHelpChatRequest({ ...good, messages: [{ from: "student" }] })).toBeNull();
  });

  it("refuses a turn that does not end with something from the student", () => {
    expect(parseHelpChatRequest({ ...good, messages: [] })).toBeNull();
    expect(parseHelpChatRequest({ ...good, messages: [{ from: "tutor", text: "x" }] })).toBeNull();
    expect(parseHelpChatRequest({ ...good, messages: [{ from: "student", text: "   " }] })).toBeNull();
    expect(parseHelpChatRequest({ ...good, messages: [{ from: "student", text: "a" }, { from: "tutor", text: "b" }] })).toBeNull();
  });
});

describe("chatSegments", () => {
  it("splits prose from the maths in dollars", () => {
    expect(chatSegments("Try $x^2 + 7x + 12$ first, then $(x+3)$.")).toEqual([
      { text: "Try " },
      { text: "x^2 + 7x + 12", tex: true },
      { text: " first, then " },
      { text: "(x+3)", tex: true },
      { text: "." },
    ]);
  });

  it("reads \\( … \\) as maths too, and plain text as one run", () => {
    expect(chatSegments("so \\(a = 1\\) here")).toEqual([{ text: "so " }, { text: "a = 1", tex: true }, { text: " here" }]);
    expect(chatSegments("no maths")).toEqual([{ text: "no maths" }]);
    expect(chatSegments("")).toEqual([]);
  });

  it("leaves an unmatched dollar sign alone", () => {
    expect(chatSegments("it costs $5 and $x$ is unknown")).toEqual([{ text: "it costs $5 and " }, { text: "x", tex: true }, { text: " is unknown" }]);
    expect(chatSegments("only $one")).toEqual([{ text: "only $one" }]);
  });
});
