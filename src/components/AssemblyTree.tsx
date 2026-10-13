import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { PARTS, getChildren, getPart } from '../data/motorcycle';
import { useViewer } from '../state/store';
import { searchParts } from '../utils/search';
import { VerificationBadge, verificationDot } from './Badges';

const TreeRow = memo(function TreeRow({ id, depth }: { id: string; depth: number }) {
  const part = getPart(id)!;
  const children = PARTS.children.get(id) ?? [];
  const expanded = useViewer((s) => !!s.expanded[id]);
  const selected = useViewer((s) => s.selectedId === id);
  const hovered = useViewer((s) => s.hoveredId === id);
  const hidden = useViewer((s) => s.hiddenNodes.includes(id));
  const { select, toggleExpanded, hide, unhide, hover } = useViewer.getState();
  const hasGeo = (PARTS.subtreeGeometry.get(id)?.length ?? 0) > 0;
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selected) rowRef.current?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  return (
    <>
      <div
        ref={rowRef}
        role="treeitem"
        aria-selected={selected}
        aria-expanded={children.length ? expanded : undefined}
        className={`tree-row${selected ? ' selected' : ''}${hovered ? ' hovered' : ''}${hidden ? ' is-hidden' : ''}`}
        style={{ paddingLeft: 8 + depth * 14 }}
        onClick={() => select(id)}
        onDoubleClick={() => select(id, { focus: true })}
        onMouseEnter={() => hasGeo && hover(id)}
        onMouseLeave={() => useViewer.getState().hoveredId === id && hover(null)}
      >
        <button
          className="caret"
          aria-label={expanded ? 'Collapse' : 'Expand'}
          style={{ visibility: children.length ? 'visible' : 'hidden' }}
          onClick={(e) => {
            e.stopPropagation();
            toggleExpanded(id);
          }}
        >
          {expanded ? '▾' : '▸'}
        </button>
        <span className={`dot ${verificationDot(part.verification)}`} title={part.verification} />
        <span className={`tree-label kind-${part.kind}`}>{part.name}</span>
        {!hasGeo && <span className="tree-meta" title="Data only — no 3D geometry">data</span>}
        {hasGeo && part.kind !== 'root' && (
          <button
            className="eye"
            title={hidden ? 'Show' : 'Hide'}
            aria-label={hidden ? `Show ${part.name}` : `Hide ${part.name}`}
            onClick={(e) => {
              e.stopPropagation();
              if (hidden) unhide(id);
              else hide(id);
            }}
          >
            {hidden ? '◌' : '●'}
          </button>
        )}
      </div>
      {expanded && children.map((c) => <TreeRow key={c} id={c} depth={depth + 1} />)}
    </>
  );
});

export function AssemblyTree() {
  const [query, setQuery] = useState('');
  const select = useViewer((s) => s.select);
  const selectedId = useViewer((s) => s.selectedId);
  const hits = useMemo(() => searchParts(PARTS.nodes.values(), query), [query]);

  return (
    <div className="tree-panel">
      <div className="panel-head">
        <span className="panel-title">Assembly</span>
        <span className="panel-sub">{PARTS.nodes.size} entries</span>
      </div>
      <div className="search">
        <input
          type="search"
          placeholder="Search parts…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search parts"
        />
      </div>
      {query.trim() ? (
        <div className="search-results" role="listbox">
          {hits.length === 0 && <div className="empty">No matching entries. Try “clutch”, “radiator”, “engine hanger”.</div>}
          {hits.map(({ part }) => {
            const system = getPart(part.systemId);
            return (
              <div
                key={part.id}
                role="option"
                aria-selected={selectedId === part.id}
                className={`result${selectedId === part.id ? ' selected' : ''}`}
                onClick={() => select(part.id, { focus: true })}
              >
                <div className="result-name">
                  {part.name}
                  <VerificationBadge value={part.verification} compact />
                </div>
                <div className="result-meta">
                  {system && system.id !== part.id ? system.name : 'System'}
                  {part.oem?.ficheName ? ` · ${part.oem.ficheName}` : ''}
                  {part.oem?.partNumber ? ` · ${part.oem.partNumber}` : ''}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="tree" role="tree">
          <TreeRow id={PARTS.rootId} depth={0} />
          {getChildren(PARTS.rootId).length === 0 && <div className="empty">No data loaded.</div>}
        </div>
      )}
      <div className="tree-legend">
        <span><span className="dot ok" /> OEM verified</span>
        <span><span className="dot xref" /> Cross-ref.</span>
        <span><span className="dot unv" /> Unverified</span>
      </div>
    </div>
  );
}
