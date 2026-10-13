/**
 * Source-of-truth loader for the 2026 Honda Rebel 500 parts database (standard CMX500A and SE CMX500A2).
 *
 * - Root + top-level systems are defined here.
 * - Each assembly lives in data/assemblies/*.json (one file per OEM-ish assembly).
 * - This module stamps model/year onto every record, derives system membership and builds the
 *   lookup indexes used by the UI and the viewer. It contains no part descriptions itself.
 */
import type { AssemblyFile, ModelCode, MotorcyclePart, VariantId } from '../types/motorcycle';
import { TARGET_MODEL, TARGET_YEAR } from '../types/motorcycle';
import { SOURCES } from './sources';
import { DEFAULT_VARIANT, VARIANTS, VARIANT_IDS, type VariantInfo } from './variants';

import engine from './assemblies/engine.json';
import clutch from './assemblies/clutch.json';
import transmission from './assemblies/transmission.json';
import cooling from './assemblies/cooling.json';
import fuelSystem from './assemblies/fuel-system.json';
import exhaust from './assemblies/exhaust.json';
import frame from './assemblies/frame.json';
import steering from './assemblies/steering.json';
import frontSuspension from './assemblies/front-suspension.json';
import rearSuspension from './assemblies/rear-suspension.json';
import frontWheel from './assemblies/front-wheel.json';
import rearWheel from './assemblies/rear-wheel.json';
import frontBrake from './assemblies/front-brake.json';
import rearBrake from './assemblies/rear-brake.json';
import abs from './assemblies/abs.json';
import electrical from './assemblies/electrical.json';
import controls from './assemblies/controls.json';
import bodywork from './assemblies/bodywork.json';
import seEquipment from './assemblies/se-equipment.json';

/** Bikes intentionally out of scope. */
export const NOT_THE_TARGET = ['Rebel 300', 'Rebel 1100', 'pre-2026 Rebel 500'];

type SystemDef = Omit<MotorcyclePart, 'model' | 'modelYear'> & { model?: ModelCode };

