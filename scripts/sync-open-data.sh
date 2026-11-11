#!/usr/bin/env bash
# Vendor the published open-data files into this site, with provenance.
#
# /data/turkish-cbi-open-data renders from these files rather than describing
# them from memory, so the page, the GitHub repository and the MCP connector
# cannot drift apart. The commit sha is recorded alongside, because a citation
# that does not name a version is not a citation.
#
# Usage: ./scripts/sync-open-data.sh [path-to-turkish-cbi-data]
set -euo pipefail
cd "$(dirname "$0")/.."

SRC="${1:-$HOME/dev/turkish-cbi-data}"
DEST="src/data/cbi"

if [ ! -d "$SRC/.git" ]; then
  echo "no data repo at $SRC"
  echo "clone it: git clone https://github.com/Ralegal/turkish-cbi-data.git $SRC"
  exit 1
fi

git -C "$SRC" fetch -q origin || true
BEHIND=$(git -C "$SRC" rev-list --count HEAD..origin/main 2>/dev/null || echo 0)
if [ "$BEHIND" != "0" ]; then
  echo "note: $SRC is $BEHIND commits behind origin/main; pulling"
  git -C "$SRC" pull -q --ff-only origin main
fi

SHA=$(git -C "$SRC" rev-parse HEAD)
SHORT=${SHA:0:7}
COMMIT_DATE=$(git -C "$SRC" log -1 --format=%cI)

mkdir -p "$DEST"
cp "$SRC"/data/*.json "$SRC"/data/*.csv "$DEST"/

cat > "$DEST/manifest.json" <<EOF
{
  "source": "https://github.com/Ralegal/turkish-cbi-data",
  "commit": "$SHA",
  "commitShort": "$SHORT",
  "commitDate": "$COMMIT_DATE",
  "syncedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "rawBase": "https://raw.githubusercontent.com/Ralegal/turkish-cbi-data/$SHA/data",
  "latestBase": "https://raw.githubusercontent.com/Ralegal/turkish-cbi-data/main/data",
  "commitUrl": "https://github.com/Ralegal/turkish-cbi-data/commit/$SHA"
}
EOF

echo "synced at $SHORT ($COMMIT_DATE)"
ls -1 "$DEST" | sed 's/^/  /'
