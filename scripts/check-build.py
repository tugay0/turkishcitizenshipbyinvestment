#!/usr/bin/env python3
"""Pre-deploy checks on dist/.

These are the checks that caught real defects on ralegal.com.tr, in the order
they caught them:

  1. Inline scripts must parse as JavaScript. Astro does not compile or even
     parse a script that carries define:vars, so a stray TypeScript
     annotation ships a dead page with no build error at all.
  2. Internal links and anchors must resolve. New ids get added and linked in
     separate edits, and the link survives the id being renamed.
  3. No em dashes. A house rule, and the only reliable way to keep it is to
     fail the build.
  4. Every page needs a canonical, a title, a description and valid JSON-LD.

Run: ./scripts/check-build.py
"""
from __future__ import annotations

import html
import json
import os
import pathlib
import re
import subprocess
import sys
import tempfile

DIST = pathlib.Path(__file__).resolve().parent.parent / "dist"
failures: list[str] = []
notes: list[str] = []


def fail(msg: str) -> None:
    failures.append(msg)


def pages() -> dict[str, set[str]]:
    """Route -> set of element ids on it."""
    out: dict[str, set[str]] = {}
    for f in DIST.rglob("*.html"):
        rel = "/" + f.relative_to(DIST).as_posix()
        rel = rel[: -len("/index.html")] if rel.endswith("/index.html") else rel[: -len(".html")]
        out[rel or "/"] = set(re.findall(r'id="([^"]+)"', f.read_text(encoding="utf-8")))
    return out


def check_inline_js() -> None:
    total = 0
    for f in DIST.rglob("*.html"):
        text = f.read_text(encoding="utf-8")
        for i, m in enumerate(re.finditer(r"<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>", text, re.S)):
            code = html.unescape(m.group(1))
            stripped = code.strip()
            # Skip JSON-LD and empty blocks.
            if not stripped or stripped.startswith("{"):
                continue
            total += 1
            tf = tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8")
            tf.write(code)
            tf.close()
            try:
                r = subprocess.run(["node", "--check", tf.name], capture_output=True, text=True)
            finally:
                os.unlink(tf.name)
            if r.returncode:
                detail = (r.stderr or "").strip().splitlines()
                fail(f"inline script {i} in {f.name} does not parse: {detail[1] if len(detail) > 1 else detail}")
    notes.append(f"{total} inline scripts parse")


def check_links() -> None:
    p = pages()
    bad = set()
    for f in DIST.rglob("*.html"):
        src = "/" + f.relative_to(DIST).as_posix()
        text = f.read_text(encoding="utf-8")
        for href in set(re.findall(r'href="(/[^"]*)"', text)):
            href = html.unescape(href)
            path, _, frag = href.partition("#")
            path = path.rstrip("/") or "/"
            # Assets and files, not routes.
            if path.startswith(("/_astro", "/images", "/fonts")) or "." in path.rsplit("/", 1)[-1]:
                continue
            if path not in p:
                bad.add(f"{href} (from {src}): no such page")
            elif frag and frag not in p[path]:
                bad.add(f"{href} (from {src}): no such anchor")
    for b in sorted(bad):
        fail(f"broken link: {b}")
    notes.append(f"{len(p)} pages, {len(bad)} broken internal links")


def check_em_dashes() -> None:
    hits = 0
    for f in DIST.rglob("*.html"):
        n = f.read_text(encoding="utf-8").count("—")
        if n:
            fail(f"{n} em dash(es) in {f.name}")
            hits += n
    for f in DIST.rglob("*.txt"):
        n = f.read_text(encoding="utf-8").count("—")
        if n:
            fail(f"{n} em dash(es) in {f.name}")
            hits += n
    notes.append(f"{hits} em dashes")


def check_head_and_schema() -> None:
    bad_schema = 0
    for f in DIST.rglob("*.html"):
        text = f.read_text(encoding="utf-8")
        if '<link rel="canonical"' not in text:
            fail(f"{f.name}: no canonical")
        if not re.search(r"<title>[^<]+</title>", text):
            fail(f"{f.name}: no title")
        if not re.search(r'<meta name="description" content="[^"]+"', text):
            fail(f"{f.name}: no meta description")
        for m in re.finditer(
            r'<script type="application/ld\+json"[^>]*>(.*?)</script>', text, re.S
        ):
            try:
                d = json.loads(html.unescape(m.group(1)))
            except json.JSONDecodeError as e:
                fail(f"{f.name}: JSON-LD does not parse: {e}")
                bad_schema += 1
                continue
            if "@graph" not in d:
                fail(f"{f.name}: JSON-LD has no @graph")
            else:
                for node in d["@graph"]:
                    if "@type" not in node:
                        fail(f"{f.name}: JSON-LD node without @type")
    notes.append(f"heads and JSON-LD checked, {bad_schema} unparseable")


def check_robots_and_sitemap() -> None:
    if not (DIST / "robots.txt").exists():
        fail("no robots.txt")
    if not (DIST / "sitemap-index.xml").exists():
        fail("no sitemap-index.xml")
    if not (DIST / "llms.txt").exists():
        fail("no llms.txt")
    # Every HTML page should be in the sitemap.
    sm = " ".join(p.read_text(encoding="utf-8") for p in DIST.glob("sitemap*.xml"))
    missing = [r for r in pages() if r not in ("/404",) and r.rstrip("/") not in sm and (r if r != "/" else "org/") not in sm]
    for r in missing:
        notes.append(f"not in sitemap: {r}")


def main() -> int:
    if not DIST.exists():
        print("no dist/: run the build first")
        return 2
    check_inline_js()
    check_links()
    check_em_dashes()
    check_head_and_schema()
    check_robots_and_sitemap()

    for n in notes:
        print(f"  {n}")
    if failures:
        print(f"\n{len(failures)} problem(s):")
        for f in failures:
            print(f"  - {f}")
        return 1
    print("\nall checks pass")
    return 0


if __name__ == "__main__":
    sys.exit(main())
