/**
 * ============================================================
 *  MARKA VARLIKLARI URETICISI
 * ------------------------------------------------------------
 *  images/AntCon-Logo.png (10276x10276, ~30 MB) kaynak dosyasindan
 *  siteye gereken tum turevleri uretir:
 *
 *    src/assets/antcon-logo.png   -> header/footer icin 1200px logo
 *    public/favicon.ico           -> 16+32+48 px klasik favicon
 *    public/favicon-16.png / -32  -> modern PNG favicon
 *    public/apple-touch-icon.png  -> iOS ana ekran ikonu (180px)
 *    public/icon-192.png / -512   -> PWA / Android ikonlari
 *    public/og-image.png          -> sosyal medya paylasim gorseli (1200x630)
 *
 *  Calistirmak icin:  npm run assets
 *  (npm run build oncesinde otomatik calisir)
 *
 *  Logoyu degistirdiginizde images/AntCon-Logo.png dosyasinin
 *  uzerine yazip "npm run assets" demeniz yeterli.
 * ============================================================
 */
import { mkdir, writeFile, access } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const KAYNAK_LOGO = join(KOK, 'images', 'AntCon-Logo.png');
const PUBLIC = join(KOK, 'public');
const ASSETS = join(KOK, 'src', 'assets');

const MARKA = {
  maviKoyu: '#003c8f',
  mavi: '#004aad',
  turuncu: '#fd630e',
  beyaz: '#ffffff',
};

// Cok buyuk kaynak gorseller icin piksel limitini yukselt
sharp.cache(false);

async function varMi(yol) {
  try {
    await access(yol);
    return true;
  } catch {
    return false;
  }
}

/** Saydam kenar boslugunu kirpar; kirpma basarisiz olursa orijinali dondurur. */
async function kirpilmisLogo() {
  const temel = sharp(KAYNAK_LOGO, { limitInputPixels: 0 });
  try {
    const tampon = await temel.clone().trim({ threshold: 8 }).png().toBuffer();
    return sharp(tampon, { limitInputPixels: 0 });
  } catch {
    return sharp(KAYNAK_LOGO, { limitInputPixels: 0 });
  }
}

/** ICO konteyneri: icine gomulu PNG'lerle (Vista+ tum tarayicilar destekler). */
function icoOlustur(pngler) {
  const baslik = Buffer.alloc(6);
  baslik.writeUInt16LE(0, 0); // ayrilmis
  baslik.writeUInt16LE(1, 2); // tur: 1 = ikon
  baslik.writeUInt16LE(pngler.length, 4);

  const dizin = Buffer.alloc(16 * pngler.length);
  let ofset = baslik.length + dizin.length;

  pngler.forEach(({ boyut, veri }, i) => {
    const p = i * 16;
    dizin.writeUInt8(boyut >= 256 ? 0 : boyut, p + 0); // genislik
    dizin.writeUInt8(boyut >= 256 ? 0 : boyut, p + 1); // yukseklik
    dizin.writeUInt8(0, p + 2); // palet rengi yok
    dizin.writeUInt8(0, p + 3); // ayrilmis
    dizin.writeUInt16LE(1, p + 4); // renk duzlemi
    dizin.writeUInt16LE(32, p + 6); // bit derinligi
    dizin.writeUInt32LE(veri.length, p + 8);
    dizin.writeUInt32LE(ofset, p + 12);
    ofset += veri.length;
  });

  return Buffer.concat([baslik, dizin, ...pngler.map((p) => p.veri)]);
}

