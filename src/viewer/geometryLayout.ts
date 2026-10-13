/**
 * Geometry layout data (no React): every renderable piece of the bike and its whole-bike
 * exploded-view vector. Kept separate from the component map so tests and tools can import it.
 *
 * explode: offset at 100% explode, meters in bike coordinates (+X forward, +Y up, +Z right).
 * xray: 'body' marks exterior panels that turn see-through in X-ray mode.
 */
import type { Vec3 } from '../types/configuration';

export interface GeometryLayout {
  id: string;
  explode: Vec3;
  xray?: 'body';
}

export const GEOMETRY_LAYOUT: GeometryLayout[] = [
  { id: 'geo-crankcase', explode: [0, -0.24, 0] },
  { id: 'geo-oil-pan', explode: [0, -0.36, 0] },
  { id: 'geo-cylinder-block', explode: [0.03, -0.12, 0] },
  { id: 'geo-cylinder-head', explode: [0.06, -0.02, 0] },
  { id: 'geo-head-cover', explode: [0.09, 0.08, 0] },
  { id: 'geo-alternator-cover', explode: [0, -0.24, -0.2] },
  { id: 'geo-right-crankcase-cover', explode: [0, -0.24, 0.2] },
  { id: 'geo-throttle-bodies', explode: [-0.14, 0.05, 0] },
  { id: 'geo-fuel-tank', explode: [0.05, 0.5, 0], xray: 'body' },
  { id: 'geo-radiator', explode: [0.45, 0.02, 0] },
  { id: 'geo-coolant-hoses', explode: [0.3, 0.0, 0] },
  { id: 'geo-exhaust-headers', explode: [0.12, -0.12, 0.35] },
  { id: 'geo-muffler', explode: [-0.12, -0.08, 0.5] },
  { id: 'geo-muffler-cover', explode: [-0.12, -0.08, 0.72] },
  { id: 'geo-exhaust-sensor', explode: [0.16, 0.0, 0.55] },
  { id: 'geo-frame', explode: [0, 0, 0] },
  { id: 'geo-side-stand', explode: [0, -0.15, -0.25] },
  { id: 'geo-swingarm', explode: [-0.45, -0.06, 0] },
  { id: 'geo-steering-stem', explode: [0.35, 0.22, 0] },
  { id: 'geo-top-bridge', explode: [0.35, 0.42, 0] },
  { id: 'geo-fork-tubes', explode: [0.48, 0.3, 0] },
  { id: 'geo-fork-sliders', explode: [0.58, 0.1, 0] },
  { id: 'geo-shock-left', explode: [-0.4, 0.22, -0.28] },
  { id: 'geo-shock-right', explode: [-0.4, 0.22, 0.28] },
  { id: 'geo-front-rim', explode: [0.8, 0, 0] },
  { id: 'geo-front-tire', explode: [0.8, 0, 0] },
  { id: 'geo-front-axle', explode: [0.8, 0, -0.32] },
  { id: 'geo-rear-rim', explode: [-0.9, 0, 0] },
  { id: 'geo-rear-tire', explode: [-0.9, 0, 0] },
  { id: 'geo-rear-axle', explode: [-0.9, 0, 0.36] },
  { id: 'geo-drive-sprocket', explode: [0, -0.1, -0.3] },
  { id: 'geo-drive-chain', explode: [-0.4, -0.06, -0.36] },
  { id: 'geo-driven-sprocket', explode: [-0.9, 0, -0.2] },
  { id: 'geo-front-disc', explode: [0.8, 0, 0.14] },
  { id: 'geo-front-caliper', explode: [0.72, 0.06, 0.3] },
  { id: 'geo-front-brake-hose', explode: [0.4, 0.3, 0.3] },
  { id: 'geo-front-master-cylinder', explode: [0.22, 0.66, 0.16] },
  { id: 'geo-rear-disc', explode: [-0.9, 0, 0.16] },
  { id: 'geo-rear-caliper', explode: [-0.82, -0.04, 0.34] },
  { id: 'geo-rear-brake-hose', explode: [-0.3, -0.04, 0.34] },
  { id: 'geo-rear-master-cylinder', explode: [0, -0.05, 0.38] },
  { id: 'geo-headlight', explode: [0.7, 0.36, 0] },
  { id: 'geo-meter', explode: [0.3, 0.62, 0] },
  { id: 'geo-front-turn-signals', explode: [0.6, 0.3, 0] },
  { id: 'geo-rear-turn-signals', explode: [-0.82, 0.32, 0] },
  { id: 'geo-taillight', explode: [-0.86, 0.4, 0] },
  { id: 'geo-handlebar', explode: [0.25, 0.62, 0] },
  { id: 'geo-throttle-grip', explode: [0.25, 0.62, 0.2] },
  { id: 'geo-left-grip', explode: [0.25, 0.62, -0.2] },
  { id: 'geo-front-brake-lever', explode: [0.3, 0.68, 0.24] },
  { id: 'geo-clutch-lever', explode: [0.3, 0.68, -0.24] },
  { id: 'geo-mirror-left', explode: [0.22, 0.82, -0.18] },
  { id: 'geo-mirror-right', explode: [0.22, 0.82, 0.18] },
  { id: 'geo-footpeg-left', explode: [0.05, -0.1, -0.32] },
  { id: 'geo-footpeg-right', explode: [0.05, -0.1, 0.32] },
  { id: 'geo-shift-lever', explode: [0.14, -0.1, -0.4] },
  { id: 'geo-rear-brake-pedal', explode: [0.14, -0.1, 0.42] },
  { id: 'geo-seat', explode: [-0.28, 0.45, 0], xray: 'body' },
  { id: 'geo-front-fender', explode: [0.8, 0.26, 0], xray: 'body' },
  { id: 'geo-rear-fender', explode: [-0.62, 0.38, 0], xray: 'body' },
  { id: 'geo-side-cover-left', explode: [-0.1, 0.05, -0.38], xray: 'body' },
  { id: 'geo-side-cover-right', explode: [-0.1, 0.05, 0.38], xray: 'body' },
  // 2026 SE (CMX500A2) equipment
  { id: 'geo-seat-se', explode: [-0.28, 0.45, 0], xray: 'body' },
  { id: 'geo-passenger-seat', explode: [-0.55, 0.6, 0], xray: 'body' },
  { id: 'geo-headlight-cowl', explode: [0.78, 0.5, 0], xray: 'body' },
  { id: 'geo-fork-boots', explode: [0.53, 0.2, 0] },
  { id: 'geo-license-bracket', explode: [-0.9, 0.24, 0], xray: 'body' },
];

export const GEOMETRY_IDS: string[] = GEOMETRY_LAYOUT.map((g) => g.id);
