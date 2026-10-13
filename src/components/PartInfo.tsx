import { Fragment } from 'react';
import { EDUCATION } from '../data/education';
import { NOT_THE_TARGET, PARTS, activeVariant, getChildren, getLineage, getPart, nearestGeometricAncestor } from '../data/motorcycle';
import { VARIANTS } from '../data/variants';
import { OEM_CATALOG_ENTRY_POINTS, SE_CATALOG_ENTRY_POINTS, SOURCES, getSource } from '../data/sources';
import { useViewer } from '../state/store';
import type { MotorcyclePart, SourceAccess } from '../types/motorcycle';
import { GeometryBadge, VerificationBadge } from './Badges';

const notVerified = (model: string) => `Not yet verified for 2026 ${model}.`;

const ACCESS_NOTE: Record<SourceAccess, string> = {
  direct: 'read directly',
  'search-index': 'read via search index (site blocked direct access)',
  'metadata-only': 'catalog metadata only',
  'user-supplied': 'diagram screenshot supplied by the user',
  'not-accessed': 'not accessed',
};

function SourceLink({ id }: { id?: string }) {
  const src = getSource(id);
  if (!src) return <span className="muted">{notVerified(activeVariant().model)}</span>;
  return (
    <span className="source">
      <a href={src.url} target="_blank" rel="noreferrer">
        {src.name}
      </a>
      <span className="muted"> — {src.publisher}; {ACCESS_NOTE[src.access]}; accessed {src.accessed}</span>
    </span>
  );
}

function Actions({ part }: { part: MotorcyclePart }) {
  const hasGeo = (PARTS.subtreeGeometry.get(part.id)?.length ?? 0) > 0;
  const geoCount = PARTS.subtreeGeometry.get(part.id)?.length ?? 0;
  const hidden = useViewer((s) => s.hiddenNodes.includes(part.id));
  const isolation = useViewer((s) => s.isolation);
  const local = useViewer((s) => s.local);
  const a = useViewer.getState();
  const isolated = isolation?.nodeId === part.id;
  const system = getPart(part.systemId);
  return (
    <div className="actions">
      <button onClick={() => a.requestFocus(part.id)} disabled={!nearestGeometricAncestor(part.id)} title="Frame this in the 3D view (or double-click it)">
        Focus
      </button>
      <button className={isolated && isolation?.style === 'ghost' ? 'active' : ''} onClick={() => (isolated ? a.clearIsolation() : a.isolate(part.id, 'ghost'))}>
        {isolated && isolation?.style === 'ghost' ? 'Un-isolate' : 'Isolate'}
      </button>
      <button disabled={!hasGeo || part.kind === 'root'} onClick={() => (hidden ? a.unhide(part.id) : a.hide(part.id))}>
        {hidden ? 'Show' : 'Hide'}
      </button>
      {system && part.kind !== 'root' && (
        <button onClick={() => a.isolate(system.id, 'hide')} title={`Hide everything except ${system.name}`}>
          Show only {system.name}
        </button>
      )}
      {geoCount >= 2 && (
        <button
          className={local?.scopeId === part.id ? 'active' : ''}
          onClick={() => {
            if (local?.scopeId === part.id) return a.setLocalExplode(null);
            a.setLocalExplode(part.id, 0.7);
            // re-frame once the parts have moved apart
            window.setTimeout(() => useViewer.getState().requestFocus(part.id), 800);
          }}
          title="Explode only this assembly (adjust in the bottom bar)"
        >
          {local?.scopeId === part.id ? 'Collapse' : `Explode ${part.kind === 'system' ? 'system' : 'assembly'}`}
        </button>
      )}
      <button onClick={a.resetVisibility}>Reset visibility</button>
    </div>
  );
}

