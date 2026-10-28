#!/usr/bin/env node
/**
 * Renders ```mermaid fences found in Markdown sources into static SVG (and a
 * PNG twin used by the Word export).
 *
 * Why a hand-rolled CDP client instead of Puppeteer? The machine already has
 * Chrome, and Node 22 ships a global WebSocket, so driving the DevTools
 * Protocol directly keeps the dependency surface to a single package
 * (`mermaid`) and adds no new npm advisories.
 *
 * Diagrams are cached by content hash under docs/diagrams/, so a rebuild only
 * re-renders what actually changed.
 */
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MERMAID_BUNDLE = join(ROOT, 'node_modules', 'mermaid', 'dist', 'mermaid.min.js');

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/snap/bin/chromium',
].filter(Boolean);

export const THEME = {
  theme: 'base',
  themeVariables: {
    fontFamily: 'Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: '15px',
    primaryColor: '#e8f1ee',
    primaryTextColor: '#1f2733',
    primaryBorderColor: '#0f5c4e',
    lineColor: '#5b6472',
    secondaryColor: '#eef1f5',
    tertiaryColor: '#fbfcfd',
    clusterBkg: '#f2f4f7',
    clusterBorder: '#c9d2dd',
    edgeLabelBackground: '#ffffff',
    noteBkgColor: '#fff8e8',
    noteBorderColor: '#b5893b',
    actorBkg: '#e8f1ee',
    actorBorder: '#0f5c4e',
    actorTextColor: '#1f2733',
    signalColor: '#1f2733',
    signalTextColor: '#1f2733',
    labelBoxBkgColor: '#e8f1ee',
    labelBoxBorderColor: '#0f5c4e',
    labelTextColor: '#1f2733',
    loopTextColor: '#1f2733',
    titleColor: '#0f5c4e',
  },
  // Plain SVG text labels (not foreignObject) so node boxes fit their text and
  // the exported images stay self-contained.
  flowchart: { htmlLabels: false, curve: 'basis', padding: 14, wrappingWidth: 460 },
  sequence: { actorMargin: 46, useMaxWidth: false },
  er: { useMaxWidth: false },
  gantt: { useMaxWidth: false },
};

/* ------------------------------------------------------------------ */
/* Chrome DevTools Protocol client                                     */
/* ------------------------------------------------------------------ */

class CdpClient {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 0;
    this.pending = new Map();
    this.handlers = new Map();
  }

  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((resolvePromise, rejectPromise) => {
      ws.addEventListener('open', resolvePromise, { once: true });
      ws.addEventListener('error', rejectPromise, { once: true });
    });
    const client = new CdpClient(ws);
    ws.addEventListener('message', (event) => client.#dispatch(String(event.data)));
    return client;
  }

  #dispatch(raw) {
    let message;
    try {
      message = JSON.parse(raw);
    } catch {
      return;
    }
    if (message.id !== undefined) {
      const waiter = this.pending.get(message.id);
      if (!waiter) return;
      this.pending.delete(message.id);
      if (message.error) {
        waiter.reject(new Error(`${message.error.message} (code ${message.error.code})`));
      } else {
        waiter.resolve(message.result);
      }
      return;
    }
    const listeners = this.handlers.get(message.method);
    if (!listeners) return;
    for (const listener of listeners) listener(message.params, message.sessionId);
  }

  on(method, handler) {
    if (!this.handlers.has(method)) this.handlers.set(method, []);
    this.handlers.get(method).push(handler);
  }

  send(method, params = {}, sessionId) {
    const id = ++this.nextId;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolvePromise, rejectPromise) => {
      this.pending.set(id, { resolve: resolvePromise, reject: rejectPromise });
      this.ws.send(JSON.stringify(payload));
    });
  }

  close() {
    try {
      this.ws.close();
    } catch {
      /* already closed */
    }
  }
}

function findChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

