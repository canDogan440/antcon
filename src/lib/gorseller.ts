import type { ImageMetadata } from 'astro';
import { GORSEL_ALT_METINLERI, VARSAYILAN_ALT } from '@config/gorsel-metinleri';
import { SON_ETKINLIK_YILI } from '@config/site';

/**
 * ============================================================
 *  OTOMATIK GORSEL TARAYICI
 * ------------------------------------------------------------
 *  Proje kokundeki images/ klasorunu (alt klasorler dahil) tarar
 *  ve bulunan her gorseli carousel + galeri icin hazirlar.
 *
 *  KLASOR YAPISI - fotograflar yila gore ayrilir:
 *
 *    images/
 *    ├── AntCon-Logo.png        <- logo (taranmaz)
 *    └── galeri/
 *        ├── 2026/              <- AntCon 2026 fotograflari
 *        │   ├── 01-acilis.jpg
 *        │   └── 02-sahne.jpg
 *        └── 2027/              <- gelecek yil buraya
 *
 *  Yil, klasor adindan otomatik okunur. Yil klasoru altinda
 *  olmayan gorseller son etkinlik yiline atanir (geriye donuk
 *  uyumluluk icin).
 *
 *  YENI GORSEL EKLEMEK: dosyayi ilgili yil klasorune kopyalayin.
 *  Kodda hicbir degisiklik gerekmez.
 *
 *  ONEMLI: Ham fotograf makinesi dosyalarini (5-12 MB) dogrudan
 *  koymayin. `npm run foto` komutu klasordeki fotograflari
 *  2000px genisligine indirger - derleme suresi 3 kat kisalir,
 *  repo boyutu ~47 kat kuculur.
 * ============================================================
 */

/** Carousel/galeri disinda tutulacak dosyalar (logo, ikonlar vb.) */
const HARIC_TUTULANLAR = ['antcon-logo', 'logo', 'favicon', 'og-image', 'placeholder'];

/**
 * NOT: Negatif desenler ('!...') olmazsa Vite eslesecek her dosyayi
 * pakete dahil eder - 30 MB'lik ham logo dahil. Bu yuzden logo/ikon
 * dosyalarini daha glob asamasinda disarida birakiyoruz.
 * Asagidaki HARIC_TUTULANLAR filtresi ikinci bir guvenlik katmanidir.
 */
const modiller = import.meta.glob<{ default: ImageMetadata }>(
  [
    '../../images/**/*.{jpg,JPG,jpeg,JPEG,png,PNG,webp,WEBP,avif,AVIF}',
    '!../../images/**/*[Ll]ogo*',
    '!../../images/**/*LOGO*',
    '!../../images/**/favicon*',
    '!../../images/**/og-image*',
  ],
  { eager: true },
);

export type Gorsel = {
  /** Astro <Image /> bilesenine verilecek metadata */
  src: ImageMetadata;
  /** Dosya adi (uzantiyla) */
  dosya: string;
  /** Erisilebilirlik metni */
  alt: string;
  /** Fotografin ait oldugu etkinlik yili (klasor adindan okunur) */
  yil: number;
};

function dosyaAdi(yol: string): string {
  return yol.split('/').pop() ?? yol;
}

function haricMi(yol: string): boolean {
  const ad = dosyaAdi(yol).toLowerCase();
  return HARIC_TUTULANLAR.some((parca) => ad.includes(parca));
}

/** Yol icinde "2026" gibi bir klasor adi ariyoruz; yoksa son etkinlik yili. */
function yiliCoz(yol: string): number {
  const klasorler = yol.split('/').slice(0, -1);
  const yilKlasoru = klasorler.reverse().find((k) => /^20\d{2}$/.test(k));
  return yilKlasoru ? Number(yilKlasoru) : SON_ETKINLIK_YILI;
}

/**
 * images/ klasorundeki tum gorseller.
 * Once yila gore (yeni yil basta), sonra dosya adina gore siralanir.
 * Bir yil icindeki sirayi degistirmek isterseniz dosya adlarinin
 * basina 01-, 02- gibi numaralar ekleyin.
 */
export const TUM_GORSELLER: Gorsel[] = Object.entries(modiller)
  .filter(([yol]) => !haricMi(yol))
  .map(([yol, modul]) => {
    const dosya = dosyaAdi(yol);
    return {
      src: modul.default,
      dosya,
      alt: GORSEL_ALT_METINLERI[dosya] ?? VARSAYILAN_ALT,
      yil: yiliCoz(yol),
    };
  })
  .sort((a, b) => b.yil - a.yil || a.dosya.localeCompare(b.dosya, 'tr'));

/** Fotografi bulunan yillar, yeniden eskiye. */
export const GORSEL_YILLARI: number[] = [...new Set(TUM_GORSELLER.map((g) => g.yil))].sort(
  (a, b) => b - a,
);

/** Belirli bir yilin fotograflari. Yil verilmezse tum fotograflar. */
export function yilinGorselleri(yil?: number): Gorsel[] {
  return yil === undefined ? TUM_GORSELLER : TUM_GORSELLER.filter((g) => g.yil === yil);
}

/** Yila gore gruplanmis liste - galeri sayfasi bunu kullanir. */
export function gorselleriYilaGoreGetir(): { yil: number; gorseller: Gorsel[] }[] {
  return GORSEL_YILLARI.map((yil) => ({ yil, gorseller: yilinGorselleri(yil) }));
}

/**
 * Carousel icin ilk N gorsel.
 * Yil verilmezse en yeni fotograf yilindan secer.
 */
export function carouselGorselleri(adet = 8, yil?: number): Gorsel[] {
  const kaynak = yilinGorselleri(yil ?? GORSEL_YILLARI[0]);
  return kaynak.slice(0, adet);
}

/**
 * Arsiv kartlari ve arsiv sayfasi icin kapak gorseli.
 *
 * Icerik dosyasinda `kapak:` alani doldurulmamissa o yilin ilk fotografi
 * kullanilir. Boylece ayni dosyaya ikinci bir referans verilmez - icerik
 * koleksiyonundaki `image()` alani, kullanilmasa bile ham dosyanin
 * (5-12 MB) dist klasorune kopyalanmasina yol aciyor.
 */
export function yedekKapak(yil?: number): Gorsel | undefined {
  return yilinGorselleri(yil)[0];
}
