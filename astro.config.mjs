// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Site adresi tek bir yerden yonetilir. Alan adi degisirse sadece burayi
// ve src/config/site.ts icindeki SITE_URL degerini guncelleyin.
const SITE_URL = 'https://antconvention.com';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'ignore',
  build: {
    // Her sayfa /hakkinda/index.html olarak uretilir -> Cloudflare Pages ve
    // Netlify'da temiz URL'ler otomatik calisir.
    format: 'directory',
    inlineStylesheets: 'auto',
  },

  // ILERIDE INGILIZCE EKLENECEGINDE:
  // locales: ['tr', 'en'] yapip prefixDefaultLocale: false birakmak yeterli.
  // Sayfalari src/pages/en/ altina koyun; hreflang etiketleri BaseLayout
  // icinde bu ayardan otomatik uretilir.
  i18n: {
    defaultLocale: 'tr',
    locales: ['tr'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => !page.includes('/404'),
    }),
  ],

  // NOT: `image.layout` bilerek ayarlanmadi. Kaynak fotograflar 5000-6200px
  // genisliginde oldugu icin Astro'nun otomatik responsive modu srcset'e
  // orijinal cozunurluklu (birkac MB'lik) bir varyant da ekliyor. Bunun yerine
  // her <Image /> bileseninde `widths` + `sizes` degerlerini acikca veriyoruz.

  vite: {
    plugins: [tailwindcss()],
    build: {
      assetsInlineLimit: 2048,
    },
  },
});
