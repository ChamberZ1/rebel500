/**
 * Representative engine, intake, cooling and exhaust geometry.
 * Shapes are simple volumes for interaction only — NOT Honda CAD. Internal parts (crankshaft,
 * clutch, transmission, valves …) are intentionally not modelled; they are data-only nodes.
 */
import { RoundedBox } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { MAT } from '../materials';
import { ENGINE_CYL_TILT } from '../layout';
import { DiscZ, Rod, Tube } from './primitives';

/** Cylinder axis: base on the crankcase top, leaning forward by ENGINE_CYL_TILT. */
const CYL_BASE = new THREE.Vector2(0.05, 0.44);
const CYL_DIR = new THREE.Vector2(-Math.sin(ENGINE_CYL_TILT), Math.cos(ENGINE_CYL_TILT));
const alongCyl = (d: number, fwd = 0): [number, number] => {
  const p = CYL_BASE.clone().addScaledVector(CYL_DIR, d);
  // perpendicular, pointing forward/down
  p.x += CYL_DIR.y * fwd;
  p.y += -CYL_DIR.x * fwd;
  return [p.x, p.y];
};

export function Crankcase() {
  return (
    <group>
      <RoundedBox args={[0.42, 0.25, 0.27]} radius={0.045} smoothness={3} position={[0.03, 0.34, 0]} material={MAT.engine} castShadow receiveShadow />
      {/* rear section housing the gearbox (representative) */}
      <RoundedBox args={[0.14, 0.18, 0.24]} radius={0.04} smoothness={3} position={[-0.15, 0.33, 0]} material={MAT.engine} castShadow />
    </group>
  );
}

export function OilPan() {
  return <RoundedBox args={[0.16, 0.04, 0.18]} radius={0.012} smoothness={2} position={[0.14, 0.205, 0]} material={MAT.engineDark} castShadow />;
}

export function CylinderBlock() {
  const [x, y] = alongCyl(0.085);
  return (
    <group position={[x, y, 0]} rotation={[0, 0, ENGINE_CYL_TILT]}>
      <RoundedBox args={[0.15, 0.17, 0.26]} radius={0.02} smoothness={2} material={MAT.engine} castShadow receiveShadow />
      {/* subtle horizontal grooves — styling only */}
      {[-0.05, 0, 0.05].map((dy) => (
        <mesh key={dy} position={[0, dy, 0]} material={MAT.engineDark}>
          <boxGeometry args={[0.152, 0.006, 0.262]} />
        </mesh>
      ))}
    </group>
  );
}

export function CylinderHead() {
  const [x, y] = alongCyl(0.22);
  return (
    <group position={[x, y, 0]} rotation={[0, 0, ENGINE_CYL_TILT]}>
      <RoundedBox args={[0.17, 0.1, 0.285]} radius={0.02} smoothness={2} material={MAT.engine} castShadow receiveShadow />
    </group>
  );
}

export function HeadCover() {
  const [x, y] = alongCyl(0.275);
  return (
    <group position={[x, y, 0]} rotation={[0, 0, ENGINE_CYL_TILT]}>
      <RoundedBox args={[0.15, 0.05, 0.26]} radius={0.02} smoothness={3} material={MAT.engineSatin} castShadow />
    </group>
  );
}

export function AlternatorCover() {
  return (
    <group>
      <DiscZ position={[-0.04, 0.35, -0.15]} radius={0.088} thickness={0.03} material={MAT.engineSatin} />
      <DiscZ position={[-0.04, 0.35, -0.167]} radius={0.05} thickness={0.006} material={MAT.engine} />
    </group>
  );
}

export function RightCrankcaseCover() {
  return (
    <group>
      <DiscZ position={[-0.065, 0.37, 0.15]} radius={0.09} thickness={0.03} material={MAT.engineSatin} />
      <DiscZ position={[-0.065, 0.37, 0.167]} radius={0.045} thickness={0.006} material={MAT.engine} />
      <DiscZ position={[0.08, 0.28, 0.15]} radius={0.05} thickness={0.024} material={MAT.engineSatin} />
    </group>
  );
}

