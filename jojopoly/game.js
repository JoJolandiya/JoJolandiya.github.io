// =========================================================
// JOJOPOLY — Oyun motoru (yerel/hotseat mekanik prototipi)
//
// Bu, gerçek çok oyunculu bağlantı DEĞİL. Aynı ekranda sırayla
// oynanan, "mekanikler nasıl hissettiriyor" sorusuna cevap
// vermek için yazılmış yerel bir prototip. Ağ katmanı sonraki
// aşamada bunun üzerine eklenecek.
// =========================================================

import { CONFIG, CHARACTERS, TILES, STAND_POOL, GUARDIAN_POOL, drawFromPool } from "./game-data.js";

let state = null;

function createInitialState(playerNames) {
  const players = playerNames.map((name, i) => ({
    id: `p${i}`,
    name,
    character: CHARACTERS[i % CHARACTERS.length],
    color: CHARACTERS[i % CHARACTERS.length].color,
    health: CONFIG.START_HEALTH,
    resource: CONFIG.START_RESOURCE,
    position: 0,
    standSlots: 2,
    guardianSlots: 2,
    standHand: [],
    guardianHand: [],
    jailed: false,
    alive: true,
    pendingCombatBuff: 0,
    pendingExtraRolls: 0,
  }));

  return {
    players,
    currentPlayerIndex: 0,
    tileOwnership: TILES.map(() => ({ ownerId: null, guardians: [] })),
    speedwagonPool: 0,
    log: [],
    gameOver: false,
    winnerId: null,
    pendingAction: null, // { type: 'PLACE_GUARDIAN' | 'APPLY_BOOST', tileIndex }
  };
}

function log(msg) {
  state.log.unshift(msg);
  if (state.log.length > 40) state.log.pop();
  renderLog();
}

function currentPlayer() {
  return state.players[state.currentPlayerIndex];
}

function alivePlayers() {
  return state.players.filter((p) => p.alive);
}

function nextAlivePlayerIndex(fromIndex) {
  let i = fromIndex;
  for (let step = 0; step < state.players.length; step++) {
    i = (i + 1) % state.players.length;
    if (state.players[i].alive) return i;
  }
  return fromIndex;
}

// ---------- Kart kullanımı ----------

function useStandCard(handIndex) {
  const player = currentPlayer();
  if (state.pendingAction) return; // bekleyen bir aksiyon varken kart kullanılamaz
  const card = player.standHand[handIndex];
  if (!card) return;

  const affinity = card.owner === player.character.id;
  const value = affinity ? card.value * 2 : card.value;

  switch (card.effect) {
    case "EXTRA_ROLL":
      player.pendingExtraRolls += value;
      log(`${player.name}, "${card.name}" kullandı — ${value} ekstra zar hakkı kazandı.${affinity ? " (Affinite bonusu!)" : ""}`);
      break;
    case "HEAL":
      player.health += value;
      log(`${player.name}, "${card.name}" kullandı — ${value} can yeniledi.${affinity ? " (Affinite bonusu!)" : ""}`);
      break;
    case "COMBAT_BUFF":
      player.pendingCombatBuff += value;
      log(`${player.name}, "${card.name}" kullandı — bir sonraki çatışmada +${value} güç.${affinity ? " (Affinite bonusu!)" : ""}`);
      break;
    case "RESOURCE_GAIN":
      player.resource += value;
      log(`${player.name}, "${card.name}" kullandı — ${value} kaynak kazandı.${affinity ? " (Affinite bonusu!)" : ""}`);
      break;
  }

  player.standHand.splice(handIndex, 1);
  renderAll();
}

function placeGuardianFromHand(handIndex) {
  const player = currentPlayer();
  const tileIndex = player.position;
  const owned = state.tileOwnership[tileIndex];
  const card = player.guardianHand[handIndex];
  if (!card || card.kind !== "GUARDIAN") return;
  if (owned.ownerId && owned.ownerId !== player.id) return; // rakip bölgesine direkt yerleştirilemez
  if (owned.guardians.length >= CONFIG.MAX_GUARDIANS_PER_TILE) {
    log(`Bu bölge zaten maksimum (${CONFIG.MAX_GUARDIANS_PER_TILE}) muhafıza sahip.`);
    return;
  }

  owned.ownerId = player.id;
  owned.guardians.push(card.power);
  player.guardianHand.splice(handIndex, 1);
  log(`${player.name}, ${tileIndex}. bölgeye "${card.name}" (güç ${card.power}) yerleştirdi.`);
  state.pendingAction = null;
  refreshBoard();
  renderAll();
}

