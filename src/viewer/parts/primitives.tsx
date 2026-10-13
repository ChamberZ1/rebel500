import { useMemo } from 'react';
import * as THREE from 'three';
import type { Vec3 } from '../../types/configuration';

type V = Vec3 | THREE.Vector3;
const toV = (v: V) => (v instanceof THREE.Vector3 ? v.clone() : new THREE.Vector3(...v));

/** Smooth tube through a list of points (Catmull-Rom). */
export function Tube({
  points,
  radius,
  material,
  closed = false,
  tubular = 48,
  radial = 10,
  tension = 0.5,
}: {
  points: V[];
  radius: number;
  material: THREE.Material;
  closed?: boolean;
  tubular?: number;
  radial?: number;
  tension?: number;
}) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map(toV), closed, 'catmullrom', tension);
    return new THREE.TubeGeometry(curve, tubular, radius, radial, closed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(points.map((p) => toV(p).toArray())), radius, closed, tubular, radial, tension]);
  return <mesh geometry={geometry} material={material} castShadow receiveShadow />;
}

/** Cylinder spanning two points. */
export function Rod({
  from,
  to,
  radius,
  radiusTop,
  material,
  radial = 16,
}: {
  from: V;
  to: V;
  radius: number;
  radiusTop?: number;
  material: THREE.Material;
  radial?: number;
}) {
  const { position, quaternion, length } = useMemo(() => {
    const a = toV(from);
    const b = toV(to);
    const dir = b.clone().sub(a);
    const len = dir.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return { position: a.add(b).multiplyScalar(0.5), quaternion: q, length: len };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toV(from).toArray().join(), toV(to).toArray().join()]);
  return (
    <mesh position={position} quaternion={quaternion} material={material} castShadow receiveShadow>
      <cylinderGeometry args={[radiusTop ?? radius, radius, length, radial]} />
    </mesh>
  );
}

/** Flat disc/cylinder whose axis points along Z (wheel-style), centered at `position`. */
export function DiscZ({
  position,
  radius,
  thickness,
  material,
  segments = 48,
  inner,
}: {
  position: V;
  radius: number;
  thickness: number;
  material: THREE.Material;
  segments?: number;
  inner?: number;
}) {
  const geometry = useMemo(() => {
    if (inner === undefined) {
      const g = new THREE.CylinderGeometry(radius, radius, thickness, segments);
      g.rotateX(Math.PI / 2);
      return g;
    }
    const shape = new THREE.Shape().absarc(0, 0, radius, 0, Math.PI * 2, false);
    shape.holes.push(new THREE.Path().absarc(0, 0, inner, 0, Math.PI * 2, true));
    const g = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false, curveSegments: segments });
    g.translate(0, 0, -thickness / 2);
    return g;
  }, [radius, thickness, segments, inner]);
  return <mesh position={toV(position)} geometry={geometry} material={material} castShadow receiveShadow />;
}

/** Torus in the XY plane (axis along Z), optionally non-uniformly scaled for tire profiles. */
export function TorusZ({
  position,
  radius,
  tube,
  material,
  scaleZ = 1,
  arc = Math.PI * 2,
  rotationZ = 0,
}: {
  position: V;
  radius: number;
  tube: number;
  material: THREE.Material;
  scaleZ?: number;
  arc?: number;
  rotationZ?: number;
}) {
  return (
    <mesh position={toV(position)} scale={[1, 1, scaleZ]} rotation={[0, 0, rotationZ]} material={material} castShadow receiveShadow>
      <torusGeometry args={[radius, tube, 20, 72, arc]} />
    </mesh>
  );
}

/** Lathe body revolved around the X axis (used for tank/muffler/headlight shells). */
export function LatheX({
  profile,
  material,
  position = [0, 0, 0],
  scale = [1, 1, 1],
  rotation = [0, 0, 0],
  segments = 40,
}: {
  profile: Array<[number, number]>; // [x, radius]
  material: THREE.Material;
  position?: V;
  scale?: Vec3;
  rotation?: Vec3;
  segments?: number;
}) {
  const geometry = useMemo(() => {
    const pts = profile.map(([x, r]) => new THREE.Vector2(Math.max(r, 0.0001), x));
    const g = new THREE.LatheGeometry(pts, segments);
    g.rotateZ(-Math.PI / 2); // lathe axis Y → X
    g.computeVertexNormals();
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(profile), segments]);
  return (
    <mesh position={toV(position)} scale={scale} rotation={rotation} geometry={geometry} material={material} castShadow receiveShadow />
  );
}

