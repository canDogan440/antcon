/**
 * ============================================================
 *  GALERI FOTOGRAFI HAZIRLAYICI
 * ------------------------------------------------------------
 *  Ham fotograf makinesi dosyalarini (5-12 MB, 6000px) web icin
 *  uygun boyuta indirger. Dosyalarin uzerine yazar.
 *
 *  Kullanim:
 *    npm run foto                      -> images/galeri/ altindaki her seyi hazirlar
 *    npm run foto -- images/galeri/2026  -> yalnizca o klasoru
 *    npm run foto -- --kontrol         -> hicbir sey degistirmez, sadece rapor verir
 *
 *  Neden gerekli?
 *  Olculen degerler (50 fotograf icin):
 *    ham dosyalarla     -> derlemede ~30 sn goruntu isleme, ~400 MB repo
 *    2000px hazirlanmis -> derlemede  ~9 sn goruntu isleme,  ~8 MB repo
 *  Siteye giden gorseller her iki durumda da ayni; fark yalnizca
 *  derleme suresi ve depolama.
 * ============================================================
 */
import { readdir, stat, writeFile } from 'node:fs/promises';
import { join, resolve, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Hedef genislik. Galeri en fazla 1400px kullanir; 2000 rahat pay birakir. */
const HEDEF_GENISLIK = 2000;
const JPEG_KALITE = 82;
/** Bu boyutun altindakilere dokunulmaz (zaten hazirlanmis sayilir). */
const ATLAMA_ESIGI_KB = 700;

const UZANTILAR = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const argumanlar = process.argv.slice(2);
const kontrolModu = argumanlar.includes('--kontrol');
const hedefKlasor = argumanlar.find((a) => !a.startsWith('--')) ?? 'images/galeri';

async function* gorselleriBul(klasor) {
  let girisler;
  try {
    girisler = await readdir(klasor, { withFileTypes: true });
  } catch {
    return; // klasor yok
  }
  for (const giris of girisler) {
    const yol = join(klasor, giris.name);
    if (giris.isDirectory()) {
      yield* gorselleriBul(yol);
    } else if (UZANTILAR.has(extname(giris.name).toLowerCase())) {
      if (/logo|favicon|og-image/i.test(giris.name)) continue;
      yield yol;
    }
  }
}

const kb = (bayt) => Math.round(bayt / 1024);

async function main() {
  const kok = resolve(KOK, hedefKlasor);
  const dosyalar = [];
  for await (const yol of gorselleriBul(kok)) dosyalar.push(yol);

  if (dosyalar.length === 0) {
    console.log(`[foto] ${hedefKlasor} altinda gorsel bulunamadi.`);
    console.log('[foto] Fotograflari images/galeri/<yil>/ klasorune koyun, orn. images/galeri/2026/');
    return;
  }

  console.log(`[foto] ${dosyalar.length} gorsel bulundu${kontrolModu ? ' (kontrol modu)' : ''}\n`);

  let oncekiToplam = 0;
  let sonrakiToplam = 0;
  let islenen = 0;
  let atlanan = 0;

  for (const yol of dosyalar) {
    const once = (await stat(yol)).size;
    oncekiToplam += once;

    const ustveri = await sharp(yol, { limitInputPixels: 0 }).metadata();
    const gorsel = `${ustveri.width}x${ustveri.height}`;
    const kisaAd = yol.replace(KOK, '').replace(/^[\\/]/, '');

    if (ustveri.width <= HEDEF_GENISLIK && kb(once) <= ATLAMA_ESIGI_KB) {
      sonrakiToplam += once;
      atlanan += 1;
      console.log(`  atlandi  ${kisaAd}  (${gorsel}, ${kb(once)} KB - zaten uygun)`);
      continue;
    }

    if (kontrolModu) {
      sonrakiToplam += once;
      console.log(`  HAZIRLANACAK  ${kisaAd}  (${gorsel}, ${kb(once)} KB)`);
      continue;
    }

    // EXIF yonunu uygula, sonra meta veriyi dusur (konum bilgisi de gider)
    const yeni = await sharp(yol, { limitInputPixels: 0 })
      .rotate()
      .resize({ width: HEDEF_GENISLIK, withoutEnlargement: true })
      .jpeg({ quality: JPEG_KALITE, mozjpeg: true })
      .toBuffer();

    await writeFile(yol, yeni);
    sonrakiToplam += yeni.length;
    islenen += 1;
    console.log(
      `  hazirlandi  ${kisaAd}  ${gorsel} ${kb(once)} KB  ->  ${HEDEF_GENISLIK}px ${kb(yeni.length)} KB`,
    );
  }

  const mb = (b) => (b / 1048576).toFixed(1);
  console.log(
    `\n[foto] ${islenen} hazirlandi, ${atlanan} atlandi.` +
      `  Toplam: ${mb(oncekiToplam)} MB -> ${mb(sonrakiToplam)} MB`,
  );
  if (kontrolModu) console.log('[foto] Kontrol modundaydi, hicbir dosya degistirilmedi.');
}

main().catch((hata) => {
  console.error('[foto] Hata:', hata);
  process.exitCode = 1;
});
