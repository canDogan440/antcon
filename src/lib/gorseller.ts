import type { ImageMetadata } from 'astro';
import { getCollection } from 'astro:content';

/**
 * ============================================================
 *  GORSELLER
 * ------------------------------------------------------------
 *  Icerik dosyalarinda gorseller depo kokune gore yol olarak
 *  saklanir (yonetim paneli de boyle kaydeder):
 *
 *    /src/assets/yuklemeler/...   <- panelden yuklenenler
 *    /images/galeri/<yil>/...     <- galeri fotograflari
 *
 *  gorselBul() bu yolu Astro'nun optimize edebilecegi gorsele
 *  cevirir: her fotograftan WebP kucuk resimler ve srcset uretilir,
 *  ziyaretciye asla ham dosya gitmez.
 *
 *  Galeri, carousel'ler ve arsiv kapaklari "Galeri" koleksiyonundan
 *  (src/content/galeri/<yil>.json) beslenir. Siralama listedeki siradir.
 *
 *  ONEMLI: Ham fotograf makinesi dosyalari (5-12 MB) derlemeyi
 *  yavaslatir. `npm run foto` klasordeki fotograflari 2000px'e indirir.
 * ============================================================
 */

/**
 * NOT: images/ klasorunun koku bilerek taranmiyor; 30 MB'lik ham logo
 * orada duruyor ve Vite eslesen her dosyayi pakete dahil ediyor. Logo
 * scripts/generate-assets.mjs tarafindan ayrica isleniyor.
 */
const modiller = import.meta.glob<{ default: ImageMetadata }>(
  [
    '/images/galeri/**/*.{jpg,JPG,jpeg,JPEG,png,PNG,webp,WEBP,avif,AVIF}',
    '/src/assets/yuklemeler/**/*.{jpg,JPG,jpeg,JPEG,png,PNG,webp,WEBP,avif,AVIF}',
  ],
  { eager: true },
);

const uyarilanlar = new Set<string>();

/**
 * Icerik dosyasindaki gorsel yolunu Astro gorseline cevirir.
 * Dosya bulunamazsa derleme durmaz: gorsel yerine yer tutucu gosterilir ve
 * derleme kaydina bir uyari yazilir (orn. panelde medya kutuphanesinden
 * kullanimdaki bir gorsel silindiyse).
 */
export function gorselBul(yol: string | undefined): ImageMetadata | undefined {
  if (!yol) return undefined;
  const modul = modiller[yol] ?? modiller[decodeURI(yol)];
  if (modul) return modul.default;

  if (!uyarilanlar.has(yol)) {
    uyarilanlar.add(yol);
    console.warn(
      `[gorseller] "${yol}" bulunamadi, sitede gosterilmeyecek. ` +
        'Gorsel /images/galeri veya /src/assets/yuklemeler altinda olmali; panelden yeniden secin.',
    );
  }
  return undefined;
}

export type Gorsel = {
  /** Astro <Image /> bilesenine verilecek metadata */
  src: ImageMetadata;
  /** Icerik dosyasindaki yol - galeride anahtar olarak kullanilir */
  dosya: string;
  /** Erisilebilirlik metni */
  alt: string;
  /** Fotografin ait oldugu etkinlik yili */
  yil: number;
};

/** Tum galeri fotograflari; yeni yil basta, her yil kendi liste sirasinda. */
export async function tumGorseller(): Promise<Gorsel[]> {
  const yillar = await getCollection('galeri');
  return yillar
    .sort((a, b) => b.data.yil - a.data.yil)
    .flatMap(({ data }) =>
      data.fotograflar.flatMap((foto) => {
        const src = gorselBul(foto.gorsel);
        if (!src) return [];
        return [
          {
            src,
            dosya: foto.gorsel,
            alt: foto.aciklama || `AntCon ${data.yil} etkinliğinden bir kare`,
            yil: data.yil,
          },
        ];
      }),
    );
}

/** Belirli bir yilin fotograflari. Yil verilmezse tum fotograflar. */
export async function yilinGorselleri(yil?: number): Promise<Gorsel[]> {
  const tum = await tumGorseller();
  return yil === undefined ? tum : tum.filter((g) => g.yil === yil);
}

/** Yila gore gruplanmis liste - galeri sayfasi bunu kullanir. */
export async function gorselleriYilaGoreGetir(): Promise<{ yil: number; gorseller: Gorsel[] }[]> {
  const tum = await tumGorseller();
  const yillar = [...new Set(tum.map((g) => g.yil))];
  return yillar.map((yil) => ({ yil, gorseller: tum.filter((g) => g.yil === yil) }));
}

/**
 * Carousel icin ilk N gorsel.
 * Yil verilmezse en yeni fotograf yilindan secer.
 */
export async function carouselGorselleri(adet = 8, yil?: number): Promise<Gorsel[]> {
  const tum = await tumGorseller();
  const hedefYil = yil ?? tum[0]?.yil;
  return tum.filter((g) => g.yil === hedefYil).slice(0, adet);
}

/**
 * Arsiv kartlari ve arsiv sayfasi icin kapak gorseli: etkinlik kaydinda
 * `kapak` secilmemisse o yilin galerisindeki ilk fotograf kullanilir.
 */
export async function yedekKapak(yil?: number): Promise<Gorsel | undefined> {
  return (await yilinGorselleri(yil))[0];
}
