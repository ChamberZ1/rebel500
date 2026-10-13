import { useGLTF } from '@react-three/drei';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Suspense, memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useShallow } from 'zustand/react/shallow';
import { PARTS, getPart, nearestGeometricAncestor } from '../data/motorcycle';
import { useViewer } from '../state/store';
import { dampFactor, globalOffset, localOffset } from '../utils/explode';
import { GEOMETRY, type GeometryEntry } from './geometryRegistry';
import { measureRest, registerPart, restBoxes, scopeInfo, unregisterPart } from './sceneRegistry';
import { SYSTEM_COLORS } from './systemColors';

/** geometry id → owner node id + all its ancestors (for subtree membership tests), per variant index. */
const lineageCache = new WeakMap<typeof PARTS, Map<string, Set<string>>>();
function lineageOf(geoId: string): Set<string> {
  let map = lineageCache.get(PARTS);
  if (!map) {
    map = new Map(
      [...PARTS.geometryOwner.entries()].map(([geo, owner]) => [geo, new Set([owner, ...(PARTS.ancestors.get(owner) ?? [])])]),
    );
    lineageCache.set(PARTS, map);
  }
  return map.get(geoId) ?? new Set();
}

const COLORS = {
  selected: new THREE.Color('#ffa630'),
  hovered: new THREE.Color('#4fa8ff'),
  flow: new THREE.Color('#2ee6a6'),
  context: new THREE.Color('#ffa630'),
};

interface Display {
  hidden: boolean;
  ghost: boolean;
  selected: boolean;
  context: boolean;
  hovered: boolean;
  flow: 0 | 1 | 2; // none / on path / active step
  systemColor: string | null;
  xrayBody: boolean;
}

function useDisplay(geoId: string, entry: GeometryEntry): Display {
  const lineage = lineageOf(geoId);
  const systemId = getPart(PARTS.geometryOwner.get(geoId))?.systemId;
  return useViewer(
    useShallow((s): Display => {
      const iso = s.isolation;
      const sel = s.selectedId;
      const selHasGeo = !!sel && (PARTS.subtreeGeometry.get(sel)?.length ?? 0) > 0;
      const ctxId = sel && !selHasGeo ? nearestGeometricAncestor(sel) : undefined;
      let flow: Display['flow'] = 0;
      if (s.flow) {
        const onPath = s.flow.path.some((id) => lineage.has(id));
        if (onPath) flow = lineage.has(s.flow.path[s.flow.step]) ? 2 : 1;
      }
      return {
        hidden: s.hiddenNodes.some((id) => lineage.has(id)) || (iso?.style === 'hide' && !lineage.has(iso.nodeId)),
        ghost: iso?.style === 'ghost' && !lineage.has(iso.nodeId),
        selected: !!sel && lineage.has(sel),
        context: !!ctxId && lineage.has(ctxId),
        hovered: !!s.hoveredId && lineage.has(s.hoveredId),
        flow,
        systemColor: s.colorMode === 'systems' && systemId ? SYSTEM_COLORS[systemId] ?? null : null,
        xrayBody: s.xray && entry.xray === 'body',
      };
    }),
  );
}

interface BaseMat {
  color?: THREE.Color;
  emissive?: THREE.Color;
  emissiveIntensity?: number;
  opacity: number;
  transparent: boolean;
}

const noRaycast = () => {};

/** Clone materials once per mesh, then drive highlight/opacity from display state. */
function applyDisplay(root: THREE.Object3D, d: Display) {
  root.visible = !d.hidden;
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    if (!mesh.userData.__base) {
      const mats = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map((m) => m.clone());
      mesh.material = Array.isArray(mesh.material) ? mats : mats[0];
      mesh.userData.__base = mats.map((m): BaseMat => {
        const sm = m as THREE.MeshStandardMaterial;
        return {
          color: sm.color?.clone(),
          emissive: sm.emissive?.clone(),
          emissiveIntensity: sm.emissiveIntensity,
          opacity: m.opacity,
          transparent: m.transparent,
        };
      });
      mesh.userData.__raycast = mesh.raycast;
    }
    const bases = mesh.userData.__base as BaseMat[];
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach((m, i) => {
      const sm = m as THREE.MeshStandardMaterial;
      const b = bases[i];
      if (sm.color && b.color) {
        sm.color.copy(b.color);
        if (d.systemColor) sm.color.lerp(new THREE.Color(d.systemColor), 0.85);
      }
      if (sm.emissive && b.emissive) {
        let c: THREE.Color | null = null;
        let k = 0;
        if (d.selected) [c, k] = [COLORS.selected, 0.34];
        else if (d.flow === 2) [c, k] = [COLORS.flow, 0.75];
        else if (d.hovered) [c, k] = [COLORS.hovered, 0.32];
        else if (d.flow === 1) [c, k] = [COLORS.flow, 0.18];
        else if (d.context) [c, k] = [COLORS.context, 0.12];
        if (c) {
          sm.emissive.copy(c);
          sm.emissiveIntensity = k;
        } else {
          sm.emissive.copy(b.emissive);
          sm.emissiveIntensity = b.emissiveIntensity ?? 1;
        }
      }
      const opacity = d.ghost ? 0.06 : d.xrayBody ? 0.13 : b.opacity;
      m.opacity = opacity;
      m.transparent = opacity < 1 || b.transparent;
      m.depthWrite = opacity >= 1;
      m.needsUpdate = true;
    });
    mesh.raycast = d.ghost || d.xrayBody || d.hidden ? noRaycast : (mesh.userData.__raycast as THREE.Mesh['raycast']);
    mesh.renderOrder = d.ghost || d.xrayBody ? 2 : 0;
  });
}

