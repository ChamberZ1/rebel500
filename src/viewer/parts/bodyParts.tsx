/**
 * Representative bodywork, rider controls, lighting and instrument geometry.
 * The side profile is traced from Honda's side-view press photo of the 2026 Rebel 500 (scaled by
 * wheelbase/tire size), so outlines are close in side view but remain simplified stand-ins —
 * NOT Honda CAD. Widths (Z) are estimates.
 */
import { RoundedBox } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { MAT } from '../materials';
import { FORK_HALF_SPACING, FRONT_AXLE, FRONT_TIRE, RAKE, REAR_AXLE, SEAT_HEIGHT, STEER_TOP_S, forkPoint, steerPoint } from '../layout';
import { ExtrudeXY, LatheX, Rod, Tube, loftGeometry, loftTopAt, type LoftSection } from './primitives';

const paintDouble = MAT.paint.clone();
paintDouble.side = THREE.DoubleSide;

/* ---------------- fuel tank ---------------- */

/**
 * Peanut tank traced from the side photo: a long wedge with a nearly flat top (~0.99 m), a long
 * sloping rear face ending just above the seat nose, and an underside that rises toward the
 * steering head along the frame rails.
 */
export const TANK_SECTIONS: LoftSection[] = [
  { x: -0.188, yTop: 0.722, yBot: 0.7, half: 0.03 },
  { x: -0.165, yTop: 0.79, yBot: 0.702, half: 0.062 },
  { x: -0.1, yTop: 0.866, yBot: 0.72, half: 0.092 },
  { x: -0.04, yTop: 0.925, yBot: 0.742, half: 0.11 },
  { x: 0.02, yTop: 0.963, yBot: 0.762, half: 0.12 },
  { x: 0.1, yTop: 0.985, yBot: 0.792, half: 0.125 },
  { x: 0.18, yTop: 0.992, yBot: 0.822, half: 0.122 },
  { x: 0.25, yTop: 0.984, yBot: 0.85, half: 0.112 },
  { x: 0.29, yTop: 0.955, yBot: 0.868, half: 0.09 },
  { x: 0.315, yTop: 0.91, yBot: 0.884, half: 0.04 },
];

export function FuelTank() {
  const geometry = useMemo(() => loftGeometry(TANK_SECTIONS, { roundness: 2.3, perSegment: 12, radial: 40 }), []);
  const capX = 0.15;
  return (
    <group>
      <mesh geometry={geometry} material={MAT.paint} castShadow receiveShadow />
      <mesh position={[capX, loftTopAt(TANK_SECTIONS, capX) + 0.002, 0]} material={MAT.engineSatin} castShadow>
        <cylinderGeometry args={[0.03, 0.033, 0.012, 28]} />
      </mesh>
    </group>
  );
}

/* ---------------- seat ---------------- */

/**
 * Rider seat: teardrop in plan (OEM SEAT diagram #2) and, in side view, nearly flat at Honda's
 * 27.2 in seat height with a kick-up at the rear. Its nose stops ~2 cm short of the tank tail,
 * leaving the slight gap visible on the real bike.
 */
const SEAT_SECTIONS: LoftSection[] = [
  { x: -0.207, yTop: 0.69, yBot: 0.664, half: 0.03 },
  { x: -0.222, yTop: 0.702, yBot: 0.655, half: 0.058 },
  { x: -0.27, yTop: 0.703, yBot: 0.647, half: 0.092 },
  { x: -0.34, yTop: SEAT_HEIGHT + 0.004, yBot: 0.642, half: 0.126 },
  { x: -0.41, yTop: SEAT_HEIGHT, yBot: 0.64, half: 0.145 },
  { x: -0.48, yTop: 0.708, yBot: 0.642, half: 0.15 },
  { x: -0.54, yTop: 0.733, yBot: 0.648, half: 0.14 },
  { x: -0.585, yTop: 0.752, yBot: 0.66, half: 0.112 },
  { x: -0.612, yTop: 0.748, yBot: 0.678, half: 0.055 },
];

