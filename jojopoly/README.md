# JOJOPOLY — Temel (Foundation)

Bu, oyunun **oynanamayan** ilk temeli. Amaç: tahtanın görünmesi ve maç başlatma
akışının (lobi) çalışması. Gerçek çok oyunculu bağlantı, zar mantığı, çatışma
sistemi henüz yok.

## Dosyalar

- `index.html` — Sayfanın iskeleti (lobi ekranı + tahta ekranı)
- `styles.css` — Tüm görsel tasarım (manga temalı: siyah/krem + halftone doku)
- `app.js` — Lobi mantığı: oda kodu üretme, oyuncu slotlarını doldurma (şu an tamamen yerel/sahte, sunucu yok)
- `board.js` — Three.js ile tahtanın 3D placeholder görünümü (24 kare, renk kodlu, 4 piyon)

## Nasıl önizlersin

Tarayıcıda `index.html` dosyasını doğrudan açman genelde yeterli, ama bazı
tarayıcılar `type="module"` script'leri `file://` üzerinden engelliyor. Sorun
yaşarsan basit bir yerel sunucu aç:

```bash
# proje klasöründeyken
python3 -m http.server 8000
```

sonra tarayıcıda `http://localhost:8000` adresine git.

## GitHub Pages'e koyarken

Bu klasörü doğrudan `jojolandiya.github.io/oyun/` gibi bir alt klasöre
kopyalaman yeterli — hiçbir build adımı yok, düz dosyalar.

## Mekanik prototipi nasıl test edilir

"Sadece tahtayı önizle" ya da bir oda kurup "Tahtaya Geç" dediğinde artık
**gerçekten oynanabilen** yerel (hotseat) bir prototip açılıyor:

1. Sırası gelen oyuncu (üst-sol köşedeki oyuncu şeridinde vurgulanan) elindeki
   Stand kartlarını (varsa) kullanabilir — karta tıklaman yeterli.
2. **Zar At**'a bas — tahtada ilerlersin, geldiğin karenin eylemi otomatik
   çalışır.
3. Bir Bölge karesine geldiğinde ve bir aksiyon bekleniyorsa (mesela muhafız
   yerleştirme), alt bardaki uyarıyı takip et — elindeki uygun karta tıkla.
4. Kartların üstüne mouse ile gelince açıklamalarını gösteren bir tooltip
   çıkar.
5. Sıra otomatik olarak bir sonraki (hayatta kalan) oyuncuya geçer.
6. Bir oyuncunun canı biterse elenir; son kalan oyuncu kazanır.

**Not:** Bu tamamen yerel bir simülasyon — 4 "oyuncu" da aynı ekrandan,
sırayla, aynı tarayıcıda oynanıyor. Gerçek online çok oyunculuk (her oyuncu
kendi cihazından) sonraki aşamada eklenecek.

Tüm sayısal değerler (can, kaynak, çatışma formülü, kart havuzları) ve
kare sırası `game-data.js` dosyasında tek bir yerde toplu — dengelemeye
oradan devam edebiliriz.

## Şu an eksik olan / bir sonraki adımlar

1. **Görsel taraf henüz eklenmedi** — kareler hâlâ kod-tabanlı placeholder
   (renk + isim), muhafızlar tahtada küçük renkli küpler olarak görünüyor.
   Kendi PNG'lerin ve 3D modellerin hazır olunca bunları entegre edeceğiz.
2. **Gerçek çok oyunculu bağlantı:** `app.js` içindeki oda/oyuncu mantığı şu an
   tamamen sahte (setTimeout ile simüle ediliyor). Bunun yerine Socket.io +
   Render.com üzerinde çalışan bir Node.js sunucusu bağlanacak.
3. **Kart havuzları placeholder:** `game-data.js` içindeki `STAND_POOL` ve
   `GUARDIAN_POOL` gerçek kart tasarımlarıyla doldurulacak.
4. **Sayısal dengeleme:** Can, kaynak, çatışma formülü gibi tüm değerler
   ilk test turlarına göre ayarlanacak.
5. **Yuva açma (kaynakla satın alma)** henüz UI'da yok — mantık `CONFIG`
   içinde tanımlı ama tıklanabilir bir buton eklenmedi.

## Renk/Tipografi Sistemi

| Token | Değer | Kullanım |
|---|---|---|
| ink | `#0A0A0A` | Ana zemin, metin |
| paper | `#EDEAE9` | Kağıt/panel zemini |
| gold | `#D4AF37` | Vurgu, Speedwagon/GO |
| magenta | `#E63980` | Ana aksiyon, Locacaca |
| violet | `#6E2FE8` | Stand özelliği |
| teal | `#1FB6A6` | Mikitaka bonusu |

Başlık fontu: **Bebas Neue** (dramatik, manga başlık hissi)
Gövde fontu: **Work Sans**
Kod/oda kodu fontu: **JetBrains Mono**
