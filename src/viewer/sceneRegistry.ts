/**
 * Non-reactive registry of mounted part objects and their rest (assembled) bounds.
 * Lives outside React state so per-frame lookups don't trigger renders.
 */
import * as THREE from 'three';
import { PARTS } from '../data/motorcycle';

export const partObjects = new Map<string, THREE.Object3D>();
export const restBoxes = new Map<string, THREE.Box3>();

let boundsVersion = 0;
const scopeCache = new Map<string, { version: number; center: THREE.Vector3; radius: number; geo: Set<string> }>();

export function registerPart(geoId: string, obj: THREE.Object3D) {
  partObjects.set(geoId, obj);
}

export function unregisterPart(geoId: string) {
  partObjects.delete(geoId);
  restBoxes.delete(geoId);
  boundsVersion++;
}

/** Measure a part's assembled bounds (removes its current explode offset). */
export function measureRest(geoId: string, obj: THREE.Object3D) {
  obj.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(obj);
  if (box.isEmpty()) return;
  box.translate(obj.position.clone().negate());
  restBoxes.set(geoId, box);
  boundsVersion++;
}

/** Centroid / radius of an assembly's geometry at rest, cached until bounds change. */
export function scopeInfo(nodeId: string) {
  const cached = scopeCache.get(nodeId);
  if (cached && cached.version === boundsVersion) return cached;
  const geo = new Set(PARTS.subtreeGeometry.get(nodeId) ?? []);
  const box = new THREE.Box3();
  for (const g of geo) {
    const b = restBoxes.get(g);
    if (b) box.union(b);
  }
  const center = box.isEmpty() ? new THREE.Vector3() : box.getCenter(new THREE.Vector3());
  const radius = box.isEmpty() ? 0.3 : box.getSize(new THREE.Vector3()).length() / 2;
  const info = { version: boundsVersion, center, radius, geo };
  scopeCache.set(nodeId, info);
  return info;
}

/** Current world-space bounds of a node's visible geometry (includes explode offsets). */
export function currentBounds(nodeId: string): THREE.Box3 | null {
  const box = new THREE.Box3();
  for (const g of PARTS.subtreeGeometry.get(nodeId) ?? []) {
    const obj = partObjects.get(g);
    if (obj && obj.visible) box.union(new THREE.Box3().setFromObject(obj));
  }
  return box.isEmpty() ? null : box;
}