function applyBoostFromHand(handIndex) {
  const player = currentPlayer();
  const tileIndex = player.position;
  const owned = state.tileOwnership[tileIndex];
  const card = player.guardianHand[handIndex];
  if (!card || card.kind !== "BOOST") return;
  if (owned.ownerId !== player.id || owned.guardians.length === 0) {
    log(`Güçlendirme uygulamak için burada senin muhafızın olmalı.`);
    return;
  }
  owned.guardians[0] += card.power;
  player.guardianHand.splice(handIndex, 1);
  log(`${player.name}, ${tileIndex}. bölgedeki muhafızını +${card.power} güçlendirdi.`);
  state.pendingAction = null;
  refreshBoard();
  renderAll();
}

// ---------- Zar & hareket ----------

function rollDice() {
  return 1 + Math.floor(Math.random() * 6);
}

function handleRollClick() {
  const player = currentPlayer();
  if (state.gameOver) return;

  // Hapisteyse önce kaçış denemesi
  if (player.jailed) {
    const roll = rollDice();
    log(`${player.name} Green Dolphin'den kaçmayı deniyor... zar: ${roll}`);
    if (roll >= CONFIG.JAIL_ESCAPE_THRESHOLD) {
      player.jailed = false;
      log(`${player.name} kaçmayı başardı!`);
    } else {
      log(`${player.name} kaçamadı, sırası bu turluk bitti.`);
      endTurn();
      renderAll();
      return;
    }
  } else {
    const roll = rollDice();
    const totalMove = roll + player.pendingExtraRolls;
    player.pendingExtraRolls = 0;
    player.position = (player.position + totalMove) % TILES.length;
    log(`${player.name} zar attı: ${roll}${totalMove !== roll ? ` (+${totalMove - roll} bonus)` : ""} → ${player.position}. kareye geldi.`);

    if (player.position < totalMove) {
      player.resource += CONFIG.GO_REWARD;
      state.speedwagonPool += CONFIG.SPEEDWAGON_INCREMENT;
      log(`${player.name} turu tamamladı, +${CONFIG.GO_REWARD} kaynak kazandı.`);
    }

    resolveTile(player);
  }

  if (!state.pendingAction && player.pendingExtraRolls === 0 && !state.gameOver) {
    checkWinCondition();
    if (!state.gameOver) endTurn();
  }
  renderAll();
}

function resolveTile(player) {
  const tile = TILES[player.position];

  switch (tile.type) {
    case "GO":
      break;

    case "STAND_CEKME": {
      if (player.standHand.length >= player.standSlots) {
        log(`${player.name} Stand Özelliği çekmek istedi ama eli dolu, kart kayboldu.`);
        break;
      }
      const card = drawFromPool(STAND_POOL);
      player.standHand.push(card);
      log(`${player.name} bir Stand Özelliği kartı çekti: "${card.name}".`);
      break;
    }

    case "MUHAFIZ_CEKME": {
      if (player.guardianHand.length >= player.guardianSlots) {
        log(`${player.name} Muhafız çekmek istedi ama eli dolu, kart kayboldu.`);
        break;
      }
      const card = drawFromPool(GUARDIAN_POOL);
      player.guardianHand.push(card);
      log(`${player.name} bir Muhafız kartı çekti: "${card.name}".`);
      break;
    }

    case "MIKITAKA":
      player.pendingExtraRolls += 1;
      log(`${player.name} Mikitaka Bonusu'na bastı — ekstra zar hakkı kazandı.`);
      break;

    case "SPEEDWAGON":
      log(`${player.name} Speedwagon Vakfı'ndan ${state.speedwagonPool} kaynak topladı.`);
      player.resource += state.speedwagonPool;
      state.speedwagonPool = 0;
      break;

    case "GREEN_DOLPHIN_GIT":
      player.position = TILES.findIndex((t) => t.type === "GREEN_DOLPHIN");
      player.jailed = true;
      log(`${player.name} Green Dolphin'e gönderildi!`);
      break;

    case "GREEN_DOLPHIN":
      log(`${player.name} Green Dolphin'i ziyaret ediyor (hapiste değil).`);
      break;

    case "LOCACACA": {
      const shift = CONFIG.LOCACACA_SHIFT;
      const healthUp = Math.random() < 0.5;
      if (healthUp) {
        player.resource = Math.max(0, player.resource - shift);
        player.health += shift;
        log(`${player.name} Locacaca ile ${shift} kaynağını cana çevirdi.`);
      } else {
        player.health = Math.max(1, player.health - shift);
        player.resource += shift;
        log(`${player.name} Locacaca ile ${shift} canını kaynağa çevirdi.`);
      }
      break;
    }

    case "BOLGE":
      resolveBolge(player);
      break;
  }
}

