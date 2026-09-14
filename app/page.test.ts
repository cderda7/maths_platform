import { describe, expect, it, vi } from "vitest";

const redirect = vi.fn();
vi.mock("next/navigation", () => ({ redirect: (to: string) => redirect(to) }));

describe("the site's front page (ticket 265)", () => {
  it("redirects / to the teacher's Edexia Classroom", async () => {
    const { default: Page } = await import("./page");
    Page();
    expect(redirect).toHaveBeenCalledExactlyOnceWith("/teacher");
  });
});
