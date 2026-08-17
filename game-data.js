// =========================================================
// JOJOPOLY — Oyun verileri (TAMAMEN PLACEHOLDER)
//
// Bu dosyadaki tüm sayısal değerler, kart isimleri ve
// açıklamaları geçici. Dengeleme aşamasında burayı
// güncelleyeceğiz — kod tarafı değişmeyecek, sadece bu
// verileri düzenlemen yeterli olacak.
// =========================================================

// ---------- Genel sayısal değerler (placeholder) ----------
export const CONFIG = {
  START_HEALTH: 20,
  START_RESOURCE: 5,
  GO_REWARD: 3,
  SPEEDWAGON_INCREMENT: 2, // her GO turunda vakfa eklenen miktar
  COMBAT_ATTACKER_BASE: 2, // saldıranın zar dışı sabit gücü
  COMBAT_DAMAGE_ON_LOSS: 2, // saldıran kaybederse can kaybı
  JAIL_ESCAPE_THRESHOLD: 4, // Green Dolphin'den kaçmak için gereken zar
  LOCACACA_SHIFT: 3, // Locacaca'da el değiştiren miktar
  MAX_GUARDIANS_PER_TILE: 3,
  SLOT_UPGRADE_BASE_COST: 4, // ilk yuva açma maliyeti
  SLOT_UPGRADE_INCREMENT: 3, // her yeni yuva bir öncekinden bu kadar pahalı
};

// ---------- Karakterler (placeholder ataması) ----------
export const CHARACTERS = [
  { id: "jotaro", name: "Jotaro Kujo", stand: "Star Platinum", color: 0xe63980 },
  { id: "josuke", name: "Josuke Higashikata", stand: "Crazy Diamond", color: 0xd4af37 },
  { id: "giorno", name: "Giorno Giovanna", stand: "Gold Experience", color: 0x6e2fe8 },
  { id: "jolyne", name: "Jolyne Cujoh", stand: "Stone Free", color: 0x1fb6a6 },
];

// ---------- Kare tipleri: renk + isim ----------
export const TILE_TYPE_COLORS = {
  GO: 0xd4af37,
  BOLGE: 0xc9a876,
  STAND_CEKME: 0x6e2fe8,
  MUHAFIZ_CEKME: 0x3f6fb0,
  MIKITAKA: 0x1fb6a6,
  GREEN_DOLPHIN: 0x2b2b2b,
  GREEN_DOLPHIN_GIT: 0xc81d3b,
  SPEEDWAGON: 0xe8a33d,
  LOCACACA: 0xe63980,
};

export const TILE_TYPE_LABELS = {
  GO: "Tur Ödülü",
  BOLGE: "Bölge",
  STAND_CEKME: "Stand Özelliği Çek",
  MUHAFIZ_CEKME: "Muhafız Çek",
  MIKITAKA: "Mikitaka Bonusu",
  GREEN_DOLPHIN: "Green Dolphin",
  GREEN_DOLPHIN_GIT: "Green Dolphin'e Git",
  SPEEDWAGON: "Speedwagon Vakfı",
  LOCACACA: "Locacaca",
};

// ---------- 24 karelik tahta dizilimi ----------
// Saat yönünde, köşeler index 0 / 6 / 12 / 18.
export const CORNER_IDS = new Set([0, 6, 12, 18]);
export const TILES_PER_SIDE = 6;

export const TILES = [
  { id: 0, type: "GO" },
  { id: 1, type: "BOLGE" },
  { id: 2, type: "BOLGE" },
  { id: 3, type: "STAND_CEKME" },
  { id: 4, type: "MUHAFIZ_CEKME" },
  { id: 5, type: "MIKITAKA" },

  { id: 6, type: "GREEN_DOLPHIN" },
  { id: 7, type: "BOLGE" },
  { id: 8, type: "STAND_CEKME" },
  { id: 9, type: "BOLGE" },
  { id: 10, type: "MUHAFIZ_CEKME" },
  { id: 11, type: "BOLGE" },

  { id: 12, type: "SPEEDWAGON" },
  { id: 13, type: "BOLGE" },
  { id: 14, type: "BOLGE" },
  { id: 15, type: "STAND_CEKME" },
  { id: 16, type: "MUHAFIZ_CEKME" },
  { id: 17, type: "BOLGE" },

  { id: 18, type: "GREEN_DOLPHIN_GIT" },
  { id: 19, type: "BOLGE" },
  { id: 20, type: "STAND_CEKME" },
  { id: 21, type: "BOLGE" },
  { id: 22, type: "MUHAFIZ_CEKME" },
  { id: 23, type: "LOCACACA" },
];

// ---------- Stand Özelliği havuzu (placeholder) ----------
// owner: null ise herkese eşit güçte çalışır.
// owner bir karaktere eşitse, o karakteri oynayan oyuncu için
// value iki katına çıkar (basit "affinite" kuralı).
export const STAND_POOL = [
  {
    id: "s1",
    name: "Za Warudo (Parçası)",
    owner: "jotaro",
    effect: "EXTRA_ROLL",
    value: 1,
    desc: "Sırası biten oyuncuya ekstra bir zar hakkı daha verir.",
  },
  {
    id: "s2",
    name: "Dora Dokuş",
    owner: "josuke",
    effect: "HEAL",
    value: 3,
    desc: "Anında can yeniler.",
  },
  {
    id: "s3",
    name: "Altın Rüzgar",
    owner: "giorno",
    effect: "COMBAT_BUFF",
    value: 2,
    desc: "Bir sonraki çatışmada ekstra güç sağlar.",
  },
  {
    id: "s4",
    name: "Özgür Taş",
    owner: "jolyne",
    effect: "RESOURCE_GAIN",
    value: 3,
    desc: "Anında kaynak kazandırır.",
  },
  {
    id: "s5",
    name: "Bilinmeyen Stand Fısıltısı",
    owner: null,
    effect: "COMBAT_BUFF",
    value: 1,
    desc: "Herkes için eşit güçte küçük bir çatışma bonusu.",
  },
];

// ---------- Muhafız havuzu (placeholder) ----------
// kind: "GUARDIAN" -> bölgeye yerleştirilebilir
// kind: "BOOST"    -> sende zaten olan bir muhafızı güçlendirir
export const GUARDIAN_POOL = [
  { id: "g1", kind: "GUARDIAN", name: "Polnareff Muhafızı", power: 3, desc: "Standart güçte bir muhafız." },
  { id: "g2", kind: "GUARDIAN", name: "Kakyoin Muhafızı", power: 3, desc: "Standart güçte bir muhafız." },
  { id: "g3", kind: "GUARDIAN", name: "Avdol Muhafızı", power: 4, desc: "Biraz daha güçlü bir muhafız." },
  { id: "g4", kind: "BOOST", name: "Güçlendirme Parçası", power: 2, desc: "Sahip olduğun bir bölgedeki muhafıza güç ekler." },
];

export function drawFromPool(pool) {
  const card = pool[Math.floor(Math.random() * pool.length)];
  return { ...card, instanceId: `${card.id}-${Date.now()}-${Math.floor(Math.random() * 9999)}` };
}
