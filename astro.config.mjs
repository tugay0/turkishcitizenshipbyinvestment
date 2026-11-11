// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * Static output, deployed to Cloudflare Pages.
 *
 * Pages rather than shared cPanel hosting on purpose. ralegal.com.tr sits
 * behind a host-level bot-blocking module that answered Bingbot with 406 on
 * 226 of 248 requests before we found it, and which still blocks Bytespider.
 * A reference work that intends to be cited by crawlers cannot be hosted
 * somewhere that decides which crawlers are allowed.
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
