/**
 * Renders the extraction fixtures (ticket 170): the files a teacher would drop on the create
 * screen, drawn from the demo set with KaTeX in a headless Chrome, and the manifest that says
 * what the extractor must read out of each. With `EXTRACT_FIXTURES=1` the route answers from
 * the manifest instead of the model, matched by the SHA-256 of the dropped bytes, so the
 * click-throughs are deterministic and need no key. No copyrighted textbook pages: every
 * problem is the demo set's own.
 *
 *     node scripts/render-extract-fixtures.mjs
 *
 * Writes fixtures/extract/one-problem.png (Q1 alone), worksheet.png (four problems, one with an
 * axes figure), worksheet.pdf (three A4 pages, ten drafts: eight numbered problems, then 9(a)
 * and 9(b), with a figure on pages 2 and 3), and manifest.json (each file's hash and drafts,
 * figures as boxes normalised to the page or image). Re-running re-renders everything and the
 * hashes change with it; `lib/extract.test.ts` checks the files on disk still match the manifest.
 * Knobs: CDP_PORT (default 9611; refuses to run if something already answers there), CHROME.
 * Needs Node 22+ (fetch, WebSocket); no dependencies beyond the repo's katex.
 */
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, "..");
const OUT = join(ROOT, "fixtures", "extract");
const KATEX = join(ROOT, "node_modules", "katex", "dist");
const CDP_PORT = Number(process.env.CDP_PORT ?? 9611);
const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

/** The demo set (data/draft-seed.ts) as the extractor should read it: prose, then the centred expression. */
const P = {
  q1: { stem: "Solve for x.", tex: "x^2 + 5x + 6 = 0" },
  q2: { stem: "Solve for x.", tex: "2x^2 + 7x - 4 = 0" },
  q3: { stem: "Find all values of x for which the following holds.", tex: "(x-3)(x+2) = 6" },
  q4: { stem: "Solve, giving exact values.", tex: "3x^2 - 5x - 1 = 0" },
  q5: { stem: "Find the x-intercepts and the turning point of the graph of", tex: "y = x^2 - 4x - 5", figure: "parabola-down" },
  q6: { stem: "For which value of k does the graph of the following touch the x-axis exactly once?", tex: "y = x^2 + 6x + k" },
  q7: { stem: "Factorise fully.", tex: "\\frac{1}{3}x^2 + 2x + \\frac{8}{3}" },
  q8: { stem: "The graph of the following is shown. Read off its x-intercepts and check them.", tex: "y = x^2 - 4x + 3", figure: "parabola-up" },
  q9: { stem: "Solve for x.", tex: "(x+1)(x-4) = 6" },
  q10a: { stem: "Show that the following has no real solutions.", tex: "x^2 + 4x + 5 = 0" },
  q10b: { stem: "Say what that means for the graph of $y = x^2 + 4x + 5$.", tex: null },
};

/** The three files: which problems, in what layout. `label` is what the sheet prints. */
const FILES = {
  "one-problem.png": { kind: "png", items: [{ ...P.q1, label: null }] },
  "worksheet.png": {
    kind: "png",
    items: [
      { ...P.q1, label: "1" },
      { ...P.q2, label: "2" },
      { ...P.q5, label: "3" },
      { ...P.q9, label: "4" },
    ],
  },
  "worksheet.pdf": {
    kind: "pdf",
    pages: [
      [
        { ...P.q1, label: "1" },
        { ...P.q2, label: "2" },
        { ...P.q3, label: "3" },
        { ...P.q4, label: "4" },
      ],
      [
        { ...P.q5, label: "5" },
        { ...P.q6, label: "6" },
        { ...P.q7, label: "7" },
      ],
      [
        { ...P.q8, label: "8" },
        { ...P.q10a, label: "9(a)" },
        { ...P.q10b, label: "9(b)" },
      ],
    ],
  },
};

const PAGE_W = 794;
const PAGE_H = 1123;

