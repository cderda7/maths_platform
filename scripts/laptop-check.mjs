/**
 * Laptop viewport guard for the teacher's surface (ticket 37).
 *
 * Loads every teacher route at the two laptop sizes (1440 × 900 and 1280 × 800) in a headless
 * Chrome driven over CDP and fails on any horizontal overflow: the document's scrollWidth wider
 * than the viewport, or any visible element whose bounding box ends more than 1 px past it.
 *
 * Expects a running production build. From the repo root:
 *
 *     npx next build && npx next start -p 3121
 *     npm run check:laptop
 *
 * Knobs (environment): LAPTOP_CHECK_URL (default http://localhost:3121), LAPTOP_CHECK_SIZES (default
 * "1440x900,1280x800"; a narrower width such as "900x800" is the way to see the check fail), CDP_PORT (default 9381;
 * the script refuses to run if something already answers there, so a stray browser can never be
 * measured by mistake), CDP_PROFILE (the throwaway profile dir; default a fresh dir under the OS
 * temp dir), CHROME (the binary; default the macOS Google Chrome path).
 *
 * The browser is ended for real whatever happens: Browser.close over CDP, then SIGKILL, then the
 * profile dir is deleted. Needs Node 22+ (global WebSocket and fetch); no dependencies.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Measured in order in one tab. Problem Set 6 only exists once it is created (ticket 188), so the
 * Classroom and the blank create screen come first, then `CREATE_SET` (the student's `?pathway=`
 * deep link, which creates the set as the teacher's Create would; not measured), then its pages.
 */
const BEFORE_CREATE = ["/teacher", "/teacher/assignments/create"];
const CREATE_SET = "/student?pathway=indiv,group";
const CREATED = `!!JSON.parse(localStorage.getItem("edexia-maths-demo/classroom/v1") ?? "null")?.assignment`;
/**
 * The finished sets, newest first; each is measured on Class, Mistakes, Groups and Mia's report. Tickets
 * 211–214 each uncomment their own line (the blank lines keep four branches from conflicting, as in
 * `data/finishedSets.ts`).
 */
const FINISHED_SETS = [
  "pset-5",

  "pset-4", // ticket 214

  "pset-3", // ticket 213

  "pset-2", // ticket 212

  "pset-1",
];
const ROUTES = [
  ...BEFORE_CREATE,
  "/teacher",
  "/teacher/a/pset-6/class",
  "/teacher/a/pset-6/mistakes",
  "/teacher/a/pset-6/groups",
  ...FINISHED_SETS.flatMap((id) => [`/teacher/a/${id}/class`, `/teacher/a/${id}/mistakes`, `/teacher/a/${id}/groups`, `/teacher/a/${id}/report?student=mia`]),
  "/teacher/groups",
  "/teacher/report",
  "/teacher/compare",
  "/teacher/whole-class",
  "/teacher/board",
];
const LAPTOP_SIZES = "1440x900,1280x800";
const SIZES = (process.env.LAPTOP_CHECK_SIZES ?? LAPTOP_SIZES).split(",").map((s) => s.trim().split("x").map(Number));
const TOLERANCE_PX = 1;

const BASE = (process.env.LAPTOP_CHECK_URL ?? "http://localhost:3121").replace(/\/$/, "");
const CDP_PORT = Number(process.env.CDP_PORT ?? 9381);
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PROFILE = process.env.CDP_PROFILE ?? mkdtempSync(join(tmpdir(), "edexia-cdp-laptop-"));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Runs in the page: the viewport's width, the document's scroll width, and every visible box
 * past the edge. clientWidth is the layout viewport without a classic scrollbar, which is
 * narrower than innerWidth when one shows, so the check is the stricter of the two.
 *
 * A box that an ancestor with overflow hidden or clip cuts off is measured at the cut, not at
 * its own edge: nothing past the cut is drawn. KaTeX draws \\sqrt as a path 400 000 units wide
 * inside an svg that clips it, and a truncated line is `overflow-hidden whitespace-nowrap`;
 * neither is a horizontal scroll. A scrollable ancestor (auto, scroll) does not count as a
 * cut: its content past the edge means a scrollbar inside the page, which is what this guards.
 */
const MEASURE = `(() => {
  const vw = document.documentElement.clientWidth;
  const limit = vw + ${TOLERANCE_PX};
  const clipRight = (el) => {
    let right = Infinity;
    for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const o = getComputedStyle(a).overflowX;
      if (o === "hidden" || o === "clip") right = Math.min(right, a.getBoundingClientRect().right);
    }
    return right;
  };
  const wide = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0 || r.right <= limit) continue;
    if (getComputedStyle(el).visibility === "hidden") continue;
    if (Math.min(r.right, clipRight(el)) <= limit) continue;
    const data = [...el.attributes].filter((a) => a.name.startsWith("data-")).map((a) => a.name + (a.value ? "=" + a.value : "")).join(" ");
    const cls = [...el.classList].slice(0, 4).join(".");
    wide.push({ tag: el.tagName.toLowerCase(), id: el.id || null, data, cls, right: Math.round(r.right), width: Math.round(r.width) });
  }
  return { vw, innerWidth: window.innerWidth, scrollWidth: document.documentElement.scrollWidth, bodyScrollWidth: document.body.scrollWidth, wide };
})()`;

async function assertFree(port) {
  let answered = false;
  try {
    await fetch(`http://localhost:${port}/json/version`);
    answered = true;
  } catch {
    // nothing listening: the port is ours
  }
  if (answered) throw new Error(`something already answers on CDP port ${port}; set CDP_PORT to a free one`);
}

