import { describe, expect, it, vi } from "vitest";

const redirect = vi.fn();
vi.mock("next/navigation", () => ({ redirect: (to: string) => redirect(to) }));

describe("the site's front page (ticket 286)", () => {
  it("renders the chooser at / without redirecting", async () => {
    const { default: Page } = await import("./page");
    expect(Page()).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("redirects the old /demo address to /", async () => {
    const { default: Demo } = await import("./demo/page");
    Demo();
    expect(redirect).toHaveBeenCalledExactlyOnceWith("/");
  });
});
