/**
 * Browser entry point. Vite loads this module from the `<script type="module">`
 * tag in `index.html`, and it does exactly three things: pull in the global
 * stylesheet so Tailwind's layers and the hand-written keyframes are part of the
 * bundle, find the `#root` container, and mount `App` with React 18's
 * `createRoot` inside `StrictMode`.
 *
 * The container lookup throws instead of using a non-null assertion. A missing
 * `#root` means `index.html` and this file have drifted apart, and a named error
 * says that outright rather than surfacing later as a null-property crash inside
 * React.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import './index.css';

const container = document.getElementById('root');

if (container === null) {
  throw new Error('Root container #root was not found in the document.');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