async function assertApp(base) {
  try {
    const res = await fetch(base + "/teacher", { redirect: "manual" });
    if (res.status >= 500) throw new Error(`status ${res.status}`);
  } catch (e) {
    throw new Error(`no app at ${base} (${e.message}); run: npx next build && npx next start -p 3121`);
  }
}

async function launchChrome() {
  const proc = spawn(
    CHROME,
    [`--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${PROFILE}`, "--headless=new", "--no-first-run", "--disk-cache-size=1", "--media-cache-size=1", "--window-size=1440,900", "about:blank"],
    { stdio: "ignore" },
  );
  let version;
  for (let i = 0; i < 100 && !version; i++) {
    try {
      version = await (await fetch(`http://localhost:${CDP_PORT}/json/version`)).json();
    } catch {
      await sleep(200);
    }
  }
  if (!version) {
    proc.kill("SIGKILL");
    rmSync(PROFILE, { recursive: true, force: true });
    throw new Error("Chrome did not answer on its CDP port");
  }
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = () => rej(new Error("CDP websocket failed"));
  });
  let nextId = 0;
  const pending = new Map();
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (!msg.id || !pending.has(msg.id)) return;
    const { res, rej } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) rej(new Error(`${msg.error.message} (${msg.error.code})`));
    else res(msg.result);
  };
  const send = (method, params = {}, sessionId) =>
    new Promise((res, rej) => {
      const id = ++nextId;
      pending.set(id, { res, rej });
      ws.send(JSON.stringify({ id, method, params, sessionId }));
    });
  const close = async () => {
    try {
      await Promise.race([send("Browser.close"), sleep(1500)]);
    } catch {
      // the browser may already be gone; SIGKILL below covers it
    }
    try {
      ws.close();
    } catch {
      // already closed
    }
    await sleep(300);
    try {
      proc.kill("SIGKILL");
    } catch {
      // already dead
    }
    rmSync(PROFILE, { recursive: true, force: true });
  };
  return { send, close };
}

async function openTab(browser, [width, height]) {
  const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });
  const send = (method, params) => browser.send(method, params, sessionId);
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("Network.setCacheDisabled", { cacheDisabled: true });
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  };
  return {
    async goto(url, ready = "[data-teacher-root], [data-board]") {
      await send("Page.navigate", { url });
      const started = Date.now();
      // Loaded and hydrated: every teacher route marks its root once the client component has rendered.
      while (Date.now() - started < 20000) {
        if (await evaluate(`document.readyState === "complete" && !!document.querySelector(${JSON.stringify(ready)})`)) break;
        await sleep(150);
      }
      await sleep(600);
    },
    measure: () => evaluate(MEASURE),
    clearStorage: () => evaluate("localStorage.clear()"),
    async until(expression, ms = 10000) {
      const started = Date.now();
      while (Date.now() - started < ms) {
        if (await evaluate(expression)) return true;
        await sleep(150);
      }
      return false;
    },
    close: () => browser.send("Target.closeTarget", { targetId }),
  };
}

function describe(el) {
  const bits = [el.tag];
  if (el.id) bits.push("#" + el.id);
  if (el.data) bits.push("[" + el.data + "]");
  if (el.cls) bits.push("." + el.cls);
  return `${bits.join("")} right ${el.right}px, ${el.width}px wide`;
}

async function main() {
  await assertApp(BASE);
  await assertFree(CDP_PORT);
  const browser = await launchChrome();
  const failures = [];
  const onSignal = () => browser.close().finally(() => process.exit(130));
  process.on("SIGINT", onSignal);
  process.on("SIGTERM", onSignal);
  try {
    for (const size of SIZES) {
      const tab = await openTab(browser, size);
      // A fresh classroom for each size: the previous size created Problem Set 6 in this shared profile.
      await tab.goto(BASE + "/teacher");
      await tab.clearStorage();
      for (const [i, route] of ROUTES.entries()) {
        if (i === BEFORE_CREATE.length) {
          await tab.goto(BASE + CREATE_SET, "body");
          if (!(await tab.until(CREATED))) throw new Error(`${CREATE_SET} did not create Problem Set 6`);
        }
        await tab.goto(BASE + route);
        const m = await tab.measure();
        const label = `${size[0]}x${size[1]} ${route}`;
        const problems = [];
        if (m.scrollWidth > m.vw) problems.push(`document scrollWidth ${m.scrollWidth} > viewport ${m.vw}`);
        if (m.bodyScrollWidth > m.vw) problems.push(`body scrollWidth ${m.bodyScrollWidth} > viewport ${m.vw}`);
        for (const el of m.wide) problems.push(describe(el));
        if (problems.length) {
          failures.push({ label, problems });
          console.log(`FAIL  ${label}`);
          for (const p of problems) console.log(`      ${p}`);
        } else {
          console.log(`ok    ${label}  (scrollWidth ${m.scrollWidth}, viewport ${m.vw}, window ${m.innerWidth})`);
        }
      }
      await tab.close();
    }
  } finally {
    await browser.close();
  }
  const checks = SIZES.length * ROUTES.length;
  if (failures.length) {
    console.log(`\n${failures.length} of ${checks} route/size checks overflow horizontally.`);
    process.exitCode = 1;
  } else {
    console.log(`\nAll ${checks} route/size checks fit: no horizontal overflow on the teacher's laptop.`);
  }
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exitCode = 1;
});