export function TeardropSeat({ material }: { material: THREE.Material }) {
  const geometry = useMemo(() => loftGeometry(SEAT_SECTIONS, { roundness: 3, perSegment: 10, radial: 40 }), []);
  return (
    <group>
      <mesh geometry={geometry} material={material} castShadow receiveShadow />
      {/* black seat pan visible along the lower edge */}
      <mesh geometry={geometry} material={MAT.plastic} position={[0, -0.012, 0]} scale={[1, 1, 0.97]} />
    </group>
  );
}

export const Seat = () => <TeardropSeat material={MAT.seat} />;

/* ---------------- fenders ---------------- */

const deg = THREE.MathUtils.degToRad;

/** Open cylindrical shell over a wheel. `fromDeg`/`toDeg` are polar angles in the XY plane. */
function FenderShell({ center, radius, width, fromDeg, toDeg }: { center: THREE.Vector3; radius: number; width: number; fromDeg: number; toDeg: number }) {
  const geometry = useMemo(() => {
    // CylinderGeometry theta: x = r sinθ, z = r cosθ; after rotateX(π/2) polar angle ψ = θ − 90°.
    const g = new THREE.CylinderGeometry(radius, radius, width, 48, 1, true, deg(fromDeg + 90), deg(toDeg - fromDeg));
    g.rotateX(Math.PI / 2);
    return g;
  }, [radius, width, fromDeg, toDeg]);
  return <mesh geometry={geometry} position={center} material={paintDouble} castShadow receiveShadow />;
}

export const FrontFender = () => <FenderShell center={FRONT_AXLE} radius={FRONT_TIRE.radius + 0.025} width={0.15} fromDeg={38} toDeg={132} />;

/** Rear fender: high, deep-skirted shell (traced: top ≈0.74 m, rear end ≈ X −1.03 m). */
const RF = { r: 0.415, inner: 0.335, width: 0.2, from: 62, to: 140 };
export const rearFenderPoint = (d: number, r = RF.r) =>
  new THREE.Vector3(REAR_AXLE.x + Math.cos(deg(d)) * r, REAR_AXLE.y + Math.sin(deg(d)) * r, 0);

export function RearFender() {
  return (
    <group>
      <FenderShell center={REAR_AXLE} radius={RF.r} width={RF.width} fromDeg={RF.from} toDeg={RF.to} />
      {/* side skirts reaching down over the top of the tire */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[REAR_AXLE.x, REAR_AXLE.y, (s * RF.width) / 2]} material={paintDouble} castShadow>
          <ringGeometry args={[RF.inner, RF.r, 48, 1, deg(RF.from), deg(RF.to - RF.from)]} />
        </mesh>
      ))}
    </group>
  );
}

export function LicenseBracket() {
  return (
    <group>
      <Tube points={[[-1.0, 0.575, 0], [-1.05, 0.53, 0], [-1.09, 0.49, 0]]} radius={0.01} material={MAT.frame} />
      <RoundedBox args={[0.008, 0.1, 0.178]} radius={0.003} position={[-1.135, 0.435, 0]} rotation={[0, 0, -0.56]} material={MAT.plastic} castShadow />
      {/* rear reflector */}
      <mesh position={[-1.12, 0.46, 0.06]} rotation={[0, -Math.PI / 2, 0]} material={MAT.lensRed}>
        <circleGeometry args={[0.024, 24]} />
      </mesh>
    </group>
  );
}

/* ---------------- side covers ---------------- */

/** Triangular panel under the seat (traced from the photo). */
function SideCover({ z }: { z: number }) {
  return (
    <ExtrudeXY
      z={z}
      depth={0.014}
      outline={[
        [-0.1, 0.655],
        [-0.395, 0.625],
        [-0.3, 0.545],
        [-0.2, 0.475],
        [-0.12, 0.53],
      ]}
      material={MAT.paint}
    />
  );
}
export const SideCoverLeft = () => <SideCover z={-0.15} />;
export const SideCoverRight = () => <SideCover z={0.15} />;

/* ---------------- handlebar & hand controls ---------------- */

