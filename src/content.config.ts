import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * ============================================================
 *  ICERIK KOLEKSIYONLARI
 * ------------------------------------------------------------
 *  Buradaki her dosya yonetim panelinden (/admin, Decap CMS)
 *  duzenlenebilir. Panelin alan tanimlari public/admin/config.yml
 *  icinde; bir alan eklerken/silerken iki dosyayi birlikte guncelleyin.
 *
 *  - Tekrarlanan icerik (konusmaci, program, sponsor, bilet, SSS,
 *    etkinlik yili, galeri) -> her kayit ayri bir dosya.
 *  - Ayarlar ve sayfa metinleri -> her biri tek bir dosya
 *    (src/content/ayarlar/, src/content/sayfalar/).
 *
 *  Metinlerde su yer tutucular kullanilabilir (src/lib/metin.ts):
 *    {aktifYil}  {sonYil}  {tarih}  {email}
 * ============================================================
 */

/* ------------------------------------------------------------------
 * Yardimcilar
 * ------------------------------------------------------------------
 * Decap CMS bos birakilan alanlari "" veya null olarak kaydedebilir.
 * Asagidaki tipler bu durumu "alan yok" olarak yorumlar; boylece panelde
 * bir alani silmek derlemeyi bozmaz.
 */
const bosIseYok = (deger: unknown) => (deger === '' || deger === null ? undefined : deger);

const metin = z.string();
/** Bos birakilabilir metin; bossa '' doner. */
const secimliMetin = z.string().nullish().transform((deger) => deger ?? '');
/** Bos birakilabilir metin; bossa undefined doner (varsayilan deger kullanilacak yerler icin). */
const opsiyonelMetin = z.preprocess(bosIseYok, z.string().optional());
const opsiyonelUrl = z.preprocess(bosIseYok, z.string().url().optional());
/**
 * Gorsel yolu, depo kokune gore: "/src/assets/yuklemeler/foto.jpg" veya
 * "/images/galeri/2026/foto.jpg". src/lib/gorseller.ts cozumler.
 */
const opsiyonelGorsel = z.preprocess(bosIseYok, z.string().optional());
const opsiyonelTarih = z.preprocess(bosIseYok, z.coerce.date().optional());
/** null veya eksik listeyi bos dizi yapar. */
const liste = <T extends z.ZodTypeAny>(oge: T) =>
  z.preprocess((deger) => deger ?? [], z.array(oge));

/** Kartlarda kullanilabilen ikonlar (src/components/Ikon.astro). */
export const KART_IKONLARI = [
  'takvim',
  'saat',
  'konum',
  'bilet',
  'posta',
  'telefon',
  'onay',
  'yildiz',
  'kisiler',
  'mikrofon',
  'kivilcim',
  'oyun',
  'kupa',
  'kalkan',
  'kure',
] as const;
const ikon = z.enum(KART_IKONLARI);

/** Ikon + baslik + metin: sitenin bircok yerindeki kart yapisi */
const kart = z.object({ ikon, baslik: metin, metin });
const baglanti = z.object({ ad: metin, href: metin });

/** Tek dosyadan olusan koleksiyon (ayarlar ve sayfa metinleri). */
function tekDosya<S extends z.ZodTypeAny>(klasor: string, dosya: string, schema: S) {
  return defineCollection({
    loader: glob({ pattern: dosya, base: `./src/content/${klasor}` }),
    schema,
  });
}

/** Butun tekrarlanan koleksiyonlarda ortak olan alanlar */
const ortak = {
  /** Icerigin ait oldugu etkinlik yili. Arsiv ve filtreleme bunu kullanir. */
  yil: z.number().int().min(2026).max(2100),
  /** Kucukten buyuge siralanir. Bos birakilirsa 999 kabul edilir. */
  sira: z.preprocess(bosIseYok, z.number().default(999)),
  /** true ise icerik sitede gorunmez (taslak). */
  taslak: z.boolean().default(false),
};

/* ==================================================================
 *  AYARLAR
 * ================================================================== */

