// =========================================================
// JOJOPOLY — Tahta önizleme sahnesi (foundation / prototip)
//
// Bu dosya henüz gerçek .glb modelleri kullanmıyor.
// Kareler ve piyonlar basit geometrik placeholder'lar.
// Blockbench'ten çıkardığın .glb dosyaları hazır olunca,
// aşağıdaki "PLACEHOLDER TILES" ve "PLACEHOLDER PAWNS"
// bölümlerini GLTFLoader ile gerçek modellerle değiştireceğiz.
// =========================================================

import * as THREE from "three";

// ---------- Kare (tile) dizilimi ----------
// 24 kare, saat yönünde, köşeler 0/6/12/18. index sırası
// önceki tasarım tablosuyla birebir eşleşiyor.

const TILE_TYPES = [
  "GO",              // 0  köşe
  "BOLGE", "BOLGE", "STAND_OZELLIGI", "MIKITAKA", "BOLGE",
  "GREEN_DOLPHIN",   // 6  köşe
  "BOLGE", "STAND_OZELLIGI", "BOLGE", "BOLGE", "MIKITAKA",
  "SPEEDWAGON",      // 12 köşe
  "BOLGE", "BOLGE", "STAND_OZELLIGI", "BOLGE", "MIKITAKA",
  "GREEN_DOLPHIN_GIT", // 18 köşe
  "BOLGE", "BOLGE", "STAND_OZELLIGI", "BOLGE", "LOCACACA",
];

const TILE_COLORS = {
  GO: 0xd4af37,
  BOLGE: 0xb9b5ae,
  STAND_OZELLIGI: 0x6e2fe8,
  MIKITAKA: 0x1fb6a6,
  GREEN_DOLPHIN: 0x2b2b2b,
  GREEN_DOLPHIN_GIT: 0xc81d3b,
  SPEEDWAGON: 0xe8a33d,
  LOCACACA: 0xe63980,
};

const CORNER_INDICES = new Set([0, 6, 12, 18]);

function buildTrackPositions(perSide = 6, tileSize = 2) {
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

// ---------- Sahne kurulumu ----------

const canvas = document.getElementById("board-canvas");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(0, 12.5, 15);
camera.lookAt(0, 0, -1.5);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Işıklandırma: basit, düz — karmaşık gölge/yansıma yok
const ambient = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambient);
const directional = new THREE.DirectionalLight(0xffffff, 0.6);
directional.position.set(4, 10, 6);
scene.add(directional);

// Zemin (masa hissi)
const floorGeo = new THREE.PlaneGeometry(40, 40);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 1 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.2;
scene.add(floor);

// ---------- PLACEHOLDER TILES ----------
const TILE_SIZE = 2;
const positions = buildTrackPositions(6, TILE_SIZE);
const tileGroup = new THREE.Group();

positions.forEach(([x, z], i) => {
  const type = TILE_TYPES[i];
  const isCorner = CORNER_INDICES.has(i);
  const size = isCorner ? TILE_SIZE * 0.95 : TILE_SIZE * 0.88;
  const geo = new THREE.BoxGeometry(size, 0.3, size);
  const mat = new THREE.MeshStandardMaterial({
    color: TILE_COLORS[type] ?? 0xffffff,
    roughness: 0.85,
  });
  const tile = new THREE.Mesh(geo, mat);
  tile.position.set(x, 0, z);
  tile.userData = { index: i, type };
  tileGroup.add(tile);

  // ince kontur hissi için kenarlık
  const edges = new THREE.EdgesGeometry(geo);
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0x0a0a0a })
  );
  line.position.copy(tile.position);
  tileGroup.add(line);
});
scene.add(tileGroup);

// ---------- PLACEHOLDER PAWNS ----------
// Dört piyon da başlangıçta GO karesinde (index 0), hafif dağıtılmış.
const PAWN_COLORS = [0xe63980, 0xd4af37, 0x6e2fe8, 0x1fb6a6];
const pawnOffsets = [
  [-0.35, -0.35],
  [0.35, -0.35],
  [-0.35, 0.35],
  [0.35, 0.35],
];
const [goX, goZ] = positions[0];
const pawnGroup = new THREE.Group();

PAWN_COLORS.forEach((color, i) => {
  const bodyGeo = new THREE.CylinderGeometry(0.28, 0.32, 0.7, 8);
  const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  const [ox, oz] = pawnOffsets[i];
  body.position.set(goX + ox, 0.5, goZ + oz);
  pawnGroup.add(body);
});
scene.add(pawnGroup);

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
// Çok hafif, kesintisiz bir kamera salınımı — "showcase" hissi verir.
// prefers-reduced-motion ayarına saygı gösterir.

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let t = 0;

function animate() {
  requestAnimationFrame(animate);
  if (!reduceMotion) {
    t += 0.003;
    camera.position.x = Math.sin(t) * 1.2;
    camera.lookAt(0, 0, -1.5);
  }
  renderer.render(scene, camera);
}
animate();
