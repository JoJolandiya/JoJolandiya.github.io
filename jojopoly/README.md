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

## Kendi kare görsellerini (PNG) ekleme

Tahta artık kod tarafında kurulan bir iskelet (20 kare, halka şeklinde
dizili) ve her karenin üstüne senin hazırladığın PNG'yi otomatik yüklüyor.

1. `tiles-config.js` dosyasını aç — her karenin `image` alanında hangi
   dosya adını beklediğini görürsün (ör. `00-go.png`, `03-stand.png`).
2. Çizdiğin PNG'yi tam o isimle `images/tiles/` klasörüne koy.
3. Sayfayı yenile — kare otomatik olarak senin görselini gösterir.

PNG henüz yoksa kare, tipinin rengiyle + adıyla ("Bölge", "Stand Özelliği"
vb.) bir yer tutucu gösteriyor, yani sayfa hiçbir zaman "kırık" görünmüyor.

**Önerilen PNG boyutu:** kare format, 256x256 piksel. Hepsini aynı
çözünürlükte tutman görsel tutarlılık için önemli.

Kare sırasını/tipini değiştirmek istersen de yine `tiles-config.js`
içinden düzenleyebilirsin — kod tarafında başka bir şeye dokunmana
gerek yok.

## Şu an eksik olan / bir sonraki adımlar

1. **Gerçek piyon modelleri:** Piyonlar hâlâ basit renkli silindirler.
   Blockbench'ten çıkardığın piyon `.glb` dosyaları hazır olunca
   GLTFLoader ile bunları değiştireceğiz.
2. **Gerçek çok oyunculu bağlantı:** `app.js` içindeki oda/oyuncu mantığı şu an
   tamamen sahte (setTimeout ile simüle ediliyor). Bunun yerine Socket.io +
   Render.com üzerinde çalışan bir Node.js sunucusu bağlanacak.
3. **Zar atma / hareket / çatışma:** Henüz hiç oyun mantığı yok, sadece
   görsel iskelet var.
4. **Kart sistemi:** Kart yuvası şu an sadece dekoratif placeholder.

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
