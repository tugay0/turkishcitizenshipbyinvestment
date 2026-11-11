/**
 * Request logging for turkishcitizenshipbyinvestment.org.
 *
 * Runs on every request as a Pages Function, writes one row to D1, and gets
 * out of the way. Three rules govern it:
 *
 * 1. It must never break the page. Every write is wrapped and awaited through
 *    waitUntil, so a D1 outage, a schema drift or a quota error costs a log
 *    line and nothing else. A reference site that 500s because its analytics
 *    failed would be a poor advertisement for the care it claims to take.
 *
 * 2. It records nothing that identifies a reader. No IP, no cookie, no
 *    session, no fingerprint, no User-Agent for ordinary readers. Country and
 *    datacentre come from Cloudflare's edge and are coarse by construction.
 *    The site asks the firms it writes about to disclose what they collect;
 *    collecting more than is needed here would be hard to defend.
 *
 * 3. The question it exists to answer is about crawlers, not people. On the
 *    sibling site a host-level module answered Bingbot with 406 on 226 of 248
 *    requests for months and nobody noticed, because nobody was watching
 *    crawler behaviour over time. That is the failure this is built to catch.
 */

/**
 * Known crawlers, matched against the User-Agent in order.
 *
 * Ordering matters: ChatGPT-User and Claude-User are the "a human asked the
 * assistant to fetch this" agents and must be tested before the broader
 * GPTBot and ClaudeBot patterns, or they get swallowed. Likewise Googlebot
 * must come after the more specific Google agents.
 */
const CRAWLERS = [
  [/Google-CloudVertexBot/i, 'Google-CloudVertexBot'],
  [/Google-Extended/i, 'Google-Extended'],
  [/Googlebot-Image/i, 'Googlebot-Image'],
  [/Googlebot/i, 'Googlebot'],
  [/AdsBot-Google/i, 'AdsBot-Google'],
  [/OAI-SearchBot/i, 'OAI-SearchBot'],
  [/ChatGPT-User/i, 'ChatGPT-User'],
  [/GPTBot/i, 'GPTBot'],
  [/Claude-SearchBot/i, 'Claude-SearchBot'],
  [/Claude-User/i, 'Claude-User'],
  [/ClaudeBot/i, 'ClaudeBot'],
  [/anthropic-ai/i, 'anthropic-ai'],
  [/Perplexity-User/i, 'Perplexity-User'],
  [/PerplexityBot/i, 'PerplexityBot'],
  [/bingbot/i, 'Bingbot'],
  [/BingPreview/i, 'BingPreview'],
  [/YandexBot/i, 'YandexBot'],
  [/Baiduspider/i, 'Baiduspider'],
  [/PetalBot/i, 'PetalBot'],
  [/Bytespider/i, 'Bytespider'],
  [/Applebot-Extended/i, 'Applebot-Extended'],
  [/Applebot/i, 'Applebot'],
  [/DuckDuckBot/i, 'DuckDuckBot'],
  [/Amazonbot/i, 'Amazonbot'],
  [/meta-externalagent/i, 'meta-externalagent'],
  [/facebookexternalhit/i, 'facebookexternalhit'],
  [/MistralAI-User/i, 'MistralAI-User'],
  [/cohere-ai/i, 'cohere-ai'],
  [/DeepSeek/i, 'DeepSeekBot'],
  [/YouBot/i, 'YouBot'],
  [/CCBot/i, 'CCBot'],
  [/ia_archiver|archive\.org_bot/i, 'ia_archiver'],
  [/SemrushBot/i, 'SemrushBot'],
  [/AhrefsBot/i, 'AhrefsBot'],
  [/MJ12bot/i, 'MJ12bot'],
  [/DotBot/i, 'DotBot'],
  [/Seznam/i, 'SeznamBot'],
  [/Yeti/i, 'Yeti'],
  [/Twitterbot/i, 'Twitterbot'],
  [/LinkedInBot/i, 'LinkedInBot'],
  [/Slackbot/i, 'Slackbot'],
  [/WhatsApp/i, 'WhatsApp'],
  [/TelegramBot/i, 'TelegramBot'],
  [/Discordbot/i, 'Discordbot'],
  // Catch-alls last, so a named crawler is never reported as "other".
  [/\bbot\b|crawler|spider|crawling/i, 'other bot'],
];

/** Browser family only. No version, no platform, nothing stackable. */
const CLIENTS = [
  [/Edg\//i, 'Edge'],
  [/OPR\/|Opera/i, 'Opera'],
  [/SamsungBrowser/i, 'Samsung Internet'],
  [/Firefox\//i, 'Firefox'],
  [/Chrome\//i, 'Chrome'],
  [/Safari\//i, 'Safari'],
];

function classify(ua) {
  if (!ua) return { kind: 'bot', bot: 'no user agent', client: null };
  for (const [re, name] of CRAWLERS) {
    if (re.test(ua)) return { kind: 'bot', bot: name, client: null };
  }
  for (const [re, name] of CLIENTS) {
    if (re.test(ua)) return { kind: 'reader', bot: null, client: name };
  }
  return { kind: 'reader', bot: null, client: 'other' };
}

/** Referrer host only. The full URL can carry a query a reader typed. */
function refererHost(value) {
  if (!value) return null;
  try {
    return new URL(value).host || null;
  } catch {
    return null;
  }
}

export async function onRequest(context) {
  const { request, next, env, waitUntil } = context;

  const response = await next();

  // Never let logging delay or break the response.
  if (!env.DB) return response;

  try {
    const url = new URL(request.url);
    const path = url.pathname;

    // Assets would swamp the table and answer no question we are asking.
    if (/^\/(_astro|fonts|images|favicon|apple-touch)/.test(path)) return response;
    if (request.method !== 'GET' && request.method !== 'HEAD') return response;

    const ua = request.headers.get('user-agent') || '';
    const { kind, bot, client } = classify(ua);
    const cf = request.cf || {};
    const now = Math.floor(Date.now() / 1000);
    const day = new Date(now * 1000).toISOString().slice(0, 10);

    const statements = [
      env.DB.prepare(
        `INSERT INTO hits (ts, day, path, status, kind, bot, client, country, colo, referer, ua)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        now,
        day,
        path.slice(0, 300),
        response.status,
        kind,
        bot,
        client,
        cf.country || null,
        cf.colo || null,
        refererHost(request.headers.get('referer')),
        // The agent string is kept for crawlers, where it is the evidence,
        // and discarded for readers, where it is a fingerprint.
        bot ? ua.slice(0, 300) : null,
      ),
    ];

    if (bot) {
      statements.push(
        env.DB.prepare(
          `INSERT INTO crawler_seen (bot, first_ts, last_ts, hits, last_path, last_status)
           VALUES (?1, ?2, ?2, 1, ?3, ?4)
           ON CONFLICT(bot) DO UPDATE SET
             last_ts = ?2,
             hits = hits + 1,
             last_path = ?3,
             last_status = ?4`,
        ).bind(bot, now, path.slice(0, 300), response.status),
      );
    }

    waitUntil(
      env.DB.batch(statements).catch(() => {
        /* A lost log line is an acceptable loss. A failed page is not. */
      }),
    );
  } catch {
    /* Same reasoning: analytics must never be load-bearing. */
  }

  return response;
}
