// =========================================================
// JOJOPOLY — Tahta sahnesi (kod-tabanlı iskelet + senin PNG'lerin)
//
// Bu, önceki procedural placeholder'a dönüş — ama artık her
// kare, tiles-config.js'de tanımladığın PNG dosyasını
// otomatik olarak yüklüyor. PNG henüz yoksa/bulunamıyorsa
// kare, tipinin rengi + adıyla nazik bir yer tutucu gösteriyor.
//
// Yeni bir PNG eklediğinde: sadece dosyayı images/tiles/
// altına koy, tiles-config.js'deki "image" alanı zaten o adı
// gösteriyorsa sayfayı yenilemen yeterli.
// =========================================================

import * as THREE from "three";
import {
  TILES,
  TILE_TYPE_COLORS,
  TILE_TYPE_LABELS,
  CORNER_IDS,
  TILES_PER_SIDE,
  IMAGE_BASE_PATH,
} from "./tiles-config.js";

const canvas = document.getElementById("board-canvas");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

// ---------- Işıklandırma: hafif sıcak, düz, gölge yok ----------
const ambient = new THREE.AmbientLight(0xfff2df, 0.85);
scene.add(ambient);
const directional = new THREE.DirectionalLight(0xffffff, 0.55);
directional.position.set(5, 12, 7);
scene.add(directional);

// Zemin — koyu, tahtayı öne çıkarsın
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.MeshStandardMaterial({ color: 0x121212, roughness: 1 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.08;
scene.add(floor);

// ---------- Kare (tile) dizilim geometrisi ----------

const TILE_SIZE = 2;
const GAP = 0.06; // kareler arası ince boşluk — "tahtavari" ayrım hissi

function buildTrackPositions(perSide, tileSize) {
  const size = perSide * tileSize;
  const half = size / 2;
  const corners = [
    [-half, -half],
    [half, -half],
    [half, half],
    [-half, half],
  ];
  const dirs = [
    [1, 0],
    [0, 1],
    [-1, 0],
    [0, -1],
  ];
  const positions = [];
  for (let side = 0; side < 4; side++) {
    const [cx, cz] = corners[side];
    const [dx, dz] = dirs[side];
    for (let i = 0; i < perSide; i++) {
      positions.push([cx + dx * tileSize * i, cz + dz * tileSize * i]);
    }
  }
  return positions;
}

const positions = buildTrackPositions(TILES_PER_SIDE, TILE_SIZE);
const boardHalf = (TILES_PER_SIDE * TILE_SIZE) / 2;

// ---------- Yer tutucu doku üretici (PNG gelene kadar) ----------

function createFallbackTexture(color, label) {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");

  const hex = "#" + color.toString(16).padStart(6, "0");
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, size, size);

  // hafif iç çerçeve
  ctx.strokeStyle = "rgba(10,10,10,0.35)";
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, size - 8, size - 8);

  // etiket metni
  ctx.fillStyle = "rgba(10,10,10,0.75)";
  ctx.font = "bold 22px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  wrapText(ctx, label, size / 2, size / 2, size - 40, 26);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  const lines = [];
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line !== "") {
      lines.push(line.trim());
      line = word + " ";
    } else {
      line = test;
    }
  }
  lines.push(line.trim());
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
}

// ---------- Kareleri oluştur ----------

const textureLoader = new THREE.TextureLoader();
const tileGroup = new THREE.Group();

TILES.forEach((tileDef, i) => {
  const [x, z] = positions[i];
  const isCorner = CORNER_IDS.has(tileDef.id);
  const size = (isCorner ? TILE_SIZE * 0.97 : TILE_SIZE * 0.9) - GAP;
  const color = TILE_TYPE_COLORS[tileDef.type] ?? 0xffffff;
  const label = TILE_TYPE_LABELS[tileDef.type] ?? tileDef.type;

  const fallbackTex = createFallbackTexture(color, label);

  const sideMat = new THREE.MeshStandardMaterial({ color: 0x2a2621, roughness: 0.9 });
  const topMat = new THREE.MeshStandardMaterial({ map: fallbackTex, roughness: 0.8 });

  // BoxGeometry materyal grup sırası: +x,-x,+y,-y,+z,-z → top = index 2
  const geo = new THREE.BoxGeometry(size, 0.28, size);
  const materials = [sideMat, sideMat, topMat, sideMat, sideMat, sideMat];
  const tile = new THREE.Mesh(geo, materials);
  tile.position.set(x, 0, z);
  tile.userData = { id: tileDef.id, type: tileDef.type };
  tileGroup.add(tile);

  // gerçek PNG varsa yükle, gelince dokuyu değiştir
  if (tileDef.image) {
    textureLoader.load(
      IMAGE_BASE_PATH + tileDef.image,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        topMat.map = tex;
        topMat.needsUpdate = true;
      },
      undefined,
      () => {
        // PNG henüz yok / bulunamadı — fallback zaten görünür durumda, sessizce geç
      }
    );
  }

  // ince altın kontur — sert siyah yerine daha "tahtavari" bir çizgi
  const edges = new THREE.EdgesGeometry(geo);
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0x3a2f1f, transparent: true, opacity: 0.5 })
  );
  line.position.copy(tile.position);
  tileGroup.add(line);
});
scene.add(tileGroup);

