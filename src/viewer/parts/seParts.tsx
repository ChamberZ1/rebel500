/**
 * Representative geometry for 2026 Rebel 500 SE (CMX500A2) factory equipment:
 * headlight cowl, fork boots, brown diamond-stitch seat and (per the owner) the passenger seat.
 * Shapes are stand-ins, NOT Honda CAD.
 */
import { useMemo } from 'react';
import * as THREE from 'three';
import { MAT } from '../materials';
import { FORK_HALF_SPACING, STEER_DIR, forkPoint } from '../layout';
import { HEADLIGHT, TeardropSeat } from './bodyParts';
import { Tube } from './primitives';

const seatBrown = new THREE.MeshStandardMaterial({ color: '#5b3a24', metalness: 0.05, roughness: 0.62 });

export const SeatSE = () => <TeardropSeat material={seatBrown} />;


/**
 * SE headlight cowl, after Honda's 2026 SE photos: a rounded, helmet-like shell wrapping the top
 * and sides of the headlight. Its front edge hugs the lens, the crown rises above the light, and
 * a small smoked screen is set into the top front. The bottom is open. Proportions are estimated.
 *
 * The surface is swept around the headlight axis (+X). θ is measured from straight up (0) toward
 * the sides (±); the cowl covers |θ| ≤ 128°.
 */
const COWL = {
  xBack: -0.035,
  xFront: 0.13,
  thetaMax: THREE.MathUtils.degToRad(128),
  screenTheta: THREE.MathUtils.degToRad(34),
  screenFrom: 0.015,
};

/** Cross-section radius along the axis (relative x from the headlight shell origin). */
function cowlProfile(u: number) {
  // u ∈ [0,1] from back to front: full at the middle, slightly tucked at the front lip
  return 0.097 + 0.016 * Math.sin(Math.PI * Math.min(1, u * 1.15)) - 0.006 * Math.max(0, u - 0.85) / 0.15;
}

/** Upward stretch: the crown rises above the light, the sides stay close to it. */
const crown = (theta: number) => 1 + 0.3 * Math.max(0, Math.cos(theta)) ** 1.6;

/**
 * Rear edge of the cowl: deep at the crown (reaching back over the top clamp), cut forward at the
 * sides so it clears the fork tubes, which sit just behind and beside the headlight.
 */
function cowlBack(theta: number) {
  const t = Math.min(1, Math.abs(theta) / COWL.thetaMax);
  const smooth = t * t * (3 - 2 * t);
  return COWL.xBack + (0.095 - COWL.xBack) * smooth;
}

