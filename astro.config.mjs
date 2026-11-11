// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * Static output, deployed to Cloudflare Pages.
 *
 * Pages rather than shared cPanel hosting on purpose. The sibling site runs
 * on a host whose bot-blocking module answered Bingbot with 406 on 226 of 248
 * requests until it was found and disabled, and which still returns 403 to
 * Bytespider. That was recoverable, but only because someone went looking. A
 * reference work meant to be cited by crawlers should not be hosted somewhere
 * that decides which crawlers are allowed, and should not depend on anyone
 * noticing when that decision changes.
 *
 * trailingSlash 'never' and build.format 'file' match ralegal.com.tr, so the
 * shared tooling and the canonical logic behave identically across both.
 */
export default defineConfig({
  site: 'https://turkishcitizenshipbyinvestment.org',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    sitemap({ changefreq: 'weekly', priority: 0.7 }),
  ],
  vite: { plugins: [tailwindcss()] },
});
