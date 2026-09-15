import type { CollectionEntry, CollectionKey } from 'astro:content';
import { tekKayit } from '@lib/tekil';
import { doldur } from '@lib/metin';
import { YER_TUTUCULAR } from '@config/site';

/**
 * Bir sayfanin panelden duzenlenen metinleri, yer tutuculari
 * ({aktifYil}, {sonYil}, {tarih}, {email}) doldurulmus olarak.
 */
export async function sayfaMetinleri<C extends CollectionKey>(
  koleksiyon: C,
): Promise<CollectionEntry<C>['data']> {
  const kayit = await tekKayit(koleksiyon);
  return doldur(kayit.data, YER_TUTUCULAR);
}

/**
 * Markdown govdeli sayfalarin (Hakkinda, Gizlilik) HTML'i.
 * Govdedeki yer tutucular da doldurulur - linkler dahil.
 */
export async function sayfaGovdesi(koleksiyon: CollectionKey): Promise<string> {
  const kayit = await tekKayit(koleksiyon);
  return doldur(kayit.rendered?.html ?? '', YER_TUTUCULAR);
}
