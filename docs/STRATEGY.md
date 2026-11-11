# turkishcitizenshipbyinvestment.org: what to build, and what not to sell

Date: 11 November 2026
Domain: registered 11 November 2026 10:13 UTC, Cloudflare Registrar, same account as
ambientapp.ai, no A record yet.

## The headline

Build the catalogue. Do not charge Turkish lawyers to be in it.

Charging a Turkish lawyer a monthly fee for a listing, and above all for
prominence inside it, makes that lawyer the one breaking the rules. The
Çanakkale Bar Association's own published notice lists, as violations of
Avukatlık Kanunu m. 55 and the TBB Reklam Yasağı Yönetmeliği: placing internet
advertisements so that the firm's details appear when certain terms are
searched, making payments to appear first or at the top, obtaining top ranking
in return for payment, and increasing visibility through sponsored or paid
placement. That is a description of a paid directory listing.

Two further points make it worse rather than better:

- The Yönetmelik puts a positive duty on the lawyer to **prevent** third
  parties from advertising on their behalf. So a lawyer who pays us, or who
  solicits reviews on our site, cannot defend themselves by saying the site is
  ours and not theirs. The duty runs the other way.
- Ra Legal would be listed on it. A site Tugay owns, charging for prominence,
  with Rüzgar's firm in it, is the cleanest possible disciplinary fact pattern
  against her. She has the licence. We do not.

TBB disciplinary practice already applies m. 55 together with Yönetmelik arts.
5, 6, 9, 10 and 12, and has held that publishing a client list is advertising
to obtain work. A ranked, reviewed, paid directory is a client list with a
price on it.

Turkish accountants are not a workaround: TÜRMOB has its own advertising
restrictions, so the same logic applies to the "accountants" half of the idea
in Türkiye.

This is not a reason to drop the project. It is a reason to put the price
somewhere else, and the somewhere else is better business anyway.

## What the paid-listing model is actually worth

For calibration, from published US pricing:

| Who | What they charge |
| --- | --- |
| Justia | free basic profile; Connect Pro USD 19.99/mo; placement products unpriced |
| Martindale-Avvo ProVantage | from USD 399/mo for the first user |
| FindLaw premium | USD 300 to 3,000+/mo |
| Small niche directories | USD 5 to 30/mo basic, USD 99 to 199/mo firm tiers |

Pay-per-lead sits alongside it: roughly USD 62 median cost per lead on Avvo,
USD 41 on Justia, converting to a matter 9 to 18 per cent of the time.

So the honest ceiling on the listing-fee idea in our niche is small. There are
maybe 30 to 60 firms worldwide seriously doing Turkish CBI. At USD 100 a month
and a generous 30 per cent conversion, that is around USD 1,500 a month, for
which we would have taken on a disciplinary problem for our only real client
and a conflict with the firm the whole thing is meant to feed. The arithmetic
does not justify the risk even before the rules do.

## The model that works

Four revenue surfaces, none of which requires a Turkish lawyer to pay for
prominence.

**1. Listing is free, unpaid and not purchasable, and we say so loudly.**
"No firm can pay to be listed, ranked higher, or featured. There is nothing to
buy." That sentence is the product. It is what makes the index citable by an
assistant, it is what a reader trusts, and it is the only version a Turkish
lawyer can appear in without exposure. It also happens to be a moat: every
competitor directory is pay-to-play, so none of them can copy it without
killing their own revenue.

**2. Charge the people the rules do not bind.** The CBI buyer journey is full of
unregulated or differently-regulated businesses who want in front of the same
reader: property developers and agencies, SPK-licensed appraisers, FX and
payment providers, relocation and school-placement services, banks, fund
managers, and law firms *outside* Türkiye in the client's home jurisdiction
(England and Wales, for one, permits paid directory listings). Sponsorship from
a developer is an ordinary advertisement. Sponsorship from a Turkish lawyer is
a disciplinary file.

**3. Sell the tooling and the data, not the attention.** This is the piece we
already have and nobody else does. Ra Legal's five calculators, the open
dataset, the embeddable widgets and the MCP connector are a working product.
Licence the white-label versions to the businesses in point 2, and sell API
access to the dataset. A relocation firm paying for a branded cost calculator
on its own site is buying software. A lawyer paying for a widget is buying
software too, which is a materially different thing from buying placement, but
check that with counsel before selling a Turkish firm anything at all.

**4. The real return is Ra Legal's lead flow, and it is not a line item.** If
the index is the page an assistant cites when asked who does this work
credibly, and Ra Legal is in it on merit, that is worth more than the listing
fees ever were. Keep that relationship at arm's length and documented: Ra Legal
pays nothing, gets no preferential placement, and is scored by the same
published method as everyone else. Write that down before launch, not after
someone asks.

## Reviews: handle with care

