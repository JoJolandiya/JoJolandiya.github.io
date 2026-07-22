/* ==========================================================
   SİTE VERİLERİ
   Yeni manga veya bölüm eklemek için SADECE bu dosyayı düzenle.
   ========================================================== */

// Discord sunucu linkin (üstteki butona bunu koy)
const DISCORD_INVITE_URL = "https://discord.gg/senin-davet-linkin";

// Giscus yorum ayarların (bkz. README.md - "Yorumları Aktif Etme")
const GISCUS_CONFIG = {
  repo: "kullaniciadin/kullaniciadin.github.io",
  repoId: "BURAYA_REPO_ID",
  category: "General",
  categoryId: "BURAYA_CATEGORY_ID"
};

const MANGA_LIST = [
  {
    id: "example-manga",           // URL'de kullanılacak, boşluksuz, küçük harf
    title: "Örnek Manga Adı",
    cover: "images/example-manga/cover.jpg", // kapak resmi (isteğe bağlı)
    description: "Buraya mangan hakkında kısa bir açıklama yaz.",
    chapters: [
      {
        id: "1",
        title: "Bölüm 1: Başlangıç",
        date: "2026-07-22",
        pageCount: 3   // klasördeki resim sayısı
      },
      {
        id: "2",
        title: "Bölüm 2",
        date: "2026-07-22",
        pageCount: 0   // henüz yok, 0 bırak veya satırı sil
      }
    ]
  }

  // Yeni manga eklemek için buraya virgülle ayırarak yeni bir { ... } bloğu ekle.
];
