/**
 * ============================================================
 *  METIN YARDIMCILARI
 * ------------------------------------------------------------
 *  Yonetim panelinden gelen metinler iki kolaylik destekler:
 *
 *  1) Yer tutucular: "{aktifYil}", "{sonYil}", "{tarih}", "{email}"
 *     yazilan yerlere guncel deger konur. Boylece yil degistiginde
 *     metinleri tek tek duzeltmek gerekmez.
 *  2) **Kalin yazi**: iki yildiz arasindaki kisim <strong> olur
 *     (yalnizca vurgula() ile basilan alanlarda).
 * ============================================================
 */

export type YerTutucular = Record<string, string>;

/**
 * Metin, dizi veya nesnenin icindeki tum yer tutuculari doldurur.
 * Markdown'dan uretilen HTML'deki linklerde suslu parantezler "%7B...%7D"
 * olarak kodlandigi icin o bicim de desteklenir.
 * Tanimsiz bir yer tutucu oldugu gibi birakilir (yazim hatasi sitede gorunur,
 * sessizce kaybolmaz).
 */
export function doldur<T>(veri: T, degerler: YerTutucular): T {
  if (typeof veri === 'string') {
    return veri.replace(
      /\{(\w+)\}|%7B(\w+)%7D/g,
      (tamami, duz?: string, kodlu?: string) => degerler[(duz ?? kodlu)!] ?? tamami,
    ) as T;
  }
  if (Array.isArray(veri)) return veri.map((oge) => doldur(oge, degerler)) as T;
  if (veri !== null && typeof veri === 'object' && !(veri instanceof Date)) {
    return Object.fromEntries(
      Object.entries(veri).map(([anahtar, deger]) => [anahtar, doldur(deger, degerler)]),
    ) as T;
  }
  return veri;
}

/**
 * Duz metni guvenli HTML'e cevirir ve **kalin** yazimi <strong> yapar.
 * `set:html` ile kullanilir; HTML ozel karakterleri kacislanir, yani
 * panele yazilan "<" gibi karakterler sayfayi bozamaz.
 */
export function vurgula(metin: string, strongSinifi = ''): string {
  const guvenli = metin
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  const etiket = strongSinifi ? `<strong class="${strongSinifi}">` : '<strong>';
  return guvenli.replace(/\*\*(.+?)\*\*/g, `${etiket}$1</strong>`);
}
