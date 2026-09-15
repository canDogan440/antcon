# AntCon Yönetim Paneli — Kullanım Kılavuzu

Bu kılavuz, AntCon web sitesindeki yazıları, fotoğrafları ve bilet satışı durumunu **hiç kod bilmeden** nasıl değiştireceğinizi adım adım anlatır.

---

## Kısaca

- Panelin adresi: **https://antconvention.com/admin/**
- Bir şeyi değiştirdikten sonra sağ üstteki **Yayınla** düğmesine, ardından **Şimdi yayımla**'ya basarsınız.
- Değişiklik **1-3 dakika içinde** sitede görünür.
- Yanlışlıkla bir şey bozmaktan korkmayın: hatalı bir kayıt siteyi bozmaz, site bir önceki haliyle yayında kalır. Her kayıt geçmişte saklanır ve teknik ekip geri alabilir.

---

## 1. Panele giriş

### İlk kez (davet e-postası ile)

1. Site yöneticisi sizi davet ettiğinde e-posta adresinize bir davet gelir. E-posta **İngilizce** olabilir; konu satırı genellikle *"You've been invited to join…"* şeklindedir.
2. E-postadaki **Accept the invite** bağlantısına tıklayın.
3. AntCon sitesi açılır ve ekranın ortasında küçük bir pencere çıkar. Buraya kendinize bir **şifre** belirleyip onaylayın.
4. Şifreyi belirledikten sonra otomatik olarak yönetim paneline yönlendirilirsiniz.

> Davet bağlantısı bir süre sonra geçersiz olur. Çalışmazsa site yöneticisinden yeni davet isteyin.

### Sonraki girişler

1. Tarayıcıda **https://antconvention.com/admin/** adresini açın. (Bu adresi yer imlerine eklemeniz önerilir.)
2. **Netlify Identity ile Giriş** düğmesine basın.
3. E-posta adresinizi ve şifrenizi yazıp giriş yapın.

### Şifremi unuttum

Giriş penceresindeki **Forgot password?** bağlantısına tıklayın ve e-posta adresinizi yazın. Gelen e-postadaki bağlantıyla yeni şifre belirleyebilirsiniz.

---

## 2. Panelin düzeni

Giriş yaptığınızda solda bölümlerin listesini görürsünüz:

| Bölüm | Ne işe yarar? |
| --- | --- |
| ⚙️ **Genel Ayarlar** | **Bilet satışını açma/kapama**, site adı, logo, e-posta, telefon, sosyal medya hesapları, menüler |
| 📄 **Sayfa Metinleri** | Her sayfadaki başlıklar, açıklamalar ve buton yazıları (Ana Sayfa, Hakkında, Biletler …) |
| 📅 **Etkinlik Yılları** | Her AntCon yılının tarihi, mekânı, özeti ve rakamları |
| 🎤 **Konuşmacılar ve Jüri** | Konuşmacı kartları (fotoğraf, isim, unvan, sosyal medya) |
| 🗓️ **Program Akışı** | Etkinlik günündeki her oturum |
| 🤝 **Sponsorlar** | Sponsor logoları ve seviyeleri |
| 💳 **Bilet Tipleri ve Fiyatlar** | Biletler sayfasındaki fiyat kartları |
| ❓ **Sıkça Sorulan Sorular** | SSS sayfasındaki sorular ve cevaplar |
| 🖼️ **Fotoğraf Galerisi** | Galeri sayfası ve ana sayfadaki kaydırmalı fotoğraflar |

Her alanın altında gri renkte kısa bir **açıklama** vardır; bir alanın ne işe yaradığından emin değilseniz önce onu okuyun.

---

## 3. Bir yazıyı değiştirmek

Örnek: Ana sayfadaki büyük başlığı değiştirmek.

1. Soldan **📄 Sayfa Metinleri**'ne tıklayın.
2. Listeden **Ana Sayfa**'yı seçin.
3. **Ana Sayfa Başlığı** kutusuna yeni başlığı yazın.
4. Sağ üstteki **Yayınla** düğmesine basın, açılan küçük menüden **Şimdi yayımla**'yı seçin.
5. Ekranda kısa süreliğine **"Girdi kaydedildi"** yazısı çıkar ve üstte **DEĞİŞİKLİKLER KAYDEDİLDİ** yazar. Bu kadar!

