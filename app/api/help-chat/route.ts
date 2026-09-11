import Anthropic from "@anthropic-ai/sdk";
import { CHAT_DECLINED, findPractice, HELP_CHAT_MAX_TOKENS, HELP_CHAT_MODEL, helpChatMessages, helpChatSystem, parseHelpChatRequest } from "@/lib/helpChat";

/**
 * One turn of the help chat: the pad posts the problem id, the lines read so far and the chat
 * so far; the reply streams back as plain text, a chunk per delta. The only live model call in
 * the app (see DECISION_LOG.md, "The help chat is the one live model call"). Credentials come
 * from the server's environment (`ANTHROPIC_API_KEY`, or an `ant auth login` profile); with
 * none, the pad gets a 503 and says the chat is not connected on this device.
 */
export const runtime = "nodejs";

/** The error the pad reads. `not-configured` is the one it words differently. */
type Failure = "bad-request" | "unknown-problem" | "not-configured" | "busy" | "unavailable";

const fail = (error: Failure, status: number) => Response.json({ error }, { status, headers: { "cache-control": "no-store" } });

export async function POST(req: Request): Promise<Response> {
  const body = parseHelpChatRequest(await req.json().catch(() => null));
  if (!body) return fail("bad-request", 400);
  const problem = findPractice(body.problem);
  if (!problem) return fail("unknown-problem", 404);

  const client = new Anthropic();
  const stream = client.beta.messages.stream({
    model: HELP_CHAT_MODEL,
    max_tokens: HELP_CHAT_MAX_TOKENS,
    system: helpChatSystem(problem, body.lines, body.messages),
    messages: helpChatMessages(body.messages),
    // A declined turn re-runs on a fallback model server-side rather than leaving the student with nothing.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  });

  // Take the first event before answering, so a failure to connect (no credentials, a rate
  // limit, the API down) is an HTTP status the pad can read, not a broken stream.
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
      let sent = 0;
      const push = (s: string) => {
        if (!s) return;
        sent += s.length;
        controller.enqueue(encoder.encode(s));
      };
      try {
        for (let cur = first; !cur.done; cur = await events.next()) push(text(cur.value));
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal" && sent === 0) push(CHAT_DECLINED);
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
    cancel() {
      stream.abort();
    },
  });
  return new Response(out, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
}
