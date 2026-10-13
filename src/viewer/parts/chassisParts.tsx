/**
 * Representative chassis, steering, suspension, wheel, final-drive and brake geometry.
 * Dimensions tagged [Honda 2026] in layout.ts (wheel/tire diameters, rake, trail, fork tube size
 * and spacing, disc and sprocket sizes) are used for proportions; everything else is representative.
 */
import { RoundedBox } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { MAT } from '../materials';
import {
  CHAIN_Z,
  DRIVE_SPROCKET_CENTER,
  DRIVE_SPROCKET_RADIUS,
  DRIVEN_SPROCKET_RADIUS,
  FORK_HALF_SPACING,
  FORK_TUBE_RADIUS,
  FRONT_AXLE,
  FRONT_DISC_RADIUS,
  FRONT_TIRE,
  RAKE,
  REAR_AXLE,
  REAR_DISC_RADIUS,
  REAR_TIRE,
  STEER_BOTTOM_S,
  STEER_DIR,
  STEER_TOP_S,
  SWINGARM_PIVOT,
  forkPoint,
  steerPoint,
} from '../layout';
import { DiscZ, Rod, TorusZ, Tube } from './primitives';

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const withZ = (p: THREE.Vector3, z: number) => v(p.x, p.y, z);

/* ---------------- frame ---------------- */

export function Frame() {
  const headBottom = steerPoint(STEER_BOTTOM_S - 0.02);
  const headTop = steerPoint(STEER_TOP_S);
  return (
    <group>
      <Rod from={headBottom} to={headTop} radius={0.034} material={MAT.frame} />
      {/* upper rails: head → along the tank underside → under the seat → hoop rising behind the seat */}
      {[-1, 1].map((sd) => (
        <Tube
          key={`upper${sd}`}
          points={[
            withZ(steerPoint(STEER_TOP_S - 0.06), sd * 0.03),
            v(0.2, 0.8, sd * 0.06),
            v(-0.05, 0.71, sd * 0.09),
            v(-0.25, 0.655, sd * 0.11),
            v(-0.5, 0.625, sd * 0.12),
            v(-0.615, 0.635, sd * 0.12),
            v(-0.64, 0.7, sd * 0.115),
            v(-0.625, 0.76, sd * 0.1),
          ]}
          radius={0.018}
          material={MAT.frame}
        />
      ))}
      <Tube points={[v(-0.625, 0.76, -0.1), v(-0.6, 0.775, 0), v(-0.625, 0.76, 0.1)]} radius={0.016} material={MAT.frame} />
      {/* long diagonal tubes: head → down past the engine → swingarm pivot plates */}
      {[-1, 1].map((sd) => (
        <Tube
          key={`diag${sd}`}
          points={[withZ(steerPoint(STEER_BOTTOM_S + 0.02), sd * 0.04), v(0.2, 0.74, sd * 0.11), v(-0.08, 0.62, sd * 0.135), v(-0.19, 0.53, sd * 0.135), v(-0.2, 0.48, sd * 0.13)]}
          radius={0.018}
          material={MAT.frame}
        />
      ))}
      {/* front down-tubes outside the radiator to the front engine mount */}
      {[-1, 1].map((sd) => (
        <Tube
          key={`down${sd}`}
          points={[withZ(steerPoint(STEER_BOTTOM_S - 0.01), sd * 0.04), v(0.37, 0.7, sd * 0.13), v(0.31, 0.5, sd * 0.15), v(0.27, 0.36, sd * 0.15)]}
          radius={0.018}
          material={MAT.frame}
        />
      ))}
      {/* pivot plates */}
      {[-0.13, 0.13].map((z) => (
        <RoundedBox key={`pp${z}`} args={[0.11, 0.17, 0.022]} radius={0.01} position={[SWINGARM_PIVOT.x, SWINGARM_PIVOT.y + 0.04, z]} material={MAT.frame} castShadow />
      ))}
      {/* struts pivot plate → shock top mount → upper rail */}
      {[-0.13, 0.13].map((z) => (
        <Tube key={`strut${z}`} points={[v(-0.22, 0.49, z), v(-0.4, 0.56, z * 1.05), v(-0.555, 0.615, z * 1.1), v(-0.6, 0.63, z * 0.95)]} radius={0.015} material={MAT.frame} />
      ))}
      {/* under-seat cross tube */}
      <Rod from={v(-0.45, 0.63, -0.12)} to={v(-0.45, 0.63, 0.12)} radius={0.012} material={MAT.frame} />
    </group>
  );
}