const siteAyarlari = tekDosya(
  'ayarlar',
  'site.json',
  z.object({
    ad: metin,
    tamAd: metin,
    slogan: metin,
    /** Arama motorlari ve sosyal medya icin genel site aciklamasi */
    aciklama: metin,
    /** Ana logo. Derleme sirasinda favicon, beyaz logo ve paylasim gorseli bundan uretilir. */
    logo: metin,
    /** Sitede one cikarilan (siradaki) etkinlik yili */
    aktifYil: z.number().int().min(2026).max(2100),
    /** En son gerceklesmis etkinligin yili */
    sonEtkinlikYili: z.number().int().min(2026).max(2100),
    iletisim: z.object({
      email: z.string().email(),
      telefon: secimliMetin,
    }),
    sosyal: liste(
      z.object({
        platform: z.enum(['instagram', 'x', 'linkedin', 'youtube', 'discord', 'tiktok']),
        url: z.string().url(),
      }),
    ),
    xKullaniciAdi: secimliMetin,
    anaMenu: liste(baglanti),
    altMenu: liste(baglanti),
    footer: z.object({
      tanitim: metin,
      katilBasligi: metin,
      katilMetni: metin,
      sponsorButonu: metin,
      konum: metin,
      telif: metin,
    }),
  }),
);

const biletSatisi = tekDosya(
  'ayarlar',
  'bilet-satisi.json',
  z.object({
    /** Sitedeki tum "Bilet Al" butonlarini ve fiyat tablosunu acar/kapatir. */
    satisAcik: z.boolean(),
    /** Dis bilet saglayicisi (Biletix, Bubilet vb.) adresi. Bossa /biletler sayfasina gider. */
    satisUrl: secimliMetin,
    acikButonMetni: metin,
    kapaliButonMetni: metin,
    acikMetni: metin,
    kapaliMetni: metin,
    fiyatNotu: secimliMetin,
    acikDurum: z.object({ baslik: metin, aciklama: metin }),
    kapaliDurum: z.object({ baslik: metin, aciklama: metin }),
  }),
);

/* ==================================================================
 *  SAYFA METINLERI
 * ================================================================== */

const anasayfa = tekDosya(
  'sayfalar',
  'anasayfa.json',
  z.object({
    seoAciklama: metin,
    hero: z.object({
      ustEtiket: metin,
      baslik: metin,
      baslikVurgu: secimliMetin,
      aciklama: metin,
      durumEtiketi: secimliMetin,
      ikinciButon: metin,
      geriSayimBasligi: metin,
      tarihYokBasligi: metin,
      tarihYokMetni: metin,
      tarihYokButonu: metin,
    }),
    gecenYil: z.object({
      etiket: metin,
      baslik: metin,
      detayButonu: metin,
      fotoNotu: metin,
      galeriButonu: metin,
    }),
    nedir: z.object({
      etiket: metin,
      baslik: metin,
      aciklama: metin,
      ekMetin: secimliMetin,
      buton: metin,
      kartlar: liste(kart),
    }),
    hazirlik: z.object({
      etiket: metin,
      baslik: metin,
      aciklama: metin,
      maddeler: liste(
        z.object({ ikon, baslik: metin, durum: metin, metin, tamam: z.boolean().default(false) }),
      ),
      birinciButon: metin,
      ikinciButon: metin,
    }),
    destekciler: z.object({ etiket: metin, baslik: metin, aciklama: metin, buton: metin }),
    sonCta: z.object({ etiket: metin, baslik: metin, birinciButon: metin, ikinciButon: metin }),
  }),
);

/** Markdown govdesi "Nasil basladi?" metnini tasir. */
const hakkindaSayfasi = tekDosya(
  'sayfalar',
  'hakkinda.md',
  z.object({
    seoAciklama: metin,
    etiket: metin,
    baslik: metin,
    aciklama: metin,
    durumKutusu: z.object({
      baslik: metin,
      mekanNotu: metin,
      gecmisEtkinlikNotu: metin,
      arsivButonu: metin,
    }),
    degerler: z.object({ etiket: metin, baslik: metin, maddeler: liste(kart) }),
    yolculuk: z.object({
      etiket: metin,
      baslik: metin,
      adimlar: liste(
        z.object({
          tarih: metin,
          baslik: metin,
          metin,
          durum: z.enum(['tamam', 'suan', 'planli']).default('tamam'),
        }),
      ),
    }),
    galeri: z.object({ etiket: metin, baslik: metin, aciklama: metin }),
  }),
);

const biletlerSayfasi = tekDosya(
  'sayfalar',
  'biletler.json',
  z.object({
    seoAciklamaAcik: metin,
    seoAciklamaKapali: metin,
    etiket: metin,
    acikBaslik: metin,
    acikAciklama: metin,
    kapaliBaslik: metin,
    kapaliAciklama: metin,
    geriSayimEtiketi: metin,
    kapaliKutu: z.object({ baslik: metin, birinciButon: metin, ikinciButon: metin }),
    acikKutu: z.object({ baslik: metin }),
    surec: z.object({ etiket: metin, baslik: metin, aciklama: metin, adimlar: liste(kart) }),
    kapsam: z.object({
      etiket: metin,
      acikBaslik: metin,
      acikAciklama: metin,
      kapaliBaslik: metin,
      kapaliAciklama: metin,
      maddeler: liste(metin),
    }),
    sss: z.object({ etiket: metin, baslik: metin, buton: metin }),
  }),
);