/** Sweep a patch of the cowl. `x0` may depend on θ (pass `cowlBack` for the rear edge). */
function cowlSurface(x0: number | ((th: number) => number), x1: number, th0: number, th1: number, nx = 18, nt = 32) {
  const pos: number[] = [];
  const idx: number[] = [];
  const span = COWL.xFront - COWL.xBack;
  for (let i = 0; i <= nx; i++) {
    for (let j = 0; j <= nt; j++) {
      const th = th0 + ((th1 - th0) * j) / nt;
      const start = typeof x0 === 'function' ? x0(th) : x0;
      const x = start + ((x1 - start) * i) / nx;
      const u = (x - COWL.xBack) / span;
      const r = cowlProfile(u) * crown(th);
      pos.push(HEADLIGHT.x + x, HEADLIGHT.y + 0.008 + r * Math.cos(th), r * Math.sin(th));
    }
  }
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < nt; j++) {
      const a = i * (nt + 1) + j;
      const b = a + nt + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export function HeadlightCowl() {
  const parts = useMemo(() => {
    const { xFront, thetaMax, screenTheta, screenFrom } = COWL;
    const paint = MAT.paint.clone();
    paint.side = THREE.DoubleSide;
    const smoked = MAT.smoked.clone();
    smoked.side = THREE.DoubleSide;
    return {
      paint,
      smoked,
      rear: cowlSurface(cowlBack, screenFrom, -screenTheta, screenTheta, 10, 10),
      left: cowlSurface(cowlBack, xFront, -thetaMax, -screenTheta, 24, 20),
      right: cowlSurface(cowlBack, xFront, screenTheta, thetaMax, 24, 20),
      screen: cowlSurface(screenFrom, xFront + 0.012, -screenTheta, screenTheta, 18, 10),
    };
  }, []);
  // rolled front lip following the (crown-stretched) front edge around the lens opening
  const lip = useMemo(() => {
    const pts: [number, number, number][] = [];
    const n = 40;
    const lim = COWL.thetaMax - 0.04;
    for (let i = 0; i <= n; i++) {
      const th = -lim + (2 * lim * i) / n;
      const r = cowlProfile(1) * crown(th) - 0.001;
      pts.push([HEADLIGHT.x + COWL.xFront, HEADLIGHT.y + 0.008 + r * Math.cos(th), r * Math.sin(th)]);
    }
    return pts;
  }, []);
  return (
    <group>
      <mesh geometry={parts.rear} material={parts.paint} castShadow />
      <mesh geometry={parts.left} material={parts.paint} castShadow />
      <mesh geometry={parts.right} material={parts.paint} castShadow />
      <mesh geometry={parts.screen} material={parts.smoked} castShadow />
      <Tube points={lip} radius={0.004} material={parts.paint} tubular={80} radial={6} />
    </group>
  );
}

/** Corrugated rubber gaiters over the fork tubes, from slider top to just below the bottom clamp. */
export function ForkBoots() {
  const { geometry, quat } = useMemo(() => {
    const len = 0.19;
    const ribs = 11;
    const pts: THREE.Vector2[] = [new THREE.Vector2(0.0001, 0)];
    for (let i = 0; i <= ribs * 2; i++) {
      const y = (i / (ribs * 2)) * len;
      const r = i % 2 === 0 ? 0.031 : 0.0385;
      pts.push(new THREE.Vector2(r, y));
    }
    pts.push(new THREE.Vector2(0.0001, len));
    const g = new THREE.LatheGeometry(pts, 28);
    g.computeVertexNormals();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), STEER_DIR);
    return { geometry: g, quat: q };
  }, []);
  return (
    <group>
      {[-1, 1].map((s) => {
        const base = forkPoint(0.305);
        return (
          <mesh
            key={s}
            geometry={geometry}
            position={[base.x, base.y, s * FORK_HALF_SPACING]}
            quaternion={quat}
            material={MAT.rubber}
            castShadow
          />
        );
      })}
    </group>
  );
}

/** Rounded pillion pad above the rear fender (diagram #8). Position representative. */
export function PassengerSeat() {
  const geometry = useMemo(() => {
    const w = 0.2;
    const d = 0.21;
    const r = 0.06;
    const shape = new THREE.Shape();
    const x0 = -w / 2;
    const y0 = -d / 2;
    shape.moveTo(x0 + r, y0);
    shape.lineTo(x0 + w - r, y0);
    shape.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
    shape.lineTo(x0 + w, y0 + d - r);
    shape.quadraticCurveTo(x0 + w, y0 + d, x0 + w - r, y0 + d);
    shape.lineTo(x0 + r, y0 + d);
    shape.quadraticCurveTo(x0, y0 + d, x0, y0 + d - r);
    shape.lineTo(x0, y0 + r);
    shape.quadraticCurveTo(x0, y0, x0 + r, y0);
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.018, bevelSegments: 4, curveSegments: 16 });
    g.rotateX(Math.PI / 2);
    return g;
  }, []);
  return (
    <group position={[-0.74, 0.775, 0]} rotation={[0, 0, -0.1]}>
      <mesh geometry={geometry} material={seatBrown} castShadow receiveShadow />
      <mesh position={[0, -0.05, 0]} material={MAT.plastic}>
        <boxGeometry args={[0.16, 0.012, 0.17]} />
      </mesh>
    </group>
  );
}
