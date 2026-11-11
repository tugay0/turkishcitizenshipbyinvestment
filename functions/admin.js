/**
 * The analytics dashboard.
 *
 * Served from a Function rather than a static page so it sits behind the same
 * basic auth as the data endpoint and never lands in the build output, where
 * it would be crawled, indexed and sitemapped alongside the reference pages.
 *
 * Visual language follows admin.ralegal.com.tr deliberately: same palette,
 * same tiles, same card grid, same Georgia headings. Two dashboards for the
 * same operator should not need separate learning.
 */
import { authorised } from './api/stats.js';

const PAGE = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>TCBI Reference analytics</title>
<meta name="robots" content="noindex, nofollow" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
<style>
  :root {
    color-scheme: light;
    --paper:#fbfaf7; --paper-deep:#f3f1ea; --ink:#1c1b18; --ink-soft:#3c3a35;
    --ink-faint:#6e6a61; --accent:#7a4a1e; --accent-soft:#b08a5e;
    --rule:#ddd8cc; --good:#1f7a4a; --bad:#8a2f22;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      color-scheme: dark;
      --paper:#16150f; --paper-deep:#1f1d16; --ink:#f2efe6; --ink-soft:#c5c0b2;
      --ink-faint:#8c8779; --accent:#d8a86a; --accent-soft:#8a6a42; --rule:#332f26;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin:0; background:var(--paper); color:var(--ink); padding:0 0 4rem;
    font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
  }
  header {
    position:sticky; top:0; z-index:10; background:var(--paper);
    border-bottom:1px solid var(--rule);
    padding:calc(1rem + env(safe-area-inset-top,0px)) 16px 1rem;
    display:flex; flex-wrap:wrap; gap:12px; align-items:baseline; justify-content:space-between;
  }
  h1 { font:600 1.35rem/1.2 Georgia,serif; margin:0; letter-spacing:-0.01em; }
  h2 { font:600 .95rem/1.3 Georgia,serif; margin:0 0 12px; }
  .wrap { max-width:1180px; margin:0 auto; padding:20px 16px 0; }
  .range { display:flex; gap:6px; flex-wrap:wrap; }
  .range button {
    font:inherit; font-size:12px; padding:5px 11px; border-radius:999px; cursor:pointer;
    border:1px solid var(--rule); background:transparent; color:var(--ink-soft);
  }
  .range button[aria-pressed="true"] { background:var(--accent); border-color:var(--accent); color:var(--paper); }
  .tiles { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; margin-bottom:22px; }
  .tile { border:1px solid var(--rule); background:var(--paper-deep); padding:14px 16px; border-radius:4px; }
  .tile .k { font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:var(--ink-faint); }
  .tile .v { font:600 1.8rem/1.1 Georgia,serif; margin-top:6px; }
  .tile .s { font-size:12px; color:var(--ink-faint); margin-top:2px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(330px,1fr)); gap:16px; }
  .card { border:1px solid var(--rule); border-radius:4px; padding:16px; background:var(--paper); min-width:0; }
  .card.wide { grid-column:1 / -1; }
  .scroll { overflow-x:auto; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th,td { text-align:left; padding:7px 10px; border-bottom:1px solid var(--rule); white-space:nowrap; }
  th { font-size:11px; letter-spacing:.06em; text-transform:uppercase; color:var(--ink-faint); font-weight:600; }
  td.n, th.n { text-align:right; font-variant-numeric:tabular-nums; }
  td.path { white-space:normal; word-break:break-word; max-width:340px; }
  .bar { height:4px; background:var(--accent-soft); border-radius:2px; margin-top:4px; }
  .muted { color:var(--ink-faint); font-size:12.5px; line-height:1.6; }
  .note { border-left:2px solid var(--accent-soft); padding:10px 14px; background:var(--paper-deep); border-radius:0 4px 4px 0; }
  .note.warn { border-left-color:var(--bad); }
  .pill { display:inline-block; font-size:11px; padding:1px 7px; border-radius:999px; border:1px solid var(--rule); color:var(--ink-faint); }
  .pill.ok { color:var(--good); border-color:var(--good); }
  .pill.bad { color:var(--bad); border-color:var(--bad); }
  canvas { max-height:260px; }
  a { color:var(--accent); }
</style>
</head>
<body>
<header>
  <h1>TCBI Reference analytics</h1>
  <div class="range" id="range">
    <button data-d="1">24h</button>
    <button data-d="7">7d</button>
    <button data-d="30" aria-pressed="true">30d</button>
    <button data-d="90">90d</button>
  </div>
</header>

<div class="wrap">
  <div id="status" class="note" style="margin-bottom:18px">Loading…</div>
  <div class="tiles" id="tiles"></div>

  <div class="grid">
    <div class="card wide">
      <h2>Requests over time</h2>
      <canvas id="chartSeries"></canvas>
      <p class="muted" style="margin-top:10px">
        Crawlers and readers counted separately. On a reference site the crawler line is
        the one that matters: it is the leading indicator of whether anything gets cited.
      </p>
    </div>

    <div class="card wide">
      <h2>Crawlers, and when each was last here</h2>
      <div id="crawlerNote"></div>
      <div class="scroll"><table id="tblCrawlers"></table></div>
      <p class="muted" style="margin-top:10px">
        Last seen is measured against all of history, not the selected window. A crawler
        that has quietly stopped coming is the failure this table exists to catch.
      </p>
    </div>

    <div class="card wide">
      <h2>Pages, by requests</h2>
      <div class="scroll"><table id="tblPages"></table></div>
    </div>

    <div class="card">
      <h2>Where requests come from</h2>
      <div class="scroll"><table id="tblCountries"></table></div>
    </div>

    <div class="card">
      <h2>Reader clients</h2>
      <div class="scroll"><table id="tblClients"></table></div>
      <p class="muted" style="margin-top:10px">
        Browser family only. No version, no platform, no address, no cookie: there is
        nothing here that identifies a reader, by design.
      </p>
    </div>

    <div class="card">
      <h2>Referrers</h2>
      <div class="scroll"><table id="tblReferrers"></table></div>
      <p class="muted" style="margin-top:10px">Host only. A full referrer URL can carry what someone searched.</p>
    </div>

    <div class="card">
      <h2>Response codes</h2>
      <div class="scroll"><table id="tblStatuses"></table></div>
    </div>

    <div class="card wide">
      <h2>What each crawler fetched</h2>
      <div class="scroll"><table id="tblBotPaths"></table></div>
    </div>
  </div>
</div>

<script>
const $ = (id) => document.getElementById(id);
const nf = new Intl.NumberFormat('en-GB');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let days = 30, chart;

function ago(ts) {
  if (!ts) return 'never';
  const s = Math.floor(Date.now()/1000) - ts;
  if (s < 3600) return Math.max(1, Math.floor(s/60)) + 'm ago';
  if (s < 86400) return Math.floor(s/3600) + 'h ago';
  return Math.floor(s/86400) + 'd ago';
}

function table(el, cols, rows, render) {
  if (!rows.length) { el.innerHTML = '<tbody><tr><td class="muted">No data yet.</td></tr></tbody>'; return; }
  el.innerHTML =
    '<thead><tr>' + cols.map((c) => '<th' + (c.n ? ' class="n"' : '') + '>' + esc(c.t) + '</th>').join('') + '</tr></thead>' +
    '<tbody>' + rows.map(render).join('') + '</tbody>';
}

async function load() {
  $('status').className = 'note';
  $('status').textContent = 'Loading…';
  let d;
  try {
    const r = await fetch('/api/stats?days=' + days, { headers: { accept: 'application/json' } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    d = await r.json();
  } catch (e) {
    $('status').className = 'note warn';
    $('status').textContent = 'Could not load statistics: ' + e.message;
    return;
  }

  const t = d.totals || {};
  const collecting = t.first_ts ? ago(t.first_ts) : null;
  $('status').className = 'note';
  $('status').innerHTML = collecting
    ? 'Collecting since ' + esc(collecting) + '. ' + nf.format(t.hits || 0) + ' requests in the last ' + d.days + ' days.'
    : 'No requests logged yet. The first crawler visit usually lands within a day of the sitemap being submitted.';

  $('tiles').innerHTML = [
    ['Requests', nf.format(t.hits || 0), 'last ' + d.days + ' days'],
    ['Crawler requests', nf.format(t.bot_hits || 0), (t.distinct_bots || 0) + ' distinct crawlers'],
    ['Reader requests', nf.format(t.reader_hits || 0), 'no identifiers stored'],
    ['Pages touched', nf.format(t.distinct_paths || 0), 'distinct paths'],
  ].map(([k, v, s]) => '<div class="tile"><div class="k">' + k + '</div><div class="v">' + v + '</div><div class="s">' + esc(s) + '</div></div>').join('');

  // Time series
  const labels = d.series.map((r) => r.day);
  const data = {
    labels,
    datasets: [
      { label: 'Crawlers', data: d.series.map((r) => r.bots), borderColor: '#7a4a1e', backgroundColor: 'rgba(122,74,30,.12)', tension: .3, fill: true },
      { label: 'Readers', data: d.series.map((r) => r.readers), borderColor: '#1f7a4a', backgroundColor: 'rgba(31,122,74,.10)', tension: .3, fill: true },
    ],
  };
  if (chart) { chart.data = data; chart.update(); }
  else {
    chart = new Chart($('chartSeries'), {
      type: 'line', data,
      options: { responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        plugins: { legend: { position: 'bottom' } } },
    });
  }

  // Crawlers. The seen table is the authoritative "last here".
  const seenBy = Object.fromEntries((d.seen || []).map((r) => [r.bot, r]));
  const windowed = Object.fromEntries((d.crawlers || []).map((r) => [r.bot, r]));
  const allBots = [...new Set([...Object.keys(seenBy), ...Object.keys(windowed)])]
    .sort((a, b) => (seenBy[b]?.last_ts || 0) - (seenBy[a]?.last_ts || 0));

  const stale = allBots.filter((b) => seenBy[b] && (Math.floor(Date.now()/1000) - seenBy[b].last_ts) > 14 * 86400);
  $('crawlerNote').innerHTML = stale.length
    ? '<div class="note warn" style="margin-bottom:12px">Not seen in over 14 days: ' + stale.map(esc).join(', ') + '. Worth checking whether something is refusing them.</div>'
    : '';

  table($('tblCrawlers'),
    [{t:'Crawler'},{t:'In window',n:true},{t:'Paths',n:true},{t:'Errors',n:true},{t:'Last seen'},{t:'Last path'},{t:'All time',n:true}],
    allBots,
    (b) => {
      const w = windowed[b] || {}, s = seenBy[b] || {};
      const err = Number(w.errors || 0);
      return '<tr><td><strong>' + esc(b) + '</strong></td>' +
        '<td class="n">' + nf.format(w.hits || 0) + '</td>' +
        '<td class="n">' + nf.format(w.paths || 0) + '</td>' +
        '<td class="n">' + (err ? '<span class="pill bad">' + err + '</span>' : '<span class="pill ok">0</span>') + '</td>' +
        '<td>' + esc(ago(s.last_ts)) + '</td>' +
        '<td class="path">' + esc(s.last_path || '') + (s.last_status && s.last_status >= 400 ? ' <span class="pill bad">' + s.last_status + '</span>' : '') + '</td>' +
        '<td class="n">' + nf.format(s.hits || 0) + '</td></tr>';
    });

  const maxPage = Math.max(1, ...d.topPages.map((r) => r.hits));
  table($('tblPages'),
    [{t:'Path'},{t:'Requests',n:true},{t:'Crawlers',n:true},{t:'Readers',n:true},{t:''}],
    d.topPages,
    (r) => '<tr><td class="path"><a href="' + esc(r.path) + '">' + esc(r.path) + '</a></td>' +
      '<td class="n">' + nf.format(r.hits) + '</td><td class="n">' + nf.format(r.bots) + '</td>' +
      '<td class="n">' + nf.format(r.readers) + '</td>' +
      '<td style="width:120px"><div class="bar" style="width:' + Math.round((r.hits / maxPage) * 100) + '%"></div></td></tr>');

  // Countries: fold the two kinds into one row each.
  const byCountry = {};
  for (const r of d.countries) {
    byCountry[r.country] ??= { country: r.country, bots: 0, readers: 0 };
    byCountry[r.country][r.kind === 'bot' ? 'bots' : 'readers'] += r.hits;
  }
  const countries = Object.values(byCountry).sort((a, b) => (b.bots + b.readers) - (a.bots + a.readers));
  table($('tblCountries'), [{t:'Country'},{t:'Readers',n:true},{t:'Crawlers',n:true}], countries,
    (r) => '<tr><td>' + esc(r.country) + '</td><td class="n">' + nf.format(r.readers) + '</td><td class="n">' + nf.format(r.bots) + '</td></tr>');

  table($('tblClients'), [{t:'Client'},{t:'Requests',n:true}], d.clients,
    (r) => '<tr><td>' + esc(r.client) + '</td><td class="n">' + nf.format(r.hits) + '</td></tr>');

  table($('tblReferrers'), [{t:'Host'},{t:'Requests',n:true}], d.referrers,
    (r) => '<tr><td class="path">' + esc(r.referer) + '</td><td class="n">' + nf.format(r.hits) + '</td></tr>');

  table($('tblStatuses'), [{t:'Status'},{t:'Requests',n:true}], d.statuses,
    (r) => '<tr><td>' + (r.status >= 400 ? '<span class="pill bad">' + r.status + '</span>' : '<span class="pill ok">' + r.status + '</span>') + '</td><td class="n">' + nf.format(r.hits) + '</td></tr>');

  table($('tblBotPaths'), [{t:'Crawler'},{t:'Path'},{t:'Requests',n:true}], d.botPaths,
    (r) => '<tr><td>' + esc(r.bot) + '</td><td class="path">' + esc(r.path) + '</td><td class="n">' + nf.format(r.hits) + '</td></tr>');
}

$('range').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  [...$('range').children].forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  days = Number(b.dataset.d);
  load();
});

load();
setInterval(load, 120000);
</script>
</body>
</html>`;

export async function onRequestGet({ request, env }) {
  if (!authorised(request, env)) {
    return new Response('Authentication required.', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Analytics", charset="UTF-8"',
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }
  return new Response(PAGE, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'no-store',
    },
  });
}