const konusmacilarSayfasi = tekDosya(
  'sayfalar',
  'konusmacilar.json',
  z.object({
    seoAciklamaVar: metin,
    seoAciklamaYok: metin,
    etiket: metin,
    varBaslik: metin,
    varAciklama: metin,
    yokBaslik: metin,
    yokAciklama: metin,
    hazirlaniyor: z.object({
      baslik: metin,
      metin,
      birinciButon: metin,
      ikinciButon: metin,
    }),
    gecenYil: z.object({ etiket: metin, baslik: metin, aciklama: metin }),
    konusmacilarBasligi: metin,
    juriBasligi: metin,
    basvuru: z.object({ baslik: metin, metin, buton: metin }),
  }),
);

const programSayfasi = tekDosya(
  'sayfalar',
  'program.json',
  z.object({
    seoAciklamaVar: metin,
    seoAciklamaYok: metin,
    etiket: metin,
    varBaslik: metin,
    varAciklama: metin,
    yokBaslik: metin,
    yokAciklama: metin,
    bakis: z.object({
      baslik: metin,
      toplamEtiketi: metin,
      salonlarEtiketi: metin,
      turlerEtiketi: metin,
    }),
    hazirlaniyor: z.object({ baslik: metin, metin, birinciButon: metin, ikinciButon: metin }),
    gecenYil: z.object({ etiket: metin, baslik: metin, aciklama: metin, buton: metin }),
  }),
);

const sponsorlarSayfasi = tekDosya(
  'sayfalar',
  'sponsorlar.json',
  z.object({
    seoAciklama: metin,
    etiket: metin,
    baslik: metin,
    aciklamaVar: metin,
    aciklamaYok: metin,
    neden: z.object({ etiket: metin, baslik: metin, maddeler: liste(kart) }),
    paketler: z.object({
      etiket: metin,
      baslik: metin,
      aciklama: metin,
      oneCikanRozeti: metin,
      buton: metin,
      dipnot: secimliMetin,
      liste: liste(
        z.object({
          ad: metin,
          fiyat: metin,
          aciklama: metin,
          oneCikan: z.boolean().default(false),
          ozellikler: liste(metin),
        }),
      ),
    }),
    destekciler: z.object({ etiket: metin, baslik: metin, aciklama: metin }),
  }),
);

const sssSayfasi = tekDosya(
  'sayfalar',
  'sss.json',
  z.object({
    seoAciklama: metin,
    etiket: metin,
    baslik: metin,
    aciklama: metin,
    kategorilerBasligi: metin,
    bosMetin: metin,
    altKutu: z.object({ baslik: metin, metin, buton: metin }),
  }),
);

const iletisimSayfasi = tekDosya(
  'sayfalar',
  'iletisim.json',
  z.object({
    seoAciklama: metin,
    etiket: metin,
    baslik: metin,
    aciklama: metin,
    form: z.object({
      baslik: metin,
      konular: liste(metin),
      gonderButonu: metin,
      basariMesaji: metin,
    }),
    kanallarBasligi: metin,
    mekan: z.object({
      baslik: metin,
      yolTarifiButonu: metin,
      belirsizBaslik: metin,
      belirsizMetin: metin,
      arsivButonu: metin,
    }),
    sosyal: z.object({ baslik: metin, metin }),
  }),
);

const galeriSayfasi = tekDosya(
  'sayfalar',
  'galeri.json',
  z.object({
    seoAciklama: metin,
    etiket: metin,
    baslik: metin,
    aciklamaTekYil: metin,
    aciklamaCokYil: metin,
    altNot: metin,
    altNotBaglantisi: metin,
    altNotDevami: metin,
  }),
);

const arsivSayfasi = tekDosya(
  'sayfalar',
  'gecmis-etkinlikler.json',
  z.object({
    seoAciklama: metin,
    etiket: metin,
    baslik: metin,
    aciklama: metin,
    yaklasan: z.object({ etiket: metin, baslik: metin, aciklama: metin }),
    gecmis: z.object({
      etiket: metin,
      baslik: metin,
      aciklama: metin,
      bosBaslik: metin,
      bosMetin: metin,
      bosButon: metin,
    }),
    yillar: z.object({ etiket: metin, baslik: metin }),
    detay: z.object({
      oneCikanlarBasligi: metin,
      kunyeBasligi: metin,
      fotograflarEtiketi: metin,
      galeriButonu: metin,
      geriButonu: metin,
    }),
  }),
);

