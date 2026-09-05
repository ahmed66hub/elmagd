import * as THREE from "three";

/** أدوات هندسية مشتركة بين مشهد الطابعة والمعاين. */

/** شكل المزهرية الحلزونية المستخدم كنموذج افتراضي. */
export function createVaseProfile(): THREE.Vector2[] {
  const points: THREE.Vector2[] = [];
  const steps = 26;
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const radius =
      0.3 + 0.34 * Math.sin(t * Math.PI * 1.02) + 0.06 * Math.sin(t * Math.PI * 5);
    points.push(new THREE.Vector2(Math.max(0.12, radius), t * 2));
  }
  return points;
}

export function createVaseGeometry(): THREE.LatheGeometry {
  return new THREE.LatheGeometry(createVaseProfile(), 64);
}

/** نصف قطر المزهرية عند ارتفاع نسبي — لتحريك حلقة رأس الطباعة معها. */
export function vaseRadiusAt(t: number): number {
  return 0.3 + 0.34 * Math.sin(t * Math.PI * 1.02) + 0.06 * Math.sin(t * Math.PI * 5);
}

/**
 * نسيج خطوط أفقية يحاكي طبقات الطباعة.
 * يُبنى على canvas صغير جدًا (8×64) فلا يكلف شيئًا.
 */
export function createLayerTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 8;
  canvas.height = 64;

  const context = canvas.getContext("2d");
  if (context) {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 8, 64);
    context.fillStyle = "rgba(0,0,0,.16)";
    for (let y = 0; y < 64; y += 4) context.fillRect(0, y, 8, 1.3);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/** بناء BufferGeometry من رؤوس STL مع توسيطها وتوحيد مقياسها. */
export function createGeometryFromPositions(
  positions: Float32Array,
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  // ملفات STL بمحور Z لأعلى — نحوّلها لمحور Y لأعلى كما في three.js.
  geometry.rotateX(-Math.PI / 2);
  geometry.computeBoundingBox();

  const box = geometry.boundingBox;
  if (box) {
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    const scale = 2.1 / maxDimension;
    geometry.translate(
      -(box.min.x + box.max.x) / 2,
      -box.min.y,
      -(box.min.z + box.max.z) / 2,
    );
    geometry.scale(scale, scale, scale);
  }

  geometry.computeVertexNormals();
  return geometry;
}