export function ThrottleBodies() {
  const [hx, hy] = alongCyl(0.2, -0.1);
  return (
    <group>
      {[-0.065, 0.065].map((z) => (
        <group key={z}>
          <Rod from={[hx, hy, z]} to={[hx - 0.075, hy - 0.01, z]} radius={0.024} material={MAT.alloy} />
          <Rod from={[hx - 0.075, hy - 0.01, z]} to={[hx - 0.105, hy - 0.015, z]} radius={0.028} material={MAT.hose} />
        </group>
      ))}
    </group>
  );
}

/* ---------------- cooling ---------------- */

export function Radiator() {
  return (
    <group position={[0.355, 0.58, 0]} rotation={[0, 0, -0.35]}>
      <mesh material={MAT.radiatorCore} castShadow>
        <boxGeometry args={[0.035, 0.24, 0.2]} />
      </mesh>
      {/* fin texture: thin horizontal slats */}
      {Array.from({ length: 10 }, (_, i) => -0.108 + i * 0.024).map((y) => (
        <mesh key={y} position={[0.019, y, 0]} material={MAT.engineDark}>
          <boxGeometry args={[0.004, 0.006, 0.2]} />
        </mesh>
      ))}
      {[-0.11, 0.11].map((z) => (
        <mesh key={z} position={[0, 0, z]} material={MAT.alloy} castShadow>
          <boxGeometry args={[0.045, 0.26, 0.022]} />
        </mesh>
      ))}
    </group>
  );
}

export function CoolantHoses() {
  const [hx, hy] = alongCyl(0.2, 0.06);
  return (
    <group>
      <Tube points={[[0.39, 0.69, 0.09], [0.33, 0.69, 0.09], [hx + 0.02, hy + 0.02, 0.09]]} radius={0.011} material={MAT.hose} />
      <Tube points={[[0.32, 0.47, -0.09], [0.24, 0.42, -0.13], [0.12, 0.38, -0.14]]} radius={0.012} material={MAT.hose} />
    </group>
  );
}

/* ---------------- exhaust ----------------
 * Layout follows the 2026 CMX500AAC MUFFLER diagram (MLHAF2700): two headers down the front of
 * the engine → box-shaped chamber under the engine → single outlet pipe → long tapered muffler on
 * the right with a separate side cover. Dimensions and exact routing are representative.
 */

/** Under-engine chamber (part of the exhaust pipe assembly, diagram #1). */
const CHAMBER = { center: new THREE.Vector3(-0.06, 0.172, 0.03), size: [0.25, 0.055, 0.19] as [number, number, number] };
/** Muffler axis: rear end cap → inlet (front). */
const MUFFLER_REAR = new THREE.Vector3(-0.875, 0.318, 0.228);
const MUFFLER_FRONT = new THREE.Vector3(-0.3, 0.255, 0.205);
const MUFFLER_LEN = MUFFLER_REAR.distanceTo(MUFFLER_FRONT);
const MUFFLER_QUAT = new THREE.Quaternion().setFromUnitVectors(
  new THREE.Vector3(1, 0, 0),
  MUFFLER_FRONT.clone().sub(MUFFLER_REAR).normalize(),
);

export function ExhaustHeaders() {
  const [px, py] = alongCyl(0.2, 0.09);
  const c = CHAMBER.center;
  const [sx, sy] = CHAMBER.size;
  return (
    <group>
      {/* two header pipes: down the front of the engine, then rearward into the chamber */}
      {[-0.065, 0.065].map((z) => (
        <Tube
          key={z}
          points={[
            [px, py, z],
            [px + 0.045, py - 0.07, z],
            [0.275, 0.4, z * 0.95],
            [0.272, 0.25, z * 0.85],
            [0.22, 0.17, z * 0.6 + 0.01],
            [0.13, 0.16, z * 0.5 + 0.02],
            [c.x + sx / 2 + 0.005, c.y, z * 0.4 + 0.025],
          ]}
          radius={0.019}
          material={MAT.exhaust}
          tubular={80}
        />
      ))}
      {/* chamber */}
      <RoundedBox args={CHAMBER.size} radius={0.03} smoothness={4} position={c} material={MAT.exhaust} castShadow receiveShadow />
      {/* mounting tab on top of the chamber */}
      <RoundedBox args={[0.05, 0.03, 0.012]} radius={0.004} position={[c.x - 0.02, c.y + sy / 2 + 0.012, c.z + 0.07]} material={MAT.exhaust} />
      {/* outlet pipe → muffler inlet on the right side */}
      <Tube
        points={[
          [c.x - sx / 2 - 0.005, c.y + 0.005, c.z + 0.05],
          [-0.22, 0.2, 0.13],
          [-0.27, 0.24, 0.19],
          MUFFLER_FRONT.toArray() as [number, number, number],
        ]}
        radius={0.024}
        material={MAT.exhaust}
        tubular={48}
      />
    </group>
  );
}