/** Handlebar center height; grips end up ≈1.07–1.08 m as in the photo. */
const BAR_Y = 1.04;
/** Mirror head center (photo: heads at ≈1.15–1.27 m). */
const MIRROR_Y = 1.21;
const barPoints = (s: number) => [
  [0.36, BAR_Y, 0],
  [0.345, BAR_Y + 0.005, s * 0.12],
  [0.285, BAR_Y + 0.022, s * 0.24],
  [0.225, BAR_Y + 0.034, s * 0.32],
  [0.195, BAR_Y + 0.036, s * 0.42],
] as [number, number, number][];

export function Handlebar() {
  const top = steerPoint(STEER_TOP_S);
  return (
    <group>
      {[-0.045, 0.045].map((z) => (
        <Rod key={z} from={[top.x + 0.02, top.y + 0.015, z]} to={[0.36, BAR_Y, z]} radius={0.014} material={MAT.engineSatin} />
      ))}
      <Tube points={[...barPoints(-1).reverse(), ...barPoints(1).slice(1)]} radius={0.0125} material={MAT.frame} tubular={96} />
    </group>
  );
}

function Grip({ side }: { side: 1 | -1 }) {
  return <Rod from={[0.226, BAR_Y + 0.035, side * 0.3]} to={[0.192, BAR_Y + 0.036, side * 0.415]} radius={0.017} material={MAT.rubber} />;
}
const SwitchHousing = ({ side }: { side: 1 | -1 }) => (
  <RoundedBox args={[0.05, 0.045, 0.045]} radius={0.012} position={[0.236, BAR_Y + 0.032, side * 0.27]} material={MAT.plastic} />
);
export const ThrottleGrip = () => (
  <group>
    <Grip side={1} />
    <SwitchHousing side={1} />
  </group>
);
export const LeftGrip = () => (
  <group>
    <Grip side={-1} />
    <SwitchHousing side={-1} />
  </group>
);

function Lever({ side }: { side: 1 | -1 }) {
  return <Tube points={[[0.255, BAR_Y + 0.042, side * 0.25], [0.275, BAR_Y + 0.032, side * 0.33], [0.262, BAR_Y + 0.028, side * 0.41]]} radius={0.006} material={MAT.alloy} />;
}
export const FrontBrakeLever = () => <Lever side={1} />;
export const ClutchLever = () => (
  <group>
    <Lever side={-1} />
    <RoundedBox args={[0.04, 0.03, 0.04]} radius={0.01} position={[0.245, BAR_Y + 0.047, -0.24]} material={MAT.alloy} />
  </group>
);

export function FrontMasterCylinder() {
  return (
    <group>
      <RoundedBox args={[0.05, 0.03, 0.05]} radius={0.01} position={[0.245, BAR_Y + 0.047, 0.24]} material={MAT.alloy} />
      <RoundedBox args={[0.035, 0.022, 0.04]} radius={0.008} position={[0.25, BAR_Y + 0.072, 0.215]} material={MAT.engineDark} />
    </group>
  );
}

/** Tall stalk and rounded-rectangle head, glass facing the rider (−X), toed slightly outward. */
function Mirror({ side }: { side: 1 | -1 }) {
  return (
    <group>
      <Tube
        points={[[0.262, BAR_Y + 0.05, side * 0.235], [0.275, BAR_Y + 0.1, side * 0.25], [0.284, MIRROR_Y - 0.075, side * 0.262], [0.287, MIRROR_Y - 0.05, side * 0.266]]}
        radius={0.006}
        material={MAT.frame}
      />
      <group position={[0.29, MIRROR_Y, side * 0.27]} rotation={[0, side * 0.2, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} scale={[1.2, 1, 0.82]} material={MAT.frame} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.018, 32]} />
        </mesh>
        <mesh position={[-0.0095, 0, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[0.82, 1.2, 1]} material={MAT.mirror}>
          <circleGeometry args={[0.044, 32]} />
        </mesh>
      </group>
    </group>
  );
}
export const MirrorLeft = () => <Mirror side={-1} />;
export const MirrorRight = () => <Mirror side={1} />;

/* ---------------- foot controls ---------------- */

