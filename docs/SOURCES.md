# Sources & research provenance

All research was done on **2026-10-13**. The machine-readable version of this file is
[`src/data/sources.ts`](../src/data/sources.ts); every `sourceId` in the data must exist there.

Target: **2026 Honda Rebel 500 ABS, U.S. standard (non-SE) model, CMX500A.**

## How sources were accessed

Several authoritative sites (powersports.honda.com, Honda's PDF CDN, Partzilla, RevZilla, Ronayers,
Babbitts, Honda Partshouse, CMSNL) returned **HTTP 403 bot-protection pages** to automated requests.
No attempt was made to get around that protection. Where a page could only be read through a
web-search index of that exact URL, the source is marked `access: "search-index"`, and anything
taken from it is at most **cross-referenced**, never "2026 OEM verified".

Search-index reads proved unreliable for part numbers. For example, they returned two different
2026 rear-wheel part numbers, and a "taillight" number that actually belongs to the Rebel 300. So a
part number was recorded **only** when (a) the index tied it to a 2026 Rebel 500 ABS (CMX500AAC)
diagram and (b) a second, independent query corroborated it.

## Source list

| Source | Type | Access | Applies to | Used for | Licensing |
| --- | --- | --- | --- | --- | --- |
| [Honda News — 2026 Honda Rebel 500 Specifications](https://hondanews.com/en-US/powersports/releases/release-34d7fa1af550cdceef36ed1dbd079060-2026-honda-rebel-500-specifications) | OEM official | direct | 2026 Rebel 500 & SE (U.S.) | Engine, bore/stroke, compression, DOHC 4-valve, PGM-FI 34 mm throttle bodies, ignition, starter, 6-speed, multiplate wet clutch, #520 chain 15T/40T, 41 mm fork 5.5 in, dual shocks 3.7 in, 296/240 mm discs + ABS, tires, rake/trail, dimensions, 3.0 gal | Factual values only |
| [Honda News — 2026 Honda Rebel 500 Features & Benefits](https://hondanews.com/en-US/powersports/releases/release-34d7fa1af550cdceef36ed1dbd07de81-2026-honda-rebel-500-features-benefits) | OEM official | direct | 2026 Rebel 500 & SE (U.S.) | Assist/slipper clutch; tubular-steel frame holding the engine in three places; peanut tank; fork spacing 9.1 in; two-step preload; 16 in cast wheels; Dunlop tires; LED lighting; LCD meter with gear indicator; tapered bar; mid pegs; **SE-only items** (brown diamond-stitch seat, black fork boots, headlight cowl) | Short attributed quotes only |
| [Helm Inc. — 61MLH00 "2023-2026 Rebel 500 Service Manual"](https://www.helminc.com/helm/product2.asp?class_2=AHC&Sku=61MLH00&itemtype=N) | OEM official (publication listing) | metadata only | 2023, 2024, 2025, 2026 Rebel 500 | Identifies the authoritative service reference ($50). **The manual itself was not accessed.** No torque values or procedures come from it. | Copyrighted, paid; nothing copied |
| [RevZilla OEM — 2026 Rebel 500 ABS (catalog index)](https://www.revzilla.com/oem/honda/2026-honda-rebel-500-abs) | OEM catalog (retailer) | search index | 2026 Rebel 500 ABS, fitment "CMX500AAC" | Entry point for fiche links | Linked only |
| [RevZilla OEM — 2026 Rebel 500 ABS HEADLIGHT (F820408)](https://www.revzilla.com/oem/honda/2026-honda-rebel-500-abs/headlight) | OEM catalog | search index | CMX500AAC | Headlight assy. **33100-K87-A31** (KOITO), corroborated | Linked only |
| [RevZilla OEM — 2026 Rebel 500 ABS BATTERY (F820450)](https://www.revzilla.com/oem/honda/2026-honda-rebel-500-abs/battery) | OEM catalog | search index | CMX500AAC | Battery **31500-K36-A01** (GTZ8V; supersedes 31500-KZZ-J11), corroborated | Linked only |
| [RevZilla OEM — 2026 Rebel 500 ABS REAR WHEEL](https://www.revzilla.com/oem/honda/2026-honda-rebel-500-abs/rear-wheel) | OEM catalog | search index | CMX500AAC | Final driven sprocket **41201-MKG-A00** (40T, matches Honda spec) | Linked only |
| [RevZilla OEM — 2026 Rebel 500 ABS MUFFLER (illustration MLHAF2700)](https://www.revzilla.com/oem/honda/2026-honda-rebel-500-abs/muffler?submodel=cmx500aac) | OEM catalog | **user-supplied screenshot** of the diagram (page itself returns 403; parts list not available) | CMX500AAC, confirmed 2026 by the user | Exhaust layout and breakdown: headers into an under-engine chamber (#1), gaskets (#3), muffler (#5), side cover (#7), clamp/gasket (#8, #9), wired sensor (#14), mounting hardware. Names are descriptive; **no part numbers** | Diagram examined only; not copied |
| Honda OEM SEAT diagram (owner-supplied screenshot; page not identified) | OEM catalog | **user-supplied screenshot** | 2026 Rebel 500 per the owner | Teardrop rider seat (#2) with mounting/cushion hardware (#1, #3–#6, #11, #12); passenger seat (#8, #7, #9, #10). The owner directed: passenger seat on the SE only. **No part numbers** | Diagram examined only; not copied |
| [RevZilla OEM — 2026 Rebel 500 ABS SE (category index)](https://www.revzilla.com/oem/honda/2026-honda-rebel-500-abs-se) | OEM catalog | search index | **SE (CMX500A2AC), not the target** | Names of 2026 diagram categories only (CYLINDER HEAD, STARTING CLUTCH, THERMOSTAT, HEADLIGHT COWL, …). **No SE part numbers are used.** | Linked only |
| [Partzilla — Honda Motorcycle 2026 index](https://www.partzilla.com/catalog/honda/motorcycle/2026) | OEM catalog (retailer) | search index | Lists "CMX500A REBEL 500" and "CMX500A2 REBEL 500 SE" separately | Confirms separate standard/SE catalogs | Linked only |
| [Honda News — 2026 cruiser new-model announcement](https://hondanews.com/en-US/releases/release-34d7fa1af550cdceef36ed1dbd06edba-rebel-300-e-clutch-headlines-2026-honda-cruiser-new-model-announcement) | OEM official | search index | 2026 cruiser line-up | Context: Rebel 500 returns for 2026; E-Clutch is a Rebel 300 feature | Linked only |
| [3D CAD Browser — "Honda Rebel 500 (2018)"](https://www.3dcadbrowser.com/3d-model/honda-rebel-500-2018) | Evaluated, **not used** | search index | 2018 (pre-2020 update) | Rejected: wrong model year, a single visual shell rather than mechanical geometry, paid/upload-gated | Not downloaded |

## 3D model search

Sketchfab, GrabCAD, CGTrader, TurboSquid and the wider web were searched for a modern Rebel 500
model. No legally usable 2026-accurate model was found. The only candidate (3D CAD Browser, 2018)
is the wrong generation, a visual shell, and access-gated. The app therefore uses
**representative modular geometry** built from primitives, with a few proportions derived from
Honda-published 2026 dimensions (see `src/viewer/layout.ts`, items tagged `[Honda 2026]`).

## Known open questions

- Which of Honda's two listed curb weights (414 lb / 419 lb) belongs to the standard model vs the SE: the retrieved text didn't label them.
- The meaning of the trailing type code in RevZilla's "CMX500AAC" fitment label (49-state vs California).
- Every 2026 CMX500A part number beyond the three recorded, plus all torque values, fluid capacities and service limits.
