/**
 * Core data model for Rebel 500 Explorer.
 *
 * Two concepts are deliberately kept separate everywhere in this codebase:
 *   1. DATA verification   — is the part identity / fact confirmed for the 2026 CMX500A?
 *   2. GEOMETRY accuracy   — how faithful is the 3D mesh we draw for it?
 * A part can be OEM-verified while its mesh is purely representative.
 */

export const TARGET_MODEL = 'CMX500A' as const;
export const TARGET_YEAR = 2026 as const;

/** Honda model codes this app covers. */
export type ModelCode = 'CMX500A' | 'CMX500A2';
/** Selectable bikes: standard 2026 Rebel 500 ABS and the 2026 Rebel 500 ABS SE. */
export type VariantId = 'cmx500a' | 'cmx500a2';

/**
 * - `2026-oem-verified`: confirmed by a Honda-published source specific to the 2026 Rebel 500
 *   (Honda spec sheet / features release), or a 2026 CMX500A OEM catalog page read directly.
 * - `cross-referenced`: appears in a 2026 Rebel 500 OEM catalog listing that could only be read
 *   indirectly (search index), or in a sibling 2026 catalog (e.g. the SE index) — plausible, but
 *   confirm against the linked fiche before relying on it.
 * - `unverified`: not yet verified for the 2026 CMX500A. Descriptions are generic engineering
 *   explanations, not Honda data.
 */
export type Verification = '2026-oem-verified' | 'cross-referenced' | 'unverified';

/**
 * - `representative`: simple primitive geometry for interaction only.
 * - `approximate`: primitive geometry sized from Honda-published 2026 dimensions
 *   (e.g. tire size, disc diameter) — proportions only, not CAD.
 * - `dimensionally-verified`: measured/CAD-derived mesh (none yet).
 * - `none`: data-only node; no 3D geometry exists (e.g. internal engine parts).
 */
export type GeometryAccuracy = 'representative' | 'approximate' | 'dimensionally-verified' | 'none';

export type NodeKind = 'root' | 'system' | 'assembly' | 'part';

/** A single sourced fact, e.g. "Front disc: 296 mm". Each fact carries its own provenance. */
export interface SpecFact {
  label: string;
  value: string;
  sourceId: string;
  verification: Verification;
}

/** OEM catalog identity. Part numbers are only recorded when sourced; never inferred. */
export interface OemReference {
  /** Honda fiche / diagram name, e.g. "CLUTCH", "FRONT FORK". */
  ficheName?: string;
  /** Honda OEM description exactly as listed, e.g. "SPROCKET, FINAL DRIVEN (40T)". */
  oemName?: string;
  /** Honda part number, e.g. "41201-MKG-A00". Only present with a sourceId and non-unverified status. */
  partNumber?: string;
  /** URL of the fiche page to send users to (authoritative page, not a copy). */
  ficheUrl?: string;
  sourceId?: string;
  verification: Verification;
  note?: string;
}

/** Safety-relevant service data. Only populate values verified for the 2026 CMX500A. */
export interface ServiceInfo {
  torqueNm?: number;
  torqueFtLb?: number;
  socketSize?: string;
  notes?: string;
  sourceId?: string;
  sourceUrl?: string;
  verified: boolean;
  verifiedModel?: string;
}

export interface MotorcyclePart {
  id: string;
  name: string;
  kind: NodeKind;
  parentId?: string;
  /** Top-level system id this node belongs to (derived by the loader). */
  systemId?: string;
  /** Source assembly file this node was loaded from (derived by the loader). */
  assembly?: string;
  subassembly?: string;

  description: string;
  function: string;

  modelYear: typeof TARGET_YEAR;
  /** Honda model code the record was researched for. */
  model: ModelCode;
  /** Bikes this node appears on. Omitted = shared by every variant. */
  variants?: VariantId[];

  verification: Verification;
  /** Primary source for `verification`. */
  sourceId?: string;
  verificationNote?: string;

  geometryAccuracy: GeometryAccuracy;
  /** Representative/GLB geometry entries (see viewer/geometryRegistry.ts) that render this node. */
  geometryIds?: string[];

  oem?: OemReference;
  facts?: SpecFact[];
  service?: ServiceInfo;

  relatedParts?: string[];
  /** Extra search terms, e.g. "engine hanger" for engine mounts. */
  keywords?: string[];
  /** Id of an education topic in data/education.ts. */
  educationId?: string;
}

/** Shape of each src/data/assemblies/*.json file. */
export interface AssemblyFile {
  assembly: string;
  model: ModelCode;
  modelYear: typeof TARGET_YEAR;
  parts: Array<Omit<MotorcyclePart, 'model' | 'modelYear' | 'assembly' | 'systemId'>>;
}

export type SourceAuthority = 'oem-official' | 'oem-catalog' | 'secondary' | 'evaluated-not-used';
export type SourceAccess = 'direct' | 'search-index' | 'metadata-only' | 'user-supplied' | 'not-accessed';

export interface Source {
  id: string;
  name: string;
  publisher: string;
  url: string;
  authority: SourceAuthority;
  access: SourceAccess;
  appliesTo: string;
  accessed: string;
  usedFor: string;
  licensing: string;
  caveat?: string;
}

/** Ordered path through the bike used by educational "show path" highlighting. */
export interface EducationTopic {
  id: string;
  title: string;
  summary: string;
  /** Optional cause → effect sequences, e.g. lever released → plates clamped → … */
  sequences?: Array<{ title: string; steps: string[] }>;
  /** Node ids in flow order; nodes without geometry are listed but not highlighted. */
  flowPath?: string[];
  flowLabel?: string;
  /** States who wrote the text; generic explanations are not Honda quotes. */
  attribution: string;
}