export function SideStand() {
  return (
    <group>
      <Rod from={[-0.12, 0.24, -0.15]} to={[-0.38, 0.2, -0.175]} radius={0.012} material={MAT.frame} />
      <RoundedBox args={[0.05, 0.012, 0.035]} radius={0.004} position={[-0.39, 0.195, -0.176]} material={MAT.frame} />
    </group>
  );
}

export function Swingarm() {
  return (
    <group>
      {[-0.135, 0.135].map((z) => {
        const a = withZ(SWINGARM_PIVOT, z);
        const b = withZ(REAR_AXLE, z);
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const len = a.distanceTo(b);
        const angle = Math.atan2(b.y - a.y, b.x - a.x);
        return (
          <RoundedBox key={z} args={[len + 0.04, 0.055, 0.03]} radius={0.012} position={mid} rotation={[0, 0, angle]} material={MAT.frame} castShadow />
        );
      })}
      <Rod from={withZ(SWINGARM_PIVOT, -0.15)} to={withZ(SWINGARM_PIVOT, 0.15)} radius={0.022} material={MAT.frame} />
      <Rod from={v(-0.3, 0.362, -0.135)} to={v(-0.3, 0.362, 0.135)} radius={0.018} material={MAT.frame} />
    </group>
  );
}

/* ---------------- steering ---------------- */

/** Triple clamp plate perpendicular to the steering axis at axis position s. */
function Clamp({ s, depth, material }: { s: number; depth: number; material: THREE.Material }) {
  const n = new THREE.Vector3(Math.cos(RAKE), Math.sin(RAKE), 0);
  const c = steerPoint(s).addScaledVector(n, 0.03);
  return (
    <RoundedBox args={[0.11, depth, FORK_HALF_SPACING * 2 + 0.07]} radius={0.012} position={c} rotation={[0, 0, RAKE]} material={material} castShadow />
  );
}

export function SteeringStem() {
  return (
    <group>
      <Clamp s={STEER_BOTTOM_S} depth={0.035} material={MAT.alloy} />
      <Rod from={steerPoint(STEER_BOTTOM_S - 0.02)} to={steerPoint(STEER_BOTTOM_S)} radius={0.02} material={MAT.steel} />
    </group>
  );
}

export function TopBridge() {
  return (
    <group>
      <Clamp s={STEER_TOP_S} depth={0.028} material={MAT.alloy} />
      <Rod from={steerPoint(STEER_TOP_S)} to={steerPoint(STEER_TOP_S + 0.025)} radius={0.016} material={MAT.steel} />
    </group>
  );
}

/* ---------------- front fork ---------------- */

const FORK_TOP_T = 0.79;
const SLIDER_TOP_T = 0.3;

export function ForkTubes() {
  return (
    <group>
      {[-1, 1].map((s) => (
        <Rod
          key={s}
          from={withZ(forkPoint(SLIDER_TOP_T - 0.06), s * FORK_HALF_SPACING)}
          to={withZ(forkPoint(FORK_TOP_T), s * FORK_HALF_SPACING)}
          radius={FORK_TUBE_RADIUS}
          material={MAT.chrome}
          radial={24}
        />
      ))}
    </group>
  );
}

