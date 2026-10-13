import type { ModelCode, VariantId } from '../types/motorcycle';

export interface VariantInfo {
  id: VariantId;
  model: ModelCode;
  modelYear: 2026;
  /** Short label for the selector. */
  label: string;
  displayName: string;
  trim: string;
  market: string;
  /** Fitment submodel shown by RevZilla's OEM catalog. Trailing type code meaning not verified. */
  catalogSubmodel: string;
  notes: string[];
}

export const VARIANTS: Record<VariantId, VariantInfo> = {
  cmx500a: {
    id: 'cmx500a',
    model: 'CMX500A',
    modelYear: 2026,
    label: '2026 Rebel 500 ABS',
    displayName: '2026 Honda Rebel 500',
    trim: 'ABS — standard model (non-SE)',
    market: 'U.S.',
    catalogSubmodel: 'CMX500AAC',
    notes: [
      'Honda: California models meet CARB standards and may differ slightly due to emissions equipment.',
      'Retail OEM catalogs (RevZilla) show the 2026 standard ABS fitment as "CMX500AAC"; the meaning of the trailing type code is not verified here.',
      'SE-only items (not on this model): brown diamond-stitch seat, black fork boots, color-matched headlight cowl.',
    ],
  },
  cmx500a2: {
    id: 'cmx500a2',
    model: 'CMX500A2',
    modelYear: 2026,
    label: '2026 Rebel 500 ABS SE',
    displayName: '2026 Honda Rebel 500 SE',
    trim: 'ABS — Special Edition',
    market: 'U.S.',
    catalogSubmodel: 'CMX500A2AC',
    notes: [
      'Honda (2026 features): the SE adds factory-fitted accessories — a brown diamond-stitch seat, black fork boots and a color-matched headlight cowl. Engine, chassis and brake specifications are shared with the standard model.',
      'Shared components were researched for the standard CMX500A. Their part numbers have not been checked against the SE (CMX500A2) catalog.',
      'The passenger seat is shown at the owner\'s direction from a supplied SEAT diagram; Honda\'s 2026 features release does not mention it. Confirm on the 2026 CMX500A2 SEAT fiche.',
      'Honda: California models meet CARB standards and may differ slightly due to emissions equipment.',
    ],
  },
};

export const VARIANT_IDS = Object.keys(VARIANTS) as VariantId[];
export const DEFAULT_VARIANT: VariantId = 'cmx500a';
