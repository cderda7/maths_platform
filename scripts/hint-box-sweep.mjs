/**
 * Lit hint box sweep for the student's practice pad (ticket 104; the check behind tickets 96–100).
 *
 * For every warm-up in the bank (every leaf in scripts/warmup-leaves.json with its line count, which a unit test holds to
 * data/practice.ts, ticked on the confidence screen so the warm-up strip offers them all): opens it, writes each line of the working
 * in turn (a scribble on the pad reveals the next scripted line), opens the hint offered at each
 * point and hovers every linked word. With each word lit it checks, in the problem and in every
 * read-as line:
 *
 *   1. no lit box intersects any glyph or fraction bar outside it (the box never covers a
 *      neighbour: the x of 7x, the other factor, the bar above a denominator);
 *   2. no glyph has moved between the plain problem, the wrapped one (hint open) and the lit
 *      one (lighting changes colour only, never the layout: ticket 30).
 *
 * Run it before calling any change to `lib/hint.ts` or to `.hint-term` in `app/globals.css` done;
 * the unit tests cover the TeX's spacing, this covers the pixels. Expects a running production
 * build. From the repo root:
 *
 *     npx next build && npx next start -p 3121
 *     npm run sweep:hint-boxes
 *
 * Knobs (environment): HINT_SWEEP_URL (default http://localhost:3121), HINT_SWEEP_SHOTS (a directory;
 * when set, a 3× clip of every lit box is saved there as <warm-up>-<lines>-<word>.png), CDP_PORT
 * (default 9382; the script refuses to run if something already answers there), CDP_PROFILE (the
 * throwaway profile dir; default a fresh dir under the OS temp dir), CHROME (the binary; default the
 * macOS Google Chrome path).
 *
 * The browser is ended for real whatever happens: Browser.close over CDP, then SIGKILL, then the
 * profile dir is deleted. Needs Node 22+ (global WebSocket and fetch); no dependencies.
 */
import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = (process.env.HINT_SWEEP_URL ?? "http://localhost:3121").replace(/\/$/, "");
const SHOTS = process.env.HINT_SWEEP_SHOTS ?? null;
const CDP_PORT = Number(process.env.CDP_PORT ?? 9382);
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PROFILE = process.env.CDP_PROFILE ?? mkdtempSync(join(tmpdir(), "edexia-cdp-hint-sweep-"));
const CANVAS = "[data-run] canvas";
/** Every warm-up in the bank, leaf → lines in its working; a unit test holds it to data/practice.ts. */
const LINES = JSON.parse(readFileSync(new URL("./warmup-leaves.json", import.meta.url), "utf8"));
const LEAVES = Object.keys(LINES);
const SESSION_KEY = "edexia-maths-demo/session/v1";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Runs in the page: every glyph and fraction bar under `root`, in DOM order, with its box. KaTeX's zero-width helper spans are not glyphs, and neither is a conjured fragment (the 1 hung in the margin before x², inside a `.llap`): it shows only while lit, at zero width, and the check is that everything else stays put. */
const glyphsIn = (root) => `(() => {
  const leaves = [...document.querySelectorAll(${JSON.stringify(root)} + " .katex-html span")].filter((s) => s.childElementCount === 0 && !s.closest(".llap") && (s.textContent.replace(/\\u200b/g, "").trim() || s.classList.contains("frac-line")));
  return leaves.map((s) => { const r = s.getBoundingClientRect(); return { ch: s.classList.contains("frac-line") ? "—" : s.textContent, l: +r.left.toFixed(1), t: +r.top.toFixed(1) }; });
})()`;

