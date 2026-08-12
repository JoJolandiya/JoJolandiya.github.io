// =========================================================
// JOJOPOLY — Tahta önizleme sahnesi
//
// Artık placeholder kareler yerine senin Blockbench'te
// yaptığın gerçek tahta modelini (board-model.glb) yüklüyor.
// Model, tahtanın tamamının tek bir düz yüzey üzerine
// dokunmuş (textured) hali — yani ayrı ayrı 20 obje değil,
// tek parça bir mesh. Piyonlar hâlâ placeholder (basit renkli
// silindirler); gerçek piyon modellerin gelince onları da
// aynı şekilde GLTFLoader ile ekleyeceğiz.
// =========================================================

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const canvas = document.getElementById("board-canvas");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Işıklandırma: basit, düz — karmaşık gölge/yansıma yok
const ambient = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambient);
const directional = new THREE.DirectionalLight(0xffffff, 0.5);
directional.position.set(4, 10, 6);
scene.add(directional);

// Zemin (masa hissi) — modelin altına hafif bir kontrast yüzeyi
const floorGeo = new THREE.PlaneGeometry(40, 40);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 1 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.05;
scene.add(floor);

// Model gelene kadar kamera varsayılan bir mesafede dursun
camera.position.set(0, 4.5, 5.5);
camera.lookAt(0, 0, 0);

// ---------- Gerçek tahta modelini yükle ----------

const loader = new GLTFLoader();
let boardModel = null;

loader.load(
  "board-model.glb",
  (gltf) => {
    boardModel = gltf.scene;
    scene.add(boardModel);

    // Modelin gerçek boyutuna göre kamerayı otomatik hizala
    const box = new THREE.Box3().setFromObject(boardModel);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.z);
    const camDist = maxDim * 1.35;

    camera.position.set(center.x, maxDim * 1.05, center.z + camDist);
    camera.lookAt(center.x, 0, center.z - maxDim * 0.1);
    camera.near = 0.01;
    camera.far = maxDim * 50;
    camera.updateProjectionMatrix();

    // Piyonları modelin bir köşesine yerleştir (GO karesi netleşince
    // burayı gerçek koordinata göre güncelleyeceğiz)
    placePawns(box.min.x + size.x * 0.08, box.min.z + size.z * 0.08, maxDim);
  },
  undefined,
  (error) => {
    console.error("Tahta modeli yüklenemedi:", error);
    document.getElementById("turn-label").textContent =
      "Tahta modeli yüklenemedi — board-model.glb dosyasının konumunu kontrol et";
  }
);

// ---------- PLACEHOLDER PAWNS ----------

const PAWN_COLORS = [0xe63980, 0xd4af37, 0x6e2fe8, 0x1fb6a6];

function placePawns(startX, startZ, boardMaxDim) {
  const pawnGroup = new THREE.Group();
  const pawnRadius = boardMaxDim * 0.035;
  const pawnHeight = boardMaxDim * 0.09;
  const spread = boardMaxDim * 0.05;

  const offsets = [
    [-spread, -spread],
    [spread, -spread],
    [-spread, spread],
    [spread, spread],
  ];

  PAWN_COLORS.forEach((color, i) => {
    const geo = new THREE.CylinderGeometry(pawnRadius, pawnRadius * 1.1, pawnHeight, 8);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
    const pawn = new THREE.Mesh(geo, mat);
    const [ox, oz] = offsets[i];
    pawn.position.set(startX + ox, pawnHeight / 2, startZ + oz);
    pawnGroup.add(pawn);
  });

  scene.add(pawnGroup);
}

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
  if (!reduceMotion && boardModel) {
    t += 0.003;
    const box = new THREE.Box3().setFromObject(boardModel);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.z);
    camera.position.x = center.x + Math.sin(t) * maxDim * 0.3;
    camera.lookAt(center.x, 0, center.z - maxDim * 0.1);
  }
  renderer.render(scene, camera);
}
animate();
