import { useEffect, useRef, useState } from 'react';
import { VARIANTS, VARIANT_IDS } from '../data/variants';
import { useViewer } from '../state/store';

/**
 * Bike model dropdown (custom menu rather than a native <select>, so it opens reliably on top
 * of the WebGL canvas in every browser and is styled consistently).
 */
export function BikeSelect() {
  const variant = useViewer((s) => s.variant);
  const setVariant = useViewer((s) => s.setVariant);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = VARIANTS[variant];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="bike-select" ref={rootRef}>
      <button
        type="button"
        className="bike-select-button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Motorcycle: ${current.label}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{current.label}</span>
        <span className="bike-select-code">{current.model}</span>
        <span aria-hidden className="bike-select-caret">
          ▾
        </span>
      </button>
      {open && (
        <ul className="bike-select-menu" role="listbox" aria-label="Select motorcycle">
          {VARIANT_IDS.map((id) => {
            const v = VARIANTS[id];
            const selected = id === variant;
            return (
              <li key={id} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={selected ? 'selected' : ''}
                  onClick={() => {
                    setVariant(id);
                    setOpen(false);
                  }}
                >
                  <span className="opt-label">{v.label}</span>
                  <span className="opt-meta">
                    {v.model} · {v.trim}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
