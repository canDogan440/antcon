# AntCon — Antalya'nın İlk Convention'ı

AntCon resmî web sitesi. **Astro 5 + Tailwind CSS 4** ile üretilen, **backend'i olmayan, tamamen statik** bir site. Her yıl tekrar eden etkinlik yapısına göre kurgulandı: yeni bir yıl eklemek için kod yazmanız gerekmiyor, sadece `src/content/` klasörüne dosya ekliyorsunuz.

## Sitenin şu anki durumu

| | |
| --- | --- |
| **AntCon 2026** | 28 Haziran 2026'da gerçekleşti — arşivde (`/gecmis-etkinlikler/2026`) |
| **AntCon 2027** | Planlama aşamasında — tarih ve mekân henüz belli değil |
| **Bilet satışı** | Kapalı. Tüm CTA butonları "Bilet Al" yerine **"Haberdar Ol"** gösteriyor |
| **Fotoğraflar** | `images/galeri/2026/` altında — hepsi 28 Haziran 2026 etkinliğine ait |
| **İletişim** | Tek adres: `info@antconvention.com` · Tek sosyal hesap: Instagram `@antconvention` |

Site bu üç duruma göre kendini otomatik ayarlar; hangi anahtarın neyi açtığı [Bölüm 3](#3-durum-anahtarlari-tarih-ve-bilet-satisi)'te.

---

## 1. Hızlı başlangıç

```bash
npm install
npm run dev
```

Site `http://localhost:4321` adresinde açılır.

| Komut | Ne yapar |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu (canlı yenileme) |
| `npm run build` | Tip kontrolü + üretim derlemesi → `dist/` |
| `npm run build:fast` | Tip kontrolü olmadan hızlı derleme |
| `npm run preview` | `dist/` klasörünü yerel olarak sunar |
| `npm run assets` | Logodan favicon / OG görseli türetir |
| `npm run foto` | Galeri fotoğraflarını 2000 px'e indirger — derleme süresini ~3 kat kısaltır |
| `npm run denetim` | Derlenmiş HTML'i tarar: başlık hiyerarşisi, `alt` metinleri, ARIA referansları, tekrarlanan `id`, meta açıklama uzunluğu |

> **Node.js 20 veya üzeri** gerekir (`.nvmrc` → 20).

---

## 2. İçerik güncelleme (kod bilgisi gerekmez)

Tüm içerik `src/content/` altında **Markdown** dosyalarıdır. Dosyanın en üstündeki `---` çizgileri arasındaki bölüm ayarları, altındaki kısım ise serbest metni tutar.

```
src/content/
├── etkinlikler/    → Her yıl için bir dosya (arşivin omurgası)
├── konusmacilar/   → Konuşmacı kartları
├── program/        → Program akışındaki her oturum için bir dosya
├── sponsorlar/     → Sponsor logoları ve seviyeleri
├── biletler/       → Bilet tipleri ve fiyatlar
└── sss/            → Sıkça sorulan sorular
```

### Ortak alanlar

Her dosyada bulunan üç alan:

| Alan | Anlamı |
| --- | --- |
| `yil` | İçeriğin ait olduğu etkinlik yılı (`2026`, `2027`, …) |
| `sira` | Sayfada görünme sırası — küçük olan üstte |
| `taslak` | `true` yaparsanız içerik sitede görünmez |

### Konuşmacılara özel: `rol` alanı

Konuşmacı dosyalarında ayrıca **`rol`** alanı vardır: `konusmaci` (varsayılan) veya `juri`. `juri` olanlar konuşmacılar sayfasında ve arşivde **"Cosplay Jürisi"** başlığı altında ayrı listelenir.

`unvan` ve `kisaBio` bilinmiyorsa **boş bırakın** — kart o zaman uydurma bir unvan yerine isim + `@kullaniciAdi` gösterir. Fotoğraf yoksa baş harflerden oluşan renkli bir yer tutucu çizilir.

### Örnek: yeni konuşmacı ekleme

`src/content/konusmacilar/2027-01-ayse-demir.md` dosyasını oluşturun:

```markdown
---
ad: Ayşe Demir
unvan: Konsept Sanatçısı      # bilinmiyorsa "" birakin
kurum: Bağımsız
kullaniciAdi: aysedemir       # kartta @aysedemir olarak gorunur
rol: konusmaci                # veya: juri
kisaBio: Oyun ve animasyon projeleri için karakter tasarlıyor.
foto: ./ayse-demir.jpg          # fotoğrafı bu klasöre koyun (isteğe bağlı)
yil: 2027                       # aktif etkinlik yılı
sira: 1
oneCikan: false                 # true ise ana sayfada da görünür
etiketler:
  - İllüstrasyon
sosyal:
  instagram: https://instagram.com/kullanici
taslak: false
---

Buraya konuşmacı hakkında uzun metin yazabilirsiniz.
```

Kaydedip `npm run build` çalıştırmanız yeterli — konuşmacı listesi otomatik güncellenir.

### Program oturumunda konuşmacı belirtme

`program/` dosyalarındaki `konusmacilar` listesi, `konusmacilar/` klasöründeki **dosya adlarını (uzantısız)** kullanır:

```yaml
konusmacilar:
  - 2026-01-mine-yagiz
  - 2026-03-irem-tasci       # src/content/konusmacilar/2026-03-irem-tasci.md
```

---

## 3. Durum anahtarları: tarih ve bilet satışı

Sitenin "planlama aşamasında" mı yoksa "tarih belli / bilet satışta" mı davranacağını **`src/config/site.ts`** içindeki iki blok belirler. Sayfaların hiçbirine dokunmanız gerekmez.

### 3.1 Tarih açıklandığında

`ETKINLIK` bloğunu doldurun:

```ts
export const ETKINLIK = {
  durum: 'tarih-belli',                        // 'planlama' idi
  baslangic: '2027-06-27T10:00:00+03:00',      // boştu
  bitis: '2027-06-27T20:00:00+03:00',          // boştu
  tarihMetni: '27 Haziran 2027',
  gunMetni: 'Pazar',
  saatMetni: '10:00 - 20:00',
  mekan: {
    ad: 'Mekân adı',                            // boşken "Mekân yakında açıklanacak" yazıyor
    adres: 'Cadde, No',
    ilce: 'Muratpaşa',
    // ...
    haritaEmbed: 'https://www.google.com/maps?q=...&output=embed',
  },
};
```

Ayrıca `src/content/etkinlikler/2027.md` içinde `durum: yaklasan` yapın ve yorum satırındaki `baslangic` / `bitis` satırlarını açın.

**Otomatik değişenler:** ana sayfadaki geri sayım sayacı açılır, biletler sayfasına geri sayım şeridi gelir, iletişim sayfasında adres bloğu ve Google Haritalar iframe'i görünür, Schema.org `Event` verisi yayınlanmaya başlar (`startDate` zorunlu olduğu için tarihsiz yayınlanmıyor).

### 3.2 Bilet satışı açıldığında

1. `src/config/site.ts` → `BILET_SATISI.acik = true` (dış bilet sağlayıcısı varsa `hariciUrl` doldurun).
2. `src/content/biletler/` altındaki dosyalarda `taslak: false` ve `durum: satista` yapın, fiyatları güncelleyin.

**Otomatik değişenler:** navbar, footer, hero ve ekranın altında sabit duran buton "Haberdar Ol" yerine **"Bilet Al"** olur (tek kaynak: `ANA_CTA`), biletler sayfası fiyat tablosunu gösterir, `Event` şemasına `offers` alanı eklenir.

---

## 4. Yeni bir yıl ekleme (örn. AntCon 2028)

Beş adım, neredeyse tamamı içerik dosyası:

1. **`src/content/etkinlikler/2028.md`** oluşturun — `2027.md`'yi kopyalayıp yılı değiştirin. Biten yılda `durum: gecmis`, yeni yılda `durum: planlama` (veya tarih belliyse `yaklasan`) yazın.
2. **`src/config/site.ts`** içinde `AKTIF_YIL = 2028` ve `SON_ETKINLIK_YILI = 2027` yapın; `ETKINLIK` bloğunu sıfırlayın (Bölüm 3.1'in tersi) ve `BILET_SATISI.acik = false` yapın.
3. `konusmacilar/`, `program/`, `sponsorlar/`, `biletler/`, `sss/` klasörlerine `yil: 2028` olan yeni dosyalar ekleyin. **Eski yılın dosyalarını silmeyin** — arşiv sayfası onları kullanır.
4. Biten yılın fotoğraflarını `etkinlikler/<yil>.md` içindeki `kapak:` alanına ekleyin (`images/` klasöründeki bir dosyaya göreli yol verebilirsiniz).
5. `npm run build`.

Sonuç: ana sayfa, program, biletler ve konuşmacılar yeni yılı gösterir; biten yıl `/gecmis-etkinlikler` listesine düşer ve `/gecmis-etkinlikler/<yil>` detay sayfası kendiliğinden oluşur.

### İçeriği olmayan sayfalar ne gösterir?

Yeni yıl için henüz içerik yokken sayfalar boş kalmaz, anlamlı bir "hazırlanıyor" durumu gösterir ve geçen yılın içeriğini referans olarak sunar:

| Sayfa | İçerik yokken |
| --- | --- |
| `/program` | "Program hazırlanıyor" kutusu + geçen yılın oturum listesi |
| `/konusmacilar` | "Kadro hazırlanıyor" + başvuru CTA'sı + geçen yılın kadrosu |
| `/biletler` | "Satış açıldığında ilk siz bilin" + 3 adımlı satış süreci + geçen yılın bilet kapsamı |
| `/sponsorlar` | Paketler ve başvuru bilgisi + geçen yılın destekçileri |

---

## 5. Görseller

### Carousel ve galeri — yıl klasörleri

Proje kökündeki **`images/`** klasörü otomatik taranır (`src/lib/gorseller.ts`). Fotoğraflar **yıla göre** ayrılır:

```
images/
├── AntCon-Logo.png        ← ana logo (taranmaz)
└── galeri/
    ├── 2026/              ← AntCon 2026 fotoğrafları
    │   ├── 01-acilis.jpg
    │   └── 02-sahne.jpg
    └── 2027/              ← gelecek yıl buraya
```

Yıl, **klasör adından otomatik okunur**. Yeni fotoğraf eklemek için dosyayı ilgili yıl klasörüne kopyalamanız yeterli — kodda hiçbir değişiklik gerekmez. Yıl klasörü altında olmayan görseller son etkinlik yılına atanır.

Klasör yapısı şunları otomatik besler:

| Nereye gider | Ne alır |
| --- | --- |
| Ana sayfa carousel | Son etkinlik yılının ilk 8 fotoğrafı |
| `/galeri` | Tüm yıllar, yıl başlıklarıyla gruplanmış (tek yıl varsa başlık gizli) |
| `/gecmis-etkinlikler/<yıl>` | O yılın kendi fotoğrafları + kapak görseli |
| Hakkında sayfası | Son etkinlik yılından 5 fotoğraf |

Sıralamayı değiştirmek için dosya adlarının başına `01-`, `02-` gibi numaralar ekleyin.

### Fotoğrafları eklemeden önce: `npm run foto`

Ham fotoğraf makinesi dosyalarını (5–12 MB, 6000px) doğrudan koymayın. Bu komut klasördeki fotoğrafları **2000 px genişliğe indirger** (dosyaların üzerine yazar, EXIF konum bilgisini de temizler):

```bash
npm run foto -- --kontrol      # önce ne yapacağını gösterir, dosyaya dokunmaz
npm run foto                   # images/galeri/ altındaki her şeyi hazırlar
npm run foto -- images/galeri/2027   # yalnızca bir klasörü
```

Zaten 2000 px altındaki ve 700 KB'tan küçük dosyalar atlanır, tekrar çalıştırmak zarar vermez.

**Ölçülen fark (50 fotoğraf için):**

| | Derlemede görüntü işleme | Repo boyutu |
| --- | --- | --- |
| Ham dosyalarla | ~30 sn | ~400 MB |
| `npm run foto` sonrası | ~9 sn | ~8 MB |

Siteye giden görseller iki durumda da birebir aynı; fark yalnızca derleme süresi ve depolama. Astro zaten her fotoğraftan 320/480/720 px WebP küçük resimler ve büyütme penceresi için tek bir 1400 px sürüm üretir.

### Galeri neden sayfalama kullanmıyor?

50+ fotoğrafla ölçüm yapıldı. Sonuç: **gerek yok.**

| Metrik | 56 fotoğraflı galeri |
| --- | --- |
| LCP | 200 ms |
| CLS | 0.0000 |
| HTML (gzip) | 10 KB |
| Açılışta inen görsel | 31 adet / 390 KB (hepsi `lazy`, düşük öncelikli) |

"Daha fazla göster" butonu denendi ve **kaldırıldı**: ağ trafiğini hiç azaltmadı. Chrome'un preload tarayıcısı HTML'i CSS'ten önce okuyor ve `<img src>` gördüğü anda — öğe `display:none` olsa bile — indirmeye başlıyor (istekler 13. ms'de başlıyordu). Karşılığında gizlenen fotoğraflar Google Görseller'de değer kaybediyordu.

Yerleşik `loading="lazy"` + `srcset` + sabit `width`/`height` bu iş için zaten yeterli: LCP'yi etkilemiyor, CLS sıfır. Galeri ~150 fotoğrafı aşarsa yıl bazlı ayrı sayfalara bölmek (`/galeri/2026`) doğru adım olur.

### Konuşmacı fotoğrafları ve sponsor logoları

Bunlar `images/` klasörüne değil, ilgili `.md` dosyasının **yanına** konur ve `./` ile referans verilir:

```
src/content/konusmacilar/
├── 2026-01-mine-yagiz.md      → içinde: foto: ./2026-01-mine-yagiz.jpeg
└── 2026-01-mine-yagiz.jpeg
```

Dosya adını `.md` ile aynı tutun; hangi fotoğrafın kime ait olduğu gözle görünür olur. `.jpg`, `.jpeg`, `.png` ve `.webp` hepsi çalışır.

**Ölçü:** kart `4:5` dikey oran + `object-cover` kullanır, en büyük 600 px genişlik üretir. İdeal kaynak **1200×1500 px**. Oran 4:5 değilse kenarlardan kırpılır.

> **Bilinmesi gereken davranış:** İçerik koleksiyonundaki `foto`/`logo`/`kapak` alanları Astro'nun `image()` yardımcısını kullanır ve bu yol, optimize edilmiş WebP'lerin **yanı sıra ham dosyanın bir kopyasını da** `dist/` klasörüne koyar — hiçbir sayfa onu kullanmasa bile. 8 konuşmacı fotoğrafı için bu 2.7 MB'lık ölü ağırlık demek (ziyaretçiye asla inmez, sadece deploy'u büyütür). `images/` klasöründeki carousel görselleri farklı bir yoldan (`import.meta.glob`) geçtiği için bu sorunu yaşamaz. Kadro çok büyürse kaynak dosyaları 1200×1500'e küçültmek en pratik çözümdür.

