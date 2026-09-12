/**
 * ============================================================
 *  ANTCON - MERKEZI SITE AYARLARI
 * ------------------------------------------------------------
 *  Yeni bir yil eklerken veya iletisim bilgisi degistirirken
 *  neredeyse her sey bu dosyadan yonetilir.
 *  Icerik (konusmaci, program, sponsor, bilet, SSS) icin
 *  src/content/ klasorune bakin.
 * ============================================================
 */

/** Sitenin canli adresi. Alan adi degisirse astro.config.mjs icindeki SITE_URL'i de guncelleyin. */
export const SITE_URL = 'https://antconvention.com';

/** Sitede one cikarilan (siradaki) etkinlik yili. */
export const AKTIF_YIL = 2027;

/** En son gerceklesmis etkinligin yili. Ana sayfadaki geriye donuk ozet bunu kullanir. */
export const SON_ETKINLIK_YILI = 2026;

/** Web3Forms public access key. https://web3forms.com adresinden ucretsiz alinir. */
export const WEB3FORMS_KEY = '57053f2f-574f-4c69-a207-a5c60fd1274c';

export const SITE = {
  ad: 'AntCon',
  tamAd: 'AntCon - Antalya Convention',
  slogan: "Antalya'nın İlk Convention'ı",
  aciklama:
    "AntCon, Antalya'nın ilk convention organizasyonu. İlk etkinlik 28 Haziran 2026'da gerçekleşti; AntCon 2027 için hazırlıklar sürüyor.",
  dil: 'tr',
  locale: 'tr_TR',
  twitterHandle: '@antconvention',
} as const;

/**
 * ------------------------------------------------------------
 *  SIRADAKI ETKINLIK
 * ------------------------------------------------------------
 *  AntCon 2027 henuz planlama asamasinda; tarih ve mekan kesinlesmedi.
 *
 *  TARIH KESINLESTIGINDE:
 *    1. baslangic / bitis alanlarina ISO 8601 tarih yazin
 *       (orn. '2027-06-27T10:00:00+03:00')
 *    2. tarihMetni ve gunMetni alanlarini doldurun
 *    3. durum: 'tarih-belli' yapin
 *  Site otomatik olarak geri sayimi, Schema.org Event verisini ve
 *  tarih rozetlerini gostermeye baslar.
 * ------------------------------------------------------------
 */
export const ETKINLIK = {
  yil: AKTIF_YIL,
  ad: `AntCon ${AKTIF_YIL}`,

  /** 'planlama' = tarih belli degil · 'tarih-belli' = tarih aciklandi */
  durum: 'planlama' as 'planlama' | 'tarih-belli',

  /** Tarih kesinlesince ISO 8601 yazin, orn. '2027-06-27T10:00:00+03:00'. Bos birakilirsa geri sayim gosterilmez. */
  baslangic: '' as string,
  bitis: '' as string,

  tarihMetni: 'Tarih yakında açıklanacak',
  gunMetni: '',
  saatMetni: '',

  mekan: {
    /** Mekan kesinlesince doldurun. Bos birakilirsa sadece sehir gosterilir. */
    ad: '',
    adres: '',
    ilce: '',
    sehir: 'Antalya',
    postaKodu: '',
    ulke: 'TR',
    enlem: 36.8969,
    boylam: 30.7133,
    /** Google Maps "Haritayi yerlestir" ciktisindaki src degeri */
    haritaEmbed: 'https://www.google.com/maps?q=Antalya&output=embed',
    haritaLink: 'https://www.google.com/maps/search/?api=1&query=Antalya',
  },
} as const;

/** Tarih aciklandi mi? Geri sayim ve Event semasi bu kontrole bagli. */
export const TARIH_BELLI = ETKINLIK.baslangic !== '';

