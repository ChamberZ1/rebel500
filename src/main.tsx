import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { validateParts } from './data/motorcycle';
import './styles/app.css';

if (import.meta.env.DEV) {
  const issues = validateParts();
  if (issues.length) console.warn('[Rebel 500 Explorer] data validation issues:', issues);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
