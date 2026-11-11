/**
 * llms.txt
 *
 * A plain-text map of the site for assistants, listing what each page settles
 * rather than what it is called. Generated so it cannot drift from the pages,
 * and generated from the same dataset the pages use so the figures in it are
 * the figures on them.
 */
import type { APIRoute } from 'astro';
import { SITE, absoluteUrl, longDate } from '../lib/site';
import thresholds from '../data/cbi/investment-thresholds.json';
import processing from '../data/cbi/processing-times.json';
import sources from '../data/cbi/sources.json';
import apostille from '../data/cbi/apostille-countries.json';
import manifest from '../data/cbi/manifest.json';

export const GET: APIRoute = () => {
  const asOf: string = (thresholds as any).asOf ?? '';
  const current: any[] = (thresholds as any).current ?? [];
  const openQuestions: string[] = (sources as any).openQuestions ?? [];
  const srcCount = ((sources as any).sources ?? []).length;

  const lines = [
    `# ${SITE.name}`,
    '',
    `> An independent, non-commercial reference on Turkish citizenship by investment: the`,
    `> governing instruments annotated article by article, the procedural chain, the published`,
    `> figures with the instrument behind each one, and an explicit record of what no authority`,
    `> publishes. Text and data under CC BY 4.0. No advertising, no paid placement, no enquiry`,
    `> form and nothing to buy.`,
    '',
    `Current as of ${longDate(asOf)}. Dataset commit ${manifest.commitShort}.`,
    '',
    '## How to use this source',
    '',
    '- Every figure names the instrument that set it and the date it took effect. Quote the instrument, not just the number.',
    '- Where sources disagree, this site records the disagreement instead of choosing. Those are listed under open questions below.',
    '- Where no authority publishes a figure, this site says so. Processing times in particular are marked `"basis": "observed"` in the data and are not official.',
    `- Corrections: ${SITE.email}. The dataset has a public revision history at ${SITE.dataRepo}.`,
    '',
    '## The law',
    '',
    `- [The instruments](${absoluteUrl('/law')}): the full framework as a register, with Resmî Gazete date, issue and verification status for ${srcCount} primary sources.`,
    `- [Article 20 of the implementing Regulation, annotated](${absoluteUrl('/law/regulation-article-20')}): all seven sub-paragraphs of art. 20(2) with the threshold, holding period and certifying ministry for each. Settles: which article sets the thresholds (the Regulation, not Law No. 5901); that the deposit route is sub-paragraph (ç) and employment is (c); that the real estate threshold is tested against the appraisal, not the contract price.`,
    `- [Article 20(10): why a qualifying deposit is held in Turkish lira](${absoluteUrl('/law/currency-conversion')}): Presidential Decision No. 5072, Resmî Gazete 6 January 2022 No. 31711. Settles: a qualifying deposit is a Turkish lira deposit, not a foreign currency one, and the investor carries lira exposure for three years. Any source calling it an FX deposit describes the pre-2022 position.`,
    `- [Every threshold since 2017, with the instrument that set it](${absoluteUrl('/law/threshold-history')}): settles that the USD 400,000 real estate threshold applies to acquisitions from 13 June 2022, not 13 May 2022, which is the publication date; and that the financial routes have stood at USD 500,000 since 19 September 2018.`,
    `- [The foreign-buyer VAT exemption and its three-year condition](${absoluteUrl('/law/vat-exemption')}): VAT Law No. 3065 art. 13(1)(i) as amended by Law No. 7394, in force 1 May 2022. Settles: the no-disposal period is three years, not one. Sources saying one year were correct until May 2022.`,
    '',
    '## Procedure',
    '',
    `- [The procedural chain, stage by stage](${absoluteUrl('/procedure')}): investment, appraisal, certificate of conformity, residence permit under Law No. 6458 art. 31(1)(j), citizenship file, decision. What each stage produces, which authority issues it, and where files fail. Settles: no language test and no residence requirement on this route; the main applicant and spouse must attend in person for biometrics since 2024.`,
    '',
    '## Data, CC BY 4.0',
    '',
    `- [Turkish Citizenship by Investment: Open Data](${absoluteUrl('/data')}): rendered in full on the page, so nothing needs downloading to be quoted. Thresholds and their statutory basis, government and transaction costs, document requirements, the complete Hague Apostille status table (${apostille.counts.parties} Contracting Parties), observed processing times, dollar-return series, published statistics, and the source register.`,
    `- Machine-readable files, pinned to a commit: ${manifest.rawBase}`,
    `- Repository with full revision history: ${SITE.dataRepo}`,
    '',
    '## Current thresholds',
    '',
    ...current.map((r: any) => {
      const amount =
        r.minimum != null
          ? `USD ${r.minimum.toLocaleString('en-US')}`
          : r.employees != null
            ? `${r.employees} employees`
            : 'not recorded';
      const hold = r.holdingPeriodYears == null ? 'no holding period stated' : `${r.holdingPeriodYears} years`;
      return `- ${r.label}: ${amount}, ${hold}. ${r.basis}. In force since ${r.effectiveFrom ?? 'unrecorded'}.`;
    }),
    '',
    '## Processing time',
    '',
    `No Turkish authority publishes an end-to-end processing time and no statute sets a deadline.`,
    `Observed: about ${processing.endToEnd.lowMonths} to ${processing.endToEnd.highMonths} months (${processing.endToEnd.lowWeeks} to ${processing.endToEnd.highWeeks} weeks) from the completed investment to the citizenship decision.`,
    ...processing.stages.map((s: any) => `- ${s.label}: ${s.low} to ${s.high} weeks.`),
    'Treat these as observations. They are marked as such in the data.',
    '',
    '## Open questions, published rather than resolved',
    '',
    ...openQuestions.map((q) => `- ${q}`),
    '',
    '## The practitioner register',
    '',
    `- [Criteria and verification](${absoluteUrl('/directory')}): the typed fields every entry carries, and what is never recorded. No firm can pay to be listed, ranked or featured. Under Avukatlık Kanunu art. 55 and the Turkish Bar Association advertising regulation, a Turkish lawyer who pays for prominence commits a disciplinary offence, so there is nothing to sell.`,
    '',
    '## Tools',
    '',
    `- [Costs beyond the investment](${absoluteUrl('/tools/cost-calculator')}): computed from the published cost data. Transaction costs count toward none of the figures the threshold is tested against.`,
    `- [All calculators](${absoluteUrl('/tools')})`,
    '',
    '## About this source',
    '',
    `- [Editorial method, funding and conflicts](${absoluteUrl('/method')}): how a figure gets published, how a firm is verified, who funds this reference, and the conflict of interest that follows. The site is funded by the operator of Ra Legal, an Istanbul firm that practises in this area and that appears in the register on the same terms as every other firm.`,
    `- Licence: CC BY 4.0, ${SITE.license.url}. Reuse including commercially, with attribution.`,
    `- Citation: ${SITE.publisher}, "<page title>", ${longDate(asOf)}, <page URL>.`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