/** Runs in the page: every outermost lit box on the pad against every glyph and fraction bar of its own expression outside it. */
const OVERLAPS = `(() => {
  const all = [...document.querySelectorAll("[data-run] .hint-term-lit")];
  const lits = all.filter((l) => !all.some((o) => o !== l && o.contains(l)));
  const out = [];
  for (const lit of lits) {
    const lr = lit.getBoundingClientRect();
    const leaves = [...lit.closest(".katex").querySelectorAll("span")].filter((s) => s.childElementCount === 0 && (s.textContent.replace(/\\u200b/g, "").trim() || s.classList.contains("frac-line")));
    for (const s of leaves) {
      if (lit.contains(s)) continue;
      const g = s.getBoundingClientRect();
      const ox = Math.min(lr.right, g.right) - Math.max(lr.left, g.left);
      const oy = Math.min(lr.bottom, g.bottom) - Math.max(lr.top, g.top);
      if (ox > 0.5 && oy > 0.5) out.push({ box: lit.textContent, glyph: s.classList.contains("frac-line") ? "fraction bar" : s.textContent, ox: +ox.toFixed(1), oy: +oy.toFixed(1) });
    }
  }
  const first = lits[0]?.getBoundingClientRect();
  return { boxes: lits.map((l) => l.textContent), overlaps: out, clip: first ? { x: first.left - 80, y: first.top - 40, width: 320, height: first.height + 80 } : null };
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
    const res = await fetch(base + "/student", { redirect: "manual" });
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

/** A tab on the practice stage, with the few gestures the sweep needs. Every tab is a fresh session: the demo's state lives in localStorage, which a closed tab's writes leave behind, so the stage is reset on open. */
async function openTab(browser) {
  const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });
  const send = (method, params) => browser.send(method, params, sessionId);
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("Network.setCacheDisabled", { cacheDisabled: true });
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  };
  const tab = {
    evaluate,
    /** The practice stage with every warm-up in the bank ticked, so the strip offers them all. */
    async gotoEveryWarmup() {
      await tab.goto(BASE + "/student?stage=practice");
      await evaluate(`(() => { const s = JSON.parse(localStorage.getItem(${JSON.stringify(SESSION_KEY)})); s.confidence = { level: "low-when", leaves: ${JSON.stringify(LEAVES)} }; localStorage.setItem(${JSON.stringify(SESSION_KEY)}, JSON.stringify(s)); })()`);
      await tab.goto(BASE + "/student");
    },
    async goto(url) {
      await send("Page.navigate", { url });
      const started = Date.now();
      while (Date.now() - started < 20000) {
        if (await evaluate(`document.readyState === "complete" && !!document.querySelector("[data-run]")`)) break;
        await sleep(150);
      }
      await sleep(600);
    },
    async click(selector) {
      const ok = await evaluate(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); if (!e) return false; e.click(); return true; })()`);
      if (!ok) throw new Error("no element " + selector);
      await sleep(250);
    },
    async clickButton(text) {
      const ok = await evaluate(`(() => { const e = [...document.querySelectorAll("button")].find((b) => b.textContent.trim().includes(${JSON.stringify(text)})); if (!e) return false; e.click(); return true; })()`);
      if (!ok) throw new Error("no button " + text);
      await sleep(250);
    },
    async hover(selector, on) {
      await evaluate(`(() => { const es = [...document.querySelectorAll(${JSON.stringify(selector)})]; const e = es[es.length - 1]; if (!e) return false; e.dispatchEvent(new MouseEvent(${JSON.stringify(on ? "mouseover" : "mouseout")}, { bubbles: true })); return true; })()`);
      await sleep(250);
    },
    /** One scribbled stroke across the pad: the burst that reveals the next scripted line. */
    async scribble(k) {
      const r = await evaluate(`(() => { const b = document.querySelector(${JSON.stringify(CANVAS)}).getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; })()`);
      const pts = [
        [0.2, 0.12 + k * 0.08],
        [0.4, 0.13 + k * 0.08],
        [0.6, 0.14 + k * 0.08],
      ].map(([fx, fy]) => ({ x: r.x + r.w * fx, y: r.y + r.h * fy }));
      await send("Input.dispatchMouseEvent", { type: "mousePressed", x: pts[0].x, y: pts[0].y, button: "left", clickCount: 1 });
      for (const p of pts.slice(1)) {
        await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: p.x, y: p.y, button: "left" });
        await sleep(8);
      }
      await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: pts[2].x, y: pts[2].y, button: "left", clickCount: 1 });
      await sleep(1500);
    },
    async shot(path, clip) {
      const { data } = await send("Page.captureScreenshot", { format: "png", clip: { ...clip, scale: 3 } });
      writeFileSync(path, Buffer.from(data, "base64"));
    },
    close: () => browser.send("Target.closeTarget", { targetId }),
  };
  return tab;
}

const moved = (a, b) => a.length !== b.length || a.some((g, i) => g.ch !== b[i].ch || Math.abs(g.l - b[i].l) > 0.5 || Math.abs(g.t - b[i].t) > 0.5);

