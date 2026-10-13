# Architecture

## Principles

1. **Data and geometry are separate layers.** Part knowledge lives in `src/data`; meshes live in
   `src/viewer`. They are joined only by **geometry ids** (`geometryIds` on a data node ↔ an entry in
   `geometryLayout.ts` / `geometryRegistry.ts`).
2. **Verification is per-claim.** A node has a `verification` status for its identity and description.
   Each `SpecFact` and the `oem` block carry their own status and source. Geometry accuracy is a
   separate field. The UI never merges the two.
3. **No invented placement.** Parts whose location isn't verified get no geometry (`geometryAccuracy: "none"`).
4. **Swappable meshes.** Any representative component can be replaced by a GLB without touching
   application logic.

## Data layer (`src/data`)

```text
motorcycle.ts ──imports──> assemblies/*.json (one file per assembly)
      │                      { assembly, model: "CMX500A", modelYear: 2026, parts: [...] }
      ├─ ROOT_AND_SYSTEMS (root + 11 top-level systems)
      ├─ buildIndex(): nodes, children, ancestors, systemId, geometryOwner, subtreeGeometry
      └─ validateParts(): accuracy rules (run in tests + logged in dev)
sources.ts        provenance registry
education.ts      beginner topics + flow paths (node ids)
configurations.ts mount points / modifications / configurations (extensibility)
```

The tree follows the 2026 Rebel 500 OEM catalog organization where it is known. For example, the
swingarm, side stand and steering stem sit under Chassis, matching Honda's FRAME group, and the
starter motor and generator sit under Electrical. Cross-links between systems use `relatedParts`.

## Viewer layer (`src/viewer`)

```text
Viewer (Canvas, lights, env, ground, SectionPlane, FlowTicker)
 ├─ BikeModel ── PartNode × N (one per geometry id)
 │                ├─ representative component (parts/*.tsx) or GLB (GLB_OVERRIDES)
 │                ├─ pointer events → store (hover / select / drill-up / focus)
 │                ├─ applyDisplay(): clones materials once, then sets highlight, ghost, x-ray, system color
 │                └─ useFrame: damped move toward global + local explode offset
 └─ CameraRig (OrbitControls + view presets + focus animation + target clamping)
```

- **Coordinates:** meters; +X forward, +Y up, +Z rider's right; ground Y = 0.
- **Whole-bike explode:** each geometry entry's authored `explode` vector × slider amount.
- **Local explode:** parts inside the chosen assembly move radially from that assembly's rest
  centroid, blended 70/30 with their authored direction (`utils/explode.ts`). Rest bounds are measured
  once per part (`sceneRegistry.ts`) and kept outside React state.
- **Performance:** about 60 part groups with simple primitives; geometries are memoized, base
  materials are shared until a part needs highlighting, three.js is code-split behind `React.lazy`,
  and per-frame reads use `useViewer.getState()` to avoid re-renders. Each `PartNode` subscribes to a
  shallow-compared display tuple, so only affected parts re-render on hover or selection.

## State (`src/state/store.ts`)

A single Zustand store holds selection, hover, explode (global and local), hidden nodes, isolation
(`ghost` = semi-transparent others, `hide` = show only), color mode, X-ray, section plane, the
education flow, camera requests (nonce-based) and drawer state.

## Extending

See README sections: *Replacing a representative part with an accurate GLB*, *Adding another
assembly*, *Adding OEM metadata*, *Adding aftermarket modifications*.
