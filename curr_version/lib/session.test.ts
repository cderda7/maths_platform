import { describe, expect, it } from "vitest";
import { INITIAL_SESSION, sessionAt, sessionReducer } from "./session";

describe("student session flow", () => {
  it("declining practice goes straight to the confidence survey", () => {
    const s = sessionReducer(INITIAL_SESSION, { type: "practice/decline" });
    expect(s.stage).toBe("confidence");
    expect(s.practice).toBe("declined");
  });

  it("accepting practice visits the warm-up, then the survey", () => {
    let s = sessionReducer(INITIAL_SESSION, { type: "practice/accept" });
    expect(s.stage).toBe("practice");
    s = sessionReducer(s, { type: "practice/finish" });
    expect(s.stage).toBe("confidence");
    expect(s.practice).toBe("taken");
  });

  it("the confidence answer is kept and starts the set", () => {
    const s = sessionReducer(sessionAt("confidence"), { type: "confidence/set", confidence: { level: "low-when", subskill: "fractions" } });
    expect(s.stage).toBe("working");
    expect(s.confidence).toEqual({ level: "low-when", subskill: "fractions" });
  });

  it("deep-linking past the survey fills in earlier answers", () => {
    expect(sessionAt("working").confidence).not.toBeNull();
    expect(sessionAt("overview")).toEqual(INITIAL_SESSION);
  });
});
