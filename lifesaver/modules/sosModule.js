/**
 * sosModule.js
 * Handles the emergency SOS button behavior.
 * Provides quick-dial links for emergency services (108, 112).
 */

const SOS_NUMBERS = [
  { label: 'Ambulance / Medical', number: '108', icon: '🚑' },
  { label: 'Universal Emergency', number: '112', icon: '🆘' },
  { label: 'Police', number: '100', icon: '🚔' },
  { label: 'Fire Brigade', number: '101', icon: '🚒' },
];

/**
 * Initializes the SOS button with click behavior.
 * Shows a modal with emergency numbers to dial.
 * @param {HTMLElement} btn - The SOS trigger button
 */
export function initSOS(btn) {
  if (!btn) return;

  btn.addEventListener('click', () => {
    showSOSModal();
  });
}

/**
 * Creates and shows the SOS emergency number modal.
 */
function showSOSModal() {
  // Remove any existing modal
  const existing = document.getElementById('sos-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'sos-modal';
  modal.className = 'sos-modal-overlay';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Emergency Contacts');

  const numberButtons = SOS_NUMBERS.map(
    ({ label, number, icon }) => `
    <a href="tel:${number}" class="sos-number-btn" aria-label="Call ${label} at ${number}">
      <span class="sos-icon">${icon}</span>
      <div class="sos-info">
        <span class="sos-label">${label}</span>
        <span class="sos-number">${number}</span>
      </div>
      <span class="sos-call-icon">📞</span>
    </a>
  `
  ).join('');

  modal.innerHTML = `
    <div class="sos-modal-content">
      <div class="sos-modal-header">
        <div class="sos-pulse-ring"></div>
        <h2 class="sos-modal-title">🆘 Emergency Help</h2>
        <p class="sos-modal-subtitle">Tap a number to call immediately</p>
      </div>
      <div class="sos-numbers-grid">
        ${numberButtons}
      </div>
      <button class="sos-close-btn" id="sos-close" aria-label="Close emergency dialog">
        ✕ Close
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeSOSModal();
  });

  // Close button
  document.getElementById('sos-close')?.addEventListener('click', closeSOSModal);

  // Animate in
  requestAnimationFrame(() => {
    modal.classList.add('sos-modal-visible');
  });

  // Keyboard escape to close
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeSOSModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

/**
 * Closes the SOS modal with animation.
 */
function closeSOSModal() {
  const modal = document.getElementById('sos-modal');
  if (modal) {
    modal.classList.remove('sos-modal-visible');
    setTimeout(() => modal.remove(), 300);
  }
}
