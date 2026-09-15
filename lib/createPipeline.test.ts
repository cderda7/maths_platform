import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Steps from "@/app/teacher/assignments/create/review/Steps";
import { currentStep, PIPELINES, SEND_LIGHT_MS } from "./createPipeline";

const labels = (html: string) => [...html.matchAll(/data-step-item="([a-z]+)"[^>]*>(?:<span[^>]*aria-hidden[^>]*><\/span>)?<(a|button|span)[^>]*>([^<]+)</g)].map((m) => ({ id: m[1], tag: m[2], label: m[3] }));

describe("the create strip's pipeline (ticket 288)", () => {
  it("an in-class set reads Questions, Difficulty, Refine, Pathway, Send", () => {
    expect(PIPELINES.pset.map((s) => s.label)).toEqual(["Questions", "Difficulty", "Refine", "Pathway", "Send"]);
    // Refine keeps its internal name; only the label changed.
    expect(PIPELINES.pset.map((s) => s.id)).toEqual(["questions", "difficulty", "assessment", "pathway", "send"]);
  });

  it("marks the review's own step, Refine through the assessing run, Send while Create's light runs", () => {
    expect(currentStep({ step: "difficulty", assessing: false, sending: false })).toBe("difficulty");
    expect(currentStep({ step: "difficulty", assessing: true, sending: false })).toBe("assessment");
    expect(currentStep({ step: "recommendations", assessing: false, sending: false })).toBe("assessment");
    expect(currentStep({ step: "pathway", assessing: false, sending: false })).toBe("pathway");
    expect(currentStep({ step: "pathway", assessing: false, sending: true })).toBe("send");
  });

  it("Send lights for about 600 ms", () => {
    expect(SEND_LIGHT_MS).toBe(600);
  });
});

describe("the strip (ticket 288)", () => {
  const render = (current: Parameters<typeof Steps>[0]["current"], locked = false) =>
    renderToStaticMarkup(createElement(Steps, { steps: PIPELINES.pset, current, locked, onBack: () => {} }));

  it("shows every label on every step, Send last and never tappable", () => {
    for (const current of ["difficulty", "assessment", "pathway"] as const) {
      const items = labels(render(current));
      expect(items.map((i) => i.label)).toEqual(["Questions", "Difficulty", "Refine", "Pathway", "Send"]);
      expect(items.at(-1)).toMatchObject({ id: "send", tag: "span" });
    }
  });

  it("on the pathway step the steps behind are tappable and Send is ahead", () => {
    const items = labels(render("pathway"));
    expect(items.map((i) => i.tag)).toEqual(["a", "button", "button", "span", "span"]);
    expect(render("pathway")).toContain('data-step="pathway"');
  });

  it("while Send is lit the strip is locked: every earlier step is plain text, Send current", () => {
    const html = render("send", true);
    expect(labels(html).map((i) => i.tag)).toEqual(["span", "span", "span", "span", "span"]);
    expect(html).toContain('data-step="send"');
    expect(html).toContain("data-locked");
    expect(html).toMatch(/data-step-item="send" data-current="true"/);
  });
});
