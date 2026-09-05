"use client";

/* eslint-disable react-hooks/immutability --
   كائنات three.js موارد خارجية قابلة للتعديل تمامًا مثل عناصر الـ DOM:
   التحريك في useFrame يعمل بتعديلها مباشرة كل إطار، وهو النمط الرسمي في R3F. */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import {
  createLayerTexture,
  createVaseProfile,
  vaseRadiusAt,
} from "@/lib/three/geometry";

/**
 * مشهد الطابعة في الصفحة الرئيسية.
 *
 * الفكرة: مستوى قص (clipping plane) يصعد تدريجيًا فيكشف المزهرية طبقة طبقة،
 * بينما يتحرك الرأس على المحور X والمنضدة على المحور Z — نفس إيقاع الطباعة الحقيقي.
 */

const BED_Y = 0.37;
const OBJECT_SCALE = 0.55;
const OBJECT_HEIGHT = 2 * OBJECT_SCALE;
const CYCLE_SECONDS = 10;

interface SceneProps {
  brandColor: string;
  accentColor: string;
  isDark: boolean;
  reduceMotion: boolean;
}

function PrinterRig({ brandColor, accentColor, isDark, reduceMotion }: SceneProps) {
  const { gl, pointer } = useThree();

  const root = useRef<THREE.Group>(null);
  const bed = useRef<THREE.Group>(null);
  const gantry = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const spool = useRef<THREE.Mesh>(null);
  const nozzleLight = useRef<THREE.PointLight>(null);

  const clipPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, -1, 0), BED_Y),
    [],
  );
  const layerTexture = useMemo(() => {
    const texture = createLayerTexture();
    texture.repeat.set(2, 14);
    return texture;
  }, []);
  const profile = useMemo(() => createVaseProfile(), []);

  // بلا environment map تبدو الخامات عالية الـ metalness سوداء،
  // لذلك نخفّضها ونعوّض بالخشونة ليظهر المعدن رماديًا كما في التصميم.
  const metal = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: isDark ? 0x55636f : 0xafbcc8,
        metalness: 0.35,
        roughness: 0.42,
      }),
    [isDark],
  );
  const shell = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: isDark ? 0x1b2430 : 0x6e7c8a,
        metalness: 0.12,
        roughness: 0.68,
      }),
    [isDark],
  );
  const printMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0xc7d4df,
        map: layerTexture,
        metalness: 0.28,
        roughness: 0.5,
        clippingPlanes: [clipPlane],
        side: THREE.DoubleSide,
      }),
    [clipPlane, layerTexture],
  );

  useEffect(() => {
    gl.localClippingEnabled = true;
  }, [gl]);

  useEffect(
    () => () => {
      layerTexture.dispose();
      metal.dispose();
      shell.dispose();
      printMaterial.dispose();
    },
    [layerTexture, metal, shell, printMaterial],
  );

  useFrame((state) => {
    const time = reduceMotion ? 3 : state.clock.getElapsedTime();
    const phase = (time % CYCLE_SECONDS) / CYCLE_SECONDS;
    const progress = Math.min(phase / 0.88, 1);
    const printHeight = BED_Y + OBJECT_HEIGHT * progress;

    clipPlane.constant = printHeight;

    if (gantry.current) gantry.current.position.y = printHeight + 0.35;
    if (head.current) head.current.position.x = Math.sin(time * 3.2) * 0.72;
    if (bed.current) bed.current.position.z = Math.sin(time * 2.4) * 0.085;

    if (ring.current) {
      const radius = vaseRadiusAt(progress) * OBJECT_SCALE;
      ring.current.position.set(0, printHeight, 0);
      ring.current.scale.setScalar(Math.max(0.28, radius / 0.3));
      const material = ring.current.material as THREE.MeshBasicMaterial;
      material.opacity = phase < 0.9 ? 0.9 : 0;
    }

    if (nozzleLight.current && head.current && bed.current) {
      nozzleLight.current.position.set(
        head.current.position.x,
        printHeight + 0.12,
        -0.34 + bed.current.position.z,
      );
    }

    if (spool.current) spool.current.rotation.x -= 0.02;

    if (root.current) {
      root.current.rotation.y =
        -0.26 + (reduceMotion ? 0 : Math.sin(time * 0.2) * 0.14) + pointer.x * 0.17;
      root.current.rotation.x = -pointer.y * 0.05;
    }
  });

  return (
    <>
      <hemisphereLight
        args={[isDark ? 0x9fd8ff : 0xffffff, isDark ? 0x0a1018 : 0xc8d6e2, isDark ? 0.8 : 1.05]}
      />
      <directionalLight position={[4, 6, 5]} intensity={isDark ? 1 : 0.9} />
      <directionalLight
        position={[-5, 2.5, -4]}
        color={brandColor}
        intensity={isDark ? 1.6 : 0.8}
      />
      <pointLight ref={nozzleLight} color={accentColor} intensity={2.2} distance={3} />

      <group ref={root} scale={0.84}>
        {/* القاعدة */}
        <mesh material={shell} position={[0, 0.11, 0.16]}>
          <boxGeometry args={[2.5, 0.22, 1.9]} />
        </mesh>

        {/* العمودان الرأسيان والعارضة العلوية */}
        {[-1.1, 1.1].map((x) => (
          <mesh key={x} material={metal} position={[x, 1.37, -0.7]}>
            <boxGeometry args={[0.13, 2.3, 0.14]} />
          </mesh>
        ))}
        <mesh material={metal} position={[0, 2.46, -0.7]}>
          <boxGeometry args={[2.36, 0.13, 0.14]} />
        </mesh>

        {/* حامل البكرة والبكرة */}
        <mesh material={metal} position={[0, 2.7, -0.7]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.028, 0.028, 0.36, 10]} />
        </mesh>
        <mesh ref={spool} position={[0.15, 2.7, -0.7]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.28, 0.095, 10, 32]} />
          <meshStandardMaterial color={brandColor} metalness={0.25} roughness={0.55} />
        </mesh>

        {/* المنضدة والقطعة قيد الطباعة */}
        <group ref={bed}>
          <mesh material={metal} position={[0, 0.29, 0]}>
            <boxGeometry args={[2.02, 0.1, 1.5]} />
          </mesh>
          <mesh position={[0, 0.355, 0]}>
            <boxGeometry args={[1.96, 0.03, 1.44]} />
            <meshStandardMaterial color={isDark ? 0x0d151d : 0x3c4855} roughness={0.85} />
          </mesh>

          <mesh material={printMaterial} scale={OBJECT_SCALE} position={[0, BED_Y, 0]}>
            <latheGeometry args={[profile, 64]} />
          </mesh>

          <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.3, 0.011, 8, 44]} />
            <meshBasicMaterial color={accentColor} transparent />
          </mesh>
        </group>

        {/* الجسر المتحرك ورأس الطباعة */}
        <group ref={gantry}>
          <mesh material={metal} position={[0, 0, -0.66]}>
            <boxGeometry args={[2.3, 0.1, 0.12]} />
          </mesh>
          <group ref={head}>
            <mesh material={shell} position={[0, 0, -0.44]}>
              <boxGeometry args={[0.38, 0.32, 0.34]} />
            </mesh>
            <mesh material={metal} position={[0, -0.24, -0.34]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.06, 0.16, 14]} />
            </mesh>
            <mesh position={[0, -0.33, -0.34]}>
              <sphereGeometry args={[0.03, 10, 10]} />
              <meshBasicMaterial color={accentColor} />
            </mesh>
          </group>
        </group>
      </group>

      <gridHelper
        args={[11, 22, isDark ? 0x2a6e9b : 0xbfd0de, isDark ? 0x143551 : 0xd5e0e9]}
      />
    </>
  );
}

export default function PrinterScene(props: SceneProps) {
  return (
    <Canvas
      camera={{ position: [3.3, 2.15, 4.5], fov: 36, near: 0.1, far: 100 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ camera }) => camera.lookAt(0, 1, 0)}
      frameloop={props.reduceMotion ? "demand" : "always"}
    >
      <PrinterRig {...props} />
    </Canvas>
  );
}
