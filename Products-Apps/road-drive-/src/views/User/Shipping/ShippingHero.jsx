import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import * as THREE from 'three';

/* ── Ground ── */
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#0d1117" />
    </mesh>
  );
}

/* ── Wide dual-lane road ── */
function Road({ a, b, width = 9 }) {
  const [ax, az] = a;
  const [bx, bz] = b;
  const midX = (ax + bx) / 2;
  const midZ = (az + bz) / 2;
  const length = Math.hypot(bx - ax, bz - az);
  const angle = Math.atan2(bz - az, bx - ax);
  const dashes = Math.max(3, Math.floor(length / 5));

  return (
    <group position={[midX, 0.01, midZ]} rotation={[0, -angle, 0]}>
      {/* Asphalt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial color="#1c1c2e" roughness={0.97} />
      </mesh>
      {/* Shoulders */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, s * (width / 2 + 0.6)]}>
          <planeGeometry args={[length, 1.2]} />
          <meshStandardMaterial color="#252535" roughness={1} />
        </mesh>
      ))}
      {/* White edge lines */}
      {[-1, 1].map((s, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, s * (width / 2 - 0.3)]}>
          <planeGeometry args={[length, 0.2]} />
          <meshStandardMaterial color="#e2e8f0" transparent opacity={0.9} />
        </mesh>
      ))}
      {/* Double yellow centre lines */}
      {[-0.22, 0.22].map((off, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, off]}>
          <planeGeometry args={[length, 0.16]} />
          <meshStandardMaterial color="#FFB800" />
        </mesh>
      ))}
      {/* Lane dashes each side */}
      {[1, -1].map(side =>
        Array.from({ length: dashes }).map((_, i) => (
          <mesh
            key={`${side}-${i}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[-length / 2 + (length / dashes) * (i + 0.5), 0.003, side * (width / 4)]}
          >
            <planeGeometry args={[2, 0.13]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.45} />
          </mesh>
        ))
      )}
    </group>
  );
}

/* ── Terminal / Warehouse ── */
function Terminal({ pos }) {
  const [x, z] = pos;
  return (
    <group position={[x, 0, z]}>
      {/* Apron */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 3.8]} receiveShadow>
        <planeGeometry args={[9, 4]} />
        <meshStandardMaterial color="#52637a" roughness={1} />
      </mesh>
      {/* Building */}
      <mesh castShadow receiveShadow position={[0, 2.2, 0]}>
        <boxGeometry args={[7, 4.4, 5.5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.65} />
      </mesh>
      {/* Roof */}
      <mesh castShadow position={[0, 4.6, 0.8]}>
        <boxGeometry args={[7.4, 0.22, 7]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>
      {/* Yellow brand strip */}
      <mesh position={[0, 3.8, 2.77]}>
        <boxGeometry args={[7, 0.55, 0.05]} />
        <meshStandardMaterial color="#FFB800" />
      </mesh>
      {/* Bay doors */}
      {[-2, 0, 2].map((dx, i) => (
        <mesh key={i} position={[dx, 1.2, 2.78]}>
          <boxGeometry args={[1.6, 2.4, 0.06]} />
          <meshStandardMaterial color="#1a2535" roughness={1} />
        </mesh>
      ))}
      {/* Windows */}
      {[-2.5, 0, 2.5].map((dx, i) => (
        <mesh key={i} position={[dx, 3.1, 2.78]}>
          <boxGeometry args={[1.1, 0.75, 0.04]} />
          <meshStandardMaterial color="#90cdf4" metalness={0.3} roughness={0.1} transparent opacity={0.8} />
        </mesh>
      ))}
      {/* Corner pillars */}
      {[-3.5, 3.5].map((dx, i) => (
        <mesh key={i} position={[dx, 2.2, 2.78]}>
          <boxGeometry args={[0.35, 4.4, 0.08]} />
          <meshStandardMaterial color="#FFB800" />
        </mesh>
      ))}
    </group>
  );
}

/* ── Worker (always animated near terminal) ── */
function Worker({ x, z, timeOffset = 0 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime + timeOffset;
    ref.current.position.x = x + Math.sin(t * 0.9) * 1.4;
    ref.current.position.y = Math.abs(Math.sin(t * 4)) * 0.06;
  });
  return (
    <group ref={ref} position={[x, 0, z]}>
      <mesh position={[0, 0.65, 0]} castShadow>
        <boxGeometry args={[0.28, 0.5, 0.2]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <meshStandardMaterial color="#f6ad55" />
      </mesh>
      {[-0.09, 0.09].map((lx, i) => (
        <mesh key={i} position={[lx, 0.22, 0]} castShadow>
          <boxGeometry args={[0.11, 0.38, 0.14]} />
          <meshStandardMaterial color="#1a202c" />
        </mesh>
      ))}
      {[-0.24, 0.24].map((ax, i) => (
        <mesh key={i} position={[ax, 0.65, 0]} castShadow>
          <boxGeometry args={[0.11, 0.32, 0.14]} />
          <meshStandardMaterial color="#2d3748" />
        </mesh>
      ))}
      {/* Cargo box being carried */}
      <mesh position={[0, 0.9, 0.25]} castShadow>
        <boxGeometry args={[0.32, 0.28, 0.28]} />
        <meshStandardMaterial color="#FFB800" roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ── Container Stack ── */
function ContainerStack({ pos }) {
  const [x, z] = pos;
  return (
    <group position={[x, 0, z]}>
      {[['#1e293b', 0.42], ['#FFB800', 1.28], ['#334155', 2.14]].map(([color, y], i) => (
        <mesh key={i} castShadow position={[0, y, 0]}>
          <boxGeometry args={[3.5, 0.8, 1.4]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Vessel ── */
function Vessel() {
  return (
    <group position={[32, 0, -28]} rotation={[0, 0.22, 0]}>
      <mesh castShadow position={[0, 0.75, 0]}>
        <boxGeometry args={[24, 1.5, 7]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[24, 0.12, 7.2]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      {[-8, 0, 8].map((dx, i) => (
        <mesh key={i} castShadow position={[dx, 2.7, 0]}>
          <boxGeometry args={[4.5, 2.2, 4.5]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#FFB800' : '#475569'} />
        </mesh>
      ))}
      <mesh position={[10, 5.5, 0]}>
        <boxGeometry args={[0.28, 7, 0.28]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[7, 8.5, 0]} rotation={[0, 0, 0.45]}>
        <boxGeometry args={[0.2, 5, 0.2]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
    </group>
  );
}

/* ── Delivery Van with stop-and-load state machine ── */
function DeliveryVan({ pathPoints, speed = 1, startOffset = 0, stopTs = [], laneSign = 1 }) {
  const groupRef = useRef();
  const tRef = useRef(startOffset % 1);
  const phaseRef = useRef(0);   // 0=moving 1=loading
  const timerRef = useRef(0);
  const spdRef = useRef(1);     // speed multiplier
  const wRefs = [useRef(), useRef(), useRef(), useRef()];

  const curve = useMemo(() => {
    // offset points into lane (perpendicular to path direction)
    const pts = pathPoints.map(([x, z]) => new THREE.Vector3(x, 0, z));
    // compute average direction
    const dir = new THREE.Vector3().subVectors(pts[pts.length - 1], pts[0]).normalize();
    const perp = new THREE.Vector3(dir.z, 0, -dir.x).multiplyScalar(laneSign * 2.0);
    const offsetPts = pts.map(p => p.clone().add(perp));
    return new THREE.CatmullRomCurve3(offsetPts, false, 'catmullrom', 0.5);
  }, [pathPoints, laneSign]);

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    const clampedDt = Math.min(dt, 0.05);

    if (phaseRef.current === 0) {
      // Check approach to stop
      const nearStop = stopTs.some(st => {
        const dist = Math.abs(tRef.current - st);
        return dist < 0.04 || dist > 0.96;
      });
      if (nearStop) {
        spdRef.current = Math.max(0, spdRef.current - clampedDt * 2.5);
        if (spdRef.current <= 0) {
          phaseRef.current = 1;
          timerRef.current = 3.5 + Math.random() * 1.5; // load 3.5–5s
        }
      } else {
        spdRef.current = Math.min(1, spdRef.current + clampedDt * 1.5);
      }
    } else {
      // Loading
      timerRef.current -= clampedDt;
      if (timerRef.current <= 0) {
        phaseRef.current = 0;
        spdRef.current = 0;
        // advance past stop to avoid re-triggering
        tRef.current = (tRef.current + 0.05) % 1;
      }
      // Wheels still when loading
      return;
    }

    tRef.current = (tRef.current + clampedDt * speed * 0.016 * spdRef.current) % 1;
    const pos = curve.getPoint(tRef.current);
    const tan = curve.getTangent(tRef.current);
    groupRef.current.position.set(pos.x, 0, pos.z);
    groupRef.current.rotation.y = Math.atan2(tan.z, -tan.x);

    const wSpin = clampedDt * speed * spdRef.current * 4.5;
    wRefs.forEach(r => { if (r.current) r.current.rotation.x -= wSpin; });
  });

  return (
    <group ref={groupRef}>
      {/* Chassis */}
      <mesh position={[0, 0.22, 0]} receiveShadow>
        <boxGeometry args={[3.8, 0.18, 1.1]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>
      {/* Cargo box */}
      <mesh castShadow receiveShadow position={[0.5, 1.15, 0]}>
        <boxGeometry args={[2.4, 1.8, 1.1]} />
        <meshStandardMaterial color="#FFB800" roughness={0.45} metalness={0.08} />
      </mesh>
      {/* Logo stripe */}
      <mesh position={[0.5, 1.15, 0.56]}>
        <boxGeometry args={[2.0, 0.35, 0.01]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Rear door */}
      <mesh position={[1.71, 1.15, 0]}>
        <boxGeometry args={[0.02, 1.7, 1.0]} />
        <meshStandardMaterial color="#CC9400" roughness={0.6} />
      </mesh>
      {/* Cab */}
      <mesh castShadow receiveShadow position={[-1.1, 0.88, 0]}>
        <boxGeometry args={[1.2, 1.14, 1.05]} />
        <meshStandardMaterial color="#FFB800" roughness={0.45} metalness={0.08} />
      </mesh>
      {/* Cab roof */}
      <mesh position={[-1.1, 1.52, 0]}>
        <boxGeometry args={[1.22, 0.14, 1.07]} />
        <meshStandardMaterial color="#E6A600" roughness={0.5} />
      </mesh>
      {/* Windshield */}
      <mesh position={[-1.72, 1.0, 0]}>
        <boxGeometry args={[0.03, 0.72, 0.88]} />
        <meshStandardMaterial color="#1e3a5f" metalness={0.7} roughness={0.05} transparent opacity={0.85} />
      </mesh>
      {/* Side window */}
      <mesh position={[-0.9, 1.08, 0.535]}>
        <boxGeometry args={[0.75, 0.5, 0.02]} />
        <meshStandardMaterial color="#1e3a5f" metalness={0.5} roughness={0.1} transparent opacity={0.8} />
      </mesh>
      {/* Grille */}
      <mesh position={[-1.73, 0.55, 0]}>
        <boxGeometry args={[0.03, 0.38, 0.95]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {/* Bumper */}
      <mesh position={[-1.73, 0.28, 0]}>
        <boxGeometry args={[0.08, 0.14, 1.0]} />
        <meshStandardMaterial color="#334155" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Headlights */}
      {[-0.34, 0.34].map((z, i) => (
        <mesh key={i} position={[-1.74, 0.65, z]}>
          <boxGeometry args={[0.02, 0.2, 0.2]} />
          <meshStandardMaterial color="#fffde7" emissive="#fff9c4" emissiveIntensity={2} />
        </mesh>
      ))}
      {/* Wheels */}
      {[[-0.95, -0.57], [-0.95, 0.57], [0.95, -0.57], [0.95, 0.57]].map(([wx, wz], i) => (
        <group key={i} ref={wRefs[i]} position={[wx, 0.31, wz]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.31, 0.31, 0.26, 18]} />
            <meshStandardMaterial color="#111111" roughness={0.95} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[wz > 0 ? 0.14 : -0.14, 0, 0]}>
            <cylinderGeometry args={[0.17, 0.17, 0.01, 12]} />
            <meshStandardMaterial color="#555555" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─── Scene layout ─── */
// 9 parallel diagonal roads (NW → SE, slight tilt) to fill the entire landscape
const ROADS = [
  [[-60, -46], [80, -32]], // R-2
  [[-60, -32], [80, -18]], // R-1
  [[-60, -18], [80, -4]],  // R0
  [[-60,  -4], [80, 10]],  // R1
  [[-60,  10], [80, 24]],  // R2
  [[-60,  24], [80, 38]],  // R3
  [[-60,  38], [80, 52]],  // R4
  [[-60,  52], [80, 66]],  // R5
  [[-60,  66], [80, 80]],  // R6
];

// Terminals between roads — placed in every "block"
const TERMINALS = [
  // Between R-2 and R-1
  { pos: [-40, -41] }, { pos: [-10, -40] }, { pos: [ 20, -39] }, { pos: [ 50, -38] },
  // Between R-1 and R0
  { pos: [-40, -27] }, { pos: [-10, -26] }, { pos: [ 20, -25] }, { pos: [ 50, -24] },
  // Between R0 and R1
  { pos: [-40, -13] }, { pos: [-10, -12] }, { pos: [ 20, -11] }, { pos: [ 50, -10] },
  // Between R1 and R2
  { pos: [-40,   3] }, { pos: [-10,   4] }, { pos: [ 20,   5] }, { pos: [ 50,   6] },
  // Between R2 and R3
  { pos: [-40,  17] }, { pos: [-10,  18] }, { pos: [ 20,  19] }, { pos: [ 50,  20] },
  // Between R3 and R4
  { pos: [-40,  31] }, { pos: [-10,  32] }, { pos: [ 20,  33] }, { pos: [ 50,  34] },
  // Between R4 and R5
  { pos: [-40,  45] }, { pos: [-10,  46] }, { pos: [ 20,  47] }, { pos: [ 50,  48] },
  // Between R5 and R6
  { pos: [-40,  59] }, { pos: [-10,  60] }, { pos: [ 20,  61] }, { pos: [ 50,  62] },
];

// Workers near terminals
const WORKERS = [
  ...[-40, -10, 20, 50].flatMap(x => [-41, -27, -13, 3, 17, 31, 45, 59].flatMap(z => [
    { x: x - 1.5, z: z + 4.2, off: x * 0.3 + z * 0.1 },
    { x: x + 1.5, z: z + 4.2, off: x * 0.2 + z * 0.15 },
  ]))
];

// Road paths
const getPath = (zStart, zEnd) => [[-60, zStart], [-20, zStart + 4], [20, zStart + 8], [80, zEnd]];
const R_2 = getPath(-46, -32);
const R_1 = getPath(-32, -18);
const R_0 = getPath(-18, -4);
const R_1_p = getPath(-4, 10);
const R_2_p = getPath(10, 24);
const R_3_p = getPath(24, 38);
const R_4_p = getPath(38, 52);
const R_5_p = getPath(52, 66);
const R_6_p = getPath(66, 80);

// Vans for all roads
const VANS = [
  { pts: R_2, speed: 0.88, off: 0.1, laneSign: 1, stopTs: [0.4] },
  { pts: R_2, speed: 0.75, off: 0.6, laneSign: -1, stopTs: [0.3, 0.7] },
  { pts: R_1, speed: 0.92, off: 0.2, laneSign: 1, stopTs: [0.5] },
  { pts: R_1, speed: 0.80, off: 0.7, laneSign: -1, stopTs: [0.4, 0.8] },
  { pts: R_0, speed: 0.90, off: 0.0, laneSign: 1, stopTs: [0.35, 0.75] },
  { pts: R_0, speed: 0.80, off: 0.5, laneSign: -1, stopTs: [0.30, 0.65] },
  { pts: R_1_p, speed: 0.85, off: 0.1, laneSign: 1, stopTs: [0.40, 0.78] },
  { pts: R_1_p, speed: 0.75, off: 0.6, laneSign: -1, stopTs: [0.28, 0.60] },
  { pts: R_2_p, speed: 0.90, off: 0.2, laneSign: 1, stopTs: [0.38, 0.72] },
  { pts: R_2_p, speed: 0.80, off: 0.7, laneSign: -1, stopTs: [0.33, 0.68] },
  { pts: R_3_p, speed: 0.88, off: 0.15, laneSign: 1, stopTs: [0.36, 0.70] },
  { pts: R_3_p, speed: 0.78, off: 0.65, laneSign: -1, stopTs: [0.32, 0.62] },
  { pts: R_4_p, speed: 0.92, off: 0.25, laneSign: 1, stopTs: [0.42, 0.76] },
  { pts: R_4_p, speed: 0.72, off: 0.75, laneSign: -1, stopTs: [0.29, 0.58] },
  { pts: R_5_p, speed: 0.85, off: 0.3, laneSign: 1, stopTs: [0.4] },
  { pts: R_5_p, speed: 0.80, off: 0.8, laneSign: -1, stopTs: [0.5, 0.9] },
  { pts: R_6_p, speed: 0.90, off: 0.4, laneSign: 1, stopTs: [0.45] },
  { pts: R_6_p, speed: 0.78, off: 0.9, laneSign: -1, stopTs: [0.35, 0.75] },
];

/* ─── 3D Scene ─── */
function LogisticsScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [45, 42, 45], near: 0.1, far: 600 }}
      orthographic
      gl={{ antialias: true }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      onCreated={({ camera }) => {
        camera.zoom = 22;
        camera.updateProjectionMatrix();
        camera.lookAt(0, 0, 0);
      }}
    >
      <ambientLight intensity={0.5} color="#a0a0ff" />
      <directionalLight
        position={[25, 35, 15]} intensity={1.1} castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-left={-100} shadow-camera-right={100}
        shadow-camera-top={100} shadow-camera-bottom={-100}
        color="#FFD060"
      />
      <hemisphereLight skyColor="#0a0a2e" groundColor="#0a0a0a" intensity={0.4} />

      <Suspense fallback={null}>
        <Ground />

        {ROADS.map((pts, i) => <Road key={i} a={pts[0]} b={pts[1]} />)}
        {TERMINALS.map((t, i) => <Terminal key={i} pos={t.pos} />)}
        {WORKERS.map((w, i) => <Worker key={i} x={w.x} z={w.z} timeOffset={w.off} />)}

        <ContainerStack pos={[-10,  6]} />
        <ContainerStack pos={[ 14, -8]} />
        <ContainerStack pos={[-20,  5]} />
        <ContainerStack pos={[ 22, 12]} />
        <ContainerStack pos={[ 36, 26]} />
        <ContainerStack pos={[-18, 26]} />
        <ContainerStack pos={[ 10, 40]} />
        <ContainerStack pos={[ 38, 42]} />

        <Vessel />

        {VANS.map((v, i) => (
          <DeliveryVan
            key={i}
            pathPoints={v.pts}
            speed={v.speed}
            startOffset={v.off}
            stopTs={v.stopTs}
            laneSign={v.laneSign}
          />
        ))}
      </Suspense>
    </Canvas>
  );
}

/* ─── Hero Wrapper ─── */
export default function ShippingHero() {
  return (
    <section style={{
      width: '100vw', height: '75vh',
      background: 'linear-gradient(135deg, #000000 0%, #08080f 100%)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center',
    }}>
      <LogisticsScene />

      <div style={{
        position: 'relative', zIndex: 10,
        height: '100%',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '0 7%',
        maxWidth: '900px',
        background: 'linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.65) 70%, rgba(0,0,0,0.0) 100%)',
        paddingTop: '5%', paddingBottom: '5%',
        pointerEvents: 'none',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          style={{ pointerEvents: 'auto' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
            <span style={{ width: '44px', height: '4px', background: '#FFB800', borderRadius: '2px', display: 'inline-block' }} />
            <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '4px', textTransform: 'uppercase', color: '#A1A1AA' }}>
              Go-Logistics Network
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.6rem,4.5vw,4.8rem)', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.02, marginBottom: '22px', fontFamily: 'Arial Black, Arial' }}>
            12 Hubs.<br />
            <span style={{ color: '#FFB800' }}>One Network.</span><br />
            Zero Delays.
          </h1>

          <p style={{ fontSize: '1.2rem', color: '#A1A1AA', fontWeight: 500, marginBottom: '40px', lineHeight: 1.7, maxWidth: '650px' }}>
            Autonomous van fleets, cross-docking terminals, and sea freight — all connected in a live 3D logistics grid.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <button style={{
              background: '#FFB800', color: '#000000', border: 'none',
              padding: '16px 38px', borderRadius: '10px', fontWeight: 900, fontSize: '1rem',
              boxShadow: '0 0 24px rgba(255,184,0,0.4)', cursor: 'pointer',
            }}>Ship a Package</button>
            <button style={{
              background: 'transparent', color: '#FFFFFF',
              border: '2px solid rgba(255,255,255,0.25)', padding: '16px 38px',
              borderRadius: '10px', fontWeight: 900, fontSize: '1rem', cursor: 'pointer',
            }}>Track Cargo</button>
          </div>

          <div style={{ display: 'flex', gap: '36px', marginTop: '50px' }}>
            {[['12+', 'Active Hubs'], ['500+', 'Daily Routes'], ['99.4%', 'On-Time']].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: '0.72rem', color: '#A1A1AA', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '4px' }}>{l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