// ---------- Dekoratif dış çerçeve (bezel) — tahtaya "kutu oyunu" hissi ----------

const bezelThickness = 0.5;
const bezelOuter = boardHalf + bezelThickness;
const bezelShape = new THREE.Shape();
bezelShape.moveTo(-bezelOuter, -bezelOuter);
bezelShape.lineTo(bezelOuter, -bezelOuter);
bezelShape.lineTo(bezelOuter, bezelOuter);
bezelShape.lineTo(-bezelOuter, bezelOuter);
bezelShape.closePath();
const holePath = new THREE.Path();
holePath.moveTo(-boardHalf, -boardHalf);
holePath.lineTo(boardHalf, -boardHalf);
holePath.lineTo(boardHalf, boardHalf);
holePath.lineTo(-boardHalf, boardHalf);
holePath.closePath();
bezelShape.holes.push(holePath);

const bezelGeo = new THREE.ExtrudeGeometry(bezelShape, { depth: 0.16, bevelEnabled: false });
bezelGeo.rotateX(Math.PI / 2);
const bezelMat = new THREE.MeshStandardMaterial({ color: 0x1c1712, roughness: 0.9 });
const bezel = new THREE.Mesh(bezelGeo, bezelMat);
bezel.position.y = -0.02;
scene.add(bezel);

// ---------- Orta alan plaketi (JOJOPOLY yazısı) ----------

function createCenterPlaqueTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#171310";
  ctx.fillRect(0, 0, 512, 512);

  ctx.fillStyle = "rgba(212,175,55,0.9)";
  ctx.font = "bold 70px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("JOJOPOLY", 256, 240);

  ctx.fillStyle = "rgba(230,57,128,0.85)";
  ctx.font = "bold 26px sans-serif";
  ctx.fillText("JoJolandiya Masa Oyunu", 256, 285);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const plaqueSize = boardHalf * 1.1;
const plaque = new THREE.Mesh(
  new THREE.PlaneGeometry(plaqueSize, plaqueSize),
  new THREE.MeshStandardMaterial({ map: createCenterPlaqueTexture(), roughness: 0.9 })
);
plaque.rotation.x = -Math.PI / 2;
plaque.position.y = 0.01;
scene.add(plaque);

// ---------- Piyonlar — GO karesinde ----------

const PAWN_COLORS = [0xe63980, 0xd4af37, 0x6e2fe8, 0x1fb6a6];
const [goX, goZ] = positions[0];
const pawnOffsets = [
  [-0.32, -0.32],
  [0.32, -0.32],
  [-0.32, 0.32],
  [0.32, 0.32],
];

PAWN_COLORS.forEach((color, i) => {
  const pawn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.28, 0.62, 10),
    new THREE.MeshStandardMaterial({ color, roughness: 0.55 })
  );
  const [ox, oz] = pawnOffsets[i];
  pawn.position.set(goX + ox, 0.45, goZ + oz);
  scene.add(pawn);
});

// ---------- Kamera ----------

camera.position.set(0, boardHalf * 1.7, boardHalf * 2.05);
camera.lookAt(0, 0, -boardHalf * 0.15);

// ---------- Boyutlandırma ----------

function resize() {
  const parent = canvas.parentElement;
  const width = parent.clientWidth;
  const height = parent.clientHeight;
  if (width === 0 || height === 0) return;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

// ---------- Render döngüsü ----------

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let t = 0;

function animate() {
  requestAnimationFrame(animate);
  if (!reduceMotion) {
    t += 0.003;
    camera.position.x = Math.sin(t) * boardHalf * 0.25;
    camera.lookAt(0, 0, -boardHalf * 0.15);
  }
  renderer.render(scene, camera);
}
animate();
