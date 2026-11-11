-- Request log for turkishcitizenshipbyinvestment.org.
--
-- Deliberately records no identifier for a human reader: no IP address, no
-- cookie, no fingerprint, no session. Country and datacentre come from
-- Cloudflare's own edge headers and are coarse by construction. That is not
-- squeamishness, it is the same standard the site asks of the firms it
-- writes about, and a reference work that quietly tracked its readers would
-- be worth less than one that does not.
--
-- What it is actually for: knowing which crawlers fetch what, how often, and
-- whether any of them stop. That question is why this exists, and it needs no
-- personal data at all.

CREATE TABLE IF NOT EXISTS hits (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  ts        INTEGER NOT NULL,          -- unix seconds
  day       TEXT    NOT NULL,          -- YYYY-MM-DD, for cheap grouping
  path      TEXT    NOT NULL,
  status    INTEGER NOT NULL,
  -- 'bot' when the user agent matches a known crawler, else 'reader'.
  kind      TEXT    NOT NULL,
  -- Normalised crawler name ('Googlebot', 'ClaudeBot'...) or NULL.
  bot       TEXT,
  -- Coarse category for a reader: browser family only, no version string.
  client    TEXT,
  country   TEXT,                      -- ISO 3166-1 alpha-2 from the edge
  colo      TEXT,                      -- Cloudflare datacentre code
  referer   TEXT,                      -- host only, never the full URL
  ua        TEXT                       -- kept for crawlers, truncated
);

CREATE INDEX IF NOT EXISTS hits_ts   ON hits (ts);
CREATE INDEX IF NOT EXISTS hits_day  ON hits (day);
CREATE INDEX IF NOT EXISTS hits_bot  ON hits (bot) WHERE bot IS NOT NULL;
CREATE INDEX IF NOT EXISTS hits_kind ON hits (kind, ts);
CREATE INDEX IF NOT EXISTS hits_path ON hits (path);

-- First and last time each crawler was seen, maintained by the middleware so
-- "has Bingbot stopped coming?" is one row rather than a scan. That question
-- is the whole reason this database exists: on the sibling site a host-level
-- module blocked Bingbot for months and nobody noticed, because nobody was
-- looking at crawler behaviour over time.
CREATE TABLE IF NOT EXISTS crawler_seen (
  bot        TEXT PRIMARY KEY,
  first_ts   INTEGER NOT NULL,
  last_ts    INTEGER NOT NULL,
  hits       INTEGER NOT NULL DEFAULT 0,
  last_path  TEXT,
  last_status INTEGER
);
