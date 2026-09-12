import { SITE_URL, SITE, ILETISIM, SOSYAL } from '@config/site';

/**
 * ============================================================
 *  SCHEMA.ORG YAPILANDIRILMIS VERI
 * ------------------------------------------------------------
 *  Google'in etkinlik zengin sonuclarinda (rich results)
 *  gorunmek icin Event semasi kritik. Test etmek icin:
 *  https://search.google.com/test/rich-results
 * ============================================================
 */

const mutlakUrl = (yol: string) => new URL(yol, SITE_URL).href;

/** Organizator - hem Event hem Organization semasinda kullanilir. */
export const organizasyonSemasi = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organizasyon`,
  name: SITE.ad,
  alternateName: 'Antalya Convention',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: mutlakUrl('/icon-512.png'),
    width: 512,
    height: 512,
  },
  image: mutlakUrl('/og-image.png'),
  description: SITE.aciklama,
  email: ILETISIM.email,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Antalya',
    addressRegion: 'Antalya',
    addressCountry: 'TR',
  },
  sameAs: SOSYAL.map((s) => s.url),
};

export const websiteSemasi = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE.tamAd,
  description: SITE.aciklama,
  inLanguage: 'tr-TR',
  publisher: { '@id': `${SITE_URL}/#organizasyon` },
};

type BiletTeklifi = {
  ad: string;
  fiyat: number;
  paraBirimi: string;
  url: string;
  durum: 'satista' | 'tukendi' | 'yakinda' | 'sona-erdi';
};

const musaitlikHaritasi: Record<BiletTeklifi['durum'], string> = {
  satista: 'https://schema.org/InStock',
  tukendi: 'https://schema.org/SoldOut',
  yakinda: 'https://schema.org/PreOrder',
  'sona-erdi': 'https://schema.org/Discontinued',
};

type Konusmaci = { ad: string; unvan: string };

type EtkinlikVerisi = {
  yil: number;
  baslik: string;
  baslangic?: Date;
  bitis?: Date;
  ozet: string;
  durum: string;
  mekan: { ad: string; adres?: string; sehir: string };
};

/**
 * Bir etkinlik yili icin Schema.org Event semasi uretir.
 *
 * Google'in Event zengin sonuclari `startDate` alanini zorunlu tutar; bu yuzden
 * tarihi henuz aciklanmamis (planlama asamasindaki) etkinlikler icin `null`
 * doner. Boyle bir durumda sayfa Event semasini hic yaymaz - eksik/uydurma
 * tarihli bir sema yaymaktan iyidir.
 *
 * @param etkinlik src/content/etkinlikler/<yil>.md icerigi
 * @param biletler Bilet koleksiyonundan gelen teklifler (offers alani)
 * @param konusmacilar Sahne alan kisiler (performer alani)
 */
export function etkinlikSemasi(
  etkinlik: EtkinlikVerisi,
  biletler: BiletTeklifi[] = [],
  konusmacilar: Konusmaci[] = [],
) {
  if (!etkinlik.baslangic) return null;

  const teklifler = biletler.map((b) => ({
    '@type': 'Offer',
    name: b.ad,
    price: b.fiyat,
    priceCurrency: b.paraBirimi,
    availability: musaitlikHaritasi[b.durum],
    url: b.url.startsWith('http') ? b.url : mutlakUrl(b.url),
    category: 'primary',
  }));

  return {
    '@type': 'Event',
    '@id': `${SITE_URL}/#etkinlik-${etkinlik.yil}`,
    name: etkinlik.baslik,
    description: etkinlik.ozet,
    startDate: etkinlik.baslangic.toISOString(),
    endDate: (etkinlik.bitis ?? etkinlik.baslangic).toISOString(),
    eventStatus:
      etkinlik.durum === 'iptal'
        ? 'https://schema.org/EventCancelled'
        : 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: [mutlakUrl('/og-image.png')],
    url: mutlakUrl(`/gecmis-etkinlikler/${etkinlik.yil}`),
    inLanguage: 'tr-TR',
    location: {
      '@type': 'Place',
      name: etkinlik.mekan.ad || etkinlik.mekan.sehir,
      address: {
        '@type': 'PostalAddress',
        ...(etkinlik.mekan.adres ? { streetAddress: etkinlik.mekan.adres } : {}),
        addressLocality: etkinlik.mekan.sehir,
        addressRegion: 'Antalya',
        addressCountry: 'TR',
      },
    },
    organizer: { '@id': `${SITE_URL}/#organizasyon` },
    performer:
      konusmacilar.length > 0
        ? konusmacilar.map((k) => ({ '@type': 'Person', name: k.ad, jobTitle: k.unvan }))
        : undefined,
    offers: teklifler.length > 0 ? teklifler : undefined,
  };
}

/** Sayfa yolu izi (breadcrumb) - ic sayfalarda kullanilir. */
export function kirintiSemasi(ogeler: { ad: string; href: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ ad: 'Ana Sayfa', href: '/' }, ...ogeler].map((oge, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: oge.ad,
      item: mutlakUrl(oge.href),
    })),
  };
}

/** SSS sayfasi icin FAQPage semasi. */
export function sssSemasi(sorular: { soru: string; cevap: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: sorular.map((s) => ({
      '@type': 'Question',
      name: s.soru,
      acceptedAnswer: { '@type': 'Answer', text: s.cevap },
    })),
  };
}
