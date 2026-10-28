#!/usr/bin/env node
/**
 * Builds standalone HTML pages (and combined documents) from the Markdown
 * sources in docs/ and docs/user-manual/.
 *
 *   node scripts/build-docs.mjs            # HTML only
 *   node scripts/build-docs.mjs --word     # HTML + .docx/.doc via LibreOffice
 *
 * Output: docs/html/
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, rmSync, copyFileSync } from 'node:fs';
import { join, dirname, basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { marked } from 'marked';
import { renderDiagrams, hashCode } from './render-diagrams.mjs';
import { renderWireframe, wireframeIds } from './wireframes.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs');
const MANUAL = join(DOCS, 'user-manual');
const EXPLAINER = join(DOCS, 'explainer');
const DIAGRAMS = join(DOCS, 'diagrams');
const OUT = join(DOCS, 'html');

const WANT_WORD = process.argv.includes('--word');

/* ------------------------------------------------------------------ */
/* Markdown helpers                                                    */
/* ------------------------------------------------------------------ */

// GitHub-compatible heading anchors, matching the slugs used in the sources.
function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');
}

// Collect every heading anchor in a Markdown string.
function anchorsIn(md) {
  const set = new Set();
  for (const line of md.split('\n')) {
    const m = /^#{1,6}\s+(.*)$/.exec(line);
    if (m) set.add(slugify(m[1]));
  }
  return set;
}

// Rewrite relative .md links to the generated .html filename, preserving #anchors.
// `resolve` maps a source-relative md path (e.g. "./03-sales-lifecycle.md",
// "../04-roles-permissions.md", "README.md") to its output filename, or null
// when the target is not published.
function rewriteLinks(html, resolve) {
  return html.replace(/href="([^"]+)"/g, (full, href) => {
    if (/^[a-z]+:/i.test(href) || href.startsWith('#') || href.startsWith('//')) return full;
    const [path, frag] = href.split('#');
    if (!/\.md$/i.test(path)) return full;
    const mapped = resolve(path);
    if (mapped === null) return full; // leave as-is; not published
    return `href="${mapped}${frag ? '#' + frag : ''}"`;
  });
}

/* ------------------------------------------------------------------ */
/* Artwork registry (mermaid diagrams + screen wireframes)             */
/* ------------------------------------------------------------------ */

// Populated before the Markdown is converted: hash -> artefact for diagrams,
// wireframe id -> artefact for screens.
const ART = { diagrams: new Map(), wireframes: new Map() };

function parseFenceInfo(lang) {
  const info = String(lang || '').trim();
  const name = (info.split(/\s+/)[0] || '').toLowerCase();
  const cap = info.match(/caption="([^"]*)"/);
  const caption = cap ? cap[1] : '';
  const rest = info.replace(/caption="[^"]*"/, ' ').trim();
  const id = rest.split(/\s+/).slice(1).join(' ').trim();
  return { name, id, caption };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Mirrors marked's own code renderer so plain code blocks keep their look.
function defaultCode(token) {
  const lang = (token.lang || '').match(/^\S*/)?.[0] || '';
  const text = token.text ? `${token.text.replace(/\n$/, '')}\n` : '';
  const body = escapeHtml(text);
  return lang
    ? `<pre><code class="language-${escapeHtml(lang)}">${body}</code></pre>\n`
    : `<pre><code>${body}</code></pre>\n`;
}

function figureInline(svg, caption, extraClass, width) {
  // Diagrams wider than the page scroll horizontally instead of shrinking
  // until the labels are unreadable.
  const wide = width && width > 1020 ? ' wide' : '';
  return `<figure class="figure ${extraClass}${wide}">${svg}${
    caption ? `<figcaption>${caption}</figcaption>` : ''
  }</figure>\n`;
}

function figureImage(src, width, caption, extraClass, height) {
  // Word pages are ~6.5in wide and ~9in tall. Cap both dimensions so a tall
  // diagram is scaled down instead of being clipped across a page break.
  const maxW = 620;
  const maxH = 700;
  let w = Math.min(width || maxW, maxW);
  let h = height ? Math.round((height / (width || maxW)) * w) : undefined;
  if (h && h > maxH) {
    w = Math.round(w * (maxH / h));
    h = maxH;
  }
  return `<figure class="figure ${extraClass}"><img src="${src}" width="${w}"${
    h ? ` height="${h}"` : ''
  } alt="${escapeHtml(caption)}" style="max-width:100%">${
    caption ? `<figcaption>${caption}</figcaption>` : ''
  }</figure>\n`;
}

