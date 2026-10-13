# Rebel 500 Explorer

An interactive 3D exploded-assembly viewer for learning how a motorcycle is put together, built
specifically for the **2026 Honda Rebel 500 ABS, U.S. standard (non-SE) model: CMX500A**.

You can orbit the bike, explode it, isolate systems, click parts and read what each one does.
For every part, the app tells you exactly how trustworthy its data is.

> **Accuracy > pretending to be complete.** Every part shows two separate statuses:
> **data verification** (is this part/fact confirmed for the 2026 CMX500A?) and **3D geometry accuracy**
> (how faithful is the mesh?). A part can be OEM-verified while its mesh is only representative.
> The current 3D model is **representative geometry, not dimensional OEM CAD.**

A **bike selector** (top left) switches between the standard model and the **2026 Rebel 500 ABS SE (CMX500A2)**. The SE adds Honda's factory SE equipment (color-matched headlight cowl, black fork boots, brown diamond-stitch seat) plus a passenger seat. See *Model variants* below.

Not this app's target: Rebel 300, Rebel 1100, or earlier Rebel 500 model years.

## Current capabilities

- **3D viewer.** Orbit, zoom, pan, reset; Front/Left/Right/Rear/Top/3D views; double-click to smoothly focus on a part. Camera limits keep the bike in reach.
- **Exploded view.** A 0–100% slider for the whole bike, with CAD-style vectors: the front end moves forward, the tank up, the seat rearward, the exhaust out to the right, the engine down, and so on. Any assembly can also get its own **local explode** (e.g. Engine → Explode).
- **Selection.** Hover highlights, click selects (click again to step up to the parent assembly), and the tree and the 3D view stay in sync.
- **Assembly tree.** A collapsible CAD-style hierarchy (138 entries) with show/hide toggles and per-entry verification dots.
- **Search.** Matches names, keywords, OEM diagram names and part numbers (e.g. `clutch`, `oil filter`, `engine hanger`, `41201`).
- **Display modes.** Whole Bike · Exploded · Systems (color by system) · X-Ray (body panels see-through) · Isolate. There is also an optional **section cut** plane.
- **Isolate / Hide / Show only this system / Reset visibility.**
- **Part panel.** Function in plain English, specifications with per-fact sources, OEM diagram name, Honda part number (only when sourced), torque status, verification and geometry badges, and links to the OEM fiche.
- **Educational mode.** Beginner explanations (power path, clutch, cooling, fuel injection, brakes/ABS, four-stroke cycle, suspension, steering geometry, charging). A "Show path" button animates the flow through the 3D parts.
- **Sources dialog.** Provenance for everything; see also [docs/SOURCES.md](docs/SOURCES.md).
- Tablet-friendly: on narrow screens the side panels become drawers. WebGL failures fall back gracefully, and three.js is code-split.

## Model variants

- Variants are defined in `src/data/variants.ts`. A part node's optional `variants: ["cmx500a2"]` limits it to the listed bikes; nodes without the field are shared.
- SE-only records live in `src/data/assemblies/se-equipment.json` (`model: "CMX500A2"`). The standard solo seat is `variants: ["cmx500a"]`.
- `PARTS_BY_VARIANT` holds one index per bike. `PARTS` is a live binding to the selected one, and the viewer renders only geometry owned by it.
- Shared components were researched for the standard CMX500A. On the SE, the part panel says so, and flags CMX500A part numbers as not verified for the CMX500A2.
- The SE passenger seat comes from an owner-supplied SEAT diagram and is marked *unverified*: Honda's 2026 features release doesn't mention it.

## Getting started

