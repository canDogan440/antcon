/**
 * ============================================================
 *  ANTCON - MERKEZI SITE AYARLARI
 * ------------------------------------------------------------
 *  Degerlerin neredeyse tamami yonetim panelinden (/admin)
 *  duzenlenen icerik dosyalarindan gelir:
 *
 *    src/content/ayarlar/site.json          -> site adi, logo, iletisim, menu
 *    src/content/ayarlar/bilet-satisi.json  -> bilet satisi acik/kapali
 *    src/content/etkinlikler/<aktifYil>.md  -> tarih, mekan (siradaki etkinlik)
 *
 *  Bu dosya o verileri butun sitenin kullandigi sabitlere cevirir.
 *  Burada kalan tek elle yonetilen degerler teknik olanlardir
 *  (alan adi, form anahtari).
 * ============================================================
 */
import { getCollection } from 'astro:content';
import { tekKayit } from '@lib/tekil';
import { doldur, type YerTutucular } from '@lib/metin';

/** Sitenin canli adresi. Alan adi degisirse astro.config.mjs icindeki SITE_URL'i de guncelleyin. */
export const SITE_URL = 'https://antconvention.com';

/** Web3Forms public access key. https://web3forms.com adresinden ucretsiz alinir. */
export const WEB3FORMS_KEY = '57053f2f-574f-4c69-a207-a5c60fd1274c';

const site = (await tekKayit('siteAyarlari')).data;
const bilet = (await tekKayit('biletSatisi')).data;

/** Sitede one cikarilan (siradaki) etkinlik yili. */
export const AKTIF_YIL = site.aktifYil;

/** En son gerceklesmis etkinligin yili. Ana sayfadaki geriye donuk ozet bunu kullanir. */
export const SON_ETKINLIK_YILI = site.sonEtkinlikYili;

/* ------------------------------------------------------------
 *  SIRADAKI ETKINLIK
 * ------------------------------------------------------------
 *  "Etkinlik Yillari" koleksiyonundaki aktif yil kaydindan uretilir.
 *  Baslangic tarihi girildigi an geri sayim, Schema.org Event verisi
 *  ve tarih rozetleri otomatik olarak acilir.
 * ------------------------------------------------------------ */
const [aktifEtkinlik] = await getCollection(
  'etkinlikler',
  ({ data }) => data.yil === AKTIF_YIL && !data.taslak,
);
if (!aktifEtkinlik) {
  throw new Error(
    `Site Ayarlari'nda siradaki etkinlik yili ${AKTIF_YIL} olarak secili, ancak "Etkinlik Yillari" ` +
      `bolumunde yayinda olan bir AntCon ${AKTIF_YIL} kaydi yok. Once o yilin kaydini olusturun.`,
  );
}
const etkinlik = aktifEtkinlik.data;

/** Google Haritalar adresleri mekan bilgisinden otomatik uretilir. */
const haritaSorgusu = encodeURIComponent(
  [etkinlik.mekan.ad, etkinlik.mekan.adres, etkinlik.mekan.ilce, etkinlik.mekan.sehir]
    .filter(Boolean)
    .join(', '),
);

export const ETKINLIK = {
  yil: AKTIF_YIL,
  ad: `AntCon ${AKTIF_YIL}`,
  /** ISO 8601. Bossa tarih henuz aciklanmamistir; geri sayim gosterilmez. */
  baslangic: etkinlik.baslangic?.toISOString() ?? '',
  bitis: etkinlik.bitis?.toISOString() ?? '',
  tarihMetni: etkinlik.tarihMetni,
  gunMetni: etkinlik.gunMetni,
  saatMetni: etkinlik.saatMetni,
  mekan: {
    ...etkinlik.mekan,
    haritaEmbed: `https://www.google.com/maps?q=${haritaSorgusu}&output=embed`,
    haritaLink: `https://www.google.com/maps/search/?api=1&query=${haritaSorgusu}`,
  },
};

/** Tarih aciklandi mi? Geri sayim ve Event semasi bu kontrole bagli. */
export const TARIH_BELLI = ETKINLIK.baslangic !== '';

