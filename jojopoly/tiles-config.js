// =========================================================
// JOJOPOLY — Kare (tile) yapılandırması
//
// Burada tahtandaki 20 karenin sırasını, tipini ve (varsa)
// kendi çizdiğin PNG dosyasının adını tanımlıyorsun.
//
// image alanı boş/yanlışsa sorun değil — o kare otomatik
// olarak rengi + adıyla bir "yer tutucu" gösterir. Sen PNG'yi
// /images/tiles/ klasörüne doğru isimle koyduğunda, sayfayı
// yenilediğinde otomatik olarak o görsel kareye oturur.
//
// PNG önerisi: kare format (ör. 256x256), aynı tarzda
// (aynı kontur kalınlığı, aynı palet) çizilmiş olmaları en
// tutarlı sonucu verir.
// =========================================================

export const TILE_TYPE_COLORS = {
  GO: 0xd4af37,
  BOLGE: 0xc9a876,
  STAND_OZELLIGI: 0x6e2fe8,
  MIKITAKA: 0x1fb6a6,
  GREEN_DOLPHIN: 0x2b2b2b,
  GREEN_DOLPHIN_GIT: 0xc81d3b,
  SPEEDWAGON: 0xe8a33d,
  LOCACACA: 0xe63980,
};

export const TILE_TYPE_LABELS = {
  GO: "Tur Ödülü",
  BOLGE: "Bölge",
  STAND_OZELLIGI: "Stand Özelliği",
  MIKITAKA: "Mikitaka Bonusu",
  GREEN_DOLPHIN: "Green Dolphin",
  GREEN_DOLPHIN_GIT: "Green Dolphin'e Git",
  SPEEDWAGON: "Speedwagon Vakfı",
  LOCACACA: "Locacaca",
};

// 20 kare, saat yönünde. Köşeler index 0 / 5 / 10 / 15.
// "image" alanına kendi dosya adını yaz (images/tiles/ altına koy).
export const TILES = [
  { id: 0, type: "GO", image: "00-go.png" },
  { id: 1, type: "BOLGE", image: "01-bolge.png" },
  { id: 2, type: "BOLGE", image: "02-bolge.png" },
  { id: 3, type: "STAND_OZELLIGI", image: "03-stand.png" },
  { id: 4, type: "MIKITAKA", image: "04-mikitaka.png" },

  { id: 5, type: "GREEN_DOLPHIN", image: "05-green-dolphin.png" },
  { id: 6, type: "BOLGE", image: "06-bolge.png" },
  { id: 7, type: "BOLGE", image: "07-bolge.png" },
  { id: 8, type: "STAND_OZELLIGI", image: "08-stand.png" },
  { id: 9, type: "LOCACACA", image: "09-locacaca.png" },

  { id: 10, type: "SPEEDWAGON", image: "10-speedwagon.png" },
  { id: 11, type: "BOLGE", image: "11-bolge.png" },
  { id: 12, type: "BOLGE", image: "12-bolge.png" },
  { id: 13, type: "STAND_OZELLIGI", image: "13-stand.png" },
  { id: 14, type: "MIKITAKA", image: "14-mikitaka.png" },

  { id: 15, type: "GREEN_DOLPHIN_GIT", image: "15-green-dolphin-git.png" },
  { id: 16, type: "BOLGE", image: "16-bolge.png" },
  { id: 17, type: "BOLGE", image: "17-bolge.png" },
  { id: 18, type: "STAND_OZELLIGI", image: "18-stand.png" },
  { id: 19, type: "LOCACACA", image: "19-locacaca.png" },
];

export const CORNER_IDS = new Set([0, 5, 10, 15]);
export const TILES_PER_SIDE = 5; // köşe dahil, 4 kenar x 5 = 20
export const IMAGE_BASE_PATH = "images/tiles/";
