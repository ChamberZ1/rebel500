import { Environment, Grid, Html, Lightformer, useProgress } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useViewer } from '../state/store';
import { BikeModel } from './BikeModel';
import { CameraRig, INITIAL_CAMERA } from './CameraRig';

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="viewer-loading">Loading geometry… {progress.toFixed(0)}%</div>
    </Html>
  );
}

/** Global section-cut plane (cuts away everything on the +Z / right side of the plane). */
function SectionPlane() {
  const { gl, invalidate } = useThree();
  const section = useViewer((s) => s.section);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, -1), 0), []);
  useEffect(() => {
    plane.constant = section.offset;
    gl.clippingPlanes = section.enabled ? [plane] : [];
    invalidate();
  }, [gl, plane, section, invalidate]);
  return null;
}

/** Advances the educational flow highlight one step at a time. */
/**
 * The canvas renders on demand (no continuous redraw when idle). Any store change — selection,
 * hover, explode, modes — requests a frame; animating parts and the camera keep requesting
 * frames until they settle.
 */
function InvalidateOnStoreChange() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => useViewer.subscribe(() => invalidate()), [invalidate]);
  return null;
}

function FlowTicker() {
  const active = useViewer((s) => !!s.flow);
  const stepFlow = useViewer((s) => s.stepFlow);
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(stepFlow, 900);
    return () => window.clearInterval(id);
  }, [active, stepFlow]);
  return null;
}

export default function Viewer() {
  const select = useViewer((s) => s.select);
  return (
    <Canvas
      shadows={{ type: THREE.PCFShadowMap }}
      frameloop="demand"
      dpr={[1, 1.75]}
      camera={{ position: INITIAL_CAMERA.toArray(), fov: 35, near: 0.02, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onPointerMissed={(e) => {
        if (e.type === 'click') select(null);
      }}
    >
      {/* Studio-style lighting: black paint reads through its reflections, so the environment
          uses large soft boxes plus a cool rim light to separate dark parts from the background. */}
      <hemisphereLight args={['#dfe7f2', '#202329', 0.7]} />
      <directionalLight
        position={[2.5, 4.5, -2]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-3, 2, 3]} intensity={0.8} />
      <directionalLight position={[-2.5, 1.8, -3.5]} intensity={1.1} color="#b9d4ff" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3.5} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[7, 3, 1]} />
        <Lightformer form="rect" intensity={2.5} position={[4, 1.6, -3]} rotation-y={-Math.PI / 4} scale={[4, 1.4, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[-4, 1.4, 3]} rotation-y={(3 * Math.PI) / 4} scale={[4, 1.4, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#a9c8ff" position={[0, 1.2, -5]} scale={[9, 1.2, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[5, 0.6, 2]} rotation-y={-Math.PI / 2} scale={[3, 0.6, 1]} />
        <Lightformer form="ring" intensity={2} position={[-3, 3, -2]} scale={1.2} />
      </Environment>
      <Suspense fallback={<Loader />}>
        <BikeModel />
      </Suspense>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.001} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <shadowMaterial transparent opacity={0.32} />
      </mesh>
      <Grid
        position={[0, 0, 0]}
        args={[14, 14]}
        cellSize={0.1}
        cellThickness={0.5}
        cellColor="#253040"
        sectionSize={0.5}
        sectionThickness={0.9}
        sectionColor="#33445a"
        fadeDistance={9}
        fadeStrength={1.5}
        infiniteGrid
      />
      <CameraRig />
      <SectionPlane />
      <FlowTicker />
      <InvalidateOnStoreChange />
    </Canvas>
  );
}