"Real customer feedback for every lawyer listed" is the right instinct and the
most dangerous feature on the list.

A third party publishing reviews is not the lawyer advertising. But the moment
a listed Turkish firm solicits a review, or we invite them to, that firm is
arranging third-party promotion of itself, which is the duty the Yönetmelik
puts on them to prevent. Google Maps reviews sit in the same grey zone and bars
tolerate them in practice, but have disciplined on them.

The version that survives:

- We solicit reviews from clients. The firm never does, and is never told who
  reviewed them or asked to help.
- No star ratings on Turkish firms. Structured factual questions instead:
  was the fee agreed in writing before work started, was the engagement letter
  in a language you read, did the timeline match what you were told, who
  actually handled your file.
- Publish the answers, not a score. A firm that agrees fees in writing looks
  good without us awarding it four stars.
- Never emit `AggregateRating` schema on a Turkish firm. That is the markup
  that turns a review into an advertisement in Google's own eyes, and it is the
  thing a disciplinary board would point at.
- Right of reply, published unedited, next to the review.

That structure is also just better: "fee agreed in writing: yes" is more useful
to a buyer about to wire USD 400,000 than a five-star average built from twelve
reviews a firm asked its friends for.

## What to build, in order

The 2026 search environment punishes directories specifically. Google's scaled
content abuse policy is being enforced against exactly this shape of site:
pages that exist to catch a city-plus-category query without serving a distinct
need. The defence is the data model.

**Decide the schema before entering a single firm.** Retrofitting a schema
across a hundred listings does not happen. Every firm gets the same typed
fields, every field filled, or the firm does not go live. Forty complete
entries in one category launches. Four hundred thin ones is a liability.

Fields that make a listing a comparison surface rather than a link:

- Bar and registration: which bar, registered since, firm legal form
- Verification: how we confirmed it, when, with what document
- Routes actually handled, with files closed per route
- Languages the engagement letter is available in, not languages "spoken"
- Fee structure: fixed, hourly, staged; whether agreed in writing before work
- Whether the firm takes a commission from developers (the single most useful
  disclosure in this market and the one nobody publishes)
- Offices, and whether an in-person appointment is required
- Regulatory history, where public
- Who at the firm holds the file

**Page types, launch set:**

1. The index itself: every firm, filterable on the typed fields
2. One page per firm, generated from the schema
3. A handful of real category pages where we have depth (by route, by language,
   by nationality served), not every combination
4. The method page: how a firm gets listed, how it is verified, what cannot be
   bought. This is the page that gets cited.
5. The tools, ported from Ra Legal
6. The data: the open dataset, as its own citable surface

**Do not build:** a page per city when we have firms in three cities, a page
per facet combination, firm-versus-firm comparison pages with nothing real to
compare.

**Schema markup:** `ItemList` with embedded `LegalService` items on index and
category pages, `LegalService` plus `BreadcrumbList` on firm pages, `Dataset`
on the data pages, `WebSite` with `SearchAction`. `Review` where we have them
and the firm is outside Türkiye. No `AggregateRating` on a Turkish firm, per
above.

## The AEO playbook to port from Ra Legal

Everything that worked there transfers, and the inventory of it is worth
writing down properly as its own document. In short:

- An open, machine-readable dataset under CC BY 4.0, with a source register
  naming the statute or publication behind every figure and the date. This is
  what gets quoted.
- Stating what is not known rather than filling it. The "what no authority
  publishes" section is the part that gets quoted back at us most often.
- `llms.txt`, and an MCP connector so an assistant can run the tools directly.
- One figure, one place. Every number computed from the dataset at build time,
  so the page, the connector and the data cannot drift apart.
- Per-answer anchors, so a citation lands on the sentence rather than the page.
- Dated editions with a citation line, so a citation does not rot.
- Primary-source links rather than summaries of summaries.

The directory's version of the dataset is the index itself: a CC BY 4.0,
machine-readable register of who does this work, how they are verified, and
what they disclose. That is a thing no assistant can currently answer well, and
it is answerable from structured data.

## Open questions for counsel

Not blocking the build, blocking the invoicing.

1. Can a Turkish firm appear in a free, unpaid, non-purchasable index without
   breaching m. 55, given it cannot prevent a third party from listing it?
2. Can a Turkish firm buy software from us (a white-label calculator) without
   that being work-getting expenditure?
3. Does our soliciting reviews of a Turkish firm, without that firm's
   involvement or knowledge, engage the firm's duty to prevent third-party
   advertising?
4. Does Rüzgar's firm appearing in an index owned by her client's CEO create a
   conflict requiring disclosure, and to whom?

Question 1 is the one that matters. If the answer is no, the index covers
non-Turkish advisers and Turkish firms appear as factual public-record entries
with no promotional framing at all, which is still a product.