Requires Node.js 22.12+ (Node 24 LTS recommended).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build to dist/
npm run preview    # serve the production build
npm test           # data-integrity, explode and search tests (vitest)
npm run lint       # eslint
```

## Project structure

```text
src/
  types/            Data model: MotorcyclePart, Verification, GeometryAccuracy, Source, configuration types
  data/
    motorcycle.ts   Root + top-level systems, loader, indexes, validation rules
    assemblies/     One JSON file per assembly (engine, clutch, transmission, cooling, …)
    sources.ts      Research provenance (every sourceId must exist here)
    education.ts    Beginner explanations + flow paths
    configurations.ts  OEM / custom configuration scaffold (mount points, modifications)
  viewer/
    Viewer.tsx      Canvas, lighting, ground, section plane
    BikeModel.tsx   Renders every geometry entry
    PartNode.tsx    Per-part wrapper: events, highlight/ghost/x-ray materials, explode animation, GLB loading
    CameraRig.tsx   Orbit controls, view presets, focus animation, limits
    geometryLayout.ts   Geometry ids + explode vectors (no React)
    geometryRegistry.ts Geometry id → representative component or GLB override
    layout.ts       Key coordinates (Honda-published dimensions marked [Honda 2026])
    parts/          Representative primitive components
  components/       UI: Header, AssemblyTree, PartInfo, ExplodeBar, ViewerOverlay, SourcesDialog, Badges
  state/store.ts    Zustand store (selection, explode, visibility, modes, camera requests)
  utils/            explode math, search, WebGL detection
docs/
  ARCHITECTURE.md
  SOURCES.md