async function launchChrome(executablePath) {
  const userDataDir = join(tmpdir(), `qrex-docs-chrome-${process.pid}`);
  const child = spawn(
    executablePath,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--hide-scrollbars',
      '--mute-audio',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--disable-background-networking',
      '--disable-sync',
      `--user-data-dir=${userDataDir}`,
      '--remote-debugging-port=0',
      'about:blank',
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );

  return new Promise((resolvePromise, rejectPromise) => {
    let buffer = '';
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      rejectPromise(new Error('Chrome did not expose a DevTools endpoint in time'));
    }, 30000);

    child.stderr.on('data', (chunk) => {
      buffer += String(chunk);
      const match = buffer.match(/DevTools listening on (ws:\/\/\S+)/);
      if (!match) return;
      clearTimeout(timer);
      resolvePromise({ child, wsUrl: match[1], userDataDir });
    });

    child.on('error', (error) => {
      clearTimeout(timer);
      rejectPromise(error);
    });
  });
}

/* ------------------------------------------------------------------ */
/* Diagram discovery                                                   */
/* ------------------------------------------------------------------ */

const MERMAID_FENCE = /```mermaid[^\r\n]*\r?\n([\s\S]*?)```/g;

/** Pull every mermaid block out of a markdown string. */
export function mermaidBlocksIn(md) {
  const blocks = [];
  let match;
  MERMAID_FENCE.lastIndex = 0;
  while ((match = MERMAID_FENCE.exec(md)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}

export function hashCode(code) {
  return createHash('sha1').update(code).digest('hex').slice(0, 16);
}

/**
 * Mermaid emits `width="100%"` on some diagram types, which makes the SVG
 * collapse to its container width once inlined. Pin the root element to the
 * viewBox size instead and let CSS scale it down on narrow screens.
 */
function normalizeSvg(svg) {
  return svg.replace(/^<svg\b([^>]*)>/, (match, attrs) => {
    const viewBox = attrs.match(/viewBox="([\d.\-\s]+)"/);
    if (!viewBox) return match;
    const parts = viewBox[1].trim().split(/[\s,]+/).map(Number);
    const [, , width, height] = parts;
    if (!width || !height) return match;
    let cleaned = attrs
      .replace(/\s*width="[^"]*"/, '')
      .replace(/\s*height="[^"]*"/, '')
      .replace(/\s*style="[^"]*"/, '');
    return `<svg${cleaned} width="${Math.ceil(width)}" height="${Math.ceil(height)}" style="max-width:100%;height:auto">`;
  });
}

/* ------------------------------------------------------------------ */
/* Rendering                                                           */
/* ------------------------------------------------------------------ */

async function renderAll(blocks, extras, cacheDir) {
  const executablePath = findChrome();
  if (!executablePath) {
    throw new Error(
      'No Chrome/Chromium binary found. Set CHROME_PATH to point at one, or install google-chrome.',
    );
  }
  if (blocks.length > 0 && !existsSync(MERMAID_BUNDLE)) {
    throw new Error(`mermaid bundle not found at ${MERMAID_BUNDLE} — run npm install`);
  }

  const mermaidSource = blocks.length > 0 ? readFileSync(MERMAID_BUNDLE, 'utf8') : '';
  const { child, wsUrl, userDataDir } = await launchChrome(executablePath);
  const cdp = await CdpClient.connect(wsUrl);

  try {
    // Two tabs: one renders Mermaid, the other captures PNGs. Capturing
    // navigates the page, which would discard the Mermaid configuration
    // (and with it the label wrapping) for every diagram after the first.
    const { targetId: renderTarget } = await cdp.send('Target.createTarget', {
      url: 'about:blank',
    });
    const { sessionId } = await cdp.send('Target.attachToTarget', {
      targetId: renderTarget,
      flatten: true,
    });
    const { targetId: captureTarget } = await cdp.send('Target.createTarget', {
      url: 'about:blank',
    });
    const { sessionId: captureSession } = await cdp.send('Target.attachToTarget', {
      targetId: captureTarget,
      flatten: true,
    });

    await cdp.send('Page.enable', {}, sessionId);
    await cdp.send('Runtime.enable', {}, sessionId);
    await cdp.send(
      'Emulation.setDeviceMetricsOverride',
      { width: 1600, height: 1200, deviceScaleFactor: 1, mobile: false },
      sessionId,
    );

    await cdp.send('Page.enable', {}, captureSession);
    await cdp.send('Runtime.enable', {}, captureSession);

    // Inject Mermaid before any document script runs.
    if (mermaidSource) {
      await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: mermaidSource }, sessionId);
    }

    const loaded = new Promise((resolvePromise) => {
      cdp.on('Page.loadEventFired', () => resolvePromise());
    });
    await cdp.send('Page.navigate', { url: 'data:text/html,<html><body></body></html>' }, sessionId);
    await loaded;

    if (mermaidSource) {
      const ready = await cdp.send(
        'Runtime.evaluate',
        { expression: 'typeof mermaid', returnByValue: true },
        sessionId,
      );
      if (ready.result.value !== 'object') {
        throw new Error('mermaid failed to initialise in the browser');
      }

      await cdp.send(
        'Runtime.evaluate',
        { expression: `mermaid.initialize(${JSON.stringify(THEME)})`, returnByValue: true },
        sessionId,
      );
    }

    const results = new Map();

    for (const { key, code, origin } of blocks) {
      const rendered = await cdp.send(
        'Runtime.evaluate',
        {
          expression: `(async () => {
            try {
              const out = await mermaid.render('qrex-${key}', ${JSON.stringify(code)});
              return { ok: true, svg: out.svg };
            } catch (error) {
              return { ok: false, error: String((error && error.message) || error) };
            }
          })()`,
          awaitPromise: true,
          returnByValue: true,
        },
        sessionId,
      );

      const payload = rendered.result.value;
      if (!payload || !payload.ok) {
        throw new Error(
          `Mermaid diagram in ${origin} failed to render:\n${payload ? payload.error : 'unknown error'}\n\n${code}`,
        );
      }

      const svg = normalizeSvg(payload.svg);
      const svgPath = join(cacheDir, `${key}.svg`);
      const pngPath = join(cacheDir, `${key}.png`);
      writeFileSync(svgPath, svg, 'utf8');

      // Rasterise for the Word export (LibreOffice renders PNG reliably, SVG less so).
      const png = await capturePng(cdp, captureSession, svg);
      writeFileSync(pngPath, png);

      results.set(key, { svg, svgPath, pngPath, origin });
    }

    // Hand-rolled SVG artwork (screen wireframes) only needs rasterising.
    for (const { key, svg } of extras) {
      const svgPath = join(cacheDir, `${key}.svg`);
      const pngPath = join(cacheDir, `${key}.png`);
      writeFileSync(svgPath, svg, 'utf8');
      const png = await capturePng(cdp, captureSession, svg);
      writeFileSync(pngPath, png);
      results.set(key, { svg, svgPath, pngPath, origin: `wireframe:${key}` });
    }

    return results;
  } finally {
    cdp.close();
    child.kill('SIGTERM');
    await sleep(150);
    try {
      rmSync(userDataDir, { recursive: true, force: true });
    } catch {
      /* Chrome may still be releasing the profile directory */
    }
  }
}

