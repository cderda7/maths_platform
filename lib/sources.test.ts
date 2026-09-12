import { beforeEach, describe, expect, it } from "vitest";
import { clearMemorySources, deleteSource, getSource, putSource, thumbOf, thumbSize } from "./sources";

describe("the source store (the in-memory stand-in, where there is no IndexedDB)", () => {
  beforeEach(() => clearMemorySources());

  it("keeps a blob by id with its name and mime, gives it back, and forgets it", async () => {
    const blob = new Blob(["png"], { type: "image/png" });
    const id = await putSource(blob, "shot.png", "image/png");
    expect(typeof id).toBe("string");
    const got = await getSource(id);
    expect(got?.name).toBe("shot.png");
    expect(got?.mime).toBe("image/png");
    expect(await got?.blob.text()).toBe("png");
    expect(got?.addedAt).toBeGreaterThan(0);
    await deleteSource(id);
    expect(await getSource(id)).toBeNull();
    expect(await getSource("never")).toBeNull();
  });

  it("takes a given id, and two puts are two ids", async () => {
    expect(await putSource(new Blob(["a"]), "a", "image/png", "fixed")).toBe("fixed");
    const b = await putSource(new Blob(["b"]), "b", "image/png");
    expect(b).not.toBe("fixed");
    expect((await getSource("fixed"))?.name).toBe("a");
  });
});

describe("thumbnails", () => {
  it("scale the longer side to 160 and never scale up", () => {
    expect(thumbSize(640, 480)).toEqual({ width: 160, height: 120 });
    expect(thumbSize(300, 900)).toEqual({ width: 53, height: 160 });
    expect(thumbSize(100, 50)).toEqual({ width: 100, height: 50 });
    expect(thumbSize(0, 0)).toEqual({ width: 1, height: 1 });
  });

  it("are undefined where the browser cannot draw", async () => {
    expect(await thumbOf(new Blob(["x"], { type: "image/png" }))).toBeUndefined();
  });
});