export function ForkSliders() {
  return (
    <group>
      {[-1, 1].map((s) => (
        <group key={s}>
          <Rod
            from={withZ(forkPoint(-0.035), s * FORK_HALF_SPACING)}
            to={withZ(forkPoint(SLIDER_TOP_T), s * FORK_HALF_SPACING)}
            radius={0.03}
            radiusTop={0.028}
            material={MAT.alloy}
            radial={24}
          />
          <Rod
            from={withZ(forkPoint(SLIDER_TOP_T), s * FORK_HALF_SPACING)}
            to={withZ(forkPoint(SLIDER_TOP_T + 0.012), s * FORK_HALF_SPACING)}
            radius={0.03}
            material={MAT.rubber}
            radial={24}
          />
        </group>
      ))}
    </group>
  );
}

/* ---------------- rear shocks ---------------- */

function Shock({ z }: { z: number }) {
  const lower = v(-0.69, 0.385, z);
  const upper = v(-0.555, 0.61, z);
  const dir = upper.clone().sub(lower);
  const len = dir.length();
  dir.normalize();
  const helix = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const turns = 7;
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    for (let i = 0; i <= turns * 16; i++) {
      const t = i / (turns * 16);
      const a = t * turns * Math.PI * 2;
      const p = new THREE.Vector3(Math.cos(a) * 0.026, 0.07 + t * (len - 0.15), Math.sin(a) * 0.026).applyQuaternion(q);
      pts.push(p.add(lower));
    }
    return pts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [z]);
  return (
    <group>
      <Rod from={lower} to={lower.clone().addScaledVector(dir, len * 0.55)} radius={0.017} material={MAT.engineDark} />
      <Rod from={lower.clone().addScaledVector(dir, len * 0.45)} to={upper} radius={0.009} material={MAT.chrome} />
      <Rod from={upper.clone().addScaledVector(dir, -0.06)} to={upper} radius={0.03} material={MAT.engineDark} />
      <Tube points={helix} radius={0.0045} material={MAT.engineDark} tubular={400} radial={6} tension={0} />
      <DiscZ position={lower} radius={0.016} thickness={0.03} material={MAT.steel} />
      <DiscZ position={upper} radius={0.016} thickness={0.03} material={MAT.steel} />
    </group>
  );
}

export const ShockLeft = () => <Shock z={-0.152} />;
export const ShockRight = () => <Shock z={0.152} />;

/* ---------------- wheels ---------------- */