async function capturePng(cdp, sessionId, svg) {
  // A fresh document per capture: reusing one page lets Chrome hand back a
  // stale surface, which silently produces the previous diagram's image.
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:0;background:#ffffff}
svg{display:block;max-width:none}
</style></head><body>${svg}</body></html>`;

  await cdp.send(
    'Page.navigate',
    { url: `data:text/html;charset=utf-8,${encodeURIComponent(html)}` },
    sessionId,
  );

  // Wait for the new document to be ready and the SVG laid out.
  let size = null;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const measured = await cdp.send(
        'Runtime.evaluate',
        {
          expression: `(() => {
            if (document.readyState !== 'complete') return null;
            const node = document.querySelector('svg');
            if (!node) return null;
            const box = node.viewBox && node.viewBox.baseVal;
            const attrW = parseFloat(node.getAttribute('width'));
            const attrH = parseFloat(node.getAttribute('height'));
            const rect = node.getBoundingClientRect();
            const w = Math.ceil(Math.max(
              box && box.width ? box.width : 0,
              isFinite(attrW) ? attrW : 0,
              rect.width
            ));
            const h = Math.ceil(Math.max(
              box && box.height ? box.height : 0,
              isFinite(attrH) ? attrH : 0,
              rect.height
            ));
            node.setAttribute('width', w);
            node.setAttribute('height', h);
            return { w, h };
          })()`,
          returnByValue: true,
        },
        sessionId,
      );
      if (measured.result.value) {
        size = measured.result.value;
        break;
      }
    } catch {
      /* execution context swapped mid-navigation — retry */
    }
    await sleep(50);
  }

  if (!size) throw new Error('Could not measure the rendered diagram for capture');

  await cdp.send(
    'Emulation.setDeviceMetricsOverride',
    { width: size.w, height: size.h, deviceScaleFactor: 2, mobile: false },
    sessionId,
  );

  const shot = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);

  // Restore a roomy viewport for the next diagram's layout.
  await cdp.send(
    'Emulation.setDeviceMetricsOverride',
    { width: 1600, height: 1200, deviceScaleFactor: 1, mobile: false },
    sessionId,
  );

  return Buffer.from(shot.data, 'base64');
}

function sleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

/* ------------------------------------------------------------------ */
/* Public entry point                                                  */
/* ------------------------------------------------------------------ */

/**
 * Render every mermaid block found in the given markdown files, and rasterise
 * any hand-authored SVG artwork (screen wireframes) for the Word export.
 *
 * @param {string[]} files absolute paths to markdown files
 * @param {string} cacheDir directory for the cached SVG/PNG files
 * @param {Map<string,string>} [extraSvgs] key -> raw SVG markup
 * @returns {Promise<Map<string, {svg:string, svgPath:string, pngPath:string, origin:string}>>}
 */
export async function renderDiagrams(files, cacheDir, extraSvgs = new Map()) {
  const wanted = new Map();
  for (const file of files) {
    if (!existsSync(file)) continue;
    const blocks = mermaidBlocksIn(readFileSync(file, 'utf8'));
    for (const code of blocks) {
      const key = hashCode(code);
      if (!wanted.has(key)) wanted.set(key, { key, code, origin: file });
    }
  }

  const extras = [];
  for (const [key, svg] of extraSvgs) {
    extras.push({ key, svg });
    if (!wanted.has(key)) wanted.set(key, { key, code: null, svg, origin: `svg:${key}` });
  }

  if (wanted.size === 0) return new Map();

  mkdirSync(cacheDir, { recursive: true });

  // Reuse anything already cached.
  const pending = [];
  const pendingExtras = [];
  const results = new Map();
  for (const entry of wanted.values()) {
    const svgPath = join(cacheDir, `${entry.key}.svg`);
    const pngPath = join(cacheDir, `${entry.key}.png`);
    if (existsSync(svgPath) && existsSync(pngPath)) {
      results.set(entry.key, {
        svg: readFileSync(svgPath, 'utf8'),
        svgPath,
        pngPath,
        origin: entry.origin,
      });
    } else if (entry.code === null) {
      pendingExtras.push(entry);
    } else {
      pending.push(entry);
    }
  }

  if (pending.length > 0 || pendingExtras.length > 0) {
    const rendered = await renderAll(pending, pendingExtras, cacheDir);
    for (const [key, value] of rendered) results.set(key, value);
  }

  return results;
}

// Allow `node scripts/render-diagrams.mjs <file.md ...>` as a smoke test.
if (process.argv[1] && process.argv[1].endsWith('render-diagrams.mjs')) {
  const files = process.argv.slice(2).map((f) => resolve(process.cwd(), f));
  const cacheDir = join(ROOT, 'docs', 'diagrams');
  const out = await renderDiagrams(files, cacheDir);
  console.log(`Rendered ${out.size} diagram(s) -> ${cacheDir}`);
  for (const [key, value] of out) console.log(`  ${key}  ${value.origin}`);
}
