/**
 * uiModule.js
 * Handles all UI rendering, DOM manipulation, and component creation.
 * Responsible for emergency cards, steps rendering, and general page utilities.
 */

import { getAllCategories } from './emergencyLoader.js';

/**
 * Renders emergency category cards into the given container.
 * @param {HTMLElement} container - The grid container element
 * @param {Function} onCardClick - Callback when a card is clicked (receives category id)
 */
export function renderCategoryCards(container, onCardClick) {
  if (!container) return;

  const categories = getAllCategories();

  container.innerHTML = categories.map(({ id, title, icon, color, severity }) => `
    <button
      class="emergency-card group"
      data-id="${id}"
      aria-label="Open first aid for ${title}"
      onclick="window.navigateToEmergency('${id}')"
    >
      <div class="emergency-card-inner bg-gradient-to-br ${color}">
        <div class="emergency-card-icon">${icon}</div>
        <h3 class="emergency-card-title">${title}</h3>
        <span class="severity-badge severity-${severity.toLowerCase()}">${severity}</span>
        <div class="card-arrow">→</div>
      </div>
    </button>
  `).join('');

  // Also attach event listeners programmatically
  container.querySelectorAll('.emergency-card').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      if (onCardClick) onCardClick(id);
    });
  });
}

/**
 * Renders full emergency instructions into the page.
 * @param {HTMLElement} container - The main content container
 * @param {object} data - The emergency JSON data object
 */
export function renderEmergencyDetail(container, data) {
  if (!container || !data) return;

  const stepsHtml = data.steps.map((step, i) => `
    <div class="step-item" style="animation-delay: ${i * 0.08}s">
      <div class="step-number">${i + 1}</div>
      <p class="step-text">${step}</p>
    </div>
  `).join('');

  const listItems = (items) =>
    items.map((item) => `<li class="checklist-item"><span class="check-icon">✓</span><span>${item}</span></li>`).join('');

  const doNotItems = (items) =>
    items.map((item) => `<li class="checklist-item danger"><span class="check-icon">✗</span><span>${item}</span></li>`).join('');

  const ambulanceItems = (items) =>
    items.map((item) => `<li class="checklist-item amber"><span class="check-icon">⚠</span><span>${item}</span></li>`).join('');

  container.innerHTML = `
    <div class="detail-header">
      <div class="detail-icon-wrap">
        <span class="detail-icon">${data.icon || '🏥'}</span>
      </div>
      <div class="detail-heading-group">
        <h1 class="detail-title">${data.title}</h1>
        <span class="severity-badge severity-${data.severity?.toLowerCase() || 'high'} badge-lg">${data.severity || 'High'} Priority</span>
      </div>
    </div>

    <p class="detail-summary">${data.summary}</p>

    <!-- Voice + SOS Row -->
    <div class="action-bar">
      <button id="read-btn" class="action-btn voice-btn" aria-label="Read instructions aloud">
        <span>🔊</span> Read Instructions
      </button>
      <button id="sos-action-btn" class="action-btn sos-mini-btn" aria-label="Call emergency services">
        <span>🆘</span> Call Emergency
      </button>
    </div>

    <!-- Steps -->
    <section class="detail-section">
      <h2 class="section-title"><span class="section-icon">📋</span> Step-by-Step Instructions</h2>
      <div class="steps-list">
        ${stepsHtml}
      </div>
    </section>

    <!-- What To Do / What Not To Do (side by side on desktop) -->
    <div class="dos-donts-grid">
      <section class="detail-section dos-section">
        <h2 class="section-title green"><span class="section-icon">✅</span> What To Do</h2>
        <ul class="checklist">
          ${listItems(data.what_to_do)}
        </ul>
      </section>
      <section class="detail-section donts-section">
        <h2 class="section-title red"><span class="section-icon">❌</span> What NOT To Do</h2>
        <ul class="checklist">
          ${doNotItems(data.what_not_to_do)}
        </ul>
      </section>
    </div>

    <!-- When to Call Ambulance -->
    <section class="detail-section amber-section">
      <h2 class="section-title amber"><span class="section-icon">🚑</span> When to Call an Ambulance</h2>
      <ul class="checklist">
        ${ambulanceItems(data.when_to_call_ambulance)}
      </ul>
    </section>

    <!-- Disclaimer -->
    <div class="detail-disclaimer">
      <p>⚠️ <strong>Disclaimer:</strong> This guidance is for educational purposes. Always contact professional emergency services immediately in a life-threatening situation.</p>
    </div>
  `;
}

/**
 * Shows a skeleton loading state while data is being fetched.
 * @param {HTMLElement} container
 */
export function showLoadingState(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="loading-skeleton">
      <div class="skeleton-header"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-text short"></div>
      <div class="skeleton-steps">
        ${[1,2,3,4].map(() => '<div class="skeleton-step"></div>').join('')}
      </div>
    </div>
  `;
}

/**
 * Shows an error message in the container.
 * @param {HTMLElement} container
 * @param {string} message
 */
export function showErrorState(container, message = 'Failed to load emergency data.') {
  if (!container) return;
  container.innerHTML = `
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <h2>Something went wrong</h2>
      <p>${message}</p>
      <button onclick="history.back()" class="back-btn">← Go Back</button>
    </div>
  `;
}

/**
 * Shows or hides the app's global offline banner.
 * @param {boolean} isOffline
 */
export function toggleOfflineBanner(isOffline) {
  let banner = document.getElementById('offline-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'offline-banner';
    banner.className = 'offline-banner';
    banner.textContent = '📴 You are offline — showing cached data';
    document.body.prepend(banner);
  }
  banner.classList.toggle('visible', isOffline);
}

/**
 * Animates elements as they scroll into view using Intersection Observer.
 */
export function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-animate]');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  elements.forEach((el) => observer.observe(el));
}