### Alt metinleri (erişilebilirlik + SEO)

`src/config/gorsel-metinleri.ts` dosyasına dosya adını yazarak o görsele özel açıklama verebilirsiniz. Yazmazsanız genel bir varsayılan metin kullanılır.

### Logo ve favicon

`images/AntCon-Logo.png` dosyasının üzerine yeni logoyu yazıp şunu çalıştırın:

```bash
npm run assets
```

Bu komut şunları otomatik üretir:

- `src/assets/antcon-logo.png` — açık zeminler için renkli logo
- `src/assets/antcon-logo-beyaz.png` — koyu mavi header/footer/hero için beyaz varyant
- `public/favicon.ico`, `favicon-16.png`, `favicon-32.png`
- `public/apple-touch-icon.png`, `icon-192.png`, `icon-512.png`
- `public/og-image.png` — sosyal medya paylaşım görseli (1200×630)

Bu dosyalar üretilmiş kabul edildiği için `.gitignore` içindedir; `npm run build` öncesinde otomatik yeniden üretilirler.

---

## 6. İletişim formu (Web3Forms)

Site tamamen statiktir; sunucu tarafı kod yoktur. Form gönderimleri tarayıcıdan doğrudan **Web3Forms** API'sine `fetch` ile POST edilir.

**Kurulum:**

