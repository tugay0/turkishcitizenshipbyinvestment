# turkishcitizenshipbyinvestment.org

An independent reference on Turkish citizenship by investment: the governing
instruments annotated article by article, the procedural chain, the published
figures with the instrument behind each one, and an explicit record of what no
authority publishes.

Text and data under CC BY 4.0. No advertising, no paid placement, no enquiry
form and nothing to buy.

## Why it exists

Most published material on this programme is written to sell a service. The
observable consequences: thresholds quoted without the decision that set them,
processing times presented as commitments, a VAT condition that was lengthened
in 2022 and is still widely published at its old length, and a deposit route
still described as a way to hold foreign currency four years after Article
20(10) stopped that being true.

A reference work is a different product. Every figure here names its instrument
and its date; where sources disagree the disagreement is published; where no
authority publishes a number, that is said rather than filled in.

## Editorial position on paid listings

Nothing on this site can be bought, and that is a legal constraint as much as an
editorial one. Under Avukatlık Kanunu art. 55 and the Turkish Bar Association's
advertising regulation, a Turkish lawyer who pays for prominence commits a
disciplinary offence, and the regulation puts a positive duty on the lawyer to
prevent third parties advertising on their behalf. A directory selling placement
would be selling its listed firms a problem.

Funding and the resulting conflict of interest are set out in full at `/method`.

## Stack

- Astro 7, static output, Tailwind v4
- Deployed to Cloudflare Pages (project `tcbi-reference`), rather than shared
  hosting whose bot module can silently decide which crawlers are served
- Data vendored from [Ralegal/turkish-cbi-data](https://github.com/Ralegal/turkish-cbi-data)
  by `scripts/sync-open-data.sh`, with the commit recorded in `manifest.json`

Pages read the vendored dataset at build time rather than carrying their own
copies of the figures. That is deliberate: three separately maintained copies of
a number are three chances to be wrong, and the drift is invisible until a
reader catches it.

## Commands

```sh
npm install
npm run dev                  # local
npm run sync:data            # re-vendor the dataset, recording the commit
npm run build
npm run check                # pre-deploy checks: see below
```

### `npm run check`

Runs `scripts/check-build.py` against `dist/`. It enforces four things that
each caught a real defect on the sibling site:

1. **Inline scripts must parse as JavaScript.** Astro does not compile or even
   parse a `<script>` carrying `define:vars`, so a stray TypeScript annotation
   ships a dead page with no build error at all.
2. **Internal links and anchors must resolve.** Ids and the links to them get
   added in separate edits, and the link outlives the rename.
3. **No em dashes**, enforced rather than remembered.
4. **Every page has a canonical, a title, a description and parseable JSON-LD.**

## Licence

Text and data CC BY 4.0. Reuse it, including commercially, with attribution.
