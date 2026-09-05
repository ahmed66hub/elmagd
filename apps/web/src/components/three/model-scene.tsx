"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import {
  useEffect,
  useMemo,
  useRef,
  type ComponentRef,
  type RefObject,
} from "react";
import * as THREE from "three";

import {
  createGeometryFromPositions,
  createLayerTexture,
  createVaseGeometry,
} from "@/lib/three/geometry";

/** نوع مرجع أدوات التحكم مشتق من drei نفسها بدل استيراد three-stdlib مباشرة. */
type OrbitControlsRef = ComponentRef<typeof OrbitControls>;

export interface ModelSceneProps {
  /** رؤوس ملف STL المرفوع — null يعني عرض النموذج الافتراضي. */
  positions: Float32Array | null;
  /** لون الفلامنت المختار. */
  color: string;
  brandColor: string;
  isDark: boolean;
  wireframe: boolean;
  showBounds: boolean;
  autoRotate: boolean;
  /** أي تغيير في هذه القيمة يعيد ضبط زاوية الكاميرا. */
  resetToken: number;
}

/** يضبط الكاميرا لتناسب حجم القطعة عند كل تحميل جديد أو إعادة ضبط. */
function CameraRig({
  geometry,
  resetToken,
  controls,
}: {
  geometry: THREE.BufferGeometry;
  resetToken: number;
  controls: RefObject<OrbitControlsRef | null>;
}) {
  const { camera } = useThree();

  useEffect(() => {
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (!box) return;

    const size = new THREE.Vector3();
    box.getSize(size);
    const focus = size.y * 0.5;
    const distance = Math.max(3.8, Math.max(size.x, size.y, size.z) * 2.5);

    camera.position.set(distance * 0.6, distance * 0.45 + focus, distance * 0.6);
    camera.lookAt(0, focus, 0);

    if (controls.current) {
      controls.current.target.set(0, focus, 0);
      controls.current.update();
    }
  }, [camera, controls, geometry, resetToken]);

  return null;
}

function ModelRig({
  positions,
  color,
  brandColor,
  isDark,
  wireframe,
  showBounds,
  autoRotate,
  resetToken,
}: ModelSceneProps) {
  const controls = useRef<OrbitControlsRef | null>(null);

  const geometry = useMemo(
    () => (positions ? createGeometryFromPositions(positions) : createVaseGeometry()),
    [positions],
  );

  const layerTexture = useMemo(() => {
    const texture = createLayerTexture();
    texture.repeat.set(2, 8);
    return texture;
  }, []);

  const surface = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        map: layerTexture,
        metalness: 0.2,
        roughness: 0.58,
        side: THREE.DoubleSide,
      }),
    [color, layerTexture],
  );

  const wire = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(brandColor),
        wireframe: true,
        transparent: true,
        opacity: 0.6,
      }),
    [brandColor],
  );

  const bounds = useMemo(() => {
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (!box) return null;
    return new THREE.Box3Helper(box.clone(), new THREE.Color(brandColor));
  }, [brandColor, geometry]);

  // تحرير موارد الـ GPU عند تبديل الملف أو مغادرة الصفحة.
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(
    () => () => {
      layerTexture.dispose();
      surface.dispose();
      wire.dispose();
    },
    [layerTexture, surface, wire],
  );

  return (
    <>
      <hemisphereLight
        args={[
          isDark ? 0xbfe6ff : 0xffffff,
          isDark ? 0x0a1018 : 0xbccbd8,
          isDark ? 0.9 : 1.1,
        ]}
      />
      <directionalLight position={[4, 6, 4]} intensity={0.85} />
      <directionalLight
        position={[-5, 1, -4]}
        color={brandColor}
        intensity={isDark ? 1.1 : 0.55}
      />

      <mesh geometry={geometry} material={wireframe ? wire : surface} />
      {showBounds && bounds ? <primitive object={bounds} /> : null}

      <gridHelper
        args={[8, 16, isDark ? 0x2a6e9b : 0xbfd0de, isDark ? 0x16374f : 0xd5e0e9]}
      />

      <OrbitControls
        ref={controls}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={2.2}
        maxDistance={12}
        autoRotate={autoRotate}
        autoRotateSpeed={0.9}
      />
      <CameraRig geometry={geometry} resetToken={resetToken} controls={controls} />
    </>
  );
}

export default function ModelScene(props: ModelSceneProps) {
  return (
    <Canvas
      camera={{ position: [3.2, 2.4, 3.2], fov: 40, near: 0.05, far: 200 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      className="cursor-grab active:cursor-grabbing"
    >
      <ModelRig {...props} />
    </Canvas>
  );
}