async function main() {
  await assertApp(BASE);
  await assertFree(CDP_PORT);
  if (SHOTS) mkdirSync(SHOTS, { recursive: true });
  const browser = await launchChrome();
  const onSignal = () => browser.close().finally(() => process.exit(130));
  process.on("SIGINT", onSignal);
  process.on("SIGTERM", onSignal);
  let checks = 0;
  const failures = [];
  try {
    const first = await openTab(browser);
    await first.gotoEveryWarmup();
    const leaves = await first.evaluate(`[...document.querySelectorAll("[data-sequence] button[data-leaf]")].map((b) => b.dataset.leaf)`);
    await first.close();
    if (leaves.length !== LEAVES.length) throw new Error(`the warm-up strip offers ${leaves.length} of the bank's ${LEAVES.length} warm-ups`);
    console.log(`warm-ups: ${leaves.join(", ")}`);
    for (const leaf of leaves) {
      const tab = await openTab(browser);
      await tab.gotoEveryWarmup();
      await tab.click(`[data-sequence] button[data-leaf="${leaf}"]`);
      await sleep(500);
      const short = leaf.split(".").pop();
      /** Lines in the warm-up's working: the sweep reads every one, and fails rather than silently stopping short. */
      const steps = LINES[leaf];
      for (let k = 0; k <= steps; k++) {
        if (k > 0) {
          const before = await tab.evaluate(`document.querySelectorAll("[data-run] aside ol > li:has(.katex)").length`);
          await tab.scribble(k);
          const after = await tab.evaluate(`document.querySelectorAll("[data-run] aside ol > li:has(.katex)").length`);
          if (after === before) throw new Error(`${short}: the pad read no line ${k} of ${steps}`);
        }
        await tab.clickButton("I need help");
        await sleep(200);
        const offered = await tab.evaluate(`!!document.querySelector('[data-help-option="hint"]:not([disabled])')`);
        if (!offered) {
          await tab.evaluate(`document.body.click()`);
          continue;
        }
        const plainProblem = await tab.evaluate(glyphsIn("[data-run] .katex-display"));
        const plainLines = await tab.evaluate(glyphsIn("[data-run] aside"));
        await tab.click('[data-help-option="hint"]');
        await sleep(500);
        // The latest hint is still to be used: "hint" shows the stall notice, not a new hint. Close it and write the next line.
        if (await tab.evaluate(`!!document.querySelector("[data-stall-notice]")`)) {
          await tab.evaluate(`document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
          await sleep(300);
          if (await tab.evaluate(`!!document.querySelector("[data-stall-notice]")`)) throw new Error(`${short} · ${k} lines: the stall notice did not close`);
          continue;
        }
        const label = (word) => `${short} · ${k} line${k === 1 ? "" : "s"} · "${word}"`;
        const wrappedMoved = moved(plainProblem, await tab.evaluate(glyphsIn("[data-run] .katex-display"))) || moved(plainLines, await tab.evaluate(glyphsIn("[data-run] aside")));
        checks++;
        if (wrappedMoved) {
          failures.push(`${short} · ${k} lines: opening the hint moved a glyph`);
          console.log(`FAIL  ${short} · ${k} lines: opening the hint moved a glyph`);
        }
        const words = [...new Set(await tab.evaluate(`[...document.querySelectorAll("[data-hint-term]")].map((e) => e.dataset.hintTerm)`))];
        for (const word of words) {
          const sel = `[data-hint-term="${word}"]`;
          await tab.hover(sel, true);
          const r = await tab.evaluate(OVERLAPS);
          const litMoved = moved(plainProblem, await tab.evaluate(glyphsIn("[data-run] .katex-display"))) || moved(plainLines, await tab.evaluate(glyphsIn("[data-run] aside")));
          checks++;
          const problems = r.overlaps.map((o) => `box "${o.box}" covers ${o.glyph === "fraction bar" ? "a fraction bar" : `"${o.glyph}"`} by ${o.ox}×${o.oy}px`);
          if (litMoved) problems.push("lighting moved a glyph");
          if (!r.boxes.length) problems.push("nothing lit");
          if (problems.length) {
            failures.push(`${label(word)}: ${problems.join("; ")}`);
            console.log(`FAIL  ${label(word)}`);
            for (const p of problems) console.log(`      ${p}`);
          } else {
            console.log(`ok    ${label(word)}  boxes ${r.boxes.map((b) => `[${b}]`).join(" ")}`);
          }
          if (SHOTS && r.clip) await tab.shot(join(SHOTS, `${short}-${k}-${word.replace(/\W+/g, "_")}.png`), r.clip);
          await tab.hover(sel, false);
        }
      }
      await tab.close();
    }
  } finally {
    await browser.close();
  }
  if (failures.length) {
    console.log(`\n${failures.length} of ${checks} checks failed: a lit box covers a neighbour, or something moved.`);
    process.exitCode = 1;
  } else {
    console.log(`\nAll ${checks} checks pass: no lit box covers a neighbour and nothing moves.`);
  }
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exitCode = 1;
});