**Dikkat edilecekler:**

- Sayfanın üstünde kırmızı **KAYDEDİLMEMİŞ DEĞİŞİKLİKLER** yazıyorsa değişikliğiniz henüz kaydedilmedi demektir. Sayfadan çıkmadan önce **Yayınla → Şimdi yayımla** yapın.
- Bazı bölümler kapalı (daraltılmış) gelir. Açmak için bölüm başlığındaki oka tıklayın.
- Açtığınız bir kayıtta alanlar **beklenmedik şekilde boş** görünüyorsa **kaydetmeyin**; sayfayı yenileyin (klavyede **F5**). Boş alanlarla kaydetmek o yazıları siler.

### Yazılarda kullanabileceğiniz kısayollar

Yazılarınıza aşağıdaki kelimeleri **süslü parantezleriyle birlikte** yazarsanız, sitede otomatik olarak güncel bilgiyle değiştirilir:

| Yazdığınız | Sitede görünen (örnek) |
| --- | --- |
| `{aktifYil}` | 2027 (sıradaki etkinlik yılı) |
| `{sonYil}` | 2026 (son gerçekleşen etkinlik yılı) |
| `{tarih}` | Tarih yakında açıklanacak / 27 Haziran 2027 |
| `{email}` | info@antconvention.com |

Böylece yeni yıla geçildiğinde bu yazıları tek tek düzeltmeniz gerekmez. Örneğin *"AntCon {aktifYil} duyurularını kaçırma"* yazarsanız sitede *"AntCon 2027 duyurularını kaçırma"* görünür.

**Kalın yazı:** Açıklamasında izin verildiği belirtilen alanlarda (ör. Ana Sayfa → Karşılama Paragrafı) bir kelimeyi `**iki yıldız**` arasına alırsanız kalın görünür.

Hakkında, Gizlilik, SSS cevapları gibi uzun metinlerde kutunun üstünde **B** (kalın), **I** (eğik), bağlantı ve başlık düğmeleri bulunur; bir kelimeyi seçip bu düğmelere basabilirsiniz.

### Listeye madde eklemek, silmek, sıralamak

Kartlar, menü öğeleri, SSS maddeleri gibi listelerde:

- En alttaki **… Ekle** düğmesi (ör. *Kart Ekle*, *Madde Ekle*) yeni satır ekler.
- Bir satırın sağındaki **✕** işareti o satırı siler.
- Satırları sol kenarlarından tutup **sürükleyerek** sıralarını değiştirebilirsiniz.

---

## 4. Görsel yüklemek

Örnek: Bir konuşmacının fotoğrafını eklemek.

1. Soldan **🎤 Konuşmacılar ve Jüri**'ye girip konuşmacıyı seçin.
2. **Fotoğraf** alanındaki **Bir resim seçin** düğmesine basın. (Fotoğraf zaten varsa **Farklı bir resim seçin**.)
3. Açılan pencerede sağ üstteki **Yükle** düğmesine basın ve bilgisayarınızdan fotoğrafı seçin.
4. Yüklenen fotoğrafa tıklayıp seçin. Kayıt ekranına döndüğünüzde fotoğrafın küçük önizlemesini görürsünüz.
5. **Yayınla → Şimdi yayımla**.

**İpuçları:**

- **Dosya boyutu:** Telefon veya fotoğraf makinesi fotoğrafları çoğu zaman çok büyüktür (5-12 MB). Site bunları otomatik olarak küçültür, ama büyük dosyalar sitenin güncellenmesini yavaşlatır. Mümkünse yüklemeden önce küçültün (ör. ücretsiz **squoosh.app** sitesiyle ya da telefonunuzdan "orta boy" paylaşarak). 1-2 MB yeterlidir.
- **Konuşmacı fotoğrafı:** Dikey fotoğraf en iyi sonucu verir (ideal: 1200×1500 piksel). Fotoğraf yoksa kartta ismin baş harfleri görünür.
- **Logo:** Şeffaf arka planlı **PNG** dosyası kullanın.
- **Açıklama:** Görsel alanlarının yanında genellikle bir *açıklama* kutusu vardır ("Fotoğrafta ne var?"). Görme engelli ziyaretçiler ve Google için fotoğrafta ne olduğunu kısaca yazın, ör. *"Ana sahnede cosplay yarışması finali"*.
- Bir görseli kaldırmak için **Resmi kaldır**'a basın.

