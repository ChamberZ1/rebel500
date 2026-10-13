import { useEffect } from 'react';
import { SOURCES } from '../data/sources';
import { useViewer } from '../state/store';

const AUTHORITY: Record<string, string> = {
  'oem-official': 'Honda official',
  'oem-catalog': 'OEM parts catalog (retailer)',
  secondary: 'Secondary',
  'evaluated-not-used': 'Evaluated — not used',
};

export function SourcesDialog() {
  const open = useViewer((s) => s.panels.sources);
  const setPanel = useViewer((s) => s.setPanel);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPanel('sources', false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setPanel]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={() => setPanel('sources', false)}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Sources and verification" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>Sources &amp; verification</h2>
          <button className="icon" onClick={() => setPanel('sources', false)} aria-label="Close">
            ×
          </button>
        </div>
        <p>
          Accuracy matters more than completeness here. Each entry records where its data came from. <strong>✓ 2026 OEM verified</strong> means a Honda-published
          2026 source was read directly. <strong>◐ Cross-referenced</strong> means the item appears in a 2026 Rebel 500 OEM catalog that could only be read
          indirectly (the site blocked automated access), or in the sibling SE catalog. <strong>? Unverified</strong> means not yet verified for 2026 CMX500A.
          3D geometry status is tracked separately. No torque values are shown: none could be verified from an authorized 2026 source.
        </p>
        <table className="sources">
          <thead>
            <tr>
              <th>Source</th>
              <th>Type</th>
              <th>Applies to</th>
              <th>Used for</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(SOURCES).map((s) => (
              <tr key={s.id}>
                <td>
                  <a href={s.url} target="_blank" rel="noreferrer">
                    {s.name}
                  </a>
                  <div className="muted">
                    {s.publisher} · {s.access} · {s.accessed}
                  </div>
                </td>
                <td>{AUTHORITY[s.authority]}</td>
                <td>{s.appliesTo}</td>
                <td>
                  {s.usedFor}
                  {s.caveat && <div className="note">{s.caveat}</div>}
                  <div className="muted">{s.licensing}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