/** Wired exhaust sensor (#14) on the pipe ahead of the chamber; position approximate. */
export function ExhaustSensor() {
  const base: [number, number, number] = [0.255, 0.3, 0.075];
  return (
    <group>
      <Rod from={base} to={[0.24, 0.31, 0.105]} radius={0.009} material={MAT.steel} />
      <Rod from={[0.24, 0.31, 0.105]} to={[0.235, 0.312, 0.118]} radius={0.012} material={MAT.engineSatin} />
      <Tube points={[[0.235, 0.312, 0.118], [0.22, 0.36, 0.14], [0.2, 0.42, 0.15], [0.18, 0.46, 0.15]]} radius={0.003} material={MAT.hose} />
      <RoundedBox args={[0.022, 0.014, 0.014]} radius={0.003} position={[0.18, 0.46, 0.15]} material={MAT.plastic} />
    </group>
  );
}

/** Muffler (#5): narrow inlet tapering out to a large body with a slanted rear cap. */
export function Muffler() {
  const L = MUFFLER_LEN;
  // [distance from rear end, radius]
  const profile: Array<[number, number]> = [
    [0, 0],
    [0.004, 0.05],
    [0.022, 0.063],
    [0.05, 0.065],
    [L * 0.66, 0.064],
    [L * 0.68, 0.06],
    [L * 0.9, 0.047],
    [L, 0.044],
  ];
  const bracketPos = new THREE.Vector3().lerpVectors(MUFFLER_REAR, MUFFLER_FRONT, 0.45).add(new THREE.Vector3(0, 0.07, -0.02));
  return (
    <group>
      <group position={MUFFLER_REAR} quaternion={MUFFLER_QUAT}>
        <LatheBody profile={profile} material={MAT.exhaust} />
        {/* silver end cap (as on the stock muffler) */}
        <LatheBody profile={[[-0.004, 0.0], [0.0, 0.05], [0.006, 0.062], [0.03, 0.0655]]} material={MAT.chrome} />
      </group>
      {/* mounting bracket on top, toward the frame (rubber-mounted per diagram) */}
      <RoundedBox args={[0.1, 0.08, 0.008]} radius={0.004} position={bracketPos} rotation={[0.25, 0, 0.2]} material={MAT.frame} castShadow />
    </group>
  );
}

/** Muffler side cover (#7): tapered shell over the outer (+Z) face of the muffler body. */
export function MufflerCover() {
  const L = MUFFLER_LEN;
  const profile: Array<[number, number]> = [
    [0.04, 0.066],
    [0.06, 0.071],
    [L * 0.62, 0.071],
    [L * 0.66, 0.066],
  ];
  return (
    <group position={MUFFLER_REAR} quaternion={MUFFLER_QUAT}>
      <LatheBody profile={profile} material={MAT.engineSatin} phiStart={-Math.PI / 2 + 0.25} phiLength={Math.PI - 0.5} doubleSide />
    </group>
  );
}

/** Lathe revolved around +X (profile: [x, radius]); optional partial sweep for shells. */
function LatheBody({
  profile,
  material,
  phiStart = 0,
  phiLength = Math.PI * 2,
  doubleSide = false,
}: {
  profile: Array<[number, number]>;
  material: THREE.Material;
  phiStart?: number;
  phiLength?: number;
  doubleSide?: boolean;
}) {
  const { geometry, mat } = useMemo(() => {
    const g = new THREE.LatheGeometry(
      profile.map(([x, r]) => new THREE.Vector2(Math.max(r, 0.0001), x)),
      40,
      phiStart,
      phiLength,
    );
    // Lathe axis is +Y with angle 0 facing +Z; rotate so the axis becomes +X (keeps the +Z side on +Z).
    g.rotateZ(-Math.PI / 2);
    g.computeVertexNormals();
    let m = material;
    if (doubleSide) {
      m = material.clone();
      m.side = THREE.DoubleSide;
    }
    return { geometry: g, mat: m };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(profile), phiStart, phiLength, doubleSide, material]);
  return <mesh geometry={geometry} material={mat} castShadow receiveShadow />;
}