// marked renderer that emits id="" on headings and renders diagrams/wireframes.
function makeRenderer(mode) {
  const r = new marked.Renderer();

  r.heading = function ({ text, depth }) {
    const raw = text.replace(/<[^>]+>/g, '');
    return `<h${depth} id="${slugify(raw)}">${text}</h${depth}>\n`;
  };

  r.code = function (token) {
    const info = parseFenceInfo(token.lang);

    if (info.name === 'mermaid') {
      const key = hashCode(String(token.text).trim());
      const art = ART.diagrams.get(key);
      if (!art) {
        return `<pre class="art-missing"><code>${escapeHtml(token.text)}</code></pre>\n`;
      }
      if (mode === 'img' && art.pngPath && existsSync(art.pngPath)) {
        return figureImage(`assets/${key}.png`, art.width, info.caption, 'diagram', art.height);
      }
      return figureInline(art.svg, info.caption, 'diagram', art.width);
    }

    if (info.name === 'wireframe') {
      const art = ART.wireframes.get(info.id);
      if (!art) {
        return `<pre class="art-missing"><code>Unknown wireframe: ${escapeHtml(
          info.id,
        )}</code></pre>\n`;
      }
      const png = join(DIAGRAMS, `wf-${info.id}.png`);
      if (mode === 'img' && existsSync(png)) {
        return figureImage(`assets/wf-${info.id}.png`, art.width, info.caption, 'wireframe', art.height);
      }
      return figureInline(art.svg, info.caption, 'wireframe');
    }

    return defaultCode(token);
  };

  return r;
}

function mdToHtmlBody(md, mode = 'inline') {
  return marked.parse(md, { renderer: makeRenderer(mode) });
}

// Long reference tables get a client-side row filter.
function addTableFilters(html) {
  return html.replace(/<table>([\s\S]*?)<\/table>/g, (full, inner) => {
    const rows = (inner.match(/<tr>/g) || []).length;
    if (rows <= 12) return full;
    return `<div class="table-wrap">
<input class="table-filter" type="search" placeholder="Filter rows…" aria-label="Filter table rows">
<span class="table-count"></span>
<table>${inner}</table>
</div>
`;
  });
}
/* ------------------------------------------------------------------ */
/* Page template                                                       */
/* ------------------------------------------------------------------ */

