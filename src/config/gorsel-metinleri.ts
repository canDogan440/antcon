/**
 * ============================================================
 *  GORSEL ALT METINLERI (erisilebilirlik + SEO)
 * ------------------------------------------------------------
 *  images/ klasorune atilan her gorsel otomatik olarak carousel
 *  ve galeriye eklenir. Buraya dosya adini yazarsaniz o gorsel
 *  icin ozel bir alt metni kullanilir; yazmazsaniz asagidaki
 *  VARSAYILAN_ALT metni kullanilir.
 *
 *  Kullanim: dosya adini uzantisiyla birlikte yazin.
 *    '582A0431.jpeg': 'Ana sahnede acilis konusmasi yapan konusmaci',
 *
 *  NOT: Mevcut fotograflarin tamami 28 Haziran 2026'da gerceklesen
 *  ilk AntCon'da cekildi. Yeni yilin fotograflari eklendiginde
 *  alt metinlerinde o yili belirtin.
 * ============================================================
 */
export const GORSEL_ALT_METINLERI: Record<string, string> = {
  '582A0431.jpeg': 'AntCon 2026 ana sahnesinde kalabalık bir dinleyici topluluğu',
  '582A0438.jpg': 'AntCon 2026 standlarında ziyaretçilerle sohbet eden ekip',
  '582A0537.jpg': 'AntCon 2026 etkinlik alanında masa oyunu oynayan katılımcılar',
  '582A0538.jpg': 'AntCon 2026 ana sahnesinde gerçekleşen oturum',
  '582A0731.jpeg': 'AntCon 2026 fuaye alanında dolaşan ziyaretçiler',
  'DSCF0417.jpeg': 'AntCon 2026 etkinlik alanının genel görünümü',
};

/** Ozel metin tanimlanmamis gorseller icin kullanilir. */
export const VARSAYILAN_ALT = 'AntCon 2026 etkinliğinden bir kare';