const ROOT_AND_SYSTEMS: SystemDef[] = [
  {
    id: 'rebel500',
    name: '2026 Honda Rebel 500',
    kind: 'root',
    description: 'A 471 cc liquid-cooled parallel-twin cruiser with ABS.',
    function:
      'Honda describes the Rebel 500 as a fun, approachable cruiser for new and returning riders. The bike is organized here into the systems below.',
    verification: '2026-oem-verified',
    sourceId: 'honda-2026-specs',
    geometryAccuracy: 'representative',
    facts: [
      { label: 'Length × width × height', value: '86.9 × 32.4 × 43.0 in', sourceId: 'honda-2026-specs', verification: '2026-oem-verified' },
      { label: 'Wheelbase', value: '58.7 in', sourceId: 'honda-2026-specs', verification: '2026-oem-verified' },
      { label: 'Seat height', value: '27.2 in', sourceId: 'honda-2026-specs', verification: '2026-oem-verified' },
      { label: 'Ground clearance', value: '5.4 in', sourceId: 'honda-2026-specs', verification: '2026-oem-verified' },
      { label: 'Fuel capacity', value: '3.0 gal', sourceId: 'honda-2026-specs', verification: '2026-oem-verified' },
      {
        label: 'Curb weight',
        value: "Honda lists 414 lb and 419 lb for the 2026 Rebel 500 / SE pair; the retrieved text does not label which is which, so neither is assigned here",
        sourceId: 'honda-2026-specs',
        verification: 'cross-referenced',
      },
    ],
    keywords: ['rebel', 'cmx500a', 'motorcycle'],
  },
  sys('engine', 'Engine', 'The 471 cc DOHC eight-valve liquid-cooled parallel-twin: cylinders, crankshaft, clutch and six-speed transmission in one unit.',
    'Turns fuel into rotating power and delivers it, through the clutch and gearbox, to the final drive.',
    'honda-2026-specs', 'power-path', ['motor', 'powertrain'], [
      { label: 'Type', value: '471 cc liquid-cooled parallel-twin four-stroke', sourceId: 'honda-2026-specs', verification: '2026-oem-verified' },
      { label: 'Starter', value: 'Push-button electric', sourceId: 'honda-2026-specs', verification: '2026-oem-verified' },
    ]),
  sys('intake-fuel', 'Intake / Fuel', 'The fuel tank, fuel delivery and PGM-FI fuel injection with 34 mm throttle bodies.',
    'Stores fuel and meters precisely the right amount of fuel and air into each cylinder.',
    'honda-2026-specs', 'fuel-injection', ['fuel', 'intake', 'injection']),
  sys('cooling', 'Cooling', 'A liquid-cooling circuit: water pump, thermostat, radiator and hoses.',
    'Carries combustion heat away from the cylinders and head and sheds it to the air at the radiator.',
    'honda-2026-specs', 'cooling', ['coolant', 'liquid cooled']),
  sys('exhaust', 'Exhaust', 'Two header pipes merging into a chamber under the engine, an exhaust sensor and a right-side muffler with a side cover (per the 2026 MUFFLER diagram).',
    'Routes exhaust gas away from the engine and quietens it.', 'honda-2026-features', 'exhaust', ['exhaust']),
  sys('chassis', 'Chassis / Frame', 'Tubular-steel frame, engine mounting, steering, swingarm and stand.',
    'The structure that every other system bolts to; it sets the riding geometry.', 'honda-2026-features', undefined, ['chassis', 'frame']),
  sys('front-suspension', 'Front Suspension', 'The 41 mm telescopic fork with 5.5 in of travel.',
    'Absorbs bumps at the front wheel and keeps the tire in contact with the road.', 'honda-2026-specs', 'suspension', ['fork', 'suspension']),
  sys('rear-suspension', 'Rear Suspension', 'Dual rear shocks with 3.7 in of travel, working with the swingarm.',
    'Absorbs bumps at the rear wheel and supports the rider.', 'honda-2026-specs', 'suspension', ['shocks', 'suspension']),
  sys('wheels-drive', 'Wheels / Final Drive', '16-inch cast wheels, Dunlop tires and #520 chain final drive (15T/40T).',
    'Carry the bike, provide grip and transmit power from the transmission to the road.', 'honda-2026-specs', 'power-path', ['wheels', 'tires', 'chain']),
  sys('brakes', 'Brakes', 'Single-disc hydraulic front (296 mm) and rear (240 mm) brakes with ABS.',
    'Slow and stop the motorcycle, with anti-lock control.', 'honda-2026-specs', 'braking', ['brakes', 'ABS']),
  sys('electrical', 'Electrical', 'Battery, charging, ignition, starting, engine control electronics, lighting and instruments.',
    'Generates, stores and distributes electrical power and runs the engine-control electronics.', 'honda-2026-specs', 'charging', ['electrical', 'electronics']),
  sys('body-controls', 'Body / Controls', 'Seat, fenders, side covers, handlebar, levers, pedals, footpegs and mirrors.',
    'The rider interface and the exterior panels.', 'honda-2026-features', undefined, ['body', 'controls']),
];

function sys(
  id: string,
  name: string,
  description: string,
  fn: string,
  sourceId: string,
  educationId: string | undefined,
  keywords: string[],
  facts: MotorcyclePart['facts'] = undefined,
): SystemDef {
  return {
    id,
    name,
    kind: 'system',
    parentId: 'rebel500',
    description,
    function: fn,
    verification: '2026-oem-verified',
    sourceId,
    geometryAccuracy: 'representative',
    educationId,
    keywords,
    facts,
  };
}

const ASSEMBLY_FILES = [
  engine, clutch, transmission, cooling, fuelSystem, exhaust, frame, steering,
  frontSuspension, rearSuspension, frontWheel, rearWheel, frontBrake, rearBrake, abs,
  electrical, controls, bodywork, seEquipment,
] as unknown as AssemblyFile[];

/* ------------------------------------------------------------------ build indexes */

export interface PartsIndex {
  variant: VariantId;
  rootId: string;
  nodes: Map<string, MotorcyclePart>;
  children: Map<string, string[]>;
  /** geometry id → data node id */
  geometryOwner: Map<string, string>;
  /** node id → all geometry ids in its subtree (including itself) */
  subtreeGeometry: Map<string, string[]>;
  /** node id → ancestors (closest first, excluding self) */
  ancestors: Map<string, string[]>;
  systemIds: string[];
}