const STYLE = `
:root{--bg:#f7f8fa;--panel:#fff;--ink:#1f2733;--muted:#5b6472;--line:#e3e7ee;--accent:#0f5c4e;--accent2:#b5893b;--code:#f2f4f7;}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:var(--ink);background:var(--bg);line-height:1.65;font-size:16px}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}
.layout{display:flex;min-height:100vh}
aside{width:280px;flex:0 0 280px;background:var(--panel);border-right:1px solid var(--line);padding:24px 20px;position:sticky;top:0;height:100vh;overflow-y:auto}
aside h2{font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin:18px 0 8px}
aside a{display:block;padding:6px 8px;border-radius:6px;color:var(--ink);font-size:.9rem}
aside a:hover{background:var(--bg);text-decoration:none}
aside a.active{background:var(--accent);color:#fff}
aside .brand{font-weight:700;font-size:1.05rem;color:var(--accent);margin-bottom:4px}
main{flex:1;min-width:0;padding:40px 56px;max-width:960px;margin:0 auto}
main h1{font-size:2rem;line-height:1.25;margin:0 0 .5em;padding-bottom:.35em;border-bottom:2px solid var(--line)}
main h2{font-size:1.45rem;margin:2em 0 .6em;padding-bottom:.25em;border-bottom:1px solid var(--line)}
main h3{font-size:1.15rem;margin:1.6em 0 .5em}
main h4{font-size:1rem;margin:1.3em 0 .4em}
main p,main li{color:#2b3542}
table{border-collapse:collapse;width:100%;margin:1.1em 0;font-size:.92rem;display:block;overflow-x:auto}
th,td{border:1px solid var(--line);padding:8px 12px;text-align:left;vertical-align:top}
th{background:#eef1f5;font-weight:600}
tr:nth-child(even) td{background:#fbfcfd}
code{background:var(--code);padding:2px 6px;border-radius:4px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.86em}
pre{background:#1e2530;color:#e6e9ef;padding:16px 18px;border-radius:8px;overflow-x:auto}
pre code{background:none;color:inherit;padding:0}
blockquote{margin:1.2em 0;padding:.6em 1.1em;background:#fff8e8;border-left:4px solid var(--accent2);color:#5b4a22;border-radius:0 6px 6px 0}
blockquote p{margin:.4em 0}
hr{border:none;border-top:1px solid var(--line);margin:2.2em 0}
img{max-width:100%}
.crumbs{font-size:.82rem;color:var(--muted);margin-bottom:18px}
.pager{display:flex;justify-content:space-between;gap:16px;margin-top:48px;padding-top:20px;border-top:1px solid var(--line)}
.pager a{font-size:.9rem}
.site-footer{margin-top:40px;padding-top:16px;border-top:1px solid var(--line);color:var(--muted);font-size:.8rem}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;margin:24px 0}
.card{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:18px 20px}
.card h3{margin:.2em 0 .4em;font-size:1.02rem}
.card p{margin:.2em 0;font-size:.88rem;color:var(--muted)}
/* --- Figures: diagrams and screen wireframes --- */
.figure{margin:1.8em 0}
.figure>svg{display:block;max-width:100%;height:auto;margin:0 auto;background:#fff;border:1px solid var(--line);border-radius:10px;padding:10px}
.figure.diagram{overflow-x:auto}
.figure.diagram.wide>svg{max-width:none;margin:0}
.figure.wireframe>svg{border-color:#dbe2ea}
figcaption{margin-top:.7em;font-size:.82rem;color:var(--muted);text-align:center;line-height:1.45}
.art-missing{border-left:3px solid #c0392b}
/* --- Long reference tables --- */
.table-wrap{margin:1.1em 0}
.table-filter{width:100%;max-width:300px;padding:7px 11px;margin-bottom:.55em;border:1px solid var(--line);border-radius:8px;font-size:.86rem;background:#fff;color:var(--ink);font-family:inherit}
.table-filter:focus{outline:2px solid var(--accent);outline-offset:-1px}
.table-count{font-size:.78rem;color:var(--muted);margin-left:8px;vertical-align:middle}
/* --- Documentation menu (sidebar) --- */
.side-search{width:100%;padding:8px 10px;margin:10px 0 4px;border:1px solid var(--line);border-radius:8px;font-size:.85rem;background:var(--bg);color:var(--ink)}
.side-search:focus{outline:2px solid var(--accent);outline-offset:-1px}
.home-link{display:block;font-size:.8rem;font-weight:600;color:var(--accent);margin-bottom:14px;padding:4px 0}
.nav-group{border-bottom:1px solid var(--line);padding-bottom:6px;margin-bottom:6px}
.nav-group>summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);padding:10px 4px 6px;font-weight:700;user-select:none}
.nav-group>summary::-webkit-details-marker{display:none}
.nav-group>summary .chev{transition:transform .15s ease;font-size:.7rem;color:var(--muted)}
.nav-group[open]>summary .chev{transform:rotate(90deg)}
.nav-group .count{color:var(--muted);font-weight:400;margin-left:auto;font-size:.68rem}
.nav-group a{display:flex;gap:8px;align-items:baseline;padding:6px 8px;border-radius:6px;color:var(--ink);font-size:.88rem;line-height:1.35}
.nav-group a:hover{background:var(--bg);text-decoration:none}
.nav-group a.active{background:var(--accent);color:#fff}
.nav-group a.active .num{color:#d9ece7}
.nav-group a .num{color:var(--muted);font-variant-numeric:tabular-nums;font-size:.75rem;min-width:1.4em}
.nav-hidden{display:none!important}
.menu-toggle{display:none;position:fixed;top:12px;left:12px;z-index:50;width:44px;height:44px;border-radius:10px;border:1px solid var(--line);background:var(--panel);color:var(--ink);font-size:1.2rem;cursor:pointer;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.08)}
.menu-backdrop{display:none}
@media(max-width:900px){
  .layout{flex-direction:column}
  .menu-toggle{display:flex}
  aside{position:fixed;top:0;left:0;z-index:60;width:290px;height:100vh;overflow-y:auto;border-right:1px solid var(--line);transform:translateX(-105%);transition:transform .2s ease;box-shadow:0 0 24px rgba(0,0,0,.12)}
  body.menu-open aside{transform:translateX(0)}
  body.menu-open .menu-backdrop{display:block;position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:55}
  main{padding:64px 20px 24px}
}
@media print{
  aside,.crumbs,.pager,.menu-toggle,.menu-backdrop{display:none}
  body{background:#fff;font-size:11pt}
  main{max-width:none;padding:0}
  a{color:var(--ink)}
  pre{background:#f2f4f7;color:#1f2733;border:1px solid var(--line)}
}
`;

function navHtml(currentFile, groups) {
  let out = '';
  for (const group of groups) {
    const pages = group.pages;
    const links = pages
      .map((p) => {
        const active = p.out === currentFile ? ' active' : '';
        const m = /^(\d+)\.\s*(.*)$/.exec(p.label);
        const num = m ? `<span class="num">${m[1]}</span>` : '<span class="num"></span>';
        const text = m ? m[2] : p.label;
        return `<a class="${active.trim()}" data-title="${text.toLowerCase()}" href="${p.out}">${num}<span>${text}</span></a>`;
      })
      .join('');
    // Expand the group that contains the current page; others collapse.
    const isCurrent = pages.some((p) => p.out === currentFile) || currentFile === 'index.html';
    out += `<details class="nav-group"${isCurrent || group.open ? ' open' : ''}>
<summary><span>${group.title}</span><span class="chev">▶</span></summary>
${links}</details>`;
  }
  return out;
}

