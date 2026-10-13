import { CONFIGURATIONS } from '../data/configurations';
import { getPart } from '../data/motorcycle';
import { useViewer } from '../state/store';
import { BikeSelect } from './BikeSelect';

export function Header() {
  const explode = useViewer((s) => s.explode);
  const colorMode = useViewer((s) => s.colorMode);
  const xray = useViewer((s) => s.xray);
  const isolation = useViewer((s) => s.isolation);
  const selectedId = useViewer((s) => s.selectedId);
  const local = useViewer((s) => s.local);
  const panels = useViewer((s) => s.panels);
  const a = useViewer.getState();

  const whole = explode === 0 && !local && !isolation && colorMode === 'realistic' && !xray;
  const canIsolate = !!selectedId && getPart(selectedId)?.kind !== 'root';

  return (
    <header className="header">
      <button className="drawer-toggle" onClick={() => a.setPanel('left', !panels.left)} aria-label="Toggle assembly tree">
        ☰
      </button>
      <div className="brand">
        <span className="brand-name">REBEL 500 EXPLORER</span>
        <BikeSelect />
      </div>
      <nav className="modes" aria-label="Display mode">
        <button
          className={whole ? 'active' : ''}
          onClick={() => {
            a.setExplode(0);
            a.setLocalExplode(null);
            a.clearIsolation();
            a.setColorMode('realistic');
            a.setXray(false);
            a.stopFlow();
          }}
        >
          Whole Bike
        </button>
        <button
          className={explode > 0 ? 'active' : ''}
          onClick={() => {
            a.setExplode(explode > 0 ? 0 : 1);
            a.requestView('iso');
          }}
        >
          Exploded
        </button>
        <button className={colorMode === 'systems' ? 'active' : ''} onClick={() => a.setColorMode(colorMode === 'systems' ? 'realistic' : 'systems')}>
          Systems
        </button>
        <button className={xray ? 'active' : ''} onClick={() => a.setXray(!xray)}>
          X-Ray
        </button>
        <button
          className={isolation ? 'active' : ''}
          disabled={!isolation && !canIsolate}
          title={canIsolate ? 'Isolate the selected assembly' : 'Select a part or assembly first'}
          onClick={() => (isolation ? a.clearIsolation() : selectedId && a.isolate(selectedId, 'ghost'))}
        >
          Isolate
        </button>
      </nav>
      <div className="header-right">
        <label className="config" title="Owner modifications are planned; only the OEM configuration exists today.">
          <span>Config</span>
          <select defaultValue="oem" disabled={CONFIGURATIONS.length < 2}>
            {CONFIGURATIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <button onClick={() => a.setPanel('sources', true)}>Sources</button>
        <button onClick={a.resetAll} title="Reset camera, explode, visibility and selection">
          Reset
        </button>
        <button className="drawer-toggle" onClick={() => a.setPanel('right', !panels.right)} aria-label="Toggle part info">
          ⓘ
        </button>
      </div>
    </header>
  );
}
