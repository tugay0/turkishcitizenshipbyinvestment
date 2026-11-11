/**
 * JSON-LD builders.
 *
 * Every page emits a graph with a stable `@id` per node, so nodes reference
 * each other instead of repeating themselves. The publisher is an
 * Organization rather than a LegalService: this site does not practise law,
 * and claiming otherwise in markup would be both wrong and a licensing
 * problem.
 */
import { SITE, absoluteUrl } from './site';

const ORG_ID = `${SITE.url}/#organization`;
const SITE_ID = `${SITE.url}/#website`;

export function organization() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.publisher,
    url: SITE.url,
    email: SITE.email,
    description:
      'An independent, non-commercial reference on Turkish citizenship by investment: the governing instruments, the procedure, the published figures and the practitioners. Nothing on the site can be bought.',
    publishingPrinciples: absoluteUrl('/method'),
  };
}

export function website() {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: SITE.url,
    name: SITE.name,
    publisher: { '@id': ORG_ID },
    inLanguage: 'en',
    license: SITE.license.url,
  };
}

export function breadcrumbs(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export interface ArticleInput {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  /** The instruments this page annotates, as plain citations. */
  about?: string[];
  /** Primary sources, as URLs. */
  citation?: string[];
}

/**
 * A page of annotation on an instrument.
 *
 * ScholarlyArticle rather than Article: it signals a work of reference with
 * citations, which is what these pages are, and it is the type that carries
 * `citation` meaningfully.
 */
export function scholarlyArticle(a: ArticleInput) {
  return {
    '@type': 'ScholarlyArticle',
    '@id': `${a.url}#article`,
    headline: a.headline,
    description: a.description,
    url: a.url,
    datePublished: a.datePublished,
    dateModified: a.dateModified ?? a.datePublished,
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': SITE_ID },
    license: SITE.license.url,
    inLanguage: 'en',
    ...(a.about?.length ? { about: a.about.map((n) => ({ '@type': 'Legislation', name: n })) } : {}),
    ...(a.citation?.length ? { citation: a.citation } : {}),
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function faqPage(items: FaqItem[], url: string) {
  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export interface DatasetInput {
  name: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  version?: string;
  citation?: string;
  accrualPeriodicity?: string;
  temporalCoverage?: string;
  keywords?: string[];
  distribution?: { url: string; encodingFormat: string }[];
}

export function dataset(d: DatasetInput) {
  return {
    '@type': 'Dataset',
    '@id': `${d.url}#dataset`,
    name: d.name,
    description: d.description,
    url: d.url,
    datePublished: d.datePublished,
    dateModified: d.dateModified ?? d.datePublished,
    license: SITE.license.url,
    creator: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    isAccessibleForFree: true,
    ...(d.version ? { version: d.version } : {}),
    ...(d.citation ? { citation: d.citation } : {}),
    ...(d.accrualPeriodicity ? { accrualPeriodicity: d.accrualPeriodicity } : {}),
    ...(d.temporalCoverage ? { temporalCoverage: d.temporalCoverage } : {}),
    ...(d.keywords?.length ? { keywords: d.keywords } : {}),
    ...(d.distribution?.length
      ? {
          distribution: d.distribution.map((x) => ({
            '@type': 'DataDownload',
            contentUrl: x.url,
            encodingFormat: x.encodingFormat,
          })),
        }
      : {}),
  };
}

/** Wraps a page's nodes into one graph with the site and publisher nodes. */
export function graph(nodes: object[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': [organization(), website(), ...nodes],
  };
}
