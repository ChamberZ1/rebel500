import { Suspense, lazy, useMemo } from 'react';
import { AssemblyTree } from './components/AssemblyTree';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ExplodeBar } from './components/ExplodeBar';
import { Header } from './components/Header';
import { PartInfo } from './components/PartInfo';
import { SourcesDialog } from './components/SourcesDialog';
import { ViewerOverlay } from './components/ViewerOverlay';
import { useViewer } from './state/store';
import { hasWebGL } from './utils/webgl';

// three.js + R3F are code-split so the UI shell renders immediately.
const Viewer = lazy(() => import('./viewer/Viewer'));

function ViewerFallback({ message }: { message: string }) {
  return (
    <div className="viewer-message">
      <p>{message}</p>
      <p className="muted">The assembly tree, search and part information still work.</p>
    </div>
  );
}

export default function App() {
  const webgl = useMemo(hasWebGL, []);
  const panels = useViewer((s) => s.panels);
  // Remount data-driven panels when the selected bike changes.
  const variant = useViewer((s) => s.variant);
  const setPanel = useViewer((s) => s.setPanel);
  return (
    <div className={`app${panels.left ? ' left-open' : ''}${panels.right ? ' right-open' : ''}`}>
      <Header />
      <aside className="panel left" aria-label="Assembly tree">
        <AssemblyTree key={variant} />
      </aside>
      <main className="viewer">
        {webgl ? (
          <ErrorBoundary fallback={(e) => <ViewerFallback message={`The 3D viewer failed to start: ${e.message}`} />}>
            <Suspense fallback={<div className="viewer-message">Loading 3D viewer…</div>}>
              <Viewer />
            </Suspense>
          </ErrorBoundary>
        ) : (
          <ViewerFallback message="WebGL is not available in this browser, so the 3D view is disabled." />
        )}
        <ViewerOverlay />
      </main>
      <aside className="panel right" aria-label="Part information">
        <PartInfo key={variant} />
      </aside>
      <ExplodeBar />
      {(panels.left || panels.right) && (
        <div
          className="drawer-scrim"
          onClick={() => {
            setPanel('left', false);
            setPanel('right', false);
          }}
        />
      )}
      <SourcesDialog />
    </div>
  );
}
