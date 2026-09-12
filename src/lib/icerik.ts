import { getCollection, type CollectionEntry } from 'astro:content';
import { AKTIF_YIL } from '@config/site';

/**
 * ============================================================
 *  ICERIK YARDIMCILARI
 * ------------------------------------------------------------
 *  Tum sayfalar icerigi buradan ceker. Boylece "taslak" filtresi,
 *  siralama ve yil filtresi tek bir yerde tanimli olur.
 * ============================================================
 */

type SiralanabilirVeri = { sira: number; taslak?: boolean; yil?: number };

function yayindaMi(veri: { taslak?: boolean }): boolean {
  return veri.taslak !== true;
}

function siralaCmp(a: { data: SiralanabilirVeri }, b: { data: SiralanabilirVeri }): number {
  return a.data.sira - b.data.sira;
}

/* ---------------------------------------------------------------- */
/* ETKINLIKLER (yil arsivi)                                          */
/* ---------------------------------------------------------------- */

export async function tumEtkinlikler(): Promise<CollectionEntry<'etkinlikler'>[]> {
  const liste = await getCollection('etkinlikler', ({ data }) => yayindaMi(data));
  return liste.sort((a, b) => b.data.yil - a.data.yil);
}

export async function etkinlikGetir(yil: number) {
  const liste = await tumEtkinlikler();
  return liste.find((e) => e.data.yil === yil);
}

/**
 * Bir etkinlik gecmiste mi kaldi?
 * Tarihi henuz aciklanmamis (planlama asamasindaki) etkinlikler asla gecmis sayilmaz.
 */
export function gecmisteMi(veri: CollectionEntry<'etkinlikler'>['data']): boolean {
  if (veri.durum === 'gecmis') return true;
  if (veri.durum === 'planlama' || !veri.bitis) return false;
  return veri.bitis.getTime() < Date.now();
}

/** Tarihi gecmis veya "gecmis" olarak isaretlenmis etkinlikler. */
export async function gecmisEtkinlikler(): Promise<CollectionEntry<'etkinlikler'>[]> {
  const liste = await tumEtkinlikler();
  return liste.filter((e) => gecmisteMi(e.data));
}

/** Henuz gerceklesmemis etkinlikler; tarihi belli olanlar once, en yakin tarih basta. */
export async function yaklasanEtkinlikler(): Promise<CollectionEntry<'etkinlikler'>[]> {
  const liste = await tumEtkinlikler();
  return liste
    .filter((e) => e.data.durum !== 'iptal' && !gecmisteMi(e.data))
    .sort((a, b) => {
      const at = a.data.baslangic?.getTime();
      const bt = b.data.baslangic?.getTime();
      if (at !== undefined && bt !== undefined) return at - bt;
      if (at !== undefined) return -1; // tarihi belli olan once
      if (bt !== undefined) return 1;
      return a.data.yil - b.data.yil;
    });
}

/* ---------------------------------------------------------------- */
/* KONUSMACILAR                                                      */
/* ---------------------------------------------------------------- */

export async function konusmacilariGetir(yil: number = AKTIF_YIL) {
  const liste = await getCollection(
    'konusmacilar',
    ({ data }) => yayindaMi(data) && data.yil === yil,
  );
  return liste.sort(siralaCmp);
}

export async function oneCikanKonusmacilar(yil: number = AKTIF_YIL, adet = 4) {
  const liste = await konusmacilariGetir(yil);
  const oneCikanlar = liste.filter((k) => k.data.oneCikan);
  return (oneCikanlar.length > 0 ? oneCikanlar : liste).slice(0, adet);
}

/**
 * Konusmacilari rollerine gore ayirir.
 * Cosplay jurisi gibi sahnede konusma yapmayan kisiler ayri listelenir.
 */
export async function konusmacilariRoleGoreGetir(yil: number = AKTIF_YIL) {
  const liste = await konusmacilariGetir(yil);
  return {
    konusmacilar: liste.filter((k) => k.data.rol === 'konusmaci'),
    juri: liste.filter((k) => k.data.rol === 'juri'),
    hepsi: liste,
  };
}

/* ---------------------------------------------------------------- */
/* PROGRAM                                                           */
/* ---------------------------------------------------------------- */

export type ProgramGunu = {
  gun: string;
  etiket: string;
  oturumlar: CollectionEntry<'program'>[];
};

