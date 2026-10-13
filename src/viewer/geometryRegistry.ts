/**
 * Geometry registry: binds each geometry id (see geometryLayout.ts) to something renderable.
 *
 * The DATA layer (src/data) references geometry ids via `geometryIds`; the viewer never hard-codes
 * part knowledge. To replace a representative part with an accurate mesh, add an entry to
 * GLB_OVERRIDES — selection, highlighting, explode, isolate and search keep working unchanged.
 * Remember to update the owning data node's `geometryAccuracy`.
 */
import type { ComponentType } from 'react';
import type { Vec3 } from '../types/configuration';
import { GEOMETRY_LAYOUT, type GeometryLayout } from './geometryLayout';
import * as B from './parts/bodyParts';
import * as C from './parts/chassisParts';
import * as E from './parts/engineParts';
import * as SE from './parts/seParts';

export { GEOMETRY_IDS } from './geometryLayout';

export interface GlbOverride {
  /** URL served from /public, e.g. '/models/front-wheel.glb'. */
  url: string;
  /** Name of a node inside the GLB to render (defaults to the whole scene). */
  node?: string;
  /** Transform so the GLB lands in bike coordinates (meters, +X fwd, +Y up, +Z right). */
  position?: Vec3;
  rotation?: Vec3;
  scale?: number | Vec3;
}

export interface GeometryEntry extends GeometryLayout {
  /** Representative primitive component (bike coordinates). Used as fallback while a GLB loads. */
  component: ComponentType;
  glb?: GlbOverride;
}

/** Representative stand-in components. */
const COMPONENTS: Record<string, ComponentType> = {
  'geo-crankcase': E.Crankcase,
  'geo-oil-pan': E.OilPan,
  'geo-cylinder-block': E.CylinderBlock,
  'geo-cylinder-head': E.CylinderHead,
  'geo-head-cover': E.HeadCover,
  'geo-alternator-cover': E.AlternatorCover,
  'geo-right-crankcase-cover': E.RightCrankcaseCover,
  'geo-throttle-bodies': E.ThrottleBodies,
  'geo-fuel-tank': B.FuelTank,
  'geo-radiator': E.Radiator,
  'geo-coolant-hoses': E.CoolantHoses,
  'geo-exhaust-headers': E.ExhaustHeaders,
  'geo-muffler': E.Muffler,
  'geo-muffler-cover': E.MufflerCover,
  'geo-exhaust-sensor': E.ExhaustSensor,
  'geo-frame': C.Frame,
  'geo-side-stand': C.SideStand,
  'geo-swingarm': C.Swingarm,
  'geo-steering-stem': C.SteeringStem,
  'geo-top-bridge': C.TopBridge,
  'geo-fork-tubes': C.ForkTubes,
  'geo-fork-sliders': C.ForkSliders,
  'geo-shock-left': C.ShockLeft,
  'geo-shock-right': C.ShockRight,
  'geo-front-rim': C.FrontRim,
  'geo-front-tire': C.FrontTire,
  'geo-front-axle': C.FrontAxle,
  'geo-rear-rim': C.RearRim,
  'geo-rear-tire': C.RearTire,
  'geo-rear-axle': C.RearAxle,
  'geo-drive-sprocket': C.DriveSprocket,
  'geo-drive-chain': C.DriveChain,
  'geo-driven-sprocket': C.DrivenSprocket,
  'geo-front-disc': C.FrontDisc,
  'geo-front-caliper': C.FrontCaliper,
  'geo-front-brake-hose': C.FrontBrakeHose,
  'geo-front-master-cylinder': B.FrontMasterCylinder,
  'geo-rear-disc': C.RearDisc,
  'geo-rear-caliper': C.RearCaliper,
  'geo-rear-brake-hose': C.RearBrakeHose,
  'geo-rear-master-cylinder': B.RearMasterCylinder,
  'geo-headlight': B.Headlight,
  'geo-meter': B.Meter,
  'geo-front-turn-signals': B.FrontTurnSignals,
  'geo-rear-turn-signals': B.RearTurnSignals,
  'geo-taillight': B.Taillight,
  'geo-handlebar': B.Handlebar,
  'geo-throttle-grip': B.ThrottleGrip,
  'geo-left-grip': B.LeftGrip,
  'geo-front-brake-lever': B.FrontBrakeLever,
  'geo-clutch-lever': B.ClutchLever,
  'geo-mirror-left': B.MirrorLeft,
  'geo-mirror-right': B.MirrorRight,
  'geo-footpeg-left': B.FootpegLeft,
  'geo-footpeg-right': B.FootpegRight,
  'geo-shift-lever': B.ShiftLever,
  'geo-rear-brake-pedal': B.RearBrakePedal,
  'geo-seat': B.Seat,
  'geo-front-fender': B.FrontFender,
  'geo-rear-fender': B.RearFender,
  'geo-side-cover-left': B.SideCoverLeft,
  'geo-side-cover-right': B.SideCoverRight,
  'geo-license-bracket': B.LicenseBracket,
  'geo-seat-se': SE.SeatSE,
  'geo-passenger-seat': SE.PassengerSeat,
  'geo-headlight-cowl': SE.HeadlightCowl,
  'geo-fork-boots': SE.ForkBoots,
};

/**
 * Drop-in accurate meshes. Example:
 *   'geo-front-rim': { url: '/models/front-rim.glb', position: [0.7455, 0.3227, 0] },
 */
export const GLB_OVERRIDES: Record<string, GlbOverride> = {};

export const GEOMETRY: Map<string, GeometryEntry> = new Map(
  GEOMETRY_LAYOUT.map((g) => {
    const component = COMPONENTS[g.id];
    if (!component) throw new Error(`No representative component registered for "${g.id}"`);
    return [g.id, { ...g, component, glb: GLB_OVERRIDES[g.id] }];
  }),
);