function CastRim({ center, rimRadius, width }: { center: THREE.Vector3; rimRadius: number; width: number }) {
  const spokes = 10;
  return (
    <group position={center}>
      {[-1, 1].map((s) => (
        <TorusZ key={s} position={[0, 0, (s * width) / 2.4]} radius={rimRadius} tube={0.011} material={MAT.alloy} />
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={MAT.alloy}>
        <cylinderGeometry args={[rimRadius - 0.004, rimRadius - 0.004, width * 0.82, 48, 1, true]} />
      </mesh>
      <DiscZ position={[0, 0, 0]} radius={0.055} thickness={width * 0.7} material={MAT.alloy} />
      {Array.from({ length: spokes }, (_, i) => {
        const a = (i / spokes) * Math.PI * 2;
        const r0 = 0.05;
        const r1 = rimRadius - 0.006;
        const mid = (r0 + r1) / 2;
        return (
          <mesh key={i} position={[Math.cos(a) * mid, Math.sin(a) * mid, 0]} rotation={[0, 0, a]} material={MAT.alloy} castShadow>
            <boxGeometry args={[r1 - r0, 0.02, 0.022]} />
          </mesh>
        );
      })}
    </group>
  );
}

function Tire({ center, radius, width, rimRadius }: { center: THREE.Vector3; radius: number; width: number; rimRadius: number }) {
  const tube = (radius - rimRadius) / 2;
  return <TorusZ position={center} radius={radius - tube} tube={tube} scaleZ={width / 2 / tube} material={MAT.rubber} />;
}

export const FrontRim = () => <CastRim center={FRONT_AXLE} rimRadius={FRONT_TIRE.rimRadius} width={0.1} />;
export const RearRim = () => <CastRim center={REAR_AXLE} rimRadius={REAR_TIRE.rimRadius} width={0.115} />;
export const FrontTire = () => <Tire center={FRONT_AXLE} radius={FRONT_TIRE.radius} width={FRONT_TIRE.width} rimRadius={FRONT_TIRE.rimRadius} />;
export const RearTire = () => <Tire center={REAR_AXLE} radius={REAR_TIRE.radius} width={REAR_TIRE.width} rimRadius={REAR_TIRE.rimRadius} />;

export const FrontAxle = () => (
  <Rod from={withZ(FRONT_AXLE, -FORK_HALF_SPACING - 0.035)} to={withZ(FRONT_AXLE, FORK_HALF_SPACING + 0.035)} radius={0.01} material={MAT.steel} />
);
export const RearAxle = () => (
  <Rod from={withZ(REAR_AXLE, -0.165)} to={withZ(REAR_AXLE, 0.165)} radius={0.011} material={MAT.steel} />
);

/* ---------------- final drive ---------------- */

function sprocketGeometry(pitchRadius: number, teeth: number, thickness: number, bore: number) {
  const shape = new THREE.Shape();
  const tip = pitchRadius + 0.006;
  const root = pitchRadius - 0.005;
  const steps = teeth * 4;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const r = i % 4 === 1 || i % 4 === 2 ? tip : root;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.holes.push(new THREE.Path().absarc(0, 0, bore, 0, Math.PI * 2, true));
  const g = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
  g.translate(0, 0, -thickness / 2);
  return g;
}

export function DriveSprocket() {
  const g = useMemo(() => sprocketGeometry(DRIVE_SPROCKET_RADIUS, 15, 0.008, 0.012), []);
  return <mesh geometry={g} position={DRIVE_SPROCKET_CENTER} material={MAT.steel} castShadow />;
}

export function DrivenSprocket() {
  const g = useMemo(() => sprocketGeometry(DRIVEN_SPROCKET_RADIUS, 40, 0.007, 0.055), []);
  return <mesh geometry={g} position={withZ(REAR_AXLE, CHAIN_Z)} material={MAT.steel} castShadow />;
}

/** Closed chain path wrapping both sprockets' pitch circles (external tangents). */
export function DriveChain() {
  const points = useMemo(() => {
    const c1 = new THREE.Vector2(DRIVE_SPROCKET_CENTER.x, DRIVE_SPROCKET_CENTER.y);
    const c2 = new THREE.Vector2(REAR_AXLE.x, REAR_AXLE.y);
    const r1 = DRIVE_SPROCKET_RADIUS;
    const r2 = DRIVEN_SPROCKET_RADIUS;
    const d = c2.clone().sub(c1);
    const L = d.length();
    const phi = Math.atan2(d.y, d.x);
    const alpha = Math.acos((r1 - r2) / L);
    const pts: THREE.Vector3[] = [];
    const arc = (c: THREE.Vector2, r: number, a0: number, a1: number) => {
      const n = Math.max(6, Math.ceil(Math.abs(a1 - a0) / 0.12));
      for (let i = 0; i <= n; i++) {
        const a = a0 + ((a1 - a0) * i) / n;
        pts.push(new THREE.Vector3(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r, CHAIN_Z));
      }
    };
    const line = (a: THREE.Vector3, b: THREE.Vector3) => {
      for (let i = 1; i < 8; i++) pts.push(a.clone().lerp(b, i / 8));
    };
    // drive sprocket: wrap the far side (away from rear sprocket)
    arc(c1, r1, phi + alpha, phi + 2 * Math.PI - alpha);
    const p1 = pts[pts.length - 1].clone();
    const q1 = new THREE.Vector3(c2.x + Math.cos(phi - alpha) * r2, c2.y + Math.sin(phi - alpha) * r2, CHAIN_Z);
    line(p1, q1);
    // rear sprocket: wrap the far side (away from drive sprocket)
    arc(c2, r2, phi - alpha, phi + alpha);
    const p2 = pts[pts.length - 1].clone();
    const q2 = new THREE.Vector3(c1.x + Math.cos(phi + alpha) * r1, c1.y + Math.sin(phi + alpha) * r1, CHAIN_Z);
    line(p2, q2);
    return pts;
  }, []);
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal');
    return new THREE.TubeGeometry(curve, 400, 0.0055, 6, true);
  }, [points]);
  return <mesh geometry={geometry} material={MAT.chain} castShadow />;
}

/* ---------------- brakes ---------------- */

export const FrontDisc = () => (
  <group>
    <DiscZ position={withZ(FRONT_AXLE, 0.072)} radius={FRONT_DISC_RADIUS} inner={FRONT_DISC_RADIUS - 0.04} thickness={0.005} material={MAT.disc} segments={64} />
    <DiscZ position={withZ(FRONT_AXLE, 0.072)} radius={FRONT_DISC_RADIUS - 0.038} inner={0.04} thickness={0.004} material={MAT.alloy} segments={32} />
  </group>
);

export const RearDisc = () => (
  <group>
    <DiscZ position={withZ(REAR_AXLE, 0.088)} radius={REAR_DISC_RADIUS} inner={REAR_DISC_RADIUS - 0.035} thickness={0.005} material={MAT.disc} segments={64} />
    <DiscZ position={withZ(REAR_AXLE, 0.088)} radius={REAR_DISC_RADIUS - 0.033} inner={0.035} thickness={0.004} material={MAT.alloy} segments={32} />
  </group>
);

function Caliper({ center, angle, z, size }: { center: THREE.Vector3; angle: number; z: number; size: [number, number, number] }) {
  return (
    <RoundedBox
      args={size}
      radius={0.01}
      smoothness={2}
      position={[center.x, center.y, z]}
      rotation={[0, 0, angle]}
      material={MAT.engineSatin}
      castShadow
    />
  );
}

export function FrontCaliper() {
  const a = THREE.MathUtils.degToRad(145);
  const r = FRONT_DISC_RADIUS - 0.018;
  const c = v(FRONT_AXLE.x + Math.cos(a) * r, FRONT_AXLE.y + Math.sin(a) * r, 0);
  return <Caliper center={c} angle={a + Math.PI / 2} z={0.085} size={[0.085, 0.045, 0.04]} />;
}

export function RearCaliper() {
  const a = THREE.MathUtils.degToRad(95); // on top of the disc, as in Honda's photo
  const r = REAR_DISC_RADIUS - 0.015;
  const c = v(REAR_AXLE.x + Math.cos(a) * r, REAR_AXLE.y + Math.sin(a) * r, 0);
  return <Caliper center={c} angle={a + Math.PI / 2} z={0.098} size={[0.07, 0.04, 0.036]} />;
}

export function FrontBrakeHose() {
  const a = THREE.MathUtils.degToRad(145);
  const r = FRONT_DISC_RADIUS - 0.018;
  const cal = v(FRONT_AXLE.x + Math.cos(a) * r, FRONT_AXLE.y + Math.sin(a) * r + 0.02, 0.1);
  const upper = forkPoint(0.62);
  return (
    <Tube
      points={[v(0.25, 1.085, 0.245), v(0.33, 1.04, 0.2), withZ(upper.clone().addScaledVector(STEER_DIR, -0.05), 0.16), v(0.6, 0.55, 0.15), cal]}
      radius={0.0045}
      material={MAT.hose}
      tubular={80}
    />
  );
}

export function RearBrakeHose() {
  const a = THREE.MathUtils.degToRad(95);
  const r = REAR_DISC_RADIUS - 0.015;
  const cal = v(REAR_AXLE.x + Math.cos(a) * r, REAR_AXLE.y + Math.sin(a) * r + 0.02, 0.12);
  return (
    <Tube
      points={[v(-0.12, 0.39, 0.165), v(-0.3, 0.44, 0.16), v(-0.5, 0.45, 0.15), v(-0.66, 0.46, 0.13), cal]}
      radius={0.0045}
      material={MAT.hose}
      tubular={80}
    />
  );
}
