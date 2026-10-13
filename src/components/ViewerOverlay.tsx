import { getPart } from '../data/motorcycle';
import { useViewer, type ViewName } from '../state/store';
import { SYSTEM_COLORS } from '../viewer/systemColors';

const VIEWS: Array<[ViewName, string]> = [
  ['iso', '3D'],
  ['front', 'Front'],
  ['left', 'Left'],
  ['right', 'Right'],
  ['rear', 'Rear'],
  ['top', 'Top'],
];

export function ViewerOverlay() {
  const hovered = getPart(useViewer((s) => s.hoveredId));
  const colorMode = useViewer((s) => s.colorMode);
  const section = useViewer((s) => s.section);
  const isolation = useViewer((s) => s.isolation);
  const a = useViewer.getState();
  return (
    <>
      <div className="overlay top-left">
        <div className="disclaimer" title="Every mesh is a simple stand-in sized from published dimensions at most. Data verification is shown separately for each part.">
          △ Representative 3D geometry — not dimensional OEM CAD.
        </div>
        {isolation && (
          <div className="chip">
            {isolation.style === 'ghost' ? 'Isolated' : 'Showing only'}: {getPart(isolation.nodeId)?.name}
            <button className="icon" onClick={a.clearIsolation} aria-label="Clear isolation">
              ×
            </button>
          </div>
        )}
      </div>
      <div className="overlay top-right">
        <div className="view-buttons" role="group" aria-label="Camera views">
          {VIEWS.map(([v, label]) => (
            <button key={v} onClick={() => a.requestView(v)}>
              {label}
            </button>
          ))}
        </div>
        <div className="section-ctl">
          <label>
            <input type="checkbox" checked={section.enabled} onChange={(e) => a.setSection({ enabled: e.target.checked })} /> Section cut
          </label>
          {section.enabled && (
            <input
              type="range"
              min={-30}
              max={30}
              value={Math.round(section.offset * 100)}
              onChange={(e) => a.setSection({ offset: Number(e.target.value) / 100 })}
              aria-label="Section plane position"
            />
          )}
        </div>
      </div>
      {colorMode === 'systems' && (
        <div className="overlay bottom-right legend">
          {Object.entries(SYSTEM_COLORS).map(([id, color]) => (
            <button key={id} className="legend-item" onClick={() => a.select(id)}>
              <span className="swatch" style={{ background: color }} />
              {getPart(id)?.name}
            </button>
          ))}
        </div>
      )}
      <div className="overlay bottom-left hover-label" aria-live="polite">
        {hovered ? hovered.name : <span className="muted">Drag to orbit · scroll to zoom · right-drag to pan</span>}
      </div>
    </>
  );
}
