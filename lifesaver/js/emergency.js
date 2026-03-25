/**
 * emergency.js
 * Page-specific entry point for emergency.html.
 * Loads emergency data and renders it using uiModule,
 * then wires up the voice and SOS features.
 */

import { loadEmergencyData } from '../modules/emergencyLoader.js';
import { renderEmergencyDetail, showLoadingState, showErrorState } from '../modules/uiModule.js';
import { readEmergencyInstructions } from '../modules/voiceModule.js';
import { initSOS } from '../modules/sosModule.js';
import { getEmergencyIdFromURL, navigateHome } from './router.js';
import { toggleOfflineBanner } from '../modules/uiModule.js';

// ── PWA: Register Service Worker ─────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./pwa/service-worker.js', { scope: './' })
      .catch(console.error);
  });
}

// ── Offline detection ─────────────────────────────────────────────────────────
function setupOffline() {
  const update = () => toggleOfflineBanner(!navigator.onLine);
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function initEmergencyPage() {
  setupOffline();

  const container = document.getElementById('emergency-detail-container');
  const emergencyId = getEmergencyIdFromURL();

  if (!emergencyId) {
    showErrorState(container, 'No emergency type specified. Please go back and select a category.');
    return;
  }

  // Show skeleton loading state first
  showLoadingState(container);

  try {
    const data = await loadEmergencyData(emergencyId);

    // Update document title and nav title
    document.title = `${data.title} First Aid – LifeSaver`;
    const navTitle = document.getElementById('detail-page-title');
    if (navTitle) navTitle.textContent = data.title;

    // Render the full emergency detail view
    renderEmergencyDetail(container, data);

    // Wire up the voice read button (injected by uiModule)
    const readBtn = document.getElementById('read-btn');
    if (readBtn) {
      readBtn.addEventListener('click', () => {
        readEmergencyInstructions(data, readBtn);
      });
    }

    // Wire up the in-content SOS button
    const sosActionBtn = document.getElementById('sos-action-btn');

    // Wire up the FAB SOS button
    const sosFab = document.getElementById('sos-fab');
    initSOS(sosFab);
    if (sosActionBtn) initSOS(sosActionBtn);

  } catch (err) {
    console.error('[EmergencyPage] Failed to load data:', err);
    showErrorState(
      container,
      `Could not load first aid instructions for "${emergencyId}". ` +
      (navigator.onLine
        ? 'Please try again.'
        : 'You appear to be offline and this content may not be cached yet.')
    );
  }
}

document.addEventListener('DOMContentLoaded', initEmergencyPage);
