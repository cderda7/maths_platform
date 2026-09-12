import { readExtractEvents, type Draft, type ExtractEvent, type ExtractFailure, type ExtractRequest, type ImageMime, type Source } from "./extract";

/**
 * The create screen's side of the extraction route (ticket 171): a dropped file as a `Source`,
 * and one request whose events arrive one by one as the route writes them. `fetch` is a
 * parameter so the reader is tested against a fake; the screen passes nothing.
 */

/** The route said no before streaming (its typed failure), never answered (`network`), or streamed an `error` for the source (`declined`). */
export class ExtractError extends Error {
  constructor(public readonly failure: ExtractFailure | "network" | "declined") {
    super(failure);
    this.name = "ExtractError";
  }
}

/** Bytes as base64, in chunks so a ten-MB file does not spread over the call stack. */
export function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  return btoa(bin);
}

/** A dropped file as the route takes it: a PDF (by type, or by name when the browser gave none) as a document, else an image whose mime is the file's own (`partitionDrop` has already kept only the four the route accepts). */
export async function fileToSource(blob: Blob, name: string, mime: string): Promise<Source> {
  const data = bytesToBase64(new Uint8Array(await blob.arrayBuffer()));
  if (mime === "application/pdf" || /\.pdf$/i.test(name)) return { kind: "pdf", name, data };
  return { kind: "image", name, mime: mime as ImageMime, data };
}

/**
 * One source posted, its events yielded as they arrive. A non-2xx answer becomes an
 * `ExtractError` with the route's failure before anything is yielded; a request that never
 * reaches the route is `network`.
 */
export async function* extractSource(source: Source, opts: { fetch?: typeof fetch; signal?: AbortSignal } = {}): AsyncGenerator<ExtractEvent> {
  yield* request({ mode: "extract", sources: [source] }, opts);
}

/** One draft corrected by the teacher's instruction (ticket 173): the route's one draft back, or null when it wrote none. */
export async function fixDraft(fix: { stem: string; tex: string | null; instruction: string; source?: Source }, opts: { fetch?: typeof fetch; signal?: AbortSignal } = {}): Promise<Draft | null> {
  for await (const ev of request({ mode: "fix", ...fix }, opts)) {
    if (ev.type === "draft") return ev;
    if (ev.type === "error") throw new ExtractError("declined");
  }
  return null;
}

async function* request(body: ExtractRequest, opts: { fetch?: typeof fetch; signal?: AbortSignal }): AsyncGenerator<ExtractEvent> {
  const f = opts.fetch ?? fetch;
  let res: Response;
  try {
    res = await f("/api/extract", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal: opts.signal });
  } catch {
    if (opts.signal?.aborted) return;
    throw new ExtractError("network");
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    const failure = body?.error;
    throw new ExtractError(failure === "bad-request" || failure === "not-configured" || failure === "busy" || failure === "unavailable" || failure === "too-large" ? failure : "unavailable");
  }
  if (!res.body) throw new ExtractError("unavailable");
  yield* readExtractEvents(res.body);
}