function menuHtml(currentFile, groups) {
  const nav = navHtml(currentFile, groups);
  return `
<button class="menu-toggle" aria-label="Open documentation menu" onclick="document.body.classList.toggle('menu-open')">☰</button>
<div class="menu-backdrop" onclick="document.body.classList.remove('menu-open')"></div>
<aside>
  <a class="home-link" href="index.html">⌂ All documentation</a>
  <div class="brand">QREX Documentation</div>
  <div style="font-size:.78rem;color:var(--muted)">Qodeigence Infocircle Pvt. Ltd.</div>
  <input class="side-search" type="search" placeholder="Search documents…" aria-label="Search documents" oninput="filterDocs(this.value)">
  <nav id="doc-nav">
    ${nav}
  </nav>
  <details class="nav-group"><summary><span>Downloads</span><span class="chev">▶</span></summary>
    <a href="../word/QREX-User-Manual.docx"><span class="num"></span><span>User Manual (.docx)</span></a>
    <a href="../word/QREX-User-Manual.doc"><span class="num"></span><span>User Manual (.doc)</span></a>
    <a href="../word/QREX-How-It-Works.docx"><span class="num"></span><span>How QREX Works (.docx)</span></a>
    <a href="../word/QREX-How-It-Works.doc"><span class="num"></span><span>How QREX Works (.doc)</span></a>
    <a href="../word/QREX-Technical-Documentation.docx"><span class="num"></span><span>Technical Docs (.docx)</span></a>
    <a href="../word/QREX-Technical-Documentation.doc"><span class="num"></span><span>Technical Docs (.doc)</span></a>
  </details>
</aside>`;
}

const MENU_SCRIPT = `
<script>
function filterDocs(q){
  q=(q||'').trim().toLowerCase();
  document.querySelectorAll('#doc-nav .nav-group').forEach(function(g){
    var visible=0;
    g.querySelectorAll('a').forEach(function(a){
      var hit=!q||a.getAttribute('data-title').indexOf(q)>-1;
      a.classList.toggle('nav-hidden',!hit);
      if(hit)visible++;
    });
    g.classList.toggle('nav-hidden',visible===0);
    if(q)g.open=true;
  });
}
document.querySelectorAll('.table-wrap').forEach(function(wrap){
  var input=wrap.querySelector('.table-filter');
  var table=wrap.querySelector('table');
  var count=wrap.querySelector('.table-count');
  if(!input||!table)return;
  input.addEventListener('input',function(){
    var q=input.value.trim().toLowerCase();
    var shown=0,total=0;
    table.querySelectorAll('tbody tr').forEach(function(row){
      total++;
      var hit=!q||row.textContent.toLowerCase().indexOf(q)>-1;
      row.style.display=hit?'':'none';
      if(hit)shown++;
    });
    if(count)count.textContent=q?shown+' of '+total+' rows':' '+total+' rows';
  });
});
</script>`;