### Galeriye fotoğraf eklemek

1. **🖼️ Fotoğraf Galerisi** → ilgili yılı seçin (ör. *AntCon 2026 fotoğrafları*). Yeni bir yıl için sağ üstteki **＋ Yıl Galerisi** düğmesini kullanın.
2. **Fotoğraflar** listesinin en altındaki **Fotoğraf Ekle**'ye basın.
3. Açılan satırda **Bir resim seçin → Yükle** ile fotoğrafı yükleyin ve açıklamasını yazın.
4. **Listedeki ilk fotoğraflar** ana sayfadaki kaydırmalı alanda ve arşiv kapağında kullanılır; öne çıkarmak istediğiniz fotoğrafı sürükleyerek en üste taşıyın.
5. **Yayınla → Şimdi yayımla**.

---

## 5. Bilet satışını açmak / kapatmak

1. Soldan **⚙️ Genel Ayarlar** → **🎟️ Bilet Satışı (Aç / Kapat)**'ı seçin.
2. En üstteki **Bilet Satışı Açık mı?** anahtarını açın (sağa kaydırın, renklenir).
3. Biletleri **Biletix, Bubilet, Passo** gibi başka bir sitede satıyorsanız o sayfanın adresini **Bilet Satış Linki** kutusuna yapıştırın (`https://` ile başlamalı).
4. **Yayınla → Şimdi yayımla**.

**Açtığınızda sitede otomatik olarak:**

- Menüdeki, ana sayfadaki ve sayfanın altındaki tüm **"Haberdar Ol"** butonları **"Bilet Al"** olur ve satış linkine gider.
- **Biletler** sayfası "satış henüz başlamadı" bölümünü gizler, yerine bilet kartlarını veya satış linkini gösterir.
- Hakkında sayfasındaki durum kutusu "Biletler satışta" olur.

**Kapatmak için** aynı anahtarı kapatıp tekrar **Yayınla → Şimdi yayımla** yapmanız yeterli.

### Fiyat kartlarını göstermek (isteğe bağlı)

Biletler sayfasında bilet tiplerini ve fiyatları kart olarak göstermek isterseniz:

1. **💳 Bilet Tipleri ve Fiyatlar** bölümüne girin. (Örnek kartlar hazır: Erken Kayıt, Standart, Atölye Paketi, Öğrenci.)
2. Her kartta fiyatı, açıklamayı ve **Satış Durumu**'nu (*Satışta, Yakında, Tükendi …*) düzenleyin.
3. Kartın en altındaki **Taslak (sitede gizle)** anahtarını **kapatın**. Taslak kartlar sitede görünmez.
4. **Yayınla → Şimdi yayımla**.

Kartlar yalnızca bilet satışı **açıkken** görünür. Bir kartın kendi **Satın Alma Linki** boşsa, Bilet Satışı ayarlarındaki genel satış linki kullanılır.

---

## 6. Etkinlik tarihini ve mekânını girmek

1. **📅 Etkinlik Yılları** → **AntCon 2027**.
2. **Başlangıç Tarihi ve Saati** ile **Bitiş Tarihi ve Saati**'ni seçin. Başlangıç tarihi girildiği an ana sayfada **geri sayım** başlar.
3. **Tarih Yazısı**'nı sitede görünmesini istediğiniz şekilde yazın (ör. *27 Haziran 2027*). İsterseniz **Gün Yazısı** (*Pazar*) ve **Saat Yazısı** (*10:00 - 20:00*) da ekleyin.
4. **Durum**'u *Yaklaşan (tarih açıklandı)* yapın.
5. **Mekân** bölümüne mekân adını ve adresini yazın. İletişim sayfasında adres ve **Google Haritalar** otomatik görünür.
6. **Yayınla → Şimdi yayımla**.

---

## 7. Yeni kayıt eklemek (konuşmacı, sponsor, soru, oturum)

