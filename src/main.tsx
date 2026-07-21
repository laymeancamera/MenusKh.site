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
  !window.location.hostname.includes('.run.app') &&
  !window.location.hostname.startsWith('192.168.') &&
  !window.location.hostname.startsWith('10.')
) {
  window.location.replace(`https://${window.location.hostname}${window.location.pathname}${window.location.search}${window.location.hash}`);
}

// Global helper to recursively rewrite relative image/video upload URLs to absolute backend URLs
function rewriteUploadsUrls(obj: any, baseUrl: string): any {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    if (obj.startsWith('/uploads/')) {
      return baseUrl + obj;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => rewriteUploadsUrls(item, baseUrl));
  }
  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = rewriteUploadsUrls(obj[key], baseUrl);
      }
    }
    return newObj;
  }
  return obj;
}

// Global API routing & asset rewriting interceptor for custom domains
if (typeof window !== 'undefined') {
  const hostname = window.location.hostname;
  const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.startsWith('192.168.') || hostname.startsWith('10.');
  const isRunApp = hostname.includes('.run.app') || hostname.includes('.ai.studio');
  const BACKEND_URL = 'https://ais-pre-xenbx54ugsv2vxyynsua5k-878099235235.asia-east1.run.app';

  if (!isLocal && !isRunApp) {
    // Intercept fetch
    const originalFetch = window.fetch;
    window.fetch = async function (input, init) {
      let finalInput = input;
      if (typeof input === 'string' && input.startsWith('/api/')) {
        finalInput = BACKEND_URL + input;
      }

      const response = await originalFetch(finalInput, init);

      // Wrap response.json() to automatically rewrite relative /uploads/ URLs to point to BACKEND_URL
      const originalJson = response.json;
      response.json = async function () {
        const data = await originalJson.call(this);
        return rewriteUploadsUrls(data, BACKEND_URL);
      };

      return response;
    };

    // Intercept EventSource for Server-Sent Events (SSE)
    const originalEventSource = window.EventSource;
    window.EventSource = function (url, eventSourceInitDict) {
      let finalUrl = url;
      if (typeof url === 'string' && url.startsWith('/api/')) {
        finalUrl = BACKEND_URL + url;
      }
      return new originalEventSource(finalUrl, eventSourceInitDict);
    } as any;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
