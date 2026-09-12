import Anthropic from "@anthropic-ai/sdk";
import { fixtureDrafts } from "@/data/extract-fixtures";
import { base64ToBytes, EXTRACT_MAX_TOKENS, EXTRACT_MODEL, extractMessages, extractSystem, LineBuffer, MAX_PAGES, parseDraftLine, parseExtractRequest, pdfPageCount, type ExtractEvent, type ExtractFailure, type Source } from "@/lib/extract";

/**
 * Problem extraction (ticket 170): the create screen posts one or more sources (typed text, an
 * image, a PDF) and reads back a stream of drafts, one JSON line per problem, in reading order,
 * then a `done` line per source. Modelled on the help chat route: credentials from the server's
 * environment (`ANTHROPIC_API_KEY`, or an `ant auth login` profile), the first event awaited
 * before the response commits so a failure is an HTTP status the screen can read, not a broken
 * stream. With `EXTRACT_FIXTURES=1` the model is skipped and `data/extract-fixtures.ts`
 * answers, one draft per beat, so the streaming path is exercised without a key.
 */
export const runtime = "nodejs";

/** The pause between fixture drafts: long enough that a tile visibly arrives after the last, short enough that ten are done in a breath. */
export const FIXTURE_BEAT_MS = 120;

const fail = (error: ExtractFailure, status: number) => Response.json({ error }, { status, headers: { "cache-control": "no-store" } });

const HEADERS = { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" };

const line = (ev: ExtractEvent) => JSON.stringify(ev) + "\n";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** A PDF past the page cap, checked here as well as in the browser; a PDF whose pages cannot be counted passes (the model reads it either way). */
const overPageCap = (s: Source) => s.kind === "pdf" && (pdfPageCount(base64ToBytes(s.data)) ?? 0) > MAX_PAGES;

function fixtureStream(sources: Source[]): Response {
  const encoder = new TextEncoder();
  const out = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for (let i = 0; i < sources.length; i++) {
          const drafts = await fixtureDrafts(sources[i], i);
          for (const d of drafts) {
            await sleep(FIXTURE_BEAT_MS);
            controller.enqueue(encoder.encode(line({ type: "draft", ...d })));
          }
          controller.enqueue(encoder.encode(line({ type: "done", source: i })));
        }
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });
  return new Response(out, { headers: HEADERS });
}

export async function POST(req: Request): Promise<Response> {
  const parsed = parseExtractRequest(await req.json().catch(() => null));
  if (!parsed.ok) return fail(parsed.failure, parsed.failure === "too-large" ? 413 : 400);
  const { sources } = parsed.request;
  if (sources.some(overPageCap)) return fail("too-large", 413);

  if (process.env.EXTRACT_FIXTURES === "1") return fixtureStream(sources);

  const client = new Anthropic();
  const stream = client.beta.messages.stream({
    model: EXTRACT_MODEL,
    max_tokens: EXTRACT_MAX_TOKENS,
    system: extractSystem(),
    messages: extractMessages(sources),
    // A declined turn re-runs on a fallback model server-side rather than leaving the teacher with nothing.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  });

  // Take the first event before answering, so a failure to connect (no credentials, a rate
  // limit, the API down) is an HTTP status the screen can read, not a broken stream.
  const events = stream[Symbol.asyncIterator]();
  let first: IteratorResult<Anthropic.Beta.BetaRawMessageStreamEvent>;
  try {
    first = await events.next();
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) return fail("not-configured", 503);
    if (e instanceof Anthropic.RateLimitError) return fail("busy", 429);
    if (e instanceof Anthropic.APIError) return fail("unavailable", 502);
    // Not an API reply at all: the SDK found no credentials to send.
    if (e instanceof Anthropic.AnthropicError) return fail("not-configured", 503);
    throw e;
  }

  const encoder = new TextEncoder();
  const text = (event: Anthropic.Beta.BetaRawMessageStreamEvent) => (event.type === "content_block_delta" && event.delta.type === "text_delta" ? event.delta.text : "");
  const out = new ReadableStream<Uint8Array>({
    async start(controller) {
      const lines = new LineBuffer();
      const emitted = new Array<number>(sources.length).fill(0);
      const dropped = new Array<number>(sources.length).fill(0);
      const push = (ev: ExtractEvent) => controller.enqueue(encoder.encode(line(ev)));
      // Every complete line the model writes: a draft goes out at once; a fence or a stray word is dropped and counted against the first source (a line with no source names none).
      const take = (ls: string[]) => {
        for (const l of ls) {
          if (!l.trim() || l.trim().startsWith("```")) continue;
          const d = parseDraftLine(l, sources.length);
          if (d) {
            emitted[d.source]++;
            push({ type: "draft", ...d });
          } else dropped[0]++;
        }
      };
      try {
        for (let cur = first; !cur.done; cur = await events.next()) take(lines.push(text(cur.value)));
        take(lines.end());
        const final = await stream.finalMessage();
        const declined = final.stop_reason === "refusal";
        sources.forEach((_, i) => {
          if (declined && emitted[i] === 0) push({ type: "error", source: i, reason: "declined" });
          else push(dropped[i] > 0 ? { type: "done", source: i, dropped: dropped[i] } : { type: "done", source: i });
        });
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
    cancel() {
      stream.abort();
    },
  });
  return new Response(out, { headers: HEADERS });
}
