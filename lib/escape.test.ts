import { describe, expect, it } from "vitest";
import { createEscapeStack, isEscapePress, type EscapeLayer } from "./escape";

const layer = (log: string[], name: string, wall = false): EscapeLayer => ({
  close: wall ? null : () => log.push(`close ${name}`),
  returnFocus: () => log.push(`focus ${name}`),
});

describe("escape stack", () => {
  it("does nothing with nothing open", () => {
    expect(createEscapeStack().escape()).toBe(false);
  });

  it("closes the latest layer first, one per press, then returns its focus", () => {
    const s = createEscapeStack();
    const log: string[] = [];
    const offs = ["drill", "history", "stacks"].map((n) => s.push(layer(log, n)));
    // Each close takes its own layer off, as an unmounting component would.
    expect(s.escape()).toBe(true);
    offs[2]();
    expect(log).toEqual(["close stacks", "focus stacks"]);
    s.escape();
    offs[1]();
    s.escape();
    offs[0]();
    expect(log).toEqual(["close stacks", "focus stacks", "close history", "focus history", "close drill", "focus drill"]);
    expect(s.escape()).toBe(false);
  });

  it("a layer closed another way comes off from the middle, and the order of the rest holds", () => {
    const s = createEscapeStack();
    const log: string[] = [];
    s.push(layer(log, "a"));
    const offB = s.push(layer(log, "b"));
    s.push(layer(log, "c"));
    offB();
    offB();
    s.escape();
    expect(log[0]).toBe("close c");
  });

  it("a wall holds Escape: nothing closes, under it or itself, until it goes", () => {
    const s = createEscapeStack();
    const log: string[] = [];
    s.push(layer(log, "help menu"));
    const offWall = s.push(layer(log, "quick check", true));
    expect(s.escape()).toBe(true);
    expect(s.escape()).toBe(true);
    expect(log).toEqual([]);
    offWall();
    s.escape();
    expect(log).toEqual(["close help menu", "focus help menu"]);
  });

  it("a layer opened after the wall still holds while the wall is open (it sits under the modal on screen)", () => {
    const s = createEscapeStack();
    const log: string[] = [];
    const offWall = s.push(layer(log, "quick check", true));
    s.push(layer(log, "notice"));
    expect(s.escape()).toBe(true);
    expect(log).toEqual([]);
    offWall();
    s.escape();
    expect(log).toEqual(["close notice", "focus notice"]);
  });
});

describe("isEscapePress", () => {
  const key = (over: Partial<Pick<KeyboardEvent, "key" | "defaultPrevented" | "isComposing">>) => ({ key: "Escape", defaultPrevented: false, isComposing: false, ...over });
  it("takes a plain Escape", () => expect(isEscapePress(key({}))).toBe(true));
  it("leaves other keys", () => expect(isEscapePress(key({ key: "Enter" }))).toBe(false));
  it("leaves an Escape a control already used (drag cancel, Fix box clear)", () => expect(isEscapePress(key({ defaultPrevented: true }))).toBe(false));
  it("leaves an Escape that ends an IME composition", () => expect(isEscapePress(key({ isComposing: true }))).toBe(false));
});