```

More detail: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Source-verification philosophy

| Status | Meaning |
| --- | --- |
| ✓ **2026 OEM verified** | Confirmed by a Honda-published source specific to the 2026 Rebel 500, **read directly** (Honda's 2026 spec sheet and features release). |
| ◐ **Cross-referenced** | Appears in a 2026 Rebel 500 OEM parts catalog, but the catalog site blocked automated access, so it was read via a search index; or it appears only in the sibling 2026 SE catalog index (used for **diagram names only**, never part numbers). Confirm on the linked fiche. |
| ? **Unverified** | *Not yet verified for 2026 CMX500A.* The text is a generic engineering explanation, not Honda data. |

Rules the code enforces (`validateParts()` plus `src/data/data.test.ts`):

- A Honda part number must carry a source and can never be "unverified" (unsourced numbers are deleted, not flagged).
- "2026 OEM verified" is only allowed for sources marked `access: 'direct'`.
- No torque value can exist without `verified: true`, a source and `verifiedModel: "2026 CMX500A"`.
- SE-catalog sources can never back a part number.
- Every geometry id maps to exactly one data node.

**No torque specifications are included.** None could be verified from an authorized 2026 source.
The UI says "Not yet verified. Consult the Honda service manual (61MLH00)." Service manual
**61MLH00** ("2023-2026 Rebel 500 Service Manual", Helm Inc.) is a paid, copyrighted publication.
It was not accessed, and nothing from it is reproduced here.

## Limitations of the representative geometry

- Every mesh is a simple primitive stand-in. A few proportions are derived from Honda-published 2026 figures: wheelbase, tire sizes (→ outside diameter), rake/trail, 41 mm fork tubes 9.1 in apart, 296/240 mm discs, 15T/40T #520 sprockets, seat height and overall width. These parts are labelled ◇ *Approximate*. Everything else is △ *Representative*.
- The **positions** of components such as the radiator, exhaust routing, side covers and brake caliper sides are plausible stand-ins, not measurements.
- **Internal parts** (crankshaft, clutch pack, transmission, valves, water pump, ABS modulator, battery, ECU …) have **no geometry on purpose**. Their placement isn't verified, so they appear as data-only tree entries ("data"). Selecting one highlights its containing assembly for context.
- The meshes are not suitable for measurement, fitment or fabrication.

## Replacing a representative part with an accurate GLB

1. Export the part in **bike coordinates**: meters, +X forward, +Y up, +Z to the rider's right, ground at Y = 0, wheelbase centered on X = 0 (front axle ≈ +0.745 m, rear ≈ −0.746 m). Otherwise use the transform fields below.
2. Prefer compressed GLB (Draco or Meshopt; `useGLTF` supports both). Only commit models whose license permits redistribution.
3. Put the file in `public/models/` and add an override in `src/viewer/geometryRegistry.ts`:

   ```ts
   export const GLB_OVERRIDES: Record<string, GlbOverride> = {
     'geo-front-rim': { url: '/models/front-rim.glb', position: [0.7455, 0.3227, 0] },
   };
   ```

   `node` picks a named node out of a multi-part GLB, so one file can feed several geometry ids.
4. Update the owning data node's `geometryAccuracy` (e.g. `"dimensionally-verified"`) in its assembly JSON.

Selection, highlighting, ghosting, X-ray, explode, focus and search work unchanged. The representative mesh is shown while the GLB loads.

To add **new** geometry for something that has none yet (e.g. a clutch basket), add an id to
`geometryLayout.ts` with an explode vector, register a component or GLB in `geometryRegistry.ts`,
and add the id to the data node's `geometryIds`. The tests fail if any geometry id is unowned.

## Adding another assembly

1. Create `src/data/assemblies/<name>.json`:

   ```json
   { "assembly": "<name>", "model": "CMX500A", "modelYear": 2026, "parts": [ … ] }
   ```

2. Import it in `src/data/motorcycle.ts` and add it to `ASSEMBLY_FILES`.
3. Give each part a `parentId` (a system or another part), `verification`, `sourceId` (unless unverified) and `geometryAccuracy`.
4. Run `npm test`. The validators catch unknown parents and sources, malformed part numbers and unsourced claims.

## Adding OEM metadata

Only record what you have **verified against a 2026 CMX500A source**:

1. Add or extend the source in `src/data/sources.ts` (URL, publisher, `access`, `appliesTo`, access date, licensing).
2. On the part, set `oem`:

   ```json
   "oem": {
     "ficheName": "REAR WHEEL",
     "oemName": "SPROCKET, FINAL DRIVEN (40T)",
     "partNumber": "41201-MKG-A00",
     "ficheUrl": "https://…/2026-honda-rebel-500-abs/rear-wheel",
     "verification": "cross-referenced",
     "sourceId": "revzilla-2026-abs-rear-wheel"
   }
   ```

3. If you read a 2026 CMX500A fiche **directly**, record that source with `access: "direct"`. The part number can then be `2026-oem-verified`.
4. For torque: `"service": { "torqueNm": …, "torqueFtLb": …, "verified": true, "sourceId": "…", "verifiedModel": "2026 CMX500A" }`. Never infer torque values.
5. Link to OEM diagrams rather than copying them into the repo.

## Adding aftermarket modifications

The scaffold is in `src/types/configuration.ts` and `src/data/configurations.ts`:

- **MountPoint**: a named attachment location on an OEM part (`partId`, position/rotation in bike coordinates, with its own accuracy and verification).
- **Modification**: an accessory (engine guard, slip-on exhaust, passenger seat or pegs, phone mount, camera, sliders …) with `mountPointIds`, an optional `glbUrl` and `replacesPartIds` (e.g. a slip-on replaces `muffler`).
- **BikeConfiguration**: "OEM (stock)" plus any custom set of modification ids. The header's Config selector lists them.

Rendering mods is the next step: a `ModificationNode` that loads the GLB at its mount point(s) and hides `replacesPartIds`.

## Highest-priority next steps for accuracy

1. **Read the 2026 CMX500A fiches directly** (Partzilla / RevZilla / a Honda dealer), promote the cross-referenced items to verified, and add part numbers diagram by diagram.
2. **Buy service manual 61MLH00** and record torque specs, fluid capacities and service limits, citing page numbers and keeping the copyrighted text out of the repo.
3. **Photogrammetry or measurement of a real 2026 CMX500A.** Start with the frame, tank, engine cases and wheels, and replace those parts with GLBs.
4. Verify the locations of the battery, ABS modulator, ECU, starter and air cleaner, then give them geometry.
5. Add internal geometry for the clutch and transmission once part breakdowns are verified.
