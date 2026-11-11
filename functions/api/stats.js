/**
 * The dashboard's data endpoint.
 *
 * One request returns everything the page draws, because a dashboard that
 * fires nine parallel queries against D1 spends its budget on round trips.
 * Protected by HTTP basic auth: the numbers are not secret, but an open
 * endpoint on a published domain gets scraped and then it is someone else's
 * dataset.
 */

const DAY = 86400;

function unauthorised() {
  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Analytics", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

/**
 * Constant-time-ish comparison. Not a defence against a determined attacker
 * on a Worker, but it costs nothing and avoids the most naive timing leak.
 */
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export function authorised(request, env) {
  const expectedUser = env.ANALYTICS_USER;
  const expectedPass = env.ANALYTICS_PASS;
  // If no credentials are configured, refuse rather than serving openly.
  if (!expectedUser || !expectedPass) return false;

  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Basic ')) return false;
  let decoded;
  try {
    decoded = atob(header.slice(6));
  } catch {
    return false;
  }
  const i = decoded.indexOf(':');
  if (i < 0) return false;
  return (
    safeEqual(decoded.slice(0, i), expectedUser) && safeEqual(decoded.slice(i + 1), expectedPass)
  );
}

export async function onRequestGet({ request, env }) {
  if (!authorised(request, env)) return unauthorised();
  if (!env.DB) {
    return Response.json({ error: 'No database bound to this deployment.' }, { status: 503 });
  }

  const url = new URL(request.url);
  const days = Math.min(365, Math.max(1, Number(url.searchParams.get('days')) || 30));
  const since = Math.floor(Date.now() / 1000) - days * DAY;

  const q = (sql, ...binds) => env.DB.prepare(sql).bind(...binds);

  const [
    totals,
    series,
    topPages,
    crawlerTotals,
    crawlerDaily,
    countries,
    clients,
    referrers,
    statuses,
    seen,
    botPaths,
  ] = await env.DB.batch([
    q(
      `SELECT
         COUNT(*)                                             AS hits,
         SUM(CASE WHEN kind = 'reader' THEN 1 ELSE 0 END)     AS reader_hits,
         SUM(CASE WHEN kind = 'bot' THEN 1 ELSE 0 END)        AS bot_hits,
         COUNT(DISTINCT CASE WHEN kind='bot' THEN bot END)    AS distinct_bots,
         COUNT(DISTINCT path)                                 AS distinct_paths,
         MIN(ts)                                              AS first_ts
       FROM hits WHERE ts >= ?`,
      since,
    ),
    q(
      `SELECT day,
              SUM(CASE WHEN kind='reader' THEN 1 ELSE 0 END) AS readers,
              SUM(CASE WHEN kind='bot' THEN 1 ELSE 0 END)    AS bots
       FROM hits WHERE ts >= ? GROUP BY day ORDER BY day`,
      since,
    ),
    q(
      `SELECT path,
              COUNT(*) AS hits,
              SUM(CASE WHEN kind='reader' THEN 1 ELSE 0 END) AS readers,
              SUM(CASE WHEN kind='bot' THEN 1 ELSE 0 END)    AS bots
       FROM hits WHERE ts >= ? GROUP BY path ORDER BY hits DESC LIMIT 40`,
      since,
    ),
    q(
      `SELECT bot,
              COUNT(*) AS hits,
              COUNT(DISTINCT path) AS paths,
              SUM(CASE WHEN status >= 400 THEN 1 ELSE 0 END) AS errors,
              MAX(ts) AS last_ts
       FROM hits WHERE ts >= ? AND bot IS NOT NULL
       GROUP BY bot ORDER BY hits DESC`,
      since,
    ),
    q(
      `SELECT day, bot, COUNT(*) AS hits
       FROM hits WHERE ts >= ? AND bot IS NOT NULL
       GROUP BY day, bot ORDER BY day`,
      since,
    ),
    q(
      `SELECT country, kind, COUNT(*) AS hits
       FROM hits WHERE ts >= ? AND country IS NOT NULL
       GROUP BY country, kind ORDER BY hits DESC LIMIT 60`,
      since,
    ),
    q(
      `SELECT client, COUNT(*) AS hits
       FROM hits WHERE ts >= ? AND kind='reader' AND client IS NOT NULL
       GROUP BY client ORDER BY hits DESC`,
      since,
    ),
    q(
      `SELECT referer, COUNT(*) AS hits
       FROM hits WHERE ts >= ? AND referer IS NOT NULL
       GROUP BY referer ORDER BY hits DESC LIMIT 25`,
      since,
    ),
    q(
      `SELECT status, COUNT(*) AS hits FROM hits WHERE ts >= ?
       GROUP BY status ORDER BY hits DESC`,
      since,
    ),
    // Not windowed: "when was this crawler last here" is only meaningful
    // against all of history, which is the question that catches a crawler
    // that has quietly stopped coming.
    q(`SELECT bot, first_ts, last_ts, hits, last_path, last_status
       FROM crawler_seen ORDER BY last_ts DESC`),
    q(
      `SELECT bot, path, COUNT(*) AS hits
       FROM hits WHERE ts >= ? AND bot IS NOT NULL
       GROUP BY bot, path ORDER BY hits DESC LIMIT 120`,
      since,
    ),
  ]);

  return Response.json(
    {
      days,
      generated: new Date().toISOString(),
      totals: totals.results[0] ?? {},
      series: series.results,
      topPages: topPages.results,
      crawlers: crawlerTotals.results,
      crawlerDaily: crawlerDaily.results,
      countries: countries.results,
      clients: clients.results,
      referrers: referrers.results,
      statuses: statuses.results,
      seen: seen.results,
      botPaths: botPaths.results,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