function resolveBolge(player) {
  const tileIndex = player.position;
  const owned = state.tileOwnership[tileIndex];

  if (!owned.ownerId) {
    log(`${tileIndex}. bölge boş. Elinde muhafız varsa yerleştirebilirsin.`);
    if (player.guardianHand.some((c) => c.kind === "GUARDIAN")) {
      state.pendingAction = { type: "PLACE_GUARDIAN", tileIndex };
    }
    return;
  }

  if (owned.ownerId === player.id) {
    log(`${tileIndex}. bölge zaten senin. İstersen yeni muhafız ekleyebilir ya da güçlendirebilirsin.`);
    if (
      owned.guardians.length < CONFIG.MAX_GUARDIANS_PER_TILE &&
      player.guardianHand.some((c) => c.kind === "GUARDIAN")
    ) {
      state.pendingAction = { type: "PLACE_GUARDIAN", tileIndex };
    } else if (player.guardianHand.some((c) => c.kind === "BOOST")) {
      state.pendingAction = { type: "APPLY_BOOST", tileIndex };
    }
    return;
  }

  const defenderId = owned.ownerId;
  const defender = state.players.find((p) => p.id === defenderId);
  const defenderPower = owned.guardians[owned.guardians.length - 1] ?? 0;

  const atkRoll = rollDice();
  const defRoll = rollDice();
  const atkTotal = atkRoll + CONFIG.COMBAT_ATTACKER_BASE + player.pendingCombatBuff;
  const defTotal = defRoll + defenderPower;
  const usedBuff = player.pendingCombatBuff;
  player.pendingCombatBuff = 0;

  log(
    `Çatışma! ${player.name} (zar ${atkRoll} + güç ${CONFIG.COMBAT_ATTACKER_BASE}${usedBuff ? " +" + usedBuff + " buff" : ""} = ${atkTotal}) vs ${defender.name} (zar ${defRoll} + muhafız ${defenderPower} = ${defTotal})`
  );

  if (atkTotal > defTotal) {
    owned.guardians.pop();
    log(`${player.name} kazandı! ${defender.name}'ın bir muhafızı elendi.`);
    if (owned.guardians.length === 0) {
      owned.ownerId = null;
      log(`${tileIndex}. bölge artık boş.`);
      if (player.guardianHand.some((c) => c.kind === "GUARDIAN")) {
        state.pendingAction = { type: "PLACE_GUARDIAN", tileIndex };
      }
    }
  } else {
    player.health -= CONFIG.COMBAT_DAMAGE_ON_LOSS;
    log(`${defender.name} savundu! ${player.name}, ${CONFIG.COMBAT_DAMAGE_ON_LOSS} can kaybetti.`);
  }
}

function checkWinCondition() {
  state.players.forEach((p) => {
    if (p.alive && p.health <= 0) {
      p.alive = false;
      log(`${p.name} elendi!`);
    }
  });
  const alive = alivePlayers();
  if (alive.length <= 1) {
    state.gameOver = true;
    state.winnerId = alive[0]?.id ?? null;
    log(alive[0] ? `🏆 ${alive[0].name} oyunu kazandı!` : "Oyun berabere bitti.");
  }
}

function endTurn() {
  state.currentPlayerIndex = nextAlivePlayerIndex(state.currentPlayerIndex);
  state.pendingAction = null;
  log(`Sıra ${currentPlayer().name}'a geçti.`);
}

function refreshBoard() {
  if (window.JojopolyBoard) {
    window.JojopolyBoard.refresh(state.tileOwnership, state.players);
  }
}

// =========================================================
// RENDER (basit DOM güncellemesi — framework yok)
// =========================================================