/** Markdown govdesi aydinlatma metninin kendisidir. */
const gizlilikSayfasi = tekDosya(
  'sayfalar',
  'gizlilik.md',
  z.object({
    seoAciklama: metin,
    etiket: metin,
    baslik: metin,
    aciklama: metin,
    /** Metnin ustundeki sari uyari kutusu. Bos birakilirsa gosterilmez. */
    uyari: secimliMetin,
  }),
);

const bulunamadiSayfasi = tekDosya(
  'sayfalar',
  '404.json',
  z.object({
    seoAciklama: metin,
    baslik: metin,
    metin,
    birinciButon: metin,
    ikinciButon: metin,
    haritaBasligi: metin,
  }),
);

/* ==================================================================
 *  TEKRARLANAN ICERIK
 * ================================================================== */

/* ------------------------------------------------------------------
 * ETKINLIKLER - her yil icin bir dosya. Arsivin omurgasi.
 * Aktif yilin dosyasi ayni zamanda "siradaki etkinlik" bilgisidir:
 * ana sayfadaki tarih, geri sayim, mekan ve harita buradan gelir.
 * ------------------------------------------------------------------ */
const etkinlikler = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/etkinlikler' }),
  schema: z.object({
    yil: z.number().int().min(2026).max(2100),
    baslik: metin,
    slogan: opsiyonelMetin,
    /** Tarihi henuz aciklanmamis etkinliklerde bos birakilir; bos oldugu surece geri sayim gosterilmez. */
    baslangic: opsiyonelTarih,
    bitis: opsiyonelTarih,
    /** Tarih belli degilse "Tarih yakında açıklanacak" gibi bir metin yazin. */
    tarihMetni: metin,
    gunMetni: secimliMetin,
    saatMetni: secimliMetin,
    /** planlama = tarih/program henuz belli degil */
    durum: z.enum(['planlama', 'yaklasan', 'gecmis', 'iptal']).default('planlama'),
    mekan: z.object({
      /** Mekan kesinlesmediyse bos birakin; adres blogu ve harita gizlenir. */
      ad: secimliMetin,
      adres: secimliMetin,
      ilce: secimliMetin,
      postaKodu: secimliMetin,
      sehir: z.preprocess(bosIseYok, z.string().default('Antalya')),
    }),
    ozet: metin,
    kapak: opsiyonelGorsel,
    kapakAlt: opsiyonelMetin,
    biletUrl: opsiyonelMetin,
    /** Arsiv kartinda gosterilen rakamlar */
    istatistikler: liste(z.object({ deger: metin, etiket: metin })),
    oneCikanlar: liste(metin),
    taslak: z.boolean().default(false),
  }),
});

/* ------------------------------------------------------------------
 * KONUSMACILAR
 * ------------------------------------------------------------------ */
const konusmacilar = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/konusmacilar' }),
  schema: z.object({
    ad: metin,
    /**
     * Unvan/meslek. Bilinmiyorsa bos birakin - kart o zaman unvan yerine
     * @kullaniciAdi gosterir, uydurma bir unvan yazmaya gerek yok.
     */
    unvan: secimliMetin,
    kurum: opsiyonelMetin,
    /** Sosyal medya kullanici adi, @ isareti olmadan. Kartta @ ile gosterilir. */
    kullaniciAdi: opsiyonelMetin,
    /** 'juri' olanlar konusmacilar sayfasinda ayri bir baslik altinda listelenir. */
    rol: z.enum(['konusmaci', 'juri']).default('konusmaci'),
    /** Kart uzerinde gorunen kisa tanitim (1-2 cumle). Bos birakilabilir. */
    kisaBio: secimliMetin,
    foto: opsiyonelGorsel,
    fotoAlt: opsiyonelMetin,
    sosyal: z
      .preprocess(
        (deger) => deger ?? {},
        z.object({
          x: opsiyonelUrl,
          linkedin: opsiyonelUrl,
          instagram: opsiyonelUrl,
          youtube: opsiyonelUrl,
          github: opsiyonelUrl,
          web: opsiyonelUrl,
        }),
      ),
    /** Ana sayfadaki "One Cikan Konusmacilar" bolumunde gosterilsin mi? */
    oneCikan: z.boolean().default(false),
    etiketler: liste(metin),
    ...ortak,
  }),
});

