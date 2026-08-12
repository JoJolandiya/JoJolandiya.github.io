// =========================================================
// JOJOPOLY — Lobi mantığı (foundation / prototip)
//
// ÖNEMLİ: Bu dosyada gerçek bir sunucu bağlantısı YOK.
// Oda kodu üretimi ve oyuncu doldurma tamamen yerel (mock).
// İleride buraya Socket.io client eklenip gerçek odalar,
// gerçek oyuncular ve gerçek "sıra" senkronizasyonu bağlanacak.
// Şu an yalnızca UI akışını ve tahtayı göstermek amaçlı.
// =========================================================

const state = {
  roomCode: null,
  players: [
    { name: "Sen", filled: true },
    { name: "Oyuncu 2", filled: false },
    { name: "Oyuncu 3", filled: false },
    { name: "Oyuncu 4", filled: false },
  ],
};

// ---------- Ekran / panel geçişleri ----------

function showPanel(id) {
  document.querySelectorAll(".panel-block").forEach((el) => {
    el.classList.toggle("is-active", el.id === id);
  });
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((el) => {
    el.classList.toggle("is-active", el.id === id);
  });
  if (id === "board-screen") {
    // Tahta ekranına geçildiğinde Three.js sahnesinin boyutunu güncelle
    window.dispatchEvent(new Event("resize"));
  }
}

document.querySelectorAll("[data-back]").forEach((btn) => {
  btn.addEventListener("click", () => showPanel(btn.dataset.back));
});

// ---------- Oda kodu üretimi (mock) ----------

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // karışabilecek karakterler çıkarıldı
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function renderPlayerSlots() {
  const container = document.getElementById("player-slots");
  container.innerHTML = "";
  state.players.forEach((p) => {
    const slot = document.createElement("div");
    slot.className = "player-slot" + (p.filled ? "" : " is-empty");
    slot.innerHTML = `
      <span class="slot-dot"></span>
      <span class="slot-label">${p.filled ? p.name : "Bekleniyor..."}</span>
    `;
    container.appendChild(slot);
  });

  const allFilled = state.players.every((p) => p.filled);
  document.getElementById("btn-goto-board").disabled = !allFilled;
}

function enterRoom(code) {
  state.roomCode = code;
  document.getElementById("room-code-display").textContent = code;
  renderPlayerSlots();
  showPanel("mode-room");

  // Prototip amaçlı: 4 saniye içinde sahte oyuncuların katıldığını simüle et
  let joined = 1;
  const interval = setInterval(() => {
    if (joined >= state.players.length) {
      clearInterval(interval);
      return;
    }
    state.players[joined].filled = true;
    joined++;
    renderPlayerSlots();
  }, 1200);
}

// ---------- Buton olayları ----------

document.getElementById("btn-create").addEventListener("click", () => {
  state.players = [
    { name: "Sen", filled: true },
    { name: "Oyuncu 2", filled: false },
    { name: "Oyuncu 3", filled: false },
    { name: "Oyuncu 4", filled: false },
  ];
  enterRoom(generateRoomCode());
});

document.getElementById("btn-join").addEventListener("click", () => {
  showPanel("mode-join");
  document.getElementById("join-code-input").focus();
});

document.getElementById("btn-join-confirm").addEventListener("click", () => {
  const input = document.getElementById("join-code-input");
  const code = input.value.trim().toUpperCase();
  if (code.length < 5) {
    input.focus();
    return;
  }
  state.players = [
    { name: "Oda Kurucusu", filled: true },
    { name: "Sen", filled: true },
    { name: "Oyuncu 3", filled: false },
    { name: "Oyuncu 4", filled: false },
  ];
  enterRoom(code);
});

document.getElementById("btn-copy-code").addEventListener("click", async () => {
  if (!state.roomCode) return;
  try {
    await navigator.clipboard.writeText(state.roomCode);
    const btn = document.getElementById("btn-copy-code");
    const original = btn.textContent;
    btn.textContent = "Kopyalandı ✓";
    setTimeout(() => (btn.textContent = original), 1500);
  } catch (e) {
    // Panoya erişim yoksa sessizce yoksay
  }
});

document.getElementById("btn-preview").addEventListener("click", () => {
  showScreen("board-screen");
});

document.getElementById("btn-goto-board").addEventListener("click", () => {
  showScreen("board-screen");
});

document.getElementById("btn-leave-board").addEventListener("click", () => {
  showScreen("lobby-screen");
});