function GlbContent({ entry, onReady }: { entry: GeometryEntry; onReady: () => void }) {
  const glb = entry.glb!;
  const gltf = useGLTF(glb.url);
  const object = useMemo(() => {
    const src = glb.node ? gltf.scene.getObjectByName(glb.node) ?? gltf.scene : gltf.scene;
    const clone = src.clone(true);
    clone.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    return clone;
  }, [gltf, glb.node]);
  useEffect(onReady, [object, onReady]);
  const scale = typeof glb.scale === 'number' ? ([glb.scale, glb.scale, glb.scale] as [number, number, number]) : glb.scale;
  return <primitive object={object} position={glb.position} rotation={glb.rotation} scale={scale} />;
}

export const PartNode = memo(function PartNode({ geoId }: { geoId: string }) {
  const entry = GEOMETRY.get(geoId)!;
  const nodeId = PARTS.geometryOwner.get(geoId)!;
  const ref = useRef<THREE.Group>(null);
  const display = useDisplay(geoId, entry);
  const [contentVersion, setContentVersion] = useState(0);
  const onReady = useMemo(() => () => setContentVersion((v) => v + 1), []);
  const select = useViewer((s) => s.select);
  const hover = useViewer((s) => s.hover);
  const invalidate = useThree((s) => s.invalidate);

  useLayoutEffect(() => {
    const obj = ref.current!;
    registerPart(geoId, obj);
    measureRest(geoId, obj);
    return () => unregisterPart(geoId);
  }, [geoId]);

  useLayoutEffect(() => {
    if (contentVersion > 0) measureRest(geoId, ref.current!);
  }, [contentVersion, geoId]);

  useEffect(() => {
    applyDisplay(ref.current!, display);
    invalidate();
  }, [display, contentVersion, invalidate]);

  const target = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    const obj = ref.current;
    if (!obj) return;
    const s = useViewer.getState();
    target.set(...globalOffset(entry.explode, s.explode));
    if (s.local && s.local.amount > 0) {
      const info = scopeInfo(s.local.scopeId);
      const rest = restBoxes.get(geoId);
      if (info.geo.has(geoId) && rest) {
        const c = rest.getCenter(new THREE.Vector3());
        const off = localOffset({
          restCenter: c.toArray(),
          scopeCenter: info.center.toArray(),
          scopeRadius: info.radius,
          authored: entry.explode,
          amount: s.local.amount,
        });
        target.x += off[0];
        target.y += off[1];
        target.z += off[2];
      }
    }
    if (obj.position.distanceToSquared(target) > 1e-8) {
      obj.position.lerp(target, dampFactor(7, Math.min(dt, 0.1)));
      invalidate(); // keep rendering until the part settles
    }
  });

  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hover(nodeId);
    document.body.style.cursor = 'pointer';
  };
  const onOut = () => {
    if (useViewer.getState().hoveredId === nodeId) hover(null);
    document.body.style.cursor = '';
  };
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 4) return;
    const current = useViewer.getState().selectedId;
    // Clicking an already-selected part walks up to its parent assembly (CAD-style drill-up).
    if (current && current !== PARTS.rootId && lineageOf(geoId).has(current)) {
      const parent = getPart(current)?.parentId;
      select(parent && parent !== PARTS.rootId ? parent : nodeId);
    } else {
      select(nodeId);
    }
  };
  const onDouble = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    select(nodeId, { focus: true });
  };

  const Representative = entry.component;
  return (
    <group ref={ref} name={geoId} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick} onDoubleClick={onDouble}>
      {entry.glb ? (
        <Suspense fallback={<Representative />}>
          <GlbContent entry={entry} onReady={onReady} />
        </Suspense>
      ) : (
        <Representative />
      )}
    </group>
  );
});
