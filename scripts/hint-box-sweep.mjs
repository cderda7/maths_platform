/**
 * Lit hint box sweep for the student's practice pad (ticket 104; the check behind tickets 96–100).
 *
 * Since ticket 312 it also sweeps help on a set question: for every Problem Set 6 question and every skill its "I need help"
 * picker offers, Q** (the question the student finishes: each blank line written in turn, the hint at each point opened,
 * every linked word hovered, in the question and in the working column), and the question itself back on it after
 * practice (its own hints, with its working written up to each point).
 *
 * For every warm-up in the bank and its follow-up (every leaf in scripts/warmup-leaves.json with both line counts, which a unit test
 * holds to data/practice.ts, ticked on the confidence screen so the warm-up strip offers them all): opens it, writes each line of the working
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
 * macOS Google Chrome path), HINT_SWEEP_ONLY ("warm-ups" or "questions": one half of the sweep, while working on it; a
 * change is done only when the whole sweep passes).
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
const ONLY = process.env.HINT_SWEEP_ONLY ?? null;
const CDP_PORT = Number(process.env.CDP_PORT ?? 9382);
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PROFILE = process.env.CDP_PROFILE ?? mkdtempSync(join(tmpdir(), "edexia-cdp-hint-sweep-"));
const CANVAS = "[data-run] canvas";
/** Every warm-up in the bank, leaf → [lines in its working, lines in its follow-up's]; a unit test holds it to data/practice.ts. */
const LINES = JSON.parse(readFileSync(new URL("./warmup-leaves.json", import.meta.url), "utf8"));
const LEAVES = Object.keys(LINES);
/** Problem Set 6's own working, question → its solution lines (ticket 312): written onto the pad back on the question up to each point. A unit test holds it to data/assignment.ts. */
const WORKING = JSON.parse(readFileSync(new URL("./question-working.json", import.meta.url), "utf8"));
const SESSION_KEY = "edexia-maths-demo/session/v1";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Runs in the page: every glyph and fraction bar under `root`, in DOM order, with its box. KaTeX's zero-width helper spans are not glyphs, and neither is a conjured fragment (the 1 hung in the margin before x², inside a `.llap`): it shows only while lit, at zero width, and the check is that everything else stays put. */
const glyphsIn = (root) => `(() => {
  const leaves = [...document.querySelectorAll(${JSON.stringify(root)} + " .katex-html span")].filter((s) => s.childElementCount === 0 && !s.closest(".llap") && (s.textContent.replace(/\\u200b/g, "").trim() || s.classList.contains("frac-line")));
  return leaves.map((s) => { const r = s.getBoundingClientRect(); return { ch: s.classList.contains("frac-line") ? "—" : s.textContent, l: +r.left.toFixed(1), t: +r.top.toFixed(1) }; });
})()`;