1. [web3forms.com](https://web3forms.com) adresinden e-postanızla ücretsiz bir *Access Key* alın.
2. `src/config/site.ts` içindeki `WEB3FORMS_KEY` değerini bu anahtarla değiştirin.

Anahtar tanımlanmadığı sürece form sayfasında bir kurulum uyarısı görünür ve gönderim engellenir.

> Access Key gizli bir bilgi değildir; istemci tarafında görünmesi normaldir. Form ayrıca bot koruması için gizli bir *honeypot* alanı içerir.

---

## 7. Marka renkleri

`src/styles/global.css` içindeki `@theme` bloğunda tanımlıdır. Her değişken hem CSS değişkeni (`var(--color-main-orange)`) hem de Tailwind sınıfı (`bg-main-orange`, `text-main-blue`) olarak kullanılabilir.

| Değişken | Renk | Kullanım |
| --- | --- | --- |
| `--color-main-blue` | `#004aad` | **Ana marka mavisi.** Header, hero, footer, koyu bölüm zeminleri, ikonlar |
| `--color-main-orange` | `#fd630e` | Vurgu çizgileri, ikonlar, aksan öğeleri |
| `--color-secondary-blue` | `#3d7fd6` | Açık mavi geçişler, kart hover kenarlığı, rozet zeminleri |
| `--color-secondary-orange` | `#fe8a4a` | Koyu zeminde büyük turuncu başlıklar |
| `--color-white` | `#ffffff` | İçerik alanları |

**Türetilmiş tonlar:**

| Değişken | Renk | Neden var? |
| --- | --- | --- |
| `--color-blue-deep` | `#004aad` | **Marka mavisinin ta kendisi.** `#004aad` beyazla 8.13:1 kontrast verdiği için ayrı bir "koyu" varyanta gerek yok; header/hero/footer doğrudan marka rengini kullanıyor. Token, ileride yüzey rengini markadan ayırmak isterseniz diye duruyor. |
| `--color-blue-darker` | `#00337a` | Bant üstüne bant bindiğinde derinlik (mobil menü, son CTA şeridi, yer tutucu gradyanlar) → beyazla **11.9:1** |
| `--color-orange-deep` | `#c2410c` | `#fd630e` üzerinde beyaz metin sadece 3.02:1 verir (WCAG AA için 4.5:1 gerekir). Metin taşıyan turuncu butonlarda bu ton kullanılır → **5.18:1** |
| `--color-orange-glow` | `#ffb185` | Marka mavisi üzerinde küçük turuncu metin → **4.60:1** |

Ölçülen kontrastlar (canlı sayfadan, `#004aad` zemin üzerinde):

| Öğe | Kontrast | Eşik | |
| --- | --- | --- | --- |
| Hero başlığı (beyaz) | 8.13 | 3.0 | ✅ |
| Hero paragrafı (`white/85`) | 6.33 | 4.5 | ✅ |
| Navbar linkleri (`white/80`) | 5.92 | 4.5 | ✅ |
| Footer metni | 5.79 | 4.5 | ✅ |
| Turuncu CTA butonu | 5.18 | 4.5 | ✅ |
| Turuncu etiketler (`orange-glow`) | 4.60 | 4.5 | ✅ |

Renk dengesi: **mavi ~%50** (header, hero, footer, bölüm zeminleri), **beyaz ~%33** (içerik ve kartlar), **turuncu ~%17** (CTA butonları, ikonlar, vurgular).

> Mavi tonunu değiştirirseniz `--color-main-blue` ve `--color-blue-deep` yeterli olur; ayrıca `src/layouts/BaseLayout.astro` içindeki `theme-color` meta etiketini, `public/site.webmanifest` içindeki `theme_color` alanını ve `scripts/generate-assets.mjs` içindeki `MARKA` sabitini güncelleyip `npm run assets` çalıştırın (sosyal medya paylaşım görseli yeniden üretilir).

---

## 8. SEO

Otomatik olarak üretilir, ek bir işlem gerekmez:

- Her sayfa için benzersiz `<title>` ve `meta description`
- Open Graph + Twitter Card etiketleri
- `canonical` URL ve `hreflang` (`tr-TR` + `x-default`)
- **Schema.org `Event`** — ana sayfa ve biletler sayfasında; etkinlik adı, tarih, mekân, organizatör ve bilet fiyatlarını içerir (Google etkinlik zengin sonuçları için)
- `Organization`, `WebSite`, `BreadcrumbList`, `FAQPage`, `ItemList` şemaları
- `sitemap-index.xml` + `sitemap-0.xml` (`@astrojs/sitemap`)
- `robots.txt` (`src/pages/robots.txt.ts` içinde üretilir)
- Semantik HTML ve tek `h1` kuralına uyan başlık hiyerarşisi

**Alan adı değişirse** iki yeri güncelleyin: `astro.config.mjs` → `SITE_URL` ve `src/config/site.ts` → `SITE_URL`.

**İngilizce versiyon eklemek isterseniz:** `astro.config.mjs` içindeki `i18n.locales` dizisine `'en'`, `src/config/site.ts` içindeki `DILLER` dizisine `{ kod: 'en', hreflang: 'en-US', prefix: '/en' }` ekleyin ve sayfaları `src/pages/en/` altına koyun. `hreflang` etiketleri otomatik üretilir.

---

## 9. Yayına alma (deploy)

Site tamamen statiktir; `dist/` klasörünü herhangi bir statik barındırıcıya yükleyebilirsiniz.

### Cloudflare Pages

| Ayar | Değer |
| --- | --- |
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | `20` (ortam değişkeni: `NODE_VERSION=20`) |

### Netlify

| Ayar | Değer |
| --- | --- |
| Build command | `npm run build` |
| Publish directory | `dist` |

`public/_headers` (önbellek + güvenlik başlıkları) ve `public/_redirects` (kısa URL yönlendirmeleri) her iki platformda da otomatik okunur.

---

## 10. Proje yapısı

```
AntCon/
├── images/
│   ├── AntCon-Logo.png         Ana logo
│   └── galeri/<yıl>/           Galeri fotoğrafları — buraya dosya atın
├── public/                     Doğrudan kopyalanan dosyalar (favicon, manifest, _headers)
├── scripts/
│   ├── generate-assets.mjs     Logodan favicon/OG üretici
│   ├── foto-hazirla.mjs        Fotoğrafları 2000px'e indirger
│   └── denetim.mjs             Derlenmiş HTML'i a11y/SEO açısından tarar
├── src/
│   ├── assets/                 Üretilmiş logo varyantları
│   ├── components/             Yeniden kullanılabilir bileşenler
│   │   ├── Navbar.astro            Mobilde hamburger menü
│   │   ├── Footer.astro
│   │   ├── GeriSayim.astro         Gün/saat/dakika/saniye sayacı
│   │   ├── Carousel.astro          Otomatik oynatma + ok/nokta + swipe
│   │   ├── KonusmaciKarti.astro
│   │   ├── ProgramZamanCizelgesi.astro
│   │   ├── SponsorIzgarasi.astro
│   │   ├── SssAkordiyon.astro      Native <details> — sıfır JS
│   │   ├── BiletKarti.astro
│   │   ├── EtkinlikKarti.astro
│   │   ├── IletisimFormu.astro     Web3Forms entegrasyonu
│   │   ├── YapiskanBiletCta.astro  Kaydırınca görünen "Bilet Al"
│   │   ├── SayfaBasligi.astro
│   │   ├── BolumBasligi.astro
│   │   └── Ikon.astro              Tüm SVG ikonlar tek dosyada
│   ├── config/
│   │   ├── site.ts             ⭐ Merkezî ayarlar (tarih, iletişim, menü, sosyal)
│   │   └── gorsel-metinleri.ts Görsel alt metinleri
│   ├── content/                ⭐ Tüm içerik burada
│   ├── content.config.ts       İçerik şemaları
│   ├── layouts/BaseLayout.astro  SEO + head + iskelet
│   ├── lib/
│   │   ├── gorseller.ts        images/galeri/<yıl>/ klasörlerini otomatik tarar
│   │   ├── icerik.ts           İçerik sorguları ve biçimlendirme
│   │   └── schema.ts           Schema.org üreticileri
│   ├── pages/                  Her dosya bir URL
│   └── styles/global.css       ⭐ Marka teması ve bileşen sınıfları
└── astro.config.mjs
```

---

## 11. Performans ve erişilebilirlik notları

- **Sıfır framework JS.** Sayfalarda yalnızca birkaç KB'lık kendi yazdığımız script çalışır (menü, geri sayım, carousel, form, galeri).
- **Görseller** derleme sırasında WebP'ye dönüştürülür, `srcset` ile çoklu boyut üretilir, ilk görsel dışında hepsi `lazy` yüklenir.
- **Fontlar** self-hosted'dır (`@fontsource-variable`); harici font isteği yoktur.
- **Klavye:** tüm interaktif öğeler odaklanabilir, "İçeriğe geç" bağlantısı vardır, carousel ok tuşlarıyla gezilir, akordiyon ve galeri penceresi native HTML semantiği kullanır.
- **ARIA:** carousel (`aria-roledescription="karusel"`, slayt etiketleri, duraklat butonu), mobil menü (`aria-expanded`, `aria-controls`), geri sayım (`aria-live` özeti saniye başı değil gün başı güncellenir).
- **`prefers-reduced-motion`** tercihinde animasyonlar ve otomatik carousel geçişi devre dışı kalır.

---

## 12. Bilinmesi gerekenler

- **Program dosyaları taslak:** `src/content/program/` altındaki 10 oturum benim yazdığım **örneklerdir**, gerçek 2026 programı değil. Hepsi `taslak: true` olduğu için sitede görünmüyorlar. Gerçek programı girdiğinizde `taslak: false` yapın — o an ana sayfadaki "Program başlığı" rakamı ve arşiv sayfasındaki zaman çizelgesi kendiliğinden dolar.
- **Bilet dosyaları taslak:** `src/content/biletler/` altındaki dört dosya `taslak: true` ve fiyatları örnektir. Satış açılırken hem fiyatları hem `taslak`/`durum` alanlarını güncelleyin (Bölüm 3.2).
- **Konuşmacı unvanları ve biyografileri boş.** Gerçek kişilerin unvanını uydurmamak için `unvan` ve `kisaBio` alanlarını boş bıraktım; kart o durumda isim + `@kullanıcı` gösteriyor. Doğru bilgiyi öğrendiğinizde ilgili `.md` dosyasına yazmanız yeterli.
- **Doğrulanması gereken tek link:** Alican Develioğlu'nun Instagram kullanıcı adını "Heretik Podcast" isminden `heretikpodcast` olarak türettim. Farklıysa `src/content/konusmacilar/2026-02-alican-develioglu.md` içindeki iki satırı düzeltin (dosyada not olarak da duruyor).
- **Mages Market logosu ve Instagram adresi:** `src/content/sponsorlar/2026-01-mages-market.md` içindeki yorum satırlarını açıp doldurun. Logo gelene kadar grid, sponsorun adını okunaklı bir metin kutusu olarak gösteriyor.
- **Mekân bilgisi:** `src/config/site.ts` içindeki `ETKINLIK.mekan` şu an boş (planlama aşaması). Mekân belli olunca `ad`, `adres`, `ilce`, `postaKodu` ve `haritaEmbed` (Google Haritalar → Paylaş → Haritayı yerleştir → `src` değeri) alanlarını doldurun; adres bloğu ve harita otomatik görünür.
- **Gizlilik metni:** `src/pages/gizlilik.astro` bir şablondur; yayına almadan önce hukuki kontrolden geçirin.
- **Sponsor ve konuşmacı görselleri:** ilgili `.md` dosyasıyla **aynı klasöre** koyup `logo: ./firma.png` / `foto: ./ad-soyad.jpg` şeklinde referans verin. Görsel yoksa sistem otomatik olarak okunaklı bir yer tutucu (baş harfler / firma adı) gösterir.