/** Mid-mounted pegs (traced ≈ X −0.08 m, Y 0.25 m). */
const PEG = { x: -0.075, y: 0.25 };
function Footpeg({ side }: { side: 1 | -1 }) {
  return (
    <group>
      <RoundedBox args={[0.06, 0.06, 0.03]} radius={0.01} position={[PEG.x, PEG.y + 0.015, side * 0.165]} material={MAT.frame} />
      <Rod from={[PEG.x, PEG.y, side * 0.175]} to={[PEG.x, PEG.y, side * 0.29]} radius={0.018} material={MAT.rubber} />
    </group>
  );
}
export const FootpegLeft = () => <Footpeg side={-1} />;
export const FootpegRight = () => <Footpeg side={1} />;

export function ShiftLever() {
  return (
    <group>
      <Rod from={[PEG.x - 0.03, PEG.y + 0.04, -0.185]} to={[PEG.x + 0.14, PEG.y + 0.045, -0.215]} radius={0.008} material={MAT.alloy} />
      <Rod from={[PEG.x + 0.14, PEG.y + 0.045, -0.215]} to={[PEG.x + 0.14, PEG.y + 0.045, -0.27]} radius={0.01} material={MAT.rubber} />
    </group>
  );
}

export function RearBrakePedal() {
  return (
    <group>
      <Rod from={[PEG.x - 0.03, PEG.y + 0.02, 0.185]} to={[PEG.x + 0.15, PEG.y + 0.012, 0.21]} radius={0.008} material={MAT.alloy} />
      <RoundedBox args={[0.035, 0.012, 0.06]} radius={0.004} position={[PEG.x + 0.155, PEG.y + 0.015, 0.235]} material={MAT.alloy} />
    </group>
  );
}

export function RearMasterCylinder() {
  return (
    <group>
      <Rod from={[-0.12, 0.31, 0.165]} to={[-0.12, 0.39, 0.165]} radius={0.014} material={MAT.alloy} />
      <Rod from={[-0.12, 0.31, 0.165]} to={[PEG.x - 0.03, PEG.y + 0.02, 0.18]} radius={0.004} material={MAT.steel} />
    </group>
  );
}

/* ---------------- lighting & instruments ---------------- */

/** Headlight traced at ≈ (0.47, 0.90) m, r ≈ 0.09 m, sitting between the fork legs. */
export const HEADLIGHT = { x: 0.405, y: 0.9, depth: 0.115, radius: 0.092 };

export function Headlight() {
  const tubeAt = forkPoint((HEADLIGHT.y - FRONT_AXLE.y) / Math.cos(RAKE));
  const front = HEADLIGHT.x + HEADLIGHT.depth;
  return (
    <group>
      <LatheX
        position={[HEADLIGHT.x, HEADLIGHT.y, 0]}
        profile={[
          [0, 0.0],
          [0.012, 0.05],
          [0.045, 0.08],
          [0.09, 0.091],
          [HEADLIGHT.depth, HEADLIGHT.radius],
        ]}
        material={MAT.paint}
      />
      <mesh position={[front - 0.002, HEADLIGHT.y, 0]} rotation={[0, Math.PI / 2, 0]} material={MAT.chrome}>
        <torusGeometry args={[HEADLIGHT.radius - 0.004, 0.005, 10, 48]} />
      </mesh>
      <HeadlightFace front={front} />
      {[-1, 1].map((s) => (
        <Rod key={s} from={[tubeAt.x, HEADLIGHT.y, s * (FORK_HALF_SPACING - 0.012)]} to={[HEADLIGHT.x + 0.05, HEADLIGHT.y, s * 0.088]} radius={0.008} material={MAT.frame} />
      ))}
    </group>
  );
}

/**
 * LED face: dark reflector with four projector modules in a 2×2 grid, as seen in Honda's 2026
 * photos, behind a thin clear outer lens. Module size/spacing are estimated from the photos.
 */
