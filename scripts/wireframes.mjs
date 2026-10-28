#!/usr/bin/env node
/**
 * Screen wireframes for the "How QREX Works" explainer.
 *
 * Each screen is declared as data (a list of regions) and rendered to an inline
 * SVG at build time. Edit the definitions below to change a wireframe — the
 * chapters reference them with a ```wireframe <id> fence.
 *
 * Region kinds and their visual treatment:
 *   topbar | nav | header | stat | chart | table | panel | form | list
 *   kanban | action | filter | note
 */

const PALETTE = {
  ink: '#1f2733',
  muted: '#5b6472',
  line: '#c9d2dd',
  accent: '#0f5c4e',
  accentSoft: '#e8f1ee',
  accent2: '#b5893b',
  noteSoft: '#fff8e8',
  panel: '#ffffff',
  soft: '#f2f4f7',
  softer: '#fbfcfd',
  nav: '#eef1f5',
  dark: '#1f2733',
};

const KINDS = {
  topbar: { fill: PALETTE.dark, stroke: PALETTE.dark, text: '#ffffff', dash: null },
  nav: { fill: PALETTE.nav, stroke: '#d5dce5', text: PALETTE.muted, dash: null },
  header: { fill: PALETTE.soft, stroke: '#dde3ea', text: PALETTE.ink, dash: null },
  stat: { fill: PALETTE.accentSoft, stroke: PALETTE.accent, text: PALETTE.accent, dash: null },
  chart: { fill: PALETTE.softer, stroke: PALETTE.line, text: PALETTE.muted, dash: '4 3' },
  table: { fill: PALETTE.panel, stroke: PALETTE.line, text: PALETTE.muted, dash: null },
  panel: { fill: PALETTE.panel, stroke: PALETTE.line, text: PALETTE.muted, dash: null },
  form: { fill: PALETTE.softer, stroke: PALETTE.line, text: PALETTE.muted, dash: null },
  list: { fill: PALETTE.panel, stroke: PALETTE.line, text: PALETTE.muted, dash: null },
  kanban: { fill: PALETTE.soft, stroke: PALETTE.line, text: PALETTE.muted, dash: null },
  action: { fill: PALETTE.accent, stroke: PALETTE.accent, text: '#ffffff', dash: null },
  filter: { fill: PALETTE.nav, stroke: '#d5dce5', text: PALETTE.muted, dash: null },
  note: { fill: PALETTE.noteSoft, stroke: PALETTE.accent2, text: '#5b4a22', dash: '5 3' },
};

const TITLE_BAR = 30;
const FRAME_PAD = 12;

