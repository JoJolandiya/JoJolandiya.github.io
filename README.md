# Manga Sitesi — Kurulum Kılavuzu

## 1. GitHub Pages'e Yükleme

1. GitHub'da `kullaniciadin.github.io` adında bir repo oluştur (bkz. daha önce konuştuğumuz adımlar).
2. Bu klasördeki **tüm dosyaları** (index.html, manga.html, chapter.html, style.css, data.js, images/ klasörü) o repoya yükle.
3. Settings → Pages → Branch: main → Save.
4. Birkaç dakika sonra site şurada yayında olur: `https://kullaniciadin.github.io`

## 2. Manga ve Bölüm Ekleme (data.js dosyası)

Her şey `data.js` dosyasından yönetiliyor. Yeni bölüm veya manga eklemek için sadece bu dosyayı düzenlemen yeterli, HTML dosyalarına dokunmana gerek yok.

**Yeni bölüm eklemek için:**
```js
{
  id: "3",
  title: "Bölüm 3: Fırtına",
  date: "2026-07-25",
  pageCount: 18   // o bölümdeki resim sayısı
}
```
Bunu ilgili mangadaki `chapters` listesine ekle.

**Yeni manga eklemek için:** `MANGA_LIST` dizisinin sonuna virgülle ayırarak yeni bir blok ekle (örnekteki gibi).

## 3. Resimleri Yükleme

Görselleri şu klasör yapısına göre koy:

```
images/
  <manga-id>/
    cover.jpg                 <- manga kapağı (isteğe bağlı)
    chapter-<chapter-id>/
      001.jpg
      002.jpg
      003.jpg
      ...
```

Örnek: `example-manga` id'li mangada 2. bölümün 5. sayfası şurada olmalı:
`images/example-manga/chapter-2/005.jpg`

**Önemli:** Dosya adları 3 haneli olmalı (001, 002, ... 015 gibi), yoksa sıralama karışabilir.
`pageCount` değeri o klasördeki resim sayısıyla birebir aynı olmalı.

## 4. Yorumları Aktif Etme (Giscus)

Giscus, GitHub üzerinden çalışan ücretsiz bir yorum sistemi. Kurulumu:

1. https://giscus.app adresine git.
2. Kendi repo adını gir (`kullaniciadin/kullaniciadin.github.io`).
3. Repo'nun **Public** olduğundan ve **Discussions** özelliğinin açık olduğundan emin ol (Repo → Settings → Features → Discussions'ı işaretle).
4. Giscus sayfasında bir kategori seç (örn. "General").
5. Sayfa sana `data-repo-id` ve `data-category-id` değerlerini verecek.
6. Bu değerleri `data.js` içindeki `GISCUS_CONFIG` bölümüne yapıştır:

```js
const GISCUS_CONFIG = {
  repo: "kullaniciadin/kullaniciadin.github.io",
  repoId: "gerçek_repo_id_buraya",
  category: "General",
  categoryId: "gerçek_category_id_buraya"
};
```

Bu kadar — her bölüm sayfasının altında otomatik olarak yorum alanı çıkacak.

## 5. Discord Butonu

`data.js` dosyasının en üstündeki şu satırı kendi Discord davet linkinle değiştir:

```js
const DISCORD_INVITE_URL = "https://discord.gg/senin-davet-linkin";
```

## 6. Site Adını Değiştirme

Şu an her sayfada "Site Adı" yazıyor ve logo yerine 読 karakteri (mühür) kullanılıyor.
Değiştirmek için üç HTML dosyasında (`index.html`, `manga.html`, `chapter.html`) şu kısmı bul ve düzenle:

```html
<div class="seal-mark">読</div>
<div class="brand-name">Site Adı</div>
```

`読` yerine istersen kendi logonun baş harfini (örn. "M") ya da küçük bir logo görseli koyabilirsin.

## Telif Hakkı Notu

Çevirdiğin bölümler senin emeğin olsa da, orijinal manga görselleri büyük ihtimalle telif hakkı altında.
Küçük çaplı, kişisel/topluluk amaçlı tutman ve site trafiğini büyütmemen bu açıdan daha güvenli bir yol olur.
