import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { nearestGeometricAncestor } from '../data/motorcycle';
import { useViewer, type ViewName } from '../state/store';
import { BIKE_CENTER } from './layout';
import { currentBounds } from './sceneRegistry';

const VIEW_OFFSETS: Record<ViewName, THREE.Vector3> = {
  iso: new THREE.Vector3(2.15, 1.05, -2.75),
  front: new THREE.Vector3(3.6, 0.35, 0),
  rear: new THREE.Vector3(-3.6, 0.35, 0),
  left: new THREE.Vector3(0, 0.25, -3.7),
  right: new THREE.Vector3(0, 0.25, 3.7),
  top: new THREE.Vector3(0.01, 4.2, 0),
};

export const INITIAL_CAMERA = BIKE_CENTER.clone().add(VIEW_OFFSETS.iso);

/** Keeps the orbit target inside a box around the bike so users can't pan it out of reach. */
const TARGET_LIMITS = new THREE.Box3(new THREE.Vector3(-1.8, -0.1, -1.4), new THREE.Vector3(1.8, 1.6, 1.4));

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, size, invalidate } = useThree();
  const aspect = size.width / Math.max(1, size.height);
  // Pull back on narrow (portrait/tablet) viewports so the whole bike stays in frame.
  const viewScale = aspect < 1.45 ? Math.min(1.9, 1.45 / aspect) : 1;
  const request = useViewer((s) => s.cameraRequest);
  const anim = useRef<{
    fromPos: THREE.Vector3;
    toPos: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toTarget: THREE.Vector3;
    t: number;
  } | null>(null);

  useEffect(() => {
    if (!request || !controls.current) return;
    const c = controls.current;
    let toTarget: THREE.Vector3;
    let toPos: THREE.Vector3;
    if (request.kind === 'view') {
      toTarget = BIKE_CENTER.clone();
      const explodeScale = 1 + 0.5 * useViewer.getState().explode; // fit the spread-out parts
      toPos = BIKE_CENTER.clone().addScaledVector(VIEW_OFFSETS[request.view], viewScale * explodeScale);
    } else {
      const geoNode = nearestGeometricAncestor(request.nodeId);
      const box = geoNode ? currentBounds(geoNode) : null;
      if (!box) return;
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      const fov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov ?? 35);
      const dist = THREE.MathUtils.clamp((Math.max(sphere.radius, 0.1) / Math.sin(fov / 2)) * 2 * Math.max(1, viewScale * 0.8), 0.8, 6);
      const dir = camera.position.clone().sub(c.target).normalize();
      toTarget = sphere.center.clone();
      toPos = sphere.center.clone().addScaledVector(dir, dist);
    }
    anim.current = { fromPos: camera.position.clone(), toPos, fromTarget: c.target.clone(), toTarget, t: 0 };
    invalidate();
    // viewScale is read at request time only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, camera]);

  // Initial framing (accounts for viewport aspect).
  useEffect(() => {
    useViewer.getState().requestView('iso');
  }, []);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const cancel = () => (anim.current = null);
    const clamp = () => {
      if (!TARGET_LIMITS.containsPoint(c.target)) TARGET_LIMITS.clampPoint(c.target, c.target);
    };
    c.addEventListener('start', cancel);
    c.addEventListener('change', clamp);
    return () => {
      c.removeEventListener('start', cancel);
      c.removeEventListener('change', clamp);
    };
  }, []);

  useFrame((_, dt) => {
    const a = anim.current;
    const c = controls.current;
    if (!a || !c) return;
    a.t = Math.min(1, a.t + Math.min(dt, 0.05) / 0.75);
    const k = ease(a.t);
    camera.position.lerpVectors(a.fromPos, a.toPos, k);
    c.target.lerpVectors(a.fromTarget, a.toTarget, k);
    c.update();
    if (a.t >= 1) anim.current = null;
    else invalidate();
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      target={BIKE_CENTER.toArray()}
      enableDamping
      dampingFactor={0.09}
      minDistance={0.35}
      maxDistance={8}
      maxPolarAngle={Math.PI * 0.62}
      zoomSpeed={0.9}
      panSpeed={0.8}
    />
  );
}
