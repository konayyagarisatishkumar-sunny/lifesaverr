/**
 * router.js
 * Handles navigation between pages and sections within the LifeSaver app.
 * Manages URL-based routing for emergency detail pages.
 */

/**
 * Navigates to the emergency detail page for the given emergency ID.
 * @param {string} emergencyId - The ID of the emergency (e.g. 'burns', 'cpr')
 */
export function navigateToEmergency(emergencyId) {
  if (!emergencyId) return;
  window.location.href = `./emergency.html?id=${emergencyId}`;
}

/**
 * Gets the current emergency ID from the URL query params.
 * Used by emergency.html to know which data to load.
 * @returns {string|null} The emergency ID or null
 */
export function getEmergencyIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

/**
 * Navigates back to the main index page.
 */
export function navigateHome() {
  window.location.href = './index.html';
}

/**
 * Smooth-scrolls to a section by its ID.
 * @param {string} sectionId - The DOM element ID to scroll to
 */
export function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Sets up navigation link handlers in the navbar.
 */
export function initNavigation() {
  // Smooth scroll for all links with data-section attribute
  document.querySelectorAll('[data-section]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.getAttribute('data-section');
      scrollToSection(section);
    });
  });

  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile menu when a link is clicked
    mobileMenu.querySelectorAll('a, button').forEach((item) => {
      item.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', false);
      });
    });
  }
}