/** Program oturumlarini gune gore gruplar ve saate gore siralar. */
export async function programiGetir(yil: number = AKTIF_YIL): Promise<ProgramGunu[]> {
  const liste = await getCollection('program', ({ data }) => yayindaMi(data) && data.yil === yil);

  const gunler = new Map<string, CollectionEntry<'program'>[]>();
  for (const oturum of liste) {
    const mevcut = gunler.get(oturum.data.gun) ?? [];
    mevcut.push(oturum);
    gunler.set(oturum.data.gun, mevcut);
  }

  return [...gunler.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([gun, oturumlar]) => {
      oturumlar.sort(
        (a, b) => a.data.baslangic.localeCompare(b.data.baslangic) || a.data.sira - b.data.sira,
      );
      return {
        gun,
        etiket: oturumlar[0]?.data.gunEtiketi ?? gunEtiketiUret(gun),
        oturumlar,
      };
    });
}

function gunEtiketiUret(gun: string): string {
  const tarih = new Date(`${gun}T00:00:00+03:00`);
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
    timeZone: 'Europe/Istanbul',
  }).format(tarih);
}

/* ---------------------------------------------------------------- */
/* SPONSORLAR                                                        */
/* ---------------------------------------------------------------- */

export const SPONSOR_SEVIYELERI = [
  { anahtar: 'ana', ad: 'Ana Sponsor' },
  { anahtar: 'altin', ad: 'Altın Sponsor' },
  { anahtar: 'gumus', ad: 'Gümüş Sponsor' },
  { anahtar: 'bronz', ad: 'Bronz Sponsor' },
  { anahtar: 'medya', ad: 'Medya Sponsoru' },
  { anahtar: 'destekci', ad: 'Destekçi' },
] as const;

export async function sponsorlariGetir(yil: number = AKTIF_YIL) {
  const liste = await getCollection('sponsorlar', ({ data }) => yayindaMi(data) && data.yil === yil);
  return liste.sort(siralaCmp);
}

export type SponsorGrubu = {
  anahtar: string;
  ad: string;
  sponsorlar: CollectionEntry<'sponsorlar'>[];
};

export async function sponsorlariSeviyeyeGoreGetir(yil: number = AKTIF_YIL): Promise<SponsorGrubu[]> {
  const liste = await sponsorlariGetir(yil);
  return SPONSOR_SEVIYELERI.map(({ anahtar, ad }) => ({
    anahtar,
    ad,
    sponsorlar: liste.filter((s) => s.data.seviye === anahtar),
  })).filter((grup) => grup.sponsorlar.length > 0);
}

/* ---------------------------------------------------------------- */
/* BILETLER                                                          */
/* ---------------------------------------------------------------- */

export async function biletleriGetir(yil: number = AKTIF_YIL) {
  const liste = await getCollection('biletler', ({ data }) => yayindaMi(data) && data.yil === yil);
  return liste.sort(siralaCmp);
}

/* ---------------------------------------------------------------- */
/* SSS                                                               */
/* ---------------------------------------------------------------- */

export const SSS_KATEGORILERI = [
  { anahtar: 'genel', ad: 'Genel' },
  { anahtar: 'bilet', ad: 'Bilet ve Kayıt' },
  { anahtar: 'mekan', ad: 'Mekân ve Ulaşım' },
  { anahtar: 'katilim', ad: 'Katılım ve Etkinlikler' },
  { anahtar: 'sponsorluk', ad: 'Sponsorluk' },
] as const;

export async function sssGetir(yil: number = AKTIF_YIL) {
  const liste = await getCollection('sss', ({ data }) => yayindaMi(data) && data.yil === yil);
  return liste.sort(siralaCmp);
}

export async function sssKategoriyeGoreGetir(yil: number = AKTIF_YIL) {
  const liste = await sssGetir(yil);
  return SSS_KATEGORILERI.map(({ anahtar, ad }) => ({
    anahtar,
    ad,
    sorular: liste.filter((s) => s.data.kategori === anahtar),
  })).filter((grup) => grup.sorular.length > 0);
}

/* ---------------------------------------------------------------- */
/* BICIMLENDIRME                                                     */
/* ---------------------------------------------------------------- */

export function fiyatBicimle(fiyat: number, sembol = '₺'): string {
  if (fiyat === 0) return 'Ücretsiz';
  return `${new Intl.NumberFormat('tr-TR').format(fiyat)} ${sembol}`;
}

export function tarihBicimle(tarih: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Istanbul',
  }).format(tarih);
}

export const OTURUM_TURU_ETIKETLERI: Record<string, string> = {
  acilis: 'Açılış',
  konusma: 'Konuşma',
  panel: 'Panel',
  atolye: 'Atölye',
  gosteri: 'Gösteri',
  turnuva: 'Turnuva',
  mola: 'Mola',
  kapanis: 'Kapanış',
};
