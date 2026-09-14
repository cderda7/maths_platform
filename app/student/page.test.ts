import { beforeEach, describe, expect, it, vi } from "vitest";

const redirect = vi.fn((to: string) => {
  throw new Error(`redirect ${to}`);
});
vi.mock("next/navigation", () => ({ redirect: (to: string) => redirect(to) }));
vi.mock("./StudentClassroom", () => ({ default: () => null }));
vi.mock("./StudentApp", () => ({ default: () => null }));

type Props = { params?: Promise<Record<string, string>>; searchParams: Promise<Record<string, string | string[] | undefined>> };
const props = (searchParams: Record<string, string | string[] | undefined>, params: Record<string, string> = {}): Props => ({ searchParams: Promise.resolve(searchParams), params: Promise.resolve(params) });

describe("/student is Sam's Classroom (ticket 264)", () => {
  beforeEach(() => {
    redirect.mockClear();
  });

  it("plain, it renders the Classroom", async () => {
    const { default: Page } = await import("./page");
    await Page(props({}) as never);
    expect(redirect).not.toHaveBeenCalled();
  });

  it("an old deep link redirects, query and all, to Problem Set 6's route", async () => {
    const { default: Page } = await import("./page");
    for (const [q, to] of [
      [{ stage: "report" }, "/student/a/pset-6?stage=report"],
      [{ stage: "report", run: "strong" }, "/student/a/pset-6?stage=report&run=strong"],
      [{ pathway: "indiv,group" }, "/student/a/pset-6?pathway=indiv%2Cgroup"],
      [{ run: "strong" }, "/student/a/pset-6?run=strong"],
    ] as const) {
      redirect.mockClear();
      await expect(Page(props(q) as never)).rejects.toThrow(`redirect ${to}`);
      expect(redirect).toHaveBeenCalledExactlyOnceWith(to);
    }
  });

  it("a set other than the live one is not on the iPad: back to the Classroom", async () => {
    const { default: SetPage } = await import("./a/[id]/page");
    await expect(SetPage(props({}, { id: "pset-5" }) as never)).rejects.toThrow("redirect /student");
    redirect.mockClear();
    await SetPage(props({ stage: "working" }, { id: "pset-6" }) as never);
    expect(redirect).not.toHaveBeenCalled();
  });
});