/** A small axes drawing with a parabola: the kind of figure a worksheet prints beside a graph question. */
function figureSvg(kind) {
  const w = 220;
  const h = 150;
  const ox = 70;
  const oy = kind === "parabola-down" ? 60 : 105;
  const pts = [];
  for (let x = -2.6; x <= 6.6; x += 0.2) {
    const y = kind === "parabola-down" ? x * x - 4 * x - 5 : x * x - 4 * x + 3;
    pts.push(`${(ox + x * 20).toFixed(1)},${(oy - y * 7).toFixed(1)}`);
  }
  return `<svg data-figure width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="display:block">
    <rect width="${w}" height="${h}" fill="#fff"/>
    <line x1="10" y1="${oy}" x2="${w - 10}" y2="${oy}" stroke="#333" stroke-width="1"/>
    <line x1="${ox}" y1="8" x2="${ox}" y2="${h - 8}" stroke="#333" stroke-width="1"/>
    <text x="${w - 14}" y="${oy - 5}" font-size="11" font-family="sans-serif">x</text>
    <text x="${ox + 5}" y="15" font-size="11" font-family="sans-serif">y</text>
    <polyline points="${pts.join(" ")}" fill="none" stroke="#1d4ed8" stroke-width="1.6"/>
  </svg>`;
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** A stem as HTML, `$…$` runs marked for KaTeX. */
const stemHtml = (stem) =>
  stem
    .split(/(\$[^$]+\$)/)
    .map((part) => (part.startsWith("$") ? `<span data-tex="${esc(part.slice(1, -1))}"></span>` : esc(part)))
    .join("");

function itemHtml(it) {
  const label = it.label ? `<span class="label">${esc(it.label)}</span>` : "";
  const fig = it.figure ? `<div class="fig">${figureSvg(it.figure)}</div>` : "";
  const tex = it.tex ? `<div class="tex" data-display="${esc(it.tex)}"></div>` : "";
  return `<div class="item">${label}<div class="body"><p class="stem">${stemHtml(it.stem)}</p>${tex}${fig}</div></div>`;
}

function html(body, extraCss = "") {
  const css = readFileSync(join(KATEX, "katex.min.css"), "utf8").replace(/url\(fonts\//g, `url(${pathToFileURL(join(KATEX, "fonts")).href}/`);
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style><style>
    html, body { margin: 0; background: #fff; }
    body { font-family: Georgia, "Times New Roman", serif; color: #111; font-size: 17px; line-height: 1.45; }
    .item { display: flex; gap: 14px; margin: 0 0 26px; }
    .label { flex: 0 0 34px; font-weight: bold; }
    .body { flex: 1; }
    .stem { margin: 0 0 8px; }
    .tex { margin: 4px 0 8px 24px; font-size: 19px; }
    .fig { margin: 6px 0 0 24px; }
    .katex-display { margin: 0; text-align: left; }
    .katex-display > .katex { text-align: left; }
    ${extraCss}
  </style></head><body>${body}
  <script src="${pathToFileURL(join(KATEX, "katex.min.js")).href}"></script>
  <script>
    for (const el of document.querySelectorAll("[data-tex]")) katex.render(el.dataset.tex, el, { throwOnError: false, strict: false });
    for (const el of document.querySelectorAll("[data-display]")) katex.render(el.dataset.display, el, { displayMode: true, throwOnError: false, strict: false });
    document.documentElement.dataset.ready = "1";
  </script></body></html>`;
}

const sheetHtml = (items) => html(`<div class="sheet" data-sheet style="width:640px;padding:36px 40px;box-sizing:border-box">${items.map(itemHtml).join("")}</div>`, "body { display: inline-block; }");

const pdfHtml = (pages) =>
  html(
    pages.map((items, i) => `<div class="page" data-page="${i + 1}">${items.map(itemHtml).join("")}</div>`).join(""),
    `@page { size: A4; margin: 0; } .page { width: ${PAGE_W}px; height: ${PAGE_H}px; padding: 64px 72px; box-sizing: border-box; break-after: page; }`,
  );

async function launch() {
  let taken = false;
  try {
    await fetch(`http://localhost:${CDP_PORT}/json/version`);
    taken = true;
  } catch {}
  if (taken) throw new Error(`something already answers on CDP port ${CDP_PORT}; set CDP_PORT to a free one`);
  const profile = mkdtempSync(join(tmpdir(), "edexia-cdp-fixtures-"));
  const proc = spawn(CHROME, [`--remote-debugging-port=${CDP_PORT}`, `--user-data-dir=${profile}`, "--headless=new", "--no-first-run", "--disk-cache-size=1", "--force-device-scale-factor=1", "--hide-scrollbars", "--allow-file-access-from-files", "--window-size=1000,1400", "about:blank"], { stdio: "ignore" });
  let ver;
  for (let i = 0; i < 50 && !ver; i++) {
    try {
      ver = await (await fetch(`http://localhost:${CDP_PORT}/json/version`)).json();
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  if (!ver) throw new Error("chrome did not start");
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) rej(new Error(JSON.stringify(msg.error)));
      else res(msg.result);
    }
  };
  const send = (method, params = {}, sessionId) =>
    new Promise((res, rej) => {
      const i = ++id;
      pending.set(i, { res, rej });
      ws.send(JSON.stringify({ id: i, method, params, sessionId }));
    });
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send("Page.enable", {}, sessionId);
  await send("Runtime.enable", {}, sessionId);
  await send("Emulation.setDeviceMetricsOverride", { width: 1000, height: 1400, deviceScaleFactor: 1, mobile: false }, sessionId);
  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }, sessionId);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + " " + (r.exceptionDetails.exception?.description ?? ""));
    return r.result.value;
  };
  const goto = async (file) => {
    await send("Page.navigate", { url: pathToFileURL(file).href }, sessionId);
    for (let i = 0; i < 50; i++) {
      if (await evaluate(`document.documentElement.dataset.ready === "1" && document.fonts.status === "loaded"`)) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    await new Promise((r) => setTimeout(r, 300));
  };
  const close = async () => {
    try {
      await send("Browser.close");
    } catch {}
    try {
      ws.close();
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
    try {
      proc.kill("SIGKILL");
    } catch {}
    rmSync(profile, { recursive: true, force: true });
  };
  return { send, sessionId, evaluate, goto, close };
}

/** The boxes on screen: the sheet (or each page) and every figure, in CSS px. */
const RECTS = `(() => {
  const r = (e) => { const b = e.getBoundingClientRect(); return { x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height }; };
  const sheet = document.querySelector("[data-sheet]");
  return {
    sheet: sheet ? r(sheet) : null,
    pages: [...document.querySelectorAll("[data-page]")].map(r),
    figures: [...document.querySelectorAll("[data-figure]")].map((f) => ({ item: [...document.querySelectorAll(".item")].indexOf(f.closest(".item")), ...r(f) })),
  };
})()`;

const round = (v) => Math.round(v * 1000) / 1000;
const box = (fig, frame) => ({ x0: round((fig.x - frame.x) / frame.w), y0: round((fig.y - frame.y) / frame.h), x1: round((fig.x + fig.w - frame.x) / frame.w), y1: round((fig.y + fig.h - frame.y) / frame.h) });

const draft = (it, extra) => {
  const d = { source: 0, ...extra };
  if (it.label) d.label = it.label;
  d.stem = it.stem;
  d.tex = it.tex;
  return d;
};

async function main() {
  mkdirSync(OUT, { recursive: true });
  const tmp = mkdtempSync(join(tmpdir(), "edexia-fixtures-html-"));
  const browser = await launch();
  const manifest = { generatedBy: "scripts/render-extract-fixtures.mjs", files: {} };
  try {
    for (const [name, spec] of Object.entries(FILES)) {
      const file = join(tmp, name.replace(/\.\w+$/, ".html"));
      if (spec.kind === "png") {
        writeFileSync(file, sheetHtml(spec.items));
        await browser.goto(file);
        const rects = await browser.evaluate(RECTS);
        const s = rects.sheet;
        const { data } = await browser.send("Page.captureScreenshot", { format: "png", clip: { x: s.x, y: s.y, width: s.w, height: s.h, scale: 1 } }, browser.sessionId);
        writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
        const drafts = spec.items.map((it, i) => {
          const fig = rects.figures.find((f) => f.item === i);
          return draft(it, fig ? { figure: box(fig, s) } : {});
        });
        manifest.files[name] = { drafts };
      } else {
        writeFileSync(file, pdfHtml(spec.pages));
        await browser.goto(file);
        const rects = await browser.evaluate(RECTS);
        const { data } = await browser.send("Page.printToPDF", { printBackground: true, preferCSSPageSize: true, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0 }, browser.sessionId);
        writeFileSync(join(OUT, name), Buffer.from(data, "base64"));
        const drafts = [];
        let item = 0;
        spec.pages.forEach((items, p) => {
          const frame = rects.pages[p];
          for (const it of items) {
            const fig = rects.figures.find((f) => f.item === item);
            drafts.push(draft(it, { page: p + 1, ...(fig ? { figure: { page: p + 1, ...box(fig, frame) } } : {}) }));
            item++;
          }
        });
        manifest.files[name] = { pages: spec.pages.length, drafts };
      }
      manifest.files[name].hash = createHash("sha256").update(readFileSync(join(OUT, name))).digest("hex");
      console.log(`${name}: ${manifest.files[name].drafts.length} drafts, sha256 ${manifest.files[name].hash.slice(0, 12)}…`);
    }
    writeFileSync(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  } finally {
    await browser.close();
    rmSync(tmp, { recursive: true, force: true });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
