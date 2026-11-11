#!/usr/bin/env bash
# Ping IndexNow with every URL in the sitemap.
#
# Bing's index is what ChatGPT search reads, so for a site whose whole purpose
# is being cited by assistants this is the shortest route in: minutes rather
# than waiting to be discovered. Yandex shares the same protocol.
#
# The key is a plain hex string that must also be served as
# https://<host>/<key>.txt containing exactly the key. Cloudflare Pages serves
# it from public/, so it ships with the site and cannot drift.
set -euo pipefail
cd "$(dirname "$0")/.."
KEY=$(cat .indexnow-key)
HOST=turkishcitizenshipbyinvestment.org
URLS=$(curl -s "https://$HOST/sitemap-0.xml" | grep -oE '<loc>[^<]+' | sed 's/<loc>//')
COUNT=$(echo "$URLS" | grep -c . || true)
PAYLOAD=$(printf '%s' "$URLS" | python3 -c "
import sys,json
urls=[u.strip() for u in sys.stdin.read().splitlines() if u.strip()]
print(json.dumps({'host':'$HOST','key':'$KEY','keyLocation':'https://$HOST/$KEY.txt','urlList':urls}))")
echo "submitting $COUNT urls"
for ep in https://api.indexnow.org/indexnow https://www.bing.com/indexnow https://yandex.com/indexnow; do
  code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$ep" -H 'Content-Type: application/json' -d "$PAYLOAD")
  echo "  $code  $ep"
done
