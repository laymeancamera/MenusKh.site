import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Auto-redirect HTTP to HTTPS for secure custom domains to prevent POST-to-GET redirect issues on login
if (
  typeof window !== 'undefined' &&
  window.location.protocol === 'http:' &&
  !window.location.hostname.includes('localhost') &&
  !window.location.hostname.includes('127.0.0.1') &&
  !window.location.hostname.startsWith('192.168.') &&
  !window.location.hostname.startsWith('10.')
) {
  window.location.replace(`https://${window.location.hostname}${window.location.pathname}${window.location.search}${window.location.hash}`);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