/** Runs in the page: every outermost lit box on the pad against every glyph and fraction bar of its own expression outside it. */
const overlaps = (root) => `(() => {
  const all = [...document.querySelectorAll(${JSON.stringify(root)} + " .hint-term-lit")];
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
      await tab.goto(BASE + "/student/a/pset-6?stage=practice");
      await evaluate(`(() => { const s = JSON.parse(localStorage.getItem(${JSON.stringify(SESSION_KEY)})); s.confidence = { level: "low-when", leaves: ${JSON.stringify(LEAVES)} }; localStorage.setItem(${JSON.stringify(SESSION_KEY)}, JSON.stringify(s)); })()`);
      await tab.goto(BASE + "/student/a/pset-6");
    },
    /** From anywhere on a warm-up: its worked example, every step shown, then "Try one more" onto the follow-up. */
    async openFollowUp(short, steps) {
      await tab.clickButton("I need help");
      await tab.click('[data-help-option="example"]');
      for (let i = 0; i < steps; i++) await tab.clickButton(i === 0 ? "First step" : "Next step");
      await tab.clickButton("Try one more");
      await sleep(500);
      if (!(await evaluate(`!!document.querySelector('[data-warmup="second"]')`))) throw new Error(`${short}: the follow-up did not open`);
    },
    async goto(url, ready = "[data-run]") {
      await send("Page.navigate", { url });
      const started = Date.now();
      while (Date.now() - started < 20000) {
        if (await evaluate(`document.readyState === "complete" && !!document.querySelector(${JSON.stringify(ready)})`)) break;
        await sleep(150);
      }
      await sleep(600);
    },
    /** The stored session rewritten by `edit` (a function body over `s`), then the set's page loaded again on it. */
    async withSession(edit, ready) {
      await evaluate(`(() => { const s = JSON.parse(localStorage.getItem(${JSON.stringify(SESSION_KEY)})); ${edit}; localStorage.setItem(${JSON.stringify(SESSION_KEY)}, JSON.stringify(s)); })()`);
      await tab.goto(BASE + "/student/a/pset-6", ready);
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
      if (k > 12) k = (k % 12) + 1;
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

/**
 * Help on a set question (ticket 312). For each Problem Set 6 question, the skills its "I need help" picker offers; for each
 * skill, Q** from its first blank: at each point the hint is opened and swept, then the pad writes the next line (the demo
 * script, a slip included where one is authored), until the working column says every line is in. Then the question back
 * on itself after practice on that skill, its working written up to each point in turn, its own hints swept.
 */
async function sweepQuestions(browser, checkPoint) {
  const setup = await openTab(browser);
  await setup.goto(BASE + "/student/a/pset-6?stage=working", "[data-working-screen]");
  const questions = await setup.evaluate(`[...document.querySelectorAll("ol li button[aria-label], ol li button")].map((b) => b.textContent.trim()).filter((t) => /^Q\\d+$/.test(t))`);
  const plan = [];
  for (let i = 0; i < questions.length; i++) {
    await setup.withSession(`s.problemIndex = ${i}`, "[data-working-screen]");
    await setup.clickButton("I need help");
    const picks = await setup.evaluate(`[...document.querySelectorAll("[data-pick]")].map((b) => b.dataset.pick)`);
    await setup.evaluate(`document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
    plan.push({ index: i, label: questions[i], id: `q${i + 1}`, picks });
  }
  await setup.close();
  if (plan.length !== 10) throw new Error(`expected Problem Set 6's ten questions, found ${plan.length}`);
  for (const q of plan) {
    for (const leaf of q.picks) {
      const short = `${q.label}** ${leaf.split(".").pop()}`;
      const tab = await openTab(browser);
      await tab.goto(BASE + "/student/a/pset-6?stage=working", "[data-working-screen]");
      await tab.withSession(`s.problemIndex = ${q.index}; s.overlay = ${JSON.stringify(leaf)}; s.ladder = { problem: ${JSON.stringify(q.id)}, step: "completion" }; s.overlayRun = { problem: "first", example: false, exampleShown: 0, hinted: {}, exampled: [], lines: {}, ink: {}, chat: {} }`, "[data-ladder-completion]");
      for (let k = 0; k < 20; k++) {
        if (await tab.evaluate(`!!document.querySelector("[data-working-done]")`)) break;
        // Q**'s own "I need help" (the working screen's is underneath the practice).
        await tab.click("[data-ladder-completion] [data-need-help]");
        await sleep(200);
        const offered = await tab.evaluate(`!!document.querySelector('[data-help-option="hint"]:not([disabled])')`);
        if (offered) await checkPoint(tab, `${short} · ${k} written`, "[data-run]", () => tab.click('[data-help-option="hint"]'));
        else await tab.evaluate(`document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
        const before = await tab.evaluate(`document.querySelectorAll("[data-working] [data-mark]").length`);
        await tab.scribble(k + 1);
        const after = await tab.evaluate(`document.querySelectorAll("[data-working] [data-mark]").length`);
        if (after === before) throw new Error(`${short}: the pad read no line ${k + 1}`);
      }
      if (!(await tab.evaluate(`!!document.querySelector("[data-working-done]")`))) throw new Error(`${short}: the working never finished`);
      await tab.close();
    }
    // Back on the question after practice on its first skill: its own hints, with its working written up to each point.
    const working = WORKING[q.id];
    if (!working) throw new Error(`${q.label}: not in scripts/question-working.json`);
    const leaf = q.picks[0];
    const tab = await openTab(browser);
    await tab.goto(BASE + "/student/a/pset-6?stage=working", "[data-working-screen]");
    for (let k = 0; k < working.length; k++) {
      const lines = working.slice(0, k).map((tex, n) => ({ tex, strokeCount: (n + 1) * 5 }));
      await tab.withSession(
        `s.problemIndex = ${q.index}; s.overlay = null; s.ladder = null; s.prompt = null; s.practices = [{ leaf: ${JSON.stringify(leaf)}, reason: "help", accepted: true, problem: ${JSON.stringify(q.id)}, steps: { worked: 1, back: 1 } }]; s.questionRun = { problem: "first", example: false, exampleShown: 0, hinted: {}, exampled: [], lines: {}, ink: {}, chat: {} }; s.lines = { ...s.lines, ${JSON.stringify(q.id)}: ${JSON.stringify(lines)} }`,
        "[data-back-on-question]",
      );
      if (!(await tab.evaluate(`!!document.querySelector('[data-back-on-question] [data-help-option="hint"]:not([disabled])')`))) throw new Error(`${q.label} · ${k} lines: no hint offered back on the question`);
      await checkPoint(tab, `${q.label} back · ${k} line${k === 1 ? "" : "s"}`, "[data-working-screen]", () => tab.click('[data-back-on-question] [data-help-option="hint"]'));
    }
    await tab.close();
  }
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
  /**
   * One point of a working: the hint offered there opened (`openHint`), then every linked word hovered. With each word lit,
   * in the question and every line of working under `root`: no lit box covers a glyph outside it, and nothing has moved
   * from before the hint opened. A stalled hint (the stall notice) is closed and skipped.
   */
  const checkPoint = async (tab, where, root, openHint) => {
    const problemSel = `${root} .katex-display`;
    const linesSel = `${root} aside`;
    const plainProblem = await tab.evaluate(glyphsIn(problemSel));
    const plainLines = await tab.evaluate(glyphsIn(linesSel));
    await openHint();
    await sleep(500);
    // The latest hint is still to be used: "hint" shows the stall notice, not a new hint. Close it and write the next line.
    if (await tab.evaluate(`!!document.querySelector("[data-stall-notice]")`)) {
      await tab.evaluate(`document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))`);
      await sleep(300);
      if (await tab.evaluate(`!!document.querySelector("[data-stall-notice]")`)) throw new Error(`${where}: the stall notice did not close`);
      return;
    }
    const label = (word) => `${where} · "${word}"`;
    const wrappedMoved = moved(plainProblem, await tab.evaluate(glyphsIn(problemSel))) || moved(plainLines, await tab.evaluate(glyphsIn(linesSel)));
    checks++;
    if (wrappedMoved) {
      failures.push(`${where}: opening the hint moved a glyph`);
      console.log(`FAIL  ${where}: opening the hint moved a glyph`);
    }
    const words = [...new Set(await tab.evaluate(`[...document.querySelectorAll("[data-hint-term]")].map((e) => e.dataset.hintTerm)`))];
    for (const word of words) {
      const sel = `[data-hint-term="${word}"]`;
      await tab.hover(sel, true);
      const r = await tab.evaluate(overlaps(root));
      const litMoved = moved(plainProblem, await tab.evaluate(glyphsIn(problemSel))) || moved(plainLines, await tab.evaluate(glyphsIn(linesSel)));
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
      if (SHOTS && r.clip) await tab.shot(join(SHOTS, `${where.replace(/\W+/g, "_")}-${word.replace(/\W+/g, "_")}.png`), r.clip);
      await tab.hover(sel, false);
    }
  };
  try {
    const first = await openTab(browser);
    if (ONLY !== "questions") await first.gotoEveryWarmup();
    const leaves = ONLY === "questions" ? LEAVES : await first.evaluate(`[...document.querySelectorAll("[data-sequence] button[data-leaf]")].map((b) => b.dataset.leaf)`);
    await first.close();
    if (leaves.length !== LEAVES.length) throw new Error(`the warm-up strip offers ${leaves.length} of the bank's ${LEAVES.length} warm-ups`);
    console.log(`warm-ups: ${leaves.join(", ")}`);
    for (const leaf of ONLY === "questions" ? [] : leaves) {
      const tab = await openTab(browser);
      await tab.gotoEveryWarmup();
      await tab.click(`[data-sequence] button[data-leaf="${leaf}"]`);
      await sleep(500);
      /** Lines in each working, the warm-up's then its follow-up's (ticket 300): the sweep reads every one of both, and fails rather than silently stopping short. */
      const [firstSteps, followUpSteps] = LINES[leaf];
      for (const [suffix, steps] of [["", firstSteps], ["-2", followUpSteps]]) {
        const short = leaf.split(".").pop() + suffix;
        if (suffix) await tab.openFollowUp(short, firstSteps);
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
          await checkPoint(tab, `${short} · ${k} line${k === 1 ? "" : "s"}`, "[data-run]", () => tab.click('[data-help-option="hint"]'));
        }
      }
      await tab.close();
    }
    if (ONLY !== "warm-ups") await sweepQuestions(browser, checkPoint);
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
