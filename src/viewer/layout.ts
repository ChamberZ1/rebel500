/**
 * Layout constants for the representative model, in meters.
 * Axes: +X forward, +Y up, +Z to the rider's right. Ground at Y = 0; wheelbase centered on X = 0.
 *
 * Values marked [Honda 2026] are derived from Honda's published 2026 Rebel 500 specifications
 * (see data/sources.ts → honda-2026-specs / honda-2026-features). Everything else is a
 * representative placement chosen to look like a Rebel 500 — NOT measured OEM geometry.
 */
import * as THREE from 'three';

const IN = 0.0254;

/** [Honda 2026] wheelbase 58.7 in */
export const WHEELBASE = 58.7 * IN;

/** Tire outside radius from ISO size: rim diameter + 2 × (width × aspect). */
function tireRadius(widthMm: number, aspectPct: number, rimIn: number) {
  return ((rimIn * 25.4) / 2 + (widthMm * aspectPct) / 100) / 1000;
}

/** [Honda 2026] 130/90-16 front, 150/80-16 rear; 16-inch wheels */
export const FRONT_TIRE = { width: 0.13, radius: tireRadius(130, 90, 16), rimRadius: (16 * IN) / 2 };
export const REAR_TIRE = { width: 0.15, radius: tireRadius(150, 80, 16), rimRadius: (16 * IN) / 2 };

export const FRONT_AXLE = new THREE.Vector3(WHEELBASE / 2, FRONT_TIRE.radius, 0);
export const REAR_AXLE = new THREE.Vector3(-WHEELBASE / 2, REAR_TIRE.radius, 0);

/** [Honda 2026] rake 28°, trail 110 mm */
export const RAKE = THREE.MathUtils.degToRad(28);
export const TRAIL = 0.11;
/** Unit vector up the steering axis (leaning back). */
export const STEER_DIR = new THREE.Vector3(-Math.sin(RAKE), Math.cos(RAKE), 0);
/** Where the steering axis meets the ground. */
export const STEER_GROUND = new THREE.Vector3(FRONT_AXLE.x + TRAIL, 0, 0);
export const steerPoint = (s: number) => STEER_GROUND.clone().addScaledVector(STEER_DIR, s);
/** Fork legs run parallel to the steering axis through the front axle. */
export const forkPoint = (t: number) => FRONT_AXLE.clone().addScaledVector(STEER_DIR, t);

/** [Honda 2026] 41 mm stanchions set 9.1 in apart */
export const FORK_TUBE_RADIUS = 0.041 / 2;
export const FORK_HALF_SPACING = (9.1 * IN) / 2;

/** [Honda 2026] 296 mm front disc, 240 mm rear disc */
export const FRONT_DISC_RADIUS = 0.296 / 2;
export const REAR_DISC_RADIUS = 0.24 / 2;

/** [Honda 2026] #520 chain, 15T / 40T. Pitch of #520 chain = 5/8 in. */
export const CHAIN_PITCH = 0.625 * IN;
const pitchRadius = (teeth: number) => CHAIN_PITCH / (2 * Math.sin(Math.PI / teeth));
export const DRIVE_SPROCKET_RADIUS = pitchRadius(15);
export const DRIVEN_SPROCKET_RADIUS = pitchRadius(40);

/**
 * [Honda 2026] seat height 27.2 in; overall height 43.0 in; width 32.4 in.
 * Note: in Honda's side-view photo the mirrors rise to ≈1.27 m, so the 43.0 in figure evidently
 * excludes the mirrors (the handlebar sits at ≈1.07 m).
 */
export const SEAT_HEIGHT = 27.2 * IN;
export const OVERALL_HEIGHT = 43.0 * IN;
export const OVERALL_HALF_WIDTH = (32.4 * IN) / 2;

/* ---------- placements traced from a Honda side-view press photo of the 2026 Rebel 500 ----------
 * Scaled using the wheelbase and tire radius above (≈505 px/m), so positions are approximate,
 * not measured OEM dimensions.
 */
export const SWINGARM_PIVOT = new THREE.Vector3(-0.2, 0.39, 0);
export const DRIVE_SPROCKET_CENTER = new THREE.Vector3(-0.13, 0.37, -0.105);
/** Steering-axis positions of the bottom and top triple clamps (top clamp ≈ 1.0 m in the photo). */
export const STEER_BOTTOM_S = 0.879;
export const STEER_TOP_S = 1.1;
export const CHAIN_Z = -0.105;
export const ENGINE_CYL_TILT = THREE.MathUtils.degToRad(-24);

/** Center of the bike for camera framing. */
export const BIKE_CENTER = new THREE.Vector3(0, 0.55, 0);