function HeadlightFace({ front }: { front: number }) {
  const r = HEADLIGHT.radius - 0.008;
  const pitch = 0.03; // half-spacing between module centers
  return (
    <group position={[front, HEADLIGHT.y, 0]} rotation={[0, Math.PI / 2, 0]}>
      {/* dark reflector, slightly recessed */}
      <mesh position={[0, 0, -0.012]} material={MAT.engineDark}>
        <circleGeometry args={[r, 48]} />
      </mesh>
      {/* inner chrome ring */}
      <mesh position={[0, 0, -0.011]} material={MAT.chrome}>
        <ringGeometry args={[r - 0.008, r - 0.004, 48]} />
      </mesh>
      {[-1, 1].flatMap((ry) =>
        [-1, 1].map((rz) => (
          <group key={`${ry}${rz}`} position={[rz * pitch, ry * pitch, -0.008]}>
            <RoundedBox args={[0.046, 0.046, 0.008]} radius={0.01} smoothness={3} material={MAT.frame} />
            <mesh position={[0, 0, 0.0042]} material={MAT.led}>
              <circleGeometry args={[0.016, 28]} />
            </mesh>
            <mesh position={[0, 0, 0.0043]} material={MAT.chrome}>
              <ringGeometry args={[0.016, 0.019, 28]} />
            </mesh>
          </group>
        )),
      )}
      {/* clear outer lens */}
      <mesh material={MAT.glass}>
        <circleGeometry args={[r, 48]} />
      </mesh>
    </group>
  );
}

export function Meter() {
  const top = steerPoint(STEER_TOP_S + 0.03);
  return (
    <group position={[top.x - 0.01, top.y + 0.02, 0]} rotation={[0, 0, RAKE + 0.35]}>
      <mesh material={MAT.frame} castShadow>
        <cylinderGeometry args={[0.046, 0.042, 0.035, 32]} />
      </mesh>
      <mesh position={[0, 0.0185, 0]} material={MAT.lcd}>
        <cylinderGeometry args={[0.038, 0.038, 0.002, 32]} />
      </mesh>
    </group>
  );
}

/** Black bullet housing with an amber lens at the `lensSign` end (+1 front, −1 rear). */
function SignalPod({ from, to, lensSign }: { from: [number, number, number]; to: [number, number, number]; lensSign: 1 | -1 }) {
  return (
    <group>
      <Rod from={from} to={to} radius={0.006} material={MAT.frame} />
      <mesh position={to} rotation={[0, 0, Math.PI / 2]} material={MAT.frame} castShadow>
        <cylinderGeometry args={[0.017, 0.017, 0.045, 20]} />
      </mesh>
      <mesh position={[to[0] + lensSign * 0.024, to[1], to[2]]} rotation={[0, 0, Math.PI / 2]} material={MAT.lensAmber}>
        <cylinderGeometry args={[0.015, 0.015, 0.006, 20]} />
      </mesh>
    </group>
  );
}

/** Front signals beside the headlight top (traced ≈ X 0.33–0.40, Y 0.95 m). */
export function FrontTurnSignals() {
  return (
    <group>
      {[-1, 1].map((s) => (
        <SignalPod key={s} from={[0.39, 0.95, s * 0.09]} to={[0.37, 0.95, s * 0.15]} lensSign={1} />
      ))}
    </group>
  );
}

/** Rear signals on the license bracket (traced ≈ X −1.06, Y 0.48 m). */
export function RearTurnSignals() {
  return (
    <group>
      {[-1, 1].map((s) => (
        <SignalPod key={s} from={[-1.06, 0.49, s * 0.02]} to={[-1.06, 0.485, s * 0.11]} lensSign={-1} />
      ))}
    </group>
  );
}

/** Taillight pod projecting from the fender tip (traced ≈ X −1.01…−1.10, Y 0.60–0.65 m). */
export function Taillight() {
  const tip = rearFenderPoint(RF.to, RF.r - 0.01);
  return (
    <group>
      <RoundedBox args={[0.09, 0.045, 0.08]} radius={0.015} position={[tip.x - 0.035, tip.y + 0.025, 0]} rotation={[0, 0, -0.12]} material={MAT.paint} castShadow />
      <mesh position={[tip.x - 0.081, tip.y + 0.03, 0]} rotation={[0, -Math.PI / 2, 0]} material={MAT.lensRed}>
        <planeGeometry args={[0.06, 0.03]} />
      </mesh>
    </group>
  );
}
