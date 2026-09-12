import { describe, expect, it } from "vitest";
import type { ExtractEvent } from "./extract";
import { bytesToBase64, ExtractError, extractSource, fileToSource } from "./extractClient";

const stream = (text: string) =>
  new ReadableStream<Uint8Array>({
    start(c) {
      c.enqueue(new TextEncoder().encode(text));
      c.close();
    },
  });

const fetchWith = (res: () => Response | Promise<Response>, seen: { url?: string; body?: unknown } = {}) =>
  (async (url: string | URL | Request, init?: RequestInit) => {
    seen.url = String(url);
    seen.body = JSON.parse(String(init?.body));
    return res();
  }) as typeof fetch;

const all = async (gen: AsyncGenerator<ExtractEvent>) => {
  const out: ExtractEvent[] = [];
  for await (const ev of gen) out.push(ev);
  return out;
};

describe("bytesToBase64", () => {
  it("matches the platform's encoding, across the chunk boundary", () => {
    const bytes = new Uint8Array(70_000).map((_, i) => i % 251);
    expect(bytesToBase64(bytes)).toBe(Buffer.from(bytes).toString("base64"));
    expect(bytesToBase64(new Uint8Array())).toBe("");
  });
});

describe("fileToSource", () => {
  it("is an image source with the file's name, mime and bytes", async () => {
    const blob = new Blob([new Uint8Array([137, 80, 78, 71])], { type: "image/png" });
    expect(await fileToSource(blob, "shot.png", "image/png")).toEqual({ kind: "image", name: "shot.png", mime: "image/png", data: Buffer.from([137, 80, 78, 71]).toString("base64") });
  });
});

describe("extractSource", () => {
  const source = { kind: "image" as const, name: "a.png", mime: "image/png" as const, data: "AAAA" };

  it("posts the one source and yields the route's events as they come", async () => {
    const seen: { url?: string; body?: unknown } = {};
    const f = fetchWith(() => new Response(stream('{"type":"draft","source":0,"stem":"Solve.","tex":"x=1"}\n{"type":"done","source":0}\n'), { status: 200 }), seen);
    expect(await all(extractSource(source, { fetch: f }))).toEqual([
      { type: "draft", source: 0, stem: "Solve.", tex: "x=1" },
      { type: "done", source: 0 },
    ]);
    expect(seen.url).toBe("/api/extract");
    expect(seen.body).toEqual({ sources: [source] });
  });

  it("a non-2xx answer is the route's failure before anything is yielded; an unknown one reads as unavailable", async () => {
    const f503 = fetchWith(() => Response.json({ error: "not-configured" }, { status: 503 }));
    await expect(all(extractSource(source, { fetch: f503 }))).rejects.toMatchObject({ name: "ExtractError", failure: "not-configured" });
    const f429 = fetchWith(() => Response.json({ error: "busy" }, { status: 429 }));
    await expect(all(extractSource(source, { fetch: f429 }))).rejects.toMatchObject({ failure: "busy" });
    const f500 = fetchWith(() => new Response("boom", { status: 500 }));
    await expect(all(extractSource(source, { fetch: f500 }))).rejects.toMatchObject({ failure: "unavailable" });
  });

  it("a request that never reaches the route is network; an aborted one ends quietly", async () => {
    const down = (async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;
    await expect(all(extractSource(source, { fetch: down }))).rejects.toBeInstanceOf(ExtractError);
    await expect(all(extractSource(source, { fetch: down }))).rejects.toMatchObject({ failure: "network" });
    const ctl = new AbortController();
    ctl.abort();
    const aborted = (async () => {
      throw new DOMException("aborted", "AbortError");
    }) as unknown as typeof fetch;
    expect(await all(extractSource(source, { fetch: aborted, signal: ctl.signal }))).toEqual([]);
  });
});