function buildIndex(variant: VariantId): PartsIndex {
  const info = VARIANTS[variant];
  const nodes = new Map<string, MotorcyclePart>();
  const add = (p: MotorcyclePart) => {
    if (p.variants && !p.variants.includes(variant)) return;
    if (nodes.has(p.id)) throw new Error(`Duplicate part id "${p.id}" in ${variant}`);
    nodes.set(p.id, p);
  };

  for (const s of ROOT_AND_SYSTEMS) {
    const node: MotorcyclePart = { ...s, model: s.model ?? TARGET_MODEL, modelYear: TARGET_YEAR };
    if (node.kind === 'root') {
      node.name = `${info.displayName} (${info.model})`;
      node.description = `${node.description} ${info.trim}, ${info.market} market.`;
      node.model = info.model;
    }
    add(node);
  }
  for (const file of ASSEMBLY_FILES) {
    if (file.modelYear !== TARGET_YEAR) throw new Error(`Assembly file "${file.assembly}" is not for ${TARGET_YEAR}`);
    for (const p of file.parts) {
      // Spread a copy so derived fields (systemId) never leak between variant indexes.
      add({ ...p, assembly: file.assembly, model: file.model, modelYear: TARGET_YEAR });
    }
  }

  const children = new Map<string, string[]>();
  for (const n of nodes.values()) {
    if (!n.parentId) continue;
    const list = children.get(n.parentId) ?? [];
    list.push(n.id);
    children.set(n.parentId, list);
  }

  const ancestors = new Map<string, string[]>();
  for (const n of nodes.values()) {
    const chain: string[] = [];
    let cur = n.parentId;
    const guard = new Set<string>();
    while (cur) {
      if (guard.has(cur)) throw new Error(`Cycle detected at "${cur}"`);
      guard.add(cur);
      chain.push(cur);
      cur = nodes.get(cur)?.parentId;
    }
    ancestors.set(n.id, chain);
    // system = the ancestor (or self) whose parent is the root
    const lineage = [n.id, ...chain];
    const systemId = lineage.find((id) => nodes.get(id)?.kind === 'system');
    n.systemId = systemId;
  }

  const geometryOwner = new Map<string, string>();
  for (const n of nodes.values()) {
    for (const g of n.geometryIds ?? []) {
      if (geometryOwner.has(g)) throw new Error(`Geometry "${g}" claimed by both "${geometryOwner.get(g)}" and "${n.id}"`);
      geometryOwner.set(g, n.id);
    }
  }

  const subtreeGeometry = new Map<string, string[]>();
  const collect = (id: string): string[] => {
    const cached = subtreeGeometry.get(id);
    if (cached) return cached;
    const own = nodes.get(id)?.geometryIds ?? [];
    const all = [...own, ...(children.get(id) ?? []).flatMap(collect)];
    subtreeGeometry.set(id, all);
    return all;
  };
  for (const id of nodes.keys()) collect(id);

  const systemIds = (children.get('rebel500') ?? []).filter((id) => nodes.get(id)?.kind === 'system');

  return { variant, rootId: 'rebel500', nodes, children, geometryOwner, subtreeGeometry, ancestors, systemIds };
}

/** One index per selectable bike. */
export const PARTS_BY_VARIANT: Record<VariantId, PartsIndex> = Object.fromEntries(
  VARIANT_IDS.map((v) => [v, buildIndex(v)]),
) as Record<VariantId, PartsIndex>;

/**
 * Index of the currently selected bike. This is a live ES-module binding: importers always see
 * the active variant after `setActiveVariant()` (the store calls it and remounts dependent views).
 */
export let PARTS: PartsIndex = PARTS_BY_VARIANT[DEFAULT_VARIANT];

export function setActiveVariant(variant: VariantId) {
  PARTS = PARTS_BY_VARIANT[variant];
}

export function activeVariant(): VariantInfo {
  return VARIANTS[PARTS.variant];
}

export function getPart(id: string | null | undefined): MotorcyclePart | undefined {
  return id ? PARTS.nodes.get(id) : undefined;
}

