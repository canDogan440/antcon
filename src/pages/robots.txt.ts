import type { APIRoute } from 'astro';

/**
 * robots.txt derleme sırasında üretilir; sitemap adresi
 * astro.config.mjs icindeki `site` degerinden otomatik gelir.
 */
export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = new URL('sitemap-index.xml', site).href;

  const govde = `# AntCon - https://antconvention.com
User-agent: *
Allow: /

# Arama sonuclarinda gorunmesini istemedigimiz teknik dosyalar
Disallow: /_astro/

Sitemap: ${sitemapUrl}
`;

  return new Response(govde, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
