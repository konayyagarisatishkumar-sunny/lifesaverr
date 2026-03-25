/**
 * main.js
 * Entry point for the LifeSaver index page.
 * Initializes all modules and sets up the landing page.
 */

import { renderCategoryCards, initScrollAnimations, toggleOfflineBanner } from '../modules/uiModule.js';
import { navigateToEmergency, initNavigation, scrollToSection } from './router.js';
import { initSOS } from '../modules/sosModule.js';
import { getLocation, copyCoordinates } from '../modules/locationModule.js';
import { preloadAllData } from '../modules/emergencyLoader.js';

// ── PWA: Register Service Worker ─────────────────────────────────────────────
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const reg = await navigator.serviceWorker.register('./pwa/service-worker.js', {
          scope: './',
        });
        console.log('[App] Service Worker registered:', reg.scope);
      } catch (err) {
        console.error('[App] Service Worker registration failed:', err);
      }
    });
  }
}

// ── Offline status monitoring ─────────────────────────────────────────────────
function setupOfflineDetection() {
  const update = () => toggleOfflineBanner(!navigator.onLine);
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update(); // Initial check
}

// PWA install prompt is intentionally suppressed — offline caching works silently.

// ── Location feature ──────────────────────────────────────────────────────────
function setupLocationFeature() {
  const locationBtn = document.getElementById('get-location-btn');
  const locationContainer = document.getElementById('location-container');

  // Expose globally for inline handlers
  window.requestLocation = () => getLocation(locationContainer);
  window.copyLocation = (coords) => copyCoordinates(coords);

  if (locationBtn) {
    locationBtn.addEventListener('click', () => {
      window.requestLocation();
    });
  }
}

// ── Global navigation helpers (used by inline onclick) ───────────────────────
function setupGlobalHelpers() {
  window.navigateToEmergency = navigateToEmergency;
  window.scrollTo = scrollToSection;
}

// ── Counter animation for stats ───────────────────────────────────────────────
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const timer = setInterval(() => {
              current += step;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              el.textContent = Math.floor(current).toLocaleString() + (el.getAttribute('data-suffix') || '');
            }, 16);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
  });
}

// ── Main App Initialization ───────────────────────────────────────────────────
async function initApp() {
  console.log('[App] Initializing LifeSaver...');

  // Setup helpers and detection first
  setupGlobalHelpers();
  setupOfflineDetection();
  registerServiceWorker();
  // (install prompt suppressed)

  // Initialize navigation
  initNavigation();

  // Initialize SOS button
  const sosBtn = document.getElementById('sos-fab');
  initSOS(sosBtn);

  // Render emergency category cards
  const grid = document.getElementById('emergency-grid');
  if (grid) {
    renderCategoryCards(grid, navigateToEmergency);
  }

  // Setup location feature
  setupLocationFeature();

  // Animate counters
  animateCounters();

  // Scroll animations for sections
  initScrollAnimations();

  // Preload all emergency data in the background for offline use
  preloadAllData().catch(console.warn);

  console.log('[App] LifeSaver initialized successfully.');
}

// Start the app
document.addEventListener('DOMContentLoaded', initApp);