function Learn({ topicId }: { topicId: string }) {
  const topic = EDUCATION[topicId];
  const flow = useViewer((s) => s.flow);
  const a = useViewer.getState();
  if (!topic) return null;
  const running = flow?.topicId === topic.id;
  return (
    <section className="info-section learn">
      <h3>Learn: {topic.title}</h3>
      <p>{topic.summary}</p>
      {topic.sequences?.map((seq) => (
        <div className="sequence" key={seq.title}>
          <div className="sequence-title">{seq.title}</div>
          <ol className="flow">
            {seq.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
      ))}
      {topic.flowPath && (
        <div className="flow-controls">
          <button className={running ? 'active' : ''} onClick={() => (running ? a.stopFlow() : a.startFlow(topic.id, topic.flowPath!))}>
            {running ? 'Stop highlight' : topic.flowLabel ?? 'Show path'}
          </button>
          {running && (
            <ol className="flow-steps">
              {topic.flowPath.map((id, i) => {
                const p = getPart(id);
                const hasGeo = (PARTS.subtreeGeometry.get(id)?.length ?? 0) > 0;
                return (
                  <li key={id} className={i === flow!.step ? 'current' : ''}>
                    <button className="link" onClick={() => a.select(id)}>
                      {p?.name ?? id}
                    </button>
                    {!hasGeo && <span className="muted"> (no 3D geometry)</span>}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}
      <p className="attribution">{topic.attribution}</p>
    </section>
  );
}

function Overview() {
  const root = getPart(PARTS.rootId)!;
  const select = useViewer((s) => s.select);
  const v = activeVariant();
  const others = Object.values(VARIANTS).filter((x) => x.id !== v.id).map((x) => `${x.label} (${x.model}) — use the selector at the top`);
  return (
    <div className="info-body">
      <div className="info-kicker">Target motorcycle</div>
      <h2>{v.displayName}</h2>
      <div className="muted">
        {v.trim} · {v.model} · {v.market} market
      </div>
      <p className="hint">Click a part in the 3D view or the assembly tree. Click again to step up to its parent assembly. Double-click to focus.</p>
      <section className="info-section">
        <h3>Key specifications</h3>
        <Facts part={root} />
      </section>
      <section className="info-section">
        <h3>Systems</h3>
        <ul className="link-list">
          {getChildren(PARTS.rootId).map((s) => (
            <li key={s.id}>
              <button className="link" onClick={() => select(s.id)}>
                {s.name}
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className="info-section">
        <h3>Scope notes</h3>
        <ul className="notes">
          {v.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
          <li>Not modelled: {NOT_THE_TARGET.join(', ')}.</li>
          {others.map((o) => (
            <li key={o}>Also available: {o}.</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Facts({ part }: { part: MotorcyclePart }) {
  if (!part.facts?.length) return null;
  return (
    <dl className="facts">
      {part.facts.map((f) => (
        <Fragment key={f.label}>
          <dt>{f.label}</dt>
          <dd>
            {f.value}{' '}
            <a className="fact-src" href={SOURCES[f.sourceId]?.url} target="_blank" rel="noreferrer" title={SOURCES[f.sourceId]?.name}>
              <VerificationBadge value={f.verification} compact />
            </a>
          </dd>
        </Fragment>
      ))}
    </dl>
  );
}

export function PartInfo() {
  const selectedId = useViewer((s) => s.selectedId);
  const select = useViewer((s) => s.select);
  const part = getPart(selectedId);
  if (!part || part.kind === 'root') return <Overview />;
  const v = activeVariant();
  // On the SE, shared components carry data researched for the standard CMX500A.
  const sharedOnSE = v.model === 'CMX500A2' && !part.variants && part.kind !== 'system';

  const lineage = getLineage(part.id);
  const system = getPart(part.systemId);
  const children = getChildren(part.id);
  const hasGeo = (PARTS.subtreeGeometry.get(part.id)?.length ?? 0) > 0;
  const ctx = !hasGeo ? getPart(nearestGeometricAncestor(part.id)) : undefined;
  const oem = part.oem;
  const entryPoints = part.model === 'CMX500A2' ? SE_CATALOG_ENTRY_POINTS : OEM_CATALOG_ENTRY_POINTS;
  const ficheLinks = oem?.ficheUrl ? [{ label: `2026 Rebel 500 ABS — ${oem.ficheName ?? 'diagram'}`, url: oem.ficheUrl }] : entryPoints;

  return (
    <div className="info-body">
      <nav className="crumbs" aria-label="Breadcrumb">
        {lineage.slice(0, -1).map((n) => (
          <Fragment key={n.id}>
            <button className="link" onClick={() => select(n.id)}>
              {n.kind === 'root' ? 'Rebel 500' : n.name}
            </button>
            <span className="sep">/</span>
          </Fragment>
        ))}
      </nav>
      <h2>{part.name}</h2>
      <div className="badges">
        <VerificationBadge value={part.verification} />
        <GeometryBadge value={part.geometryAccuracy} />
      </div>

      <Actions part={part} />

      <dl className="kv">
        <dt>System</dt>
        <dd>{system?.name ?? '—'}</dd>
        <dt>OEM assembly (fiche)</dt>
        <dd>{oem?.ficheName ?? <span className="muted">{notVerified(part.model)}</span>}</dd>
        <dt>Model</dt>
        <dd>
          {v.displayName} {v.model}
        </dd>
      </dl>

      <section className="info-section">
        <h3>What it does</h3>
        <p>{part.function}</p>
        <p className="muted-strong">{part.description}</p>
        {!hasGeo && (
          <p className="note">
            No 3D geometry is drawn for this entry: its exact shape and placement are not modelled, and nothing is invented.
            {ctx && ctx.kind !== 'root' && (
              <>
                {' '}
                It belongs to{' '}
                <button className="link" onClick={() => select(ctx.id)}>
                  {ctx.name}
                </button>
                , which is highlighted for context.
              </>
            )}
          </p>
        )}
      </section>

      {part.facts?.length ? (
        <section className="info-section">
          <h3>Specifications</h3>
          <Facts part={part} />
        </section>
      ) : null}

      <section className="info-section verify">
        <h3>OEM reference</h3>
        <dl className="kv">
          <dt>Honda part number</dt>
          <dd>
            {oem?.partNumber ? (
              <>
                <code>{oem.partNumber}</code> <VerificationBadge value={oem.verification} />
                {sharedOnSE && <div className="muted">CMX500A part number — not yet verified for the SE (CMX500A2).</div>}
              </>
            ) : (
              <span className="muted">{notVerified(part.model)}</span>
            )}
          </dd>
          {oem?.oemName && (
            <>
              <dt>OEM description</dt>
              <dd>{oem.oemName}</dd>
            </>
          )}
          <dt>Fiche status</dt>
          <dd>{oem ? <VerificationBadge value={oem.verification} /> : <span className="muted">{notVerified(part.model)}</span>}</dd>
        </dl>
        {oem?.note && <p className="note">{oem.note}</p>}
        <div className="fiche-links">
          <span className="muted">View OEM exploded diagram:</span>
          {ficheLinks.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noreferrer">
              {l.label} ↗
            </a>
          ))}
          {!oem?.ficheUrl && oem?.ficheName && <span className="muted">then choose “{oem.ficheName}”.</span>}
        </div>
      </section>

      <section className="info-section">
        <h3>Service data</h3>
        <dl className="kv">
          <dt>Torque specification</dt>
          <dd>
            {part.service?.verified && part.service.torqueNm !== undefined ? (
              <>
                {part.service.torqueNm} N·m{part.service.torqueFtLb !== undefined ? ` / ${part.service.torqueFtLb} lbf·ft` : ''} <SourceLink id={part.service.sourceId} />
              </>
            ) : (
              <span className="muted">
                Not yet verified. Consult the Honda service manual (
                <a href={SOURCES['helm-61mlh00'].url} target="_blank" rel="noreferrer">
                  61MLH00
                </a>
                ).
              </span>
            )}
          </dd>
        </dl>
        {part.service?.notes && !part.service.verified && <p className="note">{part.service.notes}</p>}
      </section>

      <section className="info-section verify">
        <h3>Verification</h3>
        <dl className="kv">
          <dt>Verified for</dt>
          <dd>
            {part.verification === 'unverified' ? (
              <span className="muted">{notVerified(part.model)}</span>
            ) : (
              `2026 Honda ${part.model} Rebel 500${part.model === 'CMX500A2' ? ' SE' : ''}`
            )}
          </dd>
          <dt>Data status</dt>
          <dd>
            <VerificationBadge value={part.verification} />
          </dd>
          <dt>3D geometry</dt>
          <dd>
            <GeometryBadge value={part.geometryAccuracy} />
          </dd>
          <dt>Source</dt>
          <dd>
            <SourceLink id={part.sourceId} />
          </dd>
        </dl>
        {part.verificationNote && <p className="note">{part.verificationNote}</p>}
        {sharedOnSE && (
          <p className="note">
            Shared component. Its data was researched for the standard CMX500A. Honda's 2026 spec and features releases cover both versions, but catalog
            part data (fiche links, part numbers) has not been checked against the SE (CMX500A2) catalog.
          </p>
        )}
        <p className="fine">Part identity can be OEM-verified even when the 3D mesh is only representative. These are tracked separately.</p>
      </section>

      {part.educationId && <Learn topicId={part.educationId} />}

      {children.length > 0 && (
        <section className="info-section">
          <h3>Contains</h3>
          <ul className="link-list">
            {children.map((c) => (
              <li key={c.id}>
                <button className="link" onClick={() => select(c.id)}>
                  {c.name}
                </button>{' '}
                <VerificationBadge value={c.verification} compact />
              </li>
            ))}
          </ul>
        </section>
      )}

      {part.relatedParts?.length ? (
        <section className="info-section">
          <h3>Related</h3>
          <ul className="link-list inline">
            {part.relatedParts.map((r) => (
              <li key={r}>
                <button className="link" onClick={() => select(r)}>
                  {getPart(r)?.name ?? r}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
