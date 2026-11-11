/**
 * Site identity.
 *
 * This is a reference work, not a firm. It carries no telephone number, no
 * enquiry form and nothing to buy, and that is a deliberate editorial
 * position rather than an omission: the moment a page here solicits
 * instructions it stops being a source a practitioner can cite and starts
 * competing with the firms it describes.
 */
export const SITE = {
  url: 'https://turkishcitizenshipbyinvestment.org',
  name: 'The Turkish Citizenship by Investment Reference',
  shortName: 'TCBI Reference',
  /** Used in the organisation node and in citations. */
  publisher: 'The Turkish Citizenship by Investment Reference',
  tagline: 'An annotated reference to the law, the procedure and the practitioners',
  email: 'editor@turkishcitizenshipbyinvestment.org',
  /** Editorial independence, stated in one place and rendered everywhere. */
  independence:
    'No firm can pay to appear here, to rank higher, or to be featured. There is nothing on this site to buy.',
  license: {
    name: 'CC BY 4.0',
    url: 'https://creativecommons.org/licenses/by/4.0/',
  },
  dataRepo: 'https://github.com/Ralegal/turkish-cbi-data',
} as const;

export function absoluteUrl(path: string): string {
  return new URL(path, SITE.url).href;
}

/** 2026-11-11 to "11 November 2026". ISO belongs in data, not in prose. */
export function longDate(iso: string): string {
  if (!iso) return '';
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** USD 400,000, not $400000. */
export function usd(n: number): string {
  return `USD ${n.toLocaleString('en-US')}`;
}
