/**
 * Extensibility layer for owner modifications (aftermarket parts).
 * Nothing here is OEM data. Mount points defined on representative geometry are themselves
 * representative until measured.
 */
import type { GeometryAccuracy, Verification } from './motorcycle';

export type Vec3 = [number, number, number];

/** A named attachment location on an OEM part, in bike coordinates (meters; +X forward, +Y up, +Z right). */
export interface MountPoint {
  id: string;
  name: string;
  /** OEM data node this mount belongs to. */
  partId: string;
  position: Vec3;
  /** Euler XYZ (radians) for the attached model's orientation. */
  rotation?: Vec3;
  geometryAccuracy: GeometryAccuracy;
  verification: Verification;
  note?: string;
}

export type ModificationCategory =
  | 'protection'
  | 'exhaust'
  | 'seating'
  | 'controls'
  | 'mirrors'
  | 'electronics'
  | 'luggage'
  | 'other';

export interface Modification {
  id: string;
  name: string;
  brand?: string;
  category: ModificationCategory;
  mountPointIds: string[];
  /** OEM data node ids hidden when this mod is fitted (e.g. stock muffler for a slip-on). */
  replacesPartIds?: string[];
  glbUrl?: string;
  description: string;
  productUrl?: string;
  geometryAccuracy: GeometryAccuracy;
}

export interface BikeConfiguration {
  id: string;
  name: string;
  description: string;
  modificationIds: string[];
}