export function getChildren(id: string): MotorcyclePart[] {
  return (PARTS.children.get(id) ?? []).map((c) => PARTS.nodes.get(c)!);
}

/** Lineage from root to the node (inclusive). */
export function getLineage(id: string): MotorcyclePart[] {
  const anc = PARTS.ancestors.get(id) ?? [];
  return [...anc].reverse().concat(id).map((x) => PARTS.nodes.get(x)!).filter(Boolean);
}

/** Nearest node (self or ancestor) that has any geometry — used for "located within" context. */
export function nearestGeometricAncestor(id: string): string | undefined {
  for (const cand of [id, ...(PARTS.ancestors.get(id) ?? [])]) {
    if ((PARTS.subtreeGeometry.get(cand) ?? []).length > 0) return cand;
  }
  return undefined;
}

/* ------------------------------------------------------------------ validation */

export interface ValidationIssue {
  partId: string;
  message: string;
}

/** Accuracy rules enforced at test time and logged in development. */
export function validateParts(indexes: PartsIndex[] = Object.values(PARTS_BY_VARIANT)): ValidationIssue[] {
  return indexes.flatMap(validateIndex);
}

function validateIndex(index: PartsIndex): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const push = (partId: string, message: string) => issues.push({ partId: `${index.variant}:${partId}`, message });
  for (const n of index.nodes.values()) {
    if (n.modelYear !== TARGET_YEAR) push(n.id, 'wrong model year');
    if (n.model !== 'CMX500A' && n.model !== 'CMX500A2') push(n.id, `unknown model "${n.model}"`);
    if (n.variants?.length === 1 && n.variants[0] === 'cmx500a2' && n.model !== 'CMX500A2') push(n.id, 'SE-only node must be researched as CMX500A2');
    if (n.model === 'CMX500A2' && n.variants?.includes('cmx500a')) push(n.id, 'CMX500A2 record applied to the standard model');
    if (n.parentId && !index.nodes.has(n.parentId)) push(n.id, `missing parent "${n.parentId}"`);
    if (n.sourceId && !SOURCES[n.sourceId]) push(n.id, `unknown sourceId "${n.sourceId}"`);
    if (n.verification !== 'unverified' && !n.sourceId) push(n.id, 'verified/cross-referenced node has no sourceId');
    if (n.verification === '2026-oem-verified' && n.sourceId && SOURCES[n.sourceId]?.access !== 'direct') {
      push(n.id, '2026-oem-verified requires a directly-read source');
    }
    if (n.geometryAccuracy === 'none' && n.geometryIds?.length) push(n.id, 'geometryAccuracy "none" but has geometryIds');
    if (n.oem) {
      if (n.oem.sourceId && !SOURCES[n.oem.sourceId]) push(n.id, `unknown oem.sourceId "${n.oem.sourceId}"`);
      if (n.oem.partNumber) {
        if (!n.oem.sourceId) push(n.id, 'part number without source');
        if (n.oem.verification === 'unverified') push(n.id, 'part number recorded as unverified — remove it instead');
        if (!/^\d{5}-[A-Z0-9]{3}-[A-Z0-9]{3,5}$/.test(n.oem.partNumber)) push(n.id, `malformed Honda part number "${n.oem.partNumber}"`);
      }
      if (n.oem.verification === '2026-oem-verified' && n.oem.sourceId && SOURCES[n.oem.sourceId]?.access !== 'direct') {
        push(n.id, 'OEM data marked verified but source was not read directly');
      }
    }
    for (const f of n.facts ?? []) {
      if (!SOURCES[f.sourceId]) push(n.id, `fact "${f.label}" has unknown source "${f.sourceId}"`);
    }
    const s = n.service;
    if (s && (s.torqueNm !== undefined || s.torqueFtLb !== undefined)) {
      if (!s.verified || !s.sourceId || s.verifiedModel !== `${TARGET_YEAR} ${n.model}`) {
        push(n.id, 'torque value present without a verified 2026 source for this model');
      }
    }
    for (const r of n.relatedParts ?? []) if (!index.nodes.has(r)) push(n.id, `unknown related part "${r}"`);
  }
  return issues;
}