async function main() {
  if (!(await varMi(KAYNAK_LOGO))) {
    console.warn(
      '[assets] images/AntCon-Logo.png bulunamadi - marka varliklari uretilmedi. ' +
        'Logoyu ekleyip "npm run assets" komutunu tekrar calistirin.',
    );
    return;
  }

  await mkdir(PUBLIC, { recursive: true });
  await mkdir(ASSETS, { recursive: true });

  const logo = await kirpilmisLogo();
  const ustveri = await logo.metadata();
  console.log(`[assets] Kaynak logo: ${ustveri.width}x${ustveri.height}`);

  /* --- 1) Site ici logo (acik zeminler icin, orijinal renkler) --- */
  await writeFile(
    join(ASSETS, 'antcon-logo.png'),
    await logo
      .clone()
      .resize({ width: 1200, withoutEnlargement: true })
      .png({ compressionLevel: 9, palette: true, quality: 90 })
      .toBuffer(),
  );

  /* --- 1b) Beyaz (monokrom) logo - koyu mavi header/footer/hero icin ---
     Orijinal logonun harfleri koyu mavi oldugu icin koyu zeminde okunmaz.
     Alfa kanalini maske olarak kullanip tamamen beyaz bir siluet uretiyoruz. */
  const beyazKaynak = await logo
    .clone()
    .resize({ width: 1200, withoutEnlargement: true })
    .ensureAlpha()
    .png()
    .toBuffer();
  const beyazUstveri = await sharp(beyazKaynak).metadata();
  const alfaMaske = await sharp(beyazKaynak).extractChannel('alpha').toBuffer();

  await writeFile(
    join(ASSETS, 'antcon-logo-beyaz.png'),
    await sharp({
      create: {
        width: beyazUstveri.width,
        height: beyazUstveri.height,
        channels: 3,
        background: { r: 255, g: 255, b: 255 },
      },
    })
      .joinChannel(alfaMaske)
      .png({ compressionLevel: 9 })
      .toBuffer(),
  );

  /* --- 2) Kare ikonlar (favicon / PWA / iOS) --- */
  const kareIkon = (boyut, zemin) =>
    logo
      .clone()
      .resize({
        width: Math.round(boyut * 0.86),
        height: Math.round(boyut * 0.86),
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .extend({
        top: Math.round(boyut * 0.07),
        bottom: Math.round(boyut * 0.07),
        left: Math.round(boyut * 0.07),
        right: Math.round(boyut * 0.07),
        background: zemin ?? { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();

  const beyazZemin = { r: 255, g: 255, b: 255, alpha: 1 };

  const ikonlar = [
    { dosya: 'favicon-16.png', boyut: 16, zemin: beyazZemin },
    { dosya: 'favicon-32.png', boyut: 32, zemin: beyazZemin },
    { dosya: 'apple-touch-icon.png', boyut: 180, zemin: beyazZemin },
    { dosya: 'icon-192.png', boyut: 192, zemin: beyazZemin },
    { dosya: 'icon-512.png', boyut: 512, zemin: beyazZemin },
  ];

  for (const { dosya, boyut, zemin } of ikonlar) {
    const veri = await kareIkon(boyut, zemin);
    await writeFile(join(PUBLIC, dosya), veri);
  }

  /* --- 3) favicon.ico (16 + 32 + 48) --- */
  const icoBoyutlari = [16, 32, 48];
  const icoPngler = [];
  for (const boyut of icoBoyutlari) {
    icoPngler.push({ boyut, veri: await kareIkon(boyut, beyazZemin) });
  }
  await writeFile(join(PUBLIC, 'favicon.ico'), icoOlustur(icoPngler));

  /* --- 4) Open Graph paylasim gorseli (1200x630) --- */
  const ogArkaPlan = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
       <defs>
         <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0%" stop-color="${MARKA.maviKoyu}"/>
           <stop offset="100%" stop-color="${MARKA.mavi}"/>
         </linearGradient>
       </defs>
       <rect width="1200" height="630" fill="url(#g)"/>
       <circle cx="1080" cy="90" r="200" fill="${MARKA.turuncu}" opacity="0.16"/>
       <circle cx="120" cy="560" r="150" fill="${MARKA.turuncu}" opacity="0.12"/>
       <rect x="0" y="606" width="1200" height="24" fill="${MARKA.turuncu}"/>
     </svg>`,
  );

  const ogYazi = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
       <style>
         .baslik { font: 700 62px "Segoe UI", Arial, Helvetica, sans-serif; fill: ${MARKA.beyaz}; }
         .alt    { font: 600 34px "Segoe UI", Arial, Helvetica, sans-serif; fill: #ffb185; }
         .tarih  { font: 700 40px "Segoe UI", Arial, Helvetica, sans-serif; fill: ${MARKA.beyaz}; }
       </style>
       <text class="alt"    x="470" y="238">ANTALYA</text>
       <text class="baslik" x="470" y="318">AntCon 2027</text>
       <text class="tarih"  x="470" y="392">Tarih yakinda aciklanacak</text>
       <text class="alt"    x="470" y="450">Antalya'nin Ilk Convention'i</text>
     </svg>`,
  );

  // Koyu mavi zeminde okunabilmesi icin beyaz varyanti kullaniyoruz.
  const ogLogo = await sharp(join(ASSETS, 'antcon-logo-beyaz.png'))
    .resize({ width: 300, height: 300, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await writeFile(
    join(PUBLIC, 'og-image.png'),
    await sharp(ogArkaPlan)
      .composite([
        { input: ogLogo, top: 165, left: 110 },
        { input: ogYazi, top: 0, left: 0 },
      ])
      .png({ compressionLevel: 9 })
      .toBuffer(),
  );

  console.log('[assets] Tum marka varliklari uretildi.');
}

main().catch((hata) => {
  console.error('[assets] Hata:', hata);
  process.exitCode = 1;
});
