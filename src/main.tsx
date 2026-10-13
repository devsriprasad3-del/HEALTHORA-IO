import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initApiFallback } from './lib/apiFallback.ts';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';

// Initialize client-side API fallback for static hosting / offline resiliency
try {
  initApiFallback();
} catch (err) {
  console.warn("Notice: Local API fallback initializer:", err);
}

function mount() {
  const container = document.getElementById('root');
  if (!container) {
    console.error('Fatal: #root element not found in DOM.');
    return;
  }

  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (renderError) {
    console.error('Fatal mount error:', renderError);
    container.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #F5F7FB; font-family: system-ui, sans-serif; padding: 24px;">
        <div style="background: white; border-radius: 20px; padding: 32px; max-width: 480px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); text-align: center;">
          <h2 style="color: #101C31; margin-bottom: 8px; font-size: 20px;">Healthora Copilot</h2>
          <p style="color: #64748B; font-size: 13px; margin-bottom: 20px;">The workspace is refreshing its data connections.</p>
          <button onclick="window.location.reload()" style="background: #16B8A6; color: #101C31; font-weight: bold; border: none; padding: 10px 24px; border-radius: 12px; cursor: pointer; font-size: 13px;">Reload Application</button>
        </div>
      </div>
    `;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}


