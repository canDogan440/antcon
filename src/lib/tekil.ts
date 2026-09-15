import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';

/**
 * Tek dosyadan olusan koleksiyonun (ayarlar, sayfa metinleri) kaydini dondurur.
 * Dosya silinmis veya adi degismisse derleme anlasilir bir hatayla durur;
 * Netlify bu durumda sitenin onceki halini yayinda tutar.
 */
export async function tekKayit<C extends CollectionKey>(koleksiyon: C): Promise<CollectionEntry<C>> {
  const [kayit] = await getCollection(koleksiyon);
  if (!kayit) {
    throw new Error(
      `"${koleksiyon}" icerik dosyasi bulunamadi. src/content.config.ts icindeki dosya yolunu kontrol edin.`,
    );
  }
  return kayit;
}
