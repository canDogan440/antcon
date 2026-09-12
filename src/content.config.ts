import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * ============================================================
 *  ICERIK KOLEKSIYONLARI
 * ------------------------------------------------------------
 *  Her koleksiyon src/content/<klasor> altindaki .md dosyalarini
 *  okur. Yeni bir yil eklemek icin tek yapmaniz gereken ilgili
 *  klasorlere yeni dosyalar ekleyip "yil" alanini degistirmek.
 *
 *  Ornek: 2027 konusmacisi eklemek ->
 *    src/content/konusmacilar/2027-ayse-demir.md olustur,
 *    frontmatter'da yil: 2027 yaz. Site otomatik listeler.
 * ============================================================
 */

/** Butun koleksiyonlarda ortak olan alanlar */
const ortak = {
  /** Icerigin ait oldugu etkinlik yili. Arsiv ve filtreleme bunu kullanir. */
  yil: z.number().int().min(2026).max(2100),
  /** Kucukten buyuge siralanir. Bos birakilirsa 999 kabul edilir. */
  sira: z.number().default(999),
  /** true ise icerik sitede gorunmez (taslak). */
  taslak: z.boolean().default(false),
};

/* ------------------------------------------------------------------
 * 1) ETKINLIKLER - her yil icin bir dosya. Arsivin omurgasi.
 * ------------------------------------------------------------------ */
const etkinlikler = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/etkinlikler' }),
  schema: ({ image }) =>
    z.object({
      yil: z.number().int().min(2026).max(2100),
      baslik: z.string(),
      slogan: z.string().optional(),
      /**
       * Etkinligin baslangic tarihi ve saati (ISO 8601, +03:00).
       * Tarihi henuz aciklanmamis etkinliklerde bos birakilabilir.
       */
      baslangic: z.coerce.date().optional(),
      bitis: z.coerce.date().optional(),
      /** Tarih belli degilse "Tarih yakında açıklanacak" gibi bir metin yazin. */
      tarihMetni: z.string(),
      /** planlama = tarih/program henuz belli degil */
      durum: z.enum(['planlama', 'yaklasan', 'gecmis', 'iptal']).default('planlama'),
      mekan: z.object({
        /** Mekan kesinlesmediyse bos birakin. */
        ad: z.string().default(''),
        adres: z.string().optional(),
        sehir: z.string().default('Antalya'),
      }),
      ozet: z.string(),
      kapak: image().optional(),
      kapakAlt: z.string().optional(),
      biletUrl: z.string().optional(),
      /** Arsiv kartinda gosterilen rakamlar */
      istatistikler: z
        .array(z.object({ deger: z.string(), etiket: z.string() }))
        .default([]),
      oneCikanlar: z.array(z.string()).default([]),
      taslak: z.boolean().default(false),
    }),
});

/* ------------------------------------------------------------------
 * 2) KONUSMACILAR
 * ------------------------------------------------------------------ */
const konusmacilar = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/konusmacilar' }),
  schema: ({ image }) =>
    z.object({
      ad: z.string(),
      /**
       * Unvan/meslek. Bilinmiyorsa bos birakin - kart o zaman unvan yerine
       * @kullaniciAdi gosterir, uydurma bir unvan yazmaya gerek yok.
       */
      unvan: z.string().default(''),
      kurum: z.string().optional(),
      /** Sosyal medya kullanici adi, @ isareti olmadan. Kartta @ ile gosterilir. */
      kullaniciAdi: z.string().optional(),
      /**
       * Sahnedeki rolu. 'juri' olanlar konusmacilar sayfasinda ayri bir
       * baslik altinda listelenir.
       */
      rol: z.enum(['konusmaci', 'juri']).default('konusmaci'),
      /** Kart uzerinde gorunen kisa tanitim (1-2 cumle). Bos birakilabilir. */
      kisaBio: z.string().default(''),
      /** Fotograf .md dosyasiyla ayni klasore konur: foto: ./ad-soyad.jpg */
      foto: image().optional(),
      fotoAlt: z.string().optional(),
      sosyal: z
        .object({
          x: z.string().url().optional(),
          linkedin: z.string().url().optional(),
          instagram: z.string().url().optional(),
          youtube: z.string().url().optional(),
          github: z.string().url().optional(),
          web: z.string().url().optional(),
        })
        .default({}),
      /** Ana sayfadaki "One Cikan Konusmacilar" bolumunde gosterilsin mi? */
      oneCikan: z.boolean().default(false),
      etiketler: z.array(z.string()).default([]),
      ...ortak,
    }),
});

/* ------------------------------------------------------------------
 * 3) PROGRAM - her oturum icin bir dosya
 * ------------------------------------------------------------------ */
const program = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/program' }),
  schema: z.object({
    baslik: z.string(),
    aciklama: z.string().optional(),
    /** "10:00" formatinda */
    baslangic: z.string().regex(/^\d{2}:\d{2}$/, 'Saat "10:00" formatinda olmali'),
    bitis: z.string().regex(/^\d{2}:\d{2}$/, 'Saat "10:00" formatinda olmali'),
    /** Cok gunlu etkinliklerde gunu ayirmak icin: "2026-06-28" */
    gun: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    gunEtiketi: z.string().optional(),
    salon: z.string().default('Ana Sahne'),
    tur: z
      .enum(['acilis', 'konusma', 'panel', 'atolye', 'gosteri', 'turnuva', 'mola', 'kapanis'])
      .default('konusma'),
    /** src/content/konusmacilar altindaki dosya adlari (uzantisiz) */
    konusmacilar: z.array(z.string()).default([]),
    ...ortak,
  }),
});

/* ------------------------------------------------------------------
 * 4) SPONSORLAR
 * ------------------------------------------------------------------ */
const sponsorlar = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sponsorlar' }),
  schema: ({ image }) =>
    z.object({
      ad: z.string(),
      /** Logo .md dosyasiyla ayni klasore konur: logo: ./firma.png */
      logo: image().optional(),
      url: z.string().url().optional(),
      seviye: z.enum(['ana', 'altin', 'gumus', 'bronz', 'destekci', 'medya']).default('destekci'),
      aciklama: z.string().optional(),
      ...ortak,
    }),
});

/* ------------------------------------------------------------------
 * 5) BILETLER
 * ------------------------------------------------------------------ */
const biletler = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/biletler' }),
  schema: z.object({
    ad: z.string(),
    /** Sayi olarak fiyat. Ucretsiz bilet icin 0 yazin. */
    fiyat: z.number().nonnegative(),
    eskiFiyat: z.number().nonnegative().optional(),
    paraBirimi: z.string().default('TRY'),
    paraSembolu: z.string().default('₺'),
    aciklama: z.string(),
    ozellikler: z.array(z.string()).default([]),
    /** Bu paket satin alma sayfasinda vurgulansin mi? */
    oneCikan: z.boolean().default(false),
    durum: z.enum(['satista', 'tukendi', 'yakinda', 'sona-erdi']).default('satista'),
    satinAlUrl: z.string().default('/iletisim'),
    butonMetni: z.string().default('Bilet Al'),
    rozet: z.string().optional(),
    ...ortak,
  }),
});

/* ------------------------------------------------------------------
 * 6) SIKCA SORULAN SORULAR
 * ------------------------------------------------------------------ */
const sss = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/sss' }),
  schema: z.object({
    soru: z.string(),
    kategori: z.enum(['genel', 'bilet', 'mekan', 'katilim', 'sponsorluk']).default('genel'),
    ...ortak,
  }),
});

export const collections = { etkinlikler, konusmacilar, program, sponsorlar, biletler, sss };