function renderLog() {
  const el = document.getElementById("game-log-list");
  if (!el) return;
  el.innerHTML = state.log
    .slice(0, 8)
    .map((m) => `<li>${escapeHtml(m)}</li>`)
    .join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderTurnIndicator() {
  const label = document.getElementById("turn-label");
  if (!label) return;
  if (state.gameOver) {
    const winner = state.players.find((p) => p.id === state.winnerId);
    label.textContent = winner ? `Oyun bitti — kazanan: ${winner.name}` : "Oyun bitti";
    return;
  }
  const p = currentPlayer();
  label.textContent = `Sıra: ${p.name} (${p.character.name} / ${p.character.stand})${p.jailed ? " — Green Dolphin'de" : ""}`;
}

function renderPlayerStrip() {
  const el = document.getElementById("player-strip");
  if (!el) return;
  el.innerHTML = state.players
    .map((p, i) => {
      const active = i === state.currentPlayerIndex && !state.gameOver;
      const dead = !p.alive;
      return `
        <div class="player-badge ${active ? "is-active" : ""} ${dead ? "is-dead" : ""}" style="--pcolor:#${p.color.toString(16).padStart(6, "0")}">
          <span class="player-badge-name">${escapeHtml(p.name)}</span>
          <span class="player-badge-stat">HP ${p.health} · Kaynak ${p.resource}</span>
        </div>
      `;
    })
    .join("");
}

function renderHands() {
  const player = currentPlayer();

  const standEl = document.getElementById("stand-hand");
  if (standEl) {
    standEl.innerHTML = "";
    for (let i = 0; i < player.standSlots; i++) {
      const card = player.standHand[i];
      standEl.appendChild(renderCardSlot(card, () => useStandCard(i), "stand"));
    }
  }

  const guardEl = document.getElementById("guardian-hand");
  if (guardEl) {
    guardEl.innerHTML = "";
    for (let i = 0; i < player.guardianSlots; i++) {
      const card = player.guardianHand[i];
      let onClick = null;
      if (card && state.pendingAction) {
        if (state.pendingAction.type === "PLACE_GUARDIAN" && card.kind === "GUARDIAN") {
          onClick = () => placeGuardianFromHand(i);
        } else if (state.pendingAction.type === "APPLY_BOOST" && card.kind === "BOOST") {
          onClick = () => applyBoostFromHand(i);
        }
      }
      guardEl.appendChild(renderCardSlot(card, onClick, "guardian"));
    }
  }
}

function renderCardSlot(card, onClick, kind) {
  const div = document.createElement("div");
  div.className = "card-mock" + (card ? " has-card" : "") + (onClick ? " is-usable" : "");
  if (card) {
    div.textContent = kind === "guardian" ? (card.kind === "GUARDIAN" ? "G" : "B") : "S";
    div.dataset.tooltip = `${card.name} — ${card.desc}`;
    if (onClick) div.addEventListener("click", onClick);
  }
  return div;
}

function renderActionPanel() {
  const el = document.getElementById("action-panel");
  if (!el) return;
  el.innerHTML = "";

  if (state.pendingAction) {
    const p = document.createElement("p");
    p.className = "action-hint";
    p.textContent =
      state.pendingAction.type === "PLACE_GUARDIAN"
        ? "Elindeki muhafız kartlarından birine tıkla ve bölgeye yerleştir."
        : "Elindeki güçlendirme kartına tıkla ve bölgeni güçlendir.";
    el.appendChild(p);

    const skip = document.createElement("button");
    skip.className = "btn btn--tiny";
    skip.textContent = "Geç";
    skip.addEventListener("click", () => {
      state.pendingAction = null;
      checkWinCondition();
      if (!state.gameOver) endTurn();
      renderAll();
    });
    el.appendChild(skip);
  }
}

function renderRollButton() {
  const btn = document.getElementById("btn-roll");
  if (!btn) return;
  btn.disabled = state.gameOver || !!state.pendingAction;
}

function renderAll() {
  renderTurnIndicator();
  renderPlayerStrip();
  renderHands();
  renderActionPanel();
  renderRollButton();
  refreshBoard();
}

// ---------- Tooltip (basit, tek elemanlı) ----------

function initTooltip() {
  if (document.getElementById("tooltip")) return;
  const tooltip = document.createElement("div");
  tooltip.id = "tooltip";
  tooltip.className = "tooltip";
  tooltip.style.display = "none";
  document.body.appendChild(tooltip);

  document.addEventListener("mousemove", (e) => {
    const target = e.target.closest("[data-tooltip]");
    if (!target) {
      tooltip.style.display = "none";
      return;
    }
    tooltip.textContent = target.dataset.tooltip;
    tooltip.style.display = "block";
    tooltip.style.left = e.clientX + 14 + "px";
    tooltip.style.top = e.clientY + 14 + "px";
  });
}

// ---------- Başlatma ----------

let started = false;

export function initGame(playerNames) {
  state = createInitialState(playerNames && playerNames.length === 4 ? playerNames : ["Sen", "Oyuncu 2", "Oyuncu 3", "Oyuncu 4"]);
  log("Oyun başladı. " + currentPlayer().name + " ile başlıyoruz.");
  initTooltip();
  renderAll();

  if (!started) {
    const rollBtn = document.getElementById("btn-roll");
    if (rollBtn) rollBtn.addEventListener("click", handleRollClick);
    started = true;
  }
}

// app.js (modül olmayan düz script) buradan oyunu başlatabilsin diye
window.JojopolyGame = { initGame };
