import { create } from 'zustand';
import { PARTS, getLineage, nearestGeometricAncestor, setActiveVariant } from '../data/motorcycle';
import { DEFAULT_VARIANT } from '../data/variants';
import type { VariantId } from '../types/motorcycle';

export type ViewName = 'iso' | 'front' | 'rear' | 'left' | 'right' | 'top';
export type ColorMode = 'realistic' | 'systems';

export type CameraRequest =
  | { kind: 'view'; view: ViewName; nonce: number }
  | { kind: 'focus'; nodeId: string; nonce: number };

export interface ViewerState {
  /** Selected bike (standard CMX500A or SE CMX500A2). */
  variant: VariantId;
  selectedId: string | null;
  hoveredId: string | null;
  /** Whole-bike explode amount 0..1 (parts animate toward it). */
  explode: number;
  /** Local (per-assembly) explode, applied on top of the whole-bike explode. */
  local: { scopeId: string; amount: number } | null;
  hiddenNodes: string[];
  isolation: { nodeId: string; style: 'ghost' | 'hide' } | null;
  colorMode: ColorMode;
  xray: boolean;
  section: { enabled: boolean; offset: number };
  flow: { topicId: string; path: string[]; step: number } | null;
  cameraRequest: CameraRequest | null;
  expanded: Record<string, boolean>;
  panels: { left: boolean; right: boolean; sources: boolean };

  setVariant: (v: VariantId) => void;
  select: (id: string | null, opts?: { focus?: boolean }) => void;
  hover: (id: string | null) => void;
  setExplode: (v: number) => void;
  setLocalExplode: (scopeId: string | null, amount?: number) => void;
  hide: (id: string) => void;
  unhide: (id: string) => void;
  isolate: (id: string, style?: 'ghost' | 'hide') => void;
  clearIsolation: () => void;
  resetVisibility: () => void;
  setColorMode: (m: ColorMode) => void;
  setXray: (v: boolean) => void;
  setSection: (s: Partial<ViewerState['section']>) => void;
  startFlow: (topicId: string, path: string[]) => void;
  stepFlow: () => void;
  stopFlow: () => void;
  requestView: (view: ViewName) => void;
  requestFocus: (nodeId: string) => void;
  toggleExpanded: (id: string, value?: boolean) => void;
  revealInTree: (id: string) => void;
  setPanel: (p: keyof ViewerState['panels'], open: boolean) => void;
  resetAll: () => void;
}

let nonce = 0;

/** True when `id` is an ancestor of `descendant`. */
const isAncestorOf = (id: string, descendant: string) => (PARTS.ancestors.get(descendant) ?? []).includes(id);

const initialExpanded = (): Record<string, boolean> => ({ [PARTS.rootId]: true });

export const useViewer = create<ViewerState>((set, get) => ({
  variant: DEFAULT_VARIANT,
  selectedId: null,
  hoveredId: null,
  explode: 0,
  local: null,
  hiddenNodes: [],
  isolation: null,
  colorMode: 'realistic',
  xray: false,
  section: { enabled: false, offset: 0.05 },
  flow: null,
  cameraRequest: null,
  expanded: initialExpanded(),
  panels: { left: false, right: false, sources: false },

  setVariant: (variant) => {
    if (variant === get().variant) return;
    setActiveVariant(variant);
    set({
      variant,
      selectedId: null,
      hoveredId: null,
      hiddenNodes: [],
      isolation: null,
      local: null,
      flow: null,
    });
  },
  select: (id, opts) => {
    const iso = get().isolation;
    // Selecting something outside the isolated set brings everything back so it can be seen.
    if (id && iso && !(getLineage(id).some((n) => n.id === iso.nodeId) || isAncestorOf(id, iso.nodeId))) set({ isolation: null });
    set({ selectedId: id });
    if (id) {
      get().revealInTree(id);
      if (opts?.focus) get().requestFocus(id);
    }
  },
  hover: (id) => {
    if (get().hoveredId !== id) set({ hoveredId: id });
  },
  setExplode: (v) => set({ explode: Math.min(1, Math.max(0, v)) }),
  setLocalExplode: (scopeId, amount = 0) =>
    set({ local: scopeId ? { scopeId, amount: Math.min(1, Math.max(0, amount)) } : null }),
  hide: (id) => set((s) => ({ hiddenNodes: s.hiddenNodes.includes(id) ? s.hiddenNodes : [...s.hiddenNodes, id] })),
  unhide: (id) => set((s) => ({ hiddenNodes: s.hiddenNodes.filter((x) => x !== id) })),
  isolate: (id, style = 'ghost') => {
    const target = (PARTS.subtreeGeometry.get(id) ?? []).length ? id : nearestGeometricAncestor(id) ?? id;
    set({ isolation: { nodeId: target, style } });
  },
  clearIsolation: () => set({ isolation: null }),
  resetVisibility: () => set({ hiddenNodes: [], isolation: null, xray: false, section: { enabled: false, offset: 0.05 } }),
  setColorMode: (colorMode) => set({ colorMode }),
  setXray: (xray) => set({ xray }),
  setSection: (s) => set((st) => ({ section: { ...st.section, ...s } })),
  startFlow: (topicId, path) => set({ flow: { topicId, path, step: 0 } }),
  stepFlow: () =>
    set((s) => (s.flow ? { flow: { ...s.flow, step: (s.flow.step + 1) % Math.max(1, s.flow.path.length) } } : {})),
  stopFlow: () => set({ flow: null }),
  requestView: (view) => set({ cameraRequest: { kind: 'view', view, nonce: ++nonce } }),
  requestFocus: (nodeId) => set({ cameraRequest: { kind: 'focus', nodeId, nonce: ++nonce } }),
  toggleExpanded: (id, value) => set((s) => ({ expanded: { ...s.expanded, [id]: value ?? !s.expanded[id] } })),
  revealInTree: (id) =>
    set((s) => {
      const expanded = { ...s.expanded };
      for (const n of getLineage(id)) if (n.id !== id) expanded[n.id] = true;
      return { expanded };
    }),
  setPanel: (p, open) => set((s) => ({ panels: { ...s.panels, [p]: open } })),
  resetAll: () => {
    set({
      selectedId: null,
      hoveredId: null,
      explode: 0,
      local: null,
      hiddenNodes: [],
      isolation: null,
      colorMode: 'realistic',
      xray: false,
      section: { enabled: false, offset: 0.05 },
      flow: null,
      expanded: initialExpanded(),
    });
    get().requestView('iso');
  },
}));
