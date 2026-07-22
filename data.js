/* ==========================================================
   SİTE VERİLERİ
   Yeni manga veya bölüm eklemek için SADECE bu dosyayı düzenle.
   ========================================================== */

// Discord sunucu linkin (üstteki butona bunu koy)
const DISCORD_INVITE_URL = "https://discord.gg/4DF5mbQyC7";

// Giscus yorum ayarların (bkz. README.md - "Yorumları Aktif Etme")
const GISCUS_CONFIG = {
  repo: "JoJolandiya/JoJolandiya.github.io",
  repoId: "R_kgDOTgcpvg",
  category: "General",
  categoryId: "DIC_kwDOTgcpvs4DBv34"
};

const MANGA_LIST = [
  {
    id: "jojolands",           // URL'de kullanılacak, boşluksuz, küçük harf
    title: "JoJo's Bizarre Adventure Part 9 The JOJOLands",
    cover: "images/jojolands/cover.jpg", // kapak resmi (isteğe bağlı)
    description: "JoJo's Bizarre Adventure serinin 9. bölümüdür. Jodio Joestar'ın zengin olma hikayesidir.",
    chapters: [
      {
        id: "35",
        title: "Bölüm 35: Usagi, Dolandırıcılık ve Şüphe Kısım 3",
        date: "2026-07-22",
        pageCount: 35   // klasördeki resim sayısı
      },
      {
        id: "2",
        title: "yok",
        date: "yok",
        pageCount: 0   // henüz yok, 0 bırak veya satırı sil
      }
    ]
  }

  // Yeni manga eklemek için buraya virgülle ayırarak yeni bir { ... } bloğu ekle.
];