function page({ title, body, currentFile, groups, prev, next, subtitle }) {
  const menu = menuHtml(currentFile, groups);
  const pager =
    (prev || next)
      ? `<div class="pager">${
          prev ? `<a href="${prev.out}">← ${prev.label}</a>` : '<span></span>'
        }${next ? `<a href="${next.out}">${next.label} →</a>` : '<span></span>'}</div>`
      : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · QREX</title>
<style>${STYLE}</style>
</head>
<body>
<div class="layout">
${menu}
<main>
${subtitle ? `<div class="crumbs">${subtitle}</div>` : ''}
${body}
${pager}
<div class="site-footer">QREX documentation · generated from the Markdown sources in <code>docs/</code> · build with <code>npm run docs:html</code></div>
</main>
</div>
${MENU_SCRIPT}
</body>
</html>
`;
}

/* ------------------------------------------------------------------ */
/* Collect source pages                                                */
/* ------------------------------------------------------------------ */

function readDir(dir) {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort();
}

// Build a friendly label from a filename.
function labelFor(file) {
  const name = basename(file, '.md');
  if (name.toLowerCase() === 'readme') {
    const parent = basename(dirname(file));
    return parent === 'user-manual' ? 'Index — start here' : 'Index — start here';
  }
  const m = /^(\d+)[-_](.+)$/.exec(name);
  if (m) {
    const title = m[2].replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return `${m[1]}. ${title}`;
  }
  return name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const techFiles = readDir(DOCS).filter((f) => !/^(README|PROJECT-PROPOSAL)\.md$/i.test(f));
const manualFiles = readDir(MANUAL);
const explainerFiles = existsSync(EXPLAINER) ? readDir(EXPLAINER) : [];

const techPages = techFiles.map((f) => ({
  src: join(DOCS, f),
  out: `tech-${f.replace(/\.md$/, '.html')}`,
  label: labelFor(f),
  group: 'Technical',
}));

const manualPages = manualFiles.map((f) => ({
  src: join(MANUAL, f),
  out: `manual-${f.replace(/\.md$/, '.html')}`,
  label: labelFor(f),
  group: 'Manual',
}));

const explainerPages = explainerFiles.map((f) => ({
  src: join(EXPLAINER, f),
  out: `explain-${f.replace(/\.md$/, '.html')}`,
  label: labelFor(f),
  group: 'Explainer',
}));

// Order the manual: README first, then 01..09 (already sorted).
const manualOrdered = manualPages.sort((a, b) => {
  const rank = (p) =>
    basename(p.src).toLowerCase() === 'readme.md' ? -1 : parseInt(basename(p.src), 10);
  return rank(a) - rank(b);
});

const explainerOrdered = explainerPages.sort((a, b) => {
  const rank = (p) =>
    basename(p.src).toLowerCase() === 'readme.md' ? -1 : parseInt(basename(p.src), 10);
  return rank(a) - rank(b);
});

const groups = [
  { title: 'User Manual', pages: manualOrdered.map(({ out, label }) => ({ out, label })) },
  {
    title: 'How QREX Works',
    pages: explainerOrdered.map(({ out, label }) => ({ out, label })),
  },
  { title: 'Technical Documentation', pages: techPages.map(({ out, label }) => ({ out, label })) },
];

/* ------------------------------------------------------------------ */
/* Generate per-document HTML pages                                    */
/* ------------------------------------------------------------------ */

function ensureCleanOut() {
  if (existsSync(OUT)) {
    for (const f of readdirSync(OUT)) {
      if (f.endsWith('.html')) rmSync(join(OUT, f));
    }
  } else {
    mkdirSync(OUT, { recursive: true });
  }
}

// Map every published Markdown source (by absolute path) to its output filename.
const outBySrc = new Map();
for (const p of [...manualOrdered, ...explainerOrdered, ...techPages]) outBySrc.set(resolve(p.src), p.out);

// Resolve a link as written inside `fromSrc` (an absolute .md path) to an
// output filename. Returns null for unpublished targets.
function makeResolver(fromSrc) {
  const fromDir = dirname(fromSrc);
  return (relPath) => {
    const abs = resolve(fromDir, relPath);
    if (outBySrc.has(abs)) return outBySrc.get(abs);
    // Try by basename across both collections (handles stray ../ paths).
    const base = basename(relPath);
    for (const [src, out] of outBySrc) {
      if (basename(src) === base) return out;
    }
    return null;
  };
}

function renderPage(meta, ordered) {
  const md = readFileSync(meta.src, 'utf8');
  let body = addTableFilters(mdToHtmlBody(md, 'inline'));
  body = rewriteLinks(body, makeResolver(meta.src));
  const idx = ordered.findIndex((p) => p.src === meta.src);
  const prev = ordered[idx - 1];
  const next = ordered[idx + 1];
  const title = (md.split('\n')[0] || '').replace(/^#\s*/, '').trim() || meta.label;
  const subtitle =
    meta.group === 'Manual'
      ? 'QREX User Manual'
      : meta.group === 'Explainer'
        ? 'How QREX Works'
        : 'QREX Technical Documentation';
  return page({
    title,
    body,
    currentFile: meta.out,
    groups,
    prev: prev ? { out: prev.out, label: prev.label } : null,
    next: next ? { out: next.out, label: next.label } : null,
    subtitle,
  });
}

/* ------------------------------------------------------------------ */
/* Landing page                                                        */
/* ------------------------------------------------------------------ */

function landBody() {
  const card = (p, desc) =>
    `<div class="card"><h3><a href="${p.out}">${p.label}</a></h3><p>${desc}</p></div>`;
  const manualDescs = {
    'manual-README.html': 'Manual index, role quick-reference, module map and reading conventions.',
    'manual-01-overview-and-getting-started.html': 'What QREX is, the surfaces, first-login tour, profile and demo accounts.',
    'manual-02-roles-and-access.html': 'The personas, capability matrix, row-level scoping and denied-access behaviour.',
    'manual-03-sales-lifecycle.html': 'Enquiry → Lead → Site Visit → Deal → Booking → Payment → Closed Won.',
    'manual-04-modules-sales.html': 'Dashboard, Properties, Amenities, Leads, Customers, Site Visits.',
    'manual-05-modules-operations.html': 'Sales Pipeline, Tasks, Bookings, Payments, Notifications.',
    'manual-06-modules-marketing-and-admin.html': 'Campaigns, Media Center, Reports, CMS, Users, Roles, Settings.',
    'manual-07-public-website.html': 'Browsing, filtering, property detail, enquiry forms and lead handoff.',
    'manual-08-reference.html': 'Status vocabularies, field reference, ID prefixes and the permission catalog.',
    'manual-09-troubleshooting-and-faq.html': 'Errors you may hit, what they mean and how to fix them.',
  };
  const explainerDescs = {
    'explain-README.html':
      'How to read this set, the vocabulary, and a map of every drawing in these chapters.',
    'explain-01-system-at-a-glance.html':
      'The three surfaces, the modules, the request path and the technology stack in pictures.',
    'explain-02-sales-lifecycle.html':
      'Enquiry to closed deal: the nine stages, what triggers each one, and who acts.',
    'explain-03-data-model.html':
      'The 30 tables as entity diagrams, with the relationships that hold the business together.',
    'explain-04-roles-and-permissions.html':
      'The six roles, the permission matrix and how row-level scoping keeps data separated.',
    'explain-05-screen-designs.html':
      'Annotated wireframes of the nine screens that matter most.',
    'explain-06-operations-and-automation.html':
      'Scheduled jobs, notifications, reports, document generation and the automated rules.',
  };
  const techDescs = {
    'tech-01-project-scope.html': 'Product overview, in-scope / out-of-scope and users.',
    'tech-02-architecture.html': 'Tech stack, backend and frontend layout, request flow.',
    'tech-03-operations-modules.html': 'Module-by-module working details.',
    'tech-04-roles-permissions.html': 'Custom RBAC model and seeded roles.',
    'tech-05-database-schema.html': 'Entities, relationships, status enums.',
    'tech-06-operations.html': 'Install, run, seed, automation and testing.',
    'tech-07-security-hardening.html': 'Authentication, throttling, OTP and secrets.',
    'tech-08-glossary.html': 'Domain terms used across the product.',
    'tech-09-project-proposal.html': 'Market-research-backed project proposal.',
    'tech-10-budget-pricing-mumbai.html': 'Year-1 budget and pricing plan.',
  };
  const grid = (pages, descs) =>
    `<div class="cards">${pages
      .map((p) => card(p, descs[p.out] || ''))
      .join('\n')}</div>`;
  return `
<h1>QREX Documentation</h1>
<p><strong>QREX</strong> — a property management and sales CRM for real-estate agencies, built by <em>Qodeigence Infocircle Private Limited</em>. Three document sets are published here:</p>
<ul>
  <li><strong>User Manual</strong> — for the people who use QREX day to day (agents, marketing, accounts, admins).</li>
  <li><strong>How QREX Works</strong> — drawings, screen designs and data tables that show how the system fits together.</li>
  <li><strong>Technical Documentation</strong> — architecture, data model, permissions and operations for the people who build and run it.</li>
</ul>
<h2>User Manual</h2>
${grid(manualOrdered, manualDescs)}
<h2>How QREX Works</h2>
${grid(explainerOrdered, explainerDescs)}
<h2>Technical Documentation</h2>
${grid(techPages, techDescs)}
<div class="cards">
  <div class="card"><h3><a href="../word/QREX-User-Manual.docx">User Manual (.docx)</a></h3><p>Full user manual as a Word document.</p></div>
  <div class="card"><h3><a href="../word/QREX-User-Manual.doc">User Manual (.doc)</a></h3><p>Legacy Word format.</p></div>
  <div class="card"><h3><a href="../word/QREX-How-It-Works.docx">How QREX Works (.docx)</a></h3><p>The visual explainer as a Word document.</p></div>
  <div class="card"><h3><a href="../word/QREX-How-It-Works.doc">How QREX Works (.doc)</a></h3><p>Legacy Word format.</p></div>
  <div class="card"><h3><a href="../word/QREX-Technical-Documentation.docx">Technical Docs (.docx)</a></h3><p>Full technical documentation as a Word document.</p></div>
  <div class="card"><h3><a href="../word/QREX-Technical-Documentation.doc">Technical Docs (.doc)</a></h3><p>Legacy Word format.</p></div>
</div>
`;
}

/* ------------------------------------------------------------------ */
/* Combined single-file HTML (for Word conversion)                     */
/* ------------------------------------------------------------------ */

function combinedHtml(pages, title, subtitle) {
  const toc = pages
    .map((p) => `<li><a href="#${p.out}">${p.label}</a></li>`)
    .join('');
  const sections = pages
    .map((p) => {
      const md = readFileSync(p.src, 'utf8');
      // In the combined document every section lives on one page, so links
      // become in-page anchors to the target section's id.
      let html = mdToHtmlBody(md, 'img');
      html = rewriteLinks(html, (rel) => {
        const mapped = makeResolver(p.src)(rel);
        return mapped === null ? null : `#${mapped}`;
      });
      return `<section class="doc" id="${p.out}">${html}</section>`;
    })
    .join('\n<hr>\n');
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>${title}</title>
<style>
body{font-family:Georgia,"Times New Roman",serif;color:#1f2733;line-height:1.6;margin:0}
h1,h2,h3,h4{font-family:-apple-system,"Segoe UI",Arial,sans-serif;color:#0f5c4e}
h1{font-size:22pt;border-bottom:2px solid #ccc;padding-bottom:6pt;page-break-after:avoid}
h2{font-size:16pt;margin-top:20pt;page-break-after:avoid}
h3{font-size:13pt;page-break-after:avoid}
table{border-collapse:collapse;width:100%;margin:10pt 0;font-size:10pt}
th,td{border:1px solid #bbb;padding:5pt 7pt;text-align:left;vertical-align:top}
th{background:#eef1f5}
code{background:#f2f4f7;padding:1pt 3pt;font-family:"Courier New",monospace;font-size:9pt}
pre{background:#f4f6f8;border:1px solid #ddd;padding:8pt;font-family:"Courier New",monospace;font-size:9pt}
blockquote{border-left:3pt solid #b5893b;background:#fff8e8;padding:6pt 10pt;margin:8pt 0}
section.doc{page-break-after:always}
.cover{page-break-after:always}
.toc a{color:#0f5c4e;text-decoration:none}
figure{margin:12pt 0;text-align:center;page-break-inside:avoid}
figure img{max-width:100%;height:auto;border:1px solid #dde3ea}
figcaption{font-size:9pt;color:#666;font-style:italic;margin-top:4pt}
</style></head><body>
<div class="cover">
<h1>${title}</h1>
<p style="font-size:13pt">${subtitle}</p>
<p>Qodeigence Infocircle Private Limited</p>
<p style="color:#666;font-size:10pt">Generated from the QREX documentation sources.</p>
</div>
<h2>Contents</h2>
<ol class="toc">${toc}</ol>
${sections}
</body></html>`;
}

// Copy the rasterised artwork the combined document references.
function copyAssets(pages, targetDir) {
  mkdirSync(targetDir, { recursive: true });
  const used = new Set();
  for (const p of pages) {
    const md = readFileSync(p.src, 'utf8');
    for (const block of mermaidBlocksOf(md)) {
      used.add(`${hashCode(block)}.png`);
    }
    for (const id of wireframeIds()) {
      if (new RegExp(`\`\`\`wireframe\\s+${id}\\b`).test(md)) used.add(`wf-${id}.png`);
    }
  }
  for (const file of used) {
    const from = join(DIAGRAMS, file);
    if (existsSync(from)) copyFileSync(from, join(targetDir, file));
  }
  return used.size;
}

// LibreOffice links external images from HTML instead of embedding them, which
// leaves a .docx that shows broken pictures on another machine. Inlining the
// artwork as data URIs makes the exported Word file self-contained.
function embedImages(html, assetDir) {
  return html.replace(/<img src="([^"]+)"/g, (match, src) => {
    if (!src.startsWith('assets/')) return match;
    const file = join(assetDir, basename(src));
    if (!existsSync(file)) return match;
    const data = readFileSync(file).toString('base64');
    return `<img src="data:image/png;base64,${data}"`;
  });
}

// Local copy of the fence scanner (keeps this module independent of the
// renderer's internals).
function mermaidBlocksOf(md) {
  const blocks = [];
  const re = /```mermaid[^\r\n]*\r?\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(md)) !== null) blocks.push(m[1].trim());
  return blocks;
}

/* ------------------------------------------------------------------ */
/* Artwork preparation                                                  */
/* ------------------------------------------------------------------ */

function svgSize(svg) {
  const root = svg.match(/^<svg[^>]*>/)?.[0] || '';
  const w = parseFloat(root.match(/\bwidth="([\d.]+)"/)?.[1] || '');
  const h = parseFloat(root.match(/\bheight="([\d.]+)"/)?.[1] || '');
  return { width: Math.round(w) || 900, height: Math.round(h) || 600 };
}

// Render every diagram and wireframe referenced by the sources, then expose
// them to the markdown renderer.
async function prepareArtwork(sources) {
  const extraSvgs = new Map();
  for (const id of wireframeIds()) {
    extraSvgs.set(`wf-${id}`, renderWireframe(id));
  }

  let rendered = new Map();
  try {
    rendered = await renderDiagrams(sources, DIAGRAMS, extraSvgs);
  } catch (error) {
    console.warn(`! Artwork rendering unavailable: ${error.message}`);
  }

  // Wireframes are plain SVG, so they survive even without a browser.
  for (const id of wireframeIds()) {
    const svg = renderWireframe(id);
    ART.wireframes.set(id, { svg, ...svgSize(svg) });
  }

  for (const [key, value] of rendered) {
    if (key.startsWith('wf-')) continue;
    ART.diagrams.set(key, { ...value, ...svgSize(value.svg) });
  }

  return ART.diagrams.size + ART.wireframes.size;
}

// Drop cached artwork that no source file references any more.
function pruneArtwork() {
  if (!existsSync(DIAGRAMS)) return;
  const keep = new Set();
  for (const key of ART.diagrams.keys()) {
    keep.add(`${key}.svg`);
    keep.add(`${key}.png`);
  }
  for (const id of wireframeIds()) {
    keep.add(`wf-${id}.svg`);
    keep.add(`wf-${id}.png`);
  }
  for (const file of readdirSync(DIAGRAMS)) {
    if (!keep.has(file)) rmSync(join(DIAGRAMS, file), { force: true });
  }
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  ensureCleanOut();

  const combinedDir = join(OUT, '_combined');
  rmSync(combinedDir, { recursive: true, force: true });

  const allSources = [...explainerOrdered, ...manualOrdered, ...techPages].map((p) => p.src);
  const artCount = await prepareArtwork(allSources);
  if (artCount > 0) console.log(`Artwork: ${artCount} diagram/wireframe(s) ready.`);
  pruneArtwork();

  // Per-document HTML.
  for (const p of techPages) writeFileSync(join(OUT, p.out), renderPage(p, techPages));
  for (const p of manualOrdered) writeFileSync(join(OUT, p.out), renderPage(p, manualOrdered));
  for (const p of explainerOrdered) {
    writeFileSync(join(OUT, p.out), renderPage(p, explainerOrdered));
  }

  // Landing page.
  writeFileSync(
    join(OUT, 'index.html'),
    page({
      title: 'Documentation',
      body: landBody(),
      currentFile: 'index.html',
      groups,
      prev: null,
      next: null,
      subtitle: null,
    }),
  );

  console.log(
    `HTML: ${manualOrdered.length + explainerOrdered.length + techPages.length + 1} pages -> docs/html/`,
  );

  // Combined HTML for Word.
  mkdirSync(combinedDir, { recursive: true });
  const manualCombined = join(combinedDir, 'QREX-User-Manual.html');
  const techCombined = join(combinedDir, 'QREX-Technical-Documentation.html');
  const explainerCombined = join(combinedDir, 'QREX-How-It-Works.html');
  writeFileSync(
    manualCombined,
    combinedHtml(
      manualOrdered,
      'QREX User Manual',
      'How to use QREX — for agents, marketing, accounts and administrators',
    ),
  );
  writeFileSync(
    techCombined,
    combinedHtml(
      techPages,
      'QREX Technical Documentation',
      'Architecture, data model, permissions and operations',
    ),
  );
  if (explainerOrdered.length > 0) {
    writeFileSync(
      explainerCombined,
      combinedHtml(
        explainerOrdered,
        'How QREX Works',
        'Drawings, screen designs and data tables that explain the system end to end',
      ),
    );
    copyAssets(explainerOrdered, join(combinedDir, 'assets'));
  }
  console.log('Combined HTML written.');
  if (WANT_WORD) {
    const wordDir = join(OUT, '..', 'word');
    mkdirSync(wordDir, { recursive: true });
    const profile = join(OUT, '_lo-profile');
    const convert = (inputHtml, outName, filter) => {
      execFileSync(
        'soffice',
        [
          '--headless',
          `-env:UserInstallation=file://${profile}`,
          '--convert-to',
          `${outName.split('.').pop()}:${filter}`,
          '--outdir',
          wordDir,
          inputHtml,
        ],
        { stdio: 'inherit' },
      );
      // LibreOffice names the output after the input file; rename to outName.
      const produced = join(wordDir, basename(inputHtml).replace(/\.html$/, `.${outName.split('.').pop()}`));
      if (existsSync(produced) && basename(produced) !== outName) {
        execFileSync('mv', [produced, join(wordDir, outName)]);
      }
    };
    convert(manualCombined, 'QREX-User-Manual.docx', 'MS Word 2007 XML');
    convert(manualCombined, 'QREX-User-Manual.doc', 'MS Word 97');
    convert(techCombined, 'QREX-Technical-Documentation.docx', 'MS Word 2007 XML');
    convert(techCombined, 'QREX-Technical-Documentation.doc', 'MS Word 97');
    if (explainerOrdered.length > 0) {
      // A self-contained copy with the artwork inlined, so the exported Word
      // file carries its pictures instead of linking to the build directory.
      const embedded = join(combinedDir, 'QREX-How-It-Works.word.html');
      writeFileSync(
        embedded,
        embedImages(readFileSync(explainerCombined, 'utf8'), join(combinedDir, 'assets')),
      );
      convert(embedded, 'QREX-How-It-Works.docx', 'MS Word 2007 XML');
      convert(embedded, 'QREX-How-It-Works.doc', 'MS Word 97');
    }

    // Remove LibreOffice lock files left behind on some platforms.
    for (const f of readdirSync(wordDir)) {
      if (f.startsWith('.~lock.')) rmSync(join(wordDir, f));
    }
    rmSync(profile, { recursive: true, force: true });
    rmSync(combinedDir, { recursive: true, force: true });
    console.log('Word documents written to docs/word/.');
  }
}

await main();
