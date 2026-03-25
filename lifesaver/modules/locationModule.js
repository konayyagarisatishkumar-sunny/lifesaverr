/**
 * locationModule.js
 * Handles geolocation using the browser Geolocation API.
 * Displays latitude and longitude and provides a copy-to-clipboard feature.
 */

/**
 * Requests the user's current location and renders it into the container.
 * @param {HTMLElement} container - The DOM element to render location info into
 */
export function getLocation(container) {
  if (!container) return;

  if (!navigator.geolocation) {
    container.innerHTML = `
      <div class="location-error">
        <span class="text-2xl">📵</span>
        <p>Geolocation is not supported by your browser.</p>
      </div>
    `;
    return;
  }

  // Show loading state
  container.innerHTML = `
    <div class="location-loading">
      <div class="loader-pulse"></div>
      <p>Fetching your location...</p>
    </div>
  `;

  const successCallback = (position) => {
    const { latitude, longitude, accuracy } = position.coords;
    const lat = latitude.toFixed(6);
    const lon = longitude.toFixed(6);
    const coordString = `${lat}, ${lon}`;

    container.innerHTML = `
      <div class="location-result" id="location-result-box">
        <div class="location-icon">📍</div>
        <div class="location-coords">
          <div class="coord-row">
            <span class="coord-label">Latitude:</span>
            <span class="coord-value" id="lat-val">${lat}</span>
          </div>
          <div class="coord-row">
            <span class="coord-label">Longitude:</span>
            <span class="coord-value" id="lon-val">${lon}</span>
          </div>
          <div class="coord-row accuracy-row">
            <span class="coord-label">Accuracy:</span>
            <span class="coord-value">~${Math.round(accuracy)} meters</span>
          </div>
        </div>
        <div class="location-actions">
          <button id="copy-location-btn" class="copy-btn" onclick="window.copyLocation('${coordString}')">
            📋 Copy Coordinates
          </button>
          <a href="https://maps.google.com/?q=${lat},${lon}" target="_blank" rel="noopener" class="maps-btn">
            🗺️ Open in Maps
          </a>
        </div>
      </div>
    `;
  };

  const errorCallback = (err) => {
    let message = 'Unable to fetch location.';
    switch (err.code) {
      case err.PERMISSION_DENIED:
        message = 'Location permission denied. Please enable it in your browser settings.';
        break;
      case err.POSITION_UNAVAILABLE:
        message = 'Location information is unavailable.';
        break;
      case err.TIMEOUT:
        message = 'Location request timed out. Please try again.';
        break;
    }
    container.innerHTML = `
      <div class="location-error">
        <span class="text-3xl">❌</span>
        <p>${message}</p>
        <button onclick="window.requestLocation()" class="retry-btn">Try Again</button>
      </div>
    `;
  };

  navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  });
}

/**
 * Copies coordinate string to clipboard.
 * Exposed globally for inline onclick handlers.
 * @param {string} coords - The coordinates string to copy
 */
export function copyCoordinates(coords) {
  navigator.clipboard
    .writeText(coords)
    .then(() => {
      const btn = document.getElementById('copy-location-btn');
      if (btn) {
        btn.textContent = '✅ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = '📋 Copy Coordinates';
          btn.classList.remove('copied');
        }, 2000);
      }
    })
    .catch(() => {
      alert(`Your coordinates: ${coords}`);
    });
}
