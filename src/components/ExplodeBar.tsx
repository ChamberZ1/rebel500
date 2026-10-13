import { getPart } from '../data/motorcycle';
import { useViewer } from '../state/store';

export function ExplodeBar() {
  const explode = useViewer((s) => s.explode);
  const local = useViewer((s) => s.local);
  const setExplode = useViewer((s) => s.setExplode);
  const setLocal = useViewer((s) => s.setLocalExplode);
  const scope = getPart(local?.scopeId);
  return (
    <footer className="explode-bar">
      <div className="slider-row">
        <span className="slider-label">Assembled</span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(explode * 100)}
          onChange={(e) => setExplode(Number(e.target.value) / 100)}
          aria-label="Exploded view amount, whole motorcycle"
        />
        <span className="slider-label">Exploded</span>
        <span className="slider-value">{Math.round(explode * 100)}%</span>
      </div>
      {local && scope && (
        <div className="slider-row local">
          <span className="slider-label scope" title={scope.name}>
            {scope.name}
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(local.amount * 100)}
            onChange={(e) => setLocal(local.scopeId, Number(e.target.value) / 100)}
            aria-label={`Exploded view amount, ${scope.name}`}
          />
          <span className="slider-value">{Math.round(local.amount * 100)}%</span>
          <button className="icon" onClick={() => setLocal(null)} aria-label="Clear assembly explode">
            ×
          </button>
        </div>
      )}
    </footer>
  );
}