/** Tum iletisim tek bir adres uzerinden yurur. Telefon bossa sitede hic gorunmez. */
export const ILETISIM = {
  email: site.iletisim.email,
  telefon: site.iletisim.telefon,
  telefonHref: site.iletisim.telefon.replace(/[^\d+]/g, ''),
};

/** Panel metinlerindeki {aktifYil} gibi yer tutucularin degerleri (src/lib/metin.ts). */
export const YER_TUTUCULAR: YerTutucular = {
  aktifYil: String(AKTIF_YIL),
  sonYil: String(SON_ETKINLIK_YILI),
  tarih: ETKINLIK.tarihMetni,
  email: ILETISIM.email,
};

export const SITE = {
  ad: site.ad,
  tamAd: site.tamAd,
  slogan: site.slogan,
  aciklama: doldur(site.aciklama, YER_TUTUCULAR),
  dil: 'tr',
  locale: 'tr_TR',
  twitterHandle: site.xKullaniciAdi,
};

/* ------------------------------------------------------------
 *  BILET SATISI
 * ------------------------------------------------------------
 *  Paneldeki "Bilet Satışı Açık mı?" anahtari. Acildiginda navbar,
 *  footer, hero ve yapiskan buton "Bilet Al"a doner; biletler sayfasi
 *  fiyat tablosunu (veya satis linkini) gosterir.
 * ------------------------------------------------------------ */
export const BILET_SATISI = {
  acik: bilet.satisAcik,
  /** Dis bilet saglayicisinin adresi; bossa /biletler sayfasi kullanilir. */
  hariciUrl: bilet.satisUrl,
  /** Satis durumuna uygun bilgi metni */
  bilgiMetni: doldur(bilet.satisAcik ? bilet.acikMetni : bilet.kapaliMetni, YER_TUTUCULAR),
  fiyatNotu: doldur(bilet.fiyatNotu, YER_TUTUCULAR),
  /** Hakkinda sayfasindaki durum kutusunda gorunen kisa ozet */
  durum: doldur(bilet.satisAcik ? bilet.acikDurum : bilet.kapaliDurum, YER_TUTUCULAR),
};

/**
 * Sitedeki ana cagri butonu. Bilet satisi kapaliyken "Haberdar Ol"a,
 * acildiginda otomatik olarak "Bilet Al"a doner.
 * Navbar, Footer, yapiskan CTA ve hero bu tek kaynagi kullanir.
 */
export const ANA_CTA = BILET_SATISI.acik
  ? {
      metin: bilet.acikButonMetni,
      href: BILET_SATISI.hariciUrl || '/biletler',
      ikon: 'bilet' as const,
    }
  : {
      metin: bilet.kapaliButonMetni,
      href: '/iletisim',
      ikon: 'posta' as const,
    };

export type SosyalBaglanti = {
  ad: string;
  url: string;
  /** src/components/Ikon.astro icindeki ikon anahtari */
  ikon: 'instagram' | 'x' | 'linkedin' | 'youtube' | 'discord' | 'tiktok';
};

const PLATFORM_ADLARI: Record<SosyalBaglanti['ikon'], string> = {
  instagram: 'Instagram',
  x: 'X',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  discord: 'Discord',
  tiktok: 'TikTok',
};

/** Footer, iletisim sayfasi ve Schema.org sameAs alani bu listeyi kullanir. */
export const SOSYAL: SosyalBaglanti[] = site.sosyal.map(({ platform, url }) => ({
  ad: PLATFORM_ADLARI[platform],
  url,
  ikon: platform,
}));

export type MenuOgesi = { ad: string; href: string };

/** Ust menu. Sira panelde belirlenir. */
export const ANA_MENU: MenuOgesi[] = site.anaMenu;

/** Footer'daki "Hızlı Linkler" sutunu. */
export const FOOTER_MENU: MenuOgesi[] = site.altMenu;

/** Footer metinleri */
export const FOOTER = doldur(site.footer, YER_TUTUCULAR);

/**
 * Ileride ingilizce versiyon eklendiginde bu diziye
 * { kod: 'en', hreflang: 'en-US', prefix: '/en' } eklemek yeterli.
 */
export const DILLER = [{ kod: 'tr', hreflang: 'tr-TR', prefix: '' }] as const;
