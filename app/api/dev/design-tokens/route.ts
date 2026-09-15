import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseTokens, setTokenValues } from "@/lib/designTokens";

/**
 * The design tuner's file access (ticket 296), `next dev` only: GET reads the tokens declared in app/globals.css,
 * POST `{ values: { "--token": "value" } }` rewrites those values in place and returns the tokens as saved. Every
 * other environment gets a 404. A JSON body means a cross-site page cannot post here without a preflight the
 * route never answers, and a request a browser marks as cross-site is refused outright.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * app/globals.css beside this route's own source, not under process.cwd(): `next dev <dir>` started from another
 * checkout (a worktree's server launched from the main one) would otherwise read and write that checkout's file.
 */
const cssPath = () => join(dirname(fileURLToPath(import.meta.url)), "../../../globals.css");
const headers = { "cache-control": "no-store" };
const devOnly = () => process.env.NODE_ENV !== "development";

export async function GET(): Promise<Response> {
  if (devOnly()) return new Response(null, { status: 404 });
  return Response.json({ tokens: parseTokens(await readFile(cssPath(), "utf8")) }, { headers });
}

export async function POST(req: Request): Promise<Response> {
  if (devOnly()) return new Response(null, { status: 404 });
  const site = req.headers.get("sec-fetch-site");
  if (!req.headers.get("content-type")?.startsWith("application/json") || (site && site !== "same-origin")) return Response.json({ error: "forbidden" }, { status: 403, headers });
  const body = (await req.json().catch(() => null)) as { values?: unknown } | null;
  const values = body?.values;
  if (!values || typeof values !== "object" || Object.values(values).some((v) => typeof v !== "string")) return Response.json({ error: "bad-request" }, { status: 400, headers });
  const path = cssPath();
  const css = await readFile(path, "utf8");
  let next: string;
  try {
    next = setTokenValues(css, values as Record<string, string>);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400, headers });
  }
  if (next !== css) await writeFile(path, next);
  return Response.json({ tokens: parseTokens(next) }, { headers });
}