/* ------------------------------------------------------------------ */
/* Text helpers                                                        */
/* ------------------------------------------------------------------ */

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapText(text, maxChars) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    if (!line) {
      line = word;
    } else if ((line + ' ' + word).length <= maxChars) {
      line += ' ' + word;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/* ------------------------------------------------------------------ */
/* Screen definitions                                                   */
/* ------------------------------------------------------------------ */

export const WIREFRAMES = {
  dashboard: {
    title: 'Dashboard',
    url: '/admin/dashboard',
    size: [1000, 660],
    regions: [
      { x: 0, y: 0, w: 1000, h: 44, kind: 'topbar', label: 'Top bar — agency name · global search · notifications · profile' },
      { x: 0, y: 44, w: 210, h: 616, kind: 'nav', label: 'Sidebar — 17 modules, filtered by permission' },
      { x: 210, y: 44, w: 790, h: 46, kind: 'header', label: 'Dashboard · date-range filter · quick actions' },
      { x: 228, y: 106, w: 176, h: 74, kind: 'stat', label: 'New leads' },
      { x: 420, y: 106, w: 176, h: 74, kind: 'stat', label: 'Site visits due' },
      { x: 612, y: 106, w: 176, h: 74, kind: 'stat', label: 'Deals in pipeline' },
      { x: 804, y: 106, w: 176, h: 74, kind: 'stat', label: 'Revenue this month' },
      { x: 228, y: 196, w: 366, h: 210, kind: 'chart', label: 'Revenue by month (area)' },
      { x: 614, y: 196, w: 366, h: 210, kind: 'chart', label: 'Lead sources (pie)' },
      { x: 228, y: 422, w: 366, h: 218, kind: 'table', label: 'Recent leads' },
      { x: 614, y: 422, w: 366, h: 218, kind: 'table', label: 'Follow-ups due today' },
    ],
    notes: [
      { n: 1, text: 'Every panel is permission-scoped: an agent sees their own rows, a manager sees the branch.' },
      { n: 2, text: 'Charts read live aggregates from DashboardController — no cached snapshot.' },
      { n: 3, text: 'Quick actions (Add Property, Add Lead, New Task, New Booking) are the four most-used writes.' },
    ],
  },

  'leads-list': {
    title: 'Leads',
    url: '/admin/leads',
    size: [1000, 660],
    regions: [
      { x: 0, y: 0, w: 1000, h: 44, kind: 'topbar', label: 'Top bar' },
      { x: 0, y: 44, w: 210, h: 616, kind: 'nav', label: 'Sidebar' },
      { x: 210, y: 44, w: 790, h: 46, kind: 'header', label: 'Leads · count · Import CSV · Add Lead' },
      { x: 228, y: 106, w: 754, h: 40, kind: 'filter', label: 'Filters — status · source · assigned agent · date range · search' },
      { x: 228, y: 162, w: 754, h: 300, kind: 'table', label: 'Lead rows — ID, name, source, status, agent, next follow-up, value' },
      { x: 228, y: 478, w: 754, h: 40, kind: 'panel', label: 'Pagination · rows per page' },
      { x: 228, y: 534, w: 366, h: 106, kind: 'note', label: 'CSV import resolves agents, campaigns and properties by name' },
      { x: 614, y: 534, w: 368, h: 106, kind: 'note', label: 'Row-level scope: agents only see their own and their branch’s leads' },
    ],
    notes: [
      { n: 1, text: 'Status, source and follow-up are the three columns that decide what an agent does next.' },
      { n: 2, text: 'The import template is downloadable from the same screen (leads.import-template).' },
    ],
  },

  'lead-detail': {
    title: 'Lead detail',
    url: '/admin/leads/{lead}',
    size: [1000, 660],
    regions: [
      { x: 0, y: 0, w: 1000, h: 44, kind: 'topbar', label: 'Top bar' },
      { x: 0, y: 44, w: 210, h: 616, kind: 'nav', label: 'Sidebar' },
      { x: 210, y: 44, w: 790, h: 56, kind: 'header', label: 'L-006 · Priya Sharma · status chip · Reassign · Convert to deal' },
      { x: 228, y: 118, w: 360, h: 190, kind: 'form', label: 'Lead fields — source, score, phone, email, budget, requirements' },
      { x: 604, y: 118, w: 378, h: 190, kind: 'panel', label: 'Next follow-up date · schedule site visit · linked property' },
      { x: 228, y: 324, w: 754, h: 216, kind: 'list', label: 'Activity timeline — calls, WhatsApp, SMS, e-mail, notes, auto-generated events' },
      { x: 228, y: 556, w: 754, h: 84, kind: 'action', label: 'Log activity · Change status · Convert to deal' },
    ],
    notes: [
      { n: 1, text: 'Setting a next follow-up date creates or updates a Follow-up task for the assigned agent.' },
      { n: 2, text: 'Status → “Site Visit Scheduled” auto-creates the site visit and notifies the agent.' },
      { n: 3, text: 'Conversion is transactional: it locks the lead, creates the deal and records a Conversion activity.' },
    ],
  },

  pipeline: {
    title: 'Sales Pipeline (Kanban)',
    url: '/admin/pipeline',
    size: [1000, 620],
    regions: [
      { x: 0, y: 0, w: 1000, h: 44, kind: 'topbar', label: 'Top bar' },
      { x: 0, y: 44, w: 210, h: 576, kind: 'nav', label: 'Sidebar' },
      { x: 210, y: 44, w: 790, h: 46, kind: 'header', label: 'Pipeline · stage filter · owner filter' },
      { x: 228, y: 106, w: 118, h: 490, kind: 'kanban', label: 'New Lead' },
      { x: 352, y: 106, w: 118, h: 490, kind: 'kanban', label: 'Contacted' },
      { x: 476, y: 106, w: 118, h: 490, kind: 'kanban', label: 'Qualified' },
      { x: 600, y: 106, w: 118, h: 490, kind: 'kanban', label: 'Shortlisted' },
      { x: 724, y: 106, w: 118, h: 490, kind: 'kanban', label: 'Negotiation' },
      { x: 848, y: 106, w: 134, h: 490, kind: 'kanban', label: 'Booking → Payment → Closed' },
    ],
    notes: [
      { n: 1, text: 'Twelve canonical stages; the board shows the first six, each column holding deal cards.' },
      { n: 2, text: 'A card carries value, probability and days-in-stage — the ageing signal for a stalled deal.' },
      { n: 3, text: 'Moving a card is a single PUT that stamps stage_changed_at, so days-in-stage is derived, never stored.' },
    ],
  },

  'property-form': {
    title: 'Property create / edit',
    url: '/admin/properties/create',
    size: [1000, 660],
    regions: [
      { x: 0, y: 0, w: 1000, h: 44, kind: 'topbar', label: 'Top bar' },
      { x: 0, y: 44, w: 210, h: 616, kind: 'nav', label: 'Sidebar' },
      { x: 210, y: 44, w: 790, h: 46, kind: 'header', label: 'Add property · Save · Cancel' },
      { x: 228, y: 106, w: 366, h: 250, kind: 'form', label: 'Core — title, property type, transaction type, status' },
      { x: 614, y: 106, w: 368, h: 250, kind: 'form', label: 'Commercial — price, area, location, agency, featured, website-visible' },
      { x: 228, y: 372, w: 366, h: 130, kind: 'panel', label: 'Type-driven spec fields — shown/required per property type' },
      { x: 614, y: 372, w: 368, h: 130, kind: 'panel', label: 'Amenities — chosen from the catalogue for that property type' },
      { x: 228, y: 518, w: 754, h: 122, kind: 'list', label: 'Image gallery — upload, reorder, choose cover, delete' },
    ],
    notes: [
      { n: 1, text: 'The form is data-driven: the property type decides which spec fields appear and which are mandatory.' },
      { n: 2, text: 'is_website_visible controls whether the listing appears on the public site.' },
      { n: 3, text: 'Properties soft-delete, so a removed listing stays queryable for reports and audit.' },
    ],
  },

  'operations': {
    title: 'Bookings & Payments',
    url: '/admin/bookings · /admin/payments',
    size: [1000, 620],
    regions: [
      { x: 0, y: 0, w: 1000, h: 44, kind: 'topbar', label: 'Top bar' },
      { x: 0, y: 44, w: 210, h: 576, kind: 'nav', label: 'Sidebar' },
      { x: 210, y: 44, w: 790, h: 46, kind: 'header', label: 'Bookings · status filter · new booking' },
      { x: 228, y: 106, w: 754, h: 210, kind: 'table', label: 'Booking rows — ID, customer, property, value, agreement status, possession status' },
      { x: 228, y: 332, w: 754, h: 46, kind: 'header', label: 'Payments · status filter · record payment' },
      { x: 228, y: 394, w: 754, h: 206, kind: 'table', label: 'Payment rows — ID, booking, amount, due date, paid date, status' },
    ],
    notes: [
      { n: 1, text: 'A booking carries three independent tracks: status, agreement status and possession status.' },
      { n: 2, text: 'Payment status drives the outstanding figure in reports — Pending, Overdue and Partially Paid all count as outstanding.' },
    ],
  },

  reports: {
    title: 'Reports & Analytics',
    url: '/admin/reports',
    size: [1000, 640],
    regions: [
      { x: 0, y: 0, w: 1000, h: 44, kind: 'topbar', label: 'Top bar' },
      { x: 0, y: 44, w: 210, h: 596, kind: 'nav', label: 'Sidebar' },
      { x: 210, y: 44, w: 790, h: 46, kind: 'header', label: 'Reports · date range · Export CSV · Export PDF' },
      { x: 228, y: 106, w: 754, h: 42, kind: 'filter', label: 'Report tabs — sales, leads, pipeline, payments, agents, properties, site visits, bookings' },
      { x: 228, y: 164, w: 366, h: 214, kind: 'chart', label: 'Trend chart' },
      { x: 614, y: 164, w: 368, h: 214, kind: 'chart', label: 'Breakdown chart' },
      { x: 228, y: 394, w: 754, h: 226, kind: 'table', label: 'Report rows — the same dataset the chart summarises' },
    ],
    notes: [
      { n: 1, text: 'Ten report builders feed the tabs; the CSV and PDF exports run the same query as the table.' },
      { n: 2, text: 'PDF is rendered with DomPDF, so what you export matches what you see.' },
    ],
  },

  roles: {
    title: 'Roles & Permissions',
    url: '/admin/roles',
    size: [1000, 640],
    regions: [
      { x: 0, y: 0, w: 1000, h: 44, kind: 'topbar', label: 'Top bar' },
      { x: 0, y: 44, w: 210, h: 596, kind: 'nav', label: 'Sidebar' },
      { x: 210, y: 44, w: 790, h: 46, kind: 'header', label: 'Roles · list, create, edit, delete' },
      { x: 228, y: 106, w: 250, h: 514, kind: 'list', label: 'Role list — Admin, Agent, Senior Agent, Marketing, Accounts, Super Admin' },
      { x: 494, y: 106, w: 488, h: 514, kind: 'table', label: 'Permission matrix — 17 modules × actions, with field-level switches' },
    ],
    notes: [
      { n: 1, text: 'Only Super Admin can reach this screen by default.' },
      { n: 2, text: 'Each permission is module + action, optionally narrowed to a field (e.g. leads.phone.read_only).' },
      { n: 3, text: 'The same matrix is served to the frontend so nav items and buttons hide consistently.' },
    ],
  },

  'public-listing': {
    title: 'Public website — property listing',
    url: '/properties',
    size: [1000, 620],
    regions: [
      { x: 0, y: 0, w: 1000, h: 56, kind: 'topbar', label: 'Public header — logo · Home · Properties · About · Contact · Sign in' },
      { x: 0, y: 56, w: 1000, h: 52, kind: 'filter', label: 'Search — location · property type · transaction type · price range' },
      { x: 0, y: 108, w: 1000, h: 48, kind: 'header', label: 'Results summary · sort by' },
      { x: 0, y: 156, w: 320, h: 300, kind: 'panel', label: 'Property card — image, title, type, price, area, location' },
      { x: 340, y: 156, w: 320, h: 300, kind: 'panel', label: 'Property card' },
      { x: 680, y: 156, w: 320, h: 300, kind: 'panel', label: 'Property card' },
      { x: 0, y: 456, w: 1000, h: 80, kind: 'note', label: 'Enquiry form on the property page → POST /properties/{public_id}/enquiry → creates a Lead with source = Website' },
      { x: 0, y: 536, w: 1000, h: 84, kind: 'panel', label: 'Footer — contact details, legal links' },
    ],
    notes: [
      { n: 1, text: 'Only properties flagged is_website_visible are listed.' },
      { n: 2, text: 'Every enquiry becomes a CRM lead with no human step — the entry point of the whole lifecycle.' },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* SVG rendering                                                       */
/* ------------------------------------------------------------------ */

function renderRegion(region, offsetY) {
  const kind = KINDS[region.kind] || KINDS.panel;
  const x = region.x + FRAME_PAD;
  const y = region.y + offsetY;
  const w = Math.max(region.w - FRAME_PAD * 2, 10);
  const h = Math.max(region.h - FRAME_PAD, 10);
  const parts = [];

  parts.push(
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${kind.fill}" stroke="${kind.stroke}"` +
      (kind.dash ? ` stroke-dasharray="${kind.dash}"` : '') +
      ` stroke-width="1.2"/>`,
  );

  if (region.kind === 'table') {
    const rows = Math.max(Math.min(Math.floor(h / 26) - 1, 8), 2);
    for (let i = 1; i <= rows; i += 1) {
      const ly = y + 22 + (i - 1) * 24;
      if (ly > y + h - 8) break;
      parts.push(
        `<rect x="${x + 10}" y="${ly}" width="${w - 20}" height="15" rx="3" fill="${PALETTE.softer}" stroke="#eef1f5" stroke-width="1"/>`,
      );
      parts.push(
        `<rect x="${x + 16}" y="${ly + 4}" width="${Math.round((w - 40) * 0.34)}" height="7" rx="3" fill="#dbe2ea"/>`,
      );
      parts.push(
        `<rect x="${x + 26 + Math.round((w - 40) * 0.34)}" y="${ly + 4}" width="${Math.round((w - 60) * 0.22)}" height="7" rx="3" fill="#e6ebf1"/>`,
      );
    }
    parts.push(`<rect x="${x + 10}" y="${y + 8}" width="${Math.round((w - 40) * 0.34)}" height="7" rx="3" fill="#c3ccd7"/>`);
  }

  if (region.kind === 'kanban') {
    const cards = Math.max(Math.floor(h / 76) - 1, 1);
    for (let i = 0; i < cards; i += 1) {
      const cy = y + 40 + i * 70;
      if (cy > y + h - 50) break;
      parts.push(
        `<rect x="${x + 8}" y="${cy}" width="${w - 16}" height="56" rx="5" fill="#ffffff" stroke="${PALETTE.line}" stroke-width="1"/>`,
      );
      parts.push(`<rect x="${x + 16}" y="${cy + 10}" width="${w - 60}" height="7" rx="3" fill="#c3ccd7"/>`);
      parts.push(`<rect x="${x + 16}" y="${cy + 24}" width="${Math.round((w - 60) * 0.5)}" height="6" rx="3" fill="#e6ebf1"/>`);
      parts.push(`<rect x="${x + 16}" y="${cy + 37}" width="${Math.round((w - 60) * 0.7)}" height="6" rx="3" fill="#eef1f5"/>`);
    }
  }

  if (region.kind === 'form') {
    const fields = Math.max(Math.floor(h / 30) - 1, 2);
    for (let i = 0; i < fields; i += 1) {
      const fy = y + 40 + i * 28;
      if (fy > y + h - 22) break;
      parts.push(`<rect x="${x + 14}" y="${fy}" width="60" height="6" rx="3" fill="#c3ccd7"/>`);
      parts.push(
        `<rect x="${x + 14}" y="${fy + 10}" width="${Math.round((w - 60) * (i % 2 === 0 ? 0.9 : 0.62))}" height="12" rx="3" fill="#ffffff" stroke="${PALETTE.line}" stroke-width="1"/>`,
      );
    }
  }

  if (region.kind === 'list') {
    const rows = Math.max(Math.floor(h / 30) - 1, 2);
    for (let i = 0; i < rows; i += 1) {
      const ry = y + 42 + i * 28;
      if (ry > y + h - 20) break;
      parts.push(`<circle cx="${x + 20}" cy="${ry + 5}" r="4" fill="${PALETTE.accent}" opacity="0.55"/>`);
      parts.push(`<rect x="${x + 32}" y="${ry + 1}" width="${Math.round((w - 70) * 0.5)}" height="7" rx="3" fill="#dbe2ea"/>`);
      parts.push(`<rect x="${x + 32}" y="${ry + 13}" width="${Math.round((w - 70) * 0.72)}" height="6" rx="3" fill="#eef1f5"/>`);
    }
  }

  if (region.kind === 'stat') {
    parts.push(`<rect x="${x + 16}" y="${y + 14}" width="${Math.round((w - 32) * 0.5)}" height="9" rx="4" fill="${PALETTE.accent}" opacity="0.45"/>`);
    parts.push(`<rect x="${x + 16}" y="${y + 32}" width="${Math.round((w - 32) * 0.72)}" height="16" rx="4" fill="${PALETTE.accent}" opacity="0.75"/>`);
    parts.push(`<rect x="${x + 16}" y="${y + 54}" width="${Math.round((w - 32) * 0.4)}" height="6" rx="3" fill="#c3ccd7"/>`);
  }

  if (region.kind === 'chart') {
    const baseline = y + h - 22;
    const points = [0.62, 0.4, 0.72, 0.3, 0.55, 0.22, 0.48];
    const step = (w - 40) / (points.length - 1);
    const path = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${x + 20 + i * step} ${baseline - p * (h - 70)}`)
      .join(' ');
    parts.push(
      `<path d="${path}" fill="none" stroke="${PALETTE.accent}" stroke-width="2" opacity="0.75" stroke-linecap="round"/>`,
    );
    parts.push(`<line x1="${x + 14}" y1="${baseline}" x2="${x + w - 14}" y2="${baseline}" stroke="${PALETTE.line}" stroke-width="1"/>`);
  }

  if (region.kind === 'action') {
    parts.push(`<rect x="${x + 18}" y="${y + 18}" width="150" height="22" rx="11" fill="rgba(255,255,255,.22)"/>`);
    parts.push(`<rect x="${x + 182}" y="${y + 18}" width="110" height="22" rx="11" fill="rgba(255,255,255,.16)"/>`);
  }

  // Label
  const labelX = x + 12;
  const labelY = region.kind === 'table' || region.kind === 'kanban' ? y + 18 : y + 16;
  const maxChars = Math.max(Math.floor((w - 24) / 6.6), 8);
  const lines = wrapText(region.label, maxChars).slice(0, region.kind === 'chart' || region.kind === 'note' ? 3 : 2);
  const anchor = region.kind === 'stat' ? 'middle' : 'start';
  const tx = region.kind === 'stat' ? x + w / 2 : labelX;
  lines.forEach((line, index) => {
    parts.push(
      `<text x="${tx}" y="${labelY + index * 14}" text-anchor="${anchor}" font-size="11" fill="${kind.text}" font-weight="600" opacity="0.95">${escapeXml(line)}</text>`,
    );
  });

  return parts.join('');
}

export function renderWireframe(id) {
  const screen = WIREFRAMES[id];
  if (!screen) {
    throw new Error(
      `Unknown wireframe "${id}". Known ids: ${Object.keys(WIREFRAMES).join(', ')}`,
    );
  }

  const [width, height] = screen.size;
  const notes = screen.notes || [];
  const notesHeight = notes.length ? notes.length * 18 + 16 : 0;
  const totalHeight = height + notesHeight + 8;
  const offsetY = TITLE_BAR;

  const parts = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${totalHeight}" width="${width}" height="${totalHeight}" ` +
      `style="max-width:100%;height:auto" font-family="Inter, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" ` +
      `role="img" aria-label="${escapeXml(screen.title)} screen wireframe">`,
  );

  // Frame
  parts.push(
    `<rect x="0.5" y="0.5" width="${width - 1}" height="${totalHeight - 1}" rx="10" fill="#ffffff" stroke="${PALETTE.line}" stroke-width="1.2"/>`,
  );

  // Title bar
  parts.push(
    `<path d="M0 10 A10 10 0 0 1 10 0 L${width - 10} 0 A10 10 0 0 1 ${width} 10 L${width} ${TITLE_BAR} L0 ${TITLE_BAR} Z" fill="${PALETTE.dark}"/>`,
  );
  parts.push(
    `<circle cx="18" cy="${TITLE_BAR / 2}" r="4" fill="#ff6b6b"/><circle cx="32" cy="${TITLE_BAR / 2}" r="4" fill="#ffd43b"/><circle cx="46" cy="${TITLE_BAR / 2}" r="4" fill="#51cf66"/>`,
  );
  parts.push(
    `<text x="64" y="${TITLE_BAR / 2 + 4}" font-size="12" font-weight="700" fill="#ffffff">${escapeXml(screen.title)}</text>`,
  );
  parts.push(
    `<text x="${width - 14}" y="${TITLE_BAR / 2 + 4}" font-size="11" fill="#aeb8c4" text-anchor="end" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">${escapeXml(screen.url)}</text>`,
  );

  for (const region of screen.regions) {
    parts.push(renderRegion(region, offsetY));
  }

  // Notes
  if (notes.length) {
    const baseY = height + 4;
    parts.push(
      `<line x1="${FRAME_PAD}" y1="${baseY}" x2="${width - FRAME_PAD}" y2="${baseY}" stroke="${PALETTE.line}" stroke-width="1"/>`,
    );
    notes.forEach((note, index) => {
      const ny = baseY + 20 + index * 18;
      parts.push(
        `<circle cx="${FRAME_PAD + 9}" cy="${ny - 4}" r="9" fill="${PALETTE.accent}"/>` +
          `<text x="${FRAME_PAD + 9}" y="${ny}" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">${note.n}</text>`,
      );
      const noteLines = wrapText(note.text, Math.floor((width - 60) / 6.1));
      noteLines.forEach((line, lineIndex) => {
        parts.push(
          `<text x="${FRAME_PAD + 26}" y="${ny + lineIndex * 13}" font-size="11" fill="${PALETTE.muted}">${escapeXml(line)}</text>`,
        );
      });
    });
  }

  parts.push('</svg>');
  return parts.join('\n');
}

export function wireframeIds() {
  return Object.keys(WIREFRAMES);
}
