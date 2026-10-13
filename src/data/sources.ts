import type { Source } from '../types/motorcycle';

/**
 * Research provenance. Every sourceId referenced in data/ must exist here (enforced by tests).
 * Access date for all entries: 2026-10-13. See docs/SOURCES.md for the narrative version.
 *
 * `access` matters:
 *  - direct:        page content was retrieved and read directly.
 *  - search-index:  the site blocked automated access (HTTP 403 bot protection); content was read
 *                   through a web-search index of that exact page. Treated as cross-referenced.
 *  - metadata-only: only catalog/listing metadata was used (e.g. a paid manual's product page).
 */
export const SOURCES: Record<string, Source> = {
  'honda-2026-specs': {
    id: 'honda-2026-specs',
    name: '2026 Honda Rebel 500 Specifications',
    publisher: 'American Honda Motor Co. (Honda News)',
    url: 'https://hondanews.com/en-US/powersports/releases/release-34d7fa1af550cdceef36ed1dbd079060-2026-honda-rebel-500-specifications',
    authority: 'oem-official',
    access: 'direct',
    appliesTo: '2026 Rebel 500 and 2026 Rebel 500 SE (U.S.)',
    accessed: '2026-10-13',
    usedFor:
      'Engine type, bore/stroke, compression, valve train, induction (PGM-FI, 34 mm throttle bodies), ignition, transmission, clutch type, final drive (#520 chain, 15T/40T), suspension, brake disc sizes, tire sizes, rake/trail, overall dimensions, fuel capacity.',
    licensing: 'Factual specifications only; no text or images copied beyond short factual values.',
    caveat:
      'Lists curb weights of 419 lb and 414 lb without the retrieved text labelling which applies to the standard model vs SE. California models may differ slightly due to emissions equipment (per Honda).',
  },
  'honda-2026-features': {
    id: 'honda-2026-features',
    name: '2026 Honda Rebel 500 Features & Benefits',
    publisher: 'American Honda Motor Co. (Honda News)',
    url: 'https://hondanews.com/en-US/powersports/releases/release-34d7fa1af550cdceef36ed1dbd07de81-2026-honda-rebel-500-features-benefits',
    authority: 'oem-official',
    access: 'direct',
    appliesTo: '2026 Rebel 500 and 2026 Rebel 500 SE (U.S.)',
    accessed: '2026-10-13',
    usedFor:
      'Assist/slipper clutch, tubular-steel frame holding the engine in three places, 3.0 gal peanut tank, 41 mm fork with 9.1 in stanchion spacing, rear two-step preload adjusters, 16-inch cast-aluminum wheels, Dunlop tires, LED headlight/turn signals/taillight, LCD meter with gear-position indicator, tapered handlebar, mid-mounted footpegs, and the SE-only extras (brown diamond-stitch seat, black fork boots, color-matched headlight cowl).',
    licensing: 'Short factual statements paraphrased; brief quotations attributed to Honda.',
  },
  'helm-61mlh00': {
    id: 'helm-61mlh00',
    name: 'Honda Genuine Service Manual 61MLH00 — "2023-2026 Rebel 500 Service Manual"',
    publisher: 'Helm Incorporated (authorized Honda publications provider)',
    url: 'https://www.helminc.com/helm/product2.asp?class_2=AHC&Sku=61MLH00&itemtype=N',
    authority: 'oem-official',
    access: 'metadata-only',
    appliesTo: '2023, 2024, 2025, 2026 Rebel 500 (per listing)',
    accessed: '2026-10-13',
    usedFor:
      'Confirms the authoritative service reference for torque values, procedures and exploded views. The manual itself is a paid, copyrighted publication and was NOT accessed; no torque or procedure data in this app comes from it.',
    licensing: 'Copyrighted paid publication. Do not copy contents into this repository.',
  },
  'revzilla-2026-abs-index': {
    id: 'revzilla-2026-abs-index',
    name: 'RevZilla OEM catalog — 2026 Honda Rebel 500 ABS',
    publisher: 'RevZilla (Honda OEM parts retailer; Honda fiche data)',
    url: 'https://www.revzilla.com/oem/honda/2026-honda-rebel-500-abs',
    authority: 'oem-catalog',
    access: 'search-index',
    appliesTo: '2026 Rebel 500 ABS — fitment submodel shown as "CMX500AAC" (standard, non-SE)',
    accessed: '2026-10-13',
    usedFor: 'Entry point to the 2026 standard-model OEM fiche diagrams.',
    licensing: 'Linked only. Diagrams and listings are not copied into this repository.',
    caveat:
      'Direct requests returned HTTP 403 (bot protection). The meaning of the trailing type code in "CMX500AAC" (e.g. 49-state vs California) has not been verified.',
  },
  'revzilla-2026-abs-headlight': {
    id: 'revzilla-2026-abs-headlight',
    name: 'RevZilla OEM diagram F820408 — 2026 Rebel 500 ABS HEADLIGHT',
    publisher: 'RevZilla (Honda OEM fiche)',
    url: 'https://www.revzilla.com/oem/honda/2026-honda-rebel-500-abs/headlight',
    authority: 'oem-catalog',
    access: 'search-index',
    appliesTo: '2026 Rebel 500 ABS (CMX500AAC)',
    accessed: '2026-10-13',
    usedFor: 'Headlight assembly part number 33100-K87-A31 (KOITO).',
    licensing: 'Linked only.',
    caveat: 'Read via search index (direct access HTTP 403). Part number corroborated by a second independent query.',
  },
  'revzilla-2026-abs-battery': {
    id: 'revzilla-2026-abs-battery',
    name: 'RevZilla OEM diagram F820450 — 2026 Rebel 500 ABS BATTERY',
    publisher: 'RevZilla (Honda OEM fiche)',
    url: 'https://www.revzilla.com/oem/honda/2026-honda-rebel-500-abs/battery',
    authority: 'oem-catalog',
    access: 'search-index',
    appliesTo: '2026 Rebel 500 ABS (CMX500AAC)',
    accessed: '2026-10-13',
    usedFor: 'Battery part number 31500-K36-A01 (GTZ8V, supersedes 31500-KZZ-J11).',
    licensing: 'Linked only.',
    caveat:
      'Read via search index (direct access HTTP 403). The part number was independently confirmed as a Honda GTZ8V battery on other Honda fiches.',
  },
  'revzilla-2026-abs-rear-wheel': {
    id: 'revzilla-2026-abs-rear-wheel',
    name: 'RevZilla OEM diagram — 2026 Rebel 500 ABS REAR WHEEL',
    publisher: 'RevZilla (Honda OEM fiche)',
    url: 'https://www.revzilla.com/oem/honda/2026-honda-rebel-500-abs/rear-wheel',
    authority: 'oem-catalog',
    access: 'search-index',
    appliesTo: '2026 Rebel 500 ABS (CMX500AAC)',
    accessed: '2026-10-13',
    usedFor: 'Final driven sprocket 41201-MKG-A00 "SPROCKET, FINAL DRIVEN (40T)".',
    licensing: 'Linked only.',
    caveat:
      'Read via search index. Search results for other rows of this diagram were contradictory, so only the sprocket (whose 40T count matches Honda\'s 2026 spec) is recorded.',
  },
  'revzilla-2026-abs-muffler': {
    id: 'revzilla-2026-abs-muffler',
    name: 'RevZilla OEM diagram — 2026 Rebel 500 ABS MUFFLER (illustration MLHAF2700)',
    publisher: 'RevZilla (Honda OEM fiche; illustration rendered by LeadVenture)',
    url: 'https://www.revzilla.com/oem/honda/2026-honda-rebel-500-abs/muffler?submodel=cmx500aac',
    authority: 'oem-catalog',
    access: 'user-supplied',
    appliesTo: '2026 Rebel 500 ABS, submodel CMX500AAC (confirmed as 2026 by the user)',
    accessed: '2026-10-13',
    usedFor:
      'Exhaust layout and component breakdown: twin header pipes merging into a chamber under the engine (#1), header gaskets (#3), muffler (#5), muffler side cover (#7), pipe-to-muffler clamp and gasket (#8, #9), a wired exhaust sensor (#14), and brackets/rubber mounts/fasteners. Item numbers refer to the diagram.',
    licensing: 'Diagram examined only; not copied into this repository. Link to the original page.',
    caveat:
      'Only the illustration was available: the parts list (Honda names and part numbers) could not be read, because direct requests return HTTP 403 and the page is not in search indexes. Component names here are descriptive, not Honda\'s. Treated as cross-referenced.',
  },
  'owner-seat-diagram': {
    id: 'owner-seat-diagram',
    name: 'Honda OEM SEAT diagram (screenshot supplied by the owner)',
    publisher: 'Honda OEM fiche via a LeadVenture-rendered dealer catalog',
    url: 'https://www.revzilla.com/oem/honda/2026-honda-rebel-500-abs',
    authority: 'oem-catalog',
    access: 'user-supplied',
    appliesTo: '2026 Rebel 500 SEAT diagram per the owner; exact page/submodel not identified',
    accessed: '2026-10-13',
    usedFor:
      'Seat breakdown and shape: teardrop rider seat (#2) with a front tab, rear mounting bolt/collar/grommet (#12, #11, #1) and underside cushion rubbers (#3–#6); separate passenger seat (#8) with grommets (#7), screw (#9) and washer (#10).',
    licensing: 'Diagram examined only; not copied. Link points to the catalog index because the exact page URL was not supplied.',
    caveat:
      'Parts list (Honda names and part numbers) not visible. The owner directed that the passenger seat is not fitted to the standard model and is fitted to the SE; Honda\'s 2026 features release does not mention an SE passenger seat.',
  },
  'revzilla-2026-se-index': {
    id: 'revzilla-2026-se-index',
    name: 'RevZilla OEM catalog — 2026 Honda Rebel 500 ABS SE (category index)',
    publisher: 'RevZilla (Honda OEM fiche)',
    url: 'https://www.revzilla.com/oem/honda/2026-honda-rebel-500-abs-se',
    authority: 'oem-catalog',
    access: 'search-index',
    appliesTo: '2026 Rebel 500 ABS SE (CMX500A2AC) — NOT the target model',
    accessed: '2026-10-13',
    usedFor:
      'Only the NAMES of 2026 Rebel 500 OEM diagram categories (e.g. CYLINDER HEAD, STARTING CLUTCH, THERMOSTAT). No SE part numbers are used anywhere in this app.',
    licensing: 'Linked only.',
    caveat:
      'SE catalog. Diagram names are expected to match the standard CMX500A catalog, but each SE-derived item is marked cross-referenced, not verified.',
  },
  'partzilla-2026-index': {
    id: 'partzilla-2026-index',
    name: 'Partzilla — Honda Motorcycle 2026 OEM Parts (model index)',
    publisher: 'Partzilla (Honda OEM parts retailer)',
    url: 'https://www.partzilla.com/catalog/honda/motorcycle/2026',
    authority: 'oem-catalog',
    access: 'search-index',
    appliesTo: '2026 Honda motorcycles; lists "CMX500A REBEL 500" and "CMX500A2 REBEL 500 SE" separately',
    accessed: '2026-10-13',
    usedFor: 'Confirms separate 2026 catalogs for the standard CMX500A and the SE (CMX500A2).',
    licensing: 'Linked only.',
    caveat: 'Direct requests returned HTTP 403. Select "CMX500A REBEL 500" on the page to reach the standard model.',
  },
  'honda-2026-lineup': {
    id: 'honda-2026-lineup',
    name: 'Rebel 300 E-Clutch Headlines 2026 Honda Cruiser New-Model Announcement',
    publisher: 'American Honda Motor Co. (Honda News)',
    url: 'https://hondanews.com/en-US/releases/release-34d7fa1af550cdceef36ed1dbd06edba-rebel-300-e-clutch-headlines-2026-honda-cruiser-new-model-announcement',
    authority: 'oem-official',
    access: 'search-index',
    appliesTo: '2026 Honda cruiser line-up',
    accessed: '2026-10-13',
    usedFor: 'Context only: the Rebel 500 returns for 2026 (E-Clutch is a Rebel 300 feature, not Rebel 500).',
    licensing: 'Linked only.',
  },
  '3dcadbrowser-rebel500-2018': {
    id: '3dcadbrowser-rebel500-2018',
    name: '3D CAD Browser — "Honda Rebel 500 (2018)" polygon model',
    publisher: '3D CAD Browser (user upload)',
    url: 'https://www.3dcadbrowser.com/3d-model/honda-rebel-500-2018',
    authority: 'evaluated-not-used',
    access: 'search-index',
    appliesTo: '2018 Rebel 500 (pre-2020 update) — not the target model',
    accessed: '2026-10-13',
    usedFor: 'Evaluated and rejected: wrong model year, visual shell (not mechanical CAD), paid/upload-gated access.',
    licensing: 'Not downloaded. Not included.',
  },
};

export function getSource(id: string | undefined): Source | undefined {
  return id ? SOURCES[id] : undefined;
}

/** Fallback catalog links for SE (CMX500A2) parts. */
export const SE_CATALOG_ENTRY_POINTS = [
  { label: 'RevZilla 2026 Rebel 500 ABS SE catalog', url: 'https://www.revzilla.com/oem/honda/2026-honda-rebel-500-abs-se' },
  { label: 'Partzilla 2026 Honda index → CMX500A2 REBEL 500 SE', url: 'https://www.partzilla.com/catalog/honda/motorcycle/2026' },
];

/** Fallback deep-links for "View OEM exploded diagram" when no verified diagram URL exists. */
export const OEM_CATALOG_ENTRY_POINTS = [
  { label: 'RevZilla 2026 Rebel 500 ABS catalog', url: SOURCES['revzilla-2026-abs-index'].url },
  { label: 'Partzilla 2026 Honda index → CMX500A REBEL 500', url: SOURCES['partzilla-2026-index'].url },
];
