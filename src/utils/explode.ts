import type { Vec3 } from '../types/configuration';

const len = (v: Vec3) => Math.hypot(v[0], v[1], v[2]);
const norm = (v: Vec3): Vec3 => {
  const l = len(v);
  return l < 1e-9 ? [0, 0, 0] : [v[0] / l, v[1] / l, v[2] / l];
};

/** Whole-bike exploded offset: authored vector scaled by the explode amount (0..1). */
export function globalOffset(vector: Vec3, amount: number): Vec3 {
  const t = Math.min(1, Math.max(0, amount));
  return [vector[0] * t, vector[1] * t, vector[2] * t];
}

/**
 * Local (assembly-scoped) exploded offset: parts move radially away from the assembly centroid,
 * blended with their authored direction so the result stays CAD-like rather than random.
 */
export function localOffset(params: {
  restCenter: Vec3;
  scopeCenter: Vec3;
  scopeRadius: number;
  authored: Vec3;
  amount: number;
}): Vec3 {
  const { restCenter, scopeCenter, scopeRadius, authored, amount } = params;
  const t = Math.min(1, Math.max(0, amount));
  const radial: Vec3 = [restCenter[0] - scopeCenter[0], restCenter[1] - scopeCenter[1], restCenter[2] - scopeCenter[2]];
  const r = norm(radial);
  const a = norm(authored);
  let dir: Vec3 = len(radial) < 1e-3 ? (len(a) > 0 ? a : [0, 1, 0]) : norm([r[0] * 0.7 + a[0] * 0.3, r[1] * 0.7 + a[1] * 0.3, r[2] * 0.7 + a[2] * 0.3]);
  if (len(dir) === 0) dir = [0, 1, 0];
  const magnitude = (0.12 + scopeRadius * 0.9) * t;
  return [dir[0] * magnitude, dir[1] * magnitude, dir[2] * magnitude];
}

/** Frame-rate independent exponential damping factor. */
export function dampFactor(lambda: number, dt: number) {
  return 1 - Math.exp(-lambda * dt);
}