/* ------------------------------------------------------------------
 * PROGRAM - her oturum icin bir dosya
 * ------------------------------------------------------------------ */
const saat = z.string().regex(/^\d{2}:\d{2}$/, 'Saat "10:00" formatinda olmali');

const program = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/program' }),
  schema: z.object({
    baslik: metin,
    aciklama: opsiyonelMetin,
    baslangic: saat,
    bitis: saat,
    /** Cok gunlu etkinliklerde gunu ayirmak icin: "2026-06-28" */
    gun: z.preprocess(
      // Panel tarihi Date nesnesi olarak da kaydedebilir
      (deger) => (deger instanceof Date ? deger.toISOString().slice(0, 10) : deger),
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    ),
    gunEtiketi: opsiyonelMetin,
    salon: z.preprocess(bosIseYok, z.string().default('Ana Sahne')),
    tur: z
      .enum(['acilis', 'konusma', 'panel', 'atolye', 'gosteri', 'turnuva', 'mola', 'kapanis'])
      .default('konusma'),
    /** src/content/konusmacilar altindaki dosya adlari (uzantisiz) */
    konusmacilar: liste(metin),
    ...ortak,
  }),
});

/* ------------------------------------------------------------------
 * SPONSORLAR
 * ------------------------------------------------------------------ */
const sponsorlar = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sponsorlar' }),
  schema: z.object({
    ad: metin,
    logo: opsiyonelGorsel,
    url: opsiyonelUrl,
    seviye: z.enum(['ana', 'altin', 'gumus', 'bronz', 'destekci', 'medya']).default('destekci'),
    aciklama: opsiyonelMetin,
    ...ortak,
  }),
});

/* ------------------------------------------------------------------
 * BILET TIPLERI
 * ------------------------------------------------------------------ */
const biletler = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/biletler' }),
  schema: z.object({
    ad: metin,
    /** Sayi olarak fiyat. Ucretsiz bilet icin 0 yazin. */
    fiyat: z.number().nonnegative(),
    eskiFiyat: z.preprocess(bosIseYok, z.number().nonnegative().optional()),
    paraBirimi: z.preprocess(bosIseYok, z.string().default('TRY')),
    paraSembolu: z.preprocess(bosIseYok, z.string().default('₺')),
    aciklama: metin,
    ozellikler: liste(metin),
    /** Bu paket satin alma sayfasinda vurgulansin mi? */
    oneCikan: z.boolean().default(false),
    durum: z.enum(['satista', 'tukendi', 'yakinda', 'sona-erdi']).default('satista'),
    /** Bossa Bilet Satisi ayarlarindaki genel satis linki kullanilir. */
    satinAlUrl: opsiyonelMetin,
    butonMetni: z.preprocess(bosIseYok, z.string().default('Bilet Al')),
    rozet: opsiyonelMetin,
    ...ortak,
  }),
});

/* ------------------------------------------------------------------
 * SIKCA SORULAN SORULAR
 * ------------------------------------------------------------------ */
const sss = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sss' }),
  schema: z.object({
    soru: metin,
    kategori: z.enum(['genel', 'bilet', 'mekan', 'katilim', 'sponsorluk']).default('genel'),
    ...ortak,
  }),
});

/* ------------------------------------------------------------------
 * GALERI - her yil icin bir dosya; siralama listedeki siradir.
 * Carousel'ler ve arsiv kapaklari da bu listeden beslenir.
 * ------------------------------------------------------------------ */
const galeri = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/galeri' }),
  schema: z.object({
    yil: z.number().int().min(2026).max(2100),
    fotograflar: liste(
      z.object({
        gorsel: metin,
        /** Erisilebilirlik + SEO metni. Bossa "AntCon <yil> etkinliğinden bir kare" kullanilir. */
        aciklama: secimliMetin,
      }),
    ),
  }),
});

export const collections = {
  siteAyarlari,
  biletSatisi,
  anasayfa,
  hakkindaSayfasi,
  biletlerSayfasi,
  konusmacilarSayfasi,
  programSayfasi,
  sponsorlarSayfasi,
  sssSayfasi,
  iletisimSayfasi,
  galeriSayfasi,
  arsivSayfasi,
  gizlilikSayfasi,
  bulunamadiSayfasi,
  etkinlikler,
  konusmacilar,
  program,
  sponsorlar,
  biletler,
  sss,
  galeri,
};
