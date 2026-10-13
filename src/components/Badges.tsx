import type { GeometryAccuracy, Verification } from '../types/motorcycle';

const VERIFICATION: Record<Verification, { icon: string; label: string; title: string; cls: string }> = {
  '2026-oem-verified': {
    icon: '✓',
    label: '2026 OEM verified',
    title: 'Confirmed by a Honda-published source specific to the 2026 Rebel 500, read directly.',
    cls: 'ok',
  },
  'cross-referenced': {
    icon: '◐',
    label: 'Cross-referenced',
    title: 'Appears in a 2026 Rebel 500 OEM catalog listing read indirectly, or a sibling 2026 catalog. Confirm on the linked fiche.',
    cls: 'xref',
  },
  unverified: {
    icon: '?',
    label: 'Unverified',
    title: 'Not yet verified for 2026 CMX500A. Text is a generic explanation, not Honda data.',
    cls: 'unv',
  },
};

const GEOMETRY: Record<GeometryAccuracy, { icon: string; label: string; title: string; cls: string }> = {
  representative: {
    icon: '△',
    label: 'Representative geometry',
    title: 'Simple stand-in shape for interaction only — not dimensional OEM CAD.',
    cls: 'geo-rep',
  },
  approximate: {
    icon: '◇',
    label: 'Approximate geometry',
    title: 'Primitive shape sized from Honda-published 2026 dimensions (e.g. tire size, disc diameter). Not CAD.',
    cls: 'geo-approx',
  },
  'dimensionally-verified': {
    icon: '✓',
    label: 'Dimensionally verified',
    title: 'Mesh derived from measured or CAD data.',
    cls: 'ok',
  },
  none: {
    icon: '○',
    label: 'No 3D geometry',
    title: 'Data-only entry: no 3D model exists yet (e.g. internal parts). Nothing is drawn rather than inventing placement.',
    cls: 'geo-none',
  },
};

export function VerificationBadge({ value, compact }: { value: Verification; compact?: boolean }) {
  const v = VERIFICATION[value];
  return (
    <span className={`badge ${v.cls}`} title={v.title}>
      <span aria-hidden>{v.icon}</span>
      {!compact && <span>{v.label}</span>}
      {compact && <span className="sr-only">{v.label}</span>}
    </span>
  );
}

export function GeometryBadge({ value }: { value: GeometryAccuracy }) {
  const g = GEOMETRY[value];
  return (
    <span className={`badge ${g.cls}`} title={g.title}>
      <span aria-hidden>{g.icon}</span>
      <span>{g.label}</span>
    </span>
  );
}

export function verificationDot(value: Verification) {
  return VERIFICATION[value].cls;
}
