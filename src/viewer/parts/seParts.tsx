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

const seatBrown = new THREE.MeshStandardMaterial({ color: '#5b3a24', metalness: 0.05, roughness: 0.62 });

export const SeatSE = () => <TeardropSeat material={seatBrown} />;


/** Color-matched cowl: a rounded hood wrapping the top and sides of the headlight, taller on top. */
export function HeadlightCowl() {
  const shell = useMemo(() => {
    const x0 = HEADLIGHT.x;
    const profile: Array<[number, number]> = [
      [x0 - 0.01, 0.06],
      [x0 + 0.015, 0.094],
      [x0 + 0.065, 0.11],
      [x0 + 0.115, 0.114],
      [x0 + 0.145, 0.108],
    ];
    // Lathe around Y, angle φ: after rotateZ(−π/2) the top (+Y) is at φ = 3π/2. Sweep 240° centered there.
    const sweep = THREE.MathUtils.degToRad(240);
    const g = new THREE.LatheGeometry(
      profile.map(([x, r]) => new THREE.Vector2(r, x)),
      48,
      (3 * Math.PI) / 2 - sweep / 2,
      sweep,
    );
    g.rotateZ(-Math.PI / 2);
    g.computeVertexNormals();
    const m = MAT.paint.clone();
    m.side = THREE.DoubleSide;
    return { g, m };
  }, []);
  // Taller above the lens than at the sides (a small hood/visor), shifted up so the lens stays clear.
  return <mesh geometry={shell.g} material={shell.m} position={[0, HEADLIGHT.y + 0.02, 0]} scale={[1, 1.32, 1.0]} castShadow />;
}

/** Corrugated rubber gaiters over the fork tubes, from slider top to just below the bottom clamp. */
export function ForkBoots() {
  const { geometry, quat } = useMemo(() => {
    const len = 0.17;
    const ribs = 9;
    const pts: THREE.Vector2[] = [new THREE.Vector2(0.0001, 0)];
    for (let i = 0; i <= ribs * 2; i++) {
      const y = (i / (ribs * 2)) * len;
      const r = i % 2 === 0 ? 0.029 : 0.0345;
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
        const base = forkPoint(0.315);
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
