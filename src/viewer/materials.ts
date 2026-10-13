import * as THREE from 'three';

/**
 * Shared base materials for representative geometry. PartNode clones these per mesh before
 * changing highlight/opacity, so the shared instances are never mutated.
 */
const std = (color: string, metalness: number, roughness: number) =>
  new THREE.MeshStandardMaterial({ color, metalness, roughness });

/** Glossy pearl-black paint with a clear coat so highlights reveal the shapes. */
const paint = new THREE.MeshPhysicalMaterial({
  color: '#121316',
  metalness: 0.35,
  roughness: 0.32,
  clearcoat: 1,
  clearcoatRoughness: 0.06,
});

/**
 * Black-out scheme (evokes the 2026 Pearl Black color). Parts stay distinguishable through
 * slightly different black tones and finishes (gloss, satin, matte, metallic).
 */
export const MAT = {
  paint, // tank / fenders / side covers
  frame: std('#18191c', 0.45, 0.42), // satin black
  engine: std('#232529', 0.55, 0.42), // black crankcase / cylinders
  engineDark: std('#141518', 0.45, 0.6),
  engineSatin: std('#34373c', 0.7, 0.3), // covers with a satin sheen
  chrome: std('#c9ced6', 1.0, 0.1),
  alloy: std('#1f2124', 0.65, 0.35), // black cast wheels, clamps
  steel: std('#7d838b', 0.9, 0.3),
  disc: std('#9da2a9', 0.95, 0.3),
  rubber: std('#0d0d0e', 0.0, 0.88),
  seat: std('#141312', 0.05, 0.72),
  plastic: std('#141518', 0.15, 0.55),
  radiatorCore: std('#1a1c1f', 0.6, 0.65),
  lensClear: new THREE.MeshStandardMaterial({ color: '#dfe7ef', metalness: 0.2, roughness: 0.05, emissive: '#566577', emissiveIntensity: 0.55 }),
  lensRed: new THREE.MeshStandardMaterial({ color: '#7a0d10', metalness: 0.1, roughness: 0.2, emissive: '#4a0508', emissiveIntensity: 0.7 }),
  lensAmber: new THREE.MeshStandardMaterial({ color: '#c77812', metalness: 0.1, roughness: 0.25, emissive: '#3a2304', emissiveIntensity: 0.4 }),
  lcd: new THREE.MeshStandardMaterial({ color: '#0e1a1e', metalness: 0.2, roughness: 0.15, emissive: '#1c4248', emissiveIntensity: 0.8 }),
  mirror: std('#b8c2cd', 1.0, 0.04),
  hose: std('#0b0b0c', 0.0, 0.75),
  chain: std('#4c5057', 0.85, 0.45),
  exhaust: std('#1b1c1f', 0.7, 0.34), // black exhaust finish
  spring: std('#7d1a1a', 0.4, 0.45),
} as const;