/** Extruded 2D outline in the XY plane, centered on `z` with given depth. */
export function ExtrudeXY({
  outline,
  depth,
  z = 0,
  material,
  bevel = 0.004,
}: {
  outline: Array<[number, number]>;
  depth: number;
  z?: number;
  material: THREE.Material;
  bevel?: number;
}) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, y)));
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: Math.max(depth - bevel * 2, 0.001),
      bevelEnabled: bevel > 0,
      bevelSize: bevel,
      bevelThickness: bevel,
      bevelSegments: 2,
      curveSegments: 12,
    });
    g.translate(0, 0, -depth / 2 + bevel);
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(outline), depth, bevel]);
  return <mesh position={[0, 0, z]} geometry={geometry} material={material} castShadow receiveShadow />;
}

/** One cross-section of a lofted body: top/bottom heights and half-width at a given X. */
export interface LoftSection {
  x: number;
  yTop: number;
  yBot: number;
  half: number;
}

const catmull = (p0: number, p1: number, p2: number, p3: number, t: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);

/**
 * Smooth closed body lofted along X through rounded-rectangle (superellipse) cross-sections.
 * Used for organic shapes such as the fuel tank and seat. `roundness` 2 = ellipse, higher = boxier.
 */
export function loftGeometry(control: LoftSection[], { perSegment = 10, radial = 36, roundness = 2.4 } = {}) {
  const ctrl = [...control].sort((a, b) => a.x - b.x);
  const keys: Array<keyof LoftSection> = ['x', 'yTop', 'yBot', 'half'];
  const secs: LoftSection[] = [];
  for (let i = 0; i < ctrl.length - 1; i++) {
    const p0 = ctrl[Math.max(0, i - 1)];
    const p1 = ctrl[i];
    const p2 = ctrl[i + 1];
    const p3 = ctrl[Math.min(ctrl.length - 1, i + 2)];
    const last = i === ctrl.length - 2;
    for (let s = 0; s < perSegment + (last ? 1 : 0); s++) {
      const t = s / perSegment;
      const sec = {} as LoftSection;
      for (const k of keys) sec[k] = catmull(p0[k], p1[k], p2[k], p3[k], t);
      sec.half = Math.max(sec.half, 0.001);
      secs.push(sec);
    }
  }
  const e = 2 / roundness;
  const pos: number[] = [];
  for (const s of secs) {
    const yc = (s.yTop + s.yBot) / 2;
    const h = Math.max((s.yTop - s.yBot) / 2, 0.001);
    for (let k = 0; k < radial; k++) {
      const th = (k / radial) * Math.PI * 2;
      const c = Math.cos(th);
      const sn = Math.sin(th);
      pos.push(s.x, yc + h * Math.sign(sn) * Math.abs(sn) ** e, s.half * Math.sign(c) * Math.abs(c) ** e);
    }
  }
  const idx: number[] = [];
  for (let j = 0; j < secs.length - 1; j++) {
    for (let k = 0; k < radial; k++) {
      const a = j * radial + k;
      const b = (j + 1) * radial + k;
      const c = (j + 1) * radial + ((k + 1) % radial);
      const d = j * radial + ((k + 1) % radial);
      idx.push(a, b, c, a, c, d);
    }
  }
  // end caps
  const cap = (j: number, flip: boolean) => {
    const s = secs[j];
    const center = pos.length / 3;
    pos.push(s.x, (s.yTop + s.yBot) / 2, 0);
    for (let k = 0; k < radial; k++) {
      const p = j * radial + k;
      const q = j * radial + ((k + 1) % radial);
      if (flip) idx.push(center, q, p);
      else idx.push(center, p, q);
    }
  };
  cap(0, false);
  cap(secs.length - 1, true);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Interpolated top height of a loft at X (for placing details such as the fuel cap). */
export function loftTopAt(control: LoftSection[], x: number) {
  const c = [...control].sort((a, b) => a.x - b.x);
  for (let i = 0; i < c.length - 1; i++) {
    if (x >= c[i].x && x <= c[i + 1].x) {
      const t = (x - c[i].x) / (c[i + 1].x - c[i].x);
      return c[i].yTop + (c[i + 1].yTop - c[i].yTop) * t;
    }
  }
  return c[c.length - 1].yTop;
}