/**
 * ------------------------------------------------------------
 *  BILET SATISI
 * ------------------------------------------------------------
 *  Satis acildiginda:
 *    1. acik: true yapin
 *    2. src/content/biletler/ altindaki dosyalarda taslak: false yapin
 *       ve yil degerini AKTIF_YIL ile eslestirin
 *  Site otomatik olarak "Bilet Al" butonlarini ve fiyat tablosunu acar.
 * ------------------------------------------------------------
 */
export const BILET_SATISI = {
  acik: false,
  /** Dis bilet saglayicisi (Biletix, Bubilet vb.) kullanilacaksa tam URL yazin. */
  hariciUrl: '',
  bilgiMetni:
    'AntCon 2027 için bilet satışı henüz başlamadı. Tarih ve bilet bilgileri netleştiğinde ilk siz haberdar olun.',
} as const;

/**
 * Sitedeki ana cagri butonu. Bilet satisi kapaliyken "Haberdar Ol"a,
 * acildiginda otomatik olarak "Bilet Al"a doner.
 * Navbar, Footer, yapiskan CTA ve hero bu tek kaynagi kullanir.
 */
export const ANA_CTA = BILET_SATISI.acik
  ? {
      metin: 'Bilet Al',
      href: BILET_SATISI.hariciUrl || '/biletler',
      ikon: 'bilet' as const,
    }
  : {
      metin: 'Haberdar Ol',
      href: '/iletisim',
      ikon: 'posta' as const,
    };

/**
 * Tum iletisim tek bir adres uzerinden yurur.
 * Ileride ayri adresler (sponsor@, basin@) acilirsa buraya ekleyip
 * ilgili sayfalarda ILETISIM.email yerine onlari kullanabilirsiniz.
 */
export const ILETISIM = {
  email: 'info@antconvention.com',
  /** Telefon hatti yok. Doldurulursa footer ve iletisim sayfasinda otomatik gorunur. */
  telefon: '',
  telefonHref: '',
} as const;

export type SosyalBaglanti = {
  ad: string;
  url: string;
  /** src/components/Ikon.astro icindeki ikon anahtari */
  ikon: 'instagram' | 'x' | 'linkedin' | 'youtube' | 'discord' | 'tiktok';
};

/**
 * Yalnizca gercekten var olan hesaplar burada listelenir.
 * Yeni bir hesap acildiginda diziye bir satir eklemek yeterli;
 * footer, iletisim sayfasi ve Schema.org sameAs alani otomatik guncellenir.
 */
export const SOSYAL: SosyalBaglanti[] = [
  { ad: 'Instagram', url: 'https://instagram.com/antconvention', ikon: 'instagram' },
];

export type MenuOgesi = { ad: string; href: string };

/** Ust menu. Sira burada belirlenir. */
export const ANA_MENU: MenuOgesi[] = [
  { ad: 'Hakkında', href: '/hakkinda' },
  { ad: 'AntCon 2026', href: '/gecmis-etkinlikler/2026' },
  { ad: 'Program', href: '/program' },
  { ad: 'Konuşmacılar', href: '/konusmacilar' },
  { ad: 'Biletler', href: '/biletler' },
  { ad: 'Sponsorlar', href: '/sponsorlar' },
  { ad: 'Galeri', href: '/galeri' },
  { ad: 'SSS', href: '/sss' },
  { ad: 'İletişim', href: '/iletisim' },
];

/** Footer'daki "Hızlı Linkler" sutunu. */
export const FOOTER_MENU: MenuOgesi[] = [
  ...ANA_MENU.filter((oge) => oge.href !== '/gecmis-etkinlikler/2026'),
  { ad: 'Geçmiş Etkinlikler', href: '/gecmis-etkinlikler' },
];

/**
 * Ileride ingilizce versiyon eklendiginde bu diziye
 * { kod: 'en', hreflang: 'en-US', prefix: '/en' } eklemek yeterli.
 */
export const DILLER = [{ kod: 'tr', hreflang: 'tr-TR', prefix: '' }] as const;