1. İlgili bölüme girin (ör. **🎤 Konuşmacılar ve Jüri**).
2. Sağ üstteki **＋** düğmesine (ör. **＋ Konuşmacı**) basın.
3. Alanları doldurun. **Etkinlik Yılı** alanına kaydın hangi yılın etkinliğine ait olduğunu yazın (ör. *2027*). Yanlış yıl yazılırsa kayıt beklenen sayfada görünmez.
4. **Sıra** alanı, listedeki yerini belirler: küçük sayı önce görünür.
5. **Yayınla → Şimdi yayımla**.

Bir kaydı geçici olarak gizlemek için silmek yerine **Taslak (sitede gizle)** anahtarını açın. Kalıcı olarak silmek için kaydı açıp sağ üstteki **Girdiyi sil** (veya **Yayınlanan girdiyi sil**) seçeneğini kullanın.

> **Geçmiş yılların kayıtlarını silmeyin.** Arşiv sayfaları (ör. *AntCon 2026*) o kayıtları kullanır.

---

## 8. Değişiklikler ne kadar sürede siteye yansır?

- **Yayınla → Şimdi yayımla** dediğiniz anda değişiklik kaydedilir ve site otomatik olarak yeniden hazırlanmaya başlar.
- Bu işlem genellikle **1-3 dakika** sürer. Çok sayıda büyük fotoğraf yüklediyseniz biraz daha uzun sürebilir.
- Süre dolduğunda değişikliği göremiyorsanız tarayıcınızın eski sayfayı hatırlıyor olması muhtemeldir: sayfayı **Ctrl + F5** (Mac'te **Cmd + Shift + R**) ile yenileyin.
- 10 dakika sonra hâlâ görünmüyorsa, bir alanın hatalı doldurulmuş olması nedeniyle güncelleme durdurulmuş olabilir. **Bu durumda site bozulmaz; bir önceki haliyle yayında kalır.** Son yaptığınız değişikliği ve saati not ederek site yöneticisine haber verin.

---

## 9. Yeni yıla geçiş (ör. AntCon 2028)

Bu işlem yılda bir yapılır; **sıraya dikkat edin**:

1. **📅 Etkinlik Yılları → ＋ Etkinlik Yılı** ile *2028* kaydını oluşturun (*Durum: Planlama aşamasında*). Biten yılın kaydında *Durum*'u *Gerçekleşti (arşivde)* yapın.
2. **🖼️ Fotoğraf Galerisi**'ne biten yılın fotoğraflarını ekleyin.
3. **⚙️ Genel Ayarlar → Site Ayarları**: **Sıradaki Etkinlik Yılı**'nı *2028*, **Son Gerçekleşen Etkinlik Yılı**'nı *2027* yapın. Üst menüdeki "AntCon 2026" satırını da güncelleyin.
4. **⚙️ Genel Ayarlar → Bilet Satışı**: satışı kapatın.
5. Yeni konuşmacı, program, sponsor ve SSS kayıtlarını *Etkinlik Yılı: 2028* ile ekleyin.

> 1. adımı yapmadan 3. adımı kaydederseniz site güncellenmez (eski haliyle yayında kalır). Önce yeni yılın kaydını oluşturun.

---

## 10. Sık karşılaşılan durumlar

| Durum | Ne yapmalı? |
| --- | --- |
| "Yayınla" düğmesi gri, basılmıyor | Henüz bir değişiklik yapmadınız ya da zorunlu bir alan boş. Kırmızı uyarı olan alanı doldurun. |
| Bir alan kırmızı çerçeveli | Bu alan zorunlu veya hatalı biçimde (ör. saat *10:00* gibi yazılmalı). Açıklamasını okuyun. |
| "Bu girdi için yerel bir yedekleme kurtarıldı" sorusu | Daha önce kaydetmeden kapattığınız değişiklikler bulundu. Onları kullanmak istiyorsanız **Tamam**, istemiyorsanız **İptal**. |
| Panel açılmıyor / giriş penceresi çıkmıyor | Sayfayı yenileyin. Tarayıcınızın reklam engelleyicisi varsa bu site için kapatın. |
| Yanlışlıkla bir şeyi sildim | Endişelenmeyin; her kayıt geçmişte saklanır. Site yöneticisine hangi kaydı ve ne zaman sildiğinizi söyleyin, geri getirilebilir. |
